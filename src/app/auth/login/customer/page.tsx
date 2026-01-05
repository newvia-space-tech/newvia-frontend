import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
      <LoginForm role="customer" />
    </Suspense>
  );
}
