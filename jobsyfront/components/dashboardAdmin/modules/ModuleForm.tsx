'use client'
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form"
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Editor } from 'primereact/editor';
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { X } from 'lucide-react';
import { z } from "zod";

interface Course {
  id: string;
  title: string;
  description: string;
  validation_mode: 'A' | 'B' | 'C';
  delivered_skills: string;
  reward_xp: number;
  reward_asset: string;
  is_active: boolean
}

const lessonSchema = z.object({
    title: z.string()
        .min(1, "Le titre de la leçon est obligatoire."),
    
    type: z.enum(['video', 'text', 'pdf', 'quiz_check'], "Veuillez sélectionner un type de contenu valide."),
    
    content: z.any()
        .refine((val) => {
            if (!val) return false;
            // Si c'est du texte, on vérifie la longueur
            if (typeof val === 'string') return val.length > 0;
            // Si c'est un fichier, on vérifie qu'il existe
            if (val instanceof File) return true;
            return false;
        }, "Le contenu ou le fichier est obligatoire.")
        .refine((val) => {
            // Optionnel : Validation de la taille si c'est un fichier
            if (val instanceof File) {
                const maxSize = 50 * 1024 * 1024; // 50MB
                return val.size <= maxSize;
            }
            return true;
        }, "Le fichier est trop lourd (max 50MB)"),
    
    duration_minutes: z.number({
        message: "La durée doit être un nombre.",
    }).min(1, "La durée doit être d'au moins 1 minute."),
    
    order: z.number({
        message: "La position de la leçon est requise."
    }).min(1, "L'ordre doit être supérieur à 0.")
});

interface Lesson {
    'module_id': number;
    'title': string;
    'type': 'video' | 'text' | 'pdf' | 'quiz_check';
    'content': string;
    'duration_minutes': number;
    'order': number;
}

const quizQuestionSchema = z.object({
    question_text: z.string()
        .min(1, "Le texte de la question est obligatoire."),
    
    options: z.array(z.string().min(1, "Chaque option doit être une chaîne non vide."))
        .min(2, "Il doit y avoir au moins 2 options pour la question."),
    
    points: z.number({
        message: "Le nombre de points doit être un nombre.",
    }).min(1, "La question doit valoir au moins 1 point.")
});

interface QuizQuestion {
    'module_id': number;
    'question_text': string;
    'options': string[];
    'points': number;
}

interface Module {
    id: number;
    title: string;
    description: string;
    order: number;
    course: Course;
    lessons?: Lesson[];
    quiz_questions?: QuizQuestion[];
}

interface ModuleFormProps {
  courseId?: string; // Nécessaire pour lier le module à un cours
  initialData?: Module; // Les données du module en mode édition
}

