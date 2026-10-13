import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Mail,
  Send,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';

// --- Interfaces & Types ---
interface Badge {
  id?: number | string;
  name?: string;
  title?: string;
}

export interface Diplome {
  id: number;
  candidat_id?: number;
  intitule: string;
  niveau?: string | null;
  etablissement?: string | null;
  pays?: string | null;
  annee_obtention?: string | null;
  annee?: string | null;
  fichier?: string | null;
}

interface Formation {
  id: number;
  titre: string;
  organisme?: string | null;
  certificat?: string | null;
  skills?: string[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  validation_mode?: string;
  delivered_skills?: string[];
  reward_xp?: number;
  reward_asset?: string | null;
  is_active?: number | boolean;
  organisme?: string;
}

interface CandidateProfile {
  id: number | string;
  full_name: string;
  email?: string;
  title?: string;
  equipped_badges?: Badge[];
  all_skills?: string[];
  certificatesInfos?: Course[];
  diplomes?: Diplome[];
  formations?: Formation[];
}

interface CandidateProfileModalProps {
  candidateId: number | string | null;
  missionId: number | string | null;
  onClose: () => void;
}

export default function CandidateProfileModal({ candidateId, missionId, onClose }: CandidateProfileModalProps) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // État pour le formulaire d'envoi de mail de proposition
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('Proposition d\'offre de mission');
  const [message, setMessage] = useState<string>('');
  const [contacting, setContacting] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!candidateId) return;

    setLoading(true);
    try {
      const res = await api.get(`/candidates/${candidateId}/full-profile`);
      const json = res.data;
      if (json.success && json.candidate) {
        setProfile(json.candidate);
      }
    } catch (err) {
      console.error("Erreur chargement profil :", err);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Pré-remplir le modèle de mail lorsque le profil est chargé
  useEffect(() => {
    if (profile?.full_name) {
      setSubject(`Proposition d'offre de mission pour ${profile.full_name}`);
      setMessage(
        `Bonjour ${profile.full_name},\n\nVotre profil a retenu toute notre attention pour une opportunité de mission.\n\nNous aimerions échanger avec vous au sujet de cette offre.\n\nCordialement,`
      );
    }
  }, [profile]);

  // Réinitialiser les états lors du changement de candidat
  useEffect(() => {
    setShowContactForm(false);
    setContactSuccess(false);
    setContactError(null);
  }, [candidateId]);

  // Extraction dédupliquée des certifications & formations
  const certificationsList = useMemo(() => {
    const platformCourses: Course[] = profile?.certificatesInfos || [];
    const externalFormations: Formation[] = profile?.formations || [];
    
    return {
      platform: Array.from(new Map(platformCourses.map(c => [c.id, c])).values()),
      external: Array.from(new Map(externalFormations.map(f => [f.id, f])).values())
    };
  }, [profile]);

  // Fonction pour envoyer le mail de proposition d'offre
  const handleSendOfferEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !candidateId) return;

    setContacting(true);
    setContactError(null);

    try {
      // Envoi du mail de proposition via l'API
      const res = await api.post('/offers/send-proposal-email', {
        candidat_id: candidateId,
        mission_id: missionId,
        subject: subject,
        content: message,
      });

      if (res.data?.success || res.status === 200) {
        setContactSuccess(true);
        setTimeout(() => {
          setShowContactForm(false);
          setContactSuccess(false);
        }, 2500);
      } else {
        setContactError(res.data?.message || "Impossible d'envoyer le mail au candidat.");
      }
    } catch (err: any) {
      console.error("Erreur envoi de l'offre par mail :", err);
      setContactError(err?.response?.data?.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      setContacting(false);
    }
  };

  if (!candidateId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Entête Modale */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between relative">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Fiche Candidat Jobsy</span>
            <h2 className="text-2xl font-bold mt-0.5">{loading ? 'Chargement...' : profile?.full_name}</h2>
            <p className="text-xs text-slate-300 font-medium">{profile?.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du Profil */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Chargement des données du candidat...</div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Formulaire d'envoi de l'offre par mail */}
            {showContactForm && (
              <div className="p-5 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      Proposer l'offre de mission par email
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Un e-mail contenant votre proposition et les détails de la mission sera envoyé à {profile?.full_name}.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowContactForm(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>

                {contactSuccess ? (
                  <div className="p-4 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600" /> E-mail envoyé avec succès au candidat !
                  </div>
                ) : (
                  <form onSubmit={handleSendOfferEmail} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Objet du message
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Objet de l'email..."
                        className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Corps du mail
                      </label>
                      <textarea
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Rédigez votre message de proposition d'offre..."
                        className="w-full p-3 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                        required
                      />
                    </div>

                    {contactError && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {contactError}
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={contacting || !message.trim() || !subject.trim()}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-200"
                      >
                        {contacting ? 'Envoi du mail en cours...' : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Envoyer l'offre par e-mail
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Badges Équipés */}
            {profile?.equipped_badges && profile.equipped_badges.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Badges Équipés & Distinctions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.equipped_badges.map((badge, idx) => (
                    <span key={badge.id || idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
                      🏆 {badge.name || badge.title || 'Badge Validé'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compétences Globales */}
            {profile?.all_skills && profile.all_skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Compétences Clés & Validées
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.all_skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Formations & Certifications */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Formations & Certifications
              </h4>

              {certificationsList.platform.length === 0 && certificationsList.external.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucune formation ou certification enregistrée.</p>
              ) : (
                <div className="space-y-4">
                  
                  {/* Certifications Plateforme (Jobsy) */}
                  {certificationsList.platform.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500">Certifications obtenues sur Jobsy</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {certificationsList.platform.map((course) => (
                          <div key={course.id} className="flex items-start justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="flex items-start gap-2.5">
                              <BookOpen className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-slate-800">{course.title || 'Formation Certifiante'}</p>
                                {course.organisme && (
                                  <p className="text-[11px] text-slate-500">{course.organisme}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                              Certifié Jobsy
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formations & Certifications Externes */}
                  {certificationsList.external.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500">Formations complémentaires & externes</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {certificationsList.external.map((item) => (
                          <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-slate-800">{item.titre}</p>
                                {item.organisme && (
                                  <p className="text-[11px] text-slate-500">{item.organisme}</p>
                                )}
                                {item.skills && item.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {item.skills.map((sk, sIdx) => (
                                      <span key={sIdx} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                                        {sk}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Diplômes & Parcours Académique */}
            {profile?.diplomes && profile.diplomes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-600" />
                  Diplômes & Parcours Académique
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {profile.diplomes.map((diplome) => {
                    const year = diplome.annee_obtention || diplome.annee;
                    return (
                      <div key={diplome.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{diplome.intitule}</p>
                          <p className="text-[11px] text-slate-500">
                            {diplome.etablissement}
                            {diplome.pays ? ` (${diplome.pays})` : ''}
                          </p>
                          {diplome.niveau && (
                            <span className="inline-block text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mt-1">
                              {diplome.niveau}
                            </span>
                          )}
                        </div>
                        {year && (
                          <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {year}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer Modale */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {!showContactForm && !loading && (
              <button
                onClick={() => setShowContactForm(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-200"
              >
                <Mail className="w-4 h-4" />
                Proposer l'offre par e-mail
              </button>
            )}
          </div>

          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}