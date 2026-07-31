import { useEffect, useRef, useState } from 'react';
import { stats } from '@/data/stats';

// easeOutExpo — fast start, slow deceleration to the target
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

const DURATION = 1800;

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();

            const tick = (now: number) => {
              const t = Math.min((now - start) / DURATION, 1);
              setProgress(easeOutExpo(t));
              if (t < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-ink py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
        {stats.map((s) => {
          const current = Math.round(s.value * progress);
          return (
            <div key={s.label} className="text-center">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tabular-nums tracking-tight">
                {current}{s.suffix}
              </span>
              <p className="text-white/35 text-[13px] sm:text-sm mt-2 uppercase tracking-[0.12em]">
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
