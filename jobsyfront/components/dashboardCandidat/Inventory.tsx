'use client';

import React, { useState, useMemo } from 'react';
import { 
  Backpack, 
  Star, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  X, 
  Zap, 
  AlertCircle,
  Search,
  Sparkles,
  Calendar,
  CheckCircle2,
  Lock,
  BrainCircuit,
  Briefcase,
  TrendingUp,
  Plus,
  Minus
} from 'lucide-react';

export type RarityType = 'commun' | 'rare' | 'épique' | 'légendaire';
export type AssetCategory = 'diplôme' | 'certificat' | 'badge_mission' | 'competence';

export interface Asset {
  id: string;
  name: string;
  description: string;
  rarity: RarityType;
  category: AssetCategory;
  bonusValue: number;
  bonusLabel: string;
  equipped: boolean;
  unlocked: boolean; // Si débloqué ou encore à accomplir
  progress?: { current: number; max: number }; // Ex: 3/5 missions
  issuedAt?: string;
  skillsUnlocked?: string[];
}

export default function CandidateInventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([
    // DIPLÔMES (du CV)
    { 
      id: 'd1', 
      name: 'Master Ingénierie Logicielle', 
      description: 'Niveau d’études supérieures validé - Université / École.', 
      rarity: 'légendaire', 
      category: 'diplôme', 
      bonusValue: 20, 
      bonusLabel: '+20% Réputation', 
      equipped: true,
      unlocked: true,
      issuedAt: 'Juin 2025',
      skillsUnlocked: ['Architecture Web', 'Gestion de Projet', 'Algorithmique']
    },
    // CERTIFICATIONS OBTEUNUES
    { 
      id: 'c1', 
      name: 'Certificat Fullstack Next.js', 
      description: 'Validation de maîtrise avancée Next.js & Server Components.', 
      rarity: 'épique', 
      category: 'certificat', 
      bonusValue: 10, 
      bonusLabel: '+10% Visibilité', 
      equipped: true,
      unlocked: true,
      issuedAt: 'Fév 2026',
      skillsUnlocked: ['Next.js', 'React', 'TypeScript']
    },
    { 
      id: 'c2', 
      name: 'Certificat Data & SQL', 
      description: 'Maîtrise des bases de données et analyse fondamentale.', 
      rarity: 'commun', 
      category: 'certificat', 
      bonusValue: 5, 
      bonusLabel: '+5% XP gain', 
      equipped: false,
      unlocked: true,
      issuedAt: 'Janv 2026',
      skillsUnlocked: ['SQL', 'Data Analysis']
    },
    // BADGES MISSIONS OBTEUNUS OU EN COURS
    { 
      id: 'b1', 
      name: 'Badge Fiabilité Or', 
      description: 'Attribué pour avoir réalisé 10 missions réussies à 100%.', 
      rarity: 'épique', 
      category: 'badge_mission', 
      bonusValue: 15, 
      bonusLabel: '+15% Confiance', 
      equipped: true,
      unlocked: true,
      issuedAt: 'Mars 2026',
      skillsUnlocked: ['Rigueur', 'Ponctualité']
    },
    { 
      id: 'b2', 
      name: 'Légende des 50 Missions', 
      description: 'Complète 50 missions sur la plateforme Jobsy.', 
      rarity: 'légendaire', 
      category: 'badge_mission', 
      bonusValue: 30, 
      bonusLabel: '+30% Priorité Recruteur', 
      equipped: false,
      unlocked: false,
      progress: { current: 12, max: 50 },
      skillsUnlocked: ['Pugnacité', 'Expertise Terrain']
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | AssetCategory | 'skills'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maxEquipped = 5;
  const equippedAssets = useMemo(() => assets.filter(a => a.equipped && a.unlocked), [assets]);
  
  const totalBonus = useMemo(() => {
    return equippedAssets.reduce((sum, item) => sum + item.bonusValue, 0);
  }, [equippedAssets]);

  // Ensemble de toutes les compétences débloquées
  const allUnlockedSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    assets.filter(a => a.unlocked).forEach(a => {
      a.skillsUnlocked?.forEach(s => skillsSet.add(s));
    });
    return Array.from(skillsSet);
  }, [assets]);

  const toggleEquip = (id: string) => {
    setErrorMessage(null);
    const targetAsset = assets.find(a => a.id === id);
    if (!targetAsset || !targetAsset.unlocked) return;

    if (!targetAsset.equipped && equippedAssets.length >= maxEquipped) {
      setErrorMessage(`Limite atteinte (${maxEquipped} max sur le profil). Déséquipe un badge pour en afficher un autre.`);
      return;
    }

    setAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, equipped: !a.equipped } : a))
    );
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchTab = activeTab === 'all' || a.category === activeTab;
      const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.skillsUnlocked?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [assets, activeTab, searchQuery]);

  const getRarityStyle = (rarity: RarityType) => {
    switch (rarity) {
      case 'légendaire':
        return 'bg-[#F0E68C]/30 text-[#8B8000] border border-[#8B8000]/30';
      case 'épique':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'diplôme': return <GraduationCap className="w-5 h-5 text-[#000080]" />;
      case 'certificat': return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'badge_mission': return <Award className="w-5 h-5 text-[#8B8000]" />;
      default: return <Sparkles className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen text-slate-900 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* EN-TÊTE */}
        <header className="pb-6 border-b border-slate-200/80">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#000080]/10 text-[#000080] font-semibold text-xs uppercase tracking-wider mb-3">
            <Backpack className="w-4 h-4" /> Portfolio & Accomplissements
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mon Inventaire de <span className="text-[#000080]">Succès</span>
          </h1>
          <p className="text-slate-500 font-medium text-base mt-2">
            Retrouve tes diplômes du CV, tes certifications et les badges débloqués lors de tes missions réussies sur Jobsy.
          </p>
        </header>

        {/* ALERTE */}
        {errorMessage && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-sm font-semibold">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-xs font-bold bg-rose-100 px-3 py-1.5 rounded-xl">
              Fermer
            </button>
          </div>
        )}

        {/* RESUMÉ & SCORE DE CRÉDIBILITÉ (KPIs) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Diplômes Validés</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {assets.filter(a => a.category === 'diplôme' && a.unlocked).length}
              </p>
            </div>
            <div className="p-3 bg-slate-100 rounded-2xl text-[#000080]">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Certifications</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {assets.filter(a => a.category === 'certificat' && a.unlocked).length}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Badges Missions</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {assets.filter(a => a.category === 'badge_mission' && a.unlocked).length}
              </p>
            </div>
            <div className="p-3 bg-[#F0E68C]/30 rounded-2xl text-[#8B8000]">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Boost Visibilité Profil</p>
              <p className="text-2xl font-extrabold text-[#8B8000] mt-1">+{totalBonus}%</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* BARRE DE NAVIGATION THÉMATIQUE (ONGLETS) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'Tout l\'inventaire', icon: Backpack },
              { id: 'diplôme', label: 'Diplômes (CV)', icon: GraduationCap },
              { id: 'certificat', label: 'Certifications', icon: ShieldCheck },
              { id: 'badge_mission', label: 'Badges Missions', icon: Award },
              { id: 'skills', label: 'Arbre de Compétences', icon: BrainCircuit },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    isActive 
                      ? 'bg-[#000080] text-white shadow-md shadow-[#000080]/20' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Recherche */}
          {activeTab !== 'skills' && (
            <div className="relative min-w-60">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-8 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#000080]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* VUE SPECIFIQUE: ARBRE DE COMPÉTENCES */}
        {activeTab === 'skills' ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#000080]" />
                Compétences Débloquées & Certifiées ({allUnlockedSkills.length})
              </h3>
              <p className="text-slate-500 text-xs font-medium mt-1">
                Ces compétences sont automatiquement validées par la combinaison de vos diplômes, certifications et réussites en mission.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {allUnlockedSkills.map((skill, idx) => (
                <div 
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold hover:border-[#000080] transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* GRILLE DES ACCOMPLISSEMENTS & BADGES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => {
              const isLocked = !asset.unlocked;

              return (
                <div 
                  key={asset.id} 
                  onClick={() => setSelectedAsset(asset)}
                  className={`group relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm transition-all duration-300 flex flex-col justify-between ${
                    isLocked 
                      ? 'opacity-70 bg-slate-50/50' 
                      : 'hover:-translate-y-1 hover:shadow-xl cursor-pointer'
                  } ${asset.equipped ? 'ring-2 ring-[#000080] border-transparent' : ''}`}
                >
                  <div>
                    {/* Header Carte */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-2.5 rounded-2xl ${isLocked ? 'bg-slate-200 text-slate-500' : 'bg-slate-50'}`}>
                          {getCategoryIcon(asset.category)}
                        </div>
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${getRarityStyle(asset.rarity)}`}>
                          {asset.rarity}
                        </span>
                      </div>

                      {/* Statut Équipé ou Verrouillé */}
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                          <Lock className="w-3 h-3" /> À Débloquer
                        </span>
                      ) : asset.equipped ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Sur le profil
                        </span>
                      ) : null}
                    </div>

                    {/* Titre & Description */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#000080] transition-colors mb-2 flex items-center gap-2">
                      {asset.name}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4 font-medium">
                      {asset.description}
                    </p>

                    {/* Jauge de progression si verrouillé */}
                    {isLocked && asset.progress && (
                      <div className="mb-4 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>Progression mission</span>
                          <span>{asset.progress.current} / {asset.progress.max}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#000080] h-full rounded-full" 
                            style={{ width: `${(asset.progress.current / asset.progress.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Compétences associées */}
                    {asset.skillsUnlocked && asset.skillsUnlocked.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {asset.skillsUnlocked.map((skill, index) => (
                          <span key={index} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pied de Carte */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium capitalize flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {asset.issuedAt || 'En cours'}
                      </span>
                      <span className="text-[#8B8000] font-black bg-[#F0E68C]/30 px-2.5 py-1 rounded-lg">
                        {asset.bonusLabel}
                      </span>
                    </div>

                    {/* Action d'équipement (si débloqué) */}
                    {!isLocked && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleEquip(asset.id); }}
                        className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          asset.equipped 
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
                            : 'bg-[#000080] hover:bg-[#000060] text-white shadow-md shadow-[#000080]/20'
                        }`}
                      >
                        {asset.equipped ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {asset.equipped ? 'Retirer du Profil' : 'Mettre en avant sur le profil'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}