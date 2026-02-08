import React, { useState } from 'react';
import { View, Text, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import useEmailAuth from '../../hooks/useEmailAuth/useEmailAuth';
import useOAuth from '../../hooks/useOAuth/useOAuth';
import { LoginFormSchema, type LoginForm } from '../../schemas';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login } = useEmailAuth();
  const { signIn } = useOAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});

  const handleEmailLogin = () => {
    const result = LoginFormSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginForm, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginForm;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    login.mutate(result.data, {
      onError: (err) => Alert.alert('Login Failed', err.message),
    });
  };

  const handleOAuth = (provider: 'google' | 'apple') => {
    signIn.mutate(provider, {
      onError: (err) => Alert.alert('Sign In Failed', err.message),
    });
  };

  const isLoading = login.isPending || signIn.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-12 items-center">
          <Text className="text-4xl font-bold text-foreground">TCG Trade Hub</Text>
          <Text className="mt-2 text-lg text-muted-foreground">
            Trade cards locally
          </Text>
        </View>

        <View className="gap-3">
          <Button
            variant="outline"
            size="lg"
            onPress={() => handleOAuth('google')}
            disabled={isLoading}
          >
            <Text className="text-base font-medium text-foreground">Continue with Google</Text>
          </Button>

          {Platform.OS === 'ios' && (
            <Button
              variant="outline"
              size="lg"
              onPress={() => handleOAuth('apple')}
              disabled={isLoading}
            >
              <Text className="text-base font-medium text-foreground">Continue with Apple</Text>
            </Button>
          )}
        </View>

        <View className="my-6 flex-row items-center">
          <View className="flex-1 border-b border-border" />
          <Text className="mx-4 text-sm text-muted-foreground">or</Text>
          <View className="flex-1 border-b border-border" />
        </View>

        <View className="gap-4">
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Button size="lg" onPress={handleEmailLogin} disabled={isLoading}>
            <Text className="text-base font-semibold text-primary-foreground">Sign In</Text>
          </Button>
        </View>

        <Pressable onPress={() => router.push('/(auth)/register')} className="mt-6 items-center">
          <Text className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Text className="font-semibold text-primary">Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
