import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useColors } from "@/hooks/useColors";

function TypingIndicator() {
  const colors = useColors();
  return (
    <View style={[styles.bubbleContainer, styles.assistantContainer]}>
      <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
        <Ionicons name="sparkles" size={12} color="#fff" />
      </View>
      <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.typingText, { color: colors.mutedForeground }]}>يكتب...</Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, isTyping, sendMessage, clearChat } = useChat();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text);
  };

  const renderMessage = ({ item }: { item: (typeof messages)[0] }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.assistantContainer]}>
        {!isUser && (
          <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={12} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.primary }]
              : [styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text style={[styles.bubbleText, { color: isUser ? "#fff" : colors.foreground }]}>{item.content}</Text>
        </View>
        {isUser && (
          <View style={[styles.avatarSmall, { backgroundColor: colors.accent }]}>
            <Feather name="user" size={12} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const SUGGESTIONS = ["أشعر بالقلق", "أحتاج للمساعدة", "كيف أتحكم في مشاعري؟", "حجز جلسة"];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerRight}>
          <Image
            source={require("@/assets/images/logo_square.jpg")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>كليم AI</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>مرحباً، {user?.name?.split(" ")[0] || "ضيف"}</Text>
          </View>
        </View>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/notifications")}
          >
            <Feather name="bell" size={22} color={colors.foreground} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: "#e53e3e" }]}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={clearChat} style={styles.headerBtn}>
            <Feather name="trash-2" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        keyExtractor={(item) => item.id}
        inverted
        renderItem={renderMessage}
        contentContainerStyle={[styles.messagesList, { paddingBottom: 12 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={isTyping ? <TypingIndicator /> : null}
        keyboardShouldPersistTaps="handled"
        scrollEnabled
      />

      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestionsLabel, { color: colors.mutedForeground }]}>اقتراحات:</Text>
          <View style={styles.suggestionsRow}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.suggestionChip, { backgroundColor: colors.secondary, borderColor: colors.primary + "30", borderRadius: colors.radius }]}
                onPress={() => { setInput(s); }}
              >
                <Text style={[styles.suggestionText, { color: colors.primary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding + (Platform.OS !== "web" ? insets.bottom + 4 : 0),
          },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
          value={input}
          onChangeText={setInput}
          placeholder="اكتب رسالتك..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={500}
          textAlign="right"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
          onPress={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <Feather name="send" size={18} color={input.trim() ? "#fff" : colors.mutedForeground} style={{ transform: [{ scaleX: -1 }] }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    left: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  headerSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  messagesList: { paddingHorizontal: 16, paddingTop: 12 },
  bubbleContainer: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end", gap: 8 },
  userContainer: { justifyContent: "flex-start" },
  assistantContainer: { justifyContent: "flex-end" },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  userBubble: { borderBottomLeftRadius: 4 },
  assistantBubble: { borderWidth: 1, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, textAlign: "right" },
  typingBubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderWidth: 1 },
  typingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  suggestions: { paddingHorizontal: 16, paddingBottom: 12 },
  suggestionsLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8, textAlign: "right" },
  suggestionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  suggestionChip: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1 },
  suggestionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    textAlign: "right",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
