import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SocialSidebar from "./SocialSidebar";
import Chatbot from "./Chatbot";
import { LocaleProvider } from "@/context/locale";

/**
 * Shared shell for all public pages.
 *
 * This is a *layout route* — it renders once and stays mounted across
 * navigations between child routes. Only the <Outlet/> (the page content)
 * swaps. This means the Navbar, Footer, SocialSidebar, and Chatbot never
 * unmount/remount when navigating between public pages, which:
 *
 *  1. Eliminates the "shell flashes, content is empty" problem — the shell
 *     is always there, and the new page's content arrives pre-fetched from
 *     the route loader.
 *  2. Avoids redundant re-renders of the Navbar (scroll position, mobile
 *     menu state, etc. are preserved across navigations).
 *
 * The `overlay` prop on <Navbar> is true only on the home page (where the
 * hero is full-bleed and the navbar floats over it). On all other pages the
 * navbar renders a constant-height spacer so content sits cleanly below it.
 */
export default function PublicLayout() {
  const location = useLocation();
  // Home page = "/" or "/fr" or "/en" (with optional trailing slash)
  const isHome = /^\/(fr|en)?\/?$/.test(location.pathname);

  return (
    <LocaleProvider>
      <div className="min-h-screen flex flex-col">
        <SocialSidebar />
        <Navbar overlay={isHome} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Chatbot />
      </div>
    </LocaleProvider>
  );
}
