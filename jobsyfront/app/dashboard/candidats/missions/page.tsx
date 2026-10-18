import { PortailsMissions } from '@/components/dashboardCandidat/portails/PortailsMissions';

// Types conservés tels quels : la page publique app/missions/page.tsx les importe d'ici.
export type Entreprise = {
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
};

export type Mission = {
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
  category: 'tout' | 'diplomes' | 'non_diplomes';
  applicants: number;
  type_contrat: 'CDI' | 'CDD' | 'Mission Ponctuelle';
  active: boolean;
  entreprise: Entreprise;
};

// Les missions vues comme des portails (refonte gamifiée, lot 2a).
export default function MissionsPage() {
  return <PortailsMissions />;
}
