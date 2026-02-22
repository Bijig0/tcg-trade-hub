import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ClipboardPaste, Trash2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import parseCsvCollection from '../../utils/parseCsvCollection/parseCsvCollection';
import useAddCollectionItem from '../../hooks/useAddCollectionItem/useAddCollectionItem';
import Button from '@/components/ui/Button/Button';

const EXAMPLE_CSV = `name,set,number,condition,quantity
Charizard VMAX,Darkness Ablaze,020/189,nm,1
Pikachu VMAX,Vivid Voltage,044/185,lp,2`;

const CsvImportScreen: React.FC = () => {
  const router = useRouter();
  const addItem = useAddCollectionItem();
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setCsvText(text);
      }
    } catch {
      Alert.alert('Error', 'Failed to read from clipboard.');
    }
  }, []);

  const handleClear = useCallback(() => {
    setCsvText('');
  }, []);

  const handleImport = useCallback(() => {
    const trimmed = csvText.trim();
    if (!trimmed) {
      Alert.alert('Empty', 'Please paste your CSV data first.');
      return;
    }

    const parsed = parseCsvCollection(trimmed);

    if (parsed.length === 0) {
      Alert.alert('Import Failed', 'No valid card data found. Make sure your CSV has a header row with at least a "name" column.');
      return;
    }

    Alert.alert(
      'Import Collection',
      `Found ${parsed.length} card${parsed.length > 1 ? 's' : ''}. Import as Pokemon cards?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            setIsImporting(true);
            try {
              for (const card of parsed) {
                addItem.mutate({
                  tcg: 'pokemon',
                  external_id: `csv-${card.card_name}-${card.set_name}`,
                  card_name: card.card_name,
                  set_name: card.set_name,
                  set_code: '',
                  card_number: card.card_number,
                  image_url: '',
                  condition: card.condition,
                  quantity: card.quantity,
                  is_wishlist: false,
                  is_sealed: false,
                });
              }
              Alert.alert('Success', `Imported ${parsed.length} card${parsed.length > 1 ? 's' : ''}.`, [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert('Error', 'Failed to import some cards.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ],
    );
  }, [csvText, addItem, router]);

  const lineCount = csvText.trim() ? csvText.trim().split('\n').length : 0;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 px-4 pt-14">
        {/* Header */}
        <View className="mb-4 flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
            <ArrowLeft size={24} color="#fff" />
          </Pressable>
          <Text className="text-xl font-bold text-foreground">Import CSV</Text>
        </View>

        {/* Instructions */}
        <View className="mb-3 rounded-xl bg-card p-3">
          <Text className="mb-1 text-sm font-medium text-foreground">
            Paste your CSV data below
          </Text>
          <Text className="text-xs text-muted-foreground">
            Supported columns: name (required), set, number, condition, quantity, grading_company, grading_score, price
          </Text>
        </View>

        {/* Action buttons */}
        <View className="mb-3 flex-row gap-2">
          <Pressable
            onPress={handlePasteFromClipboard}
            className="flex-row items-center rounded-lg bg-card px-3 py-2"
          >
            <ClipboardPaste size={14} color="#22d3ee" />
            <Text className="ml-1.5 text-sm text-cyan-400">Paste from Clipboard</Text>
          </Pressable>
          {csvText.length > 0 && (
            <Pressable
              onPress={handleClear}
              className="flex-row items-center rounded-lg bg-card px-3 py-2"
            >
              <Trash2 size={14} color="#f87171" />
              <Text className="ml-1.5 text-sm text-red-400">Clear</Text>
            </Pressable>
          )}
        </View>

        {/* CSV Text Input */}
        <ScrollView className="mb-3 flex-1 rounded-xl border border-input bg-card" keyboardShouldPersistTaps="always">
          <TextInput
            value={csvText}
            onChangeText={setCsvText}
            placeholder={EXAMPLE_CSV}
            placeholderTextColor="#52525b"
            multiline
            textAlignVertical="top"
            className="min-h-[200px] p-3 font-mono text-sm text-foreground"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
        </ScrollView>

        {/* Footer */}
        <View className="mb-6">
          {lineCount > 0 && (
            <Text className="mb-2 text-center text-xs text-muted-foreground">
              {lineCount} line{lineCount !== 1 ? 's' : ''} (including header)
            </Text>
          )}
          <Button
            variant="default"
            size="lg"
            onPress={handleImport}
            disabled={!csvText.trim() || isImporting}
          >
            <Text className="text-sm font-semibold text-primary-foreground">
              {isImporting ? 'Importing...' : 'Import Cards'}
            </Text>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CsvImportScreen;
