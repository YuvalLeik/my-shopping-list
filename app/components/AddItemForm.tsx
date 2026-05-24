"use client";

import { useState, useRef, useEffect } from "react";
import { Category, CATEGORY_TRANSLATIONS } from "../types";
import { CATEGORIES } from "../constants";
import { compressImage } from "../lib/image-utils";
import { getItemImage, saveItemImage } from "@/lib/database";
import type { AutoCompleteItem } from "../hooks/useAutoComplete";

interface AddItemFormProps {
  onAddItem: (name: string, category: string, image?: string) => void;
  getSuggestions: (query: string) => AutoCompleteItem[];
}

export default function AddItemForm({ onAddItem, getSuggestions }: AddItemFormProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<Category>("");
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutoCompleteItem[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newItemName.trim().length > 0) {
      const filtered = getSuggestions(newItemName);
      setAutocompleteSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [newItemName, getSuggestions]);

  const handleAddItem = () => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    if (newItemImage) {
      saveItemImage(trimmedName, newItemImage).catch((error: any) => {
        console.error("Failed to save item image:", error);
      });
    }

    onAddItem(trimmedName, newItemCategory || "", newItemImage || undefined);
    setNewItemName("");
    setNewItemCategory("");
    setNewItemImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (
        showAutocomplete &&
        selectedSuggestionIndex >= 0 &&
        autocompleteSuggestions[selectedSuggestionIndex]
      ) {
        const suggestion = autocompleteSuggestions[selectedSuggestionIndex];
        setNewItemName(suggestion.name);
        if (suggestion.category) {
          setNewItemCategory(suggestion.category);
        }
        if (suggestion.image) {
          setNewItemImage(suggestion.image);
        } else {
          setNewItemImage(null);
        }
        setShowAutocomplete(false);
        setSelectedSuggestionIndex(-1);
      } else {
        handleAddItem();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showAutocomplete && autocompleteSuggestions.length > 0) {
        setSelectedSuggestionIndex((prev) =>
          prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showAutocomplete) {
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === "Escape") {
      setShowAutocomplete(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: AutoCompleteItem) => {
    setNewItemName(suggestion.name);
    if (suggestion.category) {
      setNewItemCategory(suggestion.category);
    }
    if (suggestion.image) {
      setNewItemImage(suggestion.image);
    } else {
      getItemImage(suggestion.name)
        .then((image) => {
          setNewItemImage(image || null);
        })
        .catch(() => {
          setNewItemImage(null);
        });
    }
    setShowAutocomplete(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("הקובץ גדול מדי. אנא בחר תמונה קטנה יותר (מקסימום 5MB).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("אנא בחר קובץ תמונה בלבד.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setNewItemImage(compressedImage);
    } catch (error) {
      console.error("Failed to compress image:", error);
      alert("שגיאה בעת עיבוד התמונה. נסה שוב.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-4 sm:mb-6 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
      <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900">
        הוסף פריט חדש
      </h2>
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              if (autocompleteSuggestions.length > 0 && newItemName.trim().length > 0) {
                setShowAutocomplete(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowAutocomplete(false);
                setSelectedSuggestionIndex(-1);
              }, 200);
            }}
            placeholder="שם הפריט (חובה)"
            className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            autoFocus
          />
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div
              ref={autocompleteRef}
              className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <div className="max-h-48 overflow-y-auto">
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-2 text-right text-sm transition-colors ${
                      index === selectedSuggestionIndex
                        ? "bg-blue-50 text-blue-900"
                        : "text-gray-900 hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{suggestion.name}</div>
                        {suggestion.category && (
                          <div className="mt-0.5 text-xs text-gray-500">
                            {CATEGORY_TRANSLATIONS[suggestion.category]}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">ללא קטגוריה</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_TRANSLATIONS[cat]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            תמונה (אופציונלי)
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex-1 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-center text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {newItemImage ? "שנה תמונה" : "הוסף תמונה"}
            </label>
            {newItemImage && (
              <div className="relative">
                <img
                  src={newItemImage}
                  alt="Preview"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setNewItemImage(null)}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                  aria-label="הסר תמונה"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleAddItem}
          disabled={!newItemName.trim()}
          className="w-full rounded-lg bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          הוסף פריט
        </button>
      </div>
    </div>
  );
}
