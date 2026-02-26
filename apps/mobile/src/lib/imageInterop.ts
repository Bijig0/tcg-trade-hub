/**
 * NativeWind cssInterop for expo-image.
 *
 * Without this, `className="h-full w-full"` on an expo-image Image component
 * has no effect because NativeWind can't map className styles to the style prop
 * that expo-image expects. This causes images to render with 0×0 dimensions.
 *
 * Import this file once at app startup (in _layout.tsx) before any Image renders.
 */
import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';

cssInterop(Image, {
  className: 'style',
});
