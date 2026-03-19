'use client';

import React from 'react';
import { 
  MapPin, Users, Zap, 
  Clock, ArrowRight, Banknote, 
  Briefcase, CheckCircle2
} from 'lucide-react';
import { getExpirationText } from '@/components/GetExpirationText';
import MissionOffersMonitoring from './MissionOffersMonitoring';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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
    mission_offers: MissionOffer
    candidat: Candidat
}

interface Mission {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string;
  deadline: string; // ISO string de l'API
  urgency: 'normal' | 'urgent' | 'premium';
  test_severity: 'light' | 'standard' | 'expert';
  applicants: number;
  type_contrat: string;
  active: boolean;
  min_rank_required: string;
  applications: Application[];
  closed_at:string
}

const MissionAdminCard = ({ mission }: { mission: Mission }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const applications = mission.applications

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-2xl hover:border-blue-100 transition-all duration-300 mb-4">
      
      {/* Status indicator (Active/Inactive) */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full ${mission.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />

      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        
        {/* SECTION 1: Titre et Entreprise */}
        <div className="flex-1 min-w-[250px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-400">#{mission.id}</span>
            {mission.applications.some(app => app.mission_offers) && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border bg-green-50 text-green-600 border-green-100  `}>
                Confirmée
              </span>
            )}
            {mission.closed_at && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border bg-green-50 text-red-600 border-green-100  `}>
                Cloturée
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-slate-800 group-hover:text-[#000080] transition-colors line-clamp-1">
            {mission.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <Briefcase size={14} className="text-slate-400" />
            <span className="font-semibold">{mission.company}</span>
            <span>•</span>
            <MapPin size={14} className="text-slate-400" />
            <span>{mission.location}</span>
          </div>
        </div>

        {/* SECTION 2: Métriques clés */}
        <div className="flex items-center gap-8 px-6 border-x border-slate-50">
            <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center text-[#000080]">
                <Users size={18} className="font-bold" />
                <span className="text-xl font-black">{mission.applications.length}</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Candidats</p>
            </div>
        </div>

        {/* SECTION 3: Détails Financiers & Temps */}
        <div className="flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 text-emerald-600 font-black">
            <Banknote size={16} />
            <span>{mission.reward} FCFA</span>
            <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600 uppercase">Gains</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Clock size={14} />
            <span>{getExpirationText(mission.deadline)}</span>
          </div>
        </div>

        {/* SECTION 4: Actions */}
        <div className="flex items-center gap-2">
        {mission.applications.some(app => app.mission_offers) ? 
          <button onClick={() => setShowDetails(true)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-[#000080] hover:text-white transition-all group/btn">
            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </button> : null}
        </div>

      </div>

      {/* Footer discret pour les tags additionnels */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase italic">
                <Zap size={12} /> Test {mission.test_severity}
            </div>
           
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <CheckCircle2 size={12} /> Contrat : {mission.type_contrat}
            </div>
        </div>

        {/* Modal de détails */}
        {
            showDetails && applications && (
            <Dialog open={showDetails} onOpenChange={setShowDetails}>             
                <DialogContent className="w-full rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>
                          <div className="flex justify-between items-end mb-8">
                            <div>
                              <h1 className="text-2xl font-black text-slate-800">Gestion des Engagements</h1>
                              <p className="text-slate-500 text-sm">Suivi des confirmations candidats en temps réel</p>
                            </div>
                          </div>
                        </DialogTitle>
                    </DialogHeader>
                    <MissionOffersMonitoring applications={applications} />
                </DialogContent>
            </Dialog>
                
            )
        }
    </div>
  );
};

export default MissionAdminCard;