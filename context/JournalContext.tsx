import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: number;
  date: string;
  timestamp: number;
  tags: string[];
}

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (title: string, content: string, tags?: string[], mood?: number) => JournalEntry;
  updateEntry: (id: string, data: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => JournalEntry | undefined;
}

const JournalContext = createContext<JournalContextType>({
  entries: [],
  addEntry: () => ({ id: "", title: "", content: "", date: "", timestamp: 0, tags: [] }),
  updateEntry: () => {},
  deleteEntry: () => {},
  getEntry: () => undefined,
});

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("kaleem_journal").then((v) => {
      if (v) setEntries(JSON.parse(v));
    });
  }, []);

  const save = (next: JournalEntry[]) => {
    setEntries(next);
    AsyncStorage.setItem("kaleem_journal", JSON.stringify(next));
  };

  const addEntry = (title: string, content: string, tags: string[] = [], mood?: number) => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      title,
      content,
      mood,
      date: new Date().toLocaleDateString("ar-SA"),
      timestamp: Date.now(),
      tags,
    };
    save([entry, ...entries]);
    return entry;
  };

  const updateEntry = (id: string, data: Partial<JournalEntry>) => {
    save(entries.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const deleteEntry = (id: string) => {
    save(entries.filter((e) => e.id !== id));
  };

  const getEntry = (id: string) => entries.find((e) => e.id === id);

  return (
    <JournalContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry, getEntry }}>
      {children}
    </JournalContext.Provider>
  );
}

export const useJournal = () => useContext(JournalContext);
