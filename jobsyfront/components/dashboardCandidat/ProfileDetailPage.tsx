'use client';

import React, { useEffect, useState } from 'react';
import { User, Edit, Save, Phone, Mail, MapPin, CheckCircle, Lightbulb, FileText, GraduationCap, Trash2, BadgeCheck, Trophy, Shield, UserRoundCog } from 'lucide-react';
import api from '@/lib/api';
import { useUser } from '@/context/UserProvider';
import PhoneInput from '@/components/forms/PhoneInput';
import { toast } from 'react-hot-toast';
import Swal from "sweetalert2";
import useSWR, {mutate} from 'swr';
import { ThreeDots } from 'react-loader-spinner';
import { Button } from '../ui/button';

/* =======================
   TYPES
======================= */

interface Contact {
  telephone?: string;
  email_secondaire?: string;
  linkedin?: string;
  whatsapp?: string;
}

interface Diplome {
  id: number;
  intitule: string;
  annee?: string;
  etablissement?: string;
  fichier: string;
}

interface CV {
  id: number;
  fichier: string;
}

interface Rank {
  label: string;
  rank: string;
  points: number;
  color: string;
  code_hexa: string;
}

interface CandidatData {
  id: number;
  nom: string;
  prenom: string;
  is_validate: boolean;
  date_naissance?: string;
  sexe?: string;
  nationalite?: string;
  ville?: string;
  bio?: string;
  adresse?: string;
  rang?: string;
  xp?: number;
  contact?: Contact;
  diplomes: Diplome[];
  cv?: CV;
  rank?: Rank;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);


/* =======================
   PAGE
======================= */

