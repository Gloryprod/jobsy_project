'use client';

import useSWR from "swr";
import api from "@/lib/api";
import { use } from "react";
import { ThreeDots } from "react-loader-spinner";
import PageInfo from "@/components/PageInfo";
import { ArrowRight, Star, MapPin, GraduationCap, CheckCircle } from "lucide-react";
import Avatar from "@/components/Avatar";
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Editor, EditorTextChangeEvent } from 'primereact/editor';
import { toast } from 'react-hot-toast';


interface Candidat{
    id: number;
    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;
    user:{
        nom : string;
        prenom : string;
        email : string;
        role : string
    }
}

interface Assessment {
    id: number;
    application_id: number;
    step_1_data: JSON;
    step_2_data: JSON;
    ai_feedback_details: JSON;
}

interface Mission {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string;
  deadline: string;
  urgency: 'normal' | 'urgent' | 'premium';
  test_severity: 'light' | 'standard' | 'expert';
  applicants: number;
  type_contrat: string;
  active: boolean;
  min_rank_required: string;
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
    candidat: Candidat;
    assessment: Assessment;

}

const fetcher = (url: string) => api.get(url).then(res => res.data.data); 

const getBadgeStyle = (badge: string) => {
    switch (badge?.toUpperCase()) {
        case 'EXPERT': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'JUNIOR': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
};

export default function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    const {id} = use(params);
    const { data: applications, isLoading, error } = useSWR<Application[] | []>(`/missions/${id}/applications`, fetcher);
    const pageLink = `/dashboard/entreprises/missions/${id}/applications`;
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [invitationDetails, setInvitationDetails] = useState({
        start_date: '',
        start_time: '',
        place: '',
        contact_person: '',
        onboarding_instructions: '',
        expiry_date: ''
    });

    const handleCheckboxChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        const appId = parseInt(value, 10);
        
        setSelectedIds(prevCheckedItems => {
        if (checked) {
            if (applications) {
                for (const app of applications) {
                    if (app.id === appId) {
                        setSelectedApp([app]);
                        break;
                    }            
                }
            }
            return [...prevCheckedItems, appId];
        } else {
            setSelectedApp(selectedApp.filter(app => app.id !== appId));
            return prevCheckedItems.filter(item => item !== appId);
        }
        });
    };

    const  handleSelectApplicants = async () => {
        try {
            for (const app of selectedApp) {
                await api.post(`/entreprise/applications/${app.id}/select`, {
                    start_date: invitationDetails.start_date,
                    start_time: invitationDetails.start_time,
                    place: invitationDetails.place,
                    contact_person: invitationDetails.contact_person,
                    onboarding_instructions: invitationDetails.onboarding_instructions,
                    expires_at: invitationDetails.expiry_date
                });
            }
            toast.success("Invitation(s) de prise de service envoyée(s) avec succès !");
        } catch (error : any) {
            const messages = error.response?.data?.message;
            toast.error(messages);
        }

    };

    if (error) return <div>Failed to load</div>;
    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );

    return (
       <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Candidatures" pageLink={pageLink} />
            </div>

            <div className="mb-8 ">
                <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Candidatures</h1>
                <p className="text-slate-500 flex items-center justify-center"><i>Vue d&apos;ensemble des candidatures reçues pour cette mission</i></p>
            </div>

            <div className="flex items-end justify-end mb-6">
                <button onClick={() => {if (selectedApp.length > 0) {setOpenDialog(true)} else{toast.error("Veuillez sélectionner au moins un candidat.")}; }} className="p-2 mb-2 bg-[#000080] border-2 border-slate-100 hover:bg-[#000080] text-white rounded-xl font-bold text-sm transition-all gap-2 group cursor-pointer">
                    Accepter Candidature
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-6">
                {applications && applications.length > 0 ? applications.map((app) => {
                    return (
                        <div key={app.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div>
                                <input type="checkbox" className="w-4 h-4 border border-black rounded-xs bg-slate-50 mb-4" checked={selectedIds.some(a => a === app.id)} onChange={(e) => handleCheckboxChange({...e, target: {...e.target, value: app.id.toString()}})} />
                            </div>
                            {/* Score IA en haut à droite */}
                            <div className="absolute top-6 right-6 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-sm ${app.global_score >= 70 ? 'border-emerald-500 text-emerald-600' : 'border-slate-100 text-slate-400'}`}>
                                    {app.global_score}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Score IA</span>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                {/* Avatar avec initiales */}
                                <div className="w-14 h-14 bg-[#000080] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/20 shrink-0">
                                    <Avatar width = {70} height = {70} fontSize = {30} nom = {app.candidat.user.nom} prenom = {app.candidat.user.prenom} />
                                </div>
                                
                                <div className="pr-12">
                                    <h2 className="text-lg font-black text-slate-800 leading-tight">
                                        {app.candidat.user.prenom} {app.candidat.user.nom}
                                    </h2>
                                    <p className="text-indigo-600 font-bold text-xs uppercase tracking-wide mt-1">
                                        {app.candidat.domaine_competence}
                                    </p>
                                </div>
                            </div>

                            {/* <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <MapPin size={16} className="text-slate-300" />
                                    {app.candidat.ville}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <GraduationCap size={16} className="text-slate-300" />
                                    {app.candidat.niveau_etude}
                                </div>
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getBadgeStyle(app.badge)}`}>
                                    {app.badge || 'Analyse en cours'}
                                </div>
                            </div> */}

                            {/* IA Summary Box */}
                            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                                <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2">
                                    <Star size={12} className="inline mr-1 mb-1 text-amber-500" />
                                    {app.ai_summary || "Analyse de l'IA en attente..."}
                                </p>
                            </div>

                            <Link href={`/dashboard/entreprises/detailProfilCandidat/${app.candidat.id}`}>
                                <button className="w-full p-2 bg-white border-2 border-slate-100 hover:border-[#000080] hover:text-[#000080] text-slate-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group cursor-pointer">
                                    Voir le dossier complet
                                </button>
                            </Link>                               
                           
                        </div>
                    );
                }) : (
                    <div className="col-span-full text-center py-20">
                        <p className="text-slate-500 italic">Aucune candidature pour cette mission pour le moment.</p>
                    </div>
                )}
            </div>
                {/* <p>Currently selected: {JSON.stringify(selectedIds)}</p> */}

            {/* Dialog pour accepter la candidature */}
            {openDialog && (
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full text-[#000080]">
                                <CheckCircle size={24} />
                            </div>
                            <DialogTitle className="text-xl font-black">Félicitations !</DialogTitle>
                            </div>
                            <DialogDescription>
                            Vous sélectionnez le(s) candidats suivants <strong>{selectedApp.map(app => app.candidat.user.prenom).join(', ')} {selectedApp.map(app => app.candidat.user.nom).join(', ')} </strong> pour la mission.
                            Précisez les modalités de démarrage ci-dessous.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Date de début prévue</label>
                                    <Input name="start_date" type="date" value={invitationDetails.start_date} onChange={(e) => setInvitationDetails({...invitationDetails, start_date: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Heure de début prévue</label>
                                    <Input name="start_time" type="time" value={invitationDetails.start_time} onChange={(e) => setInvitationDetails({...invitationDetails, start_time: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Lieu de prise de service</label>
                                    <Input name="place" type="text" value={invitationDetails.place} onChange={(e) => setInvitationDetails({...invitationDetails, place: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Personne à contacter</label>
                                    <Input name="contact_person" type="text" placeholder="John Doe - 0145643456" value={invitationDetails.contact_person} onChange={(e) => setInvitationDetails({...invitationDetails, contact_person: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Instructions particulière</label>
                                <Editor name="onboarding_instructions" value={invitationDetails.onboarding_instructions || ""} className="w-full min-h-[120px] p-4 border rounded-xl focus:ring-2 focus:ring-[#000080]/20 outline-none text-gray-600"  style={{ height: '320px' }} onTextChange={(e: EditorTextChangeEvent) => setInvitationDetails({...invitationDetails, onboarding_instructions: e.htmlValue ?? ""})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Délai de validité de l&apos;offre</label>
                                <Input name="expiry_date" type="date" value={invitationDetails.expiry_date} onChange={(e) => setInvitationDetails({...invitationDetails, expiry_date: e.target.value})} />
                            </div>
                        </div>


                        <DialogFooter className="flex justify-end gap-4">
                            <Button className="cursor-pointer" onClick={() => setOpenDialog(false)} variant="ghost">Annuler</Button>
                            <Button className="bg-[#000080] hover:bg-[#000060] font-bold cursor-pointer" onClick={handleSelectApplicants}>
                                Envoyer l&apos;invitation
                            </Button>
                        </DialogFooter> 
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );

}


