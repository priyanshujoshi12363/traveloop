"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiHome, 
  FiSearch, 
  FiHeart, 
  FiUser, 
  FiBell, 
  FiPlus,
  FiCompass,
  FiMap,
  FiCoffee,
  FiCamera,
  FiFilter,
  FiArrowDown
} from "react-icons/fi";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#0D9488] text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative pb-24">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold text-[#0D9488]">Traveloop</div>
          <div className="flex items-center gap-4">
            <FiBell className="w-5 h-5 text-slate-600 cursor-pointer hover:text-[#0D9488] transition-colors" />
            <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center cursor-pointer">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-[#0D9488]">
                  {user.firstName[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Banner Image */}
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6">
          <img 
            src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop" 
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-center justify-center">
            <h2 className="text-white text-2xl sm:text-3xl font-bold">Banner Image</h2>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bar ......"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1">
              Group by <FiArrowDown className="w-3 h-3" />
            </button>
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1">
              <FiFilter className="w-3 h-3" /> Filter
            </button>
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1">
              Sort by <FiArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Top Regional Selections */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-slate-800">Top Regional Selections</h3>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex-shrink-0 w-24 h-24 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"></div>
            ))}
          </div>
        </div>

        {/* Previous Trips */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-slate-800">Previous Trips</h3>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex-shrink-0 w-48 h-64 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Plan a Trip Button - 100px above bottom, greenish, rounded */}
      <Link
        href="/trips/create"
        className="fixed bottom-[100px] right-6 z-50 flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-full shadow-lg shadow-[#0D9488]/30 hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <FiPlus className="w-5 h-5" />
        Plan a trip
      </Link>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}