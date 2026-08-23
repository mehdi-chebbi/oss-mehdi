export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatSource {
  id: string;
  resourceId: string;
  titleFr: string;
  titleEn: string;
  language: "fr" | "en";
  pageStart: number;
  pageEnd: number;
  filePath: string;
}

export async function streamChatMessage(
  messages: ChatMessage[],
  useResources: boolean,
  onDelta: (delta: string) => void,
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, useResources }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `Error ${response.status}`);
  }

  if (!response.body) throw new Error("Streaming is not supported by this browser.");

  let sources: ChatSource[] = [];
  const sourceHeader = response.headers.get("X-OSS-Sources");
  if (sourceHeader) {
    try {
      sources = JSON.parse(decodeURIComponent(sourceHeader)) as ChatSource[];
    } catch {
      sources = [];
    }
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let completeMessage = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const delta = decoder.decode(value, { stream: true });
    if (!delta) continue;
    completeMessage += delta;
    onDelta(delta);
  }

  const finalDelta = decoder.decode();
  if (finalDelta) {
    completeMessage += finalDelta;
    onDelta(finalDelta);
  }

  if (!completeMessage.trim()) throw new Error("The assistant returned an empty response.");
  return { message: completeMessage, sources };
}
