import { Suspense } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign In"
      subtitle="Enter your credentials to access your account."
      footer={
        <>
          New to the portal?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline"
          >
            Register
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
