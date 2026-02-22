/**
 * Messages Screen — "Couples Messages Feed"
 * Mirrors Journal List structure: iOS-style large title, compact nav on scroll,
 * conversation cards with RECENT/EARLIER sections.
 */

import { Brand, Layout } from '@/constants/theme';
import { Search, User } from 'lucide-react-native';
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
    text: Brand.navy,
    muted: Brand.mutedGrey,
    divider: Brand.separator,
};

const COLLAPSE_THRESHOLD = 72;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread?: boolean;
}

interface Section {
    label: string;
    conversations: Conversation[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MESSAGES_DATA: Section[] = [
    {
        label: 'RECENT',
        conversations: [
            {
                id: '1',
                name: 'Morning thoughts 💭',
                lastMessage: 'That cafe you mentioned sounds perfect. When are we going?',
                timestamp: '2m',
                unread: true,
            },
            {
                id: '2',
                name: 'Weekend plans 🌿',
                lastMessage: 'I found that picnic spot by the river. Ready for Sunday?',
                timestamp: '1h',
            },
        ],
    },
    {
        label: 'EARLIER',
        conversations: [
            {
                id: '3',
                name: 'Date night ideas',
                lastMessage: 'The new place downtown has great reviews...',
                timestamp: 'Yesterday',
            },
            {
                id: '4',
                name: 'House projects',
                lastMessage: 'Paint samples came in. The sage one is my favorite.',
                timestamp: 'Mon',
            },
        ],
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
    return (
        <View style={sd.row}>
            <Text style={sd.label}>{label}</Text>
            <View style={sd.line} />
        </View>
    );
}

function ConversationCard({ conv, onPress }: { conv: Conversation; onPress: () => void }) {
    return (
        <TouchableOpacity style={cc.cardWrapper} onPress={onPress} activeOpacity={0.85}>
            <View style={cc.topRow}>
                <View style={cc.avatarRow}>
                    <View style={cc.avatar}>
                        <User size={22} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />
                    </View>
                    <View style={cc.nameCol}>
                        <Text style={cc.name} numberOfLines={1}>{conv.name}</Text>
                        <Text style={cc.preview} numberOfLines={1}>{conv.lastMessage}</Text>
                    </View>
                </View>
                <View style={cc.rightCol}>
                    <Text style={cc.timestamp}>{conv.timestamp}</Text>
                    {conv.unread && <View style={cc.unreadDot} />}
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
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
                    <Text style={s.compactNavTitle}>Messages</Text>
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
                    <Text style={s.largeTitleText}>Messages</Text>
                    <TouchableOpacity style={s.searchBtn}>
                        <Search color={C.text} size={24} strokeWidth={Brand.iconStrokeWidth} />
                    </TouchableOpacity>
                </Animated.View>

                {MESSAGES_DATA.map((section) => (
                    <View key={section.label}>
                        <SectionDivider label={section.label} />
                        {section.conversations.map((conv) => (
                            <ConversationCard
                                key={conv.id}
                                conv={conv}
                                onPress={() => { }}
                            />
                        ))}
                    </View>
                ))}

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
    largeTitleText: {
        fontSize: 26,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        letterSpacing: -0.5,
    },
    searchBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
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

const cc = StyleSheet.create({
    cardWrapper: {
        backgroundColor: C.card,
        borderRadius: 20,
        marginBottom: 14,
        paddingHorizontal: 20,
        paddingVertical: 18,
        shadowColor: '#2C2018',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatarRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Layout.screenPadding,
        marginRight: 14,
    },
    nameCol: { flex: 1 },
    name: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        marginBottom: 4,
    },
    preview: { fontSize: 14, color: C.muted, lineHeight: 20 },
    rightCol: { alignItems: 'flex-end', marginLeft: 12 },
    timestamp: { fontSize: 12, color: C.muted, marginBottom: 4 },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Brand.blue,
    },
});
