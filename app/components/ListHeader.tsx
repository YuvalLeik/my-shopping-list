"use client";

import { formatDate } from "../lib/date-utils";

interface ListHeaderProps {
  currentDate: string;
  onChangeDate: (date: string) => void;
  itemCount?: number;
  onEnterShoppingMode?: () => void;
  onSignOut?: () => void;
}

export default function ListHeader({
  currentDate,
  onChangeDate,
  itemCount = 0,
  onEnterShoppingMode,
  onSignOut,
}: ListHeaderProps) {
  return (
    <div className="mb-4 sm:mb-8 text-center relative">
      {onSignOut && (
        <button
          onClick={onSignOut}
          className="absolute top-0 left-0 rounded-lg px-2.5 py-1 text-xs text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100"
          title="התנתק"
        >
          <svg className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          יציאה
        </button>
      )}
      <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
        רשימת קניות
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <p className="text-sm sm:text-base text-gray-600">
          תאריך: {formatDate(currentDate)}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
          />
          {onEnterShoppingMode && itemCount > 0 && (
            <button
              onClick={onEnterShoppingMode}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-green-700 active:bg-green-800"
              title="מצב קניות"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              מצב קניות
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
