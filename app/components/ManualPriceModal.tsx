"use client";

import { useState, useEffect, useRef } from "react";
import { getPriceMemoriesForVendor, savePriceMemory, updateItemPrices } from "@/lib/database-prices";
import { getActiveUserId } from "@/lib/family-users";
import { GroceryItem as GroceryItemType } from "../types";

interface ManualPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string | null;
  items: GroceryItemType[];
  onPricesApplied: () => void;
}

interface ItemPriceInput {
  itemId: string;
  itemName: string;
  unitPrice: number | null;
  quantity: number;
  suggestedPrice: number | null;
  currency: string;
}

export default function ManualPriceModal({
  isOpen,
  onClose,
  listId,
  items,
  onPricesApplied,
}: ManualPriceModalProps) {
  const [vendorName, setVendorName] = useState("");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [itemPrices, setItemPrices] = useState<ItemPriceInput[]>([]);
  const [priceMemories, setPriceMemories] = useState<Map<string, { unitPrice: number; currency: string; lastUsedAt: string }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  // Initialize item prices when modal opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setItemPrices(
        items.map((item) => ({
          itemId: item.id,
          itemName: item.name,
          unitPrice: item.unit_price || null,
          quantity: item.quantity,
          suggestedPrice: null,
          currency: item.currency || "ILS",
        }))
      );
    }
  }, [isOpen, items]);

  // Load price memories when vendor name changes
  useEffect(() => {
    if (vendorName.trim()) {
      loadPriceMemories(vendorName);
    } else {
      setPriceMemories(new Map());
    }
  }, [vendorName]);

  // Update suggested prices when price memories load
  useEffect(() => {
    if (priceMemories.size > 0) {
      setItemPrices((prev) =>
        prev.map((item) => {
          const normalizedName = item.itemName.toLowerCase().trim().replace(/\s+/g, " ");
          const memory = priceMemories.get(normalizedName);
          return {
            ...item,
            suggestedPrice: memory?.unitPrice || null,
            currency: memory?.currency || item.currency,
          };
        })
      );
    }
  }, [priceMemories]);

  const loadPriceMemories = async (vendor: string) => {
    try {
      const memories = await getPriceMemoriesForVendor(vendor);
      setPriceMemories(memories);
    } catch (err) {
      console.error("Failed to load price memories:", err);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setReceiptImage(file);
      setError(null);
    }
  };

  const handleUploadImage = async () => {
    if (!receiptImage) return;

    setUploading(true);
    setError(null);

    try {
      const localUserId = getActiveUserId();
      if (!localUserId) {
        throw new Error("No active user selected");
      }

      const formData = new FormData();
      formData.append("file", receiptImage);
      if (listId) formData.append("listId", listId);
      formData.append("localUserId", localUserId);
      formData.append("type", "receipt");

      const res = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      setReceiptId(data.receiptId);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handlePriceChange = (itemId: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setItemPrices((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? { ...item, unitPrice: numValue }
          : item
      )
    );
  };

  const handleUseSuggestion = (itemId: string) => {
    const item = itemPrices.find((i) => i.itemId === itemId);
    if (item && item.suggestedPrice !== null) {
      setItemPrices((prev) =>
        prev.map((i) =>
          i.itemId === itemId
            ? { ...i, unitPrice: item.suggestedPrice }
            : i
        )
      );
    }
  };

  const handleApply = async () => {
    if (!vendorName.trim()) {
      setError("Please enter vendor/store name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update grocery items with prices
      for (const itemPrice of itemPrices) {
        if (itemPrice.unitPrice !== null && itemPrice.unitPrice > 0) {
          const lineTotal = itemPrice.unitPrice * itemPrice.quantity;

          // Update grocery item
          await updateItemPrices(
            itemPrice.itemId,
            itemPrice.unitPrice,
            lineTotal,
            itemPrice.currency,
            receiptId || undefined
          );

          // Save to price memory
          await savePriceMemory(
            vendorName.trim(),
            itemPrice.itemName,
            itemPrice.unitPrice,
            itemPrice.currency
          );
        }
      }

      onPricesApplied();
      onClose();
      reset();
    } catch (err: any) {
      setError(err.message || "Failed to apply prices");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setVendorName("");
    setReceiptImage(null);
    setReceiptId(null);
    setItemPrices([]);
    setPriceMemories(new Map());
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const totalSum = itemPrices.reduce((sum, item) => {
    if (item.unitPrice !== null && item.unitPrice > 0) {
      return sum + item.unitPrice * item.quantity;
    }
    return sum;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Add Prices Manually
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Vendor Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor/Store Name *
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g., Shufersal, Rami Levy"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Receipt Image Upload (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Image (Optional - for reference only)
            </label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {receiptImage && !receiptId && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
            {receiptId && (
              <p className="mt-2 text-sm text-green-600">✓ Image uploaded</p>
            )}
          </div>

          {/* Items with Price Inputs */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Enter Prices
            </h3>
            <div className="space-y-3">
              {itemPrices.map((item) => (
                <div
                  key={item.itemId}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{item.itemName}</div>
                    <div className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.suggestedPrice !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Suggested: ₪{item.suggestedPrice.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleUseSuggestion(item.itemId)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          Use
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-gray-700">₪</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice === null ? "" : item.unitPrice}
                        onChange={(e) => handlePriceChange(item.itemId, e.target.value)}
                        placeholder="0.00"
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    {item.unitPrice !== null && item.unitPrice > 0 && (
                      <div className="text-sm text-gray-600 min-w-[80px] text-right">
                        Total: ₪{(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Sum */}
          {totalSum > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Sum:</span>
                <span className="text-xl font-bold text-green-700">
                  ₪{totalSum.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={loading || !vendorName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Applying..." : "Apply Prices"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
