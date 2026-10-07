import { isSupabaseConfigured, supabase } from '../supabase';

describe('Supabase Client Configuration', () => {
  it('should be configured with real project credentials', () => {
    expect(isSupabaseConfigured).toBe(true);
    expect(supabase).toBeDefined();
  });

  it('should have auth and database clients available', () => {
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.storage).toBeDefined();
  });
});
