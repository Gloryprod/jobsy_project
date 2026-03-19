import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';    
import { BrainCircuit, Sparkles, Database, Search } from 'lucide-react';

// Définition de l'interface pour nos messages de chargement
interface ProcessingMessage {
  text: string;
  icon: React.ReactNode;
}

const messages: ProcessingMessage[] = [
  { text: "Analyse de la pertinence de vos réponses...", icon: <Search size={18} className="text-blue-400" /> },
  { text: "Identification des compétences clés mentionnées...", icon: <Database size={18} className="text-purple-400" /> },
  { text: "Adaptation du niveau de difficulté technique...", icon: <BrainCircuit size={18} className="text-indigo-400" /> },
  { text: "Génération de vos défis personnalisés...", icon: <Sparkles size={18} className="text-yellow-400" /> },
];

const AIProcessing: React.FC = () => {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] w-full bg-white/50 backdrop-blur-sm rounded-[3rem] border border-slate-100 shadow-xl p-12 text-center animate-in fade-in zoom-in duration-500">
      
      {/* Animation du Cœur de l'IA */}
      <div className="relative mb-10">
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#000080] to-indigo-400 blur-2xl absolute -inset-4"
        />
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative bg-white p-8 rounded-full shadow-inner border border-slate-50 flex items-center justify-center"
        >
          <BrainCircuit size={56} className="text-[#000080]" />
        </motion.div>
      </div>

      <div className="space-y-6 max-w-md">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
          L&apos;intelligence Jobsy <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000080] to-indigo-500">
            analyse votre profil
          </span>
        </h3>
        
        {/* Conteneur des messages avec hauteur fixe pour éviter les sauts de layout */}
        <div className="h-10 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 text-slate-500 font-semibold text-lg"
            >
              <span className="p-2 bg-slate-50 rounded-lg">
                {messages[index].icon}
              </span>
              <span>{messages[index].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Barre de progression stylisée */}
        <div className="relative w-full max-w-xs mx-auto h-2 bg-slate-100 rounded-full overflow-hidden mt-8">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#000080] to-transparent rounded-full"
          />
        </div>
      </div>

      <p className="mt-12 text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">
        Neural Processing Engine v3.0
      </p>
    </div>
  );
};

export default AIProcessing;