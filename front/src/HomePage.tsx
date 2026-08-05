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
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {/* Left - Publications */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '34px', fontWeight: 400, color: '#49645d', margin: '0 0 30px 0', textAlign: 'center' }}>Nos Publications récentes</h2>
            <div style={{ width: '100%', backgroundColor: '#49645d', flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', padding: '40px' }}>
              <div style={{ flexShrink: 0, marginRight: '30px' }}>
                <img src="/video-thumbnail.png" alt="Publication" style={{ width: '180px', height: 'auto', borderRadius: '12px' }} />
              </div>
              <div style={{ alignSelf: 'flex-end', maxWidth: '500px', marginLeft: 'auto' }}>
              <h3 style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Rapport d'activité 2025</h3>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0', opacity: 0.9 }}>Programme d'activité 2026</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0', opacity: 0.85 }}>Soumis à la 33e</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 16px 0', opacity: 0.85 }}>Session du Conseil</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 16px 0', opacity: 0.85 }}>d'administration de l'OSS</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: '0 0 20px 0', opacity: 0.75 }}>Le Caire, 27 avril 2026</p>
              <button style={{ padding: '12px 28px', borderRadius: '50px', border: 'none', backgroundColor: '#cea546', color: '#000000', fontSize: '16px', fontWeight: 500, cursor: 'pointer' }}>Consulter</button>
              </div>
            </div>
          </div>
          {/* Right - Vidéos */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '34px', fontWeight: 400, color: '#49645d', margin: '0 0 30px 0', textAlign: 'center' }}>Nos Vidéos</h2>
            <div style={{ width: '100%', backgroundColor: '#49645d', flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', padding: '40px' }}>
              <div style={{ flexShrink: 0, marginRight: '30px' }}>
                <img src="/video-cover.png" alt="NB-ITTAS" style={{ width: '500px', height: 'auto' }} />
              </div>
              <div style={{ alignSelf: 'flex-end', maxWidth: '500px', marginLeft: 'auto', marginBottom:'60px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Vidéo de</h3>
                <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0', opacity: 0.9 }}>présentation</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0', opacity: 0.85 }}>du Projet</p>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: '0 0 20px 0', opacity: 0.85 }}>NB-ITTAS</p>
                <button style={{ padding: '12px 28px', borderRadius: '50px', border: 'none', backgroundColor: '#cea546', color: '#000000', fontSize: '16px', fontWeight: 500, cursor: 'pointer' }}>Visionner la vidéo</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Partners items={partners} />
      <Contact />
    </>
  );
}
