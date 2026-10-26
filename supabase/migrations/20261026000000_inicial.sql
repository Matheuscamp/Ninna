-- Ninna: perfil da usuária, consentimentos LGPD e respostas da triagem.
-- Toda tabela com dado pessoal tem RLS: cada usuária só acessa as próprias linhas.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  perfil text check (perfil in ('tentante', 'suspeita', 'gestante', 'puerpera', 'acolhimento')),
  -- A idade gestacional é sempre calculada a partir da DUM, nunca salva fixa.
  dum date,
  dum_fonte text check (dum_fonte in ('dum', 'dpp', 'semanas')),
  primeira_gestacao boolean,
  cesarea_anterior boolean,
  perda_anterior boolean,
  alto_risco boolean,
  multipla boolean,
  pre_natal text check (pre_natal in ('sus', 'particular', 'nao_iniciou')),
  acompanhante text check (acompanhante in ('parceiro', 'familia', 'ninguem')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('dados_saude', 'termos_privacidade')),
  versao text not null,
  aceito_em timestamptz not null default now(),
  revogado_em timestamptz,
  unique (user_id, tipo, versao)
);

create table public.triage_answers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  perfil text not null,
  respostas jsonb not null,
  created_at timestamptz not null default now()
);

create index on public.consents (user_id);
create index on public.triage_answers (user_id, created_at desc);

-- Cria o perfil vazio quando a conta é criada, já com o nome do cadastro.
create function public.criar_perfil()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'nome');
  return new;
end;
$$;

create trigger ao_criar_usuaria
  after insert on auth.users
  for each row execute function public.criar_perfil();

create function public.tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.tocar_updated_at();

alter table public.profiles enable row level security;
alter table public.consents enable row level security;
alter table public.triage_answers enable row level security;

create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "perfil: atualizar o próprio" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "consentimento: ler os próprios" on public.consents
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "consentimento: registrar os próprios" on public.consents
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "consentimento: revogar os próprios" on public.consents
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "triagem: ler as próprias" on public.triage_answers
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "triagem: registrar as próprias" on public.triage_answers
  for insert to authenticated with check ((select auth.uid()) = user_id);
