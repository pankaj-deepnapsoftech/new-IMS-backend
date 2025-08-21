// Centralized color definitions for the entire application
export const  colors = {
  // Primary colors
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Main blue
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Secondary colors
  secondary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  // Gray scale
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Success colors
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Error colors
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Warning colors
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Info colors
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Background colors
  background: {
    page: "#f9fafb", // Main page background
    card: "#ffffff", // Card/container background
    sidebar: "#ffffff", // Sidebar background
    table: "#ffffff", // Table background
    tableRow: "#f9fafb", // Alternating table row
    drawer: "#ffffff", // Drawer background
  },

  // Border colors
  border: {
    light: "#e5e7eb", // Light borders
    medium: "#d1d5db", // Medium borders
    dark: "#9ca3af", // Dark borders
    focus: "#3b82f6", // Focus border
  },

  // Text colors
  text: {
    primary: "#111827", // Primary text
    secondary: "#6b7280", // Secondary text
    muted: "#9ca3af", // Muted text
    inverse: "#ffffff", // White text
    error: "#dc2626", // Error text
    success: "#16a34a", // Success text
    warning: "#d97706", // Warning text
  },

  // Component specific colors
  table: {
    header: "#f9fafb",
    headerText: "#374151",
    border: "#e5e7eb",
    hover: "#f3f4f6",
    stripe: "#f9fafb",
  },

  button: {
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    secondary: "#6b7280",
    secondaryHover: "#4b5563",
    danger: "#dc2626",
    dangerHover: "#b91c1c",
  },

  input: {
    border: "#d1d5db",
    borderHover: "#9ca3af",
    borderFocus: "#3b82f6",
    background: "#ffffff",
  },

  // Shadow definitions
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Dashboard specific colors
  dashboard: {
    card: {
      background: "#ffffff",
      border: "#e5e7eb",
      shadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      shadowHover:
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      iconBackground: "#f9fafb",
      contentBackground: "#f3f4f6",
    },
    metrics: {
      designer: {
        primary: "#8b5cf6",
        secondary: "#a78bfa",
        background: "#faf5ff",
      },
      dispatcher: {
        primary: "#10b981",
        secondary: "#34d399",
        background: "#f0fdf4",
      },
      sales: {
        primary: "#3b82f6",
        secondary: "#60a5fa",
        background: "#eff6ff",
      },
      products: {
        primary: "#f59e0b",
        secondary: "#fbbf24",
        background: "#fffbeb",
      },
      inventory: {
        primary: "#ef4444",
        secondary: "#f87171",
        background: "#fef2f2",
      },
      employees: {
        primary: "#06b6d4",
        secondary: "#22d3ee",
        background: "#f0fdff",
      },
      stores: {
        primary: "#8b5cf6",
        secondary: "#a78bfa",
        background: "#faf5ff",
      },
      payments: {
        primary: "#22c55e",
        secondary: "#4ade80",
        background: "#f0fdf4",
      },
      bom: {
        primary: "#f59e0b",
        secondary: "#fbbf24",
        background: "#fffbeb",
      },
    },
  },
} as const;

// Type for accessing nested color values
export type ColorPath =
  | `primary.${keyof typeof colors.primary}`
  | `secondary.${keyof typeof colors.secondary}`
  | `gray.${keyof typeof colors.gray}`
  | `success.${keyof typeof colors.success}`
  | `error.${keyof typeof colors.error}`
  | `warning.${keyof typeof colors.warning}`
  | `info.${keyof typeof colors.info}`
  | `background.${keyof typeof colors.background}`
  | `border.${keyof typeof colors.border}`
  | `text.${keyof typeof colors.text}`
  | `table.${keyof typeof colors.table}`
  | `button.${keyof typeof colors.button}`
  | `input.${keyof typeof colors.input}`
  | `shadow.${keyof typeof colors.shadow}`;
