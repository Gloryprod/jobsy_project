'use client';

import { MotionButton } from '@/components/ui/MotionButton';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { z } from "zod";
import api from "@/lib/api";
import Swal from "sweetalert2";

const forgotSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export default function ForgotPasswordPage() {

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  const handleForgotPassword = async (e: any) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg("");

    const formValues = {
      email: e.target.email.value,
    };

    const validation = forgotSchema.safeParse(formValues);
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
      await api.post("/forgot-password", formValues);

      Swal.fire({
        icon: "success",
        title: "Email envoyé 📩",
        text: "Un lien de réinitialisation de mot de passe a été envoyé à votre adresse email.",
        confirmButtonColor: "#000080",
      });

    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Impossible d'envoyer l'email pour le moment.";

      setErrorMsg(msg);

      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: msg,
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
        alt="Mot de passe oublié"
        fill
        className="object-cover brightness-[0.25] saturate-125"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Card */}
      <div className="relative z-10 w-[340px] sm:w-[380px] md:w-[450px] p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_40px_rgba(0,0,0,0.4)] border border-white/20">

          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Mot de passe oublié
            </h1>

            <Link href="/login" className="mt-2 inline-block">
              <div className="flex items-center justify-center gap-2 mt-2">
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-white font-normal">
                  Retour à la connexion
                </span>
              </div>
            </Link>
          </div>

          {/* Erreur globale */}
          {errorMsg && (
            <p className="text-red-400 text-center mb-3 font-semibold">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleForgotPassword}>

            {/* Email */}
            <div className="pb-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000080]" />
                <input
                  name="email"
                  type="email"
                  placeholder="Votre email"
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-2xl text-white placeholder-white 
                    focus:border-[#F0E68C] focus:ring-2 focus:ring-[#F0E68C]/40 
                    ${errors.email ? "border-red-500" : "border-white/30"}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Bouton */}
            <MotionButton
              type="submit"
              disabled={loading}
              className="w-full text-lg py-4 bg-[#F0E68C] text-[#000080] font-extrabold shadow-xl rounded-3xl flex items-center justify-center gap-2"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
              <ArrowRight className="w-5 h-5" />
            </MotionButton>
          </form>

        </div>
      </div>
    </div>
  );
}
