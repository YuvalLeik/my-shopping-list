import { supabase } from "./supabase";
import { getActiveUserId } from "./family-users";

// Normalize item name for price memory matching
export function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// Save or update price memory
export async function savePriceMemory(
  vendorName: string,
  itemName: string,
  unitPrice: number,
  currency: string = "ILS"
): Promise<void> {
  const userId = getActiveUserId();
  if (!userId) throw new Error("No active user selected");

  const normalizedName = normalizeItemName(itemName);

  const { error } = await supabase.from("price_memories").upsert(
    {
      local_user_id: userId,
      vendor_name: vendorName,
      item_name: itemName,
      normalized_name: normalizedName,
      unit_price: unitPrice,
      currency,
      last_used_at: new Date().toISOString(),
    },
    {
      onConflict: "local_user_id,vendor_name,normalized_name",
    }
  );

  if (error) throw error;
}

// Get price memories for a vendor
export async function getPriceMemoriesForVendor(
  vendorName: string
): Promise<Map<string, { unitPrice: number; currency: string; lastUsedAt: string }>> {
  if (typeof window === "undefined") return new Map();
  const userId = getActiveUserId();
  if (!userId) return new Map();

  const { data, error } = await supabase
    .from("price_memories")
    .select("normalized_name, unit_price, currency, last_used_at")
    .eq("local_user_id", userId)
    .eq("vendor_name", vendorName)
    .order("last_used_at", { ascending: false });

  if (error) {
    console.error("Error fetching price memories:", error);
    return new Map();
  }

  const map = new Map();
  (data || []).forEach((memory) => {
    map.set(memory.normalized_name, {
      unitPrice: memory.unit_price,
      currency: memory.currency,
      lastUsedAt: memory.last_used_at,
    });
  });

  return map;
}

// Get suggested price for an item
export async function getSuggestedPrice(
  vendorName: string,
  itemName: string
): Promise<{ unitPrice: number; currency: string } | null> {
  if (typeof window === "undefined") return null;
  const userId = getActiveUserId();
  if (!userId) return null;

  const normalizedName = normalizeItemName(itemName);

  const { data, error } = await supabase
    .from("price_memories")
    .select("unit_price, currency")
    .eq("local_user_id", userId)
    .eq("vendor_name", vendorName)
    .eq("normalized_name", normalizedName)
    .single();

  if (error || !data) return null;

  return {
    unitPrice: data.unit_price,
    currency: data.currency,
  };
}

// Update grocery item prices
export async function updateItemPrices(
  itemId: string,
  unitPrice: number,
  lineTotal: number,
  currency: string = "ILS",
  receiptId?: string
): Promise<void> {
  const userId = getActiveUserId();
  if (!userId) throw new Error("No active user selected");

  // Verify item belongs to user's list
  const { data: item, error: itemError } = await supabase
    .from("grocery_items")
    .select("id, name, quantity, grocery_lists!inner(local_user_id)")
    .eq("id", itemId)
    .single();

  if (itemError || !item || (item.grocery_lists as any).local_user_id !== userId) {
    throw new Error("Item not found or access denied");
  }

  const { error } = await supabase
    .from("grocery_items")
    .update({
      unit_price: unitPrice,
      line_total: lineTotal,
      currency,
      price_source: "manual",
      receipt_id: receiptId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) throw error;
}
