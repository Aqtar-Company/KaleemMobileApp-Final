import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { chats as chatsApi, consultants as consultantsApi } from '@/lib/api';
import type { Consultant } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

export default function ConsultantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [item, setItem] = useState<Consultant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!id) return;
    consultantsApi
      .get(id)
      .then(setItem)
      .catch((e) => setError(e?.message ?? 'Failed to load'));
  }, [id]);

  async function onStartChat() {
    if (!id) return;
    setOpening(true);
    try {
      const chat = await chatsApi.open(id);
      router.replace(`/chat/${chat.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Could not start chat');
    } finally {
      setOpening(false);
    }
  }

  if (!item) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Consultant' }} />
        {error ? (
          <Text style={{ color: c.danger }}>{error}</Text>
        ) : (
          <ActivityIndicator color={c.tint} />
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: item.name }} />
      <View style={[styles.header, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Avatar url={item.avatarUrl} name={item.name} size={96} />
        <Text style={[styles.name, { color: c.text }]}>{item.name}</Text>
        <Text style={{ color: c.textMuted }}>{item.specialty}</Text>

        <View style={styles.metaRow}>
          {typeof item.rating === 'number' ? (
            <View style={styles.meta}>
              <FontAwesome name="star" size={14} color={c.accent} />
              <Text style={{ color: c.text, marginLeft: 4 }}>
                {item.rating.toFixed(1)}
                {item.reviewsCount ? (
                  <Text style={{ color: c.textMuted }}> ({item.reviewsCount})</Text>
                ) : null}
              </Text>
            </View>
          ) : null}
          {typeof item.pricePerHour === 'number' ? (
            <View style={styles.meta}>
              <FontAwesome name="money" size={14} color={c.tint} />
              <Text style={{ color: c.text, marginLeft: 4 }}>
                ${item.pricePerHour}/hr
              </Text>
            </View>
          ) : null}
          {item.online ? (
            <View style={styles.meta}>
              <View style={[styles.dot, { backgroundColor: c.success }]} />
              <Text style={{ color: c.success }}>Online</Text>
            </View>
          ) : null}
        </View>
      </View>

      {item.bio ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>About</Text>
          <Text style={{ color: c.textMuted, lineHeight: 20 }}>{item.bio}</Text>
        </View>
      ) : null}

      {item.languages && item.languages.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Languages</Text>
          <Text style={{ color: c.textMuted }}>{item.languages.join(', ')}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 24 }}>
        <Button title="Start chat" onPress={onStartChat} loading={opening} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  name: { fontSize: 22, fontWeight: '700', marginTop: 10 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
});
