REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.activity_log FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.customers TO service_role;
GRANT ALL ON public.activity_log TO service_role;

REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated;
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated;