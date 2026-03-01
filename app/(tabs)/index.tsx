/**
 * Home — "The Weave" Home Screen
 * iOS-style large-title collapsing header:
 *   • Large title lives inside the scroll content and fades out on scroll
 *   • A compact sticky navbar with the same title fades + slides in
 *   • Bottom safe area removed so content flows beneath the floating nav
 */

import { PremiumPromoBanner } from '@/components/premium-promo-banner';
import { Brand, Layout } from '@/constants/theme';
import { useSubscription } from '@/context/subscription-context';
import { useRouter } from 'expo-router';
import { Bell, CalendarDays, Heart, Image as ImageIcon, Mic, User } from 'lucide-react-native';
import React, { useRef } from 'react';
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

// ─── Palette (cool off-white — matches Journal List) ────────────────────────
const Beige = {
  bg: '#F4F4F8',
  card: '#FFFFFF',
  cardDeep: '#EEF0F6',
  text: Brand.navy,
  muted: Brand.mutedGrey,
  accent: Brand.blue,
};

// The scroll offset at which the compact navbar is fully opaque
const COLLAPSE_THRESHOLD = 72;

// ─── Mock data ───────────────────────────────────────────────────────────────
const DAYS_TOGETHER = 740;
const HAS_NOTIFICATIONS = true;

const RECENT = [
  {
    id: '1',
    type: 'journal',
    label: 'JOURNAL',
    title: 'Morning Coffee at The Roast',
    meta: 'Yesterday',
    shared: true,
  },
  {
    id: '2',
    type: 'moment',
    label: 'MOMENT',
    title: 'Sunday Picnic',
    meta: '3 days ago',
    shared: true,
    imageUrl: 'https://picsum.photos/seed/picnic/600/400',
  },
  {
    id: '3',
    type: 'journal',
    label: 'JOURNAL',
    title: 'Late Night Thoughts',
    meta: '1 week ago',
    shared: false,
  },
  {
    id: '4',
    type: 'moment',
    label: 'MOMENT',
    title: 'Autumn Walk in the Park',
    meta: '2 weeks ago',
    shared: true,
    imageUrl: 'https://picsum.photos/seed/autumn/600/400',
  },
];



// ─── Sub-components ──────────────────────────────────────────────────────────

function DaysCounter() {
  return (
    <View style={days.wrapper}>
      <View style={days.numberRow}>
        <Text style={days.number}>{DAYS_TOGETHER}</Text>
      </View>
      <Text style={days.label}>DAYS WOVEN TOGETHER</Text>

      {/* Couple avatars */}
      <View style={days.avatarRow}>
        <View style={days.avatar}>
          <User size={24} color={Beige.muted} strokeWidth={Brand.iconStrokeWidth} />
        </View>
        <View style={days.dashedLine}>
          <View style={days.dash} />
          <Heart size={18} color="#E8A7A6" fill="#E8A7A6" strokeWidth={Brand.iconStrokeWidth} />
          <View style={days.dash} />
        </View>
        <View style={days.avatar}>
          <User size={24} color={Beige.muted} strokeWidth={Brand.iconStrokeWidth} />
        </View>
      </View>
    </View>
  );
}

// ─── Quick Actions ───────────────────────────────────────────────────────────

interface QuickAction {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string; fill?: string; strokeWidth: number }>;
  iconColor: string;
  iconFill?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'hug', label: 'Send Hug', Icon: Heart, iconColor: Beige.text },
  { id: 'voice', label: 'Voice Note', Icon: Mic, iconColor: Beige.text },
  { id: 'photo', label: 'Share Photo', Icon: ImageIcon, iconColor: Beige.text },
  { id: 'date', label: 'Plan Date', Icon: CalendarDays, iconColor: Beige.text },
];

