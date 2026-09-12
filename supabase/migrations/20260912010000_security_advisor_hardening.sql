-- SECURITY ADVISOR HARDENING
--
-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default. These RPCs
-- are SECURITY DEFINER and include worker and billing operations, so PUBLIC
-- must not retain that implicit access. Keep only the authenticated product
-- RPCs and the trusted service_role execution paths.

revoke execute on all functions in schema public from public;

grant execute on all functions in schema public to service_role;

grant execute on function public.current_org_id() to authenticated;
grant execute on function public.cancel_generation(uuid) to authenticated;
grant execute on function public.retry_generation(uuid) to authenticated;
grant execute on function public.create_generation(uuid, uuid, uuid, jsonb) to authenticated;
grant execute on function public.create_room(uuid, text, text, text) to authenticated;
grant execute on function public.create_room_image(uuid, text) to authenticated;
grant execute on function public.update_room(uuid, text, text) to authenticated;
grant execute on function public.finalize_room_upload(uuid, text) to authenticated;
grant execute on function public.finalize_room_image_upload(uuid, text) to authenticated;
grant execute on function public.prepare_room_image_deletion(uuid) to authenticated;
grant execute on function public.complete_room_image_deletion(uuid) to authenticated;
grant execute on function public.prepare_room_deletion(uuid) to authenticated;
grant execute on function public.complete_room_deletion(uuid) to authenticated;
grant execute on function public.delete_property(uuid) to authenticated;

-- Same authenticated-user semantics, but evaluate the JWT once per query
-- rather than once per candidate row.
alter policy "users: update self" on public.users
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and organization_id = public.current_org_id()
  );
