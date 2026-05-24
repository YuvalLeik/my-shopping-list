"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setMessage("╫ö╫ö╫¿╫⌐╫₧╫ö ╫ö╫ª╫£╫Ö╫ù╫ö! ╫æ╫ô╫ò╫º ╫É╫¬ ╫ö╫É╫Ö╫₧╫Ö╫Ö╫£ ╫⌐╫£╫Ü ╫£╫É╫Ö╫₧╫ò╫¬.");
          // Auto sign in after successful signup
          setTimeout(() => {
            onAuthSuccess();
          }, 1000);
        }
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || "╫É╫Ö╫¿╫ó╫ö ╫⌐╫Æ╫Ö╫É╫ö. ╫á╫í╫ö ╫⌐╫ò╫æ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ╫¿╫⌐╫Ö╫₧╫¬ ╫º╫á╫Ö╫ò╫¬
          </h1>
          <p className="text-gray-600">
            {isSignUp ? "╫ª╫ò╫¿ ╫ù╫⌐╫æ╫ò╫ƒ ╫ù╫ô╫⌐" : "╫ö╫¬╫ù╫æ╫¿ ╫£╫ù╫⌐╫æ╫ò╫ƒ ╫⌐╫£╫Ü"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ╫É╫Ö╫₧╫Ö╫Ö╫£
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              dir="ltr"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ╫í╫Ö╫í╫₧╫ö
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="╫£╫ñ╫ù╫ò╫¬ 6 ╫¬╫ò╫ò╫Ö╫¥"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "╫₧╫ó╫æ╫ô..."
              : isSignUp
              ? "╫ö╫¿╫⌐╫₧╫ö"
              : "╫ö╫¬╫ù╫æ╫¿╫ò╫¬"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isSignUp
              ? "╫¢╫æ╫¿ ╫Ö╫⌐ ╫£╫Ü ╫ù╫⌐╫æ╫ò╫ƒ? ╫ö╫¬╫ù╫æ╫¿"
              : "╫É╫Ö╫ƒ ╫£╫Ü ╫ù╫⌐╫æ╫ò╫ƒ? ╫ö╫Ö╫¿╫⌐╫¥"}
          </button>
        </div>
      </div>
    </div>
  );
}
