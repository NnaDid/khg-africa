export const COLORS = {
  primary: "#1BBC9B", // Vibrant Turquoise Brand Primary
  secondary: "#0d2c54", // Deep Navy Secondary
  background: "#0a1128", // Sleek Dark Cyber Background
  surface: "#0e1e38", // Glassmorphic blue surface
  surfaceLight: "#162b4c", // Slightly lighter slate
  text: {
    primary: "#f8fafc", // Crisp white
    secondary: "#94a3b8", // Muted slate gray
    muted: "#64748b",
  },
  risk: {
    safe: "#10b981", // Emerald Green
    moderate: "#f59e0b", // Amber Yellow
    high: "#f97316", // Neon Orange
    critical: "#ef4444", // Crimson Red
  }
};

export const RISK_LEVELS = {
  safe: {
    label: "Safe Mode",
    color: COLORS.risk.safe,
    score: 15,
  },
  moderate: {
    label: "Moderate Danger",
    color: COLORS.risk.moderate,
    score: 45,
  },
  high: {
    label: "High Alert",
    color: COLORS.risk.high,
    score: 75,
  },
  critical: {
    label: "Critical Outbreak",
    color: COLORS.risk.critical,
    score: 95,
  }
};
