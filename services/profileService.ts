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
  if (!cleanEmail) return null;

  // Always check localStorage cache first
  let localProfile: UserProfile | null = null;
  try {
    const saved = localStorage.getItem('user_profile_data');
    if (saved) {
      localProfile = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading local profile:", e);
  }

  if (!isSupabaseConfigured()) {
    return localProfile;
  }

  try {
    // 1. Try fetching from user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!profileError && profileData) {
      const remoteProfile: UserProfile = {
        namaSekolah: profileData.nama_sekolah || profileData.namaSekolah || '',
        namaKepalaSekolah: profileData.nama_kepala_sekolah || profileData.namaKepalaSekolah || '',
        nipKepalaSekolah: profileData.nip_kepala_sekolah || profileData.nipKepalaSekolah || '',
        namaPenyusun: profileData.nama_penyusun || profileData.namaPenyusun || '',
        nipPenyusun: profileData.nip_penyusun || profileData.nipPenyusun || ''
      };
      localStorage.setItem('user_profile_data', JSON.stringify(remoteProfile));
      return remoteProfile;
    }

    // 2. Fallback: try fetching from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!userError && userData) {
      const remoteProfile: UserProfile = {
        namaSekolah: userData.nama_sekolah || userData.namaSekolah || '',
        namaKepalaSekolah: userData.nama_kepala_sekolah || userData.namaKepalaSekolah || '',
        nipKepalaSekolah: userData.nip_kepala_sekolah || userData.nipKepalaSekolah || '',
        namaPenyusun: userData.nama_penyusun || userData.namaPenyusun || '',
        nipPenyusun: userData.nip_penyusun || userData.nipPenyusun || ''
      };
      if (remoteProfile.namaSekolah || remoteProfile.namaPenyusun) {
        localStorage.setItem('user_profile_data', JSON.stringify(remoteProfile));
        return remoteProfile;
      }
    }
  } catch (e) {
    console.error("Error fetching user profile from DB:", e);
  }

  return localProfile;
}

export async function saveUserProfileToDb(email: string, profile: UserProfile): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Save to localStorage immediately
  try {
    localStorage.setItem('user_profile_data', JSON.stringify(profile));
  } catch (e) {
    console.error("Error saving local profile:", e);
  }

  if (!isSupabaseConfigured() || !cleanEmail) {
    return true;
  }

  let dbSuccess = false;

  const payload = {
    email: cleanEmail,
    nama_sekolah: profile.namaSekolah,
    nama_kepala_sekolah: profile.namaKepalaSekolah,
    nip_kepala_sekolah: profile.nipKepalaSekolah,
    nama_penyusun: profile.namaPenyusun,
    nip_penyusun: profile.nipPenyusun,
    updated_at: new Date().toISOString()
  };

  // 1. Try upserting to user_profiles table via client
  try {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' });

    if (!profileError) {
      dbSuccess = true;
    } else {
      // Try without updated_at
      const { error: err2 } = await supabase
        .from('user_profiles')
        .upsert({
          email: cleanEmail,
          nama_sekolah: profile.namaSekolah,
          nama_kepala_sekolah: profile.namaKepalaSekolah,
          nip_kepala_sekolah: profile.nipKepalaSekolah,
          nama_penyusun: profile.namaPenyusun,
          nip_penyusun: profile.nipPenyusun
        }, { onConflict: 'email' });
      if (!err2) dbSuccess = true;
    }
  } catch (e) {
    console.error("Error saving to user_profiles table:", e);
  }

  // 2. Also try updating users table
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
      dbSuccess = true;
    } else {
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert(userPayload, { onConflict: 'email' });
      if (!upsertErr) dbSuccess = true;
    }
  } catch (e) {
    console.error("Error updating users table with profile:", e);
  }

  // 3. Robust Direct Supabase REST API Fallback (bypasses client constraints if any)
  try {
    const urlEnv = (import.meta as any).env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const keyEnv = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (urlEnv && keyEnv) {
      const restRes = await fetch(`${urlEnv}/rest/v1/user_profiles?on_conflict=email`, {
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
        dbSuccess = true;
      }
    }
  } catch (restErr) {
    console.error("REST API fallback error:", restErr);
  }

  return true;
}
