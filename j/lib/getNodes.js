// getNodes
util.getNodes = (function (require, exports, module) {
  return function(wrap,attr) {
    attr = attr||'node-type';
    wrap = $(wrap);
    var nodes = $("[" + attr + "]", wrap);
    var nodesObj = {};
    nodesObj.wrap = wrap;
    var list = {};
    nodes.each(function(i) {
        var item = $(this);
        nodesObj[item.attr(attr)] = item;
        if(!list[item.attr(attr)]){
            list[item.attr(attr)] = [];
        }
        list[item.attr(attr)].push(this);
    });
    $.each(list, function(i, n){
        list[i] = $([].slice.call(n));
    });
    nodesObj._list = list;
    return nodesObj;
  };
})();