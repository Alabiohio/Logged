ALTER TABLE "plans" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "payg_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE "plans"
SET "sort_order" = CASE
  WHEN "name" = 'free' THEN 0
  WHEN "name" = 'plus' THEN 1
  ELSE "sort_order"
END;
--> statement-breakpoint
UPDATE "plans"
SET "payg_enabled" = CASE
  WHEN (SELECT "value" FROM "settings" WHERE "key" = 'payg_allowed_plans' LIMIT 1) = 'free_plus'
    THEN true
  WHEN "name" = 'plus'
    THEN true
  ELSE false
END;