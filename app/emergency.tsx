import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const EMERGENCY_CONTACTS = [
  {
    id: "1",
    name: "خط دعم الصحة النفسية",
    number: "920033360",
    description: "وزارة الصحة السعودية - متاح 24/7",
    icon: "phone-call" as const,
    color: "#e53e3e",
  },
  {
    id: "2",
    name: "الطوارئ الاجتماعية",
    number: "1919",
    description: "وزارة الموارد البشرية والتنمية الاجتماعية",
    icon: "users" as const,
    color: "#2b6cb0",
  },
  {
    id: "3",
    name: "حماية الطفل والأسرة",
    number: "1919",
    description: "برنامج الأمان الأسري الوطني",
    icon: "home" as const,
    color: "#d4a853",
  },
  {
    id: "4",
    name: "الإسعاف",
    number: "911",
    description: "للحالات الطارئة التي تستوجب التدخل الفوري",
    icon: "alert-circle" as const,
    color: "#e53e3e",
  },
];

const BREATHING_STEPS = [
  { label: "استنشق", duration: "4 ثوانٍ", icon: "arrow-up" as const, color: "#007A68" },
  { label: "احبس نفسك", duration: "7 ثوانٍ", icon: "pause" as const, color: "#d4a853" },
  { label: "أخرج الزفير", duration: "8 ثوانٍ", icon: "arrow-down" as const, color: "#2b6cb0" },
];

export default function EmergencyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const call = (number: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 16,
            backgroundColor: "#e53e3e",
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مركز الطوارئ</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.alertBanner, { backgroundColor: "#fee2e2", borderColor: "#e53e3e" }]}>
          <Feather name="alert-triangle" size={20} color="#e53e3e" />
          <Text style={styles.alertText}>
            إذا كنت في خطر فوري أو تفكر في إيذاء نفسك، اتصل بالإسعاف فوراً على 911
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          أرقام الطوارئ والدعم
        </Text>

        {EMERGENCY_CONTACTS.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={[
              styles.contactCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
            ]}
            onPress={() => call(contact.number)}
            activeOpacity={0.8}
          >
            <View style={styles.contactLeft}>
              <Text style={[styles.contactNumber, { color: contact.color }]}>
                {contact.number}
              </Text>
              <View style={[styles.callBtn, { backgroundColor: contact.color }]}>
                <Feather name="phone" size={18} color="#fff" />
                <Text style={styles.callBtnText}>اتصل الآن</Text>
              </View>
            </View>
            <View style={styles.contactRight}>
              <View style={[styles.contactIconBox, { backgroundColor: contact.color + "18" }]}>
                <Feather name={contact.icon} size={22} color={contact.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.foreground }]}>
                  {contact.name}
                </Text>
                <Text style={[styles.contactDesc, { color: colors.mutedForeground }]}>
                  {contact.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          تقنية التنفس لتهدئة الأعصاب (4-7-8)
        </Text>

        <View
          style={[
            styles.breathingCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.breathingDesc, { color: colors.mutedForeground }]}>
            كرر هذه الدورة 4 مرات لتهدئة الجهاز العصبي بسرعة
          </Text>
          <View style={styles.breathingSteps}>
            {BREATHING_STEPS.map((step, i) => (
              <View key={i} style={styles.breathingStep}>
                <View
                  style={[styles.breathingIcon, { backgroundColor: step.color + "20" }]}
                >
                  <Feather name={step.icon} size={20} color={step.color} />
                </View>
                <Text style={[styles.breathingLabel, { color: colors.foreground }]}>
                  {step.label}
                </Text>
                <Text style={[styles.breathingDuration, { color: step.color }]}>
                  {step.duration}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.selfCareCard,
            { backgroundColor: colors.secondary, borderRadius: colors.radius },
          ]}
        >
          <Text style={[styles.selfCareTitle, { color: colors.primary }]}>
            إذا شعرت بضيق شديد، جرّب:
          </Text>
          {[
            "قل: \"حسبي الله ونعم الوكيل\" بهدوء",
            "اشرب كوب ماء بارد ببطء",
            "أخرج للهواء الطلق لدقائق",
            "اتصل بشخص تثق به",
            "تحدث مع كليم AI الآن",
          ].map((tip, i) => (
            <View key={i} style={styles.selfCareTip}>
              <Text style={[styles.selfCareTipText, { color: colors.foreground }]}>{tip}</Text>
              <Feather name="check-circle" size={14} color={colors.primary} />
            </View>
          ))}
          <TouchableOpacity
            style={[styles.chatBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Feather name="message-circle" size={16} color="#fff" />
            <Text style={styles.chatBtnText}>تحدث مع كليم AI</Text>
          </TouchableOpacity>
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
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold", color: "#fff" },
  content: { padding: 16, gap: 16 },
  alertBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#c53030",
    lineHeight: 20,
    textAlign: "right",
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
    marginTop: 4,
  },
  contactCard: { padding: 14, borderWidth: 1 },
  contactRight: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  contactLeft: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contactIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: { flex: 1, alignItems: "flex-end" },
  contactName: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  contactDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, textAlign: "right" },
  contactNumber: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  callBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  breathingCard: { padding: 16, borderWidth: 1 },
  breathingDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginBottom: 16,
  },
  breathingSteps: { flexDirection: "row", justifyContent: "space-around" },
  breathingStep: { alignItems: "center", gap: 8 },
  breathingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  breathingLabel: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  breathingDuration: { fontSize: 12, fontFamily: "Inter_400Regular" },
  selfCareCard: { padding: 16, gap: 10 },
  selfCareTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right" },
  selfCareTip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-end",
  },
  selfCareTipText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, textAlign: "right" },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    marginTop: 4,
  },
  chatBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
