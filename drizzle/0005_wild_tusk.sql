CREATE TABLE `projectDbTables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`tableName` varchar(100) NOT NULL,
	`schema` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectDbTables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`path` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`fileType` varchar(50),
	`isGenerated` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`type` enum('landing','webapp','api') NOT NULL DEFAULT 'webapp',
	`status` enum('draft','building','running','stopped','error') NOT NULL DEFAULT 'draft',
	`port` int,
	`pid` int,
	`dbSchema` varchar(100),
	`config` json,
	`buildLog` text,
	`lastError` text,
	`publicUrl` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
