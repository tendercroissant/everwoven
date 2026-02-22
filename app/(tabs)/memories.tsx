/**
 * Memories Screen — "Memories"
 * iOS-style large-title collapsing header:
 *   • Large title lives inside the scroll content
 *   • A compact sticky navbar fades in as you scroll past the title
 *   • Bottom safe area removed so content flows beneath the floating nav
 */

import { Brand, Layout } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import {
    Animated,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Palette ─────────────────────────────────────────────────────────────────
const Warm = {
    bg: '#F4F4F8',
    card: '#FFFFFF',
    text: Brand.navy,
    muted: Brand.mutedGrey,
    divider: Brand.separator,
};

// The scroll offset at which the compact navbar is fully opaque
const COLLAPSE_THRESHOLD = 72;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Entry {
    id: string;
    date: string;
    title: string;
    preview: string;
    shared: boolean;
    hasMedia?: boolean;
    imageUrl?: string;
}

interface MonthGroup {
    month: string;
    entries: Entry[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const JOURNAL_DATA: MonthGroup[] = [
    {
        month: 'OCTOBER 2023',
        entries: [
            {
                id: '1',
                date: 'Oct 24',
                title: 'Morning Coffee at The Roast',
                preview: 'We talked about the future today. It felt light, easy. The way the sun hit the table reminded me of how far we\'ve come...',
                shared: true,
            },
            {
                id: '2',
                date: 'Oct 22',
                title: 'Feeling a bit overwhelmed',
                preview: 'Work has been intense lately. I need to remember to breathe and maybe ask for a little more grace...',
                shared: false,
            },
            {
                id: '3',
                date: 'Oct 20',
                title: 'Sunday Picnic',
                preview: 'The weather was perfect. We found that little spot by the river again...',
                shared: true,
                imageUrl: 'https://picsum.photos/seed/picnic/400/400',
            },
            {
                id: '3b',
                date: 'Oct 14',
                title: 'Autumn Walk in the Park',
                preview: 'The leaves are fully turning now. We spent the whole afternoon just getting lost on the trails...',
                shared: true,
                imageUrl: 'https://picsum.photos/seed/autumn/400/400',
            },
        ],
    },
    {
        month: 'SEPTEMBER 2023',
        entries: [
            {
                id: '4',
                date: 'Sep 28',
                title: 'Movie Night In',
                preview: 'Bowed out of plans and stayed in. Sometimes the quiet nights are the best ones...',
                shared: true,
            },
            {
                id: '5',
                date: 'Sep 21',
                title: 'Long Walk at Sunset',
                preview: 'We walked for two hours and it still felt too short. The golden hour made everything look soft...',
                shared: false,
            },
        ],
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MonthDivider({ label }: { label: string }) {
    return (
        <View style={md.row}>
            <Text style={md.label}>{label}</Text>
            <View style={md.line} />
        </View>
    );
}

function EntryCard({ entry, onPress }: { entry: Entry; onPress: () => void }) {
    return (
        <TouchableOpacity style={ec.card} onPress={onPress} activeOpacity={0.85}>
            <View style={ec.topRow}>
                <Text style={ec.date}>{entry.date}</Text>
                <View style={[ec.badge, entry.shared ? ec.badgeShared : ec.badgePrivate]}>
                    <Text style={[ec.badgeText, entry.shared ? ec.badgeTextShared : ec.badgeTextPrivate]}>
                        {entry.shared ? 'SHARED' : 'PRIVATE'}
                    </Text>
                </View>
            </View>

            <View style={ec.contentRow}>
                <View style={{ flex: 1 }}>
                    <Text style={ec.title} numberOfLines={1}>{entry.title}</Text>
                    <Text style={ec.preview} numberOfLines={2}>{entry.preview}</Text>
                </View>
                {entry.imageUrl ? (
                    <Image source={{ uri: entry.imageUrl }} style={ec.mediaThumbnailImage} />
                ) : entry.hasMedia ? (
                    <View style={ec.mediaThumbnail}>
                        <Text style={{ fontSize: 22 }}>🌿</Text>
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MemoriesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Animated scroll value
    const scrollY = useRef(new Animated.Value(0)).current;

    // Screen fade-in — fires once on first mount only to avoid flicker on re-focus
    const fabScale = useRef(new Animated.Value(0)).current;
    const fabOpacity = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            // FAB pops in on every focus
            Animated.parallel([
                Animated.spring(fabScale, {
                    toValue: 1,
                    damping: 14,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fabOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
            return () => {
                fabScale.setValue(0);
                fabOpacity.setValue(0);
            };
        }, [])
    );

    // Compact navbar opacity: 0 → 1 as scrollY goes 0 → COLLAPSE_THRESHOLD
    const compactNavOpacity = scrollY.interpolate({
        inputRange: [0, COLLAPSE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // Compact navbar translateY: slides down into view
    const compactNavTranslateY = scrollY.interpolate({
        inputRange: [0, COLLAPSE_THRESHOLD],
        outputRange: [-8, 0],
        extrapolate: 'clamp',
    });

    // Large title opacity: fades out as compact nav fades in
    const largeTitleOpacity = scrollY.interpolate({
        inputRange: [0, COLLAPSE_THRESHOLD * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // Height of the compact sticky navbar (status bar + nav row)
    const compactNavHeight = insets.top + 52;

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" />

            {/* ── Compact sticky navbar (appears on scroll) ── */}
            <Animated.View
                style={[
                    s.compactNav,
                    {
                        height: compactNavHeight,
                        paddingTop: insets.top,
                        opacity: compactNavOpacity,
                        transform: [{ translateY: compactNavTranslateY }],
                    },
                ]}
                pointerEvents="none"
            >
                <View style={s.compactNavInner}>
                    <Text style={s.compactNavTitle}>Memories</Text>
                </View>
            </Animated.View>

            {/* ── Scroll content ── */}
            <Animated.ScrollView
                contentContainerStyle={[
                    s.scroll,
                    { paddingTop: Platform.OS === 'android' ? 40 : insets.top + 8 },
                ]}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* ── Large title header (inline, fades out) ── */}
                <Animated.View style={[s.largeHeader, { opacity: largeTitleOpacity }]}>
                    <Text style={s.largeTitleText}>Memories</Text>
                    <TouchableOpacity style={s.searchBtn}>
                        <Search color={Warm.text} size={24} strokeWidth={Brand.iconStrokeWidth} />
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Entry groups ── */}
                {JOURNAL_DATA.map((group) => (
                    <View key={group.month}>
                        <MonthDivider label={group.month} />
                        {group.entries.map((entry) => (
                            <View key={entry.id} style={ec.cardWrapper}>
                                <EntryCard
                                    entry={entry}
                                    onPress={() => router.push('/journal-entry')}
                                />
                            </View>
                        ))}
                    </View>
                ))}

                {/* Bottom padding for floating nav */}
                <View style={{ height: 120 }} />
            </Animated.ScrollView>

            {/* ── Floating Action Button (pops in when focused) ── */}
            <Animated.View
                style={[
                    s.fabWrapper,
                    {
                        opacity: fabOpacity,
                        transform: [{ scale: fabScale }],
                    },
                ]}
            >
                <TouchableOpacity
                    style={s.fab}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/journal-entry');
                    }}
                    activeOpacity={0.85}
                >
                    <Text style={s.fabIcon}>＋</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Warm.bg,
    },

    // ── Compact sticky navbar ──
    compactNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: Warm.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Warm.divider,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Layout.screenPadding,
        marginTop: 60,
    },
    compactNavInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactNavTitle: {
        fontSize: 17,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: Warm.text,
        letterSpacing: 0.2,
    },

    // ── Large title ──
    largeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        paddingTop: 4,
    },
    largeTitleText: {
        fontSize: 26,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: Warm.text,
        letterSpacing: -0.5,
    },
    searchBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchIcon: {
        fontSize: 20,
        color: Warm.text,
    },

    // ── Scroll ──
    scroll: {
        paddingHorizontal: Layout.screenPadding,
        paddingBottom: 20,
    },

    // ── FAB (aligned with tab bar, separate on right) ──
    fabWrapper: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 41 : 29,
        right: 22,
    },
    fab: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Brand.blue,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Brand.blue,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: '300',
        lineHeight: 32,
    },
});

const md = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
        marginTop: 24,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.8,
        color: Warm.muted,
        textTransform: 'uppercase',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Warm.divider,
    },
});

const ec = StyleSheet.create({
    cardWrapper: {
        backgroundColor: Warm.card,
        borderRadius: 20,
        marginBottom: 14,
        shadowColor: '#2C2018',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    card: {
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    date: {
        fontSize: 12,
        color: Warm.muted,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    badgeShared: { backgroundColor: Brand.blueMuted },
    badgePrivate: { backgroundColor: '#F0F0F4' },
    badgeIcon: { fontSize: 11 },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    badgeTextShared: { color: Brand.blue },
    badgeTextPrivate: { color: Warm.muted },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: Warm.text,
        marginBottom: 8,
        lineHeight: 24,
    },
    preview: {
        fontSize: 14,
        color: Warm.muted,
        lineHeight: 22,
    },
    mediaThumbnail: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: Brand.blueMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mediaThumbnailImage: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: Brand.blueMuted,
    },
});
