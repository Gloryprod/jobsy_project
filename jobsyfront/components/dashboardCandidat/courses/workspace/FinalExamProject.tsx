// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { Clock, Send, CheckCircle2, AlertTriangle, FileText, Link, Upload, Eye } from "lucide-react";
// import api from "@/lib/api";
// import { toast } from "react-hot-toast";

// interface InputSchemaField {
//   key: string;
//   type: "textarea" | "url" | "file";
//   label: string;
//   placeholder?: string;
//   required: boolean;
// }

// interface ExamProject {
//   id: number;
//   title: string;
//   domain: string;
//   context_rich_text: string;
//   inputs_schema: InputSchemaField[];
//   passing_score: number;
//   time_limit_minutes: number | null;
// }

// interface UserExamSession {
//   id: number;
//   status: "in_progress" | "submitted" | "under_review" | "approved" | "failed";
//   submitted_data: Record<string, string> | null;
//   started_at: string;
//   submitted_at: string | null;
//   admin_feedback: string | null;
//   final_score: number | null;
// }

// interface FinalExamProjectPlayProps {
//   courseId: string;
//   can_retry: boolean;
//   time_remaining: number | 0;
//   onBackToCourse?: () => void;
//   onMutate?: () => void;
// }

// export default function FinalExamProjectPlay({ courseId, can_retry, time_remaining, onBackToCourse, onMutate }: FinalExamProjectPlayProps) {
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [project, setProject] = useState<ExamProject | null>(null);
//   const [session, setSession] = useState<UserExamSession | null>(null);
//   const [enrollment, setEnrollment] = useState<null>(null);
//   const [timeLeftRetry, setTimeLeftRetry] = useState<number>(0);
//   const [isRetrying, setIsRetrying] = useState(false);
  
//   // Stockage des réponses : { [fieldKey]: "valeur" }
//   const [answers, setAnswers] = useState<Record<string, string>>({});
  
//   // États pour le compte à rebours
//   const [timeLeft, setTimeLeft] = useState<number | null>(null);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const projectRef = useRef<ExamProject | null>(null);

//   // Mets à jour la ref à chaque fois que project change
//   useEffect(() => {
//     projectRef.current = project;
//   }, [project]);

//   // Soumission finale du projet
//   const handleFormSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     console.log(timerRef)

//     // Utilise la ref si le state local n'est pas encore synchronisé
//     const currentProject = project || projectRef.current;
//     if (!currentProject) return;

//     if(timeLeft !== null && timeLeft <= 0) { 
//       setSubmitting(true);
//       try {
//         const response = await api.post(`/exam-submissions/${currentProject.id}`, {
//           answers: answers
//         });

//         toast.success("Votre projet a été soumis pour correction !");
//         // Mettre à jour l'état local de la session
//         if (response.data.session) {
//           setSession(response.data.session);
//         }
//         if (timerRef.current) clearInterval(timerRef.current);
//       } catch (error: any) {
//         const msg = error.response?.data?.message || "Erreur lors de la soumission.";
//         toast.error(msg);
//       } finally {
//         setSubmitting(false);
//       }
//     }else{
//       // Validation des champs requis côté client
//       for (const field of currentProject.inputs_schema) {
//         if (field.required && !answers[field.key]?.trim()) {
//           return toast.error(`Le champ "${field.label}" est obligatoire.`);
//         }
//       }

//       setSubmitting(true);
//       try {
//         const response = await api.post(`/exam-submissions/${currentProject.id}`, {
//           answers: answers
//         });

//         toast.success("Votre projet a été soumis pour correction !");
//         // Mettre à jour l'état local de la session
//         if (response.data.session) {
//           setSession(response.data.session);
//         }
//         if (timerRef.current) clearInterval(timerRef.current);
//       } catch (error: any) {
//         const msg = error.response?.data?.message || "Erreur lors de la soumission.";
//         toast.error(msg);
//       } finally {
//         setSubmitting(false);
//       }
//     }

//   };

//   // Soumission automatique si le temps expire
//   const handleAutoSubmit = () => {
//     toast.error("Temps écoulé ! Envoi automatique de votre travail en cours...", { duration: 6000 });
//     handleFormSubmit();
//   };

//   // Calcul du temps restant basé sur l'heure de démarrage du serveur
//   const calculateTimeLeft = (startedAtStr: string, limitMinutes: number) => {
//     const startedAt = new Date(startedAtStr).getTime();
//     const limitMs = limitMinutes * 60 * 1000;
//     const endTime = startedAt + limitMs;

//     const updateTimer = () => {
//       const now = new Date().getTime();
//       const difference = endTime - now;

