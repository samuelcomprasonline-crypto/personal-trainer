import { createClient } from '@supabase/supabase-js';

// URL e Chave Pública Anon do Projeto "personal-trainer" no Supabase (sa-east-1)
const SUPABASE_PROJECT_URL = 'https://xdeskqyyfposaaoefrci.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZXNrcXl5ZnBvc2Fhb2VmcmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzU2MDMsImV4cCI6MjEwNjkxMTYwM30.6qiwvEYjU6XerxfZIyWkjinmWmAzm5raGf6ttfltwVQ';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
