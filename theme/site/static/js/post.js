window.XPost = {
    
    init: function(){
        XPost.stat.init();
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