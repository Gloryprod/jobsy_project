// app/entreprises/page.tsx
import Header from '@/components/Home/layout/Header';
import Footer from '@/components/Home/layout/Footer';
import { MotionButton } from '@/components/ui/MotionButton';
import { CheckCircle, Clock, Users, Building2, Shield, TrendingUp, MessageSquare, PhoneCall } from 'lucide-react';

export default function EntreprisesPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-[#000080] text-white pt-32 pb-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black mb-8">
            Trouvez la bonne personne<br />
            <span className="text-[#F0E68C]">en moins de 24h</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 opacity-90">
            Pas de CV vide, pas d’attente. Des jeunes diplômés motivés, formés, vérifiés et disponibles immédiatement à Cotonou, Porto-Novo, Parakou…
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <MotionButton
              variant="primary"
              className="text-xl px-12 py-6 bg-[#F0E68C] text-[#000080] hover:bg-white font-bold shadow-2xl"
            >
              Poster ma première mission (gratuit)
            </MotionButton>
            <MotionButton
              variant="secondary"
              className="text-xl px-12 py-6 border-2 border-white hover:bg-white hover:text-[#000080]"
            >
              Voir les profils disponibles
            </MotionButton>
          </div>
        </div>
      </section>

      {/* Stats confiance */}
      <section className="bg-white py-16 border-b">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-5xl font-black text-[#F0E68C]">380+</p>
            <p className="text-lg text-gray-700">Entreprises partenaires</p>
          </div>
          <div>
            <p className="text-5xl font-black text-[#F0E68C]">2 400+</p>
            <p className="text-lg text-gray-700">Jeunes actifs</p>
          </div>
          <div>
            <p className="text-5xl font-black text-[#F0E68C]">92%</p>
            <p className="text-lg text-gray-700">Missions réalisées &lt;48h</p>
          </div>
          <div>
            <p className="text-5xl font-black text-[#F0E68C]">4.8/5</p>
            <p className="text-lg text-gray-700">Note moyenne</p>
          </div>
        </div>
      </section>

      {/* Avantages entreprises */}
      <section className="py-20 bg-[#FAF9F0]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-4xl md:text-5xl font-black text-[#000080] mb-16">
            Pourquoi les entreprises béninoises choisissent Jobsy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Clock, title: "Réponse immédiate", desc: "Recevez 5 à 20 candidatures en moins de 2 heures" },
              { icon: Users, title: "Jeunes formés & motivés", desc: "Accès à des profils avec certificats Jobsy (Excel, vente, anglais…)" },
              { icon: Shield, title: "Zéro risque", desc: "Paiement seulement si la mission est validée à 100%" },
              { icon: Building2, title: "Flexibilité totale", desc: "Besoin ponctuel ou récurrent ? On s’adapte à votre rythme" },
              { icon: TrendingUp, title: "Recrutement futur", desc: "Repérez les meilleurs talents et proposez-leur un CDI directement" },
              { icon: MessageSquare, title: "Support local", desc: "Équipe à Cotonou disponible par téléphone ou WhatsApp" },
            ].map((avantage, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-xl text-center hover:shadow-2xl transition">
                <div className="w-16 h-16 bg-[#F0E68C] rounded-full flex items-center justify-center mx-auto mb-6">
                  <avantage.icon className="w-9 h-9 text-[#000080]" />
                </div>
                <h3 className="text-xl font-bold text-[#000080] mb-3">{avantage.title}</h3>
                <p className="text-gray-700">{avantage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages entreprises */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-4xl md:text-5xl font-black text-[#000080] mb-16">
            Ils nous font confiance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { entreprise: "MTN Bénin", poste: "Responsable Marketing", text: "Nous avons trouvé 12 agents terrain en 24h pour notre campagne MoMo. Mission réussie à 100%." },
              { entreprise: "Jumia Bénin", poste: "Operations Manager", text: "Jobsy nous a sauvé pendant le Black Friday. 40 livreurs disponibles le jour même." },
              { entreprise: "Sobebra", poste: "DRH", text: "On a recruté 8 commerciaux en CDI après les avoir testés via des missions Jobsy." },
            ].map((t, i) => (
              <div key={i} className="bg-[#FAF9F0] rounded-3xl p-8 border border-[#000080]/10">
                <p className="text-lg italic text-gray-800 mb-6">“{t.text}”</p>
                <p className="font-bold text-[#000080]">{t.entreprise}</p>
                <p className="text-sm text-gray-600">{t.poste}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs transparents */}
      <section className="bg-[#000080] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Tarifs simples & transparents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-10 border border-[#F0E68C]/30">
              <p className="text-5xl font-black text-[#F0E68C]">0 FCFA</p>
              <p className="text-2xl mt-4">Inscription & publication</p>
            </div>
            <div className="bg-[#F0E68C] text-[#000080] rounded-3xl p-10 shadow-2xl scale-105">
              <p className="text-5xl font-black">10%</p>
              <p className="text-2xl mt-4">Commission seulement si mission validée</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-3xl p-10 border border-[#F0E68C]/30">
              <p className="text-5xl font-black text-[#F0E68C]">Gratuit</p>
              <p className="text-2xl mt-4">Recrutement CDI depuis la plateforme</p>
            </div>
          </div>

          <MotionButton
            variant="primary"
            className="mt-12 text-xl px-16 py-8 bg-[#F0E68C] text-[#000080] hover:bg-white font-bold"
          >
            Créer mon compte entreprise → gratuit
          </MotionButton>
        </div>
      </section>

      {/* CTA Contact direct */}
      <section className="bg-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-[#000080] mb-8">
            Besoin d’une solution sur mesure ?
          </h2>
          <p className="text-2xl text-gray-700 mb-10">
            Appelez-nous directement : <span className="text-[#000080] font-bold">+229 67 00 00 00</span><br />
            ou WhatsApp : <span className="text-[#000080] font-bold">+229 97 00 00 00</span>
          </p>
          <MotionButton variant="primary" className="text-xl px-12 py-6">
            <PhoneCall className="w-6 h-6 mr-3" />
            Être rappelé en 5 minutes
          </MotionButton>
        </div>
      </section>

      <Footer />
    </>
  );
}