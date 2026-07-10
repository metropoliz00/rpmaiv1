import { supabase, isSupabaseConfigured } from './supabase';

export interface UserProfile {
  namaSekolah: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaPenyusun: string;
  nipPenyusun: string;
}

export async function getUserProfileFromDb(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !isSupabaseConfigured()) {
    return null;
  }

  try {
    // 1. Try fetching from user_profiles table by email
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!profileError && profileData) {
      return {
        namaSekolah: profileData.nama_sekolah || profileData.namaSekolah || '',
        namaKepalaSekolah: profileData.nama_kepala_sekolah || profileData.namaKepalaSekolah || '',
        nipKepalaSekolah: profileData.nip_kepala_sekolah || profileData.nipKepalaSekolah || '',
        namaPenyusun: profileData.nama_penyusun || profileData.namaPenyusun || '',
        nipPenyusun: profileData.nip_penyusun || profileData.nipPenyusun || ''
      };
    }

    // 2. Fallback: try fetching from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!userError && userData) {
      return {
        namaSekolah: userData.nama_sekolah || userData.namaSekolah || '',
        namaKepalaSekolah: userData.nama_kepala_sekolah || userData.namaKepalaSekolah || '',
        nipKepalaSekolah: userData.nip_kepala_sekolah || userData.nipKepalaSekolah || '',
        namaPenyusun: userData.nama_penyusun || userData.namaPenyusun || '',
        nipPenyusun: userData.nip_penyusun || userData.nipPenyusun || ''
      };
    }
  } catch (e) {
    console.error("Error fetching user profile from DB:", e);
  }

  return null;
}

export async function saveUserProfileToDb(email: string, profile: UserProfile): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !isSupabaseConfigured()) {
    console.error("Supabase is not configured or email is missing");
    return false;
  }

  const payload = {
    email: cleanEmail,
    nama_sekolah: profile.namaSekolah,
    nama_kepala_sekolah: profile.namaKepalaSekolah,
    nip_kepala_sekolah: profile.nipKepalaSekolah,
    nama_penyusun: profile.namaPenyusun,
    nip_penyusun: profile.nipPenyusun,
    updated_at: new Date().toISOString()
  };

  let success = false;

  // 1. Explicit Check & Update / Insert for user_profiles
  try {
    const { data: existing, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!checkError) {
      if (existing && existing.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(payload)
          .eq('id', existing.id);
        if (!updateError) {
          success = true;
        } else {
          console.warn("Update user_profiles error:", updateError);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(payload);
        if (!insertError) {
          success = true;
        } else {
          console.warn("Insert user_profiles error:", insertError);
        }
      }
    }
  } catch (e) {
    console.error("Error saving user profile to user_profiles table:", e);
  }

  // 2. Also try REST API direct fallback to user_profiles
  try {
    const urlEnv = (import.meta as any).env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const keyEnv = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (urlEnv && keyEnv) {
      const restRes = await fetch(`${urlEnv}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          'apikey': keyEnv,
          'Authorization': `Bearer ${keyEnv}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
      if (restRes.ok) {
        success = true;
      }
    }
  } catch (restErr) {
    console.error("REST API fallback error:", restErr);
  }

  // 3. Also update users table if exists
  try {
    const userPayload = {
      email: cleanEmail,
      nama_sekolah: profile.namaSekolah,
      nama_kepala_sekolah: profile.namaKepalaSekolah,
      nip_kepala_sekolah: profile.nipKepalaSekolah,
      nama_penyusun: profile.namaPenyusun,
      nip_penyusun: profile.nipPenyusun
    };

    const { error: userError } = await supabase
      .from('users')
      .update(userPayload)
      .eq('email', cleanEmail);

    if (!userError) {
      success = true;
    }
  } catch (e) {
    console.error("Error updating users table with profile:", e);
  }

  return success;
}

