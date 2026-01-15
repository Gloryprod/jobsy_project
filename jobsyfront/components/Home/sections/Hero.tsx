'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MotionButton } from '@/components/ui/MotionButton';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-white">
      {/* ──────── VERSION MOBILE : Image en fond ──────── */}
      <div className="lg:hidden relative min-h-screen flex flex-col justify-center items-center text-center px-5 pt-32 overflow-hidden">
        <Image
          src="/person_learning.jpg"
          alt="Jeunes diplômés béninois prêts à travailler"
          fill
          className="object-cover object-center brightness-[1.25] contrast-[1.1] saturate-[1.2]"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />

        <HeroContent />   {/* ← même contenu réutilisé */}
      </div>

      {/* ──────── VERSION DESKTOP : Image à gauche, texte à droite ──────── */}
      <div className="hidden lg:block py-24 xl:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
            {/* Image à gauche */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/person_learning.jpg"
                  alt="Jeunes diplômés béninois qui réussissent grâce à Jobsy"
                  width={900}
                  height={800}
                  className="w-full h-auto object-cover 
                             brightness-[1.2] contrast-[1.1] saturate-[1.15]
                             hover:brightness-125 transition-all duration-500"
                  priority
                />
                <div className="absolute bottom-6 left-6 bg-[#000080]/90 text-[#F0E68C] px-5 py-3 rounded-full font-bold shadow-lg">
                  +2 400 jeunes actifs
                </div>
              </div>
            </motion.div>

            {/* Texte à droite */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="text-left"
            >
              <HeroContent />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <div className="relative z-10 max-w-4xl mx-auto lg:mx-0">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-2xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black leading-tight 
                   text-white lg:text-[#000080] drop-shadow-xl lg:drop-shadow-none"
      >
        Diplômé<br />
        <span className="text-[#F0E68C] md:text-[#000080] lg:text-[#000080] sm:text-[#000080] "> mais toujours sans emploi ?</span>
      </motion.h1>

      {/* <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-6 text-lg sm:text-xl text-white/95 lg:text-gray-800 font-medium drop-shadow-md lg:drop-shadow-none"
      >
        Jobsy change ça. Maintenant.
      </motion.p> */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-base sm:text-lg text-white/90 lg:text-gray-700 max-w-xl leading-relaxed"
      >
        Missions payées • Formations certifiantes gratuites • Profil vu par toutes les entreprises locales
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
      >
        <Link href="/register/candidats">
          <MotionButton
            variant="primary"
            className="text-base sm:text-lg px-8 py-4 font-bold bg-[#F0E68C] text-[#000080] hover:bg-white shadow-xl cursor-pointer"
          >
            Je commence aujourd’hui
          </MotionButton>
        </Link>
        
        <Link href="/register/entreprises">
          <MotionButton
            variant="secondary"
            className="text-base sm:text-lg px-8 py-4 font-medium border-2 border-white lg:border-[#000080] text-white lg:text-[#000080] 
                      hover:bg-white/10 lg:hover:bg-[#000080] lg:hover:text-[#F0E68C] cursor-pointer"
          >
            Je suis une entreprise
          </MotionButton>
        </Link>
        
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="mt-10 text-sm sm:text-base text-white/80 lg:text-gray-600"
      >
        Déjà <span className="text-[#F0E68C] font-bold">2 400+ jeunes</span> ont gagné leur premier salaire sur Jobsy
      </motion.p>
    </div>
  );
}