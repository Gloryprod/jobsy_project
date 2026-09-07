// 'use client';

// import { useState } from 'react';
// import { DataView } from 'primereact/dataview';
// import { Tag } from 'primereact/tag';
// import { Button } from 'primereact/button';
// import useSWR, {mutate} from "swr";
// import api from "@/lib/api";
// import { CheckCircle, Download, XCircle } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { use } from "react";
// import { ThreeDots } from 'react-loader-spinner';
// import PageInfo from '@/components/PageInfo';
// import { useKKiaPay } from 'kkiapay-react';

// const fetcher = (url: string) => api.get(url).then(res => res.data.data); 

// interface Candidat{
//     id: number;
//     domaine_competence : string;
//     niveau_etude : string;
//     bio : string;
//     ville : string;
//     user:{
//         nom : string;
//         prenom : string;
//         email : string;
//         role : string
//     }
// }




// interface MissionOffer {
//     id: number;
//     application_id: number;
//     start_date: string;
//     place: string;
//     onboarding_instructions: string;
//     contact_person: string;
//     expires_at: string;
//     accepted_at: string;
//     declined_at: string;
//     decline_reason: string;
//     application : Application
//     status: 'accepted' | 'service_started' | 'in_progress' | 'work_finished' | 'validated' | 'completed' | 'rejected_after_onboarding';
//     contract_path: string;
//     notified_presence_at: Date,
//     started_at: string
// }

// interface Application {
//     id: number;
//     candidat_id: number;
//     mission_id: number;
//     status: 'draft' | 'pending' | 'accepted'| 'rejected';
//     global_score: number;
//     badge: string;
//     ai_summary: string;
//     created_at: string;
//     completed_at: string;
//     updated_at: string;
//     mission: Mission
//     candidat: Candidat
// }

// interface Mission {
//   id: number;
//   title: string;
//   company: string;
//   location: string;
//   reward: number;
//   duration: string;
//   deadline: string;
//   urgency: 'normal' | 'urgent' | 'premium';
//   test_severity: 'light' | 'standard' | 'expert';
//   applicants: number;
//   type_contrat: string;
//   active: boolean;
//   min_rank_required: string;
//   applications:Application[]
//   closed_at:string
//   entreprise: {
//     wallet: {
//       balance: number;
//     }
//   }
// }

// export default function EnterpriseTrackingPage({ params }: { params: Promise<{ id: string }> }) {
//     const {id} = use(params);
//     const { data: offers = [], isLoading, error } = useSWR<MissionOffer[]>(`/entreprise/confirmed-applicants/${id}`, fetcher);
//     const [expandedId, setExpandedId] = useState<number | null>(null);
//     const pageLink = `/dashboard/entreprises/missions/${id}/confirmedApplicants`;
//     const { openKkiapayWidget } = useKKiaPay();

//     const itemTemplate = (offer: MissionOffer) => {
//         const isExpanded = expandedId === offer.id;
//         const candidat = offer.application.candidat;
//         const mission = offer.application.mission;
//         const balance = offer.application.mission.entreprise.wallet.balance;

//         const getStatusSeverity = (status: string) => {
//             switch (status) {
//                 case 'in_progress': return 'info';
//                 case 'completed': return 'success';
//                 case 'accepted': return 'warning';
//                 case 'rejected_after_onboarding': return 'danger';
//                 default: return null;
//             }
//         };

//         const handleUpdateStatus = async (offerId: number, nextStatus: string) => {
//             try {   
//                 const response = await api.post(`/mission-offers/${offerId}/update-status`, { status: nextStatus });
//                 toast.success(response.data.message);
//                 mutate(`/entreprise/confirmed-applicants/${id}`); 
//             } catch (err) {
//                 toast.error("Erreur lors de l'opération. Veuillez réessayer.");
//             }
//         };


//         const handlePayment = async (amount: number, offerId: number) => {
//             try {
//                 // Si le solde du portefeuille est insuffisant -> On passe par KkiaPay
//                 if (balance < amount) {
//                     const response = await api.post('/entreprise/payments/initiate-kkiapay', { 
//                         amount, 
//                         candidat_id: candidat.id
//                     });
                    
