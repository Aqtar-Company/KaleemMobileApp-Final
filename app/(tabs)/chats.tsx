import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Screen from '@/components/ui/Screen';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { chats as chatsApi } from '@/lib/api';
import type { ChatSummary } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

export default function ChatsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [items, setItems] = useState<ChatSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await chatsApi.list();
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load chats');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (items === null && !error) {
    return (
      <Screen>
        <ActivityIndicator color={c.tint} style={{ marginTop: 24 }} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={items ?? []}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.tint} />
        }
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>
            {error ?? 'No chats yet. Start one from a consultant profile.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/chat/${item.id}`)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Avatar url={item.consultantAvatarUrl} name={item.consultantName} size={48} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.topRow}>
                <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                  {item.consultantName}
                </Text>
                {item.lastMessageAt ? (
                  <Text style={{ color: c.textMuted, fontSize: 12 }}>
                    {formatTime(item.lastMessageAt)}
                  </Text>
                ) : null}
              </View>
              <Text style={{ color: c.textMuted, marginTop: 2 }} numberOfLines={1}>
                {item.lastMessage ?? 'No messages yet'}
              </Text>
            </View>
            {item.unreadCount ? (
              <View style={[styles.badge, { backgroundColor: c.tint }]}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString();
}

const styles = StyleSheet.create({
  row: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
