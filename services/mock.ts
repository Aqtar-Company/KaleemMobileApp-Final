import type { ApiResponse } from "./api";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

const MOCK_TOKEN = "mock-token-0123456789";

const MOCK_USER = {
  id: 1,
  name: "أحمد محمد",
  email: "ahmed@kaleemai.com",
  phone: "+20 100 000 0000",
  image: undefined as string | undefined,
  wallet_amount: 500,
  wallet_currency: "EGP",
  role: "user",
};

const MOCK_CONSULTANTS = [
  {
    id: 101,
    user_id: 101,
    name: "د. سارة أحمد",
    image: undefined,
    job: "استشارات نفسية",
    specialization: "القلق والاكتئاب",
    description:
      "استشارية نفسية بخبرة 12 سنة، متخصصة في العلاج المعرفي السلوكي واضطرابات القلق والاكتئاب.",
    rating: 4.9,
    price: 60,
    price_egp: 1200,
    price_sar: 225,
    price_usd: 60,
    experience: 12,
    chat_enabled: true,
    services: [
      { id: 1, name: "نفس راشدة" },
      { id: 2, name: "مستقر" },
    ],
  },
  {
    id: 102,
    user_id: 102,
    name: "د. محمد علي",
    image: undefined,
    job: "طب نفسي",
    specialization: "الاكتئاب واضطرابات النوم",
    description: "طبيب نفسي معتمد، خبرة 15 سنة في علاج الاكتئاب واضطرابات النوم والطب النفسي الشامل.",
    rating: 4.8,
    price: 75,
    price_egp: 1500,
    price_sar: 280,
    price_usd: 75,
    experience: 15,
    chat_enabled: true,
    services: [{ id: 2, name: "مستقر" }],
  },
  {
    id: 103,
    user_id: 103,
    name: "أ. فاطمة حسن",
    image: undefined,
    job: "استشارات أسرية",
    specialization: "العلاقات الزوجية والأسرية",
    description: "مستشارة أسرية معتمدة متخصصة في حل النزاعات الزوجية وبناء علاقات أسرية صحية.",
    rating: 4.7,
    price: 50,
    price_egp: 1000,
    price_sar: 188,
    price_usd: 50,
    experience: 9,
    chat_enabled: false,
    services: [{ id: 4, name: "يريدان إصلاحاً" }],
  },
  {
    id: 104,
    user_id: 104,
    name: "د. يوسف إبراهيم",
    image: undefined,
    job: "استشارات شبابية",
    specialization: "توجيه الشباب والمراهقين",
    description: "استشاري شبابي ومدرب حياة، خبرة 7 سنوات في إرشاد المراهقين والشباب.",
    rating: 4.6,
    price: 45,
    price_egp: 900,
    price_sar: 169,
    price_usd: 45,
    experience: 7,
    chat_enabled: true,
    services: [{ id: 3, name: "صديق" }],
  },
  {
    id: 105,
    user_id: 105,
    name: "أ. نور الدين",
    image: undefined,
    job: "استشارات روحانية",
    specialization: "الإرشاد الروحي الإسلامي",
    description: "مرشد روحي إسلامي، يجمع بين علم النفس الحديث والتوجيه الإيماني لدعم الاستقرار النفسي.",
    rating: 4.9,
    price: 40,
    price_egp: 800,
    price_sar: 150,
    price_usd: 40,
    experience: 11,
    chat_enabled: true,
    services: [{ id: 1, name: "نفس راشدة" }],
  },
  {
    id: 106,
    user_id: 106,
    name: "أ. ليلى عبدالله",
    image: undefined,
    job: "استشارات تربوية",
    specialization: "تربية الأطفال والمراهقين",
    description: "خبيرة تربية أطفال ومراهقين مع شهادات دولية في علم النفس التربوي.",
    rating: 4.8,
    price: 55,
    price_egp: 1100,
    price_sar: 206,
    price_usd: 55,
    experience: 10,
    chat_enabled: true,
    services: [{ id: 3, name: "صديق" }],
  },
];

