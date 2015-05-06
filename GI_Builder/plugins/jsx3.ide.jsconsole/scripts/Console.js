(function(plugIn) {

  var maxSize = 100;

  plugIn.isMultiInstance = function() {
    return true;
  };

  plugIn.getHistory = function() {
    if(jsx3.IDE) {
      var settings = jsx3.ide.getIDESettings();
      return settings.get("jsconsole", "console-history") || [];
    } else {
      return this._jsxCachedHistory || [];
    }
  };

  plugIn.storeHistory = function(strCode) {
    var saved = this.getHistory();
    saved.push(strCode);
    this.setHistory(saved);
  };

  plugIn.setHistory = function(h) {
    if (h && h.length>=2) {
      //remove duplicate item, only first matching
      for(var i=h.length-2; i>=0; i--) {
        if(h[h.length-1] == h[i]) {
          h = h.splice(0,i).concat((h.shift(),h));
          break;
          /*
            var tmp = h.splice(0,i);
            h.shift();
            h = tmp.concat(h);
          */
        }
      }
      if (h.length > maxSize) h.splice(0, h.length - maxSize);
    }
    if(jsx3.IDE) {
      var settings = jsx3.ide.getIDESettings();
      settings.set("jsconsole", "console-history", h);
    } else {
      this._jsxCachedHistory = h;
    }
  };

  jsx3.lang.Class.defineClass("jsx3.ide.jsconsole.Util", null, null, function(Util) {

    Util.getInnerText = function(objElm) {
      if(jsx3.CLASS_LOADER.FX) {
        var cloned = objElm.cloneNode(true);
        cloned.innerHTML = cloned.innerHTML.replace(/<br(\s+)?\/?>/ig, "\n");
        //alert(cloned.textContent);
        return cloned.textContent;
      }
      return objElm.textContent || objElm.innerText || "";
    };
    
    Util.setInnerText = function(objElm, text) {
      if(jsx3.CLASS_LOADER.IE) {
        objElm.innerText = text;
      } else {
        objElm.textContent = text;
      }
    };

    Util.insertHTML = function(htmlSnippet) {
      if(jsx3.CLASS_LOADER.IE) {
        var insertRange = document.selection.createRange();
        insertRange.select();
        insertRange.pasteHTML( htmlSnippet )
        insertRange.collapse(true);
      } else {
        document.execCommand( 'insertHtml' , false , htmlSnippet );
      }
    };

    Util.moveCaretToEnd = function(objElm, bFocus) {
      var rang;
      if (document.selection) {
        //IE
        range =  document.body.createTextRange();
        range.moveToElementText(objElm);
        range.moveStart('character', 1);
        range.collapse(false);
        range.select();
      } else {
        //Firefox or Safari
        var selection = window.getSelection();
        range = document.createRange();
        range.setStart(objElm, objElm.childNodes.length);
        range.setEnd(objElm, objElm.childNodes.length) ;
        selection.removeAllRanges();
        selection.addRange(range);
      }
      if(bFocus) { objElm.focus(); }
    };

    Util.getType = function(output) {
      var type = typeof(output);
      if(type === "object" && output===null) { type = "null"; return type;}
      if(output instanceof Date) { type = "date"; }
      if(output instanceof RegExp) { type = "regexp"; }
      if(output instanceof Array) { type = "array"; }
      if(output instanceof Error) { type = "error"; }
      if(output instanceof jsx3.lang.Object) { type = "giobject"; }
      if(output instanceof jsx3.lang.Exception) { type = "error"; }
      return type;
    };

    Util.getObjectDisplayName = function(object) {
      var type = Util.getType(object);
      if(type == "null") { return "null"; }
      if(type == "string") { return "\"" + object + "\""; }
      if(type == "array") { return "Array"; }
      if(type == "function") { return "Function"; }
      if(type == "giobject") {
        var strName = object.toString ? object.toString() : "Object";
        return strName;
      }
      if(type == "object") {
        var strName = object.toString ? object.toString() : "Object";
        if (strName == "[object]") strName = "Object";
        
        //str.replace "[object AAA]" with AAA
        if (strName.match(/\[object\s\w+\]/))
          strName = strName.replace(/\[object\s(\w+)\]/, "$1");

        return strName;
      }
      return object;
    };

    Util.getElementsByXPath = function( xpath, contextNode ) {
      var doc = document;
      if( contextNode && contextNode.ownerDocument )
        doc = contextNode.ownerDocument;
      var got = doc.evaluate( xpath, contextNode||doc, null, 0, null );
      var next, result = [];
      switch( got.resultType )
      {
        case got.STRING_TYPE:
          return got.stringValue;
        case got.NUMBER_TYPE:
          return got.numberValue;
        case got.BOOLEAN_TYPE:
          return got.booleanValue;
        default:
          while( next = got.iterateNext() )
        result.push( next );
          return result;
      }
    };

    Util.injectedAPI = {
        $     : function(id) { return document.getElementById(id) },
        $$    : function() { if(document.querySelectorAll) return document.querySelectorAll.apply(document, arguments) },
        $x    : function(xpath, contextNode) {if(document.evaluate) return Util.getElementsByXPath(xpath, contextNode);},
        keys  : function(o) { var a = []; for (k in o) a.push(k); return a; }, 
        values: function(o) { var a = []; for (k in o) try {a.push(o[k])} catch(e) {}; return a; }
    };

  });

  var Util = jsx3.ide.jsconsole.Util;

  jsx3.lang.Class.defineClass("jsx3.ide.jsconsole.Command", null, null, function(KLASS, instance) {

    instance.init = function(script, console) {
      this._script = script;
      this._console = console;
      this._console.cacheMessageObject(this);
    };

    instance.executeScript = function() {
      // Import all DOM nodes in the active component editor to the current scope
      var context = {};
      var activeServer = jsx3.IDE ? jsx3.ide.getActiveServer() : null;
      if (activeServer) {
        activeServer.getBodyBlock().findDescendants(function(x) {
          var n = x.getName();
          if (n && !context[n] && jsx3.util.isName(n)) {
            context[n] = x;
          }
        }, false, false, false, true);
      }

      var result = "undefined";
      try {
        result = this.doEval(this._script, context);
        return new jsx3.ide.jsconsole.Response(this._script, result, false, this._console);
      } catch (ex) {
        return new jsx3.ide.jsconsole.Response(this._script, ex, true, this._console);
      }

      
    };

    instance.doEval = function(strScript, objContext, objConsole) {
      if (strScript != null && strScript !== "") {
        /* @jsxobf-bless */
        var __api = objContext;
        for (var __f in Util.injectedAPI)
          __api[__f] = Util.injectedAPI[__f];
        
        return eval("with (__api) { " + strScript + " }");
      }
    };

    instance.toHtmlElement = function() {
      var element = document.createElement("div");
      element.className = "jsconsole-command";

      var commandTextElement = document.createElement("span");
      commandTextElement.className = "jsconsole-command-text";
      Util.setInnerText(commandTextElement, this._script);
      element.appendChild(commandTextElement);
      return element;

    };

    instance.destroy = function() {
      this._console = null;
    };

  });

  jsx3.lang.Class.defineClass("jsx3.ide.jsconsole.Response", null, null, function(KLASS, instance) {

    instance.init = function(script, result, isException, console) {
      this._script = script;
      this._result = result;
      this.catalog = "info";
      if(isException) this.catalog = "error";
      this._console = console;
      this.formattedResponse = this._format(result);
      this._console.cacheMessageObject(this);
    };

    instance.toHtmlElement = function() {
      if(this.isInlineResponse) {
        var messageTextElement = document.createElement("span");
        messageTextElement.className = "jsconsole-response-text";
        messageTextElement.appendChild(this.formattedResponse);
        return messageTextElement;
      } else {
        var element = document.createElement("div");
        element.className = "jsconsole-response-" + this.catalog;
        var messageTextElement = document.createElement("span");
        messageTextElement.className = "jsconsole-response-text";
        messageTextElement.appendChild(this.formattedResponse);
        element.appendChild(messageTextElement);
        return element;
      }
    };

    instance._format = function(response) {
      var type = Util.getType(response);
      var span = document.createElement("span");
      
      span.className = "jsconsole-formatted-" + type;
      var method = "_format" + type.substring(0,1).toUpperCase() + type.substring(1);
      var formatter = this[method] ? method : "_formatValue";
      this[formatter](response, span);        

      return span;
    };

    instance._formatNull = function(val, elem) {
      elem.appendChild(document.createTextNode("null"));
    };

    instance._formatValue = function(val, elem) {
      elem.appendChild(document.createTextNode(val));
    };

    instance._formatFunction = function(val, elem) {
      Util.setInnerText(elem, val);
    };

    instance._formatString = function(str, elem) {
      elem.appendChild(document.createTextNode("\"" + str + "\""));
    };
    
    instance._formatRegexp = function(re, elem) {
      var formatted = String(re).replace(/([\\\/])/g, "\\$1").replace(/\\(\/[gim]*)$/, "$1").substring(1);
      elem.appendChild(document.createTextNode(formatted));
    };

    instance._formatArray = function(array, elem) {
      elem.appendChild(document.createTextNode("["));
      for (var i = 0; i < array.length; ++i) {
        elem.appendChild(this._format(array[i]));
        if (i < array.length - 1) {
          elem.appendChild(document.createTextNode(", "));
        }
        if(i >= 50) {
          elem.appendChild(document.createTextNode("..."));
          break;
        }
      }
      elem.appendChild(document.createTextNode("]"));
    };

    instance._formatObject = function(obj, elem) {
      elem.appendChild(new jsx3.ide.jsconsole.ObjectSection(obj, this._console).toHtmlElement());
    };

    instance._formatGiobject = function(obj, elem) {
      this._formatObject(obj, elem);
    };

    instance._formatError = function(obj, elem) {
      var messageElement = document.createElement("span");
      messageElement.className = "error-message";
      var e = jsx3.NativeError.wrap(obj);
      result = e.printStackTrace();
      Util.setInnerText(messageElement, result);
      elem.appendChild(messageElement);
    };

    instance.destroy = function() {
      this._result = null;
      this.formattedResponse = null;
    };

  });

  jsx3.lang.Class.defineClass("jsx3.ide.jsconsole.ObjectSection", null, null, function(KLASS, instance) {
    
    instance.init = function(obj, console) {
      this._object = obj;
      this._expanded = false;
      this._populated = false;
      this._console = console;
      this._console.cacheMessageObject(this);
    };

    instance.toHtmlElement = function() {
      //"<div class='section'><div class='title'/><ol class='properties'></div>"
      this.element = document.createElement("div");
      this.element.className = "section";

      this.titleElement = document.createElement("div");
      this.titleElement.className = "title-collapsed";
      this.imgElement = document.createElement("span");
      this.imgElement.className = "image";
      this.nameElement = document.createElement("span");
      this.nameElement.className = "name name-" + Util.getType(this._object);
      Util.setInnerText(this.nameElement, Util.getObjectDisplayName(this._object));
      this.titleElement.appendChild(this.imgElement);
      this.titleElement.appendChild(this.nameElement);
      this.clickHandler = jsx3.$F(this.onClickHandler).bind(this);

      jsx3.html.DOM.addEventListener(this.titleElement, "onclick", this.clickHandler);

      //this.headerElement.addEventListener("click", this.toggleExpanded.bind(this), false);

      this.propertiesElement = document.createElement("ol");
      this.propertiesElement.className = "properties";
      this.propertiesList = [];

      this.element.appendChild(this.titleElement);
      this.element.appendChild(this.propertiesElement);
      return this.element;
    };

    instance.onClickHandler = function(e) {
      if(this._expanded) {
        this.titleElement.className = "title-collapsed";
        this.propertiesElement.style.display = "none";
      } else {
        if(!this.populated) {
          this.populate();
          this.populated = true;
        }
        this.titleElement.className = "title-expanded";
        this.propertiesElement.style.display = "block";
      }
      this._expanded = !this._expanded;
    };

    instance.populate = function() {
        var properties = [];
        for (var prop in this._object) {
          
          properties.push(prop);
          
        }
        properties.sort();

        this.propertiesList = [];

        for (var i = 0; i < properties.length; ++i) {
            var object = this._object;
            var propertyName = properties[i];
            var property = new jsx3.ide.jsconsole.Property(object, propertyName, this._console);
            this.propertiesList.push(property);
            try{
              this.propertiesElement.appendChild(property.toHtmlElement());
            } catch(e) {
              //quiet when access error, such as document.domConfig.
            }
        }

        if (!this.propertiesList.length) {
            var title = "<div class=\"info\">No Properties</div>";
            var infoElement = document.createElement("li");
            infoElement.className = "warning";
            infoElement.innerHTML = title;
            this.propertiesElement.appendChild(infoElement);
        }

    };

    instance.destroy = function() {
      jsx3.html.DOM.removeEventListener(this.titleElement, "onclick", this.clickHandler);
      this._object = null;
      this.element = null;
      this.titleElement = null;
      this.imgElement = null;
      this.nameElement = null;
      this.propertiesElement = null;
    };

  });

  jsx3.lang.Class.defineClass("jsx3.ide.jsconsole.Property", null, null, function(KLASS, instance) {

    instance.init = function(object, propertyName, console) {
      this._object = object;
      this._propertyName = propertyName;
      this._console = console;
      this._console.cacheMessageObject(this);
    };


    instance.toHtmlElement = function() {
      
      var childObject = this._object[this._propertyName];

      var hasSubProperties = false;
      var type = typeof childObject;
      if (childObject && (type === "object" || type === "function")) {
        for (subPropertyName in childObject) {
          hasSubProperties = true;
          break;
        }
      }

      this.hasChildren = hasSubProperties;

      this.element = document.createElement("li");
      
      this.imgElement = document.createElement("span");
      this.imgElement.className = "image";

      this.nameElement = document.createElement("span");
      this.nameElement.className = "key";
      
      if ((this._object.constructor && childObject === this._object.constructor.prototype[this._propertyName]) || 
          (this._object.__jsxclass__ && childObject === this._object.__jsxclass__.prototype[this._propertyName])) {
        this.nameElement.className = "inherited-key";
      }

      Util.setInnerText(this.nameElement, this._propertyName);

      this.valueElement = document.createElement("span");
      this.valueElement.className = "value value-" + Util.getType(this._object[this._propertyName]);
      
      var displayName = Util.getObjectDisplayName(this._object[this._propertyName]);
      if(displayName == "Array") {
        this.hasChildren = false;
        var arrayResponse = new jsx3.ide.jsconsole.Response("", this._object[this._propertyName], false, this._console);
        arrayResponse.isInlineResponse = true;
        this.valueElement.appendChild(arrayResponse.toHtmlElement())
      } else if (displayName == "Function") {
          Util.setInnerText(this.valueElement, displayName);
          this.hasChildren = true;
          this.isFunctionObject = true;
      } else {
        Util.setInnerText(this.valueElement, displayName);
      }
      
      this.element.appendChild(this.imgElement);
      this.element.appendChild(this.nameElement);
      this.element.appendChild(document.createTextNode(": "));
      this.element.appendChild(this.valueElement);

      if(this.hasChildren) {
        this.imgElement.className = "image-collapsed";
        this.clickHandler = jsx3.$F(this.onClickHandler).bind(this);
        jsx3.html.DOM.addEventListener(this.nameElement, "onclick", this.clickHandler);
        jsx3.html.DOM.addEventListener(this.imgElement, "onclick", this.clickHandler);

        //this.headerElement.addEventListener("click", this.toggleExpanded.bind(this), false);

        this.propertiesElement = document.createElement("ol");
        this.propertiesElement.className = "properties";
        this.propertiesList = [];
        this.element.appendChild(this.propertiesElement);
        this._expanded = false;
        this.populated = false;
      }

      return this.element;
    };

    instance.onClickHandler = function() {
      if(this._expanded) {
        this.imgElement.className = "image-collapsed";
        this.propertiesElement.style.display = "none";
      } else {
        if(!this.populated) {
          this.populate();
          this.populated = true;
        }
        this.imgElement.className = "image-expanded";
        this.propertiesElement.style.display = "block";
      }
      this._expanded = !this._expanded;
    };

    instance.populate = function() {
        if (this.isFunctionObject) {
          var infoElement = document.createElement("li");
          var divElement = document.createElement("div");
          divElement.className = "jsconsole-function-context";
          Util.setInnerText(divElement, this._object[this._propertyName].toString());
          //divElement.appendChild(document.createTextNode(this._object[this._propertyName].toString()));
          infoElement.appendChild(divElement);
          this.propertiesElement.appendChild(infoElement);
          return;
        }
        var childObject = this._object[this._propertyName];
        var properties = [];
        for (var prop in childObject) {
          properties.push(prop);
        }
        properties.sort();

        this.propertiesList = [];

        for (var i = 0; i < properties.length; ++i) {
            var object = childObject;
            var propertyName = properties[i];
            var property = new jsx3.ide.jsconsole.Property(object, propertyName, this._console);
            this.propertiesList.push(property);
            try{
              this.propertiesElement.appendChild(property.toHtmlElement());
            } catch(e) {
              //quiet when access error, such as document.domConfig.
            }
        }

        if (!this.propertiesList.length) {
            var title = "<div class=\"info\">No Properties</div>";
            this.propertiesElement.appendChild(infoElement);
        }

    };

    instance.destroy = function() {
      if(this.clickHandler) {
        jsx3.html.DOM.removeEventListener(this.nameElement, "onclick", this.clickHandler);
        jsx3.html.DOM.removeEventListener(this.imgElement, "onclick", this.clickHandler);
      }
      this._object = null;
      this.element = null;
      this.imgElement = null;
      this.nameElement = null;
      this.valueElement = null;
      this.propertiesElement = null;
    };

  });
  
  jsx3.lang.Class.defineClass("jsx3.ide.jsconsole.Console",jsx3.gui.Template.Block, [jsx3.xml.Cacheable, jsx3.xml.CDF], 
    function(KLASS, instance) {

      KLASS.TEMPLATE_PATH = plugIn.resolveURI("templates/");

      instance.getPlugIn = function() {
        return plugIn;
      };

      instance._history = jsx3.$A([]);
      instance._historyOffset = 0;

      instance._msgObject = [];

      instance.cacheMessageObject = function(object) {
        this._msgObject.push(object);
      };

      instance.destroyMessageObjects = function() {
        var msgItem;
        while(msgItem = this._msgObject.pop()) {
          if(msgItem.destroy) { try{msgItem.destroy();}catch(e){} }
        }
      };

      instance.recoverHistory = function() {
        this._history = jsx3.$A(this.getPlugIn().getHistory());
        this._historyOffset = 0
      };

      instance.loadTemplate = function() {
        var templateXML = plugIn.getResource("console_xml").getData();
        jsx3.gui.Template.compile(templateXML, this.getClass());
        this.getTemplateXML = function() {
            return templateXML;
        };
      };

      instance.onAfterPaint = function() {
        this.jsxsuper();
        var objPrompt = this.getRenderedBox("jsConsolePrompt");
        this.updatePrompt(null);
        if(objPrompt) objPrompt.focus();
      };

      instance.getPromptText = function() {
        return Util.getInnerText(this.getRenderedBox("jsConsolePrompt"));
      };

      instance.onClick = function(objEvent, objGUI) {
      };

      instance.onBodyClick = function(objEvent, objGUI) {
        var src = objEvent.srcElement();
        if (src == objGUI || src.className == "jsconsole-command")
          this.getRenderedBox("jsConsolePrompt").focus();
      };

      instance.onMouseUp = function(objEvent, objGUI) {
        var strMenu = null;
        if (objEvent.rightButton() && (strMenu = this.getMenu()) != null) {
          var objMenu = this.getDescendantOfName(strMenu);
          if (objMenu != null) {
              objMenu.showContextMenu(objEvent, this);
          }
        }
      };

      instance.onKeyDown = function(objEvent, objGUI) {
        var objPrompt = this.getRenderedBox("jsConsolePrompt");
        
/*
        if(objEvent.enterKey() && (objEvent.ctrlKey() || objEvent.shiftKey())) {
          if (jsx3.CLASS_LOADER.FX) {
            Util.insertHTML("&#13;");
          } else if(jsx3.CLASS_LOADER.IE) {
            Util.insertHTML("<br/>");
          } else {
            Util.insertHTML("\n\r");
          }

          objEvent.cancelAll();
          return false;
        }
*/
        
        if (objEvent.enterKey()) {
          if (objEvent.hasModifier()) return;
          
          var strCode = this.getPromptText();
          //alert(strCode.length + "'" + strCode + "'");
          if(!strCode.length) { 
            objEvent.cancelKey(); 
            return; 
          }
          
          var cmd = new jsx3.ide.jsconsole.Command(strCode, this);
          var response = cmd.executeScript();
          if(strCode !== this._history[this._history.length-1]) {
            this.getPlugIn().storeHistory(strCode);
            this._history.push(strCode);
          }
          this._historyOffset = 0;

          this.addHtmlElement(cmd);
          this.addHtmlElement(response);
          this.updatePrompt(null);

          objEvent.cancelKey();
          objEvent.cancelReturn();


        } else if (objEvent.upArrow()) {
          objEvent.cancelKey();
          objEvent.cancelReturn();
          
          //go up in command history
          if (this._historyOffset == this._history.length) { return; }
          if (this._historyOffset === 0) { this._jsxtempscript = this.getPromptText(); }

          this._historyOffset++;
          this.updatePrompt(this._history[this._history.length - this._historyOffset]);
          
        } else if (objEvent.downArrow()) {
          objEvent.cancelKey();
          objEvent.cancelReturn();
          
          //go down in command history
          if (this._historyOffset === 0) { return; }
          this._historyOffset--;
          if (this._historyOffset === 0) {
              this.updatePrompt(this._jsxtempscript);
              delete this._jsxtempscript;
              return;
          }

          this.updatePrompt(this._history[this._history.length - this._historyOffset]);
        } else if (objEvent.backspaceKey()) {
          strCode = this.getPromptText();
          if(strCode.length == 1) {
            objEvent.cancelKey();
            objEvent.cancelReturn();
            this.updatePrompt(null);
          }
          if(strCode.length == 0) {
            objEvent.cancelKey();
            objEvent.cancelReturn();
          }
        }
      };

      instance.clear = function() {
        window.setTimeout(jsx3.$F(function() { this.destroyMessageObjects(); this.repaint(); }).bind(this), 100);
      };

      instance.addHtmlElement= function(obj) {
        this.getRenderedBox("jsConsoleOutput").appendChild(obj.toHtmlElement());
      };

      instance.updatePrompt = function(text) {
        var objPrompt = this.getRenderedBox("jsConsolePrompt");
        if(!text) {
          objPrompt.innerHTML = "";
          if(jsx3.CLASS_LOADER.FX) {
            objPrompt.innerHTML = "<br style='position:relative'/>";
          } else {
            Util.moveCaretToEnd(objPrompt, true);
          }
          objPrompt.scrollIntoView(false);
        } else {
          Util.setInnerText(objPrompt, text);
          Util.moveCaretToEnd(objPrompt, true);
          objPrompt.scrollIntoView(false);
        }
      };

      instance.onDestroy = function() {
         this.destroyMessageObjects();
      };

      instance.loadTemplate();

    }
  );

})(this);
