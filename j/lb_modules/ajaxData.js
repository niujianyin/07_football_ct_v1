var ajaxData = (function () {
  // 内部方法传入接口地址和函数名字
  var _jsonpAjax = function (jsonpUrl, jsonpName, _next) {
    $.ajax({
      url: jsonpUrl,
      dataType: 'jsonp',
      data: {},
      cache: true,
      jsonpCallback: jsonpName,
      type: "get",
      success: function (data) {
        var result = data.result;
        var status = result && result.status;
        if (status && status.code == "0") {
          _next(data.result);
        } else {
          console.log(jsonpName + "服务器请求失败!");
        }
      }
    }).fail(function (data) {
      console.log(jsonpName + "本地请求失败!");
    });
  }
  var pub = {
    headerSet: function (matchId, callback) {
      var jsonpUrl = 'http://odds.sports.sina.com.cn/liveodds/getMatchInfo?m_id=' + matchId + '&format=json';
      var jsonpName = "getMatchInfo_" + matchId;
      _jsonpAjax(jsonpUrl, jsonpName, callback);
    },
    gamesScore: function (callback) {
      callback()
    },
    // 球队实力
    teamPowe: function (team1Id, team2Id, callback) {
      var hid = team1Id,
        aid = team2Id;
      var jsonpUrl = 'http://odds.sports.sina.com.cn/uefa/matchModelStats/?hid=' + hid + '&aid=' + aid + '&format=json'
      var jsonpName = "matchModelStats" + hid + aid;
      _jsonpAjax(jsonpUrl, jsonpName, callback);
    },
    // 历史交锋
    historyVs: function (team1, team2, limit, callback) {
      var jsonpUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3633771828&%20_sport_t_=Odds&_sport_a_=teamRecentMatches&team1=' + team1 + '&team2=' + team2 + '&limit=' + limit;
      var jsonpName = 'historyVs_team1_' + team1 + 'team2_' + team2 + 'limit_' + limit;
      _jsonpAjax(jsonpUrl, jsonpName, callback);
    },
    // 近期战绩
    nearVs: function (team1, limit, callback) {
      var jsonpUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3633771828&%20_sport_t_=Odds&_sport_a_=teamRecentMatches&team1=' + team1 + '&limit=' + limit;
      var jsonpName = "teamRecentMatches_" + team1;
      _jsonpAjax(jsonpUrl, jsonpName, callback);
    },
    // 未来赛事
    futureGame: function (team1, callback) {
      var jsonpUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3633771828&_sport_t_=livecast&_sport_a_=getTeamPreMatches&id=' + team1;
      var jsonpName = "getTeamPreMatches" + team1;
      _jsonpAjax(jsonpUrl, jsonpName, callback);
    },
    // 相关新闻
    news: function (team1, callback) {
      var jsonpUrl = 'http://platform.sina.com.cn/sports_client/news?app_key=3633771828&team_id=' + team1 + '&level=1,2,3&news_type=1,2,3&len=5&fields=title,url,pub_time';
      var jsonpName = "news" + team1;
      _jsonpAjax(jsonpUrl, jsonpName, callback);
    },
    // 欧赔
    getEurope: function (matchId, callback) {
      // var matchId = matchId || '3453592';
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=euroIniNewData&id=' + matchId;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'euroIniNewData_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    getEuropeSimple: function (matchId, bid, callback) {
      // var matchId = matchId ;
      // var bid = bid;
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=euroMakerDataByMatch&id=' + matchId + '&bid=' + bid;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'euroMakerDataByMatch_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    // 亚赔
    getAsia: function (matchId, callback) {
      var matchId = matchId || '3453592';
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=AsiaIniNewData&id=' + matchId;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'AsiaIniNewData_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    },
    getAsiaSimple: function (matchId, bid, callback) {
      var matchId = matchId;
      var bid = bid;
      var dataUrl = 'http://platform.sina.com.cn/sports_all/client_api?app_key=3979320659&_sport_t_=Odds&_sport_a_=asiaMakerDataByMatch&id=' + matchId + '&bid=' + bid;
      $.ajax({
        url: dataUrl,
        dataType: 'jsonp',
        data: {},
        cache: true,
        jsonpCallback: 'asiaMakerDataByMatch_'+matchId,
        type: "get"
      })
        .done(function (data) {
          var result = data.result;
          var status = result && result.status;
          if (status && status.code == "0") {
            callback(result);
          } else {
            util.log("服务器请求失败!")
          }
        })
        .fail(function () {
          util.log("本地请求失败!")
        })
    }
  };
  return pub;
})();