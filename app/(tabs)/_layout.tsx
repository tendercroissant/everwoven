/**
 * (tabs)/_layout.tsx
 * Native tab bar hidden. Navigation is handled by the DynamicFloatingBar
 * in the root layout — no local FloatingNavBar needed here anymore.
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        tabBar={() => null}
        detachInactiveScreens={false}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          animation: 'none',
          lazy: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
        <Tabs.Screen name="memories" options={{ title: 'Memories' }} />
        <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        {/* explore kept as a registered route — reachable from Home */}
        <Tabs.Screen name="explore" options={{ title: 'Explore', href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
