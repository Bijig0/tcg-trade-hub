import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Store, ShieldCheck, MapPin } from 'lucide-react';
import { PhoneFrame } from '@/components/PhoneFrame/PhoneFrame';
import { ShopRowSchema } from '@tcg-trade-hub/database';
import type { z } from 'zod';

type ShopRow = z.infer<typeof ShopRowSchema>;

const TCG_LABELS: Record<string, string> = {
  pokemon: 'Pokemon',
  mtg: 'MTG',
  onepiece: 'One Piece',
  lorcana: 'Lorcana',
  fab: 'FaB',
  starwars: 'Star Wars',
};

type MobileMapPreviewProps = {
  coords: { latitude: number; longitude: number };
  shop: ShopRow;
};

/**
 * PhoneFrame-wrapped simulated mobile map view with a ShopMarker,
 * shop name label chip, and a bottom-sheet detail card mockup.
 */
export const MobileMapPreview = ({ coords, shop }: MobileMapPreviewProps) => {
  return (
    <PhoneFrame className="h-[480px]">
      <div className="relative flex-1 overflow-hidden">
        {/* Interactive map (gestures disabled for preview feel) */}
        <Map
          defaultCenter={{ lat: coords.latitude, lng: coords.longitude }}
          defaultZoom={16}
          mapId="DEMO_MAP_ID"
          disableDefaultUI
          gestureHandling="none"
          colorScheme="DARK"
          className="h-full w-full"
        >
          <AdvancedMarker position={{ lat: coords.latitude, lng: coords.longitude }}>
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-600 shadow-md">
                <Store size={16} color="white" />
              </div>
              <div className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600" />
              {/* Shop name label chip */}
              <div className="mt-1 max-w-[140px] rounded-full bg-background/90 px-3 py-0.5 shadow-sm">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {shop.name}
                </span>
              </div>
            </div>
          </AdvancedMarker>
        </Map>

        {/* Bottom sheet mockup */}
        <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 shadow-lg">
          {/* Shop icon + name */}
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
              <ShieldCheck size={20} color="white" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{shop.name}</p>
              {shop.verified && (
                <div className="mt-0.5 flex items-center">
                  <ShieldCheck size={12} color="#9333ea" />
                  <span className="ml-1 text-[10px] font-medium text-purple-500">
                    Verified Shop
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mt-3 flex items-start">
            <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">
              {shop.address}
            </span>
          </div>

          {/* TCG badges */}
          {shop.supported_tcgs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {shop.supported_tcgs.map((tcg) => (
                <span
                  key={tcg}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                >
                  {TCG_LABELS[tcg] ?? tcg}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
};
