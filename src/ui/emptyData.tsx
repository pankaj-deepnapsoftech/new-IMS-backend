import { colors } from "../theme/colors";

const EmptyData = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="rounded-full p-6 mb-4"
        style={{ backgroundColor: colors.gray[100] }}
      >
        <svg
          className="w-12 h-12"
          style={{ color: colors.gray[400] }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: colors.text.primary }}
      >
        No data available
      </h3>
      <p className="max-w-md text-sm" style={{ color: colors.text.muted }}>
        Your table is currently empty. Add your first record to get started and
        see your data here.
      </p>
    </div>
  );
};

export default EmptyData;
