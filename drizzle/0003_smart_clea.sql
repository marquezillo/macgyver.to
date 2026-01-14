CREATE TABLE `memories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('preference','fact','context','instruction') NOT NULL,
	`content` text NOT NULL,
	`source` enum('manual','auto') NOT NULL DEFAULT 'auto',
	`sourceChatId` int,
	`importance` int NOT NULL DEFAULT 5,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memories_id` PRIMARY KEY(`id`)
);
