import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Colors from '@/constants/Colors';
import { APP_NAME } from '@/constants/Config';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';
import Avatar from '@/components/ui/Avatar';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  async function onSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <Screen scroll>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Avatar url={user?.avatarUrl} name={user?.name ?? '?'} size={72} />
        <Text style={[styles.name, { color: c.text }]}>{user?.name}</Text>
        <Text style={{ color: c.textMuted }}>{user?.email}</Text>
      </View>

      <View style={[styles.section, { borderColor: c.border, backgroundColor: c.surface }]}>
        <Row icon="bell" label="Notifications" onPress={() => {}} />
        <Divider />
        <Row icon="lock" label="Privacy" onPress={() => {}} />
        <Divider />
        <Row icon="question-circle" label="Help & support" onPress={() => {}} />
        <Divider />
        <Row icon="info-circle" label={`About ${APP_NAME}`} onPress={() => {}} />
      </View>

      <View style={{ marginTop: 16 }}>
        <Button title="Sign out" variant="secondary" onPress={onSignOut} />
      </View>
    </Screen>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <FontAwesome name={icon} size={18} color={c.tint} style={{ width: 26 }} />
      <Text style={[styles.rowLabel, { color: c.text }]}>{label}</Text>
      <FontAwesome name="angle-right" size={18} color={c.textMuted} />
    </Pressable>
  );
}

function Divider() {
  const scheme = useColorScheme() ?? 'light';
  return <View style={{ height: 1, backgroundColor: Colors[scheme].border }} />;
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  name: { fontSize: 20, fontWeight: '700', marginTop: 6 },
  section: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowLabel: { flex: 1, fontSize: 15, marginLeft: 6 },
});
