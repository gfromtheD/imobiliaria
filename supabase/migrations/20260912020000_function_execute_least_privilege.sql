-- FUNCTION EXECUTE LEAST PRIVILEGE
--
-- Supabase provisioned explicit EXECUTE grants for anon and authenticated on
-- existing public functions. Remove those broad grants, then restore the
-- narrowly scoped authenticated RPC surface used by the product. Worker,
-- scheduler, trigger and Stripe functions remain service-role only.

revoke execute on all functions in schema public from anon, authenticated;
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
