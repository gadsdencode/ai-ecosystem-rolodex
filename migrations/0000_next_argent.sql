CREATE TABLE "ai_tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[] NOT NULL,
	"notes" text,
	"icon_color" text DEFAULT 'blue' NOT NULL,
	"date_added" timestamp DEFAULT now() NOT NULL,
	"date_modified" timestamp DEFAULT now() NOT NULL,
	"provider" text DEFAULT 'third-party' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
