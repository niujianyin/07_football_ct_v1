// caitong  名称固定  如果想用其他回调对象名  请到topbarLogin.js Navb模块中修改
window.caitong = {
  // 登录成功回调
  loginSuccess: function(info){
    var self = this;
    // 可以获取到微博id 和 微博昵称  登录后信息存储在cookie的SUBP
    // topbarLogin.js 中定义了登录和常用方法util
    util.wbId = self.getWbId();
    util.nick = self.getWbNick();
    $("#ac-rgst").hide();
    var $orderBtn = $("#layout-wrap-order");
    $orderBtn.show();
    // 获取微博信息
    self.getWeiboInfo();
  },
  // 退出成功回调
  logoutSuccess: function(info){
    $("#ac-rgst").show();
    var $orderBtn = $("#layout-wrap-order");
    $orderBtn.hide();
    location.href = util.HOMEURL;
  },
  // 获取微博id  从cookie里的SUBP
  getWbId: function(){
    return (sinaSSOController && sinaSSOController.getSinaCookie() && sinaSSOController.getSinaCookie().uid ) || '';
  },
  // 获取微博昵称  从cookie里的SUBP
  getWbNick: function(){
    return (sinaSSOController && sinaSSOController.getSinaCookie() && sinaSSOController.getSinaCookie().nick) || '';
  },
  // 新版方法获取微博头像图片
  getWeiboInfo: function(){
    /*
     *{"data":{"name":"余荫漫步","avatar_large":"http://tva3.sinaimg.cn/crop.81.3.222.222.180/6d5796f9jw8f4mil07oi6j20b4098gm4.jpg","profile_url":"u/1834456825","profile_image_url":"http://tva3.sinaimg.cn/crop.81.3.222.222.50/6d5796f9jw8f4mil07oi6j20b4098gm4.jpg"},"result":true}
    */
    // param: uid : '', 要获取微博信息的用户uid，如果不主动设置这个选项，则从cookie中取得之前登录时存储的用户uid。
    var self = this;
    if(!SINA_OUTLOGIN_LAYER){
      self.getWeiboInfoByUrl();
    }
    SINA_OUTLOGIN_LAYER.getWeiboInfo({
      timeout: 30 * 1000,
      onSuccess: function(rs) {
        if(rs && rs.data && rs.data.avatar_large){
          util.nick = rs.data.name;
          util.wbImg = rs.data.avatar_large;
          
          var ckName = 'SINA_WB_LOCAL_NICKNAME';
          var ckNameId = 'SINA_WB_LOCAL_NICKNAME_UID';
          var ckLogoUrl = 'SINA_WB_LOCAL_LOGO_URL';
          var ckDomain = 'sina.com.cn';
          // setSinaWbCookie  和 getSinaWbCookieVal 方法依然保留 可以直接使用  如setSinaWbCookie(ckNameId, util.wbId, ckDomain, 0);
          util.setSinaWbCookie(ckNameId, util.wbId, ckDomain, 0);
          util.setSinaWbCookie(ckName, util.nick, ckDomain, 0);
          util.setSinaWbCookie(ckLogoUrl, util.wbImg, ckDomain, 0);

          self.checkPurchase();
        }
      },
      onFailure: function(rs) {
        // if (rs.type === 'timeout') {
        //   util.log('获取超时');
        // } else {
        //   util.log(rs);
        // }
        self.checkPurchase();
      }
    }); 
  },
  // 老版方法获取微博头像图片
  getWeiboInfoByUrl: function(){
    var sinaURL = 'http://api.sina.com.cn/weibo/wb/users_show.json?uid=';
    var wbId = sinaSSOController.getSinaCookie().uid || util.wbId;
    if(!wbId){ return;}
    util.wbId = wbId;
    $.ajax({
      url: sinaURL + wbId,
      type: "GET",
      dataType: "jsonp",
      async: false,
      success: function(jsonMsg) {
        var sts = jsonMsg.result.status.msg;
        if ('success' == sts) {
          util.wbId = jsonMsg.result.data.id;
          /**  id不一致问题 前端不判断  原因是不准
          if (_uid != wbId) {
            util.log('读取新浪接口返回的微博id不一不致');
            return null;
          }
          */

          util.nick = jsonMsg.result.data.name;
          util.wbImg = jsonMsg.result.data.avatar_large;
          //将微博昵称和wbId放cookie中
          var ckName = 'SINA_WB_LOCAL_NICKNAME';
          var ckNameId = 'SINA_WB_LOCAL_NICKNAME_UID';
          var ckLogoUrl = 'SINA_WB_LOCAL_LOGO_URL';
          var ckDomain = 'sina.com.cn';
          util.setSinaWbCookie(ckNameId, util.wbId, ckDomain, 0);
          util.setSinaWbCookie(ckName, util.nick, ckDomain, 0);
          util.setSinaWbCookie(ckLogoUrl, util.wbImg, ckDomain, 0);
          self.checkPurchase();
          
        } else {
          // util.alert('读取新浪接口获取微博信息失败');
          self.checkPurchase();
          return null;
        }
      }
    });
  },
  // 是否登录
  isLogin: function(){
    return (SINA_OUTLOGIN_LAYER && SINA_OUTLOGIN_LAYER.isLogin())|| false;
  },
  // 显示浮层
  showLogin: function(){
    (SINA_OUTLOGIN_LAYER && SINA_OUTLOGIN_LAYER.show());
  },
  // 关闭浮层
  hideLogin: function(){
    (SINA_OUTLOGIN_LAYER && SINA_OUTLOGIN_LAYER.hide());
  },
  checkPurchase: function(){
    // 首页登录后  验证是否已经购买过比赛。
    if(window.switchGame){
      for(var i=0; i<4; i++){
        window.switchGame(i);
      }
    }
    // 数据模型页面   验证是否已经购买过比赛。
    if(window.mdinfo && mdinfo.livecast_id){
      var matchId= mdinfo.livecast_id;
      getMdData(matchId);
    }
  }
};

(function(){
  var  Nav = util.Nav;
  var  E = util.EE;
  var id = 'j_nav';
  var opt = {
      entry:'caitong'
  };
  //可订阅事件 login_success weibo_success weibo_error logout_success layer_hide
  var Topbar = new Nav(document.getElementById(id),opt);
  E.proxyEvent(Topbar,['init','login_success','logout_success','weibo_success']);
})();