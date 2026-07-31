import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { navItems } from '@/data/navigation';

const languages = [
  { code: 'fr', label: 'Français', display: 'FR' },
  { code: 'en', label: 'English', display: 'EN' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  const currentLang = lang === 'en' ? 'en' : 'fr';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [langOpen]);

  const switchLang = (code: string) => {
    setLangOpen(false);
    navigate(`/${code}`);
  };

  const displayLang = languages.find((l) => l.code === currentLang)?.display || 'FR';

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 border-b border-ink/10 bg-white
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${scrolled ? 'shadow-sm' : ''}
      `}
    >
      {/* Top-right controls */}
      <div className="absolute top-3 right-4 lg:right-6 flex items-center gap-2 z-10">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/35 pointer-events-none"
            width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-36 lg:w-44 pl-8 pr-3 py-1.5 text-[13px] bg-ink/[0.04] border border-ink/[0.08] rounded-lg text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/20 focus:bg-white transition-colors"
          />
        </div>

        {/* Language selector */}
        <div ref={langRef}>
        <button
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[13px] text-ink/50 hover:text-ink transition-colors px-2 py-1 rounded-md"
          aria-label="Change language"
          aria-expanded={langOpen}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M1.5 8h13M8 1.5c-1.5 2-2.3 4-2.3 6.5s.8 4.5 2.3 6.5c1.5-2 2.3-4 2.3-6.5S9.5 3.5 8 1.5z" />
          </svg>
          {displayLang}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </button>
        <div
          className={`absolute right-0 top-full mt-1 w-28 bg-white border border-ink/10 rounded-lg shadow-lg overflow-hidden transition-all duration-150 origin-top-right ${langOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLang(l.code)}
              className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${currentLang === l.code ? 'text-ink font-medium bg-ink/[0.04]' : 'text-ink/60 hover:text-ink hover:bg-ink/[0.04]'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      </div>

      <nav
        className={`flex items-end transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? 'h-20' : 'h-36'
        }`}
      >
        {/* Logo */}
        <a href={`/${currentLang}`} className="shrink-0 self-center pl-4 lg:pl-8">
          <img
            src="/logo-h.webp"
            alt="OSS"
            className={`w-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              scrolled ? 'h-14' : 'h-25'
            }`}
          />
        </a>

        {/* Links */}
        <ul className="hidden lg:flex items-end gap-0.5 pb-1 ml-auto mr-auto max-w-7xl pr-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="
                  block px-3 py-1 text-[18px] font-semibold text-ink/75 rounded-md
                  hover:text-ink hover:bg-ink/[0.04]
                  transition-colors duration-150
                "
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 -mr-2 rounded-md hover:bg-ink/[0.04] transition-colors self-center"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 5h12M3 9h12M3 13h12" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        ref={menuRef}
        className={`
          lg:hidden overflow-hidden transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-6 pb-5 pt-1 border-t border-ink/5 bg-white">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2.5 text-[14px] text-ink/55 hover:text-ink transition-colors duration-150"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
