"use client"

import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, PlayCircle, FileText, ArrowRight, HelpCircle, Award, ExternalLink, Download, Lock, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Question {
  id: number;
  question_text: string;
  options: string[];
  points: number;
}

interface Capsule {
  id: string; // Ex: 'lesson-5' ou 'qcm-2'
  db_id?: number; // Présent pour les leçons
  module_id?: number; // Présent pour le QCM
  title: string;
  type: "video" | "text" | "qcm" | "pdf";
  duration: string;
  content_text: string | null;
  video_url: string | null;
  pdf_url: string | null;
  is_completed: boolean;
  questions?: Question[]; // Uniquement pour le type 'qcm'
}

interface Section {
  id: number;
  title: string;
  capsules: Capsule[];
}

interface LearninPageProps{
    courseId: string;
    courseTitle: string;
    progress_percentage : number, 
    sections : Section[],
    capsuleCurrent : Capsule | null,
    allCapsulesOrdered : Capsule[],
    validation_mode: string;
    onMutate: () => void;
}

export default function LearningPage({capsuleCurrent, allCapsulesOrdered, courseId, onMutate, courseTitle, progress_percentage, sections, validation_mode} : LearninPageProps){
    const [loading, setLoading] = useState(false);
    const [currentCapsule, setCurrentCapsule] = useState<Capsule | null>(capsuleCurrent);  

    console.log("A",capsuleCurrent, "B",currentCapsule)
    
    // États de gestion pour le QCM
    const [qcmFinished, setQcmFinished] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
    const [corrections, setCorrections] = useState<Record<number, { is_correct: boolean; correct_answers: string[]}>>({});

    // 3. Fonction de calcul d'accessibilité (Verrou linéaire)
    const checkIsAccessible = (capsuleId: string) => {
        const index = allCapsulesOrdered.findIndex(c => c.id === capsuleId);
        if (index === 0) return true; // Le tout premier élément est toujours ouvert

        // RÈGLE PEDAGOGIQUE : Accessible si complété OU si l'élément directement précédent est complété
        const current = allCapsulesOrdered[index];
        if (current.is_completed) return true; // Si déjà validé par le passé, accès libre pour révision

        const previous = allCapsulesOrdered[index - 1];
        return previous.is_completed === true;
    };

    // 4. Fonction de transition automatique vers la capsule suivante
    const moveToNextCapsule = (currentId: string) => {
        const currentIndex = allCapsulesOrdered.findIndex(c => c.id === currentId);
        
        if (currentIndex !== -1 && currentIndex < allCapsulesOrdered.length - 1) {
        const nextCapsule = allCapsulesOrdered[currentIndex + 1];
        
        // Réinitialiser les états du QCM avant de changer de vue
        setQcmFinished(false);
        setScore(null);
        setSelectedAnswers({});
        setCorrections({});

        setCurrentCapsule(nextCapsule);
        toast.success("Passage à la capsule suivante !");
        } else {
        toast.success("Incroyable ! Vous avez validé tous les modules de formation.");
        }
    };

    const handleOptionToggle = (questionId: number, optionText: string) => {
        setSelectedAnswers(prev => {
        const currentAnswers = prev[questionId] || [];
        if (currentAnswers.includes(optionText)) {
            return { ...prev, [questionId]: currentAnswers.filter(item => item !== optionText) };
        } else {
            return { ...prev, [questionId]: [...currentAnswers, optionText] };
        }
        });
    };

    // Sauvegarde progression Leçon
    const handleCompleteCapsule = async () => {
        if (!currentCapsule || !currentCapsule.db_id) return;
        setLoading(true);
        
        try {
        // 1. On trouve TOUT DE SUITE la capsule suivante avant que les états ne bougent
        const currentIndex = allCapsulesOrdered.findIndex(c => c.id === currentCapsule.id);
        const nextCapsule = (currentIndex !== -1 && currentIndex < allCapsulesOrdered.length - 1) 
            ? allCapsulesOrdered[currentIndex + 1] 
            : null;

        // 2. Appel API pour enregistrer en Base de Données
        await api.post(`/candidat/formations/lessons/complete`, {
            lesson_id: currentCapsule.db_id,
            course_id: courseId
        });
        
        toast.success("Capsule validée !");
        
        // 3. On force SWR à recharger les données du serveur en arrière-plan
        if (typeof onMutate === "function") {
            onMutate();
        }

        // 4. On gère la transition de manière fluide
        if (nextCapsule) {
            // On réinitialise les états de quiz par sécurité
            setQcmFinished(false);
            setScore(null);
            setSelectedAnswers({});
            setCorrections({});
            
            // On bascule sur la capsule suivante
            setCurrentCapsule(nextCapsule);
        } else {
            // Si pas de capsule suivante, on marque juste l'actuelle comme complétée à l'écran
            setCurrentCapsule(prev => prev ? { ...prev, is_completed: true } : null);
            toast.success("Incroyable ! Vous avez validé tous les modules de formation. 🎓");
        }

        } catch (err) {
        console.error(err);
        toast.error("Impossible de sauvegarder votre progression.");
        } finally {
        setLoading(false);
        }
    };

    // Validation du Quiz de module
    const handleScheduleQcm = async () => {
        if (!currentCapsule || !currentCapsule.module_id) {
        toast.error("Impossible de récupérer les informations du module.");
        return;
        }

        const totalQuestionsCount = currentCapsule.questions?.length || 0;
        const answeredCount = Object.keys(selectedAnswers).filter(
        (key) => selectedAnswers[Number(key)]?.length > 0
        ).length;

        if (answeredCount < totalQuestionsCount) {
        toast.error(`Veuillez cocher au moins une réponse pour chaque question (${answeredCount}/${totalQuestionsCount}).`);
        return;
        }

        setLoading(true);

        try {
        const response = await api.post(
            `/candidat/modules/${currentCapsule.module_id}/submit-quiz`,
            {
            course_id: courseId,
            answers: selectedAnswers,
            }
        );

        const { is_passed, score, message, corrections } = response.data.data;

        setScore(score);
        setQcmFinished(true);
        setCorrections(corrections);

        if (is_passed) {
            toast.success(message);

            if (typeof onMutate === "function") {
                onMutate();
            }

            setCurrentCapsule((prev) => prev ? { ...prev, is_completed: true } : null);

            // Transition automatique après succès au Quiz !
            setTimeout(() => {
            moveToNextCapsule(currentCapsule.id);
            }, 1500);
        } else {
            toast.error(message);
        }
        } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la validation du quiz.";
        toast.error(errorMessage);
        } finally {
        setLoading(false);
        }
    };

    const handleRetryQuiz = () => {
        setQcmFinished(false);
        setScore(null);
        setSelectedAnswers({});
        setCorrections({});
    };

    return(
        <div className="min-h-screen flex flex-col lg:flex-row">
      
          {/* ZONE GAUCHE : LECTEUR DU CONTENU (70%) */}
          <div className="flex-1 p-4 md:p-8 flex flex-col space-y-6">
            <div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
               { validation_mode == "A" ? "Parcours Standard (100% En ligne)" : validation_mode == "B" ? "Parcours Logistique" : "Parcours Expert" }
              </span>
              <h1 className="text-xl font-black text-slate-950 mt-2">{courseTitle}</h1>
            </div>

            <div className="bg-white rounded-4xl border border-slate-100 p-6 md:p-8 flex-1 flex flex-col justify-between min-h-120 shadow-xs">
              {currentCapsule ? (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lecture en cours</span>
                    <h2 className="text-base font-black text-slate-800 mt-0.5">{currentCapsule.title}</h2>
                  </div>

                  {/* TEXTE */}
                  {currentCapsule.type === "text" && (
                    <div className="prose max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {currentCapsule.content_text}
                    </div>
                  )}

                  {/* VIDÉO */}
                  {currentCapsule.type === "video" && currentCapsule.video_url && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-900">
                        <video 
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${currentCapsule.video_url}`} 
                          controls 
                          controlsList="nodownload"
                          className="w-full h-full object-contain"
                        >
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                      </div>
                      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
                        <span>Lecteur vidéo Jobsy Stream</span>
                        <span className="font-medium">Durée : {currentCapsule.duration}</span>
                      </div>
                    </div>
                  )}

                  {/* PDF */}
                  {currentCapsule.type === "pdf" && currentCapsule.pdf_url && (
                    <div className="space-y-4 flex-1 flex flex-col animate-fadeIn">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">Support de cours numérique</p>
                            <p className="text-[10px] text-slate-400 font-medium">Temps de lecture estimé : {currentCapsule.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <a 
                            href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${currentCapsule.pdf_url}`} 
                            target="_blank" 
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-[11px] font-bold transition-all shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Plein écran
                          </a>

                          <a 
                            href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${currentCapsule.pdf_url}`} 
                            download
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-[#000080] hover:bg-[#000080]/90 text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition-all shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Télécharger
                          </a>
                        </div>
                      </div>

                      <div className="flex-1 min-h-140 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative">
                        <iframe 
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${currentCapsule.pdf_url}#toolbar=1`}
                          className="w-full h-full border-none rounded-2xl"
                          title={currentCapsule.title}
                        />
                      </div>
                    </div>
                  )}

                  {/* QCM */}
                  {currentCapsule.type === "qcm" && (
                    <div className="space-y-6">
                      {!currentCapsule.is_completed ? (
                        <div className="space-y-6">
                          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl flex gap-3 items-start">
                            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900 font-medium leading-relaxed">
                              <strong>Test d&apos;obtention de badge :</strong> Répondez correctement à ce QCM de {currentCapsule.duration} pour valider ce module.
                            </p>
                          </div>
                          
                          {currentCapsule.questions?.map((question, index) => {
                            const feedback = corrections[question.id];
                            const isQuestionCorrect = feedback?.is_correct;

                            return (
                              <div 
                                key={question.id} 
                                className={`space-y-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0 p-4 rounded-xl transition-all ${
                                  qcmFinished 
                                    ? isQuestionCorrect 
                                      ? "bg-green-50/30 border border-green-200" 
                                      : "bg-red-50/30 border border-red-200"
                                    : ""
                                }`}
                              >
                                <p className="text-sm font-black text-slate-800">
                                  Question {index + 1} : {question.question_text}
                                  {qcmFinished && (
                                    <span className={`text-xs font-bold ml-2 ${isQuestionCorrect ? "text-green-600" : "text-red-600"}`}>
                                      {isQuestionCorrect ? "✓ Correct" : "✗ Incorrect"}
                                    </span>
                                  )}
                                </p>
                                
                                <div className="grid grid-cols-1 gap-2.5">
                                  {question.options.map((option, idx) => {
                                    const isChecked = (selectedAnswers[question.id] || []).includes(option);
                                    
                                    return (
                                      <label 
                                        key={idx} 
                                        className={`flex items-center gap-3 p-4 border rounded-xl ${
                                          qcmFinished ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                                        } transition-all ${
                                          isChecked 
                                            ? "bg-blue-50/40 border-[#000080]" 
                                            : "bg-slate-50 border-slate-200"
                                        }`}
                                      >
                                        <input 
                                          type="checkbox" 
                                          checked={isChecked}
                                          disabled={qcmFinished}
                                          onChange={() => handleOptionToggle(question.id, option)}
                                          className="text-[#000080] rounded focus:ring-0 w-4 h-4" 
                                        />
                                        <span className={`text-xs font-bold ${isChecked ? "text-[#000080]" : "text-slate-700"}`}>
                                          {option}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {qcmFinished && isQuestionCorrect && feedback?.correct_answers && (
                                  <div className="mt-3 p-3 bg-green-100/60 rounded-xl border border-green-200 text-xs text-green-800 font-bold">
                                    💡 Réponse attendue : {feedback.correct_answers.join(', ')}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {qcmFinished && !currentCapsule.is_completed && (
                            <div>
                              <button onClick={handleRetryQuiz} className="cursor-pointer py-3 px-6 bg-red-600 border-b-4 border-red-800 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-700 transition-all">
                                Recommencer
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 bg-green-50/50 border border-green-200 rounded-2xl flex flex-col items-center text-center space-y-4 animate-fadeIn">
                          <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <Award className="w-10 h-10" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-green-950">Module validé avec succès !</h3>
                            {score && <p className="text-xs text-green-800 mt-1">Vous avez obtenu le score de <strong>{score}%</strong>.</p>}
                            <p className="text-[11px] text-slate-400 mt-2">Vos compétences ont été mises à jour sur votre CV Vérifié Jobsy.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">Sélectionnez une capsule pour démarrer.</p>
              )}

              {/* BARRE DE VALIDATION BASSE */}
              <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                {currentCapsule?.type === "qcm" ? (
                  !qcmFinished && !currentCapsule?.is_completed && (
                    <button onClick={handleScheduleQcm} className="cursor-pointer py-3 px-6 bg-green-600 border-b-4 border-green-800 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-green-700 transition-all">
                      {loading ? (
                      <>
                      <Loader2 className="w-4 h-4" />
                      Enregistrement de la progression...
                      </>
                    ) : (
                      <>
                        {currentCapsule?.is_completed ? "Quiz terminé" : "Valider mes réponses"}
                      </>
                    )}
                    </button>
                  )
                ) : (
                  <button 
                    disabled={loading || currentCapsule?.is_completed}
                    onClick={handleCompleteCapsule}
                    className={`cursor-pointer py-3 px-6 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 border-b-4 transition-all ${
                      currentCapsule?.is_completed 
                        ? "bg-slate-300 border-slate-400 cursor-not-allowed" 
                        : "bg-[#000080] border-blue-950 hover:bg-[#000080]/90"
                    }`}
                  >
                    {loading ? (
                      <>
                      <Loader2 className="w-4 h-4" />
                      Enregistrement de la progression...
                      </>
                    ) : (
                      <>
                        {currentCapsule?.is_completed ? "Déjà complété" : "Marquer comme terminé"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ZONE DROITE : SIDEBAR DE NAVIGATION AVEC VERROUS SYNC */}
          <div className="lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-100 p-4 md:p-8 flex flex-col space-y-6 rounded-2xl">
            
            {/* Progression globale */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <span>Progression globale</span>
                <span className="text-[#000080] font-black">{progress_percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#000080] transition-all duration-500" style={{ width: `${progress_percentage}%` }}></div>
              </div>
            </div>

            {/* Liste dynamique des Sections/Modules */}
            <div className="space-y-5 flex-1 overflow-y-auto">
              {sections.map((section) => (
                <div key={section.id} className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{section.title}</h4>
                  <div className="space-y-1">
                    {section.capsules.map((capsule) => {
                      const isSelected = currentCapsule?.id === capsule.id;
                      const isAccessible = checkIsAccessible(capsule.id); // Calcul dynamique du verrou
                      
                      return (
                        <div
                          key={capsule.id}
                          onClick={() => {
                            if (isAccessible) {
                              setCurrentCapsule(capsule);
                              setQcmFinished(false);
                              setScore(null);
                              setSelectedAnswers({});
                              setCorrections({});
                            } else {
                              toast.error("Veuillez valider les capsules précédentes pour débloquer ce contenu. 🔒");
                            }
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-xs cursor-pointer"
                              : !isAccessible
                              ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                              : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {!isAccessible ? (
                              <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            ) : capsule.is_completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            ) : capsule.type === "video" ? (
                              <PlayCircle className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[#000080]"}`} />
                            ) : capsule.type === "qcm" ? (
                              <Award className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-blue-600"}`} />
                            ) : (
                              <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                            )}
                            <span className="text-xs font-bold truncate tracking-tight">{capsule.title}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium shrink-0">
                            {isAccessible ? capsule.duration : "Bloqué"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
    )
}