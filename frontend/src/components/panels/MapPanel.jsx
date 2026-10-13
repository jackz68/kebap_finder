import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng);
    },
  });

  return null;
}

function MapCenter({ location }) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lon]);
  }, [location.lat, location.lon, map]);

  return null;
}

export default function MapPanel({ location, status, onMapClick }) {

  return (
    <div className="h-full min-h-0 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden overscroll-contain flex flex-col">
      <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-700/60">
        <h2 className="text-base font-semibold">Map</h2>
        {location ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{location.name}</p> : null}
      </div>
      <div className="p-4 flex-1 min-h-0">
        {status === "loading" ? (
          <div className="h-full min-h-0 grid place-items-center rounded-lg bg-gradient-to-br from-sky-200 to-indigo-200 dark:from-sky-900/40 dark:to-indigo-900/40 text-zinc-700 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-sm">Loading map...</span>
          </div>
        ) : null}

        {status !== "loading" && location ? (
          <div className="h-full min-h-0 rounded-lg overflow-hidden border border-zinc-200/60 dark:border-zinc-700/60">
            <MapContainer center={[location.lat, location.lon]} zoom={12} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={onMapClick} />
              <MapCenter location={location} />
              <CircleMarker center={[location.lat, location.lon]} radius={7} />
            </MapContainer>
          </div>
        ) : null}
      </div>
    </div>
  );
}
