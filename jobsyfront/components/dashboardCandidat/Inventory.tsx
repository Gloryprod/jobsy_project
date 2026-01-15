'use client';

import React, { useState } from 'react';
import { Backpack, Star, Filter, Plus, Minus, Info, Hexagon } from 'lucide-react';

interface Asset {
  id: string;
  name: string;         
  description: string;
  rarity: 'commun' | 'épique' | 'légendaire';
  type: 'certificat' | 'badge' | 'diplôme';
  bonus: string; // ex: "+10% Fiabilité"
  equipped: boolean;
  image?: string; // URL pour icône ou image
}

export default function InventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([
    { id: '1', name: 'Certificat Data Basics', description: 'Introduction aux données', rarity: 'commun', type: 'certificat', bonus: '+5% XP gain', equipped: true },
    { id: '2', name: 'Badge Fiabilité Or', description: '100 missions réussies', rarity: 'épique', type: 'badge', bonus: '+15% Visibilité', equipped: false },
    { id: '3', name: 'Diplôme Master Ingénieur', description: 'Formation avancée', rarity: 'légendaire', type: 'diplôme', bonus: '+20% Réputation', equipped: true },
    // Ajoute plus d'assets via API
  ]);

  const [filter, setFilter] = useState<'all' | 'commun' | 'épique' | 'légendaire'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const equippedAssets = assets.filter(a => a.equipped).length;
  const maxEquipped = 5; // Limite configurable

  const toggleEquip = (id: string) => {
    if (equippedAssets < maxEquipped || assets.find(a => a.id === id)?.equipped) {
      setAssets(assets.map(a => a.id === id ? { ...a, equipped: !a.equipped } : a));
    } else {
      alert('Limite d\'équipement atteinte ! Améliore ton rang pour plus de slots.');
    }
  };

  const filteredAssets = filter === 'all' ? assets : assets.filter(a => a.rarity === filter);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'légendaire': return '#F0E68C'; // Or
      case 'épique': return '#A855F7'; // Violet
      default: return '#9CA3AF'; // Gris commun
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000080] to-black pt-20 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header de page */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-4">
            <Backpack className="w-12 h-12 text-[#F0E68C]" />
            Inventaire d'Assets
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Gère tes certificats, badges et diplômes. Équipe-les pour booster ton profil et débloquer des missions premium !
          </p>
        </header>

        {/* Stats totaux */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
            <Star className="w-10 h-10 text-[#F0E68C] mx-auto mb-4" />
            <p className="text-4xl font-bold text-[#F0E68C]">{assets.length}</p>
            <p className="text-white/80">Assets totaux</p>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
            <Hexagon className="w-10 h-10 text-green-400 mx-auto mb-4" />
            <p className="text-4xl font-bold text-green-400">{equippedAssets}/{maxEquipped}</p>
            <p className="text-white/80">Équipés</p>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
            <Plus className="w-10 h-10 text-[#F0E68C] mx-auto mb-4" />
            <p className="text-4xl font-bold text-[#F0E68C]">+25%</p>
            <p className="text-white/80">Bonus totaux</p>
          </div>
        </section>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <button onClick={() => setFilter('all')} className={`px-6 py-3 rounded-xl ${filter === 'all' ? 'bg-[#F0E68C]/30 text-[#F0E68C]' : 'bg-white/10 text-white/80'} hover:bg-[#F0E68C]/20 transition`}>
            Tous
          </button>
          <button onClick={() => setFilter('commun')} className={`px-6 py-3 rounded-xl ${filter === 'commun' ? 'bg-gray-400/30 text-gray-200' : 'bg-white/10 text-white/80'} hover:bg-gray-400/20 transition`}>
            Commun
          </button>
          <button onClick={() => setFilter('épique')} className={`px-6 py-3 rounded-xl ${filter === 'épique' ? 'bg-purple-500/30 text-purple-200' : 'bg-white/10 text-white/80'} hover:bg-purple-500/20 transition`}>
            Épique
          </button>
          <button onClick={() => setFilter('légendaire')} className={`px-6 py-3 rounded-xl ${filter === 'légendaire' ? 'bg-[#F0E68C]/30 text-[#F0E68C]' : 'bg-white/10 text-white/80'} hover:bg-[#F0E68C]/20 transition`}>
            Légendaire
          </button>
          <button className="px-6 py-3 bg-white/10 rounded-xl text-white/80 hover:bg-white/20 transition flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtrer par type
          </button>
        </div>

        {/* Grille des assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <div key={asset.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-[#F0E68C]/30 transition cursor-pointer group" onClick={() => setSelectedAsset(asset)}>
              <div className="flex justify-between items-start mb-4">
                <Hexagon className="w-12 h-12" style={{ fill: getRarityColor(asset.rarity), stroke: getRarityColor(asset.rarity) }} />
                <button onClick={(e) => { e.stopPropagation(); toggleEquip(asset.id); }} className={`px-4 py-2 rounded-xl text-sm font-bold ${asset.equipped ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'} hover:opacity-80 transition`}>
                  {asset.equipped ? <Minus className="inline w-4 h-4 mr-1" /> : <Plus className="inline w-4 h-4 mr-1" />}
                  {asset.equipped ? 'Déséquiper' : 'Équiper'}
                </button>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{asset.name}</h3>
              <p className="text-white/70 mb-4">{asset.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Rareté: <span className="capitalize" style={{ color: getRarityColor(asset.rarity) }}>{asset.rarity}</span></span>
                <span className="text-green-400 font-bold">{asset.bonus}</span>
              </div>
              <Info className="w-6 h-6 text-[#F0E68C] mx-auto mt-4 opacity-0 group-hover:opacity-100 transition" />
            </div>
          ))}
        </div>

        {/* Modal détails (pop-up) */}
        {selectedAsset && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedAsset(null)}>
            <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-8 max-w-lg w-full border border-white/30" onClick={e => e.stopPropagation()}>
              <h2 className="text-3xl font-bold text-white mb-4">{selectedAsset.name}</h2>
              <p className="text-white/80 mb-6">{selectedAsset.description}</p>
              <div className="space-y-4 text-white">
                <p>Rareté: <span style={{ color: getRarityColor(selectedAsset.rarity) }} className="capitalize font-bold">{selectedAsset.rarity}</span></p>
                <p>Type: <span className="capitalize">{selectedAsset.type}</span></p>
                <p>Bonus: <span className="text-green-400 font-bold">{selectedAsset.bonus}</span></p>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="mt-6 px-6 py-3 bg-[#000080] text-white rounded-xl hover:bg-[#000080]/80">Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}