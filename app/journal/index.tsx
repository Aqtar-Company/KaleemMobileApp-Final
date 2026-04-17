import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useJournal } from "@/context/JournalContext";

const TAGS = ["قلق", "عمل", "أسرة", "علاقات", "صحة", "امتنان", "تأمل", "أهداف"];

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { entries, deleteEntry } = useJournal();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? entries.filter((e) => e.tags.includes(activeTag))
    : entries;

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("حذف", "هل تريد حذف هذه المذكرة؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: () => deleteEntry(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/journal/[id]", params: { id: "new" } });
          }}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.newBtnText}>مذكرة جديدة</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>يومياتي</Text>
      </View>

      {/* Tag Filter */}
      <View style={[styles.tagsBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FlatList
          data={[{ id: "all", label: "الكل" }, ...TAGS.map((t) => ({ id: t, label: t }))]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tagChip,
                {
                  backgroundColor: activeTag === item.id || (item.id === "all" && !activeTag) ? colors.primary : colors.secondary,
                  borderRadius: 20,
                },
              ]}
              onPress={() => setActiveTag(item.id === "all" ? null : item.id)}
            >
              <Text style={[styles.tagText, { color: activeTag === item.id || (item.id === "all" && !activeTag) ? "#fff" : colors.primary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: Platform.OS === "web" ? 120 : 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: "/journal/[id]", params: { id: item.id } })}
            onLongPress={() => handleDelete(item.id)}
          >
            <View style={styles.entryTop}>
              <View style={styles.entryTagsRow}>
                {item.tags.slice(0, 2).map((t) => (
                  <View key={t} style={[styles.entryTag, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.entryTagText, { color: colors.primary }]}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>{item.date}</Text>
            </View>
            <Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>
              {item.title || "بدون عنوان"}
            </Text>
            <Text style={[styles.entryPreview, { color: colors.mutedForeground }]} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="book" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>لا توجد مذكرات بعد</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>ابدأ بتدوين أفكارك ومشاعرك اليومية</Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              onPress={() => router.push({ pathname: "/journal/[id]", params: { id: "new" } })}
            >
              <Text style={styles.emptyBtnText}>اكتب أول مذكرة</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  headerTitle: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  newBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tagsBar: { paddingVertical: 10, borderBottomWidth: 1 },
  tagChip: { paddingVertical: 6, paddingHorizontal: 14 },
  tagText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  entryCard: { padding: 14, borderWidth: 1 },
  entryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  entryTagsRow: { flexDirection: "row", gap: 6 },
  entryTag: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 12 },
  entryTagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  entryDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  entryTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right", marginBottom: 6 },
  entryPreview: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "right", lineHeight: 20 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyBtn: { paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
