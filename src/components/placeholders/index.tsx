import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { 
  Circle, 
  Rect, 
  Path, 
  G, 
  Defs, 
  LinearGradient, 
  Stop,
  Text as SvgText 
} from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

interface PlaceholderProps {
  size?: number;
  color?: string;
  name?: string;
}

// Musical note SVG for generic music placeholders
export function MusicNotePlaceholder({ size = 80, color }: PlaceholderProps) {
  const { theme } = useTheme();
  const fillColor = color || theme.colors.primary;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="musicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="48" fill="url(#musicGrad)" />
        <G transform="translate(25, 20) scale(0.5)">
          <Path
            d="M50 10 L50 70 M50 70 C50 85 30 85 30 70 C30 55 50 55 50 70 M50 10 L80 20 L80 50 M80 50 C80 65 60 65 60 50 C60 35 80 35 80 50"
            stroke={fillColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
}

// Composer portrait placeholder with initials
export function ComposerPlaceholder({ size = 80, color, name }: PlaceholderProps) {
  const { theme } = useTheme();
  const fillColor = color || '#8B5CF6';
  const initial = name ? name.charAt(0).toUpperCase() : '♪';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="composerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.2" />
          </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="48" fill="url(#composerGrad)" />
        {/* Silhouette */}
        <Circle cx="50" cy="35" r="18" fill={fillColor} opacity="0.3" />
        <Path
          d="M25 85 Q25 60 50 55 Q75 60 75 85"
          fill={fillColor}
          opacity="0.3"
        />
        {/* Initial */}
        <SvgText
          x="50"
          y="58"
          fontSize="32"
          fontWeight="bold"
          fill={fillColor}
          textAnchor="middle"
        >
          {initial}
        </SvgText>
      </Svg>
    </View>
  );
}

// Album artwork placeholder
export function AlbumPlaceholder({ size = 80, color }: PlaceholderProps) {
  const { theme } = useTheme();
  const fillColor = color || '#EC4899';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="albumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.15" />
          </LinearGradient>
        </Defs>
        <Rect x="2" y="2" width="96" height="96" rx="8" fill="url(#albumGrad)" />
        {/* Vinyl record */}
        <Circle cx="50" cy="50" r="35" fill={fillColor} opacity="0.2" />
        <Circle cx="50" cy="50" r="25" fill={fillColor} opacity="0.15" />
        <Circle cx="50" cy="50" r="15" fill={fillColor} opacity="0.2" />
        <Circle cx="50" cy="50" r="5" fill={fillColor} opacity="0.5" />
        {/* Grooves */}
        <Circle cx="50" cy="50" r="30" stroke={fillColor} strokeWidth="0.5" fill="none" opacity="0.3" />
        <Circle cx="50" cy="50" r="32" stroke={fillColor} strokeWidth="0.5" fill="none" opacity="0.3" />
        <Circle cx="50" cy="50" r="20" stroke={fillColor} strokeWidth="0.5" fill="none" opacity="0.3" />
        <Circle cx="50" cy="50" r="22" stroke={fillColor} strokeWidth="0.5" fill="none" opacity="0.3" />
      </Svg>
    </View>
  );
}

// Era/Period placeholder with decorative pattern
export function EraBanner({ 
  width = 320, 
  height = 120, 
  color, 
  name 
}: { 
  width?: number; 
  height?: number; 
  color?: string; 
  name?: string;
}) {
  const { theme } = useTheme();
  const fillColor = color || '#F59E0B';
  
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 320 120">
        <Defs>
          <LinearGradient id="eraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="320" height="120" rx="12" fill="url(#eraGrad)" />
        {/* Decorative arches */}
        <Path
          d="M0 120 Q80 40 160 120 Q240 40 320 120"
          stroke={fillColor}
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        <Path
          d="M40 120 Q120 60 200 120"
          stroke={fillColor}
          strokeWidth="1"
          fill="none"
          opacity="0.2"
        />
        {/* Musical symbols */}
        <G opacity="0.2">
          <SvgText x="40" y="50" fontSize="24" fill={fillColor}>♪</SvgText>
          <SvgText x="280" y="40" fontSize="20" fill={fillColor}>♫</SvgText>
          <SvgText x="160" y="30" fontSize="16" fill={fillColor}>𝄞</SvgText>
        </G>
        {/* Era name */}
        {name && (
          <SvgText
            x="160"
            y="75"
            fontSize="20"
            fontWeight="bold"
            fill={fillColor}
            textAnchor="middle"
          >
            {name}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

// Badge placeholder
export function BadgePlaceholder({ size = 60, color }: PlaceholderProps) {
  const { theme } = useTheme();
  const fillColor = color || '#F59E0B';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.2" />
          </LinearGradient>
        </Defs>
        {/* Shield shape */}
        <Path
          d="M50 5 L90 20 L90 50 Q90 80 50 95 Q10 80 10 50 L10 20 Z"
          fill="url(#badgeGrad)"
        />
        {/* Star */}
        <Path
          d="M50 25 L55 40 L72 40 L58 50 L63 65 L50 55 L37 65 L42 50 L28 40 L45 40 Z"
          fill={fillColor}
          opacity="0.5"
        />
      </Svg>
    </View>
  );
}

// Form/Structure placeholder
export function FormPlaceholder({ size = 80, color }: PlaceholderProps) {
  const { theme } = useTheme();
  const fillColor = color || '#10B981';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="formGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={fillColor} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        <Rect x="2" y="2" width="96" height="96" rx="12" fill="url(#formGrad)" />
        {/* Sheet music lines */}
        <G stroke={fillColor} strokeWidth="1.5" opacity="0.4">
          <Path d="M15 30 L85 30" />
          <Path d="M15 40 L85 40" />
          <Path d="M15 50 L85 50" />
          <Path d="M15 60 L85 60" />
          <Path d="M15 70 L85 70" />
        </G>
        {/* Notes on staff */}
        <G fill={fillColor} opacity="0.5">
          <Circle cx="25" cy="50" r="5" />
          <Circle cx="45" cy="40" r="5" />
          <Circle cx="65" cy="60" r="5" />
          <Circle cx="80" cy="35" r="4" />
        </G>
        {/* Treble clef */}
        <SvgText x="12" y="55" fontSize="28" fill={fillColor} opacity="0.4">𝄞</SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Export all for easy importing
export default {
  MusicNotePlaceholder,
  ComposerPlaceholder,
  AlbumPlaceholder,
  EraBanner,
  BadgePlaceholder,
  FormPlaceholder,
};
