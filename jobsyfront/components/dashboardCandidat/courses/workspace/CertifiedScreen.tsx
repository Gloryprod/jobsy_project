// "use client";

// import React, { useState } from "react";
// import { Award, Download, Copy, Check, Share2, ShieldCheck } from "lucide-react";
// import { toast } from "react-hot-toast";

// interface CertifiedScreenProps {
//   courseTitle: string;
//   certificateHash: string;
// }

// export default function CertifiedScreen({ courseTitle, certificateHash }: CertifiedScreenProps) {
//   const [copied, setCopied] = useState(false);

//   // Fonction pour copier le lien ou le hash de certification
//   const handleCopyHash = () => {
//     // Tu pourras remplacer par ton vrai domaine de prod, ex: jobsy.bj/verify/${certificateHash}
//     const verificationUrl = `${window.location.origin}/verify/${certificateHash}`;
    
//     navigator.clipboard.writeText(verificationUrl);
//     setCopied(true);
//     toast.success("Lien de vérification copié !");
    
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 md:p-8 animate-fadeIn">
//       <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
//         {/* COLONNE GAUCHE : LE MESSAGE DE SUCCÈS & ACTIONS (5/12) */}
//         <div className="md:col-span-5 space-y-6 text-center md:text-left order-2 md:order-1">
//           <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-2xl shadow-xs">
//             <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
//           </div>

//           <div className="space-y-2">
//             <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
//               Succès de certification
//             </span>
//             <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
//               Félicitations ! <br />
//               Vous êtes certifié.
//             </h1>
//             <p className="text-xs text-slate-400 font-medium leading-relaxed">
//               Votre réussite à l&apos;examen final valide officiellement vos compétences sur Jobsy. Votre certificat est désormais public et falsifiable.
//             </p>
//           </div>

//           {/* Boîte d'authentification (Hash) */}
//           <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-2 text-left shadow-2xs">
//             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
//               ID Unique du certificat
//             </span>
//             <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2.5 gap-2">
//               <code className="text-[11px] text-slate-700 font-mono truncate max-w-45">
//                 {certificateHash}
//               </code>
//               <button
//                 type="button"
//                 onClick={handleCopyHash}
//                 className="cursor-pointer p-2 bg-white border border-slate-100 text-slate-500 rounded-lg hover:text-[#000080] transition-all hover:scale-105 active:scale-95 shadow-2xs shrink-0"
//                 title="Copier le lien de vérification"
//               >
//                 {copied ? <Check className="w-3.5 h-3.5 text-green-600 stroke-3" /> : <Copy className="w-3.5 h-3.5" />}
//               </button>
//             </div>
//           </div>

//           {/* Boutons d'actions principaux */}
//           <div className="space-y-3 pt-2">
//             <button className="cursor-pointer w-full py-4 bg-[#000080] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
//               <Download className="w-4 h-4" /> Télécharger le PDF
//             </button>
            
//             <button 
//               onClick={handleCopyHash}
//               className="cursor-pointer w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
//             >
//               <Share2 className="w-4 h-4" /> Partager sur LinkedIn
//             </button>
//           </div>
//         </div>

//         {/* COLONNE DROITE : VISUEL MOCKUP DU DIPLÔME (7/12) */}
//         <div className="md:col-span-7 order-1 md:order-2 flex justify-center">
//           <div className="relative w-full max-w-md aspect-[1.414/1] bg-linear-to-br from-slate-900 to-slate-950 border-12 border-slate-800 rounded-4xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden text-white group">
            
//             {/* Effets de lumière décoratifs en arrière-plan */}
//             <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            
//             {/* Top : Header du diplôme */}
//             <div className="flex items-start justify-between border-b border-white/5 pb-4">
//               <div>
//                 <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block">
//                   Certificat Officiel
//                 </span>
//                 <span className="text-sm font-black tracking-tight text-white block mt-0.5">
//                   Jobsy<span className="text-blue-500">.</span>
//                 </span>
//               </div>
//               <Award className="w-8 h-8 text-amber-400 stroke-[1.2]" />
//             </div>

