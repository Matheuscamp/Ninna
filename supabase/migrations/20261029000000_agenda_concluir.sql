-- Ninna: a usuária marca a consulta como concluída (e pode desmarcar).
-- Antes, uma consulta virava "realizada" só porque a data passou.
alter table public.appointments add column if not exists concluida_em timestamptz;

-- Marcar como concluída é uma edição: garante a regra de edição caso a
-- migração 20261028000000_agenda_editar.sql ainda não tenha sido rodada.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'appointments' and policyname = 'agenda: editar as próprias'
  ) then
    create policy "agenda: editar as próprias" on public.appointments
      for update to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end;
$$;
