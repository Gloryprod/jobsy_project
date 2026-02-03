'use client';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Twitter, Edit, Save, X, Camera } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserProvider';
import { ThreeDots } from 'react-loader-spinner';
import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import PhoneInput from '@/components/forms/PhoneInput';
import PageInfo from '@/components/PageInfo';
import { Editor, EditorTextChangeEvent } from 'primereact/editor';

interface Contact {
    nom_promoteur: string;
    telephone: string;
    email: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    twitter: string;
    [key: string]: string; 
}

interface Entreprise {
    id: number;
    nom_officiel?: string;
    nom_entreprise: string;
    date_creation?: Date | null;
    secteur_activite?: string;
    localisation?: string;
    taille?: string;
    site_web?: string;
    description?: string;
    logo?: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function Profile() {
    const { data, error, isLoading: swrLoading } = useSWR('/entreprise/contact', fetcher);
    const { user, loading: userLoading } = useUser();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isInfoEditing, setInfoEditing] = useState(false);
    const [isContactEditing, setContactEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [entreprise, setEntreprise] = useState<Partial<Entreprise>>({});
    const [contact, setContact] = useState<Partial<Contact>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logo, setLogo] = useState<string | null>(null);

    const pageLink = "/dashboard/entreprises/profile";

    useEffect(() => {
        if (!data) return;
    
        const fetchProfile = () => {
            setEntreprise(data.data);
            setLogo(data.data.logo || null);
            if (data.data.contact_entreprise) {
                const c = Array.isArray(data.data.contact_entreprise) ? data.data.contact_entreprise[0] : data.data.contact_entreprise;
                setContact(c || {});
            }
        };

        fetchProfile();
        
    }, [data]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    

    const saveLogo = async (file: File, entrepriseId: number) => {
        try {
            const formData = new FormData();
            formData.append('logo', file);
            formData.append('_method', 'POST');

            const response = await api.post(`/entreprise/infos/${entrepriseId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' }                
            });

            mutate('/entreprise/contact');
            setLogo(data.data.logo || null);
            setLogoFile(null);
            toast.success("Logo mis à jour avec succès");
        } catch (error : any) {
            if(error.response){
                toast.error(error.response.data.message);
            }
        }
    };

    const saveInfo = async (entrepriseId: number) => {
        try {
            const formData = new FormData();
            formData.append('nom_officiel', entreprise.nom_officiel || '');
            formData.append('nom_entreprise', entreprise.nom_entreprise || '');
            formData.append('secteur_activite', entreprise.secteur_activite || '');
            formData.append('localisation', entreprise.localisation || '');
            formData.append('description', entreprise.description || '');
            formData.append('site_web', entreprise.site_web || '');
            // formData.append('date_creation', entreprise.date_creation || '');
            formData.append('taille', entreprise.taille || '');
            
            const response = await api.post(`/entreprise/infos/${entrepriseId}`, formData, {
                headers: { 'Accept': 'application/json' }                
            });

            mutate('/entreprise/contact');
            setEntreprise(data.data || null);
            toast.success("Informations mises à jour avec succès.");
        } catch (error : any) {
            if(error.response){
                toast.error(error.response.data.message);
            }
        }
    };

    const saveContact = async (entrepriseId: number) => {
        try {
            await api.post(`/entreprise/contact/${entrepriseId}`, contact);
            toast.success("Informations de contact mises à jour avec succès.");
            setContactEditing(false);
            mutate('/entreprise/contact');
            setContact(data.data.contact_entreprise || {});
        } catch (error : any) {
            if(error.response){
                toast.error(error.response.data.message);
            }
        }
    };

    if (userLoading || swrLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ThreeDots height="80" width="80" color="#000080" visible={true} />
            </div>
        );
    }   

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-400">Erreur de chargement du profil.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative p-2 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Profil Entreprise" pageLink={pageLink} />
            </div>
            
            <div className="space-y-6 w-full">
                
                {/* Header Card */}
                <div className="bg-white p-6 rounded-4xl shadow-sm border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative group w-20 h-20 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50">
                                <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${logo}` || 'avatar.png'} alt="Logo" fill className="object-cover" unoptimized />
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                    <Camera size={20} />
                                    <span className="text-[10px] mt-1">Modifier</span>
                                    <input type="file" className="hidden" onChange={e => {const file = e.target.files?.[0];if (file && entreprise.id) {setLogoFile(file);saveLogo(file, entreprise.id);}}} accept='image/*' />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-black uppercase">{entreprise.nom_entreprise}</h2>
                                <p className="text-gray-500 text-sm">{entreprise.localisation}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
                                <Link href={contact.linkedin || "#"} className="text-gray-400 hover:text-[#0077b5]"><Linkedin size={20} /></Link>
                                <Link href={contact.facebook || "#"} className="text-gray-400 hover:text-[#1877f2]"><Facebook size={20} /></Link>
                                <Link href={contact.instagram || "#"} className="text-gray-400 hover:text-[#e4405f]"><Instagram size={20} /></Link>
                                <Link href={contact.twitter || "#"} className="text-gray-400 hover:text-black"><Twitter size={20} /></Link>
                            </div>

                            <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-white border border-[#000080] text-[#000080] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                                <Edit size={14} /> Réseaux Sociaux
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- MODAL RESEAUX SOCIAUX --- */}
                {isOpen && (
                    /* Utilisation de fixed inset-0 avec un z-index très élevé */
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        
                        {/* Overlay : On s'assure qu'il couvre tout l'écran indépendamment du parent */}
                        <div 
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
                            onClick={() => setIsOpen(false)} 
                        />

                        {/* Boîte de dialogue : Ajout de pointer-events-auto pour cliquer dedans */}
                        <div className="relative z-50 bg-white rounded-3xl shadow-2xl w-[calc(100%-2rem)] max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                            
                            {/* Header du Modal */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                                <h3 className="text-xl font-bold text-[#000080]">Modifier les liens</h3>
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20}/>
                                </button>
                            </div>

                            {/* Corps du Modal */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-5">
                                    {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                        <div key={social} className="group">
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1 group-focus-within:text-[#000080] transition-colors">
                                                {social}
                                            </label>
                                            <input 
                                                type="text" 
                                                value={contact[social as keyof typeof contact] || ''} 
                                                onChange={(e) => setContact({ ...contact, [social]: e.target.value })}
                                                className="w-full text-black px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#000080]/10 focus:border-[#000080] outline-none transition-all"
                                                placeholder={`https://${social}.com/votre-page`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer du Modal */}
                            <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <button 
                                    onClick={() => {setIsOpen(false); if (entreprise.id) saveContact(entreprise.id)}} 
                                    className="w-full bg-[#000080] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#000060] transition-all"
                                >
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SECTION CONTACT --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[#000080]">Contact Promoteur</h2>
                        <button onClick={() => setContactEditing(!isContactEditing)} className="flex items-center gap-2 text-[#000080] text-sm font-medium">
                            {isContactEditing ? <><X size={16}/> Annuler</> : <><Edit size={16}/> Modifier</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: "Nom du promoteur", key: "nom_promoteur", type: "text" },
                            { label: "Adresse email", key: "email", type: "email" },
                            { label: "Numéro de téléphone", key: "telephone", type: "tel" },
                        ].map((field) => (
                            <div key={field.key}>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">{field.label}</h3>
                                
                                {isContactEditing ? (
                                    field.type === "tel" ? (
                                        <PhoneInput
                                            value={contact.telephone || ''}
                                            onChange={(v) => setContact({ ...contact, telephone: v || '' })}
                                        />
                                    ) : (
                                        <input 
                                            type={field.type}
                                            value={contact[field.key] || ''} 
                                            onChange={e => setContact({ ...contact, [field.key]: e.target.value })}
                                            className="w-full p-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080]/20 outline-none" 
                                        />
                                    )
                                ) : (
                                    <p className="text-gray-700 font-medium">
                                        {contact[field.key] || 'Non renseigné'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    {isContactEditing && (
                        <div className="flex justify-end mt-6">
                            <button onClick={() => {setContactEditing(false); if(entreprise.id) {saveContact(entreprise.id)};}} className="bg-[#000080] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#000060]">
                                <Save size={16} /> Enregistrer
                            </button>
                        </div>
                    )}
                </div>

                {/* --- SECTION À PROPOS --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-[#000080]">À propos</h2>
                        <button onClick={() => setIsEditing(!isEditing)} className="text-[#000080] text-sm font-medium flex items-center gap-2">
                            {isEditing ? <><X size={16}/> Annuler</> : <><Edit size={16}/> Modifier</>}
                        </button>
                    </div>
                    {isEditing ? (
                        <div className="space-y-4">
                            {/* <textarea 
                                className="w-full min-h-[120px] p-4 border rounded-xl focus:ring-2 focus:ring-[#000080]/20 outline-none text-gray-600"
                                value={entreprise.description || ''}
                                onChange={(e) => setEntreprise({ ...entreprise, description: e.target.value })}
                            /> */}
                            <Editor name="description" className="w-full min-h-[120px] p-4 border rounded-xl focus:ring-2 focus:ring-[#000080]/20 outline-none text-gray-600" value={entreprise.description || ''} onTextChange={(e: EditorTextChangeEvent) => setEntreprise({ ...entreprise, description: e.htmlValue})} style={{ height: '320px' }} />
                            
                            <div className="flex justify-end">
                                <button onClick={() => {setIsEditing(false) ; if(entreprise.id) {saveInfo(entreprise.id)}}} className="bg-[#000080] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#000060]">
                                    <Save size={16} /> Enregistrer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 leading-relaxed italic whitespace-pre-line">
                            {entreprise.description || "Aucune description disponible."}
                        </p>
                    )}
                </div>

                {/* --- INFORMATIONS ADMINISTRATIVES --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[#000080]">Informations Administratives</h2>
                        <button onClick={() => setInfoEditing(!isInfoEditing)} className="text-[#000080] text-sm font-medium flex items-center gap-2">
                            {isInfoEditing ? <><X size={16}/> Annuler</> : <><Edit size={16}/> Modifier</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: "Nom Entreprise", key: "nom_entreprise" },
                            { label: "Nom Officiel", key: "nom_officiel" },
                            { label: "Secteur d'activité", key: "secteur_activite" },
                            { label: "Localisation", key: "localisation" },
                            { label: "Taille", key: "taille" },
                            { label: "Site Web", key: "site_web" }
                        ].map((item) => (
                            <div key={item.key}>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">{item.label}</h3>
                                {isInfoEditing ? (
                                    <input 
                                        type="text" 
                                        value={(entreprise as any)[item.key] || ''} 
                                        onChange={(e) => setEntreprise({ ...entreprise, [item.key]: e.target.value })} 
                                        className="w-full p-2 text-black border-black rounded-lg focus:ring-2 focus:ring-[#000080]/20 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-700 font-medium">{(entreprise as any)[item.key] || '—'}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {isInfoEditing && (
                        <div className="flex justify-end mt-6">
                            <button onClick={() => {setInfoEditing(false) ; if(entreprise.id) {saveInfo(entreprise.id)}}} className="bg-[#000080] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#000060]">
                                <Save size={16} /> Enregistrer les infos
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}