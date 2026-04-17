export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: 'user' | 'consultant' | 'admin';
};

export type AuthSession = {
  token: string;
  user: User;
};

export type Consultant = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  specialty: string;
  bio?: string;
  rating?: number;
  reviewsCount?: number;
  pricePerHour?: number;
  online?: boolean;
  languages?: string[];
};

export type ChatSummary = {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantAvatarUrl?: string | null;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  mine?: boolean;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
