import React from 'react';
import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type Props = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
};

export default function Screen({
  children,
  scroll,
  padded = true,
  style,
  ...rest
}: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const content = (
    <View
      style={[padded && styles.padded, { flex: scroll ? undefined : 1 }, style]}
      {...rest}>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  padded: { padding: 16 },
});
