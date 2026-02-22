/**
 * EverWoven Design Tokens
 * Inspired by the "Intimate Dual-Journal" Stitch design.
 * Primary accent: Dusty blue (#6497b9)
 * Typography: Newsreader serif for headings, system sans for UI
 */

import { Platform } from 'react-native';

// --- Brand Colors ---
export const Brand = {
  /** Primary dusty-blue accent */
  blue: '#6497b9',
  /** Lighter tint of accent for chips/toggles */
  blueMuted: '#E8EFF5',
  /** Deep navy for serif headings */
  navy: '#1E2D3D',
  /** Off-white app background */
  offWhite: '#F7F8FC',
  /** Warm white for card surfaces */
  cardWhite: '#FFFFFF',
  /** Muted grey for placeholder / meta text */
  mutedGrey: '#9BA8B5',
  /** Soft separator line color */
  separator: '#E2E8EF',
  /** Universal icon stroke width */
  iconStrokeWidth: 1.5,
};

export const Layout = {
  screenPadding: 20,
};

const tintColorLight = Brand.blue;
const tintColorDark = '#ECEDEE';

export const Colors = {
  light: {
    text: Brand.navy,
    background: Brand.offWhite,
    tint: tintColorLight,
    icon: Brand.mutedGrey,
    tabIconDefault: Brand.mutedGrey,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#12161C',
    tint: tintColorDark,
    icon: '#6B7A8D',
    tabIconDefault: '#6B7A8D',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'Georgia',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
