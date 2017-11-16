<?php
/**
 * Post statistic controller
 * @package post
 * @version 0.0.1
 * @upgrade false
 */

namespace Post\Controller;
use Post\Model\PostStatistic as PStatistic;

class StatController extends \SiteController
{
    private $log_dir = '/etc/post/statistic/';
    
    public function counterAction(){
        $base  = BASEPATH . $this->log_dir;
        $files = array_diff(scandir($base), ['.','..','.gitkeep']);
        if(!$files)
            deb('No log file to calculate');
        
        $file_info = [];
        foreach($files as $file)
            $file_info[$file] = filectime($base . $file);
        
        $actions = [
            1   => 'views',
            2   => 'shares',
            3   => 'likes',
            4   => 'comments'
        ];
        
        asort($file_info);
        $len = 0;
        foreach($file_info as $post => $created){
            $ctn = file_get_contents($base . $post);
            $ctn = explode("\n", $ctn);
            $ctn = array_count_values($ctn);
            
            $fields = [];
            foreach($ctn as $id => $ttl){
                if(!$id || !isset($actions[$id]))
                    continue;
                $fields[ $actions[$id] ] = $ttl;
            }
            
            unlink($base . $post);
            
            // check if its not yet on db
            if(!($old=PStatistic::get(['post'=>$post], false))){
                $fields['post'] = $post;
                PStatistic::create($fields);
            }else{
                foreach($fields as $field => $ttl)
                    PStatistic::inc($field, ['post'=>$post], $ttl);
            }
            
            deb('Awesome ' . $post);
        }
    }
    
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
        
        $file = BASEPATH . $this->log_dir . $post;
        $f = fopen($file, 'a');
        fwrite($f, "$action\n");
        fclose($f);
        
        $this->ajax(['data'=>'tengkiyu']);
    }
}