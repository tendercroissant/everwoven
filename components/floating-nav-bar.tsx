/**
 * FloatingNavBar
 * Floating pill-shaped navigation bar — 4 icon-only tabs:
 *   Home · Journal · Messages · Profile
 * Active tab: dusty-blue icon + light-blue pill bg
 * Inactive: muted grey icons
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand } from '@/constants/theme';
import React from 'react';
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export type TabName = 'home' | 'journal' | 'messages' | 'profile';

interface Tab {
    name: TabName;
    icon: string;
}

const TABS: Tab[] = [
    { name: 'home', icon: 'house.fill' },
    { name: 'journal', icon: 'book.fill' },
    { name: 'messages', icon: 'bubble.left.fill' },
    { name: 'profile', icon: 'person.fill' },
];

interface Props {
    activeTab: TabName;
    onTabPress: (tab: TabName) => void;
}

export function FloatingNavBar({ activeTab, onTabPress }: Props) {
    return (
        <View style={styles.wrapper} pointerEvents="box-none">
            <View style={styles.pill}>
                {TABS.map((tab) => {
                    const isActive = tab.name === activeTab;
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={[styles.iconBtn, isActive && styles.iconBtnActive]}
                            onPress={() => onTabPress(tab.name)}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={tab.name}
                            accessibilityState={{ selected: isActive }}
                        >
                            <IconSymbol
                                name={tab.icon as any}
                                size={22}
                                color={isActive ? Brand.blue : Brand.mutedGrey}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 36 : 24,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pill: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 8,
        gap: 4,
        shadowColor: '#1E2D3D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 14,
    },
    iconBtn: {
        width: 52,
        height: 44,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnActive: {
        backgroundColor: Brand.blueMuted,
    },
});
