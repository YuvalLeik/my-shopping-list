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

export type PriceSource = "manual" | "receipt" | "photo" | "suggested";

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  category: Category;
  purchased: boolean;
  image?: string; // Base64 image data (optional)
  // Price fields
  unit_price?: number;
  line_total?: number;
  currency?: string;
  price_source?: PriceSource;
  receipt_id?: string;
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

// Receipt types
export type ReceiptType = "receipt" | "photo";

export interface Receipt {
  id: string;
  user_id: string;
  list_id?: string;
  type: ReceiptType;
  image_path: string;
  ocr_text?: string;
  vendor_name?: string;
  receipt_total?: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ReceiptLine {
  id: string;
  receipt_id: string;
  raw_line_text: string;
  normalized_name?: string;
  quantity: number;
  unit_price?: number;
  line_total?: number;
  match_item_id?: string;
  match_confidence?: number;
  created_at: string;
}

export interface ReceiptMatch {
  receipt_line_id: string;
  item_id: string;
  confidence: number;
  unit_price: number;
  line_total: number;
}
