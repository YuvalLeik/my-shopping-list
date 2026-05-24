"use client";

import { useEffect, useRef, useCallback } from "react";
import { subscribeToList, unsubscribeFromList } from "@/lib/realtime";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { RealtimeEvent } from "@/lib/realtime";
import type { GroceryItem } from "../types";

interface UseRealtimeSyncOptions {
  listId: string | null;
  setItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  localUserId: string | null;
}

export function useRealtimeSync({
  listId,
  setItems,
  localUserId,
}: UseRealtimeSyncOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  // Track IDs of items we just wrote locally to ignore our own echoes
  const pendingLocalOps = useRef<Set<string>>(new Set());

  const markLocalOp = useCallback((itemId: string) => {
    pendingLocalOps.current.add(itemId);
    setTimeout(() => pendingLocalOps.current.delete(itemId), 3000);
  }, []);

  useEffect(() => {
    if (!listId) return;

    if (channelRef.current) {
      unsubscribeFromList(channelRef.current);
    }

    const handleEvent = (event: RealtimeEvent) => {
      const eventId = event.type === "DELETE" ? event.itemId : event.item.id;

      // Skip events we caused ourselves
      if (pendingLocalOps.current.has(eventId)) {
        pendingLocalOps.current.delete(eventId);
        return;
      }

      switch (event.type) {
        case "INSERT":
          setItems((prev) => {
            if (prev.some((item) => item.id === event.item.id)) return prev;
            return [...prev, event.item];
          });
          break;

        case "UPDATE":
          setItems((prev) =>
            prev.map((item) =>
              item.id === event.item.id ? event.item : item
            )
          );
          break;

        case "DELETE":
          setItems((prev) =>
            prev.filter((item) => item.id !== event.itemId)
          );
          break;
      }
    };

    channelRef.current = subscribeToList(listId, handleEvent);

    return () => {
      if (channelRef.current) {
        unsubscribeFromList(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [listId, setItems, localUserId]);

  return { markLocalOp };
}
