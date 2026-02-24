/**
 * DynamicFloatingBar
 *
 * A single floating bar at the root layout level. Fixed position in both modes.
 * When the user taps the plus (new entry), the pill background turns blue and
 * the icons are replaced with "Save Entry" — same slot, cohesive transition. (HMR refresh)
 *
 *   'nav'     → pale pill + 4 icons
 *   'journal' → blue pill + "Save Entry" (whole pill is the CTA)
 */

import { Brand } from '@/constants/theme';
import { useBar } from '@/context/bar-context';
import * as Haptics from 'expo-haptics';
import { BookHeart, CalendarDays, Home, Spool, User } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
    pill: '#FFFFFF',
    accent: Brand.blue,
    accentMuted: Brand.blueMuted,
    muted: Brand.mutedGrey,
    text: Brand.navy,
    toggleBg: '#E8EFF5',
    toggleActive: '#FFFFFF',
};

// Matches FloatingNavBar position exactly
const BOTTOM = Platform.OS === 'ios' ? 36 : 24;

// Nav bar sizes
const NAV_PILL_H = 64;    // pill height in nav mode
const NAV_PILL_PH = 8;     // paddingHorizontal of pill in nav mode
const NAV_PILL_PV = 10;    // paddingVertical of pill in nav mode

// Journal bar (same height as nav)
const BAR_COLLAPSED_H = 64;

// Fixed pill width — same in both modes so bar stays aligned
const PILL_MIN_WIDTH = 270;

// Nav tabs
const TABS = [
    { name: 'home' as const, icon: Home },
    { name: 'calendar' as const, icon: CalendarDays },
    { name: 'memories' as const, icon: BookHeart },
    { name: 'messages' as const, icon: Spool },
    { name: 'profile' as const, icon: User },
] as const;

export type TabName = typeof TABS[number]['name'];

interface Props {
    activeTab: TabName;
    onTabPress: (tab: TabName) => void;
}

export function DynamicFloatingBar({ activeTab, onTabPress }: Props) {
    const { mode, journalProps } = useBar();

    const { width } = useWindowDimensions();

    // ── Mode transition animation (0 = nav, 1 = journal) ─────────────────────
    const modeAnim = useRef(new Animated.Value(0)).current;

    // ── Tab position: 0 = centered, 1 = left (memories list only; journal entry = center) ─
    const shouldBeLeft = mode === 'nav' && activeTab === 'memories';
    const tabPositionAnim = useRef(new Animated.Value(shouldBeLeft ? 1 : 0)).current;

    // ── Animate between nav ↔ journal ─────────────────────────────────────────
    useEffect(() => {
        const toValue = mode === 'journal' ? 1 : 0;
        Animated.spring(modeAnim, {
            toValue,
            damping: 22,
            stiffness: 220,
            useNativeDriver: false,
        }).start();
    }, [mode]);

    // ── Animate tab bar position ──────────────────────────────────────────────
    useEffect(() => {
        const toValue = (mode === 'nav' && activeTab === 'memories') ? 1 : 0;
        Animated.timing(tabPositionAnim, {
            toValue,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [mode, activeTab]);

    function handleSave() {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        journalProps?.onSave();
    }

    // ── Interpolated values ───────────────────────────────────────────────────

    const pillBg = modeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [C.pill, C.accent],
    });

    // Content swap: nav icons fade out, journal content fades in
    const navOpacity = modeAnim.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' });
    const journalOpacity = modeAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0, 1], extrapolate: 'clamp' });

    const barHeight = modeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [NAV_PILL_H, BAR_COLLAPSED_H],
    });

    // Pill slides left when on memories tab
    const pillTranslateX = tabPositionAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -(width / 2 - PILL_MIN_WIDTH / 2 - 20)],
    });

    return (
        <View
            style={[s.wrapper, { bottom: BOTTOM }]}
            pointerEvents="box-none"
        >
            {/* ── Pill: slides left on journal, outer has shadow, inner clips ── */}
            <Animated.View
                style={[
                    s.pillOuter,
                    {
                        height: barHeight,
                        shadowColor: C.accent,
                        transform: [{ translateX: pillTranslateX }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        s.pillInner,
                        {
                            height: barHeight,
                            backgroundColor: pillBg,
                        },
                    ]}
                >
                    {/* ── NAV CONTENT ─────────────────────────────────────────── */}
                    <Animated.View
                        style={[s.navContent, { opacity: navOpacity }]}
                        pointerEvents={mode === 'nav' ? 'auto' : 'none'}
                    >
                        {TABS.map((tab) => {
                            const isActive = tab.name === activeTab;
                            return (
                                <TouchableOpacity
                                    key={tab.name}
                                    style={[s.iconBtn]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        onTabPress(tab.name);
                                    }}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityLabel={tab.name}
                                    accessibilityState={{ selected: isActive }}
                                >
                                    <tab.icon
                                        size={22}
                                        color={isActive ? C.accent : C.muted}
                                        strokeWidth={isActive ? Brand.iconStrokeWidth + 0.5 : Brand.iconStrokeWidth}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </Animated.View>

                    {/* ── JOURNAL CONTENT ─────────────────────────────────────── */}
                    <Animated.View
                        style={[s.journalContent, { opacity: journalOpacity }]}
                        pointerEvents={mode === 'journal' ? 'auto' : 'none'}
                    >
                        <TouchableOpacity
                            style={s.saveArea}
                            activeOpacity={0.85}
                            onPress={handleSave}
                        >
                            <Text style={s.saveLabel}>Save Entry</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Animated.View>

        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },

    pillOuter: {
        minWidth: PILL_MIN_WIDTH,
        borderRadius: 100,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
    },
    pillInner: {
        flex: 1,
        borderRadius: 100,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },

    // ── Nav content ────────────────────────────────────────────────────────────
    navContent: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingHorizontal: NAV_PILL_PH,
        paddingVertical: NAV_PILL_PV,
    },
    iconBtn: {
        width: 42,
        height: 44,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Journal content ────────────────────────────────────────────────────────
    journalContent: {
        ...StyleSheet.absoluteFillObject,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },

    saveArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    saveLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

});
