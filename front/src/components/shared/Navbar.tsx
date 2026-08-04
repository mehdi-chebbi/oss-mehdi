import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { getNavItems } from '@/data/navigation';
import type { Locale } from '@/context/locale';

const languages = [
  { code: 'fr', label: 'Français', display: 'FR' },
  { code: 'en', label: 'English', display: 'EN' },
];

/**
 * `overlay` — when true, the navbar floats over the content below it (no
 * spacer is rendered). Use this on pages with a full-bleed hero (e.g. the
 * homepage). On all other pages, omit it and a constant-height spacer is
 * rendered so content sits cleanly below the fixed navbar without any
 * page-level padding hacks.
 */
export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();

  const currentLang: Locale = lang === 'en' ? 'en' : 'fr';
  const navItems = getNavItems(currentLang);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [openDropdown]);

  // Switch language while preserving the current path (e.g. /fr/news → /en/news)
  const switchLang = (code: string) => {
    setLangOpen(false);
    const newPath = location.pathname.replace(/^\/(fr|en)(\/|$)/, `/${code}$2`);
    navigate(newPath + location.search + location.hash);
  };

  const displayLang = languages.find((l) => l.code === currentLang)?.display || 'FR';

  return (
    <>
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
            placeholder={currentLang === 'en' ? 'Search...' : 'Rechercher...'}
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
          {navItems.map((item) =>
            item.children ? (
              <li key={item.label} className="relative" data-dropdown onMouseLeave={() => setOpenDropdown(null)}>
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  className="
                    flex items-center gap-1 px-3 py-1 text-[18px] font-semibold text-ink/75 rounded-md
                    hover:text-ink hover:bg-ink/[0.04]
                    transition-colors duration-150
                  "
                >
                  {item.label}
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    className={`transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`}
                  >
                    <path d="M3.5 5.25l3.5 3.5 3.5-3.5" />
                  </svg>
                </button>
                <div
                  className={`absolute left-0 top-full pt-1 min-w-56 transition-all duration-150 origin-top-left ${openDropdown === item.label ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <div className="bg-white border border-ink/10 rounded-lg shadow-lg overflow-hidden">
                  {item.children.map((child) =>
                    child.href.startsWith('/') ? (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-4 py-2.5 text-[14px] text-ink/60 hover:text-ink hover:bg-ink/[0.04] transition-colors duration-150"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {child.label}
                      </Link>
                    ) : (
                      <a
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-[14px] text-ink/60 hover:text-ink hover:bg-ink/[0.04] transition-colors duration-150"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {child.label}
                      </a>
                    )
                  )}
                  </div>
                </div>
              </li>
            ) : (
              <li key={item.href}>
                {item.href.startsWith('/') ? (
                  <Link
                    to={item.href}
                    className="
                      block px-3 py-1 text-[18px] font-semibold text-ink/75 rounded-md
                      hover:text-ink hover:bg-ink/[0.04]
                      transition-colors duration-150
                    "
                  >
                    {item.label}
                  </Link>
                ) : (
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
                )}
              </li>
            )
          )}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden p-2 -mr-2 rounded-md hover:bg-ink/[0.04] transition-colors self-center"
          aria-label={mobileOpen ? (currentLang === 'en' ? 'Close menu' : 'Fermer le menu') : (currentLang === 'en' ? 'Open menu' : 'Ouvrir le menu')}
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
          ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-6 pb-5 pt-1 border-t border-ink/5 bg-white">
          <ul className="flex flex-col">
            {navItems.map((item) =>
              item.children ? (
                <li key={item.label}>
                  <span className="block px-2 py-2.5 text-[14px] font-semibold text-ink/75">
                    {item.label}
                  </span>
                  <ul className="pl-4">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        {child.href.startsWith('/') ? (
                          <Link
                            to={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-2 py-2 text-[13px] text-ink/55 hover:text-ink transition-colors duration-150"
                          >
                            {child.label}
                          </Link>
                        ) : (
                          <a
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-2 py-2 text-[13px] text-ink/55 hover:text-ink transition-colors duration-150"
                          >
                            {child.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-2 py-2.5 text-[14px] text-ink/55 hover:text-ink transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-2 py-2.5 text-[14px] text-ink/55 hover:text-ink transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </header>
    {/* Constant-height spacer — pushes content below the fixed navbar so
        pages never need their own top-padding hack. Always sized to the
        navbar's EXPANDED height (144px = h-36); when the navbar shrinks on
        scroll, the gap shows the body's bone background (same as content),
        so it's imperceptible. Skipped when `overlay` is set (full-bleed
        hero pages). */}
    {!overlay && <div className="h-36" aria-hidden="true" />}
    </>
  );
}
