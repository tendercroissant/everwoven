/**
 * Journal Entry Screen — Focus Mode
 *
 * This screen no longer owns the bottom action bar. Instead it:
 *  1. Registers its privacy state + save handler with BarContext on focus
 *  2. Restores the bar to 'nav' mode on blur
 *
 * The DynamicFloatingBar (in root layout) handles all the animation.
 */

import { Brand, Layout } from '@/constants/theme';
import { Privacy, useBar } from '@/context/bar-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { MoreHorizontal, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Keyboard,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
    bg: '#F4F4F8',
    text: Brand.navy,
    muted: Brand.mutedGrey,
    accentMuted: Brand.blueMuted,
    separator: Brand.separator,
    accent: Brand.blue,
};

// Bottom padding so text never hides behind the floating bar
const FLOAT_BAR_CLEARANCE = 160;



export default function JournalEntryScreen() {
    const router = useRouter();
    const { setBarMode, setJournalBarProps } = useBar();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [privacy, setPrivacy] = useState<Privacy>('private');
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Track keyboard visibility
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    // Switch bar to journal mode on focus, restore on blur
    useFocusEffect(
        useCallback(() => {
            setBarMode('journal');
            return () => {
                setBarMode('nav');
                setJournalBarProps(null);
            };
        }, [])
    );

    // Keep bar props in sync whenever privacy (or save handler) changes
    React.useEffect(() => {
        setJournalBarProps({
            privacy,
            onPrivacyChange: setPrivacy,
            onSave: () => router.back(),
        });
    }, [privacy]);

    const today = new Date()
        .toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        })
        .toUpperCase();

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar barStyle="dark-content" />

            {/* ── Top bar ──────────────────────────────────────────────────── */}
            <View style={s.topBar}>
                <View style={s.topLeft}>
                    <TouchableOpacity style={s.topIconBtn} onPress={() => router.back()}>
                        <X size={24} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />
                    </TouchableOpacity>
                </View>

                <View style={s.topCenter}>
                    <Text style={s.dateText}>{today}</Text>
                    <View style={s.savedRow}>
                        <View style={s.savedDot} />
                        <Text style={s.savedText}>Saved</Text>
                    </View>
                </View>

                <View style={s.topRight}>
                    {keyboardVisible ? (
                        <TouchableOpacity style={s.doneBtn} onPress={() => Keyboard.dismiss()}>
                            <Text style={s.doneBtnText}>Done</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={s.topIconBtn}>
                            <MoreHorizontal size={24} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── Writing area ─────────────────────────────────────────────── */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <TextInput
                    style={s.titleInput}
                    placeholder="Title your thoughts..."
                    placeholderTextColor={C.muted}
                    value={title}
                    onChangeText={setTitle}
                    multiline
                    returnKeyType="next"
                />

                <View style={s.divider} />

                <TextInput
                    style={s.bodyInput}
                    placeholder="It was one of those mornings where the light filtered through the curtains just right, painting everything in soft gold..."
                    placeholderTextColor={C.muted}
                    value={body}
                    onChangeText={setBody}
                    multiline
                    textAlignVertical="top"
                />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.bg,
    },

    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.screenPadding,
        paddingTop: Platform.OS === 'android' ? 16 : 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: C.separator,
    },
    topLeft: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    topIconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    dateText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.8,
        color: C.muted,
        textTransform: 'uppercase',
    },
    savedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    savedDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: C.accent,
    },
    savedText: {
        fontSize: 11,
        color: C.muted,
    },
    topRight: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
    },
    doneBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    doneBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: C.accent,
    },

    scroll: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: 24,
        paddingBottom: FLOAT_BAR_CLEARANCE,
    },
    titleInput: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontStyle: 'italic',
        color: C.text,
        marginBottom: 16,
        lineHeight: 36,
    },
    divider: {
        width: 40,
        height: 2,
        backgroundColor: C.accentMuted,
        borderRadius: 1,
        marginBottom: 20,
    },
    bodyInput: {
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.text,
        lineHeight: 28,
        minHeight: 320,
    },
});
