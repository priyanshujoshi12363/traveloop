"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiMapPin, 
  FiCamera, 
  FiArrowRight,
  FiAlertCircle
} from "react-icons/fi";

// Import Google Fonts via Next.js
import { Inter, Poppins } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    country: "",
    bio: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle image selection with preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        router.push("/home");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 ${inter.variable} ${poppins.variable}`}>
      <div className="w-full max-w-lg">
        {/* Card Container - Better spacing for desktop */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-teal-100/30 p-6 sm:p-10 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full mb-5 shadow-inner">
              <FiUser className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className={`${poppins.className} text-3xl sm:text-4xl font-bold text-slate-800 mb-2 tracking-tight`}>
              Create Account
            </h1>
            <p className={`${inter.className} text-slate-500 text-base sm:text-lg font-medium`}>
              Join us and start your journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className={`${inter.className}`}>{error}</span>
              </div>
            )}

            {/* Name Fields - Better responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                  First Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors duration-300" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className={`${inter.className} w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300`}
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                  Last Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors duration-300" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className={`${inter.className} w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300`}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors duration-300" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`${inter.className} w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors duration-300" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`${inter.className} w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300`}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Phone & City - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                  Phone Number
                </label>
                <div className="relative group">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors duration-300" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className={`${inter.className} w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300`}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div>
                <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                  City
                </label>
                <div className="relative group">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors duration-300" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className={`${inter.className} w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300`}
                    placeholder="New York"
                  />
                </div>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                Country
              </label>
              <div className="relative group">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-500 transition-colors duration-300" />
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className={`${inter.className} w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300`}
                  placeholder="United States"
                />
              </div>
            </div>

            {/* Profile Picture - Better responsive */}
            <div>
              <label className={`${poppins.className} block text-sm font-semibold text-slate-700 mb-2.5`}>
                Profile Picture
              </label>
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0 shadow-sm">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <FiCamera className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer w-full sm:w-auto">
                  <span className={`${inter.className} inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-all duration-300 text-sm font-semibold`}>
                    <FiCamera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit Button - Bigger on desktop */}
            <button
              type="submit"
              disabled={isLoading}
              className={`${poppins.className} w-full py-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-teal-300 disabled:to-teal-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/25 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white text-base sm:text-lg flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  Create Account
                  <FiArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>

            {/* Sign In Link - Responsive text */}
            <p className={`${inter.className} text-center text-slate-500 text-sm sm:text-base`}>
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}