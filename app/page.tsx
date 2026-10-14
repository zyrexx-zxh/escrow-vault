import Directory from '@/components/Directory';
import Finale from '@/components/Finale';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Loader from '@/components/Loader';
import Nav from '@/components/Nav';
import Ribbon from '@/components/Ribbon';
import Safety from '@/components/Safety';
import ScrollFX from '@/components/ScrollFX';

export default function Page() {
  return (
    <>
      <Loader />
      <ScrollFX />
      <a href="#directory" className="skip">
        Skip to the directory
      </a>
      <Nav />

      {/* The page sits above a fixed footer and scrolls away to reveal it. */}
      <div className="page">
        <main id="top">
          <Hero />
          <Ribbon />
          <Directory />
          <HowItWorks />
          <Safety />
          <Finale />
        </main>
      </div>

      <Footer />
    </>
  );
}
