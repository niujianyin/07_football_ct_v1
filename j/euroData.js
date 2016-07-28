__inline('lb_modules/ajaxData.js');
(function () {
  // 页面加载
  var matchId = util.getQueryString("m_id") || 3453592;
  headData.set(matchId, function (teamInfo) {
    // 购买小炮预测 
    payforGun(teamInfo);
    ajaxData.getEurope(matchId, function (data) {
      for (var i = 0, len = data.data.length; i < len; i++) {
        data.data[i].gl.nearOne = data.data[i].gl['new'];
        data.data[i].kelly.nearOne = data.data[i].kelly['new'];
        data.data[i].odds.nearOne = data.data[i].odds['new'];
        data.data[i].odds.nearOne.backOne = data.data[i].odds['new']['return'];
        data.data[i].odds.ini.backOne = data.data[i].odds['ini']['return'];
      };
      template.helper('toPersent', function (num) {
        if (num) {
          return parseInt((num - 0) * 100) + '%';
        } else {
          return '-';
        }
      });
      var html = template('temp_europe', data);
      $("#e_dataTableBox").html(html);
    });
  });
  // 筛选
  var dom_chooseInput = $(".e_checkBox input");
  dom_chooseInput.click(function () {
    var dom_tbody = $(".e_tBody");
    var thisIndex = dom_chooseInput.index($(this));
    var dom_firstone = $(".if_exchange");
    if (thisIndex == 0) {
      dom_tbody.show();
    } else if (thisIndex == 1) {
      dom_tbody.hide();
      $(".if_famous0").show();
    } else if (thisIndex == 2) {
      dom_tbody.hide();
      $(".if_exchange0").show();
    } else if (thisIndex == 3) {
      dom_tbody.hide();
      $(".if_exchange1").show();
    }
  });
  //  hover&click
  $("#e_dataTableBox").on('mouseover', '.e_tBody', function () {
    $(".e_tBody").removeClass('e_tbodyCurrent').find('.e_dataStar').removeClass('e_startCurrent');
    $(this).addClass('e_tbodyCurrent').find('.e_dataStar').addClass('e_startCurrent');
  }).on('mouseleave', '.e_tBody', function () {
    $(".e_tBody").removeClass('e_tbodyCurrent').find('.e_dataStar').removeClass('e_startCurrent');
  }).on('click', '.e_tBody', function () {
    var bid = this.id;
    $("#mask").show();
    ajaxData.getEuropeSimple(matchId, bid, function (data) {
      var writeHtml = "";
      var d = data.data;
      for (var i = 0; i < d.length; i++) {
        writeHtml += '<tr>';
        if (d[i + 1] && d[i].o1 - d[i + 1].o1 > 0) {
          writeHtml += '<td class="e_infoRed">' + d[i].o1 + '↑</td>';
        } else if (d[i + 1] && d[i].o1 - d[i + 1].o1 < 0) {
          writeHtml += '<td class="e_infoBlue">' + d[i].o1 + '↓</td>';
        } else {
          writeHtml += '<td class="">' + d[i].o1 + '</td>';
        }
        ;
        if (d[i + 1] && d[i].o2 - d[i + 1].o2 > 0) {
          writeHtml += '<td class="e_infoRed">' + d[i].o2 + '↑</td>';
        } else if (d[i + 1] && d[i].o2 - d[i + 1].o2 < 0) {
          writeHtml += '<td class="e_infoBlue">' + d[i].o2 + '↓</td>';
        } else {
          writeHtml += '<td class="">' + d[i].o2 + '</td>';
        }
        ;
        if (d[i + 1] && d[i].o3 - d[i + 1].o3 > 0) {
          writeHtml += '<td class="e_infoRed">' + d[i].o3 + '↑</td>';
        } else if (d[i + 1] && d[i].o3 - d[i + 1].o3 < 0) {
          writeHtml += '<td class="e_infoBlue">' + d[i].o3 + '↓</td>';
        } else {
          writeHtml += '<td class="">' + d[i].o3 + '</td>';
        }
        writeHtml += '<td>' + d[i]['return'] + '</td>' +
          '<td>' + d[i].change_time + '</td>';
      }
      $(".e_pop_tbody").html(writeHtml);
      $(".e_popip").show();
    });
  });
  $(".e_pop_tit span").click(function () {
    $(".e_popip").hide();
    $("#mask").hide();
  });
})();




