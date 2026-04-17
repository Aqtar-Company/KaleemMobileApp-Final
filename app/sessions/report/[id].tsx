import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
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

const MOCK_REPORTS: Record<
  string,
  {
    summary: string;
    observations: string[];
    recommendations: string[];
    homework: string[];
    nextSteps: string;
    mood: "excellent" | "good" | "moderate" | "needs_attention";
    moodNote: string;
  }
> = {
  s2: {
    summary:
      "أجرينا جلسة استشارية مثمرة استمرت 50 دقيقة. تناولنا فيها الضغوط المهنية التي يتعرض لها المريض وتأثيرها على حياته اليومية. أبدى المريض تعاوناً جيداً وتجاوباً مع الأسئلة والأدوات العلاجية.",
    observations: [
      "يعاني من توتر مزمن ناجم عن ضغوط العمل",
      "مستوى القلق متوسط (6/10 بمقياس التقييم الذاتي)",
      "أنماط التفكير السلبي واضحة في حالات الضغط",
      "لديه دعم اجتماعي جيد من الأسرة",
    ],
    recommendations: [
      "ممارسة تقنية التنفس العميق (4-7-8) مرتين يومياً",
      "تخصيص 30 دقيقة للنشاط البدني الخفيف يومياً",
      "تجنب الأجهزة الإلكترونية ساعة قبل النوم",
      "كتابة 3 أشياء إيجابية يومياً في دفتر الامتنان",
    ],
    homework: [
      "تسجيل الأفكار السلبية وتحديها بأفكار بديلة",
      "تطبيق جدول الأولويات في العمل (مصفوفة أيزنهاور)",
      "إجراء محادثة صريحة مع المدير حول توزيع المهام",
    ],
    nextSteps:
      "يُنصح بجلسة متابعة خلال أسبوعين لتقييم التقدم وتطبيق التقنيات. إن استمر القلق بنفس الحدة، قد يستفيد من تقييم نفسي أعمق.",
    mood: "moderate",
    moodNote: "تحسن ملحوظ في نهاية الجلسة مقارنة بالبداية",
  },
  s3: {
    summary:
      "تناولت الجلسة موضوع التواصل الزوجي وأساليب حل النزاعات الأسرية. اتسمت الجلسة بالانفتاح والصراحة وكان المريض ملتزماً بإيجاد حلول عملية.",
    observations: [
      "وجود سوء فهم متكرر في التواصل الزوجي",
      "رغبة صادقة من الطرفين في الإصلاح",
      "أنماط سلوكية متوارثة تؤثر على أسلوب التعامل",
      "مستوى التوتر الأسري: مرتفع (7/10)",
    ],
    recommendations: [
      "تطبيق قاعدة \"وقت التحدث\" المحدد بـ 20 دقيقة يومياً",
      "استخدام أسلوب \"أنا\" بدلاً من \"أنت\" في التعبير عن المشاعر",
      "تحديد يوم أسبوعي للنشاط المشترك بدون هواتف",
      "قراءة كتاب \"لغات الحب الخمس\" معاً",
    ],
    homework: [
      "كتابة 5 صفات إيجابية في الشريك يومياً",
      "ممارسة تمرين الاستماع النشط لمدة 10 دقائق يومياً",
    ],
    nextSteps:
      "جلسة مشتركة مع الزوجين معاً خلال أسبوع للعمل على التواصل المباشر.",
    mood: "good",
    moodNote: "مزاج إيجابي وتفاؤل بإمكانية التغيير",
  },
};

const MOOD_CONFIG = {
  excellent: { label: "ممتاز", color: "#007A68", bgColor: "#E0F4EF", icon: "smile" as const },
  good: { label: "جيد", color: "#2b6cb0", bgColor: "#ebf8ff", icon: "thumbs-up" as const },
  moderate: { label: "متوسط", color: "#d4a853", bgColor: "#fffbeb", icon: "meh" as const },
  needs_attention: { label: "يحتاج متابعة", color: "#e53e3e", bgColor: "#fee2e2", icon: "alert-circle" as const },
};

