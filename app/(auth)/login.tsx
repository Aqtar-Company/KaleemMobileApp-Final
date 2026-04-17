import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Screen from '@/components/ui/Screen';
import Colors from '@/constants/Colors';
import { APP_NAME } from '@/constants/Config';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: c.tint }]}>{APP_NAME}</Text>
          <Text style={[styles.tagline, { color: c.textMuted }]}>
            Talk to trusted consultants, instantly.
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          {error ? (
            <Text style={{ color: c.danger, marginBottom: 10 }}>{error}</Text>
          ) : null}
          <Button title="Sign in" onPress={onSubmit} loading={loading} />
        </View>

        <View style={styles.footer}>
          <Text style={{ color: c.textMuted }}>Don't have an account? </Text>
          <Link href="/(auth)/register">
            <Text style={{ color: c.tint, fontWeight: '600' }}>Create one</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 32, alignItems: 'center' },
  brand: { fontSize: 40, fontWeight: '800', letterSpacing: 1 },
  tagline: { marginTop: 6, fontSize: 14 },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
