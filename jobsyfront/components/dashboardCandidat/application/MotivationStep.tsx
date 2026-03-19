import React, { useState } from 'react';
import { Lightbulb, MessageSquareQuote, ArrowRight } from 'lucide-react';

interface Question {
  id : number,
  label : string,
  context_hint : string
}

interface QuestionsProps{ 
  candidatRank? : string,
  initialAnswers? : Record<number, string>,      
  questions : Question[],
  onSubmit : (answers: Record<number, string>) => void;
} 

const MotivationStep = ({ questions, onSubmit, initialAnswers, candidatRank } : QuestionsProps) => {
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers || {});

  const handleInputChange = (id : number, value : string) => {
    setAnswers({ ...answers, [id]: value });
  };

  const isComplete = questions.every((q : Question) => answers[q.id]?.trim().length > 10);

  return (
    <div className="max-w-full mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-slate-800">Étape 1 : Motivation</h2>
        <p className="text-slate-500 font-medium">L&apos;IA analyse votre sérieux et votre compréhension du poste.</p>
      </div>

      <div className="space-y-12">
        {questions.map((question, index) => (
          <div key={question.id} className="group space-y-4">
            {/* Numérotation et Question */}
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#000080] text-white rounded-full font-bold text-sm">
                {index + 1}
              </span>
              <label className="text-xl font-bold text-slate-700 leading-snug">
                {question.label}
              </label>
            </div>

            {/* Champ de réponse */}
            <div className="relative">
              <textarea
                rows={3}
                className="w-full p-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-[#000080] focus:ring-0 transition-all outline-none text-slate-600 placeholder:text-slate-300 shadow-sm"
                placeholder="Votre réponse ici..."
                value={answers[question.id] || ""}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
              />
              
              <div className="mt-3 flex items-start gap-2 px-4 py-3 bg-[#F0E68C]/20 border border-[#F0E68C]/30 rounded-2xl">
                <Lightbulb className="w-4 h-4 text-[#8B8000] mt-0.5 shrink-0" />
                <p className="text-sm text-[#8B8000] italic leading-tight">
                  <span className="font-bold uppercase text-[10px] mr-1">Conseil de l&apos;IA :</span>
                  {question.context_hint}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton de validation */}
      <div className="pt-6">
        <button
          onClick={() => onSubmit(answers)}
          disabled={!isComplete}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl 
            ${isComplete 
              ? 'bg-[#000080] text-white hover:bg-[#000060] active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`} 
        >
          {candidatRank == "E" || candidatRank == "D" ? 'TERMINER' : 'VALIDER MES RÉPONSES'}
          <ArrowRight size={22} />
        </button>

        {!isComplete && (
          <p className="text-center mt-4 text-xs text-slate-400 font-medium italic">
            Veuillez répondre à toutes les questions avec au moins 10 caractères.
          </p>
        )}
      </div>
    </div>
  );
};

export default MotivationStep;