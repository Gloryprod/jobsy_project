"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, Check, AlertCircle, Save, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface QuestionFormData {
  id?: number;
  question_text: string;
  options: string[];
  correct_answers: string[];
  points: number;
}

interface QuestionFormProps {
  courseId: string;
  initialData?: QuestionFormData; // Présent si on est en mode édition
  onSuccess?: () => void;         // Callback pour rafraîchir la liste SWR parente
  onCancel?: () => void;
}

export default function FinalExamQuestionForm({ courseId, initialData, onSuccess, onCancel }: QuestionFormProps) {
  // Détermination du mode grâce à initialData (Exactement comme ton formulaire de mission)
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  // Configuration de react-hook-form
  const { register, handleSubmit, control, reset, watch, setValue } = useForm<QuestionFormData>({
    defaultValues: {
      question_text: "",
      options: ["", ""], // Au moins 2 options par défaut à la création
      correct_answers: [],
      points: 1,
    },
    values: initialData, // Injecte automatiquement les données si elles changent
  });

  console.log("Initial Data in Form:", initialData); // Debug : Vérifie les données reçues

  // Gestion dynamique du tableau des options grâce à useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options" as any,
  });

  // On écoute en temps réel les changements des options et des bonnes réponses
  const watchedOptions = watch("options") || [];
  const watchedCorrectAnswers = watch("correct_answers") || [];

  // Reset du formulaire si initialData change (sécurité mode édition)
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Gérer la sélection/désélection d'une bonne réponse
  const handleToggleCorrectAnswer = (optionText: string) => {
    if (!optionText.trim()) {
      toast.error("Veuillez d'abord écrire le texte de l'option.");
      return;
    }

    if (watchedCorrectAnswers.includes(optionText)) {
      setValue(
        "correct_answers",
        watchedCorrectAnswers.filter((ans) => ans !== optionText)
      );
    } else {
      setValue("correct_answers", [...watchedCorrectAnswers, optionText]);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (formData: QuestionFormData) => {
    // Nettoyage et validations de sécurité avant envoi
    const cleanOptions = formData.options.map((o) => o.trim()).filter((o) => o !== "");
    const cleanCorrect = formData.correct_answers.filter((ans) => cleanOptions.includes(ans));

    if (!formData.question_text.trim()) {
      return toast.error("L'énoncé de la question est obligatoire.");
    }
    if (cleanOptions.length < 2) {
      return toast.error("Il faut au moins 2 options valides.");
    }
    if (cleanCorrect.length === 0) {
      return toast.error("Sélectionnez au moins une bonne réponse.");
    }

    const dataToSend = {
      ...formData,
      options: cleanOptions,
      correct_answers: cleanCorrect,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await api.post(`/update-question/${courseId}/${initialData.id}`, dataToSend);
        toast.success("Question modifiée avec succès.");
      } else {
        await api.post(`/final-exam-questions/${courseId}`, dataToSend);
        toast.success("Question ajoutée à l'examen.");
      }

      if (onSuccess) onSuccess(); // Déclenche le re-fetch SWR du composant parent
    } catch (error: any) {
      const msg = error.response?.data?.message || "Une erreur est survenue.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Classes de styles réutilisables (Esprit Jobsy)
  const inputClass = "w-full mt-1 p-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none transition-all font-medium";
  const labelClass = "block text-xs font-black text-slate-500 uppercase tracking-wider";

  return (
    <div className=" p-6 md:p-8 w-full mx-auto animate-fadeIn">
      
      {/* Entête du formulaire */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-base font-black text-slate-900">
            {isEditing ? "Modifier la question" : "Ajouter une question"}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">Examen final de la certification</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="cursor-pointer text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Annuler
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Énoncé de la question */}
        <div>
          <label className={labelClass}>Énoncé de la question</label>
          <textarea
            {...register("question_text")}
            name="question_text"
            rows={3}
            className={inputClass}
            placeholder="Ex : Quelle est la différence principale entre un composant contrôlé et non contrôlé en React ?"
          />
        </div>

        {/* Zone des options */}
        <div className="space-y-3">
          <label className={labelClass}>Options de réponse (Cochez la ou les bonnes réponses)</label>
          
          <div className="space-y-2.5">
            {fields.map((field, index) => {
              const currentOptionValue = watchedOptions[index] || "";
              const isCorrect = watchedCorrectAnswers.includes(currentOptionValue) && currentOptionValue.trim() !== "";

              return (
                <div 
                  key={field.id} 
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                    isCorrect ? "border-green-200 bg-green-50/40" : "border-slate-100 bg-slate-50/50"
                  }`}
                >
                  {/* Case à cocher personnalisée pour marquer la réponse correcte */}
                  <button
                    type="button"
                    onClick={() => handleToggleCorrectAnswer(currentOptionValue)}
                    className={`cursor-pointer w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isCorrect ? "bg-green-500 text-white shadow-sm" : "bg-white border border-slate-200 text-transparent"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-3" />
                  </button>

                  {/* Champ texte de l'option */}
                  <input
                    {...register(`options.${index}` as const)}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 placeholder:text-slate-300 p-1"
                  />

                  {/* Bouton pour supprimer une option (Minimum 2 obligatoires) */}
                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton pour ajouter dynamiquement une option */}
          <button
            type="button"
            onClick={() => append("")}
            className="cursor-pointer flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 hover:border-slate-200 hover:text-slate-600 transition-all text-[10px] font-black uppercase tracking-wider bg-white"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une option de réponse
          </button>
        </div>

        {/* Pied du formulaire : Barème & Messages d'alerte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-4 border-t border-slate-50">
          <div>
            <label className={labelClass}>Barème de points</label>
            <input
              {...register("points", { valueAsNumber: true })}
              type="number"
              min="1"
              className={`${inputClass} max-w-30 text-center font-black text-[#000080]`}
            />
          </div>

          {watchedCorrectAnswers.length === 0 && (
            <div className="flex items-center gap-1.5 text-red-500 sm:justify-end animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider">Aucune bonne réponse cochée</span>
            </div>
          )}
        </div>

        {/* Bouton d'action principal */}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-3.5 bg-[#000080] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Enregistrement..." : isEditing ? "Mettre à jour la question" : "Créer la question"}
        </button>

      </form>
    </div>
  );
}