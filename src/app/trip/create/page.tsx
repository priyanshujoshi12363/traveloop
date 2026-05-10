"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiPlus, 
  FiX, 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign, 
  FiArrowLeft,
  FiImage,
  FiTrash2,
  FiInfo
} from "react-icons/fi";

export default function CreateTripPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Trip basic info
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    description: "",
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Suggested places
  const [places, setPlaces] = useState([
    { name: "", description: "", image: null as File | null, preview: null as string | null }
  ]);

  // Handle cover image
  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  // Add new place
  const addPlace = () => {
    setPlaces([...places, { name: "", description: "", image: null, preview: null }]);
  };

  // Remove place
  const removePlace = (index: number) => {
    if (places.length > 1) {
      const newPlaces = places.filter((_, i) => i !== index);
      setPlaces(newPlaces);
    }
  };

  // Handle place changes
  const handlePlaceChange = (index: number, field: string, value: string) => {
    const newPlaces = [...places];
    newPlaces[index] = { ...newPlaces[index], [field]: value };
    setPlaces(newPlaces);
  };

  // Handle place image
  const handlePlaceImage = (index: number, file: File) => {
    const newPlaces = [...places];
    newPlaces[index].image = file;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPlaces[index].preview = reader.result as string;
        setPlaces(newPlaces);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Add cover image
      if (coverImage) {
        formDataToSend.append("coverImage", coverImage);
      }

      // Add places
      const placesData = places.map(place => ({
        name: place.name,
        description: place.description,
      }));
      formDataToSend.append("places", JSON.stringify(placesData));

      // Add place images
      places.forEach((place, index) => {
        if (place.image) {
          formDataToSend.append(`placeImage_${index}`, place.image);
        }
      });

      const response = await fetch("/api/trips/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/trips/${data.trip.id}`);
      } else {
        setError(data.error || "Failed to create trip");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
   

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Plan a new trip</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <FiInfo className="w-4 h-4" />
              <span>All fields are required</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Trip Details - Grid Layout for Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  placeholder="Summer Vacation 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    placeholder="Paris, France"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Budget
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                    placeholder="5000"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  rows={3}
                  placeholder="Describe your trip..."
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cover Image
              </label>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <FiImage className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-6 py-3 bg-[#0D9488]/10 text-[#0D9488] rounded-lg hover:bg-[#0D9488]/20 transition-colors text-sm font-medium">
                    <FiImage className="w-4 h-4 mr-2" />
                    Upload Cover Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Suggestion for Places */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Places to Visit / Activities
                </h2>
                <button
                  type="button"
                  onClick={addPlace}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 text-[#0D9488] rounded-lg hover:bg-[#0D9488]/20 transition-colors text-sm font-medium"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Place
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="relative h-32 rounded-lg overflow-hidden bg-slate-50 mb-3">
                      {place.preview ? (
                        <img 
                          src={place.preview} 
                          alt={place.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-slate-400 text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={place.name}
                      onChange={(e) => handlePlaceChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0D9488] focus:outline-none mb-2"
                      placeholder="Place name"
                    />
                    
                    <div className="flex items-center justify-between">
                      <label className="cursor-pointer text-xs text-[#0D9488] hover:text-[#0F766E] font-medium">
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePlaceImage(index, file);
                          }}
                        />
                      </label>
                      {places.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlace(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-slate-200 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-[#0D9488]/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 text-lg"
              >
                {isLoading ? "Creating trip..." : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



