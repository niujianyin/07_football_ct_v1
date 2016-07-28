var viewWork = (function () {
  var pub = {
    header: function (oDom, callback) {
      var backObj = oDom;
      backObj.data.status = 0;
      callback(backObj);
    },
    historyVs: function (viewNum, viewRadio, historyInfo) {
      var backObj = historyInfo;
      var data=backObj.data;
      backObj.viewNum = viewNum;
      backObj.viewData = [];
      backObj.viewLeagues=[];
      backObj.Team1Win=0;
      backObj.Team1Draw=0;
      backObj.Team1Lose=0;
      backObj.Team1Goal=0;
      backObj.Team1LoseGoal=0;
      backObj.panlu_percent=0;
      var panluNum=0;
      for (var i = 0; i < viewNum; i++) {
        if (data[i].LeagueType_cn==viewRadio || viewRadio == "全部") {
          // 条目
          historyInfo.viewData.push(data[i]);
          // 赛事
          // backObj.viewLeagues.push(data[i].LeagueType_cn);
          // 胜平负
           if(data[i].win_lose=="胜"){
              backObj.Team1Win++;
           }else if(data[i].win_lose=="平"){
               backObj.Team1Draw++;
           }else if(data[i].win_lose=="负"){
             backObj.Team1Lose++;
           }
          //  进失球
           backObj.Team1Goal+=(data[i].Score1-0);
           backObj.Team1LoseGoal+=(data[i].Score2-0);
          //  赢盘率
          if(data[i].panlu=="赢"){
            panluNum++;
          }         
        }
      };
      backObj.panlu_percent=~~((panluNum/viewNum)*100);
      // $.unique(backObj.viewLeagues);
      return backObj;
    },
    nearVs: function (viewNum, viewRadio, viewTab, viewData){
      var op = {
        data: viewData,//整体data
        num: viewNum,
        tabName: viewTab,
        radioName: viewRadio
      };
    var returnData = null;
    var newsOp = {};
    $.extend(true, newsOp, op);
    newsOp.data.data = newsOp.data.data.slice(0, op.num);
    if (op.radioName != '全部') {
      if (newsOp.tabName == '总') {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.LeagueType_cn == newsOp.radioName;
        });
      } else if (newsOp.tabName == "主") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.LeagueType_cn == newsOp.radioName && n.Team1 == newsOp.data.Team1;
        });
      } else if (newsOp.tabName == "客") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.LeagueType_cn == newsOp.radioName && n.Team1 != newsOp.data.Team1;
        });
      }
    } else {
      if (newsOp.tabName == '总') {
        returnData = newsOp.data.data;
      } else if (newsOp.tabName == "主") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.Team1 == newsOp.data.Team1;
        });
      } else if (newsOp.tabName == "客") {
        returnData = $.grep(newsOp.data.data, function (n, i) {
          return n.Team1 != newsOp.data.Team1;
        });
      }
    }
    ;
    newsOp.data.data = returnData;
    newsOp.data.Team1Draw = $.grep(returnData, function (n, i) {
      return n.win_lose == '平';
    }).length;
    newsOp.data.Team1Lose = $.grep(returnData, function (n, i) {
      return n.win_lose == '负';
    }).length;
    newsOp.data.Team1Win = $.grep(returnData, function (n, i) {
      return n.win_lose == '胜';
    }).length;
    newsOp.data.draw_percent = parseInt((newsOp.data.Team1Draw / newsOp.data.data.length) * 100) || 0;
    newsOp.data.lose_percent = parseInt((newsOp.data.Team1Lose / newsOp.data.data.length) * 100) || 0;
    newsOp.data.win_percent = parseInt((newsOp.data.Team1Win / newsOp.data.data.length) * 100) || 0;
    return newsOp.data;
  },

  };
  return pub;
})();