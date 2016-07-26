/*
* module name：index.js
* author：niujianyin
* date：2016年07月26日11:12:37
*/

//全站级脚本的调用入口模块


// 首屏比赛条
udvDefine("matchbar",function(require,exports,module){
  (function($){
    // 从2016-06-11 开始 取5天   大于2016-07-02 直接赋值为2016-07-02
    // 比赛展示数据
    var matchData = {};
    /**
     *jQuery对象
     *$match 外层容器（包含左右点击滚动区域）
     *$list 滚动区域容器
     */ 
    var $match = $("#match"), $list = $("#match_list"), $tmp = $("#match_list_tmp");
    util.MATCHSTATUS = ['','未开始','已开赛','已结束'];
    util.MATCHSTATUSCLASS = ['','status_pre','status_duing','status_over'];
    // 日期处理
    function getcurtime(date,mindate,maxdate){ 
      var datetime = new Date(date.replace(/-/g,'/')).getTime();
      var mintime = new Date(mindate.replace(/-/g,'/')).getTime();
      var maxtime = new Date(maxdate.replace(/-/g,'/')).getTime();
      if(datetime < mintime){
        return mindate;
      } else if(datetime > maxtime){
        return maxdate;
      } else {
        return date;
      }
    }
    function getspantime(date,maxdate){ 
      var datetime = new Date(date.replace(/-/g,'/')).getTime();
      var maxtime = new Date(maxdate.replace(/-/g,'/')).getTime();
      if(datetime > maxtime){
        return 11;
      } else {
        return 5;
      }
    }

    // 编辑填写的日期是法国日期  __curdate相差1天  所以统一加一天时间  不可行
    // var MILLSECONDS_PER_DAY = 12 * 60 * 60 * 1000;
    // var barcurdateTime = (new Date(__curdate)).getTime() + MILLSECONDS_PER_DAY;
    // var barcurdate = util.dateFormatFmt( barcurdateTime, "yyyy-MM-dd");
    var begindate = getcurtime(__curdate, '2016-06-10', '2016-07-02');
    var timespan = getspantime(__curdate, '2016-06-26');


    // 定时器构造器
    var timeLoader = function(options) {
      var self = this;
      self.inited = false;
      self.isReflash = true;
      self.options = self._setOptions(options)
    };
    timeLoader.prototype = {
      init: function() {
        this._init()
      },
      _init: function() {
        var self = this;
        self.inited = true;
        self._getData()
      },
      _setOptions: function(options) {
        var defaults = this.defaults = {
          url: '',
          param: '',
          callback: function(){},
          callbackName: 'jsonp',
          interval: 0,
          beforeLoad: function() {},
          loaded: function(data) {},
          error: function(error) {}
        };
        return util.extend(defaults, options, true)
      },
      _getData: function() {
        var self = this;
        var opt = self.options;
        var url = opt.url;
        var param = opt.param;
        function intetval() {
          if (opt.interval > 0) {
            self.setTimeout = null;
            self.setTimeout = setTimeout(function() {
              self._getData()
            }, opt.interval)
          }
        }
        function request() {
          util.jsonp(url, opt.callback, opt.callbackName);
          intetval()
        }
        if (self.isReflash) {
          opt.beforeLoad();
          request()
        } else {
          intetval()
        }
      },
      reflash: function(b) {
        this.isReflash = b
      }
    };
    /**
     * 定时器实例
     * 1分钟（60 * 1000）请求一次接口
     */ 
    var MatchLoader = new timeLoader({
      url: 'http://platform.sina.com.cn/sports_all/client_api?app_key=3207392928&_sport_t_=livecast&_sport_a_=dateMatches&begin='+begindate+'&LeagueType=9&timespan='+timespan,
      param: '',
      interval: 60 * 1000,
      callback: function(data){
        var result = data.result;
        var status = result && result.status;
        if(status && status.code == "0"){
          matchData = data.result.data;
          MatchLoader.render();
        } else {
          util.log(result.status && result.status.msg);
        }
      },
      callbackName: 'dateMatches'
    });

    MatchLoader.render = function() {
      var self = this;
      // console.log(matchData);
      template.helper("gdate", function(date){
        var rdate = date.replace(/-/g,'/');
        return util.dateFormatFmt( new Date(rdate), "MM-dd");  
      });
      template.helper("gstatus", function(status){
        return util.MATCHSTATUSCLASS[status];  
      });
      template.helper("gname", function(status){
        return util.MATCHSTATUS[status];  
      });
      template.helper("gscore", function(obj){
        if(obj.status == 1){
          return '<span class="item_c_line"></span>';
        } else {
          return obj.score;
        }
      });
      template.helper("gwin", function(obj){
        if(obj.status == 3 && (obj.score1-0) > (obj.score2-0)){
          return 'c_red';
        }
      });
      // for(var i=0,len=matchData.length; i<len; i++){
      //   if(i<7){
      //     matchData[i].status = 3;
      //     matchData[i].Score1 = 3;
      //     matchData[i].Score2 = 5;
      //   }
      // }
      var html = template('match_list_tmp', {data: matchData});

      if (self.slideObj) {
        self.slideObj.lDiv01.innerHTML = html;
      } else {
        $list[0].innerHTML = html;
        // 绑定滚动
        self.slide();
      }
      var $match_item = $("#match_list").find(".item"),
          $match_duing = $("#match_list").find(".status_duing"),
          $match_prev = $("#match_list").find(".status_pre");
      var idx = 0;
      if( $match_duing.length > 0 ){
        idx = $match_item.index( $($match_duing[0]) );
      } else if( $match_prev.length > 0 ) {
        idx = $match_item.index( $($match_prev[0]) );
      } else {
        idx = 1;
      }
      var page = Math.floor(idx/6);

      // 滚动到正在直播第一页
      if( page == 0 ){
        $("#match_list").scrollLeft(0);
      } else {
        self.slideObj.pageTo(page);
      }
    };
    MatchLoader.slide = function() {
      var self = this;
      var ScrollPic = require("ScrollPic");
      var scrollObj = new ScrollPic();
      scrollObj.scrollContId = "match_list";
      scrollObj.arrLeftId = "match_pre";
      scrollObj.arrRightId = "match_next";
      scrollObj.dotListId = "";
      scrollObj.pageWidth = 978;
      scrollObj.frameWidth = 978;
      scrollObj.upright = false;
      scrollObj.speed = 20;
      scrollObj.space = 20;
      scrollObj.autoPlay = false;
      scrollObj.autoPlayTime = 2;
      scrollObj.circularly = false;
      scrollObj.initialize();

      document.getElementById('match_pre').onclick = function(){
        scrollObj.pre();
        return false;
      }
      document.getElementById('match_next').onclick = function(){
        scrollObj.next();
        return false;
      }
      self.slideObj = scrollObj;
    };

    /**
     *调用定时器
     */ 
    MatchLoader.init();
    window.MatchLoader = MatchLoader;
  }).call(window, jQuery);
})

