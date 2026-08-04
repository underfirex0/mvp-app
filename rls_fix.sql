-- Run this in Supabase SQL editor BEFORE connecting the Next.js viewer.
-- companies_v2 currently has no RLS policy at all -- meaning the public
-- anon key can both read AND write to it right now. This locks it to
-- read-only for anon/authenticated, writes stay restricted to the
-- service-role key (which the pipeline uses, never exposed client-side).

ALTER TABLE companies_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read access" ON companies_v2
  FOR SELECT USING (true);

CREATE POLICY "public read access" ON taxonomy
  FOR SELECT USING (true);

CREATE POLICY "public read access" ON company_taxonomy
  FOR SELECT USING (true);

-- company_field_sources / merge_decisions / company_contacts already have
-- RLS enabled from schema.sql with no policies -- meaning nothing can read
-- them via the anon key yet. The "sources breakdown" view in the app needs
-- read access too:

CREATE POLICY "public read access" ON company_field_sources
  FOR SELECT USING (true);

-- Confirm: this grants READ only. No INSERT/UPDATE/DELETE policy exists for
-- anon/authenticated on any of these tables -- the pipeline's writes still
-- go through the service-role key, which bypasses RLS entirely and is
-- unaffected by any of this.
