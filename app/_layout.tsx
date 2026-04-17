import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { I18nManager } from "react-native";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Silence the harmless "Unable to activate keep awake" rejection that
// expo-router emits during dev when the native keep-awake module races
// its own registration. The actual functionality is unaffected.
const origUnhandled = (global as unknown as {
  HermesInternal?: { enablePromiseRejectionTracker?: (opts: unknown) => void };
}).HermesInternal?.enablePromiseRejectionTracker;
if (origUnhandled) {
  origUnhandled({
    allRejections: true,
    onUnhandled: (_id: number, err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Unable to activate keep awake")) return;
      // eslint-disable-next-line no-console
      console.warn("Unhandled promise rejection:", msg);
    },
  });
}

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { JournalProvider } from "@/context/JournalContext";
import { MoodProvider } from "@/context/MoodContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { useAutoUpdate } from "@/lib/useAutoUpdate";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="consultants/index" />
      <Stack.Screen name="consultants/[id]" />
      <Stack.Screen name="services/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="consultations/index" />
      <Stack.Screen name="consultations/[id]" />
      <Stack.Screen name="sessions/report/[id]" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="mood/index" />
      <Stack.Screen name="journal/index" />
      <Stack.Screen name="journal/[id]" />
      <Stack.Screen name="schedule" />
    </Stack>
  );
}

export default function RootLayout() {
  useAutoUpdate();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1, direction: "rtl" }}>
            <AuthProvider>
              <NotificationsProvider>
                <FavoritesProvider>
                  <MoodProvider>
                    <JournalProvider>
                      <ChatProvider>
                        <RootLayoutNav />
                      </ChatProvider>
                    </JournalProvider>
                  </MoodProvider>
                </FavoritesProvider>
              </NotificationsProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
