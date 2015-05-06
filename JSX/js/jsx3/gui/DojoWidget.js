// @jsxobf-clobber-shared  _jsxevents
jsx3.require("jsx3.util.Dojo", "jsx3.gui.Block");

jsx3.util.Dojo.load();

dojo.require("dojox.lang.docs");
// seems that sometimes there is concurrent loading, so we have to actually specify these explicitly
dojo.require("dojo._base.connect");
dojo.require("dojo._base.Deferred");
dojo.require("dojo._base.json");
dojo.require("dojo._base.array");
dojo.require("dojo._base.Color");
dojo.require("dojo._base.browser");
dojo.require("dijit.dijit");
dojo.require("dojox.html._base");

/**
 * An adapter for Dojo widgets. Allows Dojo widgets (Dijits) to be used as GI DOM nodes from within a
 * General Interface application. 
 */
jsx3.Class.defineClass("jsx3.gui.DojoWidget", jsx3.gui.Block, null, function(DojoWidget, DojoWidget_prototype) {

  /**
   * {dijit._Widget} The native Dojo widget object.
   */
  DojoWidget_prototype.dijit = null;

  var ss = {};

  var correctedPopups;

  /**
   * Dynamically inserts the theme style sheet and applies the correct class to the app's DOM
   * @param theme theme to apply
   * @param node The node to use
   * @private
   */
  DojoWidget._insertThemeStyleSheets = function(theme, node){
    var theme_ss = jsx3.util.Dojo.getPath('/dijit/themes/' + theme + '/' + theme + '.css');

    if (!ss[theme_ss]) {
      DojoWidget._insertStyleSheet(theme_ss, node);
      dojo.addClass(dojo.body(), theme);
    }
  };

  /**
   * Dynamically inserts a style sheet into the DOM
   * @param name filename of the style sheet to add
   * @param node The node to use
   * @private
   */
  DojoWidget._insertStyleSheet = function(name, node){
    var doc = node.ownerDocument;
    var head = doc.getElementsByTagName("head")[0];
    var s = ss[name];
    if(!s){
      s = ss[name] = doc.createElement('style');
      s.setAttribute('type', 'text/css');
      head.appendChild(s);

      dojo.xhrGet({
        url: name,
        sync: true,
        load: function(text){
          var text = dojox.html._adjustCssPaths(name, text);
          if(s.styleSheet){ // IE
            if(!s.styleSheet.cssText){
              s.styleSheet.cssText = text;
            }else{
              s.styleSheet.cssText += text;
            }
          }else{ // w3c
            s.appendChild(doc.createTextNode(text));
          }
        }
      });
    }
  };

  /**
   * The instance initializer.
   * @param strName
   * @param vntLeft
   * @param vntTop
   * @param vntWidth
   * @param vntHeight
   * @param dijitClassName {String} the class name of the Dojo widget you are instantiating.
   * @param dijitProps {Object} the properties to send to the Dojo class constructor.
   * @param dijitStyleSheets {Array<String>} paths of extra stylesheets to load relative to the Dojo root.
   */
  DojoWidget_prototype.init = function(strName,vntLeft,vntTop,vntWidth,vntHeight,dijitClassName,dijitProps,dijitStyleSheets) {
    //call constructor for super class
    this.dijitClassName = dijitClassName;
    this.dijitProps = dijitProps||{};
    this.dijitStyleSheets = dijitStyleSheets||[];
    this.jsxsuper(strName,vntLeft,vntTop,vntWidth,vntHeight);
    this._createDijit(this.dijitProps);
  };

  /**
   * @package
   */
  DojoWidget_prototype.onAfterAssemble = function() {
    var dijitProps = {};
    for (var i in this) {
      if (i.substring(0,6) == "dijit_") {
        dijitProps[i.substring(6)] = this[i];
      }
    }
    this.jsxsuper.apply(this, arguments);
    this._createDijit(dijitProps);
    for (var i in this._jsxevents) {
      this.setEvent(this._jsxevents[i], i);
    }
  };

  /**
   * @package
   */
  DojoWidget_prototype.onSetChild = function() {
    return false;
  };

  /**
   * Gets the sub-id of the class
   * @return the sub-id of the class
   * @private
   */
  DojoWidget_prototype._subPropId = function() {
    return this.dijitClassName;
  };
  
  /**
   * Creates a new dijit
   * @param props {Object} property bag to provide to the dijit constructor
   * @private
   */
  DojoWidget_prototype._createDijit = function(props){
    if(!this.dijit){
      if (!this.dijitClassName) {
        throw new Error("No dijitClassName defined");
      }
      dojo._postLoad = true; // make sure we don't tempt the widget to use document.write
      dojo.require(this.dijitClassName);
      if(!correctedPopups && dijit.popup){
        correctedPopups = true;        
        dojo.connect(dijit.popup, "open", function(){
          dojo.query(".dijitPopup").addClass("jsx30block");
        });
      }
      
      this.dijit = new (dojo.getObject(this.dijitClassName))(props);
      setupAccessors(this);
      var self = this;
      dojo.connect(self.dijit, "onChange", function(){
        self.dijit_value = self.dijit.attr("value");
      });
    }
  };

  /**
   * @package
   */
  DojoWidget_prototype.isDomPaint = function(){
    return !!this.dijitClassName;
  };

  /**
   * @package
   */
  DojoWidget_prototype.paintDom = function() {
    jsx3.html.insertAdjacentHTML(document.body, "beforeEnd", this.paint());
    var newElement = document.body.lastChild;

    DojoWidget._insertThemeStyleSheets('tundra', newElement);
    
    if (this.dijitStyleSheets) {
      dojo.forEach(this.dijitStyleSheets, function(style_sheet){
        DojoWidget._insertStyleSheet(jsx3.util.Dojo.getPath('/' + style_sheet), newElement);
      });
    }

    this.dijit.placeAt(newElement);
    if (this.getHeight())
      newElement.firstChild.style.height = "100%";

    return newElement;
  };

  /**
   * Gets or sets a property of the native Dojo object. Calling this method with two parameters sets the property.
   * @param name {String} the name of the property to get or set.
   * @param value {Object} the new value of the property.
   */
  DojoWidget_prototype.attr = function(name, value) {
    return this.dijit.attr.apply(this.dijit, arguments);
  };

  /**
   * Handles destruction of the widget
   * @private
   */
  DojoWidget_prototype.onDestroy = function(objParent){
    this.dijit.destroyRecursive();

    this.jsxsuper(objParent);
  };

  /**
   * @package
   */
  DojoWidget_prototype.setEvent = function(script, eventName){
    this.getEvents()[eventName] = script;
    var handles = this._eventHandles = this._eventHandles || {};
    // disconnect any prior handler that we set
    if (handles[eventName]) {
      dojo.disconnect(handles[eventName]);
    }
    var objJSX = this;
    handles[eventName] = dojo.connect(this.dijit, eventName, function(event) {
      // send the Dojo event to the GI event system
      objJSX.doEvent(eventName, {objEVENT: event});
    });
    return this;
  };

  // iterates over the properties, whether it be from the API docs, or the object's prototype  
  function iterateProperties(self, handler) {
    var schemaDefined, dijitClass = self.dijit.constructor;
      while (dijitClass) {
        for (var i in dijitClass.properties) {
          schemaDefined = true;
          if (i.charAt(0) != "_") {
            var propDef = dijitClass.properties[i];
            var protoType = typeof self.dijit[i];
            if (!propDef.type && protoType != "undefined" && protoType != "function") {
              propDef.type = protoType;
            }
            handler(dijitClass.properties[i], i);
          }
        }
        dijitClass = dijitClass["extends"];
      }
      if (!schemaDefined) {
        // no schema defined, we will to the prototype and current state for properties
        for (var i in self.dijit) {
          var type = typeof self.dijit[i];
          if (i.charAt(0) != "_" && type != "function") {
            handler({
              type: type
            }, i);
          }
        }
      }
  };

  var objectsMissingDocGetters = [];

  // setup the getters and setters on the object
  function setupAccessors(self){
    if(!docsInitialized){
      objectsMissingDocGetters.push(self);
    }
    iterateProperties(self, function(propDef, i){
      var firstCap = i.charAt(0).toUpperCase() + i.substring(1, i.length);
      if(i != "id" && i != "class"){
        if(!self["get" + firstCap] && !self["set" + firstCap]) {
          var getter = self["get" + firstCap] = function() {
            return self.dijit.attr(i);
          };
          getter._dojoGetter = true;
          var defaultValue = self.dijit.constructor.prototype[i];
          if (defaultValue && typeof defaultValue == 'object') {
            self["getJSON" + firstCap] = function() {
              return '(' + dojo.toJson(self.dijit.attr(i)) + ')';
            };
          }
          self["set" + firstCap] = function(value) {
            self["dijit_" + i] = value;
            self.dijit.attr(i, value);
          };
        }
      }
    });
  };
  
  var docsInitialized;

  /**
   * Returns the metadata in XML form
   * @param metadataType {String} This can be "prop" for the properties, or "event" for the events
   * @return {jsx3.xml.CDF} The metadata in CDF/XML form
   * @package
   */
  DojoWidget_prototype.getMetadataXML = function(metadataType) {
    if(!docsInitialized){
      docsInitialized = true;
      dojox.lang.docs.init(); // make sure it is initialized
      for(var i = 0, l = objectsMissingDocGetters.length; i < l; i++) {
        setupAccessors(objectsMissingDocGetters[i]);
      }
    }
    var self = this;
    var schemaDefined, dijitClass = this.dijit.constructor;
    var metadata = jsx3.xml.CDF.Document.newDocument();
    if (metadataType == "prop") {

      metadata.insertRecord({
        include: "master.xml",
        absinclude: "GI_Builder/plugins/jsx3.ide.palette.properties/templates/master.xml",
        group: "object"
      });

      metadata.insertRecord({
        group: "1",
       jsxid: "dojo",
       jsxtext: "Dojo"
      });
      function addProperty(propDef, i) {
        if (propDef.type == 'object' && propDef.name != 'attributeMap' && propDef.name != 'params') {
          return;
        }
        var firstCap = i.charAt(0).toUpperCase() + i.substring(1, i.length);
        if (self["get" + firstCap]._dojoGetter) {
          var defaultValue = dijitClass.prototype[i];
          var rec = {
            jsxid: i,
            jsxtext: firstCap,
            jsxtip: propDef.description,
            eval: propDef.type == 'string' ? 0 : 1,
            docgetter: typeof defaultValue == "undefined" ? 'attr("' + i + '")' : "get" + firstCap,
            docsetter: typeof defaultValue == "undefined" ? 'attr("' + i + '", val)' : "set" + firstCap,
            getter: (defaultValue && typeof defaultValue == 'object') ? "getJSON" + firstCap : "get" + firstCap,
            jsxmask: propDef.type == 'boolean' ? "jsxselect" : 
                   /\n/.test(dijitClass.prototype[i]) ? "jsxtextarea" : "jsxtext",
            jsxexecute:'objJSX.set' + firstCap + '(vntValue);'
          };
          var objRecordNode = metadata.insertRecord(rec, "dojo");
          if(propDef.type == 'boolean'){
            // Boolean properties need to have enum elements set up
            // for the property editor
            var objXML = metadata.getXML();
            var trueNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "enum");
            trueNode.setAttribute('jsxid', 'jsx3.Boolean.TRUE');
            trueNode.setAttribute('jsxtext', 'True');
            objRecordNode.appendChild(trueNode);
            var falseNode = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT, "enum");
            falseNode.setAttribute('jsxid', 'jsx3.Boolean.FALSE');
            falseNode.setAttribute('jsxtext', 'False');
            objRecordNode.appendChild(falseNode);
          }
        }
      }
      iterateProperties(self, addProperty);
      for (var i in {position:1, "1":1, "font":1, "box_nobg":1, "css":1, "interaction":1, "access":1}) {
        metadata.insertRecord({
          include: "master.xml",
          absinclude: "GI_Builder/plugins/jsx3.ide.palette.properties/templates/master.xml",
          group: i
        });
      }
    }else if(metadataType=="event"){
      function addMethod(methodDef, i) {
        metadata.insertRecord({
          group: "dojo",
          jsxid: i,
          jsxtext: i,
          jsxtip: methodDef.description
        }, "dojo");
        metadata.insertRecord({
          jsxid:"objEVENT",
          type:"jsx3.gui.Event",
          jsxtext:"the browser event that triggers this event."
        }, i);
      }
      while (dijitClass) {
        for (var i in dijitClass.methods) {
          schemaDefined = true;
          if (i.charAt(0) != "_") {
            addMethod(dijitClass.methods[i], i);
          }
        }
        dijitClass = dijitClass["extends"];
      }      
      if (!schemaDefined) {
        // no schema defined, we will to the prototype and current state for methods/events
        for (var i in this.dijit) {
          if (i.charAt(0) != "_" && typeof this.dijit[i] == "function") {
            addMethod({}, i);
          }
        }
      }
    }
    return metadata;
  };
  
  DojoWidget._icons = {
    "dijit.form.Button": "button.gif",
    "dijit.form.CheckBox": "checkbox.gif",
    "dijit.ColorPalette": "colorpicker.gif",
    "dijit.form.HorizontalSlider": "slider.gif",
    "dijit.form.VerticalSlider": "vertical-slider.gif",
    "dijit.form.TimeTextBox": "timepicker.gif",
    "dijit.form.CurrencyTextBox": "textbox.gif",
    "dijit.form.DateTextBox": "datepicker.gif",
    "dijit.form.NumberSpinner": null,
    "dijit.ProgressBar": null,
    "dijit.Editor": "textbox-area.gif",
    "dijit.form.Rating": null
  };
  
  DojoWidget_prototype.getIconPath = function() {
    var icn = DojoWidget._icons[this.dijitClassName];
    return icn ? "GI_Builder/images/prototypes/" + icn : null;
  };

});
