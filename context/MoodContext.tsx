import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  note: string;
  timestamp: number;
}

interface MoodContextType {
  entries: MoodEntry[];
  addEntry: (mood: MoodLevel, note: string) => void;
  todayEntry: MoodEntry | null;
}

const MoodContext = createContext<MoodContextType>({
  entries: [],
  addEntry: () => {},
  todayEntry: null,
});

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("kaleem_moods").then((v) => {
      if (v) setEntries(JSON.parse(v));
    });
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === todayStr) || null;

  const addEntry = (mood: MoodLevel, note: string) => {
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: todayStr,
      mood,
      note,
      timestamp: Date.now(),
    };
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== todayStr);
      const next = [entry, ...filtered];
      AsyncStorage.setItem("kaleem_moods", JSON.stringify(next));
      return next;
    });
  };

  return (
    <MoodContext.Provider value={{ entries, addEntry, todayEntry }}>
      {children}
    </MoodContext.Provider>
  );
}

export const useMood = () => useContext(MoodContext);
