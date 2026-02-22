import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, Image, Modal, ActionSheetIOS, Platform, Alert } from 'react-native';
import type { CollectionItemRow } from '@tcg-trade-hub/database';
import useCollectionPhotos from '../../hooks/useCollectionPhotos/useCollectionPhotos';

type PhotoGalleryProps = {
  item: CollectionItemRow;
};

const PHOTO_WIDTH = 128;
const PHOTO_HEIGHT = 192;

/**
 * Horizontal scrollable photo gallery with CRUD.
 * Shows user photos or stock image placeholder with add/delete controls.
 */
const PhotoGallery: React.FC<PhotoGalleryProps> = ({ item }) => {
  const { pickPhoto, takePhoto, useStockImage, deletePhoto, isUploading } = useCollectionPhotos(item);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const photos = item.photos?.length ? item.photos : [];
  const hasPhotos = photos.length > 0;

  const showAddOptions = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Use Stock Image'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) takePhoto();
          else if (buttonIndex === 2) pickPhoto();
          else if (buttonIndex === 3) useStockImage();
        },
      );
    } else {
      Alert.alert('Add Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickPhoto },
        { text: 'Use Stock Image', onPress: useStockImage },
      ]);
    }
  }, [takePhoto, pickPhoto, useStockImage]);

  const handleDelete = useCallback((url: string) => {
    Alert.alert('Delete Photo', 'Remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePhoto(url) },
    ]);
  }, [deletePhoto]);

  const renderPhoto = ({ item: photoUrl }: { item: string }) => (
    <Pressable className="relative mr-2" onPress={() => setPreviewUrl(photoUrl)}>
      <Image
        source={{ uri: photoUrl }}
        className="rounded-lg"
        style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
        resizeMode="cover"
      />
      <Pressable
        className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60"
        onPress={() => handleDelete(photoUrl)}
      >
        <Text className="text-xs font-bold text-white">X</Text>
      </Pressable>
    </Pressable>
  );

  const addButton = (
    <Pressable
      className="mr-2 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30"
      style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
      onPress={showAddOptions}
      disabled={isUploading}
    >
      <Text className="text-2xl text-muted-foreground">{isUploading ? '...' : '+'}</Text>
      <Text className="mt-1 text-xs text-muted-foreground">Add Photo</Text>
    </Pressable>
  );

  return (
    <View>
      {hasPhotos ? (
        <FlatList
          horizontal
          data={photos}
          keyExtractor={(url, i) => `${url}-${i}`}
          renderItem={renderPhoto}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={addButton}
          contentContainerStyle={{ paddingRight: 8 }}
        />
      ) : (
        <View className="flex-row">
          {/* Stock image placeholder */}
          <Pressable
            className="relative mr-2"
            onPress={showAddOptions}
          >
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className="rounded-lg opacity-60"
                style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
                resizeMode="cover"
              />
            ) : (
              <View
                className="items-center justify-center rounded-lg bg-muted"
                style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
              >
                <Text className="text-2xl text-muted-foreground">?</Text>
              </View>
            )}
            <View className="absolute inset-0 items-center justify-center">
              <View className="rounded-lg bg-black/50 px-3 py-1.5">
                <Text className="text-xs font-medium text-white">Add Photos</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* Full-screen preview modal */}
      <Modal visible={previewUrl !== null} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/90"
          onPress={() => setPreviewUrl(null)}
        >
          {previewUrl ? (
            <Image
              source={{ uri: previewUrl }}
              className="h-[80%] w-[90%]"
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
};

export default PhotoGallery;
