// components/sections/HowItWorks.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, SearchCheck, Wallet, Trophy } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Inscription en 30 secondes",
    desc: "Télécharge l’app ou inscris-toi sur le site avec ton numéro ou email.",
    color: "from-[#000080] to-[#000080]/80",
  },
  {
    number: "02",
    icon: SearchCheck,
    title: "Choisis ta mission ou ta formation",
    desc: "Livraison, enquête terrain, saisie, aide boutique… ou mini-formation gratuite (Excel, vente, anglais…)",
    color: "from-[#000080] to-[#000080]/80",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Tu es payé le jour même",
    desc: "Dès validation de la mission → virement Mobile Money instantané (MTN, Moov, Flooz).",
    color: "from-[#F0E68C] to-[#e0d67a]",
    textDark: true,
  },
  {
    number: "04",
    icon: Trophy,
    title: "Tu deviens visible",
    desc: "Ton profil monte dans le classement → les entreprises te contactent directement pour des jobs durables.",
    color: "from-[#000080] to-[#000080]/80",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#000080] text-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-xl text-[#F0E68C] font-medium">
            4 étapes simples → premier salaire en moins de 24 h
          </p>
        </motion.div>

        {/* Étapes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.7 }}
              className="group relative"
            >
              {/* Carte */}
              <div className={`relative bg-gradient-to-br ${step.color} rounded-3xl p-8 text-center shadow-2xl 
                              hover:scale-105 hover:shadow-[#F0E68C]/30 transition-all duration-300`}>
                
                {/* Numéro gros en fond */}
                <div className="absolute -top-6 -right-6 text-9xl font-black opacity-10">
                  {step.number}
                </div>

                {/* Icône */}
                <div className={`w-20 h-20 mx-auto rounded-full ${
                  step.textDark ? 'bg-[#000080] text-[#F0E68C]' : 'bg-[#F0E68C] text-[#000080]'
                } flex items-center justify-center shadow-xl`}>
                  <step.icon className="w-12 h-12" strokeWidth={2.5} />
                </div>

                <h3 className={`mt-6 text-xl md:text-2xl font-bold ${step.textDark ? 'text-[#000080]' : 'text-white'}`}>
                  {step.title}
                </h3>

                <p className={`mt-4 text-sm md:text-base leading-relaxed ${step.textDark ? 'text-[#000080]/90' : 'text-white/90'}`}>
                  {step.desc}
                </p>

                {/* Flèche entre les cartes (sauf dernière) */}
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-10 w-12 h-12 text-[#F0E68C] opacity-60 -translate-y-1/2" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA final centré */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-2xl md:text-3xl font-bold text-[#F0E68C] mb-6">
            Prêt à gagner ton premier salaire dès demain ?
          </p>
          <button className="bg-[#F0E68C] text-[#000080] font-bold text-lg px-10 py-5 rounded-full shadow-2xl hover:bg-white transition transform hover:scale-105">
            Commencer maintenant – C’est gratuit
          </button>
        </motion.div>
      </div>
    </section>
  );
}