<?php
/**
 * Meta provider
 * @package post
 * @version 0.0.1
 * @upgrade true
 */

namespace Post\Meta;

class Post
{
    static function index(){
        $dis = \Phun::$dispatcher;
        
        $page = $dis->req->getQuery('page', 1);
        
        $base_url   = $dis->router->to('siteHome');
        
        $meta_title = $dis->setting->post_index_meta_title;
        $meta_desc  = $dis->setting->post_index_meta_description;
        $meta_keys  = $dis->setting->post_index_meta_keywords;
        $meta_url   = $dis->router->to('sitePost');
        $meta_image = $base_url . 'theme/site/static/logo/500x500.png';
        
        if($page && $page > 1){
            $meta_title = sprintf('Page %s %s', $page, $meta_title);
            $meta_desc  = sprintf('Page %s %s', $page, $meta_desc);
            $meta_url   = $meta_url . '?page=' . $page;
        }
        
        $index = (object)[
            '_schemas' => [],
            '_metas'   => [
                'title'         => $meta_title,
                'canonical'     => $meta_url,
                'description'   => $meta_desc,
                'keywords'      => $meta_keys,
                'image'         => $meta_image,
                'type'          => 'website'
            ]
        ];
        
        // my rss feed?
        if(module_exists('robot'))
            $index->_metas['feed'] = $dis->router->to('sitePostFeed');
        
        // Schema
        $schema = [
            '@context'      => 'http://schema.org',
            '@type'         => 'CollectionPage',
            'name'          => $meta_title,
            'description'   => $meta_desc,
            'publisher'     => [
                '@type'         => 'Organization',
                'name'          => $dis->config->name,
                'url'           => $base_url,
                'logo'          => $meta_image
            ],
            'url'           => $meta_url,
            'image'         => $meta_image
        ];
        
        $index->_schemas[] = $schema;
        
        return $index;
    }
    
    static function single($post){
        $dis = \Phun::$dispatcher;
        
        $base_url = $dis->router->to('siteHome');
        
        $meta_desc  = $post->meta_description->safe;
        if(!$meta_desc && $post->content)
            $meta_desc = $post->content->chars(160);
        $meta_image = $post->cover;
        if(!$meta_image)
            $meta_image = $base_url . 'theme/site/static/logo/500x500.png';
        $meta_url   = $post->page;
        $meta_title = $post->meta_title;
        $meta_keys  = $post->meta_keywords;
        if($meta_title == '')
            $meta_title = $post->title;
            
        $page = $dis->req->getQuery('page', 1);
        if($page && $page > 1){
            $meta_title = sprintf('Page %s %s', $page, $meta_title);
            $meta_desc  = sprintf('Page %s %s', $page, $meta_desc);
            $meta_url   = $meta_url . '?page=' . $page;
        }
        
        // metas
        $single = (object)[
            '_schemas' => [],
            '_metas'   => [
                'title'         => $meta_title,
                'canonical'     => $meta_url,
                'description'   => $meta_desc,
                'keywords'      => $meta_keys,
                'image'         => $meta_image,
                'type'          => 'article',
                'updated_time'  => $post->updated->format('c'),
                'published_time'=> $post->published->format('c'),
                'article:author'=> $post->user->fullname
            ]
        ];
        
        if(module_exists('post-google-amphtml'))
            $single->_metas['amphtml'] = $dis->router->to('sitePostGoogleAmphtml', ['slug'=>$post->slug]);
        
        // schemas 
        if(!$post->schema_type)
            $post->schema_type = 'Article';
        
        $schema = [
            '@context'      => 'http://schema.org',
            '@type'         => $post->schema_type,
            'name'          => $post->title,
            'description'   => $meta_desc,
            'publisher'     => [
                '@type'         => 'Organization',
                'name'          => $dis->config->name,
                'url'           => $base_url,
                'logo'          => $base_url . 'theme/site/static/logo/500x500.png'
            ],
            'url'           => $meta_url,
            'image'         => $meta_image
        ];
        $single->_schemas[] = $schema;
        
        // schema breadcrumbs
        $second_item = [
            '@type' => 'ListItem',
            'position' => 2,
            'item' => [
                '@id' => $base_url . '#post',
                'name' => $dis->setting->post_index_meta_title
            ]
        ];
        
        if($dis->setting->post_index_enable){
            $second_item = [
                '@type' => 'ListItem',
                'position' => 2,
                'item' => [
                    '@id' => $dis->router->to('sitePost'),
                    'name' => $dis->setting->post_index_meta_title
                ]
            ];
        }
        
        $schema = [
            '@context'  => 'http://schema.org',
            '@type'     => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'item' => [
                        '@id' => $base_url,
                        'name' => $dis->config->name
                    ]
                ],
                $second_item
            ]
        ];
        
        $single->_schemas[] = $schema;
        
        return $single;
    }
}