import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  Text,
  View,
} from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

export default function Input({ label, error, style, ...rest }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: c.textMuted }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={c.textMuted}
        style={[
          styles.input,
          {
            color: c.text,
            backgroundColor: c.surface,
            borderColor: error ? c.danger : c.border,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { fontSize: 12, marginTop: 4 },
});
