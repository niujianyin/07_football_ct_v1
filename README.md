##https://www.zybuluo.com/njy/note/334659
# 

标签（空格分隔）： 新浪彩通

---

[TOC]

##项目： 欧洲杯

小炮智能预测 —— 2016欧洲杯

##支付测试case
###首页面

a1:赛前 a2.赛中      a3.赛后
b1:亚盘 b2.胜平负     b3.大小球
c1.显示支付按钮  c2.支付按钮置灰 c3.显示预测结果 c4.显示比分
d1.登录  d2.未登录
e1.已支付  e2.未支付
f1.开盘  f2.未开盘

1. b1 + f2 == c2           
页面进入 请求亚盘盘口 亚盘未开盘 = 支付按钮置灰
2. b1 + f1 + a1 + d2 == c1      
页面进入 请求亚盘盘口 亚盘开盘 请求比赛状态 赛前 未登录  = 显示支付按钮
3. b1 + f1 + a1 + d1 + e2 == c3
页面进入 请求亚盘盘口 亚盘开盘 请求比赛状态 赛前 已登录 未支付 = 显示支付按钮
4. b1 + f1 + a1 + d1 + e1 == c3
页面进入 请求亚盘盘口 亚盘开盘 请求比赛状态 赛前 已登录 已支付 = 显示预测结果
5. b1 + f1 + a2 == c3 + c4
页面进入 请求亚盘盘口 亚盘开盘 请求比赛状态 赛中 = 显示预测结果 显示比分  一分钟刷一次接口
6. b1 + f1 + a3 == c3 + c4
页面进入 请求亚盘盘口 亚盘开盘 请求比赛状态 赛后 = 显示预测结果 显示比分

7. 点击购买小炮预测
根据接口返回数据:
// 0:成功返回预测结果数据  == 显示预测结果
// 300:未绑定手机号码  == 跳转到绑定手机页面
// 402:暂无单场的购买记录
// 405:未购买当前玩法预测数据 == 请求变价接口 显示真实的价格 显示弹窗
// 其他 直接显示提示

8. 点击弹出层立即支付按钮
// "code":201 不存在订单号 生成订单号后打开预支付页面paypre.html
// "code":200 已存在订单号  直接打开预支付页面paypre.html
// 其他  直接显示提示


9.预支付页面paypre.html  点击支付  打开支付页面 支付

10.弹出层 我已支付成功按钮 
再次判断是否登录
// "code":200 显示预测结果
// 其他 直接显示提示


11.d1---d2 == 3+4 
登录后  主动请求一次  重新走3或者4 流程





1.b2 + f2 == c2
点击胜平负 请求盘口 未开盘 = 支付按钮置灰
2. b2 + f1 + a1 + d2 == c1      
点击胜平负 请求盘口 开盘 请求比赛状态 赛前 未登录  = 显示支付按钮
3. b2 + f1 + a1 + d1 + e2 == c3
点击胜平负 请求盘口 开盘 请求比赛状态 赛前 已登录 未支付 = 显示支付按钮
4. b2 + f1 + a1 + d1 + e1 == c3
点击胜平负 请求盘口 开盘 请求比赛状态 赛前 已登录 已支付 = 显示预测结果
5. b2 + f1 + a2 == c3 + c4
点击胜平负 请求盘口 开盘 请求比赛状态 赛中 = 显示预测结果 显示比分  一分钟刷一次接口
6. b2 + f1 + a3 == c3 + c4
点击胜平负 请求盘口 开盘 请求比赛状态 赛后 = 显示预测结果 显示比分
 

1.b3 + f2 == c2
点击大小球 请求盘口 未开盘 = 支付按钮置灰
2. b3 + f1 + a1 + d2 == c1      
点击大小球 请求盘口 开盘 请求比赛状态 赛前 未登录  = 显示支付按钮
3. b3 + f1 + a1 + d1 + e2 == c3
点击大小球 请求盘口 开盘 请求比赛状态 赛前 已登录 未支付 = 显示支付按钮
4. b3 + f1 + a1 + d1 + e1 == c3
点击大小球 请求盘口 开盘 请求比赛状态 赛前 已登录 已支付 = 显示预测结果
5. b3 + f1 + a2 == c3 + c4
点击大小球 请求盘口 开盘 请求比赛状态 赛中 = 显示预测结果 显示比分  一分钟刷一次接口
6. b3 + f1 + a3 == c3 + c4
点击大小球 请求盘口 开盘 请求比赛状态 赛后 = 显示预测结果 显示比分


###模型数据页面
(1)请求鉴权接口   根据返回的比赛状态:
1.（未赛）1
1.1  根据盘口  0.支付按钮置灰 1.显示支付按钮
1.2 请求单个鉴权接口  判断是否已购买 
//code == 0  已购买   显示预测结果
//其他 未购买

2.（赛中）2 （完赛）3  显示预测结果
3. 点击购买小炮预测  7-11 重新走这个流程
4. d1---d2 == 3+4 
登录后  主动请求一次  重新走1 流程








##代码地址
1. 前端代码在工程目录的 euro 下。

