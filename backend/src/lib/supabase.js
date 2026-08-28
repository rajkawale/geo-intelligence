import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Service-role client: used only by jobs and the read API, never in the browser.
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'geoi' } }
);
