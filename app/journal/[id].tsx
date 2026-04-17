import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useJournal } from "@/context/JournalContext";

const TAGS = ["قلق", "عمل", "أسرة", "علاقات", "صحة", "امتنان", "تأمل", "أهداف"];

export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { addEntry, updateEntry, getEntry } = useJournal();
  const isNew = id === "new";
  const existing = isNew ? null : getEntry(id as string);

  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(existing?.tags || []);
  const [isDirty, setIsDirty] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert("تنبيه", "يرجى كتابة محتوى المذكرة");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isNew) {
      addEntry(title || "مذكرة بدون عنوان", content, selectedTags);
    } else {
      updateEntry(id as string, { title, content, tags: selectedTags });
    }
    router.back();
  };

  const handleBack = () => {
    if (isDirty) {
      Alert.alert("تجاهل التغييرات", "هل تريد الخروج دون الحفظ؟", [
        { text: "البقاء", style: "cancel" },
        { text: "خروج", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
    >
      <View
        style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity
          style={[styles.saveHeaderBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveHeaderBtnText}>حفظ</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isNew ? "مذكرة جديدة" : "تعديل المذكرة"}
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-right" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
          value={title}
          onChangeText={(t) => { setTitle(t); setIsDirty(true); }}
          placeholder="عنوان المذكرة..."
          placeholderTextColor={colors.mutedForeground}
          textAlign="right"
          maxLength={100}
        />

        <TextInput
          style={[styles.contentInput, { color: colors.foreground }]}
          value={content}
          onChangeText={(t) => { setContent(t); setIsDirty(true); }}
          placeholder={"اكتب ما يدور في ذهنك وقلبك...\n\nلا يوجد صح أو غلط هنا، هذا المكان خاص بك وحدك."}
          placeholderTextColor={colors.mutedForeground}
          multiline
          textAlign="right"
          textAlignVertical="top"
          maxLength={5000}
        />

        <View style={[styles.tagsSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.tagsSectionTitle, { color: colors.foreground }]}>الوسوم</Text>
          <View style={styles.tagsGrid}>
            {TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagBtn,
                  {
                    backgroundColor: selectedTags.includes(tag) ? colors.primary : colors.secondary,
                    borderRadius: 20,
                  },
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagBtnText, { color: selectedTags.includes(tag) ? "#fff" : colors.primary }]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
          {content.length} حرف
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  saveHeaderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  saveHeaderBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  content: { gap: 0 },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    textAlign: "right",
  },
  contentInput: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    paddingVertical: 16,
    lineHeight: 26,
    minHeight: 280,
    textAlign: "right",
  },
  tagsSection: { borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  tagsSectionTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "right" },
  tagsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  tagBtn: { paddingVertical: 6, paddingHorizontal: 14 },
  tagBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  wordCount: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", paddingVertical: 12 },
});
