import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const bg =
    variant === 'primary'
      ? c.tint
      : variant === 'secondary'
      ? c.surface
      : 'transparent';
  const border =
    variant === 'secondary' ? c.border : variant === 'ghost' ? 'transparent' : c.tint;
  const color = variant === 'primary' ? '#fff' : c.tint;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <Text style={[styles.text, { color }]}>{title}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, fontWeight: '600' },
});
