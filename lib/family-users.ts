import { supabase } from "./supabase";

const ACTIVE_USER_ID_STORAGE = "grocery_app_active_user_id";

export interface FamilyUser {
  id: string;
  name: string;
  created_at: string;
}

// Get active user ID from localStorage
export function getActiveUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_USER_ID_STORAGE);
}

// Set active user ID
export function setActiveUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  if (userId) {
    localStorage.setItem(ACTIVE_USER_ID_STORAGE, userId);
  } else {
    localStorage.removeItem(ACTIVE_USER_ID_STORAGE);
  }
}

// Get all users
export async function getFamilyUsers(): Promise<FamilyUser[]> {
  const { data, error } = await supabase
    .from("local_users")
    .select("*")
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Create a new user
export async function createFamilyUser(name: string): Promise<FamilyUser> {
  const { data, error } = await supabase
    .from("local_users")
    .insert({ name: name.trim() })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Update a user
export async function updateFamilyUser(
  userId: string,
  name: string
): Promise<void> {
  const { error } = await supabase
    .from("local_users")
    .update({ name: name.trim() })
    .eq("id", userId);
  
  if (error) throw error;
}

// Delete a user
export async function deleteFamilyUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from("local_users")
    .delete()
    .eq("id", userId);
  
  if (error) throw error;
  
  // If deleted user was active, clear active user
  const activeUserId = getActiveUserId();
  if (activeUserId === userId) {
    setActiveUserId(null);
  }
}

// Get current active user
export async function getActiveUser(): Promise<FamilyUser | null> {
  const activeUserId = getActiveUserId();
  
  if (!activeUserId) {
    // If no active user, try to get first user
    const users = await getFamilyUsers();
    if (users.length > 0) {
      setActiveUserId(users[0].id);
      return users[0];
    }
    return null;
  }
  
  const { data, error } = await supabase
    .from("local_users")
    .select("*")
    .eq("id", activeUserId)
    .single();
  
  if (error || !data) {
    // User doesn't exist, try to get first user
    const users = await getFamilyUsers();
    if (users.length > 0) {
      setActiveUserId(users[0].id);
      return users[0];
    }
    return null;
  }
  return data;
}
