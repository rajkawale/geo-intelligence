import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null until the Supabase project + keys are wired. The dashboard falls back
// to mock data when this is null, so the demo works with no backend.
export const supabase = url && anon ? createClient(url, anon) : null;
