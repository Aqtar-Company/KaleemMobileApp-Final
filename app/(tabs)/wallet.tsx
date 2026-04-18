import { Feather, Ionicons } from "@expo/vector-icons";
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
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { useColors } from "@/hooks/useColors";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, SectionTitle } from "@/components/UI";
import {
  SessionPack,
  getSessionPacksApi,
  purchasePackApi,
} from "@/services/sessionPacks";
import type { Transaction } from "@/services/wallet";

function PackageCard({
  pack,
  priceLabel,
  busy,
  onSelect,
}: {
  pack: SessionPack;
  priceLabel: string;
  busy: boolean;
  onSelect: () => void;
}) {
  const colors = useColors();
  return (
    <Card
      style={[
        styles.packageCard,
        pack.isPopular && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={onSelect}
    >
      {pack.isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.popularText}>الأكثر طلباً</Text>
        </View>
      )}
      <View style={styles.packageHeader}>
        <Text style={[styles.packagePrice, { color: colors.primary }]}>{priceLabel}</Text>
        <Text style={[styles.packageTitle, { color: colors.foreground }]}>{pack.name}</Text>
      </View>
      <Text style={[styles.walletAdded, { color: colors.mutedForeground }]}>يُضاف لمحفظتك</Text>

      <View
        style={[
          styles.bonuses,
          { backgroundColor: colors.surfaceAlt, borderRadius: colors.radius - 4 },
        ]}
      >
        <Text style={[styles.bonusesTitle, { color: colors.mutedForeground }]}>هدايا مجانية مع الشحن</Text>
        {pack.sessionsCount > 0 && (
          <BonusRow
            text={`${pack.sessionsCount} جلسة ${pack.sessionType === "written" ? "مكتوبة" : "أونلاين"}`}
            color={colors.primary}
          />
        )}
        {pack.freeWrittenSessions > 0 && (
          <BonusRow
            text={`${pack.freeWrittenSessions} استشارة كتابية مجانية`}
            color={colors.primary}
          />
        )}
        {pack.aiMessagesCredit > 0 && (
          <BonusRow
            text={`كليم AI — ${pack.aiMessagesCredit} رسالة مجانية`}
            color={colors.primary}
          />
        )}
        {pack.hasExtendedChat && (
          <BonusRow text="شات ممتد للمتابعة" color={colors.accent} />
        )}
      </View>

      <TouchableOpacity
        disabled={busy}
        style={[
          styles.chargeNowBtn,
          {
            backgroundColor: pack.isPopular ? colors.primary : colors.secondary,
            borderRadius: colors.radius - 2,
          },
        ]}
        onPress={onSelect}
      >
        {busy ? (
          <ActivityIndicator color={pack.isPopular ? "#fff" : colors.primary} />
        ) : (
          <Text
            style={[
              styles.chargeNowText,
              { color: pack.isPopular ? "#fff" : colors.primary },
            ]}
          >
            اشحن الآن
          </Text>
        )}
      </TouchableOpacity>
    </Card>
  );
}

