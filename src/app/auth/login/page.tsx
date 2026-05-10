"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        router.push("/home");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="
                w-full
                px-4 py-3
                bg-white/5
                border border-white/10
                rounded-lg
                text-white
                placeholder-gray-500
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-400
                focus:border-transparent
                transition-all
                duration-300
              "
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="
                w-full
                px-4 py-3
                bg-white/5
                border border-white/10
                rounded-lg
                text-white
                placeholder-gray-500
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-400
                focus:border-transparent
                transition-all
                duration-300
              "
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full
              py-3
              bg-emerald-500
              hover:bg-emerald-400
              disabled:bg-emerald-500/50
              disabled:cursor-not-allowed
              text-white
              font-semibold
              rounded-lg
              transition-all
              duration-300
              transform
              hover:scale-[1.02]
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-400
              focus:ring-offset-2
              focus:ring-offset-black
            "
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}