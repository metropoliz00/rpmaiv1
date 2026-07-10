/**
 * License & Activation Service for RPM Generator Pro
 * Provides deterministic offline license key generation, validation, and storage.
 */
import { supabase, isSupabaseConfigured } from './supabase';


// A secure, application-specific salt to make the activation token deterministic but un-guessable without the formula
const LICENSE_SALT = "RPM-GENERATOR-PRO-SECURE-SALT-2026";

/**
 * Generates a beautiful activation token from a given email.
 * Format: RPM-XXXX-XXXX-XXXX-XXXX (Alphanumeric uppercase)
 */
export const generateLicenseKey = (email: string): string => {
  const sanitized = email.trim().toLowerCase();
  if (!sanitized) return "";

  const input = sanitized + LICENSE_SALT;
  
  // Use a reliable polynomial rolling hash (fnv1a-like) to construct distinct chunks
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    h1 ^= char;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= char;
    h2 = Math.imul(h2, 0x01000193) + h1;
  }

  // Get absolute, positive 32-bit values
  const val1 = Math.abs(h1).toString(16).toUpperCase().padStart(8, '0');
  const val2 = Math.abs(h2).toString(16).toUpperCase().padStart(8, '0');
  const combined = (val1 + val2 + val1.split('').reverse().join('')).substring(0, 16);

  // Format as RPM-XXXX-XXXX-XXXX-XXXX
  return `RPM-${combined.substring(0, 4)}-${combined.substring(4, 8)}-${combined.substring(8, 12)}-${combined.substring(12, 16)}`;
};

/**
 * Validates whether a given license key is valid for a given email.
 */
export const validateLicense = (email: string, licenseKey: string): boolean => {
  const expectedKey = generateLicenseKey(email);
  if (!expectedKey) return false;
  return expectedKey === licenseKey.trim().toUpperCase();
};

/**
 * Persists user credentials in localStorage.
 */
export const saveCredentials = (email: string, licenseKey: string, geminiApiKey: string): void => {
  localStorage.setItem("rpm_user_email", email.trim().toLowerCase());
  localStorage.setItem("rpm_license_key", licenseKey.trim().toUpperCase());
  localStorage.setItem("user_gemini_api_key", geminiApiKey.trim());
};

/**
 * Retrieves the currently saved credentials from localStorage.
 */
export const getSavedCredentials = (): { email: string; licenseKey: string; geminiApiKey: string } | null => {
  const email = localStorage.getItem("rpm_user_email");
  const licenseKey = localStorage.getItem("rpm_license_key");
  const geminiApiKey = localStorage.getItem("user_gemini_api_key");

  if (!email || !licenseKey || !geminiApiKey) {
    return null;
  }

  return { email, licenseKey, geminiApiKey };
};

export interface RegisteredUser {
  email: string;
  geminiApiKey: string;
  licenseKey: string;
  isActive: boolean;
  showAttachments: boolean;
  createdAt: string;
}

/**
 * Gets the list of registered users from simulated database in localStorage.
 * Initially returns an empty array.
 */
export const getRegisteredUsers = (): RegisteredUser[] => {
  const usersJson = localStorage.getItem("rpm_registered_users");
  if (!usersJson) {
    return [];
  }
  try {
    const parsed = JSON.parse(usersJson);
    return parsed.map((u: any) => ({
      ...u,
      showAttachments: u.showAttachments !== undefined ? u.showAttachments : true
    }));
  } catch (e) {
    return [];
  }
};

/**
 * Saves the list of registered users.
 */
export const saveRegisteredUsers = (users: RegisteredUser[]): void => {
  localStorage.setItem("rpm_registered_users", JSON.stringify(users));
};

/**
 * Registers or updates a user in the database.
 * Automatically generates the license key.
 */
export const registerUser = (email: string, geminiApiKey: string, isActive: boolean = true, showAttachments: boolean = true): RegisteredUser => {
  const cleanEmail = email.trim().toLowerCase();
  const licenseKey = generateLicenseKey(cleanEmail);
  const users = getRegisteredUsers();
  
  const existingIndex = users.findIndex(u => u.email === cleanEmail);
  const existingUser = existingIndex >= 0 ? users[existingIndex] : null;
  
  const newUser: RegisteredUser = {
    email: cleanEmail,
    geminiApiKey: geminiApiKey.trim(),
    licenseKey,
    isActive,
    showAttachments: showAttachments !== undefined ? showAttachments : (existingUser ? existingUser.showAttachments : true),
    createdAt: existingUser ? existingUser.createdAt : new Date().toISOString()
  };

  if (existingIndex >= 0) {
    users[existingIndex] = newUser;
  } else {
    users.push(newUser);
  }

  saveRegisteredUsers(users);
  return newUser;
};

