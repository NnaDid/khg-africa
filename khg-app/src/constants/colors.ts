// KHG Africa Design System — Colors & Risk Palette
export const COLORS = {
  // Brand
  primary: '#1BBC9B',
  primaryDark: '#0d9375',
  primaryLight: '#d4f5ed',
  secondary: '#1A3C5E',
  accent: '#F7DD6F',

  // Risk Levels
  risk: {
    safe: '#22c55e',       // GREEN  — Safe
    safeLight: '#dcfce7',
    moderate: '#eab308',   // YELLOW — Moderate
    moderateLight: '#fef9c3',
    high: '#f97316',       // ORANGE — High
    highLight: '#ffedd5',
    critical: '#ef4444',   // RED    — Critical
    criticalLight: '#fee2e2',
    unknown: '#6b7280',
    unknownLight: '#f3f4f6',
  },

  // UI
  background: '#0a1628',
  surface: '#0f2040',
  surfaceLight: '#162850',
  card: '#1a3055',
  border: '#1e3a6a',
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    inverse: '#0a1628',
  },

  // Status
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',

  // Misc
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Disease / Hazard Types
export const HAZARD_TYPES = [
  { id: 'malaria', label: 'Malaria', icon: 'bug', color: '#ef4444' },
  { id: 'cholera', label: 'Cholera', icon: 'water', color: '#3b82f6' },
  { id: 'dengue', label: 'Dengue', icon: 'bug-outline', color: '#f97316' },
  { id: 'heat_stress', label: 'Heat Stress', icon: 'thermometer', color: '#eab308' },
  { id: 'flooding', label: 'Flooding', icon: 'rainy', color: '#06b6d4' },
  { id: 'air_pollution', label: 'Air Pollution', icon: 'cloudy', color: '#8b5cf6' },
] as const;

export const RISK_LEVELS = {
  safe: { label: 'Safe', color: COLORS.risk.safe, bg: COLORS.risk.safeLight, score: 0 },
  moderate: { label: 'Moderate', color: COLORS.risk.moderate, bg: COLORS.risk.moderateLight, score: 33 },
  high: { label: 'High', color: COLORS.risk.high, bg: COLORS.risk.highLight, score: 66 },
  critical: { label: 'Critical', color: COLORS.risk.critical, bg: COLORS.risk.criticalLight, score: 90 },
} as const;

export type RiskLevel = keyof typeof RISK_LEVELS;
export type HazardType = typeof HAZARD_TYPES[number]['id'];
