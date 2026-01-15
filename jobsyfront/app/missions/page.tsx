import Header from '@/components/Home/layout/Header';
import Footer from '@/components/Home/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { MotionButton } from '@/components/ui/MotionButton';
import { Zap, Clock, Banknote, MapPin, Filter, Search } from 'lucide-react';

const missions = [
  { id: 1, title: "Livraison colis à Cotonou", entreprise: "Jumia Bénin", prix: "8 000 FCFA", durée: "2h", lieu: "Cotonou", type: "Livraison" },
  { id: 2, title: "Enquête de satisfaction clientèle", entreprise: "MTN Bénin", prix: "15 000 FCFA", durée: "3h", lieu: "Cotonou / Porto-Novo", type: "Terrain" },
  { id: 3, title: "Saisie de données Excel", entreprise: "Cabinet Comptable Fidjrossè", prix: "12 000 FCFA", durée: "4h", lieu: "À domicile", type: "Digital" },
  { id: 4, title: "Aide vente boutique Ganhi", entreprise: "Boutique Mode & Style", prix: "10 000 FCFA", durée: "5h", lieu: "Cotonou", type: "Commerce" },
  { id: 5, title: "Distribution flyers Dantokpa", entreprise: "Moov Africa", prix: "9 000 FCFA", durée: "3h", lieu: "Cotonou", type: "Marketing" },
  { id: 6, title: "Photographie événementielle", entreprise: "Agence Événementiel", prix: "25 000 FCFA", durée: "4h", lieu: "Cotonou", type: "Créatif" },
];

export default function MicroMissionsPage() {
  return (
    <>
      <Header />

      {/* Hero de la page */}
      <section className="bg-[#FAF9F0] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#000080] mb-6">
            Micro-missions rémunérées<br />
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 max-w-4xl mx-auto">
            Réalises une mission et rends ton profil crédible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher une mission (livraison, saisie, enquête...)"
                className="pl-12 pr-6 py-4 w-full sm:w-96 rounded-full border border-gray-300 focus:border-[#000080] focus:outline-none text-lg"
              />
            </div>
            <MotionButton variant="primary" className="px-10">
              <Filter className="w-5 h-5 mr-2" /> Filtrer
            </MotionButton>
          </div>
        </div>
      </section>

      {/* Stats rapides */}
      <section className="bg-[#000080] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">+680</p>
            <p className="text-lg">Missions disponibles</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">92%</p>
            <p className="text-lg">Payées en 24h</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">2 400+</p>
            <p className="text-lg">Jeunes actifs</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">380+</p>
            <p className="text-lg">Entreprises</p>
          </div>
        </div>
      </section>

      {/* Liste des missions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-[#000080]/20 transition-all duration-300 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 border-2 border-dashed rounded-t-3xl relative">
                  {/* Image placeholder – remplace par vraie photo plus tard */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Zap className="w-16 h-16" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#000080] mb-2">{mission.title}</h3>
                  <p className="text-gray-600 mb-4">{mission.entreprise}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {mission.durée}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {mission.lieu}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black text-[#000080]">{mission.prix}</p>
                      <p className="text-sm text-gray-600">Payé le jour même</p>
                    </div>
                    <MotionButton variant="primary">
                      Postuler
                    </MotionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <MotionButton variant="primary"  className="px-12 py-6 text-xl">
              Voir plus de missions →
            </MotionButton>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#000080] text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Prêt à gagner ton premier salaire dès aujourd’hui ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <MotionButton variant="primary" className="text-xl px-12 py-6 bg-[#F0E68C] text-[#000080] hover:bg-white">
              Inscription gratuite → 2 minutes
            </MotionButton>
            <MotionButton variant="secondary" className="text-xl px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-[#000080]">
              Voir toutes les missions
            </MotionButton>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}