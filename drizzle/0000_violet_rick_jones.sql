CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "priority_valid" CHECK("tasks"."priority" IN ('baixa','media','alta')),
	CONSTRAINT "status_valid" CHECK("tasks"."status" IN ('pendente','concluida')),
	CONSTRAINT "title_length" CHECK(length(trim("tasks"."title")) BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE INDEX `tasks_owner_idx` ON `tasks` (`owner`);