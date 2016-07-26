// layer
util.layer = (function(require, exports, module) {
  var queryToJson = util.queryToJson;

  var renderLazyContent = util.renderLazyContent;


  var currentObj = {};
  var hideTimer = null;
  var attrName = 'layer-type';
  var eventType = 'click';
  var hasTouch = (typeof (window.ontouchstart) !== 'undefined');
  if (hasTouch) {
    eventType = 'touchstart';
  }
  var getData = function(wrap){
    if (!wrap || wrap.length === 0) {
      return {};
    }
    // 选中时的css类
    var defaults = {
      clz:'selected',
      position:''
    };
    var data = queryToJson(wrap.attr('layer-data') || '');
    return $.extend(true,{},defaults,data);
  };
  var showByEle = function(ele) {
    clearTimeout(hideTimer);
    hide();
    if (!ele || ele.length === 0) {
      return;
    }
    var index = 0;
    var wrap = ele.parents('[' + attrName + '=layer-wrap]').eq(0);
    var navs = $('[' + attrName + '=layer-nav]',wrap);
    var conts = $('[' + attrName + '=layer-cont]',wrap);
    // 选中时的css类
    var config = getData(wrap);
    var clz = config.clz;
    var position = config.position;


    if (wrap.length === 0) {
      wrap = $(body);
    }
    if (navs.length != conts.length) {
      return;
    }
    if(ele.attr(attrName)==='layer-nav'){
      index = navs.index(ele);
    }else{
      index = conts.index(ele);
    }
    var nav = navs.eq(index);
    var cont = conts.eq(index);
    nav.addClass(clz);



    // 有时浮层不需要定位
    if(position !== 'no'){
      // 1.默认箭头和浮层都居中

      // 浮层left:触发器left - 浮层宽/2 + 触发器宽/2
      var arrow = $('['+attrName+'=arrow]',cont);

      // 保存初始marginLeft
      var contMarginLeft = 0;
      var arrowMarginLeft = 0;
      if(!cont.data('marginLeft')){
        contMarginLeft = parseFloat(cont.css('marginLeft'));
        arrowMarginLeft = parseFloat(arrow.css('marginLeft'));
        cont.data('marginLeft',contMarginLeft);
        arrow.data('marginLeft',arrowMarginLeft);
      }else{
        contMarginLeft = cont.data('marginLeft');
        arrowMarginLeft = arrow.data('marginLeft');
      }


      var contWidth = cont.outerWidth();
      var left = nav.position().left-contWidth/2+nav.outerWidth()/2;

      // 箭头left:浮层宽/2- 箭头宽/2
      var arrowLeft = contWidth/2-arrow.outerWidth()/2;

      // 2.left不能小于wrap的最左侧，加上宽后不能大于wrap的最右侧，需要调整
      var maxLeft = wrap.outerWidth() - contWidth;
      var maxLeftWithMargin = maxLeft - contMarginLeft;
      if(left<0){
        arrowLeft +=left;
        left = 0;
        contMarginLeft = 0;
        arrowMarginLeft = 0;
      }else if(left>maxLeftWithMargin){
        arrowLeft += left - maxLeft ;
        left = maxLeft;
        contMarginLeft = 0;
        arrowMarginLeft = 0;
      }

      cont.css({
        left:left,
        marginLeft:contMarginLeft
      });
      arrow.css({
        left:arrowLeft,
        marginLeft:arrowMarginLeft
      });
    }

    cont.stop().slideDown(200);

    renderLazyContent(cont);

    currentObj = {
      nav:nav,
      cont:cont
    };
    nav.data('display',true);
  };
  var hide = function(time){

    if(!currentObj.nav || !currentObj.cont){
      return;
    }
    var wrap = currentObj.nav.parents('[' + attrName + '=layer-wrap]').eq(0);
    var nav = currentObj.nav;
    var cont = currentObj.cont;
    // 选中时的css类
    var clz = getData(wrap).clz;
    if(time){
      hideTimer = setTimeout(function(){
        nav.removeClass(clz);
        cont.stop().slideUp(200);
      }, time||0);
    }else{
      nav.removeClass(clz);
      cont.stop().slideUp(200);
    }
    nav.data('display',false);
  };

  var self = this;
  var body = $('body');
  if(!body.data('layer-init')){


    if(hasTouch){
      body.on(eventType, '[' + attrName + '=layer-nav]', function(e) {
        var item = $(this);
        if(item.data('display')){
          hide();
        }else{
          showByEle($(this));
        }
        e.preventDefault();
      });
      // 触摸屏，点击其它地方可关闭
      $(window).on(eventType, function(e) {
        if(!e.target.getAttribute('layer-type')){
          hide();
        }
      });
      // body.on(eventType, '[' + attrName + '=layer-nav],[' + attrName + '=layer-cont]', function(e) {
      //    e.stopPropagation();
      // });
    }else{
      body.on('mouseenter', '[' + attrName + '=layer-nav]', function(e) {
        var item = $(this);
        var eventType = getData(item).eventType;
        if(eventType === 'mouseenter'){
          showByEle($(this));
          e.preventDefault();
        }
      });

      body.on('mouseleave', '[' + attrName + '=layer-nav],[' + attrName + '=layer-cont]', function(e) {
        var item = $(this);
        var eventType = getData(item).eventType;
        if(eventType === 'mouseenter'){
          hide(300);
          e.preventDefault();
        }
      });

      body.on('mouseenter', '[' + attrName + '=layer-cont]', function(e) {
        var item = $(this);
        var eventType = getData(item).eventType;
        if(eventType === 'mouseenter'){
          clearTimeout(hideTimer);
        }
      });

    }


    body.data('layer-init',true);
  }

  return {
    showByEle:showByEle,
    hide:hide
  }
})();