const now = Date.now();
const minutes = (n: number) => new Date(now - n * 60_000).toISOString();
const hours = (n: number) => new Date(now - n * 3_600_000).toISOString();
const days = (n: number) => new Date(now - n * 86_400_000).toISOString();

type RawMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
};

const MOCK_MESSAGES: Record<string, RawMessage[]> = {
  "101": [
    { id: 1001, sender_id: 101, receiver_id: 1, message: "أهلاً بك، أنا د. سارة. كيف يمكنني مساعدتك اليوم؟", created_at: hours(6) },
    { id: 1002, sender_id: 1, receiver_id: 101, message: "السلام عليكم دكتورة، أعاني من توتر شديد في العمل.", created_at: hours(5) },
    { id: 1003, sender_id: 101, receiver_id: 1, message: "وعليكم السلام. أتفهم ذلك تماماً. منذ متى بدأ هذا التوتر؟", created_at: hours(4) },
    { id: 1004, sender_id: 1, receiver_id: 101, message: "تقريباً من شهرين، بعد تغيير المدير.", created_at: hours(3) },
    { id: 1005, sender_id: 101, receiver_id: 1, message: "شكراً لمشاركتي. أقترح نبدأ بجلسة تقييم أولى. متى يناسبك؟", created_at: hours(2) },
    { id: 1006, sender_id: 1, receiver_id: 101, message: "الأربعاء مساءً مناسب.", created_at: hours(1) },
    { id: 1007, sender_id: 101, receiver_id: 1, message: "تم، احجز الجلسة من التطبيق وسأكون بانتظارك.", created_at: minutes(30) },
  ],
  "104": [
    { id: 2001, sender_id: 1, receiver_id: 104, message: "السلام عليكم يا دكتور.", created_at: days(2) },
    { id: 2002, sender_id: 104, receiver_id: 1, message: "وعليكم السلام، أهلاً بك. كيف أقدر أساعدك؟", created_at: days(2) },
    { id: 2003, sender_id: 1, receiver_id: 104, message: "عندي أخ صغير في سن المراهقة وعنيد.", created_at: days(1) },
    { id: 2004, sender_id: 104, receiver_id: 1, message: "المراهقة مرحلة حساسة. خليني أفهم أكتر — كم عمره؟", created_at: days(1) },
    { id: 2005, sender_id: 1, receiver_id: 104, message: "16 سنة.", created_at: days(1) },
    { id: 2006, sender_id: 104, receiver_id: 1, message: "تمام، أنصحك تبدأ بالاستماع أكتر وتقلل النقد. ممكن نحجز جلسة لنناقش الموضوع بتفصيل؟", created_at: hours(22) },
  ],
  "106": [
    { id: 3001, sender_id: 106, receiver_id: 1, message: "أهلاً، شكراً لتواصلك. متى تود بدء جلستنا الأولى؟", created_at: days(4) },
    { id: 3002, sender_id: 1, receiver_id: 106, message: "ممكن الأسبوع الجاي؟", created_at: days(3) },
    { id: 3003, sender_id: 106, receiver_id: 1, message: "بالتأكيد، اختر الوقت من قائمة المواعيد المتاحة.", created_at: days(3) },
    { id: 3004, sender_id: 1, receiver_id: 106, message: "تمام، سأحجز اليوم.", created_at: days(2) },
    { id: 3005, sender_id: 106, receiver_id: 1, message: "بانتظارك. بالتوفيق!", created_at: days(2) },
  ],
};

const MOCK_CHATS = [
  {
    id: 101,
    user_id: 101,
    receiver: { id: 101, name: "د. سارة أحمد", image: undefined },
    last_message: "تم، احجز الجلسة من التطبيق وسأكون بانتظارك.",
    last_message_at: minutes(30),
    unread_count: 1,
  },
  {
    id: 104,
    user_id: 104,
    receiver: { id: 104, name: "د. يوسف إبراهيم", image: undefined },
    last_message: "ممكن نحجز جلسة لنناقش الموضوع بتفصيل؟",
    last_message_at: hours(22),
    unread_count: 0,
  },
  {
    id: 106,
    user_id: 106,
    receiver: { id: 106, name: "أ. ليلى عبدالله", image: undefined },
    last_message: "بانتظارك. بالتوفيق!",
    last_message_at: days(2),
    unread_count: 0,
  },
];

