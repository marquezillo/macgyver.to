CREATE TABLE `folders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20) DEFAULT 'gray',
	`icon` varchar(50) DEFAULT 'folder',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chats` ADD `folderId` int;--> statement-breakpoint
ALTER TABLE `chats` ADD `isFavorite` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `theme` enum('light','dark','system') DEFAULT 'light' NOT NULL;