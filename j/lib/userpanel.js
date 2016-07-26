// userpanel
util.userpanel = (function(require, exports, module) {
  var jq = jQuery;
  (function() {
    if (!STK) {
      var STK = function() {
        var pkgs = {};
        var main = "theia";
        var logList = [];
        var logMax = 200;
        var logFunction;
        pkgs[main] = {
          IE: /msie/i.test(navigator.userAgent),
          E: function(id) {
            if (typeof id === "string") {
              return document.getElementById(id);
            } else {
              return id;
            }
          },
          C: function(tagName) {
            var dom;
            tagName = tagName.toUpperCase();
            if (tagName == "TEXT") {
              dom = document.createTextNode("");
            } else if (tagName == "BUFFER") {
              dom = document.createDocumentFragment();
            } else {
              dom = document.createElement(tagName);
            }
            return dom;
          },
          log: function() {
            var logError,
              args = arguments,
              l = args.length,
              logArray = [].slice.apply(args, [0, l]),
              logType = "error",
              result;
            while (logArray[--l]) {
              if (logArray[l] instanceof Error) {
                logError = logArray.splice(l, 1)[0];
                break;
              }
            }
            if (!logError) {
              logError = new Error;
              logType = "log";
            }
            result = [logArray, logType, (new Date).getTime(), logError.message, logError.stack];
            if (logFunction) {
              try {
                logFunction.apply(null, result);
              } catch (exp) {}
            } else {
              logList.length >= logMax && logList.shift();
              logList.push(result);
            }
          },
          _regLogFn: function(fn) {
            logFunction = fn;
          },
          _clearLogList: function() {
            return logList.splice(0, logList.length);
          }
        };
        var that = pkgs[main];
        that.register = function(ns, maker, pkgName) {
          if (!pkgName || typeof pkgName != "string") {
            pkgName = main;
          }
          if (!pkgs[pkgName]) {
            pkgs[pkgName] = {};
          }
          var pkg = pkgs[pkgName];
          var NSList = ns.split(".");
          var step = pkg;
          var k = null;
          while (k = NSList.shift()) {
            if (NSList.length) {
              if (step[k] === undefined) {
                step[k] = {};
              }
              step = step[k];
            } else {
              if (step[k] === undefined) {
                try {
                  if (pkgName && pkgName !== main) {
                    if (ns === "core.util.listener") {
                      step[k] = pkgs[main].core.util.listener;
                      return true;
                    }
                    if (ns === "core.util.connect") {
                      step[k] = pkgs[main].core.util.connect;
                      return true;
                    }
                  }
                  step[k] = maker(pkg);
                  return true;
                } catch (exp) {
                  setTimeout(function() {
                    console.log(exp);
                  }, 0);
                }
              }
            }
          }
          return false;
        };
        that.unRegister = function(ns, pkgName) {
          if (!pkgName || typeof pkgName != "string") {
            pkgName = main;
          }
          var pkg = pkgs[pkgName];
          var NSList = ns.split(".");
          var step = pkg;
          var k = null;
          while (k = NSList.shift()) {
            if (NSList.length) {
              if (step[k] === undefined) {
                return false;
              }
              step = step[k];
            } else {
              if (step[k] !== undefined) {
                delete step[k];
                return true;
              }
            }
          }
          return false;
        };
        that.regShort = function(sname, sfun) {
          if (that[sname] !== undefined) {
            throw "[" + sname + "] : short : has been register";
          }
          that[sname] = sfun;
        };
        that.shortRegister = function(ns, shortName, pkgName) {
          if (!pkgName || typeof pkgName != "string") {
            pkgName = main;
          }
          var pkg = pkgs[pkgName];
          var NSList = ns.split(".");
          if (!shortName) {
            return false;
          }
          if (pkg[shortName]) {
            return false;
          }
          var step = pkg;
          var k = null;
          while (k = NSList.shift()) {
            if (NSList.length) {
              if (step[k] === undefined) {
                return false;
              }
              step = step[k];
            } else {
              if (step[k] !== undefined) {
                if (pkg[shortName]) {
                  return false;
                }
                pkg[shortName] = step[k];
                return true;
              }
            }
          }
          return false;
        };
        that.getPKG = function(pkgName) {
          if (!pkgName || typeof pkgName != "string") {
            pkgName = main;
          }
          return pkgs[pkgName];
        };
        return that;
      }();
    };


    STK.register("core.dom.sizzle", function($) {
      var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
        done = 0,
        toString = Object.prototype.toString,
        hasDuplicate = false,
        baseHasDuplicate = true;
      [0, 0].sort(function() {
        baseHasDuplicate = false;
        return 0;
      });
      var Sizzle = function(selector, context, results, seed) {
        results = results || [];
        context = context || document;
        var origContext = context;
        if (context.nodeType !== 1 && context.nodeType !== 9) {
          return [];
        }
        if (!selector || typeof selector !== "string") {
          return results;
        }
        var parts = [],
          m, set, checkSet, extra,
          prune = true,
          contextXML = Sizzle.isXML(context),
          soFar = selector,
          ret, cur, pop, i;
        do {
          chunker.exec("");
          m = chunker.exec(soFar);
          if (m) {
            soFar = m[3];
            parts.push(m[1]);
            if (m[2]) {
              extra = m[3];
              break;
            }
          }
        } while (m);
        if (parts.length > 1 && origPOS.exec(selector)) {
          if (parts.length === 2 && Expr.relative[parts[0]]) {
            set = posProcess(parts[0] + parts[1], context);
          } else {
            set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
            while (parts.length) {
              selector = parts.shift();
              if (Expr.relative[selector]) {
                selector += parts.shift();
              }
              set = posProcess(selector, set);
            }
          }
        } else {
          if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {
            ret = Sizzle.find(parts.shift(), context, contextXML);
            context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
          }
          if (context) {
            ret = seed ? {
              expr: parts.pop(),
              set: makeArray(seed)
            } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
            set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
            if (parts.length > 0) {
              checkSet = makeArray(set);
            } else {
              prune = false;
            }
            while (parts.length) {
              cur = parts.pop();
              pop = cur;
              if (!Expr.relative[cur]) {
                cur = "";
              } else {
                pop = parts.pop();
              }
              if (pop == null) {
                pop = context;
              }
              Expr.relative[cur](checkSet, pop, contextXML);
            }
          } else {
            checkSet = parts = [];
          }
        }
        if (!checkSet) {
          checkSet = set;
        }
        if (!checkSet) {
          Sizzle.error(cur || selector);
        }
        if (toString.call(checkSet) === "[object Array]") {
          if (!prune) {
            results.push.apply(results, checkSet);
          } else if (context && context.nodeType === 1) {
            for (i = 0; checkSet[i] != null; i++) {
              if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                results.push(set[i]);
              }
            }
          } else {
            for (i = 0; checkSet[i] != null; i++) {
              if (checkSet[i] && checkSet[i].nodeType === 1) {
                results.push(set[i]);
              }
            }
          }
        } else {
          makeArray(checkSet, results);
        }
        if (extra) {
          Sizzle(extra, origContext, results, seed);
          Sizzle.uniqueSort(results);
        }
        return results;
      };
      Sizzle.uniqueSort = function(results) {
        if (sortOrder) {
          hasDuplicate = baseHasDuplicate;
          results.sort(sortOrder);
          if (hasDuplicate) {
            for (var i = 1; i < results.length; i++) {
              if (results[i] === results[i - 1]) {
                results.splice(i--, 1);
              }
            }
          }
        }
        return results;
      };
      Sizzle.matches = function(expr, set) {
        return Sizzle(expr, null, null, set);
      };
      Sizzle.find = function(expr, context, isXML) {
        var set;
        if (!expr) {
          return [];
        }
        for (var i = 0, l = Expr.order.length; i < l; i++) {
          var type = Expr.order[i],
            match;
          if (match = Expr.leftMatch[type].exec(expr)) {
            var left = match[1];
            match.splice(1, 1);
            if (left.substr(left.length - 1) !== "\\") {
              match[1] = (match[1] || "").replace(/\\/g, "");
              set = Expr.find[type](match, context, isXML);
              if (set != null) {
                expr = expr.replace(Expr.match[type], "");
                break;
              }
            }
          }
        }
        if (!set) {
          set = context.getElementsByTagName("*");
        }
        return {
          set: set,
          expr: expr
        };
      };
      Sizzle.filter = function(expr, set, inplace, not) {
        var old = expr,
          result = [],
          curLoop = set,
          match, anyFound,
          isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);
        while (expr && set.length) {
          for (var type in Expr.filter) {
            if ((match = Expr.leftMatch[type].exec(expr)) != null && match[2]) {
              var filter = Expr.filter[type],
                found, item,
                left = match[1];
              anyFound = false;
              match.splice(1, 1);
              if (left.substr(left.length - 1) === "\\") {
                continue;
              }
              if (curLoop === result) {
                result = [];
              }
              if (Expr.preFilter[type]) {
                match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
                if (!match) {
                  anyFound = found = true;
                } else if (match === true) {
                  continue;
                }
              }
              if (match) {
                for (var i = 0;
                  (item = curLoop[i]) != null; i++) {
                  if (item) {
                    found = filter(item, match, i, curLoop);
                    var pass = not ^ !!found;
                    if (inplace && found != null) {
                      if (pass) {
                        anyFound = true;
                      } else {
                        curLoop[i] = false;
                      }
                    } else if (pass) {
                      result.push(item);
                      anyFound = true;
                    }
                  }
                }
              }
              if (found !== undefined) {
                if (!inplace) {
                  curLoop = result;
                }
                expr = expr.replace(Expr.match[type], "");
                if (!anyFound) {
                  return [];
                }
                break;
              }
            }
          }
          if (expr === old) {
            if (anyFound == null) {
              Sizzle.error(expr);
            } else {
              break;
            }
          }
          old = expr;
        }
        return curLoop;
      };
      Sizzle.error = function(msg) {
        throw "Syntax error, unrecognized expression: " + msg;
      };
      var Expr = {
        order: ["ID", "NAME", "TAG"],
        match: {
          ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
          CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
          NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
          ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
          TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
          CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
          POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
          PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
        },
        leftMatch: {},
        attrMap: {
          "class": "className",
          "for": "htmlFor"
        },
        attrHandle: {
          href: function(elem) {
            return elem.getAttribute("href");
          }
        },
        relative: {
          "+": function(checkSet, part) {
            var isPartStr = typeof part === "string",
              isTag = isPartStr && !/\W/.test(part),
              isPartStrNotTag = isPartStr && !isTag;
            if (isTag) {
              part = part.toLowerCase();
            }
            for (var i = 0, l = checkSet.length, elem; i < l; i++) {
              if (elem = checkSet[i]) {
                while ((elem = elem.previousSibling) && elem.nodeType !== 1) {}
                checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part;
              }
            }
            if (isPartStrNotTag) {
              Sizzle.filter(part, checkSet, true);
            }
          },
          ">": function(checkSet, part) {
            var isPartStr = typeof part === "string",
              elem,
              i = 0,
              l = checkSet.length;
            if (isPartStr && !/\W/.test(part)) {
              part = part.toLowerCase();
              for (; i < l; i++) {
                elem = checkSet[i];
                if (elem) {
                  var parent = elem.parentNode;
                  checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                }
              }
            } else {
              for (; i < l; i++) {
                elem = checkSet[i];
                if (elem) {
                  checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part;
                }
              }
              if (isPartStr) {
                Sizzle.filter(part, checkSet, true);
              }
            }
          },
          "": function(checkSet, part, isXML) {
            var doneName = done++,
              checkFn = dirCheck,
              nodeCheck;
            if (typeof part === "string" && !/\W/.test(part)) {
              part = part.toLowerCase();
              nodeCheck = part;
              checkFn = dirNodeCheck;
            }
            checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
          },
          "~": function(checkSet, part, isXML) {
            var doneName = done++,
              checkFn = dirCheck,
              nodeCheck;
            if (typeof part === "string" && !/\W/.test(part)) {
              part = part.toLowerCase();
              nodeCheck = part;
              checkFn = dirNodeCheck;
            }
            checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
          }
        },
        find: {
          ID: function(match, context, isXML) {
            if (typeof context.getElementById !== "undefined" && !isXML) {
              var m = context.getElementById(match[1]);
              return m ? [m] : [];
            }
          },
          NAME: function(match, context) {
            if (typeof context.getElementsByName !== "undefined") {
              var ret = [],
                results = context.getElementsByName(match[1]);
              for (var i = 0, l = results.length; i < l; i++) {
                if (results[i].getAttribute("name") === match[1]) {
                  ret.push(results[i]);
                }
              }
              return ret.length === 0 ? null : ret;
            }
          },
          TAG: function(match, context) {
            return context.getElementsByTagName(match[1]);
          }
        },
        preFilter: {
          CLASS: function(match, curLoop, inplace, result, not, isXML) {
            match = " " + match[1].replace(/\\/g, "") + " ";
            if (isXML) {
              return match;
            }
            for (var i = 0, elem;
              (elem = curLoop[i]) != null; i++) {
              if (elem) {
                if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0)) {
                  if (!inplace) {
                    result.push(elem);
                  }
                } else if (inplace) {
                  curLoop[i] = false;
                }
              }
            }
            return false;
          },
          ID: function(match) {
            return match[1].replace(/\\/g, "");
          },
          TAG: function(match, curLoop) {
            return match[1].toLowerCase();
          },
          CHILD: function(match) {
            if (match[1] === "nth") {
              var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
              match[2] = test[1] + (test[2] || 1) - 0;
              match[3] = test[3] - 0;
            }
            match[0] = done++;
            return match;
          },
          ATTR: function(match, curLoop, inplace, result, not, isXML) {
            var name = match[1].replace(/\\/g, "");
            if (!isXML && Expr.attrMap[name]) {
              match[1] = Expr.attrMap[name];
            }
            if (match[2] === "~=") {
              match[4] = " " + match[4] + " ";
            }
            return match;
          },
          PSEUDO: function(match, curLoop, inplace, result, not) {
            if (match[1] === "not") {
              if ((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])) {
                match[3] = Sizzle(match[3], null, null, curLoop);
              } else {
                var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
                if (!inplace) {
                  result.push.apply(result, ret);
                }
                return false;
              }
            } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
              return true;
            }
            return match;
          },
          POS: function(match) {
            match.unshift(true);
            return match;
          }
        },
        filters: {
          enabled: function(elem) {
            return elem.disabled === false && elem.type !== "hidden";
          },
          disabled: function(elem) {
            return elem.disabled === true;
          },
          checked: function(elem) {
            return elem.checked === true;
          },
          selected: function(elem) {
            elem.parentNode.selectedIndex;
            return elem.selected === true;
          },
          parent: function(elem) {
            return !!elem.firstChild;
          },
          empty: function(elem) {
            return !elem.firstChild;
          },
          has: function(elem, i, match) {
            return !!Sizzle(match[3], elem).length;
          },
          header: function(elem) {
            return /h\d/i.test(elem.nodeName);
          },
          text: function(elem) {
            return "text" === elem.type;
          },
          radio: function(elem) {
            return "radio" === elem.type;
          },
          checkbox: function(elem) {
            return "checkbox" === elem.type;
          },
          file: function(elem) {
            return "file" === elem.type;
          },
          password: function(elem) {
            return "password" === elem.type;
          },
          submit: function(elem) {
            return "submit" === elem.type;
          },
          image: function(elem) {
            return "image" === elem.type;
          },
          reset: function(elem) {
            return "reset" === elem.type;
          },
          button: function(elem) {
            return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
          },
          input: function(elem) {
            return /input|select|textarea|button/i.test(elem.nodeName);
          }
        },
        setFilters: {
          first: function(elem, i) {
            return i === 0;
          },
          last: function(elem, i, match, array) {
            return i === array.length - 1;
          },
          even: function(elem, i) {
            return i % 2 === 0;
          },
          odd: function(elem, i) {
            return i % 2 === 1;
          },
          lt: function(elem, i, match) {
            return i < match[3] - 0;
          },
          gt: function(elem, i, match) {
            return i > match[3] - 0;
          },
          nth: function(elem, i, match) {
            return match[3] - 0 === i;
          },
          eq: function(elem, i, match) {
            return match[3] - 0 === i;
          }
        },
        filter: {
          PSEUDO: function(elem, match, i, array) {
            var name = match[1],
              filter = Expr.filters[name];
            if (filter) {
              return filter(elem, i, match, array);
            } else if (name === "contains") {
              return (elem.textContent || elem.innerText || Sizzle.getText([elem]) || "").indexOf(match[3]) >= 0;
            } else if (name === "not") {
              var not = match[3];
              for (var j = 0, l = not.length; j < l; j++) {
                if (not[j] === elem) {
                  return false;
                }
              }
              return true;
            } else {
              Sizzle.error("Syntax error, unrecognized expression: " + name);
            }
          },
          CHILD: function(elem, match) {
            var type = match[1],
              node = elem;
            switch (type) {
              case "only":
              case "first":
                while (node = node.previousSibling) {
                  if (node.nodeType === 1) {
                    return false;
                  }
                }
                if (type === "first") {
                  return true;
                }
                node = elem;
              case "last":
                while (node = node.nextSibling) {
                  if (node.nodeType === 1) {
                    return false;
                  }
                }
                return true;
              case "nth":
                var first = match[2],
                  last = match[3];
                if (first === 1 && last === 0) {
                  return true;
                }
                var doneName = match[0],
                  parent = elem.parentNode;
                if (parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
                  var count = 0;
                  for (node = parent.firstChild; node; node = node.nextSibling) {
                    if (node.nodeType === 1) {
                      node.nodeIndex = ++count;
                    }
                  }
                  parent.sizcache = doneName;
                }
                var diff = elem.nodeIndex - last;
                if (first === 0) {
                  return diff === 0;
                } else {
                  return diff % first === 0 && diff / first >= 0;
                }
            }
          },
          ID: function(elem, match) {
            return elem.nodeType === 1 && elem.getAttribute("id") === match;
          },
          TAG: function(elem, match) {
            return match === "*" && elem.nodeType === 1 || elem.nodeName.toLowerCase() === match;
          },
          CLASS: function(elem, match) {
            return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1;
          },
          ATTR: function(elem, match) {
            var name = match[1],
              result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name),
              value = result + "",
              type = match[2],
              check = match[4];
            return result == null ? type === "!=" : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false;
          },
          POS: function(elem, match, i, array) {
            var name = match[2],
              filter = Expr.setFilters[name];
            if (filter) {
              return filter(elem, i, match, array);
            }
          }
        }
      };
      Sizzle.selectors = Expr;
      var origPOS = Expr.match.POS,
        fescape = function(all, num) {
          return "\\" + (num - 0 + 1);
        };
      for (var type in Expr.match) {
        Expr.match[type] = new RegExp(Expr.match[type].source + /(?![^\[]*\])(?![^\(]*\))/.source);
        Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
      }
      var makeArray = function(array, results) {
        array = Array.prototype.slice.call(array, 0);
        if (results) {
          results.push.apply(results, array);
          return results;
        }
        return array;
      };
      try {
        Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;
      } catch (e) {
        makeArray = function(array, results) {
          var ret = results || [],
            i = 0;
          if (toString.call(array) === "[object Array]") {
            Array.prototype.push.apply(ret, array);
          } else {
            if (typeof array.length === "number") {
              for (var l = array.length; i < l; i++) {
                ret.push(array[i]);
              }
            } else {
              for (; array[i]; i++) {
                ret.push(array[i]);
              }
            }
          }
          return ret;
        };
      }
      var sortOrder;
      if (document.documentElement.compareDocumentPosition) {
        sortOrder = function(a, b) {
          if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
            if (a == b) {
              hasDuplicate = true;
            }
            return a.compareDocumentPosition ? -1 : 1;
          }
          var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
          if (ret === 0) {
            hasDuplicate = true;
          }
          return ret;
        };
      } else if ("sourceIndex" in document.documentElement) {
        sortOrder = function(a, b) {
          if (!a.sourceIndex || !b.sourceIndex) {
            if (a == b) {
              hasDuplicate = true;
            }
            return a.sourceIndex ? -1 : 1;
          }
          var ret = a.sourceIndex - b.sourceIndex;
          if (ret === 0) {
            hasDuplicate = true;
          }
          return ret;
        };
      } else if (document.createRange) {
        sortOrder = function(a, b) {
          if (!a.ownerDocument || !b.ownerDocument) {
            if (a == b) {
              hasDuplicate = true;
            }
            return a.ownerDocument ? -1 : 1;
          }
          var aRange = a.ownerDocument.createRange(),
            bRange = b.ownerDocument.createRange();
          aRange.setStart(a, 0);
          aRange.setEnd(a, 0);
          bRange.setStart(b, 0);
          bRange.setEnd(b, 0);
          var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
          if (ret === 0) {
            hasDuplicate = true;
          }
          return ret;
        };
      }
      Sizzle.getText = function(elems) {
        var ret = "",
          elem;
        for (var i = 0; elems[i]; i++) {
          elem = elems[i];
          if (elem.nodeType === 3 || elem.nodeType === 4) {
            ret += elem.nodeValue;
          } else if (elem.nodeType !== 8) {
            ret += Sizzle.getText(elem.childNodes);
          }
        }
        return ret;
      };
      (function() {
        var form = document.createElement("div"),
          id = "script" + (new Date).getTime();
        form.innerHTML = "<a name='" + id + "'/>";
        var root = document.documentElement;
        root.insertBefore(form, root.firstChild);
        if (document.getElementById(id)) {
          Expr.find.ID = function(match, context, isXML) {
            if (typeof context.getElementById !== "undefined" && !isXML) {
              var m = context.getElementById(match[1]);
              return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
            }
          };
          Expr.filter.ID = function(elem, match) {
            var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
            return elem.nodeType === 1 && node && node.nodeValue === match;
          };
        }
        root.removeChild(form);
        root = form = null;
      })();
      (function() {
        var div = document.createElement("div");
        div.appendChild(document.createComment(""));
        if (div.getElementsByTagName("*").length > 0) {
          Expr.find.TAG = function(match, context) {
            var results = context.getElementsByTagName(match[1]);
            if (match[1] === "*") {
              var tmp = [];
              for (var i = 0; results[i]; i++) {
                if (results[i].nodeType === 1) {
                  tmp.push(results[i]);
                }
              }
              results = tmp;
            }
            return results;
          };
        }
        div.innerHTML = "<a href='#'></a>";
        if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") {
          Expr.attrHandle.href = function(elem) {
            return elem.getAttribute("href", 2);
          };
        }
        div = null;
      })();
      if (document.querySelectorAll) {
        (function() {
          var oldSizzle = Sizzle,
            div = document.createElement("div");
          div.innerHTML = "<p class='TEST'></p>";
          if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
            return;
          }
          Sizzle = function(query, context, extra, seed) {
            context = context || document;
            if (!seed && context.nodeType === 9 && !Sizzle.isXML(context)) {
              try {
                return makeArray(context.querySelectorAll(query), extra);
              } catch (e) {}
            }
            return oldSizzle(query, context, extra, seed);
          };
          for (var prop in oldSizzle) {
            Sizzle[prop] = oldSizzle[prop];
          }
          div = null;
        })();
      }
      (function() {
        var div = document.createElement("div");
        div.innerHTML = "<div class='test e'></div><div class='test'></div>";
        if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
          return;
        }
        div.lastChild.className = "e";
        if (div.getElementsByClassName("e").length === 1) {
          return;
        }
        Expr.order.splice(1, 0, "CLASS");
        Expr.find.CLASS = function(match, context, isXML) {
          if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
            return context.getElementsByClassName(match[1]);
          }
        };
        div = null;
      })();

      function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        for (var i = 0, l = checkSet.length; i < l; i++) {
          var elem = checkSet[i];
          if (elem) {
            elem = elem[dir];
            var match = false;
            while (elem) {
              if (elem.sizcache === doneName) {
                match = checkSet[elem.sizset];
                break;
              }
              if (elem.nodeType === 1 && !isXML) {
                elem.sizcache = doneName;
                elem.sizset = i;
              }
              if (elem.nodeName.toLowerCase() === cur) {
                match = elem;
                break;
              }
              elem = elem[dir];
            }
            checkSet[i] = match;
          }
        }
      }

      function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        for (var i = 0, l = checkSet.length; i < l; i++) {
          var elem = checkSet[i];
          if (elem) {
            elem = elem[dir];
            var match = false;
            while (elem) {
              if (elem.sizcache === doneName) {
                match = checkSet[elem.sizset];
                break;
              }
              if (elem.nodeType === 1) {
                if (!isXML) {
                  elem.sizcache = doneName;
                  elem.sizset = i;
                }
                if (typeof cur !== "string") {
                  if (elem === cur) {
                    match = true;
                    break;
                  }
                } else if (Sizzle.filter(cur, [elem]).length > 0) {
                  match = elem;
                  break;
                }
              }
              elem = elem[dir];
            }
            checkSet[i] = match;
          }
        }
      }
      Sizzle.contains = document.compareDocumentPosition ? function(a, b) {
        return !!(a.compareDocumentPosition(b) & 16);
      } : function(a, b) {
        return a !== b && (a.contains ? a.contains(b) : true);
      };
      Sizzle.isXML = function(elem) {
        var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
      };
      var posProcess = function(selector, context) {
        var tmpSet = [],
          later = "",
          match,
          root = context.nodeType ? [context] : context;
        while (match = Expr.match.PSEUDO.exec(selector)) {
          later += match[0];
          selector = selector.replace(Expr.match.PSEUDO, "");
        }
        selector = Expr.relative[selector] ? selector + "*" : selector;
        for (var i = 0, l = root.length; i < l; i++) {
          Sizzle(selector, root[i], tmpSet);
        }
        return Sizzle.filter(later, tmpSet);
      };
      return Sizzle;
    });;


    STK.register("core.dom.builder", function($) {
      return function(sHTML, oSelector) {
        var isHTML = typeof sHTML === "string";
        var container = sHTML;
        if (isHTML) {
          container = $.C("div");
          container.innerHTML = sHTML;
        }
        var domList, totalList;
        domList = {};
        if (oSelector) {
          for (key in selectorList) {
            domList[key] = $.core.dom.sizzle(oSelector[key].toString(), container);
          }
        } else {
          totalList = $.core.dom.sizzle("[node-type]", container);
          for (var i = 0, len = totalList.length; i < len; i += 1) {
            var key = totalList[i].getAttribute("node-type");
            if (!domList[key]) {
              domList[key] = [];
            }
            domList[key].push(totalList[i]);
          }
        }
        var domBox = sHTML;
        if (isHTML) {
          domBox = $.C("buffer");
          while (container.childNodes[0]) {
            domBox.appendChild(container.childNodes[0]);
          }
        }
        return {
          box: domBox,
          list: domList
        };
      };
    });;


    STK.register("core.dom.isNode", function($) {
      return function(node) {
        return node != undefined && Boolean(node.nodeName) && Boolean(node.nodeType);
      };
    });;


    STK.register("core.evt.addEvent", function($) {
      return function(el, type, fn) {
        el = $.E(el);
        if (el == null) {
          return false;
        }
        if (typeof fn !== "function") {
          return false;
        }
        if (el.addEventListener) {
          el.addEventListener(type, fn, false);
        } else if (el.attachEvent) {
          el.attachEvent("on" + type, fn);
        } else {
          el["on" + type] = fn;
        }
        return true;
      };
    });;


    STK.register("core.util.browser", function($) {
      var ua = navigator.userAgent.toLowerCase();
      var external = window.external || "";
      var core, m, extra, version, os;
      var numberify = function(s) {
        var c = 0;
        return parseFloat(s.replace(/\./g, function() {
          return c++ == 1 ? "" : ".";
        }));
      };
      try {
        if (/windows|win32/i.test(ua)) {
          os = "windows";
        } else if (/macintosh/i.test(ua)) {
          os = "macintosh";
        } else if (/rhino/i.test(ua)) {
          os = "rhino";
        }
        if ((m = ua.match(/applewebkit\/([^\s]*)/)) && m[1]) {
          core = "webkit";
          version = numberify(m[1]);
        } else if ((m = ua.match(/presto\/([\d.]*)/)) && m[1]) {
          core = "presto";
          version = numberify(m[1]);
        } else if (m = ua.match(/msie\s([^;]*)/)) {
          core = "trident";
          version = 1;
          if ((m = ua.match(/trident\/([\d.]*)/)) && m[1]) {
            version = numberify(m[1]);
          }
        } else if (/gecko/.test(ua)) {
          core = "gecko";
          version = 1;
          if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
            version = numberify(m[1]);
          }
        }
        if (/world/.test(ua)) {
          extra = "world";
        } else if (/360se/.test(ua)) {
          extra = "360";
        } else if (/maxthon/.test(ua) || typeof external.max_version == "number") {
          extra = "maxthon";
        } else if (/tencenttraveler\s([\d.]*)/.test(ua)) {
          extra = "tt";
        } else if (/se\s([\d.]*)/.test(ua)) {
          extra = "sogou";
        }
      } catch (e) {}
      var ret = {
        OS: os,
        CORE: core,
        Version: version,
        EXTRA: extra ? extra : false,
        IE: /msie/.test(ua),
        OPERA: /opera/.test(ua),
        MOZ: /gecko/.test(ua) && !/(compatible|webkit)/.test(ua),
        IE5: /msie 5 /.test(ua),
        IE55: /msie 5.5/.test(ua),
        IE6: /msie 6/.test(ua),
        IE7: /msie 7/.test(ua),
        IE8: /msie 8/.test(ua),
        IE9: /msie 9/.test(ua),
        IE10: /msie 10/.test(ua),
        SAFARI: !/chrome\/([\d.]*)/.test(ua) && /\/([\da-f.]*) safari/.test(ua),
        CHROME: /chrome\/([\d.]*)/.test(ua),
        IPAD: /\(ipad/i.test(ua),
        IPHONE: /\(iphone/i.test(ua),
        ITOUCH: /\(itouch/i.test(ua),
        MOBILE: /mobile/i.test(ua)
      };
      return ret;
    });;


    STK.register("core.func.getType", function($) {
      return function(oObject) {
        var _t;
        return ((_t = typeof oObject) == "object" ? oObject == null && "null" || Object.prototype.toString.call(oObject).slice(8, -1) : _t).toLowerCase();
      };
    });;


    STK.register("core.dom.ready", function($) {
      var funcList = [];
      var inited = false;
      var getType = $.core.func.getType;
      var browser = $.core.util.browser;
      var addEvent = $.core.evt.addEvent;
      var checkReady = function() {
        if (!inited) {
          if (document.readyState === "complete") {
            return true;
          }
        }
        return inited;
      };
      var execFuncList = function() {
        if (inited == true) {
          return;
        }
        inited = true;
        for (var i = 0, len = funcList.length; i < len; i++) {
          if (getType(funcList[i]) === "function") {
            try {
              funcList[i].call();
            } catch (exp) {}
          }
        }
        funcList = [];
      };
      var scrollMethod = function() {
        if (checkReady()) {
          execFuncList();
          return;
        }
        try {
          document.documentElement.doScroll("left");
        } catch (e) {
          setTimeout(arguments.callee, 25);
          return;
        }
        execFuncList();
      };
      var readyStateMethod = function() {
        if (checkReady()) {
          execFuncList();
          return;
        }
        setTimeout(arguments.callee, 25);
      };
      var domloadMethod = function() {
        addEvent(document, "DOMContentLoaded", execFuncList);
      };
      var windowloadMethod = function() {
        addEvent(window, "load", execFuncList);
      };
      if (!checkReady()) {
        if ($.IE && window === window.top) {
          scrollMethod();
        }
        domloadMethod();
        readyStateMethod();
        windowloadMethod();
      }
      return function(oFunc) {
        if (checkReady()) {
          if (getType(oFunc) === "function") {
            oFunc.call();
          }
        } else {
          funcList.push(oFunc);
        }
      };
    });;


    STK.register("core.dom.setStyle", function($) {
      function supportFilters() {
        if ("y" in supportFilters) {
          return supportFilters.y;
        }
        return supportFilters.y = "filters" in $.C("div");
      }
      return function(node, property, val) {
        if (supportFilters()) {
          switch (property) {
            case "opacity":
              node.style.filter = "alpha(opacity=" + val * 100 + ")";
              if (!node.currentStyle || !node.currentStyle.hasLayout) {
                node.style.zoom = 1;
              }
              break;
            case "float":
              property = "styleFloat";
            default:
              node.style[property] = val;
          }
        } else {
          if (property == "float") {
            property = "cssFloat";
          }
          node.style[property] = val;
        }
      };
    });;


    STK.register("core.dom.getStyle", function($) {
      function supportFilters() {
        if ("y" in supportFilters) {
          return supportFilters.y;
        }
        return supportFilters.y = "filters" in $.C("div");
      }
      return function(node, property) {
        if (supportFilters()) {
          switch (property) {
            case "opacity":
              var val = 100;
              try {
                val = node.filters["DXImageTransform.Microsoft.Alpha"].opacity;
              } catch (e) {
                try {
                  val = node.filters("alpha").opacity;
                } catch (e) {}
              }
              return val / 100;
            case "float":
              property = "styleFloat";
            default:
              var value = node.currentStyle ? node.currentStyle[property] : null;
              return node.style[property] || value;
          }
        } else {
          if (property == "float") {
            property = "cssFloat";
          }
          try {
            var computed = document.defaultView.getComputedStyle(node, "");
          } catch (e) {}
          return node.style[property] || computed ? computed[property] : null;
        }
      };
    });;


    STK.register("core.dom.hasClassName", function($) {
      return function(node, className) {
        return (new RegExp("(^|\\s)" + className + "($|\\s)")).test(node.className);
      };
    });;




    STK.register("core.str.trim", function($) {
      return function(str) {
        if (typeof str !== "string") {
          throw "trim need a string as parameter";
        }
        var len = str.length;
        var s = 0;
        var reg = /(\u3000|\s|\t|\u00A0)/;
        while (s < len) {
          if (!reg.test(str.charAt(s))) {
            break;
          }
          s += 1;
        }
        while (len > s) {
          if (!reg.test(str.charAt(len - 1))) {
            break;
          }
          len -= 1;
        }
        return str.slice(s, len);
      };
    });;


    STK.register("core.dom.addClassName", function($) {
      return function(node, className) {
        if (node.nodeType === 1) {
          if (!$.core.dom.hasClassName(node, className)) {
            node.className = $.core.str.trim(node.className) + " " + className;
          }
        }
      };
    });;




    STK.register("core.dom.removeClassName", function($) {
      return function(node, className) {
        if (node.nodeType === 1) {
          if ($.core.dom.hasClassName(node, className)) {
            node.className = node.className.replace(new RegExp("(^|\\s)" + className + "($|\\s)"), " ");
          }
        }
      };
    });;


    STK.register("core.dom.contains", function($) {
      return function(parent, node) {
        if (!parent || !node) {
          return false;
        }
        if (parent === node) {
          return false;
        } else if (parent.compareDocumentPosition) {
          return (parent.compareDocumentPosition(node) & 16) === 16;
        } else if (parent.contains && node.nodeType === 1) {
          return parent.contains(node);
        } else {
          while (node = node.parentNode) {
            if (parent === node) {
              return true;
            }
          }
        }
        return false;
      };
    });;


    STK.register("core.util.scrollPos", function($) {
      return function(oDocument) {
        oDocument = oDocument || document;
        var dd = oDocument.documentElement;
        var db = oDocument.body;
        return {
          top: Math.max(window.pageYOffset || 0, dd.scrollTop, db.scrollTop),
          left: Math.max(window.pageXOffset || 0, dd.scrollLeft, db.scrollLeft)
        };
      };
    });;




    STK.register("core.obj.parseParam", function($) {
      return function(oSource, oParams, isown) {
        var key,
          obj = {};
        oParams = oParams || {};
        for (key in oSource) {
          obj[key] = oSource[key];
          if (oParams[key] != null) {
            if (isown) {
              if (oSource.hasOwnProperty(key)) {
                obj[key] = oParams[key];
              }
            } else {
              obj[key] = oParams[key];
            }
          }
        }
        return obj;
      };
    });;


    STK.register("core.dom.position", function($) {
      var generalPosition = function(el) {
        var box, scroll, body, docElem, clientTop, clientLeft;
        box = el.getBoundingClientRect();
        scroll = $.core.util.scrollPos();
        body = el.ownerDocument.body;
        docElem = el.ownerDocument.documentElement;
        clientTop = docElem.clientTop || body.clientTop || 0;
        clientLeft = docElem.clientLeft || body.clientLeft || 0;
        return {
          l: parseInt(box.left + scroll["left"] - clientLeft, 10) || 0,
          t: parseInt(box.top + scroll["top"] - clientTop, 10) || 0
        };
      };
      var countPosition = function(el, shell) {
        var pos, parent;
        pos = [el.offsetLeft, el.offsetTop];
        parent = el.offsetParent;
        if (parent !== el && parent !== shell) {
          while (parent) {
            pos[0] += parent.offsetLeft;
            pos[1] += parent.offsetTop;
            parent = parent.offsetParent;
          }
        }
        if ($.core.util.browser.OPERA != -1 || $.core.util.browser.SAFARI != -1 && el.style.position == "absolute") {
          pos[0] -= document.body.offsetLeft;
          pos[1] -= document.body.offsetTop;
        }
        if (el.parentNode) {
          parent = el.parentNode;
        } else {
          parent = null;
        }
        while (parent && !/^body|html$/i.test(parent.tagName) && parent !== shell) {
          if (parent.style.display.search(/^inline|table-row.*$/i)) {
            pos[0] -= parent.scrollLeft;
            pos[1] -= parent.scrollTop;
          }
          parent = parent.parentNode;
        }
        return {
          l: parseInt(pos[0], 10),
          t: parseInt(pos[1], 10)
        };
      };
      return function(oElement, spec) {
        if (oElement == document.body) {
          return false;
        }
        if (oElement.parentNode == null) {
          return false;
        }
        if (oElement.style.display == "none") {
          return false;
        }
        var conf = $.core.obj.parseParam({
          parent: null
        }, spec);
        if (oElement.getBoundingClientRect) {
          if (conf.parent) {
            var o = generalPosition(oElement);
            var p = generalPosition(conf.parent);
            return {
              l: o.l - p.l,
              t: o.t - p.t
            };
          } else {
            return generalPosition(oElement);
          }
        } else {
          return countPosition(oElement, conf.parent || document.body);
        }
      };
    });;




    STK.register("core.util.hideContainer", function($) {
      var hideDiv;
      var initDiv = function() {
        if (hideDiv) return;
        hideDiv = $.C("div");
        hideDiv.style.cssText = "position:absolute;top:-9999px;left:-9999px;";
        document.getElementsByTagName("head")[0].appendChild(hideDiv);
      };
      var that = {
        appendChild: function(el) {
          if ($.core.dom.isNode(el)) {
            initDiv();
            hideDiv.appendChild(el);
          }
        },
        removeChild: function(el) {
          if ($.core.dom.isNode(el)) {
            hideDiv && hideDiv.removeChild(el);
          }
        }
      };
      return that;
    });;




    STK.register("core.dom.getSize", function($) {
      var size = function(dom) {
        if (!$.core.dom.isNode(dom)) {
          throw "core.dom.getSize need Element as first parameter";
        }
        return {
          width: dom.offsetWidth,
          height: dom.offsetHeight
        };
      };
      var getSize = function(dom) {
        var ret = null;
        if (dom.style.display === "none") {
          dom.style.visibility = "hidden";
          dom.style.display = "";
          ret = size(dom);
          dom.style.display = "none";
          dom.style.visibility = "visible";
        } else {
          ret = size(dom);
        }
        return ret;
      };
      return function(dom) {
        var ret = {};
        if (!dom.parentNode) {
          $.core.util.hideContainer.appendChild(dom);
          ret = getSize(dom);
          $.core.util.hideContainer.removeChild(dom);
        } else {
          ret = getSize(dom);
        }
        return ret;
      };
    });;




    STK.register("core.dom.cssText", function($) {
      var getToken = function(cssText) {
        var i = 0;
        var token = [];
        var state = "close";
        var stringing = false;
        var stringType = null;
        var gen_token = function(charSet) {
          token.push({
            type: "info",
            content: cssText.slice(0, i)
          });
          token.push({
            type: "sign",
            content: cssText.slice(i, i + 1)
          });
          cssText = cssText.slice(i + 1);
          i = 0;
        };
        while (cssText) {
          var charSet = cssText.charAt(i);
          switch (charSet) {
            case ":":
              if (!stringing) {
                if (state === "close") {
                  token.push({
                    type: "attr",
                    content: cssText.slice(0, i)
                  });
                  token.push({
                    type: "sign",
                    content: cssText.slice(i, i + 1)
                  });
                  cssText = cssText.slice(i + 1);
                  i = 0;
                  state = "open";
                  break;
                }
              }
              i += 1;
              break;
            case ";":
              if (!stringing) {
                if (state === "open") {
                  token.push({
                    type: "info",
                    content: cssText.slice(0, i)
                  });
                  token.push({
                    type: "sign",
                    content: cssText.slice(i, i + 1)
                  });
                }
                cssText = cssText.slice(i + 1);
                i = 0;
                state = "close";
                break;
              }
              i += 1;
              break;
            case '"':
            case "'":
              if (stringing) {
                if (charSet === stringType) {
                  stringing = !stringing;
                  stringType = null;
                }
              } else {
                stringing = !stringing;
                stringType = charSet;
              }
              i += 1;
              break;
            case " ":
            case "!":
            case ",":
            case "(":
            case ")":
              gen_token(charSet);
              break;
            case "":
              token.push({
                type: "info",
                content: cssText.slice(0, i)
              });
              cssText = "";
              i = 0;
              break;
            default:
              i += 1;
          }
        }
        return token;
      };
      var styleObj = function(token) {
        var ret = {};
        var cur;
        for (var i = 0, len = token.length; i < len; i += 1) {
          if (token[i].type === "attr") {
            cur = token[i]["content"];
            ret[cur] = "";
          } else if (token[i].type === "sign" && token[i]["content"] === ";") {
            cur = null;
            continue;
          } else if (token[i].type === "sign" && token[i]["content"] === ":") {
            continue;
          } else {
            if (cur !== null) {
              ret[cur] += token[i]["content"];
            }
          }
        }
        return ret;
      };
      var css3HeadsRegString = {
        webkit: "-webkit-",
        presto: "-o-",
        trident: "-ms-",
        gecko: "-moz-"
      }[$.core.util.browser.CORE];
      var css3Styles = ["transform", "transform-origin", "transform-style", "transition", "transition-delay", "transition-duration", "transition-property", "transition-timing-function", "animation", "animation-delay", "animation-direction", "animation-duration", "animation-iteration-count", "animation-name", "animation-play-state", "animation-timing-function"];
      var checkCss3Property = function(property) {
        for (var i = 0, len = css3Styles.length; i < len; i += 1) {
          if (property === css3Styles[i]) {
            return true;
          }
        }
        return false;
      };
      return function(oldCss) {
        var cssObj = styleObj(getToken(oldCss || ""));
        var push = function(property, value) {
          property = property.toLowerCase();
          cssObj[property] = value;
          if (checkCss3Property(property)) {
            cssObj[css3HeadsRegString + property] = value;
          }
          return that;
        };
        var that = {
          push: push,
          remove: function(property) {
            property = property.toLowerCase();
            cssObj[property] &&
              delete cssObj[property];
            if (checkCss3Property(property)) {
              if (cssObj[css3HeadsRegString + property]) {
                delete cssObj[css3HeadsRegString + property];
              }
            }
            return that;
          },
          merge: function(cssText) {
            var mergeCssObj = styleObj(getToken(cssText || ""));
            for (var k in mergeCssObj) {
              push(k, mergeCssObj[k]);
            }
          },
          getCss: function() {
            var newCss = [];
            for (var i in cssObj) {
              newCss.push(i + ":" + cssObj[i]);
            }
            return newCss.join(";");
          }
        };
        return that;
      };
    });;


    STK.register("core.arr.isArray", function($) {
      return function(o) {
        return Object.prototype.toString.call(o) === "[object Array]";
      };
    });;


    STK.register("core.arr.foreach", function($) {
      var arrForeach = function(o, insp) {
        var r = [];
        for (var i = 0, len = o.length; i < len; i += 1) {
          var x = insp(o[i], i);
          if (x === false) {
            break;
          } else if (x !== null) {
            r[i] = x;
          }
        }
        return r;
      };
      var objForeach = function(o, insp) {
        var r = {};
        for (var k in o) {
          var x = insp(o[k], k);
          if (x === false) {
            break;
          } else if (x !== null) {
            r[k] = x;
          }
        }
        return r;
      };
      return function(o, insp) {
        if ($.core.arr.isArray(o) || o.length && o[0] !== undefined) {
          return arrForeach(o, insp);
        } else if (typeof o === "object") {
          return objForeach(o, insp);
        }
        return null;
      };
    });;




    STK.register("core.evt.removeEvent", function($) {
      return function(el, type, fn) {
        el = $.E(el);
        if (el == null) {
          return false;
        }
        if (typeof fn !== "function") {
          return false;
        }
        if (el.removeEventListener) {
          el.removeEventListener(type, fn, false);
        } else if (el.detachEvent) {
          el.detachEvent("on" + type, fn);
        }
        el["on" + type] = null;
        return true;
      };
    });;


    STK.register("core.evt.getEvent", function($) {
      return function() {
        if (document.addEventListener) {
          return function() {
            var o = arguments.callee;
            var e;
            do {
              e = o.arguments[0];
              if (e && (e.constructor == Event || e.constructor == MouseEvent || e.constructor == KeyboardEvent)) {
                return e;
              }
            } while (o = o.caller);
            return e;
          };
        } else {
          return function(el, type, fn) {
            return window.event;
          };
        }
      }();
    });;




    STK.register("core.evt.stopEvent", function($) {
      return function(event) {
        event = event || $.core.evt.getEvent();
        if (event.preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.cancelBubble = true;
          event.returnValue = false;
        }
        return false;
      };
    });;




    STK.register("core.evt.preventDefault", function($) {
      return function(event) {
        event = event || $.core.evt.getEvent();
        if (event.preventDefault) {
          event.preventDefault();
        } else {
          event.returnValue = false;
        }
      };
    });;






    STK.register("core.json.queryToJson", function($) {
      return function(QS, isDecode) {
        var _Qlist = $.core.str.trim(QS).split("&");
        var _json = {};
        var _fData = function(data) {
          if (isDecode) {
            return decodeURIComponent(data);
          } else {
            return data;
          }
        };
        for (var i = 0, len = _Qlist.length; i < len; i++) {
          if (_Qlist[i]) {
            var _hsh = _Qlist[i].split("=");
            var _key = _hsh[0];
            var _value = _hsh[1];
            if (_hsh.length < 2) {
              _value = _key;
              _key = "$nullName";
            }
            if (!_json[_key]) {
              _json[_key] = _fData(_value);
            } else {
              if ($.core.arr.isArray(_json[_key]) != true) {
                _json[_key] = [_json[_key]];
              }
              _json[_key].push(_fData(_value));
            }
          }
        }
        return _json;
      };
    });;














    STK.register("core.evt.fixEvent", function($) {
      var fixTouchList = "clientX clientY pageX pageY screenX screenY".split(" ");
      return function(e) {
        e = e || $.core.evt.getEvent();
        if (!e.target) {
          e.target = e.srcElement || document;
        }
        if (e.pageX == null && e.clientX != null) {
          var html = document.documentElement;
          var body = document.body;
          e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || body && body.clientLeft || 0);
          e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || body && body.clientTop || 0);
        }
        if (!e.which && e.button) {
          if (e.button & 1) {
            e.which = 1;
          } else if (e.button & 4) {
            e.which = 2;
          } else if (e.button & 2) {
            e.which = 3;
          }
        }
        if (e.relatedTarget === undefined) {
          e.relatedTarget = e.fromElement || e.toElement;
        }
        if (e.layerX == null && e.offsetX != null) {
          e.layerX = e.offsetX;
          e.layerY = e.offsetY;
        }
        return e;
      };
    });;




    STK.register("core.obj.isEmpty", function($) {
      return function(o, isprototype) {
        for (var k in o) {
          if (isprototype || o.hasOwnProperty(k)) {
            return false;
          }
        }
        return true;
      };
    });;


    STK.register("core.func.empty", function() {
      return function() {};
    });;


    STK.register("core.evt.delegatedEvent", function($) {
      var checkContains = function(list, el) {
        for (var i = 0, len = list.length; i < len; i += 1) {
          if ($.core.dom.contains(list[i], el)) {
            return true;
          }
        }
        return false;
      };
      return function(actEl, expEls) {
        if (!$.core.dom.isNode(actEl)) {
          throw "core.evt.delegatedEvent need an Element as first Parameter";
        }
        if (!expEls) {
          expEls = [];
        }
        if ($.core.arr.isArray(expEls)) {
          expEls = [expEls];
        }
        var evtList = {};
        var bindEvent = function(e) {
          var evt = $.core.evt.fixEvent(e);
          var el = evt.target;
          var type = e.type;
          doDelegated(el, type, evt);
        };
        var doDelegated = function(el, type, evt) {
          var actionType = null;
          var changeTarget = function() {
            var path, lis, tg;
            path = el.getAttribute("action-target");
            if (path) {
              lis = $.core.dom.sizzle(path, actEl);
              if (lis.length) {
                tg = evt.target = lis[0];
              }
            }
            changeTarget = $.core.func.empty;
            return tg;
          };
          var checkBuble = function() {
            var tg = changeTarget() || el;
            if (evtList[type] && evtList[type][actionType]) {
              return evtList[type][actionType]({
                evt: evt,
                el: tg,
                box: actEl,
                data: $.core.json.queryToJson(tg.getAttribute("action-data") || "")
              });
            } else {
              return true;
            }
          };
          if (checkContains(expEls, el)) {
            return false;
          } else if (!$.core.dom.contains(actEl, el)) {
            return false;
          } else {
            while (el && el !== actEl) {
              if (el.nodeType === 1) {
                actionType = el.getAttribute("action-type");
                if (actionType && checkBuble() === false) {
                  break;
                }
              }
              el = el.parentNode;
            }
          }
        };
        var that = {};
        that.add = function(funcName, evtType, process) {
          if (!evtList[evtType]) {
            evtList[evtType] = {};
            $.core.evt.addEvent(actEl, evtType, bindEvent);
          }
          var ns = evtList[evtType];
          ns[funcName] = process;
        };
        that.remove = function(funcName, evtType) {
          if (evtList[evtType]) {
            delete evtList[evtType][funcName];
            if ($.core.obj.isEmpty(evtList[evtType])) {
              delete evtList[evtType];
              $.core.evt.removeEvent(actEl, evtType, bindEvent);
            }
          }
        };
        that.pushExcept = function(el) {
          expEls.push(el);
        };
        that.removeExcept = function(el) {
          if (!el) {
            expEls = [];
          } else {
            for (var i = 0, len = expEls.length; i < len; i += 1) {
              if (expEls[i] === el) {
                expEls.splice(i, 1);
              }
            }
          }
        };
        that.clearExcept = function(el) {
          expEls = [];
        };
        that.fireAction = function(actionType, evtType, evt, params) {
          var actionData = "";
          if (params && params["actionData"]) {
            actionData = params["actionData"];
          }
          if (evtList[evtType] && evtList[evtType][actionType]) {
            evtList[evtType][actionType]({
              evt: evt,
              el: null,
              box: actEl,
              data: $.core.json.queryToJson(actionData),
              fireFrom: "fireAction"
            });
          }
        };
        that.fireInject = function(dom, evtType, evt) {
          var actionType = dom.getAttribute("action-type");
          var actionData = dom.getAttribute("action-data");
          if (actionType && evtList[evtType] && evtList[evtType][actionType]) {
            evtList[evtType][actionType]({
              evt: evt,
              el: dom,
              box: actEl,
              data: $.core.json.queryToJson(actionData || ""),
              fireFrom: "fireInject"
            });
          }
        };
        that.fireDom = function(dom, evtType, evt) {
          doDelegated(dom, evtType, evt || {});
        };
        that.destroy = function() {
          for (var k in evtList) {
            for (var l in evtList[k]) {
              delete evtList[k][l];
            }
            delete evtList[k];
            $.core.evt.removeEvent(actEl, k, bindEvent);
          }
        };
        return that;
      };
    });;








    STK.register("core.dom.removeNode", function($) {
      return function(node) {
        node = $.E(node) || node;
        try {
          node.parentNode.removeChild(node);
        } catch (e) {}
      };
    });;


    STK.register("core.util.getUniqueKey", function($) {
      var _loadTime = (new Date).getTime().toString(),
        _i = 1;
      return function() {
        return _loadTime + _i++;
      };
    });;






    STK.register("core.str.parseURL", function($) {
      return function(url) {
        var parse_url = /^(?:([A-Za-z]+):(\/{0,3}))?([0-9.\-A-Za-z]+\.[0-9A-Za-z]+)?(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
        var names = ["url", "scheme", "slash", "host", "port", "path", "query", "hash"];
        var results = parse_url.exec(url);
        var that = {};
        for (var i = 0, len = names.length; i < len; i += 1) {
          that[names[i]] = results[i] || "";
        }
        return that;
      };
    });;






    STK.register("core.json.jsonToQuery", function($) {
      var _fdata = function(data, isEncode) {
        data = data == null ? "" : data;
        data = $.core.str.trim(data.toString());
        if (isEncode) {
          return encodeURIComponent(data);
        }
        return data;
      };
      return function(JSON, isEncode) {
        var _Qstring = [];
        if (typeof JSON == "object") {
          for (var k in JSON) {
            if (k === "$nullName") {
              _Qstring = _Qstring.concat(JSON[k]);
              continue;
            }
            if (JSON[k] instanceof Array) {
              for (var i = 0, len = JSON[k].length; i < len; i++) {
                _Qstring.push(k + "=" + _fdata(JSON[k][i], isEncode));
              }
            } else {
              if (typeof JSON[k] != "function") {
                _Qstring.push(k + "=" + _fdata(JSON[k], isEncode));
              }
            }
          }
        }
        if (_Qstring.length) {
          return _Qstring.join("&");
        }
        return "";
      };
    });;


    STK.register("core.util.URL", function($) {
      return function(sURL, args) {
        var opts = $.core.obj.parseParam({
          isEncodeQuery: false,
          isEncodeHash: false
        }, args || {});
        var that = {};
        var url_json = $.core.str.parseURL(sURL);
        var query_json = $.core.json.queryToJson(url_json.query);
        var hash_json = $.core.json.queryToJson(url_json.hash);
        that.setParam = function(sKey, sValue) {
          query_json[sKey] = sValue;
          return this;
        };
        that.getParam = function(sKey) {
          return query_json[sKey];
        };
        that.setParams = function(oJson) {
          for (var key in oJson) {
            that.setParam(key, oJson[key]);
          }
          return this;
        };
        that.setHash = function(sKey, sValue) {
          hash_json[sKey] = sValue;
          return this;
        };
        that.getHash = function(sKey) {
          return hash_json[sKey];
        };
        that.valueOf = that.toString = function() {
          var url = [];
          var query = $.core.json.jsonToQuery(query_json, opts.isEncodeQuery);
          var hash = $.core.json.jsonToQuery(hash_json, opts.isEncodeQuery);
          if (url_json.scheme != "") {
            url.push(url_json.scheme + ":");
            url.push(url_json.slash);
          }
          if (url_json.host != "") {
            url.push(url_json.host);
            if (url_json.port != "") {
              url.push(":");
              url.push(url_json.port);
            }
          }
          url.push("/");
          url.push(url_json.path);
          if (query != "") {
            url.push("?" + query);
          }
          if (hash != "") {
            url.push("#" + hash);
          }
          return url.join("");
        };
        return that;
      };
    });;


    STK.register("core.io.scriptLoader", function($) {
      var entityList = {};
      var default_opts = {
        url: "",
        charset: "UTF-8",
        timeout: 30 * 1e3,
        args: {},
        onComplete: $.core.func.empty,
        onTimeout: $.core.func.empty,
        isEncode: false,
        uniqueID: null
      };
      return function(oOpts) {
        var js, requestTimeout;
        var opts = $.core.obj.parseParam(default_opts, oOpts);
        if (opts.url == "") {
          throw "scriptLoader: url is null";
        }
        var uniqueID = opts.uniqueID || $.core.util.getUniqueKey();
        js = entityList[uniqueID];
        if (js != null && $.IE != true) {
          $.core.dom.removeNode(js);
          js = null;
        }
        if (js == null) {
          js = entityList[uniqueID] = $.C("script");
        }
        js.charset = opts.charset;
        js.id = "scriptRequest_script_" + uniqueID;
        js.type = "text/javascript";
        if (opts.onComplete != null) {
          if ($.IE) {
            js["onreadystatechange"] = function() {
              if (js.readyState.toLowerCase() == "loaded" || js.readyState.toLowerCase() == "complete") {
                try {
                  clearTimeout(requestTimeout);
                  document.getElementsByTagName("head")[0].removeChild(js);
                  js["onreadystatechange"] = null;
                } catch (exp) {}
                opts.onComplete();
              }
            };
          } else {
            js["onload"] = function() {
              try {
                clearTimeout(requestTimeout);
                $.core.dom.removeNode(js);
              } catch (exp) {}
              opts.onComplete();
            };
          }
        }
        js.src = $.core.util.URL(opts.url, {
          isEncodeQuery: opts["isEncode"]
        }).setParams(opts.args).toString();
        document.getElementsByTagName("head")[0].appendChild(js);
        if (opts.timeout > 0) {
          requestTimeout = setTimeout(function() {
            try {
              document.getElementsByTagName("head")[0].removeChild(js);
            } catch (exp) {}
            opts.onTimeout();
          }, opts.timeout);
        }
        return js;
      };
    });;








    STK.register("core.io.jsonp", function($) {
      return function(oOpts) {
        var opts = $.core.obj.parseParam({
          url: "",
          charset: "UTF-8",
          timeout: 30 * 1e3,
          args: {},
          onComplete: null,
          onTimeout: null,
          responseName: null,
          isEncode: false,
          varkey: "callback"
        }, oOpts);
        var funcStatus = -1;
        var uniqueID = opts.responseName || "STK_" + $.core.util.getUniqueKey();
        opts.args[opts.varkey] = uniqueID;
        var completeFunc = opts.onComplete;
        var timeoutFunc = opts.onTimeout;
        window[uniqueID] = function(oResult) {
          if (funcStatus != 2 && completeFunc != null) {
            funcStatus = 1;
            completeFunc(oResult);
          }
        };
        opts.onComplete = null;
        opts.onTimeout = function() {
          if (funcStatus != 1 && timeoutFunc != null) {
            funcStatus = 2;
            timeoutFunc();
          }
        };
        return $.core.io.scriptLoader(opts);
      };
    });;


    STK.register("core.arr.indexOf", function($) {
      return function(oElement, aSource) {
        if (aSource.indexOf) {
          return aSource.indexOf(oElement);
        }
        for (var i = 0, len = aSource.length; i < len; i++) {
          if (aSource[i] === oElement) {
            return i;
          }
        }
        return -1;
      };
    });;


    STK.register("core.arr.inArray", function($) {
      return function(oElement, aSource) {
        return $.core.arr.indexOf(oElement, aSource) > -1;
      };
    });;








    STK.register("core.json.merge", function($) {
      var checkCell = function(obj) {
        if (obj === undefined) {
          return true;
        }
        if (obj === null) {
          return true;
        }
        if ($.core.arr.inArray(typeof obj, ["number", "string", "function", "boolean"])) {
          return true;
        }
        if ($.core.dom.isNode(obj)) {
          return true;
        }
        return false;
      };
      var deep = function(ret, key, coverItem) {
        if (checkCell(coverItem)) {
          ret[key] = coverItem;
          return;
        }
        if ($.core.arr.isArray(coverItem)) {
          if (!$.core.arr.isArray(ret[key])) {
            ret[key] = [];
          }
          for (var i = 0, len = coverItem.length; i < len; i += 1) {
            deep(ret[key], i, coverItem[i]);
          }
          return;
        }
        if (typeof coverItem === "object") {
          if (checkCell(ret[key]) || $.core.arr.isArray(ret[key])) {
            ret[key] = {};
          }
          for (var k in coverItem) {
            deep(ret[key], k, coverItem[k]);
          }
          return;
        }
      };
      var merge = function(origin, cover, isDeep) {
        var ret = {};
        if (isDeep) {
          for (var k in origin) {
            deep(ret, k, origin[k]);
          }
          for (var k in cover) {
            deep(ret, k, cover[k]);
          }
        } else {
          for (var k in origin) {
            ret[k] = origin[k];
          }
          for (var k in cover) {
            ret[k] = cover[k];
          }
        }
        return ret;
      };
      return function(origin, cover, opts) {
        var conf = $.core.obj.parseParam({
          isDeep: false
        }, opts);
        return merge(origin, cover, conf.isDeep);
      };
    });;






    STK.register("core.obj.beget", function($) {
      var F = function() {};
      return function(o) {
        F.prototype = o;
        return new F;
      };
    });;




    STK.register("core.str.encodeHTML", function($) {
      return function(str) {
        if (typeof str !== "string") {
          throw "encodeHTML need a string as parameter";
        }
        return str.replace(/\&/g, "&amp;").replace(/"/g, "&quot;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\'/g, "&#39;").replace(/\u00A0/g, "&nbsp;").replace(/(\u0020|\u000B|\u2028|\u2029|\f)/g, "&#32;");
      };
    });;


    STK.register("core.str.bLength", function($) {
      return function(str) {
        if (!str) {
          return 0;
        }
        var aMatch = str.match(/[^\x00-\xff]/g);
        return str.length + (!aMatch ? 0 : aMatch.length);
      };
    });;


    STK.register("core.str.leftB", function($) {
      return function(str, lens) {
        var s = str.replace(/\*/g, " ").replace(/[^\x00-\xff]/g, "**");
        str = str.slice(0, s.slice(0, lens).replace(/\*\*/g, " ").replace(/\*/g, "").length);
        if ($.core.str.bLength(str) > lens && lens > 0) {
          str = str.slice(0, str.length - 1);
        }
        return str;
      };
    });;




    STK.register("core.util.easyTemplate", function($) {
      var easyTemplate = function(s, d) {
        if (!s) {
          return "";
        }
        if (s !== easyTemplate.template) {
          easyTemplate.template = s;
          easyTemplate.aStatement = easyTemplate.parsing(easyTemplate.separate(s));
        }
        var aST = easyTemplate.aStatement;
        var process = function(d2) {
          if (d2) {
            d = d2;
          }
          return arguments.callee;
        };
        process.toString = function() {
          return (new Function(aST[0], aST[1]))(d);
        };
        return process;
      };
      easyTemplate.separate = function(s) {
        var r = /\\'/g;
        var sRet = s.replace(/(<(\/?)#(.*?(?:\(.*?\))*)>)|(')|([\r\n\t])|(\$\{([^\}]*?)\})/g, function(a, b, c, d, e, f, g, h) {
          if (b) {
            return "{|}" + (c ? "-" : "+") + d + "{|}";
          }
          if (e) {
            return "\\'";
          }
          if (f) {
            return "";
          }
          if (g) {
            return "'+(" + h.replace(r, "'") + ")+'";
          }
        });
        return sRet;
      };
      easyTemplate.parsing = function(s) {
        var mName, vName, sTmp, aTmp, sFL, sEl, aList,
          aStm = ["var aRet = [];"];
        aList = s.split(/\{\|\}/);
        var r = /\s/;
        while (aList.length) {
          sTmp = aList.shift();
          if (!sTmp) {
            continue;
          }
          sFL = sTmp.charAt(0);
          if (sFL !== "+" && sFL !== "-") {
            sTmp = "'" + sTmp + "'";
            aStm.push("aRet.push(" + sTmp + ");");
            continue;
          }
          aTmp = sTmp.split(r);
          switch (aTmp[0]) {
            case "+et":
              mName = aTmp[1];
              vName = aTmp[2];
              aStm.push('aRet.push("<!--' + mName + ' start-->");');
              break;
            case "-et":
              aStm.push('aRet.push("<!--' + mName + ' end-->");');
              break;
            case "+if":
              aTmp.splice(0, 1);
              aStm.push("if" + aTmp.join(" ") + "{");
              break;
            case "+elseif":
              aTmp.splice(0, 1);
              aStm.push("}else if" + aTmp.join(" ") + "{");
              break;
            case "-if":
              aStm.push("}");
              break;
            case "+else":
              aStm.push("}else{");
              break;
            case "+list":
              aStm.push("if(" + aTmp[1] + ".constructor === Array){with({i:0,l:" + aTmp[1] + ".length," + aTmp[3] + "_index:0," + aTmp[3] + ":null}){for(i=l;i--;){" + aTmp[3] + "_index=(l-i-1);" + aTmp[3] + "=" + aTmp[1] + "[" + aTmp[3] + "_index];");
              break;
            case "-list":
              aStm.push("}}}");
              break;
            default:
              break;
          }
        }
        aStm.push('return aRet.join("");');
        return [vName, aStm.join("")];
      };
      return easyTemplate;
    });;










    STK.register("core.evt.custEvent", function($) {
      var custEventAttribute = "__custEventKey__",
        custEventKey = 1,
        custEventCache = {},
        findCache = function(obj, type) {
          var _key = typeof obj == "number" ? obj : obj[custEventAttribute];
          return _key && custEventCache[_key] && {
            obj: typeof type == "string" ? custEventCache[_key][type] : custEventCache[_key],
            key: _key
          };
        };
      var hookCache = {};
      var add = function(obj, type, fn, data, once) {
        if (obj && typeof type == "string" && fn) {
          var _cache = findCache(obj, type);
          if (!_cache || !_cache.obj) {
            throw "custEvent (" + type + ") is undefined !";
          }
          _cache.obj.push({
            fn: fn,
            data: data,
            once: once
          });
          return _cache.key;
        }
      };
      var fire = function(obj, type, args, defaultAction) {
        var preventDefaultFlag = true;
        var preventDefault = function() {
          preventDefaultFlag = false;
        };
        if (obj && typeof type == "string") {
          var _cache = findCache(obj, type),
            _obj;
          if (_cache && (_obj = _cache.obj)) {
            args = typeof args != "undefined" && [].concat(args) || [];
            for (var i = _obj.length - 1; i > -1 && _obj[i]; i--) {
              var fn = _obj[i].fn;
              var isOnce = _obj[i].once;
              if (fn && fn.apply) {
                try {
                  fn.apply(obj, [{
                    obj: obj,
                    type: type,
                    data: _obj[i].data,
                    preventDefault: preventDefault
                  }].concat(args));
                  if (isOnce) {
                    _obj.splice(i, 1);
                  }
                } catch (e) {
                  $.log("[error][custEvent]" + e.message, e, e.stack);
                }
              }
            }
            if (preventDefaultFlag && $.core.func.getType(defaultAction) === "function") {
              defaultAction();
            }
            return _cache.key;
          }
        }
      };
      var that = {
        define: function(obj, type) {
          if (obj && type) {
            var _key = typeof obj == "number" ? obj : obj[custEventAttribute] || (obj[custEventAttribute] = custEventKey++),
              _cache = custEventCache[_key] || (custEventCache[_key] = {});
            type = [].concat(type);
            for (var i = 0; i < type.length; i++) {
              _cache[type[i]] || (_cache[type[i]] = []);
            }
            return _key;
          }
        },
        undefine: function(obj, type) {
          if (obj) {
            var _key = typeof obj == "number" ? obj : obj[custEventAttribute];
            if (_key && custEventCache[_key]) {
              if (type) {
                type = [].concat(type);
                for (var i = 0; i < type.length; i++) {
                  if (type[i] in custEventCache[_key])
                    delete custEventCache[_key][type[i]];
                }
              } else {
                delete custEventCache[_key];
              }
            }
          }
        },
        add: function(obj, type, fn, data) {
          return add(obj, type, fn, data, false);
        },
        once: function(obj, type, fn, data) {
          return add(obj, type, fn, data, true);
        },
        remove: function(obj, type, fn) {
          if (obj) {
            var _cache = findCache(obj, type),
              _obj, index;
            if (_cache && (_obj = _cache.obj)) {
              if ($.core.arr.isArray(_obj)) {
                if (fn) {
                  var i = 0;
                  while (_obj[i]) {
                    if (_obj[i].fn === fn) {
                      break;
                    }
                    i++;
                  }
                  _obj.splice(i, 1);
                } else {
                  _obj.splice(0, _obj.length);
                }
              } else {
                for (var i in _obj) {
                  _obj[i] = [];
                }
              }
              return _cache.key;
            }
          }
        },
        fire: function(obj, type, args, defaultAction) {
          return fire(obj, type, args, defaultAction);
        },
        hook: function(orig, dest, typeMap) {
          if (!orig || !dest || !typeMap) {
            return;
          }
          var destTypes = [],
            origKey = orig[custEventAttribute],
            origKeyCache = origKey && custEventCache[origKey],
            origTypeCache,
            destKey = dest[custEventAttribute] || (dest[custEventAttribute] = custEventKey++),
            keyHookCache;
          if (origKeyCache) {
            keyHookCache = hookCache[origKey + "_" + destKey] || (hookCache[origKey + "_" + destKey] = {});
            var fn = function(event) {
              var preventDefaultFlag = true;
              fire(dest, keyHookCache[event.type].type, Array.prototype.slice.apply(arguments, [1, arguments.length]), function() {
                preventDefaultFlag = false;
              });
              preventDefaultFlag && event.preventDefault();
            };
            for (var origType in typeMap) {
              var destType = typeMap[origType];
              if (!keyHookCache[origType]) {
                if (origTypeCache = origKeyCache[origType]) {
                  origTypeCache.push({
                    fn: fn,
                    data: undefined
                  });
                  keyHookCache[origType] = {
                    fn: fn,
                    type: destType
                  };
                  destTypes.push(destType);
                }
              }
            }
            that.define(dest, destTypes);
          }
        },
        unhook: function(orig, dest, typeMap) {
          if (!orig || !dest || !typeMap) {
            return;
          }
          var origKey = orig[custEventAttribute],
            destKey = dest[custEventAttribute],
            keyHookCache = hookCache[origKey + "_" + destKey];
          if (keyHookCache) {
            for (var origType in typeMap) {
              var destType = typeMap[origType];
              if (keyHookCache[origType]) {
                that.remove(orig, origType, keyHookCache[origType].fn);
              }
            }
          }
        },
        destroy: function() {
          custEventCache = {};
          custEventKey = 1;
          hookCache = {};
        }
      };
      return that;
    });;








    STK.register("core.util.drag", function($) {
      var stopClick = function(e) {
        e.cancelBubble = true;
        return false;
      };
      var getParams = function(args, evt) {
        args["clientX"] = evt.clientX;
        args["clientY"] = evt.clientY;
        args["pageX"] = evt.clientX + $.core.util.scrollPos()["left"];
        args["pageY"] = evt.clientY + $.core.util.scrollPos()["top"];
        return args;
      };
      return function(actEl, spec) {
        if (!$.core.dom.isNode(actEl)) {
          throw "core.util.drag need Element as first parameter";
        }
        var conf = $.core.obj.parseParam({
          actRect: [],
          actObj: {}
        }, spec);
        var that = {};
        var dragStartKey = $.core.evt.custEvent.define(conf.actObj, "dragStart");
        var dragEndKey = $.core.evt.custEvent.define(conf.actObj, "dragEnd");
        var dragingKey = $.core.evt.custEvent.define(conf.actObj, "draging");
        var startFun = function(e) {
          var args = getParams({}, e);
          document.body.onselectstart = function() {
            return false;
          };
          $.core.evt.addEvent(document, "mousemove", dragFun);
          $.core.evt.addEvent(document, "mouseup", endFun);
          $.core.evt.addEvent(document, "click", stopClick, true);
          if (e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
          }
          $.core.evt.custEvent.fire(dragStartKey, "dragStart", args);
          return false;
        };
        var dragFun = function(e) {
          var args = getParams({}, e);
          e.cancelBubble = true;
          $.core.evt.custEvent.fire(dragStartKey, "draging", args);
        };
        var endFun = function(e) {
          var args = getParams({}, e);
          document.body.onselectstart = function() {
            return true;
          };
          $.core.evt.removeEvent(document, "mousemove", dragFun);
          $.core.evt.removeEvent(document, "mouseup", endFun);
          $.core.evt.removeEvent(document, "click", stopClick, true);
          $.core.evt.custEvent.fire(dragStartKey, "dragEnd", args);
        };
        $.core.evt.addEvent(actEl, "mousedown", startFun);
        that.destroy = function() {
          $.core.evt.removeEvent(actEl, "mousedown", startFun);
          conf = null;
        };
        that.getActObj = function() {
          return conf.actObj;
        };
        return that;
      };
    });;


    STK.register("core.util.storage", function($) {
      var objDS = window.localStorage;
      if (objDS) {
        return {
          get: function(key) {
            return unescape(objDS.getItem(key));
          },
          set: function(key, value, exp) {
            objDS.setItem(key, escape(value));
          },
          del: function(key) {
            objDS.removeItem(key);
          },
          clear: function() {
            objDS.clear();
          },
          getAll: function() {
            var l = objDS.length,
              key = null,
              ac = [];
            for (var i = 0; i < l; i++) {
              key = objDS.key(i);
              ac.push(key + "=" + objDS.getItem(key));
            }
            return ac.join("; ");
          }
        };
      } else if (window.ActiveXObject) {
        var store = document.documentElement;
        var STORE_NAME = "localstorage";
        try {
          store.addBehavior("#default#userdata");
          store.save("localstorage");
        } catch (e) {}
        return {
          set: function(key, value) {
            store.setAttribute(key, value);
            store.save(STORE_NAME);
          },
          get: function(key) {
            store.load(STORE_NAME);
            return store.getAttribute(key);
          },
          del: function(key) {
            store.removeAttribute(key);
            store.save(STORE_NAME);
          }
        };
      } else {
        return {
          get: function(key) {
            var aCookie = document.cookie.split("; "),
              l = aCookie.length,
              aCrumb = [];
            for (var i = 0; i < l; i++) {
              aCrumb = aCookie[i].split("=");
              if (key === aCrumb[0]) {
                return unescape(aCrumb[1]);
              }
            }
            return null;
          },
          set: function(key, value, exp) {
            if (!(exp && exp instanceof Date)) {
              exp = new Date;
              exp.setDate(exp.getDate() + 1);
            }
            document.cookie = key + "=" + escape(value) + "; expires=" + exp.toGMTString();
          },
          del: function(key) {
            document.cookie = key + "=''; expires=Fri, 31 Dec 1999 23:59:59 GMT;";
          },
          clear: function() {
            var aCookie = document.cookie.split("; "),
              l = aCookie.length,
              aCrumb = [];
            for (var i = 0; i < l; i++) {
              aCrumb = aCookie[i].split("=");
              this.deleteKey(aCrumb[0]);
            }
          },
          getAll: function() {
            return unescape(document.cookie.toString());
          }
        };
      }
    });;






    STK.register("core.util.cookie", function($) {
      var that = {
        set: function(sKey, sValue, oOpts) {
          var arr = [];
          var d, t;
          var cfg = $.core.obj.parseParam({
            expire: null,
            path: "/",
            domain: null,
            secure: null,
            encode: true
          }, oOpts);
          if (cfg.encode == true) {
            sValue = escape(sValue);
          }
          arr.push(sKey + "=" + sValue);
          if (cfg.path != null) {
            arr.push("path=" + cfg.path);
          }
          if (cfg.domain != null) {
            arr.push("domain=" + cfg.domain);
          }
          if (cfg.secure != null) {
            arr.push(cfg.secure);
          }
          if (cfg.expire != null) {
            d = new Date;
            t = d.getTime() + cfg.expire * 36e5;
            d.setTime(t);
            arr.push("expires=" + d.toGMTString());
          }
          document.cookie = arr.join(";");
        },
        get: function(sKey) {
          sKey = sKey.replace(/([\.\[\]\$])/g, "\\$1");
          var rep = new RegExp(sKey + "=([^;]*)?;", "i");
          var co = document.cookie + ";";
          var res = co.match(rep);
          if (res) {
            return res[1] || "";
          } else {
            return "";
          }
        },
        remove: function(sKey, oOpts) {
          oOpts = oOpts || {};
          oOpts.expire = -10;
          that.set(sKey, "", oOpts);
        }
      };
      return that;
    });;


    STK.register("core.util.language", function($) {
      return function(template, data) {
        var rep = [];
        for (var i = 2, len = arguments.length; i < len; i += 1) {
          rep.push(arguments[i]);
        }
        return template.replace(/#L\{((.*?)(?:[^\\]))\}/ig, function() {
          var key = arguments[1];
          var ret;
          if (data && data[key] !== undefined) {
            ret = data[key];
          } else {
            ret = key;
          }
          if (rep.length) {
            ret = ret.replace(/(\%s)/ig, function() {
              var pic = rep.shift();
              if (pic !== undefined) {
                return pic;
              } else {
                return arguments[0];
              }
            });
          }
          return ret;
        });
      };
    });;


    STK.register("core.util.listener", function($) {
      return function() {
        var dispatchList = {};
        var fireTaskList = [];
        var fireTaskTimer;
        var runFireTaskList = function() {
          if (fireTaskList.length == 0) {
            return;
          }
          clearTimeout(fireTaskTimer);
          var curFireTask = fireTaskList.splice(0, 1)[0];
          try {
            curFireTask["func"].apply(curFireTask["func"], [].concat(curFireTask["data"]));
          } catch (exp) {}
          fireTaskTimer = setTimeout(runFireTaskList, 25);
        };
        return {
          register: function(sChannel, sEventType, fCallBack) {
            dispatchList[sChannel] = dispatchList[sChannel] || {};
            dispatchList[sChannel][sEventType] = dispatchList[sChannel][sEventType] || [];
            dispatchList[sChannel][sEventType].push(fCallBack);
          },
          fire: function(sChannel, sEventType, oData) {
            var funcArray;
            var i, len;
            if (dispatchList[sChannel] && dispatchList[sChannel][sEventType] && dispatchList[sChannel][sEventType].length > 0) {
              funcArray = dispatchList[sChannel][sEventType];
              funcArray.data_cache = oData;
              for (i = 0, len = funcArray.length; i < len; i++) {
                fireTaskList.push({
                  channel: sChannel,
                  evt: sEventType,
                  func: funcArray[i],
                  data: oData
                });
              }
              runFireTaskList();
            }
          },
          remove: function(sChannel, sEventType, fCallBack) {
            if (dispatchList[sChannel]) {
              if (dispatchList[sChannel][sEventType]) {
                for (var i = 0, len = dispatchList[sChannel][sEventType].length; i < len; i++) {
                  if (dispatchList[sChannel][sEventType][i] === fCallBack) {
                    dispatchList[sChannel][sEventType].splice(i, 1);
                    break;
                  }
                }
              }
            }
          },
          list: function() {
            return dispatchList;
          },
          cache: function(sChannel, sEventType) {
            if (dispatchList[sChannel] && dispatchList[sChannel][sEventType]) {
              return dispatchList[sChannel][sEventType].data_cache;
            }
          }
        };
      }();
    });;




    (function() {
      var $ = STK.core;
      var hash = {
        isNode: $.dom.isNode,
        Ready: $.dom.ready,
        setStyle: $.dom.setStyle,
        getStyle: $.dom.getStyle,
        addClassName: $.dom.addClassName,
        hasClassName: $.dom.hasClassName,
        removeClassName: $.dom.removeClassName,
        contains: $.dom.contains,
        position: $.dom.position,
        foreach: $.arr.foreach,
        isArray: $.arr.isArray,
        addEvent: $.evt.addEvent,
        removeEvent: $.evt.removeEvent,
        getEvent: $.evt.getEvent,
        stopEvent: $.evt.stopEvent,
        preventDefault: $.evt.preventDefault,
        getType: $.func.getType,
        funcEmpty: $.func.empty,
        jsonp: $.io.jsonp,
        scriptLoader: $.io.scriptLoader,
        merge: $.json.merge,
        jsonToQuery: $.json.jsonToQuery,
        beget: $.obj.beget,
        parseParam: $.obj.parseParam,
        bLength: $.str.bLength,
        leftB: $.str.leftB,
        trim: $.str.trim,
        encodeHTML: $.str.encodeHTML,
        cookie: $.util.cookie,
        drag: $.util.drag,
        listener: $.util.listener,
        browser: $.util.browser,
        language: $.language,
        getUniqueKey: $.util.getUniqueKey
      };
      for (var k in hash) {
        if (hash[k]) {
          STK.regShort(k, hash[k]);
        }
      }
    })();;

    STK.register("common.listener", function($) {
      var listenerList = {};
      var that = {};
      that.define = function(sChannel, aEventList) {
        if (listenerList[sChannel] != null) {
          throw "common.listener.define: 频道已被占用";
        }
        listenerList[sChannel] = aEventList;
        var ret = {};
        ret.register = function(sEventType, fCallBack) {
          if (listenerList[sChannel] == null) {
            throw "common.listener.define: 频道未定义";
          }
          $.core.util.listener.register(sChannel, sEventType, fCallBack);
        };
        ret.fire = function(sEventType, oData) {
          if (listenerList[sChannel] == null) {
            throw "commonlistener.define: 频道未定义";
          }
          $.core.util.listener.fire(sChannel, sEventType, oData);
        };
        ret.remove = function(sEventType, fCallBack) {
          $.core.util.listener.remove(sChannel, sEventType, fCallBack);
        };
        return ret;
      };
      return that;
    });;


    STK.register("common.channel.plugin", function($) {
      return $.common.listener.define("common.channel.plugin", ["outlogin_ready", "plugin_ready", "weibolist_show", "weibolist_hide"]);
    });;

    STK.register("kit.obj.append", function($) {
      return function(original) {
        for (var i = 1, l = arguments.length; i < l; i++) {
          var extended = arguments[i] || {};
          for (var key in extended) original[key] = extended[key];
        }
        return original;
      };
    });;


    STK.register("kit.dom.builder", function($) {
      var parentNode = null;
      return function(node_or_html) {
        var node = null;
        if (typeof node_or_html == "string") {
          if (!parentNode) {
            parentNode = $.C("div");
          }
          parentNode.innerHTML = node_or_html;
          node = parentNode.children[0];
          parentNode.removeChild(node);
          parentNode.innerHTML = "";
        } else {
          node = node_or_html;
        }
        var list = {};
        var all_nodes = node.getElementsByTagName("*");
        if (all_nodes.length > 0) {
          $.foreach(all_nodes, function(el) {
            if ($.isNode(el)) {
              var node_type = el.getAttribute("node-type");
              if (node_type) {
                if (!list[node_type]) {
                  list[node_type] = [];
                }
                list[node_type].push(el);
              }
            }
          });
        }
        var obj = {};
        obj.box = node;
        obj.list = list;
        return obj;
      };
    });;


    STK.register("kit.dom.parseDOM", function($) {
      return function(list) {
        for (var a in list) {
          if (list[a] && list[a].length == 1) {
            list[a] = list[a][0];
          }
        }
        return list;
      };
    });;


    STK.register("kit.dom.loadStyle", function($) {
      var head;
      var $empty = $.funcEmpty;
      var $browser = $.core.util.browser;
      return function(source, spec) {
        var link, styleCheckTimer,
          loaded = false,
          timeout = false;
        var conf = $.parseParam({
          id: $.getUniqueKey(),
          timeout: 30 * 1e3,
          styleCheck: null,
          onLoad: $empty,
          onTimeout: $empty,
          props: {
            charset: "utf-8",
            rel: "stylesheet",
            media: "screen",
            type: "text/css"
          }
        }, spec);
        link = $.C("link");
        $.foreach(conf.props, function(val, key) {
          link[key] = val;
        });
        link.id = conf.id;
        link.href = source;
        var link_load = function() {
          clearInterval(styleCheckTimer);
          if (!timeout && !loaded) {
            if ($.getType(conf.onLoad) === "function") {
              setTimeout(conf.onLoad, 100);
            }
          }
          loaded = true;
        };
        if ($browser.IE) {
          link.onload = link_load;
        } else {
          if ($.getType(conf.styleCheck) === "function") {
            styleCheckTimer = setInterval(function() {
              if (conf.styleCheck()) {
                link_load();
              }
            }, 10);
          } else {
            var img = document.createElement("img");
            img.onerror = link_load;
            img.src = source;
          }
        }
        if (conf.timeout && conf.onTimeout) {
          setTimeout(function() {
            clearInterval(styleCheckTimer);
            if (!loaded && $.getType(conf.onTimeout) === "function") {
              timeout = true;
              conf.onTimeout();
            }
          }, conf.timeout);
        }
        if (!head) {
          head = document.getElementsByTagName("head")[0];
        }
        head.appendChild(link);
      };
    });;


    STK.register("kit.dom.appendStyle", function($) {
      return function(cssText, spec) {
        var conf = $.parseParam({
          autoAppend: true,
          target: null,
          type: "text/css"
        }, spec);
        var style;
        cssText = cssText || "";
        cssText = cssText.toString();
        if ($.isNode(conf.target) && conf.target.tagName.toLowerCase() === "style") {
          style = conf.target;
        } else {
          style = document.createElement("style");
          style.setAttribute("type", conf.type);
        }
        if (style.styleSheet) {
          style.styleSheet.cssText = style.innerHTML + cssText;
        } else {
          style.appendChild(document.createTextNode(cssText));
        }
        if (conf.autoAppend) {
          document.getElementsByTagName("head")[0].appendChild(style);
        }
        return style;
      };
    });;


    STK.register("kit.util.makeReady", function($) {
      return function(spec) {
        var conf = $.parseParam({
          timeout: 30 * 1e3,
          condition: $.funcEmpty,
          ready: $.funcEmpty
        }, spec);
        var cache, timer;
        return {
          reset: function() {
            if (cache) {
              cache.length = 0;
              cache = null;
            }
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
          },
          exec: function(fn) {
            var that = this;
            if ($.getType(fn) === "function") {
              if (conf.condition()) {
                fn();
              } else {
                if (!cache) {
                  cache = [];
                  cache.push(fn);
                  if (!timer) {
                    timer = setTimeout(that.reset, conf.timeout);
                  }
                  conf.ready(function() {
                    clearTimeout(timer);
                    timer = null;
                    while ($.getType(cache) === "array" && cache.length > 0) {
                      cache.shift()();
                    }
                  });
                } else {
                  cache.push(fn);
                }
              }
            }
          },
          destroy: function() {
            this.reset();
          }
        };
      };
    });;




    STK.register("comp.defaultStyle", function($) {
      var cssText = ['.tn-title-login-custom{float:left!important;font-family: "Microsoft YaHei","微软雅黑","SimSun","宋体"!important;position:relative!important;}', ".tn-title-login-custom .tn-user-custom{float:left!important;font-size:12px!important;}", ".tn-title-login-custom .tn-user-greet{float:left!important;height:17px!important;padding:12px 0!important;width:51px!important; line-height:17px!important;overflow:hidden!important;}", ".tn-title-login-custom .tn-tab-custom{position:relative!important;float:left!important;border-width:0 1px!important;border-style:solid!important;width:85px!important;height:17px!important;padding:12px 0!important;_padding:14px 0 10px!important;text-align:center!important;font-style:normal!important;text-decoration:none!important; vertical-align:top!important;}", ".tn-title-login-custom .tn-tab-custom-login{width:57px!important;_float:left;}", ".tn-title-login-custom .tn-tab-custom i{font-style:normal!important;}", ".tn-title-login-custom .tn-tab-custom:hover{text-decoration:none!important;}", ".tn-title-login-custom .tn-tab-custom .tn-new-custom{display:none;position:absolute!important;right:2px!important;margin-top:-10px!important;height:11px!important;width:13px!important;padding-left:3px!important;font-size:8px!important;overflow:hidden!important;line-height:10px!important;text-align:center!important;-webkit-text-size-adjust:none!important;font-style:normal!important;}", ".tn-title-login-custom .tn-tab-custom .tn-arrow-custom{display: inline-block!important;font-size: 12px!important;height: 5px!important;line-height: 13px!important;margin: 0 0 0 5px!important;overflow: hidden!important;transform: none!important;vertical-align: middle!important;width:9px!important;font-style:normal!important;}", ".tn-title-login-custom .tn-topmenulist-custom{position:absolute!important;right:0!important;top:41px!important;border-width:1px 1px 0!important;border-style:solid!important;width:85px!important;overflow:hidden!important;}", ".tn-title-login-custom .tn-topmenulist-custom .tn-text-list{margin-bottom:-2px!important;margin:0!important;padding:0!important;}", ".tn-title-login-custom .tn-topmenulist-custom li{border-bottom-width:1px!important;border-bottom-style:solid!important;line-height:31px!important; list-style:none!important;margin:0!important;padding:0!important;}", ".tn-title-login-custom .tn-topmenulist-custom a{display:block!important;padding:0 15px!important;text-decoration:none!important;text-align:left!important;}", ".tn-title-login-custom .tn-topmenulist-custom a em{float:right!important;font-style:normal!important;}", ".tn-title-login-custom .tn-topmenulist-custom a:hover{text-decoration:none!important;}", ".tn-title-login-custom .tn-topmenulist-custom a.tn-user-custom-logout{background:#f2f2f2!important;color:#0a8cd2!important;}", ".tn-title-login-custom .tn-topmenulist-custom a.tn-user-custom-logout:hover{text-decoration:underline!important;}", "/*可覆盖样式区域*/", ".tn-title-login-custom .tn-user-custom{background:#f7f7f7;}", ".tn-title-login-custom .tn-tab-custom{border-color:#f7f7f7;color:#ff8601;}", ".tn-title-login-custom .tn-tab-custom:hover,", ".tn-title-login-custom .tn-tab-custom-onmouse{background:#eaeaea;border-color:#ff8503;color:#ff8601;}", ".tn-title-login-custom .tn-tab-custom .tn-new-custom{background:url(http://i.sso.sina.com.cn/images/login/icon_custom.png) no-repeat 0 -30px;color:#fff;text-align:center;-webkit-text-size-adjust: none;}", ".tn-title-login-custom .tn-tab-custom .tn-arrow-custom{ background:url(http://i.sso.sina.com.cn/images/login/icon_custom.png) no-repeat scroll 0 0 transparent; }", ".tn-title-login-custom .tn-topmenulist-custom{border-color:#ff8601;background:#fff;}", ".tn-title-login-custom .tn-topmenulist-custom li{border-bottom-color:#ff8601;}", ".tn-title-login-custom .tn-topmenulist-custom a{color:#000;}", ".tn-title-login-custom .tn-topmenulist-custom a em{color:#ff8603;}", ".tn-title-login-custom .tn-topmenulist-custom a:hover{background:#fff6d9;color:#ff8601;}"];
      return {
        get: function() {
          if (typeof cssText !== "string") {
            cssText = cssText.join("\n");
          }
          return cssText;
        }
      };
    });;




    STK.register("comp.userpanel.dropmenu", function($) {
      var $addEvent = $.core.evt.addEvent;
      var $contains = $.core.dom.contains;
      var $removeEvent = $.core.evt.removeEvent;
      var $addClass = $.core.dom.addClassName;
      var $removeClass = $.core.dom.removeClassName;
      var $listener = $.core.util.listener;
      return function(spec) {
        var that = {};
        var STATUS_LOGIN = 4097,
          STATUS_PRELOGIN = 4098,
          STATUS_UNLOGIN = 4096;
        var btn, menu;
        var timer;
        var timers = [];
        var isSpread = false;
        // 禁用hover效果改为click后弹出，触发区变小，加大延时消失时间 20151221131951
        var DELAY = 100;
        var conf = $.parseParam({
          button: null,
          menu: null,
          id: null,
          onActive: function() {},
          onCancel: function() {},
          activeClass: "active"
        }, spec);
        var btnMouseOverHandler = function(evt) {
          for (var i = 0; i < timers.length; i++) {
            clearTimeout(timers[i]);
          }
          timers = [];
          var target = evt.fromElement || evt.relatedTarget;
          if ($contains(btn, target) || target == conf.button) {
            return;
          }
          // menu.style.display = "";
          jQuery(menu).stop().slideDown(200);
          if (!isSpread) {
            conf.onActive && conf.onActive();
            $addClass(btn, conf.activeClass);
            isSpread = true;
            $listener.fire("clearfloat", "clear", [conf.id]);
          }
        };
        var btnMouseOutHandler = function(evt) {
          var target = evt.toElement || evt.relatedTarget;
          if ($contains(btn, target)) {
            return;
          }
          timer = setTimeout(function() {
            // menu.style.display = "none";
            jQuery(menu).stop().slideUp(200);
            conf.onCancel && conf.onCancel();
            if ($.isNode(btn)) $removeClass(btn, conf.activeClass);
            isSpread = false;
          }, DELAY);
          timers.push(timer);
        };
        var menuMouseOverHandler = function(evt) {
          for (var i = 0; i < timers.length; i++) {
            clearTimeout(timers[i]);
          }
          timers = [];
          var target = evt.fromElement || evt.relatedTarget;
          if (!$.isNode(target)) {
            return;
          }
          if ($contains(menu, target)) {
            return;
          }
          $listener.fire("clearfloat", "clear", [conf.id]);
          jQuery(menu).stop().slideDown(200);
          // menu.style.display = "";
          if (!isSpread) {
            conf.onActive && conf.onActive();
            $addClass(btn, conf.activeClass);
            isSpread = true;
          }
        };
        var menuMouseOutHandler = function(evt) {
          var target = evt.toElement || evt.relatedTarget;
          if (!$.isNode(target)) {
            return;
          }
          if ($contains(menu, target)) {
            return;
          }
          timer = setTimeout(function() {
            jQuery(menu).stop().slideUp(200);
            // menu.style.display = "none";
            conf.onCancel && conf.onCancel();
            $removeClass(btn, conf.activeClass);
            isSpread = false;
          }, DELAY);
          timers.push(timer);
        };
        var menuMouseClickHandler = function() {
          jQuery(menu).stop().slideUp(200);
          // menu.style.display = "none";
          conf.onCancel && conf.onCancel();
          $removeClass(btn, conf.activeClass);
          isSpread = false;
        };
        var destroy = function() {
          $removeEvent(btn, "mouseover", btnMouseOverHandler);
          $removeEvent(btn, "mouseout", btnMouseOutHandler);
          $removeEvent(menu, "mouseover", menuMouseOverHandler);
          $removeEvent(menu, "mouseout", menuMouseOutHandler);
          $removeEvent(menu, "click", menuMouseClickHandler);
        };
        var hide = function() {
          timer = setTimeout(function() {
            jQuery(menu).stop().slideUp(200);
            // menu.style.display = "none";
            $removeClass(btn, conf.activeClass);
            if (isSpread) conf.onCancel();
            isSpread = false;
          }, DELAY);
        };
        var parseDOM = function() {
          btn = conf.button;
          menu = conf.menu;
          if (!btn || !menu) {
            throw "node is not defined";
          }
        };
        var bindListener = function() {
          $addEvent(btn, "mouseover", btnMouseOverHandler);
          $addEvent(btn, "mouseout", btnMouseOutHandler);
          $addEvent(menu, "mouseover", menuMouseOverHandler);
          $addEvent(menu, "mouseout", menuMouseOutHandler);
          $addEvent(menu, "click", menuMouseClickHandler);
        };
        var initPlugins = function() {};
        var init = function() {
          parseDOM();
          bindListener();
          initPlugins();
        };
        init();
        that.hide = hide;
        that.destroy = destroy;
        return that;
      };
    });;


    STK.register("core.util.winSize", function($) {
      return function(_target) {
        var w, h;
        var target;
        if (_target) {
          target = _target.document;
        } else {
          target = document;
        }
        if (target.compatMode === "CSS1Compat") {
          w = target.documentElement["clientWidth"];
          h = target.documentElement["clientHeight"];
        } else if (self.innerHeight) {
          if (_target) {
            target = _target.self;
          } else {
            target = self;
          }
          w = target.innerWidth;
          h = target.innerHeight;
        } else if (target.documentElement && target.documentElement.clientHeight) {
          w = target.documentElement.clientWidth;
          h = target.documentElement.clientHeight;
        } else if (target.body) {
          w = target.body.clientWidth;
          h = target.body.clientHeight;
        }
        return {
          width: w,
          height: h
        };
      };
    });;


    STK.register("kit.extra.merge", function($) {
      return function(a, b) {
        var buf = {};
        for (var k in a) {
          buf[k] = a[k];
        }
        for (var k in b) {
          buf[k] = b[k];
        }
        return buf;
      };
    });;


    STK.register("kit.io.ajax", function($) {
      return function(args) {
        var conf, that, queue, current, lock, complete, fail;
        complete = function(res) {
          lock = false;
          args.onComplete(res, conf["args"]);
          setTimeout(nextRequest, 0);
        };
        fail = function(res) {
          lock = false;
          args.onFail(res, conf["args"]);
          setTimeout(nextRequest, 0);
        };
        queue = [];
        current = null;
        lock = false;
        conf = $.parseParam({
          url: "",
          method: "get",
          responseType: "json",
          timeout: 30 * 1e3,
          onTraning: $.funcEmpty,
          isEncode: true
        }, args);
        conf["onComplete"] = complete;
        conf["onFail"] = fail;
        var nextRequest = function() {
          if (!queue.length) {
            return;
          }
          if (lock === true) {
            return;
          }
          lock = true;
          conf.args = queue.shift();
          current = $.ajax(conf);
        };
        var abort = function(params) {
          while (queue.length) {
            queue.shift();
          }
          lock = false;
          if (current) {
            try {
              current.abort();
            } catch (exp) {}
          }
          current = null;
        };
        that = {};
        that.request = function(params) {
          if (!params) {
            params = {};
          }
          if (params && !params.setting_rid && window.$CONFIG && $CONFIG.setting_rid) {
            params.setting_rid = $CONFIG.setting_rid;
          }
          if (args["noQueue"]) {
            abort();
          }
          if (!args["uniqueRequest"] || !current) {
            queue.push(params);
            params["_t"] = 0;
            nextRequest();
          }
        };
        that.abort = abort;
        return that;
      };
    });;




    STK.register("kit.io.jsonp", function($) {
      return function(args) {
        var conf, that, queue, current, lock;
        conf = $.parseParam({
          url: "",
          method: "get",
          responseType: "json",
          varkey: "_v",
          timeout: 30 * 1e3,
          onComplete: $.funcEmpty,
          onTraning: $.funcEmpty,
          onFail: $.funcEmpty,
          isEncode: true
        }, args);
        queue = [];
        current = {};
        lock = false;
        var nextRequest = function() {
          if (!queue.length) {
            return;
          }
          if (lock === true) {
            return;
          }
          lock = true;
          current.args = queue.shift();
          current.onComplete = function(res) {
            lock = false;
            conf.onComplete(res, current["args"]);
            setTimeout(nextRequest, 0);
          };
          current.onFail = function(res) {
            lock = false;
            conf.onFail(res);
            setTimeout(nextRequest, 0);
          };
          $.jsonp($.kit.extra.merge(conf, {
            args: current.args,
            onComplete: function(res) {
              current.onComplete(res);
            },
            onFail: function(res) {
              try {
                current.onFail(res);
              } catch (exp) {}
            }
          }));
        };
        that = {};
        that.request = function(params) {
          if (!params) {
            params = {};
          }
          if (params && !params.setting_rid && window.$CONFIG && $CONFIG.setting_rid) {
            params.setting_rid = $CONFIG.setting_rid;
          }
          queue.push(params);
          params["_t"] = 1;
          nextRequest();
        };
        that.abort = function(params) {
          while (queue.length) {
            queue.shift();
          }
          lock = false;
          current = null;
        };
        return that;
      };
    });;








    STK.register("kit.io.jsonp2", function($) {
      return function(oOpts) {
        var opts = $.core.obj.parseParam({
          url: "",
          charset: "UTF-8",
          timeout: 30 * 1e3,
          args: {},
          onComplete: null,
          onTimeout: null,
          responseName: null,
          isEncode: false,
          varkey: "varname"
        }, oOpts);
        var funcStatus = -1;
        var uniqueID = opts.responseName || "STK_" + $.core.util.getUniqueKey();
        opts.args[opts.varkey] = uniqueID;
        var completeFunc = opts.onComplete;
        var timeoutFunc = opts.onTimeout;
        opts.onTimeout = function() {
          if (funcStatus != 1 && timeoutFunc != null) {
            funcStatus = 2;
            timeoutFunc();
          }
        };
        opts.onComplete = function() {
          if (funcStatus != 2 && completeFunc != null) {
            funcStatus = 1;
            completeFunc(window[uniqueID]);
            window[uniqueID] = undefined;
          }
        };
        return $.core.io.scriptLoader(opts);
      };
    });;




    STK.register("kit.io.inter", function($) {
      return function() {
        var that, argsList, hookList;
        that = {};
        argsList = {};
        hookList = {};
        that.register = function(name, args) {
          if (argsList[name] !== undefined) {
            throw name + " interface has been registered";
          }
          argsList[name] = args;
          hookList[name] = {};
        };
        that.hookComplete = function(name, func) {
          var key = $.core.util.getUniqueKey();
          hookList[name][key] = func;
          return key;
        };
        that.removeHook = function(name, key) {
          if (hookList[name] && hookList[name][key]) {
            delete hookList[name][key];
          }
        };
        that.getTrans = function(name, spec) {
          var conf = $.kit.extra.merge(argsList[name], spec);
          conf.onComplete = function(req, params) {
            try {
              spec.onComplete(req, params);
            } catch (exp) {}
            if (req && req.code && req["code"] === "100000") {
              try {
                spec.onSuccess(req, params);
              } catch (exp) {}
            } else {
              try {
                spec.onError(req, params);
              } catch (exp) {}
            }
            for (var k in hookList[name]) {
              try {
                hookList[name][k](req, params);
              } catch (exp) {}
            }
          };
          if (argsList[name]["requestMode"] === "jsonp") {
            return $.kit.io.jsonp(conf);
          } else if (argsList[name]["requestMode"] === "ijax") {
            return $.kit.io.ijax(conf);
          } else {
            return $.kit.io.ajax(conf);
          }
        };
        that.request = function(name, spec, args) {
          var conf = $.core.json.merge(argsList[name], spec);
          if (args && !args.setting_rid && window.$CONFIG && $CONFIG.setting_rid) {
            args.setting_rid = $CONFIG.setting_rid;
          }
          conf.onComplete = function(req, params) {
            try {
              spec.onComplete(req, params);
            } catch (exp) {}
            if (req && req.code && req["code"] === "100000") {
              try {
                spec.onSuccess(req, params);
              } catch (exp) {}
            } else {
              try {
                spec.onError(req, params);
              } catch (exp) {}
            }
            for (var k in hookList[name]) {
              try {
                hookList[name][k](req, params);
              } catch (exp) {}
            }
          };
          conf = $.core.obj.cut(conf, ["noqueue"]);
          conf.args = args;
          if (argsList[name]["requestMode"] === "jsonp") {
            return $.jsonp(conf);
          } else if (argsList[name]["requestMode"] === "jsonp2") {
            return $.kit.io.jsonp2(conf);
          } else if (argsList[name]["requestMode"] === "ijax") {
            return $.ijax(conf);
          } else {
            return $.ajax(conf);
          }
        };
        return that;
      };
    });;






    STK.register("core.obj.cut", function($) {
      return function(obj, list) {
        var ret = {};
        if (!$.core.arr.isArray(list)) {
          throw "core.obj.cut need array as second parameter";
        }
        for (var k in obj) {
          if (!$.core.arr.inArray(k, list)) {
            ret[k] = obj[k];
          }
        }
        return ret;
      };
    });;


    STK.register("common.trans.userPanel", function($) {
      var t = $.kit.io.inter();
      var g = t.register;
      g("commentInfo", {
        url: "http://comment5.news.sina.com.cn/user/message?action=read&version=2&type=reply",
        requestMode: "jsonp"
      });
      g("emailInfo", {
        url: "http://service.mail.sina.com.cn/mailproxy/mailnotice.php",
        requestMode: "jsonp"
      });
      g("weiboInfo", {
        url: "http://api.weibo.com/2/users/show_brief.json",
        requestMode: "jsonp"
      });
      g("blogInfo", {
        url: "http://comet.blog.sina.com.cn/notice",
        requestMode: "jsonp2"
      });
      return t;
    });;


    STK.register("comp.userpanel.emailmenu", function($) {
      var trans = $.common.trans.userPanel;
      return function(spec) {
        var that = {};
        var newInfoRead = [true];
        var conf = $.parseParam({
          tab: null,
          index: null,
          userInfo: null,
          allReadCallback: function(isRead, index) {}
        }, spec);
        var nodes, newInfoIcon;
        var isRead = true,
          isAvailable = true;
        var cache = {
          data: 0
        };
        var setRead = function(read) {
          isRead = read;
          if (isRead) {
            newInfoIcon.style.visibility = "hidden";
            conf.allReadCallback(isRead, conf.index);
          }
        };
        var onGetInfo = function(callback) {
          if (!isAvailable) {
            callback && callback(false);
            return;
          }
          trans.request("emailInfo", {
            onComplete: function(ret) {
              var data = ret.data;
              var num = data;
              if (ret.result && hasNewInfo(ret)) {
                if (ret.data > 0) {
                  newInfoIcon.style.visibility = "visible";
                  isRead = false;
                  conf.allReadCallback(isRead, conf.index);
                } else {
                  newInfoIcon.style.visibility = "hidden";
                  isRead = true;
                  conf.allReadCallback(isRead, conf.index);
                }
              } else if (!ret.result) {
                isAvailable = false;
              }
            },
            onFail: function() {}
          }, {
            action: "email"
          });
        };
        var hasNewInfo = function(data) {
          var flag = false;
          if (!cache) {
            cache = {};
            cache["data"] = data["data"];
            flag = true;
          } else {
            if (cache["data"] == data["data"])
              flag = false;
            else {
              newInfoRead[0] = false;
              flag = true;
            }
            cache["data"] = data["data"];
          }
          return flag;
        };
        var parseDOM = function() {
          nodes = $.kit.dom.parseDOM($.core.dom.builder(conf.tab).list);
          newInfoIcon = nodes.new_info_icon;
        };
        var init = function() {
          parseDOM();
        };
        init();
        that.setRead = setRead;
        that.onGetInfo = onGetInfo;
        return that;
      };
    });;




    STK.register("comp.userpanel.weibomenu", function($) {
      var trans = $.common.trans.userPanel;
      var $template = "" + '<div class="needlogin">还未开通微博<a target"_blank" href="http://weibo.com/signup/signup.php"  class="list-link">立刻开通</a></div>';
      return function(spec) {
        var that = {};
        var newInfoRead = [true, true, true];
        var conf = $.parseParam({
          tab: null,
          index: null,
          userInfo: null,
          allReadCallback: function(isRead) {}
        }, spec);
        var cache = {
          mention_status: 0,
          dm: 0,
          cmt: 0
        };
        var nodes, newInfoIcon;
        var isRead = true,
          isAvailable = true;
        var onGetInfo = function(callback) {
          if (!isAvailable) return;
          trans.request("weiboInfo", {
            onComplete: function(ret) {
              var data = ret.data;
              if (ret.code == 0 && (data.error_code == 20003 || data.error_code == 10013)) {
                isAvailable = false;
              }
              if (ret.code == 1) {
                var messageCount = data.dm;
                var commentCount = data.cmt;
                var atCount = data.mention_status;
                if (hasNewInfo(data)) {
                  if (atCount + commentCount + messageCount > 0) {
                    newInfoIcon.style.visibility = "visible";
                    isRead = false;
                    conf.allReadCallback(isRead, conf.index);
                  } else {
                    isRead = true;
                    setRead(isRead);
                  }
                }
              }
            },
            onFail: function() {
              throw "error of getting weiboinfo";
            }
          }, {
            source: "2835469272"
          });
        };
        var hasNewInfo = function(data) {
          var flag = false;
          if (!cache) {
            flag = true;
            cache = {};
            cache["mention_status"] = data["mention_status"];
            cache["dm"] = data["dm"];
            cache["cmt"] = data["cmt"];
          } else {
            if (cache["mention_status"] != data["mention_status"] && data["mention_status"] != 0) {
              newInfoRead[0] = false;
            }
            if (cache["cmt"] != data["cmt"] && data["cmt"] != 0) {
              newInfoRead[1] = false;
            }
            if (cache["dm"] != data["dm"] && data["dm"] != 0) {
              newInfoRead[2] = false;
            }
            flag = true;
            for (var i = 0; i < newInfoRead.length; i++) {
              flag = flag && newInfoRead[i];
            }
            flag = !flag;
            cache["mention_status"] = data["mention_status"];
            cache["dm"] = data["dm"];
            cache["cmt"] = data["cmt"];
          }
          return flag;
        };
        var parseDOM = function() {
          nodes = $.kit.dom.parseDOM($.core.dom.builder(conf.tab).list);
          newInfoIcon = nodes.new_info_icon;
        };
        var init = function() {
          parseDOM();
        };
        var setRead = function(read) {
          isRead = read;
          if (isRead) {
            newInfoIcon.style.visibility = "hidden";
            conf.allReadCallback(isRead, conf.index);
          }
        };
        init();
        that.setRead = setRead;
        that.onGetInfo = onGetInfo;
        return that;
      };
    });;




    STK.register("comp.userpanel.commentmenu", function($) {
      var trans = $.common.trans.userPanel;
      return function(spec) {
        var that = {};
        var newInfoRead = [true];
        var conf = $.parseParam({
          tab: null,
          index: null,
          userInfo: null,
          allReadCallback: function(isRead) {},
          newComment: function() {}
        }, spec);
        var nodes, newInfoIcon;
        var isRead = false;
        var cache = {
          reply: 0
        };
        var onGetInfo = function(callback) {
          trans.request("commentInfo", {
            onComplete: function(ret) {
              var data = ret.result.data;
              var num = data.reply;
              if (ret.result.status.code == 0 && hasNewInfo(data)) {
                conf.newComment && conf.newComment(num);
                if (data.reply > 0) {
                  newInfoIcon.style.visibility = "visible";
                  isRead = false;
                  conf.allReadCallback(false, conf.index);
                } else {
                  newInfoIcon.style.visibility = "hidden";
                  isRead = true;
                  conf.allReadCallback(true, conf.index);
                }
              }
            },
            onFail: function() {
              throw "error of getting comment info";
            }
          }, {});
        };
        var hasNewInfo = function(data) {
          var flag = false;
          if (cache.reply == data.reply) {
            flag = false;
          } else {
            newInfoRead[0] = false;
            flag = true;
          }
          cache.reply = data.reply;
          return flag;
        };
        var setRead = function(read) {
          isRead = read;
          if (isRead) {
            newInfoIcon.style.visibility = "hidden";
            conf.allReadCallback(true, conf.index);
          }
        };
        var parseDOM = function() {
          nodes = $.kit.dom.parseDOM($.core.dom.builder(conf.tab).list);
          newInfoIcon = nodes.new_info_icon;
        };
        var init = function() {
          parseDOM();
        };
        init();
        that.setRead = setRead;
        that.onGetInfo = onGetInfo;
        return that;
      };
    });;




    STK.register("comp.userpanel.blogmenu", function($) {
      var trans = $.common.trans.userPanel;
      return function(spec) {
        var that = {};
        var conf = $.parseParam({
          tab: null,
          index: null,
          userInfo: null,
          outLoginLayer: null,
          allReadCallback: function(isRead) {}
        }, spec);
        var isRead = true,
          isAvailable = true;
        var uid = conf.outLoginLayer.getSinaCookie() && conf.outLoginLayer.getSinaCookie().uid;
        var onGetInfo = function(callback) {
          trans.request("blogInfo", {
            onComplete: function(ret) {
              if (ret.code == "A00006") {
                var data = ret.data[uid];
                if (data.unreadnotices > 0 || data.blogcomment > 0) {
                  newInfoIcon.style.visibility = "visible";
                  isRead = false;
                  conf.allReadCallback(isRead, conf.index);
                } else {
                  isRead = true;
                  setRead(isRead);
                }
              }
            },
            onFail: function() {
              throw "error of getting bloginfo";
            }
          }, {
            uid: uid
          });
        };
        var parseDOM = function() {
          nodes = $.kit.dom.parseDOM($.core.dom.builder(conf.tab).list);
          newInfoIcon = nodes.new_info_icon;
        };
        var init = function() {
          parseDOM();
        };
        var setRead = function(read) {
          isRead = read;
          if (isRead) {
            newInfoIcon.style.visibility = "hidden";
            conf.allReadCallback(isRead, conf.index);
          }
        };
        init();
        that.setRead = setRead;
        that.onGetInfo = onGetInfo;
        return that;
      };
    });;


    STK.register("comp.userpanel.accountmenu", function($) {
      var $sizzle = $.core.dom.sizzle;
      return function(spec) {
        var that = {};
        var STATUS_LOGIN = 4097,
          STATUS_PRELOGIN = 4098,
          STATUS_UNLOGIN = 4096;
        var node, newInfoIcon, tabs, loginStatus, dropMenu;
        var infoTimer,
          SPEED = 6e4;
        var menus = [];
        var newInfoCache = {};
        var conf = $.parseParam({
          button: null,
          menu: null,
          loginStatus: null,
          userInfo: null,
          outLoginLayer: null,
          onActive: function() {},
          onCancel: function() {},
          newComment: function() {}
        }, spec);
        var onActive = function() {
          conf.onActive();
        };
        var onCancel = function() {
          conf.onCancel();
        };
        var getInfo = function() {
          for (var i = 0; i < menus.length; i++) {
            menus[i].onGetInfo();
          }
          infoTimer = setInterval(function() {
            for (var i = 0; i < menus.length; i++) {
              menus[i].onGetInfo();
            }
          }, SPEED);
        };
        var stop = function() {
          if (infoTimer) {
            clearInterval(infoTimer);
            infoTimer = null;
          }
        };
        var initMenus = function() {
          dropMenu = $.comp.userpanel.dropmenu({
            button: conf.button,
            menu: conf.menu,
            onActive: onActive,
            id: 1,
            onCancel: onCancel
          });
          menus.push($.comp.userpanel.commentmenu({
            tab: tabs[0],
            userInfo: conf.userInfo,
            index: 0,
            allReadCallback: allReadCallback,
            newComment: function(num) {
              conf.newComment && conf.newComment(num);
            }
          }));
          menus.push($.comp.userpanel.weibomenu({
            tab: tabs[1],
            index: 1,
            allReadCallback: allReadCallback
          }));
          menus.push($.comp.userpanel.blogmenu({
            tab: tabs[2],
            index: 2,
            outLoginLayer: conf.outLoginLayer,
            allReadCallback: allReadCallback
          }));
          menus.push($.comp.userpanel.emailmenu({
            tab: tabs[3],
            index: 3,
            allReadCallback: allReadCallback
          }));
        };
        var allReadCallback = function(isRead, index) {
          newInfoCache[index] = isRead;
          var flag = true;
          for (var el in newInfoCache) {
            flag = flag && newInfoCache[el];
          }
          if (!flag) {
            newInfoIcon.style.visibility = "visible";
          } else {
            newInfoIcon.style.visibility = "hidden";
          }
        };
        var parseDOM = function() {
          if (!conf.button || !conf.menu)
            throw " node is not defined";
          node = conf.menu;
          var nodes = $.kit.dom.parseDOM($.core.dom.builder(conf.button).list);
          newInfoIcon = nodes.new_info_icon;
          tabs = $.core.dom.sizzle("li[action-type=tab_btn]", node);
          loginStatus = conf.loginStatus;
        };
        var initPlugins = function() {
          initMenus();
          if (conf.loginStatus != STATUS_UNLOGIN) {
            getInfo();
          }
        };
        var init = function() {
          parseDOM();
          initPlugins();
        };
        init();
        var hide = function() {
          dropMenu.hide();
        };
        var destroy = function() {
          if (menus) {
            for (var i = 0; i < menus.length; i++) {
              menus[i].setRead(true);
            }
          }
          newInfoIcon.style.visibility = "hidden";
          stop();
          dropMenu.destroy();
        };
        that.hide = hide;
        that.destroy = destroy;
        return that;
      };
    });;


    STK.register("comp.userpanel.template", function($) {
      var that = {};
      var portraitTemplate = "<#et temp data>" + "<#if (data.status != 0x1000 )>" + '<div class="ac-login-cnt" node-type="outer">' + "<#if (data.status != 0x1001)>" + '<a class="thumb" action-type="login_btn"><img src="${data.url}"></a>' + "<#elseif (data.isWeibo)>" + '<a class="thumb" href="http://weibo.com/" suda-uatrack="key=index_top&value=head_click" target="_blank"><img src="${data.url}"></a>' + "<#else>" + '<a class="thumb" href="http://login.sina.com.cn/" suda-uatrack="key=index_top&value=head_click" target="_blank"><img src="${data.url}"></a>' + "</#if>" + '<span style="display:none" class="log-links"><a    href="javascript:;">登录</a><em class="ac-icon ac-icon-slash"></em><a   target="_blank"   href="https://login.sina.com.cn/signup/signup?entry=homepage">注册</a></span>' + '<i class="ac-icon ac-icon-ar"></i><i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "</div>" + "<#else>" + '<div class="ac-login-cnt" node-type="outer">' + '<a class="ac-login-cnt" node-type="login_btn" href="javascript:;"><span class="thumb"><img src="${data.url}"></span><span class="log-links">登录</span></a>' + "</div>" + "</#if>" + "</#et>";
      // 禁用hover效果改为click后弹出,添加了ac-dropdown-wrap及ac-arrow 20151221131951
      var accountMenuTemplate = "<#et temp data>" + '<div class="ac-dropdown-wrap" style="display:none;" node-type="outer"><ul class="ac-dropdown">' + "<#list data.links as link>" + "<li>" + '<a target="_blank" href="${link.url}">${link.title}</a>' + "</li>" + "</#list>" + '<li action-type="tab_btn">' + "<#if (data.status == 0x1001)>" + '<a   target="_blank" href="http://my.sina.com.cn/#location=news">我的新浪</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "<#else>" + '<a  action-type="login_btn"  href="javascript:;">我的新浪</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "</#if>" + "</li>" + '<li action-type="tab_btn">' + "<#if (data.status == 0x1001)>" + '<a target="_blank"   href="http://weibo.com">我的微博</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "<#else>" + '<a  action-type="login_btn" href="javascript:;">我的微博</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "</#if>" + "</li>" + '<li action-type="tab_btn">' + "<#if (data.status == 0x1001)>" + '<a target="_blank"   href="http://i.blog.sina.com.cn">我的博客</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "<#else>" + '<a  action-type="login_btn" href="javascript:;">我的博客</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "</#if>" + "</li>" + '<li action-type="tab_btn">' + "<#if (data.status == 0x1001)>" + '<a target="_blank"   href="http://mail.sina.com.cn/">我的邮箱</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "<#else>" + '<a  action-type="login_btn" href="javascript:;">我的邮箱</a>' + '<i class="ac-icon ac-icon-message" node-type="new_info_icon" style="visibility:hidden"></i>' + "</#if>" + "</li>" + "<li>" + "<#if (data.status == 0x1001)>" + '<a target="_blank"   href="http://news.sina.com.cn/guide/">我的导航</a>' + "<#else>" + '<a  action-type="login_btn" href="javascript:;">我的导航</a>' + "</#if>" + "</li>" + "<li>" + '<a   target="_blank" suda-uatrack="key=index_top&value=logout"  href="javascript:;" action-type="logout_btn">退出</a>' + "</li>" + '</ul><i class="ac-arrow"></i></div>' + "</#et>";

      that.portraitTemplate = portraitTemplate;
      that.accountMenuTemplate = accountMenuTemplate;
      return that;
    });;


    STK.register("comp.userpanel.loginLayer", function($) {
      var $funEmpty = $.core.func.empty;
      var $storage = $.core.util.storage;
      var $listener = $.core.util.listener;
      return function(spec) {
        var that = {},
          node;
        var outLoginLayer;
        var parentNode = null;
        var conf = $.parseParam({
          node: null,
          layer_hide: $funEmpty,
          login_success: $funEmpty,
          login_failure: $funEmpty,
          logout_success: $funEmpty,
          layer_ready: $funEmpty,
          extra: {
            css: null
          },
          pre_login_state: $funEmpty
        }, spec);
        var isOutLoginShowed = false;
        var setLayerAbsolutePosition = function(pos, fixed) {
          var fixed = fixed || false;
          var layer = outLoginLayer.nodes.box;
          var left = pos.l;
          var top = pos.t;
          css = $.core.dom.cssText(layer.style.cssText);
          css.push("top", top + "px");
          css.push("left", left + "px");
          layer.style.cssText = css.getCss();
        };
        var setCenter = function(fixed) {
          var fixed = fixed || false;
          parentNode = document.body;
          if (!fixed) {
            setParent(parentNode);
            var winSize = $.core.util.winSize();
            var scrollPos = $.core.util.scrollPos();
            var outerSize = $.core.dom.getSize(getOutLoginLayer().nodes.box);
            var pos = {
              l: (winSize.width - outerSize.width) / 2,
              t: scrollPos.top + (winSize.height - outerSize.height) / 2
            };
            setLayerAbsolutePosition(pos);
          } else {
            var pluginOps = {
              position: "center",
              parentNode: null,
              relatedNode: null
            };
            pluginOps = $.parseParam(pluginOps, {
              parentNode: parentNode,
              position: "center",
              useIframeInIE6: true
            });
            outLoginLayer.toggleType = "normal";
            outLoginLayer.set("plugin", pluginOps);
          }
        };
        var setLayerPosition = function(srcElm, layer, pos, outer) {
          var outer = outer || conf.node;
          var outerPos = $.core.dom.position(outer);
          var pos = pos || "below";
          var nodeSize = $.core.dom.getSize(outLoginLayer.nodes.box);
          var layerSize = $.core.dom.getSize(layer);
          var elmSize = $.core.dom.getSize(srcElm);
          var elmPos = $.core.dom.position(srcElm);
          var top, left;
          var css;
          if (pos == "below") {
            top = elmSize.height + (elmPos.t - outerPos.t);
            left = -1 * Math.abs(layerSize.width - elmSize.width) + (elmPos.l - outerPos.l) + 128;
          } else if (pos == "right") {
            top = elmPos.t - outerPos.t;
            left = elmPos.l - outerPos.l + elmSize.width;
          } else if (pos == "left") {
            top = elmPos.t - outerPos.t;
            left = elmPos.l - outerPos.l - nodeSize.width;
          } else if (pos == "above") {
            top = elmPos.t - outerPos.t - nodeSize.height;
            left = elmPos.l - outerPos.l;
          }
          css = $.core.dom.cssText(layer.style.cssText);
          css.push("top", top + "px");
          css.push("left", left + "px");
          layer.style.cssText = css.getCss();
        };
        var canOutoginLayerClose = function() {
          if (outLoginLayer.isLogin()) {
            return false;
          } else {
            var activeNode = document.activeElement;
            var loginname = outLoginLayer.nodes.loginname.value,
              password = outLoginLayer.nodes.password.value;
            return !(loginname || password || $.contains(outLoginLayer.nodes.box, activeNode) && activeNode.tagName === "INPUT");
          }
        };
        var initLoginLayer = function() {
          outLoginLayer = window.SINA_OUTLOGIN_LAYER;
          node.style.position = "relative";
          parentNode = node;
          outLoginLayer = outLoginLayer.set("plugin", {
            position: "custom"
          });
          outLoginLayer.set("extra", {
            css: conf.extra.css
          });
          outLoginLayer.set("plugin", {
            parentNode: node
          });
          outLoginLayer.set("styles", {
            zIndex: 999
          });
          outLoginLayer.register("layer_hide", function() {
            if (isOutLoginShowed) conf.layer_hide();
            isOutLoginShowed = false;
          });
          outLoginLayer.register("login_success", function() {
            outLoginLayer.getWeiboInfo({
              onComplete: function(ret) {
                if (ret && ret.result && ret.result.data) {
                  conf.login_success(ret.result.data);
                } else {
                  conf.login_success(null);
                }
              },
              onSuccess: function(ret) {},
              onFailure: function(ret) {
                throw "error of getting weiboinfo";
              }
            });
          });
          outLoginLayer.register("login_failure", function() {
            conf.login_failure();
          });
          outLoginLayer.register("logout_success", function() {
            conf.logout_success();
          });
          outLoginLayer.register("pre_login_state", function() {
            outLoginLayer.getPreLoginWeiboData({
              onComplete: function(ret) {
                if (ret.code == 1) {
                  conf.pre_login_state(ret.data);
                } else
                  throw "error of getting weiboinfo";
              },
              onFailure: function(ret) {
                throw "error of getting weiboinfo";
              }
            });
          });
          outLoginLayer.register("layer_ready", function() {
            setLayerPosition(node, outLoginLayer.nodes.box);
            conf.layer_ready();
          });
        };
        var getOutLoginLayer = function() {
          return outLoginLayer;
        };
        var destroy = function() {};
        var setParent = function(elm, type) {
          if (!$.isNode(elm))
            throw "param elm is invalid";
          var type = type || "custom";
          parentNode = elm;
          outLoginLayer.set("plugin", {
            parentNode: elm,
            position: type
          });
        };
        var show = function() {
          if (outLoginLayer.nodes.box.parentNode == parentNode) {
            if (isOutLoginShowed) return;
            isOutLoginShowed = true;
            $listener.fire("clearfloat", "clear", [3]);
            outLoginLayer.show();
          } else {
            isOutLoginShowed = true;
            outLoginLayer.show();
          }
        };
        var isLogin = function() {
          return outLoginLayer.isLogin();
        };
        var isPreLoginState = function() {
          return outLoginLayer.isPreLoginState;
        };
        var getOuter = function() {
          return outLoginLayer.nodes.box;
        };
        var logout = function() {
          return outLoginLayer.logout();
        };
        var getSinaCookie = function() {
          return outLoginLayer.getSinaCookie();
        };
        var hide = function() {
          isOutLoginShowed = false;
          outLoginLayer.hide();
        };
        var isDisplay = function() {
          return outLoginLayer.isDisplay();
        };
        var parseDOM = function() {
          if (!conf.node)
            throw "node is not defined";
          node = conf.node;
        };
        var init = function() {
          parseDOM();
          initLoginLayer();
        };
        init();
        that.setLayerAbsolutePosition = setLayerAbsolutePosition;
        that.getOutLoginLayer = getOutLoginLayer;
        that.getOuter = getOuter;
        that.show = show;
        that.logout = logout;
        that.getSinaCookie = getSinaCookie;
        that.isLogin = isLogin;
        that.destroy = destroy;
        that.isPreLoginState = isPreLoginState;
        that.hide = hide;
        that.setCenter = setCenter;
        that.setParent = setParent;
        that.setLayerPosition = setLayerPosition;
        that.isDisplay = isDisplay;
        return that;
      };
    });;


    STK.register("comp.userpanel.hover", function($) {
      var $addEvent = $.core.evt.addEvent;
      var $contains = $.core.dom.contains;
      var $removeEvent = $.core.evt.removeEvent;
      var timers = [];
      return function(spec) {
        var that = {};
        var DELAY = 100,
          button, content, timer;
        var disabled = false;
        var handlerType;
        var conf = $.parseParam({
          button: null,
          content: null,
          delay: DELAY,
          type: "1",
          showCallback: function() {},
          hideCallback: function() {}
        }, spec);
        var buttonMouseOverHandler = function(evt) {
          if (disabled) {
            return;
          }
          var target = evt.target || evt.srcElement;
          for (var i = 0; i < timers.length; i++) {
            clearTimeout(timers[i]);
          }
          timers = [];
          conf.showCallback && conf.showCallback(evt);
        };
        var buttonMouseOutHandler = function(evt) {
          if (disabled) {
            return;
          }
          var target = evt.toElement || evt.relatedTarget;
          if (!$.isNode(target)) return;
          if (!(target == button || $contains(button, target))) {
            timer = setTimeout(function() {
              conf.hideCallback && conf.hideCallback(evt);
            }, DELAY);
            timers.push(timer);
          }
        };
        var contentMouseOverHandler = function(evt) {
          if (disabled || handlerType == 2) {
            return;
          }
          for (var i = 0; i < timers.length; i++) {
            clearTimeout(timers[i]);
          }
          timers = [];
          conf.showCallback && conf.showCallback(evt);
        };
        var setType = function(type) {
          handlerType = type;
        };
        var setDisabled = function(flag) {
          disabled = flag;
        };
        var contentMouseOutHandler = function(evt) {
          if (disabled || handlerType == 2) {
            return;
          }
          var target = evt.toElement || evt.relatedTarget || evt.srcElement;
          if (!$.isNode(target)) return;
          if (!(target == content || $contains(content, target))) {
            timer = setTimeout(function() {
              conf.hideCallback && conf.hideCallback(evt);
            }, DELAY);
            timers.push(timer);
          }
        };
        var destroy = function() {
          $removeEvent(button, "mouseover", buttonMouseOverHandler);
          $removeEvent(button, "mouseout", buttonMouseOutHandler);
          $removeEvent(content, "mouseover", contentMouseOverHandler);
          $removeEvent(content, "mouseout", contentMouseOutHandler);
        };
        var parseDOM = function() {
          if (!$.isNode(conf.button) || !$.isNode(conf.content)) {
            throw "arguments are invalid";
          }
          button = conf.button;
          content = conf.content;
        };
        var bindListener = function() {
          if (navigator.userAgent.indexOf("iPad") == -1) {
            $addEvent(button, "mouseover", buttonMouseOverHandler);
            $addEvent(button, "mouseout", buttonMouseOutHandler);
            $addEvent(content, "mouseover", contentMouseOverHandler);
            $addEvent(content, "mouseout", contentMouseOutHandler);
          }
        };
        var init = function() {
          parseDOM();
          bindListener();
          handlerType = conf.type;
        };
        init();
        that.setType = setType;
        that.setDisabled = setDisabled;
        that.destroy = destroy;
        return that;
      };
    });;


    STK.register("comp.userPanelNewVersion", function($) {
      var $delegatedEvt;
      var addEvent = $.core.evt.addEvent;
      var $lang = $.core.util.language;
      var $appendStyle = $.kit.dom.appendStyle;
      var $builder = $.kit.dom.builder;
      var $loadStyle = $.kit.dom.loadStyle;
      var $makeReady = $.kit.util.makeReady;
      var $listener = $.core.util.listener;
      var $defaultStyle = $.comp.defaultStyle;
      var $channel = $.common.channel.plugin;
      var $delegatedEvt = $.core.evt.delegatedEvent;
      var $sizzle = $.core.dom.sizzle;
      var template = $.comp.userpanel.template;
      var $addClass = $.core.dom.addClassName;
      var $contains = $.core.dom.contains;
      var $removeClass = $.core.dom.removeClassName;
      var nodes, node, anotherButton;
      var loginBtn, registerBtn, notificationBtn, loginOuter;
      var accountMenu, notificationMenu;
      var that = {};
      var isCssLoaded = false,
        hasBeenInitialed = false;
      var DEFAULTPORTRAITURL = "http://i.sso.sina.com.cn/images/login/pre_loading.gif";
      var hoverFuns = [];
      var outLoginLayer;
      var STATUS_LOGIN = 4097,
        STATUS_PRELOGIN = 4098,
        STATUS_UNLOGIN = 4096;
      var loginStatus, userInfo;
      var opts = {
        outloginlayer: {
          ready: function() {},
          loginBtns: null
        },
        container: {
          node: null
        },
        extra: {
          css: null,
          outlogin: "http://i.sso.sina.com.cn/js/outlogin_layer.js",
          anotherButton: null
        },
        plugin: {
          portrait: true,
          links: []
        }
      };
      var listenerFun = {
        plugin_ready: null,
        outlogin_ready: null,
        weibolist_show: null,
        weibolist_hide: null,
        new_comment: null
      };
      var set = function(type, spec) {
        var flag = false;
        type = type.toLowerCase();
        for (var el in opts) {
          if (el == type) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          throw "arguments are invalid";
        }
        spec = spec || {};
        var o = opts[type];
        opts[type] = $.parseParam(o, spec);
        return that;
      };
      var build = function() {
        buildAccount();
        if (loginStatus != STATUS_UNLOGIN) {
          buildAccountMenu();
        }
      };
      var buildAccount = function() {
        var defaultUrl = userInfo.weiboInfo ? userInfo.weiboInfo.profile_image_url : DEFAULTPORTRAITURL;
        var portraitUrl = loginStatus != STATUS_UNLOGIN ? defaultUrl : "http://i.sso.sina.com.cn/images/login/thumb_default.png";
        if (!opts.plugin.portrait) {
          portraitUrl = "http://i.sso.sina.com.cn/images/login/avatar_icon.jpg";
        }
        var registerOuter = $sizzle(".ac-rgst", node)[0];
        var param = {
          url: portraitUrl,
          status: loginStatus,
          isWeibo: userInfo.weiboInfo != null
        };
        var _html = $.core.util.easyTemplate(template.portraitTemplate, param).toString();
        var dom = $.kit.dom.parseDOM($.core.dom.builder(_html).list);
        var outer = dom.outer;
        loginOuter.innerHTML = "";
        loginOuter.appendChild(outer);
        loginBtn = dom.login_btn;
        if (loginStatus != STATUS_UNLOGIN) {
          $addClass(loginOuter, "ac-logined");
          registerOuter.style.display = "none";
        } else {
          $removeClass(loginOuter, "ac-logined");
          registerOuter.style.display = "";
        }
        bindListener();
        // 禁用hover效果改为click后弹出 20151221131951
        // initHovers();
      };
      var buildAccountMenu = function() {
        var userData;
        if (userInfo.weiboInfo) {
          userData = userInfo.weiboInfo;
          userData.uid = userData.id;
        } else {
          userData = userInfo.sinaInfo;
          userData.screen_name = userData.nick;
        }
        var param = {
          status: loginStatus,
          userInfo: userData,
          isWeibo: userInfo.weiboInfo != null,
          links: opts.plugin.links
        };
        var _html = $.core.util.easyTemplate(template.accountMenuTemplate, param).toString();
        var dom = $.kit.dom.parseDOM($.core.dom.builder(_html).list);
        var outer = dom.outer;
        var icon = $sizzle(".ac-icon", loginOuter)[1];
        var btn = $sizzle(".ac-login-cnt", loginOuter)[0];
        loginOuter.appendChild(outer);
        accountMenu = $.comp.userpanel.accountmenu({
          button: btn,
          menu: outer,
          loginStatus: loginStatus,
          userInfo: userInfo,
          outLoginLayer: outLoginLayer,
          onActive: function() {
            $addClass(btn, "ac-active");
            listenerFun.weibolist_show && listenerFun.weibolist_show();
          },
          onCancel: function() {
            $removeClass(btn, "ac-active");
            listenerFun.weibolist_hide && listenerFun.weibolist_hide();
          },
          newComment: function(num) {
            listenerFun.new_comment && listenerFun.new_comment(num);
          }
        });
        addEvent(btn, "click", function() {
          if ($.getStyle(outer, "display") !== "none") {
            $removeClass(btn, "ac-active");
            $removeClass(btn, "active");
            outer.style.display = "none";
          } else {
            $addClass(btn, "ac-active");
            $addClass(btn, "active");
            outer.style.display = "";
          }
        });
        addEvent(document.body, "touchend", function(e) {
          var target = e.target;
          if (btn == target || outer == target || $contains(btn, target) || $contains(outer, target)) {
            return;
          }
          $removeClass(btn, "ac-active");
          $removeClass(btn, "active");
          outer.style.display = "none";
        });
        $delegatedEvt = $.core.evt.delegatedEvent(outer);
        $delegatedEvt.add("logout_btn", "click", logout);
      };
      var initCssStyle = function(callback) {
        var cssReady = $makeReady({
          condition: function() {
            return isCssLoaded;
          },
          ready: function(cbk) {
            $appendStyle($defaultStyle.get());
            var cssCheckNode = $.C("div");
            cssCheckNode.setAttribute("class", "css_check");
            cssCheckNode.style.position = "absolute";
            node.appendChild(cssCheckNode);
            if (opts.extra.css) {
              $loadStyle(opts.extra.css, {
                timeout: 10 * 1e3,
                styleCheck: function() {
                  if ($.isNode(cssCheckNode)) {
                    var width = $.getStyle(cssCheckNode, "width");
                    if (width === "120px") {
                      return true;
                    }
                  }
                },
                onLoad: function() {
                  isCssLoaded = true;
                  cbk && cbk();
                },
                onTimeout: function() {
                  cssReady.reset();
                  throw "css file load error,please confirm the url of your css file";
                }
              });
            } else {
              isCssLoaded = true;
              cbk && cbk();
            }
          }
        });
        cssReady.exec(listenerFun.plugin_ready);
      };
      var prepareOutLoginLayer = function(fn) {
        var outLoginLayerReady = $makeReady({
          condition: function() {
            return !!window.SINA_OUTLOGIN_LAYER;
          },
          ready: function(cbk) {
            $.scriptLoader({
              timeout: 10 * 1e3,
              url: opts.extra.outlogin,
              onComplete: cbk,
              onTimeout: function() {
                outLoginLayerReady.reset();
              }
            });
          }
        });
        outLoginLayerReady.exec(fn);
      };
      var initOutLoginLayer = function() {
        outLoginLayer = $.comp.userpanel.loginLayer({
          node: node,
          extra: opts.extra,
          layer_ready: function() {
            initCssStyle();
            hasBeenInitialed = true;
            listenerFun.outlogin_ready && listenerFun.outlogin_ready();
          },
          login_success: function(data) {
            if (!userInfo)
              userInfo = {};
            $addClass(node, "TAP14-logined");
            userInfo.weiboInfo = data;
            getLoginStatus(STATUS_LOGIN);
            build();
          },
          login_failure: function() {
            $removeClass(node, "TAP14-logined");
            getLoginStatus(STATUS_UNLOGIN);
            build();
          },
          logout_success: function() {
            $removeClass(node, "TAP14-logined");
            loginStatus = STATUS_UNLOGIN;
            build();
          },
          pre_login_state: function(data) {
            if (!userInfo)
              userInfo = {};
            $addClass(node, "TAP14-logined");
            userInfo.weiboInfo = data;
            getLoginStatus(STATUS_PRELOGIN);
            build();
          },
          layer_hide: function() {
            if (loginBtn) $removeClass(loginBtn, "active");
          }
        });
        if (opts.outloginlayer.ready) {
          opts.outloginlayer.ready();
        }
      };
      var initHovers = function() {
        if (loginBtn) {
          hoverFuns.push($.comp.userpanel.hover({
            button: loginBtn,
            type: 1,
            content: outLoginLayer.getOuter(),
            hideCallback: function() {
              if (loginBtn) $removeClass(loginBtn, "active");
              outLoginLayer.hide();
            },
            showCallback: function(evt) {
              var target = evt.target || evt.srcElement;
              if (loginBtn) {
                if (target == loginBtn || $contains(loginBtn, target)) {
                  $addClass(loginBtn, "active");
                  for (var i = 0; i < hoverFuns.length; i++) {
                    if (hoverFuns[i]) hoverFuns[i].setType(1);
                  }
                  outLoginLayer.setParent(node);
                  setTimeout(function() {
                    outLoginLayer.setLayerPosition(node, outLoginLayer.getOuter(), "below");
                    $listener.fire("clearfloat", "clear");
                    outLoginLayer.show();
                  }, 5);
                }
              }
            }
          }));
        }
        if (anotherButton) {
          hoverFuns.push($.comp.userpanel.hover({
            button: anotherButton,
            content: outLoginLayer.getOuter(),
            hideCallback: outLoginLayer.hide,
            showCallback: function(evt) {
              var target = evt.target || evt.srcElement;
              if (loginStatus != STATUS_LOGIN && target == anotherButton) {
                for (var i = 0; i < hoverFuns.length; i++) {
                  if (hoverFuns[i]) hoverFuns[i].setType(1);
                }
                outLoginLayer.setParent(anotherButton);
                setTimeout(function() {
                  outLoginLayer.setLayerPosition(anotherButton, outLoginLayer.getOuter(), "right", anotherButton);
                  outLoginLayer.show();
                }, 5);
              }
            }
          }));
        }
      };
      var loginBtnClickHandler = function(e) {
        var isDisplay = outLoginLayer.isDisplay();
        if (isDisplay) {
          $removeClass(loginBtn, "active");
          outLoginLayer.hide();
          return;
        }
        clearFloatDivs(3);
        for (var i = 0; i < hoverFuns.length; i++) {
          if (hoverFuns[i]) hoverFuns[i].setType(1);
        }
        $addClass(loginBtn, "active");
        // 禁用hover效果改为click后弹出 20151221131951
        // outLoginLayer.setParent(node);
        // outLoginLayer.setLayerPosition(node, outLoginLayer.getOuter());
        outLoginLayer.show();
      };
      var logout = function() {
        outLoginLayer.logout();
        destroy();
      };
      var getLoginStatus = function(status) {
        if (!userInfo)
          userInfo = {};
        loginStatus = status;
        if (loginStatus != STATUS_UNLOGIN) {
          userInfo.sinaInfo = outLoginLayer.getSinaCookie();
        }
      };
      var clearFloatDivs = function(data) {
        if (!data) return;
        if (notificationMenu && data != 2) notificationMenu.hide();
        if (accountMenu && data != 1) {
          accountMenu.hide();
        }
        if (outLoginLayer && data != 3) {
          outLoginLayer.hide();
          $removeClass(loginBtn, "active");
        }
      };
      var register = function(channel, callback) {
        var flag = false;
        for (var el in listenerFun) {
          if (el == channel) {
            flag = true;
            break;
          }
        }
        flag = $.getType(callback) === "function" && flag;
        if (!flag) {
          throw "arguments are invalid";
        }
        listenerFun[channel] = callback;
        return that;
      };
      var remove = function(channel) {
        var flag = false;
        for (var el in listenerFun) {
          if (el == channel) {
            flag = true;
            break;
          }
        }
        if (flag) {
          listenerFun[channel] = null;
        }
      };
      var hasBeenInitialed = function() {
        return hasBeenInitialed;
      };
      var setOutLoginLayerPosition = function(pos, parent) {
        var parent = parent || document.body;
        if (!$.isNode(parent))
          throw "param parent is invalid";
        for (var i = 0; i < hoverFuns.length; i++) {
          if (hoverFuns[i]) hoverFuns[i].setType(2);
        }
        outLoginLayer.setParent(parent);
        outLoginLayer.setLayerAbsolutePosition(pos, fixed);
      };
      var setOutLoginMiddle = function(fixed) {
        var fixed = fixed || false;
        var parent = document.body;
        if (!$.isNode(parent)) {
          throw "param parent is invalid";
        }
        for (var i = 0; i < hoverFuns.length; i++) {
          if (hoverFuns[i]) hoverFuns[i].setType(2);
        }
        outLoginLayer.setCenter(fixed);
      };
      var getOutLoginLayer = function() {
        return outLoginLayer.getOutLoginLayer();
      };
      var parseDOM = function() {
        node = opts.container.node;
        if (!node)
          throw "node is not defined";
        if (opts.extra.anotherButton && !$.isNode(opts.extra.anotherButton)) {
          throw "param 'another button' is invalid";
        } else {
          anotherButton = opts.extra.anotherButton;
        }
        nodes = $.kit.dom.parseDOM($builder(node).list);
        registerBtn = nodes.register_btn;
        notificationBtn = nodes.notification_btn;
        loginBtn = nodes.login_btn;
        loginOuter = $sizzle(".ac-login", node)[0];
      };
      var bindListener = function() {
        addEvent(loginBtn, "click", loginBtnClickHandler);
        var btns = $sizzle(".sina15-more");
        for (var i = 0; i < btns.length; i++) {
          addEvent($sizzle(".sina15-more")[i], "touchend", function() {
            $removeClass(loginBtn, "active");
            outLoginLayer.hide();
          });
        }
        var channelList = $listener.list();
        if (!("loginBtn" in channelList)) $listener.register("loginBtn", "click", loginBtnClickHandler);
        if (!("logout" in channelList)) {
          $listener.register("logout", "logout", logout);
        }
        if (!("clearfloat" in channelList)) {
          $listener.register("clearfloat", "clear", clearFloatDivs);
        }
      };
      var initPlugins = function() {
        prepareOutLoginLayer(function() {
          initOutLoginLayer();
        });
      };
      var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
      };
      var show = function(forceShow, callback) {
        if (loginStatus != STATUS_LOGIN) {
          for (var i = 0; i < hoverFuns.length; i++) {
            if (hoverFuns[i]) hoverFuns[i].setType(1);
          }
          outLoginLayer.setParent(node);
          outLoginLayer.setLayerPosition(node, outLoginLayer.getOuter());
          outLoginLayer.show();
          callback && callback();
        }
      };
      var getUserInfo = function() {
        return userInfo;
      };
      var reset = function() {
        hoverFuns.push($.comp.userpanel.hover({
          button: loginBtn,
          type: 1,
          content: outLoginLayer.getOuter(),
          hideCallback: outLoginLayer.hide,
          showCallback: function(evt) {
            var target = evt.target || evt.srcElement;
            if (target == loginBtn) {
              for (var i = 0; i < hoverFuns.length; i++) {
                if (hoverFuns[i]) hoverFuns[i].setType(1);
              }
              outLoginLayer.setParent(node);
              outLoginLayer.setLayerPosition(node, outLoginLayer.getOuter(), "below");
              outLoginLayer.show();
            }
          }
        }));
      };
      var destroy = function() {
        var outers = $sizzle("[node-type=outer]", node);
        for (var i = 0; i < outers.length; i++) {
          var parent = outers[i].parentNode;
          parent.removeChild(outers[i]);
        }
        if (notificationMenu) notificationMenu.destroy();
        if (accountMenu) accountMenu.destroy();
        outLoginLayer.destroy();
        var channelList = $listener.list();
        for (var i = hoverFuns.length - 1; i >= 0; i--) {
          if (hoverFuns[i]) hoverFuns[i].destroy();
          hoverFuns[i] = null;
        }
      };
      that.set = set;
      that.init = init;
      that.remove = remove;
      that.getOutLogin = getOutLoginLayer;
      that.register = register;
      that.hasBeenInitialed = hasBeenInitialed;
      that.show = show;
      that.getUserInfo = getUserInfo;
      that.setOutLoginMiddle = setOutLoginMiddle;
      that.setOutLoginLayerPosition = setOutLoginLayerPosition;
      return that;
    });;

    (function($) {
      var $ns = STK.comp.userPanelNewVersion;
      $ns.listener = $.common.channel.plugin;
      $ns.getVersion = function() {
        return "1.0.2";
      };
      $ns.STK = STK;
      this.SINA_USER_PANEL = $ns;
    }).call(this, STK);
  }).call(window);

  return SINA_USER_PANEL;
})();