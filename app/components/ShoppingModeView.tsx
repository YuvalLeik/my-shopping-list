"use client";

import { CATEGORY_TRANSLATIONS, Category } from "../types";
import type { CategoryGroup } from "../hooks/useShoppingMode";

interface ShoppingModeViewProps {
  groupedItems: CategoryGroup[];
  progress: { total: number; checked: number; percentage: number };
  onTogglePurchased: (id: string) => void;
  onCompleteList: () => void;
  onExitShoppingMode: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Produce: "bg-green-500",
  Dairy: "bg-blue-400",
  Meat: "bg-red-500",
  Fish: "bg-cyan-500",
  Bakery: "bg-amber-500",
  Pantry: "bg-yellow-600",
  Frozen: "bg-indigo-400",
  Drinks: "bg-purple-500",
  Other: "bg-gray-500",
  "": "bg-gray-400",
};

const CATEGORY_BG: Record<string, string> = {
  Produce: "bg-green-50 border-green-200",
  Dairy: "bg-blue-50 border-blue-200",
  Meat: "bg-red-50 border-red-200",
  Fish: "bg-cyan-50 border-cyan-200",
  Bakery: "bg-amber-50 border-amber-200",
  Pantry: "bg-yellow-50 border-yellow-200",
  Frozen: "bg-indigo-50 border-indigo-200",
  Drinks: "bg-purple-50 border-purple-200",
  Other: "bg-gray-50 border-gray-200",
  "": "bg-gray-50 border-gray-200",
};

export default function ShoppingModeView({
  groupedItems,
  progress,
  onTogglePurchased,
  onCompleteList,
  onExitShoppingMode,
}: ShoppingModeViewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onExitShoppingMode}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="h-5 w-5"
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
            יציאה
          </button>

          <h1 className="text-base font-bold text-gray-900">מצב קניות</h1>

          <div className="text-sm font-medium text-gray-600">
            {progress.checked}/{progress.total}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Item list by category */}
      <div className="px-4 py-4 pb-32 max-w-2xl mx-auto">
        {groupedItems.map((group) => (
          <div key={group.category} className="mb-4">
            {/* Category header */}
            <div
              className={`flex items-center gap-2 rounded-t-lg border px-3 py-2 ${
                CATEGORY_BG[group.category]
              }`}
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  CATEGORY_COLORS[group.category]
                }`}
              />
              <span className="text-sm font-semibold text-gray-800">
                {group.category
                  ? CATEGORY_TRANSLATIONS[group.category as Category]
                  : "ללא קטגוריה"}
              </span>
              <span className="text-xs text-gray-500 mr-auto">
                {group.checkedCount}/{group.items.length}
              </span>
            </div>

            {/* Items */}
            <div className="border border-t-0 border-gray-200 rounded-b-lg bg-white divide-y divide-gray-100">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTogglePurchased(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-right transition-all active:bg-gray-100 ${
                    item.purchased ? "opacity-50" : ""
                  }`}
                >
                  {/* Large checkbox */}
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                      item.purchased
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {item.purchased && (
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <span
                        className={`text-base font-medium truncate ${
                          item.purchased
                            ? "text-gray-400 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>

                  {/* Quantity */}
                  {item.quantity > 1 && (
                    <span
                      className={`flex-shrink-0 text-sm font-medium ${
                        item.purchased ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      ×{item.quantity}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          {progress.checked === progress.total && progress.total > 0 ? (
            <button
              onClick={onCompleteList}
              className="w-full rounded-xl bg-green-600 py-4 text-base font-bold text-white transition-colors hover:bg-green-700 active:bg-green-800"
            >
              סיימתי קניות! ✓
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {progress.total - progress.checked} פריטים נותרו
              </span>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 relative">
                  <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-green-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${progress.percentage}, 100`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                    {progress.percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
