/**
 * PremiumPromoBanner — shared upgrade nudge shown to free users.
 *
 * Used on the Home and Profile screens. Accepts a `variant` prop
 * to use context-appropriate copy for each screen.
 */

import { Brand } from '@/constants/theme';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Variant = 'home' | 'profile';

interface PremiumPromoBannerProps {
    onPress: () => void;
    variant?: Variant;
}

const COPY: Record<Variant, { title: string; subtitle: string }> = {
    home: {
        title: 'Unlock the full story',
        subtitle: 'Shared vaults, intimate prompts & more',
    },
    profile: {
        title: 'Unlock your full journey',
        subtitle: 'Insights, timelines & unlimited memories',
    },
};

export function PremiumPromoBanner({ onPress, variant = 'home' }: PremiumPromoBannerProps) {
    const copy = COPY[variant];

    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.82}>
            <View style={s.left}>
                <View style={s.eyebrowRow}>
                    <Sparkles size={11} color={Brand.blue} strokeWidth={Brand.iconStrokeWidth} />
                    <Text style={s.eyebrow}>EVERWOVEN PREMIUM</Text>
                </View>
                <Text style={s.title}>{copy.title}</Text>
                <Text style={s.sub}>{copy.subtitle}</Text>
            </View>
            <View style={s.pill}>
                <Text style={s.pillText}>Try Free</Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#DDE8F2',
        shadowColor: '#1E2D3D',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    left: { flex: 1, paddingRight: 12 },
    eyebrowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    eyebrow: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 2,
        color: Brand.blue,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: '#1E2D3D',
        marginBottom: 3,
        letterSpacing: -0.3,
    },
    sub: {
        fontSize: 12,
        color: '#9BA8B5',
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
