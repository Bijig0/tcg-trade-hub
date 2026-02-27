import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Text } from 'react-native';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: (args) => <Button {...args}>Default Button</Button>,
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  render: (args) => <Button {...args}>Secondary</Button>,
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Button {...args}>
      <Text className="text-sm font-semibold text-destructive-foreground">Delete</Text>
    </Button>
  ),
};

export const Outline: Story = {
  args: { variant: 'outline' },
  render: (args) => <Button {...args}>Outline</Button>,
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => <Button {...args}>Ghost</Button>,
};

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => <Button {...args}>Small</Button>,
};

export const Large: Story = {
  args: { size: 'lg' },
  render: (args) => <Button {...args}>Large</Button>,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Button {...args}>Disabled</Button>,
};
