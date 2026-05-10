"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        // Redirect to homepage after 1.5 seconds
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      } else {
        // Token invalid, remove it
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-emerald-400 text-lg font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show redirecting message if logged in
  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">✈️</div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome Back!
          </h1>
          <p className="text-emerald-400 text-lg">
            Redirecting to your dashboard...
          </p>
          <div className="mt-6 inline-block w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Welcome screen with login/register options
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Icon */}
        <div className="text-8xl mb-8 animate-bounce">🌍</div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            Traveloop
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
          Your AI-powered travel companion. Plan trips, discover destinations,
          and create unforgettable memories with smart recommendations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/login"
            className="
              w-full sm:w-auto
              px-8 py-4
              bg-emerald-500
              hover:bg-emerald-400
              text-white
              font-semibold
              text-lg
              rounded-xl
              transition-all
              duration-300
              transform
              hover:scale-105
              hover:shadow-lg
              hover:shadow-emerald-500/25
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-400
              focus:ring-offset-2
              focus:ring-offset-black
            "
          >
            Sign In
          </Link>

          <Link
            href="/auth/register"
            className="
              w-full sm:w-auto
              px-8 py-4
              border-2
              border-emerald-500
              text-emerald-400
              hover:bg-emerald-500/10
              font-semibold
              text-lg
              rounded-xl
              transition-all
              duration-300
              transform
              hover:scale-105
              focus:outline-none
              focus:ring-2
              focus:ring-emerald-400
              focus:ring-offset-2
              focus:ring-offset-black
            "
          >
            Create Account
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-white font-semibold mb-2">AI Planning</h3>
            <p className="text-gray-400 text-sm">
              Smart itineraries tailored to your preferences
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="text-white font-semibold mb-2">Discover Places</h3>
            <p className="text-gray-400 text-sm">
              Explore hidden gems and popular destinations
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-white font-semibold mb-2">Budget Friendly</h3>
            <p className="text-gray-400 text-sm">
              Find the best deals within your budget
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}