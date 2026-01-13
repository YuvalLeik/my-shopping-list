"use client";

import { getSuggestedPrice } from "@/lib/database-prices";
import { useState, useEffect } from "react";

interface PriceSuggestionProps {
  itemId: string;
  itemName: string;
  vendorName: string | null;
  currentPrice: number | undefined;
  onUseSuggestion: (price: number) => void;
}

export default function PriceSuggestion({
  itemId,
  itemName,
  vendorName,
  currentPrice,
  onUseSuggestion,
}: PriceSuggestionProps) {
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendorName && (!currentPrice || currentPrice === 0)) {
      loadSuggestion();
    } else {
      setSuggestedPrice(null);
    }
  }, [vendorName, itemName, currentPrice]);

  const loadSuggestion = async () => {
    if (!vendorName) return;
    setLoading(true);
    try {
      const suggestion = await getSuggestedPrice(vendorName, itemName);
      if (suggestion) {
        setSuggestedPrice(suggestion.unitPrice);
      }
    } catch (error) {
      console.error("Failed to load price suggestion:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!suggestedPrice || loading) return null;

  return (
    <div className="mt-1 flex items-center gap-2">
      <span className="text-xs text-gray-500">
        Suggested: ₪{suggestedPrice.toFixed(2)}
      </span>
      <button
        onClick={() => onUseSuggestion(suggestedPrice)}
        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
      >
        Use
      </button>
    </div>
  );
}
