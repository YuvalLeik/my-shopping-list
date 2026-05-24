"use client";

import { SortOption, SORT_OPTION_TRANSLATIONS } from "../types";

interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  purchasedCount: number;
  totalCount: number;
  allPurchased: boolean;
  onClearPurchased: () => void;
  onCompleteList: () => void;
}

export default function SearchAndSort({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  purchasedCount,
  totalCount,
  allPurchased,
  onClearPurchased,
  onCompleteList,
}: SearchAndSortProps) {
  return (
    <div className="mb-4 sm:mb-6 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            חיפוש
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חפש פריטים..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            מיון לפי
          </label>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Unpurchased first">
              {SORT_OPTION_TRANSLATIONS["Unpurchased first"]}
            </option>
            <option value="A-Z">{SORT_OPTION_TRANSLATIONS["A-Z"]}</option>
            <option value="Category">
              {SORT_OPTION_TRANSLATIONS["Category"]}
            </option>
          </select>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        {purchasedCount > 0 && (
          <button
            onClick={onClearPurchased}
            className="rounded-lg border border-red-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            מחק {purchasedCount} פריט{purchasedCount !== 1 ? "ים" : ""} שנרכש
            {purchasedCount !== 1 ? "ו" : ""}
          </button>
        )}
        {totalCount > 0 && !allPurchased && (
          <button
            onClick={onCompleteList}
            className="rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            סמן רשימה כהושלמה
          </button>
        )}
        {totalCount > 0 && allPurchased && (
          <button
            onClick={onCompleteList}
            className="rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            סיין רשימה והעבר לרשימות קודמות
          </button>
        )}
      </div>
    </div>
  );
}
