/**
 * ScreenHeader
 * Shared header for full-screen modal screens (Settings, Notifications, etc.)
 * Keeps title font, height, padding, and close-button sizing consistent.
 */

import { Brand, Fonts, Layout } from '@/constants/theme';
import { X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
    title: string;
    onClose: () => void;
    /** Optional slot rendered to the left of the close button */
    rightAccessory?: React.ReactNode;
}

export function ScreenHeader({ title, onClose, rightAccessory }: ScreenHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
            <Text style={s.title}>{title}</Text>
            <View style={s.right}>
                {rightAccessory}
                <TouchableOpacity
                    style={s.iconBtn}
                    onPress={onClose}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <X size={24} color={Brand.navy} strokeWidth={Brand.iconStrokeWidth} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export const s = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.screenPadding,
        paddingBottom: 16,
        backgroundColor: '#F4F4F8',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        fontFamily: Fonts.serif,
        color: Brand.navy,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