##前端自动化工具
1.使用 FIS3（v3.3.15版本，需要运行 node v4.2.5版本） 作为前端代码管理工具，主要功能包括合并文件、JS 压缩、CSS 压缩、LESS 处理、图片雪碧图自动合并等功能。FIS 配置文件在 fstar_mithril/fis-conf.js(fis-conf_3.js)。FIS3 使用文档，参考：http://fis.baidu.com/fis3/docs/beginning/intro.html。 
2. fis3安装和插件：
```
npm install -g fis3@3.3.15
npm install -g fis-parser-less
npm install -g fis3-postpackager-loader
根据提示安装缺少的插件
```
4.fis3常用命令：
```
cd ~/workspace/github/euro
  
<!-- 启动本地服务 -->
sudo fis3 server start -p 15080 
<!-- 清除本地服务器内容 -->
sudo fis3 server clean 
<!-- 编译本地文件 -->
sudo fis3 release -w
<!-- 停止本地服务 -->
sudo fis3 server stop
```

##前端项目详情

```
project(sinaTicketsNBA2.0)
  ├─ htmls   (统一配置)  
  │  ├─ commonHead.html (头部文件) 
  │  ├─ footer.html (底部文件) 
  │  ├─ header.html (头部文件) 
  ├─ images   (图片)  
  │  ├─ more
  ├─ less   (less) 
  │  ├─ common.less
  │  │  └─ constant.less  (less变量)
  │  │  └─ reset.less  (初始化样式)
  │  │  └─ top.less  (顶部样式)
  │  │  └─ top_account.less  (顶部登录样式)
  │  │  └─ header + footer + container(公共样式)
  │  ├─ more
  ├─ scripts    (工程模块)
  │  ├─ lib     (基础模块)
  │  │  └─ doT.min.js  (doT模板)
  │  │  └─ echarts.min.js  (百度图表)
  │  │  └─ jquery-1.11.1.js  (jquery)
  │  │  └─ lib_sea.js  (代码集成)
  │  │  └─ lib_top.js  (代码集成)
  │  │  └─ outlogin_layer.js  (登录模块lib_top.js)
  │  │  └─ sea.js  (模块加载器lib_sea.js)
  │  │  └─ sea_config.js  (模块加载器初始配置lib_sea.js)
  │  │  └─ top.js  (顶通lib_top.js)
  │  │  └─ user_panel_new_version.js  (登录模块lib_top.js)
  │  │  └─ more
  │  ├─ common.js  (公共模块)
  │  ├─ outcome.js  (胜负预测)
  ├─ fis-conf.js    (fis3编译配置)
  ├─ index.html    (首页面)
  ├─ letpoints.html    (让分预测页面)
  ├─ orderservice.html    (订购服务页面)
  ├─ outcome.html    (胜负预测页面)
  ├─ size.html    (大小分预测页面)
  ├─ step.html    (忽略:一些快捷命令)
  ├─ unique.html    (智能特色页面)
  ...
```
###html文件
1.index.html 首页面
#####在html中嵌入统一头部资源
```
<link rel="import" href="htmls/commonHead.html?__inline">
```
#####引入公共样式
```
<link rel="stylesheet" href="less/common.less" type="text/css">
```
#####默认已选菜单idx
```
<script type="text/javascript">
    window.__navIdx = 0;
</script>
```
#####页面顶通和菜单导航
```
<link rel="import" href="htmls/header.html?__inline">
```
#####内容主体
```
<div id="container" style="height: 300px;"> </div>
```
#####底部信息+登录组件初始化+引入lib_top.js,lib_sea.js
```
<link rel="import" href="htmls/footer.html?__inline">
```
#####doT template(可选)
```
  <script src="scripts/lib/doT.min.js"></script>
  <script type="text/template" id="indexTmpl">
    <% if (it.length<=0) { %>
      <div class="aohItem">无</div>
    <% } else {
      for (var i = 0, l = it.length; i < l; i++) { 
        var hotel = it[i];
    %>
      <div class="aohItem">
        <% if (hotel.selected) { %>
          <div class="aohIcon aohIconSelect" data-hotelid=<%= hotel.id %>></div>
        <% } else { %>
          <div class="aohIconGray" data-hotelid=<%= hotel.id %>></div>
        <% } %>
        <%= hotel.name %>
        <span><%= hotel.salesPerson %></span>
      </div>
    <% }}%>
  </script>
  <!-- 
   * doT 调用
   * var tmpl = $('#indexTmpl').html();
   * var render = doT.template(tmpl);
   * var html = render(data);
   * $('#container').html(html);
   *
   -->
```
#####引入百度图表(可选)
```
<script type="text/javascript" src="scripts/lib/echarts.min.js"></script>
```

#####页面js调用初始化
```
  <script type="text/javascript">
  seajs.config({
    alias:{
      common:"./scripts/common.js"
    }
  });
  seajs.use(["common"]);
  </script>
```



###images
相关图片和雪碧图(图片会被发布为绝对路径)
```
.common-icon-search-city{
  width: 19px;
  height: 20px;
  background: url(../images/searchIconCity@2x.png?__sprite) no-repeat;
}
```
###Less
样式文件才用less  发布为css
```
@import url('./constant.less');
```
通过@import 集成为  common.less 和 app.less





date.html 和index.html区别
1.window.__curdate = util.getQueryString("curdate") || '2016-06-11';
2.去掉<!-- firstSection -->