//       if (difference <= 0) {
//         setTimeLeft(0);
//         if (timerRef.current) clearInterval(timerRef.current);
//         // Force la soumission automatique à la fin du temps imparti
//         // On s'assure d'exécuter la soumission une fois le composant rendu
//         setTimeout(() => {
//           handleAutoSubmit();
//         }, 0);
//       } else {
//         setTimeLeft(Math.floor(difference / 1000));
//       }
//     };

//     updateTimer();
//     timerRef.current = setInterval(updateTimer, 1000);
//   };

//   // Charger les données de l'examen et l'état de la session de l'étudiant
//   useEffect(() => {
//     const fetchExamAndSession = async () => {
//       try {
//         setLoading(true);
//         // On appelle la route getStudentSubmission que nous venons de créer
//         const response = await api.get(`/exam-submissions/project/${courseId}`);
        
//         if (response.data.status === "success") {
//           const fetchedProject = response.data.project;
//           const fetchedSession = response.data.session;
//           const fetchedEnrollment = response.data.enrollment;
          
//           setProject(fetchedProject);
//           setSession(fetchedSession);
//           setEnrollment(fetchedEnrollment);

//           // Si l'étudiant a déjà des données de soumission passées
//           if (fetchedSession && fetchedSession.submitted_data) {
//             setAnswers(fetchedSession.submitted_data);
//           } else if (fetchedProject) {
//             // Initialiser les clés vides pour le formulaire
//             const initialAnswers: Record<string, string> = {};
//             fetchedProject.inputs_schema.forEach((field: InputSchemaField) => {
//               initialAnswers[field.key] = "";
//             });
//             setAnswers(initialAnswers);
//           }

//           // Initialisation du chrono si l'examen est lancé et qu'un temps limite existe
//           if (
//             fetchedProject?.time_limit_minutes && 
//             // fetchedSession?.status === "in_progress" &&
//             // fetchedSession?.started_at
//             fetchedEnrollment?.status === 'evaluation_ready'
//           ) {
//             calculateTimeLeft(fetchedEnrollment.updated_at, fetchedProject.time_limit_minutes);
//           }
//         }
//       } catch (error: any) {
//         toast.error("Erreur lors de la récupération du projet d'examen.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExamAndSession();

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [courseId]);

//   // Formatage du chrono (HH:MM:SS)
//   const formatTime = (seconds: number) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h > 0 ? h + "h " : ""}${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
//   };

//   // Gérer le changement dans les inputs dynamiques
//   const handleInputChange = (key: string, value: string) => {
//     setAnswers((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   // Upload simulé/réel de fichier (pour retourner une URL)
//   const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     const toastId = toast.loading("Téléversement de votre livrable...");
//     try {
//       // Ajuste ici avec ton endpoint réel de stockage d'assets temporaires
//       const res = await api.post("/upload-temp-file", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
      
//       handleInputChange(key, res.data.url);
//       toast.success("Fichier téléversé avec succès !", { id: toastId });
//     } catch (err) {
//       toast.error("Échec du téléversement du fichier.", { id: toastId });
//     }
//   };

//   useEffect(() => {
//       if (time_remaining) {
//           // Avoid synchronous setState inside effect (can trigger cascading renders).
//           // Defer the state update to the microtask queue and only update if different.
//           Promise.resolve().then(() => {
//             setTimeLeftRetry((prev) => prev === time_remaining ? prev : time_remaining);
//           });
          
//       }
//     }, [time_remaining]);
  
//     // Effet pour faire descendre le chrono chaque seconde
//     useEffect(() => {
//       if (can_retry || timeLeftRetry <= 0) return;
  
//       const timer = setInterval(() => {
//         setTimeLeftRetry((prev) => prev - 1);
//       }, 1000);
//       return () => {clearInterval(timer)};
  
//     }, [can_retry, timeLeftRetry]);
  
//     // Fonction pour formater les secondes en hh:mm:ss
//     const formatTimeRetry = (seconds: number) => {
//       const h = Math.floor(seconds / 3600);
//       const m = Math.floor((seconds % 3600) / 60);
//       const s = seconds % 60;
//       return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
//       // return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
//     };
  
//     const isBlocked = can_retry === false && timeLeftRetry > 0;

//     const handleRetryExam = async () => {

//       setIsRetrying(true);
//       try {
//         const response = await api.post(`/exam-sessions/${session?.id}/retry`);
        
//         toast.success("Bonne chance pour votre nouvelle tentative !");
        
//         // Si tu utilises SWR pour recharger les données :
//         if (typeof onMutate === "function") {
//           onMutate();
//         }else {
//           // Sinon rechargement de la page ou redirection
//           window.location.reload();
//         }
//       } catch (error: any) {
//         toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation.");
//       } finally {
//         setIsRetrying(false);
//       }
//     };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-12 min-h-100">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000080]"></div>
//         <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-wider">Chargement de l&apos;examen...</p>
//       </div>
//     );
//   }

