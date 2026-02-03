import PageInfo from "@/components/PageInfo";

const pageLink = "/dashboard/entreprises";
export default function EntreprisesDashboardPage() {
    return (
        <div className="min-h-screen relative p-2 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Dashboard" pageLink={pageLink} />
            </div>

            <h1 className="text-2xl font-bold  text-black">Bienvenue sur votre tableau de bord Entreprises</h1>
            <p className="text-black">Ici, vous pouvez gérer votre profil, vos offres demploi et bien plus encore.</p>
        </div>
    )
}