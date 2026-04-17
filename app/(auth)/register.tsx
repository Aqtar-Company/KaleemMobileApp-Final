import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Screen from '@/components/ui/Screen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message ?? 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={{ marginTop: 32 }}>
          <Text style={[styles.title, { color: c.text }]}>Create account</Text>
          <Text style={{ color: c.textMuted, marginTop: 6 }}>
            Join Kaleem and start your first consultation.
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Input label="Full name" value={name} onChangeText={setName} />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? (
            <Text style={{ color: c.danger, marginBottom: 10 }}>{error}</Text>
          ) : null}
          <Button title="Create account" onPress={onSubmit} loading={loading} />
        </View>

        <View style={styles.footer}>
          <Text style={{ color: c.textMuted }}>Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text style={{ color: c.tint, fontWeight: '600' }}>Sign in</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700' },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
