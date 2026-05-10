// app/trips/create/itinerary/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FiPlus, 
  FiTrash2, 
  FiArrowLeft, 
  FiCalendar, 
  FiDollarSign,
  FiClock,
  FiMapPin,
  FiSave
} from "react-icons/fi";

interface Section {
  id: string;
  title: string;
  description: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  budget: string;
  location?: string;
}

export default function ItineraryBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  
  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      title: "Section 1",
      description: "All the necessary information about this section. This can be anything like travel section, hotel or any other activity.",
      dateRangeStart: "",
      dateRangeEnd: "",
      budget: "",
      location: "",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Add new section
  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: `Section ${sections.length + 1}`,
      description: "",
      dateRangeStart: "",
      dateRangeEnd: "",
      budget: "",
      location: "",
    };
    setSections([...sections, newSection]);
  };

  // Remove section
  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id));
    }
  };

  // Update section
  const updateSection = (id: string, field: keyof Section, value: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  // Save itinerary
  const handleSave = async () => {
    if (!tripId) {
      setError("No trip ID found. Please create a trip first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sections }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/trips/${tripId}`);
      } else {
        setError(data.error || "Failed to save itinerary");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Build Itinerary</h1>
          <p className="text-slate-500">Plan your trip day by day</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#0D9488]/10 rounded-lg flex items-center justify-center">
                    <FiClock className="w-4 h-4 text-[#0D9488]" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{section.title}</h3>
                </div>
                {sections.length > 1 && (
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    rows={3}
                    placeholder="Describe this part of your trip..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={section.location || ""}
                        onChange={(e) => updateSection(section.id, 'location', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                        placeholder="City or place name"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date Range Start
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="date"
                        value={section.dateRangeStart}
                        onChange={(e) => updateSection(section.id, 'dateRangeStart', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date Range End
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="date"
                        value={section.dateRangeEnd}
                        onChange={(e) => updateSection(section.id, 'dateRangeEnd', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Budget for this section
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      value={section.budget}
                      onChange={(e) => updateSection(section.id, 'budget', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                      placeholder="500"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Section Button */}
          <button
            onClick={addSection}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-[#0D9488]/5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Add another section
          </button>
        </div>
      </div>

      {/* Fixed Save Button at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-20">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-4 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiSave className="w-5 h-5" />
                Save Itinerary
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom padding to prevent content from being hidden behind save button */}
      <div className="h-24"></div>
    </div>
  );
}

