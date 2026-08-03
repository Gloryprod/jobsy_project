"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, FileText, Settings, Award } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

// Interfaces correspondant à notre migration Laravel
interface InputSchemaField {
  key: string;
  type: "textarea" | "url" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
}

interface EvaluationCriterion {
  name: string;
  max_points: number;
}

interface ExamProjectFormData {
  id?: number;
  title: string;
  domain: string;
  context_rich_text: string;
  inputs_schema: InputSchemaField[];
  evaluation_criteria: EvaluationCriterion[];
  passing_score: number;
  time_limit_minutes: number | null;
}

interface ExamProjectFormProps {
  courseId: string;
  initialData?: ExamProjectFormData; // Présent si on est en mode édition
  onSuccess?: () => void;         // Callback de rafraîchir
  onCancel?: () => void;
}

export default function FinalExamProjectForm({ courseId, initialData, onSuccess, onCancel }: ExamProjectFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);

  // Configuration de react-hook-form
  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<ExamProjectFormData>({
    defaultValues: {
      title: "",
      domain: "web_development",
      context_rich_text: "",
      // Par défaut, on propose une zone de rendu d'URL (ex: GitHub)
      inputs_schema: [
        { key: "github_url", type: "url", label: "Lien de votre dépôt GitHub", placeholder: "https://github.com/...", required: true }
      ],
      // Par défaut, on propose un critère basique de notation
      evaluation_criteria: [
        { name: "Qualité technique et propreté du code", max_points: 10 },
        { name: "Respect des fonctionnalités demandées", max_points: 10 }
      ],
      passing_score: 70,
      time_limit_minutes: null,
    },
    values: initialData, // Injection automatique des valeurs à l'édition
  });

  // 1. useFieldArray pour les champs de soumission dynamiques (inputs_schema)
  const { 
    fields: inputFields, 
    append: appendInput, 
    remove: removeInput 
  } = useFieldArray({
    control,
    name: "inputs_schema",
  });

  // 2. useFieldArray pour les critères d'évaluation dynamiques (evaluation_criteria)
  const { 
    fields: criteriaFields, 
    append: appendCriteria, 
    remove: removeCriteria 
  } = useFieldArray({
    control,
    name: "evaluation_criteria",
  });

  // Observation isolée des critères pour calculer le score max total dynamiquement
  const watchedCriteria = useWatch({
    control,
    name: "evaluation_criteria"
  }) || [];

  const totalMaxPoints = watchedCriteria.reduce((sum, item) => sum + (Number(item?.max_points) || 0), 0);

  // Sécurité mode édition
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Soumission du formulaire
  const onSubmit = async (formData: ExamProjectFormData) => {
    if (!formData.title.trim()) {
      return toast.error("Le titre du projet est obligatoire.");
    }
    if (!formData.context_rich_text.trim()) {
      return toast.error("La mise en contexte détaillée (énoncé) est obligatoire.");
    }
    if (formData.inputs_schema.length === 0) {
      return toast.error("Vous devez ajouter au moins un champ de réponse attendu.");
    }
    if (formData.evaluation_criteria.length === 0) {
      return toast.error("Veuillez définir au moins un critère de notation.");
    }
    if (totalMaxPoints <= 0) {
      return toast.error("Le total des points des critères de notation doit être supérieur à 0.");
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.post(`/update-exam-project/${courseId}/${initialData.id}`, formData);
        toast.success("Projet d'examen mis à jour avec succès.");
      } else {
        await api.post(`/exam-projects/${courseId}`, formData);
        toast.success("Projet d'examen créé avec succès.");
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full mt-1 p-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none transition-all font-medium";
  const labelClass = "block text-xs font-black text-slate-500 uppercase tracking-wider";

  return (
    <div className="p-6 md:p-8 w-full mx-auto animate-fadeIn">
      
      {/* Entête */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-base font-black text-slate-900">
            {isEditing ? "Modifier le Projet d'Examen" : "Créer le Projet d'Examen"}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">Examen final pratique - Mode Expert</p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cursor-pointer text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Annuler
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1 : Infos Générales */}
        <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide mb-2">
            <FileText className="w-4 h-4 text-[#000080]" /> Informations Générales
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Titre du Projet</label>
              <input
                {...register("title")}
                type="text"
                placeholder="Ex : Réalisation d'une API de Micro-crédit robuste"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Domaine d&apos;application</label>
              <select {...register("domain")} className={inputClass}>
                <option value="web_development">Développement Web / Mobile</option>
                <option value="design">Design Graphique & UI/UX</option>
                <option value="human_resources">Ressources Humaines & Management</option>
                <option value="marketing">Marketing Digital & Rédaction</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Mise en contexte / Énoncé détaillé</label>
            <textarea
              {...register("context_rich_text")}
              rows={8}
              placeholder="Décrivez précisément le cas d'entreprise ou le problème à résoudre par l'apprenant. Rédigez ici vos questions de cas pratique ou les fonctionnalités attendues."
              className={inputClass}
            />
          </div>
        </div>

        {/* Section 2 : Configuration des champs attendus de l'apprenant (inputs_schema) */}
        <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide mb-2">
            <Settings className="w-4 h-4 text-[#000080]" /> Formulaire de Réponse de l&apos;Apprenant
          </div>
          <p className="text-xs text-slate-400">Définissez ce que l&apos;étudiant verra sur son espace de rendu (zones de texte pour cas pratiques, URLs ou fichiers à uploader).</p>

          <div className="space-y-3">
            {inputFields.map((field, index) => (
              <div key={field.id} className="flex flex-col  gap-3 p-4 rounded-xl border border-slate-100 bg-white items-start md:items-center">
                
                {/* Libellé / Question posée à l'étudiant */}
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Libellé du champ / Consigne de rendu
                  </label>
                  <input
                    {...register(`inputs_schema.${index}.label` as const)}
                    type="text"
                    placeholder="Ex: Entrez l'URL de votre dépôt GitHub"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] outline-none transition-all"
                  />
                </div>


                {/* Type de champ */}
                <div className="w-full md:w-40">
                  <select
                    {...register(`inputs_schema.${index}.type` as const)}
                    className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-semibold focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="textarea">Zone de texte rédigée</option>
                    <option value="url">Lien externe (URL)</option>
                    <option value="file">Fichier (PDF, Image...)</option>
                  </select>
                </div>

                {/* Champ clé (identifiant interne unique) */}
                <input
                  type="hidden"
                  {...register(`inputs_schema.${index}.key` as const)}
                  value={field.key || `input_${Date.now()}_${index}`}
                />

                {/* Obligatoire ou non */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="checkbox"
                    id={`required_${field.id}`}
                    {...register(`inputs_schema.${index}.required` as const)}
                    className="rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`required_${field.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Obligatoire</label>
                </div>

                {/* Bouton de suppression d'un champ */}
                {inputFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => appendInput({ key: `input_${Date.now()}_${inputFields.length}`, type: "textarea", label: "", placeholder: "", required: true })}
            className="cursor-pointer flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-200/60 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all text-[10px] font-black uppercase tracking-wider bg-white"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter un champ de réponse
          </button>
        </div>

        {/* Section 3 : Grille de Notation & Barème */}
        <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide mb-2">
            <Award className="w-4 h-4 text-[#000080]" /> Grille de Notation (Critères)
          </div>

          <div className="space-y-3">
            {criteriaFields.map((field, index) => (
              <div key={field.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-white items-center">
                
                {/* Libellé du critère */}
                <input
                  {...register(`evaluation_criteria.${index}.name` as const)}
                  placeholder="Ex : Propreté et organisation du code ou Structure de l&apos;analyse"
                  className="flex-1 text-xs font-bold text-slate-700 bg-transparent border-b border-slate-150 focus:border-blue-500 outline-none pb-1"
                />

                {/* Points maximums */}
                <div className="w-24 shrink-0 flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    {...register(`evaluation_criteria.${index}.max_points` as const, { valueAsNumber: true })}
                    className="w-16 text-center text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-black"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pts</span>
                </div>

                {/* Suppression d'un critère */}
                {criteriaFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriteria(index)}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => appendCriteria({ name: "", max_points: 5 })}
            className="cursor-pointer flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-200/60 rounded-xl text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all text-[10px] font-black uppercase tracking-wider bg-white"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter un critère de notation
          </button>
        </div>

        {/* Section 4 : Paramètres de Validation Globale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-4 border-t border-slate-100">
          <div>
            <label className={labelClass}>Note de passage / 20</label>
            <input
              {...register("passing_score", { valueAsNumber: true })}
              type="number"
              min="10"
              max="100"
              className={inputClass}
            />
            <p className="text-[10px] text-slate-400 mt-1">Généralement réglé à 15.</p>
          </div>

          <div>
            <label className={labelClass}>Temps limite (Minutes)</label>
            <input
              {...register("time_limit_minutes", { valueAsNumber: true })}
              type="number"
              placeholder="Laisser vide si illimité"
              className={inputClass}
            />
            <p className="text-[10px] text-slate-400 mt-1">Ex: 180 pour 3 heures d&apos;examen.</p>
          </div>

          <div className="flex flex-col items-end justify-center bg-[#000080]/5 p-4 rounded-2xl border border-[#000080]/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total des critères</span>
            <span className="text-2xl font-black text-[#000080]">{totalMaxPoints} <span className="text-xs">Points</span></span>
          </div>
        </div>

        {/* Soumission */}
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-4 bg-[#000080] hover:bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Enregistrement en cours..." : isEditing ? "Sauvegarder les modifications" : "Créer le projet d'examen"}
        </button>

      </form>
    </div>
  );
}