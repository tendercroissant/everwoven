import { Layout } from '@/constants/theme';
import { useSubscription } from '@/context/subscription-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle2, Infinity, Lock, MessageCircle, Smile } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ImageBackground,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaywallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const { subscribe, restorePurchases } = useSubscription();

    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const heroHeight = height * 0.28;

    async function handleSubscribe() {
        await subscribe(selectedPlan);
        router.back();
    }

    async function handleRestore() {
        await restorePurchases();
        router.back();
    }

    return (
        <View style={s.root}>
            {/* ── Background Illustration Header ── */}
            <View style={[s.heroContainer, { width, height: heroHeight }]}>
                <ImageBackground
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7fn8T1Li83yJrD9yi1qKO0ZqAgHVNuj_n8v3RjLLl0ZqRErlSYFazafDmPZV1KSsVb5nOtH9os1GxV0Tq5U_SprfPbqKGk_gAAVbBvWIgW9U1LxWCh5UrF6-I5cr8x7kw6Ac5S_9OfV8h2eaDALvcCjWmPjUK5dYIoRTsewDxd6EHFdfXm2rNB_FJ-Z5Th8S-PiuSn7Q7SWgGd8SlImXlDv5IlTmTXds_Ik_KTrRSUVqLFevh6eDDcRMogEXKiXHLNDfkCGI4qqY' }}
                    style={s.heroImage}
                />
                <LinearGradient
                    colors={['rgba(244, 244, 248, 0)', 'rgba(244, 244, 248, 1)']}
                    style={s.heroGradient}
                />
            </View>

            {/* ── Main Content Container ── */}
            <View style={[s.body, { paddingBottom: Math.max(insets.bottom, 16) }]}>

                <View style={s.headerTextContainer}>
                    <Text style={s.eyebrow}>EVERWOVEN PREMIUM</Text>
                    <Text style={s.title}>Write Your Story,{'\n'}Together</Text>
                    <Text style={s.subtitle}>
                        Deepen your bond with shared journals, intimate prompts, and mood tracking.
                    </Text>
                </View>

                {/* ── Feature Grid ── */}
                <View style={s.gridRow}>
                    <View style={s.featureCard}>
                        <Lock size={24} color="#6486b9" style={s.featureIcon} strokeWidth={1.5} />
                        <Text style={s.featureText}>Privacy Vault</Text>
                    </View>
                    <View style={s.featureCard}>
                        <MessageCircle size={24} color="#6486b9" style={s.featureIcon} strokeWidth={1.5} />
                        <Text style={s.featureText}>Daily Prompts</Text>
                    </View>
                </View>
                <View style={s.gridRow}>
                    <View style={s.featureCard}>
                        <Infinity size={24} color="#6486b9" style={s.featureIcon} strokeWidth={1.5} />
                        <Text style={s.featureText}>Unlimited Entries</Text>
                    </View>
                    <View style={s.featureCard}>
                        <Smile size={24} color="#6486b9" style={s.featureIcon} strokeWidth={1.5} />
                        <Text style={s.featureText}>Mood Tracking</Text>
                    </View>
                </View>

                {/* ── Pricing Selector ── */}
                <View style={s.pricingRow}>
                    <TouchableOpacity
                        style={[s.planCard, selectedPlan === 'monthly' && s.planCardSelected]}
                        activeOpacity={0.9}
                        onPress={() => setSelectedPlan('monthly')}
                    >
                        <Text style={s.planTitle}>Monthly</Text>
                        <Text style={[s.planPrice, selectedPlan === 'monthly' && s.planPriceSelected]}>$7.99/mo</Text>
                        {selectedPlan === 'monthly' && (
                            <CheckCircle2 size={20} color="#6486b9" style={s.planCheckmark} strokeWidth={1.5} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            s.planCard,
                            selectedPlan === 'yearly' ? s.planCardYearlySelected : s.planCardYearlyInactive
                        ]}
                        activeOpacity={0.9}
                        onPress={() => setSelectedPlan('yearly')}
                    >
                        <View style={s.bestValueBadge}>
                            <Text style={s.bestValueText}>BEST VALUE</Text>
                        </View>
                        <Text style={s.planTitle}>Yearly</Text>
                        <Text style={[s.planPrice, s.planPricePrimary]}>$3.99/mo</Text>
                        <Text style={s.planSubtext}>Billed $47.99/yr</Text>
                        {selectedPlan === 'yearly' && (
                            <CheckCircle2 size={20} color="#6486b9" style={s.planCheckmark} strokeWidth={1.5} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── CTA ── */}
                <TouchableOpacity style={s.ctaBtn} activeOpacity={0.85} onPress={handleSubscribe}>
                    <Text style={s.ctaText}>Start 7-Day Free Trial</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={s.notNowBtn}>
                    <Text style={s.notNowText}>Not Now</Text>
                </TouchableOpacity>

                <Text style={s.disclaimer}>No commitment. Cancel anytime in settings.</Text>

                {/* ── Footer Links ── */}
                <View style={s.footerLinks}>
                    <TouchableOpacity onPress={handleRestore}><Text style={s.footerLinkText}>Restore Purchases</Text></TouchableOpacity>
                    <View style={s.footerSeparator} />
                    <TouchableOpacity><Text style={s.footerLinkText}>Terms</Text></TouchableOpacity>
                    <View style={s.footerSeparator} />
                    <TouchableOpacity><Text style={s.footerLinkText}>Privacy</Text></TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const C = {
    primary: '#6486b9',
    bgLight: '#F4F4F8',
    bgWhite: '#FFFFFF',
    textNavy: '#1E2D3D',
    textSlate: '#9BA8B5',
    lightBlueBg: '#E8EFF5',
};

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.bgLight,
    },
    heroContainer: {
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    body: {
        flex: 1,
        paddingHorizontal: Layout.screenPadding,
        justifyContent: 'space-between',
        marginTop: -40,
        zIndex: 10,
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    eyebrow: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: C.textSlate,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        color: C.textNavy,
        textAlign: 'center',
        lineHeight: 34,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: C.textSlate,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },

    // ── Grid ──
    gridRow: {
        flexDirection: 'row',
        gap: 12,
    },
    featureCard: {
        flex: 1,
        backgroundColor: C.bgWhite,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    featureIcon: {
        marginBottom: 6,
    },
    featureText: {
        color: C.textNavy,
        fontSize: 13,
        fontWeight: '700',
    },

    // ── Pricing ──
    pricingRow: {
        flexDirection: 'row',
        gap: 16,
    },
    planCard: {
        flex: 1,
        backgroundColor: C.bgWhite,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    planCardSelected: {
        borderColor: '#DDE8F2',
    },
    planCardYearlyInactive: {
        backgroundColor: C.bgWhite,
    },
    planCardYearlySelected: {
        backgroundColor: C.lightBlueBg,
        borderColor: C.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    planTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: C.textNavy,
        marginBottom: 2,
    },
    planPrice: {
        fontSize: 14,
        color: C.textSlate,
        fontWeight: '500',
    },
    planPriceSelected: {
        color: C.textNavy,
        fontWeight: '600',
    },
    planPricePrimary: {
        color: C.primary,
        fontWeight: '700',
    },
    planSubtext: {
        fontSize: 10,
        color: C.textSlate,
        marginTop: 4,
    },
    planCheckmark: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    bestValueBadge: {
        position: 'absolute',
        top: -12,
        backgroundColor: C.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
    },
    bestValueText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // ── CTA & Footer ──
    ctaBtn: {
        backgroundColor: C.primary,
        width: '100%',
        height: 54,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    ctaText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
    notNowBtn: {
        alignItems: 'center',
    },
    notNowText: {
        fontSize: 15,
        fontWeight: '600',
        color: C.textSlate,
    },
    disclaimer: {
        textAlign: 'center',
        color: C.textSlate,
        fontSize: 12,
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        opacity: 0.8,
    },
    footerLinkText: {
        fontSize: 11,
        fontWeight: '500',
        color: C.textSlate,
    },
    footerSeparator: {
        width: 1,
        height: 12,
        backgroundColor: '#D1D9E0',
    },
});
