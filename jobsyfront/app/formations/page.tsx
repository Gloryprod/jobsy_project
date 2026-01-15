import Header from '@/components/Home/layout/Header';
import Footer from '@/components/Home/layout/Footer';
import { MotionButton } from '@/components/ui/MotionButton';
import { CheckCircle, Clock, Award, Briefcase, Play, Search } from 'lucide-react';

const formations = [
  { id: 1, title: "Excel – Niveau intermédiaire", durée: "8 modules · 12 min", niveau: "Intermédiaire", étudiants: "1 280", badge: "Certificat Excel Pro" },
  { id: 2, title: "Techniques de vente & négociation", durée: "6 modules · 10 min", niveau: "Débutant", étudiants: "2 140", badge: "Certificat Commercial" },
  { id: 3, title: "Anglais professionnel (niveau B1)", durée: "15 modules · 15 min", niveau: "Débutant → Intermédiaire", étudiants: "980", badge: "Certificat Anglais Pro" },
  { id: 4, title: "Marketing digital & réseaux sociaux", durée: "10 modules · 14 min", niveau: "Débutant", étudiants: "1 670", badge: "Certificat Community Manager" },
  { id: 5, title: "Gestion de projet simple", durée: "7 modules · 11 min", niveau: "Débutant", étudiants: "890", badge: "Certificat Chef de projet junior" },
  { id: 6, title: "Service client & relation client", durée: "5 modules · 9 min", niveau: "Tous niveaux", étudiants: "2 400", badge: "Certificat Agent clientèle" },
];

export default function FormationsPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-[#FAF9F0] pt-32 pb-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black text-[#000080] mb-6">
            Formations gratuites<br />
            <span className="text-[#F0E68C]">+ Certificat officiel valorisé CV</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
              <input
                type="text"
                placeholder="Excel, vente, anglais, marketing..."
                className="pl-12 pr-6 py-4 w-full sm:w-96 rounded-full border border-gray-300 focus:border-[#000080] focus:outline-none text-lg"
              />
            </div>
            <MotionButton variant="primary" className="px-10">
              Voir toutes les formations
            </MotionButton>
          </div>
        </div>
      </section>

      {/* CV Boost Formations */}
      <section className="bg-[#000080] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Award className="w-12 h-12 text-[#F0E68C]" />
            <h2 className="text-3xl md:text-5xl font-black">
              Un certificat = une compétence prouvée sur ton CV
            </h2>
            <Award className="w-12 h-12 text-[#F0E68C]" />
          </div>

          <p className="text-xl md:text-2xl max-w-5xl mx-auto mb-12 opacity-90">
            Tous nos certificats sont délivrés avec le logo Jobsy + ton nom + date.<br />
            Ils sont vérifiés et reconnus par plus de <span className="text-[#F0E68C] font-bold">380 entreprises partenaires</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto items-center">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-left">
              <p className="text-[#F0E68C] font-bold text-lg mb-4">Sur ton CV → tu écris :</p>
              <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-3"><CheckCircle className="w-6 h-6 text-[#F0E68C]" /> Certificat Excel Pro – Jobsy (2025)</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-6 h-6 text-[#F0E68C]" /> Certificat Techniques de vente – Jobsy (2025)</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-6 h-6 text-[#F0E68C]" /> Certificat Anglais professionnel B1 – Jobsy (2025)</li>
              </ul>
            </div>

            <div className="bg-[#F0E68C] text-[#000080] rounded-3xl p-10 shadow-2xl">
              <Briefcase className="w-16 h-16 mx-auto mb-4" />
              <p className="text-3xl font-black text-center">
                Les recruteurs<br />préfèrent les candidats<br />avec certificats Jobsy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des formations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formations.map((formation) => (
              <div
                key={formation.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-[#000080]/20 transition-all duration-300 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-[#000080]/10 to-[#F0E68C]/10 relative flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#F0E68C] rounded-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-[#000080] ml-2" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#000080] mb-2">{formation.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formation.durée}</span>
                    <span>{formation.niveau}</span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600">{formation.étudiants} étudiants</p>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">GRATUIT</span>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">À la fin tu reçois :</p>
                    <div className="bg-[#000080] text-[#F0E68C] px-4 py-2 rounded-full font-bold inline-flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      {formation.badge}
                    </div>
                  </div>

                  <MotionButton variant="primary" className="w-full mt-6">
                    Commencer la formation →
                  </MotionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[#000080] text-white py-20 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            15 minutes par jour = un meilleur CV demain
          </h2>
          <MotionButton
            variant="primary"
            className="text-xl px-12 py-6 bg-[#F0E68C] text-[#000080] hover:bg-white font-bold"
          >
            Commencer ma première formation gratuite
          </MotionButton>
        </div>
      </section>

      <Footer />
    </>
  );
}