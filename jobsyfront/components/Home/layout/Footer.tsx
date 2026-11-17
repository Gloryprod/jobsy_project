import Link from "next/link";

const COLONNES = [
  {
    titre: "Candidats",
    liens: [
      { libelle: "Créer un compte candidat", href: "/register/candidats" },
      { libelle: "Voir les missions", href: "/missions" },
      { libelle: "Voir les formations", href: "/formations" },
    ],
  },
  {
    titre: "Entreprises",
    liens: [
      { libelle: "Créer un compte entreprise", href: "/register/entreprises" },
      { libelle: "Recruter avec Jobsy", href: "/entreprises" },
    ],
  },
  {
    titre: "Jobsy",
    liens: [
      { libelle: "Se connecter", href: "/login" },
      { libelle: "Nous contacter", href: "/contact" },
    ],
  },
];

/**
 * Pied de page des pages publiques (lot 6b) : seulement des pages qui existent.
 * Les coordonnées (téléphone, adresse, réseaux) sont retirées tant que les vraies ne sont pas fournies.
 */
export default function Footer() {
  return (
    <footer className="bg-systeme-nuit font-lisible text-systeme-texte">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="grid content-start gap-2">
          <p className="font-systeme text-2xl font-black">Jobsy</p>
          <p className="text-systeme-attenue">Formations, missions rémunérées et rang reconnu par les entreprises, au Bénin.</p>
        </div>
        {COLONNES.map((colonne) => (
          <nav key={colonne.titre} aria-label={colonne.titre} className="grid content-start gap-3">
            <h2 className="font-bold text-systeme-or">{colonne.titre}</h2>
            <ul className="grid gap-1">
              {colonne.liens.map((lien) => (
                <li key={lien.href}>
                  <Link
                    href={lien.href}
                    className="inline-flex min-h-11 items-center underline-offset-4 hover:text-systeme-lueur hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur"
                  >
                    {lien.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="border-t border-white/10 px-4 py-5 text-center text-sm text-systeme-attenue">© {new Date().getFullYear()} Jobsy, créé au Bénin</p>
    </footer>
  );
}