/**
 * Deletes a registered user from the database.
 */
export const deleteUser = (email: string): void => {
  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers().filter(u => u.email !== cleanEmail);
  saveRegisteredUsers(users);
};

// Map DB row to RegisteredUser
const mapToRegisteredUser = (row: any): RegisteredUser => {
  const cachedUsers = getRegisteredUsers();
  const cached = cachedUsers.find(u => u.email === (row.email || "").trim().toLowerCase());
  const defaultShow = cached ? cached.showAttachments : true;

  return {
    email: row.email,
    geminiApiKey: row.gemini_api_key || row.geminiApiKey || "",
    licenseKey: row.license_key || row.licenseKey || "",
    isActive: row.is_active !== undefined ? row.is_active : (row.isActive !== undefined ? row.isActive : true),
    showAttachments: row.show_attachments !== undefined && row.show_attachments !== null ? row.show_attachments : (row.showAttachments !== undefined ? row.showAttachments : defaultShow),
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
};

// Map RegisteredUser to DB row
const mapToDbRow = (user: RegisteredUser) => {
  return {
    email: user.email,
    gemini_api_key: user.geminiApiKey,
    license_key: user.licenseKey,
    is_active: user.isActive,
    show_attachments: user.showAttachments ?? true,
    created_at: user.createdAt
  };
};

/**
 * Gets the list of registered users from the Supabase database.
 * Caches them in localStorage on success.
 */
export const getRegisteredUsersFromDb = async (): Promise<RegisteredUser[]> => {
  if (!isSupabaseConfigured()) {
    return getRegisteredUsers();
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const users = (data || []).map(mapToRegisteredUser);
    saveRegisteredUsers(users);
    return users;
  } catch (e) {
    console.error("Error fetching registered users from DB:", e);
    return getRegisteredUsers(); // Fallback to cache
  }
};

/**
 * Registers or updates a user in the Supabase database.
 * Automatically generates the license key.
 */
export const registerUserOnDb = async (email: string, geminiApiKey: string, isActive: boolean = true, showAttachments: boolean = true): Promise<RegisteredUser> => {
  if (!isSupabaseConfigured()) {
    return registerUser(email, geminiApiKey, isActive, showAttachments);
  }

  const cleanEmail = email.trim().toLowerCase();
  const licenseKey = generateLicenseKey(cleanEmail);
  
  let createdAt = new Date().toISOString();
  let existingShowAttachments = true;
  try {
    const { data: existing, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing && !error) {
      createdAt = existing.created_at || existing.createdAt || createdAt;
      if (existing.show_attachments !== undefined && existing.show_attachments !== null) {
        existingShowAttachments = existing.show_attachments;
      } else if (existing.showAttachments !== undefined && existing.showAttachments !== null) {
        existingShowAttachments = existing.showAttachments;
      }
    }
  } catch (e) {
    console.error("Error checking existing user in DB:", e);
  }

  const newUser: RegisteredUser = {
    email: cleanEmail,
    geminiApiKey: geminiApiKey.trim(),
    licenseKey,
    isActive,
    showAttachments: showAttachments !== undefined ? showAttachments : existingShowAttachments,
    createdAt
  };

  try {
    const dbRow = mapToDbRow(newUser);
    let { error } = await supabase
      .from('users')
      .upsert(dbRow, { onConflict: 'email' });

    if (error) {
      console.warn("Upsert with onConflict error, trying update/insert:", error);
      const { data: existingUserRow } = await supabase
        .from('users')
        .select('email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUserRow) {
        const { error: updateErr } = await supabase
          .from('users')
          .update({
            gemini_api_key: dbRow.gemini_api_key,
            license_key: dbRow.license_key,
            is_active: dbRow.is_active,
            show_attachments: dbRow.show_attachments
          })
          .eq('email', cleanEmail);
        if (updateErr) {
          // Fallback update without show_attachments
          await supabase
            .from('users')
            .update({
              gemini_api_key: dbRow.gemini_api_key,
              license_key: dbRow.license_key,
              is_active: dbRow.is_active
            })
            .eq('email', cleanEmail);
        }
      } else {
        const { error: insertErr } = await supabase
          .from('users')
          .insert(dbRow);
        if (insertErr) {
          const { email: e_val, gemini_api_key, license_key, is_active, created_at } = dbRow;
          const { error: error2 } = await supabase
            .from('users')
            .insert({ email: e_val, gemini_api_key, license_key, is_active, created_at });
          if (error2) throw error2;
        }
      }
    }
    
    // Sync cache
    const cached = getRegisteredUsers();
    const existingIndex = cached.findIndex(u => u.email === cleanEmail);
    if (existingIndex >= 0) {
      cached[existingIndex] = newUser;
    } else {
      cached.push(newUser);
    }
    saveRegisteredUsers(cached);
  } catch (e) {
    console.error("Error saving user to DB:", e);
    // Still save to local cache so app functions smoothly
    registerUser(email, geminiApiKey, isActive, showAttachments);
  }

  return newUser;
};

/**
 * Updates a user's Gemini Key in the Supabase database.
 */
export const updateUserGeminiKeyOnDb = async (email: string, geminiApiKey: string): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!isSupabaseConfigured()) {
    const cached = getRegisteredUsers();
    const existingIndex = cached.findIndex(u => u.email === cleanEmail);
    if (existingIndex >= 0) {
      cached[existingIndex].geminiApiKey = geminiApiKey;
      saveRegisteredUsers(cached);
    }
    return;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ gemini_api_key: geminiApiKey })
      .eq('email', cleanEmail);

    if (error) throw error;
    
    // Sync cache
    const cached = getRegisteredUsers();
    const existingIndex = cached.findIndex(u => u.email === cleanEmail);
    if (existingIndex >= 0) {
      cached[existingIndex].geminiApiKey = geminiApiKey;
      saveRegisteredUsers(cached);
    }
  } catch (e) {
    console.error("Error updating user Gemini Key in DB:", e);
  }
};

