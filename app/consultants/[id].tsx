import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useColors } from "@/hooks/useColors";
import { useConsultant } from "@/hooks/useConsultants";
import { Badge, Button } from "@/components/UI";

const SESSION_TYPES = [
  { id: "video", icon: "video" as const, label: "فيديو" },
  { id: "audio", icon: "phone" as const, label: "صوتي" },
  { id: "text", icon: "message-square" as const, label: "كتابي" },
];

const TIME_SLOTS = ["9:00 ص", "10:00 ص", "11:00 ص", "1:00 م", "2:00 م", "3:00 م", "4:00 م", "5:00 م"];

export default function ConsultantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const { consultant, loading, error } = useConsultant(id ?? "");
  const [selectedType, setSelectedType] = useState("video");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<string | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = consultant ? isFavorite(consultant.id) : false;

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setUploadedDoc(result.assets[0].name);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("تم الرفع", `تم إرفاق "${result.assets[0].name}" بنجاح`);
      }
    } catch {
      Alert.alert("خطأ", "تعذّر رفع الملف");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !consultant) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 24, gap: 10 }]}>
        <Feather name="user-x" size={48} color={colors.border} />
        <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: "Inter_600SemiBold" }}>تعذّر تحميل بيانات المستشار</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: "center" }}>{error ?? "لم يتم العثور على المستشار"}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.primary }}>
          <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBook = () => {
    if (!selectedTime) {
      Alert.alert("تنبيه", "يرجى اختيار وقت الجلسة");
      return;
    }
    const price = consultant.price || 0;
    if ((user?.walletBalance || 0) < price) {
      Alert.alert(
        "رصيد غير كافٍ",
        `رصيدك الحالي $${user?.walletBalance}. سعر الجلسة $${price}. هل تريد شحن محفظتك؟`,
        [
          { text: "لاحقاً", style: "cancel" },
          { text: "شحن الآن", onPress: () => router.push("/(tabs)/wallet") },
        ]
      );
      return;
    }

    Alert.alert(
      "تأكيد الحجز",
      `حجز جلسة مع ${consultant.name}\nالوقت: ${selectedTime}\nالسعر: $${price}`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          onPress: async () => {
            setBooking(true);
            await new Promise((r) => setTimeout(r, 800));
            updateUser({ walletBalance: (user?.walletBalance || 0) - price });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("تم الحجز", "تم حجز جلستك بنجاح! ستجد التفاصيل في صفحة الجلسات.", [
              { text: "عرض الجلسات", onPress: () => router.push("/(tabs)/sessions") },
            ]);
            setBooking(false);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>ملف المستشار</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: fav ? "#fee2e2" : colors.surfaceAlt, borderRadius: 18 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleFavorite(consultant.id);
          }}
        >
          <Feather name="heart" size={20} color={fav ? "#e53e3e" : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.profileSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {consultant.avatar ? (
            <Image source={{ uri: consultant.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{consultant.name.charAt(0)}</Text>
            </View>
          )}
          <Text style={[styles.name, { color: colors.foreground }]}>{consultant.name}</Text>
          <Text style={[styles.title, { color: colors.mutedForeground }]}>{consultant.specialty}</Text>
          {consultant.chatEnabled && (
            <View style={{ marginTop: 6 }}>
              <Badge label="متاح الآن" color="#007A68" bgColor="#E0F4EF" />
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="star" size={16} color="#d4a853" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{consultant.rating?.toFixed(1) || "-"}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>التقييم</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Feather name="briefcase" size={16} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{consultant.experience || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>سنوات خبرة</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Feather name="dollar-sign" size={16} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>${consultant.price || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>/ جلسة</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {consultant.description ? (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>نبذة عن المستشار</Text>
              <Text style={[styles.bio, { color: colors.mutedForeground }]}>{consultant.description}</Text>
            </View>
          ) : null}

          {consultant.services && consultant.services.length > 0 ? (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>الخدمات المقدَّمة</Text>
              <View style={styles.chipWrap}>
                {consultant.services.map((s) => (
                  <View key={s} style={[styles.serviceChip, { backgroundColor: colors.secondary, borderRadius: 10 }]}>
                    <Text style={[styles.serviceChipText, { color: colors.primary }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>نوع الجلسة</Text>
            <View style={styles.typeRow}>
              {SESSION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: selectedType === type.id ? colors.primary : colors.secondary,
                      borderRadius: colors.radius - 4,
                    },
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Feather name={type.icon} size={16} color={selectedType === type.id ? "#fff" : colors.primary} />
                  <Text style={[styles.typeText, { color: selectedType === type.id ? "#fff" : colors.primary }]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>اختر الوقت</Text>
            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlot,
                    {
                      backgroundColor: selectedTime === slot ? colors.primary : colors.secondary,
                      borderRadius: colors.radius - 4,
                    },
                  ]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[styles.timeText, { color: selectedTime === slot ? "#fff" : colors.primary }]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.writtenConsultBtn,
              {
                borderColor: colors.primary,
                borderRadius: colors.radius,
                backgroundColor: colors.secondary,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/consultations");
            }}
          >
            <Feather name="edit-3" size={16} color={colors.primary} />
            <Text style={[styles.writtenConsultText, { color: colors.primary }]}>
              استشارة كتابية مع {consultant.name.split(" ").slice(-1)[0]}
            </Text>
          </TouchableOpacity>

          <View style={[styles.section, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>
              إرفاق مستند (اختياري)
            </Text>
            <TouchableOpacity
              style={[styles.uploadBtn, { borderColor: colors.primary, backgroundColor: colors.secondary }]}
              onPress={handlePickDocument}
            >
              <Feather name="paperclip" size={18} color={colors.primary} />
              <Text style={[styles.uploadBtnText, { color: colors.primary }]}>
                {uploadedDoc ?? "رفع ملف PDF أو صورة"}
              </Text>
              {uploadedDoc && (
                <TouchableOpacity onPress={() => setUploadedDoc(null)}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.bookingFooter, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.priceSummary}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>إجمالي الجلسة</Text>
              <Text style={[styles.totalPrice, { color: colors.primary }]}>${consultant.price || 0}</Text>
            </View>
            <Button
              title="احجز جلسة"
              onPress={handleBook}
              loading={booking}
              disabled={!selectedTime}
              style={{ flex: 1 }}
            />
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  profileSection: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    gap: 6,
  },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarImage: { width: 88, height: 88, borderRadius: 44, marginBottom: 4 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700", fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  title: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 0, alignSelf: "stretch" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, height: 40 },
  statValue: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  content: { padding: 16, gap: 14 },
  section: { padding: 16, borderRadius: 14, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right", marginBottom: 12 },
  bio: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 22 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  serviceChip: { paddingVertical: 6, paddingHorizontal: 12 },
  serviceChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  typeRow: { flexDirection: "row", gap: 10 },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  typeText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  timeSlotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeSlot: { paddingVertical: 10, paddingHorizontal: 14 },
  timeText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  uploadBtnText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "right" },
  bookingFooter: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  priceSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  totalPrice: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  writtenConsultBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderWidth: 1.5,
    gap: 8,
  },
  writtenConsultText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
