'use client';

import { useState } from "react";
import { z } from "zod";
import api from "@/lib/api";
import { MotionButton } from "@/components/ui/MotionButton";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

const registerEntrepriseSchema = z.object({
  nom_entreprise: z.string().min(1, "Le nom de l'entreprise est obligatoire."),
  secteur_activite: z.string().min(1, "Le secteur d'activité est obligatoire."),
  email: z.string().email("Adresse email invalide."),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial."
    ),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["password_confirmation"],
});

export default function RegisterEntreprisePage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    const formValues = {
      nom_entreprise: e.target.nom_entreprise.value,
      secteur_activite: e.target.secteur_activite.value,
      email: e.target.email.value,
      password: e.target.password.value,
      password_confirmation: e.target.password_confirmation.value,
    };

    const validation = registerEntrepriseSchema.safeParse(formValues);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      await api.post("/register", {
        ...formValues,
        role: "ENTREPRISE",
      });

      Swal.fire({
        icon: "success",
        title: "Compte créé avec succès",
        html: `
          <p>
            Un <strong>email de confirmation</strong> vient de vous être envoyé.<br/>
            Veuillez <strong>vérifier votre boîte mail</strong> avant de vous connecter.
          </p>
        `,
        confirmButtonText: "OK",
        background: "#ffffff",
        confirmButtonColor: "#000080",
      })        

    } catch (error: any) {
      if (error.response) {
        setErrorMsg(error.response.data.message || "Erreur serveur");

        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: error.response.data.message || "Une erreur est survenue.",
          confirmButtonText: "OK",
          background: "#fff",
          confirmButtonColor: "#d33",
        });

      } else {
        setErrorMsg("Impossible de contacter le serveur");

        Swal.fire({
          icon: "warning",
          title: "Connexion impossible",
          text: "Veuillez vérifier votre connexion internet.",
          confirmButtonText: "OK",
          background: "#fff",
          confirmButtonColor: "#d33",
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <Image
        src="/register_bg_company.jpg"
        alt="Background"
        fill
        className="object-cover brightness-[0.55]"
        priority
      />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 
                      shadow-2xl border border-white/20 max-w-[420px] w-200 mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Inscription Entreprise
          </h1>

          <Link href="/register" className="mt-2 inline-block">
            <div className="flex items-center justify-center gap-2 mt-2">
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="text-white font-normal">
                Choisir un autre profil
              </span>
            </div>
          </Link>
        </div>

        {errorMsg && (
          <p className="text-red-300 text-center mb-3">{errorMsg}</p>
        )}

        <form className="space-y-3" onSubmit={handleRegister}>

          {/* NOM ENTREPRISE */}
          <div>
            <input
              name="nom_entreprise"
              type="text"
              placeholder="Nom de l’entreprise"
              className={`w-full px-4 py-3 rounded-2xl border bg-white text-black ${
                errors.nom_entreprise ? "border-red-500" : ""
              }`}
            />
            {errors.nom_entreprise && (
              <p className="text-red-400 text-sm mt-1">{errors.nom_entreprise}</p>
            )}
          </div>

          {/* SECTEUR ACTIVITÉ */}
          <div>
            <input
              name="secteur_activite"
              type="text"
              placeholder="Secteur d’activité"
              className={`w-full px-4 py-3 rounded-2xl border bg-white text-black ${
                errors.secteur_activite ? "border-red-500" : ""
              }`}
            />
            {errors.secteur_activite && (
              <p className="text-red-400 text-sm mt-1">{errors.secteur_activite}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email professionnel"
              className={`w-full px-4 py-3 rounded-2xl border bg-white text-black ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <input
              name="password"
              type="password"
              placeholder="Mot de passe"
              className={`w-full px-4 py-3 rounded-2xl border bg-white text-black ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <input
              name="password_confirmation"
              type="password"
              placeholder="Confirmer le mot de passe"
              className={`w-full px-4 py-3 rounded-2xl border bg-white text-black ${
                errors.password_confirmation ? "border-red-500" : ""
              }`}
            />
            {errors.password_confirmation && (
              <p className="text-red-400 text-sm mt-1">{errors.password_confirmation}</p>
            )}
          </div>

          <MotionButton
            type="submit"
            disabled={loading}
            className="w-full py-3 text-lg font-bold rounded-2xl bg-[#000080] text-white cursor-pointer"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </MotionButton>
        </form>

        <p className="text-center text-sm mt-4 text-white">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold underline">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}
