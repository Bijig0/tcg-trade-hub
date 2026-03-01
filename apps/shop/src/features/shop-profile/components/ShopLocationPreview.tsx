import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';
import { ShopRowSchema } from '@tcg-trade-hub/database';
import type { z } from 'zod';
import parseLocationCoords from '../utils/parseLocationCoords/parseLocationCoords';
import { ShopMapMarker } from './ShopMapMarker';
import { MobileMapPreview } from './MobileMapPreview';

type ShopRow = z.infer<typeof ShopRowSchema>;

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  | string
  | undefined;

type ShopLocationPreviewProps = {
  shop: ShopRow;
};

/**
 * Shows an interactive Google Map centered on the shop's location with a
 * purple ShopMarker, plus a PhoneFrame-wrapped mobile app preview below.
 * Falls back to a placeholder if no API key or coordinates are available.
 */
export const ShopLocationPreview = ({ shop }: ShopLocationPreviewProps) => {
  const coords = parseLocationCoords(shop.location);

  if (!coords || !GOOGLE_MAPS_API_KEY) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Shop Location</h3>
          <p className="mt-1 text-sm text-muted-foreground">{shop.address}</p>
        </div>
        <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-muted/50">
          <div className="text-center">
            <MapPin size={32} className="mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {!GOOGLE_MAPS_API_KEY
                ? 'Map unavailable — no API key configured'
                : 'No location coordinates available'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="space-y-6">
        {/* Section: Shop Location */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">Shop Location</h3>
          <p className="mt-1 text-sm text-muted-foreground">{shop.address}</p>
        </div>

        {/* Interactive Google Map */}
        <div className="aspect-video overflow-hidden rounded-xl border border-border">
          <Map
            defaultCenter={{ lat: coords.latitude, lng: coords.longitude }}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            disableDefaultUI
            className="h-full w-full"
          >
            <AdvancedMarker position={{ lat: coords.latitude, lng: coords.longitude }}>
              <ShopMapMarker />
            </AdvancedMarker>
          </Map>
        </div>

        {/* Section: Mobile App Preview */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">Mobile App Preview</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            How your shop appears to mobile app users
          </p>
        </div>

        <MobileMapPreview coords={coords} shop={shop} />
      </div>
    </APIProvider>
  );
};
