import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
import { Course, getCourseApi, subscribeCourseApi } from "@/services/courses";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { user } = useAuth();
  const { format } = useCurrency();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getCourseApi(id);
      setCourse(data);
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : "تعذر تحميل الكورس";
      Alert.alert("خطأ", message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubscribe = () => {
    if (!course) return;
    if (!user) {
      Alert.alert("تسجيل الدخول", "يرجى تسجيل الدخول أولاً للاشتراك", [
        { text: "إلغاء", style: "cancel" },
        { text: "دخول", onPress: () => router.push("/auth/login") },
      ]);
      return;
    }
    const priceLabel = format({
      price_egp: course.priceEgp,
      price_sar: course.priceSar,
      price_usd: course.priceUsd,
    });
    Alert.alert("تأكيد الاشتراك", `سيتم خصم ${priceLabel} من محفظتك.`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "اشتراك",
        onPress: async () => {
          setSubscribing(true);
          try {
            await subscribeCourseApi(course.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("تم بنجاح", "تم الاشتراك في الكورس");
          } catch (e) {
            const message = e instanceof Error && e.message ? e.message : "تعذر إتمام الاشتراك";
            Alert.alert("خطأ", message);
          } finally {
            setSubscribing(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", gap: 12 }]}>
        <Feather name="alert-circle" size={40} color={colors.border} />
        <Text style={[styles.missing, { color: colors.mutedForeground }]}>الكورس غير متاح</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>عودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price = format({
    price_egp: course.priceEgp,
    price_sar: course.priceSar,
    price_usd: course.priceUsd,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }} showsVerticalScrollIndicator={false}>
        {course.image ? (
          <Image source={{ uri: course.image }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}>
            <Feather name="book-open" size={48} color={colors.primary} />
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backFloating, { top: topPadding + 8, backgroundColor: "rgba(0,0,0,0.4)" }]}
        >
          <Feather name="arrow-right" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.foreground }]}>{course.title}</Text>
          {!!course.instructorName && (
            <View style={styles.instructorRow}>
              {course.instructorImage ? (
                <Image source={{ uri: course.instructorImage }} style={styles.instructorAvatar} contentFit="cover" />
              ) : (
                <View style={[styles.instructorAvatar, { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }]}>
                  <Text style={styles.instructorInitial}>{course.instructorName.charAt(0)}</Text>
                </View>
              )}
              <Text style={[styles.instructorName, { color: colors.mutedForeground }]}>{course.instructorName}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            {course.lessonsCount > 0 && (
              <MetaChip icon="play-circle" label={`${course.lessonsCount} درس"`} color={colors.primary} />
            )}
            {course.durationHours > 0 && (
              <MetaChip icon="clock" label={`${course.durationHours} ساعة`} color={colors.primary} />
            )}
          </View>

          {!!course.description && (
            <View
              style={[
                styles.descBox,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Text style={[styles.descHead, { color: colors.foreground }]}>نبذة عن الكورس</Text>
              <Text style={[styles.descText, { color: colors.mutedForeground }]}>{course.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          disabled={subscribing}
          onPress={handleSubscribe}
          style={[styles.subscribeBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
        >
          {subscribing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeText}>اشتراك بـ {price}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetaChip({ icon, label, color }: { icon: keyof typeof Feather.glyphMap; label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + "15" }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
      <Feather name={icon} size={13} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { width: "100%", height: 220 },
  backFloating: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 16, gap: 14 },
  title: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  instructorRow: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "flex-end" },
  instructorAvatar: { width: 36, height: 36, borderRadius: 18 },
  instructorInitial: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  instructorName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  metaRow: { flexDirection: "row", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  descBox: { padding: 14, borderWidth: 1, gap: 6 },
  descHead: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  descText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 22 },
  footer: { padding: 16, paddingTop: 12, borderTopWidth: 1 },
  subscribeBtn: { paddingVertical: 14, alignItems: "center" },
  subscribeText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  missing: { fontSize: 16, fontFamily: "Inter_500Medium" },
  backLink: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
