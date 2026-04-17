import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

const MOOD_ICONS: Array<keyof typeof MaterialCommunityIcons.glyphMap> = [
  "emoticon-cry-outline",
  "emoticon-sad-outline",
  "emoticon-neutral-outline",
  "emoticon-happy-outline",
  "emoticon-excited-outline",
];

export const MOOD_COLORS = ["#e53e3e", "#f6ad55", "#d4a853", "#68d391", "#007A68"];
export const MOOD_LABELS = ["سيء جداً", "سيء", "مقبول", "جيد", "ممتاز"];

export function MoodIcon({
  level,
  size = 24,
  color,
}: {
  level: number;
  size?: number;
  color?: string;
}) {
  const idx = Math.max(0, Math.min(4, level - 1));
  const name = MOOD_ICONS[idx];
  const iconColor = color ?? MOOD_COLORS[idx];
  return <MaterialCommunityIcons name={name} size={size} color={iconColor} />;
}

export function getMoodIconName(level: number) {
  const idx = Math.max(0, Math.min(4, level - 1));
  return MOOD_ICONS[idx];
}
