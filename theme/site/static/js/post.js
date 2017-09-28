window.XPost = {
    
    content: function(){
        var content = $('[data-post="content"]');
        if(!content.get(0))
            return;
        
        content.find('img').each(function(i,e){
            XPost.fixImage($(e), content.width());
        });
        
        content.find('iframe').each(function(i,e){
            XPost.fixEmbed($(e));
        });
    },
    
    coverEmbed: function(){
        var embed = $('[data-post="embed"]');
        if(!embed.get(0))
            return;
        
        var sels = ['.fb-video', '.dailymail-video', 'iframe'];
        for(var i=0; i<sels.length; i++){
            var emb = embed.children(sels[i]);
            if(emb.get(0))
                XPost.fixEmbed(emb);
        }
    },
    
    fixEmbed: function(embed){
        
        if(embed.hasClass('leave-me-alone'))
            return;
        
        // fb video
        if(embed.hasClass('fb-video')){
            if(screen.width > 400){
                var size = embed.data('size');
                if(size){
                    var sizes = size.split('x');
                    var width = sizes[0];
                    var height= sizes[1];
                    if(height > width){
                        var cheight = Math.round((el.width()/16)*9);
                        var nwidth  = Math.round((height * width) / cheight);
                        embed.attr('data-width', nwidth);
                    }
                }
            }
            
            XPost.fbjs.init();
        
        // general iframe
        }else if(embed.prop('tagName').toLowerCase() == 'iframe'){
            var iwidth  = parseInt(embed.attr('width'));
            var iheight = parseInt(embed.attr('height'));
            var isrc    = embed.attr('src');
            
            embed.removeAttr('width');
            embed.removeAttr('height');
            
            var parent = $('<div></div>');
            
            if(/youtube|youtu\.be/.test(isrc)){
                parent.addClass('embed-responsive embed-responsive-16by9');
            }else{
                if(!iwidth || !iheight){
                    parent.addClass('embed-responsive embed-responsive-16by9');
                }else{
                    embed.css({width:'100%',height:'100%',position:'absolute',left:0,top:0});
                    parent.css({position:'relative',width:'100%'});
                    var percent = ( iheight / iwidth ) * 100;
                    parent.css('padding-bottom', percent + '%');
                }
            }
            
            embed.before(parent);
            parent.append(embed);
        }
    },
    
    fixImage: function(img, maxw){
        img.addClass('img-responsive');
        
        // can we resize them?
        var src = img.attr('src');
        if(src.substr(0,4) == 'http')
            return;
        
        // resize it to fit the content
        newsize = '_' + maxw + 'x';
        src = src.replace(/\.([a-zA-Z]+)$/, newsize + '\.$1');
        img.attr('src', src);
    },
    
    init: function(){
        XPost.stat();
        XPost.coverEmbed();
        XPost.content();
        
        // TODO
        // Event listener for FB:share, FB:like, FB:comment
    },
    
    stat: function(){
        var logged = sessionStorage.getItem('p'+POST.id);
        if(POST.id && !logged){
            sessionStorage.setItem('p'+POST.id, '1');
            $.get(POST.stat,{id:POST.id, action:'view'});
        }
    },
    
    fbjs: {
        included: false,
        init: function(){
            if(XPost.fbjs.included)
                return;
            XPost.fbjs.included = true;
            
            if($('#fbjs-sdk').get(0))
                return;
            
            var appId = $('meta[property="fb:app_id"]').prop('content') || '';
            $('body').append('<script src="//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6&appId='+appId+'"></script>');
        }
    },
    
    igjs: {
        included: false,
        init: function(){
            if(XPost.igjs.included)
                false;
            XPost.igjs.included = true;
            
            if($('#igjs-embed').get(0))
                return;
            $('body').append('<script id="igjs-embed" async defer src="//platform.instagram.com/en_US/embeds.js"></script>');
        }
    }
};

XPost.init();