window.XPost = {
    _protocol: 'http',
    
    init: function(){
        XPost._protocol = location.protocol.replace(/:$/, '');
        XPost.stat.init();
        XPost.embed.init();
    },
    
    embed: {
        init: function(){
            var esl = [
                    '.fb-post',
                    '.fb-video',
                    '.g-post',
                    '.instagram-media',
                    '.twitter-tweet',
                    'iframe',
                    'img',
                    'video'
                ].join(',');
            var els = $('[data-post="embed"],[data-post="content"]').find(esl);
            
            if(!els.length)
                return;
            
            els.each(function(i,e){
                var el = $(e);
                
                if(el.hasClass('fb-post'))
                    return XPost.embed.fbpost(el);
                if(el.hasClass('fb-video'))
                    return XPost.embed.fbvideo(el);
                if(el.hasClass('g-post'))
                    return XPost.embed.gpembed(el);
                if(el.hasClass('instagram-media'))
                    return XPost.embed.igembed(el);
                if(el.hasClass('twitter-tweet'))
                    return XPost.embed.twembed(el);
                
                var tagName = el.prop('tagName').toLowerCase();
                if(tagName == 'img')
                    return XPost.embed.image(el);
                if(tagName == 'video')
                    return XPost.embed.video(el);
                if(tagName == 'iframe')
                    return XPost.embed.iframe(el);
            });
        },
        
        general: function(el){
            var parent = el.parent();
            if(parent.hasClass('embed-responsive'))
                return;
            
            var width = parseInt(el.attr('width'));
            var height= parseInt(el.attr('height'));
            
            if(!width || !height){
                parent = $('<div class="embed-responsive embed-responsive-16by9"></div>');
            }else{
                parent = $('<div style="background-color:black;width:100%;position:relative;text-align:center;"></div>');
                el.css({width:'100%',height:'100%',position:'absolute',left:0,top:0});
                var percent = ( height / width ) * 100;
                parent.css('padding-bottom', percent + '%');
            }
            
            if(el.prop('tagName').toLowerCase() == 'iframe'){
                el.attr('frameborder', 0);
                el.removeAttr('width');
                el.removeAttr('height');
            }
            
            el.before(parent);
            el.appendTo(parent);
        },
        
        fbvideo: function(el){
            el.attr('class', 'fb-videox');
            var index = XPost.fb.els.length;
            XPost.fb.els.push({el:el, done:false});
            if(screen.width < 400)
                return XPost.fb.init(index);
            
            var size  = el.data('size');
            if(!size)
                return XPost.fb.init(index);
            
            var sizes = size.split('x');
            var width = parseInt(sizes[0]);
            var height= parseInt(sizes[1]);
            if(width > height)
                return XPost.fb.init(index);
            
            var parent = $('<div style="background-color:black;text-align:center;"></div>');
            el.attr('data-width', 320);
            el.before(parent);
            el.appendTo(parent);
            XPost.fb.init(index);
        },
        
        fbpost: function(el){
            el.attr('class', 'fb-postx');
            var index = XPost.fb.els.length;
            XPost.fb.els.push({el:el, done:false});
            return XPost.fb.init(index);
        },
        
        gpembed: function(el){
            el.attr('class', 'g-postx');
            var index = XPost.gp.els.length;
            XPost.gp.els.push({el:el, done:false});
            return XPost.gp.init(index);
        },
        
        iframe : function(el){
            var src = el.attr('src');
            
            // fix mixed protocol
            if(src.substr(0,4) == 'http'){
                src = src.replace(/^https?:/, '');
                el.attr('src', src);
            }
            
            // youtube
            if(/youtu\.?be/.test(src)){
                el.removeAttr('width');
                el.removeAttr('height');
                
            // vidio
            }else if(/vidio/.test(src)){
                src = src.replace(/\?.+$/, '')+'?player_only=true&autoplay=false';
                el.attr('src', src);
                el.removeAttr('width');
                el.removeAttr('height');
                XPost.embed.general(el);
            }
            
            // instagram
            var rema = src.match(/instagram\.com\/p\/([^\/]+)/);
            if(rema){
                var uri = location.protocol+'//www.instagram.com/p/'+rema[1]+'/';
                var div = $('<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-version="7"><a href="'+uri+'" target="_blank"></a></blockquote>');
                el.before(div);
                el.remove();
                return XPost.embed.igembed(div);
            }
            
            // facebook video
            var rema = src.match(/video\.php\?href=([^&]+)/);
            if(rema){
                var uri = decodeURIComponent(rema[1]);
                var elW = el.attr('width') || '854';
                var elH = el.attr('height')|| '400';
                var size= elW+'x'+elH;
                var div = $('<div class="fb-video" data-allowfullscreen="true" data-href="'+uri+'" data-show-text="false" data-size="'+size+'" data-width="auto"></div>');
                el.before(div);
                el.remove();
                return XPost.embed.fbvideo(div);
            }
            
            // facebook post
            var rema = src.match(/post\.php\?href=([^&]+)/);
            if(rema){
                var uri = decodeURIComponent(rema[1]);
                var div = $('<div class="fb-post" data-href="'+uri+'" data-show-text="true" data-width="auto"></div>');
                el.before(div);
                el.remove();
                return XPost.embed.fbpost(div);
            }
            
            XPost.embed.general(el);
        },
        
        igembed: function(el){
            el.attr('class', 'instagram-mediax');
            var index = XPost.ig.els.length;
            XPost.ig.els.push({el:el, done:false});
            
            if(screen.width < 400){
                el.css({width: el.parent().width()});
                return XPost.ig.init(index);
            }
            
            var parent = $('<div style="text-align:center;"></div>');
            el.before(parent);
            el.appendTo(parent);
            el.css({display: 'inline-block'});
            
            $.ajax({
                url: 'https://api.instagram.com/oembed/?url='+el.find('a').attr('href'),
                cache: true,
                dataType: 'jsonp',
                success: function(res){
                    var width = res.thumbnail_width;
                    var height= res.thumbnail_height;
                    
                    if(width == height)
                        el.css({width: 450});
                    else if(width > height)
                        el.css({width: el.parent().width()});
                    else 
                        el.css({width: 320});
                    
                    XPost.ig.init(index);
                }
            });
        },
        
        image  : function(el){
            el.addClass('img-responsive');
            var src = el.attr('src');
            if(src.substr(0,4) == 'http')
                return;
            var w = el.parent().width();
            src = '/'+src.replace(/^[.\/]+/,'');
            src = src.replace(/\.([\w]{3,4})$/, '_'+w+'x.$1');
            el.attr('src', src);
        },
        
        twembed: function(el){
            el.attr('class', 'twitter-tweetx');
            var index = XPost.tw.els.length;
            XPost.tw.els.push({el:el, done:false});
            XPost.tw.init(index);
        },
        
        video  : function(el){
            XPost.embed.general(el);
        },
    },
    
    fb: {
        els: [],
        init: function(index){
            XPost.fb.els[index].done = true;
            
            var alldone = true;
            for(var i=0; i<XPost.fb.els.length; i++){
                if(!XPost.fb.els[i].done)
                    return;
            }
            
            for(var i=0; i<XPost.fb.els.length; i++){
                var el  = XPost.fb.els[i].el;
                var cls = el.attr('class');
                XPost.fb.els[i].el.attr('class', cls.replace(/x$/, ''));
            }

            if(!$('#fbjs-sdk').get(0)){
                var appId = $('meta[property="fb:app_id"]').prop('content') || '';
                $('body').append('<script id="fbjs-sdk" src="//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6&appId='+appId+'"></script>');
            }
        }
    },
    
    gp: {
        els: [],
        init: function(index){
            XPost.gp.els[index].done = true;
            
            var alldone = true;
            for(var i=0; i<XPost.gp.els.length; i++){
                if(!XPost.gp.els[i].done)
                    return;
            }
            
            for(var i=0; i<XPost.gp.els.length; i++){
                var el  = XPost.gp.els[i].el;
                var cls = el.attr('class');
                XPost.gp.els[i].el.attr('class', cls.replace(/x$/, ''));
            }

            if(!$('#google-sdk').get(0))
                $('body').append('<script id="google-sdk" src="//apis.google.com/js/platform.js" async defer></script>');
        }
    },
    
    ig: {
        els: [],
        init: function(index){
            XPost.ig.els[index].done = true;
            
            var alldone = true;
            for(var i=0; i<XPost.ig.els.length; i++){
                if(!XPost.ig.els[i].done)
                    return;
            }
            
            for(var i=0; i<XPost.ig.els.length; i++){
                var el  = XPost.ig.els[i].el;
                var cls = el.attr('class');
                XPost.ig.els[i].el.attr('class', cls.replace(/x$/, ''));
            }
            
            if(!$('#igjs-embed').get(0))
                return $('body').append('<script id="igjs-embed" src="//platform.instagram.com/en_US/embeds.js" async defer></script>');
            
            var waitForIG = function(){
                if(!window.instgrm)
                    return setTimeout(waitForIG, 500);
                instgrm.Embeds.process();
            };
            
            setTimeout(waitForIG, 100);
        }
    },
    
    tw: {
        els: [],
        init: function(index){
            XPost.tw.els[index].done = true;
            
            var alldone = true;
            for(var i=0; i<XPost.tw.els.length; i++){
                if(!XPost.tw.els[i].done)
                    return;
            }
            
            for(var i=0; i<XPost.tw.els.length; i++){
                var el  = XPost.tw.els[i].el;
                var cls = el.attr('class');
                XPost.tw.els[i].el.attr('class', cls.replace(/x$/, ''));
            }
            
            if(!$('#twjs-embed').get(0))
                return $('body').append('<script id="twjs-embed" src="https://platform.twitter.com/widgets.js" async charset="utf-8"></script>');
        }
    },
    
    stat: {
        init: function(){
            var logged = sessionStorage.getItem('p'+POST.id);
            if(POST.id && !logged){
                sessionStorage.setItem('p'+POST.id, '1');
                $.get(POST.stat,{id:POST.id, action:'view'});
            }
        }
    },
    
    share: function(target){
        switch(target){
            case 'facebook':
                var href = 'https://www.facebook.com/sharer/sharer.php?u='+location.href;
                window.open(href,'facebook-share', 'width=580,height=296');
                break;
            case 'twitter':
                var href = 'https://twitter.com/share?text='+location.href;
                window.open(href, 'twitter-share', 'width=550,height=235');
                break;
            case 'gplus':
                var href = 'https://plus.google.com/share?url='+location.href;
                window.open(href, 'googleplus-share', 'width=490,height=530');
                break;
        }
        
        return false;
    }
};

XPost.init();