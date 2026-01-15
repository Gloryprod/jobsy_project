// components/sections/Companies.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const companies = [
  { name: "MTN Bénin", logo: "/logos/mtn.png" },
  { name: "Moov Africa", logo: "/logos/moov.png" },
  { name: "SBEE", logo: "/logos/sbee.png" },
  { name: "La Poste du Bénin", logo: "/logos/poste.png" },
  { name: "Sobebra", logo: "/logos/sobebra.png" },
  { name: "Boulangerie La Baguette", logo: "/logos/baguette.png" },
];

export default function Companies() {
  return (
    <section className="bg-[#FAF9F0] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000080]"
        >
          Ils recrutent déjà sur Jobsy
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-xl text-gray-700"
        >
          + de <span className="text-[#F0E68C] font-black">380 entreprises locales</span> font confiance à Jobsy
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mt-16 items-center">
          {companies.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition"
            >
              <div className="relative h-20 grayscale hover:grayscale-0 transition">
                <Image
                  src={c.logo}
                  alt={c.name}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{c.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}