export default function SessionReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const session = MOCK_SESSIONS.find((s) => s.id === id);
  const report = id ? MOCK_REPORTS[id] : undefined;

  if (!session || !report) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          },
        ]}
      >
        <Feather name="file-text" size={48} color={colors.border} />
        <Text style={[styles.noReportTitle, { color: colors.foreground }]}>
          التقرير غير متاح بعد
        </Text>
        <Text style={[styles.noReportSub, { color: colors.mutedForeground }]}>
          سيتوفر التقرير بعد انتهاء الجلسة
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const moodConf = MOOD_CONFIG[report.mood];

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("مشاركة التقرير", "سيتم إرسال التقرير إلى بريدك الإلكتروني.");
  };

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
        <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
          <Feather name="share-2" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          تقرير الجلسة
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 100 : 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Info */}
        <View
          style={[
            styles.sessionInfo,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <View style={styles.sessionInfoRow}>
            <View style={[styles.consultantAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.consultantAvatarText}>
                {session.consultantName.charAt(0)}
              </Text>
            </View>
            <View style={styles.sessionInfoText}>
              <Text style={[styles.sessionConsultantName, { color: colors.foreground }]}>
                {session.consultantName}
              </Text>
              <Text style={[styles.sessionConsultantTitle, { color: colors.mutedForeground }]}>
                {session.consultantTitle}
              </Text>
            </View>
          </View>
          <View
            style={[styles.sessionMeta, { borderTopColor: colors.border }]}
          >
            <View style={styles.sessionMetaItem}>
              <Feather name="calendar" size={13} color={colors.primary} />
              <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>
                {session.date}
              </Text>
            </View>
            <View style={styles.sessionMetaItem}>
              <Feather name="clock" size={13} color={colors.primary} />
              <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>
                {session.time}
              </Text>
            </View>
            <View style={styles.sessionMetaItem}>
              <Feather name="tag" size={13} color={colors.primary} />
              <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>
                {session.serviceTitle}
              </Text>
            </View>
          </View>
        </View>

        {/* Mood */}
        <View
          style={[
            styles.moodCard,
            { backgroundColor: moodConf.bgColor, borderRadius: colors.radius },
          ]}
        >
          <View style={styles.moodRow}>
            <Text style={[styles.moodNote, { color: moodConf.color }]}>
              {report.moodNote}
            </Text>
            <View style={styles.moodLabel}>
              <Feather name={moodConf.icon} size={18} color={moodConf.color} />
              <Text style={[styles.moodTitle, { color: moodConf.color }]}>
                الحالة العامة: {moodConf.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <ReportSection
          icon="file-text"
          title="ملخص الجلسة"
          colors={colors}
        >
          <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
            {report.summary}
          </Text>
        </ReportSection>

        {/* Observations */}
        <ReportSection icon="eye" title="ملاحظات المستشار" colors={colors}>
          {report.observations.map((obs, i) => (
            <BulletItem key={i} text={obs} colors={colors} icon="circle" color={colors.primary} />
          ))}
        </ReportSection>

        {/* Recommendations */}
        <ReportSection icon="check-circle" title="التوصيات" colors={colors}>
          {report.recommendations.map((rec, i) => (
            <BulletItem key={i} text={rec} colors={colors} icon="check" color="#007A68" />
          ))}
        </ReportSection>

        {/* Homework */}
        <ReportSection icon="book-open" title="الواجب المنزلي" colors={colors}>
          {report.homework.map((hw, i) => (
            <BulletItem key={i} text={hw} colors={colors} icon="square" color="#d4a853" />
          ))}
        </ReportSection>

        {/* Next Steps */}
        <View
          style={[
            styles.nextStepsCard,
            { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30", borderRadius: colors.radius },
          ]}
        >
          <View style={styles.nextStepsHeader}>
            <Feather name="arrow-right-circle" size={18} color={colors.primary} />
            <Text style={[styles.nextStepsTitle, { color: colors.primary }]}>
              الخطوات القادمة
            </Text>
          </View>
          <Text style={[styles.nextStepsText, { color: colors.foreground }]}>
            {report.nextSteps}
          </Text>
          <TouchableOpacity
            style={[
              styles.bookAgainBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius - 4 },
            ]}
            onPress={() =>
              router.push({
                pathname: "/consultants/[id]",
                params: { id: session.consultantId },
              })
            }
          >
            <Feather name="calendar" size={15} color="#fff" />
            <Text style={styles.bookAgainText}>احجز جلسة متابعة</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          هذا التقرير سري ولا يُشارك إلا بموافقتك. يمكنك طباعته أو إرساله لطبيبك.
        </Text>
      </ScrollView>
    </View>
  );
}

function ReportSection({
  icon,
  title,
  colors,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[styles.sectionIcon, { backgroundColor: colors.primary + "18" }]}
        >
          <Feather name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function BulletItem({
  text,
  colors,
  icon,
  color,
}: {
  text: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.bulletItem}>
      <Text style={[styles.bulletText, { color: colors.foreground }]}>{text}</Text>
      <Feather name={icon} size={13} color={color} style={{ marginTop: 2 }} />
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
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  content: { padding: 16, gap: 14 },
  sessionInfo: { padding: 14, borderWidth: 1 },
  sessionInfoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  consultantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  consultantAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  sessionInfoText: { flex: 1, alignItems: "flex-end" },
  sessionConsultantName: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  sessionConsultantTitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  sessionMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sessionMetaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  sessionMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  moodCard: { padding: 14 },
  moodRow: { gap: 6 },
  moodLabel: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" },
  moodTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  moodNote: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right" },
  section: { padding: 14, borderWidth: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    justifyContent: "flex-end",
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sectionBody: { gap: 10 },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "right",
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    justifyContent: "flex-end",
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    textAlign: "right",
  },
  nextStepsCard: { padding: 14, borderWidth: 1, gap: 10 },
  nextStepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  nextStepsTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  nextStepsText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "right",
  },
  bookAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    marginTop: 4,
  },
  bookAgainText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  disclaimer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  noReportTitle: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  noReportSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  backLink: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
