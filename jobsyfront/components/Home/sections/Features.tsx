// components/sections/Features.tsx
'use client';

import { motion } from 'framer-motion';
import { Banknote, GraduationCap, Briefcase, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Banknote,
    title: "Gagne de l’argent dès aujourd’hui",
    desc: "Missions simples payées le jour même (livraison, enquête, aide administrative…)",
    color: "text-[#F0E68C]",
    bg: "bg-[#000080]/10",
  },
  {
    icon: GraduationCap,
    title: "Formations certifiantes gratuites",
    desc: "Mini-cours de 5 à 15 min (Excel, vente, anglais, digital…) avec certificat à la clé",
    color: "text-[#F0E68C]",
    bg: "bg-[#000080]/10",
  },
  {
    icon: Briefcase,
    title: "Sois recruté par les entreprises locales",
    desc: "Ton profil + réputation + certificats = visible par tous les recruteurs du Bénin",
    color: "text-[#F0E68C]",
    bg: "bg-[#000080]/10",
  },
];

export default function Features() {
  return (
    <section className="bg-white lg:bg-[#FAF9F0] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000080]">
            Comment Jobsy change ta vie en 3 étapes
          </h2>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Juste des résultats concrets.
          </p>
        </motion.div>

        {/* Cartes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.7 }}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 
                         border border-gray-100 hover:border-[#000080]/20"
            >
              {/* Numéro discret */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#000080] text-[#F0E68C] rounded-full flex items-center justify-center font-black text-2xl shadow-xl">
                {index + 1}
              </div>

              {/* Icône */}
              <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                <feature.icon className={`w-9 h-9 ${feature.color}`} strokeWidth={2.5} />
              </div>

              {/* Texte */}
              <h3 className="text-xl md:text-2xl font-bold text-[#000080] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {feature.desc}
              </p>

              {/* Petit check en bas */}
              <div className="mt-6 flex items-center gap-2 text-[#000080] font-semibold">
                <CheckCircle className="w-5 h-5 text-[#F0E68C]" />
                <span className="text-sm">Résultat garanti</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badge confiance en bas */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-700">
            Plus de <span className="text-3xl font-black text-[#F0E68C]">92 %</span> des utilisateurs ont trouvé leur première mission en moins de 7 jours
          </p>
        </motion.div>
      </div>
    </section>
  );
}