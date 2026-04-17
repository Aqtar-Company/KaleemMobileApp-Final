import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const { user, loading } = useAuth();
  const scheme = useColorScheme() ?? 'light';

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors[scheme].background,
        }}>
        <ActivityIndicator color={Colors[scheme].tint} />
      </View>
    );
  }
  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}
