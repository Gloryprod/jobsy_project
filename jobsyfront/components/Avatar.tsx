import Avatar from '@mui/material/Avatar';

function stringAvatar(firstName: string, lastName: string,  width: number, height: number, fontSize: number) {
  // On s'assure d'avoir au moins une lettre ou une chaîne vide pour éviter les crashs
  const firstLetter = firstName?.[0] || '';
  const lastLetter = lastName?.[0] || '';

  return {
    sx: {
      // Bleu marine du thème : les initiales en blanc restent lisibles quel que soit le nom
      bgcolor: "#000080",
      width: width, 
      height: height,
      fontSize: fontSize
    },
    children: `${firstLetter}${lastLetter}`.toUpperCase(),
  };
}

interface UserInfo {
    nom?: string;
    prenom?: string;
    width : number; 
    height : number; 
    fontSize : number; 
}

export default function BackgroundLetterAvatars({ nom, prenom, width, height, fontSize }: UserInfo) {
  // On gère le cas où les données seraient indéfinies au chargement
  const n = nom || "?";
  const p = prenom || "?";
  const w = width;
  const h = height;
  const f = fontSize;

  return (
      <Avatar {...stringAvatar(p, n, w, h, f)} />
  );
}