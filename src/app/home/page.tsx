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
  FiMenu,
  FiClock,
  FiCheckCircle,
  FiTrendingUp
} from "react-icons/fi";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
}

interface Trip {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  coverImage?: string;
  status: string;
  isPublic: boolean;
  shareUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePic?: string;
  };
  _count: {
    stops: number;
    members: number;
  };
  isCreator: boolean;
  isMember: boolean;
}

interface SearchResultTrip {
  id: number;
  title: string;
  destination: string;
  itinerary: any[];
  totalStops: number;
  totalActivities: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Trips data
  const [plannedTrips, setPlannedTrips] = useState<Trip[]>([]);
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([]);
  const [hotTrips, setHotTrips] = useState<Trip[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResultTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  // Filter state
  const [filters, setFilters] = useState({
    status: "",
    destination: "",
    minBudget: "",
    maxBudget: "",
  });

  useEffect(() => {
    verifyAndLoadUser();
    loadAllTrips();
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

  // Load all trips (planned, completed, and hot)
  const loadAllTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // 1. Fetch planned trips
      const plannedResponse = await fetch("/api/trip/all?status=planned", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const plannedData = await plannedResponse.json();
      if (plannedData.success) {
        setPlannedTrips(plannedData.trips);
      }

      // 2. Fetch completed trips
      const completedResponse = await fetch("/api/trip/all?status=completed", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const completedData = await completedResponse.json();
      if (completedData.success) {
        setCompletedTrips(completedData.trips);
      }

      // 3. Fetch all trips for hot trips (sort by member count)
      const allResponse = await fetch("/api/trip/all", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const allData = await allResponse.json();
      if (allData.success) {
        // Sort by member count descending for hot trips
        const sorted = allData.trips.sort((a: Trip, b: Trip) => 
          (b._count?.members || 0) - (a._count?.members || 0)
        );
        setHotTrips(sorted.slice(0, 3));
        setFilteredTrips(allData.trips);
      }
    } catch (error) {
      console.error("Error loading trips:", error);
    }
  };

  // Search trips by title
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/trip/search/itinerary?title=${encodeURIComponent(searchTerm)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.trips);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to search trips");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Apply filters
  const applyFilters = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/trip/filter?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFilteredTrips(data.trips);
      }
    } catch (error) {
      console.error("Filter error:", error);
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
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-8">
            <Link href="/home" className="text-[#0D9488] font-bold text-lg hover:text-[#0F766E] transition-colors">
              Traveloop
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <FiBell className="w-5 h-5 text-slate-600 cursor-pointer hover:text-[#0D9488] transition-colors" />
            <div className="w-10 h-10 rounded-full bg-[#0D9488]/10 flex items-center justify-center cursor-pointer hover:bg-[#0D9488]/20 transition-colors">
              <Link href="/profile">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-[#0D9488]">
                    {user.firstName[0]}
                  </span>
                )}
              </Link>
            </div>
          </div>

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
        {/* Banner */}
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

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search trips by title..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Search Results for "{searchTerm}"</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-slate-800">{trip.title}</h4>
                  <p className="text-slate-500 text-sm">{trip.destination}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>{trip.totalStops} stops</span>
                    <span>{trip.totalActivities} activities</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search Error */}
        {searchError && (
          <div className="text-red-500 text-sm mb-4">{searchError}</div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm"
          >
            <option value="">All Status</option>
            <option value="planned">Planned</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="text"
            placeholder="Destination"
            value={filters.destination}
            onChange={(e) => setFilters({...filters, destination: e.target.value})}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm"
          />
          <input
            type="number"
            placeholder="Min Budget"
            value={filters.minBudget}
            onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm"
          />
          <input
            type="number"
            placeholder="Max Budget"
            value={filters.maxBudget}
            onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm"
          />
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
          >
            Apply Filters
          </button>
        </div>

        {/* Hot Trips */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-slate-800">🔥 Hot Trips</h3>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotTrips.length > 0 ? (
              hotTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-slate-100 relative">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <FiTrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-[#0D9488] text-white text-xs px-2 py-1 rounded-full">
                      {trip._count?.members || 0} members
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-800">{trip.title}</h4>
                    <p className="text-sm text-slate-500">{trip.destination}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span>{trip.status}</span>
                      <span>•</span>
                      <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                No hot trips available yet.
              </div>
            )}
          </div>
        </div>

        {/* Planned Trips */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-slate-800">📅 Planned Trips</h3>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedTrips.length > 0 ? (
              plannedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-slate-100 relative">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <FiClock className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-800">{trip.title}</h4>
                    <p className="text-sm text-slate-500">{trip.destination}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                No planned trips yet.
              </div>
            )}
          </div>
        </div>

        {/* Completed Trips */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-slate-800">✅ Completed Trips</h3>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTrips.length > 0 ? (
              completedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-slate-100 relative">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <FiCheckCircle className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-800">{trip.title}</h4>
                    <p className="text-sm text-slate-500">{trip.destination}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                No completed trips yet.
              </div>
            )}
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
    </div>
  );
}