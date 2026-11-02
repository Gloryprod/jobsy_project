import api from "@/lib/api";

/**
 * Télécharge le contrat d'une mission. Le PDF n'est plus public : l'API ne le donne qu'au candidat de l'offre
 * et à l'entreprise de la mission. On le récupère donc avec la session (cookies et en-tête X-Requested-With),
 * puis on le propose au téléchargement. Lève l'erreur axios en cas d'échec (404 : pas de contrat, 403 : pas le droit).
 */
export async function telechargerContrat(offreId: number): Promise<void> {
  const reponse = await api.get<Blob>(`/mission-offers/${offreId}/contract`, { responseType: "blob" });
  const url = URL.createObjectURL(reponse.data);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = `contrat-jobsy-${offreId}.pdf`;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  // Le navigateur a le temps de lancer le téléchargement avant que l'adresse temporaire soit libérée
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
