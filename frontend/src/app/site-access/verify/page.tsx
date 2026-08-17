"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SiteAccessPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/site-access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const from = searchParams.get("from") ?? "/";
      router.replace(from);
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[var(--bg-chrome)]">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          CivicTrack
        </h1>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
          Enter the site password to continue
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Site password"
            required
            autoFocus
            className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          {error && (
            <p className="text-sm text-red-500 text-center">Incorrect password. Try again.</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
