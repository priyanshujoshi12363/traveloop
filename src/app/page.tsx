"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiGlobe, 
  FiZap, 
  FiCompass, 
  FiDollarSign, 
  FiArrowRight, 
  FiUser, 
  FiStar,
  FiCheckCircle,
  FiTrendingUp
} from "react-icons/fi";

export default function WelcomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoggedIn(false);
        setIsChecking(false);
        return;
      }

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      } else {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedIn(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Loading screen while checking token
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#0D9488] text-lg font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show redirecting message if logged in
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">
            <FiCheckCircle className="text-[#0D9488] w-20 h-20 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-[#0D9488] mb-3">
            Welcome Back!
          </h1>
          <p className="text-[#0D9488] text-lg">
            Redirecting to your dashboard...
          </p>
          <div className="mt-6 inline-block w-12 h-12 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Welcome screen with login/register options
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#0D9488] to-[#0D9488]/70 rounded-full mb-6 shadow-lg shadow-[#0D9488]/20">
            <FiGlobe className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-[#0D9488] mb-4 leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#0D9488]/50 bg-clip-text text-transparent">
              Traveloop
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-4">
            Your travel companion for smarter adventures
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <FiStar className="text-[#0D9488]" /> 4.9/5 Rating
            </span>
            <span className="flex items-center gap-2">
              <FiUser className="text-[#0D9488]" /> 10K+ Travelers
            </span>
            <span className="flex items-center gap-2">
              <FiTrendingUp className="text-[#0D9488]" /> 500+ Destinations
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/auth/login"
            className="
              w-full sm:w-auto
              px-10 py-4
              bg-[#0D9488]
              hover:bg-[#0F766E]
              text-white
              font-semibold
              text-lg
              rounded-xl
              transition-all
              duration-300
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <FiUser className="w-5 h-5" />
            Sign In
          </Link>

          <Link
            href="/auth/register"
            className="
              w-full sm:w-auto
              px-10 py-4
              border-2
              border-[#0D9488]
              text-[#0D9488]
              hover:bg-[#0D9488]/10
              font-semibold
              text-lg
              rounded-xl
              transition-all
              duration-300
              flex
              items-center
              justify-center
              gap-2
            "
          >
            Create Account
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0D9488]/30 transition-all duration-300">
            <div className="w-14 h-14 bg-[#0D9488]/10 rounded-xl flex items-center justify-center mb-4">
              <FiZap className="w-7 h-7 text-[#0D9488]" />
            </div>
            <h3 className="text-slate-800 font-semibold text-xl mb-2">AI-Powered Planning</h3>
            <p className="text-slate-500 leading-relaxed">
              Smart itineraries tailored to your preferences, budget, and travel style using advanced AI algorithms.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0D9488]/30 transition-all duration-300">
            <div className="w-14 h-14 bg-[#0D9488]/10 rounded-xl flex items-center justify-center mb-4">
              <FiCompass className="w-7 h-7 text-[#0D9488]" />
            </div>
            <h3 className="text-slate-800 font-semibold text-xl mb-2">Discover Hidden Gems</h3>
            <p className="text-slate-500 leading-relaxed">
              Explore off-the-beaten-path destinations and unique experiences that most travelers miss.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0D9488]/30 transition-all duration-300">
            <div className="w-14 h-14 bg-[#0D9488]/10 rounded-xl flex items-center justify-center mb-4">
              <FiDollarSign className="w-7 h-7 text-[#0D9488]" />
            </div>
            <h3 className="text-slate-800 font-semibold text-xl mb-2">Budget-Friendly Travel</h3>
            <p className="text-slate-500 leading-relaxed">
              Find the best deals, track your expenses, and maximize your travel experience within your budget.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-200 pt-12">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#0D9488]">10K+</p>
            <p className="text-slate-500 text-sm">Active Travelers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#0D9488]">500+</p>
            <p className="text-slate-500 text-sm">Destinations</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#0D9488]">50K+</p>
            <p className="text-slate-500 text-sm">Trips Planned</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#0D9488]">4.9⭐</p>
            <p className="text-slate-500 text-sm">User Satisfaction</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-6 rounded-2xl bg-[#0D9488]/5 border border-[#0D9488]/20">
          <p className="text-slate-600">
            Ready to start your journey?{" "}
            <span className="text-[#0D9488] font-semibold">
              Join 10,000+ travelers already planning their next adventure.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}