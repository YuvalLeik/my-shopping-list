"use client";

import { useState, useEffect } from "react";
import {
  getLocalUsers,
  createLocalUser,
  updateLocalUser,
  deleteLocalUser,
  setActiveUserId,
  getActiveUserId,
  LocalUser,
} from "@/lib/local-users";

interface UserManagementProps {
  onUserSwitch: (user: LocalUser) => void;
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

const EMOJIS = ["👤", "👨", "👩", "🧑", "👶", "👴", "👵", "🧒"];

export default function UserManagement({ onUserSwitch }: UserManagementProps) {
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [activeUserId, setActiveUserIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserColor, setNewUserColor] = useState(COLORS[0]);
  const [newUserEmoji, setNewUserEmoji] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getLocalUsers();
      setUsers(allUsers);
      const activeId = getActiveUserId();
      setActiveUserIdState(activeId);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      setError("Please enter a name");
      return;
    }

    try {
      setError(null);
      const user = await createLocalUser(newUserName.trim(), newUserColor, newUserEmoji);
      await loadUsers();
      setNewUserName("");
      setNewUserColor(COLORS[0]);
      setNewUserEmoji(undefined);
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId: string, updates: { name?: string; color?: string; avatar?: string }) => {
    try {
      setError(null);
      await updateLocalUser(userId, updates);
      await loadUsers();
      setEditingUserId(null);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? All their lists will be deleted.")) {
      return;
    }

    try {
      setError(null);
      await deleteLocalUser(userId);
      await loadUsers();
      
      // If deleted user was active, switch to first available user
      if (activeUserId === userId) {
        const remainingUsers = users.filter(u => u.id !== userId);
        if (remainingUsers.length > 0) {
          const newActiveId = remainingUsers[0].id;
          setActiveUserId(newActiveId);
          setActiveUserIdState(newActiveId);
          onUserSwitch(remainingUsers[0]);
        } else {
          setActiveUserId(null);
          setActiveUserIdState(null);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const handleSwitchUser = (user: LocalUser) => {
    setActiveUserId(user.id);
    setActiveUserIdState(user.id);
    onUserSwitch(user);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add User
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewUserColor(color)}
                    className={`h-8 w-8 rounded-full border-2 ${
                      newUserColor === color ? "border-gray-900" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNewUserEmoji(undefined)}
                  className={`h-8 w-8 rounded-full border-2 text-sm ${
                    newUserEmoji === undefined ? "border-gray-900 bg-gray-100" : "border-gray-300"
                  }`}
                >
                  None
                </button>
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewUserEmoji(emoji)}
                    className={`h-8 w-8 rounded-full border-2 text-sm ${
                      newUserEmoji === emoji ? "border-gray-900" : "border-gray-300"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newUserName.trim()}
                className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewUserName("");
                  setNewUserColor(COLORS[0]);
                  setNewUserEmoji(undefined);
                }}
                className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              activeUserId === user.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: user.color || COLORS[0] }}
            >
              {user.avatar || (user.name?.[0]?.toUpperCase() || "?")}
            </div>
            <div className="flex-1 min-w-0">
              {editingUserId === user.id ? (
                <input
                  type="text"
                  defaultValue={user.name}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value !== user.name) {
                      handleUpdateUser(user.id, { name: e.target.value.trim() });
                    } else {
                      setEditingUserId(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    } else if (e.key === "Escape") {
                      setEditingUserId(null);
                    }
                  }}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  autoFocus
                />
              ) : (
                <div className="font-medium text-gray-900">{user.name}</div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {activeUserId === user.id ? (
                <span className="text-xs text-blue-600 font-medium">Active</span>
              ) : (
                <button
                  onClick={() => handleSwitchUser(user)}
                  className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                >
                  Switch
                </button>
              )}
              <button
                onClick={() => setEditingUserId(user.id)}
                className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              >
                Edit
              </button>
              {users.length > 1 && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