function BonusRow({ text, color }: { text: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.bonusRow}>
      <Feather name="check-circle" size={14} color={color} />
      <Text style={[styles.bonusText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const colors = useColors();
  const { format } = useCurrency();
  const prefix = tx.type === "credit" ? "+" : "-";
  return (
    <View
      style={[
        styles.txRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius - 4,
        },
      ]}
    >
      <Text style={[styles.txAmount, { color: tx.type === "credit" ? "#007A68" : "#e53e3e" }]}>
        {prefix}
        {format({ price_egp: tx.amount, price_usd: tx.amount })}
      </Text>
      <View style={styles.txInfo}>
        <Text style={[styles.txLabel, { color: colors.foreground }]}>{tx.description}</Text>
        <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
      </View>
      <View
        style={[
          styles.txIcon,
          { backgroundColor: tx.type === "credit" ? "#E0F4EF" : "#fee2e2" },
        ]}
      >
        <Ionicons
          name={tx.type === "credit" ? "arrow-down" : "arrow-up"}
          size={16}
          color={tx.type === "credit" ? "#007A68" : "#e53e3e"}
        />
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const { wallet, loading: walletLoading, refetch } = useWallet(!!user);
  const { format } = useCurrency();

  const [packs, setPacks] = useState<SessionPack[]>([]);
  const [packsLoading, setPacksLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyPackId, setBusyPackId] = useState<string | null>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const loadPacks = useCallback(async () => {
    try {
      const list = await getSessionPacksApi({ pack_type: "wallet_bundle" });
      setPacks(list);
    } catch {
      // Silent: wallet still usable; refresh will retry.
    } finally {
      setPacksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const balance = wallet?.balance ?? user?.walletBalance ?? 0;
  const balanceCurrency = wallet?.currency ?? user?.walletCurrency ?? "USD";
  const sessions = wallet?.sessionsCount ?? 0;
  const aiMessages = wallet?.aiMessages ?? user?.aiMessages ?? 0;
  const transactions = wallet?.transactions ?? [];

  const balanceLabel =
    balanceCurrency === "USD"
      ? format({ price_usd: balance })
      : format({ price_egp: balance, price_usd: balance });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refreshProfile(), loadPacks()]);
    setRefreshing(false);
  };

  const handleCharge = (pack: SessionPack) => {
    if (!user) {
      Alert.alert("تسجيل الدخول", "يرجى تسجيل الدخول أولاً", [
        { text: "إلغاء", style: "cancel" },
        { text: "دخول", onPress: () => router.push("/auth/login") },
      ]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const priceLabel = format({
      price_egp: pack.priceEgp,
      price_sar: pack.priceSar,
      price_usd: pack.priceUsd,
    });
    Alert.alert(
      "تأكيد الشحن",
      `هل تريد شراء ${pack.name} بـ ${priceLabel}؟\n\nهدايا:\n• ${pack.sessionsCount} جلسة${pack.freeWrittenSessions > 0 ? ` + ${pack.freeWrittenSessions} استشارة مكتوبة` : ""}${pack.aiMessagesCredit > 0 ? `\n• ${pack.aiMessagesCredit} رسالة AI` : ""}`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "شحن الآن",
          onPress: async () => {
            setBusyPackId(pack.id);
            try {
              await purchasePackApi(pack.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await Promise.all([refetch(), refreshProfile()]);
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <LinearGradient
        colors={["#007A68", "#004D40"]}
        style={[styles.balanceCard, { paddingTop: topPadding + 20 }]}
      >
        {walletLoading && !refreshing ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginVertical: 24 }} />
        ) : (
          <>
            <Text style={styles.balanceLabel}>رصيد محفظتك</Text>
            <Text style={styles.balanceAmount}>{balanceLabel}</Text>
            <Text style={styles.balanceNote}>الرصيد لا ينتهي — استخدمه في أي وقت</Text>
          </>
        )}

        <View style={styles.aiStats}>
          <View style={[styles.statBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={styles.statValue}>{aiMessages}</Text>
            <Text style={styles.statLabel}>رسائل AI متبقية</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.statValue}>{sessions}</Text>
            <Text style={styles.statLabel}>جلسات محجوزة</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <SectionTitle title="اشحن محفظتك" />
        <Text style={[styles.packagesNote, { color: colors.mutedForeground }]}>
          اشحن مرة واحدة واحجز مع أي مستشار تختاره
        </Text>
        {packsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : packs.length === 0 ? (
          <Text style={[styles.packagesNote, { color: colors.mutedForeground }]}>لا توجد باقات متاحة حالياً</Text>
        ) : (
          packs.map((pack) => (
            <PackageCard
              key={pack.id}
              pack={pack}
              priceLabel={format({
                price_egp: pack.priceEgp,
                price_sar: pack.priceSar,
                price_usd: pack.priceUsd,
              })}
              busy={busyPackId === pack.id}
              onSelect={() => handleCharge(pack)}
            />
          ))
        )}

        <SectionTitle title="المعاملات الأخيرة" />
        {transactions.length > 0 ? (
          transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        ) : (
          <View style={styles.emptyTx}>
            <Feather name="clock" size={32} color={colors.border} />
            <Text style={[styles.emptyTxText, { color: colors.mutedForeground }]}>لا توجد معاملات بعد</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceCard: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  balanceAmount: { color: "#fff", fontSize: 48, fontWeight: "700", fontFamily: "Inter_700Bold" },
  balanceNote: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },
  aiStats: { flexDirection: "row", gap: 16 },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  content: { padding: 20 },
  packagesNote: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 16,
    marginTop: -8,
  },
  packageCard: { marginBottom: 16, padding: 18, position: "relative", overflow: "visible" },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  packageHeader: { alignItems: "flex-start", marginBottom: 4 },
  packageTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  packagePrice: { fontSize: 36, fontWeight: "700", fontFamily: "Inter_700Bold" },
  walletAdded: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right", marginBottom: 14 },
  bonuses: { padding: 12, marginBottom: 14, gap: 8 },
  bonusesTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    marginBottom: 6,
  },
  bonusRow: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  bonusText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  chargeNowBtn: { paddingVertical: 13, alignItems: "center" },
  chargeNowText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1, alignItems: "flex-start" },
  txLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  txDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptyTx: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyTxText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
