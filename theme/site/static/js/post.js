window.XPost = {
    _protocol: 'http',
    
    init: function(){
        XPost._protocol = location.protocol.replace(/:$/, '');
        XPost.stat.init();
        XPost.embed.init();
    },
    
    embed: {
        init: function(){
            var esl = 'iframe,.fb-video,.instagram-media,img,video';
            var els = $('[data-post="embed"],[data-post="content"]').find(esl);
            
            if(!els.length)
                return;
            
            els.each(function(i,e){
                var el = $(e);
                
                if(el.hasClass('fb-video'))
                    return XPost.embed.fbvideo(el);
                if(el.hasClass('instagram-media'))
                    return XPost.embed.igembed(el);
                
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
        
        iframe : function(el){
            var src = el.attr('src');
            
            // fix mixed protocol
            if(src.substr(0,4) == 'http'){
                src = src.replace(/^https?:/, '');
                el.attr('src', src);
            }
            
            if(/vidio/.test(src)){
                src = src.replace(/\?.+$/, '')+'?player_only=true&autoplay=false';
                el.attr('src', src);
                el.removeAttr('width');
                el.removeAttr('height');
                XPost.embed.general(el);
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
                $('body').append('<script src="//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6&appId='+appId+'" id="fbjs-sdk"></script>');
            }
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
                return $('body').append('<script id="igjs-embed" async defer src="//platform.instagram.com/en_US/embeds.js"></script>');
            
            var waitForIG = function(){
                if(!window.instgrm)
                    return setTimeout(waitForIG, 500);
                instgrm.Embeds.process();
            };
            
            setTimeout(waitForIG, 100);
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
    }
};

XPost.init();