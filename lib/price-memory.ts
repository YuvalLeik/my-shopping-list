import { supabase } from "./supabase";

// Normalize item name for price memory matching
export function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/[^\w\s\u0590-\u05FF]/g, ""); // Remove punctuation, keep Hebrew
}

// Get price suggestions for items
export async function getPriceSuggestions(
  vendorName: string,
  itemNames: string[]
): Promise<Record<string, { unit_price: number; currency: string }>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  // Normalize item names
  const normalizedNames = itemNames.map(normalizeItemName);

  // Get price memories for this vendor and normalized names
  const { data: memories, error } = await supabase
    .from("price_memories")
    .select("normalized_name, unit_price, currency")
    .eq("user_id", user.id)
    .eq("vendor_name", vendorName)
    .in("normalized_name", normalizedNames)
    .order("last_used_at", { ascending: false });

  if (error) {
    console.error("Failed to load price suggestions:", error);
    return {};
  }

  // Build map: original item name -> price suggestion
  const suggestions: Record<string, { unit_price: number; currency: string }> = {};

  for (const itemName of itemNames) {
    const normalized = normalizeItemName(itemName);
    const memory = memories?.find((m) => m.normalized_name === normalized);
    if (memory) {
      suggestions[itemName] = {
        unit_price: memory.unit_price,
        currency: memory.currency || "ILS",
      };
    }
  }

  return suggestions;
}

// Save price to memory
export async function savePriceToMemory(
  vendorName: string,
  itemName: string,
  unitPrice: number,
  currency: string = "ILS"
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const normalizedName = normalizeItemName(itemName);

  const { error } = await supabase.from("price_memories").upsert(
    {
      user_id: user.id,
      vendor_name: vendorName,
      item_name: itemName,
      normalized_name: normalizedName,
      unit_price: unitPrice,
      currency,
      last_used_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,vendor_name,normalized_name",
    }
  );

  if (error) throw error;
}
