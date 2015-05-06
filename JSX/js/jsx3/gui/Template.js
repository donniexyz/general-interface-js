/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _onAfterPaintCascade  _jsxdynamic _applyId

jsx3.require("jsx3.gui.Block","jsx3.html.DOM","jsx3.html.Style");

/**
 * Provides template related services to the base template class, jsx3.gui.Template.Block. See the <code>compile</code> method for usage details.
 * @since 3.6
 */
jsx3.Class.defineClass("jsx3.gui.Template", null, null, function(Template, Template_prototype) {

  //alias frequently-used classes
  var LOG = jsx3.util.Logger.getLogger(Template.jsxclass.getName());
  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var html = jsx3.html;

  //obfuscator??
  var paintOpen = "paintOpen", paintClose = "paintClose", addStyle = "addStyle", setStaticAtts = "setStaticAtts", setStaticStyles = "setStaticStyles";
  var addEvent = "addEvent", addAttribute = "addAttribute", setNodeDepth = "setNodeDepth", setNodePath = "setNodePath", getClientDrawspace = "getClientDrawspace";
  var setName = "setName", setProtected = "setProtected";

  //incrementer used to ensure that each variable is unique
  Template.inc = 0;

  //extracts replacement variables from the declarative markup (i.e., {somevar})
  Template.REG_REPVAR =   /{([\S]*?)}/g;
  Template._REG_REPVAR =  /{([^}]*)}/g;

  /** @private @jsxobf-clobber */
  Template._BOXPROPERTIES = new jsx3.util.List(['position','tagname','margin','padding','border','left','top','width','height','empty','text']);

  //any property listed here will cause syncBoxProfile to be called if updated on a given gui instance; some properties will also be directly updated
  /** @private @jsxobf-clobber */
  Template._BOX_RECALC_PROPS = ["tagname","position","left","top","width","height","padding","margin","border","attribute-group","text","empty"];

  //any property listed here will cause syncBoxProfile to be called; direct updates to the GUI will not be made, as the Box will manage that
  /** @private @jsxobf-clobber */
  Template._BOX_CASCADE_PROPS = ["tagname","position","left","top","width","height","attribute-group","text","empty"];

  //those box properties listed here will be evaluated; otherwise, will be treated as a string (position, tagname, container??)
  Template.REG_EVAL = /parentwidth|parentheight|left|top|width|height|empty/;

  //attributes named as follows are events
  Template.REG_EVENT = /^(on(?:click|focus|blur|mousedown|mouseup|mouseover|mouseout|mousemove|mouseenter|mouseleave|mousewheel|dblclick|scroll|keydown|keypress|keyup|change|reset|select|submit|abort|error|load|unload))/i;

  /**
   * {jsx3.util.List} Supported control statements: if, if-else, else, for-each, var, drawspace, attach, continue, break, return
   * @package
   */
  Template.STATEMENTS = new jsx3.util.List(["if","if-else","else","for-each","var","drawspace","attach","continue","break","return"]);

  /**
   * {jsx3.util.List} Supported box property statements: tagname, position, left, top, width, height, padding, margin, border, attribute-group, style-group, text, empty
   * @package
   */
  Template.BOX_PROPS  = new jsx3.util.List(["tagname","position","left","top","width","height","padding","margin","border","attribute-group","style-group","text","empty"]);

  Template_prototype._markup = null; //parsed markup declartion (the template definition) as a jsx3.xml.Document instance
  Template_prototype._jsxpaintprofile = null; //stores all replacement variables, using the replacement variable name as the key

  //create the static associative array of all resolvers/resolversets
  Template.GLOBAL_RESOLVER_ID = Template.jsxclass.getName();
  Template.RESOLVERS = {};
  Template.RESOLVERS[Template.GLOBAL_RESOLVER_ID] = {};

  //namespace used by the template
  Template.NAMESPACE = "http://gi.tibco.com/transform/";
  Template.USERNAMESPACE = "http://gi.tibco.com/transform/user";
  Template.VERSION = "1.0";

  //namespace map used by the system when traversing a markup template
  var objMap = {};
  objMap[Template.NAMESPACE] = "t";
  objMap[Template.USERNAMESPACE] = "u";


  //every resolver is indexed in the RESOLVERS hash under a unique ID; every resolver can likewise be referenced by multiple triggers
  Template.TRIGGERS = {};
  Template.TRIGGERS[Template.jsxclass.getName()] = {};

  //libraries are collections of resolvers that span multiple resolver-set categories (another way to index a collection of resolvers, different from their hashed id)
  //unlike the triggers and resolvers hashes, the libraries hash is flat and does not expose an additional level to organize per resolver-set
  //another way to think of this is to see libraries as a non-hierarchical grouping of resolvers. It is a tag that points to a list of items (resolvers).
  Template.LIBRARIES = {};


  /**
   * instance initializer
   */
  Template_prototype.init = function() {
    this.jsxsuper();
  };


  /* @jsxobf-clobber */
  Template._preprocessors = {};


  /**
   * The template engine uses an XML schema for its markup that is flexible and verbose.  However, the complexities of this expanded schema
   * make it difficult to program simple widgets and controls. Processor (filter) functions exist to better
   * manage the tradeoff between flexibility and usability by allowing developers to use a simplified schema for the
   * template XML they wish to author.  When the compile method is called and the
   * "simple" XML is sent to the template engine, it is run through each pprocessor, until it is fully expanded.
   * Currently, two processors are registered with the engine: jsxfilter and jsxinlinebox.  Registering a processor
   * with either of these names would effectively overwrite the old processor.  All processors are run
   * in the order they are registered and have a cumulative effect on modifying the template XML before it is handed off
   * to the engine.  Each processor will be passed two parameters:  the XML template (jsx3.gui.Document) and the
   * class (jsx3.lang.Class).  The XML template will be registered with the selection namespaces,
   * <code>xmlns:t="http://gi.tibco.com/transform/" xmlns:u="http://gi.tibco.com/transform/user"</code>
   * @param strProcessorId {String} the unique name for the processor. assigning the same name as that of an existing
   * processor will replace the existing processor
   * @param objFn {Object} function to call
   * @see #compile()
   * @package
   */
  Template.registerPreprocessor = function(strProcessorId,objFn) {
    Template._preprocessors[strProcessorId] = objFn;
  };


  /**
   * Called during pre-processing (filtering) of the original XML provided by the developer. Declares all resolvers used
   * by the template but not yet declared (or incompletely declared).  Allows developers to author a more-succinct
   * template while providing the power for explicit declarations by those familiar with how they work.
   * @param objXML {jsx3.xml.Document}
   * @param strId {String} resolver id
   * @param strName {String} the name (as understood by the native browser) for the given property (i.e., background-color, id, value, etc)
   * @param strType {String} one of: box, css, attribute, event
   * @private
   */
  Template._profileBoundResolver = function(objXML,strId,strName,strType) {
    if(strId.indexOf("$") == 0) {
      var objNode = objXML.selectSingleNode("/t:transform/t:model/t:import[@resolver='" + strId + "']");
      if(!objNode) {
        var objParent = objXML.selectSingleNode("/t:transform/t:model");
        //add a system resolver declaration
        objNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "t:import", Template.NAMESPACE);
        objNode.setAttribute("resolver",strId);
        objParent.appendChild(objNode);
      }
    } else {
      //default values can also be inlined using a pipe character as the delimiter; all defaults are treated as strings
      var strDefault;
      if(strId.indexOf("|") > -1) {
        var objId = strId.split("|");
        strId = objId[0];
        strDefault = objId[1];
      }

      var objNode = objXML.selectSingleNode("/t:transform/t:model/t:*[@id='" + strId + "']");
      if(objNode) {
        //update the local resolver with additional information
        objNode.setAttribute("name",strName);
        objNode.setAttribute("type",strType);
      } else {
        //create the given resolver (the user is declaring it inline within the template definition--add it to the 'model', so its declared)
        var objParent = objXML.selectSingleNode("/t:transform/t:model");
        if(objParent) {
          //add a local resolver declaration
          objNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "t:var", Template.NAMESPACE);
          objNode.setAttribute("id",strId);
          objNode.setAttribute("name",strName);
          objNode.setAttribute("type",strType);
          //events simply echo their ID. This simplifies the declaration process by allowing events to be implicitly declared
          if(strType == "event")
            objNode.setValue("return \"" + strId + "\";");
          else {
            //add the resolver and a trigger of the same name
            objNode.setAttribute("triggers","" + strId + "");
            if(strDefault)
              objNode.setValue("return this." + strId + " != null ? this." + strId + " : " + jsx3.util.strEscapeJSON(strDefault) + ";");
            else
              objNode.setValue("return this." + strId + ";");
          }
          objParent.appendChild(objNode);
        }
      }
    }
    //echo the ID (perhaps changed)
    return strId;
  };


  /**
   * The template engine uses an expanded schema different from what is publicly documented for developers.  This allows
   * the public APIs to be optimized for human readability, while providing the expressiveness needed by the engine.
   * @param objXML (jsx3.xml.Document) the declarative markup for the given GUI class
   * @param objClass (jsx3.lang.Class)
   * @private
   */
  Template._filterTemplate = function(objXML,objClass) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Template.jsxclass, objClass, 5);
/* @JSC :: end */

    //add model section (since its implied, developers may not actually declare it)
    var objM = objXML.selectSingleNode("/t:transform/t:model");
    if(!objM) {
       //add a system resolver declaration
       objM = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "t:model", Template.NAMESPACE);
       objXML.getRootNode().appendChild(objM);
     }

    //expand 'box' type style declarations (position, left, top width, etc)
    //NOTE: declare these locally due to IE bug that loses context for thos regexp's declared in the containing (superset) context
    var regStyle = /([a-zA-Z0-9-]*)\s*:\s*(\{[^\}]*}|[^;]*)\s*;?/gi;
    var regBoxErr = /^(border-|margin-|padding-)[^radius]/gi;
    var regBox = /^position|left|top|width|height|border|margin|padding|style-group|right|bottom$/gi;
    var regBoxPx = /left|top|width|height|padding|margin/i;
    var regPx = /(\d*)px/g;
    var regPct = /(\d*)%/g;
    var regResolver = /\s*([\S]*)="(\{[^"]*\})"/gi;
    var regResolverText = /<(?:t:)?(text|position|left|top|width|height|border|margin|padding|tagname|attribute-group|style-group)[^>]*>(\{[^\}]*\})<\/(?:t:)?(text|position|left|top|width|height|border|margin|padding|tagname|attribute-group|style-group)>/gi;
    var regUser =  /\{[^\$]/;

    //add an ID node to the root node (this provides the binding between model and view)
    var objRoot = objXML.selectSingleNode("/t:transform/t:template/t:*");
    if(objRoot) {
      objRoot.setAttribute("id","{$id}");

      //check if the template uses a table node without a tbody child (this can corrupt the synchronization of the template with the true browser DOM)
      var objTNodes = objRoot.selectNodeIterator(".//t:table[not(t:tbody)]");
      while (objTNodes.hasNext()) {
        var objTNode = objTNodes.next();
        LOG.error("The template for " + objClass + " implements a 'table' tag, but is missing the corresponding 'tbody' child tag, which is required by the template engine to properly synchronize the template with the native browser DOM. Please add this extra node to your template to ensure it works properly and consistenly:\n" + objTNode.cloneNode(false));
      }
      //check if the template uses a text node with siblings
      var objTNodes = objRoot.selectNodeIterator(".//t:text[preceding-sibling::*[local-name()!='padding' and local-name()!='border' and local-name()!='margin' and local-name()!='height' and local-name()!='width' and local-name()!='var' and local-name()!='drawspace' and local-name()!='position' and local-name()!='empty' and local-name()!='attribute-group' and local-name()!='style-group'] or following-sibling::*[local-name()!='padding' and local-name()!='border' and local-name()!='margin' and local-name()!='height' and local-name()!='width' and local-name()!='var' and local-name()!='drawspace' and local-name()!='position' and local-name()!='empty' and local-name()!='attribute-group' and local-name()!='style-group']]");
      while (objTNodes.hasNext()) {
        var objTNode = objTNodes.next();
        LOG.error("The template for " + objClass + " implements a 'text' tag with one or more siblings. This is not allowed. The template engine requires that text nodes be the only children of their HTML parent. To fix, wrap the text node in a span tag as follows:\n<span>" + objTNode.cloneNode(true) + "</span>");
      }
    }

    //expand all style declarations unless the user has protected this node; if protected, the styles will remain 'inlined' and unaffected by the tempalte engine (and will therefore be handled natively according to the given browser)
    var objStyleNodes = objXML.selectNodeIterator("/t:transform/t:template//t:*[@style]");
    var bProtected;
    while (objStyleNodes.hasNext()) {
      var objStyleNode = objStyleNodes.next();
      bProtected = objStyleNode.selectSingleNode("@u:protected") != null;  
      var strStyle = objStyleNode.getAttribute("style");
      strStyle = strStyle.replace(regStyle, function($0, $1, $2) {
        var strName = $1;
        var strValue = $2;
        if(!bProtected && regBoxErr.test(strName)) {
          LOG.error("The template for " + objClass + " implements a CSS property that is unsupported: " + strName + ". Refer to the template reference documentation regarding supported nodes and styles, particularly the section dealing with border- margin- and padding-variants. Source XHTML:\n" + objStyleNode);
          return '';
        } else if (!bProtected && strName.search(regBox) == 0) {
          if(strName== "right") {
            strName = "left";
            strValue = strValue.indexOf("{") == 0 ? strValue : "100%-" + strValue;
          } else if(strName == "bottom") {
            strName = "top";
            strValue = strValue.indexOf("{") == 0 ? strValue : "100%-" + strValue;
          }
          var objExpandedStyle = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "t:" + strName, Template.NAMESPACE);
          if(strValue.search(regUser) == 0)
            strValue = "{" + Template._profileBoundResolver(objXML,strValue.substring(1,strValue.length-1),strName,"box") + "}";
          if (strName.search(regBoxPx) == 0) {
            //filter out any pixel values (8px becomes 8)
            strValue = strValue.replace(regPx, "$1");

            //convert percentages to use the $$parent wildcard
            if (strValue.search(regPct) > -1) {
              var strVar = (strName == "width" || strName == "left") ? "$$parentwidth" : "$$parentheight";
              strValue = strValue.replace(regPct, function($0,$1) {
                return ($1 == "100") ? strVar : strVar + " * " + ($1 / 100);
              });
            }
          }
          objExpandedStyle.setValue(strValue);
          var objFirst;
          if (objFirst = objStyleNode.getFirstChild()) {
            objStyleNode.insertBefore(objExpandedStyle, objFirst);
          } else {
            objStyleNode.appendChild(objExpandedStyle);
          }
          return '';
        } else if ($2.indexOf("{") == 0) {
          //Update the associated resolver (id, type, name); echo back just the replacement variable
          return "{" + Template._profileBoundResolver(objXML,$2.substring(1,$2.length-1),strName,"css") + "}";
        } else {
          //echo back the style unchanged (it's "static")
          return $1 + ':' + $2 + ';';
        }
      });
      //append the updated style (with box-related settings now removed)
      if(strStyle == "")
        objStyleNode.removeAttribute("style");
      else
        objStyleNode.setAttribute("style", strStyle);
    }

    //add 'empty' declaration
    var objEmptyNodes = objXML.selectNodeIterator("/t:transform/t:template//t:br[not(t:empty)] | /t:transform/t:template//t:input[not(t:empty)] | /t:transform/t:template//t:img[not(t:empty)]");
    while(objEmptyNodes.hasNext()) {
      var objEmptyNode = objEmptyNodes.next();
      var objExpanded = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,"t:empty",Template.NAMESPACE);
      objExpanded.setValue("true");
      var objFirst;
      if(objFirst = objEmptyNode.getFirstChild()) {
        objEmptyNode.insertBefore(objExpanded,objFirst);
      } else {
        objEmptyNode.appendChild(objExpanded);
      }
    }

    //profile 'attribute' resolvers
    var strXML = objXML + "";
    var isConverted = [];
    var curId;
    while(regResolver.exec(strXML)) {
      if(RegExp.$1 == "style")
        continue;
      var strId = RegExp.$2.substring(1,RegExp.$2.length-1);
      curId = Template._profileBoundResolver(objXML,strId,RegExp.$1,RegExp.$1.search(Template.REG_EVENT) == 0 ? "event" : "attribute");
      if(curId != strId)
        isConverted.push({name:RegExp.$1,newval:"{" + curId + "}",oldval:RegExp.$2});
    }
    for(var i=0;i<isConverted.length;i++) {
      var cur = isConverted[i];
      var objAtt = objXML.selectSingleNode("/t:transform/t:template//@" + cur.name + "[.='" + cur.oldval + "']");
      if(objAtt)
        objAtt.setValue(cur.newval);
    }

    //profile expanded 'box' type resolvers
    isConverted = [];
    while(regResolverText.exec(strXML)) {
      var strId = RegExp.$2.substring(1,RegExp.$2.length-1);
      curId = Template._profileBoundResolver(objXML,strId,RegExp.$1,"box");
      if(curId != strId)
        isConverted.push({name:RegExp.$1,newval:"{" + curId + "}",oldval:RegExp.$2});
    }
    for(var i=0;i<isConverted.length;i++) {
      var cur = isConverted[i];
      var objNode = objXML.selectSingleNode("/t:transform/t:template//t:" + cur.name + "[.='" + cur.oldval + "']");
      if(objNode)
        objNode.setValue(cur.newval);
    }

/* @JSC :: begin BENCH */
    t1.log("compile.preprocessors.filter");
/* @JSC :: end */
  };
  Template.registerPreprocessor("jsxfilter",Template._filterTemplate);

  
  /**
   * Firefox has a bug where it does not honor the bounds of an inline box. This results in content bleeding  outside the box;
   * Fix by adding an 'insulating div' to firefox implementations; for all others, a no-op.
   * @param objXML (jsx3.xml.Document) the declarative markup for the given GUI class
   * @param objClass (jsx3.lang.Class)
   * @private
   */
  Template._expandInlineBoxes = function(objXML,objClass) {
    /* @JSC */ if (jsx3.CLASS_LOADER.FX) {
    var objInlineNodes = objXML.selectNodeIterator("/t:transform/t:template//t:inlinebox | /t:transform/t:template//t:*[t:tagname='inlinebox']");
    while(objInlineNodes.hasNext()) {
      //create a child DIV (the insulator)
      var objInlineNode = objInlineNodes.next();
      var objDiv = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,"t:div",Template.NAMESPACE);
      objInlineNode.appendChild(objDiv);
      var objPropNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,"t:position",Template.NAMESPACE);
      objPropNode.setValue("relative");
      objDiv.appendChild(objPropNode);
      objPropNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,"t:width",Template.NAMESPACE);
      objPropNode.setValue("$$parentwidth");
      objDiv.appendChild(objPropNode);
      objPropNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,"t:height",Template.NAMESPACE);
      objPropNode.setValue("$$parentheight");
      objDiv.appendChild(objPropNode);

      //transfer the children (go in reverse order, so the node collection doesn't get corrupted)
      var objKids = objInlineNode.getChildNodes();
      var objPrevKid = null;

      for(var i=objKids.size()-1;i>=0;i--) {
        var objKid = objKids.get(i);
        //only insulate statements and child boxes.  Any property declarations actually belong to the inlinebox
        //the only exception is 'padding' and 'text' which mush be applied to the insulating box for proper x-browser behavior

        if((objKid.getBaseName() == "text" || objKid.getBaseName() == "padding" || Template.BOX_PROPS.indexOf(objKid.getBaseName()) == -1) && !objKid.equals(objDiv)) {
          if(objPrevKid != null) {
            objDiv.insertBefore(objKid,objPrevKid);
          } else {
            objDiv.appendChild(objKid);
          }
          objPrevKid = objKid;
        }
      }
    }
