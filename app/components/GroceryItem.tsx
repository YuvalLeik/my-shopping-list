"use client";

import { GroceryItem as GroceryItemType, CATEGORY_TRANSLATIONS } from "../types";

interface GroceryItemProps {
  item: GroceryItemType;
  onTogglePurchased: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}

export default function GroceryItem({
  item,
  onTogglePurchased,
  onUpdateQuantity,
  onDelete,
}: GroceryItemProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-lg border p-3 sm:p-4 transition-all ${
        item.purchased
          ? "border-gray-200 bg-gray-50 opacity-75"
          : "border-gray-300 bg-white shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={() => onTogglePurchased(item.id)}
          className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 flex-shrink-0"
          aria-label="סמן כנרכש"
        />

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
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
                <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500">
                  {CATEGORY_TRANSLATIONS[item.category]}
                </div>
              )}
              {item.unit_price !== undefined && item.unit_price !== null && (
                <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-green-600">
                  ₪{item.unit_price.toFixed(2)}
                  {item.line_total !== undefined && item.line_total !== null && item.line_total !== item.unit_price * item.quantity && (
                    <span className="text-gray-500 mr-1">
                      (סה"כ: ₪{item.line_total.toFixed(2)})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={item.quantity <= 1}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base"
            aria-label="הקטן כמות"
          >
            −
          </button>
          <span className="min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base font-medium text-gray-900">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 text-sm sm:text-base"
            aria-label="הגדל כמות"
          >
            +
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(item.id)}
          className="rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          aria-label="מחק פריט"
        >
          מחק
        </button>
      </div>
    </div>
  );
}
