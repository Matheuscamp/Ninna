-- Ninna: painel da usuária (agenda, progresso dos guias e exclusão da conta).

create table public.appointments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 80),
  data_hora timestamptz not null,
  local text check (char_length(local) <= 80),
  observacoes text check (char_length(observacoes) <= 300),
  created_at timestamptz not null default now()
);

create index on public.appointments (user_id, data_hora);

-- Tarefas marcadas como feitas no guia da semana. A chave identifica a tarefa
-- no conteúdo do app (ex.: "f1-consulta"), então o texto pode mudar sem perder o progresso.
create table public.task_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  tarefa text not null check (char_length(tarefa) <= 60),
  feita_em timestamptz not null default now(),
  primary key (user_id, tarefa)
);

alter table public.appointments enable row level security;
alter table public.task_progress enable row level security;

create policy "agenda: ler as próprias" on public.appointments
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "agenda: criar as próprias" on public.appointments
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "agenda: apagar as próprias" on public.appointments
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "tarefas: ler as próprias" on public.task_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "tarefas: marcar as próprias" on public.task_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tarefas: desmarcar as próprias" on public.task_progress
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Exclusão da conta pela própria usuária (LGPD). Apagar o usuário em auth.users
-- apaga em cascata o perfil, consentimentos, triagens, agenda e progresso.
create function public.excluir_minha_conta()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticada';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
