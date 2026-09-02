import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Globe2, Menu, Search, X } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getNavItems } from '@/data/navigation';
import type { Locale } from '@/context/locale';
import BrandBands from './BrandBands';
import GlobalSearchPanel from './GlobalSearchPanel';

const languages = [
  { code: 'fr', label: 'Français', display: 'FR' },
  { code: 'en', label: 'English', display: 'EN' },
];

export default function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang: Locale = lang === 'en' ? 'en' : 'fr';
  const navItems = getNavItems(currentLang);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setOpenDropdown(null);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [langOpen]);

  const switchLang = (code: string) => {
    const newPath = location.pathname.replace(/^\/(fr|en)(\/|$)/, `/${code}$2`);
    navigate(newPath + location.search + location.hash);
  };

  const renderLink = (href: string, label: string, className: string, key?: string) =>
    !href ? (
      <button key={key || label} type="button" className={className}>{label}</button>
    ) : href.startsWith('/') ? (
      <Link key={key} to={href} className={className}>{label}</Link>
    ) : (
      <a key={key} href={href} className={className}>{label}</a>
    );

  return (
    <>
      <header
        className="font-oss fixed inset-x-0 top-0 z-50 border-b border-oss-blue/15 bg-white/95 shadow-[0_8px_28px_rgba(18,53,91,0.08)] backdrop-blur-md"
      >
        <BrandBands className="h-[6px] lg:h-[8px] 2xl:h-[9px] [&>span]:h-[3px] lg:[&>span]:h-[4px] 2xl:[&>span]:h-[4.5px] [&>span:nth-child(2)]:top-[2px] lg:[&>span:nth-child(2)]:top-[2.5px] 2xl:[&>span:nth-child(2)]:top-[3px] [&>span:nth-child(3)]:top-[4px] lg:[&>span:nth-child(3)]:top-[5px] 2xl:[&>span:nth-child(3)]:top-[6px]" />

        <nav className="mx-auto flex h-[74px] max-w-[2100px] items-center gap-5 px-4 sm:px-6 lg:h-[96px] lg:px-8 xl:gap-3 xl:px-5 2xl:h-[111px] 2xl:gap-5 2xl:px-8" aria-label="Navigation principale">
          <Link to={`/${currentLang}`} className="shrink-0" aria-label="OSS - Accueil">
            <img src="/logo-h.webp" alt="OSS" className="h-12 w-auto sm:h-14 lg:h-[68px] xl:h-[60px] 2xl:h-[84px]" />
          </Link>

          <ul className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
            {navItems.map((item) => (
              <li
                key={item.label}
                className="relative"
                onMouseLeave={() => item.children && setOpenDropdown(null)}
              >
                {item.children ? (
                  <>
                    <button
                      type="button"
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onClick={() => setOpenDropdown((value) => value === item.label ? null : item.label)}
                      className="flex items-center gap-1 whitespace-nowrap px-1 py-3 text-sm font-bold text-oss-blue-dark transition-colors hover:text-oss-blue 2xl:px-2.5 2xl:text-lg"
                      aria-expanded={openDropdown === item.label}
                    >
                      {item.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`absolute left-0 top-full z-20 min-w-64 border-t-2 border-oss-ochre bg-white p-2 shadow-[0_16px_36px_rgba(18,53,91,0.15)] transition-all ${openDropdown === item.label ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>
                      {item.children.map((child) => renderLink(
                        child.href,
                        child.label,
                        'block w-full px-3 py-3 text-left text-base font-semibold text-ink/75 transition-colors hover:bg-oss-blue/5 hover:text-oss-blue',
                        child.href || child.label,
                      ))}
                    </div>
                  </>
                ) : renderLink(
                  item.href,
                  item.label,
                  'block whitespace-nowrap px-1 py-3 text-sm font-bold text-oss-blue-dark transition-colors hover:text-oss-blue 2xl:px-2.5 2xl:text-lg',
                )}
              </li>
            ))}
          </ul>

          <div className="ml-auto hidden shrink-0 items-center gap-2 xl:ml-0 xl:flex">
            <button
              type="button"
              data-global-search-trigger
              onClick={() => setSearchOpen((value) => !value)}
              className="grid h-9 w-9 place-items-center border border-oss-blue/20 text-oss-blue transition-colors hover:bg-oss-blue hover:text-white"
              aria-label={currentLang === 'en' ? 'Search' : 'Rechercher'}
              aria-expanded={searchOpen}
              aria-controls="global-search-panel"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen((value) => !value)}
                className="flex h-9 items-center gap-1.5 border border-oss-blue/20 px-2 text-[11px] font-bold text-oss-blue-dark transition-colors hover:border-oss-blue 2xl:px-3 2xl:text-xs"
                aria-expanded={langOpen}
              >
                <Globe2 className="h-4 w-4 text-oss-blue" />
                {currentLang.toUpperCase()}
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className={`absolute right-0 top-full z-20 mt-2 w-32 border-t-2 border-oss-ochre bg-white p-1 shadow-lg transition-all ${langOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => switchLang(language.code)}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-oss-blue/5 ${currentLang === language.code ? 'font-bold text-oss-blue' : 'text-ink/70'}`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>
            <Link
              to={`/${currentLang}/report`}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap bg-oss-ochre px-2 text-[11px] font-bold text-oss-blue-dark transition-colors hover:bg-oss-blue hover:text-white 2xl:gap-2 2xl:px-3 2xl:text-xs"
            >
              <AlertCircle className="h-4 w-4" />
              {currentLang === 'en' ? 'Complaints' : 'Plaintes'}
            </Link>
            <button
              type="button"
              className="inline-flex h-9 items-center whitespace-nowrap bg-oss-blue px-2 text-[11px] font-bold text-white transition-colors hover:bg-oss-blue-dark 2xl:px-3 2xl:text-xs"
            >
              {currentLang === 'en' ? 'Members' : 'Membres'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="ml-auto grid h-10 w-10 place-items-center bg-oss-blue text-white xl:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <div className={`overflow-y-auto border-t border-oss-blue/10 bg-white transition-[max-height,opacity] duration-200 xl:hidden ${mobileOpen ? 'max-h-[calc(100dvh-80px)] opacity-100 lg:max-h-[calc(100dvh-104px)]' : 'max-h-0 opacity-0'}`}>
          <div className="mx-auto max-w-7xl px-5 py-4">
            <button
              type="button"
              data-global-search-trigger
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="mb-3 flex min-h-11 w-full items-center gap-3 border border-oss-blue/20 px-4 text-left text-sm font-bold text-oss-blue-dark"
              aria-expanded={searchOpen}
              aria-controls="global-search-panel"
            >
              <Search className="h-4 w-4 text-oss-blue" />
              {currentLang === 'en' ? 'Search the site' : 'Rechercher dans le site'}
            </button>
            {navItems.map((item) => (
              <div key={item.label} className="border-b border-oss-blue/10 py-1">
                {item.children ? (
                  <>
                    <div className="py-2 text-sm font-bold text-oss-blue-dark">{item.label}</div>
                    <div className="grid gap-1 pb-2 pl-3">
                      {item.children.map((child) => renderLink(child.href, child.label, 'w-full py-1.5 text-left text-sm text-ink/65 hover:text-oss-blue', child.href || child.label))}
                    </div>
                  </>
                ) : renderLink(item.href, item.label, 'block py-2 text-sm font-bold text-oss-blue-dark')}
              </div>
            ))}
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/45">Langue</span>
              <div className="flex gap-2">
                {languages.map((language) => (
                  <button key={language.code} type="button" onClick={() => switchLang(language.code)} className={`border px-3 py-1.5 text-xs font-bold ${currentLang === language.code ? 'border-oss-blue bg-oss-blue text-white' : 'border-oss-blue/20 text-oss-blue'}`}>
                    {language.display}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to={`/${currentLang}/report`}
                className="flex min-h-11 items-center justify-center gap-2 bg-oss-ochre px-4 text-center text-sm font-bold text-oss-blue-dark"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {currentLang === 'en' ? 'File a complaint' : 'Déposer une plainte'}
              </Link>
              <button
                type="button"
                className="flex min-h-11 items-center justify-center bg-oss-blue px-4 text-sm font-bold text-white transition-colors hover:bg-oss-blue-dark"
              >
                {currentLang === 'en' ? 'Members' : 'Membres'}
              </button>
            </div>
          </div>
        </div>

        <GlobalSearchPanel
          open={searchOpen}
          locale={currentLang}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={() => setSearchOpen(false)}
        />
      </header>
      {!overlay && <div className="h-[80px] lg:h-[104px] 2xl:h-[120px]" aria-hidden="true" />}
    </>
  );
}
