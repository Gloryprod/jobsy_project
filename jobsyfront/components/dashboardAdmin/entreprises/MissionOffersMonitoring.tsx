"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge"; // Ou ton composant Badge perso
import { 
  Timer, CheckCircle2, XCircle, 
  ExternalLink, MailWarning, Eye 
} from "lucide-react";

interface Candidat {

    id: number;
    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;

    user:{
        id: number;
        nom : string;
        prenom : string;
        email : string;
        role : string
    }
   
}

interface MissionOffer {
    id: number;
    application_id: number;
    start_date: string;
    place: string;
    onboarding_instructions: string;
    contact_person: string;
    expires_at: string;
    accepted_at: string;
    declined_at: string;
    decline_reason: string;
    application : Application
}

interface Application {
    id: number;
    candidat_id: number;
    mission_id: number;
    status: 'draft' | 'pending' | 'accepted'| 'rejected';
    global_score: number;
    badge: string;
    ai_summary: string;
    created_at: string;
    completed_at: string;
    updated_at: string;
    candidat : Candidat
    mission_offers : MissionOffer
}

interface MissionOffersMonitoringProps {
    applications: Application[];
}

export default function MissionOffersMonitoring({ applications }: MissionOffersMonitoringProps) {

  const commonExpiry = applications.length > 0 
  ? new Date(Math.max(...applications.map(app => 
      new Date(app.mission_offers?.expires_at || 0).getTime()
    ))).toISOString()
  : null;
    
  const isExpired = commonExpiry ? new Date(commonExpiry) < new Date() : false;

  const getStatusBadge = (offer: MissionOffer) => {
    if (offer.accepted_at) 
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Accepté</Badge>;
    
    if (offer.declined_at) 
      return <Badge className="bg-red-100 text-red-700 border-red-200">Refusé</Badge>;
    
    const isExpired = new Date(offer.expires_at) < new Date();
    if (isExpired) 
      return <Badge className="bg-slate-100 text-slate-500 border-slate-200 italic">Expiré</Badge>;

    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 animate-pulse">En attente</Badge>;
  };

  return (
    <div className="">
      <div className="mb-4">
        <div>
          {commonExpiry && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isExpired ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isExpired ? 'bg-red-200 text-red-700' : 'bg-amber-200 text-amber-700'}`}>
                  <Timer size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60">Échéance de l'offre</p>
                  <p className={`font-bold ${isExpired ? 'text-red-700' : 'text-amber-800'}`}>
                    {new Date(commonExpiry).toLocaleString('fr-FR', { 
                      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              
              <Badge className={isExpired ? "bg-red-600" : "bg-amber-600 animate-pulse"}>
                {isExpired ? "Délai dépassé" : "Réponses en cours"}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">Candidat</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">Statut</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{application.candidat.user.nom} {application.candidat.user.prenom  }</p>
                </td>
                <td className="p-4">
                   {getStatusBadge(application.mission_offers)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="cursor-pointer p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-[#000080] transition-all">
                      <Eye size={18} />
                    </button>
                    {!application.mission_offers.accepted_at && !application.mission_offers.declined_at && !isExpired && (
                      <button 
                        title="Relancer manuellement"
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                      >
                        <MailWarning size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}