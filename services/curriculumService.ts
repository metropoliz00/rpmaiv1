import { supabase } from './supabase';

export interface CurriculumItem {
  id: string;
  name: string;
  table: 'db_kelas' | 'db_mata_pelajaran' | 'db_materi';
}

export interface MateriItem {
  id: string;
  name: string;
  kelas?: string;
  mata_pelajaran?: string;
}

export async function fetchDbKelas(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('db_kelas')
      .select('name')
      .order('name', { ascending: true });
    if (error || !data || data.length === 0) {
      return [];
    }
    return data.map((item: any) => item.name).filter(Boolean);
  } catch (e) {
    console.error("Error fetching db_kelas:", e);
    return [];
  }
}

export async function fetchDbMataPelajaran(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('db_mata_pelajaran')
      .select('name')
      .order('name', { ascending: true });
    if (error || !data || data.length === 0) {
      return [];
    }
    return data.map((item: any) => item.name).filter(Boolean);
  } catch (e) {
    console.error("Error fetching db_mata_pelajaran:", e);
    return [];
  }
}

export async function fetchDbMateriItems(): Promise<MateriItem[]> {
  try {
    const { data, error } = await supabase
      .from('db_materi')
      .select('*')
      .order('name', { ascending: true });
    if (error || !data || data.length === 0) {
      return [];
    }
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      kelas: item.kelas || item.kelas_name || '',
      mata_pelajaran: item.mata_pelajaran || item.mataPelajaran || ''
    }));
  } catch (e) {
    console.error("Error fetching db_materi:", e);
    return [];
  }
}

export async function fetchAllCurriculumItems(): Promise<{ kelas: any[], mataPelajaran: any[], materi: any[] }> {
  try {
    const [k, mp, mat] = await Promise.all([
      supabase.from('db_kelas').select('*').order('name', { ascending: true }),
      supabase.from('db_mata_pelajaran').select('*').order('name', { ascending: true }),
      supabase.from('db_materi').select('*').order('name', { ascending: true })
    ]);

    return {
      kelas: k.data || [],
      mataPelajaran: mp.data || [],
      materi: mat.data || []
    };
  } catch (e) {
    console.error("Error fetching all curriculum items:", e);
    return { kelas: [], mataPelajaran: [], materi: [] };
  }
}

export async function addCurriculumItem(
  table: 'db_kelas' | 'db_mata_pelajaran' | 'db_materi', 
  name: string, 
  kelas?: string,
  mataPelajaran?: string
): Promise<boolean> {
  try {
    const cleanName = name.trim();
    if (!cleanName) return false;
    
    const payload: any = { name: cleanName };
    if (table === 'db_materi') {
      if (kelas && kelas.trim()) payload.kelas = kelas.trim();
      if (mataPelajaran && mataPelajaran.trim()) payload.mata_pelajaran = mataPelajaran.trim();
    }

    const { error } = await supabase
      .from(table)
      .insert([payload]);
    if (error) {
      console.error(`Error inserting into ${table}:`, error);
      const { error: err2 } = await supabase
        .from(table)
        .insert([{ name: cleanName }]);
      if (!err2) return true;
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Exception inserting into ${table}:`, e);
    return false;
  }
}

export async function deleteCurriculumItem(table: 'db_kelas' | 'db_mata_pelajaran' | 'db_materi', id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Exception deleting from ${table}:`, e);
    return false;
  }
}

export async function bulkInsertCurriculum(items: { table: 'db_kelas' | 'db_mata_pelajaran' | 'db_materi', name: string, kelas?: string, mata_pelajaran?: string }[]): Promise<number> {
  let successCount = 0;
  for (const item of items) {
    if (item.name && item.name.trim()) {
      const ok = await addCurriculumItem(item.table, item.name, item.kelas, item.mata_pelajaran);
      if (ok) successCount++;
    }
  }
  return successCount;
}

