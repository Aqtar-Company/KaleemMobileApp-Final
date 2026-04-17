import type {
  AuthSession,
  ChatSummary,
  Consultant,
  Message,
  Paginated,
  User,
} from './types';

export const MOCK_USER: User = {
  id: 'u-1',
  name: 'أحمد محمد',
  email: 'ahmed@kaleemai.com',
  avatarUrl: null,
  role: 'user',
};

export const MOCK_TOKEN = 'mock-token-0123456789';

export const MOCK_CONSULTANTS: Consultant[] = [
  {
    id: 'c-1',
    name: 'د. سارة الخطيب',
    specialty: 'استشارات نفسية',
    bio: 'أخصائية نفسية معتمدة بخبرة تزيد عن 10 سنوات في الإرشاد النفسي وعلاج القلق والاكتئاب.',
    rating: 4.9,
    reviewsCount: 128,
    pricePerHour: 50,
    online: true,
    languages: ['العربية', 'English'],
    avatarUrl: null,
  },
  {
    id: 'c-2',
    name: 'د. خالد المنصور',
    specialty: 'استشارات أسرية',
    bio: 'مستشار أسري ومدرب علاقات زوجية. متخصص في حل النزاعات الأسرية وبناء علاقات صحية.',
    rating: 4.7,
    reviewsCount: 86,
    pricePerHour: 40,
    online: false,
    languages: ['العربية'],
    avatarUrl: null,
  },
  {
    id: 'c-3',
    name: 'أ. نورا العلي',
    specialty: 'استشارات تربوية',
    bio: 'خبيرة تربية أطفال ومراهقين مع شهادات دولية في علم النفس التربوي.',
    rating: 4.8,
    reviewsCount: 54,
    pricePerHour: 35,
    online: true,
    languages: ['العربية', 'English'],
    avatarUrl: null,
  },
  {
    id: 'c-4',
    name: 'د. محمد الرشيد',
    specialty: 'استشارات قانونية',
    bio: 'محامٍ ومستشار قانوني بخبرة 15 سنة في قضايا الأسرة والعقود وقانون العمل.',
    rating: 4.6,
    reviewsCount: 42,
    pricePerHour: 75,
    online: true,
    languages: ['العربية'],
    avatarUrl: null,
  },
  {
    id: 'c-5',
    name: 'أ. ليلى الشهري',
    specialty: 'استشارات مهنية',
    bio: 'مدربة تطوير مهني وكوتش معتمد تساعدك على تحديد مسارك المهني وتحقيق أهدافك.',
    rating: 4.9,
    reviewsCount: 73,
    pricePerHour: 45,
    online: true,
    languages: ['العربية', 'English'],
    avatarUrl: null,
  },
  {
    id: 'c-6',
    name: 'د. يوسف الزهراني',
    specialty: 'استشارات مالية',
    bio: 'مستشار مالي معتمد، متخصص في التخطيط المالي الشخصي والاستثمار للأفراد.',
    rating: 4.5,
    reviewsCount: 31,
    pricePerHour: 60,
    online: false,
    languages: ['العربية', 'English'],
    avatarUrl: null,
  },
];

const now = Date.now();
const minutes = (n: number) => new Date(now - n * 60_000).toISOString();
const hours = (n: number) => new Date(now - n * 3_600_000).toISOString();
const days = (n: number) => new Date(now - n * 86_400_000).toISOString();

const MOCK_MESSAGES: Record<string, Message[]> = {
  'c-1': [
    {
      id: 'm-1-1',
      chatId: 'c-1',
      senderId: 'c-1',
      content: 'أهلاً بك، أنا د. سارة. كيف يمكنني مساعدتك اليوم؟',
      createdAt: hours(3),
    },
    {
      id: 'm-1-2',
      chatId: 'c-1',
      senderId: MOCK_USER.id,
      content: 'مرحباً دكتورة، أعاني من توتر مستمر في العمل.',
      createdAt: hours(2),
    },
    {
      id: 'm-1-3',
      chatId: 'c-1',
      senderId: 'c-1',
      content: 'أتفهم ذلك تماماً. هل يمكنك وصف الأعراض التي تشعر بها؟',
      createdAt: minutes(30),
    },
  ],
  'c-3': [
    {
      id: 'm-3-1',
      chatId: 'c-3',
      senderId: MOCK_USER.id,
      content: 'السلام عليكم أستاذة نورا',
      createdAt: days(1),
    },
    {
      id: 'm-3-2',
      chatId: 'c-3',
      senderId: 'c-3',
      content: 'وعليكم السلام، أهلاً وسهلاً بك.',
      createdAt: days(1),
    },
  ],
  'c-5': [
    {
      id: 'm-5-1',
      chatId: 'c-5',
      senderId: 'c-5',
      content: 'شكراً لتواصلك. متى تود بدء جلستنا الأولى؟',
      createdAt: days(3),
    },
  ],
};

