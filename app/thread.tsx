/**
 * Thread Screen — couple's conversation view.
 *
 * Route params:
 *   • id     — conversation id (string)
 *   • name   — conversation title (string)
 *   • prompt — optional pre-filled prompt text (string)
 *
 * Layout:
 *   • Fixed header: back, partner avatar + name + status, streak badge
 *   • Scrollable message bubble list with date separators
 *   • Keyboard-aware pinned input bar with prompt shortcut + send
 */

import { Brand, Layout } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Flame, Send, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
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
    mine: Brand.blue,          // my bubble background
    mineText: '#FFFFFF',
    partner: '#FFFFFF',        // partner bubble background
    partnerText: Brand.navy,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageSender = 'me' | 'partner';

interface Message {
    id: string;
    text: string;
    sender: MessageSender;
    time: string;
    isPrompt?: boolean;
}

type ListItem =
    | { type: 'date'; label: string; id: string }
    | { type: 'message'; data: Message };

// ─── Mock data ────────────────────────────────────────────────────────────────

const STREAK_DAYS = 14;

const INITIAL_MESSAGES: Message[] = [
    { id: 'm0', sender: 'partner', text: 'Good morning! ☀️', time: '8:02 AM' },
    { id: 'm1', sender: 'me', text: 'Morning! Did you sleep well?', time: '8:04 AM' },
    { id: 'm2', sender: 'partner', text: 'Actually yes — first time in a while. That walk yesterday helped I think 🙂', time: '8:06 AM' },
    { id: 'm3', sender: 'me', text: 'I knew it would. We should make it a weekly thing.', time: '8:07 AM' },
    { id: 'm4', sender: 'partner', text: 'Agreed. Also — that cafe you mentioned sounds perfect. When are we going?', time: '8:09 AM' },
    { id: 'm5', sender: 'me', text: 'How about Saturday morning?', time: '8:10 AM' },
    { id: 'm6', sender: 'partner', text: "Saturday works! I'll make a reservation just in case.", time: '8:12 AM' },
];