const MOCK_PACKS = [
  {
    id: 201,
    name: "بداية",
    description: "باقة المبتدئ — جلسة أونلاين واحدة واستشارة كتابية.",
    pack_type: "wallet_bundle",
    type: "online",
    price_egp: 500,
    price_sar: 94,
    price_usd: 25,
    online_sessions: 2,
    written_consultations: 1,
    ai_messages: 50,
    discount_percent: 0,
    has_follow_up: false,
    is_popular: false,
  },
  {
    id: 202,
    name: "متوسطة",
    description: "5 جلسات أونلاين + 2 استشارة كتابية + 100 رسالة AI.",
    pack_type: "wallet_bundle",
    type: "online",
    price_egp: 1000,
    price_sar: 188,
    price_usd: 50,
    online_sessions: 5,
    written_consultations: 2,
    ai_messages: 100,
    discount_percent: 10,
    has_follow_up: false,
    is_popular: true,
  },
  {
    id: 203,
    name: "متقدمة",
    description: "10 جلسات + 5 استشارات كتابية + 500 رسالة AI + متابعة ممتدة.",
    pack_type: "wallet_bundle",
    type: "online",
    price_egp: 2000,
    price_sar: 375,
    price_usd: 100,
    online_sessions: 10,
    written_consultations: 5,
    ai_messages: 500,
    discount_percent: 15,
    has_follow_up: true,
    is_popular: false,
  },
];

const MOCK_AI_PLANS = [
  {
    id: 301,
    name: "Basic",
    description: "200 رسالة شهرياً.",
    price_egp: 99,
    price_sar: 19,
    price_usd: 5,
    messages_limit: 200,
    has_extended_chat: false,
    features: ["200 رسالة/شهر", "ردود فورية", "سجل محفوظ"],
    is_popular: false,
  },
  {
    id: 302,
    name: "Plus",
    description: "600 رسالة شهرياً + متابعة ممتدة.",
    price_egp: 249,
    price_sar: 47,
    price_usd: 13,
    messages_limit: 600,
    has_extended_chat: true,
    features: ["600 رسالة/شهر", "متابعة ممتدة", "أولوية الرد"],
    is_popular: true,
  },
  {
    id: 303,
    name: "Pro",
    description: "رسائل غير محدودة + ميزات حصرية.",
    price_egp: 449,
    price_sar: 84,
    price_usd: 23,
    messages_limit: null,
    has_extended_chat: true,
    features: ["رسائل غير محدودة", "متابعة ممتدة", "دعم أولوية"],
    is_popular: false,
  },
];

const MOCK_BALANCE = {
  online: { total: 4, used: 1 },
  written: { total: 2, used: 0 },
  ai_messages: { total: 200, used: 35 },
};

const MOCK_SUBSCRIPTION = {
  plan_id: 301,
  plan_name: "Basic",
  status: "active",
  messages_used: 35,
  messages_limit: 200,
  renews_at: new Date(now + 25 * 86_400_000).toISOString(),
};

const MOCK_RESERVATIONS = [
  {
    id: 901,
    employee_id: 101,
    employee_name: "د. سارة أحمد",
    employee_image: undefined,
    from_datetime: new Date(now + 2 * 86_400_000).toISOString().replace("T", " ").slice(0, 19),
    to_datetime: new Date(now + 2 * 86_400_000 + 45 * 60_000).toISOString().replace("T", " ").slice(0, 19),
    call_type: "video",
    status: "scheduled",
    price: 60,
  },
  {
    id: 902,
    employee_id: 104,
    employee_name: "د. يوسف إبراهيم",
    from_datetime: new Date(now - 3 * 86_400_000).toISOString().replace("T", " ").slice(0, 19),
    to_datetime: new Date(now - 3 * 86_400_000 + 40 * 60_000).toISOString().replace("T", " ").slice(0, 19),
    call_type: "voice",
    status: "completed",
    price: 45,
  },
];

