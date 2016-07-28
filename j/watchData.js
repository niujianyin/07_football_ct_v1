__inline('lb_modules/ajaxData.js');
__inline('lb_modules/viewWork.js');
__inline('lb_modules/setCharts.js');

(function () {
  // 获取比赛信息
  var matchId = util.getQueryString("m_id") || 3703374;
  // 雷达图皮肤
  var curTheme = {
    color: [
      '#46e2a9', '#99d6f9', '#99d2dd', '#88b0bb',
      '#1c7099', '#038cc4', '#75abd0', '#afd6dd'
    ]
  };
  var pieTheme = {
    color: [
      '#e04f5c', '#c7c7ce', '#2a6ed7', '#fff'
    ]
  };
  // 模板helper
  template.helper('wordList', function (data) {
    if (!!data.length) {
      var str = "";
      for (var i = 0, len = data.length - 1; i < len; i++) {
        str += ' ' + data[i].win_lose + ' /';
      }
      str += ' ' + data[data.length - 1].win_lose;
      return str;
    } else {
      return "无"
    }
  });
  template.helper("distance", function (distance_2_cur) {
    if (distance_2_cur <= 1440 && distance_2_cur > 60) {
      var dH = (distance_2_cur - 0) / 60;
      return '(距离比赛还有' + parseInt(dH) + '小时)';
    } else if (distance_2_cur > 1440) {
      var dD = (distance_2_cur - 0) / 1440;
      return '(距离比赛还有' + parseInt(dD) + '天)';
    } else if (distance_2_cur < 60) {
      return '(距离比赛还有' + distance_2_cur + '分钟)';
    }
  });
  template.helper("distanceD", function (str) {
    str = str.replace(/-/g, '/');
    var lb_date = new Date(str);
    var lb_time = lb_date.getTime();
    var lb_distance = lb_time - $.now();
    return parseInt(lb_distance / 86400000);
  });
  var pri = {};
  // 头部组件
  ajaxData.headerSet(matchId, function (headInfo) {
    var pageInfo = headInfo.data;
    viewWork.header(headInfo, function (objBack) {
      // console.log(objBack);

      var html = template('temp_d_header', objBack);
      $(".d_headerContainer")[0].innerHTML = html;
    });
    // **************************联赛积分榜???***************************************************
    ajaxData.gamesScore(function () {
      console.log(pageInfo);
    });
    // **************************球队整体实力***************************************************
    var team1Id = pageInfo.Team1Id;
    var team2Id = pageInfo.Team2Id;
    var chartsOp = {};
    ajaxData.teamPowe(team1Id, team2Id, function (objTeam) {
      // console.log(objTeam);
      chartsOp.teamAll = {
        domBox: $(".d_tpv_content")[0],
        data: objTeam.data,
        theme: curTheme,
        other: {
          hname: pageInfo.Team1,
          gname: pageInfo.Team2
        }
      };
      setCharts.teamRadar(chartsOp.teamAll);

    });
    // **************************历史交战记录***************************************************
    ajaxData.historyVs(team1Id, team2Id, 10, function (historyInfo) {
      var viewNum = historyInfo.data.length;
      var viewRadio = "全部";
      var newObj = viewWork.historyVs(viewNum, viewRadio, historyInfo);
      var html = template('d_temp_historyVs', newObj);
      $(".d_hv_content")[0].innerHTML = html;
      var html = template('d_temp_historyVsChoose', newObj);
      $(".d_hv_chooseBox")[0].innerHTML = html;
      pri.historyInfo = historyInfo;
    });
    // 场数筛选
    $(".d_historyVsBox").on('change', '#d_hv_select', function () {
      var viewNum = this.value;
      var viewRadio = $(".d_hv_radio1").find(".d_radioStatus1").attr("value");
      // viewRadio="世杯热身";
      var newObj = viewWork.historyVs(viewNum, viewRadio, pri.historyInfo);
      var html = template('d_temp_historyVs', newObj);
      $(".d_hv_content")[0].innerHTML = html;
      var html = template('d_temp_historyVsChoose', newObj);
      $(".d_hv_chooseBox")[0].innerHTML = html;
      $("#d_hv_select").val(viewNum);
      $(".d_hv_radio1").find("span").removeClass("d_radioStatus1").each(function () {
        var thisVal = $(this).attr("value");
        if (thisVal == viewRadio) {
          $(this).addClass("d_radioStatus1");
        }
      })
    });
    // 赛事筛选
    $(".d_historyVsBox").on('click', '.d_hv_radio1', function () {
      var viewNum = $("#d_hv_select").val();
      var thisSpan = $(this).find("span")
      var viewRadio = thisSpan.attr("value");
      var radioChecked = thisSpan.hasClass("d_radioStatus1");
      if (!radioChecked) {
        var newObj = viewWork.historyVs(viewNum, viewRadio, pri.historyInfo);
        var html = template('d_temp_historyVs', newObj);
        $(".d_hv_content")[0].innerHTML = html;
        var html = template('d_temp_historyVsChoose', newObj);
        $(".d_hv_chooseBox")[0].innerHTML = html;
        $("#d_hv_select").val(viewNum);
        $(".d_hv_radio1").find("span").removeClass("d_radioStatus1").each(function () {
          var thisVal = $(this).attr("value");
          if (thisVal == viewRadio) {
            $(this).addClass("d_radioStatus1");
          }
        })
      }
    });
    // **************************近期战绩***************************************************
    // #####主队#####
    // 加载
    ajaxData.nearVs(team1Id, 10, function (data) {
      pri.homeNear = data;
      var viewNum = data.length,
        viewRadio = "全部",
        viewTab = "总";
      // 插入选择
      var chooseHtml = template('temp_HnearVsChoose', data);
      $("#d_rs_chooseBoxH")[0].innerHTML = chooseHtml;
      // 渲染
      setHnearVs(viewNum, viewRadio, viewTab, data);
    });
    // 数量筛选
    $(".d_rs_hBox").on('change', '#d_rs_hSelect', function () {
      var viewNum = this.value,
        viewRadio = $(".d_rs_hBox").find(".d_radioStatus1").attr("value"),
        viewTab = $(".d_rs_hBox").find(".d_rs_tabCurrent").text();
      setHnearVs(viewNum, viewRadio, viewTab, pri.homeNear);
    });
    // 赛事筛选
    $(".d_rs_hBox").on('click', '#d_rs_chooseBoxH .d_rs_radio', function () {
      var viewNum = $("#d_rs_hSelect").val(),
        viewRadio = $(this).find(".d_radio").attr("value"),
        viewTab = $(".d_rs_hBox").find(".d_rs_tabCurrent").text();
      setHnearVs(viewNum, viewRadio, viewTab, pri.homeNear);
      $("#d_rs_chooseBoxH").find(".d_radio").removeClass("d_radioStatus1");
      $(this).find("span").addClass("d_radioStatus1");
    });
    // 主客筛选
    $(".d_rs_hBox").on('click', '.d_rs_hTab li', function () {
      var viewNum = $("#d_rs_hSelect").val(),
        viewRadio = $(".d_rs_hBox").find(".d_radioStatus1").attr("value"),
        viewTab = $(this).text();
      setHnearVs(viewNum, viewRadio, viewTab, pri.homeNear);
      $(".d_rs_hTab").find("li").removeClass("d_rs_tabCurrent");
      $(this).addClass("d_rs_tabCurrent");
    });
    function setHnearVs(viewNum, viewRadio, viewTab, data) {
      var newObj = viewWork.nearVs(viewNum, viewRadio, viewTab, data);
      // 插入表格
      var tableHtml = template('temp_HnearVs', newObj);
      $(".d_rs_hTable")[0].innerHTML = tableHtml;
      // 插入图表框
      var tableHtml = template('temp_HnearVsCanvas', newObj);
      $("#d_rs_canvasBoxH")[0].innerHTML = tableHtml;
      // 插入图表
      chartsOp = {
        domBox: $(".d_rs_hCanvas")[0],
        data: newObj,
        theme: pieTheme
      };
      setCharts.nearState(chartsOp);
    }
    // #####客队#####
    // 加载
    ajaxData.nearVs(team2Id, 10, function (data) {
      pri.guestNear = data;
      var viewNum = data.length,
        viewRadio = "全部",
        viewTab = "总";
      // 插入选择
      var chooseHtml = template('temp_GnearVsChoose', data);
      $("#d_rs_chooseBoxG")[0].innerHTML = chooseHtml;
      // 渲染
      setGnearVs(viewNum, viewRadio, viewTab, data);
    });
    // 数量筛选
    $(".d_rs_gBox").on('change', '#d_rs_gSelect', function () {
      var viewNum = this.value,
        viewRadio = $(".d_rs_gBox").find(".d_radioStatus1").attr("value"),
        viewTab = $(".d_rs_gBox").find(".d_rs_tabCurrent").text();
      setGnearVs(viewNum, viewRadio, viewTab, pri.guestNear);
    });
    // 赛事筛选
    $(".d_rs_gBox").on('click', '#d_rs_chooseBoxG .d_rs_radio', function () {
      var viewNum = $("#d_rs_gSelect").val(),
        viewRadio = $(this).find(".d_radio").attr("value"),
        viewTab = $(".d_rs_gBox").find(".d_rs_tabCurrent").text();
      setGnearVs(viewNum, viewRadio, viewTab, pri.guestNear);
      $("#d_rs_chooseBoxG").find(".d_radio").removeClass("d_radioStatus1");
      $(this).find("span").addClass("d_radioStatus1");
    });
    // 主客筛选
    $(".d_rs_gBox").on('click', '.d_rs_gTab li', function () {
      var viewNum = $("#d_rs_gSelect").val(),
        viewRadio = $(".d_rs_gBox").find(".d_radioStatus1").attr("value"),
        viewTab = $(this).text();
      setGnearVs(viewNum, viewRadio, viewTab, pri.guestNear);
      $(".d_rs_gTab").find("li").removeClass("d_rs_tabCurrent");
      $(this).addClass("d_rs_tabCurrent");
    });
    function setGnearVs(viewNum, viewRadio, viewTab, data) {
      var newObj = viewWork.nearVs(viewNum, viewRadio, viewTab, data);
      // 插入表格
      var tableHtml = template('temp_HnearVs', newObj);
      $(".d_rs_gTable")[0].innerHTML = tableHtml;
      // 插入图表框
      var tableHtml = template('temp_GnearVsCanvas', newObj);
      $("#d_rs_canvasBoxG")[0].innerHTML = tableHtml;
      // 插入图表
      chartsOp = {
        domBox: $(".d_rs_gCanvas")[0],
        data: newObj,
        theme: pieTheme
      };
      setCharts.nearState(chartsOp);
    }
    // **************************未来赛事***************************************************
    ajaxData.futureGame(team1Id, function (data) {
      var html = template('temp_Hfuture', data);
      $(".d_fg_hBox").html(html);
    });
    ajaxData.futureGame(team2Id, function (data) {
      var html = template('temp_Gfuture', data);
      $(".d_fg_gBox").html(html);
    });
    // **************************相关新闻***************************************************
    ajaxData.news(team1Id, function (data) {
      console.log(data);
      data.teamName = pageInfo.Team1;
      var html = template('temp_newsHome', data);
      $(".d_an_hBox")[0].innerHTML = html;
    });
    ajaxData.news(team2Id, function (data) {
      data.teamName = pageInfo.Team2;
      var html = template('temp_newsGuest', data);
      $(".d_an_gBox")[0].innerHTML = html;
    });
  });
})();