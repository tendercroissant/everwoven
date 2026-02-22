/**
 * Settings Screen
 * Based on EverWoven App Settings design from Stitch.
 * Presented full-screen modal when user taps gear on Profile.
 */

import { ScreenHeader } from '@/components/screen-header';
import { Brand, Layout } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
    BarChart2,
    Bell,
    CreditCard,
    ExternalLink,
    Heart,
    Lock,
    Mail,
    MapPin,
    Trash2,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Platform,
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
    destructive: '#C94A4A',
};

type ToggleItem = { label: string; sublabel?: string; icon: React.ReactNode };
type NavItem = { label: string; value: string; icon: React.ReactNode };
type LinkItem = { label: string; external?: boolean };

const ICON_SIZE = 20;
const ICON_COLOR = C.muted;

const NOTIFICATIONS: ToggleItem[] = [
    { label: 'Push Notifications', icon: <Bell size={ICON_SIZE} color={ICON_COLOR} strokeWidth={Brand.iconStrokeWidth} /> },
    { label: 'Email Updates', icon: <Mail size={ICON_SIZE} color={ICON_COLOR} strokeWidth={Brand.iconStrokeWidth} /> },
    {
        label: 'Partner Activity',
        sublabel: 'Get notified when active',
        icon: <Heart size={ICON_SIZE} color={ICON_COLOR} strokeWidth={Brand.iconStrokeWidth} />,
    },
];

const PRIVACY: NavItem[] = [
    { label: 'Location', value: 'While Using', icon: <MapPin size={ICON_SIZE} color={ICON_COLOR} strokeWidth={Brand.iconStrokeWidth} /> },
];

const ACCOUNT: (NavItem & { destructive?: boolean })[] = [
    { label: 'Security', value: '', icon: <Lock size={ICON_SIZE} color={ICON_COLOR} strokeWidth={Brand.iconStrokeWidth} /> },
    { label: 'Subscription', value: '', icon: <CreditCard size={ICON_SIZE} color={ICON_COLOR} strokeWidth={Brand.iconStrokeWidth} /> },
    { label: 'Delete Account', value: '', icon: <Trash2 size={ICON_SIZE} color={C.destructive} strokeWidth={Brand.iconStrokeWidth} />, destructive: true },
];

