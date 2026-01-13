"use client";

import { getFamilyUsers, getActiveUser, setActiveUserId, FamilyUser } from "@/lib/family-users";
import { useState, useEffect } from "react";

type View = "list" | "history" | "users";

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onUserSwitch: (user: FamilyUser) => void;
}

export default function Navigation({ currentView, onViewChange, onUserSwitch }: NavigationProps) {
  const [activeUser, setActiveUser] = useState<FamilyUser | null>(null);
  const [users, setUsers] = useState<FamilyUser[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    loadUser();
    loadUsers();
  }, []);

  const loadUser = async () => {
    const user = await getActiveUser();
    setActiveUser(user);
  };

  const loadUsers = async () => {
    const allUsers = await getFamilyUsers();
    setUsers(allUsers);
  };

  const handleSwitchUser = async (user: FamilyUser) => {
    setActiveUserId(user.id);
    setActiveUser(user);
    setShowUserDropdown(false);
    onUserSwitch(user);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 lg:bg-gray-50">
        <div className="flex flex-col h-full">
          {/* App Name */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Shopping List</h1>
          </div>

          {/* User Switcher */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {activeUser?.name[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {activeUser?.name || "No user"}
                  </div>
                  <div className="text-xs text-gray-500">Switch user</div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showUserDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSwitchUser(user)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 ${
                        activeUser?.id === user.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.name[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                      {activeUser?.id === user.id && (
                        <span className="text-xs text-blue-600 font-medium">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => onViewChange("list")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "list"
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>List</span>
            </button>
            <button
              onClick={() => onViewChange("history")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "history"
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </button>
            <button
              onClick={() => onViewChange("users")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === "users"
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Users</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          <button
            onClick={() => onViewChange("list")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 ${
              currentView === "list" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-medium">List</span>
          </button>
          <button
            onClick={() => onViewChange("history")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 ${
              currentView === "history" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">History</span>
          </button>
          <button
            onClick={() => onViewChange("users")}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 ${
              currentView === "users" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs font-medium">Users</span>
          </button>
        </div>
      </nav>
    </>
  );
}
