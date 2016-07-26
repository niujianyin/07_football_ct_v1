// clz
util.Clz = (function(require, exports, module) {
  var $ = jQuery;

  var jqProxy = function(name) {
    return function() {
      if (!this._JQ) {
        this._JQ = $(this);
      }
      var JQ = this._JQ;
      if (name === 'data') {
        var needTrigger = false;
        var argLen = arguments.length;
        var val = JQ[name].apply(this._JQ, arguments);
        // 只有两个参数，默认触发相应的绑定事件
        if (argLen === 2) {
          needTrigger = true;
        }
        // 第三个参数，用于标识是否要触发相应的绑定事件
        if (argLen === 3) {
          needTrigger = !!arguments[2];
        }
        if (needTrigger) {
          JQ.trigger('data:' + arguments[0], slice.call(arguments));
        }
        return val;
      } else {
        JQ[name].apply(this._JQ, arguments);
      }
    };
  };
  var slice = [].slice;
  // 事件驱动
  var eventEmitter = {
    emit: jqProxy('trigger'),
    trigger: jqProxy('trigger'),
    once: jqProxy('one'),
    on: jqProxy('on'),
    off: jqProxy('off')
  };
  // 数据存储
  var dataHandler = {
    data: jqProxy('data')
  };
  var Clz = function(parentOrNoJquery, noJQuery) {
    if (arguments.length === 1) {
      // 如果parent是布尔值，说明开发者parent指代的是noJQuery
      if (typeof parentOrNoJquery === 'boolean') {
        noJQuery = parentOrNoJquery;
        parentOrNoJquery = undefined;
      }
    }

    var noop = function() {};
    // 新建类，init为构造函数入口
    var klass = function() {
      this.init.apply(this, arguments);
    };
    klass.superclass = parentOrNoJquery;
    klass.subclasses = [];
    // 如果存在父类就需要继承
    if (parentOrNoJquery) {
      //新建一个空类用以继承，其存在的意义是不希望构造函数被执行
      //比如 klass.prototype = new parent;就会执行其init方法
      var subclass = function() {};
      subclass.prototype = parentOrNoJquery.prototype;
      klass.prototype = new subclass;
      parentOrNoJquery.subclasses.push(klass);
    } else {
      if (!noJQuery && (window.jQuery || window.Zepto)) {
        $.extend(klass.prototype, eventEmitter);
        $.extend(klass.prototype, dataHandler);
      } else {
        klass.prototype.trigger = function() {};
      }
    }

    if (!klass.prototype.init) {
      klass.prototype.init = noop;
    }

    klass.prototype.constructor = klass;

    klass.fn = klass.prototype;
    klass.fn.parent = klass;

    klass.proxy = function(func) {
      var self = this;
      return (function() {
        return func.apply(self, arguments);
      });
    }

    klass.fn.proxy = klass.proxy;
    // 给类添加属性
    klass.extend = function(obj) {
      var extended = obj.extended;
      for (var i in obj) {
        klass[i] = obj[i];
      }
      // 回调
      if (extended) {
        extended(klass);
      }
    };
    // 给实例添加属性
    klass.include = function(obj) {

      var included = obj.included;
      var ancestor = klass.superclass && klass.superclass.prototype;
      for (var k in obj) {
        var value = obj[k];

        //满足条件就重写
        if (ancestor && typeof value == 'function') {
          var argslist = /^\s*function\s*\(([^\(\)]*?)\)\s*?\{/i.exec(value.toString())[1].replace(/\s/i, '').split(',');
          //只有在第一个参数为$super情况下才需要处理（是否具有重复方法需要用户自己决定）
          if (argslist[0] === '$super' && ancestor[k]) {
            value = (function(methodName, fn) {
              return function() {
                var scope = this;
                var args = [function() {
                  return ancestor[methodName].apply(scope, arguments);
                }];
                return fn.apply(this, args.concat(slice.call(arguments)));
              };
            })(k, value);
          }
        }

        klass.prototype[k] = value;
      }
      // 回调
      if (included) {
        included(klass);
      }
    };
    return klass;
  };
  return Clz;
})();