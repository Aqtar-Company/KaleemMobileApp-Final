import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useMood } from "@/context/MoodContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useColors } from "@/hooks/useColors";
import { Card, SectionTitle, Badge } from "@/components/UI";
import { SERVICES, type Service } from "@/data/mockData";
import { useConsultants } from "@/hooks/useConsultants";
import { MoodIcon } from "@/components/MoodIcon";

function ServiceCard({ service, onPress }: { service: Service; onPress: () => void }) {
  const colors = useColors();
  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    "heart-pulse": "heart",
    "users": "users",
    "user-check": "user-check",
    "home": "home",
  };
  return (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: service.bgColor, borderRadius: colors.radius * 1.2, borderColor: service.color + "30" }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
        <Feather name={iconMap[service.icon] || "circle"} size={20} color="#fff" />
      </View>
      <Text style={[styles.serviceTitle, { color: service.color }]}>{service.title}</Text>
      <Text style={[styles.serviceSubtitle, { color: colors.mutedForeground }]}>{service.subtitle}</Text>
      <View style={[styles.serviceArrow, { backgroundColor: service.color + "20" }]}>
        <Feather name="arrow-left" size={14} color={service.color} />
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { todayEntry } = useMood();
  const { unreadCount } = useNotifications();
  const { consultants } = useConsultants();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const featuredConsultants = consultants.slice(0, 3);

  const handleServicePress = (serviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/services/[id]", params: { id: serviceId } });
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
      >
        <LinearGradient
          colors={["#007A68", "#004D40"]}
          style={[styles.headerGradient, { paddingTop: topPadding + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>أهلاً،</Text>
              <Text style={styles.userName}>{user?.name || "ضيف"}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons name="notifications" size={22} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => router.push("/schedule")}
              >
                <Ionicons name="calendar" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.walletCard, { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: colors.radius }]}>
            <View style={styles.walletRow}>
              <View>
                <Text style={styles.walletLabel}>رصيد محفظتك</Text>
                <Text style={styles.walletBalance}>${user?.walletBalance || 0}</Text>
              </View>
              <TouchableOpacity
                style={[styles.chargeBtn, { backgroundColor: "#d4a853" }]}
                onPress={() => router.push("/(tabs)/wallet")}
              >
                <Feather name="plus" size={14} color="#fff" />
                <Text style={styles.chargeBtnText}>شحن</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
            <View style={styles.aiRow}>
              <Feather name="message-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.aiLabel}>رسائل كليم AI المتبقية: {user?.aiMessages || 0}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              onPress={() => router.push("/mood")}
              activeOpacity={0.8}
            >
              <View style={styles.quickIcon}>
                {todayEntry ? (
                  <MoodIcon level={todayEntry.mood} size={28} />
                ) : (
                  <Feather name="heart" size={24} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.quickTitle, { color: colors.foreground }]}>
                {todayEntry ? "مزاج اليوم" : "سجّل مزاجك"}
              </Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>
                {todayEntry ? "تم التسجيل" : "لم تسجل بعد"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              onPress={() => router.push("/journal")}
              activeOpacity={0.8}
            >
              <View style={styles.quickIcon}>
                <Feather name="book-open" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.quickTitle, { color: colors.foreground }]}>اليوميات</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>سجّل أفكارك</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              onPress={() => router.push("/schedule")}
              activeOpacity={0.8}
            >
              <View style={styles.quickIcon}>
                <Feather name="calendar" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.quickTitle, { color: colors.foreground }]}>الجدول</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>مواعيدك</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.aiPrompt, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.primary + "30" }]}
            onPress={() => router.replace("/(tabs)")}
            activeOpacity={0.8}
          >
            <View style={[styles.aiIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="sparkles" size={18} color="#fff" />
            </View>
            <View style={styles.aiPromptText}>
              <Text style={[styles.aiPromptTitle, { color: colors.foreground }]}>كليم AI</Text>
              <Text style={[styles.aiPromptSub, { color: colors.mutedForeground }]}>كيف يمكنني مساعدتك اليوم؟</Text>
            </View>
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>

          <SectionTitle title="خدماتنا" />
          <View style={styles.servicesGrid}>
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} onPress={() => handleServicePress(service.id)} />
            ))}
          </View>

          <SectionTitle
            title="مستشارون متاحون"
            action="عرض الكل"
            onAction={() => router.push("/consultants")}
          />
          {featuredConsultants.map((consultant) => (
            <Card
              key={consultant.id}
              style={styles.consultantCard}
              onPress={() => router.push({ pathname: "/consultants/[id]", params: { id: consultant.id } })}
            >
              <View style={styles.consultantRow}>
                <View style={[styles.consultantAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.consultantInitial}>{consultant.name.charAt(0)}</Text>
                </View>
                <View style={styles.consultantInfo}>
                  <Text style={[styles.consultantName, { color: colors.foreground }]}>{consultant.name}</Text>
                  <Text style={[styles.consultantTitle, { color: colors.mutedForeground }]}>{consultant.specialty}</Text>
                  <View style={styles.consultantMeta}>
                    <View style={styles.ratingRow}>
                      <Feather name="star" size={12} color="#d4a853" />
                      <Text style={[styles.rating, { color: colors.mutedForeground }]}>{consultant.rating.toFixed(1)}</Text>
                    </View>
                    <Text style={[styles.sessions, { color: colors.mutedForeground }]}>{consultant.experience} سنوات</Text>
                  </View>
                </View>
                <View style={styles.consultantRight}>
                  <Text style={[styles.price, { color: colors.primary }]}>${consultant.price}</Text>
                  <Text style={[styles.perSession, { color: colors.mutedForeground }]}>/ جلسة</Text>
                  {consultant.chatEnabled && <Badge label="متاح" color="#007A68" bgColor="#E0F4EF" />}
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.emergencyFab]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          router.push("/emergency");
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="warning" size={20} color="#fff" />
        <Text style={styles.emergencyFabText}>طوارئ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerActions: { flexDirection: "row", gap: 8 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#e53e3e",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right" },
  userName: { color: "#fff", fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  walletCard: { padding: 16 },
  walletRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  walletLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "right", fontFamily: "Inter_400Regular" },
  walletBalance: { color: "#fff", fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  chargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  chargeBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginVertical: 12 },
  aiRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular" },
  content: { padding: 20 },
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  quickCard: { flex: 1, padding: 12, borderWidth: 1, alignItems: "center", gap: 4 },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickTitle: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  quickSub: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  aiPrompt: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    gap: 12,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  aiPromptText: { flex: 1 },
  aiPromptTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  aiPromptSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "right" },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  serviceCard: {
    width: "47%",
    padding: 16,
    borderWidth: 1,
    alignItems: "flex-end",
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  serviceTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  serviceSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 2, lineHeight: 17 },
  serviceArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  consultantCard: { marginBottom: 12, padding: 14 },
  consultantRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  consultantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  consultantInitial: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  consultantInfo: { flex: 1 },
  consultantName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "right" },
  consultantTitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "right" },
  consultantMeta: { flexDirection: "row", gap: 10, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessions: { fontSize: 12, fontFamily: "Inter_400Regular" },
  consultantRight: { alignItems: "center", gap: 4 },
  price: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  perSession: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emergencyFab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#e53e3e",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    gap: 7,
    shadowColor: "#e53e3e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  emergencyFabText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
});
