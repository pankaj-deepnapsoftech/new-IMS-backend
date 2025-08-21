import React from "react";
import { colors } from "../theme/colors";

interface PaginationsProps {
  page: number;
  setPage: (page: number) => void;
  hasNextPage: boolean;
}

const Paginations: React.FC<PaginationsProps> = ({
  page,
  setPage,
  hasNextPage,
}) => {
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (hasNextPage) setPage(page + 1);
  };

  return (
    <div
      className="flex items-center justify-center px-6 py-4 border-t"
      style={{
        backgroundColor: colors.gray[50],
        borderColor: colors.border.light,
      }}
    >
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          disabled={page === 1}
          onClick={handlePrev}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          style={{
            color: colors.text.primary,
            backgroundColor: colors.background.card,
            border: `1px solid ${colors.border.light}`,
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.gray[50];
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.background.card;
            }
          }}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        {/* Page Indicator */}
        <div
          className="px-3 py-2 text-sm font-medium rounded-lg"
          style={{
            backgroundColor: colors.primary[500],
            color: colors.text.inverse,
            boxShadow: colors.shadow.sm,
          }}
        >
           {page}
        </div>

        {/* Next Button */}
        <button
          disabled={!hasNextPage}
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          style={{
            color: colors.text.primary,
            backgroundColor: colors.background.card,
            border: `1px solid ${colors.border.light}`,
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.gray[50];
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = colors.background.card;
            }
          }}
        >
          Next
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Paginations;
