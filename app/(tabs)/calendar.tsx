import { Brand } from '@/constants/theme';
import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CalendarScreen() {
    return (
        <View style={s.root}>
            <CalendarDays size={48} color={Brand.mutedGrey} strokeWidth={1.5} />
            <Text style={s.title}>Calendar</Text>
            <Text style={s.sub}>Coming soon</Text>
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F4F4F8',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Brand.navy,
    },
    sub: {
        fontSize: 14,
        color: Brand.mutedGrey,
    },
});
