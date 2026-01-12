"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import GroceryItem from "./components/GroceryItem";
import HistoricalLists from "./components/HistoricalLists";
import ViewListModal from "./components/ViewListModal";
import ChatBot from "./components/ChatBot";
import Auth from "./components/Auth";
import { supabase } from "@/lib/supabase";
import {
  saveGroceryList,
  loadGroceryList,
  completeGroceryList,
  getCompletedLists,
  deleteCompletedList,
  saveItemImage,
  getItemImage,
  getAllItemNames,
} from "@/lib/database";
import {
  GroceryItem as GroceryItemType,
  GroceryList,
  StoredLists,
  Category,
  SortOption,
  CATEGORY_TRANSLATIONS,
  SORT_OPTION_TRANSLATIONS,
} from "./types";

const CATEGORIES: Category[] = [
  "Produce",
  "Dairy",
  "Meat",
  "Fish",
  "Bakery",
  "Pantry",
  "Frozen",
  "Drinks",
  "Other",
];

// Helper function to compress image
const compressImage = (file: File, maxWidth: number = 200, maxHeight: number = 200, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper function to format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>(getTodayDate());
  const [items, setItems] = useState<GroceryItemType[]>([]);
  const [completedLists, setCompletedLists] = useState<GroceryList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("Unpurchased first");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<Category>("");
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [viewingList, setViewingList] = useState<GroceryList | null>(null);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<Array<{ name: string; category: Category; image?: string }>>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [hasShownCompletionPrompt, setHasShownCompletionPrompt] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allItemNamesWithCategory, setAllItemNamesWithCategory] = useState<Array<{ name: string; category: Category; image?: string }>>([]);

  // Load data from database - defined BEFORE useEffects that use it
  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load current list for today
      const todayList = await loadGroceryList(getTodayDate());
      if (todayList) {
        setItems(todayList.items);
        setCurrentDate(todayList.date);
      } else {
        setItems([]);
        setCurrentDate(getTodayDate());
      }

      // Load completed lists
      const completed = await getCompletedLists();
      setCompletedLists(completed);
      setHasShownCompletionPrompt(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      setItems([]);
      setCurrentDate(getTodayDate());
    }
  };

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Reload data when user logs in (wait a bit for state to update)
        setTimeout(() => {
          loadData();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register Service Worker for PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Define completeList function before it's used
  const completeList = async () => {
    try {
      await completeGroceryList(currentDate);
      // Reload completed lists
      const completed = await getCompletedLists();
      setCompletedLists(completed);
      
      // Create new list for today
      setItems([]);
      setCurrentDate(getTodayDate());
      setHasShownCompletionPrompt(false);
    } catch (error) {
      console.error("Failed to complete list:", error);
      alert("שגיאה בעת השלמת הרשימה. נסה שוב.");
    }
  };

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Save current list to database whenever items change
  useEffect(() => {
    if (!user) return;
    
    const saveCurrentList = async () => {
      try {
        await saveGroceryList(currentDate, items, false);
      } catch (error) {
        console.error("Failed to save list:", error);
      }
    };

    // Debounce saves to avoid too many database calls
    const timeoutId = setTimeout(saveCurrentList, 500);
    return () => clearTimeout(timeoutId);
  }, [items, currentDate, user]);

  // Check if all items are purchased and prompt user to complete the list
  useEffect(() => {
    if (!user) return;
    
    if (items.length > 0 && items.every((item) => item.purchased)) {
      // Check if this list is not already in completed lists
      const isAlreadyCompleted = completedLists.some(
        (list) => list.date === currentDate
      );

      // Only show prompt once per list
      if (!isAlreadyCompleted && !hasShownCompletionPrompt) {
        setHasShownCompletionPrompt(true);
        
        // Show confirmation dialog
        const userConfirmed = window.confirm(
          "כל הפריטים ברשימה נרכשו! האם סיימת את הקנייה ואתה רוצה להעביר את הרשימה לרשימות הקודמות?"
        );

        if (userConfirmed) {
          completeList();
        }
      }
    } else {
      // Reset the prompt flag if not all items are purchased
      setHasShownCompletionPrompt(false);
    }
  }, [items, currentDate, completedLists, hasShownCompletionPrompt, user]);

  // Load autocomplete data from database
  useEffect(() => {
    if (!user) return;
    
    const loadAutocompleteData = async () => {
      try {
        const dbItems = await getAllItemNames();
        
        // Merge with current items (current items take priority)
        const itemMap = new Map<string, { name: string; category: Category; image?: string }>();
        
        // Add items from database
        dbItems.forEach((item) => {
          itemMap.set(item.name.toLowerCase(), {
            name: item.name,
            category: item.category as Category,
            image: item.image,
          });
        });
        
        // Override with current list items (most recent)
        items.forEach((item) => {
          itemMap.set(item.name.toLowerCase(), {
            name: item.name,
            category: item.category,
            image: item.image,
          });
        });
        
        // Override with completed lists items
        completedLists.forEach((list) => {
          list.items.forEach((item) => {
            if (!itemMap.has(item.name.toLowerCase()) || !itemMap.get(item.name.toLowerCase())?.image) {
              itemMap.set(item.name.toLowerCase(), {
                name: item.name,
                category: item.category,
                image: item.image,
              });
            }
          });
        });
        
        const sorted = Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name, "he"));
        setAllItemNamesWithCategory(sorted);
      } catch (error) {
        console.error("Failed to load autocomplete data:", error);
        // Fallback to current items and completed lists
        const itemMap = new Map<string, { name: string; category: Category; image?: string }>();
        items.forEach((item) => {
          itemMap.set(item.name.toLowerCase(), {
            name: item.name,
            category: item.category,
            image: item.image,
          });
        });
        completedLists.forEach((list) => {
          list.items.forEach((item) => {
            if (!itemMap.has(item.name.toLowerCase())) {
              itemMap.set(item.name.toLowerCase(), {
                name: item.name,
                category: item.category,
                image: item.image,
              });
            }
          });
        });
        setAllItemNamesWithCategory(Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name, "he")));
      }
    };
    
    loadAutocompleteData();
  }, [items, completedLists, user]);

  // Filter autocomplete suggestions based on input
  useEffect(() => {
    if (newItemName.trim().length > 0) {
      const query = newItemName.trim().toLowerCase();
      const filtered = allItemNamesWithCategory
        .filter((item) => item.name.toLowerCase().startsWith(query))
        .slice(0, 8); // Limit to 8 suggestions
      setAutocompleteSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [newItemName, allItemNamesWithCategory]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort items
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "A-Z":
          return a.name.localeCompare(b.name, "he");
        case "Category":
          if (a.category === b.category) {
            return a.name.localeCompare(b.name, "he");
          }
          if (!a.category) return 1;
          if (!b.category) return -1;
          return a.category.localeCompare(b.category);
        case "Unpurchased first":
          if (a.purchased === b.purchased) {
            return a.name.localeCompare(b.name, "he");
          }
          return a.purchased ? 1 : -1;
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, searchQuery, sortOption]);

  // Show auth screen if not authenticated (AFTER all hooks)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setUser({ id: "temp" })} />;
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('הקובץ גדול מדי. אנא בחר תמונה קטנה יותר (מקסימום 5MB).');
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('אנא בחר קובץ תמונה בלבד.');
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setNewItemImage(compressedImage);
    } catch (error) {
      console.error('Failed to compress image:', error);
      alert('שגיאה בעת עיבוד התמונה. נסה שוב.');
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add new item
  const handleAddItem = () => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    // Get or use new image
    let itemImage: string | undefined = newItemImage || undefined;
    
    // If no new image, try to get existing image for this item name (async, will be handled separately)
    // Note: We'll use the image from autocomplete suggestions if available

    // Save image if provided
    if (newItemImage) {
      saveItemImage(trimmedName, newItemImage).catch((error: any) => {
        console.error("Failed to save item image:", error);
      });
    }

    const newItem: GroceryItemType = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: trimmedName,
      quantity: 1,
      category: newItemCategory || "",
      purchased: false,
      image: itemImage,
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemCategory("");
    setNewItemImage(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Keep focus on input after adding
    inputRef.current?.focus();
  };

  // Handle keyboard events in input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (showAutocomplete && selectedSuggestionIndex >= 0 && autocompleteSuggestions[selectedSuggestionIndex]) {
        // Select the highlighted suggestion
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
        // Add item normally
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

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { name: string; category: Category; image?: string }) => {
    setNewItemName(suggestion.name);
    if (suggestion.category) {
      setNewItemCategory(suggestion.category);
    }
    // Load existing image for this item if available
    if (suggestion.image) {
      setNewItemImage(suggestion.image);
    } else {
      // Try to load from database
      getItemImage(suggestion.name).then((image) => {
        if (image) {
          setNewItemImage(image);
        } else {
          setNewItemImage(null);
        }
      }).catch(() => {
        setNewItemImage(null);
      });
    }
    setShowAutocomplete(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Toggle purchased status
  const handleTogglePurchased = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  // Update quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Delete item
  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Clear purchased items
  const handleClearPurchased = () => {
    if (
      window.confirm(
        "האם אתה בטוח שברצונך למחוק את כל הפריטים שנרכשו? פעולה זו לא ניתנת לביטול."
      )
    ) {
      setItems(items.filter((item) => !item.purchased));
    }
  };


  // Handle historical list selection
  const handleSelectList = (list: GroceryList) => {
    setViewingList(list);
  };

  const handleDeleteList = async (listToDelete: GroceryList) => {
    try {
      await deleteCompletedList(listToDelete.date);
      // Reload completed lists
      const completed = await getCompletedLists();
      setCompletedLists(completed);
    } catch (error) {
      console.error("Failed to delete list:", error);
      alert("שגיאה בעת מחיקת הרשימה. נסה שוב.");
    }
  };

  // Manually complete list
  const handleCompleteList = async () => {
    if (items.length === 0) return;
    
    if (
      window.confirm(
        "האם אתה בטוח שברצונך לסמן את הרשימה כהושלמה? כל הפריטים יישמרו ברשימות הקודמות."
      )
    ) {
      await completeList();
    }
  };

  const purchasedCount = items.filter((item) => item.purchased).length;
  const allPurchased = items.length > 0 && items.every((item) => item.purchased);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-2 sm:py-8 sm:px-4">
      {/* 3D Background */}
      <div className="grocery-bg">
        <div className="grocery-item-3d"></div>
        <div className="grocery-item-3d"></div>
        <div className="grocery-item-3d"></div>
        <div className="grocery-item-3d"></div>
        <div className="grocery-item-3d"></div>
        <div className="grocery-item-3d"></div>
        <div className="grocery-item-3d"></div>
        <div className="grocery-item-3d"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-1">
            {/* Header */}
            <div className="mb-4 sm:mb-8 text-center">
              <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                רשימת קניות
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <p className="text-sm sm:text-base text-gray-600">
                  תאריך: {formatDate(currentDate)}
                </p>
                <input
                  type="date"
                  value={currentDate}
                  onChange={async (e) => {
                    const newDate = e.target.value;
                    
                    // Save current list before switching
                    try {
                      await saveGroceryList(currentDate, items, false);
                    } catch (error) {
                      console.error("Failed to save current list:", error);
                    }
                    
                    // Check if list for new date exists in completed lists
                    const existingCompletedList = completedLists.find(
                      (l) => l.date === newDate
                    );
                    
                    if (existingCompletedList) {
                      alert("רשימה לתאריך זה כבר הושלמה. תוכל לצפות בה מהרשימות הקודמות.");
                      setCurrentDate(newDate);
                      setItems([]);
                      setHasShownCompletionPrompt(false);
                      return;
                    }
                    
                    // Load list for new date from database
                    try {
                      const listForNewDate = await loadGroceryList(newDate);
                      if (listForNewDate) {
                        setItems(listForNewDate.items);
                        setCurrentDate(newDate);
                        setHasShownCompletionPrompt(false);
                      } else {
                        // No list exists, create empty one
                        setCurrentDate(newDate);
                        setItems([]);
                        setHasShownCompletionPrompt(false);
                      }
                    } catch (error) {
                      console.error("Failed to load list for new date:", error);
                      setCurrentDate(newDate);
                      setItems([]);
                      setHasShownCompletionPrompt(false);
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
                />
              </div>
            </div>

            {/* Add Item Card */}
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
                      // Delay to allow click on suggestion
                      setTimeout(() => {
                        setShowAutocomplete(false);
                        setSelectedSuggestionIndex(-1);
                      }, 200);
                    }}
                    placeholder="שם הפריט (חובה)"
                    className="w-full rounded-lg border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                  {/* Autocomplete Dropdown */}
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

            {/* Search and Sort Controls */}
            <div className="mb-4 sm:mb-6 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    חיפוש
                  </label>
          <input
  type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חפש פריטים..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    מיון לפי
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Unpurchased first">
                      {SORT_OPTION_TRANSLATIONS["Unpurchased first"]}
                    </option>
                    <option value="A-Z">{SORT_OPTION_TRANSLATIONS["A-Z"]}</option>
                    <option value="Category">
                      {SORT_OPTION_TRANSLATIONS["Category"]}
                    </option>
                  </select>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                {purchasedCount > 0 && (
                  <button
                    onClick={handleClearPurchased}
                    className="rounded-lg border border-red-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    מחק {purchasedCount} פריט{purchasedCount !== 1 ? "ים" : ""} שנרכש{purchasedCount !== 1 ? "ו" : ""}
                  </button>
                )}
                {items.length > 0 && !allPurchased && (
                  <button
                    onClick={handleCompleteList}
                    className="rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    סמן רשימה כהושלמה
                  </button>
                )}
                {items.length > 0 && allPurchased && (
                  <button
                    onClick={handleCompleteList}
                    className="rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    סיים רשימה והעבר לרשימות קודמות
                  </button>
                )}
              </div>
            </div>

            {/* Grocery List */}
            <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
              <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900">
                הרשימה שלך ({filteredAndSortedItems.length} פריט{filteredAndSortedItems.length !== 1 ? "ים" : ""})
                {allPurchased && (
                  <span className="mr-2 text-xs sm:text-sm font-normal text-green-600">
                    ✓ הושלמה
                  </span>
                )}
              </h2>
              {filteredAndSortedItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">
                    {items.length === 0
                      ? "רשימת הקניות שלך ריקה. הוסף פריט כדי להתחיל!"
                      : "אין פריטים התואמים לחיפוש שלך."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedItems.map((item) => (
                    <GroceryItem
                      key={item.id}
                      item={item}
                      onTogglePurchased={handleTogglePurchased}
                      onUpdateQuantity={handleUpdateQuantity}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Historical Lists */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <div className="sticky top-4 sm:top-8">
              <HistoricalLists
                completedLists={completedLists}
                onSelectList={handleSelectList}
                onDeleteList={handleDeleteList}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View List Modal */}
      {viewingList && (
        <ViewListModal
          list={viewingList}
          onClose={() => setViewingList(null)}
        />
      )}

      {/* Chat Bot */}
      {showChatBot && (
        <ChatBot
          currentItems={items}
          completedLists={completedLists}
          onAddItems={(newItems) => {
            // Generate new unique IDs for items being added to prevent duplicate keys
            const baseTime = Date.now();
            const basePerformance = performance.now();
            const itemsWithNewIds = newItems.map((item, index) => {
              // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
              const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID 
                ? crypto.randomUUID() 
                : `${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
              return {
                ...item,
                id: `item-${baseTime}-${basePerformance}-${index}-${randomPart}`,
              };
            });
            setItems([...items, ...itemsWithNewIds]);
          }}
          onClose={() => setShowChatBot(false)}
        />
      )}

      {/* Chat Bot Toggle Button */}
      {!showChatBot && (
        <button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-4 left-4 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110 active:scale-95"
          aria-label="פתח עוזר רשימת קניות"
          title="עוזר רשימת קניות"
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
