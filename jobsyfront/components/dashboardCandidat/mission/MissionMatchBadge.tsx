'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import api from "@/lib/api";

interface SkillsBreakdown {
  matched: string[];
  missing: string[];
  matched_count: number;
  total_required: number;
}

interface MatchResult {
  match_score: number;
  skills_breakdown: SkillsBreakdown;
}

interface MatchApiResponse {
  success: boolean;
  match_result: MatchResult;
  message?: string;
}

interface MissionMatchBadgeProps {
  missionId: string | number;
}

export function MissionMatchBadge({ missionId }: MissionMatchBadgeProps) {
  const [matchData, setMatchData] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMyMatch = async () => {
      try {
        const res = await api.get<MatchApiResponse>(`/missions/${missionId}/my-match-score`);
        if (res.data?.success && res.data?.match_result) {
          setMatchData(res.data.match_result);
        }
      } catch (err) {
        console.error("Erreur calcul match candidat :", err);
      } finally {
        setLoading(false);
      }
    };

    if (missionId) {
      fetchMyMatch();
    }
  }, [missionId]);

  if (loading || !matchData) return null;

  const { match_score, skills_breakdown } = matchData;

  // Couleurs dynamiques selon le score
  const getBadgeStyle = (score: number) => {
    if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200/80';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black tracking-wide shadow-xs shrink-0 ${getBadgeStyle(match_score)}`}
      title={`Adéquation : ${skills_breakdown.matched_count}/${skills_breakdown.total_required} compétences matchées`}
    >
      <Sparkles className="w-3.5 h-3.5 shrink-0" />
      <span>{match_score}% match</span>
    </div>
  );
}