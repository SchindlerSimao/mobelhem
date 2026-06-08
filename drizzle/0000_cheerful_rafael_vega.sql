CREATE TABLE `scores` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`score` integer NOT NULL,
	`mode` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `scores_mode_score_idx` ON `scores` (`mode`,`score`);--> statement-breakpoint
CREATE INDEX `scores_created_at_idx` ON `scores` (`created_at`);--> statement-breakpoint
CREATE INDEX `scores_username_idx` ON `scores` (`username`);--> statement-breakpoint
CREATE TABLE `words` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`country` text,
	`lat` text,
	`lng` text,
	`city_desc` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `words_name_unique` ON `words` (`name`);--> statement-breakpoint
CREATE INDEX `words_type_idx` ON `words` (`type`);--> statement-breakpoint
CREATE INDEX `words_country_idx` ON `words` (`country`);--> statement-breakpoint
CREATE INDEX `words_name_idx` ON `words` (`name`);