import { useParams } from 'react-router-dom';
import { stats } from '@/data/stats';
import type { Locale } from '@/context/locale';

export default function Stats() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  const label = (s: (typeof stats)[number]) =>
    locale === 'en' ? s.label_en : s.label_fr;

  return (
    <section className="relative overflow-hidden border-t border-b border-[#D9D4CB] bg-[#EFECE5] py-4">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[60px] bg-gradient-to-r from-[#EFECE5] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[60px] bg-gradient-to-l from-[#EFECE5] to-transparent" />

      {/* Scrolling track — duplicated for seamless loop */}
      <div className="flex w-max animate-[ticker-scroll_28s_linear_infinite]">
        {/* First copy */}
        {stats.map((s) => (
          <div key={s.label_en} className="flex items-center whitespace-nowrap">
            <span className="flex items-center gap-2">
              <span className="font-mono text-[13px] uppercase tracking-[0.12em] text-stone-500">
                {label(s)}
              </span>
              <span className="font-mono text-[17px] font-bold text-stone-800">
                {s.value}
              </span>
            </span>
            <span className="mx-6 text-stone-400">|</span>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {stats.map((s) => (
          <div key={`dup-${s.label_en}`} className="flex items-center whitespace-nowrap">
            <span className="flex items-center gap-2">
              <span className="font-mono text-[13px] uppercase tracking-[0.12em] text-stone-500">
                {label(s)}
              </span>
              <span className="font-mono text-[17px] font-bold text-stone-800">
                {s.value}
              </span>
            </span>
            <span className="mx-6 text-stone-400">|</span>
          </div>
        ))}
      </div>

      {/* Keyframes injected via style tag — Tailwind can't do arbitrary @keyframes */}
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
