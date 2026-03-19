"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Clock, User, 
  Info, CheckCircle, XCircle, ChevronRight,
  ShieldCheck, Banknote, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";
import { useCountdown } from "@/hooks/useCountdown"; // Ajuste le chemin

export default function MissionConfirmationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onResponse, setOnResponse] = useState(true);

  const timeLeft = useCountdown(offer?.expires_at);
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 3600000; // Moins d'une heure

  useEffect(() => {
    api.get(`/candidat/mission-offers/${id}`).then(res => {
      setOffer(res.data.data);
      setLoading(false);
    });
  }, [id]);

  const handleResponse = async (status: 'accepted' | 'declined') => {
    try {
      await api.post(`/candidat/mission-offers/${id}/respond`, { status });
      toast.success(`Offre ${status === 'accepted' ? 'acceptée' : 'déclinée'} avec succès.`);
      setOnResponse(false)
    } catch (error) {
      toast.error("Erreur lors de la réponse");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="w-full bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
        
        {/* HEADER : Célébration */}
        <div className="bg-[#000080] p-8 text-center text-white relative">
          <div className="absolute top-4 right-6 opacity-20">
            <ShieldCheck size={100} />
          </div>
          <CheckCircle className="mx-auto mb-4 text-emerald-400" size={48} />
          <h1 className="text-2xl font-black italic uppercase tracking-tight">Félicitations !</h1>
          <p className="opacity-80 mt-2 font-medium">Vous avez été sélectionné par {offer.application.mission.company}</p>
        </div>

        {/* CORPS : Détails de la mission */}
        <div className="p-8 space-y-8">
          
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
               <Banknote className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Rémunération prévue</p>
              <p className="text-lg font-black text-slate-800">{offer.application.mission.reward} €</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <DetailItem icon={<Calendar size={18}/>} label="Date de début" value={format(new Date(offer.start_date), 'EEEE d MMMM yyyy', {locale: fr})} />
              <DetailItem icon={<Clock size={18}/>} label="Heure d'arrivée" value={offer.start_time} />
            </div>
            <div className="space-y-4">
              <DetailItem icon={<MapPin size={18}/>} label="Lieu du RDV" value={offer.place} />
              <DetailItem icon={<User size={18}/>} label="Contact sur place" value={offer.contact_person} />
            </div>
          </div>

          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
            <h3 className="flex items-center gap-2 text-[#000080] font-black text-sm uppercase mb-3">
              <Info size={16} /> Instructions d&apos;intégration
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: offer.onboarding_instructions?.replace(/\n/g, '<br />') || "Aucune instruction particulière spécifiée." }} />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => handleResponse('accepted')}
              disabled={timeLeft.total <= 0}
              className="cursor-pointer flex-1 h-14 bg-[#000080] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#000060] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ..."
            >
              Confirmer ma présence <ChevronRight size={20} />
            </button>
           
            <button 
              onClick={() => handleResponse('declined')}
              className="cursor-pointer px-8 h-14 bg-white text-red-500 border-2 border-red-50 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all"
            >
              Décliner
            </button>
          </div>
          
          <div className="space-y-4 text-center">
            {/* AFFICHAGE DU COMPTE À REBOURS */}
            {onResponse && 
              (  
                <>
                {timeLeft.total > 0 ? (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                    isUrgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Clock size={14} />
                    Cette offre expire dans : {timeLeft.days > 0 && `${timeLeft.days}j `}
                    {timeLeft.hours.toString().padStart(2, '0')}h : 
                    {timeLeft.minutes.toString().padStart(2, '0')}m : 
                    {timeLeft.seconds.toString().padStart(2, '0')}s
                  </div>
                ) : (
                  <div className="text-red-600 font-black uppercase text-xs">
                    ⚠️ Cette offre a expiré
                  </div>
                )}
                </>
              )
            }

            {/* TON TEXTE ORIGINAL SÉCURISÉ */}
            <p className="text-[10px] text-slate-400 uppercase font-bold italic">
              Réponse attendue avant le {format(new Date(offer.expires_at), 'Pp', { locale: fr })}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 mt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}