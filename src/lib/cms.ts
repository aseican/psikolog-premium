import { supabase } from "./supabase";

export type CmsBlock<T = any> = {
  key: string;
  data: T;
  updated_at?: string;
};

// Tek block getir
export async function getCmsBlock<T = any>(key: string): Promise<T | null> {
  const { data } = await supabase
    .from("cms_blocks")
    .select("data")
    .eq("key", key)
    .single();
  return (data?.data as T) ?? null;
}

// Birden fazla block getir
export async function getCmsBlocks<T = Record<string, any>>(
  keys: string[]
): Promise<T> {
  const { data } = await supabase
    .from("cms_blocks")
    .select("key, data")
    .in("key", keys);

  const result: Record<string, any> = {};
  data?.forEach((row) => {
    result[row.key] = row.data;
  });
  return result as T;
}

// Tüm blockları getir
export async function getAllCmsBlocks(): Promise<CmsBlock[]> {
  const { data } = await supabase
    .from("cms_blocks")
    .select("key, data, updated_at")
    .order("key");
  return (data as CmsBlock[]) ?? [];
}

// Block kaydet/güncelle
export async function saveCmsBlock(key: string, data: any): Promise<boolean> {
  const { error } = await supabase
    .from("cms_blocks")
    .upsert({ key, data }, { onConflict: "key" });
  return !error;
}

// Birden fazla block kaydet
export async function saveCmsBlocks(
  blocks: { key: string; data: any }[]
): Promise<boolean> {
  const { error } = await supabase
    .from("cms_blocks")
    .upsert(blocks, { onConflict: "key" });
  return !error;
}

// Block sil
export async function deleteCmsBlock(key: string): Promise<boolean> {
  const { error } = await supabase.from("cms_blocks").delete().eq("key", key);
  return !error;
}