/* @JSC */ }
  };
  Template.registerPreprocessor("jsxinlinebox",Template._expandInlineBoxes);


  /**
   * Call this method during GUI class development to see how your XML template is converted into JavaScript by the template compiler.
   * Using the precompiled JavaScript can provide to-the-line debugging information when difficult bugs appear in your GUI class.  To use for testing,
   * copy the JavaScript code returned by this method and paste into your GUI class.  Make sure that when you paste it, it is the last
   * statement contained by the class. If you paste the generated JavaScript BEFORE the call to 'getTemplateXML', it will be clobbered by the generated code.
   * The code returned by this method reflects the exact methods and properties injected by the template class when it converts the markup
   * returned by <code>getTemplateXML</code> into JavaScript.
   * @param strClassName {String} The name of the class to precompile.  For example, WIDGET. This should also be the name of the class as contained within the defineClass method where the given class is instantiated
   * @param strPrototypeName {String} Optional.  The prototype name per the class declaration. For example, widget
   * @param strQualifiedName {String} Optional.  The full name of the class, including the package (use if the class does not belong to the jsx3.gui package). For example, jsx3.ext.SomeRedBoxClass
   * @return {String} JavaScript function code
   */
  Template.precompile = function(strClassName,strPrototypeName,strQualifiedName) {
    if(!strPrototypeName)
      strPrototypeName = strClassName + "_prototype";
    if(!strQualifiedName)
      strQualifiedName = "jsx3.gui." + strClassName;

    var objClass = eval(strQualifiedName);
    if(objClass) {
/* @JSC :: begin BENCH */
      var t1 = new jsx3.util.Timer(Template.jsxclass, objClass, 4);
/* @JSC :: end */

      var a = [];

      //tell the template to unregister the class if previously registered
      a.push("jsx3.gui.Template.unregisterLibrary(" + strClassName + ".jsxclass.getName())");
      
      //set whether or not the class uses a fluid (dynamic) DOM or if it is static (it affects how the system locates objects)
      var _JSXFLUID = "_JSXFLUID";
      var _JSXRECALC = "_JSXRECALC";
      var _JSXTEMPLATE_INITED = "_JSXTEMPLATE_INITED";
      a.push(strClassName + ".jsxclass." + _JSXFLUID + " = " + objClass.jsxclass._JSXFLUID);
      a.push(strClassName + ".jsxclass." + _JSXRECALC + " = " + objClass.jsxclass._JSXRECALC);
      a.push(strClassName + ".jsxclass." + _JSXTEMPLATE_INITED + " = true")

      //list all resolvers declared locally by the class
      var objResolverSet = Template.getResolverSet(strQualifiedName,true);
      for(var p in objResolverSet) {
        var objResolver = objResolverSet[p];
        var objMeta = [];
        if(objResolver.type && objResolver.type != "css")
          objMeta.push("type:" + "\"" + objResolver.type + "\"");
        if(objResolver._name)
          objMeta.push("name:" + "\"" + objResolver._name + "\"");
        if(objResolver.defaultvalue)
          objMeta.push("defaultvalue:" + "\"" + objResolver.defaultvalue + "\"");
        if(objResolver.triggers)
          objMeta.push("triggers:[\"" + objResolver.triggers.join("\",\"") + "\"]");
        if(typeof(objResolver.repaintupdate) == "boolean")
          objMeta.push("repaintupdate:" + objResolver.repaintupdate);
        a.push("jsx3.gui.Template.addResolver(\"" + strQualifiedName + "\",\"" + p + "\"," + objResolver + ",{" + objMeta.join(",") + "})");
      }

      //register ALL resolvers used by the class. These resolvers are of two types:
      //1) Resolvers used/declared in other libraries
      //2) Local resolvers declared in this class
      var arrLib = Template.getLibrary(strQualifiedName);
      for(var i=0;i<arrLib.length;i++)
        a.push("jsx3.gui.Template._registerLocalResolver(\"" + strQualifiedName + "\",\"" + arrLib[i].setid + "\",\"" + arrLib[i].id + "\",jsx3.gui.Template.getResolver(\"" + arrLib[i].setid + "\",\"" + arrLib[i].id + "\"))");

      //get the four dynamic functions generated by parsing the declartive markup (the template)
      a.push(strPrototypeName + "._paint =" + objClass.prototype._paint);
      a.push(strPrototypeName + "._createBoxProfile = " + objClass.prototype._createBoxProfile);
      a.push(strPrototypeName + "._updateBoxProfileImpl = " + objClass.prototype._updateBoxProfileImpl);
      a.push(strPrototypeName + "._getClientDimensions = " + objClass.prototype._getClientDimensions);
      a.push(strPrototypeName + "._paintChild = " + objClass.prototype._paintChild);

      //get all inlined event handlers
      a.push(strPrototypeName + ".onbeforeinit = " + objClass.prototype.onbeforeinit);
      a.push(strPrototypeName + ".oninit = " + objClass.prototype.oninit);
      a.push(strPrototypeName + ".onbeforepaint = " + objClass.prototype.onbeforepaint);
      a.push(strPrototypeName + ".onpaint = " + objClass.prototype.onpaint);
      a.push(strPrototypeName + ".onbeforeresize = " + objClass.prototype.onbeforeresize);
      a.push(strPrototypeName + ".onresize = " + objClass.prototype.onresize);
      a.push(strPrototypeName + ".onbeforeresizechild = " + objClass.prototype.onbeforeresizechild);

      //join the code and do a bit of cleanup (remove the word 'anonymous')
      var rv = ("(function(" + strClassName + "," + strPrototypeName + ") {\n\n" + a.join(";\n\n") + ";\n\n})(" + strClassName + "," + strPrototypeName + ");").replace(/function anonymous/gi,"function");

/* @JSC :: begin BENCH */
      t1.log("precompile");
/* @JSC :: end */

      return rv;
    }
  };


  /**
   * Converts an HTML template into the relevant JavaScript functions needed by the GUI class.  See jsx3.gui.Template.Block for example
   * usage.
   * @param Markup {String | jsx3.xml.Document} String of XML that validates against the Schema, http://gi.tibco.com/transform/
   * @param objClass {jsx3.lang.Class} An instance of jsx3.lang.Class
   * @param-private bCache {Boolean}
   * @throws {jsx3.Exception} if strMarkup does not validate or objClass is not an instance of jsx3.lang.Class
   * @see jsx3.gui.Template.Block
   */
  Template.compile = function(Markup,objClass,bCache) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Template.jsxclass, objClass);
/* @JSC :: end */

    if(!(objClass instanceof jsx3.lang.Class))
      //TODO: need to go through and localize all 'error' and 'throw' messages
      throw new jsx3.Exception("invalid class");

    //unregister the library if it was previously declared
    Template.unregisterLibrary(objClass.getName());

    //validate the markup (the template)
    var objDoc;
    if(!(Markup instanceof jsx3.xml.Document)) {
      objDoc = new jsx3.xml.Document();
      objDoc.loadXML(Markup);
    } else {
      objDoc = Markup;
    }

    //proceed if the markup is well-formed
    if(!objDoc.hasError()) {

      var objInstance = new Template();
      objInstance._markup = objDoc;
      objInstance._class = objClass;
      objDoc.setSelectionNamespaces('xmlns:t="' + Template.NAMESPACE + '" xmlns:u="' + Template.USERNAMESPACE + '"');

      if(bCache)
        jsx3.getSharedCache().setDocument(objClass.getName()+"_1_XML",objDoc.cloneDocument());

/* @JSC :: begin BENCH */
      var t2 = new jsx3.util.Timer(Template.jsxclass, objClass, 5);
/* @JSC :: end */

      //preprocess the XML (any browser-specific modifications that may be necessary)
      for(var p in Template._preprocessors)
        if(p != "jsxinlinebox")
          Template._preprocessors[p](objDoc,objClass);
      Template._preprocessors["jsxinlinebox"](objDoc,objClass);

      if(bCache)
        jsx3.getSharedCache().setDocument(objClass.getName()+"_2_XML",objDoc);

/* @JSC :: begin BENCH */
      t2.log("compile.preprocessors");
/* @JSC :: end */

      //step 1) load the imported resolvers
      objInstance._importResolverLibraries();

/* @JSC :: begin BENCH */
      t2.log("compile.import-resolvers");
/* @JSC :: end */

      //Step 2) load the declared resolvers
      Template.getResolverSet(objClass.getName(),true);
      objInstance._addLocalResolvers();

/* @JSC :: begin BENCH */
      t2.log("compile.local-resolvers");
/* @JSC :: end */

      //Step 3) parse the markup (this will inject 4 dynamically-created functions into the class that reflect the declarative markup)
      objInstance._parseMarkup();
    } else {
      LOG.error("The XHTML template markup used by the class, " + objClass + ", contains invalid XML and cannot be parsed (" + objDoc.getError().code + ") :\n" + objDoc.getError().description.replace(/<transform/,"\n<transform").replace("----","\n----"));
      throw new jsx3.Exception("invalid, malformed xml for declarative markup");
    }

/* @JSC :: begin BENCH */
    t1.log("compile");
/* @JSC :: end */
  };

  
  /**
   * Use during testing to unregister the class from the template engine. This allows the given GUI class to be repeatedly reloaded
   * without corrupting the template engine.
   * @param strLibraryId {String} For example, my.custom.Class
   * @package
   */
  Template.unregisterLibrary = function(strLibraryId) {
    delete Template.LIBRARIES[strLibraryId];
    delete Template.RESOLVERS[strLibraryId];
    delete Template.TRIGGERS[strLibraryId];
  };


  /**
   * Imports the resolver libraries declared in the markup (as if they had been embedded). Note: all imports are processed
   * before any declared resolvers
   * @private
   */
  Template_prototype._importResolverLibraries = function() {
    var iter = this._markup.selectNodeIterator("/t:transform/t:model/t:import/@library");
    while(iter.hasNext()) {
      var strLib = iter.next().getValue();
      var objLib = Template.getLibrary(strLib);
      if(objLib) {
        //there is an associate array used for each gui class that will reference all resolvers (by reference, not id)
        for(var i=0;i<objLib.length;i++) {
          var objResolverSet = Template.RESOLVERS[objLib[i].setid || Template.GLOBAL_RESOLVER_ID];
          if(objResolverSet) {
            var objResolver = objResolverSet[objLib[i].id];
            if(objResolver) {
              //register the resolver as part of the library that belongs to the class being templated
              Template._registerLocalResolver(this._class.getName(),(objLib[i].setid || Template.GLOBAL_RESOLVER_ID),objLib[i].id,objResolver);
            } else {
              LOG.error("The resolver, " + objLib[i].id + ", being referenced by the library import, " + strLib + ", is not a registered resolver for the set, " + (Template.RESOLVERS[objLib[i].setid || Template.GLOBAL_RESOLVER_ID]) + ". Class: " + this._class);
            }
          } else {
            LOG.error("The resolver set, " + objLib[i].setid + ", being referenced by the library import, " + strLib + ", is not a registered resolver set. Class: " + this._class);
          }
        }
      } else {
        LOG.error("The library import, " + strLib + ", is not registered as a valid library. Class: " + this._class);
      }
    }

    //add any inlined resolvers--those referencing the resolver directly, not a library
    iter = this._markup.selectNodeIterator("/t:transform/t:model/t:import[@resolver]");
    while(iter.hasNext()) {
      var objNode = iter.next();
      var strSetId = objNode.getAttribute("set");
      if(jsx3.util.strEmpty(strSetId))
        strSetId = Template.GLOBAL_RESOLVER_ID;
      var strResolverId = objNode.getAttribute("resolver");
      var objResolverSet = Template.RESOLVERS[strSetId];
      if(objResolverSet) {
        var objResolver = objResolverSet[strResolverId];
        if(objResolver) {
          //register the resolver as part of the library that belongs to the class being templated
          Template._registerLocalResolver(this._class.getName(),strSetId,strResolverId,objResolver);
        } else {
          LOG.error("The resolver, " + strResolverId + ", being referenced by the resolver import, " + strResolverId + ", is not a registered resolver for the set, " + (Template.RESOLVERS[strSetId]) + ". Class: " + this._class);
        }
      } else {
        LOG.error("The resolver set, " + strSetId + ", being referenced by the resolver import, " + strResolverId + ", is not a registered resolver set. Class: " + this._class);
      }
    }
  };


  /**
   * Adds all locally declared resolvers (those declared in the markup being compiled)
   * @private
   */
  Template_prototype._addLocalResolvers = function() {
    var strClassName = this._class.getName();
    var iter = this._markup.selectNodeIterator("/t:transform/t:model/t:resolver | /t:transform/t:model/t:var");
    while(iter.hasNext()) {
      //create the meta object
      var objRNode = iter.next();
      var objMeta = {};
      var strType = objRNode.getAttribute("type");
      if(!jsx3.util.strEmpty(strType))
        objMeta.type = strType;
      var strName = objRNode.getAttribute("name");
      if(!jsx3.util.strEmpty(strName))
        objMeta.name = strName;
      var strDefault = objRNode.getAttribute("defaultvalue");
      if(!jsx3.util.strEmpty(strDefault))
        objMeta.defaultvalue = strDefault;
      else
        objMeta.defaultvalue = null;
      var strTriggers = objRNode.getAttribute("triggers");
      if(!jsx3.util.strEmpty(strTriggers))
        objMeta.triggers = strTriggers.split(/\s/);
      var strResolverId = objRNode.getAttribute("id");

      //add the resolver to the Template class which will manage it (allowing it to be mixed in without the redundancy implied by heirarchy)
      var objResolver = Template.addResolver(strClassName,strResolverId,new Function(objRNode.getValue()),objMeta);

      //register the resolver as part of the library that belongs to the class being templated (this is how the resolver is located)
      //(since this resolver was declared locally, its resolver-set id and its library id are the same)
      Template._registerLocalResolver(strClassName,strClassName,strResolverId,objResolver);
    }
  };


  /**
   * Registers a resolver with a given class. This is effectively the same as adding a resolver to a library
   * The library name is the name of the class.  The items in the library are all resolvers used by the class.
   * This pattern serves three purposes:
   * 1) consistent library (tagging) approach
   * 2) allows other classes (subclasses) to import an entire library from a similarly-painted class
   * 3) allows for centralized storage
   * @param strLibraryId {String} same as the class name (since this library is a class library)
   * @param strResolverSetId {String}
   * @param strResolverId {String}
   * @param objResolver {Object}
   * @private
   */
  Template._registerLocalResolver = function(strLibraryId,strResolverSetId,strResolverId,objResolver) {
    if(!strResolverSetId)
      strResolverSetId = Template.GLOBAL_RESOLVER_ID;
    LOG.trace("Registering Resolver, '" + strResolverSetId + ":" + strResolverId + "', with the class, " + strLibraryId + "'");
    var objLib = Template.getLibrary(strLibraryId);
    if(!objLib)
      objLib = Template.LIBRARIES[strLibraryId] = [];
    var objItem = {setid:strResolverSetId ,id:strResolverId};
    //reference by index and by id
    objLib.push(objItem);
    objLib[strResolverId] = objItem;

    if(objResolver.triggers) {
      for(var i=0;i<objResolver.triggers.length;i++)
        Template._addTrigger(strLibraryId,objResolver.triggers[i],objResolver);
    } else {
      LOG.trace("No triggers for the Resolver, " + objResolver.resolverid);
    }
  };

  /**
   * Adds custom event handlers as prototype methods on the class
   * If no custom handler has been declared, a no-op method will be generated.
   * Supported events include:
   *   onbeforeinit (before box-profile is created), oninit (after box-profile is created), onbeforepaint, onpaint, onbeforeresize, onresize
   * Cancelable events include:
   *   onbeforepaint (if a String is returned, it will be used instead of calling paint), onbeforeresize (if false is returned, the resize is cancelled)
   * @private
   */
  Template_prototype._parseEventHandler = function(strHandler, objNode, bSleep) {
    var attrValue = objNode.getAttribute(strHandler);
    this._class.getConstructor().prototype[strHandler] = attrValue == null ? new Function(";") : 
        (bSleep ? new Function("jsx3.sleep(function() { " + attrValue + "},this.getId(),this);") : 
            new Function(attrValue));
  };

  /**
   * Manages the conversion of the actual box template markup to the code and structures to represent it
   * @private
   */
  Template_prototype._parseMarkup = function() {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Template.jsxclass, this._class, 5);
/* @JSC :: end */

    var proto = this._class.getConstructor().prototype;
    
    //establish whether or not the DM reflects a 'fluid' structure. when not set, it is assumed the dom is fixed and predictable, allowing
    //for fast resolution of which on-screen GUI element attaches to which model box
    var objRoot = this._markup.selectSingleNode("/t:transform/t:template");
    this._class._JSXFLUID = objRoot.getAttribute("dom") == "dynamic";
    this._class._JSXRECALC = objRoot.getAttribute("recalc") == "true";
    this._class._JSXTEMPLATE_INITED = true;

    this._parseEventHandler("onbeforeinit", objRoot);
    this._parseEventHandler("oninit", objRoot);
    this._parseEventHandler("onbeforepaint", objRoot);
    //add the paint event to the paint queue (this allows the GUI to paint/update, so the onpaint event fires at the correct time)
    this._parseEventHandler("onpaint", objRoot, true);
    this._parseEventHandler("onbeforeresize", objRoot);
    this._parseEventHandler("onresize", objRoot);
    this._parseEventHandler("onbeforeresizechild", objRoot);

    //alias variables that will be obfuscated
    var _jsxdrawspace = "_jsxdrawspace";
    var _jsxpaintprofile = "_jsxpaintprofile";
    var _jsxboxprofile = "_jsxboxprofile";
    var _jsxupdatequeue = "_jsxupdatequeue";
    var _jsxobjgui = "_jsxobjgui";
    var _jsxforcecascade = "_jsxforcecascade";
    var _targetchild = "_targetchild";

    //start building the dynamic functions for create paint update and dimensions; these all represent different interpretations (statements of execution) of the same declarative markup
    var functionBuilder = {create:[],paint:[],update:[],dimensions:[],paintchild:[]};
    functionBuilder.paint.push("var MODE = 'paint';var _output = [];var jsxdrawspacetarget;var jsxdrawspace = {};");
    functionBuilder.update.push("var MODE = 'update';var _drawspace = jsxdrawspace = " + _jsxdrawspace + ";");
    functionBuilder.update.push("var _objgui = " + _jsxobjgui + ";var jsxdrawspacetarget;");
    functionBuilder.update.push("var jxbox, jsxcascade;");
    //paintchild is a conceptual hybrid of paint and update: (paint: to generate the HTML, update: to locate which native node in which to inject)
    functionBuilder.paintchild.push("var MODE = \"paintchild\";\nvar jsxdrawspace = {};\nvar " + _jsxobjgui + " = this.getRendered();\nvar _objgui = " + _jsxobjgui + ";\nvar jsxdrawspacetarget;\nvar jxbox;");
    functionBuilder.create.push("var MODE = 'create';var " + _jsxboxprofile + " = {};var jsxdrawspacetarget;");
    functionBuilder.create.push("var jsxbox;");
    functionBuilder.create.push("var _drawspace = jsxdrawspace = jsx3.clone(" + _jsxdrawspace + ");");
    functionBuilder.dimensions.push("var MODE = 'dimension';var jsxbox;var jsxdrawspacetarget;");
    functionBuilder.dimensions.push("var _drawspace = jsxdrawspace = jsx3.clone(" + _jsxdrawspace + ");");

    objRoot = objRoot.getFirstChild();
    var strName = objRoot.getBaseName();
    if(Template.STATEMENTS.indexOf(strName) > -1) {
      //the root node is a statement declaration (like if, else, var, etc)
      this._convertStatementNode(objRoot,functionBuilder,0,-1,"");
    } else {
      //the root node is a box declaration (span, div, ubox, ibox, abox, input, etc)
      this._convertBoxNode(objRoot,functionBuilder,0,-1,"");
    }

    //createBoxProfile
    functionBuilder.create.push("return " + _jsxboxprofile + ";");
    var strCreateBox = functionBuilder.create.join("\n");
    var dynFn = proto._createBoxProfile = new Function("_jsxdrawspace","_jsxpaintprofile",Template._wrapwithtrycatch(strCreateBox,"_createBoxProfile"));

    //paint
    functionBuilder.paint.push("return _output.join('');");
    var strPaint = functionBuilder.paint.join("\n");
    dynFn = proto._paint = new Function("_jsxpaintprofile","_jsxboxprofile",Template._wrapwithtrycatch(strPaint,"_paint"));

    //close out the function and create the instance (this is the function that will be called upon to update the Box structure--cascading where necessary)
    Template._optimizeCompiledCode(functionBuilder.update);
    dynFn = proto._updateBoxProfileImpl = new Function("_jsxdrawspace","_jsxpaintprofile","_jsxupdatequeue","_jsxobjgui","_jsxforcecascade",Template._wrapwithtrycatch(functionBuilder.update.join("\n"),"_updateBoxProfileImpl"));

    //getClientDimensions
    Template._optimizeCompiledCode(functionBuilder.dimensions);
    functionBuilder.dimensions.push("return jsx3.gui.Template.getEmptyDrawspace();");
    var strDimensionsBox = functionBuilder.dimensions.join("\n");
    dynFn = proto._getClientDimensions = new Function("_jsxdrawspace","_jsxpaintprofile","_targetchild","_jsxboxprofile",Template._wrapwithtrycatch(strDimensionsBox,"_getClientDimensions"));

    //paintChild
    Template._optimizeCompiledCode(functionBuilder.paintchild);
    var strPaintChild = functionBuilder.paintchild.join("\n");
    dynFn = proto._paintChild = new Function("_targetchild","_jsxpaintprofile",Template._wrapwithtrycatch(strPaintChild,"_paintChild"));

/* @JSC :: begin BENCH */
    t1.log("compile.markup");
/* @JSC :: end */
  };


  Template._wrapwithtrycatch = function(strCode,strMethodName) {
    var strMsg = "\"There is a JavaScript error in the '" + strMethodName + "' method related to code generated by the template definition for the object, \"";
    return "try {\n" + strCode + "\n} catch(e) { jsx3.log(" + strMsg + "+ this + \":\\n\" + e + \"\\nFor more information on this error, precompile the template and insert log statements where appropriate (see: jsx3.gui.Template.precompile).\");}";
  };

  /**
   * Removes all redundant statements created by the compiler--these 'straggling' statements result from zipping up the tree after traversing down
   * @param arrCode {Array} Function as an array
   * @private
   */
  Template._optimizeCompiledCode = function(arrCode) {
    // QUESTION: is this necessary? what is this doing?
    var myReg = /^var\s(\S*)\s=\s/;
    for(var i = arrCode.length -1;i>0; i--) {
      var itm = arrCode[i];
      if(itm.search(myReg) == 0) {
        arrCode.splice(i,1);
      } else {
        return;
      }
    }
  };


  /**
   * Returns an empty drawspace object. Ensures that the system doesn't fall apart when a drawspace can't be found.
   * @return {object} drawspace object expressed as follows: <code>{parentwidth:0,parentheight:0}</code>
   * @package
   */
  Template.getEmptyDrawspace = function() {
    //returns a 'null' object -- this happens when an object requests a drawspace from a assumed parent, but that parent can't find the object
    //TODO: need to add error log statement; continue as if the drawspace is 0x0, so the system doesn't get completely corrupted
    return {parentwidth:0,parentheight:0};
  };


  /**
   * Converts a drawspace declaration in the markup
   * @param objNode {jsx3.xml.Entity} Drawspace node
   * @param strVarName {String} strVarName (unique name of the drawspace--used to restore after modifying)
   * @return {String}
   * @private
   */
  Template_prototype._parseDrawspaceDeclaration = function(objNode,strVarName) {
    var _jsxpaintprofile = "_jsxpaintprofile";
    var oAtts = objNode.selectNodeIterator("@*");
    var strOpen = "var " + strVarName + " = jsx3.clone(jsxdrawspace);\n";
    while (oAtts.hasNext()) {
      var oAtt = oAtts.next();
      var strAttName = oAtt.getNodeName();
      var strAttValue = oAtt.getValue();

      //the user wants to take a value on the 'Paintable Profile' and use that to update the drawspace
      if (strAttValue.search(Template.REG_REPVAR) > -1)
        strAttValue = _jsxpaintprofile + "[\"" + RegExp.$1 + "\"]";

      //add the code that will update the given named property on the drawspace
      //TODO: make sure to document that any attribute on the drawspace should be evaluateable--meaning a string would need to be wrapped
      strOpen += "jsxdrawspace." + strAttName + " = " + strAttValue.replace(/\$\$target/g,"jsxdrawspacetarget").replace(/\$\$/g,"jsxdrawspace.") + ";\n";

    }
    return strOpen;
  };


  /**
   * Converts a control statement in the DM into the appropriate structure
   * @param objNode {jsx3.xml.Entity}
   * @param functionBuilder {Object}
   * @param intDepth {int}
   * @param intMyChildIndex {int} the index for this box among its siblings (zero-based);
   * @param strPath {String} For example, 0/1/ or 0/ or "" (empty string) (the domnode path to this domnode)
   * @private
   */
  Template_prototype._convertStatementNode = function(objNode,functionBuilder,intDepth,intMyChildIndex,strPath) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Template.jsxclass, this._class, 5);
