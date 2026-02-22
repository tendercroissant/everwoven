/**
 * Notifications Screen
 * Full-page list of notifications. Opened from the bell icon on Home.
 *
 * Modes:
 *  - Normal: three-dot menu with "Mark all as read" + "Select"
 *  - Selection: checkboxes on cards, header shows "Select All" + "Mark as Read" + "Cancel"
 *    Auto-exits when all items are deselected.
 */

import { ScreenHeader } from '@/components/screen-header';
import { Brand, Layout } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, CheckCircle2, Circle, Heart, MoreHorizontal, PenLine, User, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
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
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    timestamp: string;
    type: 'journal' | 'partner' | 'reminder' | 'moment';
    unread?: boolean;
}

interface Section {
    label: string;
    items: NotificationItem[];
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const NOTIFICATIONS_DATA: Section[] = [
    {
        label: 'TODAY',
        items: [
            {
                id: '1',
                type: 'journal',
                title: 'Jordan shared a journal entry',
                body: '"Morning Coffee at The Roast"',
                timestamp: '2m ago',
                unread: true,
            },
            {
                id: '2',
                type: 'partner',
                title: 'Jordan is writing',
                body: 'Your partner just started a new entry',
                timestamp: '1h ago',
                unread: true,
            },
            {
                id: '3',
                type: 'reminder',
                title: 'Daily writing prompt',
                body: 'Capture a moment from today together',
                timestamp: '3h ago',
            },
        ],
    },
    {
        label: 'YESTERDAY',
        items: [
            {
                id: '4',
                type: 'moment',
                title: 'New shared moment',
                body: 'Jordan added "Sunday Picnic" to your timeline',
                timestamp: 'Yesterday',
            },
            {
                id: '5',
                type: 'journal',
                title: 'Alex shared a journal entry',
                body: '"Late Night Thoughts"',
                timestamp: 'Yesterday',
            },
        ],
    },
    {
        label: 'THIS WEEK',
        items: [
            {
                id: '6',
                type: 'journal',
                title: 'Jordan shared a journal entry',
                body: '"Autumn Walk in the Park"',
                timestamp: 'Mon',
            },
            {
                id: '7',
                type: 'reminder',
                title: 'Weekly recap ready',
                body: 'Your shared memories from last week',
                timestamp: 'Sun',
            },
        ],
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAllIds(sections: Section[]): Set<string> {
    return new Set(sections.flatMap((s) => s.items.map((i) => i.id)));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
    return (
        <View style={sd.row}>
            <Text style={sd.label}>{label}</Text>
            <View style={sd.line} />
        </View>
    );
}

function getIconForType(type: NotificationItem['type']) {
    switch (type) {
        case 'journal':
            return <PenLine size={20} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />;
        case 'partner':
            return <User size={20} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />;
        case 'moment':
            return <Heart size={20} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />;
        case 'reminder':
        default:
            return <PenLine size={20} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />;
    }
}

function NotificationCard({
    item,
    selectionMode,
    selected,
    onPress,
}: {
    item: NotificationItem;
    selectionMode: boolean;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[nc.card, selected && nc.cardSelected]}
            activeOpacity={0.85}
            onPress={onPress}
        >
            {selectionMode ? (
                <View style={nc.checkWrap}>
                    {selected
                        ? <CheckCircle2 size={22} color={Brand.blue} strokeWidth={Brand.iconStrokeWidth} />
                        : <Circle size={22} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />
                    }
                </View>
            ) : (
                <View style={nc.iconWrap}>{getIconForType(item.type)}</View>
            )}
            <View style={nc.content}>
                <Text style={nc.title} numberOfLines={1}>{item.title}</Text>
                <Text style={nc.body} numberOfLines={2}>{item.body}</Text>
                <Text style={nc.timestamp}>{item.timestamp}</Text>
            </View>
            {!selectionMode && item.unread && <View style={nc.unreadDot} />}
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [sections, setSections] = useState<Section[]>(NOTIFICATIONS_DATA);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const allIds = useMemo(() => getAllIds(sections), [sections]);
    const allSelected = selectedIds.size === allIds.size && allIds.size > 0;

    // ── Normal-mode actions ───────────────────────────────────────────────────

    const markAllAsRead = useCallback(() => {
        setSections((prev) =>
            prev.map((sec) => ({
                ...sec,
                items: sec.items.map((item) => ({ ...item, unread: false })),
            }))
        );
        setMenuVisible(false);
    }, []);

    const enterSelectMode = useCallback(() => {
        setMenuVisible(false);
        setSelectionMode(true);
        setSelectedIds(new Set());
    }, []);

    // ── Selection-mode actions ────────────────────────────────────────────────

    const exitSelectMode = useCallback(() => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    }, []);

    const toggleSelect = useCallback((id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            // Auto-exit when everything is deselected
            if (next.size === 0) {
                setSelectionMode(false);
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (allSelected) {
            // Deselecting all auto-exits
            setSelectedIds(new Set());
            setSelectionMode(false);
        } else {
            setSelectedIds(new Set(allIds));
        }
    }, [allSelected, allIds]);

    const markSelectedAsRead = useCallback(() => {
        setSections((prev) =>
            prev.map((sec) => ({
                ...sec,
                items: sec.items.map((item) =>
                    selectedIds.has(item.id) ? { ...item, unread: false } : item
                ),
            }))
        );
        exitSelectMode();
    }, [selectedIds, exitSelectMode]);

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ─────────────────────────────────────────────────────── */}
            {selectionMode ? (
                // ── Selection header ──────────────────────────────────────────
                <View style={[s.header, { paddingTop: insets.top + 8 }]}>
                    <View style={s.selectionLeft}>
                        <TouchableOpacity style={s.selectionBtn} onPress={toggleSelectAll}>
                            <Text style={s.selectionBtnText}>
                                {allSelected ? 'Deselect All' : 'Select All'}
                            </Text>
                        </TouchableOpacity>
                        {selectedIds.size > 0 && (
                            <Text style={s.selectionCount}>{selectedIds.size} selected</Text>
                        )}
                    </View>

                    <View style={s.selectionRight}>
                        {selectedIds.size > 0 && (
                            <TouchableOpacity style={s.markReadBtn} onPress={markSelectedAsRead}>
                                <Check size={18} color="#FFFFFF" strokeWidth={Brand.iconStrokeWidth + 0.5} />
                                <Text style={s.markReadBtnText}>Mark as Read</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={s.topIconBtn} onPress={exitSelectMode}>
                            <X size={24} color={C.text} strokeWidth={Brand.iconStrokeWidth} />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                // ── Normal header — shared component ──────────────────────────
                <ScreenHeader
                    title="Notifications"
                    onClose={() => router.back()}
                    rightAccessory={
                        <TouchableOpacity
                            style={s.topIconBtn}
                            onPress={() => setMenuVisible(true)}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <MoreHorizontal size={24} color={C.text} strokeWidth={Brand.iconStrokeWidth} />
                        </TouchableOpacity>
                    }
                />
            )}

            {/* ── Options menu ────────────────────────────────────────────────── */}
            <Modal visible={menuVisible} transparent animationType="none">
                <Pressable style={menu.overlay} onPress={() => setMenuVisible(false)}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {}}
                        style={[menu.card, { top: insets.top + 60, right: Layout.screenPadding }]}
                    >
                        <TouchableOpacity style={menu.option} onPress={markAllAsRead} activeOpacity={0.7}>
                            <Text style={menu.optionText}>Mark all as read</Text>
                        </TouchableOpacity>
                        <View style={menu.separator} />
                        <TouchableOpacity style={menu.option} onPress={enterSelectMode} activeOpacity={0.7}>
                            <Text style={menu.optionText}>Select</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Pressable>
            </Modal>

            <ScrollView
                style={s.scroll}
                contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                {sections.map((section) => (
                    <View key={section.label}>
                        <SectionDivider label={section.label} />
                        {section.items.map((item) => (
                            <NotificationCard
                                key={item.id}
                                item={item}
                                selectionMode={selectionMode}
                                selected={selectedIds.has(item.id)}
                                onPress={() => {
                                    if (selectionMode) {
                                        toggleSelect(item.id);
                                    }
                                }}
                            />
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    // Selection mode uses its own header row (mirrors ScreenHeader layout)
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.screenPadding,
        paddingBottom: 16,
        backgroundColor: C.bg,
    },
    topIconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Selection header ──────────────────────────────────────────────────────
    selectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    selectionBtn: {
        paddingVertical: 4,
        paddingHorizontal: 0,
    },
    selectionBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: Brand.blue,
    },
    selectionCount: {
        fontSize: 13,
        fontWeight: '500',
        color: C.muted,
    },
    selectionRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    markReadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Brand.blue,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 100,
    },
    markReadBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: 24,
    },
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

const nc = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 18,
        backgroundColor: C.card,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#2C2018',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    cardSelected: {
        borderWidth: 1.5,
        borderColor: Brand.blue,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    checkWrap: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    content: { flex: 1 },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text,
        marginBottom: 4,
    },
    body: {
        fontSize: 14,
        color: C.muted,
        lineHeight: 20,
        marginBottom: 6,
    },
    timestamp: {
        fontSize: 12,
        color: C.muted,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Brand.blue,
        marginLeft: 12,
        marginTop: 6,
    },
});

const menu = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    card: {
        position: 'absolute',
        minWidth: 180,
        backgroundColor: C.card,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 18,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: C.divider,
        marginHorizontal: 18,
    },
});
