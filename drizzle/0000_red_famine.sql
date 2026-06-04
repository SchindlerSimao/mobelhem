CREATE TABLE `scores` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`score` integer NOT NULL,
	`mode` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `words` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`country` text,
	`lat` text,
	`lng` text,
	`ikea_desc` text,
	`city_desc` text,
	`fun_fact` text NOT NULL
);
