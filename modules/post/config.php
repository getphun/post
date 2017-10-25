<?php
/**
 * post config file
 * @package post
 * @version 0.0.1
 * @upgrade true
 */

return [
    '__name' => 'post',
    '__version' => '0.0.1',
    '__git' => 'https://github.com/getphun/post',
    '__files' => [
        'modules/post/_db'          => [ 'install', 'remove', 'update' ],
        'modules/post/config.php'   => [ 'install', 'remove', 'update' ],
        'modules/post/model'        => [ 'install', 'remove', 'update' ],
        'modules/post/library'      => [ 'install', 'remove', 'update' ],
        'modules/post/meta'         => [ 'install', 'remove', 'update' ],
        'modules/post/controller/RobotController.php'   => [ 'install', 'remove', 'update' ],
        'modules/post/controller/StatController.php'    => [ 'install', 'remove', 'update' ],
        
        'theme/site/static/js/post.js'      => [ 'install', 'remove', 'update' ],
        'theme/site/static/js/post.min.js'  => [ 'install', 'remove', 'update' ],
        
        'modules/post/event'                            => [ 'install', 'remove' ],
        'modules/post/controller/PostController.php'    => [ 'install', 'remove' ],
        'theme/site/post/index.phtml'                   => [ 'install', 'remove' ],
        'theme/site/post/single.phtml'                  => [ 'install', 'remove' ],
        'etc/post/statistic'                            => [ 'install', 'remove' ]
    ],
    '__dependencies' => [
        'site-param',
        'formatter',
        'site',
        'site-meta',
        '/db-mysql',
        '/robot',
        '/slug-history'
    ],
    '_services' => [],
    '_autoload' => [
        'classes' => [
            'Post\\Model\\Post'                 => 'modules/post/model/Post.php',
            'Post\\Model\\PostContent'          => 'modules/post/model/PostContent.php',
            'Post\\Model\\PostStatistic'        => 'modules/post/model/PostStatistic.php',
            'Post\\Controller\\RobotController' => 'modules/post/controller/RobotController.php',
            'Post\\Controller\\PostController'  => 'modules/post/controller/PostController.php',
            'Post\\Controller\\StatController'  => 'modules/post/controller/StatController.php',
            'Post\\Library\\Robot'              => 'modules/post/library/Robot.php',
            'Post\\Meta\\Post'                  => 'modules/post/meta/Post.php',
            'Post\\Event\\PostEvent'            => 'modules/post/event/PostEvent.php'
        ],
        'files' => []
    ],
    '_routes' => [
        'site' => [
            'sitePostFeed' => [
                'rule'      => '/post/feed.xml',
                'handler'   => 'Post\\Controller\\Robot::feed'
            ],
            'sitePostSingle' => [
                'rule'      => '/post/read/:slug',
                'handler'   => 'Post\\Controller\\Post::single'
            ],
            'sitePost' => [
                'rule'      => '/post',
                'handler'   => 'Post\\Controller\\Post::index'
            ],
            
            'sitePostStatistic' => [
                'rule'      => '/post/stat',
                'handler'   => 'Post\\Controller\\Stat::log'
            ]
        ]
    ],
    'formatter' => [
        'post' => [
            'title' => 'text',
            'updated' => 'date',
            'created' => 'date',
            'published' => 'date',
            'user' => [
                'type' => 'object',
                'model' => 'User\\Model\\User',
                'format' => 'user'
            ],
            'publisher' => [
                'type' => 'object',
                'model' => 'User\\Model\\User',
                'format' => 'user'
            ],
            'page' => [
                'type' => 'router',
                'params' => [
                    'for' => 'sitePostSingle'
                ]
            ],
            'meta_title' => 'text',
            'meta_description' => 'text',
            'featured' => 'boolean',
            'editor_pick' => 'boolean',
            'cover' => 'media',
            'embed' => 'embed',
            'content' => [
                'type' => 'partial',
                'model' => 'Post\\Model\\PostContent',
                'object' => 'post',
                'field' => [
                    'name' => 'content',
                    'type' => 'text'
                ]
            ],
            'statistic' => [
                'type'   => 'partial',
                'model'  => 'Post\\Model\\PostStatistic',
                'object' => 'post'
            ]
        ]
    ],
    'events' => [
        'post:created' => [
            'post' => 'Post\\Event\\PostEvent::created'
        ],
        'post:updated' => [
            'post' => 'Post\\Event\\PostEvent::updated'
        ],
        'post:deleted' => [
            'post' => 'Post\\Event\\PostEvent::deleted'
        ]
    ],
    'robot' => [
        'sitemap' => [
            'post' => 'Post\\Library\\Robot::sitemap'
        ],
        'feed' => [
            'post' => 'Post\\Library\\Robot::feed'
        ]
    ]
];