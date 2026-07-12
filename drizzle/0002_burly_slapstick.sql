CREATE TYPE "public"."driver_status" AS ENUM('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('VAN', 'TRUCK', 'MINI');--> statement-breakpoint
ALTER TYPE "public"."employee_role" ADD VALUE 'DISPATCHER' BEFORE 'SAFETY_OFFICER';--> statement-breakpoint
CREATE TABLE "trip" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"start_location" text NOT NULL,
	"end_location" text NOT NULL,
	"distance_km" numeric(10, 2),
	"status" "trip_status" DEFAULT 'SCHEDULED' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" serial PRIMARY KEY NOT NULL,
	"reg_no" text NOT NULL,
	"name" text NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"capacity_kg" numeric(10, 2) NOT NULL,
	"odometer_km" numeric(12, 2) DEFAULT '0' NOT NULL,
	"acquisition_cost" numeric(14, 2) NOT NULL,
	"region" text,
	"status" "vehicle_status" DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_reg_no_unique" UNIQUE("reg_no")
);
--> statement-breakpoint
ALTER TABLE "driver" ALTER COLUMN "safety_score" SET DATA TYPE numeric(5, 2);--> statement-breakpoint
ALTER TABLE "driver" ALTER COLUMN "safety_score" SET DEFAULT '100';--> statement-breakpoint
ALTER TABLE "driver" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'::"public"."driver_status";--> statement-breakpoint
ALTER TABLE "driver" ALTER COLUMN "status" SET DATA TYPE "public"."driver_status" USING "status"::"public"."driver_status";--> statement-breakpoint
ALTER TABLE "driver" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_driver_id_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("id") ON DELETE no action ON UPDATE no action;