import { differenceInDays, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale'; // Pour avoir le texte en Français
import { get } from 'http';

const getExpirationText = (deadline: string) => {
  const dateLimit = parseISO(deadline);
  const now = new Date();
  const diff = differenceInDays(dateLimit, now);

  if (diff < 0) return "Expiré";
  if (diff === 0) return "Expire aujourd'hui";
  if (diff === 1) return "Expire demain";
  
  // Utilise formatDistanceToNow pour un rendu propre : "dans 3 jours"
  return `Expire ${formatDistanceToNow(dateLimit, { addSuffix: true, locale: fr })}`;
};

export { getExpirationText };