export const MOCK_CHATS: ChatSummary[] = [
  {
    id: 'c-1',
    consultantId: 'c-1',
    consultantName: 'د. سارة الخطيب',
    consultantAvatarUrl: null,
    lastMessage: 'أتفهم ذلك تماماً. هل يمكنك وصف الأعراض التي تشعر بها؟',
    lastMessageAt: minutes(30),
    unreadCount: 1,
  },
  {
    id: 'c-3',
    consultantId: 'c-3',
    consultantName: 'أ. نورا العلي',
    consultantAvatarUrl: null,
    lastMessage: 'وعليكم السلام، أهلاً وسهلاً بك.',
    lastMessageAt: days(1),
    unreadCount: 0,
  },
  {
    id: 'c-5',
    consultantId: 'c-5',
    consultantName: 'أ. ليلى الشهري',
    consultantAvatarUrl: null,
    lastMessage: 'شكراً لتواصلك. متى تود بدء جلستنا الأولى؟',
    lastMessageAt: days(3),
    unreadCount: 0,
  },
];

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function paginate<T>(items: T[]): Paginated<T> {
  return { items, total: items.length, page: 1, pageSize: items.length };
}

export const mockAuth = {
  login(_email: string, _password: string): Promise<AuthSession> {
    return delay({ token: MOCK_TOKEN, user: MOCK_USER });
  },
  register(input: { name: string; email: string; password: string }): Promise<AuthSession> {
    return delay({
      token: MOCK_TOKEN,
      user: { ...MOCK_USER, name: input.name, email: input.email },
    });
  },
  me(): Promise<User> {
    return delay(MOCK_USER);
  },
  logout(): Promise<void> {
    return delay(undefined);
  },
};

export const mockConsultants = {
  list(params?: { search?: string }): Promise<Paginated<Consultant>> {
    const q = (params?.search ?? '').trim();
    const filtered = q
      ? MOCK_CONSULTANTS.filter(
          (c) => c.name.includes(q) || c.specialty.includes(q)
        )
      : MOCK_CONSULTANTS;
    return delay(paginate(filtered));
  },
  get(id: string): Promise<Consultant> {
    const item = MOCK_CONSULTANTS.find((c) => c.id === id);
    if (!item) return Promise.reject(new Error('Consultant not found'));
    return delay(item);
  },
  featured(): Promise<Consultant[]> {
    return delay(MOCK_CONSULTANTS.slice(0, 4));
  },
};

export const mockChats = {
  list(): Promise<Paginated<ChatSummary>> {
    return delay(paginate(MOCK_CHATS));
  },
  open(consultantId: string): Promise<ChatSummary> {
    const existing = MOCK_CHATS.find((c) => c.id === consultantId);
    if (existing) return delay(existing);
    const consultant = MOCK_CONSULTANTS.find((c) => c.id === consultantId);
    const stub: ChatSummary = {
      id: consultantId,
      consultantId,
      consultantName: consultant?.name ?? 'Consultant',
      consultantAvatarUrl: consultant?.avatarUrl ?? null,
      lastMessage: undefined,
      lastMessageAt: undefined,
      unreadCount: 0,
    };
    MOCK_CHATS.unshift(stub);
    MOCK_MESSAGES[consultantId] = MOCK_MESSAGES[consultantId] ?? [];
    return delay(stub);
  },
  messages(chatId: string): Promise<Paginated<Message>> {
    const items = MOCK_MESSAGES[chatId] ?? [];
    return delay(paginate(items));
  },
  send(chatId: string, content: string): Promise<Message> {
    const msg: Message = {
      id: `m-${chatId}-${Date.now()}`,
      chatId,
      senderId: MOCK_USER.id,
      content,
      createdAt: new Date().toISOString(),
    };
    MOCK_MESSAGES[chatId] = [...(MOCK_MESSAGES[chatId] ?? []), msg];
    const chat = MOCK_CHATS.find((c) => c.id === chatId);
    if (chat) {
      chat.lastMessage = content;
      chat.lastMessageAt = msg.createdAt;
    }
    return delay(msg, 200);
  },
};
