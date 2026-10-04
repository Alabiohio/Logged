CREATE TABLE "user_billing_preferences" (
  "user_id" text PRIMARY KEY NOT NULL,
  "payg_enabled" boolean DEFAULT true NOT NULL,
  "payg_spending_limit" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_billing_preferences" ADD CONSTRAINT "user_billing_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "user_billing_preferences" ("user_id", "payg_enabled", "payg_spending_limit", "created_at", "updated_at")
SELECT "user_id", "payg_enabled", "payg_spending_limit", "created_at", "updated_at"
FROM "subscriptions"
ON CONFLICT ("user_id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "payg_enabled";
--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "payg_spending_limit";
