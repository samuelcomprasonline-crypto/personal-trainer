import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { generateInviteCode, normalizeInviteCode, validateInvite } from '../domain/invite';
import type { StudentInvite, UserProfile, UserRole } from '../domain/types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AuthState = {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (params: {
    email: string;
    pass: string;
    name: string;
    role: UserRole;
    inviteCode?: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  enterDemoMode: (role: UserRole) => void;
  createInvite: (studentEmail: string, studentName?: string) => Promise<{ code?: string; error?: string }>;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const p: UserProfile = {
          id: data.id,
          email: data.email,
          role: data.role as UserRole,
          name: data.name,
          trainerId: data.trainer_id ?? undefined,
          brandColor: data.brand_color ?? '#C6F432',
          logoUrl: data.logo_url ?? undefined,
          phone: data.phone ?? undefined,
          createdAt: data.created_at,
        };
        setProfile(p);
        await AsyncStorage.setItem('@personal_trainer_user_profile', JSON.stringify(p));
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil do Supabase:', e);
    }
  };

  useEffect(() => {
    // 1. Tenta restaurar perfil localmente primeiro
    AsyncStorage.getItem('@personal_trainer_user_profile').then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setProfile(parsed);
          setUser({ id: parsed.id, email: parsed.email });
        } catch {}
      }
    });

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Obter sessão atual do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Ouvinte de mudanças no auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsDemo(false);
          await fetchProfile(session.user.id);
        } else if (!isDemo) {
          AsyncStorage.getItem('@personal_trainer_user_profile').then((raw) => {
            if (!raw) {
              setUser(null);
              setProfile(null);
            }
          });
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isDemo]);

  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não está configurado. Use o Modo Demonstração.' };
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    setLoading(false);

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      setIsDemo(false);
      const meta = data.user.user_metadata || {};
      const fallbackProf: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        role: (meta.role || 'trainer') as UserRole,
        name: meta.name || (email.split('@')[0]),
        trainerId: meta.trainer_id,
        brandColor: '#C6F432',
        createdAt: new Date().toISOString(),
      };
      setProfile(fallbackProf);
      try {
        await AsyncStorage.setItem('@personal_trainer_user_profile', JSON.stringify(fallbackProf));
      } catch {}
      await fetchProfile(data.user.id);
    }
    return {};
  };

  const signUp = async (params: {
    email: string;
    pass: string;
    name: string;
    role: UserRole;
    inviteCode?: string;
  }): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase não está configurado. Use o Modo Demonstração.' };
    }

    let linkedTrainerId: string | null = null;

    // Se aluno forneceu código de convite, validar antes
    if (params.role === 'student' && params.inviteCode?.trim()) {
      const normalized = normalizeInviteCode(params.inviteCode);
      const { data: inviteData, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', normalized)
        .eq('status', 'pending')
        .single();

      if (inviteError || !inviteData) {
        return { error: 'Código de convite inválido ou expirado.' };
      }

      const check = validateInvite(inviteData as unknown as StudentInvite);
      if (!check.valid) {
        return { error: 'Este convite não é mais válido.' };
      }

      linkedTrainerId = inviteData.trainer_id;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: params.email.trim(),
      password: params.pass,
      options: {
        data: {
          name: params.name.trim(),
          role: params.role,
          trainer_id: linkedTrainerId,
        },
      },
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    // Se usou convite, marcar como aceito
    if (linkedTrainerId && params.inviteCode) {
      await supabase
        .from('invites')
        .update({ status: 'accepted' })
        .eq('code', normalizeInviteCode(params.inviteCode));
    }

    if (data.user) {
      setUser(data.user);
      setIsDemo(false);
      const newProf: UserProfile = {
        id: data.user.id,
        email: data.user.email || params.email,
        role: params.role,
        name: params.name.trim(),
        trainerId: linkedTrainerId ?? undefined,
        brandColor: '#C6F432',
        createdAt: new Date().toISOString(),
      };
      setProfile(newProf);
      try {
        await AsyncStorage.setItem('@personal_trainer_user_profile', JSON.stringify(newProf));
      } catch {}
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: params.email,
          name: params.name.trim(),
          role: params.role,
          trainer_id: linkedTrainerId,
        });
      } catch {}
    }

    setLoading(false);
    return {};
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Erro ao deslogar no Supabase:', e);
    }
    try {
      await AsyncStorage.removeItem('@personal_trainer_user_profile');
    } catch {}
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  };

  const enterDemoMode = (role: UserRole) => {
    setIsDemo(true);
    const demoProf: UserProfile = {
      id: role === 'trainer' ? 'demo-trainer' : 'demo-student',
      email: role === 'trainer' ? 'personal@consultoria.com' : 'samuel@aluno.com',
      role,
      name: role === 'trainer' ? 'Helia Carriel Personal' : 'Samuel Ferreira',
      trainerId: role === 'student' ? 'demo-trainer' : undefined,
      brandColor: '#C6F432',
      createdAt: new Date().toISOString(),
    };
    setUser({ id: demoProf.id, email: demoProf.email });
    setProfile(demoProf);
    try {
      AsyncStorage.setItem('@personal_trainer_user_profile', JSON.stringify(demoProf));
    } catch {}
  };

  const createInvite = async (
    studentEmail: string,
    studentName?: string
  ): Promise<{ code?: string; error?: string }> => {
    if (!profile || profile.role !== 'trainer') {
      return { error: 'Apenas treinadores podem gerar convites.' };
    }

    const code = generateInviteCode('TREINO');

    if (!isSupabaseConfigured) {
      // Retorna código local no modo demo
      return { code };
    }

    const { error } = await supabase.from('invites').insert({
      trainer_id: profile.id,
      student_email: studentEmail.trim().toLowerCase(),
      student_name: studentName?.trim() || null,
      code,
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    });

    if (error) {
      return { error: error.message };
    }

    return { code };
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        profile,
        loading,
        isDemo,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        createInvite,
        refreshProfile,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  return ctx;
}
