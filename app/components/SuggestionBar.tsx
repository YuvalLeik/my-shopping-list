"use client";

import { CATEGORY_TRANSLATIONS, Category } from "../types";
import type { SuggestedItem } from "@/lib/frequency-tracker";

interface SuggestionBarProps {
  suggestions: SuggestedItem[];
  isLoading: boolean;
  onAddSuggestion: (name: string, category: string) => void;
  onDismiss: (name: string) => void;
}

const REASON_COLORS: Record<SuggestedItem["reason"], string> = {
  overdue: "bg-orange-50 border-orange-200 text-orange-800",
  regular: "bg-green-50 border-green-200 text-green-800",
  frequent: "bg-blue-50 border-blue-200 text-blue-800",
};

export default function SuggestionBar({
  suggestions,
  isLoading,
  onAddSuggestion,
  onDismiss,
}: SuggestionBarProps) {
  if (isLoading || suggestions.length === 0) return null;

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs sm:text-sm font-medium text-gray-600">
          אולי שכחת?
        </h3>
        <span className="text-xs text-gray-400">
          {suggestions.length} הצעות
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.name}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all ${REASON_COLORS[suggestion.reason]}`}
          >
            <button
              onClick={() =>
                onAddSuggestion(suggestion.name, suggestion.category)
              }
              className="flex items-center gap-1.5 text-sm font-medium"
              title={suggestion.reasonText}
            >
              <span>{suggestion.name}</span>
              {suggestion.category && (
                <span className="text-xs opacity-60">
                  {CATEGORY_TRANSLATIONS[suggestion.category as Category]}
                </span>
              )}
            </button>
            <button
              onClick={() => onDismiss(suggestion.name)}
              className="flex h-4 w-4 items-center justify-center rounded-full opacity-40 hover:opacity-80 transition-opacity"
              aria-label={`הסר הצעה: ${suggestion.name}`}
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
