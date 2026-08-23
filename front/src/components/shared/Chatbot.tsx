import { type FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, User, X } from "lucide-react";
import { streamChatMessage, type ChatMessage } from "@/api/chat";
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
    suggestions: ["Quels sont vos domaines d’action ?", "Présentez-moi vos outils", "Comment contacter l’OSS ?"],
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
    suggestions: ["What are your areas of work?", "Tell me about your tools", "How can I contact OSS?"],
  },
} as const;

export default function Chatbot() {
  const { locale } = useLocale();
  const labels = copy[locale];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
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
    if (!content || sending) return;

    const userMessage: ChatMessage = { role: "user", content };
    const conversation = [...messages, userMessage].slice(-10);
    setMessages((current) => [...current, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setSending(true);

    try {
      await streamChatMessage(conversation, (delta) => {
        setMessages((current) => {
          const next = [...current];
          const lastIndex = next.length - 1;
          const lastMessage = next[lastIndex];
          if (lastMessage?.role === "assistant") {
            next[lastIndex] = { ...lastMessage, content: lastMessage.content + delta };
          }
          return next;
        });
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
                <div className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${message.role === "user" ? "rounded-br-sm bg-[#3183d4] text-white" : "rounded-bl-sm border border-[#3183d4]/10 bg-white text-gray-800"}`}>
                  {message.content || (sending && index === messages.length - 1 ? <span className="flex items-center gap-2 text-gray-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {labels.thinking}</span> : null)}
                  {message.content && sending && message.role === "assistant" && index === messages.length - 1 && <span className="ml-0.5 animate-pulse text-[#3183d4]">▍</span>}
                </div>
              </div>
            ))}

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#3183d4]/10 bg-white">
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
                {labels.suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" disabled={sending} onClick={() => submitMessage(suggestion)} className="rounded-md border border-[#3183d4]/10 bg-[#3183d4]/[0.04] px-2.5 py-1 text-[11.5px] font-medium text-[#3183d4] transition-colors hover:border-[#3183d4]/20 hover:bg-[#3183d4]/[0.08] disabled:opacity-40">{suggestion}</button>
                ))}
              </div>
            )}

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
                  className="flex-1 rounded-lg border border-[#3183d4]/10 bg-[#3183d4]/[0.04] px-3.5 py-2.5 text-[13.5px] text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#3183d4]/40 focus:bg-white disabled:opacity-60"
                />
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
