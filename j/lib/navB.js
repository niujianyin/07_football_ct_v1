// navB
util.Nav = (function(require,exports,module){
  var $ = jQuery;
  var Clz = util.Clz;
  var getNodes = util.getNodes;
  var CommonLayer = util.layer;
  var UserPanel = util.userpanel;

  var win = window;

  var Nav = new Clz(),
    LoginLayer,
    inited = false,
    tip = null;

  Nav.include({
    init: function(wrap, opt) {
      var self = this;
      self.dom = getNodes(wrap);
      if (self.data('init')) {
        return;
      }
      var UserPanel = win.SINA_USER_PANEL;
      UserPanel.set("container", {
        'node': self.dom.user[0]
      }).set('extra', {
        'css': 'http://i.sso.sina.com.cn/css/outlogin/v1/outlogin_skin_reversion.css'
      }).set('outLoginLayer', {
        'ready': function() {
          LoginLayer = win.SINA_OUTLOGIN_LAYER;
          if (LoginLayer) {
            LoginLayer.set('sso', {
                entry: opt.entry || 'caitong'
              }).set('plugin', {
                position: 'center',
                parentNode: null,
                relatedNode: null,
                qqLogin : false
              }).set('mask', {
                enable: true,
                opacity: 0.6,
                background: '#000000'
              }).set('styles', {
                'z-index': 1001
              })
              .register('login_success', function(info) {
                self.trigger('login_success', info);
                // LoginLayer.getWeiboInfo({
                //   timeout: 15e3,
                //   onSuccess: function(rs) {
                //     self.trigger('weibo_success', rs);
                //     window.caitong.weiboSuccess(rs);
                //   },
                //   onFailure: function(rs) {
                //     self.trigger('weibo_error', rs);
                //     window.caitong.weiboFail(rs);
                //   }
                // });
                window.caitong.loginSuccess(info);
              }).register('logout_success', function(info) {
                self.trigger('logout_success', info);
                window.caitong.logoutSuccess(info); 
              }).register('layer_hide', function() {
                self.hideTip();
                self.trigger('layer_hide', info);
              }).init();

            self.data('init', true);
            self.trigger('init', 'topbar');
          }
        }
      }).init();

      self.bind();
    },
    bind: function() {
      var dom = this.dom;

    },
    fireLoginSuccess: function() {
      LoginLayer && LoginLayer.listener.fire('login_success');
    },
    fireLogoutSuccess: function() {
      LoginLayer && LoginLayer.listener.fire('logout_success');
    },
    showTip: function(html) {
      LoginLayer = win.SINA_OUTLOGIN_LAYER;
      if (!tip) {
        tip = document.createElement('div');
        tip.className = 'sina-top-bar-user-tip';
        if (LoginLayer.nodes && LoginLayer.nodes.box) {
          LoginLayer.nodes.box.insertBefore(tip, LoginLayer.nodes.box.firstChild);
        }
      }
      if (html) {
        tip.innerHTML = html;
        tip.style.display = 'block';
      }
    },
    hideTip: function() {
      if (tip) {
        tip.style.display = 'none';
      }
    },
    show: function() {
      if (window.SINA_USER_PANEL) {
        var UserPanel = window.SINA_USER_PANEL;
        try {
          UserPanel.setOutLoginMiddle(true);
        } catch (e) {}
        UserPanel.getOutLogin().show();
      } else {
        LoginLayer.show();
      }
    }
  });

  return Nav;
})();