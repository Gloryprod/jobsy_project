'use client';

import { MotionButton } from '@/components/ui/MotionButton';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { z } from "zod";
import api from "@/lib/api";
import Swal from "sweetalert2";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
});

export default function LoginPage() {

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

/**
 * Handle login form submission
 * @param {any} e - Event object
 */
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    const formValues = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    // Validation Zod
    const validation = loginSchema.safeParse(formValues);
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
      const response = await api.post("/login", formValues);

      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("refreshToken", response.data.data.refreshToken);

      const user = response.data.data.user;

      Swal.fire({
        icon: "success",
        title: "Connexion réussie",
        text: response.data.message,
        confirmButtonColor: "#000080",
      });

      // Redirection selon rôle
      if (user.role === "JEUNE") window.location.href = "/dashboard/candidats";
      else if (user.role === "ENTREPRISE") window.location.href = "/dashboard/entreprises";
      else window.location.href = "/";

    } catch (error: any) {
      const msg = error?.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.";
      setErrorMsg(msg);

      Swal.fire({
        icon: "error",
        title: "Connexion échouée",
        text: error?.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Image de fond */}
      <Image
        src="/femme-de-coup.jpg"
        alt="Jeune diplômé connecté sur Jobsy"
        fill
        className="object-cover brightness-[0.25] saturate-125"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Formulaire */}
      <div className="relative z-10 w-[340px] sm:w-[380px] md:w-[450px] p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] border border-white/20">

          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Connexion
            </h1>

            <Link href="/" className="mt-2 inline-block">
              <div className="flex items-center justify-center gap-2 mt-2">
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-white font-normal">
                  Retour à l'accueil
                </span>
              </div>
            </Link>
          </div>

          {/* Message d’erreur global */}
          {errorMsg && (
            <p className="text-red-400 text-center mb-3 font-semibold">{errorMsg}</p>
          )}

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="pb-2">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000080]" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-2xl text-white placeholder-white 
                    focus:border-[#F0E68C] focus:ring-2 focus:ring-[#F0E68C]/40 
                    ${errors.email ? "border-red-500" : "border-white/30"}`
                  }
                />
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000080]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-2xl text-white placeholder-white 
                    focus:border-[#F0E68C] focus:ring-2 focus:ring-[#F0E68C]/40 
                    ${errors.password ? "border-red-500" : "border-white/30"}`
                  }
                />

                {/* Afficher / cacher mot de passe */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000080]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right mt-1">
              <Link href="/forgot-password" className="text-white text-sm hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton Connexion */}
            <div className="pt-4">
              <MotionButton
                type="submit"
                disabled={loading}
                className="w-full text-lg py-4 bg-[#F0E68C] text-[#000080] font-extrabold shadow-xl rounded-3xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Connexion..." : "Se connecter"}
                <ArrowRight className="w-5 h-5" />
              </MotionButton>
            </div>
          </form>

          {/* Lien inscription */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-white font-bold hover:underline">
                Inscription gratuite
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
