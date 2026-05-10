"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  bio?: string;
  profilePic?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifyAndLoadUser();
  }, []);

  const verifyAndLoadUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
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
        setUser(data.user);
      } else {
        localStorage.removeItem("token");
        router.push("/");
      }
    } catch (error) {
      console.error("Verification error:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-emerald-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-gray-400 mt-1">
              Ready for your next adventure?
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="
              px-6 py-2.5
              bg-red-500/20
              hover:bg-red-500/30
              text-red-400
              rounded-lg
              font-medium
              transition-all
              duration-300
              border border-red-500/20
              hover:border-red-500/40
            "
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.firstName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400">
                {user.firstName[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              {user.bio && (
                <p className="text-gray-300 mt-1">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats/Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-2">
              Upcoming Trips
            </h3>
            <p className="text-gray-400 text-sm">No trips planned yet</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-2">
              Saved Destinations
            </h3>
            <p className="text-gray-400 text-sm">Start exploring!</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-2">
              Travel Stats
            </h3>
            <p className="text-gray-400 text-sm">Your journey begins here</p>
          </div>
        </div>
      </div>
    </div>
  );
}