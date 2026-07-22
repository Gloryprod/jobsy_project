"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Award, CheckCircle, ShieldCheck, AlertTriangle, Check, Loader2, Lock, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation"

interface Question {
  id: number;
  question_text: string;
  options: string[];
  is_multiple: boolean; // Ex: true ou false
  points: number;
}

interface ExamResponse {
  status: string;
  data: {
    course_title: string;
    questions: Question[];
    can_retry: boolean; // Indique si le candidat peut retenter l'examen en cas d'échec
    time_remaining: number; // Temps restant pour soumettre l'examen
  };
}

interface IntroProps {
  courseId: string;
  courseTitle: string;
  onExamFinished: () => void;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function FinalExamIntro({ courseId, courseTitle, onExamFinished }: IntroProps) {
  // 1. Chargement des questions de l'examen configuré par l'admin
  const { data, isLoading: loadingQuestions, mutate } = useSWR<ExamResponse>(
    `/final-exam-workspace/${courseId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const router = useRouter()

  // 2. États de l'application
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({}); // { questionId: ["Choix 1", "Choix 2"] }
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const questions = data?.data?.questions || [];

  // 3. Gestion de la sélection des réponses (Gère le choix unique ET multiple)
  const handleSelectAnswer = (questionId: number, option: string, isMultiple: boolean) => {
    const currentSelections = selectedAnswers[questionId] || [];

    if (isMultiple) {
      if (currentSelections.includes(option)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: currentSelections.filter((ans) => ans !== option),
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionId]: [...currentSelections, option],
        });
      }
    } else {
      // Choix unique : on écrase avec la nouvelle sélection
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: [option],
      });
    }
  };

  // 4. Soumission de l'examen à Laravel
  const handleSubmitExam = async () => {
    // Vérification : Le candidat a-t-il répondu à toutes les questions ?
    if (Object.keys(selectedAnswers).length < questions.length) {
      return toast.error("Veuillez répondre à toutes les questions avant de valider.");
    }

    setSubmitting(true);
    try {
      // On envoie le dictionnaire de réponses au serveur
      const response = await api.post(`/final-exam/${courseId}/submit`, {
        answers: selectedAnswers,
      });

      if (response.data.data.is_passed) {
        if(response.data.data.score < 100){
            toast.success(`Félicitations ! Vous avez réussi l'examen avec un score de ${response.data.data.score}%. Vous avez débloqué la certification. Vous pouvez retenter le test pour atteindre les 100% plus tard !`);
        }else if(response.data.data.score === 100){
            toast.success("Félicitations ! Vous avez réussi l'examen avec brio. Votre score est de 100% ! Vous avez débloqué la certification avec l'excellence. Votre expertise est désormais certifiée par Jobsy !");
        }
      } else {
        toast.error("Score insuffisant pour décrocher la certification. Vous pouvez reprendre l'examen dans 24h.");
        
        setStarted(false)
      }

