import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { MapPin, Navigation } from "lucide-react";
import L from "leaflet";
import { useEffect } from "react";
import { PRESET_LOCATIONS, TELANGANA_CENTER, INITIAL_ZOOM } from "@/constants";
import type { Language } from "@/types";
import { t } from "@/i18n";

// Fix default marker icon in Vite/Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom green marker for selected farm
const farmIcon = L.divIcon({
  className: "custom-farm-marker",
  html: `<div style="background:#047857;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(4,120,87,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);width:10px;height:10px;background:#DCFCE7;border-radius:50%;"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const presetIcon = L.divIcon({
  className: "custom-preset-marker",
  html: `<div style="background:#16A34A;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function ClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 10), { duration: 0.8 });
  }, [center, map]);
  return null;
}

interface FarmMapProps {
  selectedLat: number;
  selectedLon: number;
  onSelect: (lat: number, lon: number) => void;
  lang: Language;
}

export default function FarmMap({ selectedLat, selectedLon, onSelect, lang }: FarmMapProps) {
  return (
    <div className="relative">
      <MapContainer
        center={TELANGANA_CENTER}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom
        className="w-full h-[420px] rounded-2xl shadow-card border border-mint/40"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onClick={onSelect} />

        {PRESET_LOCATIONS.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lon]} icon={presetIcon}>
            <Popup>
              <button
                onClick={() => onSelect(loc.lat, loc.lon)}
                className="font-semibold text-emerald hover:underline"
              >
                {lang === "te" ? loc.nameTe : loc.name}
              </button>
            </Popup>
          </Marker>
        ))}

        <Marker position={[selectedLat, selectedLon]} icon={farmIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-forest">
                {t("selectedCoords", lang)}
              </div>
              <div className="text-charcoal/70 mt-1">
                {t("latitude", lang)}: {selectedLat.toFixed(4)}
              </div>
              <div className="text-charcoal/70">
                {t("longitude", lang)}: {selectedLon.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        <FlyTo center={[selectedLat, selectedLon]} />
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md flex items-center gap-1.5 pointer-events-none">
        <Navigation className="w-3.5 h-3.5 text-emerald" />
        <span className="text-xs text-charcoal/70 font-medium">{t("clickToSelect", lang)}</span>
      </div>

      {/* Preset buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => onSelect(loc.lat, loc.lon)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint/50 hover:bg-mint text-forest text-sm font-medium transition-colors border border-mint"
          >
            <MapPin className="w-3.5 h-3.5" />
            {lang === "te" ? loc.nameTe : loc.name}
          </button>
        ))}
      </div>
    </div>
  );
}
