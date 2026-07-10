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

  // 1. Try REST API direct upsert to user_profiles (most reliable for RLS/anonymous/service key environments)
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
        success = true;
      } else {
        const errText = await restRes.text();
        console.warn("REST API user_profiles upsert warning:", errText);
      }
    }
  } catch (restErr) {
    console.error("REST API fallback error:", restErr);
  }

  // 2. Try Supabase Client upsert to user_profiles
  try {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' });

    if (!profileError) {
      success = true;
    } else {
      console.warn("Client user_profiles upsert error:", profileError);
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
      if (!err2) success = true;
    }
  } catch (e) {
    console.error("Error saving to user_profiles table via client:", e);
  }

  // 3. Also try updating users table
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
    } else {
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert(userPayload, { onConflict: 'email' });
      if (!upsertErr) success = true;
    }
  } catch (e) {
    console.error("Error updating users table with profile:", e);
  }

  return success;
}