      // On rafraîchit le statut global de la formation sur la page parente
      mutate();
      onExamFinished()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Impossible de soumettre l'examen.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (data?.data?.time_remaining) {
        // Avoid synchronous setState inside effect (can trigger cascading renders).
        // Defer the state update to the microtask queue and only update if different.
        Promise.resolve().then(() => {
          setTimeLeft((prev) => prev === data.data.time_remaining ? prev : data.data.time_remaining);
        });
        
    }
  }, [data]);

  // Effet pour faire descendre le chrono chaque seconde
  useEffect(() => {
    if (data?.data?.can_retry || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => {clearInterval(timer)};

  }, [data?.data?.can_retry, timeLeft]);

  // Fonction pour formater les secondes en hh:mm:ss
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    // return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
  };

  const isBlocked = data?.data?.can_retry === false && timeLeft > 0;

  // --- RENDU ÉCRAN 1 : ACCUEIL ET RÈGLES ---
  if (!started) {
    return (
      <div className="min-h-screen flex justify-center p-4">
        <div className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl space-y-8 text-center">
          
          {/* Si bloqué, on change l'icône pour un cadenas */}
          <div className={`inline-flex p-4 rounded-3xl shadow-sm ${isBlocked ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-[#000080]"}`}>
            {isBlocked ? <Lock className="w-10 h-10 stroke-[1.5]" /> : <Award className="w-10 h-10 stroke-[1.5]" />}
          </div>

          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {isBlocked ? "Examen temporairement bloqué" : `Examen final de ${courseTitle}`}
            </h1>
            
            {isBlocked ? (
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                Vous n&apos;avez pas obtenu les 75% requis lors de votre dernière tentative. Pour garantir votre réussite, prenez le temps de réviser vos modules. Vous pourrez retenter votre chance dans :
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                Prêt à valider vos compétences et décrocher votre certification Jobsy ?
              </p>
            )}
          </div>

          {/* Affichage du gros chrono si bloqué */}
          {isBlocked && (
            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center justify-center gap-3 text-amber-800 font-black text-lg tracking-wider animate-pulse">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {/* Le bouton se désactive et change de style si le candidat doit attendre */}
          <button
            disabled={isBlocked}
            onClick={() => setStarted(true)}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              isBlocked
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-[#000080] text-white cursor-pointer hover:scale-[1.01] active:scale-95 shadow-lg"
            }`}
          >
            {isBlocked ? "Révisions en cours..." : "Passer l'examen"}
          </button>
        </div>
      </div>
    );
  }

  // --- RENDU ÉCRAN 2 : LE QUESTIONNAIRE DYNAMIQUE ACTIVE ---
  return (
    <div className="min-h-screen bg-slate-50/30 py-2 px-4 md:px-8 animate-fadeIn">
      <div className="w-full mx-auto space-y-8 pb-12">
        
        {/* En-tête fixe de progression */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Examen de Certification</h2>
            <p className="text-[11px] text-slate-400 font-medium">{courseTitle}</p>
          </div>
          <div className="bg-blue-50 text-[#000080] text-xs font-black px-4 py-2 rounded-xl">
            {Object.keys(selectedAnswers).length} / {questions.length} Répondues
          </div>
        </div>

        {/* Boucle d'affichage des questions */}
        <div className="space-y-6">
          {questions.map((question, qIndex) => {
            // Une question est considérée choix multiple si elle attend plus d'une bonne réponse
            const isMultiple = question.is_multiple;
            const currentAnswers = selectedAnswers[question.id] || [];

            return (
              <div key={question.id} className="bg-white border border-slate-100 rounded-4xl p-6 md:p-8 shadow-xs space-y-5">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-xl text-xs font-black shrink-0">
                    {qIndex + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm md:text-base font-black text-slate-800 leading-snug">
                      {question.question_text}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {isMultiple ? "Choix multiples (plusieurs réponses possibles)" : "Choix unique"}
                    </p>
                  </div>
                </div>

                {/* Options de réponse */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map((option, oIndex) => {
                    const isSelected = currentAnswers.includes(option);

                    return (
                      <button
                        key={oIndex}
                        type="button"
                        onClick={() => handleSelectAnswer(question.id, option, isMultiple)}
                        className={`cursor-pointer w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-blue-50/60 border-[#000080] text-[#000080]"
                            : "bg-slate-50/40 border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {/* Case à cocher visuelle carrée (multiple) ou ronde (unique) */}
                        <div className={`w-5 h-5 flex items-center justify-center border transition-all shrink-0 ${
                          isMultiple ? "rounded-md" : "rounded-full"
                        } ${isSelected ? "bg-[#000080] border-[#000080] text-white" : "bg-white border-slate-300 text-transparent"}`}>
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        </div>
                        <span className="leading-tight">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barre d'action flottante de validation finale */}
      <div className="bottom-6 w-full max-w-md px-4 flex items-center justify-center mx-auto">
        <button
          disabled={submitting}
          onClick={handleSubmitExam}
          className="cursor-pointer px-4 py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Correction de vos réponses...
            </>
          ) : (
            "Soumettre les réponses"
          )}
        </button>
      </div>
    </div>
  );
}