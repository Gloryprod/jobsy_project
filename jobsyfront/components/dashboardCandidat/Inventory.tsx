'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Award, ShieldCheck, Zap, Lock, CheckCircle2, Flame, Plus, Minus, RefreshCw, Sparkles,Trophy,GraduationCap,Hexagon as HexIcon,BookOpen,Building2,Calendar,Layers,Code
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useUser } from '@/context/UserProvider';
import { ThreeDots } from 'react-loader-spinner';

export type RarityType = 'commun' | 'rare' | 'épique' | 'légendaire';

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

export interface Asset {
  id: string;
  code?: string;
  name: string;
  description: string;
  rarity: RarityType;
  category?: string;
  bonusValue: number;
  bonusLabel: string;
  equipped: boolean;
  unlocked: boolean;
  progress?: { current: number; max: number };
  issuedAt?: string;
  skillsUnlocked?: string[];
  diplomes?: Diplome[];
  formations?: Formation[];
  certificatesInfos?: Course[];
}

interface Application {
  id: string;
  mission_offers?: {
    status?: string;
  };
}

interface Enrollment {
  id: string;
  status?: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function CandidateInventoryGamifiedPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'badges' | 'diplomes' | 'certifications'>('all');
  const { user, loading: userLoading } = useUser();

  // 1. Récupération des données dynamiques du profil candidat
  const { 
    data: profileResponse, 
    error: profileError, 
    isLoading: profileLoading, 
    mutate: mutateProfile 
  } = useSWR('/candidat/profile-elements', fetcher);

  const profileData = profileResponse;
  const candidatId = user?.candidat?.id || user?.id;

  // 2. Récupération des candidatures pour compter les missions
  const { 
    data: applications, 
    mutate: mutateApplications 
  } = useSWR<Application[]>(
    candidatId ? `/missions/${candidatId}/myapplications` : null, 
    fetcher
  );

  // 3. Récupération des formations pour compter les cours et certifications
  const { 
    data: myLearnings, 
    mutate: mutateLearnings 
  } = useSWR<Enrollment[]>(
    candidatId ? '/courses/my-learnings' : null, 
    fetcher
  );

  // Statistiques calculées
  const skillsCount = useMemo(() => profileData?.skills?.length || 0, [profileData]);

  const completedMissionsCount = useMemo(() => {
    return applications?.filter(item => item.mission_offers?.status === "completed")?.length || 0;
  }, [applications]);

  const certifiedTrainingsCount = useMemo(() => {
    return myLearnings?.filter(item => item.status === 'certified')?.length || 0;
  }, [myLearnings]);

  const totalTrainingsCount = useMemo(() => {
    return myLearnings?.length || profileData?.trainings_completed || 0;
  }, [myLearnings, profileData]);