//   if (!project) {
//     return (
//       <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl max-w-lg mx-auto my-8">
//         <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
//         <h3 className="font-bold text-slate-900 text-sm">Projet d&apos;examen non trouvé</h3>
//         <p className="text-xs text-slate-500 mt-2">Le projet d&apos;évaluation finale pratique de ce cours n&apos;a pas encore été configuré par l&apos;administration.</p>
//         {onBackToCourse && (
//           <button onClick={onBackToCourse} className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all">
//             Retourner au cours
//           </button>
//         )}
//       </div>
//     );
//   }

//   // --- RENDU D'ÉCRAN : PROJET DÉJÀ SOUMIS (SOUMIS, EN COURS DE CORRECTION, RÉUSSI OU ÉCHOUÉ) ---
//   if (session && ["submitted", "under_review", "approved", "failed"].includes(session.status)) {
//     return (
//       <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
//         <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-center space-y-4">
          
//           {session.status === "submitted" && (
//             <>
//               <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
//                 <Clock className="w-6 h-6 animate-pulse" />
//               </div>
//               <h2 className="text-base font-black text-slate-900">Projet soumis avec succès !</h2>
//               <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
//                 Votre projet d&apos;examen final a été réceptionné et est en attente de correction. Un membre de notre jury va analyser vos réponses et évaluer votre travail selon le barème établi.
//               </p>
//             </>
//           )}

//           {session.status === "under_review" && (
//             <>
//               <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
//                 <Eye className="w-6 h-6 animate-spin-slow" />
//               </div>
//               <h2 className="text-base font-black text-slate-900">Examen en cours de correction</h2>
//               <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
//                 Votre code et vos documents d&apos;examen sont en cours de lecture et d&apos;exécution par nos examinateurs techniques. Un e-mail vous sera envoyé dès que votre note finale sera disponible.
//               </p>
//             </>
//           )}

//           {session.status === "approved" && (
//             <>
//               <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
//                 <CheckCircle2 className="w-6 h-6" />
//               </div>
//               <h2 className="text-base font-black text-slate-900 text-green-600">Félicitations, Examen Validé !</h2>
//               <div className="inline-block px-4 py-2 bg-green-50 text-green-700 font-black text-xl rounded-2xl">
//                 {session.final_score}% obtenus
//               </div>
//               <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
//                 Votre travail pratique a été validé avec brio ! Vous remplissez les critères requis pour l&apos;obtention de votre certification professionnelle.
//               </p>
//             </>
//           )}

//           {session.status === "failed" && !can_retry ? (
//             <>
//               <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
//                 <AlertTriangle className="w-6 h-6" />
//               </div>
//               <h2 className="text-base font-black text-slate-900 text-red-600 font-bold">Examen non validé</h2>
//               <div className="inline-block px-4 py-2 bg-red-50 text-red-700 font-black text-xl rounded-2xl">
//                 {session.final_score}% obtenus
//               </div>
//               <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
//                 Malheureusement, le total des points obtenus est en dessous du seuil de validation ({project.passing_score}%). Prenez en compte les retours du correcteur ci-dessous et retentez votre chance dans 24h.
//               </p>

//               {/* Feedback de l'administrateur */}
//               {session.admin_feedback && (
//                 <div className="mt-6 text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
//                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retour d&apos;évaluation du jury</span>
//                   <p className="text-xs text-slate-700 font-medium leading-relaxed italic">&quot;{session.admin_feedback}&quot;</p>
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
//                   {isBlocked && "Examen temporairement bloqué"}
//                 </h1>
                
//                 {isBlocked && (
//                   <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
//                     Vous n&apos;avez pas obtenu les 75% requis lors de votre dernière tentative. Pour garantir votre réussite, prenez le temps de réviser vos modules. Vous pourrez retenter votre chance dans :
//                   </p>
//                 )}
//               </div>
    
//               {/* Affichage du gros chrono si bloqué */}
//               {isBlocked && (
//                 <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center justify-center gap-3 text-amber-800 font-black text-lg tracking-wider animate-pulse">
//                   <Clock className="w-5 h-5 text-amber-600" />
//                   <span>{formatTimeRetry(timeLeftRetry)}</span>
//                 </div>
//               )}

//             </>
//           ) : session.status== "failed" && can_retry ? (
//             <>
//               <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
//                 Prêt à repasser l&apos;examen et décrocher votre certification Jobsy ?
//               </p>
//               <button
//                 onClick={() => handleRetryExam()}
//                 className="cursor-pointer w-full py-4 rounded-2xl border bg-amber-100 font-black text-xs uppercase tracking-widest transition-all"
//               >
//                 {isRetrying ? "Réinitialisation..." : "Repasser l'examen"}              
//               </button>
//             </>
//           ) : null}

