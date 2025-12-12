/**
 * Font Context for Stitch theme custom fonts
 * Loads Noto Serif (display) and Work Sans (body) for premium typography
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useFonts } from 'expo-font';
import {
    NotoSerif_400Regular,
    NotoSerif_700Bold,
} from '@expo-google-fonts/noto-serif';
import {
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
} from '@expo-google-fonts/work-sans';

interface FontContextType {
    fontsLoaded: boolean;
    fontFamily: {
        serif: string;
        serifBold: string;
        sans: string;
        sansMedium: string;
        sansSemiBold: string;
        sansBold: string;
    };
}

const defaultFonts = {
    serif: 'System',
    serifBold: 'System',
    sans: 'System',
    sansMedium: 'System',
    sansSemiBold: 'System',
    sansBold: 'System',
};

const FontContext = createContext<FontContextType>({
    fontsLoaded: false,
    fontFamily: defaultFonts,
});

export function FontProvider({ children }: { children: ReactNode }) {
    const [fontsLoaded] = useFonts({
        NotoSerif_400Regular,
        NotoSerif_700Bold,
        WorkSans_400Regular,
        WorkSans_500Medium,
        WorkSans_600SemiBold,
        WorkSans_700Bold,
    });

    const fontFamily = fontsLoaded
        ? {
            serif: 'NotoSerif_400Regular',
            serifBold: 'NotoSerif_700Bold',
            sans: 'WorkSans_400Regular',
            sansMedium: 'WorkSans_500Medium',
            sansSemiBold: 'WorkSans_600SemiBold',
            sansBold: 'WorkSans_700Bold',
        }
        : defaultFonts;

    return (
        <FontContext.Provider value={{ fontsLoaded, fontFamily }}>
            {children}
        </FontContext.Provider>
    );
}

export const useFontsLoaded = () => useContext(FontContext);