/* @JSC :: end */

    var _targetchild = "_targetchild";
    var _jsxupdatequeue = "_jsxupdatequeue";
    var _jsxpaintprofile = "_jsxpaintprofile";
    var setCachedClientDimensions = "setCachedClientDimensions";
    var _conditionalPaint = "_conditionalPaint";
    var _jsxforcecascade = "_jsxforcecascade";
    var strName = objNode.getBaseName();
    //all statement nodes either use a select query (which returns an iterator instance) or test (which returns a Boolean); or can embed the query as the content of the node (like XSLT param)
    var strStatement = objNode.getAttribute("select");
    if(jsx3.util.strEmpty(strStatement))
      strStatement = objNode.getAttribute("test");
    if(jsx3.util.strEmpty(strStatement) && objNode.getBaseName() == "var")
      strStatement = objNode.getValue();

    var strOpen = "";
    var strClose = "}";
    var strVarName = "";
    var strForEachCounterName;
    if(strName == "if") {
      //if the parent is an if-else and this isn't the first if statement, create an else if
      if(objNode.getParent().getBaseName() != "if-else" || objNode.getParent().getFirstChild().equals(objNode))
        strOpen = "if(" + strStatement + ") {";
      else
        strOpen = "else if(" + strStatement + ") {";
      functionBuilder.paint.push(strOpen);
      functionBuilder.update.push(strOpen);
      functionBuilder.paintchild.push(strOpen);
      functionBuilder.create.push(strOpen);
      functionBuilder.dimensions.push(strOpen);
      strClose = "}";
    } else if(strName == "var") {
      strVarName = objNode.getAttribute("name");
      if(jsx3.util.strEmpty(strVarName))
        strVarName = objNode.getAttribute("id");
      //TODO:  do a safe replace by looking for /$$(parentwidth|width|left)/
      strOpen = "var " + strVarName + " = " + _jsxpaintprofile + "[\"" + strVarName + "\"] = " + strStatement.replace(/\$\$/g,"jsxdrawspace.") + ";";
      functionBuilder.paint.push(strOpen);
      functionBuilder.update.push(strOpen);
      functionBuilder.paintchild.push(strOpen);
      //functionBuilder.create.push(strOpen);
      functionBuilder.dimensions.push(strOpen);
      //var statements cannot contain other nodes; exit early
      return;
    } else if(strName == "for-each") {
      strVarName = "a" + (Template.getKey());
      strForEachCounterName =  "i" + (Template.getKey());
      strOpen =  "var " + strVarName + " = " + strStatement + ";\n";
      strOpen += "var " + strForEachCounterName + " = -1;\n";
      strOpen += _jsxforcecascade + " = typeof(" + _jsxforcecascade + ") == 'undefined' ? 1 : " + _jsxforcecascade + ";\n";
      strOpen += "while(" + strVarName + ".hasNext()) {";
      strOpen += "jsxdrawspace.target = " + strVarName + ".next();\n";
      strOpen += strForEachCounterName + "++;\n";            
      functionBuilder.paint.push(strOpen);
      functionBuilder.update.push(strOpen);
    } else if(strName == "drawspace") {
      //modify the drawpace before passing on to the next receiver
      strVarName = "d" + (Template.getKey());
      strOpen = this._parseDrawspaceDeclaration(objNode,strVarName);
      functionBuilder.update.push(strOpen);
      functionBuilder.create.push(strOpen);
      functionBuilder.dimensions.push(strOpen);
      //return the drawspace back to its original state; close the while l
      strClose = "jsxdrawspace = " + strVarName + ";";
    } else if(strName == "else"){
      strOpen = "else {";
      functionBuilder.paint.push(strOpen);
      functionBuilder.update.push(strOpen);
      functionBuilder.paintchild.push(strOpen);
      functionBuilder.create.push(strOpen);
      functionBuilder.dimensions.push(strOpen);
    } else if(strName == "attach"){
      //this is where the child objects are called to generate their own HTML content
      strVarName = "a" + (Template.getKey());
      strOpen =  "var " + strVarName + " = " + strStatement + ";\n";
      strOpen += "while(" + strVarName + ".hasNext()) {\n";
      strOpen += "jsxdrawspacetarget = " + strVarName + ".next();\n";

      //does the child being attached need its drawspace modified -- if so, add the mod commands to the common opening statement
      var objDNode = objNode.getFirstChild();
      var strDVarName;
      var strDOpen = "";
      if(objDNode) {
        strDVarName = "d" + (Template.getKey());
        strDOpen = this._parseDrawspaceDeclaration(objDNode,strDVarName);
      }

      //add common opening content
      functionBuilder.paint.push(strOpen);
      functionBuilder.update.push(strOpen + strDOpen);
      functionBuilder.paintchild.push(strOpen);
      functionBuilder.create.push(strOpen + strDOpen);
      functionBuilder.dimensions.push(strOpen + strDOpen);

      //add specific opening content
      //NOTE: the method, _conditionalPaint, will determine whether to paint the child in-line, use a place-holder span, or use a DOM paint
      functionBuilder.paint.push("_output.push(jsxdrawspacetarget." + _conditionalPaint + "());");
      //TODO: for now resolving the child via 'getRendered'. need to provide method for inverse loop to account for text content -- need a simple flag on the DM similar to DOM = dynmaic/static/reallyreallystatic
      //TODO: validate impact of removing clone statements--there's a missing byrref handler that is morphing this...
      functionBuilder.update.push("this." + setCachedClientDimensions + "(jsxdrawspacetarget.getId(),jsxdrawspace);");

      functionBuilder.update.push("if(this.onbeforeresizechild(jsxdrawspacetarget) !== false) " + _jsxupdatequeue + ".add(jsxdrawspacetarget, jsx3.clone(jsxdrawspace), jsxdrawspacetarget.getRendered(), true);");
      //NOTE: never cascade during createBoxProfile.  Paint will manage that cascade, using the jsxloadtype mechanism for managing efficiency
      //      However, cache the allowed drawspace on the child so it doesn't waste time doing a bottom-up query when the top-down cascade already has the drawspace
      //functionBuilder.create.push("jsxdrawspacetarget.setDrawspace(jsxdrawspace);");
      functionBuilder.create.push("this." + setCachedClientDimensions + "(jsxdrawspacetarget.getId(),jsxdrawspace);");
      //NOTE: I could cache the client dimensions in the generated method, _getClientDimensions, but I actualy do it within the public method, getClientDimensions
      functionBuilder.dimensions.push("if(" + _targetchild + " == jsxdrawspacetarget) return jsx3.clone(jsxdrawspace);");
      functionBuilder.paintchild.push("if(" + _targetchild + " == jsxdrawspacetarget) {if(jsxdrawspacetarget.isDomPaint()) { _objgui" + (intDepth ? intDepth-1 : "") + ".appendChild(jsxdrawspacetarget.paintDom()); } else {jsx3.html.insertAdjacentHTML(_objgui" + (intDepth ? intDepth-1 : "") + ",\"beforeEnd\",jsxdrawspacetarget.paint());}return _objgui" + (intDepth ? intDepth-1 : "") + ";}");

      //restore the drawspace (if a modified drawspace declaration was used)
      if(strDVarName) {
        var strDClose = "_drawspace" + intDepth + " = jsx3.clone(" + strDVarName + ");\njsxdrawspace = jsx3.clone(" + strDVarName + ");\n";
        functionBuilder.update.push(strDClose);
        functionBuilder.create.push(strDClose);
        functionBuilder.dimensions.push(strDClose);
      }

      //close out the child iterator (the while loop)
      functionBuilder.paint.push(strClose);
      functionBuilder.update.push(strClose);
      functionBuilder.paintchild.push(strClose);
      functionBuilder.create.push(strClose);
      functionBuilder.dimensions.push(strClose);
    } else if(strName == "break" || strName == "continue" || strName == "return") {
      functionBuilder.paint.push(strName + ";");
      functionBuilder.update.push(strName + ";");
      return;
    } else {
      strClose = "";
    }

    if (strName != "attach") {
      //recurse to parse descendant content; close the control statement
      var iter = objNode.getChildIterator(false);
      while(iter.hasNext()) {
        var objCNode = iter.next();
        if(Template.STATEMENTS.indexOf(objCNode.getBaseName()) > -1) {
          this._convertStatementNode(objCNode,functionBuilder,intDepth,((intMyChildIndex > -1) ? strPath + intMyChildIndex + "/" : ""));
        } else {
          this._convertBoxNode(objCNode,functionBuilder,intDepth,intMyChildIndex,((intMyChildIndex > -1) ? strPath + intMyChildIndex + "/" : ""),strForEachCounterName);
        }
      }

      //close out the tag now that descendant content has been added
      if(strName != "drawspace")
        functionBuilder.paint.push(strClose);
      functionBuilder.update.push(strClose);
      if(strName =="if" || strName =="else")
        functionBuilder.paintchild.push(strClose);
      //the iterator statement is the one statement that createboxprofile will ignore--it's meaningless when instantiating a template (box)
      if (strName != "iterator" && strName != "for-each") {
        functionBuilder.create.push(strClose);
        functionBuilder.dimensions.push(strClose);
      }
    }

/* @JSC :: begin BENCH */
    t1.log("compile.markup.csn");
/* @JSC :: end */
  };

  
  /**
   * incrementer used to generate unique local variable names
   * @private
   */
  Template.getKey = function() {
    Template.inc = Template.inc + 1;
    return Template.inc;
  };


  /**
   * Converts a box statement in the DM into the appropriate structure--an instance of jsx3.gui.Template.Box. Adds opening
   * and closing statements to the generated function code for rendering and updating the box; provides way to get
   * the client drawspace for a given box
   * @param objNode {jsx3.xml.Entity}
   * @param functionBuilder {Object} Array containing function code to paint the view
   * @param intDepth {int} if 0, this is the root box for the control
   * @param intMyChildIndex {int} the index for this box among its siblings (zero-based);
   * @param strPath {String} For example, 0/1/ or 0/ or "" (empty string) (the domnode path to this domnode)
   * @param strForEachCounterName {String} used as a replacement for @strPath. When not null, the index defined by this variable will be used
   * to determine which iteration of a for-each loop applies to which GUI item on-screen.
   * @private
   */
  Template_prototype._convertBoxNode = function(objNode,functionBuilder,intDepth,intMyChildIndex,strPath,strForEachCounterName) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Template.jsxclass, this._class, 5);
/* @JSC :: end */

    var _jsxforcecascade = "_jsxforcecascade";
    var _jsxboxprofile = "_jsxboxprofile";
    var _jsxpaintprofile = "_jsxpaintprofile";
    //variable name for the drawspace that will be used as the input when compiling
    var strInputVariableName = "_drawspace" + (intDepth ? intDepth : "");
    var strInputVariableNameG = "_objgui" + (intDepth ? intDepth : "");

    //variable name for the drawspace that will be returned when compiling the box
    var strOutputVariableName = "_drawspace" + (intDepth + 1);
    var strOutputVariableNameG = "_objgui" + (intDepth + 1);

    var strPreputVariableNameG = "_objgui" + (((intDepth-1) > 0) ? intDepth-1 : "");

    //get the unique ID for this particular box (use the absolute node path to do this)
    var strBoxId = Template._getNodePath(objNode);
    var strRBoxId = strBoxId.replace('"','\"');

    //if the parent of this box statement is a for-each loop, and if there is a preceding sibling 'var' statement, make sure to add a recalc command
    var arrRecalc = [];
    if(objNode.getParent().getBaseName() == "for-each" && objNode.selectSingleNode("preceding-sibling::t:var")) {
      var objNodes = objNode.selectNodeIterator("preceding-sibling::t:var");
      var objResolverNode;
      while(objNodes.hasNext()) {
        var strResolverName = objNodes.next().getAttribute("name");
        if(objResolverNode = objNode.selectSingleNode("/t:transform/t:model/t:resolver[@name and @type='box' and @id='" + strResolverName + "'] | /t:transform/t:model/t:var[@name and @type='box' and @id='" + strResolverName + "']")) {
          //insert a recalc statement (even though this is a 'paint'), since it's a for-each loop and 'box' properties are being reset
          arrRecalc.push(objResolverNode.getAttribute("name") + ":" + strResolverName);
        }
      }
    }

    //add commands to the dynamic functions being built to ask this box to paint/update
    if(arrRecalc.length) {
      functionBuilder.paint.push("jsxbox = this.getBoxByName(\"" + strRBoxId + "\");");
      functionBuilder.paint.push("jsxbox.recalculate({" + arrRecalc.join(",") + "});");
      functionBuilder.paint.push("_output.push(jsxbox." + paintOpen + "(" + _jsxpaintprofile + ",this));");
    } else {
      functionBuilder.paint.push("_output.push(" + _jsxboxprofile + "[\"" + strRBoxId + "\"]." + paintOpen + "(" + _jsxpaintprofile + ",this));");
    }
    functionBuilder.update.push("jsxbox = this.getBoxByName(\"" + strRBoxId + "\");");
    functionBuilder.paintchild.push("jsxbox = this.getBoxByName(\"" + strRBoxId + "\");");
    if(this._class._JSXFLUID) {
      functionBuilder.update.push("var " + strInputVariableNameG + " = (" + strInputVariableNameG + ") ? this.getRenderedBox(jsxbox.getName()," + strInputVariableNameG + ") : null;");
      if(intDepth == 0)
        functionBuilder.paintchild.push("var " + strInputVariableNameG + " = " + strPreputVariableNameG + ";");
      else
        functionBuilder.paintchild.push("var " + strInputVariableNameG + " = (" + strPreputVariableNameG + ") ? this.getRenderedBox(jsxbox.getName()," + strPreputVariableNameG + ") : null;");
    } else if(strForEachCounterName) {
      functionBuilder.update.push("var " + strInputVariableNameG + " = (" + strInputVariableNameG + ") ? jsx3.html.DOM.selectSingleElm(" + strInputVariableNameG + "," + strForEachCounterName + ") : null;");
    } else if(intMyChildIndex > -1) {
      functionBuilder.update.push("var " + strInputVariableNameG + " = (" + strInputVariableNameG + ") ? jsx3.html.DOM.selectSingleElm(" + strInputVariableNameG + ",\"" + intMyChildIndex + "\") : null;");
      functionBuilder.paintchild.push("var " + strInputVariableNameG + " = (" + strPreputVariableNameG + ") ? jsx3.html.DOM.selectSingleElm(" + strPreputVariableNameG + ",\"" + intMyChildIndex + "\") : null;");
    } else {
      functionBuilder.paintchild.push("var " + strInputVariableNameG + " = " + strPreputVariableNameG + ";");
    }
    functionBuilder.create.push("jsxbox = " + _jsxboxprofile + "[\"" + strRBoxId + "\"] = new jsx3.gui.Template.Box(\"" + strRBoxId + "\");");

    //query for the 'style' attribute and parse appropriately
    var strStyles = objNode.getAttribute("style");
    if(!jsx3.util.strEmpty(strStyles)) {
      strStyles = strStyles + "";
      //loop to add each dynamic style (IE needs the regexp declared anew each time its used.  There's definitely a bug with the ie regexp engine...)
      //If the following regexp is declared globally, it will eventually become corrupted and lose its starting index (it won't begin at the start of the string)
      var myReg = new RegExp("{([\\S]*?)}","g");
      while (myReg.exec(strStyles)) {
        functionBuilder.create.push("jsxbox." + addStyle + "(\"" + RegExp.$1 + "\");");
      }

      //set the static styles (anything not enclosed by "{}")
      functionBuilder.create.push("jsxbox." + setStaticStyles + "(\"" + strStyles.replace(jsx3.gui.Template._REG_REPVAR, "") + "\");");
    }

    //query for the attributes
    var objAtts = objNode.getAttributes();
    var strStaticAtts = "";
    for(var i=0;i<objAtts.size();i++) {
      var objAtt = objAtts.get(i);
      var strVal = objAtt.getValue();
      var strBaseName = objAtt.getBaseName();
      if(objAtt.getNamespaceURI() != Template.USERNAMESPACE && strBaseName != "style") {
        //just a regular attribute--handle like the styles node
        if(strVal.search(Template.REG_REPVAR) > -1) {
          //dynamic (this will be resolved via a replacement var in the 'Paintable Profile')
          var strRVName = RegExp.$1;
          if(strBaseName.match(Template.REG_EVENT))
            functionBuilder.create.push("jsxbox." + addEvent + "(\"" + strRVName + "\");");
          else
            functionBuilder.create.push("jsxbox." + addAttribute + "(\"" + strRVName + "\");");
        } else {
          //static (this will never change and will simply be concatenated)
          strStaticAtts += strBaseName + '="' + jsx3.util.strEscapeHTML(strVal) + '" ';
        }
      } else if(strBaseName == "id"){
        //the user namespace allows devlopers to tag an HTML node with a custom id without worrying whether the 'id' attribue will collide
        functionBuilder.create.push("jsxbox." + setName + "(\"" + jsx3.util.strEscapeHTML(strVal) + "\");");
        //also add the attribute as a 'jsxtype' attribute on the given box when rendered; this is reserved by the system and allows a box to find its corresponding on-screen HTML element
        strStaticAtts += 'jsxtype="' + jsx3.util.strEscapeHTML(strVal) + '" ';
      } else if(strBaseName == "protected"){
        //the user namespace allows devlopers to tag an HTML node with a custom id without worrying whether the 'id' attribue will collide
        functionBuilder.create.push("jsxbox." + setProtected + "(true);");
      }
    }
    functionBuilder.create.push("jsxbox." + setStaticAtts + "('" + strStaticAtts.replace("'","\\'") + "');");

    //if the box doesn't define a tagname boxproperty child, use the tagname for the node; make sure input nodes also include a 'type'
    if(!objNode.selectSingleNode("t:tagname",'xmlns:t="' + Template.NAMESPACE + '"')) {
      var strBase = objNode.getBaseName();
      if(strBase == "input") {
        var strType = objNode.getAttribute("type");
        strBase = "input[" + (!jsx3.util.strEmpty(strType) ? strType : "text") + "]";
      }
      functionBuilder.create.push("jsxbox.addProperty(\"tagname\",\"" + strBase + "\",false);");
    }

    //parse descendant content
    var iter = objNode.getChildIterator(false);
    //all box property nodes must be declared before declaring an additional control statement or another box.
    var bCompiled = false;
    var intBoxChildIndex = 0;
    while(iter.hasNext()) {
      var objCNode = iter.next();
      if(Template.BOX_PROPS.indexOf(objCNode.getBaseName()) > -1) {
        this._convertBoxPropertyNode(objCNode,functionBuilder);
      } else {
        //the dynamically-created createBoxProfile method is flat; given this, descendant boxes are actually rendered sequentially
        //(as if the hierarchy were unzipped and expanded to expose a depth-by-breadth traversal of the box dom)
        //rendering the compile statement here ensures that the 'Box Profile' drawspace will have been calculated before the first child
        //TODO: I hate this...it's too brittle; write the unioned xpath for this once I know all box properties and statements
        if(!bCompiled && objCNode.getBaseName() != "var") { //don't allow the var declaration to force a compilation...
          bCompiled = true;
          functionBuilder.create.push("jsxbox." + setNodeDepth + "(" + intDepth + ");");
          functionBuilder.create.push("jsxbox." + setNodePath + "(\"" + ((intMyChildIndex > -1) ? strPath + intMyChildIndex : "") + "\");");
          functionBuilder.create.push("var " + strOutputVariableName + " = jsxdrawspace = jsxbox.compile(" + strInputVariableName + ")." + getClientDrawspace + "();");
          functionBuilder.update.push("if((jsxcascade = jsxbox.recalculate(jsxdrawspace," + strInputVariableNameG + "," + _jsxforcecascade + ")) && (jsxcascade.w||jsxcascade.h||" + _jsxforcecascade + ")) {\nvar " + strOutputVariableNameG + " = " + strInputVariableNameG + ";");
          //'strOutputVariableName' is used to restore the drawspace when traversing back up a flattened DOM;
          functionBuilder.update.push("var " + strOutputVariableName + " = jsxbox." + getClientDrawspace + "();");
          //'jsxdrawspace' is the drawspace used by any immediate child boxes (assuming they exist)
          functionBuilder.update.push("var jsxdrawspace = jsxbox." + getClientDrawspace + "();");
          functionBuilder.dimensions.push("var " + strOutputVariableName + " = jsxdrawspace = " + _jsxboxprofile + "[\"" + strRBoxId + "\"]." + getClientDrawspace + "();");
        }
        if(Template.STATEMENTS.indexOf(objCNode.getBaseName()) > -1) {
          this._convertStatementNode(objCNode,functionBuilder,intDepth+1,intBoxChildIndex,((intMyChildIndex > -1) ? strPath + intMyChildIndex + "/" : ""));
        } else  {
          this._convertBoxNode(objCNode,functionBuilder,intDepth+1,intBoxChildIndex,((intMyChildIndex > -1) ? strPath + intMyChildIndex + "/" : ""));
          intBoxChildIndex++;
        }
      }
    }

    //make sure the box statement is compiled for the create template--this won't have happened if the object has no child boxes
    if(!bCompiled) {
      functionBuilder.create.push("jsxbox." + setNodeDepth + "(" + intDepth + ");");
      functionBuilder.create.push("jsxbox." + setNodePath + "(\"" + ((intMyChildIndex > -1) ? strPath + intMyChildIndex : "") + "\");");
      functionBuilder.create.push("var " + strOutputVariableName + " = jsxdrawspace = jsxbox.compile(" + strInputVariableName + ")." + getClientDrawspace + "();");
      functionBuilder.update.push("jsxbox.recalculate(jsxdrawspace," + strInputVariableNameG + "," + _jsxforcecascade + ");");
      //'strOutputVariableName' is used to restore the drawspace when traversing back up a flattened DOM;
      functionBuilder.update.push("var " + strOutputVariableName + " = jsxbox." + getClientDrawspace + "();");
      //'jsxdrawspace' is the drawspace used by any immediate child boxes (assuming they exist)
      functionBuilder.update.push("var jsxdrawspace = jsxbox." + getClientDrawspace + "();");
       functionBuilder.dimensions.push("var " + strOutputVariableName + " = jsxdrawspace = " + _jsxboxprofile + "[\"" + strRBoxId + "\"]." + getClientDrawspace + "();");
    } else {
      functionBuilder.update.push("}");
    }
    functionBuilder.create.push("var jsxdrawspace = " + strInputVariableName + ";");
    functionBuilder.update.push("var jsxdrawspace = jsx3.clone(" + strInputVariableName + ");"); //not sure why the need to clone.  Look at box.js to see if calculate clones first while recalculate doesn't
    functionBuilder.dimensions.push("var jsxdrawspace = " + strInputVariableName + ";");
    functionBuilder.update.push("var " + strInputVariableNameG + " = " + strPreputVariableNameG + ";");
    functionBuilder.paintchild.push("var " + strInputVariableNameG + " = " + strPreputVariableNameG + ";");

    //paint the closing html tag
    functionBuilder.paint.push("_output.push(" + _jsxboxprofile + "[\"" + strRBoxId + "\"]." + paintClose + "());");

