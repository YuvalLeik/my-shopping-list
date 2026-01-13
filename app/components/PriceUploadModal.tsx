"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GroceryItem as GroceryItemType } from "../types";
import { getPriceSuggestions, savePriceToMemory } from "@/lib/price-memory";

interface PriceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string | null;
  items: GroceryItemType[];
  onPricesApplied: () => void;
}

interface ItemPrice {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number | null;
  line_total: number | null;
}

export default function PriceUploadModal({
  isOpen,
  onClose,
  listId,
  items,
  onPricesApplied,
}: PriceUploadModalProps) {
  const [step, setStep] = useState<"upload" | "entry" | "applying">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [itemPrices, setItemPrices] = useState<ItemPrice[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, { unit_price: number; currency: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load price suggestions when vendor name changes
  useEffect(() => {
    if (vendorName && step === "entry" && itemPrices.length > 0) {
      const itemNames = itemPrices.map((ip) => ip.item_name);
      getPriceSuggestions(vendorName, itemNames).then(setSuggestions).catch(console.error);
    }
  }, [vendorName, step, itemPrices]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      if (listId) formData.append("listId", listId);
      formData.append("type", "receipt");

      const uploadRes = await fetch("/api/receipts/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadData = await uploadRes.json();
      setReceiptId(uploadData.receiptId);

      // Initialize item prices
      const initialPrices: ItemPrice[] = items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price || null,
        line_total: item.line_total || null,
      }));
      setItemPrices(initialPrices);

      setStep("entry");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handlePriceChange = (itemId: string, unitPrice: number | null) => {
    setItemPrices((prev) =>
      prev.map((ip) => {
        if (ip.item_id === itemId) {
          const quantity = ip.quantity;
          const lineTotal = unitPrice !== null ? unitPrice * quantity : null;
          return {
            ...ip,
            unit_price: unitPrice,
            line_total: lineTotal,
          };
        }
        return ip;
      })
    );
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItemPrices((prev) =>
      prev.map((ip) => {
        if (ip.item_id === itemId) {
          const lineTotal = ip.unit_price !== null ? ip.unit_price * quantity : null;
          return {
            ...ip,
            quantity: Math.max(1, quantity),
            line_total: lineTotal,
          };
        }
        return ip;
      })
    );
  };

  const handleUseSuggestion = (itemId: string) => {
    const itemPrice = itemPrices.find((ip) => ip.item_id === itemId);
    if (!itemPrice) return;

    const suggestion = suggestions[itemPrice.item_name];
    if (suggestion) {
      handlePriceChange(itemId, suggestion.unit_price);
    }
  };

  const handleApply = async () => {
    if (!receiptId || !vendorName.trim()) {
      setError("Please enter a vendor/store name");
      return;
    }

    const pricesToApply = itemPrices.filter((ip) => ip.unit_price !== null && ip.unit_price > 0);
    if (pricesToApply.length === 0) {
      setError("Please enter at least one price");
      return;
    }

    setStep("applying");
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Apply prices
      const applyRes = await fetch("/api/receipts/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          receiptId,
          vendorName: vendorName.trim(),
          prices: pricesToApply.map((ip) => ({
            item_id: ip.item_id,
            unit_price: ip.unit_price,
            quantity: ip.quantity,
          })),
        }),
      });

      if (!applyRes.ok) {
        const errorData = await applyRes.json();
        throw new Error(errorData.error || "Failed to apply prices");
      }

      onPricesApplied();
      onClose();
      reset();
    } catch (err: any) {
      setError(err.message || "Failed to apply prices");
      setStep("entry");
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setReceiptId(null);
    setVendorName("");
    setItemPrices([]);
    setSuggestions({});
    setError(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const totalSum = itemPrices.reduce((sum, ip) => sum + (ip.line_total || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Add Prices from Receipt
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Receipt Image (for reference)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Upload a photo of your receipt for reference. You'll enter prices manually.
                </p>
              </div>
              {file && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected: {file.name}</p>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Uploading..." : "Upload and Continue"}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "entry" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store/Vendor Name *
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g., Shufersal, Rami Levy"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Enter Prices
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit Price (₪)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemPrices.map((itemPrice) => {
                        const suggestion = suggestions[itemPrice.item_name];
                        return (
                          <tr key={itemPrice.item_id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {itemPrice.item_name}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                value={itemPrice.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    itemPrice.item_id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={itemPrice.unit_price || ""}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      itemPrice.item_id,
                                      parseFloat(e.target.value) || null
                                    )
                                  }
                                  placeholder="0.00"
                                  className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                {suggestion && (!itemPrice.unit_price || itemPrice.unit_price !== suggestion.unit_price) && (
                                  <button
                                    onClick={() => handleUseSuggestion(itemPrice.item_id)}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                    title={`Suggested: ₪${suggestion.unit_price.toFixed(2)}`}
                                  >
                                    Use {suggestion.unit_price.toFixed(2)}₪
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {itemPrice.line_total !== null
                                ? `₪${itemPrice.line_total.toFixed(2)}`
                                : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          ₪{totalSum.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!vendorName.trim() || totalSum === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Prices
                </button>
              </div>
            </div>
          )}

          {step === "applying" && (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-sm text-gray-600">Applying prices...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
