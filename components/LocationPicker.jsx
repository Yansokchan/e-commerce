"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MapPin, Search, Loader2, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const Map = dynamic(() => import("./CambodiaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">
      Loading Map...
    </div>
  ),
});

export default function LocationPicker({
  value,
  onChange,
  placeholder = "Search for your address in Cambodia...",
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [markerPos, setMarkerPos] = useState([11.5564, 104.9282]); // Phnom Penh
  const [mapCenter, setMapCenter] = useState([11.5564, 104.9282]);
  const dropdownRef = useRef(null);

  // Sync internal query with external value
  useEffect(() => {
    if (value !== undefined) setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Restrict search to Cambodia (countrycodes=kh)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1&countrycodes=kh`,
        { headers: { "User-Agent": "GoCartApp/1.0" } }
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query !== value) {
        fetchSuggestions(query);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (suggestion) => {
    const address = suggestion.display_name;
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

    setQuery(address);
    setMarkerPos([lat, lon]);
    setMapCenter([lat, lon]);
    setShowSuggestions(false);
    onChange(address);
  };

  const onLocationSelect = async (lat, lon) => {
    setMarkerPos([lat, lon]);
    await reverseGeocode(lat, lon);
  };

  const reverseGeocode = async (lat, lon) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { "User-Agent": "GoCartApp/1.0" } }
      );
      if (response.ok) {
        const data = await response.json();
        const address =
          data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        setQuery(address);
        onChange(address);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <MapPin
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) onChange("");
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          ) : (
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`transition-colors text-pink-600 hover:text-pink-600 ${
                showMap && ""
              }`}
              title="Toggle Map"
            >
              <MapIcon size={18} />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[70] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors border-b last:border-0 border-gray-100"
            >
              <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {suggestion.address.name ||
                    suggestion.address.road ||
                    suggestion.address.city}
                </span>
                <span className="text-xs text-gray-500 line-clamp-1">
                  {suggestion.display_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showMap && (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 shadow-inner h-[250px] relative z-[60]">
          <Map
            center={mapCenter}
            markerPos={markerPos}
            onLocationSelect={onLocationSelect}
          />
          <div className="absolute -bottom-[2px] -right-[2px] z-[1000] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-600 shadow-sm border border-gray-200 pointer-events-none">
            Click on map to pick location in Cambodia
          </div>
        </div>
      )}
    </div>
  );
}
