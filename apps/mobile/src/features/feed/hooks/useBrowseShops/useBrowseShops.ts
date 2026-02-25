import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { feedKeys } from '../../queryKeys';
import type { RelevantShop } from '@/features/listings/schemas';

/**
 * Fetches all shops from the shops table for display on the browse map.
 * Transforms PostGIS geography/geometry point to { lat, lng }.
 */
const useBrowseShops = () => {
  return useQuery<RelevantShop[]>({
    queryKey: feedKeys.shops(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, address, location, supported_tcgs, verified');

      if (error) throw error;
      if (!data) return [];

      return data.map((shop: Record<string, unknown>) => {
        let lat = 0;
        let lng = 0;

        // Parse PostGIS point — could be GeoJSON or WKT string
        const loc = shop.location;
        if (loc && typeof loc === 'object') {
          const geo = loc as { coordinates?: [number, number] };
          if (geo.coordinates) {
            // GeoJSON: [lng, lat]
            lng = geo.coordinates[0];
            lat = geo.coordinates[1];
          }
        } else if (typeof loc === 'string') {
          // WKT: POINT(lng lat)
          const match = /POINT\(([^ ]+) ([^ ]+)\)/.exec(loc);
          if (match && match[1] && match[2]) {
            lng = parseFloat(match[1]);
            lat = parseFloat(match[2]);
          }
        }

        return {
          id: shop.id as string,
          name: shop.name as string,
          address: (shop.address as string) ?? '',
          lat,
          lng,
          supported_tcgs: (shop.supported_tcgs as string[]) ?? [],
          verified: (shop.verified as boolean) ?? false,
        };
      });
    },
  });
};

export default useBrowseShops;
