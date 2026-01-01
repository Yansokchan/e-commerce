"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, MapPin, Phone, X } from "lucide-react";
import RippleButton from "./ui/ripple-button";
import { closeEditProfileModal, setUser } from "@/lib/features/auth/authSlice";

export default function ProfileEditModal() {
  const dispatch = useDispatch();
  const { user, showEditProfileModal } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user && showEditProfileModal) {
      setFormData({
        phone: user.user_metadata?.phone || "",
        location: user.user_metadata?.location || "",
      });
    }
  }, [user, showEditProfileModal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    dispatch(closeEditProfileModal());
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
          // We don't change onboarding_completed here, assuming it's already done if they are editing
        });

      if (profileError) throw profileError;

      // 2. Update Redux state manually to reflect changes immediately
      // Merging new data into existing user metadata
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          phone: formData.phone,
          location: formData.location,
        },
      };

      dispatch(setUser(updatedUser)); // Update local state
      dispatch(closeEditProfileModal());
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showEditProfileModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative mx-5 w-full max-w-md rounded-2xl bg-white/75 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-pink-600">Edit Profile</h2>
          <p className="mt-2 text-slate-500 font-medium tracking-tight">
            Update your contact information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-400/30 text-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter your address"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-400/30 text-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
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
            className="w-full bg-gradient-to-r from-pink-600 to-pink-400 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-white" size={20} />
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </RippleButton>
        </form>
      </div>
    </div>
  );
}
