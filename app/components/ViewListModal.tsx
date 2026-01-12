"use client";

import { GroceryList } from "../types";
import { CATEGORY_TRANSLATIONS } from "../types";

interface ViewListModalProps {
  list: GroceryList;
  onClose: () => void;
}

export default function ViewListModal({ list, onClose }: ViewListModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-3 sm:mb-4 flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              רשימה מ-{formatDate(list.date)}
            </h2>
            {list.completedAt && (
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                הושלמה ב-{new Date(list.completedAt).toLocaleDateString("he-IL")}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 flex-shrink-0"
          >
            סגור
          </button>
        </div>

        <div className="space-y-2">
          {list.items.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 ${
                item.purchased
                  ? "border-gray-200 bg-gray-50 opacity-75"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div
                className={`h-4 w-4 rounded border-2 ${
                  item.purchased
                    ? "border-green-500 bg-green-500"
                    : "border-gray-300"
                }`}
              >
                {item.purchased && (
                  <svg
                    className="h-full w-full text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm sm:text-base font-medium truncate ${
                        item.purchased ? "text-gray-500 line-through" : "text-gray-900"
                      }`}
                    >
                      {item.name}
                    </div>
                    {item.category && (
                      <div className="mt-0.5 sm:mt-1 text-xs text-gray-500">
                        {CATEGORY_TRANSLATIONS[item.category]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
                כמות: {item.quantity}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