//                     const { public_key, entreprise_id } = response.data;

//                     // 2. Ouvrir le widget KkiaPay
//                     openKkiapayWidget({
//                         amount: amount,
//                         api_key: public_key,
//                         sandbox: true, 
//                         phone: "97000000",
//                         data: JSON.stringify({
//                             entreprise_id: entreprise_id,
//                             offer_id: offerId 
//                         }), 
//                     }); 

//                     toast.loading("Ouverture de la passerelle de paiement...");

//                 } else {
//                     const response = await api.post('/entreprise/payments/lock_funds', { amount, offerId });
                    
//                     if (response.data.status === 'success') {
//                         toast.success(response.data.message || "Fonds bloqués avec succès depuis votre portefeuille !");
//                     } else {
//                         toast.error(response.data.message || "Impossible de bloquer les fonds.");
//                     }
//                 }
                
//             } catch (err: any) {
//                 const errorMessage = err.response?.data?.message || "Un problème est survenu lors du paiement. Veuillez réessayer";
//                 toast.error(errorMessage);
//             }
//         };

//         return (
//         <div className={`mb-4 rounded-2xl border transition-all ${isExpanded ? 'border-indigo-600 shadow-lg' : 'bg-white'}`}>
            
//             {/* LIGNE RÉSUMÉE : CANDIDAT + MISSION */}
//             <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : offer.id)}>
//             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
//                 {candidat.user.nom.charAt(0)}
//             </div>
            
//             <div className="flex-1">
//                 <h3 className="font-bold text-slate-800">{candidat.user.nom} {candidat.user.prenom}</h3>
//                 <p className="text-xs text-slate-400 font-medium">Sur la mission : <span className="text-indigo-600">{mission.title}</span></p>
//             </div>

//             {offer.started_at && (
//                     <a href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${offer.contract_path}`} 
//                         target="_blank" 
//                         className="flex text-green-500 items-center border-b border-[#000080] rounded-xl p-2 gap-2">
//                         <Download size={18} /> Contrat de travail
//                     </a>
//                 )
//             }

//             <div className="hidden md:block">
//                 <Tag value={offer.status} severity={getStatusSeverity(offer.status)} />
//             </div>

//             <Button icon={isExpanded ? "pi pi-chevron-up" : "pi pi-chevron-down"} className="p-button-rounded p-button-text text-slate-400" />
//             </div>

//             {/* PANNEAU DE CONTRÔLE DÉTAILLÉ */}
//             {isExpanded && (
//             <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
//                 {/* Infos Candidat */}
//                 <div className="space-y-2">
//                     <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">État du suivi</h4>
//                     <div className="flex items-center gap-4 py-2">
//                         <div className={`p-2 rounded-lg ${offer.notified_presence_at ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
//                             <CheckCircle size={20} />
//                         </div>
//                         <div>
//                             <p className="text-sm font-bold">Prise de service notifiée</p>
//                             <p className="text-xs text-slate-400">{offer.notified_presence_at ? `Le ${new Date(offer.notified_presence_at).toLocaleString()}` : 'En attente...'}</p>
//                         </div>
//                     </div>
                    
//                 </div>

//                 {/* BOUTONS D'ACTION (Côté Entreprise) */}
//                 <div className="flex flex-col justify-center">
//                     {offer.status === 'service_started' && (
//                     <div className="flex gap-3 w-full">
//                         {/* BOUTON VALIDER */}
//                         <Button 
//                             label="Valider et Démarrer" 
//                             icon="pi pi-check"
//                             className="flex-1 bg-[#000080] text-white rounded-3xl border-none font-bold py-3"
//                             onClick={() => {handleUpdateStatus(offer.id, 'in_progress'); handlePayment(offer.application.mission.reward, offer.id)}}
//                         />