// 选择日期
udvDefine("choicedate",function (require, exports, module) {
  var defaultDate = (__curdate && __curdate.replace(/-/g,'/')) || new Date();
  var nowDate = util.dateFormatFmt( defaultDate, "yyyy/MM/dd");
  $('#smart_head_date').find('.form-control').val(nowDate);
  $('#smart_head_date .input-group.date').datepicker({
    format: "yyyy/mm/dd",
    startDate: "2016-06-10",
    endDate: "2016-07-10",
    // todayBtn: "linked",
    language: "zh-CN",
    orientation: "bottom auto",
    autoclose: true,
    todayHighlight: true,
    datesDisabled:['2016-06-23','2016-06-24','2016-06-28','2016-06-29','2016-07-04','2016-07-05','2016-07-08','2016-07-09']
  }).on('changeDate', function(ev){
    // alert(util.dateFormatFmt( new Date(ev.date), "yyyy-MM-dd"));
    var selecteddate = util.dateFormatFmt( new Date(ev.date), "yyyy-MM-dd");
    // var matchdate = {
    //   '2016-06-10':'2016-06-10',
    //   '2016-06-11':'2016-06-11',
    //   '2016-06-12':'2016-06-12',
    //   '2016-06-13':'2016-06-13',
    //   '2016-06-14':'2016-06-14',
    //   '2016-06-15':'2016-06-15',
    //   '2016-06-16':'2016-06-16',
    //   '2016-06-17':'2016-06-17',
    //   '2016-06-18':'2016-06-18',
    //   '2016-06-19':'2016-06-19',
    //   '2016-06-20':'2016-06-20',
    //   '2016-06-21':'2016-06-21',
    //   '2016-06-22':'2016-06-22',

    //   '2016-06-23':'2016-06-25',
    //   '2016-06-24':'2016-06-25',

    //   '2016-06-25':'2016-06-25',
    //   '2016-06-26':'2016-06-26',
    //   '2016-06-27':'2016-06-27',

    //   '2016-06-28':'2016-06-30',
    //   '2016-06-29':'2016-06-30',

    //   '2016-06-30':'2016-06-30',
    //   '2016-07-01':'2016-07-01',
    //   '2016-07-02':'2016-07-02',
    //   '2016-07-03':'2016-07-03',

    //   '2016-07-04':'2016-07-04',
    //   '2016-07-05':'2016-07-05',

    //   '2016-07-06':'2016-07-06',
    //   '2016-07-07':'2016-07-07',

    //   '2016-07-08':'2016-07-10',
    //   '2016-07-09':'2016-07-10',

    //   '2016-07-10':'2016-07-10'
    // }
    window.open('http://euro.sina.com.cn/lottery/date.html?curdate='+selecteddate,'_blank');
  });
});

// 购买小炮预测
udvDefine("purchase",function (require, exports, module) {
  window.$mask = $("#mask"); 
  // 所有弹出层容器
  window.$popup_box = $(".popup_box");
  // 支付容器
  window.$popup = $("#popup_layout_pay");
  // 支付应该成功容器
  window.$popup_canpay = $("#popup_layout_canpay");
  // 未支付容器
  window.$popup_nopay = $("#popup_layout_nopay");
  // 没有预测数据的提示容器
  window.$popup_msg = $("#popup_layout_msg");

  $("#smart_main").on("click", ".smart_mtype_item", function(){
    var parent = $(this).closest(".smart_mtype");
    var item = parent.find(".smart_mtype_item");
    item.removeClass('selected');
    $(this).addClass('selected');
    var idx = $(this).closest('.smart_match').find('.smart_mc').data("idx");
    window.switchGame(idx);
  });
  // 弹层层隐藏按钮
  $(".popup_btn_close").on("click", function(){
    // 隐藏弹出层
    popupHide();
  });

  $("#smart_main").on("click", ".btn_purchase", function(){
    //判断登录状态      
    var isLogin = checkLogin();
    if(!isLogin){
      middleLogin();
    }else{
      //发起订单和充值请求,查看数据详情
      var matchId = $(this).data("id");
      var gameType = $(this).closest(".smart_match").find('.selected').data("type");
      var pankou = $(this).data("pankou");
      var hostTeam = $("#smart_mh_name_"+matchId).text();
      var awayTeam = $("#smart_mg_name_"+matchId).text();
      var matchTime = $("#smart_mc_date_"+matchId).text();
      // console.log(util.wbId+";"+matchId+";"+gameType+";"+pankou+";"+hostTeam+";"+awayTeam+";"+matchTime);
      // 获取信息
      util.payment.payStep1(null, matchId, gameType, pankou, hostTeam, awayTeam, matchTime);
    }
  });

  //弹出层 支付按钮
  // $(".popup_btn_pay").click(function() {
  //   // 先验证是否存在订单号
  //   util.payment.payStep2(util.wbId, euro_matchid, euro_gameType, euro_pankou);
  // });

  //提示信息按钮:知道了  取消
  $(".popup_btn_know").on('click', function(event) {
    // 隐藏弹出层
    popupHide();
  });
  $(".popup_btn_cancel").on('click', function(event) {
    // 隐藏弹出层
    popupHide();
  });

  //支付成功确认
  $(".popup_btn_canpay").on('click',function() {
    // 隐藏弹出层
    popupHide();
    // 支付是否成功验证
    util.payment.payStep5(euro_orderid,euro_memberid,euro_matchid,euro_gameType);
  });

  var $tips = $("#smart_tips");
  $("#smart_main").on("mouseenter",".btn_purchase_no",function(evt){
    $tips.show();
  });
  $("#smart_main").on("mouseleave",".btn_purchase_no",function(){
    $tips.hide();
  });
  document.onmousemove = function(evt){
    var oEvent = evt || window.event;
    var scrollleft = document.documentElement.scrollLeft || document.body.scrollLeft;
    var scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
    $tips[0].style.left = oEvent.clientX + scrollleft +10 +"px";
    $tips[0].style.top = oEvent.clientY + scrolltop + 10 + "px";
  }
});

