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
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      const remoteProfile: UserProfile = {
        namaSekolah: data.nama_sekolah || data.namaSekolah || '',
        namaKepalaSekolah: data.nama_kepala_sekolah || data.namaKepalaSekolah || '',
        nipKepalaSekolah: data.nip_kepala_sekolah || data.nipKepalaSekolah || '',
        namaPenyusun: data.nama_penyusun || data.namaPenyusun || '',
        nipPenyusun: data.nip_penyusun || data.nipPenyusun || ''
      };
      localStorage.setItem('user_profile_data', JSON.stringify(remoteProfile));
      return remoteProfile;
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

  try {
    const payload = {
      email: cleanEmail,
      nama_sekolah: profile.namaSekolah,
      nama_kepala_sekolah: profile.namaKepalaSekolah,
      nip_kepala_sekolah: profile.nipKepalaSekolah,
      nama_penyusun: profile.namaPenyusun,
      nip_penyusun: profile.nipPenyusun,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      // Fallback upsert without updated_at if column doesn't exist
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
      if (err2) throw err2;
    }

    return true;
  } catch (e) {
    console.error("Error saving user profile to DB:", e);
    return false;
  }
}