export default function ModuleForm({ courseId, initialData }: ModuleFormProps) {

    const router = useRouter()
    const isEditing = !!initialData
    const [loading, setLoading] = useState(false);
    const [openLessonForm, setOpenLessonForm] = useState(false);
    const [openQuizForm, setOpenQuizForm] = useState(false);
    const [contentType, setContentType] = useState('text'); // Pour gérer le type de contenu de la leçon
    const [lessonContent, setLessonContent] = useState<Lesson[]>([]);
    const [quizContent, setQuizContent] = useState<QuizQuestion[]>([]);

    const {register, handleSubmit, reset, control} = useForm<Module>({
        values: initialData,
    })

    useEffect(() => {
        if (initialData) {
            reset(initialData);
            setLessonContent(initialData.lessons || []);
            setQuizContent(initialData.quiz_questions || []);
        }
    }, [initialData, reset]);

    const onSubmit = async (data: Module) => {
        setLoading(true);

        const formData = new FormData();

        // 1. Les champs simples du module
        formData.append('title', data.title);
        formData.append('order', data.order.toString());
        formData.append('course_id', courseId!);
        formData.append('description', data.description);

        // 2. Le tableau de leçons (incluant les fichiers)
        lessonContent.forEach((lesson, index) => {
            formData.append(`lessons[${index}][title]`, lesson.title);
            formData.append(`lessons[${index}][type]`, lesson.type);
            formData.append(`lessons[${index}][order]`, lesson.order.toString());
            formData.append(`lessons[${index}][duration_minutes]`, lesson.duration_minutes.toString());
            
            // Si content est un objet File, FormData l'enverra correctement
            formData.append(`lessons[${index}][content]`, lesson.content);
        });

        // 3. Le tableau de quiz
        quizContent.forEach((quiz, index) => {
            formData.append(`quiz_questions[${index}][question_text]`, quiz.question_text);
            formData.append(`quiz_questions[${index}][points]`, quiz.points.toString());
            // Pour un tableau d'options
            quiz.options.forEach((opt, optIndex) => {
                formData.append(`quiz_questions[${index}][options][${optIndex}]`, opt);
            });
        });

        try {
            if (isEditing) {
                await api.post(`/editModule/${initialData.id}`, formData, {
                    headers: {"Content-Type": "multipart/form-data"}
                })
                toast.success("Modification effectuée avec succès.");

            } else {
                await api.post("/storeModule", formData, {
                    headers: {"Content-Type": "multipart/form-data"}
                })
                toast.success("Module ajouté avec succès.");
            }
            router.push(`/dashboard/admin/courses/${courseId}/modules`)
        } catch (error: any) {
            const messages = error.response?.data?.message;
            toast.error(messages);

        } finally {
            setLoading(false); // On débloque le bouton
        }
    };

    const handleLessonContentChange = (container: any) => {
        // On récupère les valeurs via querySelector car on n'est plus dans un "submit"
        const title = container.querySelector('[name="title"]').value;
        const type = container.querySelector('[name="type"]').value;
        const duration_minutes = parseInt(container.querySelector('[name="lesson_duration"]').value);
        const order = parseInt(container.querySelector('[name="lesson_order"]').value);
        
        let content = "";
        if (type === 'text') {
            content = container.querySelector('[name="lesson_content"]').value;
        } else {
            content = container.querySelector('[name="lesson_media"]').files[0];
        }

        console.log("Contenu récupéré :", content );

        const formValues = { title, type, content, duration_minutes, order };

        const validation = lessonSchema.safeParse(formValues);

        if (!validation.success) {
            validation.error.issues.forEach((err) => toast.error(err.message));
            return;
        }

        setLessonContent((prev) => [
            ...prev,
            { ...formValues, type: type as any, module_id: initialData?.id || 0 }
        ]);

        toast.success("Leçon ajoutée à la liste !");
        console.log(lessonContent);

        // setOpenLessonForm(false); 
    };

    const handleDeleteLesson = (index: number) => {
        setLessonContent((prev) => prev.filter((_, i) => i !== index));
        toast.success("Leçon supprimée de la liste !");
    }

    const handleQuizContentChange = (container: any) => {
        const question_text = container.querySelector('[name="question_text"]').value;
        const options = container.querySelector('[name="options"]').value.split(',').map((opt: string) => opt.trim());
        const points = parseInt(container.querySelector('[name="points"]').value);

        const formValues = { question_text, options, points };

        const validation = quizQuestionSchema.safeParse(formValues);

        if (!validation.success) {
            validation.error.issues.forEach((err) => toast.error(err.message));
            return;
        }

        setQuizContent((prev) => [
            ...prev,
            { ...formValues, module_id: initialData?.id || 0 }
        ]);

        toast.success("Question de quiz ajoutée à la liste !");
        // setOpenQuizForm(false);
    };

    const handleDeleteQuiz = (index: number) => {
        setQuizContent((prev) => prev.filter((_, i) => i !== index));
        toast.success("Question de quiz supprimée de la liste !");
    };

    // Classe réutilisable pour les inputs
    const inputClass = "w-full mt-1 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-700"

    return(
        <div className="min-h-screen relative md:p-8 bg-white">               
            <form className="space-y-5">

                <div className='flex justify-end mt-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className='bg-[#F0E68C] text-black cursor-pointer hover:bg-[#F0E68C]/80'>Ajouter du contenu</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => setOpenLessonForm(true)} className='cursor-pointer'>Ajouter une leçon</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setOpenQuizForm(true)} className='cursor-pointer'>Ajouter un quiz</DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Titre du module</label>
                        <input {...register("title")} type="text" name="title" className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Ordre</label>
                        <input {...register("order")} type="number" name="order" className={inputClass} />
                    </div>
                </div>

                <div>     
                    <label className={labelClass}>Description</label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Editor 
                                value={field.value} 
                                onTextChange={(e) => field.onChange(e.htmlValue)} 
                                style={{ height: '320px' }} 
                            />
                        )}
                    />
                    {/* <Editor {...register("description")} name="description" className={inputClass}  onTextChange={(e: EditorTextChangeEvent) => setFormData({...formData, description: e.htmlValue ?? ""})} style={{ height: '320px' }} /> */}
                </div>

                {openLessonForm && (
                    <div>
                        <DropdownMenuSeparator className="my-4" />

                        <div className='flex items-center justify-between'>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ajouter une leçon</h3>
                            <Button variant="ghost" className='cursor-pointer text-red-500 hover:text-red-700' onClick={() => setOpenLessonForm(false)}>
                                <X className="h-4 w-4" />
                            </Button> 
                        </div>

                        {/* Formulaire d'ajout de leçon */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
                            <div>
                                <label className={labelClass}>Titre de la leçon</label>
                                <input type="text" name="title" className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Type de contenu</label>
                                <select name="type" className={inputClass} value={contentType} onChange={(e) => setContentType(e.target.value)}>
                                    <option value="video">Vidéo</option>
                                    <option value="text">Texte</option>
                                    <option value="pdf">Document</option>
                                </select>
                            </div>

                            {/* AFFICHAGE CONDITIONNEL */}
                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    {contentType === 'text' ? 'Contenu de la leçon' : 'Charger le fichier'}
                                </label>

                                {contentType === 'text' ? (
                                    // Si type === texte, on affiche le textarea
                                    <textarea 
                                        name="lesson_content" 
                                        className={`${inputClass} h-32`}
                                        placeholder="Écrivez votre cours ici..."
                                    ></textarea>
                                ) : (
                                    // Si type === vidéo ou pdf, on affiche le champ d'upload
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#000080] hover:text-indigo-500">
                                                    <span>Téléverser un fichier</span>
                                                    <input 
                                                        type="file" 
                                                        name="lesson_media" 
                                                        className="sr-only" 
                                                        accept={contentType === 'video' ? 'video/*' : 'application/pdf'} 
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {contentType === 'video' ? 'MP4, WebM jusqu\'à 50MB' : 'PDF jusqu\'à 10MB'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* <div className="md:col-span-2">
                                <label className={labelClass}>Contenu de la leçon</label>
                                <textarea name="lesson_content" className={`${inputClass} h-32`}></textarea>
                            </div> */}

                            <div>
                                <label className={labelClass}>Durée (minutes)</label>
                                <input type="number" name="lesson_duration" className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Ordre</label>
                                <input type="number" name="lesson_order" className={inputClass} />
                            </div>

                            <div className='flex justify-end md:col-span-2'>
                                <button 
                                    type="button" 
                                    onClick={(e) => {
                                        const container = e.currentTarget.closest('.grid');
                                        handleLessonContentChange(container);
                                    }}
                                    className="cursor-pointer mt-8 py-2 px-3 text-white bg-[#000080] hover:bg-[#000080]/70 font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                    Ajouter la leçon
                                </button>
                            </div>
                            
                        </div> 

                                            
                    </div>
                    
                )}

                <div className="space-y-2 mt-4">
                    {lessonContent.length > 0 && (
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Leçons ajoutées</h3>
                    )}
                    {lessonContent.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <span className="text-sm font-medium">{lesson.order}. {lesson.title}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-200 text-[#000080] px-2 py-1 rounded capitalize">{lesson.type}</span>
                                <button 
                                    type="button" 
                                    onClick={() => handleDeleteLesson(index)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>                                   
                        </div>
                    ))}
                </div>   

                {openQuizForm && (
                    <div>
                        <DropdownMenuSeparator className="my-4" />

                        <div className='flex items-center justify-between'>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ajouter une question de quiz</h3>
                            <Button variant="ghost" className='cursor-pointer text-red-500 hover:text-red-700' onClick={() => setOpenQuizForm(false)}>
                                <X className="h-4 w-4" />
                            </Button> 
                        </div>

                        {/* Formulaire d'ajout de question de quiz */}
                        <div className="border grid grid-cols-1 p-4 rounded-lg bg-gray-50">
                            {/* Les champs pour la question de quiz seront similaires à ceux de la leçon, mais adaptés pour les questions */}
                            {/* Par exemple : */}
                            <div>
                                <label className={labelClass}>Texte de la question</label>
                                <input type="text" name="question_text" className={inputClass} />
                            </div>

                            <div>
                                <label className={labelClass}>Options (séparées par des virgules)</label>
                                <input type="text" name="options" className={inputClass} placeholder="Option 1, Option 2, Option 3" />
                            </div>

                            <div>
                                <label className={labelClass}>Points</label>
                                <input type="number" name="points" className={inputClass} />
                            </div>

                            <div className='flex justify-end mt-4'>
                                <button 
                                    type="button" 
                                    onClick={(e) => {
                                        const container = e.currentTarget.closest('.border');
                                        handleQuizContentChange(container);
                                    }}
                                    className="cursor-pointer py-2 px-3 text-white bg-[#000080] hover:bg-[#000080]/70 font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                    Ajouter la question
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4 mt-6">
                    {quizContent.length > 0 && (
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Questions ajoutées</h3>
                    )}
                    {quizContent.map((question, index) => (
                        <div 
                            key={index} 
                            className="group bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row">
                                
                                {/* Colonne Gauche : La Question & Points */}
                                <div className="flex-1 p-4 bg-green-50/50">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">Question {index + 1}</span>
                                            <p className="text-sm md:text-base font-semibold text-gray-800 leading-tight">
                                                {question.question_text}
                                            </p>
                                        </div>
                                        <span className="shrink-0 bg-blue-100 text-[#000080] text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                            {question.points} Pts
                                        </span>
                                    </div>
                                </div>

                                {/* Colonne Droite : Les Options */}
                                <div className="flex-1 p-4 border-t md:border-t-0 md:border-l border-green-100 bg-white">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Options de réponse</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {question.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                <span className="text-xs text-gray-600 truncate">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action : Supprimer (Barre latérale sur desktop, bouton flottant ou intégré) */}
                                <div className="flex items-center justify-center p-2 bg-gray-50 md:bg-white border-t md:border-t-0 md:border-l border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => handleDeleteQuiz(index)} // Attention : vérifie si c'est handleDeleteQuestion ?
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Supprimer la question"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    type="button" 
                    disabled={loading} // Désactive le clic pendant le chargement
                    onClick={handleSubmit(onSubmit)}
                    className={`cursor-pointer w-full mt-8 py-3 px-5 text-white bg-[#000080] font-bold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-3
                        ${loading 
                            ? "opacity-70 cursor-not-allowed" 
                            : "hover:bg-[#000080]/90 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95"
                        }`}
                >
                    {loading ? (
                        <>
                            {/* Le Spinner */}
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{isEditing ? "Mise à jour..." : "Création..."}</span>
                        </>
                    ) : (
                        <span>{isEditing ? "Mettre à jour" : "Créer le module"}</span>
                    )}
                </button>
            </form>
        </div>
    ) 
}
