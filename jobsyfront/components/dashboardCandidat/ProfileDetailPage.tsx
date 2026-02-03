'use client';

import React, { useEffect, useState } from 'react';
import { User, Edit, Save, Phone, Mail, MapPin, CheckCircle, Lightbulb, FileText, GraduationCap, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useUser } from '@/context/UserProvider';
import PhoneInput from '@/components/forms/PhoneInput';
import { toast } from 'react-hot-toast';
import Swal from "sweetalert2";
import useSWR, {mutate} from 'swr';
import { ThreeDots } from 'react-loader-spinner';

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


  if (loading || authLoading || isLoading) {
    return (<div className="flex justify-center items-center h-screen">
                <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="#F0E68C"
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
      <div className="min-h-screen bg-gradient-to-b from-[#000080] to-black pt-20 pb-24">
      <div className="max-w-6xl mx-auto px-4 space-y-12">

        {/* HEADER */}
        <header className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-[#000080] flex items-center justify-center border-4 border-[#F0E68C]">
              <User className="w-20 h-20 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
              <CheckCircle className="w-5 h-5 text-white" />
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white">
            {user?.prenom} {user?.nom}
          </h1>

          <p className="text-[#F0E68C]">
            Rang {profile?.rank?.rank  ?? '—'} • {profile?.rank?.points ?? 0} XP
          </p>

          <p className="text-white/70 max-w-xl mx-auto">
            {profile?.bio || 'Ajoute une bio pour te présenter'}
          </p>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* INFOS */}
          <Section
            title="Infos personnelles"
            icon={User}
            onEdit={() => setEditing('info')}
          >
            {editing === 'info' ? (
              <>
                <Input label="Sexe" value={infoForm.sexe} onChange={(v: string) => setInfoForm({ ...infoForm, sexe: v})} />
                <Input label="Ville" value={infoForm.ville} onChange={(v: string) => setInfoForm({ ...infoForm, ville: v})} />
                <Input label="Date de naissance" value={infoForm.date_naissance} onChange={(v: string) => setInfoForm({ ...infoForm, date_naissance: v })} type="date" />
                <Input label="Nationalité" value={infoForm.nationalite} onChange={(v: string) => setInfoForm({ ...infoForm, nationalite: v })} />
                <Textarea label="Bio" value={infoForm.bio} onChange={(v: string) => setInfoForm({ ...infoForm, bio: v })} />

                <SaveButton onClick={saveInfo} />
              </>
            ) : (
              <>
              <InfoRow icon={MapPin} value={profile?.ville} />
              <InfoRow icon={Lightbulb} value={profile?.bio} />
              </>
            )}
          </Section>

          {/* CONTACT */}
          <Section
            title="Contact"
            icon={Phone}
            onEdit={() => setEditing('contact')}
          >
            {editing === 'contact' ? (
              <>
                <PhoneInput value={contactForm.telephone || ''} onChange={(v: string) => setContactForm({ ...contactForm, telephone: v })} />
                <Input label="LinkedIn" value={contactForm.linkedin} onChange={(v: string)=> setContactForm({ ...contactForm, linkedin: v })} />
                <Input label="Email secondaire" value={contactForm.email_secondaire} onChange={(v: string) => setContactForm({ ...contactForm, email_secondaire: v })} />

                <SaveButton onClick={saveContact} />
              </>
            ) : (
              <>
                <InfoRow icon={Phone} value={profile?.contact?.telephone} />
                <InfoRow icon={Mail} value={profile?.contact?.email_secondaire} />
              </>
            )}
          </Section>

          {/* CV */}
          <Section title="CV (pdf, doc ou docx)" icon={FileText}>
            {cv ? (
              <div className="space-y-4">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${cv.fichier}`}
                  target="_blank"
                  className="block text-center py-4 bg-white/10 rounded-xl hover:bg-white/20"
                >
                  <FileText className="mx-auto mb-2" />
                  Voir mon CV
                </a>

                <button
                  onClick={deleteCv}
                  className="w-full py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30"
                >
                  Supprimer le CV
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setCvFile(e.target.files?.[0] || null)}
                  className="w-full text-white border border-white/20 bg-white/10 rounded-xl py-3 px-4"
                />

                <button
                  disabled={!cvFile || cvLoading}
                  onClick={uploadCv}
                  className="w-full py-3 bg-[#F0E68C] text-[#000080] rounded-xl disabled:opacity-50"
                >
                  {cvLoading ? 'Upload en cours...' : 'Uploader mon CV'}
                </button>
              </div>
            )}
          </Section>

          
          {/* DIPLÔMES */}
          <Section title="Diplômes" icon={GraduationCap}>

            {diplomes?.map(d => (
              <div key={d.id} className="bg-white/10 p-4 rounded-xl flex mb-4 justify-between">
                <div>
                  <p className="font-semibold">{d.intitule}</p>
                  <a href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${d.fichier}`} target="_blank" className="text-[#F0E68C] text-sm flex gap-1">
                    <FileText className="w-4 h-4" /> Voir fichier
                  </a>
                </div>
                <button onClick={() => deleteDiplome(d.id)}>
                  <Trash2 className="text-red-400" />
                </button>
              </div>
            ))}

            <InfoRow icon={Lightbulb} value="Ajoute tes diplômes pour valoriser ton profil." />

            <div className="mt-4">
              <div className='mb-4'>
                <Input placeholder="Intitule du diplome"  value={intitule} onChange={(i: string) => setIntitule(i)} />
              </div>
              <div className='' >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setDiplomeFile(e.target.files?.[0] || null)}
                  className="w-full mb-4 text-white border border-white/20 bg-white/10 rounded-xl py-3 px-4"
                />

                <button
                  disabled={!diplomeFile || diplomeLoading}
                  onClick={uploadDiplome}
                  className="w-full py-3 bg-[#F0E68C] text-[#000080] rounded-xl disabled:opacity-50"
                >
                  {diplomeLoading ? 'Upload en cours...' : 'Uploader'}
                </button>
              </div>

            </div>
            
          </Section>


          {/* CONCOURS */}
          {/* <Section title="Concours" icon={Trophy}>
            <p className="text-white/60">À implémenter</p>
          </Section> */}

          {/* COMMUNAUTÉS */}
          {/* <Section title="Communautés" icon={Users}>
            <p className="text-white/60">À implémenter</p>
          </Section> */}

        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, onEdit }: any) {
  return (
    <div className="bg-white/10 rounded-3xl p-6 border border-white/20">
      <div className="flex justify-between mb-4">
        <h2 className="flex gap-3 text-xl font-bold">
          <Icon className="text-[#F0E68C]" /> {title}
        </h2>
        {onEdit && (
          <button onClick={onEdit}>
            <Edit className="text-white/70" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type }: any) {
  return (
    <div>
      <label className="text-white/80">{label}</label>
      <input
        className="w-full p-3 bg-white/10 rounded-xl text-white"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-white/80">{label}</label>
      <textarea
        className="w-full p-3 bg-white/10 rounded-xl text-white"
        rows={4}
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
      className="mt-4 w-full bg-[#F0E68C] text-[#000080] py-3 rounded-xl flex justify-center gap-2"
    >
      <Save className="w-5 h-5" /> Sauvegarder
    </button>
  );
}

function InfoRow({ icon: Icon, value }: any) {
  return (
    <p className="flex gap-2 text-white/80">
      <Icon className="w-5 h-5" /> {value || '—'}
    </p>
  );
}