// Build flat list items with a "Today" separator at the top
function buildListItems(messages: Message[]): ListItem[] {
    return [
        { type: 'date', label: 'Today', id: 'date-today' },
        ...messages.map((m) => ({ type: 'message' as const, data: m })),
    ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
    return (
        <View style={sep.wrapper}>
            <View style={sep.line} />
            <Text style={sep.label}>{label}</Text>
            <View style={sep.line} />
        </View>
    );
}

function MessageBubble({ message }: { message: Message }) {
    const isMe = message.sender === 'me';

    return (
        <View style={[bbl.row, isMe ? bbl.rowMe : bbl.rowPartner]}>
            {/* Partner avatar placeholder */}
            {!isMe && (
                <View style={bbl.partnerAvatar}>
                    <Text style={bbl.partnerAvatarText}>J</Text>
                </View>
            )}

            <View style={[bbl.bubble, isMe ? bbl.bubbleMe : bbl.bubblePartner]}>
                {message.isPrompt && (
                    <View style={bbl.promptTag}>
                        <Sparkles size={10} color={isMe ? 'rgba(255,255,255,0.8)' : C.accent} strokeWidth={2} />
                        <Text style={[bbl.promptTagText, isMe && bbl.promptTagTextMe]}>Prompt</Text>
                    </View>
                )}
                <Text style={[bbl.text, isMe ? bbl.textMe : bbl.textPartner]}>
                    {message.text}
                </Text>
                <Text style={[bbl.time, isMe ? bbl.timeMe : bbl.timePartner]}>
                    {message.time}
                </Text>
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ThreadScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ id: string; name: string; prompt?: string }>();

    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState(params.prompt ?? '');
    const listRef = useRef<FlatList>(null);

    const listItems = buildListItems(messages);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }, [messages]);

    // If a prompt was passed in, focus the input immediately
    const inputRef = useRef<TextInput>(null);
    useEffect(() => {
        if (params.prompt) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, []);

    function sendMessage() {
        const text = inputText.trim();
        if (!text) return;
        const isPrompt = Boolean(params.prompt && text === params.prompt);

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages((prev) => [
            ...prev,
            {
                id: `m${Date.now()}`,
                sender: 'me',
                text,
                time: timeStr,
                isPrompt,
            },
        ]);
        setInputText('');
    }

    const canSend = inputText.trim().length > 0;

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ── */}
            <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                {/* Back */}
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => router.back()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <ChevronLeft size={26} color={C.text} strokeWidth={Brand.iconStrokeWidth} />
                </TouchableOpacity>

                {/* Partner info */}
                <View style={s.headerCenter}>
                    <View style={s.headerAvatar}>
                        <Text style={s.headerAvatarText}>J</Text>
                    </View>
                    <View>
                        <Text style={s.headerName} numberOfLines={1}>
                            {params.name ?? 'Thread'}
                        </Text>
                        <Text style={s.headerStatus}>Online</Text>
                    </View>
                </View>

                {/* Streak badge */}
                <View style={s.streakBadge}>
                    <Flame size={13} color="#E8855A" strokeWidth={2} />
                    <Text style={s.streakText}>{STREAK_DAYS}</Text>
                </View>
            </View>

            {/* ── Message List + Input — keyboard-aware ── */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={listRef}
                    data={listItems}
                    keyExtractor={(item) =>
                        item.type === 'date' ? item.id : item.data.id
                    }
                    renderItem={({ item }) => {
                        if (item.type === 'date') return <DateSeparator label={item.label} />;
                        return <MessageBubble message={item.data} />;
                    }}
                    contentContainerStyle={[
                        s.listContent,
                        { paddingBottom: 12 },
                    ]}
                    showsVerticalScrollIndicator={false}
                />

                {/* ── Input bar ── */}
                <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    {/* Prompt shortcut */}
                    <TouchableOpacity
                        style={s.promptBtn}
                        activeOpacity={0.75}
                        onPress={() => {
                            // Cycle a random prompt into the input
                            const prompts = [
                                'What made you smile today?',
                                "Something you've been meaning to share?",
                                'How are you really feeling right now?',
                            ];
                            setInputText(
                                prompts[Math.floor(Math.random() * prompts.length)]
                            );
                            inputRef.current?.focus();
                        }}
                    >
                        <Sparkles size={20} color={C.accent} strokeWidth={1.5} />
                    </TouchableOpacity>

                    {/* Text input */}
                    <TextInput
                        ref={inputRef}
                        style={s.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Write something…"
                        placeholderTextColor={C.muted}
                        multiline
                        maxLength={1000}
                        returnKeyType="default"
                        blurOnSubmit={false}
                    />

                    {/* Send button */}
                    <TouchableOpacity
                        style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
                        onPress={sendMessage}
                        activeOpacity={0.8}
                        disabled={!canSend}
                    >
                        <Send size={18} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Layout.screenPadding,
        paddingBottom: 12,
        backgroundColor: C.bg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.divider,
    },
    backBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -6,
        marginRight: 4,
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: C.accentMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: C.accent,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        letterSpacing: -0.2,
    },
    headerStatus: {
        fontSize: 12,
        color: '#5CB88A',
        fontWeight: '500',
        marginTop: 1,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FEF0E8',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 100,
    },
    streakText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E8855A',
    },

    // ── List ──
    listContent: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: 16,
    },

    // ── Input bar ──
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: C.bg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: C.divider,
        gap: 10,
    },
    promptBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.accentMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        backgroundColor: C.card,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 8,
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
        fontSize: 15,
        color: C.text,
        borderWidth: 1.5,
        borderColor: C.divider,
        lineHeight: 20,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    sendBtnDisabled: {
        backgroundColor: C.divider,
        shadowOpacity: 0,
        elevation: 0,
    },
});

const sep = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 20,
    },
    line: { flex: 1, height: 1, backgroundColor: C.divider },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: C.muted,
        letterSpacing: 0.5,
    },
});

const bbl = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 10,
        gap: 8,
    },
    rowMe: { justifyContent: 'flex-end' },
    rowPartner: { justifyContent: 'flex-start' },

    partnerAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: C.accentMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    partnerAvatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: C.accent,
    },

    bubble: {
        maxWidth: '72%',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    bubbleMe: {
        backgroundColor: C.mine,
        borderBottomRightRadius: 4,
    },
    bubblePartner: {
        backgroundColor: C.partner,
        borderBottomLeftRadius: 4,
        shadowColor: '#1E2D3D',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },

    promptTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 5,
    },
    promptTagText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        color: C.accent,
        textTransform: 'uppercase',
    },
    promptTagTextMe: { color: 'rgba(255,255,255,0.75)' },

    text: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
    },
    textMe: { color: C.mineText },
    textPartner: { color: C.partnerText },

    time: {
        fontSize: 10,
        marginTop: 5,
        fontWeight: '500',
    },
    timeMe: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
    timePartner: { color: C.muted },
});
