import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// .env nahi bhara to app crash nahi hogi, "Setup needed" screen dikhegi
export const isConfigured = Boolean(url && key && !url.includes("YOUR-PROJECT"));

export const supabase = isConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export const BUCKET = "product-images";
