import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Search } from 'lucide-react-native';
import usePlacesAutocomplete from '@/hooks/usePlacesAutocomplete/usePlacesAutocomplete';

type LocationCoords = { latitude: number; longitude: number };

type LocationPickerProps = {
  initialLocation?: LocationCoords | null;
  initialLocationName?: string;
  onLocationChange: (coords: LocationCoords, name: string) => void;
  mapHeight?: number;
  compact?: boolean;
};

/**
 * Reusable location picker with Google Places autocomplete and a draggable map marker.
 *
 * On Places selection → animate map + place marker.
 * On marker drag end → reverse geocode via expo-location for display name.
 */
const LocationPicker = ({
  initialLocation,
  initialLocationName,
  onLocationChange,
  mapHeight = 250,
  compact = false,
}: LocationPickerProps) => {
  const mapRef = useRef<MapView>(null);
  const [coords, setCoords] = useState<LocationCoords | null>(initialLocation ?? null);
  const [locationName, setLocationName] = useState(initialLocationName ?? '');
  const [searchText, setSearchText] = useState('');
  const { predictions, setQuery, getPlaceDetails, clearPredictions } =
    usePlacesAutocomplete();

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      setQuery(text);
    },
    [setQuery],
  );

  const handlePredictionSelect = useCallback(
    async (placeId: string) => {
      clearPredictions();
      setSearchText('');

      const details = await getPlaceDetails(placeId);
      if (!details) return;

      const newCoords = { latitude: details.latitude, longitude: details.longitude };
      setCoords(newCoords);
      setLocationName(details.formattedAddress);
      onLocationChange(newCoords, details.formattedAddress);

      mapRef.current?.animateToRegion(
        {
          ...newCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    },
    [getPlaceDetails, clearPredictions, onLocationChange],
  );

  const handleMarkerDragEnd = useCallback(
    async (e: { nativeEvent: { coordinate: LocationCoords } }) => {
      const newCoords = e.nativeEvent.coordinate;
      setCoords(newCoords);

      try {
        const [result] = await Location.reverseGeocodeAsync(newCoords);
        if (result) {
          const parts = [result.name, result.city, result.region].filter(Boolean);
          const name = parts.join(', ');
          setLocationName(name);
          onLocationChange(newCoords, name);
        } else {
          onLocationChange(newCoords, locationName);
        }
      } catch {
        onLocationChange(newCoords, locationName);
      }
    },
    [onLocationChange, locationName],
  );

  const initialRegion: Region = coords
    ? { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <View className="gap-2">
      {/* Search input */}
      <View className="relative z-10">
        <View className="flex-row items-center rounded-lg border border-input bg-background px-3 py-2">
          <Search size={16} className="mr-2 text-muted-foreground" />
          <TextInput
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder="Search for a location..."
            className="flex-1 text-sm text-foreground"
            placeholderTextColor="#a1a1aa"
          />
        </View>

        {predictions.length > 0 && (
          <View className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-border bg-card shadow-lg">
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handlePredictionSelect(item.place_id)}
                  className="border-b border-border px-3 py-2.5"
                >
                  <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                    {item.structured_formatting.main_text}
                  </Text>
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {item.structured_formatting.secondary_text}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}
      </View>

      {/* Map */}
      <View className="overflow-hidden rounded-xl border border-border" style={{ height: mapHeight }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={!compact}
        >
          {coords && (
            <Marker
              coordinate={coords}
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <MapPin size={28} color="#ef4444" fill="#ef4444" />
            </Marker>
          )}
        </MapView>
      </View>

      {/* Location name */}
      {locationName ? (
        <Text className="text-xs text-muted-foreground" numberOfLines={2}>
          {locationName}
        </Text>
      ) : null}
    </View>
  );
};

export default LocationPicker;
