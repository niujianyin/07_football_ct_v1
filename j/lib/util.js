var util = {};
util.debug = false;
util.log = function(){
  if(util.debug){
    console.log.apply(console, arguments);
  }
};
util.windowOpen = function(url,target){
  var a = document.createElement("a");
  a.setAttribute("href", url);
  if(target == null){
    target = '_blank';
  }
  a.setAttribute("target", target);
  document.body.appendChild(a);
  if(a.click){
    a.click();
  }else{
    try{
      var evt = document.createEvent('Event');
      a.initEvent('click', true, true);
      a.dispatchEvent(evt);
    }catch(e){
      window.open(url);
    }
  }
  document.body.removeChild(a);
}
/**
 * 将 Date 转化为指定格式的String
 * @param date Object
 * @param fmt String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * date = date.replace(/-/g,"/"); util.dateFormatFmt(new Date(date),"MM月dd日")
 * util.dateFormatFmt( new Date(), "yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
 * util.dateFormatFmt( new Date(), "yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
 */

util.dateFormatFmt = function (date, fmt) { 
  if(Object.prototype.toString.call(date) == "[object String]"){
    date = date.replace(/-/g, '/');
  }
  date = new Date(date);
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(), //日 
    "h+": date.getHours(), //小时 
    "m+": date.getMinutes(), //分 
    "s+": date.getSeconds(), //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "S": date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
util.getQueryString = function(name) {
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if(r!=null) return decodeURIComponent(r[2]); return null;
}
util.byId = function(id) {
  return document.getElementById(id)
}
// jsonp
util.jsonp = function(url, callback, callbackName) {
  if (!url) {
    return;
  }
  var head = document.getElementsByTagName('head')[0];
  var ojs = util.byId(url);
  ojs && head.removeChild(ojs);
  if (url.indexOf('?') === -1) {
    url += '?callback=';
  } else {
    url += '&callback=';
  }
  url += callbackName;
  var remote_script = document.createElement('script');
  window[callbackName] = function(data) {
    callback && callback(data);
  }
  remote_script.src = url;
  remote_script.id = url;
  remote_script.type = 'text/javascript';
  remote_script.language = "javascript";
  head.appendChild(remote_script);
};
util.extend = function(target, source, deep) {
  target = target || {};
  var sType = typeof source,
    i = 1,
    options;
  if (sType === 'undefined' || sType === 'boolean') {
    deep = sType === 'boolean' ? source : false;
    source = target;
    target = this;
  }
  if (typeof source !== 'object' && Object.prototype.toString.call(source) !== '[object Function]') {
    source = {}
  }
  while (i <= 2) {
    options = i === 1 ? target : source;
    if (options !== null) {
      for (var name in options) {
        var src = target[name],
          copy = options[name];
        if (target === copy) {
          continue
        }
        if (deep && copy && typeof copy === 'object' && !copy.nodeType) {
          target[name] = this.extend(src || (copy.length !== null ? [] : {}), copy, deep)
        } else if (copy !== undefined) {
          target[name] = copy
        }
      }
    }
    i++
  }
  return target
}

util.viewData = function() {
  var e = 0, l = 0, i = 0, g = 0, f = 0, m = 0;
  var j = window, h = document, k = h.documentElement;
  e = k.clientWidth || h.body.clientWidth || 0;
  l = j.innerHeight || k.clientHeight || h.body.clientHeight || 0;
  g = h.body.scrollTop || k.scrollTop || j.pageYOffset || 0;
  i = h.body.scrollLeft || k.scrollLeft || j.pageXOffset || 0;
  f = Math.max(h.body.scrollWidth, k.scrollWidth || 0);
  m = Math.max(h.body.scrollHeight, k.scrollHeight || 0, l);
  return {scrollTop: g,scrollLeft: i,documentWidth: f,documentHeight: m,viewWidth: e,viewHeight: l};
};

util.cookie = (function(doc, win){
  return {
    getItem: function(key){
      var cookieKey = key + '=';
      var result = '';
      if(doc.cookie.length > 0){
        var index = doc.cookie.indexOf(cookieKey);
        if(index != -1){
          index += cookieKey.length;
          var lastIndex = doc.cookie.indexOf(';', index);
          if(lastIndex == -1){
            lastIndex = doc.cookie.length;
          }
          result = win.decodeURIComponent(doc.cookie.substring(index, lastIndex));
        }
      }
      return result;
    },
    setItem: function(key, value, expiresDays){
      var time = new Date();
      if(expiresDays){
        //将time设置为 expiresDays 天以后的时间 
        time.setTime(time.getTime()+expiresDays*24*3600*1000); 
      } else {
        time.setFullYear(time.getFullYear() + 1);
      }

      if (expiresDays == 0) {

        doc.cookie = key + '=' + win.encodeURIComponent(value) + ';';
      } else {

        doc.cookie = key + '=' + win.encodeURIComponent(value) + '; expires=' + time.toGMTString() + ';';
      }
      
    },
    removeItem: function(key){
      // alert(key);
      var time = new Date();
      time.setDate(time.getDate()-1); 
      doc.cookie = key + '=0; expires=' + time.toGMTString();
      // alert(util.cookie.getItem("fstar_cityLoc"));
    //   var self = this;
    //   var exp = new Date();
    //   exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
    //   var cval = self.getItem(key);
    //   alert(cval);
    //   document.cookie = key + "=" + cval + "; expires=" + exp.toGMTString();
      // alert(key);
      // alert(util.cookie.getItem(key));
      var cval = util.cookie.getItem(key);
      if(cval){
        util.cookie.setItem(key, "0");
      }
    }
  };
})(document, window);

util.storage = (function(doc, win){
  var localStorage = window.localStorage;
  // 优先使用localStorage
  if(localStorage){
    return {
      getItem: function(key){
        return localStorage.getItem(key);
      },
      setItem: function(key, value){
        // 在一些设备下, setItem之前必须调用removeItem
        localStorage.removeItem(key);
        localStorage.setItem(key, value);
      },
      removeItem: function(key){
        localStorage.removeItem(key);
      }
    };
  } else {
    return {
      getItem: util.cookie.getItem,
      setItem: util.cookie.setItem,
      removeItem: util.cookie.removeItem
    };
  }
})(document, window);

util.setSinaWbCookie = function(name, value, domain, expires) {
  domain = domain || document.domain;
  if (typeof(expires) == 'undefiend' || expires == null || expires == '') {
    document.cookie = name + "=" + encodeURIComponent(value) + "; path=" + "/" + "; domain=" + domain;
  } else {
    var expTimes = expires * 1000;
    var expDate = new Date();
    expDate.setTime(expDate.getTime() + expTimes);
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expDate.toGMTString() + "; path=" + "/" + "; domain=" + domain;
  }
}

util.getSinaWbCookieVal = function (name) {
  var cookieArr = document.cookie.replace(/\s/g, "").split(';');
  for (var i = 0; i < cookieArr.length; i++) {
    var tempObj = cookieArr[i].split('=');
    if (tempObj[0] == name)
      return decodeURIComponent(tempObj[1]);
  }
  return null;
}


function setSinaWbCookie(name, value, domain, expires) {
  domain = domain || document.domain;
  if (typeof(expires) == 'undefiend' || expires == null || expires == '') {
    document.cookie = name + "=" + encodeURIComponent(value) + "; path=" + "/" + "; domain=" + domain;
  } else {
    var expTimes = expires * 1000;
    var expDate = new Date();
    expDate.setTime(expDate.getTime() + expTimes);
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expDate.toGMTString() + "; path=" + "/" + "; domain=" + domain;
  }
}

function getSinaWbCookieVal(name) {
  var cookieArr = document.cookie.replace(/\s/g, "").split(';');
  for (var i = 0; i < cookieArr.length; i++) {
    var tempObj = cookieArr[i].split('=');
    if (tempObj[0] == name)
      return decodeURIComponent(tempObj[1]);
  }
  return null;
}

function middleLogin(msg) {
  window.caitong.showLogin();
}

function checkLogin() {
  return window.caitong.isLogin();
}