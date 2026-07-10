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
    // 1. Try fetching from user_profiles table by email (ordered by created_at desc)
    const { data: profileDataList, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false });

    if (!profileError && profileDataList && profileDataList.length > 0) {
      const profileData = profileDataList[0];
      // Clean up any extra duplicates in background
      if (profileDataList.length > 1) {
        const duplicateIds = profileDataList.slice(1).map(r => r.id);
        supabase.from('user_profiles').delete().in('id', duplicateIds).then(() => {});
      }

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

  // 1. Fetch existing records for this email to prevent duplicates
  try {
    const { data: existingRows, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, created_at')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false });

    if (!checkError && existingRows && existingRows.length > 0) {
      // Keep the first (newest) record and update it
      const keepId = existingRows[0].id;
      const duplicateIds = existingRows.slice(1).map(r => r.id);
      
      if (duplicateIds.length > 0) {
        await supabase.from('user_profiles').delete().in('id', duplicateIds);
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', keepId);

      if (!updateError) {
        success = true;
      } else {
        console.warn("Update user_profiles error:", updateError);
      }
    } else {
      // Insert new record if none exists
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert(payload);

      if (!insertError) {
        success = true;
      } else {
        console.warn("Insert user_profiles error:", insertError);
      }
    }
  } catch (e) {
    console.error("Error saving user profile to user_profiles table:", e);
  }

  // 2. Also update users table if exists
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

