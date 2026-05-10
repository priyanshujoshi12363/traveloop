"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiCamera, 
  FiArrowLeft,
  FiSave,
  FiLogOut,
  FiHeart,
  FiClock,
  FiCalendar
} from "react-icons/fi";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  country?: string;
  bio?: string;
  profilePic?: string;
  createdAt: string;
  updatedAt?: string | null;
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Trips
  const [preplannedTrips, setPreplannedTrips] = useState<Trip[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    city: "",
    country: "",
    bio: "",
  });

  // Profile image
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      // 1. Fetch user profile
      const userResponse = await fetch("/api/auth/update", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const userData = await userResponse.json();

      if (userData.success) {
        setUser(userData.user);
        setEditForm({
          firstName: userData.user.firstName || "",
          lastName: userData.user.lastName || "",
          email: userData.user.email || "",
          phoneNumber: userData.user.phoneNumber || "",
          city: userData.user.city || "",
          country: userData.user.country || "",
          bio: userData.user.bio || "",
        });
      } else {
        setError(userData.message || "Failed to load profile");
      }

      // 2. Fetch preplanned trips (planned)
      const plannedResponse = await fetch("/api/trip/all?status=planned", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const plannedData = await plannedResponse.json();
      if (plannedData.success) {
        setPreplannedTrips(plannedData.trips);
      }

      // 3. Fetch previous trips (completed)
      const completedResponse = await fetch("/api/trip/all?status=completed", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const completedData = await completedResponse.json();
      if (completedData.success) {
        setPreviousTrips(completedData.trips);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile image
  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePreview(null);
    }
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Cancel edit - reset form
      if (user) {
        setEditForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          city: user.city || "",
          country: user.country || "",
          bio: user.bio || "",
        });
      }
      setProfilePreview(null);
      setProfileImage(null);
      setError("");
    }
    setIsEditing(!isEditing);
  };

  // Save profile changes
  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      if (profileImage) {
        formData.append("image", profileImage);
      }

      const updateResponse = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const updateData = await updateResponse.json();

      if (updateData.success) {
        setUser(updateData.user);
        setIsEditing(false);
        setProfilePreview(null);
        setProfileImage(null);
        localStorage.setItem("user", JSON.stringify(updateData.user));
      } else {
        setError(updateData.message || "Failed to update profile");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#0D9488] text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-xl font-bold text-[#0D9488]">Traveloop</div>
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={toggleEdit}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0D9488] text-white font-medium rounded-lg hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 transition-colors flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={toggleEdit}
                className="px-4 py-2 bg-[#0D9488]/10 text-[#0D9488] font-medium rounded-lg hover:bg-[#0D9488]/20 transition-colors flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-sm">
                {isEditing && profilePreview ? (
                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : user.profilePic ? (
                  <img src={user.profilePic} alt={user.firstName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <FiUser className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                    <FiCamera className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImage}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        City
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                          placeholder="New York"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Country
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {user.firstName} {user.lastName}
                    </h2>
                    <span className="px-2 py-1 bg-[#0D9488]/10 text-[#0D9488] text-xs font-medium rounded-full">
                      Traveler
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <FiMail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <FiPhone className="w-4 h-4" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  {(user.city || user.country) && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <FiMapPin className="w-4 h-4" />
                      <span>
                        {[user.city, user.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {user.bio && (
                    <p className="text-slate-600 mt-2">{user.bio}</p>
                  )}
                  {user.createdAt && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preplanned Trips */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Preplanned Trips</h3>
            <Link href="/trips" className="text-sm text-[#0D9488] hover:text-[#0F766E] transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preplannedTrips.length > 0 ? (
              preplannedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 bg-slate-100 relative">
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
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiHeart className="w-3 h-3" />
                        {trip._count.members} members
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                No preplanned trips yet.
              </div>
            )}
          </div>
        </div>

        {/* Previous Trips */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Previous Trips</h3>
            <Link href="/trips" className="text-sm text-[#0D9488] hover:text-[#0F766E] transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previousTrips.length > 0 ? (
              previousTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 bg-slate-100 relative">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <FiHeart className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-800">{trip.title}</h4>
                    <p className="text-sm text-slate-500">{trip.destination}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {trip._count.stops} stops
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-slate-500">
                No previous trips yet.
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="border-t border-slate-200 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <FiLogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}