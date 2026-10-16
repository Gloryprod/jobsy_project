'use client';

import DOMPurify from 'dompurify';
import { useMemo, type ElementType } from 'react';

type SafeHtmlProps = {
  html?: string | null;
  as?: ElementType;
  className?: string;
};

/**
 * Affiche du HTML venant de l'API (éditeurs riches : missions, formations, examens) après nettoyage DOMPurify.
 * L'API nettoie déjà à l'enregistrement ; ce second filtre protège aussi les contenus plus anciens.
 * À utiliser à la place de dangerouslySetInnerHTML pour tout contenu saisi par un utilisateur.
 */
export default function SafeHtml({ html, as: Tag = 'div', className }: SafeHtmlProps) {
  // DOMPurify a besoin du DOM : rien n'est rendu côté serveur (les données sont de toute façon chargées côté client)
  const clean = useMemo(
    () => (typeof window === 'undefined' || !html ? '' : DOMPurify.sanitize(html)),
    [html]
  );

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
