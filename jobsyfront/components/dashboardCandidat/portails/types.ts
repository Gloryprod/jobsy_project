// Mission telle que la renvoie GET /liste_missions (MissionsController::index, avec l'entreprise).
export type MissionPortail = {
  id: number;
  title: string;
  company: string;
  location: string;
  /** decimal(10,2) : arrive sous forme de texte, par exemple "45000.00" */
  reward: number | string;
  duration: string;
  /** Date sans heure : la mission reste ouverte jusqu'à la fin de ce jour */
  deadline: string;
  description: string;
  skills: string[] | null;
  urgency: string;
  type_contrat: string;
  active: boolean;
  /** Lettre du rang minimum, vérifiée aussi par l'API au moment de postuler */
  min_rank_required?: string | null;
  test_severity?: string | null;
  entreprise: { id: number; nom_entreprise: string; logo?: string | null } | null;
};
