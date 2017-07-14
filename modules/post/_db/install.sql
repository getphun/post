INSERT IGNORE INTO `site_param` ( `name`, `type`, `group`, `value` ) VALUES
    ( 'post_index_enable', 4, 'Post', '0' ),
    ( 'post_index_meta_title', 1, 'Post', 'Posts' ),
    ( 'post_index_meta_description',  5, 'Post', 'List of posts' ),
    ( 'post_index_meta_keywords', 1, 'Post', '' );

CREATE TABLE IF NOT EXISTS `post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user` INTEGER NOT NULL,
    `publisher` INTEGER,
    -- 1 Draft
    -- 2 Editor
    -- 3 Scheduled
    -- 4 Published
    `status` TINYINT DEFAULT 1,
    `featured` BOOLEAN DEFAULT FALSE,
    `editor_pick` BOOLEAN DEFAULT FALSE,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL UNIQUE,
    `cover` VARCHAR(200),
    `cover_label` VARCHAR(200),
    `embed` TEXT,
    `source` TEXT,
    
    `schema_type` VARCHAR(50),
    `meta_title` VARCHAR(100),
    `meta_description` TEXT,
    `meta_keywords` VARCHAR(200),
    
    -- third modules
    `gallery` INTEGER,
    `canal` INTEGER,
    `vendor` INTEGER,
    
    `published` DATETIME,
    `updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `post_content` (
    `id` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `post` INTEGER NOT NULL UNIQUE,
    `content` TEXT
);

CREATE TABLE IF NOT EXISTS `post_statistic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `post` INTEGER NOT NULL UNIQUE,
    `views` INTEGER DEFAULT 0,
    `likes` INTEGER DEFAULT 0,
    `shares` INTEGER DEFAULT 0,
    `comments` INTEGER DEFAULT 0
);