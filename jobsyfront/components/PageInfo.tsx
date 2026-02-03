import { Home } from "lucide-react";
import Link from "next/link";

interface PageInfoProps {
    pageName: string;
    pageLink: string;
}
export default function PageInfo({ pageName, pageLink }: PageInfoProps) {
    return (
        <div className="flex items-center justify-between border-gray-500 rounded-xl p-4 h-12">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/dashboard/entreprises" className="hover:text-[#000080] transition-colors">
                    <Home size={16} />
                </Link>
                <span>/</span>
                <Link href={pageLink} className="hover:text-[#000080] font-medium transition-colors">
                    {pageName}
                </Link>
            </div>
        </div>
    );
}