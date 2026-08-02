import Hero from './components/home/Hero'
import Navbar from './components/shared/Navbar'
import SocialSidebar from './components/shared/SocialSidebar'
import Stats from './components/home/Stats'
import Fields from './components/home/Fields'
import News from './components/home/News'
import Tools from './components/home/Tools'
import Partners from './components/home/Partners'
import Contact from './components/home/Contact'
import Footer from './components/shared/Footer'
import Chatbot from './components/shared/Chatbot'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SocialSidebar />
      <Navbar overlay />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Fields />
        <News />
        <Tools />
        <Partners />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
