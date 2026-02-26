import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Linking, Platform } from 'react-native';
import openMapsNavigation from './openMapsNavigation';

vi.mock('react-native', () => ({
  Linking: {
    canOpenURL: vi.fn(),
    openURL: vi.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

const mockCanOpenURL = Linking.canOpenURL as ReturnType<typeof vi.fn>;
const mockOpenURL = Linking.openURL as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockOpenURL.mockResolvedValue(true);
});

describe('openMapsNavigation', () => {
  describe('iOS', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'ios';
    });

    it('should open Apple Maps when available', async () => {
      mockCanOpenURL.mockResolvedValueOnce(true);

      await openMapsNavigation({ latitude: -37.81, longitude: 144.96, label: 'Test Shop' });

      expect(mockCanOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('maps://app?daddr=-37.81,144.96'),
      );
      expect(mockOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('maps://app?daddr=-37.81,144.96'),
      );
    });

    it('should fall back to Google Maps app when Apple Maps unavailable', async () => {
      mockCanOpenURL.mockResolvedValueOnce(false); // Apple Maps
      mockCanOpenURL.mockResolvedValueOnce(true); // Google Maps

      await openMapsNavigation({ latitude: -37.81, longitude: 144.96 });

      expect(mockOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('comgooglemaps://?daddr=-37.81,144.96'),
      );
    });

    it('should fall back to browser when no native app available', async () => {
      mockCanOpenURL.mockResolvedValue(false);

      await openMapsNavigation({ latitude: -37.81, longitude: 144.96 });

      expect(mockOpenURL).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=-37.81,144.96',
      );
    });
  });

  describe('Android', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'android';
    });

    it('should open Google Maps navigation intent when available', async () => {
      mockCanOpenURL.mockResolvedValueOnce(true);

      await openMapsNavigation({ latitude: -37.81, longitude: 144.96 });

      expect(mockOpenURL).toHaveBeenCalledWith('google.navigation:q=-37.81,144.96');
    });

    it('should fall back to browser when intent unavailable', async () => {
      mockCanOpenURL.mockResolvedValueOnce(false);

      await openMapsNavigation({ latitude: -37.81, longitude: 144.96 });

      expect(mockOpenURL).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&destination=-37.81,144.96',
      );
    });
  });
});