  const fetchBadgesAndAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get<Asset[]>('/candidate/inventory');
      setAssets(response.data);
    } catch {
      toast.error('Impossible de récupérer l’inventaire.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = () => {
    fetchBadgesAndAssets();
    mutateProfile();
    mutateApplications();
    mutateLearnings();
  };

  useEffect(() => {
    fetchBadgesAndAssets();
  }, []);

  const maxEquipped = 5;
  const equippedAssets = useMemo(() => assets.filter(a => a.equipped && a.unlocked), [assets]);
  const unlockedAssets = useMemo(() => assets.filter(a => a.unlocked), [assets]);

  // Extraction des Badges & Accomplissements
  const badgeAssets = useMemo(() => assets, [assets]);
  
  // Extraction corrigée des diplômes (depuis 'diplomes' au pluriel dans assets)
  const diplomesList = useMemo(() => {
    const fromAssets = assets.flatMap(a => a.diplomes || []);
    const fromProfile = profileData?.diplomes || [];
    const combined = [...fromAssets, ...fromProfile];
    return Array.from(new Map(combined.map(item => [item.id, item])).values());
  }, [assets, profileData]);

  // Extraction corrigée des certifications & formations (depuis 'formations' et 'certificatesInfos')
  const certificationsList = useMemo(() => {
    const platformCourses: Course[] = assets.flatMap(a => a.certificatesInfos || []);
    const externalFormations: Formation[] = assets.flatMap(a => a.formations || []).concat(profileData?.formations || []);
    
    return {
      platform: Array.from(new Map(platformCourses.map(c => [c.id, c])).values()),
      external: Array.from(new Map(externalFormations.map(f => [f.id, f])).values())
    };
  }, [assets, profileData]);

  // Bonus total cumulé
  const totalVisibilityBonus = useMemo(() => {
    return unlockedAssets.reduce((sum, item) => sum + (item.bonusValue || 0), 0);
  }, [unlockedAssets]);

  // Équiper / Déséquiper un atout
  const toggleEquip = async (id: string) => {
    const target = assets.find(a => a.id === id);
    if (!target || !target.unlocked) return;

    const nextState = !target.equipped;

    if (nextState && equippedAssets.length >= maxEquipped) {
      toast.error(`Limite atteinte (${maxEquipped} max sur le profil).`);
      return;
    }

    setAssets(prev => prev.map(a => (a.id === id ? { ...a, equipped: nextState } : a)));

    try {
      await api.patch(`/candidate/inventory/${id}/equip`, { equipped: nextState });
      toast.success(nextState ? 'Mis en avant !' : 'Retiré du profil.');
    } catch {
      setAssets(prev => prev.map(a => (a.id === id ? { ...a, equipped: !nextState } : a)));
      toast.error('Erreur de mise à jour.');
    }
  };

  const isProfileDataLoading = userLoading || profileLoading;

  // Fonction utilitaire pour nettoyer les balises HTML dans les descriptions
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* BARRE SUPÉRIEURE D'ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#000080]">Espace Atouts & Accomplissements</h1>
            <p className="text-xs text-slate-500 font-medium">Mettez en valeur vos compétences, diplômes et badges certifiés.</p>
          </div>
          <button 
            onClick={handleRefreshAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#000080] shadow-xs cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || profileLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* 1. CARTE PROFIL & XP */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          {isProfileDataLoading ? (
            <div className="flex justify-center items-center py-12">
              <ThreeDots height="50" width="50" color="#000080" visible={true} />
            </div>
          ) : profileError ? (
            <div className="text-center py-6 text-red-500 font-bold text-sm">
              Erreur lors du chargement des données de profil.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">

              {/* AVATAR AVEC BADGE RANG HEXAGONAL */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-linear-to-br from-[#000080]/10 to-[#F0E68C]/30 p-1 flex items-center justify-center border-2 border-white shadow-md relative">
                  <HexIcon 
                    className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" 
                    fill={profileData?.rank?.code_hexa || '#000080'} 
                    stroke="white" 
                    strokeWidth={1} 
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl sm:text-3xl drop-shadow-sm">
                    {profileData?.rank?.rank || 'E'}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 bg-white p-2 rounded-2xl shadow-md border border-amber-100">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                </div>
              </div>

              {/* INFOS & BARRE DE PROGRESSION XP */}
              <div className="flex-1 text-center md:text-left space-y-4 w-full">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {user?.prenom} {user?.nom}
                      </h2>
                      <p className="text-xs font-semibold text-[#8B8000] mt-0.5">
                        {profileData?.rank?.rank === "E" || profileData?.rank?.rank === "D" ? "Apprenti Junior • " : `${profileData?.domaine_competence || ''} •`} <span className="text-[#000080]">Rang {profileData?.rank?.rank || 'E'}</span>
                      </p>
                    </div>

                    {/* METRIC BOOST TOTAL */}
                    <div className="bg-[#F0E68C]/20 border border-[#8B8000]/30 rounded-2xl px-4 py-2 self-center md:self-auto flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#8B8000] fill-[#8B8000]" />
                      <span className="text-xs font-black text-[#8B8000]"> Boost Visibilité: +{totalVisibilityBonus}%</span>
                    </div>
                  </div>
                </div>

                {/* JAUGE D'EXPÉRIENCE */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>Progression XP</span>
                    <span className="text-[#000080]">{profileData?.score || 0} XP</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-linear-to-r from-[#000080] to-[#8B8000] rounded-full transition-all duration-700 shadow-xs"
                      style={{ width: `${Math.min(((profileData?.score || 0) / 10000) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* STATISTIQUES */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-[#000080] shadow-xs shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{completedMissionsCount}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Missions</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-amber-600 shadow-xs shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{totalTrainingsCount}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Formations</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-xs shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{certificationsList.platform.length + certificationsList.external.length}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Certifications</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-xs shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{skillsCount}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Compétences</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* 2. SECTION DES ATOUTS ÉQUIPÉS SUR LE PROFIL */}
        <div className="bg-linear-to-r from-indigo-900 to-[#000080] rounded-3xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-[#F0E68C]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Atouts Mis en Avant sur le Profil</h3>
                <p className="text-xs text-indigo-200">Visibles directement par les recruteurs sur votre profil public ({equippedAssets.length}/{maxEquipped})</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {equippedAssets.map((asset) => (
              <div key={asset.id} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/15 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-xl bg-white/10 text-[#F0E68C]">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#F0E68C] bg-[#F0E68C]/20 px-2 py-0.5 rounded-md">
                      {asset.bonusLabel}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{asset.name}</h4>
                  <p className="text-[10px] text-indigo-200 line-clamp-2 mt-1">{asset.description}</p>
                </div>

                <button
                  onClick={() => toggleEquip(asset.id)}
                  className="mt-3 w-full py-1.5 rounded-xl text-[10px] font-extrabold bg-rose-500/20 text-rose-200 border border-rose-400/30 hover:bg-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Minus className="w-3 h-3" /> Retirer
                </button>
              </div>
            ))}

            {equippedAssets.length === 0 && (
              <div className="col-span-full py-8 text-center text-indigo-200 text-xs font-medium bg-white/5 rounded-2xl border border-dashed border-white/10">
                Aucun atout sélectionné. Mettez en avant vos accomplissements ci-dessous !
              </div>
            )}
          </div>
        </div>

        {/* 3. BARRE DE FILTRES / NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'all' 
                ? 'bg-[#000080] text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tous les Atouts
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'badges' 
                ? 'bg-[#000080] text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Badges & Succès ({badgeAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('diplomes')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'diplomes' 
                ? 'bg-[#000080] text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Diplômes ({diplomesList.length})
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'certifications' 
                ? 'bg-[#000080] text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Certifications & Formations ({certificationsList.platform.length + certificationsList.external.length})
          </button>
        </div>

        {/* 4. SECTIONS DÉTAILLÉES PAR CATÉGORIE */}

        {/* SECTION A : BADGES & SUCCÈS */}
        {(activeTab === 'all' || activeTab === 'badges') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#000080]" /> Badges & Succès
              </h3>
              <span className="text-xs font-bold text-slate-400">{unlockedAssets.length} / {badgeAssets.length} Débloqués</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badgeAssets.map((asset) => (
                <div 
                  key={asset.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    asset.unlocked 
                      ? 'bg-white border-slate-200/80 shadow-md shadow-slate-100 hover:border-[#000080]/30' 
                      : 'bg-slate-50/60 border-slate-200/60 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative ${
                      asset.unlocked 
                        ? 'bg-linear-to-br from-[#000080] to-[#000050] text-white shadow-md' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Award className="w-6 h-6" />
                      {!asset.unlocked && (
                        <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-xs border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{asset.name}</h4>
                        {asset.bonusLabel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0E68C]/30 text-[#8B8000] shrink-0">
                            {asset.bonusLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{asset.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {asset.unlocked ? (
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Débloqué
                        </span>
                      ) : asset.progress ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">{asset.progress.current}/{asset.progress.max}</span>
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#000080] rounded-full"
                              style={{ width: `${(asset.progress.current / asset.progress.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-xl">
                          Verrouillé
                        </span>
                      )}
                    </div>

                    {asset.unlocked && (
                      <button
                        onClick={() => toggleEquip(asset.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                          asset.equipped 
                            ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' 
                            : 'bg-[#000080] text-white hover:bg-[#000060]'
                        }`}
                      >
                        {asset.equipped ? (
                          <> <Minus className="w-3 h-3" /> Retirer </>
                        ) : (
                          <> <Plus className="w-3 h-3" /> Mettre en avant </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION B : DIPLÔMES */}
        {(activeTab === 'all' || activeTab === 'diplomes') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600" /> Diplômes Académiques
              </h3>
              <span className="text-xs font-bold text-slate-400">{diplomesList.length} Obtenu(s)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {diplomesList.map((diplome) => (
                <div key={diplome.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      {(diplome.annee_obtention || diplome.annee) && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {diplome.annee_obtention || diplome.annee}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{diplome.intitule}</h4>
                    {diplome.etablissement && (
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{diplome.etablissement}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      Diplôme Validé
                    </span>

                    {diplome.fichier && (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${diplome.fichier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#000080] hover:underline"
                      >
                        Voir le document
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {diplomesList.length === 0 && (
                <div className="col-span-full text-center py-8 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                  Aucun diplôme enregistré.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION C : CERTIFICATIONS & FORMATIONS */}
        {(activeTab === 'all' || activeTab === 'certifications') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" /> Certifications & Formations
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {certificationsList.platform.length + certificationsList.external.length} Certifiée(s)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* 1. COURS ET CERTIFICATIONS PLATEFORME */}
              {certificationsList.platform.map((course) => (
                <div key={`platform_${course.id}`} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Certificat Officiel Jobsy
                      </span>
                    </div>

                    {/* Titre */}
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{course.title}</h4>

                    {/* Description propre */}
                    {course.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {stripHtml(course.description)}
                      </p>
                    )}

                    {/* Compétences délivrées */}
                    {course.delivered_skills && course.delivered_skills.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Code className="w-3 h-3" /> Compétences débloquées
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {course.delivered_skills.map((skill, index) => (
                            <span key={index} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>+{course.reward_xp || 100} XP</span>
                    </div>

                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      Obtenu
                    </span>
                  </div>
                </div>
              ))}

              {/* 2. FORMATIONS EXTERNES */}
              {certificationsList.external.map((formation) => (
                <div key={`external_${formation.id}`} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                        Formation Externe {formation.organisme}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{formation.titre}</h4>

                    {formation.organisme && (
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formation.organisme}</span>
                      </p>
                    )}

                    {formation.skills && formation.skills.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Compétences
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {formation.skills.map((skill, index) => (
                            <span key={index} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                      Enregistrée
                    </span>
                  </div>
                </div>
              ))}

              {certificationsList.platform.length === 0 && certificationsList.external.length === 0 && (
                <div className="col-span-full text-center py-8 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                  Aucune certification trouvée dans votre profil.
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}