//           {onBackToCourse && (
//             <button onClick={onBackToCourse} className="mt-4 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all">
//               Retourner au tableau de bord du cours
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // --- RENDU D'ÉCRAN : FORMULAIRE DE RENDU DYNAMIQUE ---
//   if(!session || session.status === "in_progress") {
//     return (
//       <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
        
//         {/* Header & Compte à Rebours */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
//           <div>
//             <span className="px-2 py-1 bg-[#000080]/5 text-[#000080] text-[9px] font-black uppercase tracking-widest rounded">Examen Final Pratique</span>
//             <h1 className="text-lg font-black text-slate-900 mt-1">{project.title}</h1>
//           </div>

//           {/* Compte à rebours dynamique */}
//           {timeLeft !== null && (
//             <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl shrink-0 font-black text-xs animate-pulse">
//               <Clock className="w-4 h-4 text-red-600" />
//               <span>Temps restant : {formatTime(timeLeft)}</span>
//             </div>
//           )}
//         </div>

//         {/* Énoncé du cas pratique */}
//         <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
//           <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
//             <FileText className="w-4 h-4 text-[#000080]" /> Énoncé & Directives du Projet
//           </div>
//           <div 
//             className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed font-medium space-y-4"
//             dangerouslySetInnerHTML={{ __html: project.context_rich_text }}
//           />
//         </div>

//         {/* Formulaire dynamique de l'étudiant */}
//         <form onSubmit={handleFormSubmit} className="space-y-6">
//           <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
//             <div className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
//               Vos Réponses & Livrables
//             </div>

//             <div className="space-y-6">
//               {project.inputs_schema.map((field) => (
//                 <div key={field.key} className="space-y-2">
//                   <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
//                     {field.label}
//                     {field.required && <span className="text-red-500 text-sm font-bold">*</span>}
//                   </label>

//                   {/* Champ TEXTAREA */}
//                   {field.type === "textarea" && (
//                     <textarea
//                       value={answers[field.key] || ""}
//                       onChange={(e) => handleInputChange(field.key, e.target.value)}
//                       placeholder={field.placeholder || "Rédigez votre réponse structurée ici..."}
//                       rows={6}
//                       // required={field.required}
//                       className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none font-medium transition-all"
//                     />
//                   )}

//                   {/* Champ URL (Ex: GitHub, Notion, etc.) */}
//                   {field.type === "url" && (
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
//                         <Link className="w-4 h-4" />
//                       </div>
//                       <input
//                         type="url"
//                         value={answers[field.key] || ""}
//                         onChange={(e) => handleInputChange(field.key, e.target.value)}
//                         placeholder={"https://example.com/..."}
//                       //   required={field.required}
//                         className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none font-bold transition-all"
//                       />
//                     </div>
//                   )}

//                   {/* Champ FICHIER (Téléversement) */}
//                   {field.type === "file" && (
//                     <div className="space-y-3">
//                       {answers[field.key] ? (
//                         <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-100 rounded-xl">
//                           <div className="flex items-center gap-2">
//                             <CheckCircle2 className="w-4 h-4 text-green-600" />
//                             <span className="text-xs font-bold text-green-800">Fichier enregistré avec succès</span>
//                           </div>
//                           <a 
//                             href={answers[field.key]} 
//                             target="_blank" 
//                             rel="noreferrer" 
//                             className="text-[10px] font-black uppercase text-[#000080] hover:underline"
//                           >
//                             Visualiser le fichier
//                           </a>
//                         </div>
//                       ) : (
//                         <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 rounded-xl p-6 transition-all text-center">
//                           <input
//                             type="file"
//                             onChange={(e) => handleFileUpload(field.key, e)}
//                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                           />
//                           <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
//                           <span className="block text-xs font-black text-slate-600">Glissez-déposez votre livrable ici ou cliquez pour parcourir</span>
//                           <span className="block text-[10px] text-slate-400 mt-1">Fichiers acceptés : PDF, ZIP, Images</span>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Bouton de validation de la soumission */}
//           <button
//             type="submit"
//             disabled={submitting}
//             className="cursor-pointer w-full py-4 bg-[#000080] hover:bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//           >
//             <Send className="w-4 h-4" />
//             {submitting ? "Soumission en cours..." : "Soumettre définitivement mon projet"}
//           </button>
//         </form>
//       </div>
//     );
//   }
  
// }

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Send, CheckCircle2, AlertTriangle, FileText, Link, Upload, Eye, Save, PlayCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface InputSchemaField {
  key: string;
  type: "textarea" | "url" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
}

interface ExamProject {
  id: number;
  title: string;
  domain: string;
  context_rich_text: string;
  inputs_schema: InputSchemaField[];
  passing_score: number;
  time_limit_minutes: number | null;
}

