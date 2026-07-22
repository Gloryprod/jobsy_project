import React from 'react';
import { Package, Calendar, Clock, MapPin } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface LogisticHoldScreenProps {
  enrollment_id: number
  delivery_status: 'pending' | 'delivered' ;
  logistic_type: 'kit' | 'session';
  course_title: string;
  onRefresh: () => void; // Permet à l'apprenant de rafraîchir manuellement si l'admin a validé
  isChecking?: boolean;
}

export default function LogisticHoldScreen({enrollment_id, delivery_status, logistic_type, course_title, onRefresh, isChecking = false }: LogisticHoldScreenProps) {
  const isKit = logistic_type === 'kit';

  const handleAccessCourse = async () => {
        try {
            const response = await api.post(`/logistics/access/${enrollment_id}`);
            toast.success(response.data.message || "Opération réussie !");
            onRefresh()
        } catch (err) {
            const anyErr = err as any;
            const message = anyErr?.response?.data?.message || "Erreur lors de l'opération. Veuillez réessayer.";
            toast.error(message);
        }
    }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 text-center">
        
        {/* Badge de statut */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-6">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          Étape Logistique En Cours
        </div>

        {/* Titre du parcours */}
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
          {course_title}
        </h1>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
          Votre inscription est validée ! Pour débloquer vos modules théoriques, nous devons d&apos;abord finaliser l&apos;étape pratique terrain.
        </p>

        {/* Section Dynamique : Kit vs Session */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-left mb-8">
          {isKit ? (
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base">Préparation de votre Kit d&apos;apprentissage</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
                  Notre équipe prépare votre matériel (outils de comptage, étiquettes de stock et guide de terrain). Un agent logistique Jobsy vous contactera pour la livraison à votre adresse enregistrée. <br />
                  <b>Si ce n&apos;est pas encore fait veuillez vous rendre dans votre profil et renseigner votre numéro de téléphone et votre localisation.</b>
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  Statut de livraison : <span className="text-blue-600 capitalize font-semibold">{delivery_status == "pending" ? 'En cours' : 'Kit livré'}</span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <span><i><b>NB:</b> Si après vérification de votre accès le statut de livraison ne change pas, veuillez patienter et réessayer plus tard. Contactez le service administratif pour to        ute préoccupation. </i></span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base">Session Pratique en Présentiel</h3>
                <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
                  Vous devez assister à la prochaine session collective obligatoire d&apos;initiation aux gestes métiers et à la sécurité en entrepôt.
                </p>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-500" /> Centre de formation Jobsy (Abomey-Calavi)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fil conducteur visuel (Stepper de l'état actuel) */}
        <div className="relative flex justify-between items-center max-w-xs mx-auto mb-8">
          <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10 w-full"></div>
          
          <div className="flex flex-col items-center gap-1.5 bg-white px-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
            <span className="text-[10px] font-medium text-slate-500">Inscription</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 bg-white px-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">2</div>
            <span className="text-[10px] font-bold text-amber-600">{isKit ? "Livraison Kit" : "Présentiel"}</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 bg-white px-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-[10px] font-medium text-slate-400">Théorie & Quiz</span>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleAccessCourse}
            disabled={isChecking}
            className="cursor-pointer w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isChecking ? "Vérification..." : "Valider la reception et accéder au cours"}
          </button>
          <span className="text-xs text-slate-400">
            Dès que l&apos;administration valide, vos cours apparaissent ici automatiquement.
          </span>
        </div>

      </div>
    </div>
  );
}