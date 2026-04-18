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
  AiPlan,
  AiSubscription,
  cancelAiPlanApi,
  getAiPlansApi,
  getMySubscriptionApi,
  subscribeAiPlanApi,
} from "@/services/aiPlans";

export default function AiPlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { user, refreshProfile } = useAuth();
  const { format } = useCurrency();

  const [plans, setPlans] = useState<AiPlan[]>([]);
  const [subscription, setSubscription] = useState<AiSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, sub] = await Promise.all([
        getAiPlansApi(),
        user ? getMySubscriptionApi() : Promise.resolve(null),
      ]);
      setPlans(list);
      setSubscription(sub);
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

  const handleSubscribe = (plan: AiPlan) => {
    if (!user) {
      Alert.alert("تسجيل الدخول", "يرجى تسجيل الدخول أولاً للاشتراك", [
        { text: "إلغاء", style: "cancel" },
        { text: "دخول", onPress: () => router.push("/auth/login") },
      ]);
      return;
    }
    Alert.alert(
      "تأكيد الاشتراك",
      `سيتم خصم ${format({ price_egp: plan.priceEgp, price_sar: plan.priceSar, price_usd: plan.priceUsd })} من محفظتك شهرياً. متابعة؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "اشتراك",
          onPress: async () => {
            setBusyPlanId(plan.id);
            try {
              await subscribeAiPlanApi(plan.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await Promise.all([load(), refreshProfile()]);
              Alert.alert("تم بنجاح", `تم الاشتراك في ${plan.nameAr}`);
            } catch (e) {
              const message = e instanceof Error && e.message ? e.message : "تعذر إتمام الاشتراك";
              Alert.alert("خطأ", message);
            } finally {
              setBusyPlanId(null);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert("إلغاء الاشتراك", "هل أنت متأكد من إلغاء الاشتراك؟", [
      { text: "عودة", style: "cancel" },
      {
        text: "إلغاء الاشتراك",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelAiPlanApi();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await load();
          } catch (e) {
            const message = e instanceof Error && e.message ? e.message : "تعذر إلغاء الاشتراك";
            Alert.alert("خطأ", message);
          }
        },
      },
    ]);
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>خطط كليم AI</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#007A68", "#004D40"]} style={styles.heroCard}>
          <Feather name="cpu" size={28} color="#fff" />
          <Text style={styles.heroTitle}>جلسات غير محدودة مع كليم AI</Text>
          <Text style={styles.heroSub}>اختر الخطة المناسبة لك واستفد من دعم نفسي فوري في أي وقت.</Text>
        </LinearGradient>

        {subscription?.subscribed && (
          <View
            style={[
              styles.currentCard,
              { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30", borderRadius: colors.radius },
            ]}
          >
            <View style={styles.currentRow}>
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>نشط</Text>
              </View>
              <Text style={[styles.currentTitle, { color: colors.foreground }]}>
                {subscription.planName}
              </Text>
            </View>
            <Text style={[styles.currentMeta, { color: colors.mutedForeground }]}>
              {subscription.isUnlimited
                ? "رسائل غير محدودة"
                : `${subscription.messagesUsed} / ${subscription.messagesLimit ?? 0} رسالة`}
              {subscription.expiresAt ? `  •  تنتهي ${subscription.expiresAt}` : ""}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelLink}>
              <Text style={[styles.cancelLinkText, { color: colors.destructive }]}>إلغاء الاشتراك</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : plans.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا توجد خطط متاحة حالياً</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {plans.map((plan) => {
              const isCurrent = subscription?.subscribed && subscription.planId === plan.id;
              const busy = busyPlanId === plan.id;
              const priceLabel = format({
                price_egp: plan.priceEgp,
                price_sar: plan.priceSar,
                price_usd: plan.priceUsd,
              });
              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isCurrent ? colors.primary : colors.border,
                      borderWidth: isCurrent ? 2 : 1,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <View style={styles.planHead}>
                    <Text style={[styles.planPrice, { color: colors.primary }]}>{priceLabel}</Text>
                    <View style={{ alignItems: "flex-end", flex: 1 }}>
                      <Text style={[styles.planName, { color: colors.foreground }]}>{plan.nameAr}</Text>
                      <Text style={[styles.planLimit, { color: colors.mutedForeground }]}>
                        {plan.isUnlimited
                          ? "رسائل غير محدودة"
                          : `${plan.messagesPerMonth ?? 0} رسالة شهرياً`}
                      </Text>
                    </View>
                  </View>

                  {!!plan.description && (
                    <Text style={[styles.planDesc, { color: colors.mutedForeground }]}>{plan.description}</Text>
                  )}

                  {plan.features.length > 0 && (
                    <View style={styles.features}>
                      {plan.features.map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                          <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                          <Feather name="check-circle" size={14} color={colors.primary} />
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    disabled={isCurrent || busy}
                    onPress={() => handleSubscribe(plan)}
                    style={[
                      styles.subscribeBtn,
                      {
                        backgroundColor: isCurrent ? colors.muted : colors.primary,
                        borderRadius: colors.radius - 4,
                      },
                    ]}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.subscribeText,
                          { color: isCurrent ? colors.mutedForeground : "#fff" },
                        ]}
                      >
                        {isCurrent ? "الخطة الحالية" : "اشتراك الآن"}
                      </Text>
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
  heroCard: {
    margin: 16,
    padding: 18,
    borderRadius: 18,
    alignItems: "flex-end",
    gap: 6,
  },
  heroTitle: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  currentCard: { marginHorizontal: 16, marginBottom: 8, padding: 14, borderWidth: 1, gap: 8 },
  currentRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 },
  currentTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  currentMeta: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cancelLink: { alignSelf: "flex-start", marginTop: 4 },
  cancelLinkText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16, gap: 12, marginTop: 4 },
  planCard: { padding: 14, gap: 10 },
  planHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planPrice: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  planName: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  planLimit: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "right" },
  planDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  features: { gap: 6 },
  featureRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  subscribeBtn: { paddingVertical: 12, alignItems: "center" },
  subscribeText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
