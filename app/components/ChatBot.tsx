"use client";

import { useState, useRef, useEffect } from "react";
import { GroceryItem, GroceryList, Category, CATEGORY_TRANSLATIONS } from "../types";

interface ChatBotProps {
  currentItems: GroceryItem[];
  completedLists: GroceryList[];
  onAddItems: (items: GroceryItem[]) => void;
  onClose: () => void;
}

interface Message {
  type: "user" | "bot";
  text: string;
  suggestions?: GroceryItem[];
}

export default function ChatBot({
  currentItems,
  completedLists,
  onAddItems,
  onClose,
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      text: "שלום! אני כאן כדי לעזור לך עם רשימת הקניות שלך. אתה יכול לשאול אותי שאלות כמו:\n• 'האם חסר לי משהו ברשימה?'\n• 'מה אני צריך להוסיף?'\n• 'מה חסר לי מקטגוריית מזווה?'\n• 'הצע לי פריטים ממוצרי חלב'\n• 'מה יש לי מקטגוריית פירות וירקות?'",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset selected items when new suggestions appear
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.suggestions && lastMessage.suggestions.length > 0) {
      setSelectedItems(new Set());
    }
  }, [messages]);

  // Detect category from user message
  const detectCategory = (message: string): Category | null => {
    const lowerMessage = message.toLowerCase();
    
    // Category keywords mapping
    const categoryKeywords: Record<Category, string[]> = {
      "Produce": ["פירות", "ירקות", "פירות וירקות", "ירק", "פרי", "סלט", "עגבניות", "מלפפונים", "בננות", "תפוחים", "גזר", "חסה", "ברוקולי", "כרוב"],
      "Dairy": ["חלב", "מוצרי חלב", "גבינה", "יוגורט", "חמאה", "שמנת", "חלבון", "קוטג'", "ריקוטה", "מוצרלה", "צהובה"],
      "Meat": ["בשר", "עוף", "סטייק", "המבורגר", "נקניקיות", "נקניק", "כבד", "קציצות", "שווארמה"],
      "Fish": ["דגים", "דג", "סלמון", "טונה", "פילה", "דג מלוח", "דג טרי", "סרדינים"],
      "Bakery": ["מאפייה", "לחם", "פיתה", "בגט", "עוגה", "עוגיות", "מאפה", "בייגל", "קרואסון", "בורקס", "לחמניות"],
      "Pantry": ["מזווה", "פסטה", "אורז", "קמח", "סוכר", "שמן", "תבלינים", "קטניות", "שעועית", "עדשים", "חומוס", "בורגול", "קוסקוס", "קפה", "תה", "דגנים"],
      "Frozen": ["קפואים", "קפוא", "גלידה", "פיצה קפואה", "ירקות קפואים", "בשר קפוא", "גלידות"],
      "Drinks": ["משקאות", "משקה", "מים", "מיץ", "קולה", "בירה", "יין", "סודה", "משקאות קלים", "קפה", "תה", "חלב"],
      "Other": ["אחר", "שונות"],
      "": [],
    };

    // Check for category keywords (prioritize longer matches first)
    const sortedCategories = Object.entries(categoryKeywords)
      .filter(([cat]) => cat !== "")
      .sort((a, b) => {
        // Sort by longest keyword first to match more specific terms
        const aMaxLength = Math.max(...a[1].map(k => k.length));
        const bMaxLength = Math.max(...b[1].map(k => k.length));
        return bMaxLength - aMaxLength;
      });

    for (const [category, keywords] of sortedCategories) {
      // Sort keywords by length (longest first) for better matching
      const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
      for (const keyword of sortedKeywords) {
        if (lowerMessage.includes(keyword)) {
          return category as Category;
        }
      }
    }

    // Check for category names directly
    for (const [category, translation] of Object.entries(CATEGORY_TRANSLATIONS)) {
      if (category === "") continue;
      const translationLower = translation.toLowerCase();
      // Check for "מקטגוריית X" or "מהקטגוריה X" patterns
      if (lowerMessage.includes(`מקטגוריית ${translationLower}`) ||
          lowerMessage.includes(`מהקטגוריה ${translationLower}`) ||
          lowerMessage.includes(`קטגוריית ${translationLower}`) ||
          lowerMessage.includes(`קטגוריה ${translationLower}`) ||
          lowerMessage === translationLower ||
          lowerMessage.includes(translationLower)) {
        return category as Category;
      }
    }

    return null;
  };

  // Analyze what's missing from current list compared to previous lists
  const analyzeMissingItems = (filterCategory?: Category | null): GroceryItem[] => {
    if (completedLists.length === 0) {
      return [];
    }

    // Get all unique items from completed lists
    const itemFrequency = new Map<string, { item: GroceryItem; count: number }>();
    
    completedLists.forEach((list) => {
      list.items.forEach((item) => {
        const key = item.name.toLowerCase();
        if (itemFrequency.has(key)) {
          itemFrequency.get(key)!.count++;
        } else {
          itemFrequency.set(key, { item: { ...item }, count: 1 });
        }
      });
    });

    // Get current item names (case-insensitive)
    const currentItemNames = new Set(
      currentItems.map((item) => item.name.toLowerCase())
    );

    // Find items that appear in previous lists but not in current list
    const missingItems: GroceryItem[] = [];
    const baseTime = Date.now();
    const basePerformance = performance.now();
    let index = 0;
    itemFrequency.forEach(({ item, count }) => {
      const itemNameLower = item.name.toLowerCase();
      if (!currentItemNames.has(itemNameLower)) {
        // Filter by category if specified
        if (filterCategory && item.category !== filterCategory) {
          return;
        }
        
        // Only suggest items that appeared in at least one previous list
        // Create unique ID using timestamp, performance time, index, and random string
        // Using crypto.randomUUID if available, otherwise fallback to timestamp + random
        const randomPart = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
        const uniqueId = `suggestion-${baseTime}-${basePerformance}-${index}-${randomPart}`;
        missingItems.push({
          ...item,
          id: uniqueId,
          quantity: 1,
          purchased: false,
        });
        index++;
      }
    });

    // Sort by frequency (most common first), then by name
    missingItems.sort((a, b) => {
      const aCount = itemFrequency.get(a.name.toLowerCase())?.count || 0;
      const bCount = itemFrequency.get(b.name.toLowerCase())?.count || 0;
      if (aCount !== bCount) {
        return bCount - aCount;
      }
      return a.name.localeCompare(b.name, "he");
    });

    // Return top 10 most common missing items
    return missingItems.slice(0, 10);
  };

  // Process user message
  const processMessage = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if user is asking about missing items
    const missingKeywords = [
      "חסר",
      "חסרים",
      "מה חסר",
      "מה חסרים",
      "מה אני צריך",
      "מה צריך",
      "הצע",
      "הצעות",
      "מה להוסיף",
      "מה כדאי",
      "מה שכחתי",
      "מה יש",
      "מה אין",
      "מה יש לי",
      "מה אין לי",
      "מה יש ברשימה",
      "מה אין ברשימה",
      "מה יש לי ברשימה",
      "מה אין לי ברשימה",
    ];

    const isAskingAboutMissing = missingKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    // Detect if user is asking about a specific category
    const requestedCategory = detectCategory(userMessage);

    if (isAskingAboutMissing) {
      const missingItems = analyzeMissingItems(requestedCategory);
      
      if (missingItems.length === 0) {
        if (requestedCategory) {
          return {
            type: "bot" as const,
            text: `לא מצאתי פריטים שחסרים מקטגוריית ${CATEGORY_TRANSLATIONS[requestedCategory]}. נסה לשאול על קטגוריה אחרת או 'מה חסר לי?' לכל הקטגוריות.`,
          };
        }
        return {
          type: "bot" as const,
          text: "לא מצאתי פריטים שחסרים. הרשימה שלך נראית מלאה! אם יש משהו ספציפי שאתה מחפש, תגיד לי.",
        };
      }

      let responseText = `מצאתי ${missingItems.length} פריט${missingItems.length !== 1 ? "ים" : ""} שהיו ברשימות הקודמות שלך אבל לא ברשימה הנוכחית`;
      if (requestedCategory) {
        responseText += ` מקטגוריית ${CATEGORY_TRANSLATIONS[requestedCategory]}`;
      }
      responseText += ". האם תרצה להוסיף אותם?";

      return {
        type: "bot" as const,
        text: responseText,
        suggestions: missingItems,
      };
    }

    // Check if user is asking about a category without missing keywords
    if (requestedCategory) {
      const categoryItems = analyzeMissingItems(requestedCategory);
      if (categoryItems.length > 0) {
        return {
          type: "bot" as const,
          text: `מצאתי ${categoryItems.length} פריט${categoryItems.length !== 1 ? "ים" : ""} מקטגוריית ${CATEGORY_TRANSLATIONS[requestedCategory]} שהיו ברשימות הקודמות שלך אבל לא ברשימה הנוכחית. האם תרצה להוסיף אותם?`,
          suggestions: categoryItems,
        };
      } else {
        return {
          type: "bot" as const,
          text: `לא מצאתי פריטים מקטגוריית ${CATEGORY_TRANSLATIONS[requestedCategory]} שחסרים ברשימה שלך.`,
        };
      }
    }

    // Default response
    return {
      type: "bot" as const,
      text: "אני יכול לעזור לך לבדוק מה חסר ברשימה שלך בהשוואה לרשימות הקודמות. נסה לשאול 'האם חסר לי משהו ברשימה?', 'מה אני צריך להוסיף?' או 'מה חסר לי מקטגוריית מזווה?'",
    };
  };

  // Handle send message
  const handleSend = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsProcessing(true);

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { type: "user", text: userMessage },
    ];
    setMessages(newMessages);

    // Simulate processing delay
    setTimeout(() => {
      const botResponse = processMessage(userMessage);
      setMessages([...newMessages, botResponse]);
      setIsProcessing(false);
      inputRef.current?.focus();
    }, 500);
  };

  // Handle item selection toggle
  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Handle select all items
  const handleSelectAll = (suggestedItems: GroceryItem[]) => {
    setSelectedItems(new Set(suggestedItems.map((item) => item.id)));
  };

  // Handle deselect all items
  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  // Handle suggestion accept (only selected items)
  const handleAcceptSelectedSuggestions = (suggestedItems: GroceryItem[]) => {
    const itemsToAdd = suggestedItems.filter((item) => selectedItems.has(item.id));
    
    if (itemsToAdd.length === 0) {
      setMessages([
        ...messages,
        {
          type: "bot",
          text: "לא בחרת פריטים להוספה. בחר פריטים מהרשימה ולחץ על 'הוסף נבחרים'.",
        },
      ]);
      return;
    }

    onAddItems(itemsToAdd);
    setSelectedItems(new Set());
    setMessages([
      ...messages,
      {
        type: "bot",
        text: `הוספתי ${itemsToAdd.length} פריט${itemsToAdd.length !== 1 ? "ים" : ""} לרשימה שלך!`,
      },
    ]);
  };

  // Handle accept all suggestions
  const handleAcceptAllSuggestions = (suggestedItems: GroceryItem[]) => {
    onAddItems(suggestedItems);
    setSelectedItems(new Set());
    setMessages([
      ...messages,
      {
        type: "bot",
        text: `הוספתי ${suggestedItems.length} פריט${suggestedItems.length !== 1 ? "ים" : ""} לרשימה שלך!`,
      },
    ]);
  };

  // Handle suggestion reject
  const handleRejectSuggestions = () => {
    setSelectedItems(new Set());
    setMessages([
      ...messages,
      {
        type: "bot",
        text: "אין בעיה! אם תרצה הצעות אחרות, פשוט תשאל אותי שוב.",
      },
    ]);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto z-50 flex flex-col w-full sm:w-[400px] sm:max-w-[calc(100vw-2rem)] h-[calc(100vh)] sm:h-auto sm:max-h-[600px] sm:rounded-lg overflow-hidden">
      <div className="mb-2 flex items-center justify-between rounded-t-lg bg-blue-600 px-3 sm:px-4 py-2 sm:py-3 text-white shadow-lg">
        <h3 className="text-sm sm:text-base font-semibold">עוזר רשימת קניות</h3>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-blue-700"
          aria-label="סגור"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 sm:flex-none sm:h-96 flex-col sm:rounded-b-lg border-t sm:border border-gray-200 bg-white shadow-lg">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-2 ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.text}</p>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                      <span className="text-xs text-gray-600">
                        בחר את הפריטים שברצונך להוסיף:
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectAll(message.suggestions!)}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          בחר הכל
                        </button>
                        <span className="text-xs text-gray-400">|</span>
                        <button
                          onClick={handleDeselectAll}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          בטל הכל
                        </button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-3 max-h-40 sm:max-h-48 overflow-y-auto">
                      {message.suggestions.map((item) => {
                        const isSelected = selectedItems.has(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleItem(item.id)}
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <span className="flex-1 text-sm text-gray-900">{item.name}</span>
                            {item.category && (
                              <span className="text-xs text-gray-500">
                                {CATEGORY_TRANSLATIONS[item.category]}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleAcceptSelectedSuggestions(message.suggestions!)}
                        disabled={selectedItems.size === 0}
                        className="flex-1 rounded-lg bg-green-600 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        הוסף נבחרים ({selectedItems.size})
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptAllSuggestions(message.suggestions!)}
                          className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          הוסף הכל
                        </button>
                        <button
                          onClick={handleRejectSuggestions}
                          className="flex-1 sm:flex-none rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          דלג
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-4 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-2 sm:p-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="שאל אותי שאלה..."
              className="flex-1 rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className="rounded-lg bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              שלח
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
