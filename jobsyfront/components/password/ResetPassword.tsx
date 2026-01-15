'use client';

import { MotionButton } from '@/components/ui/MotionButton';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import api from '@/lib/api';
import Swal from 'sweetalert2';

const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'Au moins 8 caractères')
    .regex(/[A-Z]/, 'Une majuscule requise')
    .regex(/[0-9]/, 'Un chiffre requis')
    .regex(/[^a-zA-Z0-9]/, 'Un caractère spécial requis'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
});

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setErrors({});

    if (!token || !email) {
      Swal.fire({
        icon: 'error',
        title: 'Lien invalide',
        text: 'Lien de réinitialisation incorrect ou expiré',
      });
      return;
    }

    const formValues = {
      password: e.target.password.value,
      password_confirmation: e.target.password_confirmation.value,
    };

    const validation = resetSchema.safeParse(formValues);
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
      await api.post('/reset-password', {
        email,
        token,
        ...formValues,
      });

      Swal.fire({
        icon: 'success',
        title: 'Mot de passe modifié',
        text: 'Vous pouvez maintenant vous connecter',
        confirmButtonColor: '#000080',
      }).then(() => {
        router.push('/login');
      });

    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text:
          error?.response?.data?.message ||
          'Impossible de réinitialiser le mot de passe',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <Image
        src="/femme-de-coup.jpg"
        alt="Réinitialisation du mot de passe"
        fill
        className="object-cover brightness-[0.25]"
        priority
      />

      <div className="absolute inset-0 bg-white/10" />

      <div className="relative z-10 w-[340px] sm:w-[380px] md:w-[450px] p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/20">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Nouveau mot de passe
            </h1>

            <Link href="/login" className="inline-block mt-2">
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-white">Retour connexion</span>
              </div>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="pb-3">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#000080]" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nouveau mot de passe"
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-2xl text-white
                    ${errors.password ? 'border-red-500' : 'border-white/30'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000080]"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <input
                name="password_confirmation"
                type="password"
                placeholder="Confirmer le mot de passe"
                className={`w-full px-4 py-4 bg-white/10 border rounded-2xl text-white
                  ${errors.password_confirmation ? 'border-red-500' : 'border-white/30'}`}
              />
              {errors.password_confirmation && (
                <p className="text-red-300 text-sm mt-1">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            <div className="pt-6">
              <MotionButton
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#F0E68C] text-[#000080] font-bold rounded-3xl flex justify-center gap-2"
              >
                {loading ? 'Traitement...' : 'Réinitialiser'}
                <ArrowRight />
              </MotionButton>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
    