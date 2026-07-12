CREATE TABLE "fuel_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"liters" numeric(10, 2) NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "revenue" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "toll_cost" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "other_cost" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "fuel_log" ADD CONSTRAINT "fuel_log_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE no action ON UPDATE no action;