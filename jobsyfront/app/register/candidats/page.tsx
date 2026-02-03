'use client';

import { useState } from "react";
import { z } from "zod";
import api from "@/lib/api";
import { MotionButton } from "@/components/ui/MotionButton";
import { ArrowRight , ArrowLeft} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";


const registerSchema = z.object({
  prenom: z.string().min(1, "Le prénom est obligatoire."),
  nom: z.string().min(1, "Le nom est obligatoire."),
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

export default function RegisterJeunePage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    const formValues = {
      prenom: e.target.prenom.value,
      nom: e.target.nom.value,
      email: e.target.email.value,
      password: e.target.password.value,
      password_confirmation: e.target.password_confirmation.value,
    };

    const validation = registerSchema.safeParse(formValues);

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
        role: "JEUNE",
      });

      Swal.fire({
        icon: "success",
        title: "Compte créé avec succès",
        html: `
          <p>
            Un <strong>email de confirmation</strong> vient de vous être envoyé.<br/>
            Veuillez <strong>vérifier votre boîte mail</strong> avant de vous connecter.
          </p>
          <p class="mt-2 text-sm text-gray-500">
            (Pensez à vérifier les spams)
          </p>
        `,
        confirmButtonText: "OK",
        background: "#ffffff",
        confirmButtonColor: "#000080",
      })        

    } catch (error: any) {
      if (error.response) {
        setErrorMsg(error.response.data.message || "Une erreur est survenue.");

        Swal.fire({
          icon: "error",
          title: "Inscription impossible",
          text: error.response.data.message || "Une erreur est survenue.",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
      } else {
        setErrorMsg("Impossible de contacter le serveur");

        Swal.fire({
          icon: "warning",
          title: "Connexion impossible",
          text: "Veuillez vérifier votre connexion internet.",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
      }
    }


    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Image
        src="/register_bg_young.jpg"
        alt="Background"
        fill
        className="object-cover brightness-[0.55]"
        priority
      />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 
                      shadow-2xl border border-white/20 max-w-[420px] w-125 mx-auto">

       <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Inscription Candidat
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
          <p className="text-red-500 text-center mb-3 font-semibold">{errorMsg}</p>
        )}

        <form className="space-y-3" onSubmit={handleRegister}>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                name="prenom"
                type="text"
                placeholder="Prénom"
                className={`px-4 py-3 rounded-2xl border bg-white text-black w-full ${
                  errors.prenom ? "border-red-500" : ""
                }`}
              />
              {errors.prenom && (
                <p className="text-red-400 text-sm mt-1">{errors.prenom}</p>
              )}
            </div>

            <div>
              <input
                name="nom"
                type="text"
                placeholder="Nom"
                className={`px-4 py-3 rounded-2xl border bg-white text-black w-full ${
                  errors.nom ? "border-red-500" : ""
                }`}
              />
              {errors.nom && (
                <p className="text-red-400 text-sm mt-1">{errors.nom}</p>
              )}
            </div>
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-3 rounded-2xl border bg-white text-black ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

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

          <div className="flex items-center justify-center gap-2">
            <MotionButton
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-bold rounded-2xl bg-[#000080] text-white cursor-pointer"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </MotionButton>
          </div>
         
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
