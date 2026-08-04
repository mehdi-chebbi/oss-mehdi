import { useParams } from 'react-router-dom';
import { stats } from '@/data/stats';
import type { Locale } from '@/context/locale';

export default function Stats() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';

  const label = (s: (typeof stats)[number]) =>
    locale === 'en' ? s.label_en : s.label_fr;

  return (
    <section className="relative overflow-hidden border-t border-b border-[#d6cfc7] bg-white py-[22px]">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[90px] bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[90px] bg-gradient-to-l from-white to-transparent" />

      {/* Scrolling track — duplicated for seamless loop */}
      <div className="flex w-max gap-12 animate-[ticker-scroll_40s_linear_infinite]">
        {/* First copy */}
        {stats.map((s) => (
          <div key={s.label_en} className="flex items-center gap-3 whitespace-nowrap">
            <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#489e42]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-stone-400">
              {label(s)}
            </span>
            <span className="font-mono text-[13px] font-semibold text-stone-900">
              {s.value}
            </span>
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {stats.map((s) => (
          <div key={`dup-${s.label_en}`} className="flex items-center gap-3 whitespace-nowrap">
            <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#489e42]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-stone-400">
              {label(s)}
            </span>
            <span className="font-mono text-[13px] font-semibold text-stone-900">
              {s.value}
            </span>
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
