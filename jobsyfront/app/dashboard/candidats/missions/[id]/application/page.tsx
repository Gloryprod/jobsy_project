'use client';
import ProgressBar from "@/components/dashboardCandidat/progressBar/ProgressBar";
import React, { useState } from "react";
import IntroStep from "@/components/dashboardCandidat/application/IntroStep";
import api from "@/lib/api";
import useSWR from "swr";
import {use} from "react";
import { useUser } from '@/context/UserProvider';
import { ThreeDots } from 'react-loader-spinner';
import MotivationStep from "@/components/dashboardCandidat/application/MotivationStep";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import AIProcessing from "@/components/dashboardCandidat/application/AIProcessing";
import { motion, AnimatePresence } from 'framer-motion';
import TechnicalFlashStep from "@/components/dashboardCandidat/application/TechnicalStep";
import CompletionStep from "@/components/dashboardCandidat/application/CompletionStep";

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

type Mission = {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string; 
  deadline: string;
  description: string;
  skills: string[]; 
  urgency: 'normal' | 'urgent' | 'premium';
  category: string;
  applicants: number;
  type_contrat: 'CDI' | 'CDD' | 'Mission Ponctuelle';
  active: boolean;
  test_severity: 'light' | 'standard' | 'expert';
  min_rank_required: string;
}

interface Question {
    id : number,
    label : string,
    context_hint : string
}

interface Application{
    id: number;
    candidat_id: number;
    mission_id: number;
    status: 'draft' | 'pending' | 'accepted'| 'rejected';
    global_score: number;
    badge: string;
    ai_summary: string;
    created_at: Timestamp;
    completed_at: Timestamp;
    updated_at: Timestamp;
}

export default function ApplicationPage({ params }: { params: Promise<{ id: string }>}){
    const {id} = use(params);
    const { data: mission , isLoading, error } = useSWR<Mission>(`/show/${id}`, fetcher);

    const { user, loading: authLoading } = useUser();

    const candidatRank = user?.candidat?.rank.rank;
    const candidatId = user?.candidat?.id;

    const [questions, setQuestions] = useState<Question[]>([]);  
    const [initialAnswers, setInitialAnswers] = useState<Record<number, string>>({}); 
    const [technicalQuestions, setTechnicalQuestions] = useState<Question[]>([]);
    const [application, setApplication] = useState<Application>();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
        
    const [step, setStep] = React.useState(0);

    const onStart = async (candidatId: number, missionId: number) => {
        try {
            const response = await api.post(`/start_application/${candidatId}/${missionId}`);
            setQuestions(response.data.data.questions);
            setApplication(response.data.data.application)
            setStep(1);
        } catch (error) {
            console.log("Erreur lors du démarrage de la candidature:", error);
        }
    }

    const handleStepOneSubmit = async (answers : Record<number, string>, applicationId: number) => {
        setIsProcessing(true);
        try {
            const response = await api.post(`/applications/${applicationId}/submit-step-one`, {
                responses: answers,
            });
            
            setStep(2);
            setInitialAnswers(answers);
            setTechnicalQuestions(response.data.data.next_questions);
        } catch (error) {
            console.log("Erreur lors de la sauvegarde", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalSubmit = async (finalAnswers: Record<number, string>, applicationId: number) => {
        setIsProcessing(true);
        try {
            await api.post(`/applications/${applicationId}/finalize`, {
                responses: finalAnswers,
            });
            setStep(3); 
        } catch (e) {
            console.log("Erreur finale");
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 0:
                if (mission)
                return <IntroStep mission={mission} onStart={() => onStart(candidatId!, mission.id)} />;
            case 1: 
                return <MotivationStep candidatRank={candidatRank} questions={questions} onSubmit={(answers) => handleStepOneSubmit(answers, application!.id)} initialAnswers={initialAnswers} />;
            case 2: 
                return candidatRank == "E" ? <CompletionStep missionTitle={mission!.title} /> : <TechnicalFlashStep questions={technicalQuestions} onSubmit={(answers) => handleFinalSubmit(answers, application!.id)} />;
            case 3:
                return <CompletionStep missionTitle={mission!.title} />;
        }   
    }

    if (authLoading || isLoading) {
        return (<div className="flex justify-center items-center h-screen">
            <ThreeDots
            height="80"
            width="80"
            radius="9"
            color="#000080"
            ariaLabel="three-dots-loading"
            wrapperStyle={{ margin: '20px' }}
            wrapperClass="custom-loader"
            visible={true}
            />
        </div>);
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#000080] to-black pt-20 pb-24">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <p className="text-red-400 text-xl">Erreur: {error?.message || 'Une erreur est survenue lors du chargement du profil.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] ">

            <div className="bg-white border-b border-slate-100 pt-16 pb-12 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
                    {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F0E68C]/20 rounded-full">
                        <Target size={16} className="text-[#8B8000]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B8000]">Guilde des Opportunités</span>
                    </div> */}
                    
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight">
                        <span className="text-[#000080]">Candidature</span>
                    </h1>
                    
                    <p className="text-slate-500 text-lg w-full mx-auto font-medium">
                        Validez votre candidature en passant une évaluation de compétences.
                    </p>
            
                    <div style={{ padding: '50px' }}>
                        {candidatRank == "E" ? <ProgressBar currentStep={step} totalSteps={3} /> : <ProgressBar currentStep={step} totalSteps={4} />}

                        <main className="grow flex items-center justify-center p-6">
                            <div className="max-w-xl w-full">
                                <AnimatePresence mode="wait">
                                    {isProcessing ? (
                                        <motion.div key="loader" exit={{ opacity: 0 }}>
                                            <AIProcessing />
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                        key="content" 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        >
                                        {renderStep()}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                               
                            </div>
                        </main>
                        
                        <div className="flex items-center justify-center gap-4" style={{ marginTop: '30px' }}>
                            {step > 0 && (
                                <button 
                                    onClick={() => setStep(s => Math.max(0, s - 1))} 
                                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                                >
                                    Précédent
                                </button>
                            )}
                            {/* <button onClick={() => {setStep(s => Math.min(2, s + 1)) ; if (step === 0) { onStart(candidatId!, mission!.id) } }} className="px-6 py-3 bg-[#000080] text-white rounded-lg font-medium hover:bg-[#000060] transition-colors">
                                Suivant
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}