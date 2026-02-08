import { Stack } from 'expo-router';

const OnboardingLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    />
  );
};

export default OnboardingLayout;
