<?php
/**
 * Post controller
 * @package post
 * @version 0.0.1
 * @upgrade false
 */

namespace Post\Controller;
use Post\Meta\Post as _Post;
use Post\Model\Post as Post;
use Content\Library\Parser as Parser;

class PostController extends \SiteController
{
    public function indexAction(){
        // serve only if it's allowed to be served
        if(!$this->setting->post_index_enable)
            return $this->show404();
        
        $page = $this->req->getQuery('page', 1);
        $rpp  = 12;
        
        $cache= 60*60*24*7;
        if($page > 1 || is_dev())
            $cache = null;
        
        $posts = Post::get(['status'=>4], $rpp, $page, 'published DESC');
        if(!$posts)
            return $this->show404();
        
        $posts = \Formatter::formatMany('post', $posts, false, ['user']);
        $params = [
            'posts' => $posts,
            'index' => new \stdClass(),
            'pagination' => [],
            'total' => Post::count(['status'=>4])
        ];
        
        $params['index']->meta = _Post::index();
        
        // pagination
        if($params['total'] > $rpp)
            $params['pagination'] = calculate_pagination($page, $rpp, $params['total']);
        
        $this->respond('post/index', $params, $cache);
    }
    
    public function singleAction(){
        $slug = $this->param->slug;
        
        $post = Post::get(['slug'=>$slug, 'status'=>4], false);
        if(!$post){
            if(module_exists('slug-history'))
                $this->slug->goto('post', $slug, 'sitePostSingle');
            return $this->show404();
        }
        
        $page = $this->req->getQuery('page', 1);
        $rpp = 12;
        
        $cache = 60*60*24*7;
        if($page > 1 || is_dev())
            $cache = null;
        
        $post = \Formatter::format('post', $post, true);
        $post->meta = _Post::single($post);
        
        $content = Parser::parseContent($post->content->value);
        $post->content = new \Formatter\Object\Text($content);
        
        $comps = Parser::getComponents($content);
        
        // get embed component
        if($post->embed->html){
            $cps = Parser::getComponents($post->embed->embed);
            if($cps)
                $comps = array_merge($comps, $cps);
        }
        
        foreach($comps as $comp)
            $post->$comp = true;
        
        $params = [
            'post' => $post,
            'pagination' => [],
            'total' => 0
        ];
        
        $this->respond('post/single', $params, $cache);
    }
}