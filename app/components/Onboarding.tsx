"use client";

import { useState } from "react";
import { createFamilyUser, setActiveUserId } from "@/lib/family-users";
import { FamilyUser } from "@/lib/family-users";

interface OnboardingProps {
  onComplete: (user: FamilyUser) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await createFamilyUser(name.trim());
      setActiveUserId(user.id);
      onComplete(user);
    } catch (err: any) {
      console.error("Create user error:", err);
      if (err?.code === "42P01" || err?.code === "PGRST116" || err?.message?.includes("does not exist") || err?.message?.includes("relation")) {
        setError("Database migration not run. Please run MIGRATION_FAMILY_USERS.sql in Supabase SQL Editor first.");
      } else {
        setError(err.message || "Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Create your first user
        </h1>
        <p className="mb-6 text-gray-600">
          Get started by creating a user profile for your shopping lists.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
