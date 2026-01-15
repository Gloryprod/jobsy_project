'use client';

import React, { useState } from 'react';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, CheckCircle, XCircle, Calendar, TrendingUp, Star } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'gain' | 'retrait' | 'bonus';
  missionTitle?: string;
  amount: number;
  date: string;
  status: 'completé' | 'en attente' | 'refusé';
  method?: string; // pour retraits
}

export default function WalletPage() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Données mock – à remplacer par API réelle
  const balanceAvailable = 12500; // F CFA disponible pour retrait
  const balancePending = 4500;     // En attente de validation entreprise
  const totalEarned = 45800;      // Loot total gagné depuis inscription

  const transactions: Transaction[] = [
    { id: '1', type: 'gain', missionTitle: 'Analyse données boutique', amount: 5000, date: '23 Déc 2025', status: 'completé' },
    { id: '2', type: 'retrait', amount: -8000, date: '20 Déc 2025', status: 'completé', method: 'MTN Mobile Money' },
    { id: '3', type: 'gain', missionTitle: 'Création visuels Instagram', amount: 8000, date: '19 Déc 2025', status: 'completé' },
    { id: '4', type: 'gain', missionTitle: 'Livraison colis centre-ville', amount: 3000, date: '18 Déc 2025', status: 'en attente' },
    { id: '5', type: 'bonus', missionTitle: 'Bonus streak 7 jours', amount: 2000, date: '17 Déc 2025', status: 'completé' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completé': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'en attente': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'refusé': return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gain': return 'text-[#F0E68C]';
      case 'bonus': return 'text-green-400';
      case 'retrait': return 'text-white/70';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000080] to-black pt-20 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header */}
        <header className="text-center space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-4">
            <Wallet className="w-12 h-12 text-[#F0E68C]" />
            Mon Loot & Gains
          </h1>
          <p className="text-white/70 text-lg max-w-3xl mx-auto">
            Consulte tes gains issus des quêtes complétées. Retire ton argent facilement vers Mobile Money ou banque.
          </p>
        </header>

        {/* Soldes principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
            <ArrowDownToLine className="w-12 h-12 text-[#F0E68C] mx-auto mb-4" />
            <p className="text-white/70 text-lg">Solde disponible</p>
            <p className="text-5xl font-black text-[#F0E68C] mt-3">{balanceAvailable.toLocaleString()} F</p>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-6 px-8 py-4 bg-[#F0E68C] hover:bg-[#F0E68C]/80 text-[#000080] font-bold rounded-2xl shadow-xl hover:shadow-[#F0E68C]/50 transition hover:scale-105"
            >
              RETIRER MAINTENANT
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
            <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-white/70 text-lg">En attente de validation</p>
            <p className="text-5xl font-black text-yellow-400 mt-3">{balancePending.toLocaleString()} F</p>
            <p className="text-white/60 text-sm mt-4">Payé sous 48h après validation entreprise</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white/70 text-lg">Loot total gagné</p>
            <p className="text-5xl font-black text-green-400 mt-3">{totalEarned.toLocaleString()} F</p>
            <p className="text-white/60 text-sm mt-4">Depuis ton inscription</p>
          </div>
        </div>

        {/* Historique des transactions */}
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#F0E68C]" />
              Historique des transactions
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {transactions.map(tx => (
              <div key={tx.id} className="p-6 hover:bg-white/5 transition flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {tx.type === 'gain' && <ArrowDownToLine className="w-8 h-8 text-[#F0E68C]" />}
                  {tx.type === 'retrait' && <ArrowUpFromLine className="w-8 h-8 text-white/50" />}
                  {tx.type === 'bonus' && <Star className="w-8 h-8 text-green-400" />}

                  <div>
                    <p className="text-white font-semibold text-lg">
                      {tx.missionTitle || (tx.type === 'bonus' ? 'Bonus spécial' : 'Retrait')}
                    </p>
                    <div className="flex items-center gap-4 text-white/60 text-sm mt-1">
                      <span>{tx.date}</span>
                      {tx.method && <span>• {tx.method}</span>}
                      <span className="flex items-center gap-1">
                        {getStatusIcon(tx.status)}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <span className={`text-2xl font-black ${getTypeColor(tx.type)}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} F
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Modal Retrait */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowWithdrawModal(false)}>
            <div className="bg-white/20 backdrop-blur-2xl rounded-3xl max-w-lg w-full border border-white/30 p-8" onClick={e => e.stopPropagation()}>
              <h2 className="text-3xl font-bold text-white mb-6">Demander un retrait</h2>

              <div className="space-y-6">
                <div>
                  <p className="text-white/70 mb-2">Solde disponible</p>
                  <p className="text-4xl font-black text-[#F0E68C]">{balanceAvailable.toLocaleString()} F CFA</p>
                </div>

                <div>
                  <label className="text-white/80 text-lg mb-3 block">Montant à retirer</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Ex: 10000"
                    max={balanceAvailable}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#F0E68C]/50 text-xl"
                  />
                  <p className="text-white/60 text-sm mt-2">Minimum : 1 000 F • Maximum : {balanceAvailable.toLocaleString()} F</p>
                </div>

                <div>
                  <p className="text-white/80 text-lg mb-3">Méthode de retrait</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 bg-white/10 rounded-2xl border border-white/20 hover:border-[#F0E68C]/50 transition text-white">
                      MTN Mobile Money
                    </button>
                    <button className="p-6 bg-white/10 rounded-2xl border border-white/20 hover:border-[#F0E68C]/50 transition text-white">
                      Moov Money
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-8 py-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition"
                  >
                    Annuler
                  </button>
                  <button className="flex-1 px-8 py-4 bg-[#F0E68C] hover:bg-[#F0E68C]/80 text-[#000080] font-bold text-xl rounded-2xl shadow-xl hover:shadow-[#F0E68C]/50 transition hover:scale-105">
                    CONFIRMER RETRAIT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}