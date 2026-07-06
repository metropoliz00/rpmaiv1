import { supabase, isSupabaseConfigured } from './supabase';

const ADMIN_CONFIG_KEY = 'adminConfig';

export const getAdminPassword = async (): Promise<string> => {
  if (!isSupabaseConfigured()) {
    return localStorage.getItem('rpm_admin_password') || 'admin123';
  }

  try {
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', ADMIN_CONFIG_KEY)
      .maybeSingle();

    if (error) {
      console.error("Error fetching admin config from Supabase:", error);
      return localStorage.getItem('rpm_admin_password') || 'admin123';
    }

    if (data && data.value) {
      return data.value.password || 'admin123';
    }
  } catch (e) {
    console.error("Failed to fetch admin password from Supabase:", e);
  }
  return localStorage.getItem('rpm_admin_password') || 'admin123';
};

export const updateAdminPassword = async (newPassword: string): Promise<void> => {
  localStorage.setItem('rpm_admin_password', newPassword);

  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { error } = await supabase
      .from('config')
      .upsert({
        key: ADMIN_CONFIG_KEY,
        value: { password: newPassword }
      });

    if (error) {
      console.error("Error updating admin config in Supabase:", error);
      throw error;
    }
  } catch (e) {
    console.error("Failed to update admin password in Supabase:", e);
    throw e;
  }
};

