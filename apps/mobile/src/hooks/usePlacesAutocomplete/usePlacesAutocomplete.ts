import { useState, useRef, useCallback } from 'react';
import { env } from '@/config/env';

type PlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

type PlaceCoords = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

/**
 * Hook that wraps the Google Places Autocomplete + Details REST APIs.
 *
 * Debounces text input (300ms) then calls the Autocomplete endpoint.
 * Selection calls the Place Details endpoint for lat/lng coordinates.
 * Uses the existing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
const usePlacesAutocomplete = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const setQuery = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!text.trim() || !apiKey) {
        setPredictions([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${apiKey}`;
          const res = await fetch(url);
          const json = await res.json();
          setPredictions(json.predictions ?? []);
        } catch {
          setPredictions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [apiKey],
  );

  const getPlaceDetails = useCallback(
    async (placeId: string): Promise<PlaceCoords | null> => {
      if (!apiKey) return null;

      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        const result = json.result;

        if (!result?.geometry?.location) return null;

        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formattedAddress: result.formatted_address ?? '',
        };
      } catch {
        return null;
      }
    },
    [apiKey],
  );

  const clearPredictions = useCallback(() => {
    setPredictions([]);
  }, []);

  return { predictions, isLoading, setQuery, getPlaceDetails, clearPredictions };
};

export default usePlacesAutocomplete;
