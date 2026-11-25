import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://wktwahnwmrmvdkpyzqtn.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '<PASTE_YOUR_FULL_sb_publishable_KEY_HERE>';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const hasConfiguredSupabaseKey =
  Boolean(supabaseKey) && !supabaseKey.includes('<PASTE_YOUR_FULL_sb_publishable_KEY_HERE>');
