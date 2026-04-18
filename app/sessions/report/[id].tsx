import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getReservationsApi, type Reservation } from "@/services/reservations";

export default function SessionReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const list = await getReservationsApi();
      const match = list.find((r) => r.id === String(id)) ?? null;
      setReservation(match);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل الجلسة");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !reservation) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          },
        ]}
      >
        <Feather name="file-text" size={48} color={colors.border} />
        <Text style={[styles.noReportTitle, { color: colors.foreground }]}>
          {error ? "تعذر التحميل" : "الجلسة غير متاحة"}
        </Text>
        {error && <Text style={[styles.noReportSub, { color: colors.mutedForeground }]}>{error}</Text>}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>تقرير الجلسة</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 100 : 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.sessionInfo,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={styles.sessionInfoRow}>
            <View style={[styles.consultantAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.consultantAvatarText}>
                {reservation.consultantName.charAt(0)}
              </Text>
            </View>
            <View style={styles.sessionInfoText}>
              <Text style={[styles.sessionConsultantName, { color: colors.foreground }]}>
                {reservation.consultantName}
              </Text>
              <Text style={[styles.sessionConsultantTitle, { color: colors.mutedForeground }]}>
                {reservation.type === "video" ? "جلسة مرئية" : "جلسة صوتية"}
              </Text>
            </View>
          </View>
          <View style={[styles.sessionMeta, { borderTopColor: colors.border }]}>
            <View style={styles.sessionMetaItem}>
              <Feather name="calendar" size={13} color={colors.primary} />
              <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>
                {reservation.date}
              </Text>
            </View>
            <View style={styles.sessionMetaItem}>
              <Feather name="clock" size={13} color={colors.primary} />
              <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>
                {reservation.time}
              </Text>
            </View>
            <View style={styles.sessionMetaItem}>
              <Feather name="check-circle" size={13} color={colors.primary} />
              <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>
                {labelForStatus(reservation.status)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.pendingCard,
            {
              backgroundColor: colors.primary + "10",
              borderColor: colors.primary + "30",
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={[styles.pendingIcon, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="file-text" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.pendingTitle, { color: colors.foreground }]}>
            التقرير قيد التجهيز
          </Text>
          <Text style={[styles.pendingBody, { color: colors.mutedForeground }]}>
            سيقوم المستشار بإعداد تقرير شامل لجلستك خلال {" "}
            {reservation.status === "completed" ? "الأيام القادمة" : "نهاية الجلسة"}. {" "}
            ستصلك الإشعار بمجرد توفره.
          </Text>
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          هذا التقرير سري ولا يُشارك إلا بموافقتك.
        </Text>
      </ScrollView>
    </View>
  );
}

function labelForStatus(status: Reservation["status"]): string {
  switch (status) {
    case "scheduled":
      return "مجدولة";
    case "completed":
      return "مكتملة";
    case "cancelled":
      return "ملغاة";
    case "pending":
    default:
      return "قيد الانتظار";
  }
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
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  content: { padding: 16, gap: 14 },
  sessionInfo: { padding: 14, borderWidth: 1 },
  sessionInfoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  consultantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  consultantAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  sessionInfoText: { flex: 1, alignItems: "flex-end" },
  sessionConsultantName: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sessionConsultantTitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  sessionMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sessionMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  sessionMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  pendingCard: { padding: 18, borderWidth: 1, alignItems: "center", gap: 10 },
  pendingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  pendingTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  pendingBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  noReportTitle: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  noReportSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 24 },
  backLink: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
