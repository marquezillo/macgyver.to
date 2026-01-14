CREATE TABLE `formSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chatId` int,
	`formSectionId` varchar(100),
	`country` varchar(50),
	`landingIdentifier` varchar(255),
	`formData` json NOT NULL,
	`status` enum('pending','processed','refunded') NOT NULL DEFAULT 'pending',
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `formSubmissions_id` PRIMARY KEY(`id`)
);
