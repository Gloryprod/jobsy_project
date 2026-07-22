'use client'
import PageInfo from "@/components/PageInfo";
import FinalExamForm from "@/components/dashboardAdmin/finalExam/FinalExamForm";
import {  
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { use } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function EditModule({ params }: { params: Promise<{ id: string; finalExamId: string }> }){
    const {id, finalExamId } = use(params);
    const pageLink = `/dashboard/admin/courses/${id}/final-exam/${finalExamId}`;

    const [question, setQuestion] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/getQuestions/${finalExamId}`)
        .then(res => {
            setQuestion(res.data)
            setLoading(false)
        })
        .catch(() => setLoading(false))
    }, [finalExamId])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>      
    );
    if (!question) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-400">Erreur de chargement des informations de la question.</p>
        </div>
    );

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Modifier une question" pageLink={pageLink} />
            </div>

            <div className="w-full mx-auto my-10 p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 ml-4 mb-4">Examen Final</h2>
                <DropdownMenuSeparator className="ml-4 mr-4 flex items-center justify-end" />
                <FinalExamForm courseId={id} initialData={question}/>                
            </div>
        </div>
    ) 
}