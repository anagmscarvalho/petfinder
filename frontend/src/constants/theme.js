/**
 * PetFinder Design System
 * Tokens extraídos dos designs SVG do Figma
 */

export const COLORS = {
  // Primárias
  primary: '#EE791C',
  primaryLight: 'rgba(238, 121, 28, 0.12)',
  primaryFaint: 'rgba(238, 121, 28, 0.08)',
  primaryGradientStart: 'rgba(238, 121, 28, 0.15)',
  primaryGradientEnd: 'rgba(238, 121, 28, 0.05)',

  // Neutras
  background: '#F2EFE4',
  cardWhite: '#FFFFFF',
  border: '#E6E6E6',
  divider: '#E0E0E0',

  // Texto
  textDark: '#1A1A1A',
  textTitle: '#455A64',
  textGray: '#828282',
  textWhite: '#FFFFFF',

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  // Backgrounds
  tagBg: '#F5F5F5',
  black: '#000000',
};

export const FONTS = {
  // Font weights via system fonts (Inter quando disponível)
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  semiBold: {
    fontFamily: 'System',
    fontWeight: '600',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
};

export const SIZES = {
  // Espaçamento
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  // Border Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 14,
  radiusXl: 16,
  radiusPill: 100,

  // Tipografia
  fontXs: 9,
  fontSm: 11,
  fontMd: 12,
  fontBase: 13,
  fontLg: 14,
  fontXl: 15,
  fontXxl: 16,
  font2xl: 20,
  font3xl: 24,
  font4xl: 32,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 5,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };
