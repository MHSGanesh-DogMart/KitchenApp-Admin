"use client";

import { useEffect, useState, useRef } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { MapPin, Search, Trash2, Navigation, AlertCircle, Check, Loader2, X, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCity {
  name: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
  radius?: number;
  type?: string;
}

export default function CitiesPage() {
  const [mounted, setMounted] = useState(false);
  const [cities, setCities] = useState<ServiceCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Map & Script Loading State
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const tempMarkerRef = useRef<any>(null);
  const tempCircleRef = useRef<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Toast State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Platform configuration state to retrieve default radii
  const [config, setConfig] = useState<any>(null);

  // Selected Temporary Location for configuration
  const [tempCity, setTempCity] = useState<ServiceCity | null>(null);
  const [tempType, setTempType] = useState<string>("city");
  const [tempRadius, setTempRadius] = useState<number>(15000); // default 15km in meters

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.207.196.137";

  // Helper to show custom toasts
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper to detect place category
  const detectPlaceType = (result: any) => {
    const type = (result.type || "").toLowerCase();
    const cls = (result.class || "").toLowerCase();
    const displayName = (result.display_name || "").toLowerCase();
    
    if (type === 'state' || type === 'province' || (cls === 'boundary' && type === 'administrative' && displayName.includes('state'))) {
      return 'state';
    }
    if (type === 'village' || type === 'town' || type === 'hamlet' || type === 'subdistrict' || type === 'locality') {
      return 'village';
    }
    return 'city';
  };

  // 1. Mount Check
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Fetch Active Cities
  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/config`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch active cities");
      }
      setCities(data.data.activeCities || []);
      setConfig(data.data);
    } catch (err: any) {
      showToast(err.message || "An error occurred loading active cities.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchCities();
    }
  }, [mounted]);

  // 3. Load Leaflet CDN dynamically (CSS is statically imported in RootLayout)
  useEffect(() => {
    if (!mounted) return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted]);

  // 4. Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current || loading) return;

    const L = (window as any).L;

    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    // Call invalidateSize on short delay to ensure correct render bounds after container drawing
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    mapRef.current.on("popupopen", (e: any) => {
      const container = e.popup.getElement();

      const removeBtn = container.querySelector("#remove-city-btn");
      if (removeBtn) {
        const cityName = removeBtn.getAttribute("data-city-name");
        // Clone and replace button to reset any existing listeners and ensure correct scope
        const newBtn = removeBtn.cloneNode(true);
        removeBtn.parentNode.replaceChild(newBtn, removeBtn);
        newBtn.addEventListener("click", () => {
          if (cityName) {
            handleRemoveCity(cityName);
          }
        });
      }
    });
  }, [leafletLoaded, loading]);

  // 5. Sync Active Cities Markers and Circles
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = (window as any).L;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Remove existing circles
    circlesRef.current.forEach((c) => c.remove());
    circlesRef.current = [];

    // Populate active city pins & circles
    cities.forEach((city) => {
      const type = city.type || 'city';
      
      const defaultState = config?.defaultStateRadius !== undefined ? config.defaultStateRadius : 100000;
      const defaultCity = config?.defaultCityRadius !== undefined ? config.defaultCityRadius : 15000;
      const defaultVillage = config?.defaultVillageRadius !== undefined ? config.defaultVillageRadius : 5000;

      let defaultRadius = defaultCity;
      if (type === 'state') defaultRadius = defaultState;
      else if (type === 'village') defaultRadius = defaultVillage;

      const radius = city.radius !== undefined && city.radius !== null ? city.radius : defaultRadius;
      
      let brandColor = "#FF5630"; // city -> primary
      let pinColorClass = "bg-primary";
      let pingColorClass = "bg-primary/20";
      
      if (type === 'state') {
        brandColor = "#2A6F97"; // state -> secondary
        pinColorClass = "bg-secondary";
        pingColorClass = "bg-secondary/20";
      } else if (type === 'village') {
        brandColor = "#E6A100"; // village -> warning/warn
        pinColorClass = "bg-warn";
        pingColorClass = "bg-warn/20";
      }

      const activeCityIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute h-8 w-8 rounded-full ${pingColorClass} animate-ping"></div>
                 <div class="h-4.5 w-4.5 rounded-full ${pinColorClass} border-2 border-white shadow-card flex items-center justify-center text-[10px] text-white">●</div>
               </div>`,
        className: "custom-div-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([city.lat, city.lng], { icon: activeCityIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-2 space-y-1.5 min-w-[160px]">
            <div class="flex items-center gap-1.5 justify-between">
              <p class="font-display font-bold text-ink text-[13.5px] leading-tight">${city.name}</p>
              <span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                type === 'state' ? 'bg-secondary/10 text-secondary' : type === 'village' ? 'bg-warn/10 text-warn' : 'bg-primary/10 text-primary'
              }">${type}</span>
            </div>
            <p class="text-[11px] text-muted leading-tight">${city.formattedAddress || 'Active Region'}</p>
            <p class="text-[10px] text-muted font-medium">Radius: ${(radius / 1000).toFixed(1)} km</p>
            <span class="inline-block text-[10px] font-bold text-emerald-500 uppercase tracking-wider">● Now Serving</span>
            <div class="border-t border-line my-1.5"></div>
            <button id="remove-city-btn" data-city-name="${city.name}" class="h-8 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-display font-bold text-[11px] w-full transition-all cursor-pointer">
              Remove Region
            </button>
          </div>
        `);
      markersRef.current.push(marker);

      const circle = L.circle([city.lat, city.lng], {
        color: brandColor,
        fillColor: brandColor,
        fillOpacity: 0.12,
        weight: 1.5,
        radius: radius
      }).addTo(mapRef.current);
      circlesRef.current.push(circle);
    });
  }, [cities, leafletLoaded]);

  // 6. Sync Temp Selected City Marker and Circle
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = (window as any).L;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (tempCircleRef.current) {
      tempCircleRef.current.remove();
      tempCircleRef.current = null;
    }

    if (!tempCity) return;

    let brandColor = "#FF5630";
    let pinColorClass = "bg-primary";
    
    if (tempType === 'state') {
      brandColor = "#2A6F97";
      pinColorClass = "bg-secondary";
    } else if (tempType === 'village') {
      brandColor = "#E6A100";
      pinColorClass = "bg-warn";
    }

    const searchIcon = L.divIcon({
      html: `<div class="relative flex items-center justify-center animate-bounce">
               <div class="h-6 w-6 rounded-full ${pinColorClass} border-2 border-white shadow-lift flex items-center justify-center text-[10px] text-white font-bold">★</div>
             </div>`,
      className: "custom-div-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    tempMarkerRef.current = L.marker([tempCity.lat, tempCity.lng], { icon: searchIcon })
      .addTo(mapRef.current)
      .bindPopup(`
        <div class="p-2 space-y-1 min-w-[150px]">
          <p class="font-display font-bold text-ink text-[13px] leading-tight">${tempCity.name}</p>
          <p class="text-[10px] text-muted leading-tight">${tempCity.formattedAddress || ''}</p>
          <span class="inline-block text-[9.5px] font-bold text-primary uppercase mt-1">Configure in search panel</span>
        </div>
      `);

    tempCircleRef.current = L.circle([tempCity.lat, tempCity.lng], {
      color: brandColor,
      fillColor: brandColor,
      fillOpacity: 0.18,
      weight: 2,
      dashArray: '5, 5',
      radius: tempRadius
    }).addTo(mapRef.current);

    return () => {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
      if (tempCircleRef.current) {
        tempCircleRef.current.remove();
        tempCircleRef.current = null;
      }
    };
  }, [tempCity, tempType, leafletLoaded]);

  // 6.5 Sync Temp Circle Radius (Optimized Live Resize)
  useEffect(() => {
    if (tempCircleRef.current) {
      tempCircleRef.current.setRadius(tempRadius);
    }
  }, [tempRadius]);

  // 7. Debounced Search Autocomplete API Handler
  const fetchSuggestions = async (query: string) => {
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=8`
      );
      if (!res.ok) {
        throw new Error("Failed to query maps geocoding service.");
      }
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      showToast(err.message || "An error occurred during location search.", "error");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const query = searchQuery.trim();
      if (query.length >= 3) {
        fetchSuggestions(query);
      } else {
        setSearchResults([]);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    fetchSuggestions(query);
  };

  // 8. Select Search Result
  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    const name = result.name || result.display_name.split(",")[0];
    const formattedAddress = result.display_name;
    const type = detectPlaceType(result);

    const defaultState = config?.defaultStateRadius !== undefined ? config.defaultStateRadius : 100000;
    const defaultCity = config?.defaultCityRadius !== undefined ? config.defaultCityRadius : 15000;
    const defaultVillage = config?.defaultVillageRadius !== undefined ? config.defaultVillageRadius : 5000;

    let radius = defaultCity;
    if (type === 'state') radius = defaultState;
    else if (type === 'village') radius = defaultVillage;

    const targetCity: ServiceCity = { name, lat, lng, formattedAddress, type, radius };
    setTempCity(targetCity);
    setTempType(type);
    setTempRadius(radius);

    // Pan map to search result
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], type === 'state' ? 8 : type === 'village' ? 14 : 12);
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  // 9. Add City Logic
  const handleAddCity = async (city: ServiceCity) => {
    if (cities.some((c) => c.name.toLowerCase() === city.name.toLowerCase())) {
      showToast(`"${city.name}" is already registered as an active serving region.`, "error");
      return;
    }

    setSubmitting(true);

    const updatedList = [...cities, city];
    try {
      const res = await fetch(`${apiUrl}/api/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activeCities: updatedList }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add service city.");
      }

      setCities(data.data.activeCities || []);
      setConfig(data.data);
      showToast(`"${city.name}" has been successfully added to service areas!`, "success");
      setTempCity(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update configuration.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 10. Remove City Logic
  const handleRemoveCity = async (cityName: string) => {
    setSubmitting(true);

    const updatedList = cities.filter((c) => c.name !== cityName);
    try {
      const res = await fetch(`${apiUrl}/api/admin/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activeCities: updatedList }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove service city.");
      }

      setCities(data.data.activeCities || []);
      setConfig(data.data);
      showToast(`"${cityName}" has been removed from active service.`, "info");

      if (mapRef.current) {
        mapRef.current.closePopup();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to remove region.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 11. Pan / Fly To City
  const flyToCity = (city: ServiceCity) => {
    if (mapRef.current) {
      const zoom = city.type === 'state' ? 8 : city.type === 'village' ? 14 : 12;
      mapRef.current.setView([city.lat, city.lng], zoom);
      
      const match = markersRef.current.find((m) => {
        const latlng = m.getLatLng();
        return Math.abs(latlng.lat - city.lat) < 0.0001 && Math.abs(latlng.lng - city.lng) < 0.0001;
      });
      if (match) {
        match.openPopup();
      }
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Topbar title="City Map" subtitle="Manage active regions where Padosi is active" />

      {/* Main dashboard grid: Sidebar list on the left, full map on the right */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-bg">
        
        {/* Left Column: Active Cities Sidebar List */}
        <aside className="w-full lg:w-[360px] shrink-0 border-r border-line bg-surface flex flex-col min-h-0 p-5 lg:p-6 space-y-6">
          <div>
            <p className="kicker">REGIONS</p>
            <p className="h2-display mt-1">Currently Serving</p>
            <p className="text-[12px] text-muted mt-1 leading-relaxed">
              Order processing and chef onboarding checks are active for these locations only.
            </p>
          </div>

          {/* Scrollable list container */}
          <div className="flex-1 overflow-y-auto min-h-[200px] space-y-3.5 pr-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 w-full rounded-2xl bg-cream/35 animate-pulse border border-line" />
                ))}
              </div>
            ) : cities.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-line rounded-2xl p-4">
                <div className="h-10 w-10 rounded-full bg-cream grid place-items-center mx-auto mb-2">
                  <MapPin className="h-4.5 w-4.5 text-muted" />
                </div>
                <p className="font-display font-bold text-ink text-[13px]">No active cities</p>
                <p className="text-[11.5px] text-muted mt-0.5">Use the map search box to add service areas.</p>
              </div>
            ) : (
              cities.map((city) => {
                const type = city.type || 'city';
                
                const defaultState = config?.defaultStateRadius !== undefined ? config.defaultStateRadius : 100000;
                const defaultCity = config?.defaultCityRadius !== undefined ? config.defaultCityRadius : 15000;
                const defaultVillage = config?.defaultVillageRadius !== undefined ? config.defaultVillageRadius : 5000;

                let defaultRadius = defaultCity;
                if (type === 'state') defaultRadius = defaultState;
                else if (type === 'village') defaultRadius = defaultVillage;

                const radius = city.radius !== undefined && city.radius !== null ? city.radius : defaultRadius;
                
                return (
                  <div
                    key={city.name}
                    className="group p-4 bg-white border border-line/60 hover:border-line hover:shadow-card rounded-2xl transition-all duration-200 flex flex-col gap-3 relative overflow-hidden"
                  >
                    {/* Top colored accent indicator line */}
                    <div className={cn(
                      "absolute top-0 left-0 right-0 h-1",
                      type === 'state' && "bg-secondary",
                      type === 'village' && "bg-warn",
                      type === 'city' && "bg-primary"
                    )} />

                    <div className="flex items-start justify-between min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold text-ink text-[14px] truncate">{city.name}</p>
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider select-none shrink-0",
                            type === 'state' && "bg-secondary-soft text-secondary",
                            type === 'village' && "bg-amber-100 text-warn",
                            type === 'city' && "bg-primary-soft text-primary"
                          )}>
                            {type}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted truncate mt-1 leading-normal" title={city.formattedAddress}>
                          {city.formattedAddress}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveCity(city.name)}
                        disabled={submitting}
                        className="h-8 w-8 rounded-xl text-muted hover:text-error hover:bg-error/10 grid place-items-center transition-all cursor-pointer shrink-0 ml-2"
                        title={`Remove ${city.name}`}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-line/45 pt-2.5 mt-0.5">
                      <span className="text-[11.5px] text-ink-soft font-medium flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full inline-block animate-pulse",
                          type === 'state' && "bg-secondary",
                          type === 'village' && "bg-warn",
                          type === 'city' && "bg-primary"
                        )} />
                        {(radius / 1000).toFixed(1)} km radius
                      </span>
                      <button
                        onClick={() => flyToCity(city)}
                        className="h-7 px-2.5 rounded-lg bg-cream/35 hover:bg-cream/70 text-ink-soft hover:text-ink flex items-center gap-1 text-[11px] font-bold transition-all"
                        title="Focus on map"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Focus</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Full interactive map area with Floating Search box */}
        <div className="flex-1 relative flex flex-col min-h-[400px] lg:min-h-0 bg-cream/10">
          
          {/* Map Target Canvas Container */}
          <div ref={mapContainerRef} className="absolute inset-0 z-0 h-full w-full" />

          {/* Floating Search Overlay Container */}
          <div className="absolute top-4 left-4 z-[999] w-full max-w-sm px-4 lg:px-0">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-line rounded-xl p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
              <div className="flex-1 flex items-center gap-2 px-2">
                <Search className="h-4 w-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search & pin cities (e.g. Pune)"
                  className="w-full text-[13px] bg-transparent outline-none placeholder:text-muted py-1"
                  disabled={searching || submitting}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3 rounded-lg flex items-center"
                disabled={searching || submitting || !searchQuery.trim()}
              >
                {searching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </form>

            {/* Nominatim Search Autocomplete Dropdown List */}
            {searchResults.length > 0 && (
              <ul className="mt-2 bg-white/95 backdrop-blur-sm border border-line rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.15)] max-h-60 overflow-y-auto divide-y divide-line">
                {searchResults.map((result) => {
                  const detectedType = detectPlaceType(result);
                  return (
                    <li key={result.place_id}>
                      <button
                        type="button"
                        onClick={() => handleSelectResult(result)}
                        className="w-full p-3 text-left hover:bg-primary/5 flex items-start gap-2.5 transition-colors justify-between"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div className="text-[12px] leading-snug min-w-0 flex-1">
                            <p className="font-display font-bold text-ink truncate">
                              {result.name || result.display_name.split(",")[0]}
                            </p>
                            <p className="text-muted mt-0.5 truncate">{result.display_name}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[8.5px] font-bold uppercase tracking-wider select-none shrink-0",
                          detectedType === 'state' && "bg-secondary-soft text-secondary",
                          detectedType === 'village' && "bg-amber-100 text-warn",
                          detectedType === 'city' && "bg-primary-soft text-primary"
                        )}>
                          {detectedType}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Region Configuration Overlay Card */}
            {tempCity && (
              <div className="mt-3 bg-white/95 backdrop-blur-sm border border-line rounded-2xl p-5 shadow-[0_12px_28px_-8px_rgba(22,24,29,0.12)] space-y-4">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-primary-soft text-primary font-display font-bold text-[9px] uppercase tracking-wider">
                    Configure New Service Area
                  </span>
                  <h3 className="font-display font-bold text-ink text-[14.5px] mt-1 leading-tight">{tempCity.name}</h3>
                  <p className="text-[11.5px] text-muted mt-1 leading-snug line-clamp-2">{tempCity.formattedAddress}</p>
                </div>

                <div className="space-y-3">
                  {/* Region Type Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-ink-soft uppercase tracking-wider block mb-1.5">Region Type</label>
                    <div className="grid grid-cols-3 gap-1.5 bg-cream/30 p-1 rounded-xl border border-line/60">
                      {[
                        { val: "state", label: "State" },
                        { val: "city", label: "City" },
                        { val: "village", label: "Village" }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setTempType(item.val);
                            const defaultState = config?.defaultStateRadius !== undefined ? config.defaultStateRadius : 100000;
                            const defaultCity = config?.defaultCityRadius !== undefined ? config.defaultCityRadius : 15000;
                            const defaultVillage = config?.defaultVillageRadius !== undefined ? config.defaultVillageRadius : 5000;

                            if (item.val === 'state') setTempRadius(defaultState);
                            else if (item.val === 'village') setTempRadius(defaultVillage);
                            else setTempRadius(defaultCity);
                          }}
                          className={cn(
                            "py-1.5 px-2 text-[11.5px] font-bold rounded-lg transition-all text-center",
                            tempType === item.val
                              ? "bg-white text-ink shadow-sm border border-line/40"
                              : "text-muted hover:text-ink hover:bg-white/40"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Radius Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">Service Radius</label>
                      <span className="text-[11.5px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-lg">{(tempRadius / 1000).toFixed(1)} km</span>
                    </div>
                    <input
                      type="range"
                      min={tempType === 'state' ? 20000 : tempType === 'village' ? 1000 : 5000}
                      max={tempType === 'state' ? 300000 : tempType === 'village' ? 15000 : 50000}
                      step={tempType === 'state' ? 5000 : tempType === 'village' ? 500 : 1000}
                      value={tempRadius}
                      onChange={(e) => setTempRadius(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-cream rounded-lg appearance-none cursor-pointer accent-primary border border-line/40"
                    />
                    <div className="flex justify-between text-[9px] text-muted mt-1">
                      <span>{tempType === 'state' ? '20 km' : tempType === 'village' ? '1 km' : '5 km'}</span>
                      <span>{tempType === 'state' ? '300 km' : tempType === 'village' ? '15 km' : '50 km'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-line/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1 rounded-xl text-[12px] h-9"
                    onClick={() => {
                      setTempCity(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="flex-1 rounded-xl text-[12px] h-9"
                    disabled={submitting}
                    onClick={() => {
                      handleAddCity({
                        ...tempCity,
                        type: tempType,
                        radius: tempRadius
                      });
                    }}
                  >
                    {submitting ? "Adding..." : "Add Region"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-2xl border shadow-lift flex items-start gap-3 bg-white/95 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-5",
              toast.type === "success" && "border-success/20 text-ink",
              toast.type === "error" && "border-error/20 text-ink",
              toast.type === "info" && "border-secondary/20 text-ink"
            )}
          >
            {toast.type === "success" && <Check className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="h-4.5 w-4.5 text-error mt-0.5 shrink-0" />}
            {toast.type === "info" && <Navigation className="h-4.5 w-4.5 text-secondary mt-0.5 shrink-0" />}
            
            <div className="flex-1 text-[12px] font-medium leading-normal">{toast.message}</div>
            
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-muted hover:text-ink shrink-0 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