const HELP_LEGAL: (LinkItem & { icon?: React.ReactNode })[] = [
    { label: 'Help Center' },
    { label: 'Terms of Service', external: true },
    { label: 'Privacy Policy', external: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Flat, minimal toggle — no glass/blur. Solid pill track + circle thumb. */
function MinimalToggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: value ? 1 : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [value]);
    const thumbTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onValueChange(!value);
    };
    return (
        <Pressable onPress={handlePress}>
            <View style={[tg.track, value ? tg.trackOn : null]}>
                <Animated.View style={[tg.thumb, { transform: [{ translateX: thumbTranslate }] }]} />
            </View>
        </Pressable>
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

function ToggleRow({
    item,
    value,
    onValueChange,
    isLast,
}: {
    item: ToggleItem;
    value: boolean;
    onValueChange: (v: boolean) => void;
    isLast?: boolean;
}) {
    return (
        <View style={[sr.row, isLast && sr.rowLast]}>
            <View style={sr.iconWrap}>{item.icon}</View>
            <View style={sr.labelWrap}>
                <Text style={sr.label}>{item.label}</Text>
                {item.sublabel && <Text style={sr.sublabel}>{item.sublabel}</Text>}
            </View>
            <MinimalToggle value={value} onValueChange={onValueChange} />
        </View>
    );
}

function NavRow({ item, isLast, onPress }: { item: NavItem & { destructive?: boolean }; isLast?: boolean; onPress?: () => void }) {
    return (
        <TouchableOpacity style={[sr.row, isLast && sr.rowLast]} activeOpacity={0.7} onPress={onPress}>
            <View style={sr.iconWrap}>{item.icon}</View>
            <View style={sr.labelWrap}>
                <Text style={[sr.label, item.destructive && sr.labelDestructive]}>{item.label}</Text>
            </View>
            {item.value ? (
                <Text style={[sr.value, item.destructive && sr.labelDestructive]}>{item.value}</Text>
            ) : null}
            <Text style={sr.chevron}>›</Text>
        </TouchableOpacity>
    );
}

function LinkRow({ item, isLast, onPress }: { item: LinkItem & { icon?: React.ReactNode }; isLast?: boolean; onPress?: () => void }) {
    return (
        <TouchableOpacity style={[sr.row, isLast && sr.rowLast]} activeOpacity={0.7} onPress={onPress}>
            {item.icon ? <View style={sr.iconWrap}>{item.icon}</View> : null}
            <View style={sr.labelWrap}>
                <Text style={sr.label}>{item.label}</Text>
            </View>
            {item.external ? (
                <ExternalLink size={16} color={C.muted} strokeWidth={Brand.iconStrokeWidth} />
            ) : (
                <Text style={sr.chevron}>›</Text>
            )}
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [pushNotif, setPushNotif] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);
    const [partnerActivity, setPartnerActivity] = useState(true);
    const [shareAnalytics, setShareAnalytics] = useState(false);

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" />

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <ScreenHeader title="Settings" onClose={() => router.back()} />

            <ScrollView
                style={s.scroll}
                contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                <SectionDivider label="NOTIFICATIONS" />
                <View style={sr.card}>
                    {NOTIFICATIONS.map((item, i) => (
                        <ToggleRow
                            key={item.label}
                            item={item}
                            value={
                                item.label === 'Push Notifications'
                                    ? pushNotif
                                    : item.label === 'Email Updates'
                                        ? emailUpdates
                                        : partnerActivity
                            }
                            onValueChange={
                                item.label === 'Push Notifications'
                                    ? setPushNotif
                                    : item.label === 'Email Updates'
                                        ? setEmailUpdates
                                        : setPartnerActivity
                            }
                            isLast={i === NOTIFICATIONS.length - 1}
                        />
                    ))}
                </View>

                <SectionDivider label="PRIVACY" />
                <View style={sr.card}>
                    {PRIVACY.map((item) => (
                        <NavRow key={item.label} item={item} />
                    ))}
                    <View style={[sr.row, sr.rowLast]}>
                        <View style={sr.iconWrap}>
                            <BarChart2 size={ICON_SIZE} color={ICON_COLOR} strokeWidth={Brand.iconStrokeWidth} />
                        </View>
                        <View style={sr.labelWrap}>
                            <Text style={sr.label}>Share Analytics</Text>
                        </View>
                        <MinimalToggle value={shareAnalytics} onValueChange={setShareAnalytics} />
                    </View>
                </View>

                <SectionDivider label="ACCOUNT" />
                <View style={sr.card}>
                    {ACCOUNT.map((item, i) => (
                        <NavRow key={item.label} item={item} isLast={i === ACCOUNT.length - 1} />
                    ))}
                </View>

                <SectionDivider label="HELP & LEGAL" />
                <View style={sr.card}>
                    {HELP_LEGAL.map((item, i) => (
                        <LinkRow key={item.label} item={item} isLast={i === HELP_LEGAL.length - 1} />
                    ))}
                </View>

                {/* Log Out */}
                <TouchableOpacity style={s.logOutBtn} activeOpacity={0.8}>
                    <Text style={s.logOutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={s.version}>EverWoven v2.4.1 (Build 890)</Text>
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: 24,
    },
    logOutBtn: {
        marginTop: 32,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: C.card,
        alignItems: 'center',
        shadowColor: '#2C2018',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
    },
    logOutText: {
        fontSize: 17,
        fontWeight: '600',
        color: C.destructive,
    },
    version: {
        fontSize: 12,
        color: C.muted,
        textAlign: 'center',
        marginTop: 16,
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

const sr = StyleSheet.create({
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
        paddingHorizontal: Layout.screenPadding,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    iconWrap: { width: 28, alignItems: 'center' },
    labelWrap: { flex: 1, marginLeft: 12 },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text,
    },
    labelDestructive: { color: C.destructive },
    sublabel: {
        fontSize: 13,
        color: C.muted,
        marginTop: 2,
    },
    value: {
        fontSize: 15,
        color: C.muted,
        marginRight: 6,
    },
    chevron: {
        fontSize: 20,
        color: C.muted,
        fontWeight: '300',
    },
});

const tg = StyleSheet.create({
    track: {
        width: 51,
        height: 31,
        borderRadius: 16,
        padding: 2,
        justifyContent: 'center',
        backgroundColor: C.divider,
    },
    trackOn: { backgroundColor: Brand.blue },
    thumb: {
        width: 27,
        height: 27,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
});
