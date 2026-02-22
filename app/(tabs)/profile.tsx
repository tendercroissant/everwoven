/**
 * Profile Screen — "EverWoven Couple Profile"
 * Displays the user's statistics (Days Together, total memories)
 * and navigates to the paywall or other settings. (HMR refresh): #F4F4F8 bg, cards with subtle shadow.
 */

import { Brand, Layout } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Heart, Settings, Sparkles, User } from 'lucide-react-native';
import React, { useRef } from 'react';
import {
    Animated,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
    bg: '#F4F4F8',
    card: '#FFFFFF',
    cardDeep: '#EEF0F6',
    text: Brand.navy,
    muted: Brand.mutedGrey,
    divider: Brand.separator,
};

const DAYS_TOGETHER = 732;

const PREMIUM_ITEMS = [
    { label: 'Relationship Insights' },
    { label: 'Memory Timeline' },
];

const COLLAPSE_THRESHOLD = 72;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
    return (
        <View style={sd.row}>
            <Text style={sd.label}>{label}</Text>
            <View style={sd.line} />
        </View>
    );
}

function PremiumRow({
    label,
    isLast,
    onPress,
}: {
    label: string;
    isLast?: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[pr.row, isLast && pr.rowLast]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <Text style={[pr.label, pr.labelLocked]}>{label}</Text>
            <View style={[pr.premiumBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <Sparkles size={10} color="#FFFFFF" strokeWidth={2} />
                <Text style={[pr.premiumBadgeText, { marginBottom: 0 }]}>PREMIUM</Text>
            </View>
        </TouchableOpacity>
    );
}

function PremiumPromoBanner({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity style={promo.card} onPress={onPress} activeOpacity={0.82}>
            <View style={promo.left}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Sparkles size={11} color={Brand.blue} strokeWidth={Brand.iconStrokeWidth} />
                    <Text style={[promo.eyebrow, { marginBottom: 0 }]}>EVERWOVEN PREMIUM</Text>
                </View>
                <Text style={promo.title}>Unlock your full journey</Text>
                <Text style={promo.sub}>Insights, timelines & unlimited memories</Text>
            </View>
            <View style={promo.pill}>
                <Text style={promo.pillText}>Try Free</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const scrollY = useRef(new Animated.Value(0)).current;

    const compactNavOpacity = scrollY.interpolate({
        inputRange: [0, COLLAPSE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    const compactNavTranslateY = scrollY.interpolate({
        inputRange: [0, COLLAPSE_THRESHOLD],
        outputRange: [-8, 0],
        extrapolate: 'clamp',
    });
    const largeTitleOpacity = scrollY.interpolate({
        inputRange: [0, COLLAPSE_THRESHOLD * 0.6],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const compactNavHeight = insets.top + 52;

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" />

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
                    <Text style={s.compactNavTitle}>Profile</Text>
                </View>
            </Animated.View>

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
                <Animated.View style={[s.largeHeader, { opacity: largeTitleOpacity }]}>
                    <Text style={s.largeTitleText}>Profile</Text>
                    <TouchableOpacity
                        style={s.iconBtn}
                        onPress={() => router.push('/settings')}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Settings color={C.text} size={24} strokeWidth={Brand.iconStrokeWidth} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Couple avatars */}
                <View style={av.wrapper}>
                    <View style={av.row}>
                        <View style={av.avatar}>
                            <User size={24} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />
                        </View>
                        <View style={av.dashedLine}>
                            <View style={av.dash} />
                            <Heart size={18} color="#E8A7A6" fill="#E8A7A6" strokeWidth={Brand.iconStrokeWidth} />
                            <View style={av.dash} />
                        </View>
                        <View style={av.avatar}>
                            <User size={24} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />
                        </View>
                    </View>
                    <Text style={av.names}>Alex & Jordan</Text>
                </View>

                {/* Days Together */}
                <View style={dt.card}>
                    <Text style={dt.number}>{DAYS_TOGETHER}</Text>
                    <Text style={dt.label}>DAYS TOGETHER</Text>
                </View>

                {/* Premium promo */}
                <PremiumPromoBanner onPress={() => router.push({ pathname: '/paywall', params: { from: 'profile' } })} />

                {/* Premium options */}
                <SectionDivider label="FEATURES" />
                <View style={pr.card}>
                    {PREMIUM_ITEMS.map((item, i) => (
                        <PremiumRow
                            key={item.label}
                            label={item.label}
                            isLast={i === PREMIUM_ITEMS.length - 1}
                            onPress={() => router.push({ pathname: '/paywall', params: { from: 'profile' } })}
                        />
                    ))}
                </View>

                <View style={{ height: 120 }} />
            </Animated.ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    compactNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: C.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.divider,
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
        color: C.text,
        letterSpacing: 0.2,
    },
    largeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        paddingTop: 4,
    },
    iconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: { fontSize: 16 },
    largeTitleText: {
        fontSize: 26,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        letterSpacing: -0.5,
    },
    scroll: { paddingHorizontal: Layout.screenPadding, paddingBottom: 20 },
});

const sd = StyleSheet.create({
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
        color: C.muted,
        textTransform: 'uppercase',
    },
    line: { flex: 1, height: 1, backgroundColor: C.divider },
});

const pr = StyleSheet.create({
    card: {
        backgroundColor: C.card,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#2C2018',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.screenPadding,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text,
    },
    labelLocked: { color: C.muted },
    premiumBadge: {
        backgroundColor: Brand.blue,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    premiumBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
});

const av = StyleSheet.create({
    wrapper: { alignItems: 'center', marginBottom: 28 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: C.cardDeep,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dashedLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dash: {
        width: 40,
        height: 1.5,
        backgroundColor: C.muted,
        borderRadius: 1,
    },
    names: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text,
        marginTop: 12,
    },
});

const dt = StyleSheet.create({
    card: {
        backgroundColor: C.card,
        borderRadius: 22,
        padding: 24,
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#2C2018',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    number: {
        fontSize: 48,
        fontWeight: '200',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        letterSpacing: -2,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.8,
        color: C.muted,
        textTransform: 'uppercase',
        marginTop: 8,
    },
});

const promo = StyleSheet.create({
    card: {
        backgroundColor: C.card,
        borderRadius: 22,
        padding: 18,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#DDE8F2',
        shadowColor: C.text,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    left: { flex: 1, paddingRight: 12 },
    eyebrow: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 2,
        color: Brand.blue,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        marginBottom: 3,
        letterSpacing: -0.3,
    },
    sub: {
        fontSize: 12,
        color: C.muted,
        lineHeight: 17,
    },
    pill: {
        backgroundColor: Brand.blue,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 100,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});

