import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Clock, ArrowRight } from 'lucide-react';

interface Props {
  missionTitle: string;
}

const CompletionStep: React.FC<Props> = ({ missionTitle }) => {
  return (
    <div className="w-full mx-auto text-center py-12 px-6">
      {/* Animation du cercle de validation */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <CheckCircle2 size={48} className="text-emerald-500" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-black text-slate-800 mb-4">
          Évaluation terminée !
        </h2>
        <p className="text-slate-500 text-lg mb-10 leading-relaxed">
          Merci d&apos;avoir complété votre candidature pour la mission <br/>
          <span className="font-bold text-slate-700 italic">&quot;{missionTitle}&quot;</span>.
        </p>
      </motion.div>

      {/* Timeline de ce qui va se passer ensuite */}
      <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6 text-left mb-10">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
            <Send size={18} className="text-[#000080]" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Candidature envoyée</h4>
            <p className="text-sm text-slate-500">Vos réponses ont été analysées et transmises au recruteur.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
            <Clock size={18} className="text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Délai de réponse</h4>
            <p className="text-sm text-slate-500">Vous recevrez un retour par e-mail sous 48h à 72h ouvrées.</p>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.location.href = '/dashboard/candidats/missions'}
        className="inline-flex items-center gap-2 px-10 py-4 bg-[#000080] text-white rounded-2xl font-black shadow-lg shadow-blue-900/20"
      >
        Retour aux missions
        <ArrowRight size={20} />
      </motion.button>
    </div>
  );
};

export default CompletionStep;