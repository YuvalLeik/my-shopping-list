// Type definitions for the grocery list app

export type Category = 
  | "Produce"
  | "Dairy"
  | "Meat"
  | "Fish"
  | "Bakery"
  | "Pantry"
  | "Frozen"
  | "Drinks"
  | "Other"
  | "";

export type SortOption = "A-Z" | "Category" | "Unpurchased first";

// Hebrew translations
export const CATEGORY_TRANSLATIONS: Record<Category, string> = {
  "Produce": "פירות וירקות",
  "Dairy": "מוצרי חלב",
  "Meat": "בשר",
  "Fish": "דגים",
  "Bakery": "מאפייה",
  "Pantry": "מזווה",
  "Frozen": "קפואים",
  "Drinks": "משקאות",
  "Other": "אחר",
  "": "",
};

export const SORT_OPTION_TRANSLATIONS: Record<SortOption, string> = {
  "A-Z": "א-ת",
  "Category": "קטגוריה",
  "Unpurchased first": "לא נרכש קודם",
};

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  category: Category;
  purchased: boolean;
  image?: string; // Base64 image data (optional)
}

export interface GroceryList {
  date: string; // Format: YYYY-MM-DD
  items: GroceryItem[];
  completed: boolean;
  completedAt?: string;
}

export interface StoredLists {
  listsByDate: Record<string, GroceryList>; // Maps date (YYYY-MM-DD) to list
  completedLists: GroceryList[];
  currentDate?: string; // The currently selected date
}
