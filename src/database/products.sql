CREATE TABLE `products` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT  PRIMARY KEY,
    `name` varchar(255) NOT NULL DEFAULT '',
    `amount` int UNSIGNED NOT NULL DEFAULT 0,
    `description` text, 
    `pre_order` int UNSIGNED NOT NULL DEFAULT 0,
    `price` int UNSIGNED NOT NULL DEFAULT 0
);

ADD COLUMN `price` INT UNSIGNED NOT NULL DEFAULT '0' AFTER `pre_order`, RENAME TO  `node_js_3rd_pay`.`products` ;