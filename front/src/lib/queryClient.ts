import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client.
 *
 * - `staleTime: 60_000` — data is considered fresh for 1 minute. Navigating
 *   back to a page within that window shows cached data instantly (no
 *   refetch, no flash).
 * - `refetchOnWindowFocus: false` — we don't want every tab-switch to trigger
 *   a refetch on public pages. Admin pages can opt in per-query if needed.
 * - `retry: 1` — one retry on failure (default is 3, which is too patient for
 *   a content site).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
