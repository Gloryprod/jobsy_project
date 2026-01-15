'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRightCircle, Users, Building2 } from 'lucide-react';

export default function About() {
  return (
    <section className="bg-[#FAF9F0] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Titre principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#000080] leading-tight">
            Au Bénin,<br />
            <span className="text-[#F0E68C]">un diplôme ne suffit plus.</span>
          </h2>
          <p className="mt-6 text-xl text-gray-800 max-w-4xl mx-auto">
            7 jeunes diplômés sur 10 sont au chômage ou sous-employés.<br />
          </p>
        </motion.div>

        {/* Les 3 vrais problèmes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: AlertTriangle,
              title: "Pas d’expérience = pas d’emploi",
              desc: "Les entreprises veulent de l’expérience… mais personne ne te donne ta première chance.",
              color: "text-red-600",
            },
            {
              icon: Building2,
              title: "Les entreprises ne vous voient pas",
              desc: "Ton CV est perdu parmi des milliers. Les recruteurs locaux ne savent même pas que tu existes.",
              color: "text-orange-600",
            },
            {
              icon: Users,
              title: "Les formations ne servent à rien",
              desc: "Tu as suivi des cours théoriques pendant des années… mais ça n’intéresse personne sur le marché.",
              color: "text-purple-600",
            },
          ].map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-l-8 border-red-100"
            >
              <problem.icon className={`w-12 h-12 ${problem.color} mb-4`} strokeWidth={2.5} />
              <h3 className="text-xl font-bold text-[#000080] mb-3">{problem.title}</h3>
              <p className="text-gray-700 leading-relaxed">{problem.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* La solution Jobsy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-[#000080] text-white rounded-3xl p-10 md:p-16 text-center shadow-2xl"
        >
          <ArrowRightCircle className="w-16 h-16 mx-auto text-[#F0E68C] mb-6" strokeWidth={3} />

          <h3 className="text-3xl md:text-4xl font-black mb-6">
            Jobsy, c’est la passerelle qui manquait.
          </h3>

          <p className="text-xl md:text-2xl leading-relaxed max-w-5xl mx-auto text-[#F0E68C] font-medium">
            On te donne ta <span className="underline">première expérience rémunérée</span>,<br />
            on te forme sur les compétences que les entreprises veulent vraiment,<br />
            et on te met <span className="underline">directement en face des recruteurs locaux</span>.
          </p>

          <p className="mt-10 text-2xl font-bold text-white">
            Résultat ? <span className="text-[#F0E68C]">92 % des inscrits gagnent leur premier salaire en moins de 7 jours.</span>
          </p>
        </motion.div>

        {/* Tagline finale */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="text-center mt-16"
        >
          <p className="text-2xl md:text-3xl font-black text-[#000080]">
            Jobsy, c’est le Bénin qui donne sa chance à ses jeunes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}