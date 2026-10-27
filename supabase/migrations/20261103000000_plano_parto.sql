-- Ninna: plano de parto (recurso Premium).
-- Um plano por usuária, com as respostas em jsonb (id da pergunta → resposta);
-- as perguntas ficam no app (src/content/plano-parto.ts).
-- Dado de saúde: cada usuária só acessa o próprio plano.

create table public.planos_de_parto (
  user_id uuid primary key references auth.users (id) on delete cascade,
  respostas jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now(),
  -- Limite de tamanho, para ninguém gravar um documento gigante pela API.
  constraint respostas_tamanho check (pg_column_size(respostas) < 20000)
);

alter table public.planos_de_parto enable row level security;

create policy "plano de parto: ler o próprio" on public.planos_de_parto
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "plano de parto: criar o próprio" on public.planos_de_parto
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "plano de parto: editar o próprio" on public.planos_de_parto
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "plano de parto: apagar o próprio" on public.planos_de_parto
  for delete to authenticated using ((select auth.uid()) = user_id);
