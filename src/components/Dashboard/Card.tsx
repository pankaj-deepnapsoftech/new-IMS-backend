import React from "react";
import { colors } from "../../theme/colors";

interface CardProps {
  title: string;
  content: string | number;
  icon: React.ReactNode;
  type?:
    | "designer"
    | "dispatcher"
    | "sales"
    | "products"
    | "inventory"
    | "employees"
    | "stores"
    | "payments"
    | "bom";
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const Card: React.FC<CardProps> = ({
  title,
  content,
  icon,
  type = "sales",
  subtitle,
  trend,
}) => {
  // Get theme colors based on card type
  const getCardTheme = () => {
    const themes = colors.dashboard.metrics;
    return themes[type] || themes.sales;
  };

  const theme = getCardTheme();

  // Format the title display
  const formatTitle = (title: string) => {
    if (title === "DESIGNER") return "Designer";
    if (title === "DISPATCHER") return "Dispatcher";
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  };

  return (
    <div
      className="group relative bg-white rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-gray-100"
      style={{
        boxShadow: colors.dashboard.card.shadow,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = colors.dashboard.card.shadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = colors.dashboard.card.shadow;
      }}
    >
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-5"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10">
        {/* Header with icon and title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: colors.text.primary }}
            >
              {formatTitle(title)}
            </h3>
            {subtitle && (
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Icon container */}
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-200"
            style={{
              backgroundColor: theme.background,
              color: theme.primary,
            }}
          >
            <div className="text-2xl">{icon}</div>
          </div>
        </div>

        {/* Content section */}
        <div className="space-y-3">
          {/* Main metric */}
          <div
            className="inline-flex items-center px-4 py-3 rounded-xl font-bold text-xl min-w-[100px]"
            style={{
              backgroundColor: colors.gray[50],
              color: theme.primary,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            {content}
          </div>

          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  trend.isPositive ? "text-green-700" : "text-red-700"
                }`}
                style={{
                  backgroundColor: trend.isPositive
                    ? colors.success[100]
                    : colors.error[100],
                }}
              >
                <span className={trend.isPositive ? "↗" : "↘"}>
                  {trend.isPositive ? "↗" : "↘"}
                </span>
                {Math.abs(trend.value)}%
              </div>
              <span className="text-xs" style={{ color: colors.text.muted }}>
                vs last month
              </span>
            </div>
          )}
        </div>

        {/* Decorative element */}
        <div
          className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: theme.secondary }}
        />
      </div>
    </div>
  );
};

export default Card;
