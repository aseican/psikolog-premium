import { supabase } from "@/lib/supabase";

/**
 * THEME + HERO (cms_blocks)
 */
export async function getTheme() {
  const { data, error } = await supabase
    .from("cms_blocks")
    .select("data")
    .eq("key", "theme")
    .single();

  if (error) throw error;
  return data?.data ?? {};
}

export async function getHero() {
  const { data, error } = await supabase
    .from("cms_blocks")
    .select("data")
    .eq("key", "home.hero")
    .single();

  if (error) throw error;
  return data?.data ?? {};
}

export async function getHeroWords() {
  const hero = await getHero();
  const words = hero?.words ?? [];
  return Array.isArray(words) ? words : [];
}

/**
 * SERVICES
 */
export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort");

  if (error) throw error;
  return data ?? [];
}

/**
 * FAQS
 */
export async function getFaqs() {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort");

  if (error) throw error;
  return data ?? [];
}
