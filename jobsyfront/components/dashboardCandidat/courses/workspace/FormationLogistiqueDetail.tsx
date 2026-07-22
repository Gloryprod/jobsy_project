"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { ThreeDots } from "react-loader-spinner";
import LogisticHoldScreen from "./LogisticHoldScreen";
import FinalExamIntro from "./FinalExamIntro";
import FinalExamProject from "./FinalExamProject";
import CertifiedScreen from "./CertifiedScreen";
import LearningPage from "./LearningPage";

// Interfaces calquées à 100% sur le retour JSON de ton API Laravel
interface Question {
  id: number;
  question_text: string;
  options: string[];
  points: number;
}

interface Capsule {
  id: string; // Ex: 'lesson-5' ou 'qcm-2'
  db_id?: number; // Présent pour les leçons
  module_id?: number; // Présent pour le QCM
  title: string;
  type: "video" | "text" | "qcm" | "pdf";
  duration: string;
  content_text: string | null;
  video_url: string | null;
  pdf_url: string | null;
  is_completed: boolean;
  questions?: Question[]; // Uniquement pour le type 'qcm'
}

interface Section {
  id: number;
  title: string;
  capsules: Capsule[];
}

interface ApiResponse {
  status: string;
  data: {
    enrollment_id:number
    course_title: string;
    validation_mode: string;
    progress_percentage: number;
    status: string;
    certificate_hash: string;
    sections: Section[];
    delivery_status: 'pending' | 'delivered';
    can_retry: boolean,
    time_remaining: number | 0;
  };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function FormationLogistiqueDetail({ params }: { params: { id: string } }) {
  const [currentCapsule, setCurrentCapsule] = useState<Capsule | null>(null);
  const logistic_type = "kit"

  // 1. Récupération des données via SWR
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    `/candidat/formations/${params.id}/workspace-standard`,
    fetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (response) => {
        if (!currentCapsule && response.data.sections.length > 0) {
          // Au premier chargement, on cherche la toute première capsule non terminée de toute la formation
          let initial: Capsule | null = null;
          for (const section of response.data.sections) {
            const firstUncompleted = section.capsules.find(c => !c.is_completed);
            if (firstUncompleted) {
              initial = firstUncompleted;
              break;
            }
          }
          // Si toutes sont terminées, on prend la première de la première section
          setCurrentCapsule(initial || response.data.sections[0].capsules[0]);
        }
      }
    }
  );

  // 2. LOGIQUE CRITIQUE : Liste ordonnée de toutes les capsules pour calculer la séquence et les verrous
    const allCapsulesOrdered = useMemo(() => {
        if (!data?.data?.sections) return [];
        const list: Capsule[] = [];
        data.data.sections.forEach((section) => {
        section.capsules.forEach((capsule) => {
            list.push(capsule);
        });
        });
        return list;
    }, [data]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-bold text-sm">Erreur lors du chargement de l&apos;espace de cours.</p>
      </div>
    );
  }

  if (isLoading || (!currentCapsule && !data)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots height="80" width="80" color="#000080" visible={true} />
      </div>    
    );
  }

  const {enrollment_id, course_title, delivery_status, status, certificate_hash, progress_percentage, sections, validation_mode, can_retry, time_remaining } = data!.data;  

  switch (status) {

    case "waiting_kit":
      return <LogisticHoldScreen enrollment_id = {enrollment_id}  course_title={course_title} delivery_status={delivery_status} logistic_type={logistic_type} onRefresh={() => mutate()}/>;

    case "learning":
        return <LearningPage validation_mode={validation_mode} courseId={params.id} courseTitle={course_title} capsuleCurrent={currentCapsule} sections={sections} progress_percentage={progress_percentage} allCapsulesOrdered={allCapsulesOrdered} onMutate={mutate} />;
    
    case "evaluation_ready" : 
        if (validation_mode === "C") {
          return <FinalExamProject courseId={params.id} can_retry={can_retry} time_remaining={time_remaining} onMutate={mutate} />;
        } else {
          return <FinalExamIntro courseId={params.id} courseTitle={course_title} onExamFinished={mutate} />;
        }
    
    case "failed" : 
        if (can_retry){
          if (validation_mode === "C") {
            return <FinalExamProject courseId={params.id} can_retry={can_retry} time_remaining={time_remaining} onMutate={mutate} />;
          } else {
            return <FinalExamIntro courseId={params.id} courseTitle={course_title} onExamFinished={mutate} />;
          }
        }else{
          return (
            <div>
              {validation_mode === "C" ? (
                <FinalExamProject courseId={params.id} can_retry={can_retry} time_remaining={time_remaining} onMutate={mutate} />
              ) : (
                <FinalExamIntro courseId={params.id} courseTitle={course_title} onExamFinished={mutate} />
              )}
                <LearningPage validation_mode={validation_mode} courseId={params.id} courseTitle={course_title} capsuleCurrent={currentCapsule} sections={sections} progress_percentage={progress_percentage} allCapsulesOrdered={allCapsulesOrdered} onMutate={mutate} />
            </div>
          )
        }
        
    case "certified":
        return <CertifiedScreen courseId={params.id} courseTitle={course_title} certificateHash = {certificate_hash} />;
    
    default:
      return (
        <div className="p-6 text-center text-xs font-bold text-slate-400">
          Statut de formation inconnu.
        </div>
      );
  }

  
}