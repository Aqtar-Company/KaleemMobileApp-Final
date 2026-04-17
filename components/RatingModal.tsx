import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface RatingModalProps {
  visible: boolean;
  consultantName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function RatingModal({ visible, consultantName, onClose, onSubmit }: RatingModalProps) {
  const colors = useColors();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);

  const LABELS = ["", "سيء", "مقبول", "جيد", "ممتاز", "رائع جداً"];

  const handleSubmit = () => {
    if (rating === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
    setHovered(0);
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setHovered(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.foreground }]}>
            قيّم جلستك مع {consultantName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            رأيك يساعدنا في تحسين الخدمة
          </Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  setRating(star);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onPressIn={() => setHovered(star)}
                onPressOut={() => setHovered(0)}
              >
                <Feather
                  name="star"
                  size={40}
                  color={
                    star <= (hovered || rating)
                      ? "#d4a853"
                      : colors.border
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          {(hovered || rating) > 0 && (
            <Text style={[styles.ratingLabel, { color: "#d4a853" }]}>
              {LABELS[hovered || rating]}
            </Text>
          )}

          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.foreground,
                borderRadius: colors.radius - 4,
              },
            ]}
            value={comment}
            onChangeText={setComment}
            placeholder="أضف تعليقاً (اختياري)..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={300}
            textAlign="right"
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: rating > 0 ? colors.primary : colors.muted,
                borderRadius: colors.radius,
              },
            ]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={[styles.submitBtnText, { color: rating > 0 ? "#fff" : colors.mutedForeground }]}>
              إرسال التقييم
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles.skipBtn}>
            <Text style={[styles.skipBtnText, { color: colors.mutedForeground }]}>لاحقاً</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: { width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 4 },
  starsRow: { flexDirection: "row", gap: 8, marginVertical: 4 },
  ratingLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  commentInput: {
    width: "100%",
    borderWidth: 1.5,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    marginTop: 4,
  },
  submitBtn: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  skipBtn: { paddingVertical: 8 },
  skipBtnText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
