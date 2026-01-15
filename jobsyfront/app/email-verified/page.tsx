'use client';

import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { MotionButton } from "@/components/ui/MotionButton";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <Image
        src="/register_bg_young.jpg"
        alt="Background"
        fill
        className="object-cover brightness-[0.55]"
        priority
      />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-10 
                      shadow-2xl border border-white/20 max-w-md w-full text-center">

        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Email vérifié avec succès
        </h1>

        <p className="text-white/90 mb-8 leading-relaxed">
          Votre adresse email a été confirmée.
          <br />
          Vous pouvez maintenant vous connecter à votre compte.
        </p>

        <Link href="/login">
          <MotionButton className="w-full py-3 text-lg font-bold rounded-2xl bg-[#000080] text-white">
            Se connecter
          </MotionButton>
        </Link>

      </div>
    </div>
  );
}
