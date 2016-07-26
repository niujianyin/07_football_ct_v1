// renderLazyContent
util.renderLazyContent = (function (require, exports, module) {
    var $ = jQuery;
    var WebP = util.webp;

    var rendered = '__hasRendered__';
    var name = 'data-textarea';
    return function(wrap){
        wrap = $(wrap);
        if(!wrap.length){
            return;
        }
        if(wrap.data(rendered)){
            return;
        }
        var textarea = $('[node-type='+name+']',wrap);
        if(textarea.length){
            textarea.after(textarea.val());
            textarea.remove();
        }

          var imgs = $('img[data-src]',wrap);
        WebP.isSupport(function() {
          imgs.each(function() {
            var item = $(this);
            var src = item.attr('data-src');
            if (src) {
              if (WebP && WebP.get) {
                src = WebP.get(src);
              }
              item.attr('src', src);
              item.removeAttr('data-src');
            }
          });
        });

        wrap.data(rendered,true);
    };
})();