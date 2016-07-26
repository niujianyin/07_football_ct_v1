// queryToJson
util.queryToJson = (function(require, exports, module) {
  return function(json){
    var queryArr = [];
        var getStr = function(data){
            return data.toString();
        };
        if(typeof json == 'object'){
            for(var k in json){
                if(json[k] instanceof Array){
                    for(var i = 0, len = json[k].length; i < len; i++){
                        queryArr.push(k + '=' + getStr(json[k][i]));
                    }
                }else{
                    queryArr.push(k + '=' +getStr(json[k]));
                }
            }
        }
        if(queryArr.length){
            return queryArr.join('&');
        }else{
            return '';
        }
  };

})();