// 实力分析 交战历史图表
udvDefine("echarts",function (require, exports, module) {
  window.teamRecentMatches0 = function(){};
  window.teamRecentMatches_host0 = function(){};
  window.teamRecentMatches_guest0 = function(){};
  window.getMatchHighSpeed_0 = function(){};
  window.teamRecentMatches1 = function(){};
  window.teamRecentMatches_host1 = function(){};
  window.teamRecentMatches_guest1 = function(){};
  window.getMatchHighSpeed_1 = function(){};
  window.teamRecentMatches2 = function(){};
  window.teamRecentMatches_host2 = function(){};
  window.teamRecentMatches_guest2 = function(){};
  window.getMatchHighSpeed_2 = function(){};
  window.teamRecentMatches3 = function(){};
  window.teamRecentMatches_host3 = function(){};
  window.teamRecentMatches_guest3 = function(){};
  window.getMatchHighSpeed_3 = function(){};


  window.getMatchHighSpeed_z_sx_0 = function(){};
  window.getMatchHighSpeed_z_sx_1 = function(){};
  window.getMatchHighSpeed_z_sx_2 = function(){};
  window.getMatchHighSpeed_z_sx_3 = function(){};

  window.getMatchHighSpeed_z_spf_0 = function(){};
  window.getMatchHighSpeed_z_spf_1 = function(){};
  window.getMatchHighSpeed_z_spf_2 = function(){};
  window.getMatchHighSpeed_z_spf_3 = function(){};

  window.getMatchHighSpeed_z_dx_0 = function(){};
  window.getMatchHighSpeed_z_dx_1 = function(){};
  window.getMatchHighSpeed_z_dx_2 = function(){};
  window.getMatchHighSpeed_z_dx_3 = function(){};
  
  var curdate = __curdate || util.dateFormatFmt( new Date(), "yyyy-MM-dd");
  var match_num=0;
  window.match_data={
    a1:{},
    a2:{},
    a3:{},
    a4:{},
    a5:{},
    a6:{}
  };
  // 存储到localStorage
  var expire = 10*60*1000;
  var euro = {
    get: function(name){
      if(!util.storage){
        return '';
      }
      var euro = JSON.parse(util.storage.getItem('euro_'+curdate)||'{}');
      return euro[name];
    },
    set: function(name, data){
      if(!util.storage){
        return '';
      }
      var self=this;
      var euro = JSON.parse(util.storage.getItem('euro_'+curdate)||'{}');
      euro[name] = data;
      util.storage.setItem('euro_'+curdate, JSON.stringify(euro));
    },
    remove: function(name){
      if(!util.storage){
        return '';
      }
      return util.storage.removeItem('euro');
    }
  }

  var smart = {
    // 小炮预计
    /**
     *http://odds.sports.sina.com.cn/odds/matchodds/asiaIni?id=3175335&format=json  亚盘 odds_id
     *http://odds.sports.sina.com.cn/odds/matchodds/euroIni?id=3175335&format=json  胜平负 odds_id
     *http://odds.sports.sina.com.cn/odds/matchodds/dxballIni?lc_id=3175335&format=json  大小球 livecast_id
     */
    smart_match: function(idx){
      var self = this;
      var cdata = match_data.data[idx];
      cdata.idx = idx;
      if( cdata.odds ){
        return;
      }
      // 默认是亚盘
      // var odds_id = '3175335'||cdata.odds_id;
      var odds_id = cdata.odds_id;
      $.ajax({
        url:'http://odds.sports.sina.com.cn/odds/matchodds/asiaIni?id='+odds_id+'&format=json',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"matchodds_"+idx,
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            cdata.odds = result.data;
            if(!cdata.odds || cdata.odds.length == 0 ){
              // 没有开盘信息  直接置灰
              cdata.odds = {};
              cdata.ULswitch = 0;
            } else {
              cdata.ULswitch = 1;
            }
            // render
            var $container = $("#smart_box_0"+idx).find(".smart_match");
            var html = template('smart_match_tmp', {data: cdata});
            $container[0].innerHTML = html;
            // 比赛状态
            self.smart_match_status(idx);
          } else {
            util.log(result.status && result.status.msg);
            // 容错
            cdata.odds = {};
            cdata.ULswitch = 0;
            // render
            var $container = $("#smart_box_0"+idx).find(".smart_match");
            var html = template('smart_match_tmp', {data: cdata});
            $container[0].innerHTML = html;
            // 比赛状态
            self.smart_match_status(idx);
          }
        }
      });
    },
    // 切换玩法
    /**
     *http://odds.sports.sina.com.cn/odds/matchodds/asiaIni?id=3175335&format=json  亚盘 odds_id
     *http://odds.sports.sina.com.cn/odds/matchodds/euroIni?id=3175335&format=json  胜平负 odds_id
     *http://odds.sports.sina.com.cn/odds/matchodds/dxballIni?lc_id=3175335&format=json  大小球 livecast_id
     */
    smart_switchGame: function(idx){
      var self = this;
      var cdata = match_data.data[idx];
      if(!cdata || !cdata.livecast_id){
        return;
      }
      cdata.idx = idx;
      var matchId = cdata.livecast_id;
      var gameType = $("#smart_mtype_"+matchId).find('.selected').data("type");
      if(!gameType){ return;}
      var url = '';
      // var odds_id = '3453592'||cdata.odds_id;
      var odds_id = cdata.odds_id;
      var pankouArr = ['ULswitch','SPFswitch','DXswitch'], pankouIdx = 0;
      if(gameType == 'z_sx'){
        url='http://odds.sports.sina.com.cn/odds/matchodds/asiaIni?id='+odds_id+'&format=json';
        pankouIdx = 0;
      } else if(gameType == 'z_spf'){
        url='http://odds.sports.sina.com.cn/odds/matchodds/euroIni?id='+odds_id+'&format=json';
        pankouIdx = 1;
        // console.log(url);
      } else  if(gameType == 'z_dx'){
        url='http://odds.sports.sina.com.cn/odds/matchodds/dxballIni?lc_id='+matchId+'&format=json';
        pankouIdx = 2;
      } else {
        url='http://odds.sports.sina.com.cn/odds/matchodds/asiaIni?id='+odds_id+'&format=json';
        pankouIdx = 0;
      }
      
      $.ajax({  
        url:url,
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"matchodds_"+gameType+'_'+idx,
        type:"get",
        success: function(data) {
          // console.log(data);
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            cdata.odds = result.data;
            if(!cdata.odds || cdata.odds.length == 0 ){
              // 没有开盘信息  直接置灰
              cdata.odds = {};
              cdata[pankouArr[pankouIdx]] = 0;
            } else {
              cdata[pankouArr[pankouIdx]] = 1;
            }
            // 比赛状态
            smart.smart_match_status(idx);
          } else {
            util.log(result.status && result.status.msg);
            cdata.odds = {};
            cdata[pankouArr[pankouIdx]] = 0;
            // 比赛状态
            smart.smart_match_status(idx);
          }
        }
      });
    },
    // 比赛状态
    smart_match_status: function(idx){
      var self = this;
      var cdata = match_data.data && match_data.data[idx];
      if(!cdata || !cdata.livecast_id){
        return;
      }
      var matchId = cdata.livecast_id;
      var $container = $("#smart_"+matchId);
      var gameType = $("#smart_mtype_"+matchId).find('.selected').data("type");
      $.ajax({  
        // url:'http://platform.sina.com.cn/sports_all/client_api?app_key=3207392928&_sport_t_=football&_sport_s_=opta&_sport_a_=getMatchHighSpeed&id='+matchId,
        url:'http://odds.sports.sina.com.cn/fbmatch/getMatchHighSpeed?id='+matchId+'&format=json',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"getMatchHighSpeed_"+gameType+"_"+idx,
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code === 0){
            var rdata = result.data;
            util.log(rdata);
            // "status": 3 比赛标准状态：1.未赛、2.赛中、3.结束，详见中文名
            if(rdata.status == 1){
              var noswitch = '';
              if(gameType == 'z_sx'){
                noswitch = cdata.ULswitch == 1?'':'_no';
              } else if(gameType == 'z_spf'){
                noswitch = cdata.SPFswitch == 1?'':'_no';
              } else if(gameType == 'z_dx'){
                noswitch = cdata.DXswitch == 1?'':'_no';
              } else {
                noswitch = cdata.ULswitch == 1?'':'_no';
              }
              // render
              var html = template('smart_match_pre_'+gameType+noswitch+'_tmp', {data: cdata});
              $container[0].innerHTML = html;
              if(util.payment.getwbid() && noswitch != '_no'){
                util.payment.payStep0(util.wbId, matchId, gameType);
              }
              
            } else if(rdata.status == 2){
              // 赛中 60s持续刷新显示
              // http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=101711880 按比赛ID获取已开放预测结果
              if(!cdata.om){
                $.ajax({
                  url:'http://odds.sports.sina.com.cn/odds/uefa/getOpenedMatchForecast?matchId='+matchId+'&format=json',
                  dataType:'jsonp',
                  data: {},
                  cache: true,
                  jsonpCallback:"getOpenedMatchForecast_"+matchId,
                  type:"get",
                  success: function(data) {
                    // data = {
                    //     "result":  {
                    //       "status":  {
                    //         "code": 0,
                    //         "msg": ""
                    //       },
                    //       "data": {
                    //         'betId':123423,
                    //         'upperTapePro':0.35,//'上盘概率'
                    //         'lowTapePro':0.35, //'下盘概率'
                    //         'ULTape':2.5, //'上下盘盘口'
                    //         'DXbigPro' :0.35, //'大分概率'
                    //         'DXsmallPro':0.35, //'小分概率'
                    //         'DXTape' :3.5/4,// '大小分盘口'
                    //         'SPFwinPro' :0.35, //'胜平负胜率'
                    //         'SPFdrawPro' :0.35,//'胜平负平率'
                    //         'SPFlosePro' :0.35, //'胜平负负率'
                    //       }
                    //     }
                    //   }
                    cdata.om = data.result.data;
                    cdata.matchId = matchId;
                    cdata.gameType = gameType;
                    cdata.hscore = rdata.home_score;
                    cdata.gscore = rdata.away_score;
                    // render_smart_in
                    render_smart_in(cdata);
                    setTimeout(function(){
                      smart.smart_match_status(idx);
                    }, 60000);
                  }
                });
              } else {
                cdata.matchId = matchId;
                cdata.gameType = gameType;
                cdata.hscore = rdata.home_score;
                cdata.gscore = rdata.away_score;
                // render_smart_in
                render_smart_in(cdata);
                setTimeout(function(){
                  // console.log(gameType+";"+idx);
                  smart.smart_match_status(idx);
                }, 60000);
              }
              
            } else {
              // 赛后  获取分析数据   不需要登录  得到准输背景
              // http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=101711880 按比赛ID获取已开放预测结果
              $.ajax({
                url:'http://odds.sports.sina.com.cn/odds/uefa/getOpenedMatchForecast?matchId='+matchId+'&format=json',
                dataType:'jsonp',
                data: {},
                cache: true,
                jsonpCallback:"getOpenedMatchForecast_"+matchId,
                type:"get",
                success: function(data) {
                  // data = {
                  //     "result":  {
                  //       "status":  {
                  //         "code": 0,
                  //         "msg": ""
                  //       },
                  //       "data": {
                  //         'betId':123423,
                  //         'upperTapePro':0.25,//'上盘概率'
                  //         'lowTapePro':0.75, //'下盘概率'
                  //         'ULTape':2.5, //'上下盘盘口'
                  //         'DXbigPro' :0.35, //'大分概率'
                  //         'DXsmallPro':0.35, //'小分概率'
                  //         'DXTape' :3.5/4,// '大小分盘口'
                  //         'SPFwinPro' :0.35, //'胜平负胜率'
                  //         'SPFdrawPro' :0.35,//'胜平负平率'
                  //         'SPFlosePro' :0.35, //'胜平负负率'
                  //         "ULforecastResult":1, //0（未给出结果），－1（错），1（准）
                  //         "SPFforecastResult":1, //0（未给出结果），－1（错），1（准）
                  //         "DXforecastResult":1, //0（未给出结果），－1（错），1（准）
                  //         "matchStatus":3  //1(未赛)，2（赛中），3（完赛）
                  //       }
                  //     }
                  //   }
                  cdata.om = data.result.data;
                  if(matchId == '139187'){
                    cdata.om.ULforecastResult = 1;
                  }
                  cdata.matchId = matchId;
                  cdata.gameType = gameType;
                  cdata.hscore = rdata.home_score;
                  cdata.gscore = rdata.away_score;
                  // render_smart_in
                  render_smart_end(cdata);
                }
              });
            }
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    // 实力分析
    getdata_a1: function(idx){
      var self = this;
      if( match_data.a1[idx] ){
        return;
      }
      // 获取过期时间
      var expiretime = euro.get("expire_a1_"+idx) || 0;
      var currenttime = (new Date()).getTime();
      var data;
      if(currenttime - expiretime < expire){
        data = euro.get("a1_"+idx);
        match_data.a1[idx] = data;
        self.render_a1(idx);
        return;
      }
      var cdata = match_data.data[idx];
      var hid=cdata.Team1Id,aid=cdata.Team2Id;
      $.ajax({
        url:'http://odds.sports.sina.com.cn/uefa/matchModelStats/?hid='+hid+'&aid='+aid+'&format=json',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"matchModelStats"+idx,
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            match_data.a1[idx] = result.data;
            match_data.a1[idx].team1 = cdata.Team1;
            match_data.a1[idx].team2 = cdata.Team2;
            self.render_a1(idx);
            euro.set("expire_a1_"+idx,currenttime);
            euro.set("a1_"+idx,match_data.a1[idx]);
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    render_a1: function(idx){
      var self = this;
      // render
      var $container = $("#smart_box_0"+idx).find(".smart_chart_a1");
      var html = template('smart_chart_a1_tmp', {idx: idx});
      $container[0].innerHTML = html;
      // 渲染图表
      self.chart_radar_a1(idx);
    },
    chart_radar_a1: function(idx){
      var data = match_data.a1[idx];
      
      var host = data.host;
      var guest = data.away;
      var hname = data.team1;
      var gname = data.team2;
      var hval =[], gval=[];

      hval.push(Math.round((host.unlucky_shot-0)));
      hval.push(Math.round((host.effect_shot_r-0)*100));
      hval.push(Math.round((host.possession_r-0)*100));
      hval.push(Math.round((host.fouls_r-0)));
      hval.push(Math.round((host.card_r-0)*100));

      gval.push(Math.round((guest.unlucky_shot-0)));
      gval.push(Math.round((guest.effect_shot_r-0)*100));
      gval.push(Math.round((guest.possession_r-0)*100));
      gval.push(Math.round((guest.fouls_r-0)));
      gval.push(Math.round((guest.card_r-0)*100));

      //确定阈值
      var maxval = [],hvalitem,gvalitem;
      for(var i=0,len=hval.length; i<len; i++){
        hvalitem = hval[i];
        gvalitem = gval[i];
        maxval.push(Math.max(hvalitem,gvalitem)+2);
      }

      // chart_radar_3_1 效率 radar
      var curTheme = {
        // 默认色板
        color: [
          '#62e5b5','#72c4e3','#99d2dd','#88b0bb',
          '#1c7099','#038cc4','#75abd0','#afd6dd'
        ]
      };
      var myChart = echarts.init(document.getElementById('chart_radar_a1_'+idx),curTheme);

      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            var indicatorNames = ['运气值','射正率','传球成功率','被侵犯率','得牌率'];
            var datas = params.value, result = params.name;
            for(var i=0,len=datas.length; i<len; i++){
              result += '<br /> '+indicatorNames[i] +':'+datas[i]+'%';
            }
            return result;
          }
        },
        legend: {
          x: '27px',
          y: '290px',
          data:[gname,hname]
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: '运气值', max: maxval[0]},
            { name: '射正率', max: maxval[1]},
            { name: '传球成功率', max: maxval[2]},
            { name: '被侵犯率', max: maxval[3]},
            { name: '得牌率', max: maxval[4]}
          ],
          center: ['50%','45%'],
          radius: 112,
          name: {
            textStyle: {
              color:'#313336',
              fontSize: '14',
              fontWeight: 'normal'
            }
          }
        },
        series: [
          {
            type: 'radar',
            areaStyle: {normal: {}},
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data : [
              {
                value : hval,
                name : hname
              },
               {
                value : gval,
                name : gname
              }
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    // 交战历史
    getdata_a2: function(idx){
      var self = this;
      if( match_data.a2[idx] ){
        return;
      }
      // 获取过期时间
      var expiretime = euro.get("expire_a2_"+idx) || 0;
      var currenttime = (new Date()).getTime();
      var data;
      if(currenttime - expiretime < expire){
        data = euro.get("a2_"+idx);
        match_data.a2[idx] = data;
        self.render_a2(idx);
        return;
      }
      var cdata = match_data.data[idx];
      $.ajax({  
        url:'http://platform.sina.com.cn/sports_all/client_api?app_key=3207392928&_sport_t_=Odds&_sport_a_=teamRecentMatches&team1='+cdata.Team1Id+'&team2='+cdata.Team2Id+'&limit=10',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"teamRecentMatches"+idx,
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            if(!result.count){ result.count = 0;}
            if(!result.Team1Win){ result.Team1Win = 0;}
            if(!result.Team1Lose){ result.Team1Lose = 0;}
            if(!result.Team1Draw){ result.Team1Draw = 0;}
            if(!result.Team1Goal){ result.Team1Goal = 0;}
            if(!result.Team1LoseGoal){ result.Team1LoseGoal = 0;}

            match_data.a2[idx] = result;
            self.render_a2(idx);
            euro.set("expire_a2_"+idx,currenttime);
            euro.set("a2_"+idx,match_data.a2[idx]);
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    render_a2: function(idx){
      var self = this;
      // render
      var $container = $("#smart_box_0"+idx).find(".smart_chart_a2");
      var html = template('smart_chart_a2_tmp', {idx: idx,data:match_data.a2[idx]});
      $container[0].innerHTML = html;
      // 渲染图表
      self.chart_pie_a2(idx);
    },
    chart_pie_a2: function(idx){
      // 渲染图表
      var data = match_data.a2[idx];
      var win = '胜';
      var lose = '负';
      var equal = '平';
      // chart_pie_a2  pie
      var curTheme = {
        // 默认色板
        color: [
          '#e04f5c','#8dcbd8','#46556d','#88b0bb',
          '#1c7099','#038cc4','#75abd0','#afd6dd'
        ]
      };
      var myChart = echarts.init(document.getElementById('chart_pie_a2_'+idx),curTheme);
      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: "{b}: {c}"
        },
        legend: {
          orient: 'vertical',
          x: '20px',
          y: 'center',
          data:[ win,lose,equal]
        },
        series: [
          {
            name:'交战历史',
            type:'pie',
            center: ['60%', '50%'],
            radius: ['50%', '85%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:[
              {value: data.Team1Win, name:win},
              {value: data.Team1Lose, name:lose},
              {value: data.Team1Draw, name:equal}
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    // 主队走势
    getdata_a3: function(idx){
      var self = this;
      if( match_data.a3[idx] ){
        return;
      }
      // 获取过期时间
      var expiretime = euro.get("expire_a3_"+idx) || 0;
      var currenttime = (new Date()).getTime();
      var data;
      if(currenttime - expiretime < expire){
        data = euro.get("a3_"+idx);
        match_data.a3[idx] = data;
        self.render_a3(idx);
        return;
      }
      var cdata = match_data.data[idx];
      $.ajax({  
        url:'http://platform.sina.com.cn/sports_all/client_api?app_key=3207392928&_sport_t_=Odds&_sport_a_=teamRecentMatches&team1='+cdata.Team1Id+'&limit=6',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"teamRecentMatches_host"+idx,
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            match_data.a3[idx] = result;
            self.render_a3(idx);
            euro.set("expire_a3_"+idx,currenttime);
            euro.set("a3_"+idx,match_data.a3[idx]);
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    render_a3: function(idx){
      var self = this;
      // render
      template.helper("trend", function(data){
        var result = '';
        for(var i=0,len=data.length; i<len; i++){
          result += ('／'+data[i].win_lose);
        }
        return result.slice(1);  
      });
      var $container = $("#smart_box_0"+idx).find(".smart_chart_a3");
      var html = template('smart_chart_a3_tmp', {idx: idx,data:match_data.a3[idx]});
      $container[0].innerHTML = html;
      // 渲染图表
      self.chart_pie_a3(idx);
    },
    chart_pie_a3: function(idx){
      var win = '胜';
      var lose = '负';
      var equal = '平';
      var curTheme = {
        // 默认色板
        color: [
          '#e04f5c','#8dcbd8','#46556d','#fff'
        ]
      };
      var data = match_data.a3[idx];
      var myChart = echarts.init(document.getElementById('chart_pie_a3_'+idx),curTheme);
      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params, ticket, callback) {
            if(params.data.name == ''){ return;}
            return params.data.name+ ":" + params.data.value +"%";
          }
        },
        legend: {
          orient: 'vertical',
          x: '10px',
          y: '10px',
          data:[ win,lose,equal]
        },
        series: [
          {
            name: data.Team1+'走势',
            type:'pie',
            startAngle: 180,
            center: ['55%', '50%'],    // 默认全局居中
            radius: ['66%', '88%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:[
              {value: data.win_percent, name:win},
              {value: data.lose_percent, name:lose},
              {value: data.draw_percent, name:equal},
              {
                value:'100', 
                name:'',
                itemStyle: {
                  normal : {
                    color: 'rgba(0,0,0,0)',
                    label: {show:false},
                    labelLine: {show:false}
                  },
                  emphasis : {
                    color: 'rgba(0,0,0,0)'
                  }
                }
              }
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    // 客队走势
    getdata_a4: function(idx){
      var self = this;
      if( match_data.a4[idx] ){
        return;
      }
      // 获取过期时间
      var expiretime = euro.get("expire_a4_"+idx) || 0;
      var currenttime = (new Date()).getTime();
      var data;
      if(currenttime - expiretime < expire){
        data = euro.get("a4_"+idx);
        match_data.a4[idx] = data;
        self.render_a4(idx);
        return;
      }
      var cdata = match_data.data[idx];
      $.ajax({  
        url:'http://platform.sina.com.cn/sports_all/client_api?app_key=3207392928&_sport_t_=Odds&_sport_a_=teamRecentMatches&team1='+cdata.Team2Id+'&limit=6',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"teamRecentMatches_guest"+idx,
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            match_data.a4[idx] = result;
            self.render_a4(idx);
            euro.set("expire_a4_"+idx,currenttime);
            euro.set("a4_"+idx,match_data.a4[idx]);
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    render_a4: function(idx){
      var self = this;
      // render
      template.helper("trend", function(data){
        var result = '';
        for(var i=0,len=data.length; i<len; i++){
          result += ('／'+data[i].win_lose);
        }
        return result.slice(1);  
      });
      var $container = $("#smart_box_0"+idx).find(".smart_chart_a4");
      var html = template('smart_chart_a4_tmp', {idx: idx,data:match_data.a4[idx]});
      $container[0].innerHTML = html;
      // 渲染图表
      self.chart_pie_a4(idx);
    },
    chart_pie_a4: function(idx){
      var win = '胜';
      var lose = '负';
      var equal = '平';
      var curTheme = {
        // 默认色板
        color: [
          '#e04f5c','#8dcbd8','#46556d','#fff'
        ]
      };
      var data = match_data.a4[idx];
      var myChart = echarts.init(document.getElementById('chart_pie_a4_'+idx),curTheme);
      var option = {
        title : {
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params, ticket, callback) {
            if(params.data.name == ''){ return;}
            return params.data.name+ ":" + params.data.value +"%";
          }
        },
        legend: {
          orient: 'vertical',
          x: '10px',
          y: '10px',
          data:[ win,lose,equal]
        },
        series: [
          {
            name: data.Team1+'走势',
            type:'pie',
            startAngle: 180,
            center: ['55%', '50%'],    // 默认全局居中
            radius: ['66%', '88%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data:[
              {value: data.win_percent, name:win},
              {value: data.lose_percent, name:lose},
              {value: data.draw_percent, name:equal},
              {
                value:'100', 
                name:'',
                itemStyle: {
                  normal : {
                    color: 'rgba(0,0,0,0)',
                    label: {show:false},
                    labelLine: {show:false}
                  },
                  emphasis : {
                    color: 'rgba(0,0,0,0)'
                  }
                }
              }
            ]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    // 热度对比
    getdata_a5: function(idx){
      var self = this;
      if( match_data.a5[idx] ){
        return;
      }
      // 获取过期时间
      var expiretime = euro.get("expire_a5_"+idx) || 0;
      var currenttime = (new Date()).getTime();
      var data;
      if(currenttime - expiretime < expire){
        data = euro.get("a5_"+idx);
        match_data.a5[idx] = data;
        self.render_a5(idx);
        return;
      }
      var cdata = match_data.data[idx];
      $.ajax({  
        url:'http://platform.sina.com.cn/sports_all/client_api?app_key=3207392928&_sport_t_=Odds&_sport_a_=teamRecentMatches&team1='+cdata.Team2Id+'&limit=6',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"teamRecentMatches_guest"+idx,
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            match_data.a5[idx] = result;
            self.render_a5(idx);
            euro.set("expire_a5_"+idx,currenttime);
            euro.set("a5_"+idx,match_data.a5[idx]);
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    render_a5: function(idx){
      var self = this;
      // render
      template.helper("trend", function(data){
        var result = '';
        for(var i=0,len=data.length; i<len; i++){
          result += ('／'+data[i].win_lose);
        }
        return result.slice(1);  
      });
      var $container = $("#smart_box_0"+idx).find(".smart_hot");
      var html = template('smart_chart_a5_tmp', {idx: idx,data:match_data.a5[idx]});
      $container[0].innerHTML = html;
      // 渲染图表
      self.chart_dataZoom_a5(idx);
    },
    chart_dataZoom_a5: function(idx){
      var curTheme = {
        // 默认色板
        color: [
          '#e04f5c','#8dcbd8','#46556d','#fff'
        ]
      };
      var data = match_data.a5[0];
      var myChart = echarts.init(document.getElementById('chart_dataZoom_a5_'+idx),curTheme);

      var base = +new Date(1968, 9, 3);
      var oneDay = 24 * 3600 * 1000;
      var date = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
      var data = [0,100,200,500,300,600,0,200,1200,1400,1600,200];

      var option = {
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        title: {
        },
        legend: {
          x: '65px',
          y: '10px',
          data:[ '法国', '罗马尼亚']
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: date
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, '100%']
        },
        dataZoom: [{
          type: 'inside',
          start: 0,
          end: 50
        }, {
          start: 0,
          end: 10
        }],
        series: [
          {
            name:'法国',
            type:'line',
            smooth:true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
              normal: {
                color: 'rgb(92, 230, 181)'
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgb(185, 250, 227)'
                }, {
                  offset: 1,
                  color: 'rgb(227, 250, 242)'
                }])
              }
            },
            data: data
          },
          {
            name:'罗马尼亚',
            type:'line',
            smooth:true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
              normal: {
                color: 'rgb(110, 196, 229)'
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: 'rgb(166, 222, 243)'
                }, {
                  offset: 1,
                  color: 'rgb(209, 242, 254)'
                }])
              }
            },
            data: [200,0,1200,200,300,400,1000,1200,200,1000,1200,200]
          }
        ]
      };
      myChart.setOption(option, true);
    },
    //微博模块
    getWeibo: function (idx) {
      if (!!match_data.a6[idx]) {
        return;
      }
      match_data.a6[idx] = 1;
      var cdata = match_data.data[idx];
      // console.log(cdata);
      var matchId = cdata.livecast_id;
      var dataUrl = "http://odds.sports.sina.com.cn/weibo/weiboMatch?id=" + matchId + "&format=json";
      $.ajax({
          url: dataUrl,
          dataType: 'jsonp',
          data: {},
          cache: true,
          jsonpCallback: "getWeibo" + idx,
          type: "get",
        })
        .done(function (data) {
          if (!!data.result.status && data.result.status.code === 0) {
            var weiboArry = [];
            var weiboData = data.result.data;
            $.each(data.result.data, function (i, v) {
              weiboArry.push(v.uid);
            });
            var urlArry = weiboArry.join(",");
            var getAllUrl = "http://api.sina.com.cn/weibo/wb/user_timeline.json?count=1&feature=1&retcode=0&uid=" + urlArry;
            $.ajax({
                url: getAllUrl,
                dataType: 'jsonp',
                data: {},
                cache: true,
                jsonpCallback: "getWeiboAll" + idx,
                type: "get",
              })
              .done(function (data1) {
                var temData = [];
                $.each(data.result.data, function (i, arr) {
                  if (!!data1.result.data[arr.uid]) {
                    arr.thumbnail_pic = data1.result.data[arr.uid][0].user.profile_image_url;
                    arr.userName = data1.result.data[arr.uid][0].user.screen_name;
                    temData.push(arr);
                  }
                  //若是通过微博id无法获取用户信息将不显示微博                  
                });
                data.result.data = temData;
                template.helper("weibo_distanse", function (dt) {
                  var strDate = $.now() + "";
                  var dH = 0,
                    dD = 0,
                    dM = 0;
                  var minDate = strDate.slice(0, -3) - 0;
                  var distanse = minDate - dt;
                  var helpHtml = "";
                  if (distanse <= 86400 && distanse > 3600) {
                    dH = (distanse - 0) / 3600;
                    helpHtml = parseInt(dH) + "小时前";
                  } else if (distanse <= 3600 && distanse > 60) {
                    dM = (distanse - 0) / 60;
                    helpHtml = parseInt(dH) + "分钟前";
                  } else if (distanse >= 86400) {
                    dH = (distanse - 0) / 86400;
                    helpHtml = parseInt(dH) + "天前";
                  } else if (distanse < 60) {
                    helpHtml = "刚刚";
                  }
                  return helpHtml;
                });
                var html = template('teml_weibo', data.result);
                $(".weiboBlockBox")[0].innerHTML = html;
                // $('.weiboBlock').hide().first().show();
              })
              .fail(function () {
                //                console.log("error");
              });
          }
        })
        .fail(function () {
          //          console.log("error");
        })
    },
    // 专家预测
    getdata_forecast: function(idx){
      var self = this;
      var cdata = match_data.data[idx];
      // console.log(cdata);
      var matchId = cdata.livecast_id;
      $.ajax({
        url:'http://odds.sports.sina.com.cn/expert/matchRecommends/?id='+matchId+'&format=json',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"matchRecommends_"+idx,
        type:"get",
        success: function(data) {
          // data = {
          //   "result":{
          //     "status":{
          //       code: 0,
          //       msg: "ok"
          //     },
          //     "total":10,//推荐总数
          //     "stats":{ //id枚举：1:负，2：平，3：胜，4：大，5：小
          //       "1":5,
          //       "2":3,
          //       "3":2
          //     },
          //     "data":[
          //       {
          //         "id": "3",
          //         "expert_id": "5",//专家id
          //         "league": "9",//推荐比赛所属赛事类型
          //         "match_id": "111",//比赛id
          //         "type": "1",//玩法类型：1:胜负
          //         "recommend": "1",//推荐结果，中文见recommend_cn
          //         "recommend_cn": "负",
          //         "result": "1",//预测结果：－1：错，1:对
          //         "order": "1", //排行顺位
          //         "total": "12",//总推荐场数
          //         "right": "11", //总对场数
          //         "wrong": "0",//总错场数
          //         "recent_total": "10",//最近场次，默认为10，小于10时按实际场次显示
          //         "recent_right": "9",//最近对场
          //         "rmd_content": "dfasfa",//推荐理由说明
          //         "time": "2016-05-19 16:33:02",
          //         "name": "专家",//专家名
          //         "photo": "",//头像
          //         "url": ""//个人页
          //       }
          //     ]
          //   } 
          // };
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            // render
            template.helper("percent", function(percent){
              return Math.round((percent-0)*100/(result.total-0)) + "%";  
            });
            template.helper("percent1", function(p1,p2){
              return Math.round((p1-0)*100/(p2-0)) + "%";  
            });
            template.helper("width", function(total){
              return total*152 + "px";  
            });
            var $container = $("#smart_box_0"+idx).find(".smart_forecast");
            var rdata = result.data;
            for(var i=0,len=rdata.length; i<len; i++){
              var rrdata = rdata[i];
              rrdata.rmd_content1 = rrdata.rmd_content;
              if(rrdata.rmd_content && rrdata.rmd_content.length < 10){
                rrdata.rmd_content_class = '';
              } else {
                rrdata.rmd_content_class = 'prophesy_item_m5';
                if(rrdata.rmd_content.length > 18){
                  rrdata.rmd_content1 = rrdata.rmd_content1.substring(0,18)+'...';
                }
              }
            }
            var html = template('smart_forecast_tmp', {
              total:result.total,
              stats:result.stats,
              data:result.data
            });
            $container[0].innerHTML = html;
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    controller: function(idx){
      var self = this;
      self.smart_match(idx);
      self.getdata_a1(idx);
      self.getdata_a2(idx);
      self.getdata_a3(idx);
      self.getdata_a4(idx);
      // if(idx === 0){
      //   self.getdata_a5(idx);
      //   self.getWeibo(idx);
      // }
      self.getdata_forecast(idx);
    }
  }
  // 切换玩法的方法
  window.switchGame = smart.smart_switchGame;
  var app = {
    getData: function(){
      var self = this;
      // 获取过期时间
      var expiretime = euro.get("expire") || 0;
      var currenttime = (new Date()).getTime();
      var data;
      if(currenttime - expiretime < expire){
        // data = euro.get("data");
        // match_num = data.length;
        // match_data.data = data;
        // self.render();
        // return;
      }
      $.ajax({  
        // url:'http://platform.sina.com.cn/sports_all/client_api?app_key=3207392928&_sport_t_=livecast&_sport_a_=dateMatches&LeagueType=9&begin='+curdate+'&end='+curdate,
        url:'http://odds.sports.sina.com.cn/fbmatch/dayMapMatches?date='+curdate+'&timespan=0&format=json',
        dataType:'jsonp',
        data: {},
        cache: true,
        jsonpCallback:"dayMapMatches",
        type:"get",
        success: function(data) {
          var result = data.result;
          var status = result && result.status;
          if(status && status.code == "0"){
            // util.log(result.data);
            data = result.data;
            match_num = data.length;
            match_data.data = data;
            self.render();
            euro.set("expire",currenttime);
            euro.set("data",data);
          } else {
            util.log(result.status && result.status.msg);
          }
        }
      });
    },
    render: function(){
      var self = this;
      for(var i=0; i<match_num; i++){
        $("#smart_box_0"+i).show();
      }
      // 渲染sidebar
      template.helper("flag", function(flag){
        // if(flag == '922'){
        //   // 英格兰国旗不对  暂时用小国旗
        //   return 'http://www.sinaimg.cn/lf/sports/logo85/922.png';
        // }
        return 'http://n.sinaimg.cn/sports/0d703a2a/20160513/'+flag+'.png';  
      });
      var html = template('sidebar_tmp', match_data);
      $("#sidebar")[0].innerHTML = html;
      $("#gotoTop").on("click",function(){
        window.scrollTo(0,0);
      });
      $("#sidebar").on("click",".sidebar_item",function(){
        $(this).addClass("selected").siblings(".sidebar_item").removeClass("selected");
      });
      // 滚动加载
      var $item = $("#sidebar").find(".sidebar_item");
      var sidebarArr = [];
      for(var i=0; i<match_num; i++){
        sidebarArr.push($("#alink_0"+i).offset().top);
      }
      sidebarArr.push(10000000);
      util.log(sidebarArr);
      var timeout;
      function _onScroll() {
        if (timeout) {
          window.clearTimeout(timeout);
        }
        timeout = setTimeout(function() {
          checkLoad();
        }, 200);
      }
      var $sidebar = $("#sidebar");
      function sidebarFixed(){
        var vD = util.viewData();
        $sidebar.removeClass("bottom200").css("top", "auto");
        var bartop = $sidebar.offset().top;
        if (bartop <= sidebarArr[0]) {
          $sidebar.removeClass('bottom200').css("top", (sidebarArr[0]-vD.scrollTop)+"px");
        } else if(bartop>($(document).height()- $sidebar.height()-250)){
          $sidebar.css("top", "auto").addClass('bottom200');
        } else {
          $sidebar.removeClass("bottom200").css("top", "auto");
        }
      }
      sidebarFixed();
      var curidx = 0;
      function checkLoad() {
        var vD = util.viewData();
        for(var j=0; j<sidebarArr.length; j++){
          if ((vD.viewHeight + vD.scrollTop) < sidebarArr[j]) {
            curidx = j;
            break;
          }
        }
        for(var jj=0; jj<curidx; jj++){
          // 渲染图表
          smart.controller(jj);
          $item.removeClass("selected");
          $item.eq(curidx-1).addClass("selected");
        };
        sidebarFixed();
      }
      $(window).scroll(_onScroll);
      // 渲染图表
      smart.controller(0);
    },
    controller: function(){
      var self = this;
      self.getData();
    }
  }
  app.controller();
});