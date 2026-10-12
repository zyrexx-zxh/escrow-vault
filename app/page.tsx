import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Directory from '@/components/Directory';
import Footer from '@/components/Footer';
import SceneLoader from '@/components/SceneLoader';
import ScrollDriver from '@/components/ScrollDriver';

export default function Page() {
  return (
    <>
      {/* Fixed full-screen 3D canvas lives behind everything */}
      <SceneLoader />
      {/* Writes page scroll progress (GSAP ScrollTrigger) for the camera rig */}
      <ScrollDriver />

      <Nav />

      <div className="relative z-10">
        <main>
          <Hero />
          <HowItWorks />
          <Directory />
        </main>
        <Footer />
      </div>
    </>
  );
}
