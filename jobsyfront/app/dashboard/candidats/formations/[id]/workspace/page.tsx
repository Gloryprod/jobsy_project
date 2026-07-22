"use client"
import FormationStandardDetail from "@/components/dashboardCandidat/courses/workspace/FormationStandard";
import FormationLogistiqueDetail from "@/components/dashboardCandidat/courses/workspace/FormationLogistiqueDetail";
import { use } from "react";
import api from "@/lib/api";
import useSWR from "swr";
import { ThreeDots } from "react-loader-spinner";


interface ApiResponse {
  status: string;
  course: {
    validation_mode: string
    type_contenu: string
  };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);
export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(`/getCourse/${id}`, fetcher)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500 font-bold text-sm">Erreur lors du chargement de l&apos;espace de cours.</p>
      </div>
    );  
  }

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeDots height="80" width="80" color="#000080" visible={true} />
      </div>    
    );
  }

  const { validation_mode, type_contenu } = data.course;

  switch(validation_mode){
    case "A" :
    return (
      <div className="p-8">
        <FormationStandardDetail params={{ id }} />
      </div>
    );

    case "B" :
    return (
      <div className="p-8">
        <FormationLogistiqueDetail params={{ id }} />
      </div>
    );

    case "C" :
    if (type_contenu === "Digital") {
      return (
        <div className="p-8">
          <FormationStandardDetail params={{ id }} />
        </div>
      );
    }else{
      return (
      <div className="p-8">
          <FormationLogistiqueDetail params={{ id }} />
        </div>
      );
    }
    


  }
  
}