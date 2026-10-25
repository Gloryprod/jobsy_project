/**
 * Mise en forme du texte riche saisi par les entreprises (SafeHtml) : la base de Tailwind retire
 * les puces et les marges, on les rend pour que listes et paragraphes restent lisibles.
 */
export const CLASSES_TEXTE_RICHE =
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_p+p]:mt-2 [&_p+ul]:mt-1 [&_p+ol]:mt-1 [&_a]:underline [&_a]:underline-offset-2";
