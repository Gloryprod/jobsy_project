import Header from '@/components/Home/layout/Header';
import Hero from '@/components/Home/sections/Hero';
import Features from '@/components/Home/sections/Features';
import About from '@/components/Home/sections/About';
import How from '@/components/Home/sections/How';
import Companies  from '@/components/Home/sections/Companies';
import Testimonials from '@/components/Home/sections/Testimonial';
import Footer from '@/components/Home/layout/Footer';

export default function HomePage() {
  return (
    <>
      {/* Header fixe */}
      <Header />

      {/* Toutes les sections dans l’ordre parfait */}
      <Hero />
      <Features />
      <How />
      <About />
      <Companies />
      <Testimonials />
      <Footer />
    </>
  );
}