interface UserExamSession {
  id: number;
  status: "in_progress" | "submitted" | "under_review" | "approved" | "failed";
  submitted_data: Record<string, string> | null;
  started_at: string;
  submitted_at: string | null;
  admin_feedback: string | null;
  final_score: number | null;
}

interface FinalExamProjectPlayProps {
  courseId: string;
  can_retry: boolean;
  time_remaining: number | 0;
  onBackToCourse?: () => void;
  onMutate?: () => void;
}

const EXTRA_TIME_MINUTES = 30; // 30 minutes de grâce accordées automatiquement

export default function FinalExamProjectPlay({
  courseId,
  can_retry,
  time_remaining,
  onBackToCourse,
  onMutate,
}: FinalExamProjectPlayProps) {
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const [project, setProject] = useState<ExamProject | null>(null);
  const [session, setSession] = useState<UserExamSession | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [timeLeftRetry, setTimeLeftRetry] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Stockage des réponses : { [fieldKey]: "valeur" }
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // États pour le double chrono
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExtraTime, setIsExtraTime] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const projectRef = useRef<ExamProject | null>(null);
  const sessionRef = useRef<UserExamSession | null>(null);
  const answersRef = useRef<Record<string, string>>({});
  const hasExpiredTriggered = useRef<boolean>(false);

  const localStorageKey = `exam_draft_${courseId}`;

  // Synchronisation des refs hors du rendu
  useEffect(() => {
    projectRef.current = project;
    sessionRef.current = session;
    answersRef.current = answers;
  }, [project, session, answers]);

  // --- SAUVEGARDE ET SYNCHRONISATION LOCALSTORAGE ---
  const updateAnswers = (newAnswers: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    setAnswers((prev) => {
      const updated = typeof newAnswers === "function" ? newAnswers(prev) : newAnswers;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(updated));
        } catch (e) {
          console.error("Erreur lors de la sauvegarde dans le localStorage :", e);
        }
      }
      return updated;
    });
  };

  // --- LOGIQUE AUTO-SAVE BACKEND (DEBOUNCE 1.5s) ---
  useEffect(() => {
    if (!session || session.status !== "in_progress") return;

    const timer = setTimeout(async () => {
      const currentAnswers = answersRef.current;
      if (Object.keys(currentAnswers).length === 0) return;

      try {
        setIsAutoSaving(true);
        await api.patch(`/exam-sessions/${session.id}/draft`, { answers: currentAnswers });
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Erreur lors de la sauvegarde automatique des réponses :", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [answers, session]);

  // --- SOUMISSION FINALE (MANUELLE) ---
  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const currentProject = project || projectRef.current;
    if (!currentProject) return;

    if (e) {
      for (const field of currentProject.inputs_schema) {
        if (field.required && !answers[field.key]?.trim()) {
          return toast.error(`Le champ "${field.label}" est obligatoire.`);
        }
      }
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/exam-submissions/${currentProject.id}`, {
        answers: answersRef.current,
      });

      toast.success("Votre projet a été soumis pour correction !");
      
      // Nettoyage du brouillon local
      if (typeof window !== "undefined") {
        localStorage.removeItem(localStorageKey);
      }

      if (response.data.session) {
        setSession(response.data.session);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erreur lors de la soumission.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- TRAITEMENT AUTOMATIQUE À LA FIN DES 30 MIN EXTRA ---
  const handleFinalDeadlineReached = useCallback(
    async (overrideSession?: UserExamSession | null, overrideProject?: ExamProject | null) => {
      if (hasExpiredTriggered.current) return;
      hasExpiredTriggered.current = true;

      if (timerRef.current) clearInterval(timerRef.current);

      const currentAnswers = answersRef.current;
      const currentSession = overrideSession || sessionRef.current;
      const currentProject = overrideProject || projectRef.current;

      const hasProvidedAnswers = Object.values(currentAnswers).some(
        (val) => val && val.trim() !== ""
      );

      if (hasProvidedAnswers) {
        toast.error("Temps extra écoulé ! Votre travail a été automatiquement soumis pour correction.", {
          duration: 8000,
        });

        if (currentProject) {
          try {
            const response = await api.post(`/exam-submissions/${currentProject.id}/auto-submit`, {
              answers: currentAnswers,
            });
            if (response.data.session) setSession(response.data.session);
          } catch (err) {
            console.error("Erreur lors de l'auto-soumission :", err);
          }
        }
      } else {
        toast.error("Temps extra écoulé sans aucune réponse. L'examen est marqué comme échoué.", {
          duration: 8000,
        });

        if (currentSession) {
          try {
            const response = await api.post(`/exam-sessions/${currentSession.id}/mark-failed-empty`);
            if (response.data.session) {
              setSession(response.data.session);
            } else {
              setSession((prev) => (prev ? { ...prev, status: "failed" } : null));
            }
          } catch (err) {
            console.error("Erreur lors de la mise en échec de la session :", err);
          }
        }
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem(localStorageKey);
      }
    },
    [localStorageKey]
  );

  // --- CALCUL DU DOUBLE CHRONO ---
  const calculateDoublePhaseTime = useCallback(
    (startedAtStr: string, limitMinutes: number, currentSessionData?: UserExamSession | null, currentProjectData?: ExamProject | null) => {
      const startedAt = new Date(startedAtStr).getTime();
      const normalLimitMs = limitMinutes * 60 * 1000;
      const extraLimitMs = (limitMinutes + EXTRA_TIME_MINUTES) * 60 * 1000;

      const updateTimer = () => {
        const now = new Date().getTime();
        const elapsedTimeMs = now - startedAt;

        if (elapsedTimeMs < normalLimitMs) {
          const remainingSeconds = Math.floor((normalLimitMs - elapsedTimeMs) / 1000);
          setTimeLeft(remainingSeconds);
          setIsExtraTime(false);
        } else if (elapsedTimeMs < extraLimitMs) {
          const remainingSeconds = Math.floor((extraLimitMs - elapsedTimeMs) / 1000);
          setTimeLeft(remainingSeconds);
          setIsExtraTime(true);
        } else {
          setTimeLeft(0);
          setIsExtraTime(true);
          handleFinalDeadlineReached(currentSessionData, currentProjectData);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    },
    [handleFinalDeadlineReached]
  );

  // --- INITIALISATION DU LOGIQUE BROUILLON (LOCALSTORAGE / SESSION DATA) ---
  const initAnswersData = (fetchedSession: UserExamSession | null, fetchedProject: ExamProject | null) => {
    let savedLocalData: Record<string, string> | null = null;

    if (typeof window !== "undefined") {
      try {
        const item = localStorage.getItem(localStorageKey);
        if (item) savedLocalData = JSON.parse(item);
      } catch (e) {
        console.error("Erreur de lecture du localStorage :", e);
      }
    }

    if (fetchedSession && fetchedSession.submitted_data && Object.keys(fetchedSession.submitted_data).length > 0) {
      setAnswers(fetchedSession.submitted_data);
    } else if (savedLocalData && Object.keys(savedLocalData).length > 0) {
      setAnswers(savedLocalData);
    } else if (fetchedProject) {
      const initialAnswers: Record<string, string> = {};
      fetchedProject.inputs_schema.forEach((field: InputSchemaField) => {
        initialAnswers[field.key] = "";
      });
      setAnswers(initialAnswers);
    }
  };

  // --- CHARGEMENT INITIAL DES DONNÉES ---
  useEffect(() => {
    const fetchExamAndSession = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/exam-submissions/project/${courseId}`);

        if (response.data.status === "success") {
          const fetchedProject: ExamProject = response.data.project;
          const fetchedSession: UserExamSession = response.data.session;
          const fetchedEnrollment = response.data.enrollment;

          setProject(fetchedProject);
          setSession(fetchedSession);
          setEnrollment(fetchedEnrollment);

          initAnswersData(fetchedSession, fetchedProject);

          // Lancer le timer uniquement si la session existe déjà et est active
          if (
            fetchedSession &&
            fetchedSession.status === "in_progress" &&
            fetchedProject?.time_limit_minutes
          ) {
            calculateDoublePhaseTime(
              fetchedSession.started_at || fetchedEnrollment?.updated_at,
              fetchedProject.time_limit_minutes,
              fetchedSession,
              fetchedProject
            );
          }
        }
      } catch (error: any) {
        toast.error("Erreur lors de la récupération du projet d'examen.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamAndSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [courseId, calculateDoublePhaseTime]);

  // --- CRÉATION INITIALE DE SESSION (AU CLIC SUR COMMENCER) ---
  const handleStartExam = async () => {
    if (!project) return;
    setStartingSession(true);

    try {
      const response = await api.post(`/exam-sessions/start/${project.id}`);
      const newSession: UserExamSession = response.data.session;

      setSession(newSession);
      toast.success("L'examen a démarré ! Bon courage.");

      if (project.time_limit_minutes) {
        calculateDoublePhaseTime(
          newSession.started_at,
          project.time_limit_minutes,
          newSession,
          project
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors du démarrage de la session d'examen.");
    } finally {
      setStartingSession(false);
    }
  };

  // Formatage du chrono (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + "h " : ""}${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const handleInputChange = (key: string, value: string) => {
    updateAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Téléversement de votre livrable...");
    try {
      const res = await api.post("/upload-temp-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      handleInputChange(key, res.data.url);
      toast.success("Fichier téléversé avec succès !", { id: toastId });
    } catch (err) {
      toast.error("Échec du téléversement du fichier.", { id: toastId });
    }
  };

  // --- LOGIQUE 24H RETRY ---
  useEffect(() => {
    if (time_remaining) {
      setTimeLeftRetry((prev) => (prev === time_remaining ? prev : time_remaining));
    }
  }, [time_remaining]);

  useEffect(() => {
    if (can_retry || timeLeftRetry <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftRetry((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [can_retry, timeLeftRetry]);

  const formatTimeRetry = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const isBlocked = can_retry === false && timeLeftRetry > 0;

  const handleRetryExam = async () => {
    setIsRetrying(true);
    try {
      await api.post(`/exam-sessions/${session?.id}/retry`);
      if (typeof window !== "undefined") {
        localStorage.removeItem(localStorageKey);
      }
      toast.success("Bonne chance pour votre nouvelle tentative !");

      if (typeof onMutate === "function") {
        onMutate();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000080]"></div>
        <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-wider">
          Chargement de l&apos;examen...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl max-w-lg mx-auto my-8">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-900 text-sm">Projet d&apos;examen non trouvé</h3>
        <p className="text-xs text-slate-500 mt-2">
          Le projet d&apos;évaluation finale pratique de ce cours n&apos;a pas encore été configuré par l&apos;administration.
        </p>
        {onBackToCourse && (
          <button
            onClick={onBackToCourse}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Retourner au cours
          </button>
        )}
      </div>
    );
  }

  // --- RENDU 0 : ÉCRAN INTERMÉDIAIRE SI SESSION EST NULL (PREMIÈRE VISITE) ---
  if (!session) {
    return (
      <div className="p-6 md:p-12 w- mx-full my-8 bg-white border border-slate-100 rounded-3xl shadow-xs text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-[#000080]/10 text-[#000080] rounded-full flex items-center justify-center mx-auto">
          <PlayCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-[#000080]/5 text-[#000080] text-[10px] font-black uppercase tracking-widest rounded-full">
            Évaluation Finale
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {project.title}
          </h1>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left space-y-3">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Consignes Générales avant de démarrer :
          </h4>
          <ul className="text-xs text-slate-600 space-y-2 font-medium list-disc list-inside">
            {project.time_limit_minutes && (
              <li>
                Temps imparti : <strong>{project.time_limit_minutes} minutes</strong> (+ 30 min de grâce automatique).
              </li>
            )}
            <li>Le chrono démarrera dès que vous aurez cliqué sur le bouton ci-dessous. Assurez vous d&apos;être dans de bonnes conditions pour travailler et ne pas perdre du temps inutilement. Si vous devez quitter pour une quelconque raison, faites votre possible pour reprendre avant la fin du délai.</li>
            <li>Vos réponses sont automatiquement sauvegardées en temps réel.</li>
            <li>Note de validation requis : <strong>{project.passing_score} / 20</strong>.</li>
          </ul>
        </div>

        <button
          onClick={handleStartExam}
          disabled={startingSession}
          className="cursor-pointer w-full py-4 bg-[#000080] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <PlayCircle className="w-4 h-4" />
          {startingSession ? "Initialisation de l'examen..." : "Commencer l'examen"}
        </button>
      </div>
    );
  }

  // --- RENDU 1 : SOUMIS / CORRECTION / VALIDÉ / ÉCHOUÉ ---
  if (["submitted", "under_review", "approved", "failed"].includes(session.status)) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-center space-y-4">
          {session.status === "submitted" && (
            <>
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-base font-black text-slate-900">Projet soumis avec succès !</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Votre projet d&apos;examen final a été réceptionné et est en attente de correction. Un membre de notre jury va analyser vos réponses.
              </p>
            </>
          )}

          {session.status === "under_review" && (
            <>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                <Eye className="w-6 h-6 animate-spin-slow" />
              </div>
              <h2 className="text-base font-black text-slate-900">Examen en cours de correction</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Vos documents d&apos;examen sont en cours de lecture par nos examinateurs.
              </p>
            </>
          )}

          {session.status === "approved" && (
            <>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-900 text-green-600">Félicitations, Examen Validé !</h2>
              <div className="inline-block px-4 py-2 bg-green-50 text-green-700 font-black text-xl rounded-2xl">
                {session.final_score}% obtenus
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Votre travail pratique a été validé avec brio ! Vous remplissez les critères requis pour l&apos;obtention de votre certification.
              </p>
            </>
          )}

          {session.status === "failed" && !can_retry ? (
            <>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-base text-slate-900 text-red-600 font-bold">Examen non validé</h2>
              <div className="inline-block px-4 py-2 bg-red-50 text-red-700 font-black text-xl rounded-2xl">
                {session.final_score ?? 0} / 20 obtenus
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Le total des points obtenus est sous le seuil de validation ({project.passing_score}). Vous pourrez retenter dans 24h.
              </p>

              {session.admin_feedback && (
                <div className="mt-6 text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retour d&apos;évaluation du jury</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed italic">&quot;{session.admin_feedback}&quot;</p>
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {isBlocked && "Examen temporairement bloqué"}
                </h1>
                {isBlocked && (
                  <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                    Prenez le temps de réviser vos modules. Vous pourrez retenter votre chance dans :
                  </p>
                )}
              </div>

              {isBlocked && (
                <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center justify-center gap-3 text-amber-800 font-black text-lg tracking-wider animate-pulse">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>{formatTimeRetry(timeLeftRetry)}</span>
                </div>
              )}
            </>
          ) : session.status === "failed" && can_retry ? (
            <>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                Prêt à repasser l&apos;examen et décrocher votre certification ?
              </p>
              <button
                onClick={() => handleRetryExam()}
                disabled={isRetrying}
                className="cursor-pointer w-full py-4 rounded-2xl border bg-amber-100 font-black text-xs uppercase tracking-widest transition-all"
              >
                {isRetrying ? "Réinitialisation..." : "Repasser l'examen"}
              </button>
            </>
          ) : null}

          {onBackToCourse && (
            <button
              onClick={onBackToCourse}
              className="mt-4 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
            >
              Retourner au tableau de bord du cours
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- RENDU 2 : FORMULAIRE D'EXAMEN & DRAFT (EN COURS) ---
  if (session.status === "in_progress") {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
        {/* En-tête + Chrono principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="px-2 py-1 bg-[#000080]/5 text-[#000080] text-[9px] font-black uppercase tracking-widest rounded">
              Examen Final Pratique
            </span>
            <h1 className="text-lg font-black text-slate-900 mt-1">{project.title}</h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Save className={`w-3.5 h-3.5 ${isAutoSaving ? "animate-spin text-[#000080]" : "text-slate-400"}`} />
              <span>
                {isAutoSaving
                  ? "Sauvegarde..."
                  : lastSavedAt
                  ? `Sauvegardé à ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Brouillon actif"}
              </span>
            </div>

            {timeLeft !== null && (
              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs border transition-all ${
                  isExtraTime
                    ? "bg-amber-500 text-white border-amber-600 animate-bounce"
                    : "bg-red-50 text-red-700 border-red-100 animate-pulse"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {isExtraTime ? "Temps Extra : " : "Temps restant : "}
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BANDEAU TEMPS EXTRA */}
        {isExtraTime && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-sm animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
                Période de grâce activée (30 minutes extra)
              </h4>
              <p className="text-xs font-medium text-amber-700 leading-relaxed">
                Le délai initial est écoulé ! Vous disposez de <strong>30 minutes supplémentaires</strong> pour relire et soumettre vos réponses.
              </p>
            </div>
          </div>
        )}

        {/* Énoncé */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-[#000080]" /> Énoncé & Directives du Projet
          </div>
          <div
            className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed font-medium space-y-4"
            dangerouslySetInnerHTML={{ __html: project.context_rich_text }}
          />
        </div>

        {/* Formulaire dynamique */}
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Vos Réponses & Livrables
            </div>

            <div className="space-y-6">
              {project.inputs_schema.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    {field.label}
                    {field.required && <span className="text-red-500 text-sm font-bold">*</span>}
                  </label>

                  {field.type === "textarea" && (
                    <textarea
                      value={answers[field.key] || ""}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || "Rédigez votre réponse structurée ici..."}
                      rows={6}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none font-medium transition-all"
                    />
                  )}

                  {field.type === "url" && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Link className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        value={answers[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={"https://example.com/..."}
                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none font-bold transition-all"
                      />
                    </div>
                  )}

                  {field.type === "file" && (
                    <div className="space-y-3">
                      {answers[field.key] ? (
                        <div className="flex items-center justify-between p-3.5 bg-green-50 border border-green-100 rounded-xl">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold text-green-800">Fichier enregistré avec succès</span>
                          </div>
                          <a
                            href={answers[field.key]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-black uppercase text-[#000080] hover:underline"
                          >
                            Visualiser le fichier
                          </a>
                        </div>
                      ) : (
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 rounded-xl p-6 transition-all text-center">
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(field.key, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <span className="block text-xs font-black text-slate-600">
                            Glissez-déposez votre livrable ici ou cliquez pour parcourir
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            Fichiers acceptés : PDF, ZIP, Images
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer w-full py-4 bg-[#000080] hover:bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Soumission en cours..." : "Soumettre définitivement mon projet"}
          </button>
        </form>
      </div>
    );
  }

  return null;
}