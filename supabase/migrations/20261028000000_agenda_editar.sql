-- Ninna: permite que a usuária edite as próprias consultas da agenda.
create policy "agenda: editar as próprias" on public.appointments
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