//             {/* Middle : Le cœur du texte */}
//             <div className="space-y-3 my-auto py-2">
//               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
//                 Ce document atteste que le candidat a validé avec succès la formation :
//               </p>
//               <h2 className="text-base md:text-lg font-black text-white leading-tight tracking-tight uppercase">
//                 {courseTitle}
//               </h2>
//               <div className="w-12 h-1 bg-linear-to-r from-blue-500 to-emerald-500 rounded-full" />
//             </div>

//             {/* Bottom : Signature & Hash de validation */}
//             <div className="flex items-end justify-between pt-4 border-t border-white/5 text-[9px] text-slate-500 font-bold">
//               <div>
//                 <span className="block text-[8px] uppercase tracking-wider text-slate-400">Délivré par</span>
//                 <span className="text-white font-black">L&apos;équipe Pédagogique Jobsy</span>
//               </div>
//               <div className="text-right max-w-37.5">
//                 <span className="block text-[8px] uppercase tracking-wider text-slate-400">Vérification</span>
//                 <span className="font-mono truncate block text-blue-400/80">{certificateHash.substring(0, 16)}...</span>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { Award, Download, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import Link from "next/link";

interface CertifiedScreenProps {
  courseId: string;
  courseTitle: string;
  certificateHash: string;
}

export default function CertifiedScreen({ courseId, courseTitle, certificateHash }: CertifiedScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    const verificationUrl = `${window.location.origin}/verify/${certificateHash}`;
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    toast.success("Lien de vérification copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
        // Avec Axios, on passe la configuration en 2e paramètre pour un GET
        const response = await api.get(`/courses/${courseId}/${certificateHash}/certificate/download`, {
        responseType: 'blob', // Crucial pour récupérer un fichier binaire/PDF
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`, // Optionnel si ton instance gère déjà les tokens
        },
        });

        // Axios met le blob directement dans response.data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Création du lien invisible pour forcer le téléchargement
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificat_${courseTitle.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Nettoyage de la mémoire
        window.URL.revokeObjectURL(url);
        a.remove();
        
        toast.success("Téléchargement lancé !");
    } catch (error) {
        toast.error("Impossible de récupérer le PDF.");
        console.error(error);
    }
 };

  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full bg-white border border-slate-100 rounded-4xl p-6 sm:p-10 shadow-xl space-y-8 text-center relative overflow-hidden">
        
        {/* Badge décoratif en arrière-plan */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />

        {/* Icône Principale */}
        <div className="inline-flex p-4 bg-blue-50 text-[#000080] rounded-3xl shadow-sm relative z-10">
          <Award className="w-10 h-10 stroke-[1.5]" />
        </div>

        {/* Textes de félicitations */}
        <div className="space-y-3 relative z-10">
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Certification obtenue
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Félicitations ! Votre certification est prête
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Vous avez validé avec succès toutes les étapes de l&apos;examen final. Votre réussite est désormais enregistrée sur Jobsy.
          </p>
        </div>

        {/* Encadré Récapitulatif (S'adapte parfaitement partout) */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 text-left space-y-4">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Formation validée</span>
            <span className="text-sm font-black text-slate-800 uppercase tracking-tight block mt-0.5 wrap-break-word">
              {courseTitle}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60 text-[11px]">
            <div>
              <span className="text-slate-400 font-bold block">Délivré par</span>
              <span className="text-slate-700 font-extrabold">Comité Pédagogique Jobsy</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">ID de vérification</span>
              <code className="text-xs font-mono text-blue-600 font-bold break-all">
                {certificateHash.substring(0, 10)}...
              </code>
            </div>
          </div>
        </div>

        {/* Actions de partage et téléchargement */}
        <div className="space-y-3 pt-2">
          <button onClick={handleDownloadPDF} className="cursor-pointer w-full py-4 bg-[#000080] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:bg-blue-900 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Télécharger mon diplôme (PDF)
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleCopyHash}
              className="cursor-pointer py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copié !" : "Lien"}
            </button>

            <Link 
              href={`/verify/${certificateHash}`}
              target="_blank"
              className="cursor-pointer py-3.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-1"
            >
              Vérifier <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}