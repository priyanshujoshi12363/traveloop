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
  FiArrowDown,
  FiMenu
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#F8FAFC] relative">
      {/* Top Navigation - Desktop */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/home" className="text-[#0D9488] font-bold text-lg hover:text-[#0F766E] transition-colors">
              Traveloop
            </Link>
         </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-6">
         
            <FiBell className="w-5 h-5 text-slate-600 cursor-pointer hover:text-[#0D9488] transition-colors" />
            <div className="w-9 h-9 rounded-full bg-[#0D9488]/10 flex items-center justify-center cursor-pointer hover:bg-[#0D9488]/20 transition-colors">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.firstName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-[#0D9488]">
                  {user.firstName[0]}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <FiBell className="w-5 h-5 text-slate-600 cursor-pointer hover:text-[#0D9488] transition-colors" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <FiMenu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4">
          <div className="flex flex-col gap-3">
            <Link href="/home" className="text-[#0D9488] font-medium hover:text-[#0F766E] transition-colors">Home</Link>
            <Link href="/explore" className="text-slate-600 hover:text-[#0D9488] transition-colors font-medium">Explore</Link>
            <Link href="/trips" className="text-slate-600 hover:text-[#0D9488] transition-colors font-medium">My Trips</Link>
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-[#0D9488]">{user.firstName[0]}</span>
                  )}
                </div>
                <span className="text-sm text-slate-600">{user.firstName} {user.lastName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Banner Image */}
        <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden mb-8">
          <img 
            src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop" 
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/70 text-sm font-medium mb-1">Featured Destination</p>
              <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold">Escape to Maldives</h2>
            </div>
          </div>
        </div>

        {/* Search Bar & Filters - Desktop Layout */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destinations, activities, or places..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1">
              Group by <FiArrowDown className="w-3 h-3" />
            </button>
            <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1">
              <FiFilter className="w-3 h-3" /> Filter
            </button>
            <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1">
              Sort by <FiArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Top Regional Selections */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-slate-800">Top Regional Selections</h3>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="aspect-square bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Region {item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Trips */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-slate-800">Previous Trips</h3>
              <div className="h-[1px] bg-slate-200 flex-1"></div>
            </div>
            <button className="text-[#0D9488] hover:text-[#0F766E] font-medium text-sm transition-colors">
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div className="h-48 bg-slate-50"></div>
                <div className="p-4">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Plan a Trip Button */}
      <Link
        href="/trip/create"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-full shadow-lg shadow-[#0D9488]/30 hover:shadow-xl transition-all duration-300 hover:scale-105"
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