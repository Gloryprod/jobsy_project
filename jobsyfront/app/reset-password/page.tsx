'use client';
import ResetPasswordPage from '@/components/password/ResetPassword';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
        <ResetPasswordPage />
    </Suspense>
  );
}