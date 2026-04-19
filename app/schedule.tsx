import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_SESSIONS } from "@/data/mockData";

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
const DAYS_AR = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const SESSION_TYPE_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  video: "video",
  text: "message-square",
};

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const cells = buildCalendar(year, month);

  const sessionDays = MOCK_SESSIONS
    .filter((s) => {
      const d = new Date(s.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .map((s) => new Date(s.date).getDate());

  const dayEvents = selectedDay
    ? MOCK_SESSIONS.filter((s) => {
        const d = new Date(s.date);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
      })
    : [];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>جدول المواعيد</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/consultants")}>
          <Feather name="plus" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Month Nav */}
        <View style={[styles.monthNav, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Feather name="chevron-right" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.foreground }]}>
            {MONTHS_AR[month]} {year}
          </Text>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={[styles.dayHeaders, { backgroundColor: colors.card }]}>
          {DAYS_AR.map((d) => (
            <Text key={d} style={[styles.dayHeader, { color: colors.mutedForeground }]}>{d}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={[styles.grid, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {cells.map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                day && isToday(day) && { backgroundColor: colors.primary + "22" },
                day && selectedDay === day && { backgroundColor: colors.primary },
              ]}
              onPress={() => day && setSelectedDay(day)}
              disabled={!day}
            >
              {day ? (
                <>
                  <Text
                    style={[
                      styles.cellDay,
                      { color: selectedDay === day ? "#fff" : isToday(day) ? colors.primary : colors.foreground },
                    ]}
                  >
                    {day}
                  </Text>
                  {sessionDays.includes(day) && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: selectedDay === day ? "#fff" : colors.accent },
                      ]}
                    />
                  )}
                </>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Events */}
        <View style={styles.events}>
          <Text style={[styles.eventsTitle, { color: colors.foreground }]}>
            {selectedDay
              ? `مواعيد ${selectedDay} ${MONTHS_AR[month]}`
              : "اختر يوماً لعرض مواعيده"}
          </Text>

          {dayEvents.length === 0 && selectedDay ? (
            <View style={[styles.noEvents, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="calendar" size={32} color={colors.border} />
              <Text style={[styles.noEventsText, { color: colors.mutedForeground }]}>لا توجد مواعيد في هذا اليوم</Text>
              <TouchableOpacity
                style={[styles.addEventBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
                onPress={() => router.push("/consultants")}
              >
                <Text style={styles.addEventBtnText}>احجز جلسة</Text>
              </TouchableOpacity>
            </View>
          ) : (
            dayEvents.map((session) => (
              <View
                key={session.id}
                style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <View style={styles.eventLeft}>
                  <View style={[styles.eventAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.eventAvatarText}>{session.consultantName.charAt(0)}</Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventConsultant, { color: colors.foreground }]}>{session.consultantName}</Text>
                    <Text style={[styles.eventService, { color: colors.mutedForeground }]}>{session.serviceTitle}</Text>
                  </View>
                </View>
                <View style={styles.eventRight}>
                  <View style={[styles.eventTypeBadge, { backgroundColor: colors.secondary }]}>
                    <Feather name={SESSION_TYPE_ICON[session.type] ?? "video"} size={13} color={colors.primary} />
                  </View>
                  <Text style={[styles.eventTime, { color: colors.primary }]}>{session.time}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Upcoming all */}
        <View style={styles.upcoming}>
          <Text style={[styles.eventsTitle, { color: colors.foreground }]}>كل الجلسات القادمة</Text>
          {MOCK_SESSIONS.filter((s) => s.status === "upcoming").map((session) => (
            <View key={session.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <View style={styles.eventLeft}>
                <View style={[styles.eventAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.eventAvatarText}>{session.consultantName.charAt(0)}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventConsultant, { color: colors.foreground }]}>{session.consultantName}</Text>
                  <Text style={[styles.eventDate, { color: colors.mutedForeground }]}>{session.date} • {session.time}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: "#E0F4EF" }]}>
                <Text style={{ fontSize: 12, color: "#007A68", fontFamily: "Inter_500Medium" }}>قادمة</Text>
              </View>
            </View>
          ))}
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
  headerTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  navBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  monthTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  dayHeaders: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dayHeader: { flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Inter_500Medium" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    gap: 2,
  },
  cellDay: { fontSize: 15, fontFamily: "Inter_500Medium" },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  events: { padding: 16, gap: 10 },
  eventsTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  noEvents: { padding: 24, alignItems: "center", gap: 10, borderWidth: 1 },
  noEventsText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  addEventBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  addEventBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  eventCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderWidth: 1 },
  eventLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  eventAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  eventAvatarText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  eventInfo: { alignItems: "flex-end" },
  eventConsultant: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  eventService: { fontSize: 12, fontFamily: "Inter_400Regular" },
  eventDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  eventRight: { alignItems: "flex-end", gap: 4 },
  eventTypeBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  eventTime: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  upcoming: { padding: 16, gap: 10 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
});
