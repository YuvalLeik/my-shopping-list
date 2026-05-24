"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CATEGORY_TRANSLATIONS } from "../types";
import { parseQuickAddInput } from "../lib/quick-add-parser";
import type { AutoCompleteItem } from "../hooks/useAutoComplete";

interface QuickAddInputProps {
  onAddItem: (name: string, category: string, image?: string, quantity?: number) => void;
  getSuggestions: (query: string) => AutoCompleteItem[];
  allAutoCompleteItems: AutoCompleteItem[];
  onExpandForm: () => void;
}

export default function QuickAddInput({
  onAddItem,
  getSuggestions,
  allAutoCompleteItems,
  onExpandForm,
}: QuickAddInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<AutoCompleteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastCategory, setLastCategory] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const updateSuggestions = useCallback(
    (value: string) => {
      if (value.trim().length > 0) {
        // Strip leading numbers for suggestion matching
        const nameOnly = value.replace(/^\d+\s*/, "").trim();
        const filtered = getSuggestions(nameOnly);
        setSuggestions(filtered);
        setShowDropdown(filtered.length > 0);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        setLastCategory("");
      }
    },
    [getSuggestions]
  );

  useEffect(() => {
    updateSuggestions(inputValue);
  }, [inputValue, updateSuggestions]);

  // Show auto-detected category as user types
  useEffect(() => {
    if (inputValue.trim().length >= 2) {
      const parsed = parseQuickAddInput(inputValue, allAutoCompleteItems);
      setLastCategory(parsed.category);
    } else {
      setLastCategory("");
    }
  }, [inputValue, allAutoCompleteItems]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const parsed = parseQuickAddInput(trimmed, allAutoCompleteItems);
    if (!parsed.name) return;

    const normalizedName = parsed.name.toLowerCase();
    const historyMatch = allAutoCompleteItems.find(
      (item) => item.name.toLowerCase() === normalizedName
    );

    onAddItem(parsed.name, parsed.category, historyMatch?.image, parsed.quantity);

    setInputValue("");
    setShowDropdown(false);
    setLastCategory("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion: AutoCompleteItem) => {
    onAddItem(suggestion.name, suggestion.category || "", suggestion.image);
    setInputValue("");
    setShowDropdown(false);
    setSelectedIndex(-1);
    setLastCategory("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown && selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showDropdown && suggestions.length > 0) {
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showDropdown) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="mb-4 sm:mb-6">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 && inputValue.trim().length > 0) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowDropdown(false);
                setSelectedIndex(-1);
              }, 200);
            }}
            placeholder="הוסף פריט... (למשל: 3 חלב)"
            className="w-full rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            autoFocus
          />

          {/* Category badge */}
          {lastCategory && inputValue.trim().length >= 2 && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-200">
                {CATEGORY_TRANSLATIONS[lastCategory as keyof typeof CATEGORY_TRANSLATIONS]}
              </span>
            </div>
          )}

          {/* Autocomplete dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full px-4 py-2.5 text-right text-sm transition-colors ${
                      index === selectedIndex
                        ? "bg-blue-50 text-blue-900"
                        : "text-gray-900 hover:bg-gray-50"
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="h-7 w-7 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
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

        {/* Expand to full form button */}
        <button
          onClick={onExpandForm}
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-gray-200 bg-white/95 text-gray-500 shadow-lg transition-colors hover:bg-gray-50 hover:text-gray-700 flex-shrink-0"
          title="הוספה מפורטת (עם תמונה וקטגוריה)"
          aria-label="הוספה מפורטת"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
