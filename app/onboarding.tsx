import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    useLogo: true,
    icon: "heart" as const,
    color: "#007A68",
    bgColor: "#007A6818",
    title: "مرحباً بك في كليم",
    subtitle: "مرشدك النفسي المتوافق مع قيمك الإسلامية",
    description:
      "منصة متكاملة للصحة النفسية تجمع بين الخبرة العلمية والقيم الإسلامية الأصيلة في بيئة آمنة وسرية.",
  },
  {
    id: "2",
    useLogo: false,
    icon: "message-circle" as const,
    color: "#007A68",
    bgColor: "#007A6818",
    title: "كليم AI",
    subtitle: "مساعدك الذكي على مدار الساعة",
    description:
      "تحدث مع كليم AI في أي وقت للحصول على دعم فوري، تمارين الاسترخاء، وإجابات على استفساراتك النفسية.",
  },
  {
    id: "3",
    useLogo: false,
    icon: "users" as const,
    color: "#d4a853",
    bgColor: "#d4a85318",
    title: "مستشارون متخصصون",
    subtitle: "احجز جلستك مع أفضل المتخصصين",
    description:
      "فريق من المعالجين النفسيين والمرشدين الأسريين المعتمدين. جلسات أونلاين أو كتابية حسب راحتك.",
  },
  {
    id: "4",
    useLogo: false,
    icon: "trending-up" as const,
    color: "#007A68",
    bgColor: "#007A6818",
    title: "تتبع رحلتك",
    subtitle: "سجّل مزاجك واكتب يومياتك",
    description:
      "راقب تطورك اليومي من خلال متتبع المزاج واليوميات الشخصية. كل خطوة صغيرة نحو الاتزان تستحق التوثيق.",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const topPad = Platform.OS === "web" ? 40 : insets.top + 16;
  const botPad = Platform.OS === "web" ? 40 : insets.bottom + 16;

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex((i) => i + 1);
    } else {
      await AsyncStorage.setItem("kaleem_onboarded", "true");
      router.replace("/auth/login");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("kaleem_onboarded", "true");
    router.replace("/auth/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>تخطى</Text>
        </TouchableOpacity>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? colors.primary : colors.border,
                  width: i === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {item.useLogo ? (
              <View style={styles.logoWrapper}>
                <Image
                  source={require("@/assets/images/logo_square.jpg")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                <View style={[styles.iconInner, { backgroundColor: item.color }]}>
                  <Feather name={item.icon} size={52} color="#fff" />
                </View>
              </View>
            )}
            <Text style={[styles.slideTitle, { color: colors.foreground }]}>
              {item.title}
            </Text>
            <Text style={[styles.slideSubtitle, { color: item.color }]}>
              {item.subtitle}
            </Text>
            <Text style={[styles.slideDesc, { color: colors.mutedForeground }]}>
              {item.description}
            </Text>
          </View>
        )}
      />

      <View style={[styles.bottomBar, { paddingBottom: botPad }]}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? "ابدأ الآن" : "التالي"}
          </Text>
          <Feather
            name={currentIndex === SLIDES.length - 1 ? "check" : "arrow-left"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skipText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
  slide: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    gap: 16,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 28,
  },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  slideSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  slideDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
