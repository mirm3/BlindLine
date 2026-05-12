-- Explicit privileges for authenticated role
grant usage on schema public to authenticated;
grant select, insert, update on public.trip_request to authenticated;
grant select, insert, update on public.matches to authenticated;
grant select on public.users to authenticated;
grant select, insert, update on public.volunteer_profile to authenticated;
