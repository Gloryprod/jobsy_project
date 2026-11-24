import { Home } from "lucide-react";
import Link from "next/link";

interface PageInfoProps {
    pageName: string;
    pageLink: string;
}

/** Fil d'Ariane de l'administration : le tableau de bord, puis la rubrique. */
export default function PageInfo({ pageName, pageLink }: PageInfoProps) {
    return (
        <nav aria-label="Fil d'Ariane" className="border-b flex items-center justify-between border-gray-400 shadow-sm  p-4 h-12">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <Link href="/dashboard/admin" aria-label="Tableau de bord" className="hover:text-[#000080] transition-colors">
                    <Home aria-hidden="true" size={16} />
                </Link>
                <span aria-hidden="true">/</span>
                <Link href={pageLink} className="hover:text-[#000080] font-medium transition-colors">
                    {pageName}
                </Link>
            </div>
        </nav>
    );
}
