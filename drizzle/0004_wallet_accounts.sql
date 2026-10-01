CREATE TABLE "wallet_accounts" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "balance" integer DEFAULT 0 NOT NULL,
  "currency" text DEFAULT 'NGN' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
  "id" text PRIMARY KEY NOT NULL,
  "wallet_id" text NOT NULL,
  "user_id" text NOT NULL,
  "type" text NOT NULL,
  "amount" integer NOT NULL,
  "balance_before" integer NOT NULL,
  "balance_after" integer NOT NULL,
  "currency" text DEFAULT 'NGN' NOT NULL,
  "status" text NOT NULL,
  "provider" text,
  "provider_reference" text,
  "idempotency_key" text NOT NULL,
  "metadata" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_accounts" ADD CONSTRAINT "wallet_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallet_accounts_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet_accounts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_accounts_user_id_idx" ON "wallet_accounts" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_transactions_idempotency_idx" ON "wallet_transactions" USING btree ("idempotency_key");
--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_transactions_provider_reference_idx" ON "wallet_transactions" USING btree ("provider_reference");
