<?php
/**
 * Post statistic controller
 * @package post
 * @version 0.0.1
 * @upgrade false
 */

namespace Post\Controller;

class StatController extends \SiteController
{
    public function logAction(){
        $post   = trim($this->req->getQuery('id'));
        $action = trim($this->req->getQuery('action'));
        
        if(!$post || !$action)
            return $this->show404();
        
        $actions = [
            'view'     => 1,
            'share'    => 2,
            'like'     => 3,
            'comment'  => 4
        ];
        if(!isset($actions[$action]))
            return $this->show404();
        
        $action = $actions[$action];
        
        $file = BASEPATH . '/etc/post/statistic/' . $post;
        $f = fopen($file, 'a');
        fwrite($f, "$action\n");
        fclose($f);
        
        $this->ajax(['data'=>'tengkiyu']);
    }
}