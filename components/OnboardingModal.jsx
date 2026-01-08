"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Phone } from "lucide-react";
import RippleButton from "./ui/ripple-button";
import LocationPicker from "./LocationPicker";

export default function OnboardingModal({ user, onComplete }) {
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update user profile in database
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          phone: formData.phone,
          location: formData.location,
          onboarding_completed: true,
        });

      if (profileError) throw profileError;

      // 2. Update Auth Metadata for instant access/performance
      const { error: authError } = await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });

      if (authError) throw authError;

      // Call onComplete callback
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save your information. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-5 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
            Welcome! 🎉
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Just a few more details to get you started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="clay-element w-full pl-10 pr-4 py-2.5 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <LocationPicker
                value={formData.location}
                onChange={(address) =>
                  setFormData({ ...formData, location: address })
                }
                placeholder="Search or detect your location"
              />
            </div>
          </div>

          {/* Submit Button */}
          <RippleButton
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-400 text-white py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </RippleButton>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          This information helps us provide better service
        </p>
      </div>
    </div>
  );
}
