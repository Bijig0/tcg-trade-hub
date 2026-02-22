import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { TcgType, SealedProductType } from '@tcg-trade-hub/database';
import useAddSealedProduct from '../../hooks/useAddSealedProduct/useAddSealedProduct';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import { TCG_LABELS, SEALED_PRODUCT_TYPE_LABELS } from '@/config/constants';

const TCG_OPTIONS = Object.entries(TCG_LABELS).map(([value, label]) => ({ value, label }));
const PRODUCT_TYPE_OPTIONS = Object.entries(SEALED_PRODUCT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const AddSealedScreen: React.FC = () => {
  const router = useRouter();
  const addSealed = useAddSealedProduct();

  const [productName, setProductName] = useState('');
  const [tcg, setTcg] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState('');

  const isValid = productName.trim().length > 0 && tcg !== '' && productType !== '';

  const handleAdd = useCallback(() => {
    if (!isValid) return;

    const sealedId = `sealed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const price = purchasePrice ? parseFloat(purchasePrice) : null;

    addSealed.mutate(
      {
        tcg: tcg as TcgType,
        external_id: sealedId,
        card_name: productName.trim(),
        set_name: '',
        set_code: '',
        card_number: '',
        image_url: '',
        condition: 'nm',
        quantity,
        product_type: productType as SealedProductType,
        purchase_price: price && !isNaN(price) ? price : null,
        market_price: null,
        is_wishlist: false,
      },
      { onSuccess: () => router.back() },
    );
  }, [isValid, productName, tcg, productType, quantity, purchasePrice, addSealed, router]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <ScrollView className="flex-1 px-4 pt-6">
      <View className="mb-4 flex-row items-center">
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <Text className="text-sm text-primary">Back</Text>
        </Button>
        <Text className="ml-2 text-xl font-bold text-foreground">Add Sealed Product</Text>
      </View>

      <View className="gap-4">
        <Input
          label="Product Name"
          placeholder="e.g. Obsidian Flames Booster Box"
          value={productName}
          onChangeText={setProductName}
        />

        <Select
          label="TCG"
          value={tcg}
          onValueChange={setTcg}
          options={TCG_OPTIONS}
          placeholder="Select TCG"
        />

        <Select
          label="Product Type"
          value={productType}
          onValueChange={setProductType}
          options={PRODUCT_TYPE_OPTIONS}
          placeholder="Select product type"
        />

        <View>
          <Text className="mb-1.5 text-sm font-medium text-foreground">Quantity</Text>
          <View className="flex-row items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text className="text-foreground">-</Text>
            </Button>
            <Text className="min-w-[32px] text-center text-lg font-semibold text-foreground">
              {quantity}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setQuantity(Math.min(99, quantity + 1))}
            >
              <Text className="text-foreground">+</Text>
            </Button>
          </View>
        </View>

        <Input
          label="Purchase Price (optional)"
          placeholder="0.00"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          keyboardType="decimal-pad"
        />

        <Button
          className="mb-12 mt-2"
          onPress={handleAdd}
          disabled={!isValid || addSealed.isPending}
        >
          Add to Collection
        </Button>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default AddSealedScreen;
