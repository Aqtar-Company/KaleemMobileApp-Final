import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { chats as chatsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Message } from '@/lib/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const res = await chatsApi.messages(id, { limit: 50 });
      const ordered = [...res.items].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
      );
      setMessages(
        ordered.map((m) => ({ ...m, mine: m.senderId === user?.id }))
      );
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load messages');
    }
  }, [id, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (messages && messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [messages?.length]);

  async function onSend() {
    const text = input.trim();
    if (!id || !text) return;
    setSending(true);
    setInput('');
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      chatId: id,
      senderId: user?.id ?? 'me',
      content: text,
      createdAt: new Date().toISOString(),
      mine: true,
    };
    setMessages((prev) => [...(prev ?? []), optimistic]);
    try {
      const saved = await chatsApi.send(id, text);
      setMessages((prev) =>
        (prev ?? []).map((m) =>
          m.id === tempId ? { ...saved, mine: true } : m
        )
      );
    } catch (e: any) {
      setMessages((prev) => (prev ?? []).filter((m) => m.id !== tempId));
      setInput(text);
      setError(e?.message ?? 'Could not send');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={{ title: 'Chat' }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        {messages === null ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator color={c.tint} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={
              <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>
                Say hello.
              </Text>
            }
            renderItem={({ item }) => <Bubble msg={item} />}
          />
        )}

        {error ? (
          <Text style={{ color: c.danger, paddingHorizontal: 12 }}>{error}</Text>
        ) : null}

        <View
          style={[
            styles.inputBar,
            { backgroundColor: c.surface, borderTopColor: c.border },
          ]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor={c.textMuted}
            style={[
              styles.input,
              {
                color: c.text,
                backgroundColor: c.background,
                borderColor: c.border,
              },
            ]}
            multiline
          />
          <Pressable
            onPress={onSend}
            disabled={sending || !input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor: c.tint,
                opacity: !input.trim() ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}>
            <FontAwesome name="send" size={16} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ msg }: { msg: Message }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const mine = !!msg.mine;
  return (
    <View
      style={[
        styles.bubbleRow,
        { justifyContent: mine ? 'flex-end' : 'flex-start' },
      ]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: mine ? c.bubbleMe : c.bubbleThem,
            borderBottomRightRadius: mine ? 4 : 14,
            borderBottomLeftRadius: mine ? 14 : 4,
          },
        ]}>
        <Text style={{ color: mine ? c.bubbleMeText : c.bubbleThemText, fontSize: 15 }}>
          {msg.content}
        </Text>
        <Text
          style={{
            color: mine ? c.bubbleMeText : c.textMuted,
            fontSize: 10,
            marginTop: 4,
            opacity: 0.7,
            textAlign: 'right',
          }}>
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleRow: { flexDirection: 'row', marginVertical: 3 },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
