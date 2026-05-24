import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { GroceryItem } from "@/app/types";

export type RealtimeEvent =
  | { type: "INSERT"; item: GroceryItem }
  | { type: "UPDATE"; item: GroceryItem }
  | { type: "DELETE"; itemId: string };

function rowToItem(row: any): GroceryItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    category: row.category || "",
    purchased: row.purchased,
    image: row.image || undefined,
  };
}

export function subscribeToList(
  listId: string,
  onEvent: (event: RealtimeEvent) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`list-${listId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "grocery_items",
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        onEvent({ type: "INSERT", item: rowToItem(payload.new) });
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "grocery_items",
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        onEvent({ type: "UPDATE", item: rowToItem(payload.new) });
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "grocery_items",
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        onEvent({ type: "DELETE", itemId: (payload.old as any).id });
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromList(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}
