-- ========================================================================
-- SCHEMA OFICIAL SUPABASE — PLATAFORMA PERSONAL TRAINER & CONSULTORIA
-- Suporte completo a Bioimpedância (Unique Health), Dobras Cutâneas e Treinos
-- ========================================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIO (Treinadores e Alunos)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null check (role in ('trainer', 'student')),
  name text not null,
  trainer_id uuid references public.profiles(id) on delete set null,
  brand_color text default '#8C6A4F',
  logo_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para profiles
alter table public.profiles enable row level security;

create policy "Usuário pode visualizar seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário pode atualizar seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Aluno pode visualizar o perfil de seu treinador"
  on public.profiles for select
  using (id in (select trainer_id from public.profiles where id = auth.uid()));

create policy "Treinador pode visualizar os perfis de seus alunos"
  on public.profiles for select
  using (trainer_id = auth.uid());

create policy "Treinador pode inserir novos alunos vinculados"
  on public.profiles for insert
  with check (trainer_id = auth.uid() or id = auth.uid());

-- 2. TABELA DE AVALIAÇÕES FÍSICAS (Bioimpedância Unique Health + Dobras)
create table if not exists public.physical_assessments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  trainer_id uuid references public.profiles(id) on delete cascade not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Armazenamento JSONB estruturado de alta fidelidade
  bioimpedance jsonb,    -- Todos os dados clínicos e segmentares da balança
  skinfolds jsonb,       -- Protocolo de dobras cutâneas (Pollock 7 / 3)
  circumferences jsonb,  -- Perímetros corporais
  notes text,            -- Parecer e recomendações do profissional
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para physical_assessments
alter table public.physical_assessments enable row level security;

create policy "Aluno pode visualizar suas próprias avaliações físicas"
  on public.physical_assessments for select
  using (student_id = auth.uid());

create policy "Treinador pode visualizar e gerenciar avaliações de seus alunos"
  on public.physical_assessments for all
  using (trainer_id = auth.uid());

-- 3. BIBLIOTECA DE EXERCÍCIOS
create table if not exists public.exercises (
  id text primary key,
  trainer_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  movement_pattern text not null,
  primary_muscle text not null,
  equipment text not null,
  load_increment numeric not null default 2.5,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exercises enable row level security;

create policy "Todos autenticados podem ver exercícios globais e de seus treinadores"
  on public.exercises for select
  using (trainer_id is null or trainer_id = auth.uid() or trainer_id in (select trainer_id from public.profiles where id = auth.uid()));

create policy "Treinador pode gerenciar seus exercícios personalizados"
  on public.exercises for all
  using (trainer_id = auth.uid());

-- 4. ALTERNATIVAS DE EXERCÍCIOS
create table if not exists public.exercise_alternatives (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.profiles(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete cascade,
  alternative_id text not null references public.exercises(id) on delete cascade
);

alter table public.exercise_alternatives enable row level security;

create policy "Acesso a alternativas de exercícios"
  on public.exercise_alternatives for select
  using (trainer_id is null or trainer_id = auth.uid() or trainer_id in (select trainer_id from public.profiles where id = auth.uid()));

-- 5. MODELOS DE PERIODIZAÇÃO (TEMPLATES)
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  weeks integer not null default 4,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.template_sessions (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.templates(id) on delete cascade not null,
  position integer not null,
  name text not null
);

create table if not exists public.template_items (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.template_sessions(id) on delete cascade not null,
  exercise_id text references public.exercises(id) on delete cascade not null,
  position integer not null,
  sets integer not null,
  rep_min integer not null,
  rep_max integer not null,
  rest_s integer not null default 90,
  weekly_increment_kg numeric not null default 2.5
);

alter table public.templates enable row level security;
alter table public.template_sessions enable row level security;
alter table public.template_items enable row level security;

create policy "Treinador pode gerenciar seus templates"
  on public.templates for all using (trainer_id = auth.uid());

create policy "Treinador gerencia suas sessões de template"
  on public.template_sessions for all
  using (template_id in (select id from public.templates where trainer_id = auth.uid()));

create policy "Treinador gerencia itens de template"
  on public.template_items for all
  using (session_id in (select ts.id from public.template_sessions ts join public.templates t on ts.template_id = t.id where t.trainer_id = auth.uid()));

-- 6. ATRIBUIÇÃO DE PLANO AO ALUNO (ASSIGNMENTS)
create table if not exists public.assignments (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.templates(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.assignment_items (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  template_item_id uuid references public.template_items(id) on delete cascade not null,
  base_load_kg numeric not null default 0,
  overridden boolean not null default false,
  overrides jsonb
);

alter table public.assignments enable row level security;
alter table public.assignment_items enable row level security;

create policy "Aluno e treinador acessam assignments"
  on public.assignments for all
  using (student_id = auth.uid() or template_id in (select id from public.templates where trainer_id = auth.uid()));

create policy "Aluno e treinador acessam assignment_items"
  on public.assignment_items for all
  using (assignment_id in (select id from public.assignments where student_id = auth.uid() or template_id in (select id from public.templates where trainer_id = auth.uid())));

-- 7. REGISTRO DE EXECUÇÃO DE TREINO (LOGS)
create table if not exists public.session_logs (
  id text primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  template_session_id text not null,
  week_n integer not null,
  completed_at timestamp with time zone not null,
  rpe integer,
  mood text check (mood in ('low', 'ok', 'great')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.set_logs (
  id uuid default gen_random_uuid() primary key,
  session_log_id text references public.session_logs(id) on delete cascade not null,
  exercise_id text not null,
  set_n integer not null,
  reps integer not null,
  load_kg numeric not null,
  substituted_from text
);

alter table public.session_logs enable row level security;
alter table public.set_logs enable row level security;

create policy "Aluno gerencia seus próprios logs"
  on public.session_logs for all using (student_id = auth.uid());

create policy "Treinador pode visualizar logs de seus alunos"
  on public.session_logs for select
  using (student_id in (select id from public.profiles where trainer_id = auth.uid()));

create policy "Aluno e treinador acessam set_logs"
  on public.set_logs for all
  using (session_log_id in (select id from public.session_logs where student_id = auth.uid() or student_id in (select id from public.profiles where trainer_id = auth.uid())));

-- 8. ÍNDICES DE ALTA PERFORMANCE
create index if not exists idx_profiles_trainer on public.profiles(trainer_id);
create index if not exists idx_assessments_student on public.physical_assessments(student_id, date desc);
create index if not exists idx_session_logs_student on public.session_logs(student_id, completed_at desc);
create index if not exists idx_set_logs_session on public.set_logs(session_log_id);

-- 9. TABELA DE CONVITES DE ALUNOS
create table if not exists public.invites (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.profiles(id) on delete cascade not null,
  student_email text not null,
  student_name text,
  code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.invites enable row level security;

create policy "Treinador pode gerenciar seus convites"
  on public.invites for all
  using (trainer_id = auth.uid());

create policy "Consulta de convites por código"
  on public.invites for select
  using (status = 'pending');

create index if not exists idx_invites_code on public.invites(code);
create index if not exists idx_invites_trainer on public.invites(trainer_id);

-- 10. TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE AO REGISTRAR NO AUTH
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, name, trainer_id, brand_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case 
      when new.raw_user_meta_data->>'trainer_id' is not null and new.raw_user_meta_data->>'trainer_id' <> '' 
      then (new.raw_user_meta_data->>'trainer_id')::uuid 
      else null 
    end,
    coalesce(new.raw_user_meta_data->>'brand_color', '#8C6A4F')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

