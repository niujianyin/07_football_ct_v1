// webp
util.webp = (function (require, exports, module) {
  return function(a, b) {
    function c() {}

    function d(a) {
      if(window.PAGEDATA && PAGEDATA.debug){
        return a;
      }
      if (e) {
        var b = !1;
        if (!/_\.webp$/i.test(a)) {
          var c = /^http:\/\/(\w{1}|w{3})(\d{0,1})\.sinaimg\.cn/i;
          a = a.replace(c, function(a, c, d) {
            return b = !0, "http://k" + d + ".sinaimg.cn/" + c + d
          }), b && (a += "_.webp")
        }
      }
      return a
    }
    var e = !1,
      f = function() {
        var b = "support_webp_",
          c = "localStorage",
          d = c in a && a[c];
        return d ? {
          set: function(a) {
            try {
              localStorage.setItem(b, a)
            } catch (c) {}
          },
          get: function() {
            return localStorage.getItem(b)
          }
        } : {
          set: function() {},
          get: function() {
            return ""
          }
        }
      }(),
      g = function() {
        function a(a) {
          (a = a || c)(e)
        }
        var b = e || f.get(e);
        return b ? (e = "true" === b ? !0 : !1, a) : function(b) {
          b = b || c;
          var d = new Image;
          d.onload = d.onerror = function() {
            e = 2 === d.height, f.set(e), g = a, b(e)
          }, d.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
        }
      }();
    g();
    var h = {
      isSupport: g,
      get: d
    };
    return h
  }(window);
})();