const MOCK_TRANSACTIONS = [
  { id: 701, type: "credit", amount: 500, description: "شحن محفظة", created_at: days(5) },
  { id: 702, type: "debit", amount: 50, description: "حجز جلسة", created_at: days(2) },
];

const MOCK_SPECIALIZATIONS = [
  { id: 1, name: "القلق والاكتئاب" },
  { id: 2, name: "العلاقات الزوجية" },
  { id: 3, name: "تربية الأطفال" },
  { id: 4, name: "توجيه الشباب" },
  { id: 5, name: "الإرشاد الروحي" },
];

const MOCK_SERVICES = [
  { id: 1, name: "نفس راشدة" },
  { id: 2, name: "مستقر" },
  { id: 3, name: "صديق" },
  { id: 4, name: "يريدان إصلاحاً" },
];

const MOCK_COUNTRIES = [
  { id: 20, name: "مصر" },
  { id: 966, name: "السعودية" },
  { id: 971, name: "الإمارات" },
  { id: 974, name: "قطر" },
];

const MOCK_CITIES: Record<string, { id: number; name: string }[]> = {
  "20": [
    { id: 1, name: "القاهرة" },
    { id: 2, name: "الإسكندرية" },
    { id: 3, name: "الجيزة" },
  ],
  "966": [
    { id: 10, name: "الرياض" },
    { id: 11, name: "جدة" },
    { id: 12, name: "الدمام" },
  ],
  "971": [
    { id: 20, name: "دبي" },
    { id: 21, name: "أبوظبي" },
  ],
  "974": [{ id: 30, name: "الدوحة" }],
};

const MOCK_COURSES = [
  {
    id: 401,
    title: "إدارة القلق اليومي",
    description: "دورة قصيرة عن تقنيات إدارة القلق والتوتر اليومي.",
    price_egp: 200,
    price_sar: 38,
    price_usd: 10,
    duration_hours: 3,
    lessons_count: 6,
    instructor_name: "د. سارة أحمد",
  },
  {
    id: 402,
    title: "أساسيات التربية الإيجابية",
    description: "برنامج عملي للآباء والأمهات لتربية أطفال أصحاء نفسياً.",
    price_egp: 300,
    price_sar: 56,
    price_usd: 15,
    duration_hours: 5,
    lessons_count: 10,
    instructor_name: "أ. ليلى عبدالله",
  },
  {
    id: 403,
    title: "الإرشاد الروحي في الأزمات",
    description: "مدخل عملي للتعامل مع ضغوط الحياة من منظور روحي.",
    price_egp: 180,
    price_sar: 34,
    price_usd: 9,
    duration_hours: 2,
    lessons_count: 4,
    instructor_name: "أ. نور الدين",
  },
];

/* -------------------------------------------------------------------------- */
/*  Dispatcher                                                                 */
/* -------------------------------------------------------------------------- */

const AI_FALLBACK = [
  "أفهم ما تمر به، وأنا هنا لأستمع إليك. كيف يمكنني مساعدتك أكثر؟",
  "شكراً لثقتك بي. ما تصفه يبدو صعباً، لكن طلب المساعدة هو علامة قوة.",
  "خذ نفساً عميقاً. هل تود مشاركة المزيد من التفاصيل؟",
  "الصبر والدعاء يساعدان كثيراً في الأوقات الصعبة. أنت لست وحدك.",
  "كلنا نمر بأوقات صعبة. أقترح أن تتحدث مع أحد مستشارينا المختصين.",
];

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function ok<T>(data: T, message = "تم"): ApiResponse<T> {
  return { status: true, message, data };
}

function notFound(): ApiResponse<unknown> {
  return { status: false, message: "غير موجود" };
}

function matchPath(path: string, pattern: RegExp): RegExpMatchArray | null {
  const base = path.split("?")[0];
  return base.match(pattern);
}

