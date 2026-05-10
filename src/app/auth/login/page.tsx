"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiAlertCircle
} from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/home");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#0D9488]/20 p-6 sm:p-10 transition-all duration-300">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0D9488]/10 to-[#0D9488]/20 rounded-full mb-5 shadow-inner">
              <FiLock className="w-10 h-10 text-[#0D9488]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#0D9488] transition-colors duration-300" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="
                    w-full pl-12 pr-4 py-3.5
                    bg-slate-50 border border-slate-200
                    rounded-xl text-slate-800 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]
                    transition-all duration-300
                  "
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#0D9488] transition-colors duration-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="
                    w-full pl-12 pr-12 py-3.5
                    bg-slate-50 border border-slate-200
                    rounded-xl text-slate-800 placeholder:text-slate-400
                    focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]
                    transition-all duration-300
                  "
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#0D9488] hover:text-[#0F766E] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3.5
                bg-[#0D9488] hover:bg-[#0F766E]
                disabled:bg-[#0D9488]/50 disabled:cursor-not-allowed
                text-white font-semibold text-lg
                rounded-xl transition-all duration-300
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <FiArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-[#0D9488] hover:text-[#0F766E] font-semibold transition-colors hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}