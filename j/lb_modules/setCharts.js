var setCharts = (function () {
  var pub = {
    //整体实力分析 
    teamRadar: function (op) {
      var myChart = echarts.init(op.domBox, op.theme);
      var host = op.data.host;
      var guest = op.data.away;
      var hname = op.other.hname;
      var gname = op.other.gname;
      var hval = [], gval = [];

      hval.push(Math.round((host.unlucky_shot - 0)));
      hval.push(Math.round((host.effect_shot_r - 0) * 100));
      hval.push(Math.round((host.possession_r - 0) * 100));
      hval.push(Math.round((host.fouls_r - 0)));
      hval.push(Math.round((host.card_r - 0) * 100));

      gval.push(Math.round((guest.unlucky_shot - 0)));
      gval.push(Math.round((guest.effect_shot_r - 0) * 100));
      gval.push(Math.round((guest.possession_r - 0) * 100));
      gval.push(Math.round((guest.fouls_r - 0)));
      gval.push(Math.round((guest.card_r - 0) * 100));

      //确定阈值
      var maxval = [], hvalitem, gvalitem;
      for (var i = 0, len = hval.length; i < len; i++) {
        hvalitem = hval[i];
        gvalitem = gval[i];
        maxval.push(Math.max(hvalitem, gvalitem) + 2);
      }
      option = {
        title: {},
        tooltip: {
          trigger: 'item'
        },
        legend: {
          x: '27px',
          y: '270px',
          data: [gname, hname]
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: '运气值', max: maxval[0] },
            { name: '射正率', max: maxval[1] },
            { name: '传球成功率', max: maxval[2] },
            { name: '被侵犯率', max: maxval[3] },
            { name: '得牌率', max: maxval[4] }
          ],
          center: ['50%', '45%'],//图位置
          radius: 100,//图大小
          name: {
            textStyle: {
              color: '#313336',
              fontSize: '14',
              fontWeight: 'normal'
            }
          }
        },
        series: [{
          // name: '预算 vs 开销（Budget vs spending）',
          type: 'radar',
          areaStyle: { normal: {} },
          itemStyle: { normal: { areaStyle: { type: 'default' } } },
          data: [
            {
              value: hval,
              name: hname
            },
            {
              value: gval,
              name: gname
            }
          ]
        }]
      };
      myChart.setOption(option, true);
    },
    nearState: function (op) {//近期走势
      var myChart = echarts.init(op.domBox, op.theme);
      option = {
        title: {},
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          x: '10px',
          y: '10px'
        },
        series: [{
          name: op.data.Team1,
          type: 'pie',
          startAngle: 180,
          center: ['50%', '70%'],    // 默认全局居中
          radius: ['88%', '120%'],
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
          data: [
            { value: op.data.win_percent, name: '胜' },
            { value: op.data.draw_percent, name: '平' },
            { value: op.data.lose_percent, name: '负' },
            {
              value: '100',
              name: '',
              itemStyle: {
                normal: {
                  color: 'rgba(0,0,0,0)',
                  label: { show: false },
                  labelLine: { show: false }
                },
                emphasis: {
                  color: 'rgba(0,0,0,0)'
                }
              }
            }
          ]
        }]
      };
      myChart.setOption(option, true);
    }
  };
  return pub;
})();
