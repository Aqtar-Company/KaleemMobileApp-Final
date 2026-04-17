import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/context/NotificationsContext";

const CATEGORY_COLORS: Record<string, string> = {
  session: "#007A68",
  ai: "#6366f1",
  wallet: "#d4a853",
  system: "#5A8078",
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>الإشعارات</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>قراءة الكل</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 72 }} />
        )}
      </View>

      {unreadCount > 0 && (
        <View style={[styles.unreadBanner, { backgroundColor: colors.primary + "12", borderBottomColor: colors.primary + "30" }]}>
          <Text style={[styles.unreadBannerText, { color: colors.primary }]}>
            {unreadCount} إشعار غير مقروء
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 100 : 80 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="bell-off" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا توجد إشعارات</Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const catColor = CATEGORY_COLORS[notif.category] || colors.primary;
            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifRow,
                  {
                    backgroundColor: notif.read ? colors.background : colors.secondary,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => markAsRead(notif.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.notifIconWrap, { backgroundColor: catColor + "18" }]}>
                  <Feather name={notif.icon as keyof typeof Feather.glyphMap} size={20} color={catColor} />
                  {!notif.read && <View style={[styles.unreadDot, { backgroundColor: catColor }]} />}
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: colors.foreground }]}>{notif.title}</Text>
                  <Text style={[styles.notifBody, { color: colors.mutedForeground }]}>{notif.body}</Text>
                </View>
                <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{notif.time}</Text>
              </TouchableOpacity>
            );
          })
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  markAllText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  unreadBanner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  unreadBannerText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  notifIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", position: "relative" },
  unreadDot: { position: "absolute", top: 2, left: 2, width: 10, height: 10, borderRadius: 5 },
  notifContent: { flex: 1, alignItems: "flex-start" },
  notifTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 3, textAlign: "right" },
  notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 18 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "left" },
  empty: { alignItems: "center", paddingVertical: 80, gap: 16 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
});
