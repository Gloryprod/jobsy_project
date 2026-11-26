'use client';
import ResetPasswordPage from '@/components/password/ResetPassword';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Chargement…</p>}>
        <ResetPasswordPage />
    </Suspense>
  );
}
