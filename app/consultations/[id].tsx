import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_CONSULTATIONS } from "./index";

export default function ConsultationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const consultation = MOCK_CONSULTATIONS.find((c) => c.id === id);
  const [followUp, setFollowUp] = useState("");
  const [sending, setSending] = useState(false);

  if (!consultation) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: colors.foreground }}>الاستشارة غير موجودة</Text>
      </View>
    );
  }

  const handleSendFollowUp = async () => {
    if (!followUp.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setFollowUp("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("تم الإرسال", "تم إرسال سؤالك للمستشار وسيتم الرد قريباً.");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 16,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={{ width: 36 }} />
        <View style={styles.headerCenter}>
          <View
            style={[styles.headerAvatar, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.headerAvatarText}>
              {consultation.consultantName.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={[styles.headerName, { color: colors.foreground }]}>
              {consultation.consultantName}
            </Text>
            <Text
              style={[styles.headerTitle, { color: colors.mutedForeground }]}
            >
              {consultation.consultantTitle}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.metaBar,
            { backgroundColor: colors.surfaceAlt, borderRadius: colors.radius },
          ]}
        >
          <View style={styles.metaItem}>
            <Feather name="tag" size={14} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.foreground }]}>
              {consultation.serviceTitle}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.foreground }]}>
              {consultation.date}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather
              name={
                consultation.status === "answered"
                  ? "check-circle"
                  : "clock"
              }
              size={14}
              color={
                consultation.status === "answered" ? "#007A68" : "#d4a853"
              }
            />
            <Text
              style={[
                styles.metaText,
                {
                  color:
                    consultation.status === "answered"
                      ? "#007A68"
                      : "#d4a853",
                },
              ]}
            >
              {consultation.status === "answered" ? "مجابة" : "بانتظار الرد"}
            </Text>
          </View>
        </View>

        {/* Question bubble */}
        <View style={styles.messageGroup}>
          <Text
            style={[styles.messageSenderLabel, { color: colors.mutedForeground }]}
          >
            سؤالك
          </Text>
          <View
            style={[
              styles.bubble,
              styles.userBubble,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.bubbleText, { color: "#fff" }]}>
              {consultation.question}
            </Text>
          </View>
        </View>

        {/* Answer bubble */}
        {consultation.answer ? (
          <View style={styles.messageGroup}>
            <Text
              style={[
                styles.messageSenderLabel,
                { color: colors.mutedForeground },
              ]}
            >
              رد {consultation.consultantName}
            </Text>
            <View
              style={[
                styles.bubble,
                styles.answerBubble,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.bubbleText, { color: colors.foreground }]}>
                {consultation.answer}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.bookFollowUp,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  borderColor: colors.primary + "40",
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/consultants/[id]",
                  params: { id: consultation.consultantId },
                })
              }
            >
              <Feather name="video" size={15} color={colors.primary} />
              <Text style={[styles.bookFollowUpText, { color: colors.primary }]}>
                احجز جلسة متابعة مع {consultation.consultantName}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.pendingBox,
              { backgroundColor: "#fffbeb", borderColor: "#d4a853", borderRadius: colors.radius },
            ]}
          >
            <Feather name="clock" size={18} color="#d4a853" />
            <Text style={styles.pendingText}>
              سيتم الرد على استشارتك خلال 24 ساعة
            </Text>
          </View>
        )}

        {/* Follow-up section */}
        {consultation.status === "answered" && (
          <View
            style={[
              styles.followUpSection,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
          >
            <Text
              style={[styles.followUpTitle, { color: colors.foreground }]}
            >
              سؤال متابعة
            </Text>
            <TextInput
              style={[
                styles.followUpInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.foreground,
                  borderRadius: colors.radius - 4,
                },
              ]}
              value={followUp}
              onChangeText={setFollowUp}
              placeholder="اكتب سؤالاً إضافياً..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={500}
              textAlign="right"
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: followUp.trim()
                    ? colors.primary
                    : colors.muted,
                  borderRadius: colors.radius - 4,
                  opacity: sending ? 0.7 : 1,
                },
              ]}
              onPress={handleSendFollowUp}
              disabled={!followUp.trim() || sending}
            >
              <Feather
                name="send"
                size={16}
                color={followUp.trim() ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.sendBtnText,
                  {
                    color: followUp.trim() ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {sending ? "جاري الإرسال..." : "إرسال"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  headerName: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  headerTitle: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  content: { padding: 16, gap: 16 },
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
  },
  metaItem: { alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  messageGroup: { gap: 8 },
  messageSenderLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "right" },
  bubble: { padding: 14, borderRadius: 16, maxWidth: "95%" },
  userBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  answerBubble: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
    textAlign: "right",
  },
  bookFollowUp: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    gap: 8,
    alignSelf: "flex-end",
  },
  bookFollowUpText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pendingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    justifyContent: "flex-end",
  },
  pendingText: {
    color: "#92710a",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  followUpSection: { padding: 14, borderWidth: 1, gap: 12 },
  followUpTitle: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  followUpInput: {
    borderWidth: 1.5,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 90,
    textAlign: "right",
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  sendBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
