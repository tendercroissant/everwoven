/**
 * BarContext
 * Lets screens drive the DynamicFloatingBar from anywhere in the tree.
 *
 * Usage — in a screen:
 *   const { setBarMode, setJournalBarProps } = useBar();
 *   useFocusEffect(() => {
 *     setBarMode('journal');
 *     setJournalBarProps({ privacy, onPrivacyChange, onSave });
 *     return () => setBarMode('nav');   // restore on blur
 *   });
 */

import React, { createContext, useCallback, useContext, useState } from 'react';

export type BarMode = 'nav' | 'journal';
export type Privacy = 'private' | 'shared';

export interface JournalBarProps {
    privacy: Privacy;
    onPrivacyChange: (p: Privacy) => void;
    onSave: () => void;
}

interface BarContextValue {
    mode: BarMode;
    setBarMode: (mode: BarMode) => void;
    journalProps: JournalBarProps | null;
    setJournalBarProps: (props: JournalBarProps | null) => void;
}

const BarContext = createContext<BarContextValue>({
    mode: 'nav',
    setBarMode: () => { },
    journalProps: null,
    setJournalBarProps: () => { },
});

export function BarProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<BarMode>('nav');
    const [journalProps, setJournalProps] = useState<JournalBarProps | null>(null);

    const setBarMode = useCallback((m: BarMode) => setMode(m), []);
    const setJournalBarProps = useCallback((p: JournalBarProps | null) => setJournalProps(p), []);

    return (
        <BarContext.Provider value={{ mode, setBarMode, journalProps, setJournalBarProps }}>
            {children}
        </BarContext.Provider>
    );
}

export function useBar() {
    return useContext(BarContext);
}
