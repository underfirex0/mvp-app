import { createClient } from "@supabase/supabase-js";

// Anon key only -- read-only by design (see rls_fix.sql). Never put the
// service-role key in this app; that one belongs only to the Cloud Run
// pipeline and must never reach client-side code.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
