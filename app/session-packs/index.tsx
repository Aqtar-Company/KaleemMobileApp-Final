import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
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
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/context/AuthContext";
import {
  SessionBalance,
  SessionPack,
  getMySessionBalanceApi,
  getSessionPacksApi,
  purchasePackApi,
} from "@/services/sessionPacks";

export default function SessionPacksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { user, refreshProfile } = useAuth();
  const { format } = useCurrency();

  const [packs, setPacks] = useState<SessionPack[]>([]);
  const [balance, setBalance] = useState<SessionBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyPackId, setBusyPackId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, bal] = await Promise.all([
        getSessionPacksApi({ pack_type: "wallet_bundle" }),
        user ? getMySessionBalanceApi() : Promise.resolve(null),
      ]);
      setPacks(list);
      setBalance(bal);
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : "تعذر تحميل الباقات";
      Alert.alert("خطأ", message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePurchase = (pack: SessionPack) => {
    if (!user) {
      Alert.alert("تسجيل الدخول", "يرجى تسجيل الدخول أولاً للشراء", [
        { text: "إلغاء", style: "cancel" },
        { text: "دخول", onPress: () => router.push("/auth/login") },
      ]);
      return;
    }
    const priceLabel = format({
      price_egp: pack.priceEgp,
      price_sar: pack.priceSar,
      price_usd: pack.priceUsd,
    });
    Alert.alert(
      `تأكيد شراء باقة ${pack.name}`,
      `سيتم خصم ${priceLabel} من محفظتك وإضافة:\n• ${pack.sessionsCount} جلسة${pack.freeWrittenSessions > 0 ? `\n• ${pack.freeWrittenSessions} استشارة مكتوبة مجانية` : ""}${pack.aiMessagesCredit > 0 ? `\n• ${pack.aiMessagesCredit} رسالة كليم AI` : ""}`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "شراء",
          onPress: async () => {
            setBusyPackId(pack.id);
            try {
              await purchasePackApi(pack.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await Promise.all([load(), refreshProfile()]);
              Alert.alert("تم بنجاح", `تم شراء ${pack.name}`);
            } catch (e) {
              const message = e instanceof Error && e.message ? e.message : "تعذر إتمام الشراء";
              Alert.alert("خطأ", message);
            } finally {
              setBusyPackId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={{ width: 36 }} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>باقات الجلسات</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {balance && (
          <LinearGradient colors={["#007A68", "#004D40"]} style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
            <View style={styles.balanceRow}>
              <BalanceStat icon="video" label="جلسات أونلاين" value={balance.onlineSessions} />
              <BalanceStat icon="edit" label="استشارات مكتوبة" value={balance.writtenSessions} />
              <BalanceStat icon="message-square" label="رسائل AI" value={balance.aiMessages} />
            </View>
          </LinearGradient>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : packs.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا توجد باقات متاحة حالياً</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {packs.map((pack) => {
              const busy = busyPackId === pack.id;
              const priceLabel = format({
                price_egp: pack.priceEgp,
                price_sar: pack.priceSar,
                price_usd: pack.priceUsd,
              });
              return (
                <View
                  key={pack.id}
                  style={[
                    styles.packCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: pack.isPopular ? colors.primary : colors.border,
                      borderWidth: pack.isPopular ? 2 : 1,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  {pack.isPopular && (
                    <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.popularText}>الأكثر طلباً</Text>
                    </View>
                  )}
                  <View style={styles.packHead}>
                    <Text style={[styles.packPrice, { color: colors.primary }]}>{priceLabel}</Text>
                    <Text style={[styles.packName, { color: colors.foreground }]}>{pack.name}</Text>
                  </View>
                  {!!pack.description && (
                    <Text style={[styles.packDesc, { color: colors.mutedForeground }]}>{pack.description}</Text>
                  )}

                  <View
                    style={[
                      styles.includes,
                      { backgroundColor: colors.surfaceAlt, borderRadius: colors.radius - 4 },
                    ]}
                  >
                    {pack.sessionsCount > 0 && (
                      <BulletLine text={`${pack.sessionsCount} جلسة ${pack.sessionType === "written" ? "مكتوبة" : "أونلاين"}`} color={colors.primary} />
                    )}
                    {pack.freeWrittenSessions > 0 && (
                      <BulletLine text={`${pack.freeWrittenSessions} استشارة مكتوبة مجانية`} color={colors.primary} />
                    )}
                    {pack.aiMessagesCredit > 0 && (
                      <BulletLine text={`${pack.aiMessagesCredit} رسالة مع كليم AI`} color={colors.primary} />
                    )}
                    {pack.hasExtendedChat && (
                      <BulletLine text="دردشة ممتدة للمتابعة" color="#d4a853" />
                    )}
                  </View>

                  <TouchableOpacity
                    disabled={busy}
                    onPress={() => handlePurchase(pack)}
                    style={[styles.buyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buyText}>شراء الباقة</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function BalanceStat({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: number }) {
  return (
    <View style={statStyles.box}>
      <Feather name={icon} size={18} color="#fff" />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function BulletLine({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletText}>{text}</Text>
      <Feather name="check-circle" size={14} color={color} />
    </View>
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
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  balanceCard: {
    margin: 16,
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    gap: 10,
  },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular" },
  balanceRow: { flexDirection: "row", gap: 10, width: "100%" },
  list: { paddingHorizontal: 16, gap: 14, marginTop: 4 },
  packCard: { padding: 14, gap: 10, position: "relative" },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  packHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  packName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  packPrice: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  packDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  includes: { padding: 12, gap: 8 },
  bulletRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  bulletText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  buyBtn: { paddingVertical: 12, alignItems: "center", marginTop: 2 },
  buyText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    gap: 4,
  },
  value: { color: "#fff", fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  label: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
});
