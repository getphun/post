<?php
/**
 * Robot provider
 * @package post
 * @version 0.0.1
 * @upgrade true
 */

namespace Post\Library;
use Post\Model\Post as Post;

class Robot
{
    static function _getPosts(){
        // get all posts that is updated last 2 days
        $last2days = date('Y-m-d H:i:s', strtotime('-2 days'));
        
        $posts = Post::get([
            'updated >= :updated AND status = 4',
            'bind' => [
                'updated' => $last2days
            ]
        ], true);
        
        if(!$posts)
            return false;
        
        return \Formatter::formatMany('post', $posts, false, ['category', 'user', 'content']);
    }
    
    static function feed(){
        $result = [];
        
        $posts = self::_getPosts();
        
        if(!$posts)
            return $result;
            
        foreach($posts as $post){
            $desc = $post->meta_description->safe;
            if(!$desc)
                $desc = $post->content->chars(250);
            
             $row = (object)[
                'author'      => hs($post->user->fullname),
                'description' => $desc,
                'page'        => $post->page,
                'published'   => $post->created->format('c'),
                'updated'     => $post->updated->format('c'),
                'title'       => $post->title->safe
            ];
            if(isset($post->category) && $post->category){
                $row->categories = [];
                foreach($post->category as $cat)
                    $row->categories[] = $cat->name;
            }
            $result[] = $row;
        }
        
        return $result;
    }
    
    static function sitemap(){
        $result = [];
        
        $posts = self::_getPosts();
        
        if(!$posts)
            return $result;
        
        $last_update = null;
        foreach($posts as $post){
            $result[] = (object)[
                'url'       => $post->page,
                'lastmod'   => $post->updated->format('Y-m-d'),
                'changefreq'=> 'yearly',
                'priority'  => 0.8
            ];
            
            if(is_null($last_update))
                $last_update = $post->updated;
            elseif($last_update < $post->updated)
                $last_update = $post->updated;
        }
        
        $dis = \Phun::$dispatcher;
        if($dis->setting->post_index_enable){
            $result[] = (object)[
                'url'       => $dis->router->to('sitePost'),
                'lastmod'   => $last_update->format('Y-m-d'),
                'changefreq'=> 'hourly',
                'priority'  => 0.3
            ];
        }
        
        return $result;
    }
}