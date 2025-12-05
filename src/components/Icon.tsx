import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Music,
  Play,
  Pause,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Settings,
  User,
  Home,
  Search,
  Book,
  Clock,
  Calendar,
  Star,
  Heart,
  Award,
  Trophy,
  Lock,
  Unlock,
  Check,
  X,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Info,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  Ear,
  PlayCircle,
  Volume2,
  Headphones,
  Radio,
  Disc,
  Music2,
  Music3,
  Music4,
  ListMusic,
  Library,
  Grid,
  List,
  LayoutGrid,
  Users,
  Rocket,
  Sparkles,
  Zap,
  Flame,
  Target,
  Flag,
  Bookmark,
  Share,
  ExternalLink,
  Link,
  Copy,
  Trash,
  Edit,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  RotateCcw,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Palette,
  type LucideIcon,
} from 'lucide-react-native';
import { useSettings, IconPack } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';

// Icon name mapping between packs
const ICON_MAP: Record<string, { ionicons: string; lucide: LucideIcon }> = {
  // Navigation
  'home': { ionicons: 'home', lucide: Home },
  'home-outline': { ionicons: 'home-outline', lucide: Home },
  'settings': { ionicons: 'settings', lucide: Settings },
  'settings-outline': { ionicons: 'settings-outline', lucide: Settings },
  'person': { ionicons: 'person', lucide: User },
  'person-outline': { ionicons: 'person-outline', lucide: User },
  'search': { ionicons: 'search', lucide: Search },
  'search-outline': { ionicons: 'search-outline', lucide: Search },
  'menu': { ionicons: 'menu', lucide: Menu },
  'menu-outline': { ionicons: 'menu-outline', lucide: Menu },
  
  // Arrows & Chevrons
  'chevron-forward': { ionicons: 'chevron-forward', lucide: ChevronRight },
  'chevron-back': { ionicons: 'chevron-back', lucide: ChevronLeft },
  'chevron-down': { ionicons: 'chevron-down', lucide: ChevronDown },
  'chevron-up': { ionicons: 'chevron-up', lucide: ChevronUp },
  'arrow-forward': { ionicons: 'arrow-forward', lucide: ArrowRight },
  'arrow-back': { ionicons: 'arrow-back', lucide: ArrowLeft },
  
  // Actions
  'checkmark': { ionicons: 'checkmark', lucide: Check },
  'close': { ionicons: 'close', lucide: X },
  'add': { ionicons: 'add', lucide: Plus },
  'remove': { ionicons: 'remove', lucide: Minus },
  'refresh': { ionicons: 'refresh', lucide: RefreshCw },
  'reload': { ionicons: 'reload', lucide: RotateCcw },
  'trash': { ionicons: 'trash', lucide: Trash },
  'trash-outline': { ionicons: 'trash-outline', lucide: Trash },
  'create': { ionicons: 'create', lucide: Edit },
  'create-outline': { ionicons: 'create-outline', lucide: Edit },
  'share': { ionicons: 'share', lucide: Share },
  'share-outline': { ionicons: 'share-outline', lucide: Share },
  'copy': { ionicons: 'copy', lucide: Copy },
  'copy-outline': { ionicons: 'copy-outline', lucide: Copy },
  'link': { ionicons: 'link', lucide: Link },
  'open': { ionicons: 'open', lucide: ExternalLink },
  'open-outline': { ionicons: 'open-outline', lucide: ExternalLink },
  'ellipsis-horizontal': { ionicons: 'ellipsis-horizontal', lucide: MoreHorizontal },
  'ellipsis-vertical': { ionicons: 'ellipsis-vertical', lucide: MoreVertical },
  'filter': { ionicons: 'filter', lucide: Filter },
  'options': { ionicons: 'options', lucide: SlidersHorizontal },
  
  // Media
  'play': { ionicons: 'play', lucide: Play },
  'play-outline': { ionicons: 'play-outline', lucide: Play },
  'play-circle': { ionicons: 'play-circle', lucide: PlayCircle },
  'play-circle-outline': { ionicons: 'play-circle-outline', lucide: PlayCircle },
  'pause': { ionicons: 'pause', lucide: Pause },
  'pause-outline': { ionicons: 'pause-outline', lucide: Pause },
  'volume-high': { ionicons: 'volume-high', lucide: Volume2 },
  'volume-high-outline': { ionicons: 'volume-high-outline', lucide: Volume2 },
  'headset': { ionicons: 'headset', lucide: Headphones },
  'headset-outline': { ionicons: 'headset-outline', lucide: Headphones },
  'radio': { ionicons: 'radio', lucide: Radio },
  'radio-outline': { ionicons: 'radio-outline', lucide: Radio },
  'disc': { ionicons: 'disc', lucide: Disc },
  'disc-outline': { ionicons: 'disc-outline', lucide: Disc },
  
  // Music specific
  'musical-note': { ionicons: 'musical-note', lucide: Music },
  'musical-note-outline': { ionicons: 'musical-note-outline', lucide: Music },
  'musical-notes': { ionicons: 'musical-notes', lucide: Music2 },
  'musical-notes-outline': { ionicons: 'musical-notes-outline', lucide: Music2 },
  'ear': { ionicons: 'ear', lucide: Ear },
  'ear-outline': { ionicons: 'ear-outline', lucide: Ear },
  
  // Content
  'book': { ionicons: 'book', lucide: Book },
  'book-outline': { ionicons: 'book-outline', lucide: Book },
  'library': { ionicons: 'library', lucide: Library },
  'library-outline': { ionicons: 'library-outline', lucide: Library },
  'list': { ionicons: 'list', lucide: List },
  'list-outline': { ionicons: 'list-outline', lucide: List },
  'grid': { ionicons: 'grid', lucide: Grid },
  'grid-outline': { ionicons: 'grid-outline', lucide: LayoutGrid },
  
  // Time
  'time': { ionicons: 'time', lucide: Clock },
  'time-outline': { ionicons: 'time-outline', lucide: Clock },
  'calendar': { ionicons: 'calendar', lucide: Calendar },
  'calendar-outline': { ionicons: 'calendar-outline', lucide: Calendar },
  
  // Status & Feedback
  'star': { ionicons: 'star', lucide: Star },
  'star-outline': { ionicons: 'star-outline', lucide: Star },
  'heart': { ionicons: 'heart', lucide: Heart },
  'heart-outline': { ionicons: 'heart-outline', lucide: Heart },
  'bookmark': { ionicons: 'bookmark', lucide: Bookmark },
  'bookmark-outline': { ionicons: 'bookmark-outline', lucide: Bookmark },
  'flag': { ionicons: 'flag', lucide: Flag },
  'flag-outline': { ionicons: 'flag-outline', lucide: Flag },
  
  // Achievements
  'trophy': { ionicons: 'trophy', lucide: Trophy },
  'trophy-outline': { ionicons: 'trophy-outline', lucide: Trophy },
  'ribbon': { ionicons: 'ribbon', lucide: Award },
  'ribbon-outline': { ionicons: 'ribbon-outline', lucide: Award },
  'medal': { ionicons: 'medal', lucide: Award },
  'medal-outline': { ionicons: 'medal-outline', lucide: Award },
  
  // Security
  'lock-closed': { ionicons: 'lock-closed', lucide: Lock },
  'lock-closed-outline': { ionicons: 'lock-closed-outline', lucide: Lock },
  'lock-open': { ionicons: 'lock-open', lucide: Unlock },
  'lock-open-outline': { ionicons: 'lock-open-outline', lucide: Unlock },
  'eye': { ionicons: 'eye', lucide: Eye },
  'eye-outline': { ionicons: 'eye-outline', lucide: Eye },
  'eye-off': { ionicons: 'eye-off', lucide: EyeOff },
  'eye-off-outline': { ionicons: 'eye-off-outline', lucide: EyeOff },
  
  // Info
  'information-circle': { ionicons: 'information-circle', lucide: Info },
  'information-circle-outline': { ionicons: 'information-circle-outline', lucide: Info },
  'help-circle': { ionicons: 'help-circle', lucide: HelpCircle },
  'help-circle-outline': { ionicons: 'help-circle-outline', lucide: HelpCircle },
  'alert-circle': { ionicons: 'alert-circle', lucide: AlertCircle },
  'alert-circle-outline': { ionicons: 'alert-circle-outline', lucide: AlertCircle },
  'bulb': { ionicons: 'bulb', lucide: Lightbulb },
  'bulb-outline': { ionicons: 'bulb-outline', lucide: Lightbulb },
  
  // Social
  'people': { ionicons: 'people', lucide: Users },
  'people-outline': { ionicons: 'people-outline', lucide: Users },
  
  // Fun
  'rocket': { ionicons: 'rocket', lucide: Rocket },
  'rocket-outline': { ionicons: 'rocket-outline', lucide: Rocket },
  'sparkles': { ionicons: 'sparkles', lucide: Sparkles },
  'flash': { ionicons: 'flash', lucide: Zap },
  'flash-outline': { ionicons: 'flash-outline', lucide: Zap },
  'flame': { ionicons: 'flame', lucide: Flame },
  'flame-outline': { ionicons: 'flame-outline', lucide: Flame },
  
  // Theme
  'sunny': { ionicons: 'sunny', lucide: Sun },
  'sunny-outline': { ionicons: 'sunny-outline', lucide: Sun },
  'moon': { ionicons: 'moon', lucide: Moon },
  'moon-outline': { ionicons: 'moon-outline', lucide: Moon },
  'color-palette': { ionicons: 'color-palette', lucide: Palette },
  'color-palette-outline': { ionicons: 'color-palette-outline', lucide: Palette },
};

// Brand icons (only available in Ionicons)
const BRAND_ICONS = ['logo-youtube', 'logo-spotify', 'logo-apple', 'logo-google', 'logo-facebook', 'logo-twitter'];

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  pack?: IconPack; // Override global setting
}

export function Icon({ name, size = 24, color, pack }: IconProps) {
  const { iconPack: globalPack } = useSettings();
  const { theme } = useTheme();
  
  const activePack = pack || globalPack;
  const iconColor = color || theme.colors.text;
  
  // Brand icons always use Ionicons
  if (BRAND_ICONS.includes(name)) {
    return <Ionicons name={name as any} size={size} color={iconColor} />;
  }
  
  const mapping = ICON_MAP[name];
  
  if (!mapping) {
    // Fallback to Ionicons for unmapped icons
    return <Ionicons name={name as any} size={size} color={iconColor} />;
  }
  
  if (activePack === 'lucide') {
    const LucideIcon = mapping.lucide;
    return <LucideIcon size={size} color={iconColor} strokeWidth={2} />;
  }
  
  // Default: Ionicons
  return <Ionicons name={mapping.ionicons as any} size={size} color={iconColor} />;
}

// Export for direct Ionicons usage when needed
export { Ionicons };
