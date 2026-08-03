import { useNavigation } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * Top progress bar for route transitions.
 *
 * Uses `useNavigation()` to detect when a route loader is running. While the
 * loader resolves, a thin animated bar slides across the top of the viewport.
 * This gives the user immediate feedback that navigation is happening —
 * replacing the old "flash of empty content" with a deliberate, polished
 * loading signal.
 *
 * The old page stays visible underneath (React Router keeps it mounted until
 * the new route's loader resolves), so there's never an empty shell.
 */
export default function RouteProgress() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  // Track whether the bar is visually visible. We keep it mounted for a brief
  // moment after loading completes so the bar can finish its animation to 100%
  // width before disappearing.
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    let timer: ReturnType<typeof setTimeout>;

    if (isLoading) {
      setVisible(true);
      setProgress(0);

      // Ease the bar to ~80% quickly, then hold until the loader resolves.
      // This mimics the perceived-progress pattern used by YouTube / GitHub.
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        // Reaching 80% over ~800ms with an ease-out curve
        const t = Math.min(elapsed / 800, 1);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        setProgress(Math.round(eased * 80));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } else if (visible) {
      // Loader resolved — rush to 100%, then fade out.
      setProgress(100);
      timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none">
      <div
        className="h-full bg-[#489e42] transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 150ms ease-out, opacity 200ms ease-out 50ms" : "width 300ms ease-out",
        }}
      />
    </div>
  );
}
