__inline('lb_modules/ajaxData.js');
(function () {
  // 页面加载
  var matchId = util.getQueryString("m_id") || 3453592;
  headData.set(matchId, function (teamInfo) {
    // 购买小炮预测 
    payforGun(teamInfo);
    ajaxData.getAsia(matchId, function (data) {
      for (var i = 0, len = data.data.length; i < len; i++) {
        data.data[i].nearOne = data.data[i]['new'];
      };
      template.helper('toPersent', function (num) {
        if (num) {
          return parseInt((num - 0) * 100) + '%';
        } else {
          return '-';
        }
      });
      var html = template('temp_asia', data);
      document.getElementById('a_dataTableBox').innerHTML = html;
      //$("#a_dataTable").html(html);
    });
  });
  // 筛选
  var dom_chooseInput = $(".e_checkBox input");
  dom_chooseInput.click(function () {
    var dom_tbody = $(".a_tr");
    var thisIndex = dom_chooseInput.index($(this));
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
  $("#a_dataTableBox").on('mouseover', '.a_tr', function () {
    $(".a_tr").removeClass('e_tbodyCurrent').find('.e_dataStar').removeClass('e_startCurrent');
    $(this).addClass('e_tbodyCurrent').find('.e_dataStar').addClass('e_startCurrent');
  }).on('mouseleave', '.e_tBody', function () {
    $(".a_tr").removeClass('e_tbodyCurrent').find('.e_dataStar').removeClass('e_startCurrent');
  }).on('click', '.a_tr', function () {
    var bid = this.id;
    $("#mask").show();
    ajaxData.getAsiaSimple(matchId, bid, function (data) {
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
        };
        writeHtml += '<td>' + d[i].o3 + '</td>';
        if (d[i + 1] && d[i].o2 - d[i + 1].o2 > 0) {
          writeHtml += '<td class="e_infoRed">' + d[i].o2 + '↑</td>';
        } else if (d[i + 1] && d[i].o2 - d[i + 1].o2 < 0) {
          writeHtml += '<td class="e_infoBlue">' + d[i].o2 + '↓</td>';
        } else {
          writeHtml += '<td class="">' + d[i].o2 + '</td>';
        };
        writeHtml += '<td>' + d[i].change_time + '</td>';
      }
      $("#a_pop_tbody").html(writeHtml);
      $(".e_popip").show();
    });
  });
  $(".e_pop_tit span").click(function () {
    $(".e_popip").hide();
    $("#mask").hide();
  })
})()

