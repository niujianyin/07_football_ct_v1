// e
util.EE = (function(require,exports,module) {
  if (window.PAGEDATA && PAGEDATA._E) {
    return PAGEDATA._E;
  }
  var $ = jQuery;
  var E = $({});
  var slice = [].slice;
  var triggerFn = E.trigger;

  var hasTriggers = {};
  E.trigger = function() {
    // 原触发功能
    triggerFn.apply(E, arguments);

    // 储存已经触发的事件
    hasTriggers[arguments[0]] = {
      args: arguments
    };
  };
  var onFn = E.on;
  E.on = function() {
    // 原绑定功能
    onFn.apply(E, arguments);

    // 已经触发过的事件，如果绑定 事件名+':done',则可再触发一次
    var names = arguments[0].split(' ');

    for (var i = 0, len = names.length; i < len; i++) {
      var item = names[i];
      if (item.indexOf(':done') > 0) {
        var evt = hasTriggers[item.replace(':done', '')];
        if (evt) {
          var triggerArgs = slice.call(evt.args);
          triggerArgs[0] = item;
          triggerFn.apply(E, triggerArgs);
        }
        var onArgs = slice.call(arguments);
        onArgs[0] = item;
        E.off.apply(E, onArgs);
      }
    }

  };
  E.proxyEvent = function(mod, eventName) {
    if (mod && mod.on) {
      if (!$.isArray(eventName)) {
        eventName = [eventName];
      }
      for (var i = 0, len = eventName.length; i < len; i++) {
        var item = eventName[i];
        (function(item) {
          mod.on(item, function() {
            var args = slice.call(arguments);
            args.shift();
            E.trigger(item, args);
          });
        })(item);
      }

    }
  }
  PAGEDATA = window.PAGEDATA || {};
  PAGEDATA._E = E;
  return PAGEDATA._E;
})();