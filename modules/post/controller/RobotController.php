<?php
/**
 * Post robot provider
 * @package post
 * @version 1.0.0
 */

namespace Post\Controller;
use Post\Library\Robot;

class RobotController extends \SiteController
{
    public function feedAction(){
        if(!module_exists('robot'))
            return $this->show404();
        
        $feed_host   = $this->setting->post_index_enable ? 'sitePost' : 'siteHome';
        
        $feed = (object)[
            'url'         => $this->router->to('sitePostFeed'),
            'description' => hs($this->setting->post_index_meta_description),
            'updated'     => null,
            'host'        => $this->router->to($feed_host),
            'title'       => hs($this->setting->post_index_meta_title)
        ];
        
        $pages = Robot::feed();
        $this->robot->feed($feed, $pages);
    }
}