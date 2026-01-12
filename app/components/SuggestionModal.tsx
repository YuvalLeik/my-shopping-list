"use client";

import { GroceryItem } from "../types";
import { CATEGORY_TRANSLATIONS } from "../types";

interface SuggestionModalProps {
  suggestedItems: GroceryItem[];
  onAddItem: (item: GroceryItem) => void;
  onAddAll: () => void;
  onDismiss: () => void;
}

export default function SuggestionModal({
  suggestedItems,
  onAddItem,
  onAddAll,
  onDismiss,
}: SuggestionModalProps) {
  if (suggestedItems.length === 0) return null;

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onDismiss();
  };

  const handleAddAll = () => {
    onAddAll();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          handleDismiss(e);
        }
      }}
    >
      <div 
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => {
          // Prevent clicks inside modal from closing it
          e.stopPropagation();
        }}
      >
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          הצעות מהרשימה הקודמת
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          האם תרצה להוסיף פריטים מהרשימה האחרונה?
        </p>
        
        <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
          {suggestedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.name}</div>
                {item.category && (
                  <div className="mt-1 text-xs text-gray-500">
                    {CATEGORY_TRANSLATIONS[item.category]} • כמות: {item.quantity}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onAddItem(item)}
                className="mr-3 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                הוסף
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-row-reverse">
          <button
            type="button"
            onClick={handleDismiss}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            דלג
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddAll();
            }}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
          >
            הוסף הכל
          </button>
        </div>
      </div>
    </div>
  );
}
