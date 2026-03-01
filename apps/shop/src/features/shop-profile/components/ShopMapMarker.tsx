import { Store } from 'lucide-react';

/**
 * Web SVG replica of the mobile ShopMarker — purple circle with white Store icon
 * and a CSS triangle pointer below. Used as a custom marker overlay on Google Maps.
 */
export const ShopMapMarker = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-600 shadow-md">
        <Store size={16} color="white" />
      </div>
      <div className="h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600" />
    </div>
  );
};
