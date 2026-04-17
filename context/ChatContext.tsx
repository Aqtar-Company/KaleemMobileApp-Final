import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { apiStream, TOKEN_KEY } from "@/services/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const CHAT_STORAGE_KEY = "kaleem_chat_messages";
const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "أهلاً بك في كليم AI! أنا مساعدك النفسي المتوافق مع قيمك الإسلامية. كيف يمكنني مساعدتك اليوم؟",
  timestamp: Date.now(),
};

const FALLBACK_RESPONSES = [
  "أفهم ما تمر به، وأنا هنا لأستمع إليك. كيف يمكنني مساعدتك أكثر؟",
  "شكراً لثقتك بي. ما تصفه يبدو صعباً، لكن تذكر أن طلب المساعدة هو علامة قوة.",
  "من المهم أن تعتني بصحتك النفسية. هل جربت التحدث مع أحد المتخصصين لدينا؟",
  "الصبر والدعاء يساعدان كثيراً في الأوقات الصعبة. أنت لست وحدك.",
  "لا تكن قاسياً على نفسك. كلنا نمر بأوقات صعبة.",
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fallbackIndex = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(CHAT_STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed: Message[] = JSON.parse(data);
          setMessages(parsed.length > 0 ? parsed : [WELCOME_MESSAGE]);
        } catch {
          setMessages([WELCOME_MESSAGE]);
        }
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    });
  }, []);

  const saveMessages = async (msgs: Message[]) => {
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
  };

  const sendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `${Date.now()}_user`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setIsTyping(true);

    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (token) {
      const assistantMsg: Message = {
        id: `${Date.now()}_ai`,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      const withAssistant = [...withUser, assistantMsg];
      setMessages(withAssistant);

      try {
        let accumulated = "";
        await apiStream("/chat/stream", { message: text }, (chunk) => {
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: accumulated } : m
            )
          );
        });

        if (!accumulated) {
          accumulated = FALLBACK_RESPONSES[fallbackIndex.current % FALLBACK_RESPONSES.length];
          fallbackIndex.current += 1;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: accumulated } : m
            )
          );
        }

        const final = [...withUser, { ...assistantMsg, content: accumulated }];
        await saveMessages(final);
      } catch {
        const fallback = FALLBACK_RESPONSES[fallbackIndex.current % FALLBACK_RESPONSES.length];
        fallbackIndex.current += 1;
        const fallbackMsg = { ...assistantMsg, content: fallback };
        const final = [...withUser, fallbackMsg];
        setMessages(final);
        await saveMessages(final);
      }
    } else {
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));
      const response = FALLBACK_RESPONSES[fallbackIndex.current % FALLBACK_RESPONSES.length];
      fallbackIndex.current += 1;
      const assistantMsg: Message = {
        id: `${Date.now()}_ai`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      const final = [...withUser, assistantMsg];
      setMessages(final);
      await saveMessages(final);
    }

    setIsTyping(false);
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([WELCOME_MESSAGE]));
  };

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
