import type { Preview } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import '../src/global.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <View className="flex-1 bg-background p-4">
        <Story />
      </View>
    ),
  ],
};

export default preview;
