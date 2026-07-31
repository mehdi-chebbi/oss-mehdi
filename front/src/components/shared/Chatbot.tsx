import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* ---- Chat modal ---- */}
      <div
        className={`
          fixed bottom-24 right-6 z-50 w-[calc(100vw-48px)] max-w-sm
          origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            open
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }
        `}
        role="dialog"
        aria-label="Assistant OSS"
        aria-hidden={!open}
      >
        <div className="flex flex-col h-[520px] max-h-[calc(100vh-140px)] bg-white rounded-xl shadow-2xl border border-[#3183d4]/10 overflow-hidden">
          {/* Header */}
          <div className="relative px-4 py-3.5 bg-[#3183d4] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-9 w-9 rounded-full bg-white/10 border border-white/15">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold leading-tight tracking-wide">
                    Assistant OSS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="grid place-items-center h-8 w-8 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#f7f8fa] flex flex-col gap-3">
            {/* Bot welcome message */}
            <div className="flex items-end gap-2 max-w-[88%]">
              <div className="grid place-items-center h-6 w-6 rounded-full bg-[#3183d4] text-white shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white border border-[#3183d4]/10 px-3.5 py-2.5 text-[13.5px] text-gray-800 leading-relaxed shadow-sm">
                Bonjour, je suis l&apos;assistant IA de l&apos;OSS. Comment
                puis-je vous aider aujourd&apos;hui ?
              </div>
            </div>
          </div>

          {/* Suggestions + Input */}
          <div className="border-t border-[#3183d4]/10 bg-white">
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
              {[
                "Vos domaines d'action",
                'Nos outils',
                'Nous contacter',
              ].map((chip) => (
                <button
                  key={chip}
                  className="text-[11.5px] px-2.5 py-1 rounded-md bg-[#3183d4]/[0.04] border border-[#3183d4]/10 text-[#3183d4] hover:bg-[#3183d4]/[0.08] hover:border-[#3183d4]/20 transition-colors font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  aria-label="Message"
                  className="flex-1 px-3.5 py-2.5 text-[13.5px] bg-[#3183d4]/[0.04] border border-[#3183d4]/10 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#3183d4]/40 focus:bg-white transition-colors"
                />
                <button
                  aria-label="Envoyer"
                  className="grid place-items-center h-10 w-10 rounded-lg bg-[#3183d4] text-white hover:bg-[#2a6db8] transition-colors shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Floating toggle button ---- */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        aria-expanded={open}
        className={`
          fixed bottom-6 right-6 z-50 grid place-items-center h-14 w-14 rounded-full
          bg-[#3183d4] text-white shadow-lg border border-white/10
          hover:bg-[#2a6db8] hover:-translate-y-0.5
          transition-all duration-200
        `}
      >
        <div
          className={`transition-all duration-300 ${
            open ? 'opacity-0 scale-50 rotate-90 absolute' : 'opacity-100 scale-100'
          }`}
        >
          <MessageCircle className="h-6 w-6" />
        </div>
        <div
          className={`transition-all duration-300 ${
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-50 -rotate-90 absolute'
          }`}
        >
          <X className="h-6 w-6" />
        </div>
      </button>
    </>
  );
}
