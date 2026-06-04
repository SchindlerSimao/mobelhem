CREATE TABLE `words_new` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL UNIQUE,
	`type` text NOT NULL CHECK(type IN ('ikea', 'city', 'both')),
	`country` text CHECK(country IS NULL OR country IN ('SE', 'NO', 'DK', 'FI')),
	`lat` text,
	`lng` text,
	`ikea_desc` text,
	`city_desc` text,
	`fun_fact` text NOT NULL
);

CREATE TABLE `scores_new` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`score` integer NOT NULL CHECK(score >= 0 AND score <= 10000),
	`mode` text NOT NULL CHECK(mode IN ('classic', 'time_attack', 'multiplayer')),
	`created_at` integer
);

-- Copy data from old tables
INSERT INTO words_new SELECT * FROM words;
INSERT INTO scores_new SELECT * FROM scores;

-- Drop old tables
DROP TABLE words;
DROP TABLE scores;

-- Rename new tables
ALTER TABLE words_new RENAME TO words;
ALTER TABLE scores_new RENAME TO scores;

-- Create indexes
CREATE INDEX `words_type_idx` on `words` (`type`);
CREATE INDEX `words_country_idx` on `words` (`country`);
CREATE INDEX `words_name_idx` on `words` (`name`);
CREATE INDEX `scores_mode_score_idx` on `scores` (`mode`, `score`);
CREATE INDEX `scores_created_at_idx` on `scores` (`created_at`);
CREATE INDEX `scores_username_idx` on `scores` (`username`);
