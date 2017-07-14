<?php
/**
 * post model
 * @package post
 * @version 0.0.1
 * @upgrade true
 */

namespace Post\Model;

class Post extends \Model
{
    public $table = 'post';
    public $q_field = 'title';
    
    static $chained = [
        'category'  => ['post-category', 'PostCategory\\Model\\PostCategoryChain'],
        'tag'       => ['post-tag',      'PostTag\\Model\\PostTagChain']
    ];
    
    static function getX($cond, $total=12, $page=1, $order='id DESC'){
        $sql = 'SELECT `post`.* FROM `post`';
        
        foreach($cond as $field => $value){
            if(!isset(Post::$chained[$field])){
                $cond['post.'.$field] = $value;
                unset($cond[$field]);
            }
        }
        
        // filter by chains
        foreach(Post::$chained as $field => $opt){
            if(!isset($cond[$field]))
                continue;
            $model = $opt[1];
            $module= $opt[0];
            
            $obj_id = $cond[$field];
            unset($cond[$field]);
            if(!module_exists($module))
                continue;
            
            $table = $model::getTable();
            $cond["$table.post_$field"] = $obj_id;
            $sql.= " LEFT JOIN `$table` ON `$table`.`post` = `post`.`id`";
        }
        
        $sql.= ' WHERE :where';
        $sql = Post::putWhere($sql, $cond);
        
        if($order)
            $sql.= ' ORDER BY ' . $order;
        
        if($total === false){
            $sql.= ' LIMIT 1';
        }elseif(is_numeric($total)){
            $sql.= ' LIMIT :limit';
            $offset = 0;
            
            if(is_numeric($page)){
                $page--;
                $offset = $page * $total;
                $sql.= ' OFFSET :offset';
            }
            
            $sql = Post::putValue($sql, [
                'limit' => $total,
                'offset'=> $offset
            ]);
        }
        
        $row = Post::query($sql);
        
        return $row;
    }
    
    static function countX($cond){
        $sql = 'SELECT COUNT(*) AS `total` FROM `post`';
        
        foreach($cond as $field => $value){
            if(!isset(Post::$chained[$field])){
                $cond['post.'.$field] = $value;
                unset($cond[$field]);
            }
        }
        
        // filter by chains
        foreach(Post::$chained as $field => $opt){
            if(!isset($cond[$field]))
                continue;
            $model = $opt[1];
            $module= $opt[0];
            
            $obj_id = $cond[$field];
            unset($cond[$field]);
            if(!module_exists($module))
                continue;
            
            $table = $model::getTable();
            $cond["$table.post_$field"] = $obj_id;
            $sql.= " LEFT JOIN `$table` ON `$table`.`post` = `post`.`id`";
        }
        
        $sql.= ' WHERE :where';
        $sql = Post::putWhere($sql, $cond);
        
        $row = Post::query($sql);
        if(!$row)
            return 0;
        return $row[0]->total;
    }
}