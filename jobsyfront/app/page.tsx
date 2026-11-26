import Header from "@/components/Home/layout/Header";
import Footer from "@/components/Home/layout/Footer";
import { Accueil } from "@/components/accueil/Accueil";

// L'accueil public, refait au lot 6b de la refonte : voir components/accueil
export default function HomePage() {
  return (
    <>
      <Header />
      <Accueil />
      <Footer />
    </>
  );
}
