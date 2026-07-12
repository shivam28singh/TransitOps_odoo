ALTER TABLE "trip" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trip" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
DROP TYPE "public"."trip_status";--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "trip" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."trip_status";--> statement-breakpoint
ALTER TABLE "trip" ALTER COLUMN "status" SET DATA TYPE "public"."trip_status" USING "status"::"public"."trip_status";--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "cargo_weight_kg" numeric(10, 2);