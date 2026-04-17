import type { ApiResponse } from "./api";

type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  wallet_amount: number;
  wallet_currency: string;
};

const MOCK_USER: ApiUser = {
  id: 1,
  name: "أحمد محمد",
  email: "ahmed@kaleemai.com",
  phone: "+20 100 000 0000",
  wallet_amount: 250,
  wallet_currency: "USD",
};

const MOCK_TOKEN = "mock-token-0123456789";

const MOCK_CONSULTANTS = [
  {
    id: 1,
    user_id: 101,
    name: "د. سارة الخطيب",
    image: undefined,
    job: "استشارات نفسية",
    rating: 4.9,
    price: 50,
    experience: 10,
    chat_enabled: true,
    description:
      "أخصائية نفسية معتمدة بخبرة تزيد عن 10 سنوات في الإرشاد النفسي وعلاج القلق والاكتئاب.",
    services: [{ id: 1, name: "جلسة فردية" }],
    specialization: "psychology",
  },
  {
    id: 2,
    user_id: 102,
    name: "د. خالد المنصور",
    image: undefined,
    job: "استشارات أسرية",
    rating: 4.7,
    price: 40,
    experience: 8,
    chat_enabled: false,
    description:
      "مستشار أسري ومدرب علاقات زوجية. متخصص في حل النزاعات الأسرية وبناء علاقات صحية.",
    services: [{ id: 2, name: "استشارة أسرية" }],
    specialization: "family",
  },
  {
    id: 3,
    user_id: 103,
    name: "أ. نورا العلي",
    image: undefined,
    job: "استشارات تربوية",
    rating: 4.8,
    price: 35,
    experience: 7,
    chat_enabled: true,
    description:
      "خبيرة تربية أطفال ومراهقين مع شهادات دولية في علم النفس التربوي.",
    services: [{ id: 3, name: "استشارة تربوية" }],
    specialization: "parenting",
  },
  {
    id: 4,
    user_id: 104,
    name: "د. محمد الرشيد",
    image: undefined,
    job: "استشارات قانونية",
    rating: 4.6,
    price: 75,
    experience: 15,
    chat_enabled: true,
    description:
      "محامٍ ومستشار قانوني بخبرة 15 سنة في قضايا الأسرة والعقود وقانون العمل.",
    services: [{ id: 4, name: "استشارة قانونية" }],
    specialization: "legal",
  },
  {
    id: 5,
    user_id: 105,
    name: "أ. ليلى الشهري",
    image: undefined,
    job: "استشارات مهنية",
    rating: 4.9,
    price: 45,
    experience: 9,
    chat_enabled: true,
    description:
      "مدربة تطوير مهني وكوتش معتمد تساعدك على تحديد مسارك المهني.",
    services: [{ id: 5, name: "كوتشينج مهني" }],
    specialization: "career",
  },
  {
    id: 6,
    user_id: 106,
    name: "د. يوسف الزهراني",
    image: undefined,
    job: "استشارات مالية",
    rating: 4.5,
    price: 60,
    experience: 12,
    chat_enabled: false,
    description:
      "مستشار مالي معتمد، متخصص في التخطيط المالي الشخصي والاستثمار للأفراد.",
    services: [{ id: 6, name: "استشارة مالية" }],
    specialization: "financial",
  },
];

const now = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
const inDays = (n: number, h = 10, m = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d;
};

type MockReservation = {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_image?: string;
  from_datetime: string;
  to_datetime: string;
  call_type: "video" | "voice";
  status: "scheduled" | "completed" | "cancelled" | "pending";
  price: number;
};

const MOCK_RESERVATIONS: MockReservation[] = [
  {
    id: 1001,
    employee_id: 1,
    employee_name: "د. سارة الخطيب",
    from_datetime: iso(inDays(1, 10, 0)),
    to_datetime: iso(inDays(1, 11, 0)),
    call_type: "video",
    status: "scheduled",
    price: 50,
  },
  {
    id: 1002,
    employee_id: 4,
    employee_name: "د. محمد الرشيد",
    from_datetime: iso(inDays(3, 18, 0)),
    to_datetime: iso(inDays(3, 19, 0)),
    call_type: "voice",
    status: "pending",
    price: 75,
  },
  {
    id: 1003,
    employee_id: 3,
    employee_name: "أ. نورا العلي",
    from_datetime: iso(inDays(-7, 16, 0)),
    to_datetime: iso(inDays(-7, 17, 0)),
    call_type: "video",
    status: "completed",
    price: 35,
  },
];

const MOCK_WALLET = {
  balance: 250,
  currency: "USD",
  sessions_count: 3,
  ai_messages: 120,
  transactions: [
    {
      id: 1,
      type: "credit" as const,
      amount: 100,
      description: "شحن رصيد",
      created_at: iso(inDays(-2)),
    },
    {
      id: 2,
      type: "debit" as const,
      amount: 35,
      description: "جلسة مع أ. نورا العلي",
      created_at: iso(inDays(-7)),
    },
    {
      id: 3,
      type: "credit" as const,
      amount: 200,
      description: "باقة افتتاحية",
      created_at: iso(inDays(-14)),
    },
  ],
};

