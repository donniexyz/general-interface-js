/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _currentid _outdelay

/**
 * The log handler/formatter for the jsx3.ide.mapper.Mapper class
 */
jsx3.Class.defineClass('jsx3.ide.mapper.LogHandler', jsx3.util.Logger.FormatHandler, null, function(MapperLogHandler, MapperLogHandler_prototype) {

  MapperLogHandler_prototype.init = function(strName) {
    this._queue = [];
    this.jsxsuper(strName);
  };

  MapperLogHandler_prototype.handle = function(objRecord) {
    if (this._outdelay) window.clearTimeout(this._outdelay);
    //the logger (though bound to the class) outputs to the specific instance; don't proceed unless the instance can be resolved
    var objParams = objRecord.getParameters();
    if (objParams) {
      //was an instance of the mapper passed?
      var instance;
      for (var p in objParams) {
        if (p == "0" && (instance = objParams[p]["instance"]) != null) break;
      }

      //mapper was found send message to its log; use a delay to improve performance by chunking output until CPU is available
      if (instance) {
        //alias self; add new sys out to the queue; start timer to push to out
        var me = this;
        this.getQueue().push([jsx3.util.strEscapeHTML(this.format(objRecord)), objRecord.getLevel()]);
        this._outdelay = window.setTimeout(function() { instance._out(me.getQueue()); me.resetQueue();}, 100);
      }
    }
  };

  MapperLogHandler_prototype.getQueue = function() {
    return this._queue;
  };

  MapperLogHandler_prototype.resetQueue = function() {
    this._queue = [];
  };

});
//register this handler with the logger, so when the class tries to log, this item will be found
jsx3.util.Logger.Handler.registerHandlerClass(jsx3.ide.mapper.LogHandler.jsxclass);

/**
 * This class is used in conjunction with the XML Mapping Utility to provide access to a SOAP service.  In practice a developer would open GI Builder to access the XML Mapping Utility.  They would then point the utility at a WSDL and begin using its visual tools to bind application objects to nodes in the WSDL.  The output from this utility is referred to as a mapping rule set.  This is a tree-like document (in XML format) that can then be used in any running GI application to easily communicatewith a remote Web Service.
 */
