"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldCheck, ShieldAlert, Calendar, User, BookOpen, Loader2, Download } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface VerificationData {
  recipient_name: string;
  course_title: string;
  course_id: number;
  certified_at: string;
  certificate_hash: string;
  status: string;
}

export default function VerifyCertificatePage() {
  const { hash } = useParams();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log(hash)

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        // Remplacer par ton URL d'API appropriée
        const response = await api.get(`/certificates/verify/${hash}`);
        console.log(response.data.data)
        if (response.data.status == "valid") {
          setCertData(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Une erreur est survenue lors de la vérification.");
      } finally {
        setLoading(false);
      }
    };

    if (hash) verifyCertificate();
  }, [hash]);

  // 1. ÉTAT DE CHARGEMENT
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#000080] animate-spin mb-2" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vérification de l&apos;authenticité...</p>
      </div>
    );
  }

  // 2. ÉTAT D'ERREUR (Certificat invalide ou falsifié)
  if (error || !certData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-4xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-3xl">
            <ShieldAlert className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Certification non vérifiée</h1>
            <p className="text-xs text-red-600 bg-red-50/60 py-2 px-3 rounded-xl font-medium leading-relaxed">
              {error || "Ce code de certification n'existe pas dans la base de données Jobsy."}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez contacter le support académique de Jobsy.
          </p>
          <div className="pt-2">
            <Link href="/" className="inline-block text-xs font-black text-[#000080] uppercase tracking-widest bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl w-full hover:bg-slate-100 transition-all">
              Retourner sur Jobsy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try { 
        // Avec Axios, on passe la configuration en 2e paramètre pour un GET
        const response = await api.get(`/courses/${certData.course_id}/${hash}/certificate/download`, {
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
        a.download = `Certificat_${certData.course_title.replace(/\s+/g, "_")}.pdf`;
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

  // 3. ÉTAT SUCCÈS (Certificat valide - Vue Recruteur)
  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-white border border-slate-100 rounded-4xl p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
        
        {/* Badge décoratif de confiance */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50/50 rounded-full blur-2xl pointer-events-none" />

        {/* En-tête de validation */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-green-50 text-green-600 rounded-3xl shadow-sm mb-2">
            <ShieldCheck className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div>
            <span className="text-[9px] font-black text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {certData.status}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Document Officiel Vérifié
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
            Le Comité Pédagogique de Jobsy confirme l&apos;authenticité des compétences numériques acquises par ce candidat.
          </p>
        </div>

        {/* Détails de la Certification (Grille Pro) */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
          
          {/* Nom du candidat */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl border border-slate-200/60 text-slate-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Titulaire du certificat</span>
              <span className="text-sm font-black text-slate-800 capitalize block mt-0.5">
                {certData.recipient_name}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-200/60 w-full" />

          {/* Titre du parcours */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl border border-slate-200/60 text-[#000080] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Compétence certifiée</span>
              <span className="text-sm font-black text-[#000080] uppercase tracking-tight block mt-0.5 leading-tight">
                {certData.course_title}
              </span>
            </div>
          </div>

          <div className="h-px bg-slate-200/60 w-full" />

          {/* Date de délivrance */}
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl border border-slate-200/60 text-slate-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Date d&apos;attribution</span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                {certData.certified_at || "Récemment"}
              </span>
            </div>
          </div>

        </div>

        {/* Signature Cryptographique en bas */}
        <div className="text-center space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Empreinte numérique d&apos;authentification</span>
          <code className="text-[10px] font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg block truncate max-w-full font-bold">
            {certData.certificate_hash}
          </code>

          <button onClick={handleDownloadPDF} className="w-full cursor-pointer mt-4 p-4 bg-[#000080] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/10 hover:bg-blue-900 active:scale-95 flex items-center justify-center transition-all gap-2">
            <Download className="w-3 h-3" /> Télécharger le certificat
          </button>
        </div>

        {/* Logo Jobsy discret */}
        <div className="text-center pt-2">
          <span className="text-xs font-black tracking-tight text-slate-300">
            JOBSY<span className="text-slate-200">.</span>
          </span>
        </div>

      </div>
    </div>
  );
}