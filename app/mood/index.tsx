import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMood, MoodLevel, MoodEntry } from "@/context/MoodContext";
import { MoodIcon, getMoodIconName } from "@/components/MoodIcon";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MOODS: {
  level: MoodLevel;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
}[] = [
  { level: 1, iconName: getMoodIconName(1), label: "سيء جداً", color: "#e53e3e" },
  { level: 2, iconName: getMoodIconName(2), label: "سيء", color: "#f6ad55" },
  { level: 3, iconName: getMoodIconName(3), label: "مقبول", color: "#d4a853" },
  { level: 4, iconName: getMoodIconName(4), label: "جيد", color: "#68d391" },
  { level: 5, iconName: getMoodIconName(5), label: "ممتاز", color: "#007A68" },
];

const WEEK_DAYS_AR = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function MoodBar({ entry }: { entry: MoodEntry }) {
  const colors = useColors();
  const mood = MOODS.find((m) => m.level === entry.mood) || MOODS[2];
  const d = new Date(entry.timestamp);
  const dayName = WEEK_DAYS_AR[d.getDay()];
  return (
    <View style={styles.barItem}>
      <MoodIcon level={mood.level} size={18} color={mood.color} />
      <View style={styles.barWrapper}>
        <View
          style={[
            styles.bar,
            {
              height: (entry.mood / 5) * 60 + 10,
              backgroundColor: mood.color,
              borderRadius: 6,
            },
          ]}
        />
      </View>
      <Text style={[styles.barDay, { color: colors.mutedForeground }]}>{dayName}</Text>
    </View>
  );
}

export default function MoodScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { entries, addEntry, todayEntry } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(todayEntry?.mood || null);
  const [note, setNote] = useState(todayEntry?.note || "");
  const [saved, setSaved] = useState(!!todayEntry);

  const last7 = entries.slice(0, 7).reverse();
  const avg = entries.length
    ? (entries.slice(0, 30).reduce((s, e) => s + e.mood, 0) / Math.min(entries.length, 30)).toFixed(1)
    : "-";

  const handleSave = () => {
    if (!selectedMood) return;
    addEntry(selectedMood, note);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    Alert.alert("تم الحفظ", "تم تسجيل مزاجك اليوم. استمر في المتابعة!");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>متتبع المزاج</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
        {/* Today */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            {saved ? "مزاج اليوم" : "كيف حالك اليوم؟"}
          </Text>
          <View style={styles.moodsRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.level}
                style={[
                  styles.moodBtn,
                  selectedMood === m.level && { backgroundColor: m.color + "22", borderColor: m.color, borderWidth: 2 },
                  { borderRadius: colors.radius - 4 },
                ]}
                onPress={() => {
                  setSelectedMood(m.level);
                  setSaved(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <MaterialCommunityIcons
                  name={m.iconName}
                  size={32}
                  color={selectedMood === m.level ? m.color : colors.mutedForeground}
                />
                <Text style={[styles.moodLabel, { color: selectedMood === m.level ? m.color : colors.mutedForeground }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[
              styles.noteInput,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius - 4 },
            ]}
            value={note}
            onChangeText={(t) => { setNote(t); setSaved(false); }}
            placeholder="أضف ملاحظة عن يومك... (اختياري)"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={300}
            textAlign="right"
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: selectedMood ? colors.primary : colors.muted, borderRadius: colors.radius - 4, opacity: saved ? 0.6 : 1 },
            ]}
            onPress={handleSave}
            disabled={!selectedMood || saved}
          >
            <Feather name={saved ? "check" : "save"} size={16} color={selectedMood && !saved ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.saveBtnText, { color: selectedMood && !saved ? "#fff" : colors.mutedForeground }]}>
              {saved ? "تم الحفظ" : "حفظ مزاج اليوم"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        {last7.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={styles.chartHeader}>
              <View style={[styles.avgBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.avgValue, { color: colors.primary }]}>{avg}</Text>
                <Text style={[styles.avgLabel, { color: colors.mutedForeground }]}>متوسط شهري</Text>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>مزاج آخر 7 أيام</Text>
            </View>
            <View style={styles.chartRow}>
              {last7.map((e) => (
                <MoodBar key={e.id} entry={e} />
              ))}
            </View>
          </View>
        )}

        {/* History */}
        {entries.length > 0 && (
          <View>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>السجل</Text>
            {entries.slice(0, 14).map((entry) => {
              const mood = MOODS.find((m) => m.level === entry.mood) || MOODS[2];
              return (
                <View
                  key={entry.id}
                  style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius - 4 }]}
                >
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{entry.date}</Text>
                    {entry.note ? (
                      <Text style={[styles.historyNote, { color: colors.foreground }]} numberOfLines={1}>{entry.note}</Text>
                    ) : null}
                  </View>
                  <View style={[styles.historyMood, { backgroundColor: mood.color + "18" }]}>
                    <MaterialCommunityIcons name={mood.iconName} size={22} color={mood.color} />
                    <Text style={[styles.historyMoodLabel, { color: mood.color }]}>{mood.label}</Text>
                  </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  content: { padding: 16, gap: 16 },
  card: { padding: 16, borderWidth: 1, gap: 14 },
  cardTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  moodsRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: { alignItems: "center", padding: 8, gap: 4, flex: 1, marginHorizontal: 2 },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  noteInput: { borderWidth: 1.5, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 70, textAlign: "right" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    gap: 8,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avgBadge: { padding: 10, borderRadius: 12, alignItems: "center" },
  avgValue: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  avgLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chartRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 90 },
  barItem: { alignItems: "center", gap: 4 },
  barEmoji: { fontSize: 16 },
  barWrapper: { height: 70, justifyContent: "flex-end" },
  bar: { width: 24 },
  barDay: { fontSize: 10, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right", marginBottom: 4 },
  historyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderWidth: 1, marginBottom: 8 },
  historyRight: { flex: 1, alignItems: "flex-end", gap: 3 },
  historyDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  historyNote: { fontSize: 13, fontFamily: "Inter_400Regular" },
  historyMood: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 10 },
  historyEmoji: { fontSize: 20 },
  historyMoodLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