/* @JSC :: begin BENCH */
    if (intDepth == 0)
      t1.log("compile.markup.cbn");
/* @JSC :: end */
  };


  /**
   * Converts a box property statement in the DM into the appropriate structure--a property on a box
   * @param objNode {jsx3.xml.Entity}
   * @param functionBuilder {Object}
   * @private
   */
  Template_prototype._convertBoxPropertyNode = function(objNode,functionBuilder) {
    var _jsxpaintprofile = "_jsxpaintprofile";
    var strName = objNode.getBaseName();
    var strVal = objNode.getValue();
    var bRepVar = false;
    var bRepVarDrawspace = false;
    var strRepVarName = false;
    var bTarget = false;
    if(strVal.indexOf("$$target") == 0) {
      strRepVarName = "\"$$target\"";
      //TODO: is this the way to escae in all regexp engines??
      strVal = strVal.replace(/\$\$target/g,_jsxpaintprofile + ".$$$$target");
      strVal =  _jsxpaintprofile + "." + strVal;
      bRepVar = true;
      bTarget = true;
      //TODO: fix by assigning different settings for create and paint (so no errors thrown); force text to be a string (be wrapped in quotes). -- assume everything is dynmamic and thereofre evaluated
    } else if (strVal.search(Template.REG_REPVAR) > -1) {
      strRepVarName = "\"" + RegExp.$1 + "\"";
      strVal = _jsxpaintprofile + "[" + strRepVarName + "]";
      bRepVar = true;
    } else {
      //TODO: do a safe replace (be more specific than $$)
      bRepVarDrawspace = strVal.search(/\$\$/) > -1;
      strVal = strVal.replace(/\$\$/g,"jsxdrawspace.");
    }
    //strAttValue.replace(/\$\$target/g,"jsxdrawspacetarget")

    var strQuote = (bRepVar || bRepVarDrawspace || strName.search(Template.REG_EVAL) == 0) ? "" : "\"";

    if(bRepVar || bRepVarDrawspace)
      functionBuilder.update.push("jsxbox.updateProperty(\"" + strName + "\"," + strQuote + strVal + strQuote+ "," + bRepVar + ",jsxdrawspace);");

    //possible values include: (width:180:false) or (height:$$parentheight:false) or (width:$width:true)
    if(!bTarget)
      functionBuilder.create.push("jsxbox.addProperty(\"" + strName + "\"," + strQuote + strVal + strQuote+ "," + strRepVarName + ");");
  };


  /**
    * Returns the unique node path for the given DM node, using its absolute node address. This is merely
    * used as an addressing scheme to ensure a unique ID. It is also useful for debugging
    * @param objNode {jsx3.xml.Entity} node in the schema to find the path for
    * @return {String} Path
    * @private
    */
  Template._getNodePath = function(objNode) {
    //get path collection
    var objNodes = objNode.selectNodes("ancestor-or-self::*");
    var maxLen = objNodes.size();

    var s1 = "";
    for (var i = 2; i < maxLen; i++) {
      var objCurNode = objNodes.get(i);

      //get the path query for this node (how its immediate parent would query for it
      var strQ = objCurNode.getNamespaceURI();
      var strName = objCurNode.getBaseName();
      var strQName = ((strQ != "") ? (objMap[strQ] + ":") : "") + strName;

      //append index info if this node is part of a collection, is an element, and not root
      var strIndex = "";
      if (i > 0 && objCurNode.getNodeType() == jsx3.xml.Entity.TYPEELEMENT) {
        var objCNodes = objNodes.get(i - 1).selectNodes(strQName, objMap);
        var intMax = objCNodes.size();

        for (var j = 1; j < intMax; j++)
          if (objCNodes.get(j).equals(objCurNode)) strIndex = "[" + (j + 1) + "]";
      }

      //concat query path
      s1 = s1 + "/" + strName + strIndex;
    }
    return s1;
  };


  /**
   * Returns a resolver set (an associative array which contains one or more named resolvers)
   * @param strId {String} If not provided, the global resolver set will be returned
   * @param-private bCreate {Boolean}
   * @return {Object}
   * @package
   */
  Template.getResolverSet = function(strId,bCreate) {
    if(!strId) strId = Template.GLOBAL_RESOLVER_ID;
    var objRS = Template.RESOLVERS[strId];
    if(!objRS && bCreate) {
      //create the given resolverset
      objRS = Template.RESOLVERS[strId] = {};
      //also create the corresponding 'trigger' set, since it's effectively the same:  an index of resolvers.
      if(!Template.TRIGGERS[strId])
        Template.TRIGGERS[strId] = {};
    }
    return objRS
  };

  /**
   * Adds a resolver to a given resolver set.
   * @param strSetId {String} If not provided, the global resolver ID will be used: jsx3.gui.Template
   * @param strResolverId {String} Unique ID for the resolver among all resolvers in this set
   * @param objResolver {Object} function handler. The resolver always executes in context of the instance being painted
   * @param META {Object} Extended configuration object with named properties:
   *        <ul><li>type (css (default)| attribute | event | box)</li>
   *        <li>repaintupdate (true | false (default))</li>
   *        <li>name (the name of the attribute or style (i.e., background-color))</li>
   *        <li>triggers (array of named triggers that will cause this resolver to update when called)</li>
   *        <li>defaultvalue (if the resovler function returns null, this value will be used)</li></ul>
   * @return {Object} Resolver object just created
   */
  Template.addResolver = function(strSetId,strResolverId,objResolver,META) {
    var objRS = this.getResolverSet(strSetId,true);
    var objR = objRS[strResolverId];
    if(!objR || objR && META.clobber) {
      LOG.trace("Adding Resolver, '" + (strSetId || Template.jsxclass.getName()) + "." + strResolverId + "'");

      objR = objRS[strResolverId] = objResolver;
      objR.resolverid = strResolverId;
      objR.type = (META.type) ? META.type : "css";
      if(META.defaultvalue)
        objR.defaultvalue = META.defaultvalue;
      if(META.triggers)
        objR.triggers = META.triggers;
      if(META.repaintupdate)
        objR.repaintupdate = true;
      if(META.name)
        objR._name = META.name;
    }
    return objR;
  };

  /**
   * Binds a specific function resolver to a named trigger. Triggers are class-specific. If a GUI class
   * registers with the Template controller, a Trigger-set is automatically created.  If
   * the given GUI class updates an instance property via a prototype method,
   * it can then tell the Template controller to update all replacement variables impacted
   * by the update.
   * @param strSetId {String} If not provided, the global resolver set will be used
   * @param strTriggerId {String} Unique ID for the trigger (for example, jsxbgcolor)
   * @param objResolver {Object} function handler
   * @see #syncProperty()
   * @private
   */
  Template._addTrigger = function(strSetId,strTriggerId,objResolver) {
    if(!strSetId)
      strSetId = Template.jsxclass.getName();
    LOG.trace("Adding Trigger: " + strSetId + ":" + strTriggerId + ":" + objResolver.resolverid);
    if(!Template.TRIGGERS[strSetId])
      Template.TRIGGERS[strSetId] = {};
    var objTrigger = Template.TRIGGERS[strSetId][strTriggerId];
    if(!objTrigger)
      objTrigger = Template.TRIGGERS[strSetId][strTriggerId] = [];
    objTrigger.push(objResolver);
  };


  /**
   * Adds a resolver library. A resolver library is a collection of one or more resolvers. Libraries allow resolvers belonging to different sets
   * to be organized into a related group. This simplifies how resolvers are grouped and used as they are shared among classes. Note that
   * a library is automatically created for each class that uses the template engine.  For example, if a GUI class named my.Example is
   * compiled by the template, a library will be created named my.Example.  Any other GUI class can now use every resolver made
   * available to my.Example, by importing this named library.
   * @param strLibraryId {String} The ID for this library.
   * @param arrLibrary {Array<Object>} An array of objects. Each object has the named properties: id, setid (optional if id is prefixed with a $).
   */
  Template.addLibrary = function(strLibraryId,arrLibrary) {
    Template.LIBRARIES[strLibraryId] = arrLibrary;
    var oLib = [];
    for(var i=0;i<arrLibrary.length;i++) {
      oLib.push((arrLibrary[i].setid || Template.GLOBAL_RESOLVER_ID) + "." + arrLibrary[i].id);
    }
    LOG.trace("Registering library, '" + strLibraryId + "', with indexed resolvers:\n\t\t\t\t\t" + oLib.join("\n\t\t\t\t\t"));
  };


  /**
   * Checks if the given library of resolvers exists
   * @param strLibraryId {String} For example, jsx3.gui.Block, $form, $position
   * @package
   */
  Template.getLibrary = function(strLibraryId) {
    return Template.LIBRARIES[strLibraryId];
  };


  /**
   * Returns the named resovler
   * @param strSetId {String} For example, jsx3.gui.Block
   * @param strResolverId {String}
   * @package
   */
  Template.getResolver = function(strSetId,strResolverId) {
    return Template.RESOLVERS[strSetId][strResolverId];
  };

  //   initialize the DEFAULT RESOLVERS and RESOLVER LIBRARIES

  //ADD the 'object' resolvers
  Template.addLibrary("$object",[{id:"$id"},{id:"$label"}]);
  Template.addResolver(null,"$id",new Function('return this._jsxid;'),{type:"att",name:"id",triggers:["jsxid"]});
  Template.addResolver(null,"$label",new Function('return this.jsxname;'),{type:"att",name:"label",triggers:["jsxname"]});

  //ADD the 'position' resolvers
  Template.addLibrary("$position",[{id:"$position"},{id:"$left"},{id:"$top"},{id:"$width"},{id:"$height"},{id:"$zindex"}]);
  Template.addResolver(null,"$position",new Function('var r = this.getRelativePosition(); return (r != 0 && (!r || r == jsx3.gui.Block.RELATIVE)) ? "relative" : "absolute";'),{type:"box",name:"position",triggers:["jsxrelativeposition"]});
  Template.addResolver(null,"$left",new Function('return !jsx3.util.strEmpty(this.jsxleft) ? this.jsxleft : null;'),{type:"box",name:"left",triggers:["jsxleft"]});
  Template.addResolver(null,"$top",new Function('return !jsx3.util.strEmpty(this.jsxtop) ? this.jsxtop : null;'),{type:"box",name:"top",triggers:["jsxtop"]});
  Template.addResolver(null,"$width",new Function('return !jsx3.util.strEmpty(this.jsxwidth) ? this.jsxwidth : null;'),{type:"box",name:"width",triggers:["jsxwidth"]});
  Template.addResolver(null,"$height",new Function('return !jsx3.util.strEmpty(this.jsxheight) ? this.jsxheight : null;'),{type:"box",name:"height",triggers:["jsxheight"]});
  Template.addResolver(null,"$zindex",new Function('return isNaN(this.jsxzindex) ? null : this.jsxzindex;'),{type:"css",name:"z-index",triggers:["jsxzindex"]});

  //ADD the 'font' resolvers (maybe force a $ prefix, since no namespace for the set?)
  Template.addLibrary("$font",[{id:"$color"},{id:"$fontname"},{id:"$fontsize"},{id:"$fontweight"}]);
  Template.addResolver(null,"$color",new Function('return this.jsxcolor;'),{type:"css",name:"color",triggers:["jsxcolor"]});
  Template.addResolver(null,"$fontname",new Function('return this.jsxfontname;'),{type:"css",name:"font-family",triggers:["jsxfontname"]});
  Template.addResolver(null,"$fontsize",new Function('var fs = parseInt(this.jsxfontsize);return isNaN(fs) ? null : fs + "px";'),{type:"css",name:"font-size",triggers:["jsxfontsize"]});
  Template.addResolver(null,"$fontweight",new Function('return this.jsxfontweight;'),{type:"css",name:"font-weight",triggers:["jsxfontweight"]});

  //ADD the 'css' resolvers
  Template.addLibrary("$css",[{id:"$display"},{id:"$visibility"},{id:"$styleoverride"},{id:"$style-group"},{id:"$classname"}]);
  Template.addResolver(null,"$display",new Function('var d = this.jsxdisplay; return (jsx3.util.strEmpty(d) || d == jsx3.gui.Block.DISPLAYBLOCK) ? null : "none";'),{type:"css",name:"display",triggers:["jsxdisplay"]});
  Template.addResolver(null,"$visibility",new Function('return (jsx3.util.strEmpty(this.jsxvisibility) || this.getVisibility() == jsx3.gui.Block.VISIBILITYVISIBLE) ? null : "hidden";'),{type:"css",name:"visibility",triggers:["jsxvisibility"]});
  Template.addResolver(null,"$styleoverride", new Function('return this.jsxstyleoverride;'),{type:"style-group",triggers:["jsxstyleoverride"]});
  Template.addResolver(null,"$style-group", new Function('return this.jsxstyleoverride;'),{type:"style-group",triggers:["jsxstyleoverride"]});
  Template.addResolver(null,"$classname", new Function('var cn = this.jsxclassname;var dcn = this.getClass().getConstructor().DEFAULTCLASSNAME || "";return dcn + (dcn && cn ? " " : "") + (cn ? cn : "");'),{type:"attribute",name:"class",triggers:["jsxclassname"]});

  //ADD the 'box' resolvers
  Template.addLibrary("$box",[{id:"$bgcolor"},{id:"$bg"},{id:"$padding"},{id:"$margin"},{id:"$border"},{id:"$textalign"},{id:"$overflow"},{id:"$attribute-group"}]);
  Template.addResolver(null,"$bgcolor",new Function('return this.jsxbgcolor;'),{type:"css",name:"background-color",triggers:["jsxbgcolor"]});
  Template.addResolver(null,"$bg",new Function('var bg = this.getBackground() || "";var bgc = "background-color:" + (jsx3.gui.Template.RESOLVERS["jsx3.gui.Template"]["$bgcolor"].apply(this) || "") + ";";return (bg + bgc).replace(/background(?:-color|-image|-repeat|-attachment|-position)?\\s*:\\s*([^;]*);/gi,"$1 ");'),{type:"css",name:"background",triggers:["jsxbgcolor","jsxbg"]});

  //TODO: provide default resolver that can handle the unique aspects of the IE filter...remember to add to the library when complete
  Template.addResolver(null,"$padding",new Function('return !jsx3.util.strEmpty(this.jsxpadding) ? this.jsxpadding : null;'),{type:"box",name:"padding",triggers:["jsxpadding"]});
  Template.addResolver(null,"$margin",new Function('return !jsx3.util.strEmpty(this.jsxmargin) ? this.jsxmargin : null;'),{type:"box",name:"margin",triggers:["jsxmargin"]});
  Template.addResolver(null,"$border",new Function('return !jsx3.util.strEmpty(this.jsxborder) ? this.jsxborder : null;'),{type:"box",name:"border",triggers:["jsxborder"]});
  Template.addResolver(null,"$textalign",new Function('return this.jsxtextalign;'),{type:"css",name:"text-align",triggers:["jsxtextalign"]});
  Template.addResolver(null,"$overflow",
    new Function('' +
      'if (this.getOverflow() == jsx3.gui.Block.OVERFLOWSCROLL) {' +
      '  return "auto";' +
      '} else if (this.getOverflow() == jsx3.gui.Block.OVERFLOWHIDDEN) {' +
      '  return "hidden";' +
      '} else {' +
      '  return;' +
      '}' +
    ''),{type:"css",name:"overflow",triggers:["jsxoverflow"]});
  Template.addResolver(null,"$attribute-group", new Function('return this.renderAttributes(null, true);'),{type:"attribute-group"});

  //ADD the 'block' resolvers
  Template.addLibrary("$block",[{id:"$tagname"},{id:"$text"}]);
  Template.addResolver(null,"$tagname",new Function('var tag;return ((tag = this.getTagName())) ? tag.toLowerCase() : jsx3.gui.Block.DEFAULTTAGNAME;'),{type:"box",name:"tagname",triggers:["jsxtagname"]});
  Template.addResolver(null,"$text",new Function('return this.jsxtext;'),{type:"box",name:"text",defaultvalue:"",triggers:["jsxtext"]});

  //ADD the 'accessibility' resolvers
  Template.addLibrary("$accessibility",[{id:"$index"},{id:"$jsxindex"},{id:"$tip"},{id:"$disabled"}]);
  Template.addResolver(null,"$index",new Function('return this.jsxindex;'),{type:"attribute",name:"tabindex",defaultvalue:"0",triggers:["jsxindex"]});
  Template.addResolver(null,"$jsxindex",new Function('return this.jsxindex;'),{type:"attribute",name:"jsxindex",defaultvalue:"0",triggers:["jsxindex"]});
  Template.addResolver(null,"$tip",new Function('return this.jsxtip;'),{type:"attribute",name:"title",triggers:["jsxtip"]});
  Template.addResolver(null,"$disabled",new Function('return !this.getEnabled || this.getEnabled() == 1 ? null : "disabled";'),{type:"attribute",name:"disabled",triggers:["jsxenabled"]});

  //Add the 'Event' handlers (standard handlers bridged by the system) -- NOTE: these same events are also added to the jsx3.gui.Form resolver set, since forms only render events when 'enabled'
  //while a regular control (non-form) renders all events that it has
  Template.addLibrary("$event",[{id:"$onblur"},{id:"$onchange"},{id:"$onclick"},{id:"$ondblclick"},{id:"$onfocus"},{id:"$onkeydown"},{id:"$onkeypress"},{id:"$onkeyup"},{id:"$onmousedown"},{id:"$onmousemove"},{id:"$onmouseout"},{id:"$onmouseover"},{id:"$onmouseup"},{id:"$onmousewheel"}]);
  for(var p in jsx3.gui.Interactive.BRIDGE_EVENTS_MAP)
    Template.addResolver(null,"$on"+p,new Function('return (!this.getEnabled || this.getEnabled() != 0) ? "on' + p + '" : null;'),{type:"event",name:"on"+p,triggers:["jsxenabled"]});

  //ADD the 'jsx3.gui.Form' resolvers --those related to the jsx3.gui.Form interface; add all resolovers to the resolver set, jsx3.gui.Form, so they don't clobber global resolvers of the same name
  Template.addLibrary("$form",[{setid:"jsx3.gui.Form",id:"$disabled_opacity"},{setid:"jsx3.gui.Form",id:"$onblur"},{setid:"jsx3.gui.Form",id:"$onchange"},{setid:"jsx3.gui.Form",id:"$onclick"},{setid:"jsx3.gui.Form",id:"$ondblclick"},{setid:"jsx3.gui.Form",id:"$onfocus"},{setid:"jsx3.gui.Form",id:"$onkeydown"},{setid:"jsx3.gui.Form",id:"$onkeypress"},{setid:"jsx3.gui.Form",id:"$onkeyup"},{setid:"jsx3.gui.Form",id:"$onmousedown"},{setid:"jsx3.gui.Form",id:"$onmousemove"},{setid:"jsx3.gui.Form",id:"$onmouseout"},{setid:"jsx3.gui.Form",id:"$onmouseover"},{setid:"jsx3.gui.Form",id:"$onmouseup"},{setid:"jsx3.gui.Form",id:"$onmousewheel"}]);
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
  Template.addResolver("jsx3.gui.Form","$disabled_opacity",new Function('if(this.getEnabled && this.getEnabled() == 0) {return jsx3.html.getCSSOpacity(.4).replace(";","").split(":")[1];}'),{type:"css",name:"filter",triggers:["jsxenabled"]});
/* @JSC */ } else if (jsx3.CLASS_LOADER.FX) {
  Template.addResolver("jsx3.gui.Form","$disabled_opacity",new Function('if(this.getEnabled && this.getEnabled() == 0) {return jsx3.html.getCSSOpacity(.4).replace(";","").split(":")[1];}'),{type:"css",name:"opacity",triggers:["jsxenabled"]});
/* @JSC */ } else {
  Template.addResolver("jsx3.gui.Form","$disabled_opacity",new Function('if(this.getEnabled && this.getEnabled() == 0) {return jsx3.html.getCSSOpacity(.4).replace(";","").split(":")[1];}'),{type:"css",name:"opacity",triggers:["jsxenabled"]});
/* @JSC */ }
  for(var p in jsx3.gui.Interactive.BRIDGE_EVENTS_MAP)
    Template.addResolver("jsx3.gui.Form","$on"+p,new Function('return (!this.getEnabled || this.getEnabled() != 0) ? "on' + p + '" : null;'),{type:"event",name:"on"+p,triggers:["jsxenabled"]});


});





/**
 * Provides an abstraction layer for the native browser Box model. Instances of this class represent an abstract view of the boxes used by a GUI object to render the native VIEW.
 *
 * @since 3.6
 * @package
 */

