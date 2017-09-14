$(function(){
    
    $('[data-post="content"]').each(function(i,e){
        var el = $(e);
        var width = el.innerWidth();
        
        // fix images
        el.find('img').each(function(i,img){
            var $img = $(img);
            $img.addClass('img-responsive');
            
            // can we resize them?
            var src = $img.attr('src');
            if(src.substr(0,4) == 'http')
                return;
            
            // resize it to fit the content
            newsize = '_' + width + 'x';
            src = src.replace(/\.([a-zA-Z]+)$/, newsize + '\.$1');
            $img.attr('src', src);
        });
    });
});