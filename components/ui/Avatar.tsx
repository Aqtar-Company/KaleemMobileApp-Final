import { Image, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function Avatar({
  url,
  name,
  size = 40,
}: {
  url?: string | null;
  name: string;
  size?: number;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: c.tint,
        },
      ]}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
