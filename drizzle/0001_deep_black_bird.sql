CREATE TYPE "public"."employee_role" AS ENUM('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DRIVER');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "driver" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"license_number" text,
	"license_category" text,
	"license_expiry" timestamp,
	"safety_score" integer DEFAULT 100,
	"status" text DEFAULT 'ACTIVE',
	CONSTRAINT "driver_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"employee_code" text,
	"full_name" text NOT NULL,
	"phone" text,
	"role" "employee_role" DEFAULT 'DRIVER' NOT NULL,
	"status" "employee_status" DEFAULT 'ACTIVE' NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "employee_employee_code_unique" UNIQUE("employee_code")
);
--> statement-breakpoint
ALTER TABLE "driver" ADD CONSTRAINT "driver_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;