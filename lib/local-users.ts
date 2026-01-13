import { supabase } from "./supabase";

const INSTANCE_KEY_STORAGE = "grocery_app_instance_key";
const ACTIVE_USER_ID_STORAGE = "grocery_app_active_user_id";

export interface LocalUser {
  id: string;
  instance_id: string;
  name: string;
  color?: string;
  avatar?: string;
  created_at: string;
}

// Get or create instance key
export function getInstanceKey(): string {
  if (typeof window === "undefined") return "";
  
  let instanceKey = localStorage.getItem(INSTANCE_KEY_STORAGE);
  if (!instanceKey) {
    instanceKey = crypto.randomUUID();
    localStorage.setItem(INSTANCE_KEY_STORAGE, instanceKey);
  }
  return instanceKey;
}

// Get active user ID
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

// Get or create app instance
export async function getOrCreateInstance(): Promise<string> {
  const instanceKey = getInstanceKey();
  
  // Try to find existing instance
  const { data: existing } = await supabase
    .from("app_instances")
    .select("id")
    .eq("instance_key", instanceKey)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  // Create new instance
  const { data, error } = await supabase
    .from("app_instances")
    .insert({ instance_key: instanceKey })
    .select("id")
    .single();
  
  if (error) throw error;
  return data.id;
}

// Get all users for current instance
export async function getLocalUsers(): Promise<LocalUser[]> {
  const instanceId = await getOrCreateInstance();
  
  const { data, error } = await supabase
    .from("local_users")
    .select("*")
    .eq("instance_id", instanceId)
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Create a new user
export async function createLocalUser(
  name: string,
  color?: string,
  avatar?: string
): Promise<LocalUser> {
  const instanceId = await getOrCreateInstance();
  
  const { data, error } = await supabase
    .from("local_users")
    .insert({
      instance_id: instanceId,
      name,
      color: color || "#3B82F6",
      avatar,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Update a user
export async function updateLocalUser(
  userId: string,
  updates: { name?: string; color?: string; avatar?: string }
): Promise<void> {
  const instanceId = await getOrCreateInstance();
  
  const { error } = await supabase
    .from("local_users")
    .update(updates)
    .eq("id", userId)
    .eq("instance_id", instanceId);
  
  if (error) throw error;
}

// Delete a user
export async function deleteLocalUser(userId: string): Promise<void> {
  const instanceId = await getOrCreateInstance();
  
  const { error } = await supabase
    .from("local_users")
    .delete()
    .eq("id", userId)
    .eq("instance_id", instanceId);
  
  if (error) throw error;
  
  // If deleted user was active, clear active user
  const activeUserId = getActiveUserId();
  if (activeUserId === userId) {
    setActiveUserId(null);
  }
}

// Get current active user
export async function getActiveUser(): Promise<LocalUser | null> {
  const activeUserId = getActiveUserId();
  const instanceId = await getOrCreateInstance();
  
  if (!activeUserId) {
    // If no active user, try to get first user
    const users = await getLocalUsers();
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
    .eq("instance_id", instanceId)
    .single();
  
  if (error || !data) {
    // User doesn't exist, try to get first user
    const users = await getLocalUsers();
    if (users.length > 0) {
      setActiveUserId(users[0].id);
      return users[0];
    }
    return null;
  }
  return data;
}
