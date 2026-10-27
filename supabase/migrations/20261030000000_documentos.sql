-- Ninna: Central de Documentos de Saúde.
-- Arquivos ficam num bucket PRIVADO do Supabase Storage, na pasta {id da usuária}/.
-- As informações (nome, categoria, datas) ficam na tabela health_documents.
-- Nada é público: abrir e baixar usam links assinados que expiram em segundos.

-- 1. Bucket privado, com tipos e tamanho validados pelo próprio Storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2. Cada usuária só enxerga, envia e apaga arquivos na própria pasta.
create policy "documentos: ler os próprios arquivos" on storage.objects
  for select to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "documentos: enviar na própria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "documentos: apagar os próprios arquivos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 3. Informações dos documentos.
create table public.health_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  categoria text not null check (categoria in ('exames_laboratoriais', 'exames_imagem', 'vacinas', 'consultas', 'receitas', 'outros')),
  descricao text check (char_length(descricao) <= 500),
  data_documento date,
  profissional text check (char_length(profissional) <= 120),
  caminho text not null unique,
  tipo_mime text not null check (tipo_mime in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  tamanho integer not null check (tamanho > 0 and tamanho <= 10485760),
  nome_original text not null check (char_length(nome_original) <= 255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- O arquivo precisa estar na pasta da própria dona.
  check (caminho like user_id::text || '/%')
);

create index on public.health_documents (user_id, created_at desc);
create index on public.health_documents (user_id, categoria);
create index on public.health_documents (user_id, data_documento);

create trigger health_documents_updated_at
  before update on public.health_documents
  for each row execute function public.tocar_updated_at();

alter table public.health_documents enable row level security;

create policy "documentos: ler os próprios" on public.health_documents
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "documentos: registrar os próprios" on public.health_documents
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "documentos: editar os próprios" on public.health_documents
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "documentos: apagar os próprios" on public.health_documents
  for delete to authenticated using ((select auth.uid()) = user_id);
