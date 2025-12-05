import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites, FavoriteType } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

interface FavoriteButtonProps {
  id: string | number;
  type: FavoriteType;
  size?: number;
  color?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  id,
  type,
  size = 24,
  color,
  onToggle,
}: FavoriteButtonProps) {
  const { theme } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const scale = useRef(new Animated.Value(1)).current;
  
  const favorite = isFavorite(id, type);
  const iconColor = color || (favorite ? theme.colors.error : theme.colors.textMuted);

  const handlePress = async () => {
    // Animate the heart
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const wasAdded = await toggleFavorite(id, type);
    onToggle?.(wasAdded);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={size}
          color={iconColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// For displaying in cards with count
interface FavoriteButtonWithLabelProps extends FavoriteButtonProps {
  showLabel?: boolean;
}

export function FavoriteButtonWithLabel({
  showLabel = true,
  ...props
}: FavoriteButtonWithLabelProps) {
  const { theme } = useTheme();
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(props.id, props.type);

  return (
    <Animated.View style={styles.container}>
      <FavoriteButton {...props} />
      {showLabel && favorite && (
        <Animated.Text style={[styles.label, { color: theme.colors.error }]}>
          Saved
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
});
