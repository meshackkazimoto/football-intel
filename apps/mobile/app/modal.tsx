import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth/auth.service';
import { Colors } from '@/constants/theme';

export default function LoginModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const { setUser, isAuthenticated, user, logout } = useAuth();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
      router.back();
    },
    onError: (err: { response?: { data?: { error?: string } }; message?: string }) => {
      const msg = err.response?.data?.error ?? err.message ?? 'Login failed';
      Alert.alert('Login failed', msg);
    },
  });

  const handleSubmit = () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    loginMutation.mutate({ email: email.trim(), password });
  };

  if (isAuthenticated && user) {
    return (
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Account
            </ThemedText>
            <ThemedText style={styles.email}>{user.email}</ThemedText>
            <Pressable
              onPress={() => logout().then(() => router.back())}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <ThemedText style={[styles.buttonText, { color: Colors.light.primaryForeground }]}>
                Log out
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Login
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to sync preferences across devices.
          </ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={text ? `${text}80` : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, { borderColor: border, backgroundColor: card, color: text }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={text ? `${text}80` : undefined}
            secureTextEntry
            style={[styles.input, { borderColor: border, backgroundColor: card, color: text }]}
          />
          <Pressable
            onPress={handleSubmit}
            disabled={loginMutation.isPending}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: primary, opacity: loginMutation.isPending || pressed ? 0.9 : 1 },
            ]}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color={Colors.light.primaryForeground} />
            ) : (
              <ThemedText style={[styles.buttonText, { color: Colors.light.primaryForeground }]}>
                Sign in
              </ThemedText>
            )}
          </Pressable>
          <Link href="/" dismissTo asChild>
            <Pressable style={styles.skip}>
              <ThemedText type="link">Continue without account</ThemedText>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    gap: 20,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.85,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 24,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  skip: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
