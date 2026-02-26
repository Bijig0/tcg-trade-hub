import React from 'react';
import MapViewDirections from 'react-native-maps-directions';
import { env } from '@/config/env';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type DirectionsResult = {
  distance: number;
  duration: number;
};

type MapDirectionsOverlayProps = {
  origin: Coordinate;
  destination: Coordinate;
  onReady?: (result: DirectionsResult) => void;
  onError?: (error: string) => void;
};

/**
 * Reusable overlay that draws a route polyline between two points on a MapView.
 * Returns null (renders nothing) when Google Maps API key is not configured,
 * providing graceful degradation.
 *
 * Must be rendered as a child of a react-native-maps MapView.
 */
const MapDirectionsOverlay: React.FC<MapDirectionsOverlayProps> = ({
  origin,
  destination,
  onReady,
  onError,
}) => {
  const apiKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return null;

  return (
    <MapViewDirections
      origin={origin}
      destination={destination}
      apikey={apiKey}
      strokeWidth={4}
      strokeColor="#f59e0b"
      mode="DRIVING"
      onReady={(result) => {
        onReady?.({
          distance: result.distance,
          duration: result.duration,
        });
      }}
      onError={(errorMessage) => {
        onError?.(errorMessage ?? 'Directions request failed');
      }}
    />
  );
};

export default MapDirectionsOverlay;
