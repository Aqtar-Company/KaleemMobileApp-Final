import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card, Badge } from "@/components/UI";
import { SERVICES, CONSULTANTS } from "@/data/mockData";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const service = SERVICES.find((s) => s.id === id);
  const consultants = CONSULTANTS.filter((c) => c.serviceId === id);

  if (!service) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>الخدمة غير موجودة</Text>
      </View>
    );
  }

  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    "heart-pulse": "heart",
    "users": "users",
    "user-check": "user-check",
    "home": "home",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[service.color, service.color + "cc"]}
        style={[styles.header, { paddingTop: topPadding + 16 }]}
      >
        <View style={styles.headerTop}>
          <View style={{ width: 36 }} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name={iconMap[service.icon] || "circle"} size={36} color="#fff" />
        </View>
        <Text style={styles.serviceTitle}>{service.title}</Text>
        <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
        <Text style={styles.serviceDesc}>{service.description}</Text>
      </LinearGradient>

      <FlatList
        data={consultants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 120 : 100, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>مستشارو {service.title}</Text>
        }
        renderItem={({ item }) => (
          <Card
            style={styles.consultantCard}
            onPress={() => router.push({ pathname: "/consultants/[id]", params: { id: item.id } })}
          >
            <View style={styles.cardRow}>
              <View style={[styles.avatar, { backgroundColor: item.available ? service.color : colors.muted }]}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.title, { color: colors.mutedForeground }]}>{item.title}</Text>
                <View style={styles.metaRow}>
                  <Feather name="star" size={12} color="#d4a853" />
                  <Text style={[styles.rating, { color: colors.mutedForeground }]}>{item.rating}</Text>
                  <Text style={[styles.sessions, { color: colors.mutedForeground }]}>{item.sessions} جلسة</Text>
                  {item.available ? (
                    <Badge label="متاح" color="#007A68" bgColor="#E0F4EF" />
                  ) : (
                    <Badge label="غير متاح" color={colors.mutedForeground} bgColor={colors.muted} />
                  )}
                </View>
              </View>
              <View style={styles.priceSection}>
                <Text style={[styles.price, { color: service.color }]}>${item.pricePerSession}</Text>
                <Text style={[styles.perSession, { color: colors.mutedForeground }]}>/جلسة</Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا يوجد مستشارون في هذه الخدمة حالياً</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceTitle: { fontSize: 26, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 4 },
  serviceSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", marginBottom: 12 },
  serviceDesc: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right", marginBottom: 12 },
  consultantCard: { padding: 14 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  cardInfo: { flex: 1, alignItems: "flex-end" },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  rating: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sessions: { fontSize: 12, fontFamily: "Inter_400Regular" },
  priceSection: { alignItems: "center" },
  price: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  perSession: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
