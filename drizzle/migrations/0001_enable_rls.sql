-- The app connects with the DATABASE_URL role, which bypasses RLS.
-- Enabling RLS with no policies closes these tables to the Supabase Data API.
ALTER TABLE "sales" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "scrape_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "stores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
-- Added in the Supabase dashboard before migrations tracked it
DROP POLICY IF EXISTS "Allow public read on sales" ON "sales";--> statement-breakpoint
DROP POLICY IF EXISTS "Allow public read on stores" ON "stores";--> statement-breakpoint
-- Already created in the Supabase dashboard; the 0000 snapshot missed it
CREATE INDEX IF NOT EXISTS "idx_sales_store_id" ON "sales" USING btree ("store_id");
