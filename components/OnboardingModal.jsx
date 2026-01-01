"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Phone } from "lucide-react";
import RippleButton from "./ui/ripple-button";

export default function OnboardingModal({ user, onComplete }) {
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const supabase = createClient();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Use reverse geocoding to get address (using a free API)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  "User-Agent": "SocheathStore/1.0",
                },
              }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch address");
            }

            const data = await response.json();
            const address =
              data.display_name ||
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setFormData({ ...formData, location: address });
          } catch (error) {
            console.error("Error getting address:", error);
            // Fallback to coordinates if reverse geocoding fails
            setFormData({
              ...formData,
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            });
          }
          setGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Unable to get your location. ";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Please allow location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "Please enter it manually.";
          }

          alert(errorMessage);
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert(
        "Geolocation is not supported by your browser. Please enter your location manually."
      );
      setGettingLocation(false);
    }
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your location"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              />
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={gettingLocation}
              className="mt-2 text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
            >
              <MapPin size={12} />
              {gettingLocation ? "Getting location..." : "Use current location"}
            </button>
          </div>

          {/* Submit Button */}
          <RippleButton
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-400 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
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
