import Avatar from '@mui/material/Avatar';

function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(firstName: string, lastName: string,  width: number, height: number, fontSize: number) {
  // On s'assure d'avoir au moins une lettre ou une chaîne vide pour éviter les crashs
  const firstLetter = firstName?.[0] || '';
  const lastLetter = lastName?.[0] || '';

  return {
    sx: {
      bgcolor: stringToColor(`${firstName}${lastName}`),
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