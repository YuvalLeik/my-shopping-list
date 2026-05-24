"use client";

import { useState, useEffect } from "react";
import { getAllItemNames } from "@/lib/database";
import { GroceryItem, GroceryList, Category } from "../types";

export interface AutoCompleteItem {
  name: string;
  category: Category;
  image?: string;
}

export function useAutoComplete(
  items: GroceryItem[],
  completedLists: GroceryList[],
  user: any
) {
  const [allItemNamesWithCategory, setAllItemNamesWithCategory] = useState<
    AutoCompleteItem[]
  >([]);

  useEffect(() => {
    if (!user) return;

    const loadAutocompleteData = async () => {
      try {
        const dbItems = await getAllItemNames();
        const itemMap = new Map<string, AutoCompleteItem>();

        dbItems.forEach((item) => {
          itemMap.set(item.name.toLowerCase(), {
            name: item.name,
            category: item.category as Category,
            image: item.image,
          });
        });

        items.forEach((item) => {
          itemMap.set(item.name.toLowerCase(), {
            name: item.name,
            category: item.category,
            image: item.image,
          });
        });

        completedLists.forEach((list) => {
          list.items.forEach((item) => {
            if (
              !itemMap.has(item.name.toLowerCase()) ||
              !itemMap.get(item.name.toLowerCase())?.image
            ) {
              itemMap.set(item.name.toLowerCase(), {
                name: item.name,
                category: item.category,
                image: item.image,
              });
            }
          });
        });

        const sorted = Array.from(itemMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name, "he")
        );
        setAllItemNamesWithCategory(sorted);
      } catch (error) {
        console.error("Failed to load autocomplete data:", error);
        const itemMap = new Map<string, AutoCompleteItem>();
        items.forEach((item) => {
          itemMap.set(item.name.toLowerCase(), {
            name: item.name,
            category: item.category,
            image: item.image,
          });
        });
        completedLists.forEach((list) => {
          list.items.forEach((item) => {
            if (!itemMap.has(item.name.toLowerCase())) {
              itemMap.set(item.name.toLowerCase(), {
                name: item.name,
                category: item.category,
                image: item.image,
              });
            }
          });
        });
        setAllItemNamesWithCategory(
          Array.from(itemMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name, "he")
          )
        );
      }
    };

    loadAutocompleteData();
  }, [items, completedLists, user]);

  const getSuggestions = (query: string): AutoCompleteItem[] => {
    if (query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    return allItemNamesWithCategory
      .filter((item) => item.name.toLowerCase().startsWith(q))
      .slice(0, 8);
  };

  return { allItemNamesWithCategory, getSuggestions };
}
