import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Account"
      subtitle="Register to submit and track civic complaints."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 dark:text-[var(--brand-accent)] hover:underline">
            Login
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
