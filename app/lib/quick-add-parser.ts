import { Category } from "../types";
import { categorizeItem } from "../data/hebrew-category-map";
import type { AutoCompleteItem } from "../hooks/useAutoComplete";

export interface ParsedItem {
  name: string;
  quantity: number;
  category: Category;
}

export function parseQuickAddInput(
  input: string,
  autocompleteData: AutoCompleteItem[]
): ParsedItem {
  const trimmed = input.trim();
  if (!trimmed) {
    return { name: "", quantity: 1, category: "" };
  }

  let name = trimmed;
  let quantity = 1;

  // Pattern: "3 חלב" or "3חלב" (number at start)
  const leadingNumberMatch = trimmed.match(/^(\d+)\s*(.+)$/);
  if (leadingNumberMatch) {
    quantity = parseInt(leadingNumberMatch[1], 10);
    name = leadingNumberMatch[2].trim();
  }

  // Pattern: "חלב x3" or "חלב X3" or "חלב *3"
  const trailingPatternMatch = name.match(/^(.+?)\s*[xX*]\s*(\d+)$/);
  if (trailingPatternMatch) {
    name = trailingPatternMatch[1].trim();
    quantity = parseInt(trailingPatternMatch[2], 10);
  }

  // Pattern: "חלב 3" (trailing number after space, only if not part of the name)
  if (quantity === 1) {
    const trailingNumberMatch = name.match(/^(.+?)\s+(\d+)$/);
    if (trailingNumberMatch) {
      const potentialName = trailingNumberMatch[1].trim();
      // Only treat as quantity if the remaining name is at least 2 chars
      if (potentialName.length >= 2) {
        name = potentialName;
        quantity = parseInt(trailingNumberMatch[2], 10);
      }
    }
  }

  quantity = Math.max(1, Math.min(99, quantity));

  // Categorize: user history first, then built-in map
  let category: Category = "";

  const normalizedName = name.toLowerCase();
  const historyMatch = autocompleteData.find(
    (item) => item.name.toLowerCase() === normalizedName
  );

  if (historyMatch && historyMatch.category) {
    category = historyMatch.category;
  } else {
    category = categorizeItem(name);
  }

  return { name, quantity, category };
}
