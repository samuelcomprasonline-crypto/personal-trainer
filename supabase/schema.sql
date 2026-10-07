-- SCHEMA INICIAL DO PERSONAL TRAINER

-- 1. TABELA DE ALUNOS
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'ativo',
    avatar_url TEXT,
    monthly_fee NUMERIC(10,2) DEFAULT 250.00,
    billing_due_day INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE AVALIAÇÕES FÍSICAS (BIOIMPEDÂNCIA, FOTOS E MEDIDAS)
CREATE TABLE IF NOT EXISTS public.assessments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    peso_kg NUMERIC(6,2),
    altura_cm NUMERIC(6,2),
    perc_gordura NUMERIC(5,2),
    massa_muscular_kg NUMERIC(6,2),
    agua_total_kg NUMERIC(6,2),
    gordura_visceral INT,
    bmr_kcal INT,
    imc NUMERIC(5,2),
    massa_gorda_kg NUMERIC(6,2),
    data_bioimpedance JSONB,
    data_skinfolds JSONB,
    data_circumferences JSONB,
    photos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE LOGS DE EXECUÇÃO DE TREINO
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    week_n INT DEFAULT 1,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    rpe INT,
    mood TEXT,
    sets JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 4. TABELA DE TRANSAÇÕES FINANCEIRAS & FLUXO DE CAIXA
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    product_id TEXT,
    product_title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    due_date TEXT NOT NULL,
    paid_at TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    pix_key TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE CONFIGURAÇÕES DO TREINADOR (CHAVE PIX, PRODUTOS, PERFIL)
CREATE TABLE IF NOT EXISTS public.trainer_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    name TEXT NOT NULL DEFAULT 'Samuel Ferreira',
    cref TEXT DEFAULT '012345-G/SP',
    pix_key TEXT DEFAULT 'samuel.ferreira@treinador.com',
    pix_key_type TEXT DEFAULT 'E-mail',
    phone TEXT DEFAULT '(11) 99999-8888',
    email TEXT DEFAULT 'samuel.ferreira@treinador.com',
    products JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS COM POLÍTICAS PÚBLICAS/AUTENTICADAS INICIAIS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso aberto para o cliente Supabase anon (com autenticação em camada de app)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public full access students" ON public.students;
    CREATE POLICY "Public full access students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access assessments" ON public.assessments;
    CREATE POLICY "Public full access assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access workout_logs" ON public.workout_logs;
    CREATE POLICY "Public full access workout_logs" ON public.workout_logs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access financial" ON public.financial_transactions;
    CREATE POLICY "Public full access financial" ON public.financial_transactions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access trainer_settings" ON public.trainer_settings;
    CREATE POLICY "Public full access trainer_settings" ON public.trainer_settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- BUCKET DE ARMAZENAMENTO PARA FOTOS DE AVALIAÇÃO
INSERT INTO storage.buckets (id, name, public)
VALUES ('assessment-photos', 'assessment-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- POLÍTICAS DE ACESSO AO BUCKET
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read storage assessment-photos" ON storage.objects;
    CREATE POLICY "Public read storage assessment-photos" ON storage.objects FOR SELECT USING (bucket_id = 'assessment-photos');

    DROP POLICY IF EXISTS "Public insert storage assessment-photos" ON storage.objects;
    CREATE POLICY "Public insert storage assessment-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assessment-photos');
END $$;
