import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import useUpdateCollectionItem from '../useUpdateCollectionItem/useUpdateCollectionItem';
import type { CollectionItemRow } from '@tcg-trade-hub/database';

const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
  allowsEditing: true,
  aspect: [2, 3],
};

/**
 * Hook for CRUD operations on collection item photos.
 * Handles image picking, camera capture, Supabase Storage upload, and deletion.
 */
const useCollectionPhotos = (item: CollectionItemRow | null) => {
  const { user } = useAuth();
  const updateItem = useUpdateCollectionItem();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAndAppend = useCallback(
    async (uri: string) => {
      if (!item || !user) return;
      setIsUploading(true);
      try {
        const timestamp = Date.now();
        const path = `collection-photos/${user.id}/${item.id}/${timestamp}.jpg`;

        const response = await fetch(uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('collection-photos')
          .upload(path, blob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('collection-photos')
          .getPublicUrl(path);

        const newPhotos = [...(item.photos ?? []), urlData.publicUrl];
        updateItem.mutate({ id: item.id, updates: { photos: newPhotos } });
      } finally {
        setIsUploading(false);
      }
    },
    [item, user, updateItem],
  );

  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    if (result.canceled || !result.assets[0]) return;

    await uploadAndAppend(result.assets[0].uri);
  }, [uploadAndAppend]);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    if (result.canceled || !result.assets[0]) return;

    await uploadAndAppend(result.assets[0].uri);
  }, [uploadAndAppend]);

  const useStockImage = useCallback(() => {
    if (!item) return;
    const newPhotos = item.photos?.includes(item.image_url)
      ? item.photos
      : [item.image_url, ...(item.photos ?? [])];
    updateItem.mutate({ id: item.id, updates: { photos: newPhotos } });
  }, [item, updateItem]);

  const deletePhoto = useCallback(
    async (url: string) => {
      if (!item) return;
      setIsUploading(true);
      try {
        // Try to extract storage path from public URL and delete from storage
        const match = url.match(/collection-photos\/.+$/);
        if (match) {
          await supabase.storage.from('collection-photos').remove([match[0]]);
        }

        const newPhotos = (item.photos ?? []).filter((p) => p !== url);
        updateItem.mutate({ id: item.id, updates: { photos: newPhotos } });
      } finally {
        setIsUploading(false);
      }
    },
    [item, updateItem],
  );

  return { pickPhoto, takePhoto, useStockImage, deletePhoto, isUploading };
};

export default useCollectionPhotos;
