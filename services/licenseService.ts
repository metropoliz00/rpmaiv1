/**
 * License & Activation Service for RPM Generator Pro
 * Provides deterministic offline license key generation, validation, and storage.
 */
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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
    return JSON.parse(usersJson);
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
export const registerUser = (email: string, geminiApiKey: string, isActive: boolean = true): RegisteredUser => {
  const cleanEmail = email.trim().toLowerCase();
  const licenseKey = generateLicenseKey(cleanEmail);
  const users = getRegisteredUsers();
  
  const existingIndex = users.findIndex(u => u.email === cleanEmail);
  const newUser: RegisteredUser = {
    email: cleanEmail,
    geminiApiKey: geminiApiKey.trim(),
    licenseKey,
    isActive,
    createdAt: existingIndex >= 0 ? users[existingIndex].createdAt : new Date().toISOString()
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

/**
 * Gets the list of registered users from the Firestore database.
 * Caches them in localStorage on success.
 */
export const getRegisteredUsersFromDb = async (): Promise<RegisteredUser[]> => {
  try {
    const colRef = collection(db, 'users');
    const querySnapshot = await getDocs(colRef);
    const users: RegisteredUser[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as RegisteredUser);
    });
    saveRegisteredUsers(users);
    return users;
  } catch (e) {
    console.error("Error fetching registered users from DB:", e);
    return getRegisteredUsers(); // Fallback to cache
  }
};

/**
 * Registers or updates a user in the Firestore database.
 * Automatically generates the license key.
 */
export const registerUserOnDb = async (email: string, geminiApiKey: string, isActive: boolean = true): Promise<RegisteredUser> => {
  const cleanEmail = email.trim().toLowerCase();
  const licenseKey = generateLicenseKey(cleanEmail);
  
  let createdAt = new Date().toISOString();
  try {
    const userDocRef = doc(db, 'users', cleanEmail);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      createdAt = docSnap.data().createdAt || createdAt;
    }
  } catch (e) {
    console.error("Error checking existing user in DB:", e);
  }

  const newUser: RegisteredUser = {
    email: cleanEmail,
    geminiApiKey: geminiApiKey.trim(),
    licenseKey,
    isActive,
    createdAt
  };

  try {
    const docRef = doc(db, 'users', cleanEmail);
    await setDoc(docRef, newUser);
    
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
  }

  return newUser;
};

/**
 * Deletes a registered user from the Firestore database.
 */
export const updateUserGeminiKeyOnDb = async (email: string, geminiApiKey: string): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await setDoc(doc(db, 'users', cleanEmail), { geminiApiKey }, { merge: true });
    
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
 * Deletes a registered user from the Firestore database.
 */
export const deleteUserFromDb = async (email: string): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await deleteDoc(doc(db, 'users', cleanEmail));
    
    // Sync cache
    const cached = getRegisteredUsers().filter(u => u.email !== cleanEmail);
    saveRegisteredUsers(cached);
  } catch (e) {
    console.error("Error deleting user from DB:", e);
  }
};

/**
 * Checks a specific user's status directly from the Firestore database.
 */
export const checkUserOnDb = async (email: string): Promise<RegisteredUser | null> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;
  try {
    const docRef = doc(db, 'users', cleanEmail);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as RegisteredUser;
    }
  } catch (e) {
    console.error("Error fetching user from DB:", e);
  }
  return null;
};

/**
 * Validates if the email and license key are registered and active in the database.
 */
export const validateUserActivationFromDb = async (email: string, licenseKey: string): Promise<RegisteredUser | null> => {
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

