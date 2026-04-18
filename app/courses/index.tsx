import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCurrency } from "@/hooks/useCurrency";
import { Course, getCoursesApi } from "@/services/courses";

export default function CoursesListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { format } = useCurrency();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await getCoursesApi();
      setCourses(list);
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : "تعذر تحميل الكورسات";
      Alert.alert("خطأ", message);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={{ width: 36 }} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>الكورسات</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Platform.OS === "web" ? 120 : 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="book" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>لا توجد كورسات متاحة</Text>
            </View>
          }
          renderItem={({ item }) => {
            const price = format({
              price_egp: item.priceEgp,
              price_sar: item.priceSar,
              price_usd: item.priceUsd,
            });
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: "/courses/[id]", params: { id: item.id } })}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
                ]}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={[styles.image, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}>
                    <Feather name="book-open" size={32} color={colors.primary} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={[styles.courseTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {!!item.instructorName && (
                    <Text style={[styles.instructor, { color: colors.mutedForeground }]}>
                      {item.instructorName}
                    </Text>
                  )}
                  <View style={styles.metaRow}>
                    <Text style={[styles.price, { color: colors.primary }]}>{price}</Text>
                    <View style={styles.metaIcons}>
                      {item.lessonsCount > 0 && (
                        <View style={styles.metaPair}>
                          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                            {item.lessonsCount} درس
                          </Text>
                          <Feather name="play-circle" size={13} color={colors.mutedForeground} />
                        </View>
                      )}
                      {item.durationHours > 0 && (
                        <View style={styles.metaPair}>
                          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                            {item.durationHours}س
                          </Text>
                          <Feather name="clock" size={13} color={colors.mutedForeground} />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  card: { borderWidth: 1, overflow: "hidden" },
  image: { width: "100%", height: 160 },
  cardBody: { padding: 12, gap: 6 },
  courseTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  instructor: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  price: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  metaIcons: { flexDirection: "row", gap: 12 },
  metaPair: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
