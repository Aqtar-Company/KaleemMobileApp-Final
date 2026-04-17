import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useReservations } from "@/hooks/useReservations";
import { useAuth } from "@/context/AuthContext";
import { Card, Badge } from "@/components/UI";
import { RatingModal } from "@/components/RatingModal";
import type { Reservation } from "@/services/reservations";

const SESSION_TYPES: Record<string, { icon: keyof typeof Feather.glyphMap; label: string }> = {
  video: { icon: "video", label: "فيديو" },
  voice: { icon: "phone", label: "صوتي" },
  audio: { icon: "phone", label: "صوتي" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: "قادمة", color: "#007A68", bgColor: "#E0F4EF" },
  upcoming: { label: "قادمة", color: "#007A68", bgColor: "#E0F4EF" },
  pending: { label: "معلقة", color: "#d4a853", bgColor: "#fffbeb" },
  active: { label: "جارية", color: "#007A68", bgColor: "#E0F4EF" },
  completed: { label: "مكتملة", color: "#5A8078", bgColor: "#EBF4F9" },
  cancelled: { label: "ملغاة", color: "#e53e3e", bgColor: "#fee2e2" },
  missed: { label: "فائتة", color: "#d4a853", bgColor: "#fffbeb" },
};

function SessionCard({ session, onRate }: { session: Reservation; onRate: (s: Reservation) => void }) {
  const colors = useColors();
  const statusConf = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.scheduled;
  const typeConf = SESSION_TYPES[session.type] ?? SESSION_TYPES.video;
  const initial = session.consultantName.charAt(0);

  return (
    <Card style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionConsultant}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.sessionConsultantInfo}>
            <Text style={[styles.consultantName, { color: colors.foreground }]}>{session.consultantName}</Text>
            <Text style={[styles.consultantTitle, { color: colors.mutedForeground }]}>
              {session.type === "video" ? "جلسة فيديو" : "جلسة صوتية"}
            </Text>
          </View>
        </View>
        <Badge label={statusConf.label} color={statusConf.color} bgColor={statusConf.bgColor} />
      </View>

      <View style={[styles.sessionDetails, { backgroundColor: colors.surfaceAlt, borderRadius: colors.radius - 4 }]}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Feather name="dollar-sign" size={14} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.foreground }]}>${session.price}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name={typeConf.icon} size={14} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.foreground }]}>{typeConf.label}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.foreground }]}>{session.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.foreground }]}>{session.date}</Text>
          </View>
        </View>
      </View>

      {(session.status === "scheduled" || session.status === "upcoming") && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn, { borderColor: colors.destructive }]}
          >
            <Text style={[styles.actionBtnText, { color: colors.destructive }]}>إلغاء</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Feather name="video" size={14} color="#fff" />
            <Text style={[styles.actionBtnText, { color: "#fff" }]}>دخول الجلسة</Text>
          </TouchableOpacity>
        </View>
      )}

      {session.status === "completed" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rateBtn, { borderColor: "#d4a853" }]}
            onPress={() => onRate(session)}
          >
            <Feather name="star" size={14} color="#d4a853" />
            <Text style={[styles.actionBtnText, { color: "#d4a853" }]}>تقييم</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 2 }]}
            onPress={() =>
              router.push({ pathname: "/sessions/report/[id]", params: { id: session.id } })
            }
          >
            <Feather name="file-text" size={14} color="#fff" />
            <Text style={[styles.actionBtnText, { color: "#fff" }]}>عرض التقرير</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

export default function SessionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { reservations, loading, error, refetch } = useReservations();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "written">("upcoming");
  const [ratingSession, setRatingSession] = useState<Reservation | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const upcoming = reservations.filter(
    (s) => s.status === "scheduled" || s.status === "upcoming" || s.status === "pending"
  );
  const past = reservations.filter(
    (s) => s.status === "completed" || s.status === "cancelled" || s.status === "missed"
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRate = (session: Reservation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRatingSession(session);
  };

  const handleRatingSubmit = (_rating: number, _comment: string) => {
    setRatingSession(null);
    Alert.alert("شكراً على تقييمك!", `تم إرسال تقييمك بنجاح.`);
  };

  const currentList = activeTab === "upcoming" ? upcoming : past;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>جلساتي</Text>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/consultants");
          }}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.bookBtnText}>احجز جلسة</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { key: "upcoming", label: `القادمة (${upcoming.length})` },
          { key: "past", label: "السابقة" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && [styles.activeTab, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab(tab.key as "upcoming" | "past")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.tab, { borderBottomWidth: 2, borderBottomColor: "transparent" }]}
          onPress={() => router.push("/consultations")}
        >
          <View style={styles.consultTab}>
            <Feather name="edit-3" size={13} color={colors.mutedForeground} />
            <Text style={[styles.tabText, { color: colors.mutedForeground }]}>كتابية</Text>
          </View>
        </TouchableOpacity>
      </View>

      {!user ? (
        <View style={styles.center}>
          <Feather name="lock" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>سجّل دخولك أولاً</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            يجب تسجيل الدخول لعرض جلساتك
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.emptyBtnText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      ) : loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>جاري التحميل...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>تعذّر التحميل</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            تحقق من اتصالك بالإنترنت وحاول مجدداً
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Platform.OS === "web" ? 120 : 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {currentList.length > 0 ? (
            currentList.map((s) => (
              <SessionCard key={s.id} session={s} onRate={handleRate} />
            ))
          ) : (
            <View style={styles.empty}>
              <Feather
                name={activeTab === "upcoming" ? "calendar" : "clock"}
                size={48}
                color={colors.border}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {activeTab === "upcoming" ? "لا توجد جلسات قادمة" : "لا توجد جلسات سابقة"}
              </Text>
              {activeTab === "upcoming" && (
                <>
                  <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                    احجز جلستك الأولى مع أحد مستشارينا
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                    onPress={() => router.push("/consultants")}
                  >
                    <Text style={styles.emptyBtnText}>تصفح المستشارين</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {ratingSession && (
        <RatingModal
          visible={!!ratingSession}
          consultantName={ratingSession.consultantName}
          onClose={() => setRatingSession(null)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  bookBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  sessionCard: { marginBottom: 14, padding: 16 },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionConsultant: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sessionConsultantInfo: { flex: 1 },
  consultantName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "right" },
  consultantTitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "right" },
  sessionDetails: { padding: 12, marginBottom: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-around" },
  detailItem: { alignItems: "center", gap: 4 },
  detailText: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  cancelBtn: { backgroundColor: "transparent", borderWidth: 1.5 },
  rateBtn: { backgroundColor: "transparent", borderWidth: 1.5 },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyBtn: { paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  consultTab: { flexDirection: "row", alignItems: "center", gap: 4 },
});
