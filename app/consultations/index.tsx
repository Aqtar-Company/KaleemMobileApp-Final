import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/UI";
import { getConsultationsApi, type Consultation } from "@/services/consultations";

export default function ConsultationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "answered">("all");
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notAvailable, setNotAvailable] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const load = useCallback(async () => {
    try {
      setNotAvailable(false);
      const list = await getConsultationsApi();
      setItems(list);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (/not\s*found|route|404/i.test(msg)) {
        setItems([]);
        setNotAvailable(true);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = items.filter((c) => {
    if (activeTab === "all") return true;
    return c.status === activeTab;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 16,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/consultants");
          }}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.newBtnText}>استشارة جديدة</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          الاستشارات الكتابية
        </Text>
      </View>

      <View
        style={[
          styles.tabs,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        {[
          { key: "all", label: "الكل" },
          { key: "pending", label: "بانتظار الرد" },
          { key: "answered", label: "مجابة" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && [
                styles.activeTab,
                { borderBottomColor: colors.primary },
              ],
            ]}
            onPress={() => setActiveTab(tab.key as typeof activeTab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab.key
                      ? colors.primary
                      : colors.mutedForeground,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>جاري التحميل...</Text>
        </View>
      ) : (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === "web" ? 120 : 100,
          gap: 12,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/consultations/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <Badge
                label={item.status === "answered" ? "مجابة" : "بانتظار الرد"}
                color={item.status === "answered" ? "#007A68" : "#d4a853"}
                bgColor={
                  item.status === "answered" ? "#E0F4EF" : "#fffbeb"
                }
              />
              <View style={styles.consultantRow}>
                {item.consultantAvatar ? (
                  <Image source={{ uri: item.consultantAvatar }} style={styles.avatarImage} />
                ) : (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {item.consultantName.charAt(0)}
                  </Text>
                </View>
                )}
                <View style={styles.consultantInfo}>
                  <Text style={[styles.consultantName, { color: colors.foreground }]}>
                    {item.consultantName}
                  </Text>
                  <Text
                    style={[
                      styles.consultantTitle,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.consultantTitle}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={[styles.question, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {item.question}
            </Text>

            {item.answer && (
              <View
                style={[
                  styles.answerPreview,
                  { backgroundColor: colors.surfaceAlt, borderRadius: colors.radius - 4 },
                ]}
              >
                <Feather name="message-square" size={12} color={colors.primary} />
                <Text
                  style={[styles.answerText, { color: colors.mutedForeground }]}
                  numberOfLines={1}
                >
                  {item.answer}
                </Text>
              </View>
            )}

            <View style={styles.cardFooter}>
              <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {item.date}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-square" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {notAvailable ? "قيد التجهيز" : "لا توجد استشارات كتابية"}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              {notAvailable
                ? "سيتم تفعيل الاستشارات الكتابية قريباً"
                : "ابدأ باختيار مستشار وإرسال سؤالك"}
            </Text>
            {!notAvailable && (
            <TouchableOpacity
              style={[
                styles.emptyBtn,
                { backgroundColor: colors.primary, borderRadius: colors.radius },
              ]}
              onPress={() => router.push("/consultants")}
            >
              <Text style={styles.emptyBtnText}>اختر مستشاراً</Text>
            </TouchableOpacity>
            )}
          </View>
        }
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  newBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  card: { padding: 14, borderWidth: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  consultantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 36, height: 36, borderRadius: 18 },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  consultantInfo: { alignItems: "flex-end" },
  consultantName: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  consultantTitle: { fontSize: 11, fontFamily: "Inter_400Regular" },
  question: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    lineHeight: 21,
    marginBottom: 10,
  },
  answerPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    marginBottom: 10,
  },
  answerText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  emptyBtn: { paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  emptyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
