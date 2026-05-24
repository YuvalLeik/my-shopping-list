"use client";

import { useState, useMemo, useCallback } from "react";
import { GroceryItem, Category } from "../types";

export interface CategoryGroup {
  category: Category;
  items: GroceryItem[];
  checkedCount: number;
}

export function useShoppingMode(items: GroceryItem[]) {
  const [isShoppingMode, setIsShoppingMode] = useState(false);

  const toggleShoppingMode = useCallback(() => {
    setIsShoppingMode((prev) => !prev);
  }, []);

  const progress = useMemo(() => {
    const total = items.length;
    const checked = items.filter((item) => item.purchased).length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { total, checked, percentage };
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups = new Map<Category, GroceryItem[]>();

    // Group items by category
    for (const item of items) {
      const cat = item.category || ("" as Category);
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(item);
    }

    // Sort categories: non-empty first, then empty
    const categoryOrder: Category[] = [
      "Produce",
      "Dairy",
      "Meat",
      "Fish",
      "Bakery",
      "Pantry",
      "Frozen",
      "Drinks",
      "Other",
      "",
    ];

    const result: CategoryGroup[] = [];
    for (const cat of categoryOrder) {
      const catItems = groups.get(cat);
      if (catItems && catItems.length > 0) {
        // Sort: unchecked first, then alphabetically
        const sorted = [...catItems].sort((a, b) => {
          if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
          return a.name.localeCompare(b.name, "he");
        });
        result.push({
          category: cat,
          items: sorted,
          checkedCount: sorted.filter((i) => i.purchased).length,
        });
      }
    }

    return result;
  }, [items]);

  return {
    isShoppingMode,
    toggleShoppingMode,
    progress,
    groupedItems,
  };
}
