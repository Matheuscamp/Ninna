-- Ninna: foto de perfil e ficha pessoal e de saúde.
-- Os campos ficam no perfil (a própria usuária edita, pela regra de RLS já existente).
-- A foto fica num bucket PRIVADO, na pasta da usuária, exibida só por links temporários.

alter table public.profiles
  add column if not exists foto_caminho text,
  add column if not exists data_nascimento date,
  add column if not exists tipo_sanguineo text check (tipo_sanguineo in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  add column if not exists peso_kg numeric(4, 1) check (peso_kg between 30 and 250),
  add column if not exists altura_cm smallint check (altura_cm between 100 and 230),
  add column if not exists alergias text check (char_length(alergias) <= 300),
  add column if not exists medicamentos text check (char_length(medicamentos) <= 300),
  add column if not exists emergencia_nome text check (char_length(emergencia_nome) <= 80),
  add column if not exists emergencia_parentesco text check (char_length(emergencia_parentesco) <= 40),
  -- Só dígitos, com DDD: 10 (fixo) ou 11 (celular).
  add column if not exists emergencia_telefone text check (emergencia_telefone ~ '^[0-9]{10,11}$');

-- A foto precisa estar na pasta da própria dona.
alter table public.profiles
  add constraint profiles_foto_na_propria_pasta check (foto_caminho is null or foto_caminho like id::text || '/%');

-- Bucket privado das fotos: só imagens, até 2 MB (o app reduz para ~100 KB antes de enviar).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "avatares: ver a própria foto" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatares: enviar na própria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatares: apagar a própria foto" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = (select auth.uid())::text);