export default function ProfileDetailPage() {
  const { data, error, isLoading } = useSWR('/candidat/profile', fetcher);

  const { user, loading: authLoading } = useUser();

  const [profile, setData] = useState<CandidatData | null>(null);
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [infoForm, setInfoForm] = useState<any>({});
  const [contactForm, setContactForm] = useState<Contact>({});
  const [cv, setCv] = useState<CV | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [diplomeFile, setDiplomeFile] = useState<File | null>(null);
  const [intitule, setIntitule] = useState<string | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [diplomeLoading, setDiplomeLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword_confirmation, setConfirmPassword] = useState('');


  /* =======================
     FETCH PROFILE
  ======================= */

  useEffect(() => {
    if (!user || !data) return;

    const fetchProfile = () => {        
        setData(data.data);
        setInfoForm(data.data);
        setContactForm(data.data.contact || {});
        setCv(data.data.cv || null);
        setDiplomes(data.data.diplomes || []);  
        console.log('data', data);
        setLoading(false);
    };

    fetchProfile();
  }, [user, data]);

  const handleUpdate = async () => {
    mutate('/candidat/profile', { ...data }, true);
    setData(data.data);
    setInfoForm(data.data);
    setContactForm(data.data.contact || {});
    setCv(data.data.cv || null);
    setDiplomes(data.data.diplomes || []);  
  };
    

  /* =======================
     HANDLERS
  ======================= */

  const saveInfo = async () => {
    try{
      await api.post('/update/info', infoForm);
      toast.success("Informations personnelles mises à jour avec succès.");
      setEditing(null);
      handleUpdate();
    }catch(err){
      toast.error("Erreur lors de la mise à jour des informations personnelles.");
      return;
    }
  };

  const saveContact = async () => {
    try{
      await api.post('/update/contact', contactForm);
      toast.success("Informations de contact mises à jour avec succès.");
      setEditing(null);
      handleUpdate();
    }catch(err){
      toast.error("Erreur lors de la mise à jour des informations de contact.");
      return;
    }  
  };

const uploadCv = async () => {
    if (!cvFile) return;

    const formData = new FormData();
    formData.append('fichier', cvFile);

    try {
      setCvLoading(true);

      await api.post('/candidat/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // refresh profil
      handleUpdate();
      setCvFile(null);

      if (profile?.is_validate) {
        toast.success('CV uploadé avec succès');
      }else{
        Swal.fire({
          icon: 'success',
          title: 'CV uploadé avec succès',
          text: 'Veuillez soumettre les fichiers de vos attestations de diplômes pour valider votre profil.',
          showConfirmButton: true,
        });
      }

    } catch (e) {
      toast.error('Erreur lors de l’upload du CV');
    } finally {
      setCvLoading(false);
    }
};


const uploadDiplome = async () => {
  if (!diplomeFile || !intitule) return;

  const formData = new FormData();
  formData.append('fichier', diplomeFile);
  formData.append('intitule', intitule);

  try {
    setDiplomeLoading(true);

    await api.post('/candidat/diplome', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // refresh profil
    handleUpdate();
    setIntitule(null);
    setDiplomeFile(null);

    if (profile?.is_validate) {
      toast.success('Diplome uploadé avec succès');
    }else{
        Swal.fire({
        icon: 'success',
        title: 'Diplome uploadé avec succès',
        text: 'Vous recevrez bientôt une notification par mail après validation de votre profil.',
        showConfirmButton: true,
      });
    }

  } catch (e) {
    toast.error('Erreur lors de l’upload du diplome');
  } finally {
    setDiplomeLoading(false);
  }
};

const deleteCv = async () => {
  try {
    await api.delete('/candidat/cv');

    toast.success('CV supprimé');

    setCv(null);
    setData(prev => prev ? { ...prev, cv: undefined } : prev);
  } catch (e) {
    toast.error('Erreur lors de la suppression du CV');
  }
};

const deleteDiplome = async (id: number) => {
  try {
    await api.delete('/candidat/diplomes/' + id);

    toast.success('Diplome supprimé');

    setDiplomes(prev => prev.filter(d => d.id !== id));
  } catch (e) {
    toast.error('Erreur lors de la suppression du Diplome');
  }
};


const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await api.post('/candidat/update/password', { currentPassword, newPassword, newPassword_confirmation });
    toast.success("Mot de passe modifié !");
  } catch (err : any) {
    toast.error(err.response?.data?.message || "Erreur lors de la modification du mot de passe");
  }
};

if (loading || authLoading || isLoading) {
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
    <div className="min-h-scree pt-20 pb-24">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-red-400 text-xl">Erreur: {error?.message || 'Une erreur est survenue lors du chargement du profil.'}</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="max-w-5xl mx-auto px-4 space-y-10">

        {/* ==================== HEADER : CARTE D'IDENTITÉ AVENTURIER ==================== */}
        <header className="relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden text-center">
          {/* Ornement de fond style RPG */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#000080] via-[#F0E68C] to-[#000080]" />
          
          <div className="relative inline-block group">
            <div className="w-36 h-36 rounded-full bg-slate-50 flex items-center justify-center border-4 border-[#F0E68C] shadow-lg overflow-hidden transition-transform group-hover:scale-105 duration-300">
              {/* Remplacer par l'image de l'utilisateur si dispo */}
              <User className="w-20 h-20 text-[#000080]" />
            </div>
            <div className="absolute bottom-1 right-1 bg-green-500 border-4 border-white rounded-full p-1.5 shadow-md">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
              {user?.prenom} {user?.nom}
            </h1>
            
            <div className="flex items-center justify-center gap-3">
              <span className="px-4 py-1 bg-[#000080] text-white text-xs font-black rounded-full uppercase tracking-widest shadow-sm">
                Rang {profile?.rank?.rank ?? '1'}
              </span>
              <span className="text-[#8B8000] font-bold text-sm">
                ✨ {profile?.rank?.points ?? 0} XP Cumulés
              </span>
            </div>

            <p className="text-slate-500 max-w-xl mx-auto mt-4 font-medium italic">
              '{profile?.bio || 'Cet aventurier n’a pas encore écrit sa légende...'}''
            </p>
          </div>
        </header>

        {/* ==================== GRID DE SECTIONS ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* INFOS PERSONNELLES */}
          <Section title="Informations Personnelles" icon={Shield} onEdit={() => setEditing('info')}>
            {editing === 'info' ? (
              <div className="space-y-4">
                <Input label="Sexe" value={infoForm.sexe} onChange={(v: string) => setInfoForm({ ...infoForm, sexe: v})} />
                <Input label="Ville" value={infoForm.ville} onChange={(v: string) => setInfoForm({ ...infoForm, ville: v})} />
                <Input label="Date de naissance" value={infoForm.date_naissance} onChange={(v: string) => setInfoForm({ ...infoForm, date_naissance: v })} type="date" />
                <Textarea label="Bio" value={infoForm.bio} onChange={(v: string) => setInfoForm({ ...infoForm, bio: v })} />
                <SaveButton onClick={saveInfo} />
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                <InfoRow icon={MapPin} label="Localisation" value={profile?.ville} />
                <InfoRow icon={BadgeCheck} label="Nationalité" value={profile?.nationalite} />
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Bio</p>
                   <p className="text-sm text-slate-600 leading-relaxed">{profile?.bio || 'Aucune bio.'}</p>
                </div>
              </div>
            )}
          </Section>

          {/* CONTACT */}
          <Section title="Canaux de Communication" icon={Phone} onEdit={() => setEditing('contact')}>
            {editing === 'contact' ? (
              <div className="space-y-4">
                <Input label="Téléphone" value={contactForm.telephone} onChange={(v: string) => setContactForm({ ...contactForm, telephone: v })} />
                <Input label="LinkedIn" value={contactForm.linkedin} onChange={(v: string)=> setContactForm({ ...contactForm, linkedin: v })} />
                <SaveButton onClick={saveContact} />
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                <InfoRow icon={Phone} label="Cristal de contact" value={profile?.contact?.telephone} />
                <InfoRow icon={Mail} label="Messagerie" value={profile?.contact?.email_secondaire} />
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Shield className="w-5 h-5 text-[#000080]" />
                   </div>
                   <p className="text-xs font-bold text-[#000080]">Profil vérifié par la guilde</p>
                </div>
              </div>
            )}
          </Section>

          {/* CV / MANUSCRIT */}
          <Section title="Curriculum Vitae (CV)" icon={FileText}>
            <div className="mt-2">
              {cv ? (
                <div className="space-y-4">
                  <a href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${cv.fichier}`} target="_blank"
                    className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-[#000080]/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg"><FileText className="text-[#000080]" /></div>
                      <span className="font-bold text-slate-700">Consulter mon CV</span>
                    </div>
                    <Edit className="w-4 h-4 text-slate-400 group-hover:text-[#000080]" />
                  </a>
                  <button onClick={deleteCv} className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1 px-2">
                    <Trash2 size={14} /> Réinitialiser le document
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files?.[0] || null)} className="hidden" id="cv-upload" />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <FileText className="mx-auto mb-2 text-slate-300" size={32} />
                      <p className="text-sm font-medium text-slate-500">Cliquez pour ajouter votre parchemin (PDF, DOC)</p>
                    </label>
                  </div>
                  <button disabled={!cvFile || cvLoading} onClick={uploadCv} className="w-full py-4 bg-[#000080] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-900/20 disabled:opacity-30">
                    {cvLoading ? 'Magie en cours...' : 'Uploader le CV'}
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* DIPLÔMES */}
          <Section title="Diplômes" icon={GraduationCap}>
            <div className="space-y-4 mt-2">
              {diplomes?.map(d => (
                <div key={d.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F0E68C]/20 rounded-xl flex items-center justify-center text-[#8B8000]">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase leading-none mb-1">{d.intitule}</p>
                      <a href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${d.fichier}`} target="_blank" className="text-[10px] font-bold text-[#000080] flex items-center gap-1">
                        VOIR <FileText size={10} />
                      </a>
                    </div>
                  </div>
                  <button onClick={() => deleteDiplome(d.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-100 mt-4">
                <Input placeholder="Intitulé du diplôme (ex: Master IT)" value={intitule} onChange={(i: string) => setIntitule(i)} />
                <div className="flex gap-2 mt-3">
                  <input type="file" onChange={e => setDiplomeFile(e.target.files?.[0] || null)} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#F0E68C]/20 file:text-[#8B8000] cursor-pointer" />
                  <button disabled={!diplomeFile} onClick={uploadDiplome} className="px-6 py-2 bg-[#000080] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* MOT DE PASSE */}

          <Section title="Mot de passe" icon={UserRoundCog}>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <Input type="password" value={currentPassword}  placeholder="Mot de passe actuel" onChange={(i: string) => setCurrentPassword(i)}/>
                <Input type="password" name="newPassword" value={newPassword} placeholder="Nouveau mot de passe" onChange={(i: string) => setNewPassword(i)} />
                <Input type="password" name="newPassword_confirmation" value={newPassword_confirmation} placeholder="Confirmer le mot de passe" onChange={(i: string) => setConfirmPassword(i)} />
                <button type="submit" className="w-full px-6 py-2 bg-[#000080] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Modifier le mot de passe</button>
              </form>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANTS UI RE-STYLISÉS ====================

function Section({ title, icon: Icon, children, onEdit }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-800">
          <div className="p-2 bg-slate-50 rounded-lg text-[#000080]"><Icon size={18} /></div> {title}
        </h2>
        {onEdit && (
          <button onClick={onEdit} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-[#000080]">
            <Edit size={20} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type, name }: any) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      <input
        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-bold focus:outline-none focus:border-[#000080]/30 transition-all placeholder:text-slate-300"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        name={name}
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <textarea
        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-bold focus:outline-none focus:border-[#000080]/30 transition-all"
        rows={3}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function SaveButton({ onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[#F0E68C] text-[#8B8000] py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-yellow-200 hover:bg-[#ece27c] transition-all"
    >
      <Save size={18} /> Sauvegarder les modifications
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-[#000080]/10 transition-colors">
        <Icon className="w-5 h-5 text-[#000080]" />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700 leading-none">{value || '—'}</p>
      </div>
    </div>
  );
}