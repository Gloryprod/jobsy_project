'use client';

import useSWR from "swr";
import api from "@/lib/api";
import { use, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import PageInfo from "@/components/PageInfo";
import { 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Clock, 
  XCircle, 
  Sparkles, 
  Mail,
  Briefcase,
  AlertCircle
} from "lucide-react";
import Avatar from "@/components/Avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Editor, EditorTextChangeEvent } from 'primereact/editor';
import { toast } from 'react-hot-toast';

interface OnboardingData {
  id?: number;
  start_date?: string;
  start_time?: string;
  place?: string;
  contact_person?: string;
  instructions?: string;
  expires_at?: string;
  declined_at?: string;
  status?: string;
}

interface Proposal {
  id: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  subject?: string;
  message?: string;
  sent_at?: string;
  responded_at?: string;
  candidat: {
    id: number | null;
    nom_complet: string;
    email: string | null;
    titre: string | null;
  };
  application_id: number | null;
  has_onboarding: boolean;
  onboarding: OnboardingData | null;
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function ProposalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Récupération des propositions faites sur la mission
  const { data: proposals, isLoading, error, mutate } = useSWR<Proposal[]>(
    `/missions/${id}/proposals`, 
    fetcher
  );

  const pageLink = `/dashboard/entreprises/missions/${id}/proposals`;

  // États pour la modale d'onboarding
  const [openOnboardingModal, setOpenOnboardingModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [invitationDetails, setInvitationDetails] = useState({
    start_date: '',
    start_time: '',
    place: '',
    contact_person: '',
    onboarding_instructions: '',
    expiry_date: ''
  });

  // Recherche & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredProposals = proposals?.filter(prop =>
    prop.candidat?.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.candidat?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((filteredProposals?.length ?? 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProposals?.slice(indexOfFirstItem, indexOfLastItem);

  // Ouverture de la modale avec pré-remplissage si un onboarding existe déjà
  const handleOpenOnboarding = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    if (proposal.onboarding) {
      setInvitationDetails({
        start_date: proposal.onboarding.start_date || '',
        start_time: proposal.onboarding.start_time || '',
        place: proposal.onboarding.place || '',
        contact_person: proposal.onboarding.contact_person || '',
        onboarding_instructions: proposal.onboarding.instructions || '',
        expiry_date: proposal.onboarding.expires_at || ''
      });
    } else {
      setInvitationDetails({
        start_date: '',
        start_time: '',
        place: '',
        contact_person: '',
        onboarding_instructions: '',
        expiry_date: ''
      });
    }
    setOpenOnboardingModal(true);
  };

  // Soumission de la configuration d'Onboarding
  const handleValidateOnboarding = async () => {
    if (!selectedProposal) return;

    if (!invitationDetails.start_date || !invitationDetails.start_time) {
      toast.error("Veuillez renseigner la date et l'heure de prise de service.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/proposals/${selectedProposal.id}/${selectedProposal.application_id}/onboarding`, {
        start_date: invitationDetails.start_date,
        start_time: invitationDetails.start_time,
        place: invitationDetails.place,
        contact_person: invitationDetails.contact_person,
        onboarding_instructions: invitationDetails.onboarding_instructions,
        expires_at: invitationDetails.expiry_date
      });

      toast.success("L'onboarding a été configuré et la proposition validée avec succès !");
      setOpenOnboardingModal(false);
      mutate(); // Rafraîchir les données SWR
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Une erreur est survenue lors de la configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-8 text-center text-red-500 font-bold">Erreur lors du chargement des propositions.</div>;
  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <ThreeDots height="80" width="80" color="#000080" visible={true} />
    </div>
  );

  return (
    <div className="min-h-screen relative p-4 md:p-8 space-y-10">
      <div>
        <PageInfo pageName="Propositions & Onboarding" pageLink={pageLink} />
      </div>

      <div className="text-center mx-auto space-y-2 max-w-md">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Propositions sur la Mission</h1>
        <p className="text-slate-500 text-sm">
          Consultez le statut des propositions transmises aux candidats et configurez l&apos;onboarding pour valider les offres acceptées.
        </p>
      </div>

      {/* Barre de Recherche */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par candidat, compétence..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080] transition-all outline-none"
          />
        </div>
      </div>

      {/* Grille des propositions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentItems && currentItems.length > 0 ? (
          currentItems.map((proposal) => {
            const isAccepted = proposal.status === 'accepted';
            const isPending = proposal.status === 'pending';
            const isDeclined = proposal.status === 'declined';
            const isExpired = proposal.status === 'expired';

            const isOfferAccepted = proposal.onboarding?.status === 'accepted';
            const isOfferDeclined = proposal.onboarding?.declined_at !== undefined && proposal.onboarding?.declined_at !== null;

            return (
              <div 
                key={proposal.id} 
                className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Badges de Statut */}
                  <div className="flex items-center justify-between">
                    {isPending && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-500" />
                        En attente
                      </span>
                    )}

                    {isAccepted && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-600" />
                        Proposition acceptée
                      </span>
                    )}

                    {isDeclined && (
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <XCircle size={14} className="text-rose-500" />
                        Refusée par le candidat
                      </span>
                    )}

                    {isExpired && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-slate-400" />
                        Expirée
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-slate-400">
                      {proposal.sent_at ? new Date(proposal.sent_at).toLocaleDateString("fr-FR") : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {isOfferAccepted && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-600" />
                        Offre acceptée
                      </span>
                    )}

                    {isOfferDeclined && (
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <XCircle size={14} className="text-rose-500" />
                        Offre refusée par le candidat
                      </span>
                    )}
                  </div>

                  {/* Informations du Candidat */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#000080] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      <Avatar 
                        width={48} 
                        height={48} 
                        fontSize={20} 
                        nom={proposal.candidat?.nom_complet || "Candidat"} 
                        prenom="" 
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-800 leading-snug">
                        {proposal.candidat?.nom_complet || "Candidat Anonyme"}
                      </h3>
                      {proposal.candidat?.titre && (
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Briefcase size={13} className="text-slate-400 shrink-0" />
                          {proposal.candidat.titre}
                        </p>
                      )}
                      {proposal.candidat?.email && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          {proposal.candidat.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indication / Bouton d'action pour l'onboarding */}
                <div className="pt-2">
                  {proposal.has_onboarding ? (
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-[#000080] font-bold">
                        <span className="flex items-center gap-1">
                          <CheckCircle size={14} />
                          Onboarding configuré
                        </span>
                        <button 
                          onClick={() => handleOpenOnboarding(proposal)}
                          className="text-xs underline hover:text-blue-900 font-semibold cursor-pointer"
                        >
                          Modifier
                        </button>
                      </div>
                      {proposal.onboarding?.start_date && (
                        <p className="text-slate-600 text-[11px]">
                          Début prévu : <span className="font-semibold">{proposal.onboarding.start_date}</span> {proposal.onboarding.start_time && `à ${proposal.onboarding.start_time}`}
                        </p>
                      )}
                    </div>
                  ) : isAccepted ? (
                    <button
                      onClick={() => handleOpenOnboarding(proposal)}
                      className="w-full py-3 px-4 bg-[#000080] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 animate-pulse ring-2 ring-blue-500/50 cursor-pointer"
                    >
                      <Sparkles size={16} />
                      Configurer l&apos;onboarding & Valider
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-400 italic text-sm">Aucune proposition enregistrée pour cette mission.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-[#000080] hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-[#000080] hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

       

      {/* ========================================== */}
      {/* MODALE D'ONBOARDING                        */}
      {/* ========================================== */}
      <Dialog open={openOnboardingModal} onOpenChange={setOpenOnboardingModal}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  Invitation de Prise de Service & Onboarding
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm">
                  Renseignez les modalités d&apos;accueil pour le candidat <strong className="text-slate-700">{selectedProposal?.candidat.nom_complet}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Date de début</label>
                          <Input name="start_date" type="date" value={invitationDetails.start_date} onChange={(e) => setInvitationDetails({...invitationDetails, start_date: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Heure de début</label>
                          <Input name="start_time" type="time" value={invitationDetails.start_time} onChange={(e) => setInvitationDetails({...invitationDetails, start_time: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Lieu</label>
                          <Input name="place" type="text" value={invitationDetails.place} onChange={(e) => setInvitationDetails({...invitationDetails, place: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Contact</label>
                          <Input name="contact_person" type="text" placeholder="Nom - Téléphone" value={invitationDetails.contact_person} onChange={(e) => setInvitationDetails({...invitationDetails, contact_person: e.target.value})} />
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Instructions particulières</label>
                      <Editor name="onboarding_instructions" value={invitationDetails.onboarding_instructions || ""} style={{ height: '180px' }} onTextChange={(e: EditorTextChangeEvent) => setInvitationDetails({...invitationDetails, onboarding_instructions: e.htmlValue ?? ""})} />
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Validité de l&apos;offre</label>
                      <Input name="expiry_date" type="date" value={invitationDetails.expiry_date} onChange={(e) => setInvitationDetails({...invitationDetails, expiry_date: e.target.value})} />
                  </div>
              </div>

              <DialogFooter className="flex justify-end gap-3 pt-4">
                  <Button onClick={() => setOpenOnboardingModal(false)} variant="ghost">Annuler</Button>
                  <Button className="bg-[#000080] hover:bg-blue-900 font-bold" onClick={handleValidateOnboarding}>
                      Envoyer l&apos;invitation
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}