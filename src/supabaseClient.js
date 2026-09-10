import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ozzllcrwercjrwgvklpn.supabase.co";
const SUPABASE_KEY = "sb_publishable_8R13y7_TffjBQqn0ZqYUDg_eqPes7Na";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export function productModelUrl(glbPath) {
  if (!glbPath) return null;
  return supabase.storage.from("models").getPublicUrl(glbPath).data.publicUrl;
}

export function formatCents(cents) {
  return "R$ " + ((cents || 0) / 100).toFixed(2).replace(".", ",");
}

export function waLink(number, text) {
  return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
}
