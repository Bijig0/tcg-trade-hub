import React, { useState } from 'react';
import { View, Text, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import useEmailAuth from '../../hooks/useEmailAuth/useEmailAuth';
import { RegisterFormSchema, type RegisterForm } from '../../schemas';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { register } = useEmailAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});

  const handleRegister = () => {
    const result = RegisterFormSchema.safeParse({ email, password, displayName });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterForm, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterForm;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    register.mutate(result.data, {
      onSuccess: () => Alert.alert('Check your email', 'We sent you a confirmation link.'),
      onError: (err) => Alert.alert('Registration Failed', err.message),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground">Create Account</Text>
          <Text className="mt-2 text-base text-muted-foreground">
            Join TCG Trade Hub to start trading
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Display Name"
            placeholder="Your trader name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            error={errors.displayName}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Button size="lg" onPress={handleRegister} disabled={register.isPending}>
            <Text className="text-base font-semibold text-primary-foreground">Create Account</Text>
          </Button>
        </View>

        <Pressable onPress={() => router.back()} className="mt-6 items-center">
          <Text className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Text className="font-semibold text-primary">Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
