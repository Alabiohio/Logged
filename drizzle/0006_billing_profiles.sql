CREATE TABLE "billing_profiles" (
  "user_id" text PRIMARY KEY NOT NULL,
  "billing_type" text DEFAULT 'individual' NOT NULL,
  "full_name" text,
  "email" text,
  "phone" text,
  "company_name" text,
  "tax_id" text,
  "address_line_1" text,
  "address_line_2" text,
  "city" text,
  "region" text,
  "postal_code" text,
  "country" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_profiles"
  ADD CONSTRAINT "billing_profiles_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
  ON DELETE cascade ON UPDATE no action;
