<?php
/**
 * Post events
 * @package post
 * @version 0.0.1
 * @upgrade false
 */

namespace Post\Event;

class PostEvent{
    
    static function general($object, $old=null){
        $dis = \Phun::$dispatcher;
        
        $page = $dis->router->to('siteHome');
        $dis->cache->removeOutput($page);
        
        $page = $dis->router->to('sitePost');
        $dis->cache->removeOutput($page);
        
        $page = $dis->router->to('sitePostSingle', ['slug'=>$object->slug]);
        $dis->cache->removeOutput($page);
        
        if($old){
            $page = $dis->router->to('sitePostSingle', ['slug'=>$old->slug]);
            $dis->cache->removeOutput($page);
        }
    }
    
    static function created($object){
        self::general($object);
    }
    
    static function updated($object, $old=null){
        self::general($object, $old);
    }
    
    static function deleted($object){
        self::general($object);
    }
}