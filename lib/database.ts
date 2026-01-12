import { supabase } from "./supabase";
import { GroceryItem, GroceryList } from "@/app/types";

// Get current user ID
export async function getUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

// Save or update a grocery list
export async function saveGroceryList(
  date: string,
  items: GroceryItem[],
  completed: boolean = false
): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("User not authenticated");

  // First, check if a list exists for this date
  const { data: existingList } = await supabase
    .from("grocery_lists")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .eq("completed", false)
    .single();

  const listData = {
    user_id: userId,
    date,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  let listId: string;

  if (existingList) {
    // Update existing list
    const { error } = await supabase
      .from("grocery_lists")
      .update(listData)
      .eq("id", existingList.id);
    if (error) throw error;
    listId = existingList.id;
  } else {
    // Create new list
    const { data, error } = await supabase
      .from("grocery_lists")
      .insert(listData)
      .select("id")
      .single();
    if (error) throw error;
    listId = data.id;
  }

  // Delete all existing items for this list
  await supabase.from("grocery_items").delete().eq("list_id", listId);

  // Insert new items
  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      list_id: listId,
      name: item.name,
      quantity: item.quantity,
      category: item.category || null,
      purchased: item.purchased,
      image: item.image || null,
    }));

    const { error } = await supabase
      .from("grocery_items")
      .insert(itemsToInsert);
    if (error) throw error;
  }
}

// Load a grocery list for a specific date
export async function loadGroceryList(
  date: string
): Promise<GroceryList | null> {
  const userId = await getUserId();
  if (!userId) throw new Error("User not authenticated");

  const { data: list, error: listError } = await supabase
    .from("grocery_lists")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .eq("completed", false)
    .single();

  if (listError) {
    if (listError.code === "PGRST116") {
      // No list found - return null
      return null;
    }
    throw listError;
  }

  // Load items for this list
  const { data: items, error: itemsError } = await supabase
    .from("grocery_items")
    .select("*")
    .eq("list_id", list.id)
    .order("created_at", { ascending: true });

  if (itemsError) throw itemsError;

  return {
    date: list.date,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category || "",
      purchased: item.purchased,
      image: item.image || undefined,
    })),
    completed: list.completed,
    completedAt: list.completed_at || undefined,
  };
}

// Mark a list as completed
export async function completeGroceryList(date: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("grocery_lists")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("date", date)
    .eq("completed", false);

  if (error) throw error;
}

// Get all completed lists
export async function getCompletedLists(): Promise<GroceryList[]> {
  const userId = await getUserId();
  if (!userId) throw new Error("User not authenticated");

  const { data: lists, error } = await supabase
    .from("grocery_lists")
    .select("*")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  if (!lists || lists.length === 0) return [];

  // Load items for each list
  const listsWithItems = await Promise.all(
    lists.map(async (list) => {
      const { data: items } = await supabase
        .from("grocery_items")
        .select("*")
        .eq("list_id", list.id)
        .order("created_at", { ascending: true });

      return {
        date: list.date,
        items: (items || []).map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          category: item.category || "",
          purchased: item.purchased,
          image: item.image || undefined,
        })),
        completed: list.completed,
        completedAt: list.completed_at || undefined,
      };
    })
  );

  return listsWithItems;
}

// Delete a completed list
export async function deleteCompletedList(date: string): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("User not authenticated");

  // Find the list
  const { data: list } = await supabase
    .from("grocery_lists")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .eq("completed", true)
    .single();

  if (list) {
    // Delete items first (cascade should handle this, but being explicit)
    await supabase.from("grocery_items").delete().eq("list_id", list.id);
    // Delete the list
    await supabase.from("grocery_lists").delete().eq("id", list.id);
  }
}

// Save item image
export async function saveItemImage(
  itemName: string,
  imageData: string
): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error("User not authenticated");

  const { error } = await supabase.from("item_images").upsert({
    user_id: userId,
    item_name: itemName.toLowerCase(),
    image_data: imageData,
  });

  if (error) throw error;
}

// Get item image
export async function getItemImage(
  itemName: string
): Promise<string | undefined> {
  const userId = await getUserId();
  if (!userId) return undefined;

  const { data } = await supabase
    .from("item_images")
    .select("image_data")
    .eq("user_id", userId)
    .eq("item_name", itemName.toLowerCase())
    .single();

  return data?.image_data || undefined;
}

// Get all item names with their categories and images (for autocomplete)
export async function getAllItemNames(): Promise<
  Array<{ name: string; category: string; image?: string }>
> {
  const userId = await getUserId();
  if (!userId) return [];

  // Get all lists for this user
  const { data: lists } = await supabase
    .from("grocery_lists")
    .select("id")
    .eq("user_id", userId);

  if (!lists || lists.length === 0) return [];

  const listIds = lists.map((l) => l.id);

  // Get all items from these lists
  const { data: items } = await supabase
    .from("grocery_items")
    .select("name, category")
    .in("list_id", listIds)
    .order("name", { ascending: true });

  if (!items) return [];

  // Get unique items
  const uniqueItems = new Map<
    string,
    { name: string; category: string; image?: string }
  >();

  for (const item of items) {
    const key = item.name.toLowerCase();
    if (!uniqueItems.has(key)) {
      uniqueItems.set(key, {
        name: item.name,
        category: item.category || "",
      });
    }
  }

  // Get images for items
  const { data: images } = await supabase
    .from("item_images")
    .select("item_name, image_data")
    .eq("user_id", userId);

  if (images) {
    for (const img of images) {
      const key = img.item_name.toLowerCase();
      if (uniqueItems.has(key)) {
        uniqueItems.get(key)!.image = img.image_data;
      }
    }
  }

  return Array.from(uniqueItems.values());
}
