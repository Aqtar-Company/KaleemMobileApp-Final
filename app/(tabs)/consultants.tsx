import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Screen from '@/components/ui/Screen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { consultants as consultantsApi } from '@/lib/api';
import type { Consultant } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

export default function ConsultantsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Consultant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const t = setTimeout(() => {
      setError(null);
      consultantsApi
        .list({ search: query || undefined })
        .then((res) => setItems(res.items))
        .catch((e) => {
          if (e?.name !== 'AbortError') setError(e?.message ?? 'Failed to load');
        });
    }, 300);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [query]);

  return (
    <Screen padded={false}>
      <View style={[styles.searchWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
        <FontAwesome name="search" size={16} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search consultants"
          placeholderTextColor={c.textMuted}
          style={[styles.searchInput, { color: c.text }]}
        />
      </View>

      {error ? (
        <Text style={{ color: c.danger, padding: 16 }}>{error}</Text>
      ) : items === null ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={c.tint} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>
              No consultants found
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/consultant/${item.id}`)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Avatar url={item.avatarUrl} name={item.name} size={52} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={{ color: c.textMuted }} numberOfLines={1}>
                  {item.specialty}
                </Text>
                <View style={styles.metaRow}>
                  {typeof item.rating === 'number' ? (
                    <View style={styles.meta}>
                      <FontAwesome name="star" size={12} color={c.accent} />
                      <Text style={[styles.metaText, { color: c.textMuted }]}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                  ) : null}
                  {item.online ? (
                    <View style={styles.meta}>
                      <View style={[styles.dot, { backgroundColor: c.success }]} />
                      <Text style={[styles.metaText, { color: c.success }]}>Online</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <FontAwesome name="angle-right" size={20} color={c.textMuted} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  row: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
