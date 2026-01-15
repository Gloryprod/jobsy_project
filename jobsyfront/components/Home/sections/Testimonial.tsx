'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Aïcha S.",
    role: "Diplômée en Gestion 2024",
    text: "J’ai gagné 28 000 FCFA en 4 jours avec des livraisons. Aujourd’hui j’ai un CDI chez Sobebra grâce à mon profil Jobsy !",
    amount: "28 000 FCFA en 4 jours",
    rating: 5,
  },
  {
    name: "Roméo D.",
    role: "Licence Informatique",
    text: "La formation Excel gratuite m’a pris 3 jours. Une entreprise m’a recruté directement après avoir vu mon certificat.",
    amount: "CDI trouvé en 11 jours",
    rating: 5,
  },
  {
    name: "Fatou C.",
    role: "BTS Commerce",
    text: "Je cherchais depuis 8 mois… En 5 jours sur Jobsy j’ai fait 3 missions et une boutique m’a proposé un contrat.",
    amount: "Contrat signé en 1 semaine",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white lg:bg-[#FAF9F0] py-20 md:py-28">
      {/* ↑ fond blanc/crème clair → séparation nette avec le footer bleu */}

      <div className="max-w-7xl mx-auto px-6">

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000080]">
            Ils ont changé leur vie avec Jobsy
          </h2>
          <p className="mt-4 text-xl text-gray-700">
            Des vrais jeunes. Des vrais résultats.
          </p>
        </motion.div>

        {/* Cartes témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-[#000080]/20 transition-all duration-300"
            >
              {/* Étoiles */}
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-6 h-6 fill-[#F0E68C] text-[#F0E68C]" />
                ))}
              </div>

              {/* Témoignage */}
              <p className="text-lg text-gray-800 italic mb-6 leading-relaxed">
                “{t.text}”
              </p>

              {/* Badge résultat */}
              <div className="bg-[#F0E68C] text-[#000080] inline-block px-5 py-2.5 rounded-full font-bold text-sm shadow-md">
                {t.amount}
              </div>

              {/* Nom + rôle */}
              <div className="mt-6">
                <p className="font-bold text-[#000080] text-lg">{t.name}</p>
                <p className="text-gray-600 text-sm">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Petit badge confiance en bas */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-2xl font-bold text-[#000080]">
            Plus de <span className="text-[#F0E68C] text-4xl">2 400 jeunes</span> ont déjà trouvé leur voie sur Jobsy
          </p>
        </motion.div>
      </div>
    </section>
  );
}