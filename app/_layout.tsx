/**
 * Root layout — wraps everything in BarProvider so any screen
 * can drive the DynamicFloatingBar. The bar itself lives here
 * so it persists across (tabs) ↔ journal-entry navigation.
 *
 * activeTab is derived from usePathname() (not local state) so
 * the highlighted icon stays correct after back gestures, swipe
 * dismiss, deep links, or any other navigation method.
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { DynamicFloatingBar, TabName } from '@/components/dynamic-floating-bar';
import { BarProvider } from '@/context/bar-context';
import { SubscriptionProvider } from '@/context/subscription-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};




/** Map the current pathname to a tab name. */
function pathnameToTab(pathname: string): TabName {
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/profile')) return 'profile';
  if (pathname.includes('/memories')) return 'memories';
  if (pathname.includes('/calendar')) return 'calendar';
  // /journal and /journal-entry are NOT tabs — stay on 'home'
  return 'home';
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  // Derived — no setState needed; always in sync with the real route
  const activeTab = useMemo<TabName>(() => pathnameToTab(pathname), [pathname]);

  function handleTabPress(tab: TabName) {
    if (tab === 'home') router.navigate('/');
    if (tab === 'calendar') router.navigate('/(tabs)/calendar');
    if (tab === 'memories') router.navigate('/(tabs)/memories');
    if (tab === 'messages') router.navigate('/(tabs)/messages');
    if (tab === 'profile') router.navigate('/(tabs)/profile');
  }

  return (
    <SubscriptionProvider>
      <BarProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={styles.root}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="journal-entry"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="thread"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen
                name="paywall"
                options={{ headerShown: false, presentation: 'fullScreenModal' }}
              />
              <Stack.Screen
                name="settings"
                options={{ headerShown: false, presentation: 'fullScreenModal' }}
              />
              <Stack.Screen
                name="notifications"
                options={{ headerShown: false, presentation: 'fullScreenModal' }}
              />
            </Stack>

            {/* Single floating bar — lives above all screens except full-screen modals */}
            {!pathname.includes('/paywall') && !pathname.includes('/settings') && !pathname.includes('/notifications') && !pathname.includes('/thread') && (
              <DynamicFloatingBar activeTab={activeTab} onTabPress={handleTabPress} />
            )}
          </View>

          <StatusBar style="auto" />
        </ThemeProvider>
      </BarProvider>
    </SubscriptionProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
