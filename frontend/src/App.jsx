import { useMemo, useState } from "react";
import Header from "./components/Header";
import MainLayout from "./components/MainLayout";

const INITIAL_LOCATION = {
  lat: 60.1699,
  lon: 24.9384,
  name: "Helsinki, Uusimaa, Finland",
  city: "Helsinki",
  country: "Finland",
};

function normalizeCountry(value) {
  return value.trim().toLowerCase();
}

function toLocation(result) {
  return {
    lat: Number(result.lat),
    lon: Number(result.lon),
    name: result.display_name,
    city: result.name || result.address?.city || result.address?.town || result.address?.village || "",
    country: result.address?.country || "",
  };
}

function extractCountry(result) {
  return result.address?.country || "";
}

function distanceFromOrigin(result, origin) {
  const radians = Math.PI / 180;
  const latitudeDifference = (Number(result.lat) - origin.lat) * radians;
  const longitudeDifference = (Number(result.lon) - origin.lng) * radians;
  const originLatitude = origin.lat * radians;
  const resultLatitude = Number(result.lat) * radians;
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(resultLatitude) *
    Math.sin(longitudeDifference / 2) ** 2;

  return 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [mapLocation, setMapLocation] = useState(INITIAL_LOCATION);
  const [mapStatus, setMapStatus] = useState("ready");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCountryPrompt, setPendingCountryPrompt] = useState(null);
  const [nearbyAnswer, setNearbyAnswer] = useState("");
  const [nearbySearchOrigin, setNearbySearchOrigin] = useState(null);
  const [placesStatus, setPlacesStatus] = useState("idle");
  const [placesError, setPlacesError] = useState("");
  const [placeLookupStatus, setPlaceLookupStatus] = useState("idle");
  const [placeLookupMessage, setPlaceLookupMessage] = useState("");

  const countryOptionsText = useMemo(() => {
    if (!pendingCountryPrompt) return "";
    return pendingCountryPrompt.countries.join(", ");
  }, [pendingCountryPrompt]);

  const appendMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, text }]);
  };

  const handleMapClick = async ({ lat, lng }) => {
    const latitude = lat.toFixed(6);
    const longitude = lng.toFixed(6);

    setNearbySearchOrigin({ lat, lng });
    setPlaceLookupStatus("idle");
    setPlaceLookupMessage("");
    setMapLocation((current) => ({
      ...current,
      lat,
      lon: lng,
      name: `${latitude}, ${longitude}`,
    }));

    setNearbyAnswer("");
    setPlacesError("");
    setPlacesStatus("loading");
    try {
      const response = await fetch("/api/nearby-kebab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "coordinate lookup failed");
      }

      const { answer, location } = await response.json();
      setNearbyAnswer(answer);
      if (location) {
        setMapLocation((current) => ({ ...current, ...location }));
      }
      setPlacesStatus("ready");
    } catch (error) {
      setPlacesError(
        error instanceof Error ? error.message : "Nearby kebab places could not be loaded."
      );
      setPlacesStatus("error");
    }
  };

  const handlePlaceSelect = async (placeName) => {
    if (!nearbySearchOrigin) return;

    setPlaceLookupStatus("loading");
    setPlaceLookupMessage("");

    const latitudeDelta = 0.1;
    const longitudeDelta = Math.min(
      180,
      latitudeDelta / Math.max(Math.cos((nearbySearchOrigin.lat * Math.PI) / 180), 0.01)
    );
    const viewbox = [
      Math.max(-180, nearbySearchOrigin.lng - longitudeDelta),
      Math.min(90, nearbySearchOrigin.lat + latitudeDelta),
      Math.min(180, nearbySearchOrigin.lng + longitudeDelta),
      Math.max(-90, nearbySearchOrigin.lat - latitudeDelta),
    ].join(",");
    const parameters = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "8",
      bounded: "1",
      viewbox,
      q: placeName,
    });

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${parameters}`);
      if (!response.ok) {
        throw new Error("Place address lookup failed.");
      }

      const results = await response.json();
      if (!results.length) {
        setPlaceLookupStatus("error");
        setPlaceLookupMessage(`No address found for ${placeName} near the selected map point.`);
        return;
      }

      const closest = results.reduce((nearest, result) =>
        distanceFromOrigin(result, nearbySearchOrigin) <
        distanceFromOrigin(nearest, nearbySearchOrigin)
          ? result
          : nearest
      );
      setMapLocation(toLocation(closest));
      setMapStatus("ready");
      setPlaceLookupStatus("ready");
      setPlaceLookupMessage(`Showing ${closest.display_name} on the map.`);
    } catch {
      setPlaceLookupStatus("error");
      setPlaceLookupMessage(`Could not find an address for ${placeName}.`);
    }
  };

  const searchCity = async (query) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&addressdetails=1&q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("search failed");
    }
    return response.json();
  };

  const handleCityInput = async (cityText) => {
    const results = await searchCity(cityText);
    if (!results.length) {
      appendMessage("assistant", "NOk");
      return;
    }

    const countryToResult = new Map();
    for (const result of results) {
      const country = extractCountry(result);
      const key = normalizeCountry(country);
      if (country && !countryToResult.has(key)) {
        countryToResult.set(key, result);
      }
    }

    const countries = [...countryToResult.values()].map((item) => extractCountry(item));

    if (countries.length <= 1) {
      const selected = countryToResult.values().next().value ?? results[0];
      setMapLocation(toLocation(selected));
      setMapStatus("ready");
      appendMessage("assistant", "Ok");
      return;
    }

    setPendingCountryPrompt({ city: cityText, countries });
    appendMessage("assistant", `I found multiple cities named ${cityText}. Which country? ${countries.join(", ")}`);
    setMapStatus("ready");
  };

  const handleCountryInput = async (countryText) => {
    const city = pendingCountryPrompt.city;
    const results = await searchCity(`${city}, ${countryText}`);

    if (!results.length) {
      setPendingCountryPrompt(null);
      appendMessage("assistant", "NOk");
      setMapStatus("ready");
      return;
    }

    const wanted = normalizeCountry(countryText);
    const matched =
      results.find((result) => normalizeCountry(extractCountry(result)) === wanted) ||
      results[0];

    const matchedCountry = normalizeCountry(extractCountry(matched));
    if (matchedCountry !== wanted) {
      setPendingCountryPrompt(null);
      appendMessage("assistant", "NOk");
      setMapStatus("ready");
      return;
    }

    setMapLocation(toLocation(matched));
    setPendingCountryPrompt(null);
    setMapStatus("ready");
    appendMessage("assistant", "Ok");
  };

  const handleSendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing) return;

    appendMessage("user", trimmed);
    setIsProcessing(true);
    setMapStatus("loading");

    try {
      if (pendingCountryPrompt) {
        await handleCountryInput(trimmed);
      } else {
        await handleCityInput(trimmed);
      }
    } catch {
      setMapStatus("ready");
      appendMessage("assistant", "NOk");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-svh bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50">
      <Header />
      <MainLayout
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
        mapLocation={mapLocation}
        mapStatus={mapStatus}
        onMapClick={handleMapClick}
        countryOptionsText={countryOptionsText}
        nearbyAnswer={nearbyAnswer}
        placesStatus={placesStatus}
        placesError={placesError}
        onPlaceSelect={handlePlaceSelect}
        placeLookupStatus={placeLookupStatus}
        placeLookupMessage={placeLookupMessage}
      />
    </div>
  );
}