//                         {/* BOUTON RECALER */}
//                         <Button 
//                             label="Recaler" 
//                             icon="pi pi-times"
//                             className="flex-1 bg-red-600 text-white rounded-3xl border-none font-bold py-3"
//                             onClick={() => handleUpdateStatus(offer.id, 'rejected_after_onboarding')}
//                         />
//                     </div>
//                     )}

//                     {offer.status === 'rejected_after_onboarding' && (
//                     <div className="flex gap-2 w-full">
//                         <div className="flex justify-center text-red-500">
//                         <XCircle size={30} />
//                         </div>
//                         <h4 className="text-red-700 font-black uppercase pt-1 text-sm">Non Validé</h4>
//                     </div>
//                     )}

//                     {offer.status === 'in_progress' && (
//                         <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
//                             <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Mission en cours</p>
//                             <p className="text-[10px] text-slate-500">En attente que le candidat déclare la fin de sa mission.</p>
//                         </div>
//                     )}

//                     {offer.status === 'work_finished' && (
//                     <Button 
//                         label="Valider le travail" 
//                         className="bg-emerald-600 text-white rounded-3xl border-none font-bold py-3"
//                         onClick={() => handleUpdateStatus(offer.id, 'validated')}
//                     />
//                     )}
//                 </div>

//                 </div>
//             </div>
//             )}
//         </div>
//         );
//     };

//     if (isLoading) return (
//         <div className="flex justify-center items-center h-screen">
//         <ThreeDots height="80" width="80" color="#000080" visible={true} />
//         </div>
//     );

//     if (error) return (
//         <div className="min-h-screen flex items-center justify-center">
//         <p className="text-black">Erreur de chargement des offres. Veuillez réessayer plus tard.</p>
//         </div>
//     );

//     return (
//         <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
//             <div className="mb-6">
//                 <PageInfo pageName="Gestion des candidats" pageLink={pageLink} />
//             </div>

//             <div className="mb-8 ">
//                 <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Suivi des candidats en mission</h1>
//                 <p className="text-slate-500 flex items-center justify-center"><i>Vue d&apos;ensemble des candidats qui ont confirmé l&apos;offre</i></p>
//             </div>          
//             <DataView value={offers} itemTemplate={itemTemplate} layout="list" />
//         </div>
//     );
// }

'use client';

import { useState, use } from 'react';
import { DataView } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import { CheckCircle, Download, XCircle, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThreeDots } from 'react-loader-spinner';
import PageInfo from '@/components/PageInfo';
import { useKKiaPay } from 'kkiapay-react';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

interface Candidat {
    id: number;
    domaine_competence: string;
    niveau_etude: string;
    bio: string;
    ville: string;
    user: {
        nom: string;
        prenom: string;
        email: string;
        role: string;
    };
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
    application: Application;
    status: 'accepted' | 'service_started' | 'in_progress' | 'work_finished' | 'validated' | 'completed' | 'rejected_after_onboarding';
    contract_path: string;
    notified_presence_at: Date;
    started_at: string;
    is_on_time?: boolean;
    rating?: number;
    recruiter_review?: string;
}

interface Application {
    id: number;
    candidat_id: number;
    mission_id: number;
    status: 'draft' | 'pending' | 'accepted' | 'rejected';
    global_score: number;
    badge: string;
    ai_summary: string;
    created_at: string;
    completed_at: string;
    updated_at: string;
    mission: Mission;
    candidat: Candidat;
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
    applications: Application[];
    closed_at: string;
    entreprise: {
        wallet: {
            balance: number;
        };
    };
}

