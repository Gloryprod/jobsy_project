'use client';

import React, { useState } from 'react';
import { BookOpen, Play, Clock, Award, Star, Trophy, Filter, CheckCircle, Lock } from 'lucide-react';

interface Formation {
  id: string;
  title: string;
  category: string;
  duration: string; // ex: "15 min"
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  progress: number; // 0 à 100 (% complété)
  completed: boolean;
  rewardXP: number;
  rewardAsset?: string; // nom de l'asset gagné
  recommended: boolean;
  locked: boolean;
}

export default function FormationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  // Données mock – à remplacer par API
  const formations: Formation[] = [
    {
      id: '1',
      title: 'Excel de base : Tableaux et formules',
      category: 'Data',
      duration: '20 min',
      difficulty: 'débutant',
      progress: 65,
      completed: false,
      rewardXP: 150,
      rewardAsset: 'Badge Excel Bronze',
      recommended: true,
      locked: false,
    },
    {
      id: '2',
      title: 'Créer des visuels pro avec Canva',
      category: 'Design',
      duration: '25 min',
      difficulty: 'débutant',
      progress: 0,
      completed: false,
      rewardXP: 200,
      rewardAsset: 'Certificat Canva Créatif',
      recommended: true,
      locked: false,
    },
    {
      id: '3',
      title: 'Communication client efficace',
      category: 'Soft Skills',
      duration: '15 min',
      difficulty: 'intermédiaire',
      progress: 100,
      completed: true,
      rewardXP: 120,
      rewardAsset: 'Badge Communication Or',
      recommended: false,
      locked: false,
    },
    {
      id: '4',
      title: 'Analyse de données avancée (Power BI)',
      category: 'Data',
      duration: '45 min',
      difficulty: 'avancé',
      progress: 0,
      completed: false,
      rewardXP: 400,
      rewardAsset: 'Certificat Power BI – Épique',
      recommended: false,
      locked: true,
    },
    // Ajoute plus...
  ];

  const categories = ['all', 'Data', 'Design', 'Soft Skills', 'Logistique', 'Ventes', 'Management'];

  const filteredFormations = selectedCategory === 'all' 
    ? formations 
    : formations.filter(f => f.category === selectedCategory);

  const recommendedFormations = formations.filter(f => f.recommended && !f.completed);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'débutant': return 'text-green-400';
      case 'intermédiaire': return 'text-yellow-400';
      case 'avancé': return 'text-red-400';
      default: return 'text-white/70';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000080] to-black pt-20 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header */}
        <header className="text-center space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-4">
            <BookOpen className="w-12 h-12 text-[#F0E68C]" />
            Entraînements & Mini-Formations
          </h1>
          <p className="text-white/70 text-lg max-w-3xl mx-auto">
            Monte en compétences rapidement avec des modules courts. Gagne de l’XP et des assets exclusifs pour booster ton profil !
          </p>

          {/* Streak + Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
              <Trophy className="w-10 h-10 text-[#F0E68C] mx-auto mb-3" />
              <p className="text-4xl font-bold text-[#F0E68C]">7</p>
              <p className="text-white/80">Jours de streak</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
              <Star className="w-10 h-10 text-[#F0E68C] mx-auto mb-3" />
              <p className="text-4xl font-bold text-[#F0E68C]">1 250</p>
              <p className="text-white/80">XP totaux gagnés</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
              <Award className="w-10 h-10 text-[#F0E68C] mx-auto mb-3" />
              <p className="text-4xl font-bold text-[#F0E68C]">12</p>
              <p className="text-white/80">Formations complétées</p>
            </div>
          </div>
        </header>

        {/* Recommandées pour toi */}
        {recommendedFormations.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Star className="w-8 h-8 text-[#F0E68C]" />
              Recommandées pour toi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedFormations.map(form => (
                <FormationCard key={form.id} formation={form} onClick={() => setSelectedFormation(form)} />
              ))}
            </div>
          </section>
        )}

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-xl transition ${
                selectedCategory === cat 
                  ? 'bg-[#F0E68C]/30 text-[#F0E68C] border border-[#F0E68C]/50' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat === 'all' ? 'Toutes' : cat}
            </button>
          ))}
        </div>

        {/* Grille toutes formations */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFormations.map(form => (
              <FormationCard key={form.id} formation={form} onClick={() => setSelectedFormation(form)} />
            ))}
          </div>
        </section>

        {/* Modal détail / lancement formation */}
        {selectedFormation && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFormation(null)}>
            <div className="bg-white/20 backdrop-blur-2xl rounded-3xl max-w-2xl w-full border border-white/30 p-8" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-white">{selectedFormation.title}</h2>
                {selectedFormation.locked && <Lock className="w-8 h-8 text-white/50" />}
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 text-white/80">
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> {selectedFormation.duration}
                  </span>
                  <span className={`flex items-center gap-2 font-medium ${getDifficultyColor(selectedFormation.difficulty)}`}>
                    {selectedFormation.difficulty.charAt(0).toUpperCase() + selectedFormation.difficulty.slice(1)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#F0E68C]" /> +{selectedFormation.rewardXP} XP
                  </span>
                </div>

                {selectedFormation.rewardAsset && (
                  <div className="bg-[#F0E68C]/20 rounded-xl p-4 border border-[#F0E68C]/50">
                    <p className="text-[#F0E68C] font-bold flex items-center gap-2">
                      <Award className="w-6 h-6" />
                      Récompense : {selectedFormation.rewardAsset}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-white/60">Progression</p>
                  <div className="w-full bg-white/20 rounded-full h-8 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#F0E68C] to-yellow-300 rounded-full flex items-center justify-center text-[#000080] font-bold"
                      style={{ width: `${selectedFormation.progress}%` }}
                    >
                      {selectedFormation.progress}%
                    </div>
                  </div>
                  {selectedFormation.completed && (
                    <p className="text-green-400 font-bold flex items-center gap-2">
                      <CheckCircle className="w-6 h-6" /> Formation complétée !
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={selectedFormation.locked}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-[#F0E68C] hover:bg-[#F0E68C]/80 disabled:bg-white/10 disabled:text-white/30 text-[#000080] font-bold text-xl rounded-2xl shadow-xl hover:shadow-[#F0E68C]/50 transition hover:scale-105"
                  >
                    <Play className="w-8 h-8" />
                    {selectedFormation.progress > 0 ? 'Reprendre' : 'Commencer'}
                  </button>
                  {selectedFormation.completed && (
                    <button className="px-8 py-5 bg-white/20 text-white rounded-2xl hover:bg-white/30 transition">
                      Voir le certificat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant carte formation réutilisable
function FormationCard({ formation, onClick }: { formation: Formation; onClick: () => void }) {
  return (
    <div 
      className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-[#F0E68C]/40 transition-all cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {formation.recommended && (
        <div className="absolute top-4 left-4 bg-[#F0E68C]/30 text-[#F0E68C] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star className="w-4 h-4" /> Recommandée
        </div>
      )}
      {formation.locked && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Lock className="w-16 h-16 text-white/50" />
        </div>
      )}

      <div className="p-6 space-y-5">
        <div className="flex justify-between items-start">
          <span className="text-white/60 text-sm">{formation.category}</span>
          {formation.completed && <CheckCircle className="w-8 h-8 text-green-400" />}
        </div>

        <h3 className="text-2xl font-bold text-white group-hover:text-[#F0E68C] transition">
          {formation.title}
        </h3>

        <div className="flex items-center gap-4 text-white/70">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" /> {formation.duration}
          </span>
          <span className={`font-medium ${getDifficultyColor(formation.difficulty)}`}>
            {formation.difficulty}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Progression</span>
            <span className="text-[#F0E68C] font-bold">{formation.progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-6 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#F0E68C] to-yellow-300 rounded-full transition-all"
              style={{ width: `${formation.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-[#F0E68C] font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6" /> +{formation.rewardXP} XP
          </span>
          {formation.rewardAsset && <Award className="w-8 h-8 text-[#F0E68C]" />}
        </div>
      </div>
    </div>
  );

  function getDifficultyColor(diff: string) {
    switch (diff) {
      case 'débutant': return 'text-green-400';
      case 'intermédiaire': return 'text-yellow-400';
      case 'avancé': return 'text-red-400';
      default: return 'text-white/70';
    }
  }
}