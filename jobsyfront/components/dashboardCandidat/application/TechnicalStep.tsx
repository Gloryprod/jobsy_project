import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Question {
  id: number;
  label: string;
  context_hint: string;
}

interface Props {
  questions: Question[];
  onSubmit: (answers: Record<number, string>) => void;
}

const TechnicalFlashStep: React.FC<Props> = ({ questions, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestionId = questions[currentIndex].id;
  const isLastStep = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleInputChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionId]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Barre de progression discrète */}
      <div className="mb-12 space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Défi Technique {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs font-mono font-bold text-[#000080]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#000080]"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Question */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">
              {questions[currentIndex].label}
            </h2>
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
              <Zap size={18} className="text-amber-500 shrink-0 mt-1" />
              <p className="text-sm text-amber-800/80 italic">
                {questions[currentIndex].context_hint}
              </p>
            </div>
          </div>

          {/* Input léger au lieu du textarea */}
          <div className="relative">
            <input
            type="text"
            autoFocus
            value={answers[currentQuestionId] || ""} 
            onChange={(e) => handleInputChange(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && answers[currentQuestionId]?.trim()) {
                isLastStep ? onSubmit(answers) : setCurrentIndex(prev => prev + 1);
              }
            }}
            className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl focus:border-[#000080] outline-none transition-all"
            placeholder="Votre réponse..."
          />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between">
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          className={`text-slate-400 font-bold text-sm hover:text-slate-600 ${currentIndex === 0 ? 'invisible' : 'visible'}`}
        >
          Retour
        </button>

        <button
          onClick={() => isLastStep ? onSubmit(answers) : setCurrentIndex(prev => prev + 1)}
          disabled={!(answers[currentQuestionId]?.trim())}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${
            answers[currentQuestionId]?.trim() 
            ? 'bg-[#000080] text-white shadow-lg shadow-blue-900/20' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLastStep ? 'Terminer l\'entretien' : 'Question suivante'}
          {isLastStep ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default TechnicalFlashStep;