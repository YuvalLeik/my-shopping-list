"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSuggestions,
  checkAndBackfill,
  SuggestedItem,
} from "@/lib/frequency-tracker";
import { GroceryItem } from "../types";

export function useSmartSuggestions(items: GroceryItem[], user: any) {
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const loadSuggestions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Run backfill if needed (no-op if already done)
      await checkAndBackfill();

      const currentNames = items.map((item) => item.name);
      const results = await getSuggestions(currentNames);
      setSuggestions(results.filter((s) => !dismissed.has(s.name.toLowerCase())));
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, items, dismissed]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const dismissSuggestion = useCallback((name: string) => {
    setDismissed((prev) => new Set(prev).add(name.toLowerCase()));
    setSuggestions((prev) =>
      prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase())
    );
  }, []);

  return {
    suggestions,
    isLoading,
    dismissSuggestion,
    refreshSuggestions: loadSuggestions,
  };
}
