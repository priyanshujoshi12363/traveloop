// app/trips/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiCalendar, 
  FiDollarSign, 
  FiUser, 
  FiUsers, 
  FiClock,
  FiCheckCircle,
  FiHeart,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiInfo,
  FiLogIn,
  FiX,
  FiSave
} from "react-icons/fi";

interface Activity {
  id: number;
  name: string;
  description?: string;
  image?: string;
  activityType: string;
  cost?: number;
  duration?: string;
  location?: string;
  time?: string;
  isCompleted: boolean;
}

interface ItineraryStop {
  id: number;
  cityName: string;
  country?: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
  costIndex?: string;
  popularity?: number;
  stopNotes?: string;
  activities: Activity[];
}

interface Member {
  id: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePic?: string;
    email: string;
  };
}

interface Note {
  id: number;
  title?: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePic?: string;
  };
  stop?: {
    id: number;
    cityName: string;
    country: string;
  };
}

interface BudgetItem {
  id: number;
  budgetCategory: string;
  itemName: string;
  cost: number;
  date?: string;
  isPaid: boolean;
  notes?: string;
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
  creator: {
    id: number;
    firstName: string;
    lastName: string;
    profilePic?: string;
    email: string;
  };
  members: Member[];
  itinerary: ItineraryStop[];
  notes: Note[];
  budgetItems: BudgetItem[];
  budgetSummary: {
    total: number;
    spent: number;
    remaining: number;
    itemCount: number;
  };
  counts: {
    stops: number;
    members: number;
    notes: number;
    budgetItems: number;
  };
  userRole: string;
  isCreator: boolean;
  isMember: boolean;
}

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("itinerary");
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Note states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    stopId: "",
  });
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Budget states
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    budgetCategory: "",
    itemName: "",
    cost: "",
    isPaid: false,
    notes: "",
  });
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(`/api/trip/${tripId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setTrip(data.trip);
      } else {
        setError(data.message || "Failed to load trip details");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTrip = async () => {
    setIsJoining(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(`/api/trip/${tripId}/join`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setJoinSuccess(true);
        fetchTripDetails();
      } else {
        setError(data.message || "Failed to join trip");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // --- Notes Management ---

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteForm({ title: "", content: "", stopId: "" });
    setShowNoteModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title || "",
      content: note.content,
      stopId: note.stop?.id?.toString() || "",
    });
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.content.trim()) {
      alert("Note content is required");
      return;
    }

    setIsSavingNote(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const url = editingNote
        ? `/api/trip/${tripId}/notes/${editingNote.id}`
        : `/api/trip/${tripId}/notes`;

      const response = await fetch(url, {
        method: editingNote ? "PUT" : "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: noteForm.title,
          content: noteForm.content,
          stopId: noteForm.stopId ? parseInt(noteForm.stopId) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowNoteModal(false);
        fetchTripDetails();
      } else {
        setError(data.message || "Failed to save note");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/trip/${tripId}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchTripDetails();
      } else {
        alert(data.message || "Failed to delete note");
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  // --- Budget Management ---

  const handleAddBudget = () => {
    setEditingBudget(null);
    setBudgetForm({
      budgetCategory: "",
      itemName: "",
      cost: "",
      isPaid: false,
      notes: "",
    });
    setShowBudgetModal(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetForm.budgetCategory || !budgetForm.itemName || !budgetForm.cost) {
      alert("Category, item name, and cost are required");
      return;
    }

    setIsSavingBudget(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const url = editingBudget
        ? `/api/trip/${tripId}/budget/${editingBudget.id}`
        : `/api/trip/${tripId}/budget`;

      const response = await fetch(url, {
        method: editingBudget ? "PUT" : "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budgetCategory: budgetForm.budgetCategory,
          itemName: budgetForm.itemName,
          cost: parseFloat(budgetForm.cost),
          isPaid: budgetForm.isPaid,
          notes: budgetForm.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowBudgetModal(false);
        fetchTripDetails();
      } else {
        setError(data.message || "Failed to save budget item");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleDeleteBudget = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this budget item?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/trip/${tripId}/budget/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchTripDetails();
      } else {
        alert(data.message || "Failed to delete budget item");
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#0D9488] text-lg font-medium">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Trip Not Found</h2>
          <p className="text-slate-500">{error || "The trip you're looking for doesn't exist."}</p>
          <Link
            href="/home"
            className="mt-4 inline-block px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
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
            <h1 className="text-xl font-bold text-slate-800">{trip.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!trip.isCreator && !trip.isMember && (
              <button
                onClick={handleJoinTrip}
                disabled={isJoining || joinSuccess}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 transition-colors"
              >
                {isJoining ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining...
                  </span>
                ) : joinSuccess ? (
                  <span className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4" />
                    Joined!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiLogIn className="w-4 h-4" />
                    Join Trip
                  </span>
                )}
              </button>
            )}
            {trip.isCreator && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/trip/create/itinerary?tripId=${trip.id}`}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
                >
                  Edit Itinerary
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Cover Image */}
        {trip.coverImage && (
          <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
            <img 
              src={trip.coverImage} 
              alt={trip.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white text-sm font-medium">{trip.destination}</p>
            </div>
          </div>
        )}

        {/* Trip Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <FiCalendar className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Duration</p>
                <p className="font-semibold text-slate-800">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <FiUsers className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Members</p>
                <p className="font-semibold text-slate-800">{trip.counts.members} members</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0D9488]/10 rounded-lg">
                <FiCheckCircle className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-semibold text-slate-800 capitalize">{trip.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Creator & Member Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
              {trip.creator.profilePic ? (
                <img 
                  src={trip.creator.profilePic} 
                  alt={trip.creator.firstName} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <FiUser className="w-5 h-5 text-[#0D9488]" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Created by</p>
              <p className="font-semibold text-slate-800">
                {trip.creator.firstName} {trip.creator.lastName}
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-[#0D9488]/10 text-[#0D9488] text-xs font-medium rounded-full">
                {trip.userRole === 'creator' ? 'Creator' : 'Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("itinerary")}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "itinerary"
                ? "text-[#0D9488] border-b-2 border-[#0D9488]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Itinerary
          </button>
          <button
            onClick={() => setActiveTab("budget")}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "budget"
                ? "text-[#0D9488] border-b-2 border-[#0D9488]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Budget
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "members"
                ? "text-[#0D9488] border-b-2 border-[#0D9488]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "notes"
                ? "text-[#0D9488] border-b-2 border-[#0D9488]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Notes
          </button>
        </div>

        {/* Tab Content: Itinerary */}
        {activeTab === "itinerary" && (
          <div className="space-y-4">
            {trip.itinerary.length > 0 ? (
              trip.itinerary.map((stop) => (
                <div key={stop.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-lg">{stop.cityName}</h4>
                      <p className="text-sm text-slate-500">{stop.country}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatDate(stop.startDate)} - {formatDate(stop.endDate)}
                    </div>
                  </div>
                  {stop.stopNotes && (
                    <p className="text-slate-600 text-sm mb-3">{stop.stopNotes}</p>
                  )}
                  {stop.activities.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 uppercase">Activities</p>
                      {stop.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                          <div>
                            <p className="font-medium text-slate-800">{activity.name}</p>
                            <p className="text-sm text-slate-500">{activity.description}</p>
                          </div>
                          {activity.cost && (
                            <span className="text-sm font-medium text-[#0D9488]">
                              {formatCurrency(activity.cost)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No activities added yet</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No itinerary stops added yet.
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Budget */}
        {activeTab === "budget" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500">Total Budget</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(trip.budgetSummary.total)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500">Spent</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(trip.budgetSummary.spent)}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500">Remaining</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(trip.budgetSummary.remaining)}</p>
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddBudget}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
            {trip.budgetItems.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {trip.budgetItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-slate-600 capitalize">{item.budgetCategory}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{formatCurrency(item.cost)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleDeleteBudget(item.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-500">No budget items added yet.</p>
            )}
          </div>
        )}

        {/* Tab Content: Members */}
        {activeTab === "members" && (
          <div className="space-y-4">
            {trip.members.length > 0 ? (
              trip.members.map((member) => (
                <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                      {member.user.profilePic ? (
                        <img 
                          src={member.user.profilePic} 
                          alt={member.user.firstName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-5 h-5 text-[#0D9488]" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-sm text-slate-500">{member.user.email}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-[#0D9488]/10 text-[#0D9488] text-xs font-medium rounded-full capitalize">
                        {member.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No members yet.
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Notes */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddNote}
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Note
              </button>
            </div>
            {trip.notes.length > 0 ? (
              trip.notes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                        {note.user.profilePic ? (
                          <img 
                            src={note.user.profilePic} 
                            alt={note.user.firstName} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-4 h-4 text-[#0D9488]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {note.user.firstName} {note.user.lastName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <FiEdit className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  {note.title && (
                    <h5 className="font-semibold text-slate-800 mb-1">{note.title}</h5>
                  )}
                  <p className="text-slate-600">{note.content}</p>
                  {note.stop && (
                    <p className="text-xs text-slate-400 mt-1">
                      📍 {note.stop.cityName}, {note.stop.country}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-slate-500">No notes yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingNote ? 'Edit Note' : 'Add Note'}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Content
                </label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  rows={4}
                  placeholder="Write your note..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Attach to Stop (Optional)
                </label>
                <select
                  value={noteForm.stopId}
                  onChange={(e) => setNoteForm({ ...noteForm, stopId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                >
                  <option value="">No specific stop</option>
                  {trip.itinerary.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.cityName}, {stop.country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 transition-colors"
              >
                {isSavingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingBudget ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button
                onClick={() => setShowBudgetModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={budgetForm.budgetCategory}
                  onChange={(e) => setBudgetForm({ ...budgetForm, budgetCategory: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                >
                  <option value="">Select category</option>
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="food">Food</option>
                  <option value="activities">Activities</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={budgetForm.itemName}
                  onChange={(e) => setBudgetForm({ ...budgetForm, itemName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  placeholder="e.g., Flight tickets"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cost
                </label>
                <input
                  type="number"
                  value={budgetForm.cost}
                  onChange={(e) => setBudgetForm({ ...budgetForm, cost: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={budgetForm.isPaid}
                    onChange={(e) => setBudgetForm({ ...budgetForm, isPaid: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span className="text-sm text-slate-600">Already paid</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={budgetForm.notes}
                  onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  rows={2}
                  placeholder="Any notes about this expense"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                disabled={isSavingBudget}
                className="flex-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 transition-colors"
              >
                {isSavingBudget ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}