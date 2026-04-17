import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useMood } from "@/context/MoodContext";
import { useJournal } from "@/context/JournalContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useColors } from "@/hooks/useColors";
import { Card, Divider } from "@/components/UI";

function MenuItem({
  icon,
  label,
  onPress,
  color,
  value,
  showArrow = true,
  right,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress?: () => void;
  color?: string;
  value?: string;
  showArrow?: boolean;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuRight}>
        <View style={[styles.menuIcon, { backgroundColor: (color || colors.primary) + "18" }]}>
          <Feather name={icon} size={18} color={color || colors.primary} />
        </View>
        <Text style={[styles.menuLabel, { color: color || colors.foreground }]}>{label}</Text>
      </View>
      <View style={styles.menuLeft}>
        {value && <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {right ?? (
          showArrow && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { entries: moodEntries, todayEntry } = useMood();
  const { entries: journalEntries } = useJournal();
  const { favorites } = useFavorites();
  const colorScheme = useColorScheme();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const MOOD_EMOJIS = ["😢", "😟", "😐", "🙂", "😊"];

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("حذف الحساب", "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.", [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive" },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : 100 }}
    >
      <View style={[styles.header, { paddingTop: topPadding + 20, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>الملف الشخصي</Text>
      </View>

      <View style={[styles.profileHero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || "م"}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          {user?.phone && (
            <Text style={[styles.profilePhone, { color: colors.mutedForeground }]}>{user.phone}</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>${user?.walletBalance || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>رصيد المحفظة</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{journalEntries.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>مذكرات</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{moodEntries.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>أيام تتبعت</Text>
          </View>
        </View>
      </View>

      {/* Wellness Summary */}
      <View style={styles.content}>
        <Card style={styles.wellnessCard}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>صحتك النفسية</Text>
          <View style={styles.wellnessRow}>
            <TouchableOpacity
              style={[styles.wellnessItem, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}
              onPress={() => router.push("/mood")}
            >
              <Text style={styles.wellnessEmoji}>
                {todayEntry ? MOOD_EMOJIS[todayEntry.mood - 1] : "🌱"}
              </Text>
              <Text style={[styles.wellnessLabel, { color: colors.foreground }]}>متتبع المزاج</Text>
              <Text style={[styles.wellnessSub, { color: colors.primary }]}>
                {todayEntry ? "مسجّل ✓" : "سجّل اليوم"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.wellnessItem, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}
              onPress={() => router.push("/journal")}
            >
              <Text style={styles.wellnessEmoji}>📓</Text>
              <Text style={[styles.wellnessLabel, { color: colors.foreground }]}>اليوميات</Text>
              <Text style={[styles.wellnessSub, { color: colors.primary }]}>
                {journalEntries.length} مذكرة
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.wellnessItem, { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 }]}
              onPress={() => router.push("/schedule")}
            >
              <Text style={styles.wellnessEmoji}>📅</Text>
              <Text style={[styles.wellnessLabel, { color: colors.foreground }]}>الجدول</Text>
              <Text style={[styles.wellnessSub, { color: colors.primary }]}>مواعيدك</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>حسابي</Text>
          <MenuItem icon="user" label="تعديل الملف الشخصي" onPress={() => {}} />
          <Divider />
          <MenuItem icon="bell" label="الإشعارات" onPress={() => router.push("/notifications")} />
          <Divider />
          <MenuItem icon="lock" label="تغيير كلمة المرور" onPress={() => {}} />
          <Divider />
          <MenuItem
            icon="moon"
            label="الوضع الليلي"
            showArrow={false}
            right={
              <View style={styles.darkModeInfo}>
                <Text style={[styles.darkModeValue, { color: colors.mutedForeground }]}>
                  {colorScheme === "dark" ? "مفعّل" : "معطّل"}
                </Text>
                <Text style={[styles.darkModeNote, { color: colors.mutedForeground }]}>
                  (يتبع إعداد الجهاز)
                </Text>
              </View>
            }
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>الخدمات</Text>
          <MenuItem icon="calendar" label="جلساتي" onPress={() => router.push("/(tabs)/sessions")} />
          <Divider />
          <MenuItem icon="credit-card" label="محفظتي" onPress={() => router.push("/(tabs)/wallet")} />
          <Divider />
          <MenuItem
            icon="heart"
            label="المستشارون المفضلون"
            onPress={() => router.push("/consultants")}
            value={favorites.length > 0 ? `${favorites.length}` : ""}
          />
          <Divider />
          <MenuItem icon="edit-3" label="الاستشارات الكتابية" onPress={() => router.push("/consultations")} />
          <Divider />
          <MenuItem icon="alert-circle" label="مركز الطوارئ" onPress={() => router.push("/emergency")} color="#e53e3e" />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>الدعم</Text>
          <MenuItem icon="help-circle" label="مركز المساعدة" onPress={() => {}} />
          <Divider />
          <MenuItem icon="message-circle" label="تواصل معنا" onPress={() => {}} />
          <Divider />
          <MenuItem icon="shield" label="سياسة الخصوصية" onPress={() => {}} />
          <Divider />
          <MenuItem icon="file-text" label="شروط الاستخدام" onPress={() => {}} />
        </Card>

        <Card style={styles.section}>
          <MenuItem
            icon="log-out"
            label="تسجيل الخروج"
            onPress={handleLogout}
            color={colors.destructive}
            showArrow={false}
          />
          <Divider />
          <MenuItem
            icon="trash-2"
            label="حذف الحساب"
            onPress={handleDeleteAccount}
            color={colors.destructive}
            showArrow={false}
          />
        </Card>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>كليم v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  profileHero: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700", fontFamily: "Inter_700Bold" },
  profileInfo: { alignItems: "center", marginBottom: 20, gap: 4 },
  profileName: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 14, fontFamily: "Inter_400Regular" },
  profilePhone: { fontSize: 14, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 12, width: "100%" },
  statBox: { flex: 1, padding: 12, alignItems: "center", gap: 4 },
  statNumber: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  content: { padding: 16, gap: 12 },
  wellnessCard: { padding: 0, overflow: "hidden" },
  wellnessRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 14 },
  wellnessItem: { flex: 1, padding: 12, alignItems: "center", gap: 4 },
  wellnessEmoji: { fontSize: 26 },
  wellnessLabel: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  wellnessSub: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { padding: 0, overflow: "hidden" },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
    paddingHorizontal: 16,
    paddingVertical: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  menuValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  darkModeInfo: { alignItems: "flex-end", gap: 2 },
  darkModeValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  darkModeNote: { fontSize: 10, fontFamily: "Inter_400Regular" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
});
