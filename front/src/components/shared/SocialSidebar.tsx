import { useQuery } from "@tanstack/react-query";
import { getSocials, type SocialData } from "@/api/auth";

/**
 * Fixed-left vertical social-media sidebar.
 *
 * Uses React Query so the socials are fetched once and cached across all
 * pages. Navigating between public pages does NOT re-fetch — the cached data
 * is shown instantly, so the sidebar never disappears during navigation.
 */
export default function SocialSidebar() {
  const { data: socials } = useQuery<SocialData[]>({
    queryKey: ["socials"],
    queryFn: getSocials,
    staleTime: Infinity, // cache forever (socials rarely change)
  });

  if (!socials || socials.length === 0) return null;

  return (
    <aside className="fixed left-0 top-[55%] -translate-y-1/2 z-40 hidden lg:flex flex-col items-center">
      <div className="flex flex-col items-center gap-3 py-3 px-2 bg-[#489e42]">
        {socials.map((s) => (
          <a
            key={s.id}
            href={s.url}
            aria-label={s.platform}
            className="block p-1.5 text-white/60 hover:text-white transition-colors duration-150"
          >
            {s.icon_file ? (
              <img
                src={s.icon_file}
                alt={s.platform}
                width="22"
                height="22"
                className="object-contain"
              />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d={s.icon_svg} />
              </svg>
            )}
          </a>
        ))}
      </div>
    </aside>
  );
}