export default function EnterpriseTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: offers = [], isLoading, error } = useSWR<MissionOffer[]>(`/entreprise/confirmed-applicants/${id}`, fetcher);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const pageLink = `/dashboard/entreprises/missions/${id}/confirmedApplicants`;
    const { openKkiapayWidget } = useKKiaPay();

    // Modals state
    const [selectedOffer, setSelectedOffer] = useState<MissionOffer | null>(null);
    const [showPunctualityDialog, setShowPunctualityDialog] = useState(false);
    const [showRatingDialog, setShowRatingDialog] = useState(false);

    // Form data state
    const [isOnTime, setIsOnTime] = useState<boolean | null>(null);
    const [rating, setRating] = useState<number>(5);
    const [review, setReview] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    // Mettre à jour le statut et transmettre les champs supplémentaires
    const handleUpdateStatus = async (offerId: number, nextStatus: string, payload: Record<string, any> = {}) => {
        try {
            setSubmitting(true);
            const response = await api.post(`/mission-offers/${offerId}/update-status`, {
                status: nextStatus,
                ...payload,
            });
            toast.success(response.data.message || "Mise à jour effectuée avec succès.");
            mutate(`/entreprise/confirmed-applicants/${id}`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Erreur lors de l'opération. Veuillez réessayer.";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Soumission du formulaire de ponctualité ("Valider et Démarrer")
    const handleConfirmStart = async () => {
        if (isOnTime === null) {
            toast.error("Veuillez indiquer si le candidat est arrivé à l'heure.");
            return;
        }

        if (!selectedOffer) return;

        setShowPunctualityDialog(false);
        
        // Exécuter la mise à jour du statut avec is_on_time
        await handleUpdateStatus(selectedOffer.id, 'in_progress', { is_on_time: isOnTime });
        
        // Exécuter le paiement / blocage des fonds
        await handlePayment(selectedOffer.application.mission.reward, selectedOffer.id, selectedOffer.application.candidat.id, selectedOffer.application.mission.entreprise.wallet.balance);
        
        setSelectedOffer(null);
        setIsOnTime(null);
    };

    // Soumission du formulaire de notation ("Valider le travail")
    const handleConfirmValidation = async () => {
        if (!rating || rating < 1) {
            toast.error("Veuillez attribuer une note globale.");
            return;
        }

        if (!selectedOffer) return;

        setShowRatingDialog(false);

        await handleUpdateStatus(selectedOffer.id, 'validated', {
            rating: rating,
            recruiter_review: review,
        });

        setSelectedOffer(null);
        setRating(5);
        setReview('');
    };

    const handlePayment = async (amount: number, offerId: number, candidatId: number, balance: number) => {
        try {
            if (balance < amount) {
                const response = await api.post('/entreprise/payments/initiate-kkiapay', {
                    amount,
                    candidat_id: candidatId,
                });

                const { public_key, entreprise_id } = response.data;

                openKkiapayWidget({
                    amount: amount,
                    api_key: public_key,
                    sandbox: true,
                    phone: "97000000",
                    data: JSON.stringify({
                        entreprise_id: entreprise_id,
                        offer_id: offerId,
                    }),
                });

                toast.loading("Ouverture de la passerelle de paiement...");
            } else {
                const response = await api.post('/entreprise/payments/lock_funds', { amount, offerId });

                if (response.data.status === 'success') {
                    toast.success(response.data.message || "Fonds bloqués avec succès depuis votre portefeuille !");
                } else {
                    toast.error(response.data.message || "Impossible de bloquer les fonds.");
                }
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Un problème est survenu lors du paiement. Veuillez réessayer";
            toast.error(errorMessage);
        }
    };

    const itemTemplate = (offer: MissionOffer) => {
        const isExpanded = expandedId === offer.id;
        const candidat = offer.application.candidat;
        const mission = offer.application.mission;

        const getStatusSeverity = (status: string) => {
            switch (status) {
                case 'in_progress': return 'info';
                case 'validated':
                case 'completed': return 'success';
                case 'accepted': return 'warning';
                case 'rejected_after_onboarding': return 'danger';
                default: return null;
            }
        };

        return (
            <div className={`mb-4 rounded-2xl border transition-all ${isExpanded ? 'border-indigo-600 shadow-lg' : 'bg-white'}`}>
                {/* LIGNE RÉSUMÉE : CANDIDAT + MISSION */}
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : offer.id)}>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
                        {candidat.user.nom.charAt(0)}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{candidat.user.nom} {candidat.user.prenom}</h3>
                        <p className="text-xs text-slate-400 font-medium">Sur la mission : <span className="text-indigo-600">{mission.title}</span></p>
                    </div>

                    {offer.started_at && (
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${offer.contract_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex text-green-500 items-center border-b border-[#000080] rounded-xl p-2 gap-2">
                            <Download size={18} /> Contrat de travail
                        </a>
                    )}

                    <div className="hidden md:block">
                        <Tag value={offer.status} severity={getStatusSeverity(offer.status)} />
                    </div>

                    <Button icon={isExpanded ? "pi pi-chevron-up" : "pi pi-chevron-down"} className="p-button-rounded p-button-text text-slate-400" />
                </div>

                {/* PANNEAU DE CONTRÔLE DÉTAILLÉ */}
                {isExpanded && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Infos Candidat */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">État du suivi</h4>
                                <div className="flex items-center gap-4 py-2">
                                    <div className={`p-2 rounded-lg ${offer.notified_presence_at ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Prise de service notifiée</p>
                                        <p className="text-xs text-slate-400">{offer.notified_presence_at ? `Le ${new Date(offer.notified_presence_at).toLocaleString()}` : 'En attente...'}</p>
                                    </div>
                                </div>

                                {offer.is_on_time !== undefined && offer.is_on_time !== null && (
                                    <p className="text-xs text-slate-600 font-medium">
                                        Ponctualité : <span className={offer.is_on_time ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                            {offer.is_on_time ? "À l'heure" : "En retard"}
                                        </span>
                                    </p>
                                )}

                                {offer.rating && (
                                    <div className="flex items-center gap-1 text-amber-500 text-sm font-bold pt-1">
                                        <Star size={16} fill="currentColor" /> {offer.rating} / 5
                                    </div>
                                )}
                            </div>

                            {/* BOUTONS D'ACTION (Côté Entreprise) */}
                            <div className="flex flex-col justify-center">
                                {offer.status === 'service_started' && (
                                    <div className="flex gap-3 w-full">
                                        {/* BOUTON VALIDER & DÉMARRER -> Ouvre le popup Ponctualité */}
                                        <Button
                                            label="Valider et Démarrer"
                                            icon="pi pi-check"
                                            className="flex-1 bg-[#000080] text-white rounded-3xl border-none font-bold py-3"
                                            onClick={() => {
                                                setSelectedOffer(offer);
                                                setIsOnTime(null);
                                                setShowPunctualityDialog(true);
                                            }}
                                        />

                                        {/* BOUTON RECALER */}
                                        <Button
                                            label="Recaler"
                                            icon="pi pi-times"
                                            className="flex-1 bg-red-600 text-white rounded-3xl border-none font-bold py-3"
                                            onClick={() => handleUpdateStatus(offer.id, 'rejected_after_onboarding')}
                                        />
                                    </div>
                                )}

                                {offer.status === 'rejected_after_onboarding' && (
                                    <div className="flex gap-2 w-full">
                                        <div className="flex justify-center text-red-500">
                                            <XCircle size={30} />
                                        </div>
                                        <h4 className="text-red-700 font-black uppercase pt-1 text-sm">Non Validé</h4>
                                    </div>
                                )}

                                {offer.status === 'in_progress' && (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                                        <p className="text-xs font-bold text-indigo-600 uppercase mb-2">Mission en cours</p>
                                        <p className="text-[10px] text-slate-500">En attente que le candidat déclare la fin de sa mission.</p>
                                    </div>
                                )}

                                {offer.status === 'work_finished' && (
                                    /* BOUTON VALIDER LE TRAVAIL -> Ouvre le popup Evaluation & Rating */
                                    <Button
                                        label="Valider le travail"
                                        className="bg-emerald-600 text-white rounded-3xl border-none font-bold py-3"
                                        onClick={() => {
                                            setSelectedOffer(offer);
                                            setRating(5);
                                            setReview('');
                                            setShowRatingDialog(true);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-black">Erreur de chargement des offres. Veuillez réessayer plus tard.</p>
        </div>
    );

    return (
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Gestion des candidats" pageLink={pageLink} />
            </div>

            <div className="mb-8 ">
                <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Suivi des candidats en mission</h1>
                <p className="text-slate-500 flex items-center justify-center"><i>Vue d&apos;ensemble des candidats qui ont confirmé l&apos;offre</i></p>
            </div>

            <DataView value={offers} itemTemplate={itemTemplate} layout="list" />

            {/* POPUP 1 : PONCTUALITÉ (Prise de service) */}
            <Dialog
                header="Validation de la prise de service"
                visible={showPunctualityDialog}
                style={{ width: '450px' }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                maskClassName="bg-black/50 backdrop-blur-sm"
                pt={{
                    root: { className: 'bg-white rounded-2xl shadow-2xl overflow-hidden' },
                    header: { className: 'bg-white p-6 border-b border-slate-100 text-slate-800 font-bold' },
                    content: { className: 'bg-white p-6' },
                    mask: { className: 'bg-black/50 backdrop-blur-sm' }
                }}
                onHide={() => setShowPunctualityDialog(false)}
                draggable={false}
                resizable={false}
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-900 bg-indigo-50 p-3 rounded-lg">
                        <Clock size={24} />
                        <p className="text-sm">Le candidat est-il arrivé à l&apos;heure convenue pour sa prise de service ?</p>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOnTime(true)}
                            className={`cursor-pointer flex-1 py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                isOnTime === true
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                            }`}
                        >
                            <CheckCircle size={18} /> Oui, à l&apos;heure
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsOnTime(false)}
                            className={`cursor-pointer flex-1 py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                isOnTime === false
                                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-red-500'
                            }`}
                        >
                            <XCircle size={18} /> Non, en retard
                        </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button label="Annuler" icon="pi pi-times" className="p-button-text text-slate-500" onClick={() => setShowPunctualityDialog(false)} />
                        <Button
                            label="Confirmer & Démarrer"
                            icon="pi pi-check"
                            className="bg-[#000080] text-white rounded-xl border-none font-bold px-4 py-2"
                            onClick={handleConfirmStart}
                            loading={submitting}
                        />
                    </div>
                </div>
            </Dialog>

            {/* POPUP 2 : EVALUATION POST-MISSION (Rating + Review) */}
            <Dialog
                header="Évaluation de fin de mission"
                visible={showRatingDialog}
                style={{ width: '500px' }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                maskClassName="bg-black/50 backdrop-blur-sm"
                pt={{
                    root: { className: 'bg-white rounded-2xl shadow-2xl overflow-hidden' },
                    header: { className: 'bg-white p-6 border-b border-slate-100 text-slate-800 font-bold' },
                    content: { className: 'bg-white p-6' },
                    mask: { className: 'bg-black/50 backdrop-blur-sm' }
                }}
                onHide={() => setShowRatingDialog(false)}
                draggable={false}
                resizable={false}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Veuillez évaluer la prestation du candidat avant de valider la fin de la mission.
                    </p>

                    <div className="flex flex-col items-center gap-2 py-2 bg-slate-50 rounded-xl border border-slate-100 p-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">Note globale (sur 5)</label>
                        <Rating
                            value={rating}
                            onChange={(e) => setRating(e.value ?? 5)}
                            cancel={false}
                            stars={5}
                            className="text-amber-500"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Avis / Commentaire (Optionnel)</label>
                        <InputTextarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={4}
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            placeholder="Partagez votre retour d'expérience sur la mission du candidat..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Button label="Annuler" icon="pi pi-times" className="p-button-text text-slate-500" onClick={() => setShowRatingDialog(false)} />
                        <Button
                            label="Valider le travail"
                            icon="pi pi-check"
                            className="bg-emerald-600 text-white rounded-xl border-none font-bold px-4 py-2"
                            onClick={handleConfirmValidation}
                            loading={submitting}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}