import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { parseCsvCollection } from '@/features/collection';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import Button from '@/components/ui/Button/Button';

type ImportOption = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  comingSoon: boolean;
};

const IMPORT_OPTIONS: ImportOption[] = [
  {
    id: 'csv',
    label: 'Import from CSV',
    description: 'Upload a CSV file exported from your collection app',
    emoji: '\uD83D\uDCC4',
    comingSoon: false,
  },
  {
    id: 'tcgplayer',
    label: 'Connect TCGPlayer',
    description: 'Sync your TCGPlayer collection automatically',
    emoji: '\uD83C\uDFAE',
    comingSoon: true,
  },
  {
    id: 'moxfield',
    label: 'Connect Moxfield',
    description: 'Import decks and collection from Moxfield',
    emoji: '\uD83E\uDDD9',
    comingSoon: true,
  },
];

const CollectionImportOnboarding = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const handleSkip = () => {
    router.replace('/(tabs)/(home)');
  };

  const handleCsvImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setIsImporting(true);

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const csvText = await response.text();

      const items = parseCsvCollection(csvText);

      if (items.length === 0) {
        Alert.alert('No items found', 'The CSV file did not contain any valid card entries.');
        setIsImporting(false);
        return;
      }

      if (!user) throw new Error('Not authenticated');

      const rows = items.map((item) => ({
        user_id: user.id,
        tcg: 'pokemon' as const,
        external_id: '',
        card_name: item.card_name,
        set_name: item.set_name,
        set_code: '',
        card_number: item.card_number,
        image_url: '',
        condition: item.condition,
        quantity: item.quantity,
      }));

      const { error } = await supabase.from('collection_items').insert(rows);

      if (error) throw error;

      setImportedCount(items.length);
      Alert.alert(
        'Import successful',
        `${items.length} cards imported to your collection.`,
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)/(home)') }],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      Alert.alert('Import Error', message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleOptionPress = (option: ImportOption) => {
    if (option.comingSoon) {
      Alert.alert('Coming Soon!', `${option.label} integration is not yet available.`);
      return;
    }

    if (option.id === 'csv') {
      handleCsvImport();
    }
  };

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground">Import your collection</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Bring your existing card collection into TCG Trade Hub, or skip and add cards later.
        </Text>
      </View>

      <View className="gap-3">
        {IMPORT_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => handleOptionPress(option)}
            disabled={isImporting}
            className="flex-row items-center rounded-xl border border-border bg-card p-4"
          >
            <Text className="text-2xl">{option.emoji}</Text>
            <View className="ml-4 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-semibold text-foreground">
                  {option.label}
                </Text>
                {option.comingSoon && (
                  <View className="rounded-full bg-muted px-2 py-0.5">
                    <Text className="text-xs text-muted-foreground">Soon</Text>
                  </View>
                )}
              </View>
              <Text className="mt-0.5 text-sm text-muted-foreground">
                {option.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {importedCount > 0 && (
        <View className="mt-4 rounded-xl border border-border bg-card p-4">
          <Text className="text-sm text-muted-foreground">
            {importedCount} cards imported successfully
          </Text>
        </View>
      )}

      <View className="mt-auto pb-12">
        <Button
          variant="ghost"
          size="lg"
          onPress={handleSkip}
          disabled={isImporting}
          className="w-full"
        >
          <Text className="text-base font-medium text-muted-foreground">
            {isImporting ? 'Importing...' : 'Skip for now'}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default CollectionImportOnboarding;
