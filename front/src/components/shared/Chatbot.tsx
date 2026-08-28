import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { BookOpen, Bot, Download, ExternalLink, Loader2, MessageCircle, Send, User, X } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamChatMessage, type ChatMessage, type ChatSource } from "@/api/chat";
import { useLocale } from "@/context/locale";

const copy = {
  fr: {
    title: "Assistant OSS",
    welcome: "Bonjour, je suis l’assistant IA de l’OSS. Comment puis-je vous aider aujourd’hui ?",
    placeholder: "Écrivez votre message...",
    send: "Envoyer",
    close: "Fermer",
    open: "Ouvrir l’assistant",
    thinking: "L’assistant réfléchit...",
    powered: "Propulsé par l’IA",
    genericError: "Une erreur est survenue. Veuillez réessayer.",
    resourceMode: "Mode ressources OSS",
    resourceModeHelp: "Répond uniquement à partir des documents publiés par l’OSS",
    sources: "Sources",
  },
  en: {
    title: "OSS Assistant",
    welcome: "Hello, I’m the OSS AI assistant. How can I help you today?",
    placeholder: "Write your message...",
    send: "Send",
    close: "Close",
    open: "Open the assistant",
    thinking: "The assistant is thinking...",
    powered: "Powered by AI",
    genericError: "Something went wrong. Please try again.",
    resourceMode: "OSS resource mode",
    resourceModeHelp: "Answers only from documents published by OSS",
    sources: "Sources",
  },
} as const;

type DisplayMessage = ChatMessage & {
  mode: "general" | "resources";
  sources?: ChatSource[];
  rawContent?: string;
};

function stripKnowledgeMarkers(value: string) {
  return value
    .replace(/\[\s*SOURCE\\?_\d+(?:\s*,[^\]\n]*)?\s*\]/gi, "")
    .replace(/\[\s*SOURCE\\?_\d+[^\]\n]*$/i, "")
    .replace(/\[\s*(?:S(?:O(?:U(?:R(?:C(?:E(?:\\?_(?:\d*)?)?)?)?)?)?)?)?$/i, "")
    .replace(/[ \t]+\n/g, "\n")
    .trimStart();
}

function extractKnowledgeSourceIds(value: string) {
  const ids = new Set<string>();
  const markers = value.match(/\[\s*SOURCE\\?_\d+(?:\s*,[^\]\n]*)?\s*\]/gi) ?? [];

  for (const marker of markers) {
    const sourceIds = marker.match(/SOURCE\\?_\d+/gi) ?? [];
    for (const sourceId of sourceIds) {
      ids.add(sourceId.replace("\\_", "_").toUpperCase());
    }
  }

  return ids;
}

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => <h1 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="mb-2 mt-3 text-[15px] font-bold first:mt-0">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="mb-1.5 mt-2.5 text-sm font-bold first:mt-0">{children}</h3>,
  h4: ({ children }: { children?: ReactNode }) => <h4 className="mb-1 mt-2 text-[13.5px] font-bold first:mt-0">{children}</h4>,
  p: ({ children }: { children?: ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="pl-0.5">{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => <blockquote className="my-2 border-l-2 border-[#3183d4]/35 pl-3 text-gray-600">{children}</blockquote>,
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#2674bd] underline decoration-[#2674bd]/30 underline-offset-2 hover:decoration-[#2674bd]">{children}</a>
  ),
  pre: ({ children }: { children?: ReactNode }) => <pre className="my-2 max-w-full overflow-x-auto rounded-lg bg-gray-900 p-3 text-[11.5px] leading-relaxed text-gray-100 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">{children}</pre>,
  code: ({ children }: { children?: ReactNode }) => <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.9em] text-gray-800">{children}</code>,
  table: ({ children }: { children?: ReactNode }) => <div className="my-2 max-w-full overflow-x-auto"><table className="w-full border-collapse text-left text-xs">{children}</table></div>,
  th: ({ children }: { children?: ReactNode }) => <th className="border border-gray-200 bg-gray-50 px-2 py-1.5 font-bold">{children}</th>,
  td: ({ children }: { children?: ReactNode }) => <td className="border border-gray-200 px-2 py-1.5 align-top">{children}</td>,
  hr: () => <hr className="my-3 border-[#3183d4]/15" />,
  img: ({ src, alt }: { src?: string; alt?: string }) => <img src={src} alt={alt || ""} loading="lazy" className="my-2 max-h-52 max-w-full rounded-lg object-contain" />,
};

