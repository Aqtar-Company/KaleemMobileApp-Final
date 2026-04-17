import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Avatar from '@/components/ui/Avatar';
import Screen from '@/components/ui/Screen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { consultants as consultantsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Consultant } from '@/lib/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [featured, setFeatured] = useState<Consultant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    consultantsApi
      .featured()
      .then(setFeatured)
      .catch((e) => setError(e?.message ?? 'Failed to load'));
    return () => ac.abort();
  }, []);

  return (
    <Screen scroll padded={false}>
      <View style={[styles.hero, { backgroundColor: c.tint }]}>
        <Text style={styles.heroHello}>Hello, {user?.name?.split(' ')[0] ?? 'there'}</Text>
        <Text style={styles.heroTitle}>How can Kaleem help you today?</Text>
      </View>

      <View style={styles.shortcuts}>
        <Shortcut
          icon="users"
          label="Browse consultants"
          onPress={() => router.push('/(tabs)/consultants')}
        />
        <Shortcut
          icon="comments"
          label="My chats"
          onPress={() => router.push('/(tabs)/chats')}
        />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Featured consultants</Text>
      </View>

      {error ? (
        <Text style={{ color: c.danger, paddingHorizontal: 16 }}>{error}</Text>
      ) : featured === null ? (
        <ActivityIndicator style={{ marginTop: 16 }} color={c.tint} />
      ) : (
        <FlatList
          horizontal
          data={featured}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/consultant/${item.id}`)}
              style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Avatar url={item.avatarUrl} name={item.name} size={56} />
              <Text style={[styles.cardName, { color: c.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={{ color: c.textMuted }} numberOfLines={1}>
                {item.specialty}
              </Text>
              {typeof item.rating === 'number' ? (
                <View style={styles.ratingRow}>
                  <FontAwesome name="star" size={12} color={c.accent} />
                  <Text style={{ color: c.textMuted, marginLeft: 4 }}>
                    {item.rating.toFixed(1)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

function Shortcut({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.shortcut,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <FontAwesome name={icon} size={22} color={c.tint} />
      <Text style={[styles.shortcutLabel, { color: c.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },
  heroHello: { color: '#fff', fontSize: 14, opacity: 0.9 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  shortcuts: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginTop: -16,
  },
  shortcut: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 10,
  },
  shortcutLabel: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  card: {
    width: 160,
    padding: 12,
    marginRight: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardName: { fontSize: 15, fontWeight: '600', marginTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
