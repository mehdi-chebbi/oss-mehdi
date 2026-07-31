import { socials } from '@/data/socials';

export default function SocialSidebar() {
  return (
    <aside className="fixed left-0 top-[55%] -translate-y-1/2 z-40 hidden lg:flex flex-col items-center">
      <div className="flex flex-col items-center gap-3 py-3 px-2 bg-[#489e42]">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            aria-label={s.name}
            className="block p-1.5 text-white/60 hover:text-white transition-colors duration-150"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d={s.path} />
            </svg>
          </a>
        ))}
      </div>
    </aside>
  );
}
