$(function(){
    
    $('[data-post="content"]').each(function(i,e){
        var el = $(e);
        var elWidth = el.innerWidth();
        
        // fix images
        el.find('img').each(function(i,img){
            var $img = $(img);
            $img.addClass('img-responsive');
            
            // can we resize them?
            var src = $img.attr('src');
            if(src.substr(0,4) == 'http')
                return;
            
            // resize it to fit the content
            newsize = '_' + elWidth + 'x';
            src = src.replace(/\.([a-zA-Z]+)$/, newsize + '\.$1');
            $img.attr('src', src);
        });
        
        // fix iframes
        el.find('iframe').each(function(i,ifr){
            var $ifr  = $(ifr);
            if($ifr.hasClass('leave-me-alone'))
                return;
            
            var iwidth  = parseInt($ifr.attr('width'));
            var iheight = parseInt($ifr.attr('height'));
            var isrc    = $ifr.attr('src');
            
            $ifr.removeAttr('width');
            $ifr.removeAttr('height');
            
            var parent = $('<div></div>');
            
            if(/youtube|youtu\.be/.test(isrc)){
                parent.addClass('embed-responsive embed-responsive-16by9');
            }else{
                if(!iwidth || !iheight){
                    parent.addClass('embed-responsive embed-responsive-16by9');
                }else{
                    $ifr.css({width:'100%',height:'100%',position:'absolute',left:0,top:0});
                    parent.css({position:'relative',width:'100%'});
                    var percent = ( iheight / iwidth ) * 100;
                    parent.css('padding-bottom', percent + '%');
                }
            }
            
            $ifr.before(parent);
            parent.append($ifr);
        });
    });
    
    $('[data-post="embed"]').each(function(i,e){
        var el = $(e);
        
        // fix facebook video vertical on desktop browser
        var fbvs = el.find('.fb-video');
        if(fbvs.length && screen.width > 400){
            var size = fbvs.data('size');
            if(size){
                var sizes = size.split('x');
                var width = sizes[0];
                var height= sizes[1];
                if(height > width){
                    var cheight = Math.round((el.width()/16)*9);
                    var nwidth  = Math.round((height * width) / cheight);
                    fbvs.attr('data-width', nwidth);
                }
            }
        }
    });
    
    if($('.fb-video').get(0) && !$('#fbjs-sdk').get(0)){
        var appId = $('meta[property="fb:app_id"]').prop('content');
        $('body').append('<script src="//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6&appId='+(appId||'')+'"></script>');
    }
    
    // logger
    var logged = sessionStorage.getItem('p'+POST.id);
    if(POST.id && !logged){
        sessionStorage.setItem('p'+POST.id, '1');
        $.get(POST.stat,{id:POST.id, action:'view'});
    }
    
    // TODO
    // Event listener for FB:share, FB:like, FB:comment
});