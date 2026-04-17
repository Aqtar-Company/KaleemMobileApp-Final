export interface Service {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  egyptPriceEgp: number;
  writtenPriceEgp: number;
  internationalPriceUsd: number;
  writtenPriceUsd: number;
  durationMinutes: number;
}

export interface Specialization {
  id: string;
  title: string;
  description: string;
  parentId?: string;
}

export interface Consultant {
  id: string;
  name: string;
  title: string;
  job: string;
  specialty: string;
  specializations: string[];
  rating: number;
  sessions: number;
  pricePerSession: number;
  videoCallRate: number;
  videoCallRateUsd: number;
  voiceCallRate: number;
  voiceCallRateUsd: number;
  consultationRate: number;
  consultationRateUsd: number;
  bio: string;
  available: boolean;
  online: boolean;
  serviceId: string;
  languages: string[];
  degree: "bachelor" | "master" | "phd";
  experience: number;
  gender: "male" | "female";
  chatEnabled: boolean;
  onlineSessionEnabled: boolean;
  writtenConsultationEnabled: boolean;
}

export type CallType = "video" | "voice";
export type SessionType = "individual" | "family" | "group" | "assesment" | "other";
export type CallSubject = "emergency" | "follow-up" | "therapy" | "consultation" | "other";
export type SessionStatus = "scheduled" | "completed" | "active" | "cancelled" | "missed";

export interface Session {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantTitle: string;
  date: string;
  time: string;
  type: CallType;
  callType: CallType;
  sessionType: SessionType;
  callSubject: CallSubject;
  status: SessionStatus;
  price: number;
  priceEgp: number;
  serviceTitle: string;
  durationMinutes: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  displayNameAr: string;
  descriptionAr: string;
  priceEgp: number;
  priceUsd: number;
  featuresAr: string[];
  aiMessagesLimit: number | null;
  aiExtendedChat: boolean;
  freeWritingConsultations: number;
  walletPermanentBalance: boolean;
  walletDescriptionAr: string;
  isActive: boolean;
  isMostPopular: boolean;
  sortOrder: number;
  badgeTextAr: string | null;
}

export interface WalletPackage {
  id: string;
  title: string;
  price: number;
  priceEgp: number;
  priceUsd: number;
  bonus: {
    freeConsultations: number;
    aiMessages: number | null;
    hasFollowUp?: boolean;
    aiExtendedChat?: boolean;
  };
  popular: boolean;
  badgeTextAr: string | null;
  featuresAr: string[];
  walletDescriptionAr: string;
}

export interface SessionPack {
  id: string;
  nameAr: string;
  descriptionAr: string;
  sessionType: "online" | "written" | "both";
  sessionsCount: number;
  freeWrittenSessions: number;
  aiMessagesCredit: number;
  discountPercent: number;
  priceSar: number;
  priceEgp: number;
  priceUsd: number;
  originalPriceSar: number;
  originalPriceEgp: number;
  originalPriceUsd: number;
  isActive: boolean;
}

