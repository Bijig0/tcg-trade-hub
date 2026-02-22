import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { HelpCircle, ArrowLeftRight, X } from 'lucide-react-native';

/**
 * Banner explaining that all listings accept any offer type.
 * Tapping opens a modal with detailed explanation.
 */
const OfferInfoBanner = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5"
      >
        <ArrowLeftRight size={16} className="text-primary" />
        <Text className="flex-1 text-xs text-muted-foreground">
          Open to offers including items
        </Text>
        <HelpCircle size={16} className="text-muted-foreground" />
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60"
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="mx-6 max-w-sm rounded-2xl bg-card p-5"
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">
                How offers work
              </Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                hitSlop={8}
              >
                <X size={20} className="text-muted-foreground" />
              </Pressable>
            </View>

            <Text className="mb-4 text-sm leading-5 text-muted-foreground">
              All listings can receive any type of offer — cash, items from
              someone's collection, or a mix of both. Setting your listing as
              "Sell" just tells other traders you prefer cash, but they can still
              offer cards they think you might want.{'\n\n'}You'll see all offers
              and can accept, decline, or counter.
            </Text>

            <Pressable
              onPress={() => setIsModalVisible(false)}
              className="items-center rounded-lg bg-primary px-4 py-2.5"
            >
              <Text className="text-sm font-semibold text-primary-foreground">
                Got it
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default OfferInfoBanner;