/**
 * Deletes a registered user from the Supabase database.
 */
export const deleteUserFromDb = async (email: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    deleteUser(email);
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('email', cleanEmail);

    if (error) throw error;
    
    // Sync cache
    const cached = getRegisteredUsers().filter(u => u.email !== cleanEmail);
    saveRegisteredUsers(cached);
  } catch (e) {
    console.error("Error deleting user from DB:", e);
  }
};

/**
 * Checks a specific user's status directly from the Supabase database.
 */
export const checkUserOnDb = async (email: string): Promise<RegisteredUser | null> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  if (!isSupabaseConfigured()) {
    const cached = getRegisteredUsers();
    return cached.find(u => u.email === cleanEmail) || null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return mapToRegisteredUser(data);
    }
  } catch (e) {
    // Fallback to local cache instead of failing
    const cached = getRegisteredUsers();
    return cached.find(u => u.email === cleanEmail) || null;
  }
};

/**
 * Validates if the email and license key are registered and active in the database.
 */
export const validateUserActivationFromDb = async (email: string, licenseKey: string): Promise<RegisteredUser | null> => {
  if (!isSupabaseConfigured()) {
    return validateUserActivation(email, licenseKey);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanKey = licenseKey.trim().toUpperCase();
  
  const verified = await checkUserOnDb(cleanEmail);
  if (verified && verified.isActive && verified.licenseKey.trim().toUpperCase() === cleanKey) {
    // Cache
    const cached = getRegisteredUsers();
    const existingIndex = cached.findIndex(u => u.email === cleanEmail);
    if (existingIndex >= 0) {
      cached[existingIndex] = verified;
    } else {
      cached.push(verified);
    }
    saveRegisteredUsers(cached);
    return verified;
  }
  return null;
};

/**
 * Validates if the email and license key are registered and active.
 * Returns the matching RegisteredUser or null.
 */
export const validateUserActivation = (email: string, licenseKey: string): RegisteredUser | null => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanKey = licenseKey.trim().toUpperCase();
  
  const users = getRegisteredUsers();
  const found = users.find(u => u.email === cleanEmail && u.licenseKey === cleanKey);
  
  if (found && found.isActive) {
    return found;
  }
  return null;
};

/**
 * Checks if the current user has valid saved activation credentials that exist and are active in the database.
 */
export const checkIsActivated = (): boolean => {
  const creds = getSavedCredentials();
  if (!creds) return false;
  
  // Make sure the user is registered and active in the DB
  const verifiedUser = validateUserActivation(creds.email, creds.licenseKey);
  return verifiedUser !== null;
};

/**
 * Deactivates/clears all stored application credentials.
 */
export const clearCredentials = (): void => {
  localStorage.removeItem("rpm_user_email");
  localStorage.removeItem("rpm_license_key");
  localStorage.removeItem("user_gemini_api_key");
  localStorage.setItem("rpm_user_deactivated", "true");
};
