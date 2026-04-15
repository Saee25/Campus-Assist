"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons in leaflet with Next.js/Webpack
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const canteenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function CampusMap() {
  const center: [number, number] = [19.0645, 72.8358]; // Approximate TSEC Bandra coordinates

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0 relative isolate">
      <MapContainer 
        center={center} 
        zoom={18} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* TSEC Main Building Reference */}
        <Marker position={[19.06455, 72.8358]} icon={defaultIcon}>
          <Popup>
            <div className="text-sm">
              <strong>TSEC Main Building</strong>
              <p className="text-slate-500 m-0">Delivery Hub</p>
            </div>
          </Popup>
        </Marker>

        {/* TSEC Canteen Reference */}
        <Marker position={[19.0643, 72.8357]} icon={canteenIcon}>
          <Popup>
            <div className="text-sm">
              <strong>TSEC Canteen</strong>
              <p className="text-orange-600 m-0 font-semibold">Pickup Hub</p>
            </div>
          </Popup>
        </Marker>

      </MapContainer>
    </div>
  );
}