export interface AIPlan {
  id: string;
  name: string;
  nameAr: string;
  descriptionAr: string;
  messagesPerMonth: number;
  priceSar: number;
  priceEgp: number;
  priceUsd: number;
  billingCycle: "monthly" | "annual";
  featuresAr: string[];
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  amountEgp: number;
  currency: "USD" | "EGP";
  label: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface SessionReport {
  id: string;
  sessionId: string;
  diagnosis: string | null;
  isDiagnosisVisible: boolean;
  notes: string | null;
  isNotesVisible: boolean;
  recommendations: string | null;
  isRecommendationsVisible: boolean;
  treatment: string | null;
  isTreatmentVisible: boolean;
  severity: "low" | "medium" | "high" | "critical";
  isSeverityVisible: boolean;
}

export const SPECIALIZATIONS: Specialization[] = [
  { id: "sp1", title: "الاكتئاب والاضطرابات المزاجية", description: "تشخيص وعلاج الاكتئاب والاضطرابات المزاجية المختلفة" },
  { id: "sp2", title: "القلق واضطرابات الوسواس", description: "علاج اضطرابات القلق العام والوسواس القهري" },
  { id: "sp3", title: "الإرشاد الأسري والزواجي", description: "جلسات الإرشاد الأسري وحل النزاعات الزوجية" },
  { id: "sp4", title: "الصدمات النفسية واضطراب ما بعد الصدمة", description: "علاج الصدمات النفسية وأعراض PTSD" },
  { id: "sp5", title: "إرشاد الشباب والمراهقين", description: "دعم نفسي متخصص للمراهقين والشباب" },
  { id: "sp6", title: "الإدمان والسلوكيات الضارة", description: "علاج إدمان المواد والسلوكيات القهرية" },
  { id: "sp7", title: "تنمية الذات والإرشاد المهني", description: "التوجيه المهني وتطوير مهارات الشخصية" },
  { id: "sp8", title: "الصحة النفسية للمرأة", description: "دعم نفسي متخصص للمرأة في مراحل الحياة المختلفة" },
  { id: "sp9", title: "الإرشاد الروحي الإسلامي", description: "دمج العلاج النفسي مع التوجيه الديني والروحي" },
  { id: "sp10", title: "اضطرابات النوم والتعب المزمن", description: "تشخيص وعلاج اضطرابات النوم والإرهاق النفسي" },
];

export const SERVICES: Service[] = [
  {
    id: "mustaqir",
    name: "mustaqir",
    title: "مستقر",
    subtitle: "طب نفسي متخصص",
    description: "تواصل مع أطباء نفسيين متخصصين. دعم الأمراض النفسية والاضطرابات العاطفية مع خطط متابعة فردية.",
    icon: "heart-pulse",
    color: "#007A68",
    bgColor: "#E1F0F7",
    egyptPriceEgp: 400,
    writtenPriceEgp: 150,
    internationalPriceUsd: 25,
    writtenPriceUsd: 8,
    durationMinutes: 60,
  },
  {
    id: "nafs-rasheda",
    name: "nafs-rasheda",
    title: "نفس راشدة",
    subtitle: "استشارات نفسية وأسرية",
    description: "استشارات نفسية عامة مع متخصصين معتمدين. دعم المراهقين والشباب وإرشاد أسري.",
    icon: "users",
    color: "#2b6cb0",
    bgColor: "#ebf8ff",
    egyptPriceEgp: 300,
    writtenPriceEgp: 120,
    internationalPriceUsd: 18,
    writtenPriceUsd: 6,
    durationMinutes: 50,
  },
  {
    id: "sadeeq",
    name: "sadeeq",
    title: "الصديق الحكيم",
    subtitle: "توجيه الشباب واليافعين",
    description: "توجيه تربوي موثوق للشباب واليافعين. مساحة آمنة للحوار تعزز الثقة بالنفس.",
    icon: "user-check",
    color: "#d4a853",
    bgColor: "#fffbeb",
    egyptPriceEgp: 250,
    writtenPriceEgp: 100,
    internationalPriceUsd: 15,
    writtenPriceUsd: 5,
    durationMinutes: 45,
  },
  {
    id: "hakam",
    name: "hakam",
    title: "يريدا إصلاحاً",
    subtitle: "الإصلاح الزوجي والأسري",
    description: "إصلاح ذات البين بإشراف فقهاء ومتخصصين. متابعة حيادية لضمان حلول مرضية.",
    icon: "home",
    color: "#805ad5",
    bgColor: "#faf5ff",
    egyptPriceEgp: 350,
    writtenPriceEgp: 130,
    internationalPriceUsd: 22,
    writtenPriceUsd: 7,
    durationMinutes: 60,
  },
];

export const CONSULTANTS: Consultant[] = [
  {
    id: "1",
    name: "د. محمد الشريف",
    title: "طبيب نفسي استشاري",
    job: "طبيب نفسي",
    specialty: "الاكتئاب والقلق",
    specializations: ["الاكتئاب والاضطرابات المزاجية", "القلق واضطرابات الوسواس", "الصدمات النفسية واضطراب ما بعد الصدمة"],
    rating: 4.9,
    sessions: 1240,
    pricePerSession: 25,
    videoCallRate: 400,
    videoCallRateUsd: 25,
    voiceCallRate: 300,
    voiceCallRateUsd: 18,
    consultationRate: 150,
    consultationRateUsd: 8,
    bio: "دكتوراه في الطب النفسي من جامعة القاهرة مع خبرة 15 سنة في علاج الاكتئاب والاضطرابات العاطفية. عضو الجمعية العربية للطب النفسي.",
    available: true,
    online: true,
    serviceId: "mustaqir",
    languages: ["العربية", "الإنجليزية"],
    degree: "phd",
    experience: 15,
    gender: "male",
    chatEnabled: true,
    onlineSessionEnabled: true,
    writtenConsultationEnabled: true,
  },
  {
    id: "2",
    name: "أ. سارة القحطاني",
    title: "معالجة نفسية معتمدة",
    job: "معالجة نفسية",
    specialty: "الإرشاد الأسري والزواجي",
    specializations: ["الإرشاد الأسري والزواجي", "الصحة النفسية للمرأة", "اضطرابات النوم والتعب المزمن"],
    rating: 4.8,
    sessions: 890,
    pricePerSession: 18,
    videoCallRate: 300,
    videoCallRateUsd: 18,
    voiceCallRate: 220,
    voiceCallRateUsd: 14,
    consultationRate: 120,
    consultationRateUsd: 6,
    bio: "ماجستير في علم النفس الإرشادي من جامعة الملك عبدالعزيز. متخصصة في العلاقات الأسرية والزوجية وصحة المرأة النفسية.",
    available: true,
    online: false,
    serviceId: "nafs-rasheda",
    languages: ["العربية"],
    degree: "master",
    experience: 9,
    gender: "female",
    chatEnabled: true,
    onlineSessionEnabled: true,
    writtenConsultationEnabled: true,
  },
  {
    id: "3",
    name: "د. عبدالله الزهراني",
    title: "مرشد تربوي ونفسي",
    job: "مرشد تربوي",
    specialty: "توجيه الشباب والمراهقين",
    specializations: ["إرشاد الشباب والمراهقين", "تنمية الذات والإرشاد المهني"],
    rating: 4.7,
    sessions: 650,
    pricePerSession: 15,
    videoCallRate: 250,
    videoCallRateUsd: 15,
    voiceCallRate: 200,
    voiceCallRateUsd: 12,
    consultationRate: 100,
    consultationRateUsd: 5,
    bio: "دكتوراه في التربية وعلم النفس. خبير في إرشاد الشباب وتنمية الذات ومساعدة المراهقين على تجاوز تحديات المرحلة.",
    available: false,
    online: false,
    serviceId: "sadeeq",
    languages: ["العربية"],
    degree: "phd",
    experience: 12,
    gender: "male",
    chatEnabled: true,
    onlineSessionEnabled: true,
    writtenConsultationEnabled: false,
  },
  {
    id: "4",
    name: "أ. فاطمة العتيبي",
    title: "مرشدة أسرية وزوجية",
    job: "مرشدة أسرية",
    specialty: "الإصلاح الزوجي والأسري",
    specializations: ["الإرشاد الأسري والزواجي", "الإرشاد الروحي الإسلامي", "الصحة النفسية للمرأة"],
    rating: 4.9,
    sessions: 420,
    pricePerSession: 22,
    videoCallRate: 350,
    videoCallRateUsd: 22,
    voiceCallRate: 270,
    voiceCallRateUsd: 16,
    consultationRate: 130,
    consultationRateUsd: 7,
    bio: "متخصصة في الإصلاح الزوجي والأسري وفق المنهج الإسلامي. حاصلة على ماجستير في الإرشاد النفسي الأسري.",
    available: true,
    online: true,
    serviceId: "hakam",
    languages: ["العربية"],
    degree: "master",
    experience: 7,
    gender: "female",
    chatEnabled: true,
    onlineSessionEnabled: true,
    writtenConsultationEnabled: true,
  },
  {
    id: "5",
    name: "د. يوسف الحربي",
    title: "طبيب نفسي - اضطرابات معقدة",
    job: "طبيب نفسي",
    specialty: "الاضطرابات العاطفية والصدمات",
    specializations: ["الصدمات النفسية واضطراب ما بعد الصدمة", "الإدمان والسلوكيات الضارة", "الاكتئاب والاضطرابات المزاجية"],
    rating: 4.8,
    sessions: 980,
    pricePerSession: 28,
    videoCallRate: 450,
    videoCallRateUsd: 28,
    voiceCallRate: 350,
    voiceCallRateUsd: 22,
    consultationRate: 180,
    consultationRateUsd: 10,
    bio: "استشاري نفسي مع خبرة واسعة في علاج الصدمات النفسية والاضطرابات المعقدة. حاصل على الدكتوراه من جامعة لندن.",
    available: true,
    online: true,
    serviceId: "mustaqir",
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    degree: "phd",
    experience: 18,
    gender: "male",
    chatEnabled: true,
    onlineSessionEnabled: true,
    writtenConsultationEnabled: true,
  },
  {
    id: "6",
    name: "أ. نور الهاشمي",
    title: "معالجة نفسية - صحة المرأة",
    job: "معالجة نفسية",
    specialty: "الصحة النفسية للمرأة",
    specializations: ["الصحة النفسية للمرأة", "اضطرابات النوم والتعب المزمن", "القلق واضطرابات الوسواس"],
    rating: 4.7,
    sessions: 340,
    pricePerSession: 16,
    videoCallRate: 270,
    videoCallRateUsd: 16,
    voiceCallRate: 200,
    voiceCallRateUsd: 12,
    consultationRate: 110,
    consultationRateUsd: 6,
    bio: "متخصصة في الصحة النفسية للمرأة والأمومة. ماجستير في علم نفس الصحة. خبرة في دعم المرأة في مراحل الحياة المختلفة.",
    available: true,
    online: true,
    serviceId: "nafs-rasheda",
    languages: ["العربية", "الإنجليزية"],
    degree: "master",
    experience: 6,
    gender: "female",
    chatEnabled: true,
    onlineSessionEnabled: true,
    writtenConsultationEnabled: true,
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "free",
    displayNameAr: "مجاني",
    descriptionAr: "ابدأ رحلتك مع كليم بدون أي تكلفة",
    priceEgp: 0,
    priceUsd: 0,
    featuresAr: [
      "15 رسالة مع كليم AI شهرياً",
      "استعراض ملفات المستشارين",
      "متتبع المزاج اليومي",
      "مكتبة المقالات والموارد",
    ],
    aiMessagesLimit: 15,
    aiExtendedChat: false,
    freeWritingConsultations: 0,
    walletPermanentBalance: false,
    walletDescriptionAr: "بدون رصيد محفظة",
    isActive: true,
    isMostPopular: false,
    sortOrder: 0,
    badgeTextAr: null,
  },
  {
    id: "starter",
    name: "starter",
    displayNameAr: "باقة البداية",
    descriptionAr: "الخطوة الأولى نحو الصحة النفسية",
    priceEgp: 199,
    priceUsd: 7,
    featuresAr: [
      "100 رسالة مع كليم AI شهرياً",
      "استشارة كتابية مجانية",
      "رصيد محفظة دائم لا ينتهي",
      "أولوية في حجز المواعيد",
    ],
    aiMessagesLimit: 100,
    aiExtendedChat: false,
    freeWritingConsultations: 1,
    walletPermanentBalance: true,
    walletDescriptionAr: "يُضاف رصيد 199 ج.م لمحفظتك",
    isActive: true,
    isMostPopular: false,
    sortOrder: 1,
    badgeTextAr: null,
  },
  {
    id: "growth",
    name: "growth",
    displayNameAr: "باقة النمو",
    descriptionAr: "للمستخدم الجاد في رحلة الصحة النفسية",
    priceEgp: 499,
    priceUsd: 17,
    featuresAr: [
      "رسائل غير محدودة مع كليم AI",
      "شات ممتد للمتابعة",
      "استشارتان كتابيتان مجانيتان",
      "رصيد محفظة دائم لا ينتهي",
      "خصم 10% على جميع الجلسات",
    ],
    aiMessagesLimit: null,
    aiExtendedChat: true,
    freeWritingConsultations: 2,
    walletPermanentBalance: true,
    walletDescriptionAr: "يُضاف رصيد 499 ج.م لمحفظتك",
    isActive: true,
    isMostPopular: true,
    sortOrder: 2,
    badgeTextAr: "الأكثر طلباً",
  },
  {
    id: "premium",
    name: "premium",
    displayNameAr: "باقة بريميوم",
    descriptionAr: "تجربة كاملة ومتكاملة بدون حدود",
    priceEgp: 999,
    priceUsd: 33,
    featuresAr: [
      "رسائل غير محدودة مع كليم AI",
      "شات ممتد متقدم للمتابعة",
      "5 استشارات كتابية مجانية",
      "رصيد محفظة دائم لا ينتهي",
      "خصم 20% على جميع الجلسات",
      "دعم أولوية على مدار الساعة",
    ],
    aiMessagesLimit: null,
    aiExtendedChat: true,
    freeWritingConsultations: 5,
    walletPermanentBalance: true,
    walletDescriptionAr: "يُضاف رصيد 999 ج.م لمحفظتك",
    isActive: true,
    isMostPopular: false,
    sortOrder: 3,
    badgeTextAr: "الأفضل قيمة",
  },
];

export const WALLET_PACKAGES: WalletPackage[] = PRICING_PLANS.filter(p => p.priceEgp > 0).map(plan => ({
  id: plan.id,
  title: plan.displayNameAr,
  price: plan.priceUsd,
  priceEgp: plan.priceEgp,
  priceUsd: plan.priceUsd,
  bonus: {
    freeConsultations: plan.freeWritingConsultations,
    aiMessages: plan.aiMessagesLimit,
    hasFollowUp: plan.aiExtendedChat,
    aiExtendedChat: plan.aiExtendedChat,
  },
  popular: plan.isMostPopular,
  badgeTextAr: plan.badgeTextAr,
  featuresAr: plan.featuresAr,
  walletDescriptionAr: plan.walletDescriptionAr,
}));

export const SESSION_PACKS: SessionPack[] = [
  {
    id: "pack_3_online",
    nameAr: "باقة 3 جلسات أونلاين",
    descriptionAr: "3 جلسات فيديو أو صوتية مع مستشارك المفضل",
    sessionType: "online",
    sessionsCount: 3,
    freeWrittenSessions: 1,
    aiMessagesCredit: 50,
    discountPercent: 10,
    priceSar: 280,
    priceEgp: 850,
    priceUsd: 56,
    originalPriceSar: 310,
    originalPriceEgp: 950,
    originalPriceUsd: 62,
    isActive: true,
  },
  {
    id: "pack_5_online",
    nameAr: "باقة 5 جلسات أونلاين",
    descriptionAr: "5 جلسات فيديو أو صوتية — الأكثر توفيراً",
    sessionType: "online",
    sessionsCount: 5,
    freeWrittenSessions: 2,
    aiMessagesCredit: 100,
    discountPercent: 20,
    priceSar: 420,
    priceEgp: 1280,
    priceUsd: 84,
    originalPriceSar: 525,
    originalPriceEgp: 1600,
    originalPriceUsd: 105,
    isActive: true,
  },
  {
    id: "pack_3_written",
    nameAr: "باقة 3 استشارات كتابية",
    descriptionAr: "3 استشارات كتابية مفصّلة مع متخصص",
    sessionType: "written",
    sessionsCount: 3,
    freeWrittenSessions: 0,
    aiMessagesCredit: 30,
    discountPercent: 15,
    priceSar: 120,
    priceEgp: 360,
    priceUsd: 24,
    originalPriceSar: 141,
    originalPriceEgp: 424,
    originalPriceUsd: 28,
    isActive: true,
  },
  {
    id: "pack_5_both",
    nameAr: "الباقة الشاملة",
    descriptionAr: "3 جلسات أونلاين + 3 استشارات كتابية + AI غير محدود",
    sessionType: "both",
    sessionsCount: 3,
    freeWrittenSessions: 3,
    aiMessagesCredit: 200,
    discountPercent: 25,
    priceSar: 490,
    priceEgp: 1490,
    priceUsd: 98,
    originalPriceSar: 653,
    originalPriceEgp: 1990,
    originalPriceUsd: 131,
    isActive: true,
  },
];

export const AI_PLANS: AIPlan[] = [
  {
    id: "ai_free",
    name: "free",
    nameAr: "مجاني",
    descriptionAr: "ابدأ بكليم AI مجاناً",
    messagesPerMonth: 15,
    priceSar: 0,
    priceEgp: 0,
    priceUsd: 0,
    billingCycle: "monthly",
    featuresAr: ["15 رسالة شهرياً", "محادثات أساسية", "اقتراحات للتمارين"],
    isActive: true,
  },
  {
    id: "ai_basic",
    name: "basic",
    nameAr: "أساسي",
    descriptionAr: "للتواصل المنتظم مع كليم AI",
    messagesPerMonth: 100,
    priceSar: 29,
    priceEgp: 90,
    priceUsd: 6,
    billingCycle: "monthly",
    featuresAr: ["100 رسالة شهرياً", "محادثات موسّعة", "تمارين الاسترخاء والتأمل", "تتبع الحالة المزاجية"],
    isActive: true,
  },
  {
    id: "ai_pro",
    name: "pro",
    nameAr: "احترافي",
    descriptionAr: "رفيق نفسي دائم بدون حدود",
    messagesPerMonth: -1,
    priceSar: 79,
    priceEgp: 249,
    priceUsd: 16,
    billingCycle: "monthly",
    featuresAr: ["رسائل غير محدودة", "شات ممتد للمتابعة", "ذاكرة الجلسات السابقة", "تقارير دورية", "استشارة كتابية مجانية شهرياً"],
    isActive: true,
  },
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: "s1",
    consultantId: "1",
    consultantName: "د. محمد الشريف",
    consultantTitle: "طبيب نفسي استشاري",
    date: "2026-04-10",
    time: "10:00 ص",
    type: "video",
    callType: "video",
    sessionType: "individual",
    callSubject: "therapy",
    status: "scheduled",
    price: 25,
    priceEgp: 400,
    serviceTitle: "مستقر",
    durationMinutes: 60,
  },
  {
    id: "s2",
    consultantId: "2",
    consultantName: "أ. سارة القحطاني",
    consultantTitle: "معالجة نفسية معتمدة",
    date: "2026-03-28",
    time: "3:00 م",
    type: "voice",
    callType: "voice",
    sessionType: "individual",
    callSubject: "consultation",
    status: "completed",
    price: 18,
    priceEgp: 300,
    serviceTitle: "نفس راشدة",
    durationMinutes: 50,
  },
  {
    id: "s3",
    consultantId: "4",
    consultantName: "أ. فاطمة العتيبي",
    consultantTitle: "مرشدة أسرية وزوجية",
    date: "2026-03-15",
    time: "11:00 ص",
    type: "video",
    callType: "video",
    sessionType: "family",
    callSubject: "therapy",
    status: "completed",
    price: 22,
    priceEgp: 350,
    serviceTitle: "يريدا إصلاحاً",
    durationMinutes: 60,
  },
  {
    id: "s4",
    consultantId: "5",
    consultantName: "د. يوسف الحربي",
    consultantTitle: "طبيب نفسي - اضطرابات معقدة",
    date: "2026-04-15",
    time: "2:00 م",
    type: "video",
    callType: "video",
    sessionType: "individual",
    callSubject: "follow-up",
    status: "scheduled",
    price: 28,
    priceEgp: 450,
    serviceTitle: "مستقر",
    durationMinutes: 60,
  },
];

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "t1",
    type: "credit",
    amount: 17,
    amountEgp: 499,
    currency: "USD",
    label: "شحن محفظة — باقة النمو",
    date: "28 مارس 2026",
    status: "completed",
  },
  {
    id: "t2",
    type: "debit",
    amount: 18,
    amountEgp: 300,
    currency: "USD",
    label: "جلسة صوتية مع أ. سارة القحطاني",
    date: "28 مارس 2026",
    status: "completed",
  },
  {
    id: "t3",
    type: "debit",
    amount: 22,
    amountEgp: 350,
    currency: "USD",
    label: "جلسة فيديو مع أ. فاطمة العتيبي",
    date: "15 مارس 2026",
    status: "completed",
  },
  {
    id: "t4",
    type: "credit",
    amount: 33,
    amountEgp: 999,
    currency: "USD",
    label: "شحن محفظة — باقة بريميوم",
    date: "10 مارس 2026",
    status: "completed",
  },
  {
    id: "t5",
    type: "debit",
    amount: 25,
    amountEgp: 400,
    currency: "USD",
    label: "جلسة فيديو مع د. محمد الشريف",
    date: "5 مارس 2026",
    status: "completed",
  },
];
