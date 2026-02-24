/**
 * Messages Screen — "The Thread"
 * Overview screen showing conversation stats, daily prompts,
 * and the list of threads. Tapping a prompt pre-fills it in
 * the Thread screen. Tapping a conversation opens the Thread.
 *
 * Layout:
 *  • iOS-style collapsing large title
 *  • Stats chips row (messages, streak, prompts used)
 *  • Horizontally-scrollable daily prompt cards
 *  • Sectioned conversation list
 */

import { Brand, Layout } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Flame, MessageCircle, Sparkles } from 'lucide-react-native';
import React, { useRef } from 'react';
import {
    Animated,
    Platform,
    ScrollView,
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
    accent: Brand.blue,
    accentMuted: Brand.blueMuted,
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

const STATS = {
    totalMessages: 1248,
    streakDays: 14,
    promptsUsed: 32,
};

const DAILY_PROMPTS = [
    { id: 'p1', emoji: '☕', text: 'What made you smile today?' },
    { id: 'p2', emoji: '🌿', text: "Something you've been meaning to share?" },
    { id: 'p3', emoji: '💭', text: 'What are you looking forward to this week?' },
    { id: 'p4', emoji: '🌙', text: 'How are you really feeling right now?' },
    { id: 'p5', emoji: '✨', text: 'Name one thing you appreciate about us.' },
];

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

function StatChip({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: string;
    label: string;
}) {
    return (
        <View style={chip.wrapper}>
            <View style={chip.iconWrap}>{icon}</View>
            <Text style={chip.value}>{value}</Text>
            <Text style={chip.label}>{label}</Text>
        </View>
    );
}

function PromptCard({
    prompt,
    onPress,
}: {
    prompt: typeof DAILY_PROMPTS[0];
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={pc.card} onPress={onPress} activeOpacity={0.82}>
            <Text style={pc.emoji}>{prompt.emoji}</Text>
            <Text style={pc.text}>{prompt.text}</Text>
            <View style={pc.sendPill}>
                <Text style={pc.sendText}>Send</Text>
            </View>
        </TouchableOpacity>
    );
}

function SectionDivider({ label }: { label: string }) {
    return (
        <View style={sd.row}>
            <Text style={sd.label}>{label}</Text>
            <View style={sd.line} />
        </View>
    );
}

function ConversationCard({
    conv,
    onPress,
}: {
    conv: Conversation;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={cc.card} onPress={onPress} activeOpacity={0.85}>
            {/* Avatar */}
            <View style={cc.avatar}>
                <Text style={cc.avatarInitial}>
                    {conv.name.charAt(0).toUpperCase()}
                </Text>
                {conv.unread && <View style={cc.unreadRing} />}
            </View>

            {/* Text */}
            <View style={cc.nameCol}>
                <View style={cc.nameRow}>
                    <Text style={[cc.name, conv.unread && cc.nameUnread]} numberOfLines={1}>
                        {conv.name}
                    </Text>
                    <Text style={[cc.timestamp, conv.unread && cc.timestampUnread]}>
                        {conv.timestamp}
                    </Text>
                </View>
                <Text
                    style={[cc.preview, conv.unread && cc.previewUnread]}
                    numberOfLines={1}
                >
                    {conv.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MessagesScreen() {
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

    function openThread(convId: string, convName: string, prompt?: string) {
        router.push({
            pathname: '/thread',
            params: { id: convId, name: convName, ...(prompt ? { prompt } : {}) },
        });
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" />

            {/* ── Compact sticky navbar ── */}
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
                {/* ── Large title ── */}
                <Animated.View style={[s.largeHeader, { opacity: largeTitleOpacity }]}>
                    <Text style={s.largeTitleText}>Messages</Text>
                </Animated.View>

                {/* ── Stats chips ── */}
                <View style={s.statsRow}>
                    <StatChip
                        icon={<MessageCircle size={16} color={C.accent} strokeWidth={2} />}
                        value={STATS.totalMessages.toLocaleString()}
                        label="messages"
                    />
                    <View style={s.statsDivider} />
                    <StatChip
                        icon={<Flame size={16} color="#E8855A" strokeWidth={2} />}
                        value={`${STATS.streakDays}d`}
                        label="streak"
                    />
                    <View style={s.statsDivider} />
                    <StatChip
                        icon={<Sparkles size={16} color={C.accent} strokeWidth={2} />}
                        value={String(STATS.promptsUsed)}
                        label="prompts"
                    />
                </View>

                {/* ── Daily Prompts ── */}
                <View style={s.sectionHeader}>
                    <Text style={s.sectionTitle}>TODAY'S PROMPTS</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.promptsScroll}
                    style={s.promptsScrollTrack}
                >
                    {DAILY_PROMPTS.map((p) => (
                        <PromptCard
                            key={p.id}
                            prompt={p}
                            onPress={() => openThread('1', 'Morning thoughts 💭', p.text)}
                        />
                    ))}
                </ScrollView>

                {/* ── Conversation sections ── */}
                {MESSAGES_DATA.map((section) => (
                    <View key={section.label}>
                        <SectionDivider label={section.label} />
                        {section.conversations.map((conv) => (
                            <ConversationCard
                                key={conv.id}
                                conv={conv}
                                onPress={() => openThread(conv.id, conv.name)}
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
        top: 0, left: 0, right: 0,
        zIndex: 10,
        backgroundColor: C.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.divider,
    },
    compactNavInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
        marginBottom: 20,
        paddingTop: 4,
    },
    largeTitleText: {
        fontSize: 26,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        letterSpacing: -0.5,
    },

    scroll: { paddingHorizontal: Layout.screenPadding, paddingBottom: 20 },

    // ── Stats ──
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.card,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 28,
        shadowColor: '#1E2D3D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    statsDivider: {
        width: 1,
        height: 32,
        backgroundColor: C.divider,
        marginHorizontal: 16,
    },

    // ── Section header ──
    sectionHeader: { marginBottom: 10 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.8,
        color: C.muted,
    },

    // ── Prompts ──
    promptsScrollTrack: { marginHorizontal: -Layout.screenPadding, marginBottom: 8 },
    promptsScroll: {
        paddingHorizontal: Layout.screenPadding,
        paddingBottom: 4,
        gap: 12,
    },
});

const chip = StyleSheet.create({
    wrapper: { flex: 1, alignItems: 'center', gap: 4 },
    iconWrap: { marginBottom: 2 },
    value: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        letterSpacing: -0.5,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        color: C.muted,
        textTransform: 'lowercase',
    },
});

const pc = StyleSheet.create({
    card: {
        width: 160,
        backgroundColor: C.card,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1.5,
        borderColor: '#DDE8F2',
        shadowColor: '#1E2D3D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        gap: 8,
    },
    emoji: { fontSize: 24 },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: C.text,
        lineHeight: 20,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    sendPill: {
        alignSelf: 'flex-start',
        backgroundColor: C.accentMuted,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
        marginTop: 4,
    },
    sendText: {
        fontSize: 12,
        fontWeight: '700',
        color: C.accent,
        letterSpacing: 0.2,
    },
});

const sd = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
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
    card: {
        backgroundColor: C.card,
        borderRadius: 20,
        marginBottom: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        shadowColor: '#1E2D3D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: C.accentMuted,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: '700',
        color: C.accent,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    unreadRing: {
        position: 'absolute',
        bottom: 0, right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: C.accent,
        borderWidth: 2,
        borderColor: C.bg,
    },
    nameCol: { flex: 1 },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        flex: 1,
        marginRight: 8,
    },
    nameUnread: { fontWeight: '700' },
    timestamp: { fontSize: 12, color: C.muted, fontWeight: '500' },
    timestampUnread: { color: C.accent, fontWeight: '700' },
    preview: { fontSize: 13, color: C.muted, lineHeight: 18 },
    previewUnread: { color: C.text, fontWeight: '500' },
});