export async function mockDispatch(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown
): Promise<ApiResponse<unknown>> {
  /* ---------- Auth ---------- */
  if (method === "POST" && path === "/login") {
    return delay(ok({ token: MOCK_TOKEN, user: MOCK_USER }));
  }
  if (method === "POST" && path === "/register") {
    const b = (body ?? {}) as { name?: string; email?: string };
    return delay(
      ok({
        token: MOCK_TOKEN,
        user: { ...MOCK_USER, name: b.name ?? MOCK_USER.name, email: b.email ?? MOCK_USER.email },
      })
    );
  }
  if (method === "GET" && path === "/user") return delay(ok(MOCK_USER));
  if (method === "POST" && path === "/logout") return delay(ok(null));
  if (method === "POST" && (path === "/password/forgot" || path === "/password/reset" || path === "/change-password")) {
    return delay(ok(null, "تم"));
  }

  /* ---------- Employees ---------- */
  if (method === "GET" && path.startsWith("/employees")) {
    const m = matchPath(path, /^\/employees\/(\d+)(\/available-times\/.+)?$/);
    if (m && m[2]) {
      return delay(
        ok([
          { from: "09:00", to: "09:45" },
          { from: "10:00", to: "10:45" },
          { from: "14:00", to: "14:45" },
        ])
      );
    }
    if (m) {
      const found = MOCK_CONSULTANTS.find((c) => c.id === Number(m[1]));
      return delay(found ? ok(found) : notFound());
    }
    // list
    const url = new URL(`https://x${path}`);
    const name = url.searchParams.get("name")?.trim();
    const service_id = url.searchParams.get("service_id");
    let list = MOCK_CONSULTANTS;
    if (name) list = list.filter((c) => c.name.includes(name));
    if (service_id) list = list.filter((c) => c.services.some((s) => s.id === Number(service_id)));
    return delay(ok(list));
  }

  /* ---------- Chat ---------- */
  if (method === "GET" && path === "/chat") return delay(ok(MOCK_CHATS));
  if (method === "GET") {
    const m = matchPath(path, /^\/chat\/messages\/(\d+)$/);
    if (m) return delay(ok(MOCK_MESSAGES[m[1]] ?? []));
  }
  if (method === "POST" && path === "/chat/send-message") {
    const b = (body ?? {}) as { receiver_id?: number | string; message?: string };
    const userKey = String(b.receiver_id ?? "");
    const saved: RawMessage = {
      id: Date.now(),
      sender_id: MOCK_USER.id,
      receiver_id: Number(b.receiver_id ?? 0),
      message: String(b.message ?? ""),
      created_at: new Date().toISOString(),
    };
    MOCK_MESSAGES[userKey] = [...(MOCK_MESSAGES[userKey] ?? []), saved];
    return delay(ok(saved));
  }
  if (method === "POST" && path === "/chat/typing") return delay(ok(null));
  if (method === "POST" && /^\/chat\/service-offer\/\d+\/(accept|reject)$/.test(path)) {
    return delay(ok(null));
  }

  /* ---------- Wallet ---------- */
  if (method === "GET" && path === "/wallet") {
    return delay(
      ok({
        balance: MOCK_USER.wallet_amount,
        currency: MOCK_USER.wallet_currency,
        sessions_count: MOCK_BALANCE.online.total - MOCK_BALANCE.online.used,
        ai_messages: MOCK_BALANCE.ai_messages.total - MOCK_BALANCE.ai_messages.used,
        transactions: MOCK_TRANSACTIONS,
      })
    );
  }
  if (method === "POST" && path.startsWith("/wallet/")) {
    return delay(
      ok({
        id: Date.now(),
        type: path.includes("withdraw") ? "debit" : "credit",
        amount: Number(((body ?? {}) as { amount?: number }).amount ?? 0),
        description: "عملية محفظة",
        created_at: new Date().toISOString(),
      })
    );
  }

  /* ---------- Session packs ---------- */
  if (method === "GET" && path.startsWith("/session-packs")) {
    if (path.startsWith("/session-packs/my-balance")) return delay(ok(MOCK_BALANCE));
    return delay(ok(MOCK_PACKS));
  }
  if (method === "POST" && path === "/session-packs/purchase") {
    return delay(ok({ purchase_id: Date.now(), new_balance: MOCK_USER.wallet_amount - 500 }));
  }
  if (method === "POST" && /^\/session-packs\/consultant\/\d+\/purchase$/.test(path)) {
    return delay(ok({ purchase_id: Date.now(), new_balance: MOCK_USER.wallet_amount }));
  }

  /* ---------- AI plans ---------- */
  if (method === "GET" && path === "/ai-plans") return delay(ok(MOCK_AI_PLANS));
  if (method === "GET" && path === "/ai-plans/my-subscription") return delay(ok(MOCK_SUBSCRIPTION));
  if (method === "POST" && path === "/ai-plans/subscribe") return delay(ok(null, "تم الاشتراك"));
  if (method === "POST" && path === "/ai-plans/cancel") return delay(ok(null, "تم الإلغاء"));

  /* ---------- Reservations ---------- */
  if (method === "GET" && path === "/reservations") return delay(ok(MOCK_RESERVATIONS));
  if (method === "POST" && path === "/reservations") {
    const b = (body ?? {}) as {
      employee_id?: number;
      from_datetime?: string;
      to_datetime?: string;
      call_type?: "video" | "voice";
    };
    const created = {
      id: Date.now(),
      employee_id: b.employee_id ?? 0,
      employee_name:
        MOCK_CONSULTANTS.find((c) => c.id === b.employee_id)?.name ?? "مستشار",
      from_datetime: b.from_datetime ?? new Date().toISOString(),
      to_datetime: b.to_datetime ?? new Date().toISOString(),
      call_type: b.call_type ?? "video",
      status: "scheduled",
      price: 60,
    };
    return delay(ok(created));
  }
  {
    const m = matchPath(path, /^\/reservations\/(\d+)\/join-token$/);
    if (m && method === "GET") {
      return delay(ok({ meeting_url: "https://meet.example.com/" + m[1], token: "mock-call-token" }));
    }
  }
  if (method === "DELETE" && /^\/reservations\/\d+$/.test(path)) return delay(ok(null));

  /* ---------- Courses ---------- */
  if (method === "GET" && path === "/courses") return delay(ok(MOCK_COURSES));
  {
    const m = matchPath(path, /^\/courses\/(\d+)$/);
    if (m && method === "GET") {
      const course = MOCK_COURSES.find((c) => c.id === Number(m[1]));
      return delay(course ? ok(course) : notFound());
    }
  }
  if (method === "POST" && path === "/courses/subscribe") return delay(ok(null, "تم التسجيل"));

  /* ---------- Notifications ---------- */
  if (method === "GET" && path === "/notifications") return delay(ok([]));
  if (method === "POST" && path === "/notifications/mark-as-read") return delay(ok(null));

  /* ---------- Lookups ---------- */
  if (method === "GET" && path === "/specializations") return delay(ok(MOCK_SPECIALIZATIONS));
  if (method === "GET" && path === "/services") return delay(ok(MOCK_SERVICES));
  if (method === "GET" && path === "/countries") return delay(ok(MOCK_COUNTRIES));
  {
    const m = matchPath(path, /^\/countries\/(\d+)\/cities$/);
    if (m && method === "GET") return delay(ok(MOCK_CITIES[m[1]] ?? []));
  }

  /* ---------- Consultations (written) ---------- */
  if (method === "GET" && path === "/consultations") return delay(ok([]));

  return delay(notFound());
}

/* -------------------------------------------------------------------------- */
/*  AI streaming                                                               */
/* -------------------------------------------------------------------------- */

let streamIndex = 0;

export async function mockStream(
  _path: string,
  _body: unknown,
  onChunk: (text: string) => void
): Promise<void> {
  const full = AI_FALLBACK[streamIndex++ % AI_FALLBACK.length];
  const words = full.split(" ");
  for (const w of words) {
    await new Promise((r) => setTimeout(r, 80));
    onChunk(w + " ");
  }
}