const MOCK_AI_RESPONSES = [
  "أفهم ما تمر به، وأنا هنا لأستمع إليك. كيف يمكنني مساعدتك أكثر؟",
  "شكراً لثقتك بي. ما تصفه يبدو صعباً، لكن تذكر أن طلب المساعدة هو علامة قوة.",
  "من المهم أن تعتني بصحتك النفسية. هل جربت التحدث مع أحد المتخصصين لدينا؟",
  "الصبر والدعاء يساعدان كثيراً في الأوقات الصعبة. أنت لست وحدك.",
  "لا تكن قاسياً على نفسك. كلنا نمر بأوقات صعبة.",
];

let aiCounter = 0;

function ok<T>(data: T, message = "تم بنجاح"): ApiResponse<T> {
  return { status: true, message, data };
}

function matchRoute(path: string, pattern: string): Record<string, string> | null {
  const pathParts = path.split("?")[0].split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    if (p.startsWith(":")) params[p.slice(1)] = pathParts[i];
    else if (p !== pathParts[i]) return null;
  }
  return params;
}

async function delay<T>(v: T, ms = 250): Promise<T> {
  return new Promise((res) => setTimeout(() => res(v), ms));
}

export async function mockDispatch(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<unknown>> {
  const b = (body ?? {}) as Record<string, unknown>;

  if (method === "POST" && path === "/login") {
    return delay(ok({ user: { ...MOCK_USER, email: String(b.email ?? MOCK_USER.email) }, token: MOCK_TOKEN }));
  }
  if (method === "POST" && path === "/register") {
    return delay(
      ok({
        user: {
          ...MOCK_USER,
          name: String(b.name ?? MOCK_USER.name),
          email: String(b.email ?? MOCK_USER.email),
          phone: b.phone ? String(b.phone) : MOCK_USER.phone,
        },
        token: MOCK_TOKEN,
      })
    );
  }
  if (method === "POST" && path === "/logout") {
    return delay(ok({}));
  }
  if (method === "GET" && path === "/user") {
    return delay(ok(MOCK_USER));
  }

  if (method === "GET" && path.startsWith("/employees")) {
    const idMatch = matchRoute(path, "/employees/:id");
    if (idMatch) {
      const found = MOCK_CONSULTANTS.find((c) => String(c.id) === idMatch.id);
      if (!found) return { status: false, message: "غير موجود" };
      return delay(ok(found));
    }
    const availMatch = matchRoute(path, "/employees/:id/available-times/:date");
    if (availMatch) {
      return delay(
        ok([
          { from: "10:00", to: "11:00" },
          { from: "13:00", to: "14:00" },
          { from: "17:00", to: "18:00" },
        ])
      );
    }
    const search = new URLSearchParams(path.split("?")[1] ?? "");
    const name = search.get("name") ?? "";
    const list = name
      ? MOCK_CONSULTANTS.filter((c) => c.name.includes(name) || (c.job ?? "").includes(name))
      : MOCK_CONSULTANTS;
    return delay(ok(list));
  }

  if (method === "GET" && path === "/reservations") {
    return delay(ok(MOCK_RESERVATIONS));
  }
  if (method === "POST" && path === "/reservations") {
    const created: MockReservation = {
      id: Date.now(),
      employee_id: Number(b.employee_id ?? 1),
      employee_name: MOCK_CONSULTANTS.find((c) => c.id === Number(b.employee_id))?.name,
      from_datetime: String(b.from_datetime ?? iso(inDays(2))),
      to_datetime: String(b.to_datetime ?? iso(inDays(2, 11))),
      call_type: (b.call_type as "video" | "voice") ?? "video",
      status: "scheduled",
      price: MOCK_CONSULTANTS.find((c) => c.id === Number(b.employee_id))?.price ?? 0,
    };
    MOCK_RESERVATIONS.unshift(created);
    return delay(ok(created));
  }
  const joinMatch = matchRoute(path, "/reservations/:id/join-token");
  if (method === "GET" && joinMatch) {
    return delay(
      ok({ meeting_url: "https://meet.kaleemai.com/mock", token: "mock-join-token" })
    );
  }

  if (method === "GET" && path === "/wallet") {
    return delay(ok(MOCK_WALLET));
  }

  return { status: false, message: `Mock route not implemented: ${method} ${path}` };
}

export async function mockStream(
  _path: string,
  _body: unknown,
  onChunk: (text: string) => void
): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  const reply = MOCK_AI_RESPONSES[aiCounter % MOCK_AI_RESPONSES.length];
  aiCounter += 1;
  const words = reply.split(" ");
  for (const w of words) {
    await new Promise((r) => setTimeout(r, 60));
    onChunk(w + " ");
  }
}