function QuickActions() {
  return (
    <View style={act.section}>
      <Text style={act.sectionLabel}>QUICK ACTIONS</Text>
      <View style={act.row}>
        {QUICK_ACTIONS.map(({ id, label, Icon, iconColor, iconFill }) => (
          <TouchableOpacity key={id} style={act.btn} activeOpacity={0.75}>
            <View style={act.circle}>
              <Icon
                size={22}
                color={iconColor}
                fill={iconFill ?? 'none'}
                strokeWidth={Brand.iconStrokeWidth}
              />
            </View>
            <Text style={act.label}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ActivityCard({ item }: { item: typeof RECENT[0] }) {
  const hasImage = !!item.imageUrl;
  return (
    <View style={[card.wrapper, hasImage && card.wrapperTall]}>
      {hasImage && (
        <Image style={card.imagePreview} source={{ uri: item.imageUrl }} />
      )}
      <View style={card.topRow}>
        <Text style={card.label}>{item.label}</Text>
        <Text style={card.meta}>{item.meta}</Text>
      </View>
      <Text style={card.title}>{item.title}</Text>
      {item.shared && (
        <View style={[card.sharedPill, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
          <Heart size={12} color={Brand.blue} strokeWidth={Brand.iconStrokeWidth} />
          <Text style={card.sharedText}>Shared</Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useSubscription();

  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Compact navbar: fades + slides in
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

  // Large title: fades out
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactNavHeight = insets.top + 52;

  return (
    <View style={[s.root, { backgroundColor: Beige.bg }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Compact sticky navbar ── */}
      <Animated.View
        style={[
          s.compactNav,
          {
            height: compactNavHeight,
            paddingTop: insets.top,
            backgroundColor: Beige.bg,
            opacity: compactNavOpacity,
            transform: [{ translateY: compactNavTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={s.compactNavInner}>
          <Text style={s.compactNavTitle}>Home</Text>
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
        {/* ── Large title header row (inline, fades out on scroll) ── */}
        <Animated.View style={[s.largeHeader, { opacity: largeTitleOpacity }]}>
          <Text style={s.largeTitleText}>Home</Text>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/notifications')}>
            <View>
              <Bell size={24} color={Beige.text} strokeWidth={Brand.iconStrokeWidth} />
              {HAS_NOTIFICATIONS && <View style={s.notifDot} />}
            </View>
          </TouchableOpacity>
        </Animated.View>

        <DaysCounter />
        {!isPremium && (
          <PremiumPromoBanner variant="home" onPress={() => router.push('/paywall')} />
        )}
        <QuickActions />

        {/* Recent Activity */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={s.viewAll}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {RECENT.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}

        {/* Bottom padding for floating nav */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  // ── Compact sticky navbar ──
  compactNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D9CEC4',
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
    color: Beige.text,
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
    color: Beige.text,
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Beige.accent,
    borderWidth: 1.5,
    borderColor: Beige.bg,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },

  // ── Scroll ──
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 20,
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Beige.text,
  },
  viewAll: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: Beige.muted,
    textTransform: 'uppercase',
  },
});

const days = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 36 },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  number: {
    fontSize: 96,
    fontWeight: '200',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Beige.text,
    letterSpacing: -5,
    lineHeight: 104,
  },
  leaf: { fontSize: 24, marginTop: 12, marginLeft: 6 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.5,
    color: Beige.muted,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 28,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Beige.cardDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  dashedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dash: {
    width: 40,
    height: 1.5,
    backgroundColor: Beige.muted,
    borderRadius: 1,
  },
  heart: { fontSize: 16 },
});

const promo = StyleSheet.create({
  card: {
    backgroundColor: Beige.card,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#DDE8F2',
    shadowColor: Beige.text,
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
    color: Beige.accent,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Beige.text,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    color: Beige.muted,
    lineHeight: 17,
  },
  pill: {
    backgroundColor: Beige.accent,
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

const act = StyleSheet.create({
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: Beige.muted,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Beige.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Beige.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Beige.text,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});

const card = StyleSheet.create({
  wrapper: {
    backgroundColor: Beige.card,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    shadowColor: Beige.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  wrapperTall: {
    paddingBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: Beige.cardDeep,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: Beige.muted,
    textTransform: 'uppercase',
  },
  meta: { fontSize: 12, color: Beige.muted },
  title: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Beige.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  sharedPill: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.blueMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  sharedText: { fontSize: 12, color: Brand.blue, fontWeight: '600' },
});
