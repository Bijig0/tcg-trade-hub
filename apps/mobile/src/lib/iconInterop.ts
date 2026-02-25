/**
 * NativeWind cssInterop for lucide-react-native icons.
 *
 * Without this, `className="text-foreground"` on a lucide icon has no effect
 * because NativeWind can't map className styles to the `color` prop that SVG
 * icons expect. This file bridges the two by calling `cssInterop` on every
 * icon used in the app.
 *
 * Import this file once at app startup (in _layout.tsx) before any icon renders.
 */
import { cssInterop } from 'nativewind';
import type { LucideIcon } from 'lucide-react-native';
import {
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  Clock,
  DollarSign,
  Handshake,
  Heart,
  ImageOff,
  Layers,
  List,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  PackageOpen,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
} from 'lucide-react-native';

const iconWithClassName = (icon: LucideIcon) => {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
};

[
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  Clock,
  DollarSign,
  Handshake,
  Heart,
  ImageOff,
  Layers,
  List,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  PackageOpen,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
  User,
  X,
].forEach(iconWithClassName);
