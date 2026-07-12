CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"depot_name" text DEFAULT 'TransitOps Main Depot' NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"distance_unit" text DEFAULT 'Kilometers' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