export default function Chatbot() {
  const { locale } = useLocale();
  const labels = copy[locale];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [resourceMode, setResourceMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const sendingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [error, messages, open, sending]);

  const submitMessage = async (value: string) => {
    const content = value.trim();
    if (!content || sendingRef.current) return;
    sendingRef.current = true;

    const mode = resourceMode ? "resources" : "general";
    const userMessage: DisplayMessage = { role: "user", content, mode };
    const conversation = [...messages.filter((message) => message.mode === mode), userMessage]
      .slice(-7)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }));
    setMessages((current) => [...current, userMessage, { role: "assistant", content: "", rawContent: "", mode }]);
    setInput("");
    setError("");
    setSending(true);

    try {
      const result = await streamChatMessage(conversation, resourceMode, (delta) => {
        setMessages((current) => {
          const next = [...current];
          const lastIndex = next.length - 1;
          const lastMessage = next[lastIndex];
          if (lastMessage?.role === "assistant") {
            const rawContent = (lastMessage.rawContent ?? lastMessage.content) + delta;
            next[lastIndex] = {
              ...lastMessage,
              rawContent,
              content: mode === "resources" ? stripKnowledgeMarkers(rawContent) : rawContent,
            };
          }
          return next;
        });
      });
      setMessages((current) => {
        const next = [...current];
        const lastIndex = next.length - 1;
        if (next[lastIndex]?.role === "assistant") {
          const citedSourceIds = extractKnowledgeSourceIds(result.message);
          const citedSources = result.sources.filter((source) => citedSourceIds.has(source.id.toUpperCase()));
          next[lastIndex] = {
            ...next[lastIndex],
            rawContent: result.message,
            content: resourceMode ? stripKnowledgeMarkers(result.message) : result.message,
            sources: citedSources.length > 0 ? citedSources : result.sources.slice(0, 1),
          };
        }
        return next;
      });
    } catch (requestError: any) {
      setMessages((current) => {
        const lastMessage = current[current.length - 1];
        return lastMessage?.role === "assistant" && !lastMessage.content
          ? current.slice(0, -1)
          : current;
      });
      setError(requestError.message || labels.genericError);
    } finally {
      sendingRef.current = false;
      setSending(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage(input);
  };

  return (
    <>
      <div
        className={`fixed bottom-24 right-6 z-50 w-[calc(100vw-48px)] max-w-sm origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0"}`}
        role="dialog"
        aria-label={labels.title}
        aria-hidden={!open}
      >
        <div className="flex h-[520px] max-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-xl border border-[#3183d4]/10 bg-white shadow-2xl">
          <div className="relative bg-[#3183d4] px-4 py-3.5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10"><Bot className="h-4 w-4" /></div>
                <div>
                  <p className="text-[13.5px] font-semibold leading-tight tracking-wide">{labels.title}</p>
                  <p className="mt-0.5 text-[10.5px] text-white/70">{labels.powered}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={labels.close} className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#f7f8fa] px-4 py-4" aria-live="polite">
            <div className="flex max-w-[88%] items-end gap-2">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#3183d4] text-white"><Bot className="h-3.5 w-3.5" /></div>
              <div className="rounded-2xl rounded-bl-sm border border-[#3183d4]/10 bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-gray-800 shadow-sm">{labels.welcome}</div>
            </div>

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex max-w-[88%] items-end gap-2 ${message.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <div className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${message.role === "user" ? "bg-[#489e42] text-white" : "bg-[#3183d4] text-white"}`}>
                  {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${message.role === "user" ? "rounded-br-sm bg-[#3183d4] text-white" : "rounded-bl-sm border border-[#3183d4]/10 bg-white text-gray-800"}`}>
                  <div className={message.role === "assistant" ? "" : "whitespace-pre-wrap"}>
                    {message.content ? (
                      message.role === "assistant"
                        ? <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.content}</Markdown>
                        : message.content
                    ) : (sending && index === messages.length - 1 ? <span className="flex items-center gap-2 text-gray-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {labels.thinking}</span> : null)}
                    {message.content && sending && message.role === "assistant" && index === messages.length - 1 && <span className="ml-0.5 animate-pulse text-[#3183d4]">▍</span>}
                  </div>
                  {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 border-t border-[#3183d4]/10 pt-2.5">
                      <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#3d8a37]"><BookOpen className="h-3 w-3" /> {labels.sources}</p>
                      <div className="space-y-1.5">
                        {message.sources.map((source) => {
                          const href = source.sourceType === "news" ? `/${locale}${source.filePath}` : source.filePath;
                          return (
                            <a key={source.id} href={href} download={source.sourceType === "resource" || undefined} className="flex items-start gap-2 rounded-md bg-[#489e42]/[0.07] px-2.5 py-2 text-[11.5px] leading-snug text-gray-700 transition-colors hover:bg-[#489e42]/[0.14]">
                              <span className="min-w-0 flex-1">
                                <span className="line-clamp-2 font-semibold">{locale === "fr" ? source.titleFr : source.titleEn}</span>
                              </span>
                              {source.sourceType === "news" ? <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-[#3183d4]" /> : <Download className="mt-0.5 h-3 w-3 shrink-0 text-[#3183d4]" />}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#3183d4]/10 bg-white">
            <form onSubmit={handleSubmit} className="px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  maxLength={2000}
                  disabled={sending}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={labels.placeholder}
                  aria-label={labels.placeholder}
                  className="min-w-0 flex-1 rounded-lg border border-[#3183d4]/10 bg-[#3183d4]/[0.04] px-3.5 py-2.5 text-[13.5px] text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#3183d4]/40 focus:bg-white disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label={labels.resourceMode}
                  aria-pressed={resourceMode}
                  title={`${labels.resourceMode} — ${labels.resourceModeHelp}`}
                  disabled={sending}
                  onClick={() => setResourceMode((value) => !value)}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition-colors disabled:opacity-50 ${resourceMode ? "border-[#489e42]/35 bg-[#489e42]/10 text-[#347b30]" : "border-ink/10 bg-ink/[0.025] text-ink/55 hover:border-[#489e42]/25 hover:text-[#3d8a37]"}`}
                >
                  <BookOpen className="h-4 w-4" />
                </button>
                <button type="submit" disabled={sending || !input.trim()} aria-label={labels.send} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#3183d4] text-white transition-colors hover:bg-[#2a6db8] disabled:cursor-not-allowed disabled:opacity-40">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-[#3183d4] text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2a6db8]"
      >
        <div className={`transition-all duration-300 ${open ? "absolute rotate-90 scale-50 opacity-0" : "scale-100 opacity-100"}`}><MessageCircle className="h-6 w-6" /></div>
        <div className={`transition-all duration-300 ${open ? "scale-100 opacity-100" : "absolute -rotate-90 scale-50 opacity-0"}`}><X className="h-6 w-6" /></div>
      </button>
    </>
  );
}
