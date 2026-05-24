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
  "Produce": "╫ñ╫Ö╫¿╫ò╫¬ ╫ò╫Ö╫¿╫º╫ò╫¬",
  "Dairy": "╫₧╫ò╫ª╫¿╫Ö ╫ù╫£╫æ",
  "Meat": "╫æ╫⌐╫¿",
  "Fish": "╫ô╫Æ╫Ö╫¥",
  "Bakery": "╫₧╫É╫ñ╫Ö╫Ö╫ö",
  "Pantry": "╫₧╫û╫ò╫ò╫ö",
  "Frozen": "╫º╫ñ╫ò╫É╫Ö╫¥",
  "Drinks": "╫₧╫⌐╫º╫É╫ò╫¬",
  "Other": "╫É╫ù╫¿",
  "": "",
};

export const SORT_OPTION_TRANSLATIONS: Record<SortOption, string> = {
  "A-Z": "╫É-╫¬",
  "Category": "╫º╫ÿ╫Æ╫ò╫¿╫Ö╫ö",
  "Unpurchased first": "╫£╫É ╫á╫¿╫¢╫⌐ ╫º╫ò╫ô╫¥",
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