jsx3.Class.defineClass("jsx3.gui.Template.Box", jsx3.lang.Object, null, function(Box, Box_prototype) {

  var html = jsx3.html;

  //used to convert/parse a CSS string defining border, padding, and margin to a four-element array
  /** @private @jsxobf-clobber */
  Box.REGEX = /[^\d-]*([-]*[\d]*)[^\d-]*([-]*[\d]*)[^\d-]*([-]*[\d]*)[^\d-]*([-]*[\d]*)/;
  /** @private @jsxobf-clobber */
  Box.BREGEX = /\b(\d*)px/g;
  //list of all properties on the implicit object that will be converted to an explicit equivalent
  /** @private @jsxobf-clobber */
  Box._PROPERTIES = ['tagname','position','margin','padding','border','left','top','width','height','empty','container','text'];
  /** @private @jsxobf-clobber */
  Box._RECALC_FIELDS = ['border','padding','margin','position','left','top','width','height'];
  /** @private @jsxobf-clobber */
  Box._PROPS_SETTER = {width: "_addPropWidth", height: "_addPropHeight", top: "_addPropTop", left: "_addPropLeft",
    padding: "_addPropPadding", border: "_addPropBorder", margin: "_addPropMargin", tagname: "_addPropTagname"};

  //order (clockwise) of css position (border-left, padding-left, margin-left, *-left, etc)
  /** @private @jsxobf-clobber */
  Box.COMPASS = ["top","right","bottom","left"];
  /** @private @jsxobf-clobber */
  Box.SCROLL_SIZE = null;

  //standards-compliant browsers do not like to give structure (l,t,w,h) to relative boxes (spans, etc); this fixes to allow for GIs layout system

  /* @JSC */
  if (jsx3.CLASS_LOADER.SAF) {
    /** @private @jsxobf-clobber */
    Box._CSS_FIXES = ["", "display:inline-block;", "", "display:inline-block;"];
    /* @JSC */
  } else if (jsx3.CLASS_LOADER.IE) {
    if (html.getMode() == html.MODE_FF_QUIRKS) // IE10 quirks (not IE10 in IE5 quirks) simulates Firefox quirks
    /** @private @jsxobf-clobber */
      Box._CSS_FIXES = ["", "display:inline-block;", "display:inline-block;", ""];
    else
    /** @private @jsxobf-clobber */
    Box._CSS_FIXES = ["", "", "display:inline-block;", ""];
    /* @JSC */
  } else {
    if (jsx3.CLASS_LOADER.FX && jsx3.CLASS_LOADER.getVersion() >= 3)
    /** @private @jsxobf-clobber */
      Box._CSS_FIXES = ["", "display:inline-block;", "", "display:inline-block;"];
    else
      Box._CSS_FIXES = ["", "display:-moz-inline-box;", "", "display:-moz-inline-box;"];
    /* @JSC */
  }

  // These static strings improve performance on IE6. The obfuscator currently would make these string literals static
  // anyway. However, leaving them here improves painting performance in the uncompiled build.
  /** @private @jsxobf-clobber */
  Box._str = {pad:"padding", mar:"margin", e:"", box:"box", zpx:"0px", str:"string", num:"number", obj:"object",
    pct:"%", semi:";", px:"px", pxs:"px;", pxc:"px ", c:":", rbox:"relativebox", bor:"border"};
  /** @private @jsxobf-clobber */
  Box._stm = {hph:{height:1, parentheight:1}, wpw:{width:1, parentwidth:1}, bpm:{border:1,padding:1,margin:1}};
  /** @private @jsxobf-clobber */
  Box._pa = ['<', ' ', 'width:', 'height:', '"/>', '">', 'left:0px', 'left:', 'top:0px', 'top:', 'position:absolute;',
      ' style="', 'position:relative;', '</', '>', ''];

  /** @package */
  Box.getCssFix = function() {
    return Box._CSS_FIXES[html.getMode()];
  };

  /* @jsxobf-clobber */
  Box_prototype._lastbordervalue = "";
  /* @jsxobf-clobber */
  Box_prototype._lastmarginvalue = "";
  /* @jsxobf-clobber */
  Box_prototype._lastpaddingvalue = "";
  /* @jsxobf-clobber */
  Box_prototype._new = true;

  Box_prototype.styles = "";
  Box_prototype.attributes = "";

  /**
   * instance initializer
   */
  Box_prototype.init = function() {
    //index (hash) of all named replacement variables used by this box; to determine if a given repvar is used, call implements
    this.rvimplicit = {};

    //holds all implicit values  -- those implicit box propery values that accept numbers will be evaluated:  left, top, width, height, parentwidth, parentheight
    this.implicit = {};

    //these hold the different replacement variable types: events, styles (css), and attributes
    this.style = [];
    this.attribute = [];
    this.event = [];

    //list of all replacement variables implemented by the box.  Allows for quick scan to see how a given repvar update should be applied
    this.allvars = {};

    //create the explicit object (specific to each browser type)
    this._expl = new Box._Expl();

    //whether or not this node is protected
    this._protected = false;
  };


  Box_prototype.reset = function() {
    this._new = true;
  };


  /**
   * Returns true if the given replacement variable is implemented by this box instance
   * @param strVarName {String} Replacement variable name
   * @return {Boolean}
   * @private
   */
  Box_prototype.doesImplement = function(strVarName) {
    return this.rvimplicit[strVarName] == 1 || typeof(this.allvars[strVarName]) != "undefined";
  };


  /**
   * Call to convert the implicit object to the explicit object
   * @param objDrawspace {Object} Drawspace token that will provide context to the box instance when it renders
   * <ul>
   * <li><b>tagname</b>: div, span, input[text], input[password], textarea, etc</li>
   * <li><b>parentwidth</b>: true drawspace that this object must live within.</li>
   * <li><b>parentheight</b>: true drawspace that this object must live within.</li>
   * <li><b>left</b>: Pixel or percentage</li>
   * <li><b>top</b>: Pixel or percentage</li>
   * <li><b>width</b>: pixel or percentage</li>
   * <li><b>height</b>: pixel or percentage</li>
   * <li><b>border</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>padding</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>margin</b>: To use, this value applies to inline, rightfloatbox and leftfloatbox. must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>empty</b>: Boolean, if true, the generated tag will be empty. For example, &lt;br/&gt; instead of &lt;br&gt;&lt;/br&gt;</li>
   * <li><b>container</b>: Boolean, if true, the object is a 100%x100% HTML element (preferably a div), used to contain other objects, but not used for textual display.</li>
   * </ul>
   * @return {jsx3.gui.Template.Box} This instance
   * @package
   */
  Box_prototype.compile = function(objDrawspace) {
    //override any values on the implicit object with those mandated by the drawspace (the drawspace sent by the parent box always takes precedence)
    for (var p in objDrawspace)
      this.implicit[p] = objDrawspace[p];

    //create the explicit object
    this.calculate();

    //cache the drawspace
    this._jsxdrawspace = jsx3.clone(objDrawspace);

    //return ref to self
    return this;
  };


  /**
   * Returns the cached drawspace token for this box instance.  If this is the root-most box used by a given class to
   * draw its HTML, this token will match the cached drawspace token owned by the class instance.
   */
  Box_prototype.getDrawspace = function() {
    return this._jsxdrawspace;
  };


  /**
   * Returns the client drawspace token for this box instance.
   * @private
   */
  Box_prototype.getClientDrawspace = function() {
    return {parentwidth:this.getClientWidth(),parentheight:this.getClientHeight()};//this._jsxclientdrawspace;
  };


  /**
   * Call to add an implicit property
   * @param strName {String} named implicit box property (width, parentwidth, etc)
   * @param vntValue {int | String} the value of the implicit property; or if a replacement variable is used, the name of that variable (the resolver name)
   * @param strRepVarName {String} if present, the value is not static and should be derived by querying the  paintable model for the appropriate repvar
   * @private
   */
  Box_prototype.addProperty = function(strName, vntValue, strRepVarName) {
    if (strRepVarName)
      this.rvimplicit[strRepVarName] = 1;

    this.implicit[strName] = vntValue;

    if(strName == "text")
      this.rvtext = strRepVarName || "jsxnull";
  };


  /**
   * Call to update the drawspace with a calculated value.
   * @param strName {String} named implicit box property (width, parentwidth, etc)
   * @param vntValue {int | String} the value of the implicit property; or if a replacement variable is used, the name of that variable (the resolver name)
   * @param bRepVar {Boolean} if true, the value is not static and should be derived by querying the  paintable model for the appropriate repvar
   * @param objDrawspace {Object} drawspace object; if the value exists on the drawspace, it cannot be replaced, since the drawspace always takes
   * precedence over any implicit property declaration
   */
  Box_prototype.updateProperty = function(strName, vntValue, bRepVar, objDrawspace) {
    //the drawspace is passed by reference; modify here, within this function; eventually the same drawspace object will
    //be passed to 'recalculate' where all affected deltas will be applied
    if(typeof(objDrawspace[strName]) == "undefined")
      objDrawspace[strName] = vntValue;
  };


  /**
   * Returns all styles (dynamic, static, and style-group) encapsulated in a valid HTML style attribute tag
   * @return {String}
   */
  Box_prototype.paintStyles = function(pm,objInstance) {
    //if(!this._cachedStyles) {
      var a = [];
      var strVal;
      //get the library of all resolvers used by the given class (this library contains the resolvers as well as meta-info like names, values and types)
      var objLib = jsx3.gui.Template.getLibrary(objInstance.getClass().getName());
      for (var i = 0; i < this.style.length; i++) {
        strVal = pm[this.style[i]];
        if(strVal != null) {
          var fnResolver = jsx3.gui.Template.RESOLVERS[objLib[this.style[i]].setid][objLib[this.style[i]].id];
          a.push(fnResolver._name + ":" + strVal);
        }
      }
      this._cachedStyles = a.join(";") + ";" + (this.implicit["style-group"] ? this.implicit["style-group"] : "");
    //}
    return this._cachedStyles;
  };


  /**
   * Returns all attributes (dynamic, static, and attribtue-group) encapsulated in a valid HTML style attribute tag
   * @return {String}
   * @private
   */
  Box_prototype.paintAttributes = function(pm,objInstance) {
    //if(!this._cachedAtts) {
      var a = [];
      var strVal;
      //get the library of all resolvers used by the given class (this library contains the resolvers as well as meta-info like names, values and types)
      var objLib = jsx3.gui.Template.LIBRARIES[objInstance.getClass().getName()];

      for (var i = 0; i < this.attribute.length; i++) {
        strVal = pm[this.attribute[i]];
        if(strVal != null) {
          var fnResolver = jsx3.gui.Template.RESOLVERS[objLib[this.attribute[i]].setid][objLib[this.attribute[i]].id];
          a.push(fnResolver._name + "=\"" + strVal + "\" ");
        }
      }
      this._cachedAtts = a.join("");
    //}
    return this._cachedAtts;
  };


  /**
   * Returns all dynamically declared events (those in the DM)
   * @return {String}
   * @private
   */
  Box_prototype.paintEvents = function(pm,objInstance) {
    //if(!this._cachedEvents) {
      var a = [];
      var strVal;
      //get the library of all resolvers used by the given class (this library contains the resolvers as well as meta-info like names, values and types)
      var objLib = jsx3.gui.Template.LIBRARIES[objInstance.getClass().getName()];

      for (var i = 0; i < this.event.length; i++) {
        strVal = pm[this.event[i]];
        if(strVal != null) {
          var fnResolver = jsx3.gui.Template.RESOLVERS[objLib[this.event[i]].setid][objLib[this.event[i]].id];
          a.push(fnResolver._name + "=\"" + Box.renderHandler(strVal,this.getNodeDepth()) + "\" ");
        }
      }
      this._cachedEvents = a.join("");
    //}
    return this._cachedEvents;
  };


  /**
   * Returns the text content.  An input like a textbox would not use this, since they contain no text...
   * @return {String}
   * @private
   */
  Box_prototype.paintText = function(pm,objInstance) {
    return pm[this.rvtext] || this.implicit.text || "";
  };


  /**
   * Renders a bridged handler -- standard method for capturing user input and routing to the given GUI class's correspondingly named handler ( a prototype method on the class)
   * @param strMethod {String} The name of the instance method on the class of which objJSX is an instance
   * @param intDepth {int} how deep from the root box will the event be placed
   * @return {String}
   * @private
   */
  Box.renderHandler = function(strMethod,intDepth) {
    return intDepth != null ?
      "jsx3." + jsx3.gui.Interactive._EB + "(event,this,'" + strMethod + "'," + intDepth + ");" :
      "jsx3.GO(this.id)." + jsx3.gui.Interactive._BRIDGE + "(event,this,'" + strMethod + "');";
  };


  /**
   * Renturns the native view for this box
   * @param objRoot {HTMLElement} HTML element that this element is a descendant of
   * @return {HTMLElement}
   * @private
   */
  Box_prototype.getRendered = function(objRoot) {
     return html.DOM.selectSingleElm(objRoot,this.getNodePath());
  };


  /**
   * Sets ths CSS style declaration on an element. The following properties are not supported and MAY NOT be included in the declaration: position, left, top, width, height, padding, margin, border, float, clear
   * @param styles {String} valid style declaration containing one or more name/value pairs. For example, <code>color:red;background-color:yellow;font-size:12px;</code>
   * @private
   */
  Box_prototype.setStaticStyles = function(styles) {
    this.styles = styles;
  };

  /**
   * Adds a named replacement variable to the 'style' array. Any replacement variable in this array is serialized as a css style delcaration
   * @param strVarName {String} The name of the replacement variable
   * @private
   */
  Box_prototype.addStyle = function(strVarName) {
    this.style.push(strVarName);
    //lets the system know that the given replacement variable is implemented by this box (as a style)
    this.allvars[strVarName] = "style";
  };

  /**
   * Sets the named attribute (attributes appear on the native HTML tag as a name/value pair)
   * @param atts {String} a string of attributes to place on the native HTML tag.  For example: <code>id="25" type="RADIO" class="abc def ghi"</code>
   * @private
   */
  Box_prototype.setStaticAtts = function(atts) {
    this.attributes = atts;
  };

  /**
   * Adds a named replacement variable to the 'attribute' array. Any replacement variable in this array is serialized as an HTML attribute
   * @param strVarName {String} The name of the replacement variable
   * @private
   */
  Box_prototype.addAttribute = function(strVarName) {
    this.attribute.push(strVarName);
    //lets the system know that the given replacement variable is implemented by this box (as an attribute)
    this.allvars[strVarName] = "attribute";
  };


  /**
   * Adds a named event replacement variable to the 'attribute' array. Any replacement variable in this array is serialized as an HTML attribute
   * @param strVarName {String} The name of the replacement variable
   * @private
   */
  Box_prototype.addEvent = function(strVarName) {
    this.event.push(strVarName);
    //lets the system know that the given replacement variable is implemented by this box (as an attribute)
    this.allvars[strVarName] = "event";
  };


  /**
   * Sets the depth of this node (box) in relation to its root box
   * @param intDepth {int} For example: the root box is 0, its children are 1, its grandchildren are 2, etc.
   * @private
   */
  Box_prototype.setNodeDepth = function(intDepth) {
    this.jsxnodedepth = intDepth;
  };


  /**
   * Returns the depth of this node (box) in relation to its root box
   * @return {int}
   * @private
   */
  Box_prototype.getNodeDepth = function() {
    return this.jsxnodedepth || 0;
  };


  /**
   * Sets the node path to access this node in relation to the parent box of the box group that this box belongs to.
   * @param strPath {String} For example 0/1/3/0
   * @private
   */
  Box_prototype.setNodePath = function(strPath) {
    this.jsxnodepath = strPath;
  };


  /**
   * Returns the node path to access this node in relation to the parent box of the box group that this box belongs to.
   * @return {String}
   * @private
   */
  Box_prototype.getNodePath = function() {
    return this.jsxnodepath;
  };


  /**
   * Returns how the given replacement variable is implemented (as a 'style' or 'attribute'). If not implemented, null is returned.
   * @param strVarName {String} the named replacement variable
   * @return {String}
   * @private
   */
  Box_prototype.getImplementation = function(strVarName) {
    return this.allvars[strVarName];
  };

  /**
   * Gets the developer-assigned name for this box.
   * @return {String}
   * @private
   */
  Box_prototype.getName = function() {
    return this._name;
  };


  /**
   * Sets the developer-assigned name for this box.  This is used to locate the box once painted on-screen.
   * The name apears on the rendered HTML tag under the custom attribute, jsxtype. This name must be unique
   * among all named boxes used by a single class.  For example, if a DatePicker uses four boxes to render
   * its on-screen structure, each of these boxes must implement a unique name.
   * @param strName {String}
   * @private
   */
  Box_prototype.setName = function(strName) {
    this._name = strName
  };


  /**
   * If true, the on-screen node represented by this box instance will not be targeted by the template engine
   * during resize updates
   * @param bProtected {Boolean}
   * @private
   */
  Box_prototype.setProtected = function(bProtected) {
    this._protected = bProtected;
  };


  /**
   * Paints the opening tag
   * @param pm {Object} paintable model (the hash of replacement variables)
   * @return {String}
   * @package
   */
  Box_prototype.paintOpen = function(pm,objInstance) {
    return this.paint(pm,objInstance)[0];
  };


  /**
   * Paints the closing tag
   * @return {String}
   * @package
   */
  Box_prototype.paintClose = function() {
    return (this._expl.empty) ? Box._pa[15] : Box._pa[13] + this._expl.tagname + Box._pa[14];
  };


  /**
   * Paints the HTML opening and closing tags
   * @param pm {Object} The paintable model (hash of replacement variables)
   * @return {Array} 2-item array with the beginning/ending tags
   * @private
   */
  Box_prototype.paint = function(pm,objInstance) {
    this._new = false;
    //declare array to hold return structure (a start tag and an end tag)
    var a = new Array(2);

    //create the common prefix
    var commonPrefix = Box._pa[0] + this._expl.tagname + Box._pa[1] + this.attributes;

    //only output width/height if explicitly set; don't allow for negative values as they imply a null dimension, causing liquid constraints to break
    var myWidth = this.getPaintedWidth();
    myWidth = myWidth != null ? Box._pa[2] + Math.max(0, myWidth) + Box._str.pxs : Box._str.e;
    var myHeight = this.getPaintedHeight();
    myHeight = myHeight != null ? Box._pa[3] + Math.max(0, myHeight) + Box._str.pxs : Box._str.e;

    //the dynamic styles and the static styles merged together
    var locStyle = this.paintStyles(pm,objInstance) + this.styles;
    var locAtts = this.paintAttributes(pm,objInstance);
    var locEvts = this.paintEvents(pm,objInstance);
    //TODO: not sure, but probably need to account for replacement variable when painting the text -- don't treat statically
    var locText = this.paintText(pm,objInstance);

    var endTag = (this._expl.empty) ? Box._pa[4] : Box._pa[5];
    var position = this.implicit.position;

    if (position == "absolute") {
      var myLeft = this._expl.left;
      myLeft = myLeft == null ? Box._pa[6] : Box._pa[7] + myLeft + Box._str.pxs;
      var myTop = this._expl.top;
      myTop = myTop == null ? Box._pa[8] : Box._pa[9] + myTop + Box._str.pxs;
      //var position = this.implicit.omitpos ? Box._str.e : Box._pa[10];
      position = "position:absolute;"

      a[0] = commonPrefix + locAtts + locEvts + Box._pa[11] + position + myWidth + myHeight + myLeft + myTop + this.paintPadding() +
             this.paintBorder() + locStyle + endTag + locText;
    } else if (this.implicit.tagname == "inlinebox") {
      position = "position:relative;"
      a[0] = commonPrefix + locAtts + locEvts + Box._pa[11] + position + this._getCSSFix() + myWidth + myHeight + this.paintPadding() +
             this.paintMargin() + this.paintBorder() + locStyle + endTag + locText;
    } else {
      //resolve nulls
      var myLeft = this._expl.left;
      myLeft = myLeft == null ? Box._str.e : Box._pa[7] + myLeft + Box._str.pxs;
      var myTop = this._expl.top;
      myTop = myTop == null ? Box._str.e : Box._pa[9] + myTop + Box._str.pxs;
      position = this._protected ? "" : "position:relative;";

      a[0] = commonPrefix + locAtts + locEvts + Box._pa[11] + position + myWidth + myHeight + myLeft + myTop + this.paintPadding() +
             this.paintMargin() + this.paintBorder() + locStyle + endTag + locText;
    }

    a[1] = (this._expl.empty) ? Box._pa[15] : Box._pa[13] + this._expl.tagname + Box._pa[14];
    return a;
  };


  /**
   * Returns the declaration for the css <b>display</b> property appropriate to the given browser mode.  For example: <code>display:-moz-inline-box;</code>
   * @return {String}
   * @private
   * @jsxobf-clobber
   */
  Box_prototype._getCSSFix = function() {
    //when a 100%x100% html element is relatively positioned in firefox, it corrupts the -moz-inline display setting. In such cases, remove it, since it is really only needed to give structure to a span and/or relatively positioned object
    return (this._expl.container &&
            (html.getMode() == html.MODE_FF_STRICT || html.getMode() == html.MODE_FF_QUIRKS)) ?
           Box._str.e : Box.getCssFix();
  };

  /** @private @jsxobf-clobber */
  Box_prototype._isParentIndependent = function() {
    //TODO: optimize by setting when the box is first initialized
    return false;
  };

  Box._RECALC_VALS = [[[[{n:1},{h:1}],[{w:1},{w:1,h:1}]],[[{t:1},{t:1,h:1}],[{t:1,w:1},{t:1,w:1,h:1}]]],
      [[[{l:1},{l:1,h:1}],[{l:1,w:1},{l:1,w:1,h:1}]],[[{l:1,t:1},{l:1,t:1,h:1}],[{l:1,t:1,w:1},{l:1,t:1,w:1,h:1,a:1}]]]];

  /**
   * Recalculates the explicit object based upon the implicit drawspace. Persists both on the object
   * @param objDrawspace {Object} Implicit map that will be used to create the explicit drawspace object. Since this is an update to an existing drawspace, only those properties that have changed need to be passed:
   * <ul>
   * <li><b>tagname</b>: div, span, input[text], input[password], textarea, etc</li>
   * <li><b>parentwidth</b>: clientWidth of box within which this drawspace will render its box.</li>
   * <li><b>parentheight</b>: clientHeight of box within which this drawspace will render its box.</li>
   * <li><b>left</b>: Pixel or percentage</li>
   * <li><b>top</b>: Pixel or percentage</li>
   * <li><b>width</b>: pixel or percentage</li>
   * <li><b>height</b>: pixel or percentage</li>
   * <li><b>border</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>padding</b>: To use, this value must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>margin</b>: To use, this value applies to inline, rightfloatbox and leftfloatbox. must provide four compass positions in clockwise order (top, right, bottom, left)</li>
   * <li><b>empty</b>: Boolean, if true, the generated tag will be empty. For example, &lt;br/&gt; instead of &lt;br&gt;&lt;/br&gt;</li>
   * <li><b>container</b>: Boolean, if true, the object is a 100%x100% HTML element (preferably a div), used to contain other objects, but not used for textual display.</li>
   * </ul>
   * @return {Boolean} true if a delta to the calculated box's dimensions
   * @param objGUI {HTMLElement} on-screen element
   * @param bCascade {Boolean} if true, force an update
   * @package
   */
  Box_prototype.recalculate = function(objDrawspace, objGUI, bCascade) {
    //bCascade can be 0, 1, or true.  If true, every delta will update, if 1, only dimensions will update (not text), if 0, only deltas update
    var bUpdate = this._new;
    var l = 0, t = 0, w = 0, h = 0;
    var bor = 0, pad = 0;

    // apply deltas to the implicit object
    for (var p in objDrawspace) {
      if (bCascade || this.implicit[p] != objDrawspace[p]) {
        this.implicit[p] = objDrawspace[p];
        bUpdate = true;

        if (!w && Box._stm.wpw[p])
          w = 1;
        if (!h && Box._stm.hph[p])
          h = 1;
        if (p == "border")
          bor = 1;
        else if (p == "padding")
          pad = 1;
        else if(p == "text" && bCascade !== 1) {
          //only update text if the udpate happened through normal channels. if forcCascade is true, it means the update is positional, so text updates do not apply
          //the spec for text content is that it must be the first child node of 'objGUI'
          if(false && objGUI && objGUI.childNodes.length && objGUI.childNodes[0].nodeType == 3) {
            objGUI.childNodes[0].nodeValue = this.implicit[p];
          } else if(false && objGUI && objGUI.childNodes.length) {
            html.insertAdjacentHTML(objGUI.childNodes[0],"beforebegin",this.implicit[p]);
          } else if(objGUI) {
            objGUI.innerHTML = this.implicit[p];
          }
        }
      }
    }

    //if a delta occurred to the model for this box, attempt to apply this to the view ('protected' instances still update text (which happens above),but do not allow for positional updates)
    if (bUpdate && !this._protected) {
      // recalculate (convert implicit to explicit)
      this.calculate(Box._RECALC_FIELDS);
      if (objGUI) {
        var objStyle = objGUI.style;

        // left and top can be negative, but not null
        // TODO: use the explicit?? probably doesn't matter since relative is default
        if (this.implicit.position == "absolute") {
          if (objStyle.position != "absolute")
            objStyle.position = "absolute";

          if (this._expl.left != null && this._expl.top != null) {
            if (parseInt(objStyle.left) != this._expl.left) {
              objStyle.left = this._expl.left + Box._str.px;
              l = 1;
            }
            if (parseInt(objStyle.top) != this._expl.top) {
              objStyle.top = this._expl.top + Box._str.px;
              t = 1;
            }
          }
          if(!jsx3.util.strEmpty(objStyle.margin))
            objStyle.margin = "";
        } else {
          //was the change the result of modifying the position from absolute to relative?
          if (objDrawspace.position == "relative") {
            if(objStyle.position != "relative")
              objStyle.position = "relative";
            //if the box is an inline box, add the brower-appropriate CSS fix to make sure it renders as such
            //if the box is already set to not display (display:none), ignore for now. When the box is eventually
            //toggled so that its display is (display:;), the apropriate method will be called to make the udpate at that time.
            if(this.implicit.tagname == "inlinebox" && objStyle.display != "none")
              html.DOM.setStyles(objGUI,this._getCSSFix());
          }
          if(objStyle.margin != this.paintMargin())
            html.DOM.setStyles(objGUI, this.paintMargin() == "" ? "margin:;" : this.paintMargin());
          if (parseInt(objStyle.left))
            objStyle.left = "";
          if (parseInt(objStyle.top))
            objStyle.top = "";
        }

        // if the token says this is a positional move, then only left/top is affected. skip width/height
        if (objDrawspace.parentheight != null || objDrawspace.parentwidth != null ||
            objDrawspace.width != null || objDrawspace.height != null) {

          var myWidth = this.getPaintedWidth();
          var myHeight = this.getPaintedHeight();

          if (myWidth != null && parseInt(objStyle.width) != myWidth) {
            objStyle.width = Math.max(0, myWidth) + Box._str.px;
            w = 1;
          } else {
            w = 0;
          }

          if (myHeight != null && parseInt(objStyle.height) != myHeight) {
            objStyle.height = Math.max(0, myHeight) + Box._str.px;
            h = 1;
          } else {
            h = 0;
          }

          //3.6 new: make sure to cache the self- and client-drawspace (allows child boxes to get the getDrawspace) after a valid update
          this._jsxdrawspace = jsx3.clone(objDrawspace);
        }

        //1) updates to border and padding (but not margin) should force a cascade, since they affect width/height of the client drawspace
        //2) if the property was modified, but that modification was the REMOVAL of the property, pass an empty declaration, so 'setStyles' knows what to remove
        if (bor) {
          html.DOM.setStyles(objGUI, this.paintBorder() == "" ? "border:;" : this.paintBorder());
          w=1;
          h=1;
        }
        if (pad) {
          html.DOM.setStyles(objGUI, this.paintPadding() == "" ? "padding:;" : this.paintPadding());
          w=1;
          h=1;
        }
      }
    }

    //jsx3.log("recalculate " + bUpdate + " " + (objGUI ? (objGUI.id + " " + jsx3.GO(objGUI.id)) : "-") + " " + [l,t,w,h].join(","));
    this._new = false;

    // return information on what was changed
    return Box._RECALC_VALS[l][t][w][h];
  };

  /* @jsxobf-clobber */
  Box._LT_PROPS = {left:1, top:1};

  /* @jsxobf-clobber */
  Box._Expl = function() {
  };
  Box._Expl.prototype = {padding:"", margin:"", border:"", bwidth:0, bheight:0, btop:0, bleft:0,
    pwidth:0, pheight:0, ptop:0, pleft:0};

  /**
   * Loops through the properties in the implicit object to convert to explicit values
   * @private
   */
  Box_prototype.calculate = function(arrFields) {
    if (!arrFields) arrFields = Box._PROPERTIES;

    //recreate the explicit value object (the true dimensions--not the abstraction(implied) provided by the developer)
    if (! this._expl) this._expl = new Box._Expl();
    var newBox = this._expl;

    //convert user-implied vlaues to explicit values used by the painter/resizer
    for (var i = 0; i < arrFields.length; i++) {
      var pname = arrFields[i];
      var pvalue = this.implicit[pname];

      if (Box._LT_PROPS[pname] && (pvalue == null || pvalue == Box._str.e) && this.implicit.position == "absolute") {
        newBox[pname] = 0;
      } else {
        var setter = Box._PROPS_SETTER[pname];
        if (setter) {
          if (pvalue === Box._str.e) pvalue = null;
          this[setter](pvalue);
        } else {
          this._expl[pname] = pvalue;
        }
      }
    }
  };

  /**
   * Registers a server instance with the box profiler, allowing sizing information and, if applicable, resize subscriptions
   * @param server {jsx3.app.Server} server instance to register
   * @param bLiquid {Boolean} if true, the server will be subscribed to the window resize event
   * @package
   */
  Box.registerServer = function(server, bLiquid) {
    if (bLiquid)
      jsx3.gui.Event.subscribe(jsx3.gui.Event.RESIZE, server, "onResize");
  };

  /**
   * Unsubscribes the server from the window.onresize event (if applicable)
   * @param server {jsx3.app.Server} server instance to register
   * @param bLiquid {Boolean} if true, the server will be unsubscribed to the window resize event
   * @package
   */
  Box.unregisterServer = function(server, bLiquid) {
    if (bLiquid)
      jsx3.gui.Event.unsubscribe(jsx3.gui.Event.RESIZE, server, "onResize");
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropWidth = function(value) {
    if (value == null) {
      this._expl.width = this._expl.clientwidth = null;
    } else {
      if (typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0)
        value = Math.round(this.implicit.parentwidth * parseInt(value) / 100);
      else
        value = Number(value);
      this._expl.width = value;
      this._expl.clientwidth = Math.max(0, value - this._expl.pwidth - this._expl.bwidth);
    }
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropHeight = function(value) {
    if (value == null) {
      this._expl.height = this._expl.clientheight = null;
    } else {
      if (typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0)
        value = Math.round(this.implicit.parentheight * parseInt(value) / 100);
      else
        value = Number(value);
      this._expl.height = value;
      this._expl.clientheight = Math.max(0, value - this._expl.pheight - this._expl.bheight);
    }
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropLeft = function(value) {
    this._expl.left = typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0 ?
                      Math.round(this.implicit.parentwidth * parseInt(value) / 100) : (value == null ? (this.implicit.position == "absolute" ? 0 : value) : Number(value));
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropTop = function(value) {
    this._expl.top = typeof(value) == Box._str.str && value.indexOf(Box._str.pct) >= 0 ?
                     Math.round(this.implicit.parentheight * parseInt(value) / 100) : (value == null ? (this.implicit.position == "absolute" ? 0 : value) : Number(value));
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropTagname = function(value) {
    if (value == "inlinebox") {
      this._expl.tagname = "span";
    } else if (value == null) {
      this._expl.tagname = value;
      this._expl.type = value;
    } else if (value.search(/input\[(\S*)\]/i) > -1) {
      //derive password and textbox types
      this._expl.tagname = "input";
      this._expl.type = RegExp.$1.toLowerCase();
    } else {
      this._expl.tagname = value;
    }
  };


  /** @private @jsxobf-clobber */
  Box_prototype._addPropBorder = function(value) {
    if (value == null) value = Box._str.e;

    // this is expensive, so cache the value
    if (this._lastbordervalue === value)
      return;
    this._lastbordervalue = value;

    var arrBorder = null, arrWidth = null;

    /* @JSC :: begin DEP */
    if (typeof(value) == Box._str.str && value.indexOf(":") >= 0) {
      var cssFix = Box.cssBorderToJsx(value);
      if (typeof(cssFix) != Box._str.obj) // error condition
        arrBorder = cssFix.split(Box._str.semi);
    } else {
      /* @JSC :: end */
      value = value.replace(/(^[;\s]*)|([;\s]*$)/g, Box._str.e);
      if (value !== Box._str.e)
        arrBorder = value.split(Box._str.semi);
      /* @JSC :: begin DEP */
    }
    /* @JSC :: end */

    if (arrBorder && arrBorder.length > 1) {
      var bSame = true;
      for (var i = 0; bSame && i < arrBorder.length - 1 && i < 3; i++) {
        if (arrBorder[i] != arrBorder[i + 1])
          bSame = false;
      }
      if (bSame) arrBorder.splice(1, arrBorder.length);
    }

    if (!arrBorder) {
      arrWidth = [0, 0, 0, 0];
    } else if (arrBorder.length == 1) {
      var match = arrBorder[0].match(Box.BREGEX);
      var width = match ? parseInt(match[0]) : 0;
      if (isNaN(width)) width = 0;
      arrWidth = [width, width, width, width];
    } else {
      arrWidth = [];
      for (var i = 0; i < 4; i++) {
        var match = arrBorder[i].match(Box.BREGEX);
        var width = match ? parseInt(match[0]) : 0;
        if (isNaN(width)) width = 0;
        arrWidth[i] = width;
      }
    }

    this._expl.bwidth = arrWidth[1] + arrWidth[3];
    this._expl.bheight = arrWidth[0] + arrWidth[2];
    this._expl.bleft = arrWidth[3];
    this._expl.btop = arrWidth[0];

    if (arrBorder) {
      for (var i = 0; i < arrBorder.length; i++) {
        if (arrBorder[i].indexOf("pseudo") >= 0)
          arrBorder[i] = Box._str.e;
      }
    }

    if (arrBorder == null) {
      this._expl.border = Box._str.e;
    } else if (arrBorder.length == 1) {
      this._expl.border = arrBorder[0] ? Box._str.bor + Box._str.c + (arrWidth[0] > 0 ? arrBorder[0] : Box._str.zpx) + Box._str.semi : Box._str.e;
    } else if (arrBorder.length == 4) {
      this._expl.border =
      (arrBorder[0] ? "border-top:" + (arrWidth[0] > 0 ? arrBorder[0] : Box._str.zpx) + Box._str.semi : Box._str.e) +
      (arrBorder[1] ? "border-right:" + (arrWidth[1] > 0 ? arrBorder[1] : Box._str.zpx) + Box._str.semi : Box._str.e) +
      (arrBorder[2] ? "border-bottom:" + (arrWidth[2] > 0 ? arrBorder[2] : Box._str.zpx) + Box._str.semi : Box._str.e) +
      (arrBorder[3] ? "border-left:" + (arrWidth[3] > 0 ? arrBorder[3] : Box._str.zpx) + Box._str.semi : Box._str.e);
    }

    //    jsx3.log("_addPropBorder  " + value + " -> " + this._expl.border);
    return this;
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropMargin = function(value) {
    if (value == null) value = Box._str.e;

    // this is expensive, so cache the value
    if (this._lastmarginvalue === value)
      return;
    this._lastmarginvalue = value;

    var arrWidth = null;

    /* @JSC :: begin DEP */
    if (typeof(value) == Box._str.str && value.indexOf(":") > -1) {
      //old css syntax is probably being used; convert
      var cssFix = Box.cssToJsx(value, Box._str.mar);
      if (typeof(cssFix) != Box._str.obj) // error condition
      //convert the implied string to a parsed equivalent (creates a 5 element array)
        arrWidth = cssFix.match(Box.REGEX);
    } else {
      /* @JSC :: end */
      if (typeof(value) == Box._str.num) {
        arrWidth = [value];
      } else {
        value = jsx3.util.strTrim(String(value));

        if (value !== Box._str.e) {
          if (isNaN(value))
            arrWidth = value.match(Box.REGEX);
          else
            arrWidth = [Number(value)];
        }
      }
      /* @JSC :: begin DEP */
    }
    /* @JSC :: end */

    if (arrWidth == null)
      this._expl.margin = Box._str.e;
    else if (arrWidth.length == 1)
      this._expl.margin = Box._str.mar + Box._str.c + arrWidth[0] + Box._str.pxs;
    else
      this._expl.margin = Box._str.mar + Box._str.c + arrWidth[1] + Box._str.pxc + arrWidth[2] + Box._str.pxc +
                          arrWidth[3] + Box._str.pxc + arrWidth[4] + Box._str.pxs;

    //    jsx3.log("_addPropMargin  " + value + " -> " + arrWidth + " -> " + this._expl.margin);
  };

  /** @private @jsxobf-clobber */
  Box_prototype._addPropPadding = function(value) {
    if (value == null) value = Box._str.e;

    // this is expensive, so cache the value
    if (this._lastpaddingvalue === value)
      return;
    this._lastpaddingvalue = value;

    var arrWidth = null;

    /* @JSC :: begin DEP */
    if (typeof(value) == Box._str.str && value.indexOf(":") > -1) {
      //old css syntax is probably being used; convert
      var cssFix = Box.cssToJsx(value, Box._str.pad);
      if (typeof(cssFix) != Box._str.obj) // error condition
      //convert the implied string to a parsed equivalent (creates a 5 element array)
        arrWidth = cssFix.match(Box.REGEX);
    } else {
      /* @JSC :: end */
      if (typeof(value) == Box._str.num) {
        arrWidth = [value];
      } else {
        value = jsx3.util.strTrim(String(value));

        if (value !== Box._str.e) {
          if (isNaN(value))
            arrWidth = value.match(Box.REGEX);
          else
            arrWidth = [Number(value)];
        }
      }
      /* @JSC :: begin DEP */
    }
    /* @JSC :: end */

    var arrInt = null;

    if (arrWidth == null) {
      arrInt = [0, 0, 0, 0];
      this._expl.padding = Box._str.e;
    } else if (arrWidth.length == 1) {
      var w = arrWidth[0];
      arrInt = [w, w, w, w];
      this._expl.padding = Box._str.pad + Box._str.c + w + Box._str.pxs;
    } else {
      arrInt = [];
      for (var i = 1; i < 5; i++) {
        var w = parseInt(arrWidth[i]);
        if (isNaN(w)) w = 0;
        arrInt[i - 1] = w;
      }
      this._expl.padding = Box._str.pad + Box._str.c + arrInt[0] + Box._str.pxc + arrInt[1] + Box._str.pxc +
                           arrInt[2] + Box._str.pxc + arrInt[3] + Box._str.pxs;
    }

    this._expl.pwidth = arrInt[1] + arrInt[3];
    this._expl.pheight = arrInt[0] + arrInt[2];
    this._expl.ptop = arrInt[0];
    this._expl.pleft = arrInt[3];
  };

  /**
   * Returns an inline box that floats inline with existing content. This box can specify a width and height.
   * @param objProfile {Object} JavaScript object representing a class in a pseudo-compiled state that can be used by the box painter
   * @return {String} DHTML
   */
  Box_prototype.addChildProfile = function(objProfile) {
    var c = this._children;
    if (!c) c = this._children = [];
    c[c.length] = objProfile;
  };

  /**
   * Returns the child profile instance
   * @param intIndex {Number} index of child profile to return (zero-based array)
   * @return {String} DHTML
   */
  Box_prototype.getChildProfile = function(intIndex) {
    return this._children ? this._children[intIndex] : null;
  };

  /**
   * Returns the pixel offset between the inner edge of the parent and the outer edge of the client. (Accounts for border and padding)
   * @return {int}
   */
  Box_prototype.getClientLeft = function() {
    return this._expl.bleft + this._expl.pleft;
  };

  /**
   * Returns the pixel offset between the inner edge of the parent and the outer edge of the client. (Accounts for border and padding)
   * @return {int}
   */
  Box_prototype.getClientTop = function() {
    return this._expl.btop + this._expl.ptop;
  };

  /**
   * Returns the true client width (where content will reside) for the control. When creating a child profile, call this method to get the value for the 'parentwidth' property for the new child
   * @return {int}
   */
  Box_prototype.getClientWidth = function() {
    return this._expl.clientwidth;
  };

  /**
   * Returns the true client height (where content will reside) for the control. When creating a child profile, call this method to get the value for the 'parentheight' property for the new child
   * @return {int}
   */
  Box_prototype.getClientHeight = function() {
    return this._expl.clientheight;
  };

  /**
   * Returns the offset width for the profile.
   * @return {int}
   * @package
   */
  Box_prototype.getOffsetWidth = function() {
    return this._expl.width;
  };

  /**
   * Returns the offset height for the profile.
   * @return {int}
   * @package
   */
  Box_prototype.getOffsetHeight = function() {
    return this._expl.height;
  };

  /** @package */
  Box.getBorderWidth = function(strCSSBorder) {
    //a bit expensive...but basically converts any arbitrary CSS border (CSS2 or GI format) and then returns the total width
    //make a package method for now--in case I change my mind about its usefulness--it may be a shortcoming in the box profile...
    return (new Box())._addPropBorder(strCSSBorder)._expl.bwidth;
  };

  /** @package */
  Box.getBorderHeight = function(strCSSBorder) {
    return (new Box())._addPropBorder(strCSSBorder)._expl.bheight;
  };

  /**
   * Returns the width required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * NOTE:  getPaintedWidth and getPaintedHeight have extra logic to factor out various form-field inputs. However, getClientHeight/getClientWidth are the
   *        recommended methods for getting the true drawspace (the box less padding, margin, border) per a given environment
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedWidth = function() {
    var type = this._expl.type;
    var mode = html.getMode();
    var val = mode == html.MODE_IE_QUIRKS ||
              ((type == "text" || type == "password" || this._expl.tagname == "textarea") && mode == html.MODE_FF_QUIRKS) ?
              this._expl.width : this._expl.clientwidth;
    return val === Box._str.e || isNaN(val) ? null : val;
  };

  /**
   * Returns the height required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedHeight = function() {
    var type = this._expl.type;
    var mode = html.getMode();
    var val = mode == html.MODE_IE_QUIRKS ||
              ((type == "text" || type == "password" || this._expl.tagname == "textarea") && mode == html.MODE_FF_QUIRKS) ?
              this._expl.height : this._expl.clientheight;
    return val === Box._str.e || isNaN(val) ? null : val;
  };

  /**
   * Returns the left required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedLeft = function() {
    return this._expl.left;
  };

  /**
   * Returns the top required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.getPaintedTop = function() {
    return this._expl.top;
  };

  /**
   * Returns the CSS string for the margin
   * @return {int}
   * @private
   */
  Box_prototype.paintMargin = function() {
    return this._expl.margin || Box._str.e;
  };

  /**
   * Returns the top required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.paintPadding = function() {
    return this._expl.padding || Box._str.e;
  };

  /**
   * Returns the top required by the boxpainter specific to the browser (IE/FFX) and mode (quirks/strict)
   * @return {int}
   * @private
   */
  Box_prototype.paintBorder = function() {
    return this._expl.border || Box._str.e;
  };

  /**
   * Returns the first document body in the document
   * @return {HTMLElement} first document body in the document
   * @private
   */
  Box.getBody = function() {
    return document.getElementsByTagName("body")[0];
  };

  /**
   * Returns the size of a standard scrollbar
   * @param objServerContainer {HTMLElement} HTML element that will contain a given GI server instance
   * @return {int}
   * @private
   */
  Box.getScrollSize = function(objServerContainer) {
    if (Box.SCROLL_SIZE == null) {
      //use the server container to paint the mode-test objects
      var objBody = objServerContainer || Box.getBody();

      //create div in order to determine scrollsize
      var test0 = '<div id="_jsx3_html_scr" class="jsx30block" style="padding:0px;margin:0px;border-width:0px;position:absolute;width:100px;height:100px;left:-100px;top:-100px;overflow:scroll;">&#160;</div>';
      html.insertAdjacentHTML(objBody, "beforeEnd", test0);
      var box0 = document.getElementById("_jsx3_html_scr");
      Box.SCROLL_SIZE = 100 - parseInt(box0.clientWidth);
      objBody.removeChild(box0);
    }
    return Box.SCROLL_SIZE;
  };

  /**
   * When overflow is set to 'scroll' or 'auto', accounts for the scrollbar structure itself,
   * @param strCSS {String} one of: scroll, auto
   * @return {int}
   * @private
   */
  Box.getScrollSizeOffset = function(strCSS) {
    var intSize = Box.getScrollSize();
    return html.getScrollSizeOffset(intSize, strCSS);
  };

  /* @JSC :: begin DEP */

  /** @private @jsxobf-clobber */
  Box.cssToJsx = function(strInput, cssEl) {
    var output = "not matched";
    var top = "0";
    var right = "0";
    var bottom = "0";
    var left = "0";
    var rePadding = /(\s*(padding|padding-top|padding-right|padding-bottom|padding-left)\s*:\s*(\d+)(px)?\s*((\d+)(px)?)?\s*((\d+)(px)?)?\s*((\d+)(px)?)?\s*;)+/ig;
    var reMargin = /(\s*(margin|margin-top|margin-right|margin-bottom|margin-left)\s*:\s*(-*\d+)(px)?\s*((-*\d+)(px)?)?\s*((-*\d+)(px)?)?\s*((-*\d+)(px)?)?\s*;)+/ig;
    var re = (cssEl == Box._str.pad) ? rePadding : reMargin;
    var splited = strInput.split(Box._str.semi);

    if (splited) {
      for (var i = 0; i < splited.length; i++) {
        // By spliting the rule semicolon is removed, also add it again
        var singlematched = splited[i] + Box._str.semi;
        // the index of matching should begin at index 0
        var searched = singlematched.search(re);
        if (searched > 0) {
          return {desc: "Missing Semicolon", cause: splited[i]};
        } else if (searched == -1) {
          // String dose not matche the regular expression
          if (splited[i].search(/[^\s*]/i) >= 0) {
            return {desc: "Mismatch Rule", cause: splited[i]};
          }
        } else {
          output = singlematched.replace(re,
              function($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) {
                if ($3.match(/-top/)) {
                  top = ($4 == null) ? "0" : $4;
                }
                else if ($3.match(/-right/)) {
                  right = ($4 == null) ? "0" : $4;
                }
                else if ($3.match(/-bottom/)) {
                  bottom = ($4 == null) ? "0" : $4;
                }
                else if ($3.match(/-left/)) {
                  left = ($4 == null) ? "0" : $4;
                }
                else {
                  top = jsx3.util.strEmpty($4) ? "0" : $4;
                  right = jsx3.util.strEmpty($7) ? top : $7;
                  bottom = jsx3.util.strEmpty($10) ? top : $10;
                  left = jsx3.util.strEmpty($13) ? right : $13;
                }
                return top + " " + right + " " + bottom + " " + left;
              });
          output = top + " " + right + " " + bottom + " " + left;
        }
      }
    }//if
    return output;
  };

  //regexp used to convert a css border definition to the format used by GI. This allows GI to calculate the border width
  var myRegBTW = /border(?:(?:-top(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBTC = /border(?:(?:-top(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBTS = /border(?:(?:-top(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;
  var myRegBRW = /border(?:(?:-right(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBRC = /border(?:(?:-right(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBRS = /border(?:(?:-right(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;
  var myRegBBW = /border(?:(?:-bottom(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBBC = /border(?:(?:-bottom(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBBS = /border(?:(?:-bottom(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;
  var myRegBLW = /border(?:(?:-left(?:-width)?)|(?:-width))?:[^0-9]*([0-9]*)px/gi;
  var myRegBLC = /border(?:(?:-left(?:-color)?)|(?:-color))?:[^;]*((?:#[a-zA-Z0-9]{6})|(?:rgb\s*\(\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\))|(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenrod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|Goldenrod|Gray|Green|GreenYellow|Honeydew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCora|LightCyan|LightGoldenrodYellow|LightGreen|LightGrey|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlu|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquamarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenrod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|Seashell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen))/gi;
  var myRegBLS = /border(?:(?:-left(?:-style)?)|(?:-style))?:[^;]*(dashed|dotted|double|groove|hidden|inset|none|outset|ridge|solid)/gi;

  /** @private @jsxobf-clobber */
  Box.cssBorderToJsx = function(myCSS) {
    var objBorder = {top:{width:0,color:"",style:""},right:{width:0,color:"",style:""},bottom:{width:0,color:"",style:""},left:{width:0,color:"",style:""}};

    //top
    while (myRegBTW.exec(myCSS))
      objBorder.top.width = RegExp.$1;
    while (myRegBTC.exec(myCSS))
      objBorder.top.color = RegExp.$1;
    while (myRegBTS.exec(myCSS))
      objBorder.top.style = RegExp.$1;

    //right
    while (myRegBRW.exec(myCSS))
      objBorder.right.width = RegExp.$1;
    while (myRegBRC.exec(myCSS))
      objBorder.right.color = RegExp.$1;
    while (myRegBRS.exec(myCSS))
      objBorder.right.style = RegExp.$1;

    //bottom
    while (myRegBBW.exec(myCSS))
      objBorder.bottom.width = RegExp.$1;
    while (myRegBBC.exec(myCSS))
      objBorder.bottom.color = RegExp.$1;
    while (myRegBBS.exec(myCSS))
      objBorder.bottom.style = RegExp.$1;

    //left
    while (myRegBLW.exec(myCSS))
      objBorder.left.width = RegExp.$1;
    while (myRegBLC.exec(myCSS))
      objBorder.left.color = RegExp.$1;
    while (myRegBLS.exec(myCSS))
      objBorder.left.style = RegExp.$1;


    return objBorder.top.width + Box._str.pxc + objBorder.top.style + " " + objBorder.top.color + Box._str.semi +
           objBorder.right.width + Box._str.pxc + objBorder.right.style + " " + objBorder.right.color + Box._str.semi +
           objBorder.bottom.width + Box._str.pxc + objBorder.bottom.style + " " + objBorder.bottom.color + Box._str.semi +
           objBorder.left.width + Box._str.pxc + objBorder.left.style + " " + objBorder.left.color;
  };

  /* @JSC :: end */

  /**
   * toString
   * @return {int}
   */
  Box_prototype.toString = function() {
    var s = "IMPLICIT:\n";
    for (var p in this.implicit) s += p + ": " + this.implicit[p] + "\n";
    s += "\nEXPLICIT:\n";
    for (var p in this._expl) s += p + ": " + this._expl[p] + "\n";
    return s;
  };

});



/**
 * Provides base class for creating custom GUI classes.  Example usage:
 * <p><pre>
 * //step 1) require the template engine (and all used interfaces)
 * jsx3.require("jsx3.gui.Template");
 * &#160;
 * //step 2) define the new class
 * jsx3.lang.Class.defineClass(
 *   "my.custom.Widget",            //fully qualified name
 *   jsx3.gui.Template.Block,       //super class
 *   [],                            //interface(s)
 *   function(WIDGET, widget) {     //class alias, prototype alias
 *     &#160;
 *     //step 3) define the init method
 *     widget.init = function(strName) {
 *       this.jsxsuper(strName);
 *     };
 *     &#160;
 *     //step 4) define the MODEL defaults
 *     WIDGET.XYZ = 'xyz';          //CLASS defaults
 *     widget.xyz = 'xyz';          //prototype defaults
 *     &#160;
 *     //step 5) define the VIEW template
 *     widget.getTemplateXML = function() {
 *      return ['&lt;transform version="1.0" ' ,
 *      '  xmlns="http://gi.tibco.com/transform/" ' ,
 *      '  xmlns:u="http://gi.tibco.com/transform/user"&gt;' ,
 *      '  &lt;template&gt;' ,
 *      '    &lt;div onclick="{onclick}" ' ,
 *      '      style="position:{$position};left:{$left};background:{bg|red};"&gt;' ,
 *      '      &lt;text&gt;{mytext|some default text}&lt;/text&gt;' ,
 *      '    &lt;/div&gt;' ,
 *      '  &lt;/template&gt;' ,
 *      '&lt;/transform&gt;'].join("");
 *     };
 *     &#160;
 *     //6) define the CONTROLLER methods
 *     widget.onclick = function(objEvent, objGUI) {
 *       //show random information
 *       alert(objEvent.clientX() + objGUI.id + WIDGET.XYZ + this.bg);
 *     };
 *     &#160;
 *     widget.setBG = function(strBG) {
 *       this.setProperty("bg",strBG);
 *     };
 *     &#160;
 *     widget.setText = function(strText) {
 *       this.setProperty("mytext",strText);
 *     };
 *     &#160;
 * });
 * </pre></p>
 * @since 3.6
 */
jsx3.Class.defineClass("jsx3.gui.Template.Block", jsx3.gui.Block, null, function(Block, Block_prototype) {

  var html = jsx3.html;

  //alias frequently-used classes
  var Template = jsx3.gui.Template;
  var LOG = jsx3.util.Logger.getLogger(Block.jsxclass.getName());
  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;

  /**
   * instance initializer
   */
  Block_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight) {
    this._initClassTemplate();
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight);
  };


  Block_prototype.onAfterAssemble = function(objParent, objServer) {
    this._initClassTemplate();
    this.jsxsuper(objParent,objServer);
  };


  Block_prototype._initClassTemplate = function() {
    var objClass = this.getClass();
    if(!objClass._JSXTEMPLATE_INITED) {
      objClass._JSXTEMPLATE_INITED = true;
      var strTemplate = this.getTemplateXML();
      if(!jsx3.util.strEmpty(strTemplate))
        jsx3.gui.Template.compile(strTemplate,objClass.getConstructor().jsxclass);
    }
  };


  /**
   * Returns the XML template definition for the class. When authoring your own GUI class, this method
   * should return the XML for the transormation template.
   * @return {String | jsx3.xml.Document} a string of XML or an instance of jsx3.xml.Document
   *
   */
  Block_prototype.getTemplateXML = function() {
    return ['',
    '<transform xmlns="http://gi.tibco.com/transform/" xmlns:u="http://gi.tibco.com/transform/user" version="1.0">' ,
    '  <template>' ,
    '    <inlinebox style="position:{$position};left:{$left};top:{$top};width:{$width};height:{$height};padding:{$padding};margin:{$margin};background:{$bg};background-color:{$bgcolor};display:{$display};overflow:{$overflow};visibility:{$visibility};border:{$border}">',
    '      <attach select="new jsx3.util.List(this.getChildren()).iterator()"/>' ,
    '    </inlinebox>' ,
    '  </template>' ,
    '</transform>'].join("");
  };


  Block_prototype.setFontName = function(strFontName,bUpdateView) {
    this.jsxfontname = strFontName;
    this.syncProperty("jsxfontname",bUpdateView == true);
    return this;
  };

  Block_prototype.setFontSize = function(intPixelSize,bUpdateView) {
    this.jsxfontsize = intPixelSize;
    this.syncProperty("jsxfontsize",bUpdateView == true);
    return this;
  };

  Block_prototype.setFontWeight = function(strFontWeight,bUpdateView) {
    this.jsxfontweight = strFontWeight;
    this.syncProperty("jsxfontweight",bUpdateView == true);
    return this;
  };

  Block_prototype.setColor = function(strColor,bUpdateView) {
    this.jsxcolor = strColor;
    this.syncProperty("jsxcolor",bUpdateView == true);
    return this;
  };

  Block_prototype.setBackgroundColor = function(strColor,bUpdateView) {
    this.jsxbgcolor = strColor;
    if(jsx3.gui.Template.getLibrary(this.getClass().getName())) {
      this.syncProperty("jsxbgcolor",bUpdateView == true);
    } else {
      if (bUpdateView) this.updateGUI("backgroundColor",(strColor==jsx3.gui.Block.NULLSTYLE) ? "" : strColor);
    }
    return this;
  };

  Block_prototype.setBackground = function(strBG,bUpdateView) {
    /* background-color  background-image   background-repeat   background-attachment   background-position */
    /* red               url(logo_16.gif)   no-repeat           scroll | fixed          top right           */
    this.jsxbg = strBG;
    this.syncProperty(["jsxbg","jsxbgcolor"],bUpdateView == true);
    return this;
  };

  Block_prototype.setCSSOverride = function(strCSS,bUpdateView) {
    this.jsxstyleoverride = strCSS;
    this.syncProperty("jsxstyleoverride",bUpdateView == true);
    return this;
  };

  Block_prototype.setZIndex = function(intIndex,bUpdateView) {
    this.jsxzindex = intIndex;
    this.syncProperty("jsxzindex",bUpdateView == true);
    return this;
  };

  Block_prototype.setRelativePosition = function(intRelative, bUpdateView) {
    if (this.jsxrelativeposition != intRelative) {
      this.jsxrelativeposition = intRelative;
      this.syncProperty("jsxrelativeposition",bUpdateView == true);
    }
    return this;
  };

  Block_prototype.setLeft = function(POSITION, bUpdateView) {
    this.jsxleft = POSITION;
    this.syncProperty("jsxleft",bUpdateView == true);
    return this;
  };

  Block_prototype.setTop = function(POSITION, bUpdateView) {
    this.jsxtop = POSITION;
    this.syncProperty("jsxtop",bUpdateView == true);
    return this;
  };

  Block_prototype.setWidth = function(POSITION, bUpdateView) {
    this.jsxwidth = POSITION;
    this.syncProperty("jsxwidth",bUpdateView == true);
    return this;
  };

  Block_prototype.setHeight = function(POSITION, bUpdateView) {
    this.jsxheight = POSITION;
    this.syncProperty("jsxheight",bUpdateView == true);
    return this;
  };

  Block_prototype.setMargin = function(strCSS,bUpdateView) {
    this.jsxmargin = strCSS;
    this.syncProperty("jsxmargin",bUpdateView == true);
    return this;
  };

  Block_prototype.setPadding = function(strCSS,bUpdateView) {
    this.jsxpadding = strCSS;
    this.syncProperty("jsxpadding",bUpdateView == true);
    return this;
  };

  Block_prototype.setBorder = function(strCSS,bUpdateView) {
    this.jsxborder = strCSS;
    this.syncProperty("jsxborder",bUpdateView == true);
    return this;
  };

  Block_prototype.setEnabled = function(intEnabled, bRepaint) {
    if (this.jsxenabled != intEnabled) {
      this.jsxenabled = intEnabled;
      //LUKE: fix this in 4.0 to not do a full repaint. unnecessary. leave for now for backwards compatibility
      this.syncProperty("jsxenabled", false);
      if (bRepaint)
        this.repaint();
    }
    return this;
  };

  Block_prototype.setDisabledBackgroundColor = function(strColor, bUpdateView) {
    this.jsxdisabledbgcolor = strColor;
    this.syncProperty("jsxdisabledbgcolor",bUpdateView == true);
    return this;
  };

  Block_prototype.setDisabledColor = function(strColor, bUpdateView) {
    this.jsxdisabledcolor = strColor;
    this.syncProperty("jsxdisabledcolor",bUpdateView == true);
    return this;
  };

  Block_prototype.setTip = function(strTip) {
    this.jsxtip = strTip;
    this.syncProperty("jsxtip",true);
    return this;
  };

  Block_prototype.setIndex = function(intIndex, bUpdateView) {
    this.jsxindex = intIndex;
    this.syncProperty("jsxindex",bUpdateView == true);
    return this;
  };

  Block_prototype.setDimensions = function(left, top, width, height, bUpdateView) {
    var propsToSynch = [];
    if (jsx3.$A.is(left)) {
      bUpdateView = top;
      height = left[3];
      width = left[2];
      top = left[1];
      left = left[0];
    }

    if (left != null) {
      this.jsxleft = left;
      propsToSynch.push("jsxleft");
    }

    if (top != null) {
      this.jsxtop = top;
      propsToSynch.push("jsxtop");
    }

    if (width != null) {
      this.jsxwidth = width;
      propsToSynch.push("jsxwidth");
    }

    if (height != null) {
      this.jsxheight = height;
      propsToSynch.push("jsxheight");
    }

    //legacy methods like setDimensions assume that 'true' must be passed to trigger an update...fix in 4.0 release to default the update
    this.syncProperty(propsToSynch,bUpdateView == true?this.getDrawspace():false);
  };

  Block_prototype.setText = function(strText, bUpdateView) {
    this.jsxtext = strText;
    this.syncProperty("jsxtext",bUpdateView == true);
    return this;
  };

  Block_prototype.setDisplay = function(DISPLAY, bUpdateView) {
    //3.7: added the setDisplay method
    this.jsxdisplay = DISPLAY;
    this.syncProperty("jsxdisplay",bUpdateView == true);
    return this;
  };

  Block_prototype.setVisibility = function(VISIBILITY, bUpdateView) {
    //3.7: added the setVisibility method
    this.jsxvisibility = VISIBILITY;
    this.syncProperty("jsxvisibility",bUpdateView == true);
    return this;
  };

  Block_prototype.setClassName = function(strClass, bUpdateView) {
    //3.7: added the setClassName method
    this.jsxclassname = strClass;
    this.syncProperty("jsxclassname",bUpdateView == true);
    return this;
  };

  Block_prototype._applyId = function(strNS) {
    //3.7: if a class has a paint profile already, make sure to synchronize the assignment of the jsxid value, so it is painted
    this.jsxsuper(strNS);
    if(this.hasPaintProfile())
      this.syncProperty("jsxid");
  };

  Block_prototype.paint = function() {
    //the existing paint method for the given GUI class will be replaced with this method.  This method will then hand
    //off processing to _paint (a dynamically created method that is based upon the declarative markup for the given class).
    var s = this.onbeforepaint();
    if(typeof(s) == "string")
      return s;
    //get the cached drawspace (it will be synchronously resolved if not already cached)
    var _jsxdrawspace = this.getDrawspace();
    var _jsxpaintprofile = this.getPaintProfile();
    var _jsxboxprofile = this.getBoxProfile(true,_jsxdrawspace,true);
    //3.7: allow for recalc tag to designate that the template have its dimensions adjusted; do so before painting, so no flicker
    if(this.getClass()._JSXRECALC)
      this.forceSyncBoxProfile(_jsxdrawspace,false,1);
    s = this._paint(_jsxpaintprofile,_jsxboxprofile);
    this.onpaint();
    return s;
  };


  /**
   * Forces the template engine to recalculate the box profile for the instance.  This updates both the cached model and the on-scren view.
   * Note that authoring a template with the attribute, <code>recalc="true"</code>, will cause <code>realc</code> to be called each time
   * the instance is painted. This means the following two template statements are equivalent:
   * <p><pre>
   * &lt;template recalc="true"&gt;...&lt;/template&gt;
   * - or -
   * &lt;template onpaint="this.recalc()"&gt;...&lt;/template&gt;
   * </pre></p>
   */
  Block_prototype.recalc = function() {
    if(this.getClass()._JSXRECALC) {
      this.forceSyncBoxProfile(this.getDrawspace(),this.getRendered(),1);
    }
  };


  /** @package */
  Block_prototype.getCachedClientDimensions = function(strId) {
    //return null;
    //TODO: remove conditional in production--zero-based index no longer used in 3.6
    if(isNaN(strId)) {
      var x = this._jsxcachedclientdims ? this._jsxcachedclientdims[strId] : null;
      return x ? jsx3.clone(x) : x;
    } else {
      var objC = this.getChild(strId);
      if(objC)
        return this._jsxcachedclientdims ? this._jsxcachedclientdims[objC.getId()] : null;
    }
  };

  /** @package */
  Block_prototype.setCachedClientDimensions = function(strId, objDim) {
    if(!(this.getChild(strId) instanceof jsx3.app.Model.Loading)) {
      if (! this._jsxcachedclientdims)
        /* @jsxobf-clobber */
        this._jsxcachedclientdims = {};
      this._jsxcachedclientdims[strId] = objDim;
      return objDim;
    }
  };


  /** @package */
  Block_prototype.flushCachedClientDimensions = function(strId) {
    if (!this._jsxcachedclientdims)
      return;
    delete this._jsxcachedclientdims[strId];
  };


  /** @package */
  Block_prototype.resetCachedClientDimensions = function() {
    delete this._jsxcachedclientdims;
  };


  /**
   * Returns the drawspace defined by this object's parent. This is specific to the native browser view and represents the true client area in which this object should render.
   * Note that this object will also contain additional fields to further constrain the rendering of the child (i.e., width, position, tagname, border, etc).
   * @return {Object}
   * @package
   */
  Block_prototype.getDrawspace = function() {
    return this.getParent() ?
           this.getParent().getClientDimensions(this) :
           ((this.getServer() && this == this.getServer().getRootBlock()) ?
            this.getServer().getClientDimensions() :
            Template.getEmptyDrawspace());
  };


  /**
   * Sets (and caches) the drawspace for this instance. This is the top-down analog to the bottom-up approach, getClientDimensions
   * @param objDrawspace {Object}
   * @package
   */
  Block_prototype.setDrawspace = function(objDrawspace) {
    /* @jsxobf-clobber */
    this._jsxdrawspace = objDrawspace;
  };


  /**
   * Returns the size of the canvas for a given child (the true drawspace into which objChild can render itself)
   * @param objChild {jsx3.app.Model} the child for which to return the drawspace
   * @return {object} implicit map with named properties: parentwidth, parentheight.  Might also include optional properties: width, height, left, top, position, tagname
   * @package
   */
  Block_prototype.getClientDimensions = function(objChild) {

    //first check to see if the dimensions for the given child have been cached
    var objCachedDimensions = this.getCachedClientDimensions(objChild.getId());

    if(objCachedDimensions != null && typeof(objCachedDimensions) != "undefined")
      return objCachedDimensions;

    //the dimensions were not cached, get the cached dimensions from this object's parent--this results in traversing up the DOM until a parent with cached dimensions is found--or until the root block is encountered (which will force the server to return the size of the root GUI object that holds the given GI app)
    var _jsxdrawspace = this.getDrawspace();
    var _jsxpaintprofile = this.getPaintProfile();
    var _jsxboxprofile = this.getBoxProfile(true,_jsxdrawspace,true);
    var targetChildDrawspace = this._getClientDimensions(_jsxdrawspace,_jsxpaintprofile,objChild,_jsxboxprofile);
    //TODO: I don't think I need a clone here to protect the drawspace
    this.setCachedClientDimensions(objChild.getId(),targetChildDrawspace);
    return targetChildDrawspace;
  };


  /**
   * @package
   */
  Block_prototype.syncBoxProfile = function(objImplicit, objGUI) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(jsx3.gui.Painted.jsxclass, this);
/* @JSC :: end */

    var queue = new jsx3.gui.Painted.Queue();
    queue.add(this, objImplicit, objGUI);

/* @JSC :: begin BENCH */
    queue.subscribe("done", function() { t1.log("box.async");});
/* @JSC :: end */
    queue.start();
  };


  /**
   * @package
   */
  Block_prototype.forceSyncBoxProfile = function(objForUpdate,objGUI,bForceCascade) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(jsx3.gui.Painted.jsxclass, this);
/* @JSC :: end */
    if(!objGUI && objGUI !== false) objGUI = this.getRendered();
    var objQueue = new jsx3.gui.Painted.Queue();
    this._updateBoxProfileImpl(objForUpdate,this.getPaintProfile(),objQueue,objGUI,bForceCascade);
/* @JSC :: begin BENCH */
    objQueue.subscribe("done", function() { t1.log("box.async");});
/* @JSC :: end */
    objQueue.start();
  };


  /**
   * The existing updateBoxProfile method will be replaced by this method.
   * @param objDrawspace {Object} Drawspace with one or more named fields: parentheight, parentwidth, width, height, left, top, position, tagname
   * @param objGUI {Object} GUI intance (probably irrelevant, but keep for now)
   * @param objQueue {Object} The queue controller (need to see how to leverage the existing one if possible)
   * @param intType {int} The type of repaint (probably irrelevant)
   * @package
   */
  Block_prototype.updateBoxProfile = function(objDrawspace,objGUI,objQueue,intType) {
    this.updateBoxProfileImpl(objDrawspace,objGUI,objQueue,1);
  };



  Block_prototype.paintChild = function(objChild, bGroup, objGUI, bCascadeOnly) {
    //allows runtime insert of html without requiring all other child objects to be repainted
    if (objGUI == null) objGUI = this.getRendered();
    if (objGUI != null) {
      if (!bCascadeOnly) {
/* @JSC :: begin BENCH */
        var t1 = new jsx3.util.Timer(jsx3.gui.Painted.jsxclass, this);
/* @JSC :: end */
        objGUI = this._paintChild(objChild,this.getPaintProfile());
/* @JSC :: begin BENCH */
        t1.log("paint.insert");
/* @JSC :: end */
      }
      jsx3.gui.Painted._onAfterPaintCascade(objChild, objGUI);
    }
  };




  /**
   * The existing updateBoxProfileImpl method will be replaced by this method.
   * @param objDrawspace {Object} Drawspace with named fields: parentheight, parentwidth, width, height, left, top, position, tagname
   * @param objGUI {Object} GUI intance (probably irrelevant, but keep for now)
   * @param objQueue {jsx3.gui.Painted.Queue} The queue
   * @param intType {int} The type of repaint (probably irrelevant)
   * @package
   */
  Block_prototype.updateBoxProfileImpl = function(objDrawspace,objGUI,objQueue,intType) {
    if(this.onbeforeresize() !== false) {
      var _jsxpaintprofile = this.getPaintProfile();
      if(!objGUI)
        objGUI = this.getRendered();
      this._updateBoxProfileImpl(objDrawspace,_jsxpaintprofile,objQueue,objGUI);
      this.onresize();
    }
  };


  /**
   * Creates the box profile. fires the onbeforeinit and oninit methods.
   * @param objDrawspace {Object} Drawspace with named fields: parentheight, parentwidth, width, height, left, top, position, tagname
   * @package
   */
  Block_prototype.createBoxProfile = function(objDrawspace) {
    var _jsxpaintprofile = this.getPaintProfile();
    //console.log('getting box profile for' + this.getId())
    if(objDrawspace == null)
      objDrawspace = this.getDrawspace();
    this.onbeforeinit();
    var bp = this._createBoxProfile(objDrawspace,_jsxpaintprofile);
    this.oninit();
    return bp;
  };


  /**
   * Returns a box based upon the developer-assigned ID (u:id="ID") as appears in the template markup. This box is an abstraction of the actual on-screen box (HTML Element).
   * @param strId {String} ID assigned to the box in the declarative markup
   * @return {jsx3.gui.Template.Box}
   * @package
   */
  Block_prototype.getBoxById = function(strId) {
    var objAllBoxes = this.getBoxProfile(true,null,true);
    for(var p in objAllBoxes) {
      if(objAllBoxes[p].getName() == strId)
        return objAllBoxes[p];
    }
  };


  /**
   * Returns a box based upon the system-assinged ID. This reflects the absolute node address for the element when parsed in the DM
   * @param strName {String}
   * @return {jsx3.gui.Template.Box}
   * @package
   */
  Block_prototype.getBoxByName = function(strName) {
    return this.getBoxProfile(true,null,true)[strName];
  };


  /**
   * Returns the HTML element (the view) corresponding to the box (model) defined by the uniqe identifier, <code>strId</code>
   * @param strId {String} ID assigned to the box in the declarative markup
   * @param objRoot {HTMLElement} The root HTML element corresponding to the root box for the given GUI object instance; if not
   * provided, this will be resolved via <code>getRendered</code>.
   * @return {HTMLElement}
   */
  Block_prototype.getRenderedBox = function(strId,objRoot) {
    var objBox = this.getBoxById(strId);
    if(objBox) {
      if(!objRoot)
        objRoot = this.getRendered();
      if(objRoot) {
        return !this.getFluid() ? objBox.getRendered(objRoot) :
                                 html.findElements(objRoot, function(x) {
                                   //TODO: need to fix the findElements method (use new method); make sure no text nodes are passed, so nodeType check not required here.
                                   return x.nodeType == 1 && x.getAttribute("jsxtype") == strId;
                                 }, true, false, false, true);
      }
    }
  };


  /**
   * Gets the box model/profile for the object;
   * @param bCreate {Boolean} false if null. if true, a profile is created if none exists yet
   * @param objDrawspace {Object} valid drawspace
   * @param bArray {Boolean} true if the entire associative array of all box descriptions for this gui class instance should be returned
   * @return {jsx3.gui.Template.Box}
   * @package
   */
  Block_prototype.getBoxProfile = function(bCreate,objDrawspace,bArray) {
    if(!Template.getLibrary(this.getClass().getName())) {
      if (this._jsxboxprofiledirty) this.clearBoxProfile();
      if (this._jsxboxprofile == null && bCreate)
        this._jsxboxprofile = this.createBoxProfile(objDrawspace);
      return this._jsxboxprofile;
    } else {
      if (this._jsxboxprofiledirty)
        this.clearBoxProfile();

      if (this._jsxboxprofile == null && bCreate)
        /* @jsxobf-clobber */
        this._jsxboxprofile = this.createBoxProfile(objDrawspace);

      //3.6 DM update: the 'Box Profile' is no longer nested, meaning the object being returned was a simple object, not an
      //instance of jsx3.gui.Template.Box.  Return the first concrete box (this is always the root box)
      if(bArray)
        return this._jsxboxprofile;
      for(var p in this._jsxboxprofile)
        return this._jsxboxprofile[p];
    }
  };


  /**
   * Sets the box model/profile for the object;
   * @param boxProfile {jsx3.gui.Template.Box}
   * @package
   */
  Block_prototype.setBoxProfile = function(boxProfile) {
    //TODO: this method isn't used in the old and new systems; remove from both (setBoxProfile is unnecessary)
    this._jsxboxprofile = boxProfile;
  };


  /**
   * @package
   */
  Block_prototype.setBoxDirty = function() {
    /* @jsxobf-clobber */
    this._jsxboxprofiledirty = true;
  };


  /**
   * Deletes the existing boxprofile for the object. This is useful when a given template definition defines various (dynamic) DOMs. If a given value will result in the template needed to generate a different DOM, then this method should be called to ensure that the cached DOM is not used.
   * @param bRecurse {Boolean} if true, the profile for all descendants is also deleted. Typically, a left/top adjustment would pass false for this param, while all other adjustments that affect descendant structures would pass true.
   */
  Block_prototype.clearBoxProfile = function(bRecurse) {
    var q = [this];
    while (q.length > 0) {
      var n = q.shift();

      delete n._jsxboxprofiledirty;
      delete n._jsxcachedclientdims;

      if (n._jsxboxprofile) {
        delete n._jsxboxprofile;
        if (bRecurse) {
          var c = n.getChildren();
          if (c.length > 0) q.push.apply(q, c);
        }
      }
    }
  };


  /**
   * Initializes the 'Paintable Profile' by iterating through all resolvers registered for the class and resolving all replacement variables
   * For every resolver registered with the class, a replacment variable of the same name will be created and added to the 'Paintable Profile'
   * @private
   * @see #getPaintProfile()
   */
  Block_prototype._initializeProfile = function() {
    //apply dynamic properties before initializing...thereafter, any updates need to synch up (cascade through the given server)
    //console.log('initializing paint profile for' + this)
    this.applyDynamicProperties();

    //create the paintable profile
    var objLib = Template.getLibrary(this.getClass().getName());
    if(!objLib)
      return;
    var maxLen = objLib.length;

    //create the default paint profile; add a target element (placeholder if user wants to apply complex nestings
    this._jsxpaintprofile = {$$target:{}};
    for(var i=0;i<maxLen;i++) {
      var fnResolver = Template.getResolver(objLib[i].setid,objLib[i].id);
      try {
        var vntValue = fnResolver.apply(this);
        this._jsxpaintprofile[objLib[i].id] = vntValue !== null ? vntValue : fnResolver.defaultvalue;
      } catch (e) {
        var strTriggers = fnResolver && fnResolver.triggers && fnResolver.triggers.length ? "this.syncProperty(\"" + fnResolver.triggers[0] + "\")"  : "this.synchronizeProfiles()";
        LOG.warn("The paint profile variable, \"" + objLib[i].id + "\", belonging to the Library, \"" + objLib[i].setid + "\", is throwing an error during resolution (" + e + "). This is caused by either developer error (errant code) or when the profile variable calls a method that is not yet avialable. For example, if a profile variable uses a URI resolver (e.g, this.getServer().resolveURI(...)) and is called before the instance is attached to the DOM, this.getServer() will throw an error, causing an NPE. If this error causes the variable not to be properly resolved, call " + strTriggers + " before painting to attempt to resynchronize the value.");
      }
    }
  };


  /**
   * Resynchronizes the 'Paintable Profile' to reflect the model object's state
   * @package
   */
  Block_prototype.synchronizeProfiles = function(bView) {
    this._initializeProfile();
  };


  /**
   * @package
   */
  Block_prototype.synchronizeProfile = function(strPropName,VIEW,objGUI) {
    this.syncProperty(strPropName,VIEW,objGUI);
  };


  /**
   * Returns whether or not the instance will be painted using a fluid box structure or will always be predictable based upon
   * what is declared in the DM.
   * @return {Boolean}
   * @package
   */
  Block_prototype.getFluid = function() {
    return this.getClass()._JSXFLUID;
  };


  /**
   * Sets whether or not the given instance will not use absolute DOM address to locate the GUI object or
   * implement the safer model (fluid) that relies on IDs provided by the developer to locate the native HTML element.
   * @param bFluid {Boolean}
   * @package
   */
  Block_prototype.setFluid = function(bFluid) {
     this.getClass()._JSXFLUID = bFluid
  };


  /**
   * system call typically made by the paint routine for the object; updates all properties for the object with any dynamic properties it may reference
   * @private
   */
  Block_prototype.applyDynamicProperties = function(bUpdateView) {
    //declare object if it doesn't exists
    if (this._jsxdynamic != null) {
      //get handle to the server that owns this object
      var objMyServer = this.getServer();
      if (objMyServer == null) return;

      //loop to update the values in this object with their corresponding value managed by the given server instance
      var jss = objMyServer.getProperties();
      var bProfile = this.hasPaintProfile();
      if(bProfile) {
        for (var p in this._jsxdynamic) {
          this[p] = jss.get(this._jsxdynamic[p]);
          this.syncProperty("" + p,bUpdateView == true);
        }
      } else {
        for (var p in this._jsxdynamic)
          this[p] = jss.get(this._jsxdynamic[p]);
      }
    }
  };

  Block_prototype.setDynamicProperty = function(strName, strValue, bNoSave, bUpdateView) {
    //declare object if it doesn't exists
    this.jsxsuper(strName,strValue,bNoSave);

    if(bUpdateView && this.getServer()) {
      this[strName] = this.getServer().getProperties().get(this._jsxdynamic[strName]);
      this.syncProperty("" + strName,true);
    }
    return this;
  };

  /**
   * Returns the 'Paintable Profile'. This is a hash of scalar replacement variables that will be merged with the 'Box Profile' to generate the view
   * @return {Object}
   * @package
   */
  Block_prototype.getPaintProfile = function() {
    if(!this._jsxpaintprofile && Template.getLibrary(this.getClass().getName())) {
      this._initializeProfile();
    } else if(!this._jsxpaintprofile) {
      //jsx3.log('why need paint for: ' + this);
    }
    return this._jsxpaintprofile;
  };


  /**
   * Returns the 'Paintable Profile'. This is a hash of scalar replacement variables that will be merged with the 'Box Profile' to generate the view
   * @return {Boolean}
   * @package
   */
  Block_prototype.hasPaintProfile = function() {
    //return typeof(Template.LIBRARIES[this.getClass().getName()]) != "undefined";
    return typeof(this._jsxpaintprofile) != "undefined";
  };


  /**
   * Sets the 'Paintable Profile'. This is a hash of scalar replacement variables that will be merged with the 'Box Profile' to generate the view
   * @param objProfile {Object}
   * @private
   */
  Block_prototype.setPaintProfile = function(objProfile) {
    this._jsxpaintprofile = objModel;
  };


  /**
   * Sets a property on the instance. Triggers an update to synchronize model and view.
   * This method may be called with a variable number of arguments, which are
   * interpreted as name/value pairs, i.e.: <code>obj.setProperty(n1, p1, n2, p2);</code>.
   * For example, the following two statements are equivalent:
   * <p><pre>
   * obj.setProperty("jsxbgcolor","red");
   * obj.setBackgroundColor("red",true);
   * </pre></p>
   * @param strName {String} the name of the attribute.
   * @param strValue {String} the value of the attribute. If <code>null</code>, the attribute is removed.
   */
  Block_prototype.setProperty = function( strName, strValue ) {
    this._setProperty.call(this,null,arguments);
  };


  /**
   * Similar to <code>setProperty</code>, except that the target GUI element can be specified as the first parameter. This is useful for repeated
   * UI updates since it saves the system from resolving objGUI.
   * @param objGUI {HTMLElement} the rendered native object.
   * @param strName {String} the name of the attribute.
   * @param strValue {String} the value of the attribute. If <code>null</code>, the attribute is removed.
   * @see #setProperty()
   */
  Block_prototype.setPropertyGUI = function( objGUI, strName, strValue ) {
    this._setProperty.call(this,objGUI,arguments);
  };


  Block_prototype._setProperty = function( objGUI, a ) {
    var y = [];
    var strValue, strName;
    for (var i = objGUI !== null ? 1 : 0; i < a.length; i+=2) {
      strName = a[i]; strValue = a[i+1];
      if (strValue != null) {
        var target = this;
        var arr = strName.split(".");
        while(arr.length > 1)
          target = target[arr.shift()];
        target[arr.pop()] = strValue;
      } else
        delete this[strName];
      y.push(strName);
    }
    if(y.length)
      this.syncProperty(y, null, objGUI);
  };


  /**
   * Synchronize value(s) on the model to value(s) in the view (the view template).  Ensures a complete feedback loop
   * from model to view.  This method is different from <code>setPropery</code> in that setProperty is used to both update
   * the model and view at the same time.  For example, the following two examples are equivalent:
   * <p><pre>
   * //example 1
   * obj.setProperty("jsxbgcolor","red");
   * &#160;
   * //example 2
   * obj.jsxbgcolor = "red";
   * obj.syncProperty("jsxbgcolor");
   * </pre></p>
   * @param strPropName {String | Array<String>} One or more properties reflecting what was changed.  For example, "jsxbgcolor" or ["jsxexecute","color"]
   * @param VIEW {Object} Configuration object. Passing null is the same as passing true.
   * <p><ul>
   * <li><b>true</b>         Update the paintable model and then update the corresponding implementations of that property in the view</li>
   * <li><b>false</b>        Only update the paintable model. If any updates affect a box property (i.e., left, border, etc), the box profile will be set to 'dirty'.</li>
   * <li><b>{drawspace}</b>  Update the paintable model and then update the corresponding implementations of that property in the view. The object
   *                         being passed will be used to seed any box updates. For example, passing {left:10}, would result in the box
   *                         being moved to the pixel position, 10, regardless of what property updates get triggered.</li>
   * </ul></p>
   * @param objGUI {HTMLElement} Optional; if passed, this instance will be used; if not passed, objGUI will be resolved via <code>[instance].getRendered()</code>
   * @see #setProperty()
   */
  Block_prototype.syncProperty = function(strPropName,VIEW,objGUI) {
    //TODO: 3.6: remove this conditional when migration is complete
    var strClassName = this.getClass().getName();
    if(Template.getLibrary(strClassName)) {
      if(VIEW == null) VIEW = true;
      var objForUpdate = (typeof(VIEW) == "object") ? VIEW : {};
      var doBoxVerb = 0;
      var oldValue;

      var objProfile = this.getPaintProfile();

      //only get the box profile if the user actually wants it; or if it already exists
      var objBoxProfile = this.getBoxProfile(!(!VIEW));
      if(objGUI == null && VIEW)
        objGUI = this.getRendered();
      if(!jsx3.$A.is(strPropName)) strPropName = [strPropName];

      for(var j=0;j<strPropName.length;j++) {
        //all triggers for the class are managed by the template under a hash ID equal to the name of the class
        var strCurProp = strPropName[j];
        var arrFunctions = Template.TRIGGERS[strClassName][strCurProp];
        if(arrFunctions) {

          var objP = this.getBoxProfile(true); //get just the root box
          for(var i=0;i<arrFunctions.length;i++) {
            //udpate the replacement variable on the 'Paintable Profile', using a resolver of the same name
            var fnResolver = arrFunctions[i];

            oldValue = objProfile[fnResolver.resolverid];
            objProfile[fnResolver.resolverid] = fnResolver.apply(this);
            if(objProfile[fnResolver.resolverid] == null)
                objProfile[fnResolver.resolverid] = fnResolver.defaultvalue;
            LOG.trace("Updating profile variable, " + fnResolver.resolverid + ": " + objProfile[fnResolver.resolverid]);

            if(fnResolver.type == "box") {
              if(objBoxProfile && objBoxProfile.doesImplement(fnResolver.resolverid)) {
                //only updates on the outer box get cached; all other updates will cascade once the outerbox updates
                objForUpdate[fnResolver._name] = objProfile[fnResolver.resolverid];
                if(doBoxVerb == 0)
                      doBoxVerb = 1;
              } else {
                //the value, -1, tells the system to force a cascade when it updates the box profile--even if it seems as if no update occurred
                //this ensures that an inner box will still receive the update even if no deltas appear during the cascade
                doBoxVerb = fnResolver._name == "text" || doBoxVerb == -1 ? -1 : -2; //-2 is positional cascade; -1 is text cascade
              }
            } else /*if(Template._BOX_RECALC_PROPS.indexOf(fnResolver._name) == -1)*/ {
              //this is a regular update make here
              if(VIEW)
                this._synchronizeProfile(objProfile,fnResolver,objGUI,oldValue);
            }
          }
        } else {
          LOG.trace("no triggers associated with " + strCurProp);
        }
      }

      //if a resolver was executed that is of type 'box resolver'...
      if(doBoxVerb) {
        //if the user wishes to update the view...
        if(VIEW) {
          if(doBoxVerb == 1)
            this.syncBoxProfile(objForUpdate,objGUI);
          else
            //there are two types of 'forced' cascades: type '1': positional; type 'true': text
            this.forceSyncBoxProfile(objForUpdate,objGUI,doBoxVerb == -1 ? true : 1);
        } else if(objGUI) {
          //TODO: does it matter to check for objGUI?  is this too strict??
          //if the view exists, but it was not allowed to update, set the box dirty, to designate it as out-of-sync
          this.setBoxDirty();
        }
      }
    }
  };


  /**
   * Returns the first box that implements a given resolver
   * @param strResolverId {String}
   * @return {jsx3.gui.Template.Box}
   * @private
   */
  Block_prototype._getBoxForResolver = function(strResolverId) {
    var allBoxProfiles = this.getBoxProfile(true,null,true);
    for(var p in allBoxProfiles)
      if(allBoxProfiles[p].doesImplement(strResolverId))
        return allBoxProfiles[p];
  };

  /**
   * Determines which boxes implement the given replacement variable; if a box implements the variable, _synchronizeProfileGUI
   * will be called to synchronize the paintable model with the corresponding object in the native browser DOM
   * @param objPaintProfile {Object}
   * @param objResolver {Object} a valid resolver;
   * @param objGUI {HTMLElement} root box for the instance
   * @param oldValue {int | String | Boolean} prior value before the update -- sometimes necessary in order to undo the former property
   * @private
   */
  Block_prototype._synchronizeProfile = function(objPaintProfile,objResolver,objGUI,oldValue) {
    if(objResolver.repaintupdate && objGUI) {
      //multi-css properties used by the system (like background),
      this.repaint();
    } else {
      var allBoxProfiles = this.getBoxProfile(true,null,true);
      var TYPE = objResolver.type;
      var ID = objResolver.resolverid;
      var NAME = objResolver._name;
      for(var p in allBoxProfiles)
        if(allBoxProfiles[p].doesImplement(ID))
          this._synchronizeProfileGUI(objPaintProfile,objGUI,TYPE,ID,NAME,allBoxProfiles[p],oldValue);
    }
  };


  /**
   * Synchronizes a replacement variable on the paintable model with its corresponding representation on the native browser DOM node
   * @param objPaintProfile {Object} the paintable profile/model for this instance (the hash of all scalar replacement variables)
   * @param objGUI {HTMLElement} root box for the instance
   * @param TYPE {Object} for example: css, attribute, event, etc
   * @param ID {Object} the unique ID for this resolver (from the perspective of this gui class)
   * @param NAME {Object} the name according to the native view (what the browser expects its name to be)
   * @param objBoxProfile {Object} the specific box profile that implements the replacement variable, ID
   * @param oldValue {int | String | Boolean} prior value before the update -- sometimes necessary in order to undo the former property
   * @private
   */
  Block_prototype._synchronizeProfileGUI = function(objPaintProfile, objGUI, TYPE, ID, NAME, objBoxProfile,oldValue) {
    //the former uses the user-assigned ID, the latter uses an absolute DOM node address; when fluid, the user is required to ID each box
    var objNode = this.getBoxProfile() == objBoxProfile ? objGUI : objBoxProfile.getName() ? this.getRenderedBox(objBoxProfile.getName(), objGUI): objBoxProfile.getRendered(objGUI);

    if(objNode) {
      if (TYPE == "css") {
        //css updates cannot accept a null; set as an empty string if a null
        LOG.trace('Updating style: ' + NAME + ' = ' + objPaintProfile[ID]);
        html.DOM.setStyle(objNode, NAME, objPaintProfile[ID] || "");
      } else if (TYPE == "attribute") {
        //TODO: classnames get special handling apart from other attributes
        if(NAME == "value") {
          LOG.trace('Updating attribute: ' + NAME + ' = ' + objPaintProfile[ID]);
          //firefox doesn't like the value to be set as an attribute--it's not too offensive a bug, so I'll leave the fix for all environements (sf, ie, etc)
          objNode.value = objPaintProfile[ID];
        } else {
          if(objPaintProfile[ID] == null) {
            LOG.trace('Removing attribute: ' + NAME);
            objNode.removeAttribute(NAME);
          } else {
            LOG.trace('Updating attribute: ' + NAME + ' = ' + objPaintProfile[ID]);
            objNode.setAttribute(NAME, objPaintProfile[ID]);
          }
        }
      } else if (TYPE == "text") {
        //TODO: still need to add support for updating text content
        LOG.trace("Updating text content: " + objPaintProfile[ID]);
        objNode.innerHTML = objPaintProfile[ID];
      }  else if (TYPE == "style-group") {
        LOG.trace('Updating style-group: ' + objPaintProfile[ID]);
        //remove any existing styles and THEN apply the new styles
        if(oldValue) html.DOM.clearStyles(objNode,oldValue);
        html.DOM.setStyles(objNode,objPaintProfile[ID]);
      } else if (TYPE == "event") {
        if(objPaintProfile[ID]) {
          var strFunction = Template.Box.renderHandler(objPaintProfile[ID],objBoxProfile.getNodeDepth());
          LOG.trace('Updating event: ' + NAME + ' = ' + strFunction);
          html.DOM.removeBridgedEvent(objNode,NAME);
          html.DOM.addBridgedEvent(objNode,NAME,strFunction);
        } else {
          LOG.trace('Removing event: ' + NAME + ": " + objNode[NAME]);
          html.DOM.removeBridgedEvent(objNode,NAME);
        }
      } else {
        LOG.warn('??unsupported synch type:' + TYPE);
      }
    }
  };

});