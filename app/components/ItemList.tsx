"use client";

import { GroceryItem as GroceryItemType } from "../types";
import ItemCard from "./ItemCard";

interface ItemListProps {
  items: GroceryItemType[];
  totalItemCount: number;
  allPurchased: boolean;
  onTogglePurchased: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}

export default function ItemList({
  items,
  totalItemCount,
  allPurchased,
  onTogglePurchased,
  onUpdateQuantity,
  onDelete,
}: ItemListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
      <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900">
        הרשימה שלך ({items.length} פריט{items.length !== 1 ? "ים" : ""})
        {allPurchased && (
          <span className="mr-2 text-xs sm:text-sm font-normal text-green-600">
            ✔ הושלמה
          </span>
        )}
      </h2>
      {items.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-3 text-4xl">🛒</div>
          <p className="text-gray-500">
            {totalItemCount === 0
              ? "רשימת הקניות שלך ריקה. הוסף פריט כדי להתחיל!"
              : "אין פריטים התואמים לחיפוש שלך."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onTogglePurchased={onTogglePurchased}
              onUpdateQuantity={onUpdateQuantity}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
