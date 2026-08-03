import { useLoaderData } from "react-router-dom";
import Hero from './components/home/Hero'
import Stats from './components/home/Stats'
import Fields from './components/home/Fields'
import News from './components/home/News'
import Tools from './components/home/Tools'
import Partners from './components/home/Partners'
import Contact from './components/home/Contact'
import type { HomeLoaderData } from './loaders/public'

/**
 * Home page — all section data is pre-fetched by the `homeLoader` (runs before
 * the route renders). Each section receives its data as props, so there's no
 * `useEffect` fetch and no empty-content flash. The shell (Navbar, Footer,
 * SocialSidebar, Chatbot) is provided by <PublicLayout>.
 */
export default function HomePage() {
  const { hero, fields, latestNews, tools, partners } = useLoaderData() as HomeLoaderData;

  return (
    <>
      <Hero data={hero} />
      <Stats />
      <Fields items={fields} />
      <News articles={latestNews} />
      <Tools items={tools} />
      <Partners items={partners} />
      <Contact />
    </>
  );
}