jsx3.Class.defineClass("jsx3.ide.mapper.Mapper", jsx3.gui.Block, null, function(Mapper, Mapper_prototype) {

  var ADDIN = jsx3.ide.getPlugIn("jsx3.ide.mapping");

  //create Logger for this class
  var Logger = jsx3.util.Logger;
  /* @jsxobf-clobber */
  Mapper._LOG = Logger.getLogger(Mapper.jsxclass.getName());

  //set the level to trace (show everything); don't allow parent to handle (sys out)
  Mapper._LOG.setLevel(Logger.INFO);
  Mapper._LOG.setUseParentHandlers(false);

  //create the handler
  var objHandler = new jsx3.ide.mapper.LogHandler(Mapper.jsxclass.getName() + "LogHandler");
  objHandler.setFormat("[%l] - %t - %M");
  Mapper._LOG.addHandler(objHandler);

  /**
   * {String} GI_Builder/addins/mapping/rules/_new.xml (default)
   */
   Mapper.NEW_FILE_PATH = ADDIN.resolveURI("rules/_new.xml");

  /**
   * {String} xml document type
   */
  Mapper.TYPE_XML = "xml";

  /**
   * {String} wsdl document type
   */
  Mapper.TYPE_WSDL = "wsdl";

  /**
   * {String} schema document type
   */
  Mapper.TYPE_SCHEMA = "schema";

  /**
   * {String} json document type
   */
  Mapper.TYPE_JSON = "json";

  /**
   * {int} recursive depth to expand rules tree folders when parsing an XML source document (default 8)
   */
  Mapper.EXPAND_TO_DEPTH = 1;

  /**
   * {String} xml/stubs/soap.xml
   */
  Mapper.SOAP_STUB_SRC = "jsx://xml/stubs/soap.xml";

  /**
   * {String} /SOAP-ENV:Envelope/SOAP-ENV:Body
   */
  Mapper.SOAP_STUB_PATH = "/SOAP-ENV:Envelope/SOAP-ENV:Body";

  Mapper.delimiter = "_jsx_";

  /** @private @jsxobf-clobber */
  Mapper._ns = {};
  Mapper._ns.wsdl = "http://schemas.xmlsoap.org/wsdl/";
  Mapper._ns.schema1999 = "http://www.w3.org/1999/XMLSchema";
  Mapper._ns.schema2001 = "http://www.w3.org/2001/XMLSchema";
  Mapper._ns.schemaInstance1999 = "http://www.w3.org/1999/XMLSchema-instance";
  Mapper._ns.schemaInstance2001 = "http://www.w3.org/2001/XMLSchema-instance";
  Mapper._ns.soap = "http://schemas.xmlsoap.org/wsdl/soap/";
  Mapper._ns.soapencoding = "http://schemas.xmlsoap.org/soap/encoding/";
  Mapper._ns.soapenvelope = "http://schemas.xmlsoap.org/soap/envelope/";
  //Mapper._ns.wsdl2 = "http://www.w3.org/2005/05/wsdl/";

  Mapper.TEXTBOX_PROJECTION = ADDIN.resolveURI("proto/TextBox.xml");
  Mapper.SELECT_PROJECTION = ADDIN.resolveURI("proto/Select.xml");
  Mapper.CDF_PROJECTION = ADDIN.resolveURI("proto/CDF.xml");

  /**
   * instance initializer
   */
   Mapper_prototype.init = function() {
    //call constructor for super class just in case a global mod needs to be communicated on down from the top-most jsx class, inheritance
    this.jsxsuper();
  };

  /**
   * Sets the log level for the logger instance used by the mapper; updates on-screen controls
   * @param intLogLevel {int}
   * @package
   */
   Mapper_prototype._setLogLevel = function(intLogLevel) {
     //update the selected item in the log menu
     var objLogMenu = this.getDescendantOfName("jsx_schema_loglevel");
     objLogMenu.selectItem(intLogLevel,true);

     //update the label that displays the log level
     var objLogLabel = this.getDescendantOfName("jsx_schema_log_title");
     var strLevelText = objLogMenu.getRecord(intLogLevel).jsxtext;
     objLogLabel.setText("Mapper Log - (" + strLevelText + " Level)",true);

     //update the logger itself to listen at the appropriate level
     Mapper._LOG.setLevel(intLogLevel);
  };

  /**
   * Returns a map of all known selection namespaces unique to the WSDL or schema being parsed. If the given XML Document that contains objNode does not contain a map, <code>getDeclaredNamespaces</code> will be called on the document.
   * @param strURL {String}
   * @return {Object}
   * @private
   */
  Mapper_prototype.getNSMap = function(strURL) {
    if (!strURL) strURL = this.getSourceDocumentURL();
    var objMapHash = this.getNSMaps();

    //if the mapper is unaware of a given selection namespace, register...(only works for wsdl (single doc))
    if (!objMapHash[strURL]) {
      //get the source document
      var objDoc = this.getSourceDocument(strURL);
      if (objDoc) {
        //simulate the namespace axis for firefox by creating a queryable attribtue axis
        objDoc.createNamespaceAxis();

        //create the namespace map for resolving qnames for xpath queries
        objMapHash[strURL] = objDoc.getDeclaredNamespaces();
      } else {
        return;
      }
    }

    //return the Object map
    return objMapHash[strURL];
  };

  /**
   * gets collection (hash) of all mapped namespaces
   * @private
   */
  Mapper_prototype.getNSMaps = function() {
    //if the mapper is unaware of a given selection namespace, register...(only works for wsdl (single doc))
    if (typeof(this._jsx_sn_hash) == "undefined") this._jsx_sn_hash = {};
    return this._jsx_sn_hash;
  };

  /**
   * resets the nsmap
   * @private
   */
  Mapper_prototype.resetNSMap = function() {
    delete this._jsx_sn_hash;
  };

  /**
   * Gets the error log pane for the mapper
   * @return {jsx3.xml.Block}
   */
  Mapper_prototype.getOut = function() {
    return this.getDescendantOfName("jsx_schema_log");
  };

  /**
   * Called by the Log Handler bound to this class. Appends, @strMessage to the end of the out window
   * @param strMessage {String} formatted message to send to the out for the mapper
   */
  Mapper_prototype.out = function(strMessage) {
    var objGUI = this.getOut().getRendered();
    jsx3.html.insertAdjacentHTML(objGUI, "beforeEnd", "<pre class='jsxide_sysout'>" + strMessage + "</pre>");
    this.showLast();
  };

  /**
   * Called by the Log Handler bound to this class. Appends, @strMessage to the end of the out window
   * @param objMessage {Array<String>} formatted message to send to the out for the mapper
   */
  Mapper_prototype._out = function(objMessage) {
    var s = "";
    var maxLen = objMessage.length;
    for (var i=0;i<maxLen;i++) {
      s += "<pre class='jsxide_sysout jsxide_" + jsx3.util.Logger.levelAsString(objMessage[i][1]) + "'>" +
          objMessage[i][0] + "</pre>";
    }
    var objGUI = this.getOut().getRendered();
    jsx3.html.insertAdjacentHTML(objGUI, "beforeEnd", s);
    this.showLast();
  };

  /**
   * Called by out. Scrolls the last log message into view
   */
  Mapper_prototype.showLast = function() {
    // only ever queue one timeout as an optimization
    if (this._showtimeout == null) {
      var me = this;
      this._showtimeout = window.setTimeout(function() {
        delete me._showtimeout;
        var objGUI = me.getOut().getRendered();
        if (objGUI && objGUI.lastChild)
          objGUI.scrollTop = objGUI.lastChild.offsetTop;
      }, 0);
    }
  };

  /**
   * Gets the server managed by builder
   * @private
   */
  Mapper_prototype._getManagedServer = function() {
    var apps = jsx3.System.getAllApps();
    for (var i = 0; i < apps.length; i++)
      if (apps[i].getEnv("namespace") != "jsx3.IDE" && apps[i])
        return apps[i];

    //no server context within which to run the mapper.  alert user...
    Mapper._LOG.error("At least one component file must be open for edit in order to use the XML Mapping Utility. You must either create a new component or open an existing component to provide the mapper with the appropriate server context.",{instance:this});
  };

  /**
   * Gets the properties path for the mapper. Used by the IDE
   * @return {String}
   */
  Mapper_prototype.getPropertiesPath = function() {
    return ADDIN.resolveURI("properties/Mapper.xml");
  };

  /**
   * Gets the model events path for the mapper. Used by the IDE
   * @return {String}
   */
  Mapper_prototype.getModelEventsPath = function() {
   return ADDIN.resolveURI("events/Mapper.xml");
  };

  /**
   * Returns a CR-LF delimited list of supported URIs for WSDL, SOAP and Schema as understood by this class
   * @return {String}
   */
  Mapper_prototype.getSupportedNamespaces = function() {
    var str = "";
    for (var p in Mapper._ns) {
      str+= Mapper._ns[p] + "\n";
    }
    return str;
  };

  /**
   * Returns a handle to the editor that will provide save/open/new/close services for the mapper (for now the dialog instance containing the mapper)
   * @return {jsx3.gui.Dialog}
   * @private
   */
  Mapper_prototype.getEditor = function() {
    //try to get the cached reference
    if (typeof(this._editor) == "undefined") {
      //try and get the ancestor container (the editor)
      if ((objEditor = this.getAncestorOfType(jsx3.gui.Dialog)) == null) {
        //spoof the editor for now (just for testing)
        var objEditor = {};
        objEditor.setDirty = function(bDirty) {return;};
        objEditor.getDirty = function() {return true;};
        objEditor.reset = function() {return;};
      }

      this._editor = objEditor;
    }

    return this._editor;
  };

  /**
   * Gets the test utility used by the mapper
   * @param objJSX {jsx3.gui.Model} if present locate the mapper that is owned by the common server common to objJSX
   * @return {jsx3.ide.MapTester | null}
   * @private
   */
  Mapper_prototype.getTester = function(objJSX) {
    var oServer = (objJSX != null) ? objJSX.getServer() : this.getServer();
    return oServer.getJSXById(this.testerid);
  };

  /**
   * Sets JSX Id for the tester bound to this mapper
   * @param strId {String}
   * @private
   */
  Mapper_prototype.setTesterId = function(strId) {
    if (strId != null) {
      this.testerid = strId;
    } else {
      delete this.testerid;
    }
  };

 /**
   * Gets the content (the actual CTF rules file) that will be saved to the file system by the containing map editor
   * @return {String} valid CDF document
   * @private
   */
  Mapper_prototype.getContent = function() {
    //TO DO: how to provide xml encoding information????follow-up with Jesse
    //append xml prolog
    var strRulesXML = this.getRulesXML() + "";
    var oRe = /^<\?xml[^\?^]*\?>/;
    var strProlog = (strRulesXML.search(oRe) == 0) ? '' : '<?xml version="1.0"?>\n';
    return strProlog + strRulesXML;
  };

  /**
   * Returns true if @strType is a Schema-defined Simple Type (as defined by <code>jsx3.ide.mapper.Mapper._ns.schema2001</code>)
   * @param objNode {jsx3.xml.Entity} XML Entity (Element)
   * @param strType {String} a type such as "string" or "int". Note: this can also be namespace qualified. For example, xsd:string, xsd:int, etc.
   * @return {boolean}
   * @private
   */
  Mapper_prototype.isSimpleNode = function(objNode,strType) {
    if (strType && strType != "") {
     var oType = strType.split(":");
     if (oType.length == 2) {
       return this._isSimpleNode(objNode,oType[0]);
     } else {
       return typeof(jsx3.net.Service.simpletypes[strType]) != "undefined";
     }
   }
   return false;
  };

  /**
   * recursively traverses up the WSDL/Schema tree to find a namespace declaration on an ancestor node matching the prefix for <code>jsx3.ide.mapper.Mapper._ns.schema2001</code>
   * @param objNode {jsx3.xml.Entity} XML Entity (Element)
   * @param strType {String} a type such as "string" or "int". Note: This is not namespace qualified.
   * @return {boolean}
   * @private
   */
  Mapper_prototype._isSimpleNode = function(objNode,strType) {
    for (var i=objNode.getAttributes().iterator(); i.hasNext(); ) {
      var objAtt = i.next();
      if (objAtt.getBaseName() == strType && objAtt.getValue() == Mapper._ns.schema2001) return true;
    }
    var objPNode = objNode.getParent();
    return objPNode != null ? this._isSimpleNode(objPNode,strType) : false;
  };

  /**
   * Returns the base name (if applicable) for a potentially qualified node name. For example, if <b>xs:jimbo</b> is passed, <b>jimbo</b> will be returned.
   * @param strNodeName {String} node name
   * @return {String}
   */
  Mapper_prototype.getBaseName = function(strNodeName) {
    var objNodeName = strNodeName.split(":");
    if (objNodeName.length > 1 ) strNodeName = objNodeName[1];
    return strNodeName;
  };

  /**
   * Returns the prefix (if applicable) for a potentially qualified node name. For example, if <b>xs:jimbo</b> is passed, <b>xs</b> will be returned.
   * If no prefix exists, null is returned.
   * @param strNodeName {String} node name
   * @return {String}
   */
  Mapper_prototype.getPrefix = function(strNodeName) {
    var objNodeName = strNodeName.split(":");
    return (objNodeName.length > 1 ) ? objNodeName[0] : null;
  };

 /**
   * Gets a reference to the Rules Tree
   * @return {jsx3.gui.Tree}
   */
  Mapper_prototype.getRulesTree = function() {
    return this.getDescendantOfName("jsx_schema_rulestree");
  };

 /**
   * Resets the rules tree used by the mapper: Resets its XML source to an empty CDF document. Sets selection to null
   */
  Mapper_prototype.resetRulesTree = function() {
    //get handle to the rulestree and remove any existing content (nodes from the last WSDL that was parsed in the utility)
    var objTree = this.getRulesTree();
    if (objTree) {
      this.getServer().getCache().setDocument(objTree.getXMLId(), (new jsx3.xml.Document()).load(ADDIN.resolveURI(objTree.getXMLURL())));
      objTree.setValue("");
      objTree.repaint();
    }
  };

  /**
   * Resets the editor pane
   */
  Mapper_prototype.resetEditorPane = function() {
    var objJSX = this.getEditorPane();
    delete objJSX._jsxuri;
    objJSX.removeChildren();
    objJSX.load("components/Inputs/wsdl.xml");
  };

  /**
   * Resets the schemasource pane
   */
  Mapper_prototype.resetSourcePane = function() {
    var objBlock, objGrid;
    if ((objBlock = this.getDescendantOfName("jsx_schema_sourcexml")) != null) {
      objBlock.setDisplay(jsx3.gui.Block.DISPLAYNONE,true);
      var oDoc = new jsx3.xml.Document();
      oDoc.loadXML("<not_applicable/>");
      this.getServer().getCache().setDocument(objBlock.getXMLId(),oDoc);
    } else if ((objGrid = this.getDescendantOfName("jsx_schema_profile")) != null) {
      objGrid.getServer().getCache().clearById(objGrid.getXMLId());
      objGrid.repaintData();
    }
  };

 /**
   * Resets the mapper to its initial state
   */
  Mapper_prototype.reset = function() {
    Mapper._LOG.trace("------------------\nXML Mapping Utility about to be reset...",{instance:this});

    //remove id of node in tree mapped to the current rule being edited
    delete this._currentid;

    //about to clear log
    this.resetCacheData();

    //reset the log
    this.getOut().setText("",true);

    //reset rules tree used by the mapper (its value and its CDF source)
    this.resetRulesTree();

    //reset wsdl and rules refs bound to the bound service instance
    this.resetSourceDocument();

    //reset to default state, prompting user for input docs as pattern master to begin the parse
    var objParent = this.getDescendantOfName("jsx_schema_mapper_body");
    objParent.removeChildren();

    objParent.load("components/default.xml",true);

    //close the tester dialog if it is open
    if (this.getTester()) this.getTester().close();

    //tell the editor container that our state is default (nothing loaded)
    this.getEditor().onParse(0);
  };

 /**
   * Gets the  URL for the pattern master source document being used to create this branch of the Rules Tree.
   * @param objNode {jsx3.xml.Entity} node in the rules tree to locate the first ancestor with a 'src' attribute for; optional
   * @return {String}
   */
  Mapper_prototype.getSourceDocumentURL = function(objNode) {
    if (objNode) {
      var src;
      while (objNode != null && (src = objNode.getAttribute("src")) == null) objNode = objNode.getParent();
      return src;
    }
    return this.sourcedocurl;
  };

 /**
   * Sets the  URL for the pattern master source document being used to create the Rules Tree. Binds this value on the Rules Tree to persist when the rule is saved
   * @param {String} URL (relative or absolute)
   */
  Mapper_prototype.setSourceDocumentURL = function(strURL) {
    this.sourcedocurl = strURL;
  };

 /**
   * Gets a reference to the Editor Pane for the mapper (where bindings occur)
   * @return {jsx3.gui.Block}
   */
  Mapper_prototype.getEditorPane = function() {
    return this.getDescendantOfName("jsx_schema_binding");
  };

 /**
   * Adds a parsed pattern master document (schema, wsdl, or xml/xhtml) with all imports likewise embedded and parsed. Up to two documents are supported.
   * @param objDoc {jsx3.xml.Document}
   */
  Mapper_prototype.addSourceDocument = function(objDoc,strURL) {
    if (this.sourcedoc == null) this.sourcedoc = {};
    this.sourcedoc[strURL] = objDoc;
    //by default the last input pattern master that was added should own the default instance (simplifies resolving the source WSDL during parsing)
    this.setSourceDocumentURL(strURL);
  };

 /**
   * Returns the parsed pattern master document (schema, wsdl, or xml/xhtml)
   * @return {jsx3.xml.Document}
   */
  Mapper_prototype.getSourceDocument = function(strURL) {
    if (!strURL) strURL = this.getSourceDocumentURL();
    if (this.sourcedoc != null) return this.sourcedoc[strURL];
  };

 /**
   * Clears the parsed pattern master document(s) (schema, wsdl, or xml/xhtml)
   * @return {jsx3.xml.Document}
   */
  Mapper_prototype.resetSourceDocument = function() {
    delete this.sourcedoc;
  };

 /**
   * Gets the namespace URI for the version of schema to use (as defined by the WSDL)
   * @return {String}
   */
  Mapper_prototype.getSchemaNS = function() {
    return this._schemans;
  };

 /**
   * Sets the namespace URI for the version of schema to use (as defined by the WSDL)
   * @param strNS {String} namespace URI for the schema
   */
  Mapper_prototype.setSchemaNS = function(strNS) {
    this._schemans = strNS;
  };

 /**
   * Gets the Rules Tree
   * @return {jsx3.xml.Document}
   */
  Mapper_prototype.getRulesXML = function() {
    return this.getRulesTree().getXML();
  };

 /**
   * Returns the named operation node in the Rules Tree
   * @param strOpName {String} The named operation rule to return
   * @return {jsx3.xml.Entity | null}
   */
  Mapper_prototype.getRulesOperation = function(strOpName) {
    return this.getRulesXML().selectSingleNode("//record[@opname='" + strOpName + "']");
  };

  /**
   * Returns whether or not @objChild is a descendant node of @objParent
   * @param objChild {jsx3.xml.Entity} child node
   * @param objParent {jsx3.xml.Entity} potential ancestor node
   * @return {boolean}
   */
  Mapper_prototype.isDescendant = function(objChild,objParent) {
    if (objParent != null) {
      var objParentNode = objChild.getParent();
      var objRoot = objParentNode.getRootNode();
      while (!(objParentNode.equals(objRoot))) {
        if (objParentNode.equals(objParent)) return true;
        objParentNode = objParentNode.getParent();
      }
    }
    return false;
  };

  /**
   * Returns whether or not @objChild is a descendant of one of the nodes in @objParentArray
   * @param objChild {jsx3.xml.Entity} child node
   * @param objParentArray {Array<jsx3.xml.Entity>} potential ancestor node
   * @return {boolean}
   */
  Mapper_prototype.isDescendantArray = function(objChild,objParentArray) {
    for (var i=0;i<objParentArray.length;i++) {
      if (this.isDescendant(objChild,objParentArray[i])) return true;
    }
    return false;
  };

 /**
   * Returns whether or not the URL is absolute
   * @param strURL {String} Relative or absolute URL
   * @return {boolean}  Returns true if @strURL is absolute
   */
  Mapper_prototype.isAbsoluteURL = function(strURL) {
    var re = /^\/|^(http[s]?:\/\/)/i;
    return strURL.search(re) == 0;
  };

 /**
   * Sets the input document type for the mapper (what is being parsed to create the rules tree)
   * @param TYPE {String} One of: xml, schema, wsdl
   */
  Mapper_prototype.setInputType = function(TYPE) {
    this._inputtype = TYPE;
  };

  /**
   * Gets the input document type for the mapper (what is being parsed to create the rules tree)
   * @return {String | null} One of: xml, schema, wsdl
   */
  Mapper_prototype.getInputType = function() {
    return this._inputtype;
  };

 /**
   * Toggles the input form to present to the user, allowing the user to parse a WSDL- or an XML/XHTML/Schema-document
   * @param TYPE {String}  One of: xml, wsdl
   */
  Mapper_prototype.toggleInputType = function(TYPE) {
    //load approprate screen given the type of input document the user is providing
    var objParent = this.getDescendantOfName("jsx_shema_input_types");
    objParent.removeChildren();
    objParent.load("components/Inputs/" + TYPE + ".xml",true);
  };

 /**
   * Loads the core of the mapper; called after the initial screen has been unloaded (the screen where users enter the wsdl or xml source pattern masters)
   */
  Mapper_prototype.loadRulesPane = function() {
    var objParent = this.getDescendantOfName("jsx_schema_mapper_body");
    objParent.removeChildren();
    objParent.load("components/main.xml",true);
  };

 /**
   * Validates against the schema version: http://www.w3.org/2001/XMLSchema
   * @param objDoc {jsx3.xml.Document}
   * @return {String}
   * @private
   */
  Mapper_prototype.resolveSchemaVersion = function(objDoc) {
    return Mapper._ns.schema2001;
    //TO DO: only 2001 schema is supported; use the XSLT to declare whether or not it IS. Then when user in trace mode, they'll be alerted through that mechanism
  };

 /**
   * Loads the soucre document (pattern master) and tries to load all referenced WSDL imports and Schema imports (if relevant)
   * to create a single combined XML document
   * @param strBaseURL {String} Relative or absolute URL for the WSDL. Relative (e.g., a local copy) is preferred
   * @return {jsx3.xml.Document} WSDL document with imports included in the literal WSDL parse tree.
   */
  Mapper_prototype.openSourceDocument = function(strBaseURL) {
    /* @jsxobf-clobber */
    this._activeuris = {};
    //resolve the URI
    var objServer = this._getManagedServer();
    if (!objServer) return;
    Mapper._LOG.trace("Resolving URL: " + strBaseURL,{instance:this});
    strBaseURL = objServer.resolveURI(strBaseURL);
    Mapper._LOG.trace("Parsing Document: " + strBaseURL,{instance:this});

    //load the given WSDL
    var objDoc = new jsx3.xml.Document();
    //strBaseURL = jsx3.resolveURI(strBaseURL);
    objDoc.load(strBaseURL);
    var objBaseURI = new jsx3.net.URI(strBaseURL);

    if (! objDoc.hasError()) {
      var objRoot = objDoc.getRootNode();
      var strMyURI = objRoot.getNamespaceURI();
      if (strMyURI == Mapper._ns.wsdl) {
        Mapper._LOG.trace("Document Type: WSDL (" + Mapper._ns.wsdl + ")",{instance:this});

        //get what version of Schema is used by the WSDL definition (although 1999 is not supported, it's 90% similar, so I do allow the parse to continue for convenience; however, an error is output to the mapper log)
        var strNS = this.resolveSchemaVersion(objDoc);
        Mapper._LOG.trace("Validating -Schema Namespace: '" + strNS + "'",{instance:this});
        this.setSchemaNS(strNS);
        objDoc.setSelectionNamespaces("xmlns:xsd='" + strNS + "' xmlns:wsdl='http://schemas.xmlsoap.org/wsdl/' xmlns:soap='http://schemas.xmlsoap.org/wsdl/soap/' xmlns:soapenc='http://schemas.xmlsoap.org/soap/encoding/'");

        //expanded the WSDL by importing all referenced parts (also handles nested imports)
        var objImportNodes = objDoc.selectNodes("/wsdl:definitions/wsdl:import[@location]");
        for (var i=objImportNodes.iterator(); i.hasNext(); ) {
          //get import for this iteration
          var objImportNode = i.next();

          //3.7: move Import loading to external method to allow recursion
          this.loadWSDLImports(objBaseURI,objDoc,objImportNode,objImportNode);
        }

        //make sure the WSDL has a types section
        var objMyType = objDoc.selectSingleNode("/wsdl:definitions/wsdl:types");
        if (!objMyType) {
          //the section does not exist in the wsdl. load here
          var objNewType =  objDoc.getRootNode().createNode(jsx3.xml.Entity.TYPEELEMENT,"wsdl:types",Mapper._ns.wsdl);
          objDoc.getRootNode().appendChild(objNewType);
        }

        //now that the WSDL is assembled, expand any schema imports (also handles nested imports)
        objImportNodes = objDoc.selectNodes("//xsd:schema/xsd:import[@schemaLocation] | //xsd:schema/xsd:include[@schemaLocation]");
        var objTypeNode = objDoc.selectSingleNode("/wsdl:definitions/wsdl:types");
        for (var i=objImportNodes.iterator(); i.hasNext(); ) {
          var objImportNode = i.next();
          this.loadSchemaImports(objBaseURI,objDoc,objImportNode,objTypeNode);
        }

        //set input type as wsdl
        this.setInputType(Mapper.TYPE_WSDL);
      } else if (strMyURI == Mapper._ns.schema2001 || strMyURI == Mapper._ns.schema1999) {
        Mapper._LOG.trace("Document Type: Schema (" + strMyURI + ")",{instance:this});
        if (strMyURI == Mapper._ns.schema1999) Mapper._LOG.error("Outdated Schema Version: '" + Mapper._ns.schema1999 + "'. Must update to version, '" + Mapper._ns.schema2001 + "'. The parse will continue, but may fail.",{instance:this});

        //set input type as schema
        this.setSchemaNS(strMyURI);
        this.setInputType(Mapper.TYPE_SCHEMA);

        //update the selection namespace on the source document, so the queries in doDrill, parseSimple, and parseComplex will work
        objDoc.setSelectionNamespaces("xmlns:xsd='" + strMyURI + "'");

        //3.7: schema imports are now added recursively in order to allow for nested imports and includes
        var objImportNodes = objDoc.selectNodes("//xsd:schema/xsd:import[@schemaLocation] | //xsd:schema/xsd:include[@schemaLocation]");
        for (var i=objImportNodes.iterator(); i.hasNext(); ) {
          var objImportNode = i.next();
          this.loadSchemaImports(objBaseURI,objDoc,objImportNode);
        }
      } else {
        Mapper._LOG.trace("Document Type: XML",{instance:this});
        this.setInputType(Mapper.TYPE_XML);
      }
    } else {
      Mapper._LOG.error("The URL, " + strBaseURL + ", does not return a valid XML document.",{instance:this});
    }

    if (Mapper._LOG.getLevel() == Logger.TRACE && (this.getInputType() == Mapper.TYPE_WSDL || this.getInputType() == Mapper.TYPE_SCHEMA)) {
      var url = ADDIN.resolveURI("xsl/schema_support.xsl");
      var objFilter = jsx3.IDE.getCache().getOrOpenDocument(url, null, jsx3.xml.XslDocument.jsxclass);
      var strProfile = objFilter.transform(objDoc);
/* @JSC */ if (jsx3.CLASS_LOADER.SAF  || jsx3.CLASS_LOADER.FX) {
      strProfile = strProfile.replace(/<\/?transformiix:result[^>]*>/gi,"");
/* @JSC */ }
      Mapper._LOG.trace("Input Schema Profile:" + strProfile,{instance:this});
    }
    return objDoc;
  };


  Mapper_prototype.loadWSDLImports = function(objBaseURI, objDoc, objImportNode, objImportRoot) {
    //get true URL for import (may be relative to path for the WSDL)
    var strImportURL = objImportNode.getAttribute("location");
    if (!this.isAbsoluteURL(strImportURL))
        strImportURL = objBaseURI.resolve(strImportURL).toString();

    if(this._activeuris[strImportURL] == 1) {
      Mapper._LOG.trace("Parsing    -WSDL Import: '" + strImportURL + "' has already been added. The mapper will only import a file once and does not give priority to subsequent, duplicate imports or includes.",{instance:this});
    } else {
      this._activeuris[strImportURL] = 1;
      Mapper._LOG.trace("Parsing    -WSDL Import: '" + strImportURL + "'", {instance:this});
      //load the included file and append to the types
      var objAppend = new jsx3.xml.Document();
      //3.2 addition to support 3.0 msxml parser
      objAppend.load(strImportURL);
      var objError = objAppend.getError();
      if (objError.code == 0) {
        //reset the resolver base to be the URI of the element just loaded to ensure any of its nested imports are done in context of its location
        objBaseURI = new jsx3.net.URI(strImportURL);
        //to support improper implementations of the standard, transfer any XSD element straight over
        if (objAppend.getRootNode().getNodeName() == "schema") {
          //insert the schema node directly into the WSDL immediately before the import node that declared it
          //if the schema contains any imports or includes, the method loadSchemaImports will be called to handle them differently
          objDoc.insertBefore(objAppend.getRootNode(), objImportRoot);
        } else {
          var j = objAppend.getRootNode().getChildIterator();
          while (j.hasNext()) {
            var oTNode = j.next();
            if (oTNode.getNodeType() == jsx3.xml.Entity.TYPEELEMENT) {
              if (oTNode.getBaseName() != "import") {
                var oClone = oTNode.cloneNode(true);
                if (oClone != null && oClone instanceof jsx3.xml.Entity) {
                  objDoc.insertBefore(oClone, objImportRoot);
                } else {
                  Mapper._LOG.error("Import Failure. Could not resolve:\n" + oTNode, {instance:this});
                }
              } else {
                Mapper._LOG.trace("Recursing  -WSDL Import: " + oTNode, {instance:this});
                this.loadWSDLImports(objBaseURI, objDoc, oTNode, objImportRoot);
              }
            }
          }
        }
      } else {
        Mapper._LOG.error("The WSDL import located at '" + strImportURL + "' could not be parsed and added to the WSDL. Please make sure the document exists and that it is a valid WSDL import document.", {instance:this});
      }
    }
  };

  Mapper_prototype.loadSchemaImports = function(objBaseURI, objDoc, objImportNode, objImportRoot) {
    //get true URL for import (may be relative to path for the WSDL)
    var strImportURL = objImportNode.getAttribute("location") || objImportNode.getAttribute("schemaLocation");
    if (!this.isAbsoluteURL(strImportURL)) strImportURL = objBaseURI.resolve(strImportURL).toString();

    if(this._activeuris[strImportURL] ==1) {
      Mapper._LOG.trace("Parsing    -Schema Import: '" + strImportURL + "' has already been added. The mapper will only import a file once and does not give priority to subsequent, duplicate imports or includes.",{instance:this});
    } else {
      this._activeuris[strImportURL] = 1;
      Mapper._LOG.trace("Parsing    -Schema Import: '" + strImportURL + "'",{instance:this});
      //load the included file
      var objAppend = new jsx3.xml.Document();
      objAppend.load(strImportURL);
      var objError = objAppend.getError();

      if (objError.code == 0) {
        //load referenced imports into THIS import and then append THIS import into the root
        var strNS = this.resolveSchemaVersion(objAppend);
        objAppend.setSelectionNamespaces("xmlns:xsd='" + strNS + "' xmlns:wsdl='http://schemas.xmlsoap.org/wsdl/'");
        var objImportNodes = objAppend.selectNodes("//xsd:schema/xsd:import[@schemaLocation] | //xsd:schema/xsd:include[@schemaLocation]");
        //use the base url for the schema itself to resolve the absolute location of its referenced/imported items
        objBaseURI = new jsx3.net.URI(strImportURL);
        for (var i = objImportNodes.iterator(); i.hasNext();) {
          var objINode = i.next();
          this.loadSchemaImports(objBaseURI, objDoc, objINode, objImportRoot);
        }
        //when a root exists (e.g., if a WSDL..) insert before the root
        if(objImportRoot)
          objImportRoot.appendChild(objAppend.getRootNode());
        else
          objDoc.insertBefore(objAppend.getRootNode(), objImportNode);
      } else {
        Mapper._LOG.error("The Schema import located at '" + strImportURL + "' could not be parsed and added. Please make sure the document exists and that it is a valid WSDL import document.", {instance:this});
      }
    }
  };


 /**
   * Parses the input document into a General Interface Rules Tree
   * @param strURL {String} Relative or absolute URL for the WSDL, Schema, or XML document. Relative (e.g., a local copy) is preferred
   * @param bDeep {boolean} Default false. If true, the entire WSDL will be parsed. For now do not parse a WSDL containing recursive structures
   */
  Mapper_prototype.parseWSDL = function(strURL,bDeep) {
    //call to load the rules pane
    this.loadRulesPane();

    //apply a mask
    this.getDescendantOfName("jsx_schema_rules_container").showMask('<div>parsing inputs, please wait...</div>');

    //delay to parse the tree
    var my = this;
    window.setTimeout(function() { my.parseWSDLDelay(strURL,bDeep); },250);
  };

 /**
   * Parses the input document into a General Interface Rules Tree
   * @param strURL {String} Relative or absolute URL for the WSDL, Schema, or XML document. Relative (e.g., a local copy) is preferred
   * @param bDeep {boolean} Default false. If true, the entire WSDL will be parsed. For now do not parse a WSDL containing recursive structures
   * @return {boolean}  Returns true if the parse is successful
   */
  Mapper_prototype.parseWSDLDelay = function(strURL,bDeep) {
    //open the WSDL
    var objWSDL = this.openSourceDocument(strURL);

    //check if valid document
    if (this.getInputType() == Mapper.TYPE_WSDL) {
      //reset and set reference to the Rules Tree
      this.resetRulesTree();

      //set reference to the WSDL
      this.setSourceDocumentURL(strURL);
      this.addSourceDocument(objWSDL,strURL);

      //parse the WSDL/xml/schema
      this.parseServices();

      //call to handle final config now that the rules xml and source xml have been cached and the initial parse has been performed
      this.onParse();
    } else {
      //invalid doc
      this.getServer().alert("Invalid WSDL","The document, <b>" + jsx3.util.strTruncate(strURL, 40, null, 2/3)  + "</b>, is not in a supported WSDL format (the mapper has identified its format as <i>" + this.getInputType() + "</i>). Refer to the mapper log for more information.");
    }
  };

  /**
    * Parses the input document(s) into a GI Rules Tree
    * @param strOutURL {String} Relative or absolute URL for the Schema, or XML document to generate the outbound document map
    * @param strInURL {String} Relative or absolute URL for the Schema, or XML document to generate the inbound document map
    */
   Mapper_prototype.parseDocuments = function(strOutURL,strInURL) {
     //call to load the rules pane
     this.loadRulesPane();

     //apply a mask
     this.getDescendantOfName("jsx_schema_rules_container").showMask('<div>parsing inputs, please wait...</div>');

     //delay to parse the tree
     var my = this;
     window.setTimeout(function() { my.parseDocumentsDelay(strOutURL,strInURL); },250);
   };

  /**
    * Parses the input document(s) into a GI Rules Tree
    * @param strInURL {String} Relative or absolute URL for the Schema, or XML document to generate the inbound document map
    */
   Mapper_prototype.parseJSON = function(strInURL) {
     //call to load the rules pane
     this.loadRulesPane();

     //apply a mask
     this.getDescendantOfName("jsx_schema_rules_container").showMask('<div>parsing inputs, please wait...</div>');

     //delay to parse the tree
     var my = this;
     window.setTimeout(function() { my.parseJSONDelay(strInURL); },250);
   };

 /**
   * Parses the input document(s) into a GI Rules Tree
   * @return {String}
   */
  Mapper_prototype.getKey = function() {
    var objCDF = this.getRulesXML();
    do {
      var strId = "x" + parseInt(Math.random() * 100000);
      //nodes that support jsxid include data, record, mappings, headers, and restrictions
      var objNode = objCDF.selectSingleNode("//*[@jsxid='" + strId + "']");
    } while (objNode != null);
    return strId;
  };

  Mapper_prototype._buildTransactionTree = function(bXML) {
    //reset and set reference to the Rules Tree
    this.resetRulesTree();

    //add the root node (called 'transaction') to the Rules Tree
    var o = {};
    o.jsxid = this.getKey();
    var strId = o.jsxid;
    o.jsxtext = "Operation (Transaction)";
    o.type = "T";
    o.jsxopen = "1";
    o.opname = "jsxtransaction";
    if(this.getInputType() == Mapper.TYPE_JSON) {
      o.method = "SCRIPT";
      o.jsonp = "1";
    }
    var objRoot = this.getRulesTree().insertRecord(o,null,false);
    //create the 'headers' node (this holds http request headers)
    var nodeArray = [];
    if(bXML) {
      var objComplexNode = this.getComplexRule(objRoot,"headers");
      this.getRulesTree().insertRecord({jsxid:this.getKey(),name:"Content-Type",value:"text/xml"},objComplexNode.getAttribute("jsxid"),false);

      //add the input rule -- only xml source documents get an input (JSON does not support this concept)
      var o = {};
      o.jsxid = this.getKey();
      o.jsxtext = "Input (request)";
      o.type = "I";
      o.jsxopen = "1";
      nodeArray.push(this.getRulesTree().insertRecord(o,strId,false));
    }

    //add the output rule
    var o = {};
    o.jsxid = this.getKey();
    o.jsxtext = "Output (response)";
    o.type = "O";
    o.jsxopen = "1";
    nodeArray.push(this.getRulesTree().insertRecord(o,strId,false));
    return nodeArray;
  };


  /**
    * Parses the input document(s) into a GI Rules Tree
    * @param strInURL {String} Relative or absolute URL for the Schema, or XML document to generate the inbound document map
    */
   Mapper_prototype.parseJSONDelay = function(strInURL) {
     this.setInputType(Mapper.TYPE_JSON);
     var objNode = this._buildTransactionTree()[0];

     //loop to process documents to serve as the pattern master
     if (strInURL) {
       //open the file containing the json string (the pattern master)
       var strJSON = this._openJSON(strInURL);
       //check if the parse was successful
       if (strJSON) {
         //call method to convert the JSON string to XML
         var objJSONXML;
         try {
          objJSONXML = jsx3.net.Service.JSON2XML(strJSON);
         } catch(e) {
           Mapper._LOG.error(jsx3.NativeError.wrap(e).getMessage(),{instance:this});
         }

         if(objJSONXML) {
           //set reference to the WSDL for this iteration
           this.addSourceDocument(objJSONXML,strInURL);

           //set a ref to the source URL for the pattern master for this parse (the next time the rules file is opened this document can then be loaded)
           objNode.setAttribute("src",strInURL);

           //assume the endpoint URL is the same service as what was used for the initial parse
           objNode.getParent().setAttribute("endpoint",strInURL);

           //parse JSON using XML methods (since JSON is now XML)
           this.parseXML(objJSONXML,objNode,false,strInURL);
         } else {
           Mapper._LOG.error("JSON file could not be converted into a valid XML document: " + arguments[i],{instance:this});
         }
       }
     }

     //call handler to fire now that Rules Tree has been initialized
     this.onParse();
   };

   //opens a file with a JSON-formatted string; will evaluate the string and return as an object (or null)
   Mapper_prototype._openJSON = function(strBaseURL) {
     var objServer = this._getManagedServer();
     if (!objServer) return;
     Mapper._LOG.trace("Resolving URL: " + strBaseURL,{instance:this});
     strBaseURL = objServer.resolveURI(strBaseURL);
     Mapper._LOG.trace("Parsing JSON file: " + strBaseURL,{instance:this});
     var objReq = jsx3.net.Request.open("get",strBaseURL,false);
     objReq.send();
     var strJSON = objReq.getResponseText();
     return jsx3.util.strEmpty(strJSON) ? null : strJSON;
   };


 /**
   * Parses the input document(s) into a GI Rules Tree
   * @param strOutURL {String} Relative or absolute URL for the Schema, or XML document to generate the outbound document map
   * @param strInURL {String} Relative or absolute URL for the Schema, or XML document to generate the inbound document map
   * @return {boolean}  Returns true if the parse is successful
   */
  Mapper_prototype.parseDocumentsDelay = function(strOutURL,strInURL) {
    var nodeArray = this._buildTransactionTree(true);

    //loop to process documents to serve as the pattern master
    for (var i=0;i<2;i++) {
      if (arguments[i]) {
        //parse the given pattern master
        var objXML = this.openSourceDocument(arguments[i]);
        //check if the parse was successful
        if (this.getInputType()) {
          //set reference to the WSDL for this iteration
          this.addSourceDocument(objXML,arguments[i]);

          //set a ref to the source URL for the pattern master for this parse (the next time the rules file is opened this document can then be loaded)
          nodeArray[i].setAttribute("src",arguments[i]);

          //get the type of the pattern master
          if (this.getInputType() == Mapper.TYPE_SCHEMA) {
            //parse global elements in the schema (these would be any element nodes directly off root)
            this.parseGlobals(objXML,nodeArray[i],arguments[i]);
          } else if (this.getInputType() == Mapper.TYPE_XML) {
            //parse the xml document
            this.parseXML(objXML,nodeArray[i],i==0,arguments[i]);
          }
        }
      }
    }

    //call handler to fire now that Rules Tree has been initialized
    this.onParse();
  };

 /**
   * Called by parseWSDL. Parses a Schema document into a rules tree
   * @param objXML {jsx3.xml.Document} Source document used to generate the rules tree
   * @param objParent {jsx3.xml.Entity} node to which to bind this branch of the Rules Tree
   */
  Mapper_prototype.parseGlobals = function(objXML,objParent,strURL) {
    //get matching element being referenced (is a global element as direct child of schema)
    var objMap = this.getNSMap(strURL);
    var objElementNodes = objXML.selectNodes("//" +  objMap[this.getSchemaNS()] + ":schema/" +  objMap[this.getSchemaNS()] + ":element[@name]",objMap);
    var strParentId = objParent.getAttribute("jsxid");
    for (var i=objElementNodes.iterator(); i.hasNext(); ) {
      var objElementNode = i.next();
      Mapper._LOG.trace("Adding         -Global: " + objElementNode.getAttribute("name"),{instance:this});
      this.parseComplex(strParentId,objElementNode,true);
    }
  };

 /**
   * Called by parseWSDL. Parses an XML document into a rules tree
   * @param objXML {jsx3.xml.Document} URL (relative) for the rules file to edit
   * @param objParent {jsx3.xml.Entity} node to which to bind this branch of the Rules Tree
   * @param bInputDocument {boolean} if true, this is an input document (these are handled differently -- do default values assigned)
   */
  Mapper_prototype.parseXML = function(objXML,objParent,bInputDocument) {
    //TO DO: make sure the nsmap doesn't need to be declared for this document (probably not, since not introspecting namespaces)
    this.parseXMLRecurse(objXML.getRootNode(),this.getRulesTree(),objParent.getAttribute("jsxid"),0,bInputDocument);
  };

 /**
   * Called by parseXML. recursively parses the input document. populates the rules tree
   * @param objNode {jsx3.xml.Entity} node in source XML doc to convert to a node in the rules tree
   * @param objRulesTree {jsx3.gui.Tree} rules tree to populate
   * @param strRuleParentId {String} id of parent rule in the rules tree
   * @param intDepth {int} current depth in the rules tree. use for flag for auto-displaying parsed nodes
   */
  Mapper_prototype.parseXMLRecurse = function(objNode,objRulesTree,strRuleParentId,intDepth,bInputDocument) {
    //add self then kids
    var strType = objNode.getNodeType();
    var o = {};
    o.jsxtext = ((strType == jsx3.xml.Entity.TYPECDATA) ? "CDATA" : objNode.getNodeName()) + "";
    if (o.jsxtext.indexOf(":") > 0)
      o.jsxtext = this.getBaseName(o.jsxtext);
    o.tns = objNode.getNamespaceURI();
    o.jsxid = this.getKey();
    o.type = (strType == jsx3.xml.Entity.TYPEELEMENT) ? "E" : ((strType == jsx3.xml.Entity.TYPECDATA)?"D":"A");
    if (strType == jsx3.xml.Entity.TYPEELEMENT) o.path = this.getMyPath(objNode);
    if (intDepth < Mapper.EXPAND_TO_DEPTH) o.jsxopen = 1;
    var myCDFNode = objRulesTree.insertRecord(o,strRuleParentId,false);
    if (bInputDocument && strType != jsx3.xml.Entity.TYPEELEMENT)
      this.bindComplexRule(objRulesTree,myCDFNode,"mappings","Script","setValue(\"" + jsx3.util.strEscapeHTML(objNode.getValue()) + "\");");

    //process descendants if type element
    if (objNode.getNodeType() == jsx3.xml.Entity.TYPEELEMENT) {
      //add child attributes
      for (var i=objNode.getAttributes().iterator(); i.hasNext(); ) {
        var objAtt = i.next();
        if (objAtt.getNodeName().indexOf("xmlns:") == 0 || objAtt.getNamespaceURI() == jsx3.xml.Document.SEARCHABLE_NAMESPACE) {
          //do not persist an attribute if it is an xmlns declaration or the resolve GI equivalent
        } else if (objAtt.getNodeName().indexOf("xmlns") == 0) {
          //instead of adding the xmlns attribute, add the tns attribute to the existing node (which is equivalent)
          if(objNode.getPrefix() == "")
            myCDFNode.setAttribute("tns",objAtt.getValue());
        } else {
          this.parseXMLRecurse(objAtt,objRulesTree,o.jsxid,intDepth + 1,bInputDocument);
        }
      }

      //add child elements
      var bHasText = false;
      for (var i= objNode.getChildIterator(); i.hasNext(); ) {
        var objKid = i.next();
        if (objKid.getNodeType() == jsx3.xml.Entity.TYPEELEMENT) {
          this.parseXMLRecurse(objKid,objRulesTree,o.jsxid,intDepth + 1,bInputDocument);
        } else if (objKid.getNodeType() == jsx3.xml.Entity.TYPETEXT) {
          bHasText = true;
          //3.3: removed the auto-addition of a script binding. Prior did not reflect common usage. Better to assume all text is
          //     to be dynamically added via a developer-defined mapping.  (non-element mappings will still be auto-added as this is more common as kept values)
          //if (bInputDocument) this.bindComplexRule(objRulesTree,myCDFNode,"mappings","Script","setValue(\"" + objKid.getValue().escapeHTML() + "\");");
        } else if (objKid.getNodeType() == jsx3.xml.Entity.TYPECDATA) {
          this.parseXMLRecurse(objKid,objRulesTree,o.jsxid,intDepth + 1,bInputDocument);
        }
      }

      if (!bHasText || strType == jsx3.xml.Entity.TYPECDATA) myCDFNode.setAttribute("type","C");
    }
  };

 /**
   * Validates whether or not a complex structure on a given rule exists. if not, creates the complext structure. returns the complex structure
   * @param objNode {jsx3.xml.Entity} node in source XML doc to bind complex rule to
   * @param TYPE {jsx3.gui.Tree} one of: mappings, headers, restrictions
   * @return {jsx3.xml.Entity} the given complex node
   */
  Mapper_prototype.getComplexRule = function(objNode,TYPE) {
    var objCNode = objNode.selectSingleNode(TYPE);
    if (!objCNode) {
      var objCNode = objNode.createNode(jsx3.xml.Entity.TYPEELEMENT,TYPE);
      objCNode.setAttribute("jsxid",this.getKey());
      objNode.appendChild(objCNode);
    }
    return objCNode;
  };

 /**
   * binds a complex rule to the rules tree
   * @param objTree {jsx3.xml.Tree} rules tree instance
   * @param objNode {jsx3.xml.Entity} node in source XML doc to bind the complex rule to
   * @param TYPE {jsx3.gui.Tree} one of: mappings, headers, restrictions
   * @param strName {String}
   * @param strValue {String}
   * @param strId {String} optional CDF id (if passed, this is considered an update, not insert of a complex rule)
   * @return {jsx3.xml.Entity} rule node just added to the complex node parent
   */
  Mapper_prototype.bindComplexRule = function(objTree,objNode,TYPE,strName,strValue,strId) {
    var objComplexNode = this.getComplexRule(objNode,TYPE);
    return objTree.insertRecord({jsxid:((strId)?strId:this.getKey()),name:strName,value:strValue},objComplexNode.getAttribute("jsxid"),false);
  };

 /**
   * Called by owning editor; opens the given Rules file and preps the mapper for use
   * @param strURL {String} URL (relative) for the rules file to edit
   */
  Mapper_prototype.onOpen = function(strURL) {
    //load the interface (rules tree, binding panes, etc)
    this.resetCacheData();
    this.loadRulesPane();

    //apply a mask
    this.getDescendantOfName("jsx_schema_rules_container").showMask('<div>parsing inputs, please wait...</div>');

    if (strURL != Mapper.NEW_FILE_PATH) {
      //delay to parse the tree
      var my = this;
      window.setTimeout(function() { my.onOpenDelay(strURL);  },250);
    } else {
      this.reset();
    }
  };

 /**
   * Called by owning editor; opens the given Rules file and preps the mapper for use
   * @param strURL {String} URL (relative) for the rules file to edit
   */
  Mapper_prototype.onOpenDelay = function(strURL) {
    //open the Rules File and place in cache, using the ID of the rules tree
    var objXML = this.getRulesTree().getServer().getCache().openDocument(strURL);

    //validate that this is a good document of the correct type
    Mapper._LOG.trace("Validating -Checking Rules File: '" + strURL + "'.",{instance:this});
    var objXML = this.validateOnOpen(objXML);
    if (objXML) {
      //disable the wsdl parser button for open/enable for new
      if (strURL != Mapper.NEW_FILE_PATH) {
        //first determine if this is WSDL or "other" input type
        var objSources = objXML.selectNodes("//record[@src]");
        if (objSources.size() == 0) {
          //the mapper was used, but without any source documents; although stupid, should be allowed???
          Mapper._LOG.trace("No inputs (patter master) could be found for the CTF document, '" + strURL + "'.",{instance:this});
        } else {
          for (var i=objSources.iterator(); i.hasNext(); ) {
            var objSource = i.next();
            var strWSDLURL = objSource.getAttribute("src");
            var objFirstRule = objSource.selectSingleNode("record");
            if(objFirstRule && objFirstRule.getAttribute("tns") == jsx3.net.Service.json_namespace) {
              //this given inbound or outbound rule contains a JSON rule; handle appropriate
              var objJSON = this._openJSON(strWSDLURL);
              //check if the parse was successful
              if (objJSON) {
                Mapper._LOG.trace("Document Type: JSON",{instance:this});
                //call method to convert the JSON object to XML
                try {
                 var objJSONXML = jsx3.net.Service.JSON2XML(objJSON);
                } catch(e) {
                  Mapper._LOG.error(jsx3.NativeError.wrap(e).getMessage(),{instance:this});
               }
                if(objJSONXML) {
                  //set reference to the WSDL for this iteration
                  this.setInputType(Mapper.TYPE_JSON);
                  this.addSourceDocument(objJSONXML,strWSDLURL);
                } else {
                  Mapper._LOG.error("JSON file could not be converted into a valid XML document: " + strWSDLURL,{instance:this});
                }
              }
           } else {
              //standard xml: one of WSDL, schema, or XML
              this.addSourceDocument(this.openSourceDocument(strWSDLURL),strWSDLURL);
            }
          }
        }

        //bind in the cache now that any necessary upgrade from CXF to CDF is completed
        this.getRulesTree().getServer().getCache().setDocument(this.getRulesTree().getXMLId(),objXML);

        //call method to handle final config of editor now that rules and wsdl have been persisted
        this.onParse();
      }
    }
 };

  /**
    * Validates whether the @objXML is a valid rules file, if not tries to convert to the current version
    * @param objXML {jsx3.xml.Document} Rules File document (an XML document in CDF format)
    */
   Mapper_prototype.validateOnOpen = function(objXML) {
     if (objXML && objXML.getClass && objXML.getClass() == "jsx3.xml.Document") {
       if (! objXML.hasError()) {
         var objNode = objXML.selectSingleNode("//record[@jsxid='jsxwsdlroot']");
         if (objNode || objXML.getRootNode().getAttribute("jsxnamespace")) {
           var strNS = objXML.getRootNode().getAttribute("jsxnamespace");
           var strVersion = objXML.getRootNode().getAttribute("jsxversion");
           if (strNS == "jsx3.xml.Mapper" && strVersion == "1.0") {
             //this rules file was created using build 3.1 (convert to 3.2)
             if (objXML.selectSingleNode("//record[@soaparray]")) {
               //prior to 3.2, soap arrays were not handled correctly and only the WSDL has the necessary info. Tell user of the issue
               Mapper._LOG.error("Validating -The XML document located at '" + this.getEditor().getFilePath() + "' can not be updated from its 3.1.x format, because it contains SOAP Arary mappings. Mapping rules created prior to version 3.2 are missing critical information found only in the source WSDL, requiring that the WSDL be reparsed.",{instance:this});
               return false;
             } else {
               Mapper._LOG.warn(" Validating -The Rules file located at '" + this.getEditor().getFilePath() + "' is outdated (older than v3.2) and was updated when opened. Once saved, this file will no longer be compatible with previous versions of the mapper.",{instance:this});
               objXML = this.convert31Rule(objXML);
               this.getEditor().setDirty(true);
             }
           } else if (!(strNS == "jsx3.ide.mapper.Mapper" && strVersion == "1.0")) {
             //this rules file was created using build 3.0. Convert to 3.1.x and then to 3.2/3.3
             Mapper._LOG.warn(" Validating -The Rules file located at '" + this.getEditor().getFilePath() + "' is outdated (v3.0) and was updated when opened. Once saved, this file will no longer be compatible with previous versions of the mapper.",{instance:this});
             objXML = this.convert30Rule(objXML);
             if (objXML && ! objXML.hasError()) {
               if (objXML.selectSingleNode("//record[@soaparray]")) {
                 //prior to 3.2, soap arrays were not handled correctly and only the WSDL has the necessary info. Tell user of the issue
                 Mapper._LOG.error("Validating -The XML document located at '" + this.getEditor().getFilePath() + "' can not be updated from its 3.1.x format, because it contains SOAP Arary mappings. Mapping rules created prior to version 3.2 are missing critical information found only in the source WSDL, requiring that the WSDL be reparsed.",{instance:this});
                 return false;
               } else {
                 objXML = this.convert31Rule(objXML);
                 this.getEditor().setDirty(true);
               }
             } else {
               return false;
             }
           }
           //return true; the document checked out
           return objXML;
         } else {
           Mapper._LOG.error("Validating -The XML document located at '" + this.getEditor().getFilePath() + "' is not a valid Rules File and cannot be opened.",{instance:this});
         }
       } else {
         Mapper._LOG.error("Validating -The XML document located at '" + this.getEditor().getFilePath() + "' is invalid cannot be opened.",{instance:this});
       }
     } else {
       Mapper._LOG.error("Validating -An instance of the jsx3.xml.Document class was expected.",{instance:this});
     }

     //whenever an unsuccessful parse occurs, enable the save/saveas buttons
     this.getEditor().onParse(0);

     //return false to designate that an invalid rules file was opened
     return false;
   };

 /**
   * Converts a rules file created using the following builds (3.0 -to- 3.1beta2)
   * @param objXML {jsx3.xml.Document} Rules File document (an XML document in CDF format)
   */
  Mapper_prototype.convert30Rule = function(objXML) {
    Mapper._LOG.info(" Converting -The Legacy Rules file from CDF to CXF",{instance:this});
    var url = ADDIN.resolveURI("xsl/cdf_to_cxf.xsl");
    var objFilter = jsx3.IDE.getCache().getOrOpenDocument(url, null, jsx3.xml.XslDocument.jsxclass);
    return objFilter.transformToObject(objXML);
  };

 /**
   * Converts a rules file created using the following builds (3.1beta3 -to- 3.1.1hotfix2)
   * @param objXML {jsx3.xml.Document} Rules File document (an XML document in CXF format)
   */
  Mapper_prototype.convert31Rule = function(objXML) {
    Mapper._LOG.info(" Converting -The Legacy Rules file from CXF (3.1.1HF2) to CXF (3.2.0)",{instance:this});

    //1) convert paths that bind the CXF to the source Schema
    var objPaths = objXML.selectNodes("//record/@path");
    for (var i = objPaths.iterator(); i.hasNext(); ) {
      var objPath = i.next();
      objPath.setValue(Mapper.resolveElementPrefixes(objPath.getValue()));
    }
    var objRoot = objXML.selectSingleNode("//record[@type='W']");
    if (objRoot) objRoot.setAttribute("path","/jsx1:definitions");

    //2) create the document namespace (identifies this as v 3.2 to the system)
    objXML.getRootNode().setAttribute("jsxnamespace","jsx3.ide.mapper.Mapper");

    //3) convert the stubsrc location if pointing to the old location for stubs used prior to 3.2
    var objPaths = objXML.selectNodes("//record/@stubsrc");
    for (var i = objPaths.iterator(); i.hasNext(); ) {
      var objPath = i.next();
      var strPath = objPath.getValue();
      if (strPath.indexOf("JSX/addins/mapping/") == 0)
        objPath.setValue(strPath.replace("JSX/addins/mapping/","jsx://"));
    }

    //4) make sure all jsxids are unique
    var objPaths = objXML.selectNodes("//@jsxid");
    for (var i = objPaths.iterator(); i.hasNext(); )
      i.next().setValue("xcvt" + i);

    return objXML;
  };

 /**
   * Called after the WSDL has been initially parsed into a Rules Tree. Updates (enables/disables) various UI controls
   */
  Mapper_prototype.onParse = function() {
    //hide the mask that occluded the rules tree
    this.getDescendantOfName("jsx_schema_rules_container").hideMask();

    //preselect the first node in the rules tree (which calls onRuleSelect)
    var objTree = this.getRulesTree();
    objTree.repaint();
    objTree.setValue(objTree.getXML().selectSingleNode("//record").getAttribute("jsxid"));
    this.onRuleSelect();

    //whenever a successful parse occurs, enable the save/saveas buttons
    this.getEditor().onParse(1);

    //close the tester dialog if it is open
    if (this.getTester()) this.getTester().close();
  };

 /**
   * Returns the unique node path for the given schema node in the WSDL.  This is how bindings are maintained between the tree and the source WSDL
   * @param objSchemaNode {jsx3.xml.Entity} node in the schema to find the path for
   * @param objMap {Object} selection namespaces map
   * @return {String} valid XSL Path
   * @private
   */
  Mapper_prototype.getMyPath = function(objSchemaNode) {
    //TO DO: escape early if a "//" context-neutral query results in the exact node being found, saving space in the Rules File
    if (objSchemaNode) {
      //get hash of all registered namespaces (this will allow the query to be qualified (QName vs Name)
      var objMap = this.getNSMap();

      //3.5 enhancement: if the source node is a schema node try to resolve its path in a less brittle way ( targetNamespace not ordinal position
      var strName = objSchemaNode.getBaseName();
      if (strName != "schema"&& objSchemaNode.getNamespaceURI() == this.getSchemaNS()) {
        var strId = objSchemaNode.getAttribute("name");
        if (strId) {
          var objSchema = objSchemaNode.selectSingleNode("ancestor::" + objMap[this.getSchemaNS()] + ":schema",objMap);
          if(objSchema) {
            var strSTNS = objSchema.getAttribute("targetNamespace");
            if(!jsx3.util.strEmpty(strSTNS)) {
              var strMyQuery = "//" + objMap[this.getSchemaNS()] + ":schema[@targetNamespace='" + strSTNS + "']//" + objMap[this.getSchemaNS()] + ":" + strName + "[@name='" + strId + "']";
              var objDoc = this.getSourceDocument();
              var objNodes = objDoc.selectNodes(strMyQuery,objMap);
              if(objNodes.size() == 1)
                  return strMyQuery;
            }
          }
        }
      }

      //get path collection
      var objNodes = objSchemaNode.selectNodes("ancestor-or-self::*");
      var maxLen = objNodes.size();

      var s1 = "";
      for (var i=0;i<maxLen;i++ ) {
        var objCurNode = objNodes.get(i);

        //get the path query for this node (how its immediate parent would query for it
        var strQ = objCurNode.getNamespaceURI();
        var strName = objCurNode.getBaseName();
        if (objCurNode.getNodeType() == jsx3.xml.Entity.TYPEATTRIBUTE) strName = ("@" + strName);
        var strQName = ((strQ != "") ? (objMap[strQ] + ":") : "") + strName;

        //append index info if this node is part of a collection, is an element, and not root
        var strIndex = "";
        if (i > 0 && objCurNode.getNodeType() == jsx3.xml.Entity.TYPEELEMENT) {
          var objCNodes = objNodes.get(i-1).selectNodes(strQName,objMap);
          var intMax = objCNodes.size();

          for (var j=1;j<intMax;j++)
            if (objCNodes.get(j).equals(objCurNode)) strIndex = "[" + (j+1) + "]";
        }

        //concat query path
        s1 = s1 + "/" + strQName + strIndex;
      }
      return s1;
    }
    return "";
  };

 /**
   * Finds all Services described in the WSDL and adds thier CDF-formatted profile to the Rules Tree
   * @return {boolean} returns true if the WSDL contains at least one endpoint containing at least one operation containing at least one message
   */
  Mapper_prototype.parseServices = function() {
    //get the wsdl and its location
    var strWSDLURL = this.getSourceDocumentURL();
    var objWSDL = this.getSourceDocument();

    //query the WSDL for the available SOAP services (endpoints)
    var objMap = this.getNSMap();

    //create first node of the rules tree
    var o = {};
    var strRootId = this.getKey();
    o.jsxid = strRootId;
    o.jsxtext = "WSDL ("+ strWSDLURL + ")";
    o.jsxopen = "1";
    o.src = strWSDLURL;
    o.type = "W";
    o.path = this.getMyPath(objWSDL.getRootNode());
    Mapper._LOG.trace("Adding     -WSDL",{instance:this});
    this.getRulesTree().insertRecord(o,null,false);

    //only proceed if when the document was inspected (getNSMap) a concrete service was found.  If not, alert user to the issue
    if (objMap[Mapper._ns.soap]) {
      var strMyQuery = "/" +  objMap[Mapper._ns.wsdl] + ":definitions/" +
                              objMap[Mapper._ns.wsdl] + ":service/" +
                              objMap[Mapper._ns.wsdl] + ":port/" +
                              objMap[Mapper._ns.soap] + ":address";
      var objSOAPServices = objWSDL.selectNodes(strMyQuery,objMap);

      //add the service description(s) to the Rules Tree
      if (objSOAPServices.size() > 0) {
        //fill out services and their respective operations
        for (var i=objSOAPServices.iterator(); i.hasNext(); ) {
          //get handle to the given service for iteration
          var objSOAPService = i.next();

          //get the url for the endpoint
          var strLocation = objSOAPService.getAttribute("location");

          //add this Service to the Rules Tree
          var o = {};
          o.jsxid = this.getKey();
          o.jsxtext = "Service (" + jsx3.util.strTruncate(strLocation, 40, null, 2/3) + ")";
          o.jsxopen = "1"
          o.path = this.getMyPath(objSOAPService);
          o.type = "S";

          //get the Binding for this Service (a binding links a service to one or more operations)
          var strBindingName = this.getBaseName(objSOAPService.getParent().getAttribute("binding"));

          var strMyQuery = "/" + objMap[Mapper._ns.wsdl] + ":definitions/" + objMap[Mapper._ns.wsdl] + ":binding[@name='" + strBindingName + "']";
          var objBinding = objWSDL.selectSingleNode(strMyQuery,objMap);

          o.soapstyle = this.getBindingStyle(objBinding);
          Mapper._LOG.trace("Adding      -Service: " + strLocation,{instance:this});
          this.getRulesTree().insertRecord(o,strRootId,false);
          Mapper._LOG.trace("Defining     -SOAP Style: " + o.soapstyle,{instance:this});

          //list the operations bound to this service
          this.parseOperations(objBinding,o.jsxid,strLocation);
        }
        return true;
      } else {
        Mapper._LOG.error("The WSDL located at '" + strWSDLURL + "' does not contain a concrete address (i.e., '/wsdl:definitions/wsdl:service/wsdl:port/soap:address'). Abstract WSDLs as well as protocols such as FTP and HTTP are not supported by the mapper.",{instance:this});
      }
    } else {
      Mapper._LOG.error("The WSDL located at '" + strWSDLURL + "' does not contain a valid reference to a supported version of SOAP. At this time only the following namespace(s) are supported: '" + Mapper._ns.soap + "'.",{instance:this});
    }

    //allow user to view the WSDL to validate the error message
    this.getRulesTree().setValue(strRootId);
    this.getRulesTree().repaint();

    //return false
    return false;
  };

 /**
   * Gets the encoding (document or rpc)
   * @param objBinding {jsx3.xml.Entity} WSDL binding node (e.g., "/wsdl:definitions/wsdl:binding")
   */
  Mapper_prototype.getBindingStyle = function(objBinding) {
    //get the namespace map
    var objMap = this.getNSMap();

    //query the WSDL for the available SOAP services (endpoints)
    var strMyQuery = ".//" +  objMap[Mapper._ns.soap] + ":*[@style='document']";
    return (objBinding.selectSingleNode(strMyQuery,objMap) != null) ? "document" : "rpc";
  };

 /**
   * Finds all Operations described in the WSDL and adds their CDF-formatted profile to the Rules Tree
   * @param objBinding {jsx3.xml.Entity} WSDL binding node (e.g., "/wsdl:definitions/wsdl:binding")
   * @param strCDFParentId {String} CDF record id (jsxid) for node in the Rules Tree to which to append the operation(s)
   * @param strLocation {String} endpoint url for service to contact
   */
  Mapper_prototype.parseOperations = function(objBinding,strCDFParentId,strLocation) {
    //query for the bound operations and loop to add
    var objMap = this.getNSMap();
    var objOperations = objBinding.selectNodes(objMap[Mapper._ns.wsdl] + ":operation",objMap);

    //loop to add the bound operations
    for (var i=objOperations.iterator(); i.hasNext(); ) {
      var objOperation = i.next();

      //get the unique name for operation
      var strOperationName = objOperation.getAttribute("name");
      var o = {};
      o.jsxid = this.getKey();
      o.jsxtext = strOperationName;
      o.jsxopen = "1";
      o.opname = strOperationName
      o.endpoint = strLocation;
      //3.2: added default method
      o.method = "POST";
      o.type = "P";
      o.path = this.getMyPath(objOperation);

      //add the operation to the Rules Tree as a child of the service
      Mapper._LOG.trace("Adding       -Operation: " + strOperationName,{instance:this});
      var objOpNode = this.getRulesTree().insertRecord(o,strCDFParentId,false);

      //add soap action info
      //1) create the 'headers' node (this holds http request headers)
      var objComplexNode = this.getComplexRule(objOpNode,"headers");

      //2) create a new record object to represent the given header and value
      var objSOAPOperation = objOperation.selectSingleNode(objMap[Mapper._ns.soap] + ":operation",objMap);
      var strSOAPAction = (objSOAPOperation) ? objSOAPOperation.getAttribute("soapAction") : "";
      if (strSOAPAction == "") strSOAPAction = '""';
      var o = {};
      o.jsxid = this.getKey();
      o.name = "SOAPAction";
      o.value = strSOAPAction;

      //3) add soap action and content-type (text/xml) headers
      this.getRulesTree().insertRecord(o,objComplexNode.getAttribute("jsxid"),false);
      this.getRulesTree().insertRecord({jsxid:this.getKey(),name:"Content-Type",value:"text/xml"},objComplexNode.getAttribute("jsxid"),false);

      try {
        //parse Messages for this Operation
        this.parseMessages(objOpNode,objMap);
      } catch(e) {
        Mapper._LOG.error("Failed to parse messages for the operation, " + objOperation.getAttribute("name"),{instance:this});
        var objError = jsx3.lang.NativeError.wrap(e);
        Mapper._LOG.error("Desc: " + objError.getMessage(),{instance:this});
      }
    }
  };

 /**
   * Finds all messages (input, output, fault) for the operation, @strOperationName. When found add to the Rules Tree via 'parseMessage()'
   * @param objOpNode {jsx3.xml.Entity} operation node in the rules tree to bind the given messages (input, output, fault) to
   * @param objMap {Object} selection namespaces map
   * @private
   */
  Mapper_prototype.parseMessages = function(objOpNode,objMap) {
    //add the various message types
    var strOpName = objOpNode.getAttribute("opname");
    var strOpId = objOpNode.getAttribute("jsxid");

    //get XPath for the given operation node
    var strMyQuery = "/" +  objMap[Mapper._ns.wsdl] + ":definitions/" +
                            objMap[Mapper._ns.wsdl] + ":portType/" +
                            objMap[Mapper._ns.wsdl] + ":operation[@name='" + strOpName + "']";
    var objOperation = this.getSourceDocument().selectSingleNode(strMyQuery,objMap);
    this.parseMessage("input",strOpName,strOpId,objOperation,"Input (request)",objMap);
    this.parseMessage("output",strOpName,strOpId,objOperation,"Output (response)",objMap);
    this.parseMessage("fault",strOpName,strOpId,objOperation,"Fault (response variant)",objMap);
  };

 /**
   * Sets the 1) message use (encoded or literal); 2) message namespace; 3) encoding style (only soap encoding supported)
   * @param objProfile {Object} JavaScript object to be added-to with additional profile info about the given message
   * @param MESSAGETYPE {String} one of: input, output, fault
   * @param strOperationName {String} unqualified name for the operation
   * @param objMap {Object} selection namespaces map
   */
  Mapper_prototype.setMessageEncoding = function(objProfile,MESSAGETYPE,strOperationName,objMap) {
    //clear any prior reference to the parts for a message. For example, if a fault, clear info added by output message, if an output message clear info from input message.
    delete this.jsxparts;

    //set flag for encoding
    var strMyQuery = "/" +  objMap[Mapper._ns.wsdl] + ":definitions/" +
                            objMap[Mapper._ns.wsdl] + ":binding/" +
                            objMap[Mapper._ns.wsdl] + ":operation[@name='" + strOperationName + "']/" +
                            objMap[Mapper._ns.wsdl] + ":" + MESSAGETYPE + "/" +
                            objMap[Mapper._ns.soap] + ":body"
    var objBody, use, parts, namespace, encodingStyle;
    if (objBody = this.getSourceDocument().selectSingleNode(strMyQuery,objMap)) {
      if (use = objBody.getAttribute("use")) {
        Mapper._LOG.trace("Defining       -SOAP Use: " + use,{instance:this});
        objProfile.soapuse = use;
      }

      if (parts = objBody.getAttribute("parts")) {
        Mapper._LOG.trace("Defining       -SOAP Body Parts:  " + parts,{instance:this});
        //hold the parts in a temp variable (they'll be used when the parts are parsed to generate a more-specific query)
        this.jsxparts = parts;
      }

      if (namespace = objBody.getAttribute("namespace")) {
        Mapper._LOG.trace("Defining       -SOAP Namespace: " + namespace,{instance:this});
        objProfile.soaprpcns = namespace;
      }
      if (encodingStyle = objBody.getAttribute("encodingStyle")) {
        Mapper._LOG.trace("Defining       -SOAP Encoding Style: " + encodingStyle,{instance:this});
        objProfile.soapencstyle = encodingStyle;
      }
    }
  };

  /**
   * Gets the name (base name, not node name) for the WSDL 'message' node for the message type defined by TYPE
   * @param objOperation {jsx3.xml.Entity} operation node in the rules tree
   * @param TYPE {String} one of: input, output, fault
   * @param objMap {Object} selection namespaces map
   * @return {String | null}
   */
  Mapper_prototype.getMEPElement = function(objOperation,TYPE,objMap) {
    var objMsg;
    if ((objMsg = objOperation.selectSingleNode(objMap[Mapper._ns.wsdl] + ":" + TYPE,objMap)) != null)
      return this.getBaseName(objMsg.getAttribute("message"));
  };

 /**
   * Called by parseMessages. Finds the given message type for the operation and addes to the Rules Tree. Calls parseParts().
   * @param MESSAGETYPE {String} one of: input, output, fault
   * @param strOperationName {String} the unqualified name of the operation for which to find the message, @MESSAGETYPE
   * @param strOperationId {String} the jsxid for the rule node record representing the operation parent
   * @param objOperation {jsx3.xml.Entity} the operation node in the WSDL to search within for the given message,@MESSAGETYPE
   * @param strDescription {String} label to add to the Rules Tree for better readability describing this message
   * @param objMap {Object} selection namespaces map
   */
  Mapper_prototype.parseMessage = function(MESSAGETYPE,strOperationName,strOperationId,objOperation,strDescription,objMap) {
    //get the wsdl and the rules tree needed to parse this message and add
    var objWSDL = this.getSourceDocument();
    var objTree = this.getRulesTree();

    //get the input/outupt messages (by name)
    var strMessageName;
    if ((strMessageName = this.getMEPElement(objOperation,MESSAGETYPE,objMap)) != null) {
      //add a node to represent this operation within the WSDL (a service endpoint within a WSDL can have one or more operations)
      Mapper._LOG.trace("Adding        -Message: " + MESSAGETYPE,{instance:this});
      var o = {};
      o.jsxid = this.getKey();
      o.jsxtext = strDescription;
      o.type = MESSAGETYPE.substring(0,1).toUpperCase();
      //if an input, bind source stub and path for shell container
      if (MESSAGETYPE == "input") {
        o.stubsrc = Mapper.SOAP_STUB_SRC;
        o.stubpath = Mapper.SOAP_STUB_PATH;
      }

      this.setMessageEncoding(o,MESSAGETYPE,strOperationName,objMap);
      var objMessageRule = objTree.insertRecord(o,strOperationId,false);

      //check the encoding as defined by the service containing the operation containing this message node
      if (this.getRulesOperation(strOperationName).getParent().getAttribute("soapstyle") == "rpc") {
        //RPC messages have an extra element to represent the "procedure" in the call; add a representation for this element (the message 'parts' will be bound to this)
        var o = {};
        o.jsxtext = strOperationName + ((MESSAGETYPE == "output") ? "Response" : "");
        o.jsxid = this.getKey();
        o.type = "C";
        o.tns = objMessageRule.getAttribute("soaprpcns");
        Mapper._LOG.trace("Adding         -RPC Name: " + o.jsxtext,{instance:this});
        var objMessageRule = objTree.insertRecord(o,objMessageRule.getAttribute("jsxid"),false);
        var bRPC = true;
      } else {
        var bRPC = false;
      }

      //add extra path info for the user, so they can see the schema node for this message when it gets selected in the rules tree
      var strMyQuery = "/" +  objMap[Mapper._ns.wsdl] + ":definitions/" + objMap[Mapper._ns.wsdl] + ":message[@name='" + strMessageName + "']";
      var objMessageWSDL = objWSDL.selectSingleNode(strMyQuery,objMap);
      if (objMessageWSDL) objMessageRule.setAttribute("path",this.getMyPath(objMessageWSDL));

      try {
        //parse parts that belong to this message
        this.parseParts(objMessageWSDL,o.jsxid,bRPC,objMap);
      } catch(e) {
        Mapper._LOG.error("The mapper failed to fully parse one or more of the the 'parts' for the " + MESSAGETYPE + " message.",{instance:this});
        var objError = jsx3.lang.NativeError.wrap(e);
        Mapper._LOG.error("Desc: " + objError.getMessage(),{instance:this});
      }
    }
  };

 /**
   * Called by parseMessage. Adds the message 'parts' to the Rules Tree
   * @param objMessageWSDL {jsx3.xml.Entity} 'message' node in the WSDL (look in the message for the part(s))
   * @param strCDFParentId {String} CDF record id (jsxid) for node in the Rules Tree to which to append the part(s)
   * @param bRPC {boolean} if true, the message is in RPC style
   * @param objMap {Object} selection namespaces map
   */
  Mapper_prototype.parseParts = function(objMessageWSDL,strCDFParentId,bRPC,objMap) {
    //get the wsdl and the rules tree needed to parse message parts and add
    var objWSDL = this.getSourceDocument();
    var objTree = this.getRulesTree();

    //query for the message parts; loop to add to the Rules Tree
    var strQuery = objMap[Mapper._ns.wsdl] + ":part";
    if (this.jsxparts != null && typeof(this.jsxparts) != "undefined") {
      //tokenize the parts using regexp
      var objParts = this.jsxparts.split(/[\s,;]/);
      strQuery += "[";
      var strDelim = "";
      for (var i=0;i<objParts.length;i++) {
        strQuery += strDelim + "@name='" + objParts[i] + "'";
        strDelim = " or ";
      }
      strQuery += "]";
      Mapper._LOG.trace("Defining       -A parts element was encountered that specifies a more-specific part list: " + strQuery,{instance:this});
    }

    var objParts = objMessageWSDL.selectNodes(strQuery,objMap);  //limit this XSL query "wsdl:part[@name='a' or @name='b']"
    for (var i=objParts.iterator(); i.hasNext(); ) {
      var objPart = i.next();

      //the message style affects how the message part is typed. parse accordingly
      var strType = objPart.getAttribute("type");
      var strElement;
      //3.7:  Use an 'element' if it exists, but only if there is no 'type' attribute on the given part if it is RPC
      if (((strElement = objPart.getAttribute("element")) != null && strElement != "" && !bRPC) || (jsx3.util.strEmpty(strType) && !jsx3.util.strEmpty(strElement))) {
        //get matching element being referenced (is a global element as direct child of schema)
        var myTSQ = this.getTargetedSchemaQuery(strElement,objWSDL,objMap)
        var strMyQuery = "//" +  objMap[this.getSchemaNS()] + ":schema" + myTSQ + "/" +
                                 objMap[this.getSchemaNS()] + ":element[@name='" + this.getBaseName(strElement) + "']";
        var objElementNode = objWSDL.selectSingleNode(strMyQuery,objMap);
        if (objElementNode != null) {
          //the input for a message is defined by a complex element by the given name
          Mapper._LOG.trace("Adding         -Part (Element): " + strElement,{instance:this});
          var strJustCreatedNodeId = this.parseComplex(strCDFParentId,objElementNode,true);
        } else {
          Mapper._LOG.error("The schema element, '" + strElement + "', could not be located. This is most commonly due to a schema or wsdl import that failed to load.",{instance:this});
        }
      } else {
        if (!jsx3.util.strEmpty(strType)) {
          //RPC-style messages are assume to contain a message with one or more parts
          if (this.isSimpleNode(objPart,strType)) {
            //simple node (don't forget support for schema types not 2001 (1999); otherwise the 'simple' query fails
            var o = {};
            o.jsxtext = objPart.getAttribute("name");
            o.jsxid = this.getKey();
            o.type = "E";
            o.datatype = this.getBaseName(strType);
            o.simple = "1";
            o.path = this.getMyPath(objPart);
            //if handling a part that uses a type, but this is document style (not rpc), then this part is actually concrete. add the tns if this is the case
            if (!bRPC) Mapper._LOG.warn(" Warning        -The message part, '" + o.jsxtext + "', is used in a document literal context, but does not specify a concrete 'element' (it uses a 'type'). Validate the 'Target Namespace' field for this node using the Rule Node Profile editor.",{instance:this});
            Mapper._LOG.trace("Adding         -Part (Simple):" + o.jsxtext,{instance:this});
            objTree.insertRecord(o,strCDFParentId,false);
          } else {
            //get matching element being referenced (is a global complexType/simpleType as direct child of the targeted schema)
            var strTargetedQuery = this.getTargetedSchemaQuery(strType,objWSDL,objMap);
            var strMyQuery = "//" +  objMap[this.getSchemaNS()] + ":schema" + strTargetedQuery + "/" +
                                     objMap[this.getSchemaNS()] + ":complexType[@name='" + this.getBaseName(strType) + "'] | " +
                                     "//" +  objMap[this.getSchemaNS()] + ":schema" + strTargetedQuery + "/" +
                                     objMap[this.getSchemaNS()] + ":simpleType[@name='" + this.getBaseName(strType) + "']";
            var objElementNode = objWSDL.selectSingleNode(strMyQuery,objMap);
            if (objElementNode != null) {
              //the input for a message is defined by a complex element by the given name
              Mapper._LOG.trace("Adding         -Part (RPC): " + strType,{instance:this});
              var strJustCreatedNodeId = this.parseComplex(strCDFParentId,objElementNode,true);
              var objPartRule;
              if ((objPartRule = objTree.getRecordNode(strJustCreatedNodeId)) != null) {

                objPartRule.setAttribute("jsxtext",objPart.getAttribute("name"));
                //3.2: factored out the ns prefix
                objPartRule.setAttribute("datatype",this.getBaseName(strType));
                //3.2: added the following to store the data type for the given complex node
                objPartRule.setAttribute("ttns",this.getTargetURI(strType,objWSDL,objMap));

                //call parseSimple on simpleTypes (NOTE: all nodes start as complex, SOME of which are converted to simples)
                if (objElementNode.getBaseName() == "simpleType") this.parseSimple(strJustCreatedNodeId,objElementNode,false,false);
              }
            } else {
              Mapper._LOG.error("The type attribute, '" + strType + "', references a type that cannot be found in the WSDL or any of its imported schemas.",{instance:this});
            }
          } //simple or complex
        } else {
            Mapper._LOG.error("The message part, '" + objPart.getAttribute("name") + "' does not have a 'type' attribute which is required for rpc style WSDLs.",{instance:this});
        } //no type
      } //rpc style
    } //for
  };

 /**
   * Returns the XPath facets necessary to point to the appropriate schema for a given query
   * @param strType {String} for example, us:dollar
   * @param objContext {jsx3.xml.Entity} node in the source document to use as starting point to locate the namespace declaration
   * @param objMap {Object} Hash
   * @return {String} For example: [@targetNamespace='abc' or @targetNamespace='def']
   */
  Mapper_prototype.getTargetedSchemaQuery = function(strType,objContext,objMap) {
    var objType = strType.split(":");
    var strTNSQuery = "";
    //TODO: 3.7: validate that if the length is zero and objContext is contained by a schema node and that schema has a target namespace, then that should be the query to use.
    //currently, I am returning an empty string.  I need to be careful about regressions, however.
    if (objType.length > 1) {
      //if the complex type is qualified, find the schema with the correct target namespace.
      var strQuery = "ancestor-or-self::*[attribute::" + objMap[jsx3.xml.Document.SEARCHABLE_NAMESPACE] + ":" + objType[0] + "]/attribute::" + objMap[jsx3.xml.Document.SEARCHABLE_NAMESPACE] + ":" + objType[0];
      var objMyNS = objContext.selectNodes(strQuery ,objMap);

      if (objMyNS.size() > 0) {
        //assume at least the schema pointing to the current ns
        var strMyNS = objMyNS.get(objMyNS.size()-1).getValue();
        strTNSQuery = "attribute::" + objMap[jsx3.xml.Document.SEARCHABLE_NAMESPACE] + ":" + objType[0] + " or @targetNamespace='" + strMyNS + "'";
        var tempQuery = "//" +  objMap[this.getSchemaNS()] + ":schema[" + strTNSQuery + "]";
        var objSchemaNode = objContext.selectSingleNode(tempQuery,objMap);
        if (objSchemaNode) {
          //query for any schema imports. get their namespace and create query compound query
          //3.4 change: only look for those schema imports that referenced imported content
          //TODO: I cannot find conclusive documentation on the importance of including imports already known.
          //      The clearest requirement I can find is Schema Document Location
          //      Strategy (http://www.w3.org/TR/xmlschema-1/#schema_reference). Refer to point 1
          var objImportNodes = objSchemaNode.selectNodes(objMap[this.getSchemaNS()] + ":import[@namespace and @schemaLocation]",objMap);
          for (var i =objImportNodes.iterator(); i.hasNext(); )
            strTNSQuery = strTNSQuery + " or " + "@targetNamespace='" + i.next().getAttribute("namespace") + "'";
        }
        strTNSQuery = "[" + strTNSQuery + "]";
      }
    }
    return strTNSQuery;
  };

 /**
   * Returns the namespace uri for a given prefix
   * @param strType {String} for example, us:dollar
   * @param objContext {jsx3.xml.Entity} source node from which to begin traversing up the DOM to look for the ns declaration
   * @param objMap {Object} Hash
   * @return {String} For example: http://xsd.tns.tibco.com/gi/cxf/2006
   */
  Mapper_prototype.getTargetURI = function(strType,objContext,objMap) {
    var objType = strType.split(":");
    if (objType.length > 1) {
      //if the complex type is qualified, find the nearest ancestor that declares the specified prefix (obType[0])
      var strQuery = "ancestor-or-self::*[attribute::" + objMap[jsx3.xml.Document.SEARCHABLE_NAMESPACE] + ":" + objType[0] + "]/attribute::" + objMap[jsx3.xml.Document.SEARCHABLE_NAMESPACE] + ":" + objType[0];
      var objMyNS = objContext.selectNodes(strQuery ,objMap);
      if (objMyNS.size() > 0)
        return objMyNS.get(objMyNS.size()-1).getValue();
    } else {
      //the type isn't qualified, so try to derive the 'target namespace' from the containing schema
      var strQuery = "ancestor::" + objMap[this.getSchemaNS()] + ":schema";
      var objMyNS = objContext.selectNodes(strQuery ,objMap);
      if (objMyNS.size() > 0)
        return objMyNS.get(objMyNS.size()-1).getAttribute("targetNamespace");
    }
    return "";
  };

/* FIND PARSABLE OBJECTS **********************************/
  //scans the schema from a specific point, ignoring containing elements, unrelated to the actual ouput (i.e., complexType,complexContent,etc)
  Mapper_prototype.findParsableObjects = function(objTree,objWSDL,objElementNode,strQuery,strNodeId,bAttribute,parentNoPass) {
    //declare array for this parsing pass; any desendant element that gets parsed will be added to this array; during the next
    //pass to check for attributes, any element stored here will not allow its descendant attributes to be appended to the wrong parent
    var noPass = [];

    //query for the given item
    var objMap = this.getNSMap();
    var objElements = objElementNode.selectNodes(strQuery,objMap);

    //loop to add
    var objPrevElement = null;
    for (var i=objElements.iterator(); i.hasNext(); ) {
      var objElement = i.next();
      if (!bAttribute) noPass.push(objElement);
      //to stop nested recursion (basically, drilling too deeply)
      if (!this.isDescendant(objElement,objPrevElement) && (parentNoPass == null || (parentNoPass != null && !this.isDescendantArray(objElement,parentNoPass)))) {
        //parse object as a complex type
        var strJustCreatedNodeId = this.parseComplex(strNodeId,objElement,null,true,bAttribute);

        //if the element has no 'type' and no child elements or attributes and contains a simpletype description, attempt to parse as a simple type
        if (objElement.getAttribute("type") == null && objElement.selectSingleNode(".//" + objMap[this.getSchemaNS()] + ":element | .//" + objMap[this.getSchemaNS()] + ":attribute",objMap) == null) {
          if (objElement.selectSingleNode(".//" + objMap[this.getSchemaNS()] + ":simpleType",objMap) != null) {
            //convert the complex node just created to a simple type (this saves the user an extra dbl-click to expand obviously simple types)
            this.parseSimple(strJustCreatedNodeId,objElement,bAttribute,false);
          }
        }

        //reset base object
        objPrevElement = objElement;
      }
    }

    //repaint if an item was added
    if (objPrevElement != null) objTree.redrawRecord(strNodeId,jsx3.xml.CDF.UPDATE);
    if (noPass.length > 0) return noPass;
  };

/* DO DRILL ***************************************************/
  //called when a node in the tree (a book) is toggled open or closed; adds content from the schema to reflect the user's choice
  Mapper_prototype.doDrill = function(strNodeId,bOpen,objTree,objToggledNode,objElementNode) {
    //the user just toggled a node on the tree; if they opened it and the node has no kids, we need to query the WSDL for additional info
    if (bOpen) {
      //proceed if recursing through nested class definitions or if this node has not been parsed yet (had no child records)
      //3.7 bug fix: do not reparse Attribute and CDATA nodes
      if (objElementNode || (objToggledNode && (objToggledNode.selectNodes("record").size() == 0 && !(/^(A|D)$/.test(objToggledNode.getAttribute("type")+""))))) {
        //get the input source (pattern master)
        var objWSDL = this.getSourceDocument(this.getSourceDocumentURL(objToggledNode));
        var objMap = this.getNSMap();

        //get the node in the schema corresponding to the rules tree node that was dbl-clicked by user
        var myPath = objToggledNode.getAttribute("path");
        objElementNode = (!objElementNode) ? objWSDL.selectSingleNode(myPath,objMap) : objElementNode;

        //exit early if the node cannot be resolved in the source document (happens when nodes are manually added/edited)
        if(!objElementNode)
          return;

        //determine the 'TYPE' for the schema node (SIMPLE or COMPLEX)
        var myType = objElementNode.getAttribute("type");

        //user just clicked on the rules tree, affecting its structure; set to dirty
        this.getEditor().setDirty(true);

        if (myType != null && myType != "" && this.isSimpleNode(objElementNode,myType)) {
          //**'SIMPLE TYPE'**
          this.parseSimple(strNodeId,objElementNode);
          return;
        } else if (myType != null && myType != "") {
          //**(?COMPLEX OR SIMPLE?)**
          var myTSQ = this.getTargetedSchemaQuery(myType,objElementNode,objMap);

          //locate this type within the schemas (if it's complex, look for children; if it's simple, convert it)
          var mQuery = "//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "//" + objMap[this.getSchemaNS()] + ":complexType[@name='" + this.getBaseName(myType) + "']";
          objElementNode = objWSDL.selectSingleNode(mQuery,objMap);

          //if simple, convert here and exit early
          if (objElementNode == null) {
            //**'SIMPLE TYPE'**
            objElementNode = objWSDL.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "//" + objMap[this.getSchemaNS()] + ":simpleType[@name='" + this.getBaseName(myType) + "']",objMap);
            if (objElementNode) this.parseSimple(strNodeId,objElementNode);
            return;
          }//else  //**'COMPLEX TYPE'**
        } else if (objToggledNode.getAttribute("ref") != null) {
          //**'REFERENCED' NODE (?COMPLEX TYPE OR SIMPLE TYPE?)**
          //this node is a reference to another (group, attributeGroup, or any node with a 'base' or 'ref' attribute)
          var objComplexNode = objElementNode.selectSingleNode(".//" + objMap[this.getSchemaNS()] + ":complexType | .//" + objMap[this.getSchemaNS()] + ":choice | .//" + objMap[this.getSchemaNS()] + ":sequence | .//" + objMap[this.getSchemaNS()] + ":all",objMap);

          if (objComplexNode == null && objElementNode.getBaseName() != "attributeGroup") {
            //**'SIMPLE TYPE'**
            //when this tree node was originally created, it was determined that this was a ref node, meaning, it still needed further parsing; do here
            this.parseSimple(strNodeId,objElementNode);
            return;
          }//else
          //**'COMPLEX TYPE'**
        } else if(objElementNode.getBaseName() == "simpleType") {
          //3.7: added hook to parse simple types directly if added via a xsd:extension node
          this.parseSimple(strNodeId,objElementNode);
          return;
        }

        //determine if there is an extension element that is a direct child of the complexcontent -- if so, add its content here, before adding extending items
        var objExtensionNode = objElementNode.selectSingleNode(".//" + objMap[this.getSchemaNS()] + ":extension",objMap);

        if (objExtensionNode != null) {
          //check for the 'base' attribute
          myType = objExtensionNode.getAttribute("base");
          if (myType != null && myType != "" && !this.isSimpleNode(objExtensionNode,myType)) {
            //get the targeted schema query to get the correct context to query the def from
            var myTSQ = this.getTargetedSchemaQuery(myType,objExtensionNode,objMap);

            //locate the element (the one being extended) within the schema (assuming its global)
            objExtensionNode = objExtensionNode.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "/*[@name='" + this.getBaseName(myType) + "']",objMap);

            //if node is of a given type (complex or otherwise) list it here for convenience
            if (objExtensionNode != null) {
              //3.3 add: modifiction: recurse on extension elements
              this.doDrill(strNodeId,true,objTree,objToggledNode,objExtensionNode);
            }
          }
        }

        //scan this 'element/complex' tag for child elements/groups
        var strQuery = ".//" + objMap[this.getSchemaNS()] + ":group | .//" + objMap[this.getSchemaNS()] + ":attributeGroup | .//" + objMap[this.getSchemaNS()] + ":element";
        var noPass = this.findParsableObjects(objTree,objWSDL,objElementNode,strQuery,strNodeId,false);

        //scan this 'element/complex' tag for child attributes
        strQuery = ".//" + objMap[this.getSchemaNS()] + ":attribute";
        this.findParsableObjects(objTree,objWSDL,objElementNode,strQuery,strNodeId,true,noPass);
      }
    }
  };

 /**
   * All nodes when added to the Rules Tree start out as 'complex'. This method is called
   * thereafter (either automatically or through a subsequent user click to expand the given node) to modify
   * the given complex node to reflect the fact that it is ultimately a simle type such as a string or int.
   * If this node has enumerated restrictions, this information will also be added to the Rules Tree.
   * @param strCdfId {String} CDF record id (jsxid) for node in the Rules Tree to convert to a simple type
   * @param objSchemaNode {jsx3.xml.Entity} Corresponding node in the Schema that contains further information about the Rules Tree node being affected
   * @param bAttribute {boolean} True if the node to be parsed is an attribute (not element)
   * @param bRedraw {boolean} True if null. If true, the node is redrawn in the rules tree to reflect the change to a simple type
   */
  Mapper_prototype.parseSimple = function(strCdfId,objSchemaNode,bAttribute,bRedraw) {
    //get handle to the rule node in the tree that we'll configure with information about its corresponding simple-type in the schema
    var objTreeNode = this.getRulesTree().getRecordNode(strCdfId);

    //check for a 'restriction' facet
    var objMap = this.getNSMap();
    if ((objRestrictionElement = objSchemaNode.selectSingleNode(".//" + objMap[this.getSchemaNS()] + ":restriction",objMap)) != null) {
      //check the base
      if ((myBase = objRestrictionElement.getAttribute("base")) != null && myBase != "") {
        //check if the derivative is a simple schema data type
        if (!this.isSimpleNode(objSchemaNode,myBase)) {
          //the base of ths node doesn't appear to be simple, perhaps this is a reference to a simple type
          var myTSQ = this.getTargetedSchemaQuery(myBase,objSchemaNode,objMap);
          var objElementNode = objSchemaNode.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "//" + objMap[this.getSchemaNS()] + ":simpleType[@name='" + this.getBaseName(myBase) + "']",objMap);
          if (objElementNode) {
            var objRestrictionElement = objElementNode.selectSingleNode(".//" + objMap[this.getSchemaNS()] + ":restriction",objMap);
            if (objRestrictionElement) {
              var myBase = objRestrictionElement.getAttribute("base");
              if (myBase == null || myBase == "") return;
            } else {
              return;
            }
          } else {
            return;
          }
        }

        //check again if the type is simple
        if (this.isSimpleNode(objSchemaNode,myBase)) {
          //get handle to the existing element in the tree; since it is a simple type, we'll just modify its text for now
          var strText = objTreeNode.getAttribute("jsxtext");
          var f1 = strText.indexOf(" type=");
          if (f1>-1) strText = strText.substring(0,f1);

          var objComplexNode = this.getComplexRule(objTreeNode,"restrictions");
          var strId = objComplexNode.getAttribute("jsxid");
          var objTree = this.getRulesTree();

          //element is a simple type with a faceted restriction; get its children (they contain the rules)
          var i = objRestrictionElement.getChildIterator();
          if (i.hasNext() > 0) {
            bRedraw = true;
            while (i.hasNext()) {
              var objRestriction = i.next();
              var oMap = {};
              oMap.jsxid = this.getKey();
              oMap.name = objRestriction.getBaseName();
              oMap.value = objRestriction.getAttribute("value");
              objTree.insertRecord(oMap,strId,false);
            }
          }

          //persist the facet information on the Rule Node (provides convenience to developer to see the enumerations)
          var strTrueBase;
          if ((strTrueBase = objTreeNode.getAttribute("datatype")) == null || strTrueBase == "") {
            objTreeNode.setAttribute("datatype",myBase);
          }
          objTreeNode.setAttribute("jsxtext",strText);
        } else {
          //still couldn't resolve the simple type
          return;
        }
      } else {
        //restriction element with no base
        return;
      }
    }

    //add remaining properties
    objTreeNode.setAttribute("type",(bAttribute)?"A":"E");

    //the item is either simble or based upon a simple (with restriction/facet additions). determine here
    var strType = objTreeNode.getAttribute("datatype");
    if (strType && objRestrictionElement && this.isSimpleNode(objRestrictionElement,strType)) {
      objTreeNode.setAttribute("simple","1");
      //remove any namespace prefix from the datatype
      objTreeNode.setAttribute("datatype",this.getBaseName(strType));
    }

    objTreeNode.setAttribute("path",this.getMyPath(objSchemaNode));
    this.setFormDefaults(objTreeNode,objSchemaNode);
    Mapper._LOG.trace("Converting     -Simple: " + objTreeNode.getAttribute("jsxtext"),{instance:this});

    //3.6: fixed the 3.5 regression(was writing, not reading, resulting in all new restrictions being immediately deleted
    this.readMappings(this.getRulesTree(),objTreeNode,"restrictions");

    //redraw this node in the tree
    if (bRedraw !== false) this.getRulesTree().redrawRecord(strCdfId,jsx3.xml.CDF.UPDATE);
  };

 /**
   * Called by parseComplex. Gets the data type for the SOAP array. For example, xsd:string, ns0:phoneNumber, etc
   * @param objSchemaNode {jsx3.xml.Entity} Node in the Schema that is of type, soap:arrayType.
   * @return {String | null} The data type (including the namespace prefix when it exists)
   */
  Mapper_prototype.getSoapArrayType = function(objSchemaNode) {
    var strArrayType = objSchemaNode.getAttribute("wsdl:arrayType");
    for (var i=objSchemaNode.getAttributes().iterator(); i.hasNext(); ) {
      var objAtt = i.next();
      if (objAtt.getBaseName() == "arrayType")
        return objAtt.getValue();
    }
    return strArrayType;
  };

 /**
   * Called by parseComplex. Parses @objSchemaNode into a Rules Tree node representing the SOAP Array
   * @param strArrayType {String} The data type for the array. For example, xsd:string, ns0:phoneNumber, int
   * @param strCDFParentId {String} CDF record id (jsxid) for node in the Rules Tree to which to append the resulting structure
   * @param objSchemaNode {jsx3.xml.Entity} Node in the Schema whose profile will be persisted in the Rules Tree
   */
  Mapper_prototype.parseSoapArray = function(strArrayType,strCDFParentId,objSchemaNode) {
    //get contextual info to locate the node in the appropriate schema def
    var objMap = this.getNSMap();
    var myTSQ = this.getTargetedSchemaQuery(strArrayType,objSchemaNode,objMap);

    //get the array type and ns prefix
    var strAT = strArrayType;
    var objArrayType = strArrayType.split(":");
    if (objArrayType.length == 2) {
      var strPrefix = objArrayType[0];
      strArrayType = objArrayType[1];
    } else {
      var strPrefix = "";
    }

    //remove the array brackets to clean up the string
    strArrayType = strArrayType.replace(/[\[]]/,"");

    //create an attribute node on the rules tree that will hold the actual data type for the repeating elements (since xsi:type now references the soap-enc:array as its type)
    var o = {};
    o.jsxtext = "arrayType";
    o.jsxid = this.getKey();
    o.datatype = strArrayType;
    o.tns = Mapper._ns.soapencoding;
    o.ttns = this.getTargetURI(strAT,objSchemaNode,objMap);
    o.type = "A";
    o.path = this.getMyPath(objSchemaNode);
    this.getRulesTree().insertRecord(o,strCDFParentId,false);

    //look for the restriction node ancestor for this node; if it exists,
    var objTempNode = objSchemaNode;
    while (objTempNode && objTempNode.getBaseName() != "restriction") objTempNode = objTempNode.getParent();
    if (objTempNode) {
      //query the restriction node ancestor for an element descendant; if it exists, then structural. Otherwise, continue
      var objTempNode = objTempNode.selectSingleNode(".//" + objMap[this.getSchemaNS()] + ":element",objMap);
      if (objTempNode) return;
    }

    //get the path to the actual array element that is part of this array
    var objSchemaNode = objSchemaNode.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "/*[@name='" + strArrayType + "']",objMap);

    //add item node here (the repeating structure for the array)
    var o = {};
    o.jsxtext = "item";  //arbitrary name.  TO DO: is this required to be 'item' or is it just typically so??? -- get the standard from W3C
    o.jsxid = this.getKey();
    o.jsxopen = "1";
    if (this.isSimpleNode(objSchemaNode,strArrayType)) {
      //TO DO: factor out the xsd prefix.  be consistent.  use google wsdl as it tests against this well
      //this is a simple data type
      o.datatype = strArrayType;
      o.ttns = this.getSchemaNS();
      o.type = "E";
    } else if (strPrefix != "") {
      //this is complex
      o.datatype = strArrayType;
      o.ttns = this.getTargetURI(strPrefix + ":" + strArrayType,objSchemaNode,objMap);

      o.type = "C";
      o.ref ="1";
      o.path = this.getMyPath(objSchemaNode);
    } else {
      //this is probably complex
      var objSNode = objSchemaNode.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "/" +
                                                           objMap[this.getSchemaNS()] + ":complexType[@name='" + strArrayType + "']",objMap);
      if (objSNode) {
        //found the node...get the namespace
        var oSchema = objSNode.getParent();
        o.ttns = oSchema.getAttribute("targetNamespace");
        o.type = "C";
        o.ref = "1";
        o.path = this.getMyPath(objSchemaNode);
        o.datatype = strArrayType;
      } else {
        return;
      }
    }

    //insert the new rule; redraw and exit early
    this.getRulesTree().insertRecord(o,strCDFParentId,false);
    this.getRulesTree().redrawRecord(strCDFParentId,jsx3.xml.CDF.UPDATE);
  };

 /**
   * Takes a given node in the schema and adds it to the rules tree
   * @param strCDFParentId {String} id in rules tree for node ot append the new record to
   * @param objSchemaNode {jsx3.xml.Entity} Node in the schema containing the information to convert to CXF
   * @param bFirst {Boolean} if true, method is being called from parseParam
   * @param bDrill {Boolean} if true, method is being called from doDrill
   * @param bAttribute {Boolean} if true, the node is an attribute
   */
  Mapper_prototype.parseComplex = function(strCDFParentId,objSchemaNode,bFirst,bDrill,bAttribute) {
    //if node is of a given 'type' (complex or otherwise)
    var strType = objSchemaNode.getAttribute("type");
    var objRulesTree = this.getRulesTree();
    var objMap = this.getNSMap();
    var bRef = false;
    var bGroupRef = false;
    var bBook = false;
    var baseSchemaNode;

    //if there is no 'type' on node, it's probably simple
    if (!bFirst && !bDrill & (strType == null || strType == "")) {
      if (objSchemaNode) this.parseSimple(strCDFParentId,objSchemaNode,bAttribute);
      return;
    }

    //get the type for this rule node in the Rules Tree; is it an attribute rule (a), entity rule (e), or complex rule (c)
    if (bAttribute) {
      var strRuleType = "A";
    } else if (objSchemaNode.getFirstChild() || !this.isSimpleNode(objSchemaNode,strType)) {
      //complex nodes are books (attributes and elements are terminal)
      bBook = true;
      var strRuleType = "C";
    } else {
      var strRuleType = "E";
    }

    //does this element have a 'name' property; if not, resolve by locating the node being referenced (as a type, base, or ref)
    var strMyNodeName;
    if ((strMyNodeName = objSchemaNode.getAttribute("name")) == null || strMyNodeName == "") {
      //first check if this is a SOAP array
      var strRef = objSchemaNode.getAttribute("ref");
      var strRefBase = this.getBaseName(strRef);
      var strRefURI = this.getTargetURI(strRef,objSchemaNode,objMap);
      var myTSQ;
      if (strRefBase == "arrayType" && strRefURI == Mapper._ns.soapencoding) {
        //SOAP Array: update the data type for the current Rule in the Rules Tree to reflect this
        var objRuleParent = objRulesTree.getRecordNode(strCDFParentId);
        objRuleParent.setAttribute("datatype","Array");
        objRuleParent.setAttribute("ttns",Mapper._ns.soapencoding);

        //get the specific data type for this array (i.e., xsd:string, ns0:phoneNumber, etc). Exit early
        var strArrayType = this.getSoapArrayType(objSchemaNode);

        //call method to parse the actual array. This requires special parsing, a bit different than a standard 'complex' node
        this.parseSoapArray(strArrayType,strCDFParentId,objSchemaNode);
        return;
      } else if (objSchemaNode.getBaseName() == "extension") {
        //this is an extension to a base element
        strMyNodeName = objSchemaNode.getAttribute("base");
      } else {
        //this is probably a 'ref' to another node. If not, it's unsupported
        strMyNodeName =  objSchemaNode.getAttribute("ref");
        baseSchemaNode = objSchemaNode;
        //Per the xmlschema spec: [T]he value of the ref attribute must reference a global element,
        //i.e. one that has been declared under schema rather than as part of a complex type definition.
        myTSQ = !jsx3.util.strEmpty(strRefURI) ? "[@targetNamespace='" + strRefURI + "']" : "";
      }

      //check again if the node name has been resolved as either a base or ref
      if (strMyNodeName != null && strMyNodeName != "" && !this.isSimpleNode(objSchemaNode,strMyNodeName)) {
        //locate the referenced element within the schema (ref or base); if not found, exit early
        myTSQ = myTSQ || this.getTargetedSchemaQuery(strMyNodeName,objSchemaNode,objMap);
        var objSchemaNode = objSchemaNode.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "/*[@name='" + this.getBaseName(strMyNodeName) + "']",objMap);
        if (objSchemaNode == null) return;

        //check for a 'type' attribute. If there is none, then assume complex for this parsing pass
        if ((strType = objSchemaNode.getAttribute("type")) == null || strType == "") {
          //assume a book (which is a treeview's version of an item being complex (or atleast unknown)
          var bBook = true;
          strRuleType = "C";
          //set flag that this is a ref node
          var bRef = true;
          //set flag if this is a group ref node
          var bGroupRef = objSchemaNode.getBaseName() == "group" || objSchemaNode.getBaseName() == "attributeGroup";
        }

      } else {
        //TO DO: better logger info
        //jsx3.util.Logger.logError({CODE:"SVC80",METHOD:"parseComplex()",REASON:"A node in the schema could not resolve its name. This is most likely due to a missing schema element."});
        strMyNodeName = "_jsx_null_jsx_";
      }
    }//end handler for schema nodes with no name

    //set id and text for the rule node to insert
    var strText = '' + strMyNodeName;
    var strMyId = this.getKey();

    //insert a CDF representation of the given shema node
    var o = {};
    o.jsxid = strMyId;
    o.jsxtext = this.getBaseName(strText);
    o.jsxopen = "1";
    o.type = strRuleType;
    o.path = this.getMyPath(objSchemaNode);
    o.datatype = (strType == null || strType == "") ? '' : strType;

    if (!bBook) {
      o.simple = "1";
      //3.2: added the following to remove the 'xsd:' prefix from the qname is a simple type
      o.datatype = this.getBaseName(o.datatype);
    } else {
      if (strType == null || strType == "") {
        o.datatype = '';
      } else {
        //TO DO: validate that unqualifying the type does not break 'setFormDefaults'
        o.datatype = this.getBaseName(strType);
        o.ttns = this.getTargetURI(strType,objSchemaNode,objMap);
      }
    }

    if (bRef) o.ref = "1";
    if (bGroupRef) o.groupref = "1";

    if (!bFirst) Mapper._LOG.trace("Adding         -" + ((bBook)?"Complex":"Simple") + ": " + o.jsxtext,{instance:this});
    var myNewNode = objRulesTree.insertRecord(o,strCDFParentId,false);

    //bind info about the target namespace
    this.setFormDefaults(myNewNode,objSchemaNode);

    //with the new rule now added, add restrictions for minoccur maxoccur
    var myMax = (baseSchemaNode || objSchemaNode).getAttribute("maxOccurs");
    if (myMax != null && myMax != "") {
      this.bindComplexRule(objRulesTree,myNewNode,"restrictions","maxoccur",myMax);
    }

    var myMin = (baseSchemaNode || objSchemaNode).getAttribute("minOccurs");
    if (myMin != null && myMin != "" && myMin != 1) {
      this.bindComplexRule(objRulesTree,myNewNode,"restrictions","minoccur",myMin);
    }

    if ((baseSchemaNode || objSchemaNode).getAttribute("nillable") == "true") {
      this.bindComplexRule(objRulesTree,myNewNode,"restrictions","minoccur",0);
      this.bindComplexRule(objRulesTree,myNewNode,"restrictions","nillable","true");
    }

    //return
    return strMyId;
  };

 /**
   * Sets the elementFormDefault and attributeFormDefault properties for the rule node, based upon its position/profile in the schema
   * @param objRNode {jsx3.xml.Entity} rule node
   * @param objSNode {jsx3.xml.Entity} schema node to query against to get the profile
   */
  Mapper_prototype.setFormDefaults = function(objRNode,objSNode) {
    var strLocalFD = objSNode.getAttribute("form");
    var strEFD, strAFD;
    //3.6 mod:  check the local form--it takes precedence over the form-default declared by the schema
    if(strLocalFD == "qualifed") {
      strEFD = 1;
    } else if(strLocalFD != "unqualified") {
      //persist ref to starting node
      var objXNode = objSNode;

      //find the root schema parent
      while (objSNode.getBaseName() != "schema") objSNode = objSNode.getParent();

      var strTNS = objSNode.getAttribute("targetNamespace");
      if (strTNS == null) strTNS = "";

      strEFD = objSNode.getAttribute("elementFormDefault");
      strEFD = (strEFD == null || strEFD == "unqualified" || objXNode.getBaseName() != "element") ? "0" : "1";
      //if this is a global  node  (hanging directly off the schema root), it must have EFD flag of 1, so that its ns can be declared
      if (strEFD == "0" && objXNode.getBaseName() == "element" && objXNode.getParent().equals(objSNode)) strEFD = "1";

      var strAFD = objSNode.getAttribute("attributeFormDefault");
      strAFD = (strAFD == null || strAFD == "unqualified" || objXNode.getBaseName() != "attribute") ? "0" : "1";
    }

    //set the target namespace if this node should be qualified when generated
    if (strEFD == "1" || strAFD == "1") objRNode.setAttribute("tns",strTNS);
  };

  /**
   * Lists all operations in CDF format as children of the 'generate code' menu button
   * @param objMnu {jsx3.gui.Menu}
   * @private
   */
  Mapper_prototype.listOperations = function(objMnu) {
    //reset the menu--get the freshest list of available operations
    objMnu.clearXmlData();
    objMnu.clearCachedContent();

    var objXML;
    if ((objXML = this.getRulesXML()) != null) {
      var objNodes = objXML.selectNodes("//record[@type='P' or @type='T']");
      for (var i=objNodes.iterator(); i.hasNext(); ) {
        var objNode = i.next();
        objMnu.insertRecord({jsxid:objNode.getAttribute("opname"),jsxtext:objNode.getAttribute("jsxtext")},null,false);
      }
    }
    return true;
  };

  /**
   * Called by menu selection. Generates code necessary to call the given operation. Copies code to the clipboard as text
   * @param objMnu {jsx3.gui.Menu}
   * @private
   */
  Mapper_prototype.generateCode = function(objMnu) {
    //resolve the resource id for this mapping file, using its URL
    var strURL = this.getEditor().getFilePath();
    var objFile = jsx3.ide.getSystemRelativeFile(strURL);
    var strSrc = jsx3.ide.PROJECT.getDirectory().relativePathTo(objFile);
    var includes = jsx3.util.List.wrap(
        jsx3.ide.SERVER.getSettings().get('includes')).filter(function(x) { return x.src == strSrc; }).toArray(true);
    
    if (includes.length) {
      var strMyResourceId = includes[includes.length-1].id;
      //get handle to the selected record
      var strOperationName = objMnu.getValue();

      //generate the test function
      var strCode = 'jsx3.lang.Package.definePackage(\n';
      strCode += '  "eg.service",                //the full name of the package to create\n';
      strCode += '  function(service) {          //name the argument of this function\n\n';
      strCode += '    //call this method to begin the service call (eg.service.call#2();)\n';
      strCode += '    service.call#2 = function() {\n';
      strCode += '      var objService = #3.loadResource("#1");\n';
      strCode += '      objService.setOperation("#2");\n\n';
      strCode += '      //subscribe\n';
      strCode += '      objService.subscribe(jsx3.net.Service.ON_SUCCESS, service.on#2Success);\n';
      strCode += '      objService.subscribe(jsx3.net.Service.ON_ERROR, service.on#2Error);\n';
      strCode += '      objService.subscribe(jsx3.net.Service.ON_INVALID, service.on#2Invalid);\n\n';
      strCode += '      //PERFORMANCE ENHANCEMENT: uncomment the following line of code to use XSLT to convert the server response to CDF (refer to the API docs for jsx3.net.Service.compile for implementation details)\n';
      strCode += '      //objService.compile();\n\n';
      strCode += '      //call the service\n';
      strCode += '      objService.doCall();\n';
      strCode += '    };\n\n';
      strCode += '    service.on#2Success = function(objEvent) {\n';
      strCode += '      //var responseXML = objEvent.target.getInboundDocument();\n';
      strCode += '      objEvent.target.getServer().alert("Success","The service call was successful.");\n';
      strCode += '    };\n\n';
      strCode += '    service.on#2Error = function(objEvent) {\n';
      strCode += '      var myStatus = objEvent.target.getRequest().getStatus();\n';
      strCode += '      objEvent.target.getServer().alert("Error","The service call failed. The HTTP Status code is: " + myStatus);\n';
      strCode += '    };\n\n';
      strCode += '    service.on#2Invalid = function(objEvent) {\n';
      strCode += '      objEvent.target.getServer().alert("Invalid","The following message node just failed validation:\\n\\n" + objEvent.message);\n'
      strCode += '    };\n\n';
      strCode += '  }\n';
      strCode += ');\n\n';
      //replace various pointers
      strCode = strCode.replace(/#1/g,strMyResourceId).replace(/#3/g,jsx3.ide.SERVER.getEnv('namespace'));
      strCode = (strOperationName == "jsxtransaction") ? strCode.replace(/#2/g,"") : strCode.replace(/#2/g,strOperationName);

      //copy the code to the native clipboard
      jsx3.html.copy(strCode);

      //tell user the code has been copied to their clipboard
      this.getServer().alert("Code Generator", "The generated JavaScript code has been copied to the clipboard.", null, null, {width: 280, height: 150});
    } else {
      //don't generate the code until there is a file name to reference
      this.getServer().alert("Error: Path Unavailable", "The JavaScript code cannot be generated until the rules file has been saved.", null, null, {width: 280, height: 150});
    }
  };

  /**
   * Called by context-menu selection. Launches the Test Interface dialog
   * @private
   */
  Mapper_prototype.openTester = function() {
    jsx3.require("jsx3.ide.mapper.ServiceTest");

    var objMapper = this.getServer().getRootBlock().getDescendantsOfType(jsx3.ide.mapper.ServiceTest);
    if (objMapper.length == 0) {
      var oDlg = this.getServer().getRootBlock().load("components/ServiceTest/service_test_dialog.xml", true, ADDIN);
      var oMap = oDlg.getDescendantsOfType(jsx3.ide.mapper.ServiceTest)[0];
      //create backreferences between the mapper and the tester (use ids, not object refs)
      this.setTesterId(oMap.getId());
      oMap.initialize(this.getId());
    } else {
      objMapper[0].getAncestorOfType(jsx3.gui.Dialog).doToggleState(1,true);
    }
  };

  /**
   * Contextual Model Event bound to the 'Drop' event for the Rules Tree. Note: Only drops originating from the GI Builder 'DOM' Palette and the Rules Tree itself are valid
   * @param objRulesTree {jsx3.gui.Tree} rules tree used by the mapper
   * @param objSourceTree {jsx3.gui.Tree} tree contained by the GI Builder DOM Palette
   * @param strDraggedId {String} jsxid property for the GUI object ot map (what was dragged)
   * @param strRuleId {String} jsxid CDF property for the node in the rules tree that received the drop
   * @param bInsertBefore {Boolean} true if insertbefore (not append)
   * @return {boolean} false (to cancel the default drop action)
   * @private
   */
  Mapper_prototype.onRuleDrop = function(objRulesTree,objSourceTree,strDraggedIds,strRuleId,bInsertBefore)  {
    //make sure originated in dom palette; was dropped on a rule; and JSXBODY wasn't dragged
    var objNode, objDragged;
    var strDraggedId = strDraggedIds[0];
    if (objSourceTree.getName() == "jsxdom" && (objNode = objRulesTree.getRecordNode(strRuleId)) != null && (objDragged = jsx3.GO(strDraggedId)) != null) {
      if(objRulesTree.getValue().length == 1)
        this.writeMappings(true);

      //create the mapping rule
      var mNode = this.bindComplexRule(objRulesTree,objNode,"mappings","DOM",objDragged.getName());
      //redraw the affected node
      objRulesTree.redrawRecord(strRuleId,jsx3.xml.CDF.UPDATE);

      if(objRulesTree.getValue().length == 1 && objRulesTree.getValue()[0] == strRuleId) {
        //active rule also received the drop
        this.readMappings(objRulesTree,objNode,"mappings");
      } else {
        //select the rule just dropped upon so selection event fires and the mapping is displayed
        objRulesTree.setValue(strRuleId);
        //this.readMappings(objRulesTree,objNode,"mappings");
        this.onRuleSelect();
      }

      //reset the map rules listed in the soaptester (but only if the tester interface is open)
      var objTester;
      if ((objTester = this.getTester()) != null) objTester.listRules();
    } else if (objSourceTree.getName() == "jsx_schema_rulestree") {
      //the rule being acted upon
      var objDst = objRulesTree.getRecordNode(strRuleId);
      if(bInsertBefore) objDst = objDst.getParent();
      var strDstType = objDst.getAttribute("type");
      var bSuccess;
      var bCurSuccess;
      for(var i=0;i < strDraggedIds.length;i++) {
        strDraggedId = strDraggedIds[i];
        if(strDraggedId != strRuleId) {
          //perhaps user is trying to re-arrange.  Only (I, O, F, C, E) can accept a drop from an (A, C, E) type
          var objSrc = objRulesTree.getRecordNode(strDraggedId);
          var objOldParent = objSrc.getParent();
          var strSrcType = objSrc.getAttribute("type");
          if (strDstType == "I" || strDstType == "O" || strDstType == "F" || strDstType == "C" || strDstType == "E" || strDstType == "A" || strDstType == "D") {
             if (strSrcType == "A" || strSrcType == "C" || strSrcType == "E" || strSrcType == "D") {
               //perform the actual adoption and redraw the new parent
               if(bInsertBefore) {
                 bCurSucess = objRulesTree.adoptRecordBefore(objRulesTree,strDraggedId,strRuleId,false);
               } else {
                 bCurSucess = objRulesTree.adoptRecord(objRulesTree/*.getId()*/,strDraggedId,strRuleId,false);
               }

               //if the adoption worked, configure the destination object (the target) and the old parent
               if(bCurSucess) {
                 //set flag to redraw the target if at least one adoption is successful
                 bSuccess = true;

                 //if the old parent was complex, modify to make element type
                 if (objOldParent.selectSingleNode("record") == null && objOldParent.getAttribute("type") == "C") {
                   objOldParent.setAttribute("type","E");
                   objRulesTree.redrawRecord(objOldParent.getAttribute("jsxid"));
                 }
               }
            }
          }
        }
      }
      if(bSuccess) {
        //make the receiver of the drop a complex rule type if not already
        if (strDstType == "E" || strDstType == "A" || strDstType == "D")
          objDst.setAttribute("type","C");
        objRulesTree.redrawRecord(objDst.getAttribute("jsxid"));
      }
    }
    return false;
  };

  /**
   * called when an item is deleted from a grid (restricitons and mappings); causes an update event to the affected node in the rules tree to reflect the change
   * @param strGridId {jsx3.gui.Tree} jsxid for the grid whose record was just removed (currently not used)
   * @private
   */
  Mapper_prototype.onDelete = function(strGridId) {
    this.getRulesTree().redrawRecord(this.getRulesTree().getValue(),jsx3.xml.CDF.UPDATE);
    this.getEditor().setDirty(true);
  };

  /**
   * Removes either mappings or restrictions from the given rule node as specified by the TYPE
   * @param TYPE {String} one of: mappings, restrictions, headers
   * @private
   */
  Mapper_prototype.doRemoveComplexStructure = function(TYPE) {
    //user reset this node in the rules tree by removing its child element; set to dirty
    this.getEditor().setDirty(true);

    var objTree = this.getRulesTree();
    var oVal = objTree.getValue();
    for (var i=0;i<oVal.length;i++) {
      var strId = oVal[i];
      var objNode = this.getRulesXML().selectSingleNode("//record[@jsxid='" + strId + "']/" + TYPE);
      if (objNode) {
        var objParent = objNode.getParent();
        objParent.removeChild(objNode);
        this.getRulesTree().redrawRecord(strId,jsx3.xml.CDF.UPDATE);
        this.readMappings(objTree, objParent, TYPE);
      }
    }

    //get the matrix associated with the given structue; if loaded, reset

    //this.onRuleSelect();

    //reset the map rules listed in the tester (but only if the tester interface is open)
    var objTester;
    if ((objTester = this.getTester()) != null) objTester.listRules();
  };

  /**
   * Removes the rule and any descendant rules contained therein
   * @private
   */
  Mapper_prototype.doRemoveBranch = function() {
    //user reset this node in the rules tree by removing its child element; set to dirty
    this.getEditor().setDirty(true);

    var objTree = this.getRulesTree();
    var oVal = objTree.getValue();
    var strParentId;
    for (var i=0;i<oVal.length;i++) {
      //get handle to the rules tree and the selected operation
      var objNode = objTree.getRecordNode(oVal[i]);
      if (objNode) {
        var strParentId = objNode.getParent().getAttribute("jsxid");
        objTree.deleteRecord(oVal[i],oVal.length == 1);
      }
    }
    if (oVal.length > 1) objTree.repaint();
    if (objTree.getRecord(strParentId)) {
      objTree.setValue(strParentId);
      this.onRuleSelect();
    }

    //reset the map rules listed in the tester (but only if the tester interface is open)
    var objTester;
    if ((objTester = this.getTester()) != null) objTester.reset();
  };

  /**
   * Executes the given operation. Equivalent to the runtime method, doCall
   * @param strId {String} jsxid for the operation node (the operation that will be executed)
   * @private
   */
  Mapper_prototype.execute = function(strId) {
    //get handle to the rules tree and the selected operation
    var objTree = this.getRulesTree();
    var objNode = objTree.getRecordNode(strId);
    var oService = new jsx3.net.Service();
    oService.setRulesXML(this.getRulesXML());
    var strOpId;
    if ((strOpId = objNode.getAttribute("opname")) != null) oService.setOperationName(strOpId);
    oService.setNamespace(jsx3.ide.SERVER.getEnv('namespace'));
    //TO DO: subscribe to method in this class that will deref the rules xml for proper de-referencing of the service instance
    oService.doCall();
  };

  /**
   * Removes all siblings of the rule and any descendant rules contained by those siblings. Only works if all selected rules in the tree are siblings
   * @private
   */
  Mapper_prototype.doRemoveSiblingBranches = function() {
    var objTree = this.getRulesTree();
    var oVal = objTree.getValue();
    var objParent;
    for (var i=0;i<oVal.length;i++) {
      if (i==0) {
        objParent = objTree.getRecordNode(oVal[i]).getParent();
      } else {
        var objNewParent = objTree.getRecordNode(oVal[i]).getParent();
        if (!objNewParent.equals(objParent)) return;
      }
    }

    //user reset this node in the rules tree by removing its child element; set to dirty
    this.getEditor().setDirty(true);

    var sPre = "";
    var sQuery = "record[";
    for (var i=0;i<oVal.length;i++) {
      sQuery += sPre + "@jsxid!='" + oVal[i] + "'";
      var sPre = " and ";
    }
    sQuery += "]";

    //get handle to the rules tree and the selected operation
    var objNode = objTree.getRecordNode(oVal[0]);
    var objParent = objNode.getParent();
    var objChildren = objParent.selectNodes(sQuery);
    for (var i=objChildren.size()-1;i>=0;i--)
      objParent.removeChild(objChildren.get(i));
    objTree.redrawRecord(objParent.getAttribute("jsxid"),jsx3.xml.CDF.UPDATE);

    //reset the map rules listed in the soaptester (but only if the tester interface is open)
    var objTester;
    if ((objTester = this.getTester()) != null) objTester.reset();
  };

  /**
   * Adds a child node (a rule) to the rules tree. Users can then configure as appropriate
   * @param strId {String} jsxid for the rule node
   * @param TYPE {String} one of: A, C, D
   * @private
   */
  Mapper_prototype.doAddChildNode = function(strId,TYPE) {
    //user reset this node in the rules tree by removing its child element; set to dirty
    this.getEditor().setDirty(true);

    //add the new rule via standard CDF interface
    var objNode = this.getRulesTree().getRecordNode(strId);
    var o = {};
    o.jsxid = this.getKey();
    o.jsxtext = "rule_node";
    o.type = TYPE;

    //insert, but update the parent (also open the parent and make sure it is complex since it now has content), because its icon might have changed now that it has content
    this.getRulesTree().insertRecord(o,strId,false);
    var strType;
    if ((strType = this.getRulesTree().getRecordNode(strId).getAttribute("type")) != "O" && strType != "I" && strType != "F")
      this.getRulesTree().insertRecordProperty(strId,"type","C",false);
    this.getRulesTree().insertRecordProperty(strId,"jsxopen","1",true);
  };

  /**
   * Clones the given rule in the tree
   * @param strId {String} jsxid for the rule node
   * @private
   */
  Mapper_prototype.doCloneNode = function(strId) {
    //user reset this node in the rules tree by removing its child element; set to dirty
    this.getEditor().setDirty(true);

    //add the new rule via standard CDF interface
    var objNode = this.getRulesTree().getRecordNode(strId);
    var strType = objNode.getAttribute("type");
    if(strType != "W" && strType != "T") {
      var objClone = objNode.cloneNode(true);
      objNode.getParent().appendChild(objClone);
      var i = objClone.selectNodeIterator("descendant-or-self::record");
      while(i.hasNext())
        i.next().setAttribute("jsxid",this.getKey());
      objClone.removeAttribute("jsxselected");
      this.getRulesTree().redrawRecord(objClone.getAttribute("jsxid"), jsx3.xml.CDF.INSERT);
    } else {
      Mapper._LOG.error("Cannot clone the root rule.",{instance:this});
    }
  };

  /**
   * Automatically maps a node in the rules tree to an attribute of the same name
   * @param MAPTYPE {String} one of: CDF Attribute, CDF Record , DOM
   * @private
   */
  Mapper_prototype.doAutoMap = function(MAPTYPE) {
    var objTree = this.getRulesTree();
    var oVal = objTree.getValue();
    if(oVal.length == 1)
      this.writeMappings(true);
    for (var i=0;i<oVal.length;i++) {
      var strId = oVal[i];
      var objNode = objTree.getRecordNode(strId);
      var strType = objNode.getAttribute("type");
      if (strType == "A" ||strType == "E" ||strType == "C" ||strType == "D") {
        //user reset this node in the rules tree by removing its child element; set to dirty
        this.getEditor().setDirty(true);
        jsx3.ide.getActiveEditor().setDirty(true);

        //create the mapping rule (for now only CDF Attribute will be auto-mapped)
        if (MAPTYPE == "CDF Record") {
          //bind a record mapping
          this.bindComplexRule(objTree,objNode,"mappings",MAPTYPE,"");
          //when mapping to the DOM, query for DIRECT descendant A and E items (./)
          var objNodes = objNode.selectNodes("record[@type='A' or @type='E']");
          //loop to create CDF Attribute mappings
          for (var j = objNodes.iterator(); j.hasNext(); ) {
            var objRecNode = j.next();
            this.bindComplexRule(objTree,objRecNode,"mappings","CDF Attribute",objRecNode.getAttribute("jsxtext"));
          }
        } else if (MAPTYPE == "CDF Attribute") {
          //create a CDF Attribute Mapping
          this.bindComplexRule(objTree,objNode,"mappings",MAPTYPE,objNode.getAttribute("jsxtext"));
        } else {
          var objJSX = jsx3.ide.getSelected()[0];
          if (objJSX && objJSX.getClass().equals(jsx3.gui.Block.jsxclass)) {
            /*

            //if the rule node has an ancestor CDF document, then add an attribute binding
              //add the textbox or selectbox to the DOM
            //if the rule node does not have an ancestor CDF document, then this is a CDF binding
              //(add CDF Document and Record mappings)
              //if this is a CDF binding, check the DOM to see if the selected DOM object or ancestor DOM object is an instance of CDF
                //if no instances of CDF found in the DOM (ancestor-or-self) (add CDF instance to the DOM)
            var strNameAsKey = this.getKey();
            objJSX = objJSX.load(Mapper.CDF_PROJECTION,false)
            objJSX.setPersistence(jsx3.app.Model.PERSISTEMBED);
            objJSX.setName(strNameAsKey);


            //only add document and record mappings: the trigger in jsx3.net.Service will simply scan the DOM for the jsx3.gui.CDF control
            //that shares the same xmlid as that of the cdf docuemnt just created
            this.bindComplexRule(objTree,objNode,"mappings","CDF Document",strNameAsKey + "_xml");
            this.bindComplexRule(objTree,objNode,"mappings","CDF Record","");
          */

            if (strType != "C" && objNode.selectNodes(".//restrictions/record[@name='enumeration']").size() == 0) {
              //create a new control in the DOM and map to it
              var strName = objNode.getAttribute("jsxtext");
              this.bindComplexRule(objTree,objNode,"mappings","DOM",strName);
              //this.bindComplexRule(objTree,objNode,"mappings","CDF Attribute",strName);
              var objChild = objJSX.load(Mapper.TEXTBOX_PROJECTION,false);
              objChild.setPersistence(jsx3.app.Model.PERSISTEMBED);

              //set the label caption and the name for the form field
              var objLabel = objChild.findDescendants(function(x) { return x.getName() == "label"; },true,true,false,false);
              if (objLabel.length) objLabel[0].setText(this.fromCamelCase(strName));
              objChild.getDescendantsOfType(jsx3.gui.TextBox)[0].setName(strName);
            } else {
              //create a collection of controls and map to them
              //when mapping to the DOM, query for ALL descendant A and E items (.//)
              var objNodes = objNode.selectNodes('descendant::record[attribute::type="A" or attribute::type="E"]');
              //if no nodes below the selected node, set self to be the collection

              if (objNodes.size() == 0)
                objNodes = objNode.selectNodes("//record[@jsxid='" + strId + "']");

              //loop to create CDF Attribute mappings
              for (var j = objNodes.iterator(); j.hasNext(); ) {
                //get the given rule node
                objNode = j.next();
                var strName = objNode.getAttribute("jsxtext");
                var mNode = this.bindComplexRule(objTree,objNode,"mappings","DOM",strName);
                //var mNode = this.bindComplexRule(objTree,objNode,"mappings","CDF Attribute",strName);

                //check if any enumeration restrictions
                var objEnums = objNode.selectNodes("restrictions/record[attribute::name='enumeration']");
                if (objEnums.size() > 0) {
                  var objChild = objJSX.load(Mapper.SELECT_PROJECTION,false);
                  objChild.setPersistence(jsx3.app.Model.PERSISTEMBED);
                  var objSelect = objChild.getDescendantsOfType(jsx3.gui.Select)[0];
                  //update the name of the control
                  objSelect.setName(strName);
                  var strXML = '<data jsxid="jsxroot">\n';
                  for (var ii=objEnums.iterator(); ii.hasNext(); ) {
                    var strValue = ii.next().getAttribute("value");
                    strXML += '<record jsxid="' + strValue + '" jsxtext="' + strValue + '"/>\n';
                  }
                  strXML += '</data>';
                  //bind xml data, using the enumerations as constrained list of values
                  objSelect.setXMLString(strXML);
                } else {
                  //update the name of the control
                  var objChild = objJSX.load(Mapper.TEXTBOX_PROJECTION,false);
                  objChild.setPersistence(jsx3.app.Model.PERSISTEMBED);
                  objChild.getDescendantsOfType(jsx3.gui.TextBox)[0].setName(strName);
                }
                //update the label caption
                var objLabel = objChild.findDescendants(function(x) { return x.getName() == "label";},true,true,false,false);
                if (objLabel.length) objLabel[0].setText(this.fromCamelCase(strName));
              }
            }
            objJSX.repaint();
          } else {
            this.getServer().alert("Invalid Target","You must first select a <b>jsx3.gui.Block</b> Element in the <b>DOM</b> palette before auto-mapping.");
          }
        }
      }

      //redraw the affected node
      objTree.redrawRecord(strId,jsx3.xml.CDF.UPDATE);

      //reset the map rules listed in the soaptester (but only if the tester interface is open)
      var objTester;
      if ((objTester = this.getTester()) != null) objTester.reset();
    }
    if(oVal.length == 1)
      this.readMappings(objTree,objNode,"mappings");
  };

  /**
   * converts a camel-case string (i.e., helloToYou) to a spaced equivalent (i.e., hello To You)
   * @private
   */
  Mapper_prototype.fromCamelCase = function(strText) {
    if (strText.toUpperCase() != strText) {
      var maxLen = strText.length;
      var outText = strText.substring(0,1);
      for (var i=1;i<maxLen-1;i++) {
        var cText = strText.substring(i,i+1);
        var dText = strText.substring(i+1,i+2);
        if (cText.toUpperCase() == cText && dText.toUpperCase() != dText) outText += " ";
        outText += cText;
      }
      return outText + strText.substring(maxLen-1);
    }
    return strText;
  };

  /**
   * Called when user hovers over the 'scriptlet' label shows contextual variables; displays spyglass of contextual variables available to 'Script' type mappings
   * @private
   */
  Mapper_prototype.doSpyContextFields = function() {
    var cache = jsx3.IDE.getCache();
    var objXML = cache.getOrOpenDocument(ADDIN.resolveURI("xml/context_fields.xml"));
    var objTemplate = cache.getOrOpenDocument(ADDIN.resolveURI("xsl/context_fields.xsl"), null, jsx3.xml.XslDocument.jsxclass);
    return objTemplate.transform(objXML);
  };

  /**
   * gets the url for the serialization file containing the editor appropriate to the editor type. This method may be subclassed to provide edit interfaces not yet supported
   * @param ruleType {String} type of rule node in the CEF. One of: A, C, E, P, T, O, I, F, S, W, D
   * @return {String} url for serialization file (or null if none associated)
   * @private
   */
  Mapper_prototype.getEditorForType = function(ruleType) {
    if (this.getRulesTree().getValue().length == 1) {
      if (ruleType == "A" || ruleType == "C" || ruleType == "E" || ruleType == "D") {
        //edit field
        return "components/Rules/rule_node.xml";
      } else if (ruleType =="P" || ruleType =="T") {
        //operation
        return "components/Rules/operation_node.xml";
      } else if (ruleType == "O") {
        //the output message (an inbound response)
        return "components/Rules/inbound_node.xml";
      } else if (ruleType == "I") {
        //the input message (an outbound request)
        return "components/Rules/outbound_node.xml";
      }
    }
  };

  /**
   * Called when a rule in the rules tree is selected; displays the appropriate information in the profile and editor panes
   */
  Mapper_prototype.onRuleSelect = function() {
    //persist old edits before loading new editor
    this.writeMappings(false);

    //get the selected node in the tree
    var objTree = this.getRulesTree();
    var strId = objTree.getValue();
    var objNode = objTree.getXML().selectSingleNode("//record[@jsxid='" + strId + "']");
    this._currentid = strId;

    var objJSX = this.getEditorPane();

    //was a valid node selected in the tree
    if (objNode) {
      //0) get the type of node selected in the tree (this is used to drive the editor pane as well as the source schema pane)
      var ruleType = objNode.getAttribute("type");

      //1) get URL for the editor pane relevant to the selected node in the mapping tree
      var strURL = this.getEditorForType(ruleType);

      //2) hide any existing content
      if ((strURL != objJSX._jsxuri)  && objJSX.getChildren().length > 0) {
        //the needed editor is not the active editor; hide all children of the editor pane
        for (var i=0;i<objJSX.getChildren().length;i++)
          objJSX.getChild(i).setDisplay(jsx3.gui.Block.DISPLAYNONE,true);
      }

      //3) add new content if a valid map rule was clicked
      var objContent;
      if (strURL && strURL != objJSX._jsxuri) {
        //load the content
        if (objContent = this.getDescendantOfName(strURL)) {
          //the content already existed--just restore from the bin (a block) that the mapper uses to hold existing UI
          objContent.setDisplay(jsx3.gui.Block.DISPLAYBLOCK,true);
        } else {
          //load the new component from disk
          //TO DO: not sure why, but I'm force to reset the box profile. seems like the gui instance doesn't exist yet???
          var objContent = objJSX.load(strURL);
          objContent.setName(strURL);
        }
        objJSX._jsxuri = strURL;
      } else if (!strURL) {
        //either a type with no associated editor or multiple nodes in the tree have been selected
        delete objJSX._jsxuri;
      }

      //4) now that the appropriate field editor is loaded, update field values in the editor based upon the type of node selected in the rules tree
      if (strURL != null) {
        if (ruleType == "P" || ruleType == "T") {
          //load values into the operation/trasaction editor pane that was just loaded
          this.readMappings(objTree,objNode,"headers");
          this.readMapping(objNode,"endpoint");
          this.readMapping(objNode,"method");
          this.onMethodChange(this.getDescendantOfName("jsx_schema_mapnode_method"),objNode.getAttribute("jsonp") == "1");
        } else if (ruleType == "A" || ruleType == "C" || ruleType == "E" || ruleType == "D") {
          //load values into the rule node editor pane that was just loaded
          this.readMappings(objTree,objNode,"mappings");
          this.readMappings(objTree,objNode,"restrictions");
          this.readMapping(objNode,"repeat");
        } else if (ruleType == "I") {
          //stubsrc, stubpath,onbeforesend
          this.readMapping(objNode,"stubsrc");
          this.readMapping(objNode,"stubpath");
          this.readMapping(objNode,"onbeforesend");
        } else if (ruleType == "O") {
          //stubsrc, onafterreceive
          this.readMapping(objNode,"stubsrc");
          this.readMapping(objNode,"onafterreceive");
        }
      }

      //display the appropriate profile information (either the original source node or the generated profile for the selected rule node)
      if (this.getProfileType() == "schema") {
        this.showSchema(objNode);
      } else {
        this.showProfile(objNode);
      }
    } else {
      //either a rule was selected that has no associated editor or multiple rules in the rules tree have been selected
      for (var i=0;i<objJSX.getChildren().length;i++)
          objJSX.getChild(i).setDisplay(jsx3.gui.Block.DISPLAYNONE,true);

      //delete the id for the active editor panel (since there is no longer an active editor panel--they've all been hidden)
      delete objJSX._jsxuri;

      //hide the schema source/rule node profile pane
      this.resetSourcePane();
    }
  };

  var _elementPrefixes = {definitions:"jsx1",types:"jsx1",message:"jsx1",part:"jsx1",service:"jsx1",port:"jsx1",operation:"jsx1",binding:"jsx1",schema:"jsx3",complexType:"jsx3",complexContent:"jsx3",simpleContent:"jsx3",extension:"jsx3",element:"jsx3",group:"jsx3",all:"jsx3",choice:"jsx3",sequence:"jsx3",any:"jsx3",anyAttribute:"jsx3",attribute:"jsx3",attributeGroup:"jsx3",unique:"jsx3",key:"jsx3",keyref:"jsx3",selector:"jsx3",field:"jsx3",include:"jsx3",address:"jsx4"};
  var _elementRE = /([^\[]*)/;
  var _elementindexRE = /\[index\(\)\s*=\s*(\d*)\]/g;
  /**
   * Returns the path in the source WSDL with the namespace prefixes resolved to the supported/known element type
   * @param strPath {String}
   * @return {String}
   * @private
   */
  Mapper.resolveElementPrefixes = function(strPath) {
    var a = [];
    var objPath = strPath.split("/");
    var pathLen = objPath.length;
    for (var i=0;i<pathLen;i++) {
      if (objPath[i]) {
        var objName = objPath[i].split(":");
        var strName = (objName.length == 2) ? objName[1] : objName[0];
        var strName = strName.replace(_elementRE,function($0,$1){ return _elementPrefixes[$1] + ":" + $1 });
        a.push(strName);
      }
    }

    //reassemble
    var strNewPath = "/" + a.join("/");

    //do final conversion to XPath syntax (index() not supported)
    strNewPath = strNewPath.replace(_elementindexRE,function(str,num) { return (num == 0) ? "" : "[" + ((num - 0) + 1) + "]"; });

    return strNewPath;
  };

  /**
   * Called by onRuleSelect. Displays the source xml for the source node used to generate the currently-selected node in the rules tree
   * @param objNode {jsx3.xml.Entity} selected node in the Rules Tree
   */
  Mapper_prototype.showSchema = function(objNode,bShowWSDL) {
    //determine the node for which to display the source schema/xml
    if (!objNode) {
      var objTree = this.getRulesTree();
      objNode = objTree.getXML().selectSingleNode("//record[@jsxid='" + objTree.getValue() + "']");
    }
    var strSchemaPath = objNode.getAttribute("path");
    var myType = objNode.getAttribute("datatype");

    if (!bShowWSDL && strSchemaPath == "/jsx1:definitions") {
      //this is the entire WSDL (which often is too much for the browser to handle)
      //place a Button on-screen that the user can click if they really want to view it
      var oDoc = new jsx3.xml.Document();
      oDoc.loadXML("<wsdl/>");
      var objSchemaPane = this.getDescendantOfName("jsx_schema_sourcexml");
      this.getServer().getCache().setDocument(objSchemaPane.getXMLId(),oDoc);
      objSchemaPane.loadAndCache("components/Profiles/show_wsdl_button.xml",false);
      objSchemaPane.setDisplay(jsx3.gui.Block.DISPLAYBLOCK,false);
      objSchemaPane.repaint();
    } else if (strSchemaPath == null || strSchemaPath == "") {
      //deref and hide xml source driving the rules tree
      this.resetSourcePane();
    } else {
      //in case 'show wsdl' button exists
      this.getDescendantOfName("jsx_schema_sourcexml").removeChildren();

      //make sure the source pane exists where the markup will display
      var objSource = this.getDescendantOfName("jsx_schema_sourcexml");
      if (objSource) {
        //make visible if not
        objSource.setDisplay(jsx3.gui.Block.DISPLAYBLOCK,true);

        //get the input source (pattern master)
        var objWSDL = this.getSourceDocument(this.getSourceDocumentURL(objNode));
        if (objWSDL != null && !objWSDL.hasError()) {
          var objMap = this.getNSMap(this.getSourceDocumentURL(objNode));

          //get the  node in the wsdl pointing to 'element'
          var objElementNode = objWSDL.selectSingleNode(strSchemaPath,objMap);
          if (objElementNode) {
            var strType;
            if ((strType = objNode.getAttribute("datatype")) != null && !this.isSimpleNode(objNode,strType)) {
              //now that we know the type, we can locate it within the schema
              var myTSQ = this.getTargetedSchemaQuery(strType,objWSDL,objMap);
              var objTempNode = objWSDL.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "//" + objMap[this.getSchemaNS()] + ":complexType[@name='" + this.getBaseName(strType) + "']",objMap);
              if (objTempNode == null)
                objTempNode = objWSDL.selectSingleNode("//" + objMap[this.getSchemaNS()] + ":schema" + myTSQ + "//" + objMap[this.getSchemaNS()] + ":simpleType[@name='" + this.getBaseName(strType) + "']",objMap);
              if (objTempNode != null)
                objElementNode = objTempNode;
            }
          }

          //display the nodeset if found; if not, hide the source pane by resetting to its initial state
          if (objElementNode) {
            var strXML = objElementNode.getXML();
            var oDoc = new jsx3.xml.Document();
            oDoc.loadXML(strXML);
            var objSchemaPane = this.getDescendantOfName("jsx_schema_sourcexml");
            this.getServer().getCache().setDocument(objSchemaPane.getXMLId(),oDoc);
            objSchemaPane.repaint();
          } else {
            //deref and hide xml source driving the rules tree
            this.resetSourcePane();
          }
        } else {
          //deref and hide xml source driving the rules tree
          this.resetSourcePane();
        }
      }
    }
  };

  /**
   * Called by onRuleSelect. Displays the source the rule node profile for the currently-selected node in the rules tree
   */
  Mapper_prototype.showProfile = function(objNode) {
    //get the type
    var strType = objNode.getAttribute("type");
    if (strType == "A" || strType == "C" ||strType == "E" ||strType == "D") strType = "R";

    //load the profile document appropriate to the type of rule node that has been selected
    var objMtx = this.getDescendantOfName("jsx_schema_profile");
    if (objMtx) {
      var objXML = objMtx.getServer().getCache().openDocument(
          ADDIN.resolveURI("xml/profiles/" + strType + ".xml"), objMtx.getXMLId());

      //add values and repaint the grid
      var objRecords = objXML.selectNodes("//record");
      for (var i=objRecords.iterator(); i.hasNext(); ) {
        var objRecord = i.next();
        var strValue = objNode.getAttribute(objRecord.getAttribute("jsxid"));
        if (strValue) objRecord.setAttribute("value",strValue);
      }

      objMtx.repaintData();
    }
  };

  /**
   * Called when the transport method is changed (GET, POST, ETC)
   */
  Mapper_prototype.onMethodChange = function(objSelect,bValue) {
    //added support for jsonp
    if(objSelect.getValue() == "SCRIPT") {
      objSelect.getNextSibling().setDisplay("",true);
      objSelect.getNextSibling().setChecked(bValue !== false ? 1 : 0);
     } else {
      objSelect.getNextSibling().setDisplay("none",true);
      objSelect.getNextSibling().setChecked(0);
    }
  };

  /**
   * Persists values in mappings editor before loading another editor (called by selection change event on node in rules tree)
   * @param bState {boolean} false if null; if true, state is maintained (the update is not assumed to be part of a change in selection, but merely an update)
   */
  Mapper_prototype.writeMappings = function(bState) {
    //check if existing edit to persist
    if (this._currentid) {
      //delete flag denoting an edit to persist
      var strId = this._currentid;
      if (!bState) delete this._currentid;

      //get the selected node in the tree and determine which values to add/remove
      var objTree = this.getRulesTree();
      var objNode = objTree.getXML().selectSingleNode("//record[@jsxid='" + strId + "']");
      if (objNode) {
        //call form method to locate all form elements and process accordingly
        var bDirty = false;
        var objSearchFrom = this.getDescendantOfName(this.getEditorPane()._jsxuri);
        if (objSearchFrom) {
          objSearchFrom.findDescendants(function(objJSX) {
            if ((jsx3.gui.TextBox && objJSX.instanceOf("jsx3.gui.TextBox")) || (jsx3.gui.Select && objJSX.instanceOf("jsx3.gui.Select"))) {
              if (objJSX.getEnabled() !== 0) {
                //located a form field. get its name to know whether an update occurred
                var strName = objJSX.getName();
                var strAtt = strName.substring(strName.lastIndexOf("_") + 1);
                var newValue = objJSX.getValue();
                if (typeof(newValue) == "String") newValue = jsx3.util.strTrim(newValue);
                var oldValue;
                if ((oldValue = objNode.getAttribute(strAtt)) != null && (newValue == null || newValue == "")) {
                  //delete an existing attribute
                  bDirty = true;
                  objNode.removeAttribute(strAtt);
                } else if (((oldValue = objNode.getAttribute(strAtt)) == null || oldValue == "" || oldValue != newValue) && newValue != null && newValue != "") {
                  //insert/update an attribute
                  bDirty = true;
                  objNode.setAttribute(strAtt, newValue);
                }
              }
            } else if(objJSX instanceof jsx3.gui.Matrix) {
              var objSessionNode = objJSX.getXML().selectSingleNode("//record");
              var objCx = objJSX.getXML().selectSingleNode("/data/*");
              var strPersistId = objCx.getAttribute("jsxid");
              var objPersistNode = objNode.selectSingleNode(objCx.getNodeName());
              if(objSessionNode) {
                var objSessionClone = objJSX.getXML().selectSingleNode("/data/*").cloneNode(true);
                if(objPersistNode) {
                  objNode.replaceNode(objSessionClone,objPersistNode);
                } else {
                  objNode.appendChild(objSessionClone);
                }
              } else {
                //no valid records try to remove
                if(objPersistNode)
                  objPersistNode.getParent().removeChild(objPersistNode);
              }
            } else if(typeof(jsx3.gui.CheckBox) != "undefined" && objJSX instanceof jsx3.gui.CheckBox) {
              if(objJSX.getChecked()) {
                if(jsx3.util.strEmpty(objNode.getAttribute("jsonp"))) {
                  bDirty = true;
                  objNode.setAttribute("jsonp","1");
                }
              } else {
                if(!jsx3.util.strEmpty(objNode.getAttribute("jsonp"))) {
                  bDirty = true;
                  objNode.removeAttribute("jsonp");
                }
              }
            }
          },true,true,false,true);
        }

        //set to dirty and repaint the given node to reflect
        if (bDirty) {
          this.getEditor().setDirty(bDirty);
          objTree.redrawRecord(strId,jsx3.xml.CDF.UPDATE);
        }
      }
    }
  };

  /**
   * Reads an attribute value from the active rule node and updates the related on-screen field
   * @param objNode {jsx3.xml.Entity} node in the rules tree
   * @param strAttName {String} named attribute on the rule node (stubsrc, stubpath, etc)
   */
  Mapper_prototype.readMapping = function(objNode,strAttName) {
    this.getDescendantOfName("jsx_schema_mapnode_" + strAttName).setValue(objNode.getAttribute(strAttName));
  };

  /**
   * Reads attribute value(s) from the active rule node and updates the related on-screen grid
   * @param objTree {jsx3.gui.Tree} rules tree
   * @param objNode {jsx3.xml.Entity} node in the rules tree
   * @param strAttName {String} name of complex node containing complex attribute collection. one of: mappings, headers, restrictions
   */
  Mapper_prototype.readMappings = function(objTree, objNode, strAttName) {
    var objMtx = this.getDescendantOfName("jsx_schema_mapnode_" + strAttName);
    var objRNode = objNode.selectSingleNode(strAttName);
    var objCDF = jsx3.xml.CDF.Document.newDocument();
    var objRoot = objCDF.getRootNode();
    if (objRNode) {
      var objCNode = objRNode.cloneNode(true);
      var strRenderingContext = objRNode.getAttribute("jsxid");
    } else {
      var strRenderingContext = this.getKey();
      var objCNode = objRoot.createNode(jsx3.xml.Entity.TYPEELEMENT, strAttName);
      objCNode.setAttribute("jsxid", strRenderingContext);
    }
    objRoot.appendChild(objCNode);
    objMtx.getServer().getCache().setDocument(objMtx.getXMLId(), objCDF);
    objMtx.setRenderingContext(strRenderingContext, true);
    objMtx.repaintData();
  };

  /**
   * Displays the 'open' dialog, allowing the user to choose a given file in the JSX build
   * @param strJSXId {String} jsxid for the textbox element to update with the selected value from the FSO
   */
  Mapper_prototype.browseURL = function(strJSXId) {
    jsx3.ide.getPlugIn("jsx3.io.browser").chooseFile(jsx3.IDE.getRootBlock(), {
        name:"jsxdialog", modal:true, title:"Choose Mapping Rules File", okLabel:"OK",
        folder: jsx3.ide.getCurrentDirectory(), onChoose: jsx3.$F(function(objFile) {
        var objJSX = this.getDescendantOfName(strJSXId);
        objJSX.setValue(jsx3.net.URI.decode(jsx3.ide.PROJECT.getDirectory().relativePathTo(objFile)));
        jsx3.ide.setCurrentDirectory(objFile.getParentFile());
        }).bind(this)
    });
  };

  /**
   * Called by RadioButton toggle. updates the profile type to display for the selected node in the rules tree
   * @param objRadio {jsx3.gui.RadioButton} radio button instance just clicked
   */
  Mapper_prototype.updateProfilePane = function(objRadio) {
    var objParent = this.getDescendantOfName("jsx_schema_source");
    var objTree = this.getRulesTree();
    var objNode = objTree.getXML().selectSingleNode("//record[@jsxid='" + objTree.getValue() + "']");

    //toggle the display of the schema and node profile panes
    var oS = objParent.getChild("jsx_schema_sourcexml");
    var oP = objParent.getChild("jsx_schema_profile");
    if (objRadio.getValue() == "schema") {
      if (oP) oP.setDisplay("none",true);
      if (!oS)
        objParent.load("components/Profiles/" + objRadio.getValue() + ".xml",true);
      else
        oS.setDisplay("",true);
      this.showSchema(objNode);
    } else {
      if (oS) oS.setDisplay("none",true);
      if (!oP)
        objParent.load("components/Profiles/" + objRadio.getValue() + ".xml",true);
      else
        oP.setDisplay("",true);
      this.showProfile(objNode);
    }
  };

  /**
   * Returns the profile type for the selected rule node (as defined by the selection state for the radio group, jsx_schema_profile)
   * @return {String} one of: schema, profile
   */
  Mapper_prototype.getProfileType = function() {
    var btn = this.getDescendantOfName("jsx_schema_rdo_schema");
    return btn && btn.getGroupValue();
  };

  /**
   * Called when a cell is edited in the profile grid for a rule node. Updates model and VIEW
   * @param strAttName {String} name of attribute on rule node to update
   * @param objMask {jsx3.xml.TextBox} edit mask for the grid
   */
  Mapper_prototype.onProfileEdit = function(strAttName,objMask) {
    //update this value on teh selected rule node to persist
    this.getRulesTree().insertRecordProperty(this.getRulesTree().getValue(),strAttName,objMask.getValue(),true);
    this.getEditor().setDirty(true);
  };

  /**
   * Prioritizes (or de-) the active row in the grid to affect execution order of the mapping
   * @param strJSXId {String} jsxname property for grid to move the active row up or down for
   * @param strCDFId {String} id of cdf record to prioritize or not
   * @param bUp {boolean} if true, the row is moved up in order
   */
  Mapper_prototype.prioritizeRow = function(strJSXId,strCDFId,bUp) {
    //get the selected item and move up or down
    if (!strCDFId) return;
    var objGrid = jsx3.GO(strJSXId);
    var objNode = objGrid.getRecordNode(strCDFId);
    if (objNode) {
      //update dirty state
      this.getEditor().setDirty(true);

      var objParentNode = objNode.getParent();
      var objChildren = objParentNode.getChildNodes();
      if (bUp) {
        for (var i=1;i<objChildren.size();i++) {
          if (objChildren.get(i).equals(objNode)) {
            objParentNode.insertBefore(objNode, objChildren.get(i-1));
            objGrid.repaintData();
            return;
          }
        }
      } else {
        for (var i=objChildren.size()-2;i>=0;i--) {
          if (objChildren.get(i).equals(objNode)) {
            objParentNode.insertBefore(objChildren.get(i+1),objNode);
            objGrid.repaintData();
            return;
          }
        }
      }
    }
  };

  /**
   * Inserts a new row, adding to the named grid specific to the TYPE
   * @param TYPE {String} one of: mappings, restrictions, headers
   * @param objRecord {Object} JavaScript object created by the autorow. Contains named properties: name, value
   */
  Mapper_prototype.insertRow = function(TYPE,objRecord) {

    return true;
  };


  /**
   * Inserts a new row, adding to the named grid specific to the TYPE
   */
  Mapper_prototype.onInsertRow = function() {
    //update dirty state
    this.getEditor().setDirty(true);

    //update the tester  if it is open
    if (this.getTester()) this.getTester().listRules();

    //update the rule in the tree and redraw
    this.writeMappings(true);
    this.getRulesTree().redrawRecord(this.getRulesTree().getValue()[0]);
  };

  /**
   * Formats the context menu used by the rules tree, disabling/enabling items appropriate to selection
   * @param objMenu {jsx3.gui.Menu}
   */
  Mapper_prototype.formatMenu = function(objMenu) {
    var objTree = this.getRulesTree();
    var oVal = objTree.getValue();
    var bSample;
    var iQuicktest = 0;
    var i11 = 0;
    var i12 = 0;

    for (var i=0;i<oVal.length;i++) {
      var strType = objTree.getRecordNode(oVal[i]).getAttribute("type");

      if (strType == 'I' ||strType == 'O' ||strType == 'F') {
        if (bSample !== false) bSample = true;
      } else {
        bSample = false;
      }

      if (strType == 'P' || strType == 'T') {
        if (iQuicktest != -1) iQuicktest+=1;
      } else {
        iQuicktest = -1;
      }

      if (strType == 'F' || strType == 'I' || strType == 'O') {
        if (i11 != -1) i11+=1;
        i12 = -1;
      } else if (strType == 'C' || strType == 'E' || strType == 'A' || strType == 'D') {
        if (i11 != -1) i11+=1;
        if (i12 != -1) i12+=1;
      } else {
        i11 = -1;
        i12 = -1;
      }
    }

    if (bSample == true)
      objMenu.enableItem('sample');
    else
      objMenu.disableItem('sample');

    if (iQuicktest == 1)
      objMenu.enableItem('quicktest');
    else
      objMenu.disableItem('quicktest');

    if (i11 == 1 && i12 <= 0) {
      objMenu.disableItem('reparse');
      objMenu.enableItem('11');
      objMenu.disableItem('12');
      objMenu.disableItem('13');
    } else if (i12 == 1 && i11 <= 0) {
      objMenu.enableItem('reparse');
      objMenu.disableItem('11');
      objMenu.enableItem('12');
      objMenu.enableItem('13');
    } else if (i12 == 1 && i11 == 1) {
      objMenu.enableItem('reparse');
      objMenu.enableItem('11');
      objMenu.enableItem('12');
      objMenu.enableItem('13');
    } else {
      objMenu.disableItem('reparse');
      objMenu.disableItem('11');
      objMenu.disableItem('12');
      objMenu.disableItem('13');
    }
  };

  /**
   * Formats the 'auto map' menu used by the toolbar, disabling/enabling items appropriate to selection
   * @param objMenu {jsx3.gui.Menu}
   */
  Mapper_prototype.formatToolbar = function(objMenu) {
    var objTree = this.getRulesTree();
    var oVal = objTree.getValue();
    var i21 = 0;

    //loop to validate what options there are for automapping given the selected nodes in the rules tree
    for (var i=0;i<oVal.length;i++) {
      var strType = objTree.getRecordNode(oVal[i]).getAttribute("type");
      if (strType == 'C' || strType == 'E' || strType == 'A') {
        if (i21 != -1) i21+=1;
      } else {
        i21 = -1;
      }
    }

    if (i21 > 0) {
      objMenu.enableItem('21');
      objMenu.enableItem('22');
      objMenu.enableItem('23');
    } else {
      objMenu.disableItem('21');
      objMenu.disableItem('22');
      objMenu.disableItem('23');
    }
  };

  /**
   * Generates a sample message. Displays in a new dialog
   */
  Mapper_prototype.reparseBranch = function(strId) {
    var objTree = this.getRulesTree();
    var objParent = objTree.getRecordNode(strId);

    if (objParent) {
      var me = this;
      this.getAncestorOfType(jsx3.gui.Dialog).confirm(
        "Reparse Selected Branch",
        "Reparsing this branch of the tree will remove any existing descendant rules from the selected item. Do you wish to proceed?",
        function(d){
          d.doClose();
          me.getEditor().setDirty(true);

          //3.4.1: had to fix deprecated code that no longer worked
          var i = objParent.selectNodeIterator("record");
          while (i.hasNext())
            objParent.removeChild(i.next());
          objTree.redrawRecord(objParent.getAttribute("jsxid"),jsx3.xml.CDF.UPDATE);

          //call to reparse
          me.doDrill(strId,true,objTree,objParent);
        },
        null,
        "Reparse",
        "Cancel",
        1);
    }
  };

  /**
   * Generates a sample message. Displays in a new dialog
   */
  Mapper_prototype.generateSample = function() {
    var strXML = "";
    var oVal = this.getRulesTree().getValue();
    var intLeft = 200;
    var intTop = 200;
    for (var i=0;i<oVal.length;i++) {
      var strId = oVal[i];
      var objRecordNode = this.getRulesTree().getRecordNode(strId);
      var strType = objRecordNode.getAttribute("type");
      if (strType == "I" || strType == "O" || strType == "F") {
        //create a service instance
        var objParent = objRecordNode.getParent();
        var strOpId = objParent.getAttribute("opname");
        var oService = new jsx3.net.Service();
        oService.setRulesXML(this.getRulesXML());
        if (strOpId) oService.setOperationName(strOpId);
        oService.setNamespace(jsx3.ide.SERVER.getEnv('namespace'));
        var sType;
        if (strType == "I") sType = "input";
        if (strType == "O") sType = "output";
        if (strType == "F") sType = "fault";
        strXML = oService.getServiceMessage(sType).getRootNode().getXML();
        oService.resetRulesTree();

        //load the test message viewer (add carriage returns so test message is more readable)
        strXML = strXML.replace(/></g,">\n<");
        var objJSX = jsx3.IDE.getRootBlock().load("components/ServiceTest/simulated_message.xml", null, ADDIN);
        objJSX.setLeft(intLeft+=20,true);
        objJSX.setTop(intTop+=20,true);
        var objBX = objJSX.getDescendantOfName("jsxpreviewmarkup");
        var objTArea = objJSX.getDescendantOfName("jsxpreviewmarkup_raw");
        var strId = objBX.getXMLId();
        var objDoc = new jsx3.xml.Document();
        objDoc.loadXML(strXML);

        objTArea.setValue(objDoc.getXML().replace("\t","  "));
        objBX.getServer().getCache().setDocument(strId,objDoc);
        objBX.repaint();
        var objCB = objJSX.getDescendantOfName("jsxcaptionbar");
        objCB.setText(((strOpId) ? (strOpId + " | ") : "") + "Sample " + sType.toUpperCase() + " Message",true);
      }
    }
  };

  /**
   * Clears all documents from the cache related to the mapping, restriction, and httpheader matrices
   */
  Mapper_prototype.resetCacheData = function() {
    var oCache = jsx3.IDE.getCache();
    oCache.clearById("jsx_schema_mapnode_mappings_XML",true);
    oCache.clearById("jsx_schema_mapnode_restrictions_XML",true);
    oCache.clearById("jsx_schema_mapnode_headers_XML",true);
    oCache.clearById("jsx_schema_mapnode_mappings_XSL",true);
    oCache.clearById("jsx_schema_mapnode_restrictions_XSL",true);
    oCache.clearById("jsx_schema_mapnode_headers_XSL",true);
  };

  /**
   * closes the tester if it is open
   */
  Mapper_prototype.onDestroy = function(objParent) {
    //call standard destroy method for model (removes on-screen view if one exists)
    this.jsxsuper(objParent);

    //clear any xml documents from the cache that were set to 'share'
    this.resetCacheData();

    //reset the log to info (this is how it opens by default)
    Mapper._LOG.setLevel(Logger.INFO);

    //close the tester if it is open
    var oTester;
    if ((oTester = this.getTester(objParent)) != null) oTester.close();
  };

});
