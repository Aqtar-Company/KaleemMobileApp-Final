import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useConsultants } from "@/hooks/useConsultants";
import { useFavorites } from "@/context/FavoritesContext";
import { Card, Badge } from "@/components/UI";
import type { Consultant } from "@/services/consultants";

function ConsultantCard({ consultant }: { consultant: Consultant }) {
  const colors = useColors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(consultant.id);

  return (
    <Card
      style={styles.card}
      onPress={() => router.push({ pathname: "/consultants/[id]", params: { id: consultant.id } })}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardRight}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{consultant.name.charAt(0)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.favBtn, { backgroundColor: fav ? "#fee2e2" : colors.surfaceAlt }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(consultant.id);
            }}
          >
            <Feather name="heart" size={14} color={fav ? "#e53e3e" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            {consultant.services.length > 0 && (
              <Badge
                label={consultant.services[0]}
                color={colors.primary}
                bgColor={colors.secondary}
              />
            )}
            <Text style={[styles.name, { color: colors.foreground }]}>{consultant.name}</Text>
          </View>
          <Text style={[styles.title, { color: colors.mutedForeground }]}>{consultant.specialty}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Feather name="star" size={13} color="#d4a853" />
              <Text style={[styles.rating, { color: colors.foreground }]}>
                {consultant.rating.toFixed(1)}
              </Text>
            </View>
            <Text style={[styles.experience, { color: colors.mutedForeground }]}>
              {consultant.experience} سنوات خبرة
            </Text>
            {consultant.chatEnabled ? (
              <Badge label="متاح الآن" color="#007A68" bgColor="#E0F4EF" />
            ) : (
              <Badge label="غير متاح" color={colors.mutedForeground} bgColor={colors.muted} />
            )}
          </View>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
          onPress={() => router.push({ pathname: "/consultants/[id]", params: { id: consultant.id } })}
        >
          <Text style={styles.bookBtnText}>احجز الآن</Text>
        </TouchableOpacity>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>/ جلسة</Text>
          <Text style={[styles.price, { color: colors.primary }]}>${consultant.price}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function ConsultantsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites } = useFavorites();
  const [search, setSearch] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { consultants, loading, error, refetch } = useConsultants();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const filtered = consultants.filter((c) => {
    const matchesSearch =
      !search || c.name.includes(search) || c.specialty.includes(search);
    const matchesFav = !favOnly || favorites.includes(c.id);
    return matchesSearch && matchesFav;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>المستشارون</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchInput,
            { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchText, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن مستشار..."
            placeholderTextColor={colors.mutedForeground}
            textAlign="right"
          />
        </View>
      </View>

      <View style={[styles.filters, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FlatList
          data={[
            { id: "favorites", label: "المفضلون", icon: "heart" as const },
            { id: "all", label: "الكل", icon: null },
          ]}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          inverted
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const isActive = item.id === "favorites" ? favOnly : !favOnly && item.id === "all";
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? item.id === "favorites"
                        ? "#fee2e2"
                        : colors.primary
                      : colors.secondary,
                    borderRadius: 20,
                    borderWidth: item.id === "favorites" ? 1 : 0,
                    borderColor: item.id === "favorites" ? "#e53e3e40" : "transparent",
                  },
                ]}
                onPress={() => {
                  if (item.id === "favorites") setFavOnly((v) => !v);
                  else setFavOnly(false);
                }}
              >
                <View style={styles.filterContent}>
                  {item.icon ? (
                    <Feather
                      name={item.icon}
                      size={14}
                      color={
                        isActive
                          ? item.id === "favorites"
                            ? "#e53e3e"
                            : "#fff"
                          : colors.primary
                      }
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: isActive
                          ? item.id === "favorites"
                            ? "#e53e3e"
                            : "#fff"
                          : colors.primary,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            جاري تحميل المستشارين...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={48} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            تعذّر الاتصال بالخادم
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={refetch}
          >
            <Text style={styles.retryBtnText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Platform.OS === "web" ? 120 : 100,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => <ConsultantCard consultant={item} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="users" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search ? "لا توجد نتائج للبحث" : "لا يوجد مستشارون متاحون"}
              </Text>
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
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  searchBar: { padding: 12, borderBottomWidth: 1 },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    gap: 10,
  },
  searchText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "right" },
  filters: { paddingVertical: 12, borderBottomWidth: 1 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 16 },
  filterContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  card: { padding: 14 },
  cardRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  cardRight: { gap: 6, alignItems: "center" },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  favBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1, alignItems: "flex-end" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  name: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  title: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 3 },
  experience: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontSize: 13, fontFamily: "Inter_500Medium" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  priceContainer: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  price: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  priceLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  bookBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  bookBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  retryBtn: { paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  retryBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
