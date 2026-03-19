import React from 'react';
import { ShieldCheck, Cpu, Timer, AlertCircle } from 'lucide-react';

type Mission = {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string; 
  deadline: string;
  description: string;
  skills: string[]; 
  urgency: 'normal' | 'urgent' | 'premium';
  category: string;
  applicants: number;
  type_contrat: 'CDI' | 'CDD' | 'Mission Ponctuelle';
  active: boolean;
}

interface IntroStepProps {
    mission?: Mission;
    onStart: () => void;  
}

const IntroStep = ({ mission, onStart } : IntroStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Badge IA */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#000080]/5 rounded-full border border-[#000080]/10">
          <Cpu size={16} className="text-[#000080]" />
          <span className="text-xs font-bold text-[#000080] uppercase tracking-tighter">
            Évaluation assistée par IA
          </span>
        </div>
      </div>

      {/* Titre et Message */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          Bienvenue, <span className="text-[#000080]">Prêt ?</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
          Vous allez postuler pour la mission <span className="font-bold text-slate-700">{mission?.title}</span> chez <span className="font-bold text-slate-700">{mission?.company}</span> <br />
          Vous serez guidé à travers une série de questions pour évaluer vos compétences et votre adéquation à la mission. 
        </p>
      </div>

      {/* Rappel des règles (Version épurée pour la page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <Timer className="text-[#8B8000]" size={24} />
          <h3 className="font-bold text-slate-800">5 à 10 minutes</h3>
          <p className="text-sm text-slate-500">Réponses courtes et précises attendues.</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <ShieldCheck className="text-green-500" size={24} />
          <h3 className="font-bold text-slate-800">Intégrité</h3>
          <p className="text-sm text-slate-500">L&apos;IA détecte la cohérence de vos réponses.</p>
        </div>
      </div>

      {/* Warning Final */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-center">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <p className="text-xs text-amber-700 leading-tight">
          Une fois commencé, vous ne pourrez pas revenir en arrière. Assurez-vous d&apos;avoir une connexion stable.
        </p>
      </div>

      {/* Bouton d'action massif */}
      <button
        onClick={onStart}
        className="w-full py-6 bg-[#000080] text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-[#000060] transition-all hover:scale-[1.01] active:scale-[0.98]"
      >
        DÉMARRER L&apos;ÉVALUATION
      </button>
    </div>
  );
};

export default IntroStep;