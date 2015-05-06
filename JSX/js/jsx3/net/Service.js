/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _compiled _compiler_ns _compiler_ns_sequence

/**
 * This class is used in conjunction with the XML Mapping Utility to provide transactional support for those services using XML-based messaging.
 * Support includes those services defined via Schema, XML, XHTML, and WSDL (SOAP).  In practice a developer would open General Interface Builder
 * to access the XML Mapping Utility.  They would then point the utility at a "pattern master" (i.e., WSDL, Schema, XML, etc) and begin using its
 * visual tools to bind application objects to nodes in the XML messages to be sent and received.
 * The output from the Mapping Utility is referred to as a mapping rule set.  This rule set is an XML document based upon the Common Exchange Format (CXF)
 * and defines the information necessary to support transactional data mapping. Many of the APIs available to the Service class allow the devloper to
 * dynamically update various static values that were set using the XML Mapping Utility.
 */
jsx3.Class.defineClass("jsx3.net.Service", null, [jsx3.util.EventDispatcher], function(Service, Service_prototype) {

  // TODO: Remove dependencies on jsx3.ide code.

/* CONSTANTS ************************************************************/
  //refer to http://www.w3.org/TR/xmlschema-2/ for an explanation of simple/derived types and values
  Service.simpletypes = {};
  Service.simpletypestext = "Lorem ipsum dolor sit amet consectetuer adipiscing elit In pharetra wisi non dolor Pellentesque a ipsum Nulla laoreet erat a nulla In porta luctus justo Pellentesque arcu odio sollicitudin ac hendrerit non ornare et risus Proin aliquam viverra ligula Aliquam eget lectus eu lorem convallis volutpat Aliquam erat volutpat";
  Service.simpletypes["string"] = function() {
            var i = parseInt(Math.random() * (Service.simpletypestext.length - 15));
            return jsx3.util.strTrim(Service.simpletypestext.substring(i,i+15));
          };
  Service.simpletypes["int"] = "1000";
  Service.simpletypes["integer"] = "2000";
  Service.simpletypes["double"] = "1.234";
  Service.simpletypes["boolean"] = "true";
  Service.simpletypes["date"] = "2005-10-19Z";
  Service.simpletypes["time"] = "22:33:12Z";
  Service.simpletypes["short"] = "1";
  Service.simpletypes["unsignedLong"] = "26216842";
  Service.simpletypes["unsignedInt"] = "10";
  Service.simpletypes["unsignedShort"] = "1";
  Service.simpletypes["unsignedByte"] = "10";
  Service.simpletypes["byte"] = "10";
  Service.simpletypes["long"] = "48216842";
  Service.simpletypes["decimal"] = "1.00";
  Service.simpletypes["positiveInteger"] = "100";
  Service.simpletypes["negativeInteger"] = "-30";
  Service.simpletypes["nonPositiveInteger"] = "-40";
  Service.simpletypes["nonNegativeInteger"] = "10";
  Service.simpletypes["nonPositiveInteger"] = "-10";
  Service.simpletypes["duration"] = "1696-09-01T00:00:00";
  Service.simpletypes["dateTime"] = "10-25-2004T11:34:01";
  Service.simpletypes["gYear"] = "2005";
  Service.simpletypes["date"] = "10-25-2004";
  Service.simpletypes["gMonthDay"] = "12-25";
  Service.simpletypes["gDay"] = "25";
  Service.simpletypes["gMonth"] = "12";
  Service.simpletypes["gYearMonth"] = "2004-12";
  Service.simpletypes["base64Binary"] = "bGJpcmRlYXVAdGliY28uY29t";
  Service.simpletypes["float"] = "134.52";
  Service.simpletypes["decimal"] = "0.923874";
  Service.simpletypes["anyURI"] = "http://www.generalinterface.org/";
  Service.simpletypes["NMTOKEN"] = "Y";
  Service.simpletypes["NMTOKENS"] = "NO";
  Service.simpletypes["Name"] = "abc";
  Service.simpletypes["NCName"] = "abcdefg";
  Service.simpletypes["token"] = "Y";
  Service.simpletypes["language"] = "en-cockney";
  Service.simpletypes["normalizedString"] = Service.simpletypes["string"];
  Service.simpletypes["ID"] = "ID";
  Service.simpletypes["IDREFS"] = "IDREFS";
  Service.simpletypes["ENTITY"] = "ENTITY";
  Service.simpletypes["ENTITIES"] = "ENTITIES";
  Service.simpletypes["QName"] = "qname";
  Service.simpletypes["hexBinary"] = "\\u255\\u254";
  Service.simpletypes["notation"] = "here is a note";

  Service.inc_inc = 0;  //incrementable variable to provide unique ID if necessary (jsx3.net.Service.getUniqueId())

  /** @private @jsxobf-clobber */
  Service._ns = {};
  Service._ns["SOAP-ENV"] = "http://schemas.xmlsoap.org/soap/envelope/";
  Service._ns["SOAP-ENC"] = "http://schemas.xmlsoap.org/soap/encoding/";
  Service._ns["xsi"]      = "http://www.w3.org/2001/XMLSchema-instance";
  Service._ns["xsd"]      = "http://www.w3.org/2001/XMLSchema";
  Service._ns["xml"]      = "http://www.w3.org/XML/1998/namespace";

  /**
   * {String} XML namespace for JSON objects when converted to XML
   * @final @jsxobf-final
   */
  Service.json_namespace = "http://xsd.tns.tibco.com/gi/json/2007/";
  
  /**
   * {String} event type for successful response
   * @final @jsxobf-final
   */
  Service.ON_SUCCESS = "onSuccess";

  /**
   * {String} event type for unsuccessful response
   * @final @jsxobf-final
   */
  Service.ON_ERROR = "onError";

  /**
   * {String} Event type published when the response is still not ready after the specified timeout period.
   * @final @jsxobf-final
   */
  Service.ON_TIMEOUT = "onTimeout";

  /**
   * {String} Event type published each time a rule with one or more restrictions fails during message generation. The following named properties are available on the event object:
   * <ul><li><b>rule</b> the rule node</li>
   * <li><b>message</b> the message node</li>
   * <li><b>target</b> this jsx3.net.Service instance</li>
   * <li><b>type</b> the type of restriction that caused the invalidation event to be publsihed. For example, pattern.</li>
   * <li><b>value</b> the value for the type. For example if type is pattern, then [A-Z]*</li></ul>
   * @final @jsxobf-final
   */
  Service.ON_INVALID = "onInvalid";

  /**
   * {String} Event type published each time a mapping rule is used to create a node, locate a node, or map to a node.
   * <ul><li><b>target</b> this jsx3.net.Service instance</li>
   * <li><b>rule</b> the rule node being processed</li>
   * <li><b>action</b> the action being performed by the rule. For example, <code>Create Node</code>, <code>Map to Cache</code>, <code>Invalidate Node</code>, etc.</li>
   * <li><b>description</b> a description of the 'action'. For example, <code>this.eval(setValue(2));</code></li>
   * <li><b>level</b> the log level (e.g., 'severity' level) for the message. For example, <code>6</code> would signify a 'Trace' level event.</li></ul>
   * @final @jsxobf-final
   */
  Service.ON_PROCESS_RULE = "onProcessRule";

  /**
   * instance initializer
   * @param strRulesURL {String} The resolved URI for the rules document (a CXF document).
   * Note: since this class is lazily loaded as of v3.2, the preferred method of instantiating this class is by calling the <code>loadResource</code>
   * method on the context server (<code>jsx3.app.Server</code>) instance. This ensures proper URL resolution while also establishing the
   * appropriate server context.
   * @param strOperationName {String} name of operation to call. This is only required if the rules file was generated via a WSDL.
   * @param strOutboundURL {String} address of a sample outbound message to use as opposed to the one generated by the tool
   * @param strInboundURL {String} when the project is run in static mode (as defined by the 'project deployment options' dialog),
   * this document is used to simulate a typical server response
   */
  Service_prototype.init = function(strRulesURL,strOperationName,strOutboundURL,strInboundURL) {
    //bind input properties
    this.setRulesURL(strRulesURL);
    this.setOperationName(strOperationName);

    //set ref to static docs (should be deprecated)
    if (strOutboundURL != null) this.setOutboundURL(strOutboundURL);
    if (strInboundURL != null) this.setInboundURL(strInboundURL);

    //instance the transport (xmlhttp)
    var objRequest = new jsx3.net.Request();
    objRequest.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, this, "onResponse");
    this.setRequest(objRequest);
  };

  /**
   * Returns a CR-LF delimited list of supported namespaces and thei related prefix (as defined by the Object, jsx3.net.Service._ns). Any nodes in a rules document (CXF) that implements one of the namespaces listed by this function, should implement the corresponding namespace prefix as also detailed here.
   * @return {String}
   */
  Service_prototype.getSupportedNamespaces = function() {
    var str = "";
    for (var p in Service._ns) {
      str+= p + "\t:\t" + Service._ns[p] + "\r\n";
    }
    return str;
  };


  /**
   * Converts an XML document belonging to the namespace URI, <code>http://xsd.tns.tibco.com/gi/json/2007/</code>, into a serialized JSON String.
   * This String, when evaluated, can then be converted back to the original document format by calling the complimentary method, JSON2XML.
   * @param objXML {jsx3.xml.Document}
   * @return {String | null} serialized JSON Object or null if document did not belong to the correct namepace
   * @see Service.JSON2XML()
   * @see Service.json_namespace
   */
  Service.XML2JSON = function(objXML) {
    var objRoot = objXML.getRootNode();
    if(objRoot && objRoot.getNamespaceURI() == Service.json_namespace) {
      var jsonArray = [];
      for (var i = objRoot.getChildIterator(); i.hasNext(); )
        jsonArray.push(Service._convertXML(i.next()));
      return "{" + jsonArray.join(",") + "}";
    } else {
      Service._log(2,"The XML document could not be converted to JSON, because it does not belong to the namespace, " + Service.json_namespace);
    }
    return null;
  };

  Service._convertXML = function(objNode) {
    var myNS = objNode.getNamespaceURI();
    var strName = objNode.getAttribute("safename") || objNode.getBaseName();
    var strBeg, strMid, strEnd, a, i;
    if(myNS == Service.json_namespace + "array" || myNS == Service.json_namespace + "array/literal") {
      strBeg = (myNS == Service.json_namespace + "array") ? '"' + strName + '":[' : '[';
      a = [];
      for (i = objNode.getChildIterator(); i.hasNext(); ) {
        var objKid = i.next();
        for (var j = objKid.getChildIterator(); j.hasNext(); ) {
          var objGrandKid = j.next();
          var gkNS = objGrandKid.getNamespaceURI();
          a.push((gkNS.indexOf("literal") > -1) ? Service._convertXML(objGrandKid) : "{" + Service._convertXML(objGrandKid) + "}");
        }
      }
      strMid = a.join(',');
      strEnd = ']';
    } else if(myNS.indexOf(Service.json_namespace + "simpletype") == 0) {
      //simpletype nodes are those that can have text content -- those that when the original json string was parsed were string, int, etc
      strBeg = (myNS.indexOf("simpletype/literal") == -1) ? '"' + strName + '":' : '';
      if(Service._jsonstringreg.exec(objNode.getValue())) {
        //the value is a boolean, null, or number; serialize appropriately
        strMid = objNode.getValue();
      } else {
        //the value is a string
        strMid = jsx3.util.strEscapeJSON(objNode.getValue());
      }
      strEnd = '';
    } else {
      var bKids = objNode.getChildNodes().size() >= 1;
      strBeg = '"' + strName + '":' + (bKids ? '{' : '');
      a = [];
      for (i = objNode.getChildIterator(); i.hasNext(); )
        a.push(Service._convertXML(i.next()));
      strMid = a.join(',');
      strEnd = bKids ? '}' : '';
    }
    return strBeg + strMid + strEnd;
  };

  Service._jsonstringreg = /^true$|^false$|^null$|^[1-9]+(?:(?:[0-9]*\.*)|\.*)[0-9]*$/;
  Service._saferegname = /^xml|^\d|[\W]/i;

  /**
   * Converts a JSON object to an XML document belonging to the namespace URI, <code>http://xsd.tns.tibco.com/gi/json/2007/</code>.
   * This document can then be converted back to the same JSON format by calling the complimentary method, XML2JSON.
   * @param objJ {String | Object} Serialized JSON
   * @return {jsx3.xml.Document}
   * @see Service.XML2JSON()
   * @see Service.json_namespace
   * @throws {jsx3.Exception} if objJ can not be evaluated as a valid JavaScript Object
   */
  Service.JSON2XML = function(objJ) {
    if(typeof(objJ) == "string") {
      try {
        objJ = jsx3.eval("( " + objJ + ")");
      } catch (e) {
        var objError = jsx3.lang.NativeError.wrap(e);
        var strMsg = jsx3._msg("svc.json", objJ, objError.getMessage());
        //Service._log(2,strMsg);
        throw new jsx3.Exception(strMsg);
      }
    }

    var objXML = new jsx3.xml.Document();
    objXML.createDocumentElement("json",Service.json_namespace);
    Service._convertObject(objJ,objXML);
    return objXML;
  };

  
  //recursive function that drills down into a JSON object and creates an XML document
  Service._convertObject = function(objJ, objXML) {
    var typ = typeof(objJ), objItem, objParent, i;
    if(objJ == null) {
      typ = 'null';
      objJ = 'null';
    }
    if(typ == "string" || typ == "number" || typ == "boolean" || typ == "null") {
      //no label, just a literal
      objItem = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,"val",Service.json_namespace + "simpletype/literal");
      objXML.appendChild(objItem);
      objItem.setValue(objJ);
    } else if(jsx3.$A.is(objJ)) {
      objParent = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,"val",Service.json_namespace + "array/literal");
      objXML.appendChild(objParent);
      for(i=0;i<objJ.length;i++) {
        objItem = objParent.createNode(jsx3.xml.Entity.TYPEELEMENT,"enum",Service.json_namespace + "enum");
        objParent.appendChild(objItem);
        Service._convertObject(objJ[i],objItem);
      }
    } else {
      for(var p in objJ) {
        //TODO: find out why I'm double-replacing the xml string (is this abug????)
        var safename = Service._saferegname.exec(p) ? p.replace(/^\W/g,"x").replace(/^xml/i,"xxx").replace(/^xml/i,"xxx").replace(/^\d/,"d").replace(/\W/g,".") : null;
        var vnt = objJ[p];
        typ = typeof(vnt);
        if(vnt == null) {
          typ = 'null';
          vnt = 'null';
        }
        if(typ == "string" || typ == "number" || typ == "boolean" || typ == "null") {
          //simpletype types are identified using xml namespaces
          objItem = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,safename || p,Service.json_namespace + "simpletype");
          objXML.appendChild(objItem);
          if(safename) objItem.setAttribute("safename",p,Service._ns["xml"]);
          objItem.setValue(vnt);
         } else if(jsx3.$A.is(vnt)) {
          objParent = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,safename || p,Service.json_namespace + "array");
          objXML.appendChild(objParent);
          if(safename) objParent.setAttribute("safename",p,Service._ns["xml"]);
          for(i=0;i<vnt.length;i++) {
            objItem = objParent.createNode(jsx3.xml.Entity.TYPEELEMENT,"enum",Service.json_namespace + "enum");
            objParent.appendChild(objItem);
            Service._convertObject(vnt[i],objItem);
          }
        } else {
          objItem = objXML.createNode(jsx3.xml.Entity.TYPEELEMENT,safename || p,Service.json_namespace);
          objXML.appendChild(objItem);
          if(safename) objItem.setAttribute("safename",p,Service._ns["xml"]);
          Service._convertObject(vnt,objItem);
        }
      }
    }
  };

  /**
   * Gets the URL for the rules file to use (a CXF document). This rules file will be used by the Service instance to generate, send, receive and process XML messages
   * @return    {String}
   */
  Service_prototype.getRulesURL = function() {
    return this.jsxrulesurl;
  };

  /**
   * Sets the URL for the rules file to use (a CXF document). This rules file will be used by the Service instance to generate, send, receive and process XML messages
   * @param strRulesURL    {String}
   * @return              {jsx3.net.Service} reference to self
   */
  Service_prototype.setRulesURL = function(strRulesURL) {
    //update the url reference
    this.jsxrulesurl = strRulesURL;

    //assume any parsed rules tree should be removed
    this.resetRulesTree();
    return this;
  };

  /**
   * Gets alternate document to use as the wrapper/transport for the request message.
   * @return {jsx3.xml.Document}
   * @private
   */
  Service_prototype._getOutboundStubDocument = function() {
    if (this.jsxstubdocument instanceof jsx3.xml.Document) return this.jsxstubdocument;
    return null;
  };

  /**
   * Sets the document that will serve as the container for the message generated by <code>doCall</code> and/or <code>getServiceMessage</code>.
   * This is a useful way to dynamically assemble documents by chaining multiple service instances, using the output from one service as the input to another.
   * For example, when a SOAP Envelope requires both a SOAP Header as well as a SOAP Body, this method allows the Envelope to be assembled via a
   * two-step process of first adding mapped content to the Body, followed by a call to add mapped content to the Header.
   * Note that this method takes precedence over the static stub document url referenced in the rules file as well as
   * any call to <code>setOutboundStubURL</code>. Use this method in conjunction with <code>setOutboundStubPath</code> to
   * point to the specific location in the document where the generated message should be appended.
   * @param objDocument {jsx3.xml.Document}
   * @return  {jsx3.net.Service} reference to self
   * @see #setOutboundStubPath()
   * @see #setOutboundStubURL()
   */
  Service_prototype.setOutboundStubDocument = function(objDocument) {
    this.jsxstubdocument = objDocument;
    return this;
  };

  /**
   * Gets URL for the base stub to use for the request message (the XML document to contain the generated document)
   * @return {String | null}
   */
  Service_prototype.getOutboundStubURL = function() {
    if (this.jsxstuburl == null) {
      var objNode = this.getMEPNode("I");
      if (objNode) {
        var strSrc = objNode.getAttribute("stubsrc");
        return (strSrc != null && jsx3.util.strTrim(strSrc) != "") ? strSrc : null;
      }
    } else {
      return this.jsxstuburl;
    }
    return null;
  };

  /**
   * Sets the URL to the document that will serve as the container for the message generated by <code>doCall</code> and/or <code>getServiceMessage</code>.
   * Overrides the static setting stored in the rules file. Use this method in conjunction with <code>setOutboundStubPath</code> to
   * point to the specific location in the document where the generated message should be appended.
   * @param strURL {String} URL for the document. Note that this URL will be resolved relative to the context server.
   * For example, if the project directory for the context server is 'test', then the following inputs (all of which are valid) are
   * equivalent: <code>jsxapp://test/xml/typical.xml</code>, <b>and</b> <code>xml/typical.xml</code>, <b>and</b> <code>JSXAPPS/test/xml/typical.xml</code>
   * @return {jsx3.net.Service} reference to self
   * @see #setOutboundStubPath()
   */
  Service_prototype.setOutboundStubURL = function(strURL) {
    this.jsxstuburl = strURL;
    return this;
  };

  /**
   * Gets the namespace for the server/project to run the service instance within. If a namespace isn't provided, the system will look for the first
   * application and use its namespace. If no applications exist, the namespace will be completely ignored.
   * @return {String}
   */
  Service_prototype.getNamespace = function() {
    var server = this.getServer();
    return server != null ? server.getEnv("namespace") : null;
  };

  /**
   * Returns the server that this service runs in, as set by the <code>setNamespace()</code> method.
   * @return {jsx3.app.Server}
   * @see #setNamespace()
   */
  Service_prototype.getServer = function() {
    if (this._jsxserver) {
      return this._jsxserver;
    } else if (this.jsxserverns) {
      var objServer = jsx3.lang.System.getApp(this.jsxserverns);
      if (objServer instanceof jsx3.app.Server) {
        return objServer;
      } else {
        Service._log(2,"The server namespace referenced by this jsx3.net.Service instance could not be resolved. Please validate that the namespace is correct: " + this.jsxserverns);
      }
    } else {
      //the server context was never set. loop through all running servers and return the first appropriate context
      var apps = jsx3.System.getAllApps();
      for (var i = 0; i < apps.length; i++)
        if (apps[i].getEnv("namespace") != "jsx3.IDE")
          return apps[i];
    }

    //warn user that the mapper needs a server context, but will default to IDE for now
    if (jsx3.IDE) {
      Service._log(2,"When using the XML Mapping Utility, you must have at lease one GUI component open for edit within GI Builder. Otherwise, there is no server instance to to use as the server context. For now, the IDE context will be used.");
      return jsx3.IDE;
    }
    return null;
  };

  /**
   * Sets the namespace for the server/project to run the service instance within.
   * @param namespace    {jsx3.app.Server|String} the server (preferred) or the namespace of the server.
   * @return            {jsx3.net.Service} this object
   */
  Service_prototype.setNamespace = function(namespace) {
    if (namespace instanceof jsx3.app.Server) {
      this._jsxserver = namespace;
      this.jsxserverns = namespace.getEnv("namespace");
    } else {
      this._jsxserver = null;
      this.jsxserverns = namespace;
    }

    return this;
  };

  /**
   * Gets XPath address for the node in the outbound stub document to which to append the generated message.
   * @return {String} Valid XSL path
   */
  Service_prototype.getOutboundStubPath = function() {
    if (this.jsxstubpath == null) {
      var objNode = this.getMEPNode("I");
      if (objNode) {
        var strPath = objNode.getAttribute("stubpath");
        return (strPath != null && jsx3.util.strTrim(strPath) != "") ? strPath : null;
      }
    } else {
      return this.jsxstubpath;
    }
    return null;
  };

  /**
   * Sets XPath address for the node in the outbound stub document to which to append the generated message.
   * Overrides the static setting in the rules file.
   * @param strPath {String} Valid XSL path. For example, <code>/SOAP-ENV:Envelope/SOAP-ENV:Body</code>
   * @return {jsx3.net.Service} reference to self
   * @see #setOutboundStubDocument()
   * @see #setOutboundStubURL()
   */
  Service_prototype.setOutboundStubPath = function(strPath) {
    this.jsxstubpath = strPath;
    return this;
  };

  /**
   * Gets the URL for a "typical", XML-formatted server resonse document. This document is then used when the project is
   * run in <b>static</b> mode (as defined by the <b>Project Deployment Options</b>).
   * @return {String}
   */
  Service_prototype.getInboundURL = function() {
    if (this.jsxinboundurl == null) {
      var objNode = this.getMEPNode("O");
      if (objNode) {
        var strSrc = objNode.getAttribute("stubsrc");
        return (strSrc != null && jsx3.util.strTrim(strSrc) != "") ? strSrc : null;
      }
    } else {
      return this.jsxinboundurl;
    }
    return null;
  };

  /**
   * Sets the URL for a "typical", XML-formatted server resonse document. This document is then used when the project is
   * run in <b>static</b> mode (as defined by the <b>Project Settings</b> dialog). Overrides the static setting in the rules file.
   * @param strInboundURL  {String} Alternate URL for the "typical" Service response. Note that this URL will be resolved
   * relative to the context server. For example, if the project directory for the context server is 'test',
   * then the following inputs (all of which are valid) are equivalent: <code>jsxapp://test/xml/typical.xml</code>,
   * <b>and</b> <code>xml/typical.xml</code>, <b>and</b> <code>JSXAPPS/test/xml/typical.xml</code>
   * @return {jsx3.net.Service} reference to self
   * @see #setMode()
   */
  Service_prototype.setInboundURL = function(strInboundURL) {
    this.jsxinboundurl = strInboundURL;
    return this;
  };

  /**
   * Gets URL for a 'typical' XML-formatted request document to send to the server; when this is set, the mapper does not even attempt to generate a document. Instead, this document is sent directly to the server without any processing. Useful for testing requests that never change
   * @return    {String}
   */
  Service_prototype.getOutboundURL = function() {
    return this.jsxoutboundurl;
  };

  /**
   * Sets the URL for a static XML-formatted request document to send to the Service. Note that when this is set, the mapper does not even
   * attempt to generate a request document via the rules file. Instead, the static request document is sent directly to the remote Service
   * without any processing. This is useful for requests that never change or as a means to test whether a Service is working, using a known, valid input.
   * @param strOutboundURL  {String} Alternate URL for the static request to send. Note that this URL will be resolved relative
   * to the context server. For example, if the project directory for the context server is 'test', then the following inputs
   * (all of which are valid) are equivalent:  <code>jsxapp://test/xml/typical.xml</code>, <b>and</b> <code>xml/typical.xml</code>,
   * <b>and</b> <code>JSXAPPS/test/xml/typical.xml</code>
   * @return               {jsx3.net.Service} reference to self
   */
  Service_prototype.setOutboundURL = function(strOutboundURL) {
    this.jsxoutboundurl = strOutboundURL;
    return this;
  };

  /**
   * Gets the name of the operation to use within a multi-operation rules file. Note: Rules created via a WSDL often have multiple named operations. Rules files generated without a WSDL contain no named operations, and instead use a single transaction.
   * @return    {String}
   */
  Service_prototype.getOperationName = function() {
    return this.operation;
  };

  /**
   * Sets the name of the operation to use within a multi-operation rules file. Note: Rules created via a WSDL often have multiple operations
   * @param strOperationName  {String} operation name
   * @return                 {jsx3.net.Service} reference to self
   */
  Service_prototype.setOperationName = function(strOperationName) {
    this.operation = strOperationName;
    return this;
  };

  /**
   * Returns the rules document used by the Service instance (a CXF document)
   * @return    {jsx3.xml.Document}
   */
  Service_prototype.getRulesXML = function() {
    if (!this.jsxrulesxml) {
      var strCXFURL = this.getRulesURL();
      var objCXF = new jsx3.xml.Document();
      objCXF.load(strCXFURL);
      if (objCXF.hasError()) {
        Service._log(2,"The URL for the rules file does not reference a valid CXF document. Please make sure that the URL is correct (" + strCXFURL + ") and that it returns a valid document:\n\t" + objCXF.getError());
      } else {
        this.jsxrulesxml = objCXF;
      }
    }

    return this.jsxrulesxml;
  };

  /**
   * Sets a reference to the given CXF-formatted rules document (used by test interfaces that are providing a parsed rules tree that they are managing)
   * @param objXML {jsx3.xml.Document}
   * @private
   */
  Service_prototype.setRulesXML = function(objXML) {
    this.jsxrulesxml = objXML;
  };

  /**
   * Dereferences the parsed rules tree (a jsx3.xml.Document instance) managed by this Service instance, forcing a reload of the document from disk the next time the rules document is requested
   * @return    {jsx3.net.Service} reference to self
   */
  Service_prototype.resetRulesTree = function() {
    delete this.jsxrulesxml;
    return this;
  };

  /**
   * Gets the node in the CXF Rules Document that corresponds to the named operation for the service call
   * @return    {jsx3.xml.Entity}
   * @private
   */
  Service_prototype.getOperationNode = function() {
    //retrieve the named operation or the single transaction (there can be multiple operatoins in a rules file, but only one transaction)
    var objRules = this.getRulesXML();
    if (objRules) {
      var objNode = objRules.selectSingleNode("//record[@opname='" + this.getOperationName() + "']");
      return (objNode) ? objNode : this.getRulesXML().selectSingleNode("//record[@type='T']");
    }
    return null;
  };

  /**
   * Gets the node in the CXF Rules Document that corresponds to one of the standard MEP types
   * @param TYPE {String} one of: I, O, F (input, output, fault)
   * @return    {jsx3.xml.Entity}
   * @private
   */
  Service_prototype.getMEPNode = function(TYPE) {
    var objNode = this.getOperationNode();
    return (objNode) ? objNode.selectSingleNode("record[@type='" + TYPE + "']") : null;
  };

  /**
   * Gets user name to send as part of the http request (for servers requiring http authentication)
   * @return           {String}
   */
  Service_prototype.getUserName = function() {
    return this.jsxusername;
  };

  /**
   * Sets the user name to send with the posting (for those sites requiring http authentication)
   * @param strName     {String} user name
   * @return           {jsx3.net.Service} reference to self
   */
  Service_prototype.setUserName = function(strName) {
    this.jsxusername = strName;
    return this;
  };

  /**
   * Gets password to send as part of the http request (for servers requiring http authentication)
   * @return           {String}
   */
  Service_prototype.getUserPass = function() {
    return this.jsxuserpass;
  };

  /**
   * Sets the password to send with the posting (for those sites requiring http authentication)
   * @param strPass     {String} password for user
   * @return           {jsx3.net.Service} reference to self
   */
  Service_prototype.setUserPass = function(strPass) {
    this.jsxuserpass = strPass;
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Sets the script that will fire after the service has finished an inbound mapping or a function to callback to; allows for object repaints, cleanup, etc
   * @param vntItem     {String | Object | Function} either a script (as string) to execute via eval or a function that will be notified when the service call completes. Note: this function will receive a single parameter, a reference to this jsx3.net.Service instance
   * @return           {jsx3.net.Service} reference to self
   * @deprecated  Use <code>jsx3.EventDispatcher</code> interface instead with event type <code>jsx3.net.Service.ON_SUCCESS</code>.
   */
  Service_prototype.setOnSuccess = function(vntItem) {
    this.jsxonsuccess = vntItem;
    return this;
  };

  /**
   * sets the script that will fire after the service has failed; if a soap fault envelope is returned, this will be processed as would any mapped tree. Allows for object repaints, cleanup, etc.
   * @param vntItem     {String | Object | Function} either a script (as string) to execute via eval or a function that will be notified. Note: this function will receive a single parameter, a reference to this jsx3.net.Service instance
   * @return           {jsx3.net.Service} reference to self
   * @deprecated  Use <code>jsx3.EventDispatcher</code> interface instead with event type <code>jsx3.net.Service.ON_ERROR</code>.
   */
  Service_prototype.setOnError= function(vntItem) {
    this.jsxonerror = vntItem;
    return this;
  };

/* @JSC :: end */

  /**
   * Called after the Service instance has finished a successful inbound mapping; allows for object repaints, cleanup, etc.
   * @private
   */
  Service_prototype.onSuccess = function() {
    //keep this in 4.0 release
    this.publish({subject:Service.ON_SUCCESS});

    //remove this in 4.0 release
    var strType = typeof(this.jsxonsuccess);
    if (strType == "function" || strType == "object") {
      //this is either a function or object (probably an alert)
      this.jsxonsuccess(this);
    } else if (strType == "string") {
      //code as string to be evaluated
      this.eval(this.jsxonsuccess);
    }
  };

  /**
   * Called after the Service instance has finished an inbound mapping (if a SOAP fault); allows for object repaints, cleanup, etc
   * @private
   */
  Service_prototype.onError = function() {
    //keep this in 4.0 release
    this.publish({subject:Service.ON_ERROR});

    //remove this in 4.0 release
    var strType = typeof(this.jsxonerror);
    if (strType == "function" || strType == "object") {
      //this is either a function or object (probably an alert)
      this.jsxonerror(this);
    } else if (strType == "string") {
      //code as string to be evaluated
      this.eval(this.jsxonerror);
    }
  };

  /**
   * Sets the jsx3.net.Request instance that performs the transaction with the remote service (the transport object for the message).
   * @param objHTTP    {jsx3.net.Request}
   * @private
   */
  Service_prototype.setRequest = function(objHTTP) {
    if (objHTTP != null) {
      this.jsxhttprequest = objHTTP;
    } else {
      delete this.jsxhttprequest;
    }
  };

  /**
   * Gets the jsx3.net.HttpRequest instance that performs the transaction with the remote service (the transport object for the message).
   * @return     {jsx3.net.Request}
   */
  Service_prototype.getRequest = function() {
    return this.jsxhttprequest;
  };

  /**
   * Call this method <b>after</b> the service has responded to get a parsed instance of the server's XML response
   * @return     {jsx3.xml.Document}
   */
  Service_prototype.getInboundDocument = function() {
    //get the parsed xml for this jsx3.net.Service instances rules
    return (this.jsxinbounddocument == null) ? null : this.jsxinbounddocument;
  };

  /**
   * Sets a parsed instance of the <b>response</b> document as soon as it returns from the server returned from the service; otherwise null
   * @param objXML     {jsx3.xml.Document}
   */
  Service_prototype.setInboundDocument = function(objXML) {
    this.jsxinbounddocument = objXML;
  };

  /**
   * Call this method <b>after</b> 'doCall' has been called to get a parsed instance of the request document--what was actually sent to the remote service
   * @return        {jsx3.xml.Document}
   */
  Service_prototype.getOutboundDocument = function() {
    return (this.jsxoutbounddocument == null) ? null : this.jsxoutbounddocument;
  };

  /**
   * Sets a parsed instance of the <b>request</b> document--what was actually sent to the remote service
   * @param objXML        {jsx3.xml.Document}
   * @private
   */
  Service_prototype.setOutboundDocument = function(objXML) {
    this.jsxoutbounddocument = objXML;
  };

/* @JSC :: begin DEP */

  /**
   * Gets the parsed WSDL (what was used as the original input to create the rules file being used by this service instance).
   * @return      {jsx3.xml.Document}
   * @deprecated  The WSDL is no longer relevant to the Service class as the rules file will contain all information necessary to generate and process the Service interaction.
   */
  Service_prototype.getWSDL = function() {
    if (this.wsdl == null) {
      //only look for the wsdl if a node of type W exists (otherwise this is a CXF document with a single transaction)
      var objNode = this.getRulesXML().selectSingleNode("//record[@type='W']");
      if (objNode) {
        var strURL = objNode.getAttribute("src");
      } else {
        return null;
      }
    }
    return (this.wsdl == null) ? (this.wsdl = jsx3.CACHE.openDocument(strURL)) : this.wsdl;
  };

/* @JSC :: end */

  /**
   * Gets the URL for the service endpoint where the request will be sent
   * @return      {String}
   */
  Service_prototype.getEndpointURL = function()  {
    return (this.jsxserviceurl == null) ? this.getOperationNode().getAttribute("endpoint") : this.jsxserviceurl;
  };

  /**
   * Sets the URL for the service endpoint where the request will be sent. Overrides the endpoint specified in the rules file.
   * @param strAlternateURL {String}
   * @return {jsx3.net.Service} reference to self
   */
  Service_prototype.setEndpointURL = function(strAlternateURL)  {
    this.jsxserviceurl = strAlternateURL;
    return this;
  };

  /**
   * Executes the onBeforeSend script. Called immediately before the XML request is sent
   * @param strScript   {String} JavaScript code to evaluate. Optional. If not specified, the script defined within the rules file is used
   * @private
   */
  Service_prototype.doOutboundFilter = function(strScript) {
    Service._log(5,"Executing the Outbound Filter.");
    if (strScript == null) strScript = this.getMEPNode("I").getAttribute("onbeforesend");
    this.eval(strScript);
  };

  /**
   * Executes the onAfterReceive script. Called immediately after the XML response is received
   * @param strScript   {String} JavaScript code to evaluate. Optional. If not specified, the script defined within the rules file is used
   * @private
   */
  Service_prototype.doInboundFilter = function(strScript) {
    Service._log(5,"Executing the Inbound Filter.");
    if (strScript == null) {
      var objNode = this.getMEPNode("O");
      if (objNode) {
        strScript = objNode.getAttribute("onafterreceive");
      } else {
        Service._log(5,"An alternate message exchange pattern was encountered for the mapping rule: one-way. The inbound filter will not be run.");
        return;
      }
    }
    this.eval(strScript);
  };

  /**
   * Gets the method for the request. Default is POST
   * @return   {String} GET, POST, PUT, DELETE, or SCRIPT
   */
  Service_prototype.getMethod = function() {
    if (this.jsxmethod == null) {
      //look in rules tree
      var METHOD = this.getOperationNode().getAttribute("method");
      if (jsx3.util.strEmpty(METHOD)) METHOD = "POST";
      this.jsxmethod = METHOD;
    }
    return this.jsxmethod;
  };

  /**
   * Sets the method for the request different than the one described in the rules file.
   * @param METHOD   {String} GET, POST, PUT, DELETE, or SCRIPT
   */
  Service_prototype.setMethod = function(METHOD) {
    this.jsxmethod = METHOD;
  };

  /**
   * If true, the Script transport will use JSONP
   * @return   {Boolean}
   */
  Service_prototype.getJSONP = function() {
    if (this.jsxjsonp == null)
      this.jsxjsonp = this.getOperationNode().getAttribute("jsonp") == "1";
    return this.jsxjsonp;
  };


  /**
   * If set to true, the service class will append an additional parameter to the URL in the form, <code>callback={method}</code>, where
   * {method} is a temporary callback function managed by the Service instance.  This allows for flexibility when using
   * JSON Services that are also available as JSONP Services, in that the same URL can be used (setEndpointURL) but different
   * behaviors can be implemented.  If the given JSONP Service uses a callback name different than "callback", pass the parameter
   * name expected by the given JSON Service.  You may also implement a callback of your own by directly modifying the endpoint URL to call the named function of your
   * choosing.  In such situations, pass <code>false</code> to this method, so the transport will not attempt any form
   * of callback.  If you do choose to implement your own callback handlers, you must manually conclude the service call with a call to <code>doRespond</code>.
   * @param bJSONP  {Boolean | String}
   * @see setEndpointURL
   * @see doRespond
   */
  Service_prototype.setJSONP = function(bJSONP) {
    this.jsxjsonp = bJSONP;
  };

  /**
   * Sets valid state during message generation
   * @param bValid   {Boolean}
   * @private
   */
  Service_prototype._setValid = function(bValid) {
    /* @jsxobf-clobber */
    this.jsxvalidity = bValid;
  };


  /**
   * Returns valid state as per the last time an outbound message was generated
   * @return {Boolean}
   * @private
   */
  Service_prototype._isValid = function() {
    return this.jsxvalidity;
  };

  
  /**
   * Returns whether the given rule describes a JSON transaction, which will in-turn require an extra conversion (xml from/to json)
   * @param TYPE {String} one of I, O
   * @return {Boolean}
   * @private
   */
  Service_prototype._isJSON = function(TYPE) {
    var objOutput = this.getMEPNode(TYPE);
    var objFirstRule = objOutput.selectSingleNode("record");
    return objFirstRule && objFirstRule.getAttribute("tns") == Service.json_namespace;
  };


  /**
   * Generates the request message (if applicable) and sends to the remote service.
   * @param bCancelIfInvalid {Boolean} If true, the remote service will not be called if the message does not pass validation while being generated.
   * @return {Boolean} true if the message passed all validation rules while being generated.
   */
  Service_prototype.doCall = function(bCancelIfInvalid) {
    //make sure this service instance is referencing a valid rules file (a CXF document)
    var objRulesXML = this.getRulesXML();
    if (objRulesXML != null) {
      //if running in static mode use the static response document specified by the developer (used for testing when the live service isn't available)
      if (!this.getMode()) {
        //get the URL for the static document
        var strStaticResponseUrl = this.getServer().resolveURI(this.getInboundURL());
        Service._log(5,"Running in static mode. Using sample response document at '" + strStaticResponseUrl + "'");

        //open the static response file
        if (this._isJSON("O")) {
          var objReq = jsx3.net.Request.open("get", strStaticResponseUrl, false);
          objReq.send();
          var strJSON = objReq.getResponseText();
          if (!jsx3.util.strEmpty(strJSON)) {
            jsx3.sleep(function() {
              this.onResponse({target:{getResponseText:function() {
                return strJSON;
              }}});
            }, null, this);
          } else {
            Service._log(2, "The static response URL does not reference a valid file. The transaction has been cancelled.  Please make sure that the URL is correct (" + strStaticResponseUrl + ") and that it returns a valid JSON object:\n\t" + objStaticResponse.getError());
            return false;
          }
        } else {
          var objStaticResponse = this.getServer().getCache().getOrOpenDocument(strStaticResponseUrl, strStaticResponseUrl);
          if (objStaticResponse.hasError()) {
            Service._log(2, "The static response URL does not reference a valid document. The transaction has been cancelled.  Please make sure that the URL is correct (" + strStaticResponseUrl + ") and that it returns a valid document:\n\t" + objStaticResponse.getError());
            return false;
          } else {
            objStaticResponse = objStaticResponse.cloneDocument();
            //call response handler, passing the static response as if a remote server had just returned it; use sleep to break the call stack, since 'live' mode also does so
            jsx3.sleep(function() {
              this.onResponse({target:{getResponseXML:function() {
                return objStaticResponse;
              }}});
            }, null, this);
          }
        }
      } else if(this.getMethod().search(/^script$/i) == 0) {
        //use a script transport (dom2 append of javascript script element)
        var strURL = this.getServer().resolveURI(this.getEndpointURL()).toString();
        Service._log(5,"Contacting JSON Service at '" + strURL + "'");
        var strUnique = this.getUniqueId();
        if(this.getJSONP()) {
          var cbname = "jsxservicecallback_" + strUnique;
          var my = this;
          window[cbname] = function(obj) {
            my.doRespond(obj);
          };
          var strCPParamName = typeof(this.getJSONP()) == "string" ? this.getJSONP() : "callback";
          strURL = strURL + (strURL.indexOf("?") == "-1" ? "?" : "&") + strCPParamName + "=" + cbname;
        }
        this.getServer().loadInclude(strURL, "jsxservicecall_" + strUnique, "script", false);
      } else {
        //get the request message (the outbound) -- use static request if specified. Cancel transaction if error
        var strStaticRequestUrl = this.getOutboundURL();
        var objMessage;
        if (strStaticRequestUrl) {
          strStaticRequestUrl = this.getServer().resolveURI(strStaticRequestUrl);
          Service._log(5,"Using static request document located at '" + strStaticRequestUrl + "'");

          //3.3 fix for IE; build 6.029 appears not to cache; use local cache to bypass
          objMessage = this.getServer().getCache().getOrOpenDocument(strStaticRequestUrl,strStaticRequestUrl);
          if (objMessage.hasError()) {
            Service._log(2,"The static request URL does not reference a valid document. The transaction has been cancelled.  Please make sure that the URL is correct (" + strStaticRequestUrl + ") and that it returns a valid document:\n\t" + objMessage.getError());
            return false;
          } else {
            objMessage = objMessage.cloneDocument();
          }
        } else {
          objMessage = this.getServiceMessage();
          if (this.getMethod().toUpperCase() == "POST" && !objMessage) {
            Service._log(4,"The request message could not be generated. The transaction has been cancelled");
            return false;
          }
        }

        if (!this._isValid() && bCancelIfInvalid) {
          //don't send the request. it failed validation and the user chose to cancel in such a scenario
          return false;
        } else {
          //persist the message, so any outbound scripts/filters can access it via the instance API
          this.setOutboundDocument(objMessage);
          this.doOutboundFilter();

          //instance a Request object to transport the message
          Service._log(5,"Sending request to remote service located at '" + this.getEndpointURL() + "'");
          var objRequest = this.getRequest();
          objRequest.open(this.getMethod(), this.getEndpointURL(), true, this.getUserName(), this.getUserPass());

          //loop to transfer custom headers bound to this instance
          var objHeaders = this.getHeaders();
          var p;
          for (p in objHeaders) {
            if (!(typeof(objHeaders[p]) == "function" || typeof(objHeaders[p]) == "object")) {
              objRequest.setRequestHeader(p.toString(),objHeaders[p]);
              Service._log(5,"Setting HTTP Request Header, " + p + " ==> " + objHeaders[p] + "'");
            }
          }

          //execute the socket (it will now contact the server in a separate thread)
          var strPayload;
          if(this._isJSON("I")) {
            //serialize the XML document as a string of JSON
            strPayload = Service.XML2JSON(objMessage);
          } else {
            //TODO: how to ensure serialized as UTF-8?
            strPayload = (objMessage != null && objMessage instanceof jsx3.xml.Document && !objMessage.hasError()) ? objMessage.serialize("1.0") : null;
          }
          objRequest.send(strPayload,this.getTimeout());
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Sets an HTTP Request header on the request. Set before calling, doCall()
   * @param strName     {String} name for header parameter
   * @param strValue    {String} value for the header parameter
   */
  Service_prototype.setRequestHeader = function(strName,strValue) {
    var objHeaders = this.getHeaders();
    objHeaders[strName] = strValue;
  };

  /**
   * Returns JavaScript object (hash) of request headers to set for the given request
   * @return {Object}
   * @private
   */
  Service_prototype.getHeaders = function() {
    if (this.jsxheaders == null) {
      this.jsxheaders = {};
      //loop to add all headers in the CXF rules file; additional adds will overwrite these
      var objHeaders = this.getOperationNode().selectNodes("headers/record");
      for (var i=objHeaders.iterator(); i.hasNext(); ) {
        var objHeader = i.next();
        this.jsxheaders[objHeader.getAttribute("name")+""] = objHeader.getAttribute("value")+"";
      }
    }
    return this.jsxheaders;
  };

/* @JSC :: begin DEP */

  /**
   * Specifies timeout settings for resolving the domain name, establishing the connection to the server, sending the data, and receiving the response. The timeout parameters of the setTimeouts method are specified in milliseconds, so a value of 1000 would represent 1 second. A value of zero represents an infinite timeout. There are four separate timeout parameters: resolveTimeout, connectTimeout, sendTimeout, and receiveTimeout. When calling the setTimeouts method, all four values must be specified. The timeouts are applied at the Winsock layer.
   * @param intResolveTimeout    {int} The value is applied to mapping host names (such as "www.microsoft.com") to IP addresses; the default value is infinite, meaning no timeout.
   * @param intConnectTimeout    {int} The value is applied to establishing a communication socket with the target server, with a default timeout value of 60 seconds.
   * @param intSendTimeout       {int} The value applies to sending an individual packet of request data (if any) on the communication socket to the target server. A large request sent to a server will normally be broken up into multiple packets; the send timeout applies to sending each packet individually. The default value is 5 minutes.
   * @param intReceiveTimeout    {int} The value applies to receiving a packet of response data from the target server. Large responses will be broken up into multiple packets; the receive timeout applies to fetching each packet of data off the socket. The default value is 60 minutes.
   * @return                    {jsx3.net.Service} reference to self
   * @deprecated    Due to browser security constraints, this method is no longer used. Use setTimeout instead. This method no longer affects any aspect of the Service call.
   */
  Service_prototype.setTimeouts = function(intResolveTimeout,intConnectTimeout,intSendTimeout,intReceiveTimeout) {
    Service._log(4,"Invalid method. setTimeouts() no longer valid. Use setTimeout() instead.");
    return this;
  };

/* @JSC :: end */

  /**
   * Fires the timeout event on an asynchronous call
   * @private
   */
  Service_prototype.onTimeout = function() {
    this.publish({subject:Service.ON_TIMEOUT});
  };

  /**
   * Specifies how long to wait for the service to respond before cancelling the call. Subscribes to the ON_TIMEOUT event
   * @param intTimeout       {int} number of milliseconds to wait befor publishing the ON_TIMEOUT event.
   * @param objHandler       {object/string/function} if an object, the instance to notify of events (objFunction is required); if a string, the JSX id of the instance to notify of events (objFunction is required), must exist in the same Server; if a function, the function to call to notify of events (objFunction ignored)
   * @param objFunction      {function/string} if objHandler is a string or object then the function to call on that instance. either a function or a string that is the name of a method of the instance
   * @return                {jsx3.net.Service} reference to self
   */
  Service_prototype.setTimeout = function(intTimeout,objHandler,objFunction) {
    //use the timeout interface managed by the request transport
    this.getRequest().subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, this, "onTimeout");
    this.subscribe(Service.ON_TIMEOUT, objHandler, objFunction);
    this.jsxtimeout = intTimeout;
    return this;
  };

  /**
   * Applies timeout rules to the jsx3.net.Request instance making the actual call
   * @private
   */
  Service_prototype.getTimeout = function() {
    return this.jsxtimeout;
  };

  /**
   * Resets the rules tree to default state (with all 'skip' flags removed) from those rules that were skipped during the previous transaction
   * @return                {jsx3.net.Service} reference to self
   */
  Service_prototype.resetRules = function() {
    var objNodes = this.getRulesXML().selectNodes("//record[@jsxskip]");
    for (var i=objNodes.iterator(); i.hasNext(); )
      i.next().removeAttribute("jsxskip");
    return this;
  };

  /**
   * Resets the namespace incrementer
   * @private
   */
  Service_prototype._resetNamespaceRegistry = function() {
    this.nshash = {};
    this.nsinc = 0;
  };

  /** @private @jsxobf-clobber */
  Service._log = function(intLevel, strMessage) {
    if (Service._LOG == null) {
      if (jsx3.util.Logger) {
        /* @jsxobf-clobber */
        Service._LOG = jsx3.util.Logger.getLogger(Service.jsxclass.getName());
        if (Service._LOG == null) return;
      } else {
        return;
      }
    }
    Service._LOG.log(intLevel, strMessage);
  };

  /**
   * Called when 'getServiceMessage' is executed in order to reset state variables used in the message generation
   * @private
   */
  Service_prototype._reset = function() {
    this.resetRules();
    this._setValid(true);
    this._resetNamespaceRegistry();
  };

  /**
   * Gets the request message specific to the MESSAGETYPE (input, output, fault). Typically only used for input (outbound) messages, but can be used for simulating a server response for output and fault (in the case of a SOAP transaction, fault) messages
   * @param MESSAGETYPE       {String} one of: input, output, or fault. If this value is provided, the server will generate test data for all nodes lacking a mapped or scripted value
   * @param strShellURL       {String} relative URL to message shell to use as the starting container to put content into. Note that calling <code>setOutboundStubURL</code> or <code>setOutboundStubDocument</code> in conjunction with <code>setOutboundStubPath</code>
   * are preferred to passing this parameter, since they provide much greater control. Also note that this value is stored statically in the rules document when the rules document is first created via the XML Mapping Utility.
   * @return                 {jsx3.xml.Document}
   */
  Service_prototype.getServiceMessage = function(MESSAGETYPE,strShellURL)  {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Service.jsxclass, this.getEndpointURL());
/* @JSC :: end */
    
    //initialize
    var objEnvelope, objEnvelopeBody;
    this._reset();

    //get handle to the node in the rules tree for the chosen operation
    var objOpNode = this.getOperationNode();
    Service._log(5,"Creating the request message for the operation, '" + this.getOperationName() + "', using the rules file located at, '" + this.getRulesURL() + "'");

    //does this message use an envelope for transport (used for SOAP messages)
    if (!strShellURL) {
      objEnvelope = this._getOutboundStubDocument();
      strShellURL = this.getOutboundStubURL();
    }

    if (strShellURL || objEnvelope instanceof jsx3.xml.Document) {
      //instance the Envelope that will transport the generated message
      var objServer = this.getServer();

      if (!(objEnvelope instanceof jsx3.xml.Document)) {
        strShellURL = objServer.resolveURI(strShellURL);
        //3.3 fix for IE; build 6.029 appears not to cache; use local cache to bypass
        objEnvelope = this.getServer().getCache().getOrOpenDocument(strShellURL,strShellURL);
      }

      if (!objEnvelope.hasError()) {
        //dynamically derive the bound namespaces
        var strPath = this.getOutboundStubPath();
        var objPath = strPath.split("/");
        var objXMap = {};
        for (var i=0;i<objPath.length;i++)
          if (objPath[i].search(/^([^:]*)(:)/) > -1)
            objXMap[RegExp.$1] = 1;

        //clone and query for given node in the envelope that will contain the message (the SOAP Body)
        objEnvelope = objEnvelope.cloneDocument();
        objEnvelopeBody = objEnvelope.selectSingleNode(strPath,objEnvelope.getDeclaredNamespaces(objXMap));
        if (!objEnvelopeBody) {
          Service._log(2,"The stub path (typically the path to the SOAP Envelope Body) does not return a valid node (" + strPath + ").");
          return null;
        }
      } else {
        Service._log(2,"The outbound stub URL does not reference a valid document.  Please make sure that the URL is correct (" + strShellURL + ") and that it returns a valid document:\n\t" + objEnvelope.getError());
        return null;
      }
    }

    //get handle to correct MEP item (input output, fault)
    var objInputNode = objOpNode.selectSingleNode("record[@type='" + ((MESSAGETYPE == null) ? "I" : MESSAGETYPE.substring(0,1).toUpperCase()) + "']");

    //query the message node for its counterpart in the original schema
    var objInputNodes = objInputNode.selectNodes("record");
    var objReturn;
    for (var j=objInputNodes.iterator(); j.hasNext(); )
      objReturn = this.doAddAndRecurse(objEnvelope,objEnvelopeBody,j.next(),MESSAGETYPE,true);

/* @JSC :: begin BENCH */
    t1.log("getServiceMessage");
/* @JSC :: end */
    
    //return the message
    return (objEnvelope) ? objEnvelope : objReturn;
  };

  /**
   * When a message is generated, this function can be called to register the namespace (i.e., xmlns:) with the message each time a new schema with a new target namespace is used
   * @param strURI       {String} namespace to register
   * @param objMessage   {jsx3.xml.Document} XML request document being generated
   * @param bFirst       {boolean} if true, the namespace declaration will be bound to the root node
   * @return            {Object}
   * @private
   */
  Service_prototype.registerNamespace = function(strURI, objMessage, bFirst) {
    //determine the namespace to use for the node we're about to add; assume no namespace
    var strNSPRE = "";
    var strNSURI = null;

    //3.5 bugfix: added support for default xmlns (xml)
    if (strURI == Service._ns["xml"]) {
      strNSPRE = "xml";
      strNSURI = strURI;
    } else if (strURI != "" && this.nshash[strURI] != null) {
      //the ref to the ns that owns data type has alreay been indexed; just get it
      strNSURI = strURI;
      strNSPRE = this.nshash[strURI];
    } else if (strURI != "") {
      //add a new namespace to the hash and declare it in the <soap:Envelope> tag
      this.nsinc++;
      this.nshash[strURI] = "jsx" + this.nsinc;

      //reset the prefix and namespace to use to point to the given namespace that we'll need data type support for
      strNSURI = strURI;
      strNSPRE = "jsx" + this.nsinc;

      //update the root doc element by persisting a ref to new namespace; further down when we add node and qualify it, it will work, because it's already been declared
      //note that this is not required, but is added here, because it makes the sent document smaller by avoiding redundant namespace declarations
      if (bFirst != true) {
        var objNode = objMessage.getRootNode();
        objNode.setAttribute("xmlns:" + strNSPRE, strNSURI);
      }
    }
    return{prefix:strNSPRE,uri:strNSURI};
  };

  /**
   * Recursively builds the message. Can build input, output, or fault message types.  If MESSAGETYPE is passed, sample data will be used to populate the message if it is not already populated via a bound mapping
   * @param _jsx_objMessage         {jsx3.xml.Document} The message (as an XML Document) being constructed
   * @param _jsx_objMessageParent   {jsx3.xml.Entity} node in the outbound message to which to append the about-to-be-created node
   * @param RULENODE                {jsx3.xml.Entity} node in the rules document to serve as a template
   * @param MESSAGETYPE             {String} one of: input, output, fault
   * @param bFirst                  {String} true if the first time this method is called (depth = 0)
   * @private
   */
  Service_prototype.doAddAndRecurse = function(_jsx_objMessage,_jsx_objMessageParent,RULENODE,MESSAGETYPE,bFirst) {
    //only process this node in the rules tree if jsxskip has not been set
    if (RULENODE.getAttribute("jsxskip")) return;

    //set cancel flag (empty nodes are removed). ref to my for inner functions so they don't lose execution context
    var bCancel = false;
    var my = this;
    var i;
    //inner functions available to evaluated code
    var enableReferencedRule = function(_objRuleNode) {
      //binds an attribute to a rule node so that it is skipped
      _objRuleNode.setAttribute("jsxskip","1");
    };

    var disableReferencedRule = function(_objRuleNode) {
      //binds an attribute to a rule node so that it is skipped
      _objRuleNode.removeAttribute("jsxskip");
    };

    var removeChild = function(_objNode) {
      //removes a node (typically a message node (e.g., MESSAGENODE), as rules shouldn't be manually edited at run-time (skipping/blocking is better)
      _objNode.getParent().removeChild(_objNode);
    };

    var setValue = function(_strValue) {
      my.setNodeValue(MESSAGENODE,_strValue);
    };

    var getNamedChild = function(_strMessageChildName) {
      //returns an object handle to the child message node of the given name
      return my.getNamedNodeChild(_strMessageChildName,RULENODE);
    };

    var skipNamedRule = function(_strMessageChildName) {
      //skips the rule node child of the given name
      my.getNamedRuleChild(_strMessageChildName,RULENODE).setAttribute("jsxskip","1");
    };

    var disableNamedRule = function(_strMessageChildName) {
      //TO DO: provide optional second parameter for the namespace URI to allow for same named childre to be distinguished (Qname)
      //skips the rule node child of the given name
      my.getNamedRuleChild(_strMessageChildName,RULENODE).setAttribute("jsxskip","1");
    };

    var enableNamedRule = function(_strMessageChildName) {
      //TO DO: provide optional second parameter for the namespace URI to allow for same named childre to be distinguished (Qname)
      //un-skips the rule node child of the given name
      my.getNamedRuleChild(_strMessageChildName,RULENODE).removeAttribute("jsxskip");
    };

    var setCDFContext = function(_strQuery) {
      //switches context--the record/data node that will be affected; doesn't affect the 'CONTEXT' object; rather affects the context property on the CONTEXT object
      my.CDFCONTEXT.context = my.CDFCONTEXT.context.selectSingleNode(_strQuery);
    };

    var setCDFRecords = function(_strQuery) {
      //switches context for the collection to use
      my.CDFCONTEXT.records = my.CDFCONTEXT.context.selectNodes(_strQuery);
    };

    //use pointer to named template (for recursion and functional programming styles)
    var strXID = RULENODE.selectSingleNode("mappings/record[@name='CDF Record' and @value and not(@value='')]/@value");
    if (strXID) {
      var tempRULENODE = RULENODE.selectSingleNode("//record[@jsxid='" + strXID.getValue() + "']");
      if(tempRULENODE != null) {
        if(this.CDFCONTEXT && this.CDFCONTEXT.records && this.CDFCONTEXT.records.hasNext())
          RULENODE = tempRULENODE;
      } else {
        Service._log(2,"The rule node identified by the jsxid, '" + strXID.getValue() + "', cannot be located. Processing will proceed normally with the active rule and will not be handled by the referenced (unresolved) rule.");
      }
    }

    //determine if message node for this iteration needs to be qualified
    var strMyURI = RULENODE.getAttribute("tns");
    //3.5 bugfix: added additional conditional to not add the xmlns declaration if also an attribute type node
    var objNS = (strMyURI) ? this.registerNamespace(strMyURI,_jsx_objMessage,bFirst || RULENODE.getAttribute("type") == "A") : {prefix:"",uri:null};

    //create a new node to add to the outbound  message, @_jsx_objMessage (1 is for type element, 2 is attribute)
    var bATT, MESSAGENODE, strText = RULENODE.getAttribute("jsxtext");
    if (RULENODE.getAttribute("type") == "A") {
      //attribute node
      bATT = true;
      MESSAGENODE = _jsx_objMessage.createNode(jsx3.xml.Entity.TYPEATTRIBUTE,objNS.prefix + ((objNS.prefix != "") ? ":" : "") + strText,objNS.uri);
      _jsx_objMessageParent.setAttributeNode(MESSAGENODE);
    } else if (RULENODE.getAttribute("type") == "D") {
      bATT = false;
      MESSAGENODE = _jsx_objMessage.createNode(jsx3.xml.Entity.TYPECDATA);
      _jsx_objMessageParent.appendChild(MESSAGENODE);
    } else {
      bATT = false;
      //if no doc is passed, create here
      if (_jsx_objMessage) {
        MESSAGENODE = _jsx_objMessage.createNode(jsx3.xml.Entity.TYPEELEMENT,objNS.prefix + ((objNS.prefix != "") ? ":" : "") + strText,objNS.uri);
        _jsx_objMessageParent.appendChild(MESSAGENODE);
      } else {
        //there is no document yet.  This must be the first pass AND no stub document is being used.  create here
        _jsx_objMessage = new jsx3.xml.Document();
        MESSAGENODE = _jsx_objMessage.createDocumentElement(objNS.prefix + ((objNS.prefix != "") ? ":" : "") + RULENODE.getAttribute("jsxtext"),objNS.uri);
      }

      //if the wsdl declared a supported soap encoding version, add the extra type (xsi:type) info here
      //3.4 fix: need to look at both encoding details to know whether or not to implement
      //3.4 fix: query wrongly applied first available encoding, not encoding specific to the message type
      var myEncodedNode = RULENODE.selectSingleNode("ancestor-or-self::record[(@type='I' or @type='O') and @soapuse='encoded' and @soapencstyle='" + Service._ns["SOAP-ENC"] + "']");
      if (myEncodedNode != null && myEncodedNode != "") {
        var attValue;
        if ((attValue = RULENODE.getAttribute("datatype")) != null && attValue != "") {
          var mySimpleNode = RULENODE.getAttribute("simple");
          if (mySimpleNode != null && mySimpleNode != "") {
            //for encoded messages, remove the namespace that was used by the wsdl. use the one for schema (xsd)
            if (attValue.indexOf(":") > 0) attValue = attValue.replace(/[^:]*[:]?/,"");
            attValue = "xsd:" + attValue;
          } else {
            if (attValue.indexOf(":") > 0) attValue = attValue.replace(/[^:]*[:]?/,"");
            strMyURI = RULENODE.getAttribute("ttns");

            objNS = this.registerNamespace(strMyURI,_jsx_objMessage,bFirst);
            attValue = (objNS.prefix == "") ? attValue : objNS.prefix + ":" + attValue;
          }
          var _typeatt = _jsx_objMessage.createNode(jsx3.xml.Entity.TYPEATTRIBUTE,"xsi:type","http://www.w3.org/2001/XMLSchema-instance");
          _typeatt.setValue(attValue);
          MESSAGENODE.setAttributeNode(_typeatt);
        }
      }
    }
    this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Create Node",description:"<" + MESSAGENODE.getNodeName() + ">",level:6});

    //get the collection of mappings
    var objMappings = RULENODE.selectNodes("mappings/record");

    //whenever one of the mappings is a CDF record, this is set to true to tell the system to reset the parent context, since each encounterered record resets it (drills down)
    var bRecord = false;
    var REPEAT;
    var _otempcontext, _otemprecords;

    //loop to apply the given map setting
    for (i = objMappings.iterator(); i.hasNext(); ) {
      //provide consistent alias for user to reference to get handle to the active CDF record
      var CDFCONTEXT = (this.CDFCONTEXT) ? this.CDFCONTEXT.context : null;
      var CDFRECORDS = (this.CDFCONTEXT) ? this.CDFCONTEXT.records : null;
      var CDFCONTEXTPARENT = (this.CDFCONTEXT && this.CDFCONTEXT.parentContext) ? this.CDFCONTEXT.parentcontext : null;

      //get the given mapping
      var objMapping = i.next();

      //persist ref to variables using CONSTANT syntax; user can then rely on these names as constants to reference in their scripts
      var OBJECTTYPE = objMapping.getAttribute("name");   //Dom, Script, Node
      var OBJECTNAME = objMapping.getAttribute("value");  //jimbo, /root/item[2]/*
      var SERVERNS = this.getNamespace();
      if (SERVERNS == null || jsx3.util.strTrim(SERVERNS) == "") SERVERNS = null;

      //add text value to new node just added to the message
      if (OBJECTTYPE == "DOM") {
        //query for the object, passing in the server namespace if provided
        var myBoundObject = jsx3.GO(OBJECTNAME,SERVERNS);
        if (myBoundObject != null) {
          this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to DOM",description:"jsx3.GO(\"" + OBJECTNAME + "\"" + ((SERVERNS)?",\"" + SERVERNS + "\"" : "") + ").getValue();",level:6});
          this.doMapAndUpdate(MESSAGENODE,myBoundObject,"OUTBOUND",RULENODE);
        } else {
          Service._log(2,"Could not map the JSX object named, '" + OBJECTNAME + "', because it is null.");
        }
      } else if (OBJECTTYPE == "NODE" || OBJECTTYPE == "CACHE") {
        //the node is in the cache -- get handle to node
        var objOBJECTNAME = OBJECTNAME.split("::");
        var strXMLId = objOBJECTNAME[0];
        var objServer = this.getServer(), objCacheDoc;
        if (objServer != null) {
          objCacheDoc = objServer.getCache().getDocument(strXMLId);
        } else {
          objCacheDoc = jsx3.CACHE.getDocument(strXMLId);
        }

        if (objCacheDoc != null) {
          //get node
          var objCacheNode = objCacheDoc.selectSingleNode(objOBJECTNAME[1]);
          if (objCacheNode != null) {
            this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to Cache Node",description:((SERVERNS) ? "jsx3.getApp(\"" + SERVERNS + "\")" : "jsx3.CACHE") + ".getDocument(\"" + objOBJECTNAME[0] + "\").selectSingleNode(\"" + objOBJECTNAME[1] + "\").getValue();",level:6});
            //call to map the shell node value and the cache node value
            this.updateNode(MESSAGENODE,objCacheNode,"OUTBOUND");
          } else {
            //a node in the xml shell couldn't be found; log an error
            Service._log(2,"The map has a rule that references an invalid path to a node in the XML cache document, " + objOBJECTNAME[0] + ": " + objOBJECTNAME[1] + ".");
          }
        } else {
          Service._log(2,"The map has a rule that references an invalid XML document in the cache: " + objOBJECTNAME[0] + ".");
        }
      } else if (OBJECTTYPE == "CDF Document") {
        this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to CDF Document",description:((SERVERNS) ? "jsx3.getApp(\"" + SERVERNS + "\")" : "jsx3.CACHE") + ".getDocument(\"" + OBJECTNAME + "\");",level:6});
        //create a new document and place in the active cache for the active element
        this.getCDFDocument(OBJECTNAME,"OUTBOUND",SERVERNS);
      } else if (OBJECTTYPE == "CDF Record") {
        var objRecord;
        if (objRecord = this.CDFCONTEXT.records.next()) {
          this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to CDF Record",description:"this.CDFCONTEXT.records.next().selectNodes(\"record\");",level:6});
          _otempcontext = objRecord;
          _otemprecords = objRecord.selectNodes("record");
          this.CDFCONTEXT = new Service.CdfContext(_otempcontext,this.CDFCONTEXT,_otemprecords);
          //repeat as long as there is a node
          REPEAT = true;
          bRecord = true;
        } else {
          //no more records in the collection; kill the node
          removeChild(MESSAGENODE);
          bCancel = true;
          REPEAT = false;
        }
      } else if (OBJECTTYPE == "CDF Attribute") {
        var strValue = this.CDFCONTEXT.context.getAttribute(OBJECTNAME);
        if (strValue) {
          this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to CDF Attribute",description:"this.CDFCONTEXT.context.getAttribute(\"" + OBJECTNAME + "\");",level:6});
          //encountered a node in the message with a cdf attribute mapping; set the attribute on the current record context
          setValue(strValue);
        }
      } else if (OBJECTTYPE == "Script") {
        this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to Script",description:"this.eval(" + OBJECTNAME + ");",level:6});
        var oVal = {RULENODE:RULENODE,MESSAGENODE:MESSAGENODE,my:my,OBJECTNAME:OBJECTNAME,OBJECTTYPE:OBJECTTYPE,CDFCONTEXTPARENT:CDFCONTEXTPARENT,CDFCONTEXT:CDFCONTEXT,CDFRECORDS:CDFRECORDS,setCDFRecords:setCDFRecords,setCDFContext:setCDFContext,enableNamedRule:enableNamedRule,disableNamedRule:disableNamedRule,enableReferencedRule:enableReferencedRule,disableReferencedRule:disableReferencedRule,skipNamedRule:skipNamedRule/* <== deprecated*/,getNamedChild:getNamedChild,setValue:setValue,removeChild:removeChild};
        this.eval(OBJECTNAME,oVal);
      }
    } //==> end loop that applies the collection of mappings

    if (MESSAGENODE.getValue() == "" && MESSAGETYPE != null && RULENODE.selectSingleNode("record") == null) {
      //generate test data for simple types (create a hash later for more specific sample data)
      var myFriendly = RULENODE.getAttribute("datatype");
      if (myFriendly != null && myFriendly != "") {
        //put some sample data into the message node
        var mySimple = Service.simpletypes[myFriendly.substring(myFriendly.indexOf(":") +1)];
        var strSimpleData = (mySimple != null) ? ((typeof(mySimple) == "function") ? mySimple() : mySimple) : "???";
        MESSAGENODE.setValue(strSimpleData);
      }
    } else if (!bCancel && MESSAGENODE.getValue() == "" && RULENODE.selectSingleNode("record") == null && RULENODE.getAttribute("type") != "A" && !bFirst && RULENODE.selectSingleNode("restrictions/record[@name='nillable' and @value='true']") == null) {
      //no filter was specified and no simple mappings; this is an empty node, so remove automatically for the user
      removeChild(MESSAGENODE);
      bCancel = true;
    }

    //validate against any restrictions if the operation hasn't been cancelled (as happens when the message node is completely removed)
    if (bCancel != true) this.validate(MESSAGENODE,RULENODE);

    //if the user has specified to use a conditional, evaluate here; don't generate the code for this branch
    var CONDITIONAL = RULENODE.getAttribute("repeat");
    if (REPEAT == null) {
      CONDITIONAL = (CONDITIONAL != null) ? CONDITIONAL : false;
      REPEAT = this.eval(CONDITIONAL);
    }

    //Nodes in the Rules Tree don't always become nodes in the Message Tree as some rules are there as 'lattice' nodes to help organize
    //Whenever a message node is created, validate whether it is a lattice node or a child of a lattice node
    var bLatticeNode = false;
    if (!bCancel && RULENODE.getAttribute("groupref") != "1" && RULENODE.getParent().getAttribute("groupref") == "1") {
      //The message node just created is currently  a child of a lattice node. Solve by traversing ancestors until a
      //concrete node (element) is found. Transfer the message node as a child of this concrete ancestor
      var objMsgParent = _jsx_objMessageParent;
      var objRuleParent = RULENODE.getParent();
      while (objRuleParent.getAttribute("groupref") == "1") {
        objRuleParent = objRuleParent.getParent();
        var myLatticeParent = objMsgParent;
        objMsgParent = objMsgParent.getParent();
      }
      //3.7: added conditional to make sure that attribute children are transferred from the lattice node appropriately;
      if(bATT) {
        _jsx_objMessageParent.removeAttributeNode(MESSAGENODE);
        objMsgParent.setAttributeNode(MESSAGENODE);
      } else {
        objMsgParent.insertBefore(MESSAGENODE,myLatticeParent);
      }
    } else {
      //if this node is latice node; set a flag that it should be removed
      //else this is a regular node; process normally
      bLatticeNode = RULENODE.getAttribute("groupref") == "1";
    }

    //recurse to append descendant structures
    var objMyKids = RULENODE.selectNodes("record");
    for (i=objMyKids.iterator(); i.hasNext(); )
      this.doAddAndRecurse(_jsx_objMessage,MESSAGENODE,i.next(),MESSAGETYPE,null);

    //this is where we need to reset the context for the CDF parent to be the previous parent before we repeat the template/rules branch
    if (bRecord && this.CDFCONTEXT) this.CDFCONTEXT = this.CDFCONTEXT.parentcontext;

    //update array data type for the array on completion of child iteration
    strMyURI = RULENODE.getAttribute("soaparray");
    if (strMyURI != null && strMyURI != "") {
      //register the namespace with the soap envelope before adding the array to ensure prefix exists
      objNS = this.registerNamespace(strMyURI,_jsx_objMessage,bFirst);

      //update the item on the message node
      MESSAGENODE.setValue(objNS.prefix + ":" + RULENODE.getAttribute("soaparraytype"));
    }

    //update array count if the node is an array (soap-enc)
    if (RULENODE.getAttribute("datatype") == "Array" && RULENODE.getAttribute("ttns") == "http://schemas.xmlsoap.org/soap/encoding/") {
      var objAtts = MESSAGENODE.getAttributes();
      for (i=objAtts.iterator(); i.hasNext(); ) {
        //TO DO: check agains the qname, (namespace URI)
        var objAtt = i.next();
        if (objAtt.getBaseName() == "arrayType") {
          var strATURI = RULENODE.selectSingleNode("record[@jsxtext='arrayType']/@ttns").getValue();
          var strPrefix = this.nshash[strATURI];
          var strArrayType = strPrefix + ":" +
              RULENODE.selectSingleNode("record[@jsxtext='arrayType']/@datatype").getValue() +
              "[" + MESSAGENODE.selectNodes("./*").size() + "]";
          objAtt.setValue(strArrayType);
        }
      }
    }

    //call this structure again if the repeat flag evaluated to true
    if (REPEAT && !bLatticeNode) {
      this.doAddAndRecurse(_jsx_objMessage,_jsx_objMessageParent,RULENODE,MESSAGETYPE,null);
    } else if (bLatticeNode && !bATT) {
      //if this is a lattice node, remove it from the message
      MESSAGENODE.getParent().removeChild(MESSAGENODE);
    }

    return _jsx_objMessage;
  };

  /**
   * Finds the name of a property on @objHash with a value equivalent to @strValue
   * @param objHash    {Object}
   * @param strValue   {String}
   * @return          {String}
   * @private
   */
  Service_prototype.findNameByValue = function(objHash,strValue) {
    for (var p in objHash) {
      if (objHash[p] == strValue) return p.toString();
    }
    return null;
  };

  /**
   * Validates whether or not the message node adheres to the restrictions defined by objRule (the CXF rule node). Note: minoccur and maxoccur are not validated at this time
   * @param objMsg    {jsx3.xml.Entity}
   * @param objRule   {jsx3.xml.Entity}
   * @return         {boolean}
   * @private
   */
  Service_prototype.validate = function(objMsg,objRule) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Service.jsxclass, this.getEndpointURL());
/* @JSC :: end */
    
    var objRestrictions = objRule.selectNodes("restrictions/record[@name!='minoccur' and @name!='maxoccur']");
    var rv = true;
    
    if (objRestrictions.size() > 0) {
      //the remaining matches loop until one of the rules fails, at which point false is returned for the entirety of the validation
      var strMyValue = objMsg.getValue() + "";

      //validate against enumerations, since they are explicit and most accurate, any match is immediately valied
      if (! objRule.selectSingleNode("restrictions/record[@name='enumeration' and @value='" + strMyValue + "']")) {
        for (var i=objRestrictions.iterator(); rv && i.hasNext(); ) {
          var objRestriction = i.next();
          var strName = objRestriction.getAttribute("name");
          var strValue = objRestriction.getAttribute("value");
          if (strName == "enumeration") {
            //failed --an explicit enumeration was specified, but a match wasn't found
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "maxExclusive" && !(strMyValue < strValue)) {
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "maxInclusive" && !(strMyValue <= strValue)) {
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "minInclusive" && !(strMyValue >= strValue)) {
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "minExclusive" && !(strMyValue > strValue)) {
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "length" && strMyValue.length != Number(strValue)) {
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "maxLength" && strMyValue.length > Number(strValue)) {
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "minLength" && strMyValue.length < Number(strValue)) {
            this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
            rv = false;
          } else if (strName == "pattern") {
            var re = new RegExp(strValue);
            if (strMyValue.search(re) != 0) {
              this.invalidate(objMsg,objRule,strMyValue,strName,strValue);
              rv = false;
            }
          }
        }
      }
    }

/* @JSC :: begin BENCH */
    t1.log("validate");
/* @JSC :: end */
    
    return rv;
  };

  /**
   * Validates whether or not the message node adheres to the restrictions defined by objRule (the CXF rule node). Note: minoccur and maxoccur are not validated at this time
   * @param objMsg     {jsx3.xml.Entity}
   * @param objRule    {jsx3.xml.Entity}
   * @param strMyValue {String} actual node value
   * @param strName    {String} name of restriction
   * @param strValue   {String} value of the restriction
   * @private
   */
  Service_prototype.invalidate = function(objMsg,objRule,strMyValue,strName,strValue) {
    this._setValid(false);
    this.publish({subject:Service.ON_INVALID,rule:objRule,message:objMsg,type:strName,value:strValue});
    this.publish({subject:Service.ON_PROCESS_RULE,rule:objRule,action:"Invalidate",description:strMyValue + " != " + strName + ":" + strValue,level:3});
  };

  /**
   * Maps a node within the application cache to a node value in the XML payload that is being passed between client and server; type casting does not occur
   * @param objMapNode    {jsx3.xml.Entity} Parsed XML node object whose text content (as a primitive defined by 'nodeTypedValue' (INBOUND) and 'childNodes.get(0).nodeValue' (OUTBOUND)) will be updated; nodes of type 'attribute' will be mapped via the getAttribute() and setAttribute() methods, respectively.
   * @param objAppNode    {jsx3.xml.Entity} Parsed XML node object from the client side XML cache
   * @param DATAFLOW      {String} One of two types: INBOUND or OUTBOUND
   * @private
   */
  Service_prototype.updateNode = function(objMapNode,objAppNode,DATAFLOW) {
    var objSource = objAppNode;
    var objDest = objMapNode;
    //get type of node (only att, entity, text and cdata are currently supported
    if (DATAFLOW == "INBOUND") {
      objSource = objMapNode;
      objDest = objAppNode;
    }
    var strValue = this.getNodeValue(objSource);

    //call function that will update the node with the requisite value
    this.setNodeValue(objDest,strValue);
  };

  /**
   * Updates the value of @objNode with value, @strValue
   * @param objNode     {jsx3.xml.Entity} Parsed XML node object whose text content will be updated
   * @param strValue    {String} Value to update the node with
   * @private
   */
  Service_prototype.setNodeValue = function(objNode,strValue) {
    objNode.setValue(strValue+"");
  };

  /**
   * Gets the value of @objNode
   * @param objNode  {jsx3.xml.Entity} parsed XML node object
   * @return        {String}
   * @private
   */
  Service_prototype.getNodeValue = function(objNode) {
    return objNode.getValue();
  };

  /**
   * Maps a JSX GUI object instance within the application to the value of the node, @objMapNode. All values are passed as strings
   * @param objMapNode  {jsx3.xml.Entity} Parsed XML node object whose text content (as a primitive defined by 'nodeTypedValue' (INBOUND) and 'childNodes.get(0).nodeValue' (OUTBOUND)) will be updated; nodes of type 'attribute' will be mapped via the getAttribute() and setAttribute() methods, respectively.
   * @param objJSX      {jsx3.gui.Form} Galid JSX GUI object to map to the given node; one that implements the jsx3.gui.Form interface (such as a TextBox or Select)
   * @param DATAFLOW    {String} One of two types:  INBOUND or OUTBOUND
   * @private
   */
  Service_prototype.doMapAndUpdate = function(objMapNode,objJSX,DATAFLOW,objRuleNode) {
    //only those classes implementing "Form" and instances of "Block" are supported
    if (jsx3.gui.Form && objJSX.instanceOf("jsx3.gui.Form")) {
      //radio buttons and checkboxes  get special handling
      if (jsx3.gui.RadioButton && objJSX.instanceOf("jsx3.gui.RadioButton")) {
        if (DATAFLOW == "INBOUND") {
          //call static method for jsx3.gui.RadioButton class to select the appropriate radio button in the button group (the one with a value that matches the node value)
          objJSX.setGroupValue(this.getNodeValue(objMapNode));
        } else {
          var rdoValue = objJSX.getGroupValue();
          this.setNodeValue(objMapNode,((rdoValue == null) ? "" : rdoValue));
        }
      } else if (jsx3.gui.CheckBox && objJSX.instanceOf("jsx3.gui.CheckBox")) {
        if (DATAFLOW == "INBOUND") {
          //get value for mapped node
          var strValue = this.getNodeValue(objMapNode);
          //evaluate - (any non-zero/non-null node value will result in checkbox being checked
          objJSX.setChecked((this.eval(strValue))?1:0);
        } else {
          this.setNodeValue(objMapNode,(objJSX.getChecked())?"true":"false");
        }
      } else {
        //handle all other Form types here
        if (DATAFLOW == "INBOUND") {
          objJSX.setValue(this.getNodeValue(objMapNode));
        } else if (DATAFLOW == "OUTBOUND") {
          this.setNodeValue(objMapNode,(objJSX.getValue() + ""));
        }
      }
    } else if (jsx3.gui.Block && objJSX.instanceOf("jsx3.gui.Block")) {
      if (DATAFLOW == "INBOUND") {
        //update text for block element
        objJSX.setText(this.getNodeValue(objMapNode),true);
      } else {
        //update node with text contained by the given block
        this.setNodeValue(objMapNode,objJSX.getText());
      }
    }
  };

  /**
   * Traverses the message tree, using the rules tree as a template in order to recursively process the nodes in a response message (an INBOUND message)
   * @param MESSAGENODE  {jsx3.xml.Entity} Node in the response message
   * @param RULENODE  {jsx3.xml.Entity} Node in the rules tree
   * @private
   */
  Service_prototype.doReadAndRecurse = function(MESSAGENODE,RULENODE) {
    //persist ref to this namespace, so inner functions can access
    var my = this;

    //available inner function to provide named access to a child-node in the message (a child of MESSAGNODE)
    var getNamedChild = function(_strMessageChildName) {
      //returns an object handle to the child message node of the given name
      return my.getNamedNodeChild(_strMessageChildName,MESSAGENODE);
    };

    //use pointer to named template (for recursion and functional programming styles)
    var strXID = RULENODE.selectSingleNode("mappings/record[@name='CDF Record' and @value and not(@value='')]/@value");
    if (strXID) {
      var tempRULENODE = RULENODE.selectSingleNode("//record[@jsxid='" + strXID.getValue() + "']");
      if(tempRULENODE != null) {
        RULENODE = tempRULENODE;
      } else {
        Service._log(2,"The rule node identified by the jsxid, '" + strXID.getValue() + "', cannot be located. Processing will proceed normally with the active rule and will not be handled by the referenced (unresolved) rule.");
      }
    }

    this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Locate Node",description:"<" + MESSAGENODE.getNodeName() + ">",level:6});

    //get the collection of mappings
    var objMappings = RULENODE.selectNodes("mappings/record");

    //reset the recursion flag
    var RECURSE = true;

    //whenever one of the mappings is a CDF record, this is set to true to tell the system to reset the parent context, since each encounterered record resets it (drills down)
    var bRecord = false;

    //loop to apply the given map setting
    for (var i=objMappings.iterator(); i.hasNext(); ) {
      //expose handle to record on cdf
      var CDFCONTEXT = (this.CDFCONTEXT) ? this.CDFCONTEXT.context : null;

      //get the given mapping
      var objMapping = i.next();

      //declare additional named parameters users can access within their bound filter code to change context
      var OBJECTTYPE = objMapping.getAttribute("name");   //Dom, Script, Node
      var OBJECTNAME = objMapping.getAttribute("value");  //jimbo, /root/item[2]/*
      var SERVERNS = this.getNamespace();

      //add text value to new node just added to the message
      if (OBJECTTYPE == "DOM") {
        //query for the object, passing in the server namespace if provided
        var myBoundObject = jsx3.GO(OBJECTNAME,SERVERNS);
        if (myBoundObject != null) {
          this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to DOM",description:"jsx3.GO(\"" + OBJECTNAME + "\"" + ((SERVERNS)?",\"" + SERVERNS + "\"" : "") + ").setValue(\"" + MESSAGENODE.getValue() + "\");",level:6});
          this.doMapAndUpdate(MESSAGENODE,myBoundObject,"INBOUND",RULENODE);
        } else {
          Service._log(2,"Could not map the JSX object named, '" + OBJECTNAME + "', because it is null.");
        }
      } else if (OBJECTTYPE == "NODE" || OBJECTTYPE == "CACHE") {
        //the node is in the cache -- get handle to node
        var objOBJECTNAME = OBJECTNAME.split("::");
        var strXMLId = objOBJECTNAME[0];
        var objServer = this.getServer(), objCacheDoc;
        if (objServer != null) {
          objCacheDoc = objServer.getCache().getDocument(strXMLId);
        } else {
          objCacheDoc = jsx3.CACHE.getDocument(strXMLId);
        }

        if (objCacheDoc != null) {
          //get node
          var objCacheNode = objCacheDoc.selectSingleNode(objOBJECTNAME[1]);
          if (objCacheNode != null) {
            this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to Cache Node",level:6,
              description:((SERVERNS) ? "jsx3.getApp(\"" + SERVERNS + "\")" : "jsx3.CACHE") + ".getDocument(\"" + objOBJECTNAME[0] + "\").selectSingleNode(\"" +
                          objOBJECTNAME[1] + "\").setValue(\"" + jsx3.util.strTruncate(MESSAGENODE.getValue(), 30, null, 2/3) + "\");"});
            //call to map the shell node value and the cache node value
            this.updateNode(MESSAGENODE,objCacheNode,"INBOUND");
          } else {
            //a node in the xml shell couldn't be found; log an error
            Service._log(2,"The map has a rule that references an invalid path to a node in the XML cache document, " + objOBJECTNAME[0] + ": " + objOBJECTNAME[1] + ".");
          }
        } else {
          Service._log(2,"The map has a rule that references an invalid XML document in the cache: " + objOBJECTNAME[0] + ".");
        }
      } else if (OBJECTTYPE == "CDF Document") {
        this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to CDF Document",description:((SERVERNS) ? "jsx3.getApp(\"" + SERVERNS + "\")" : "jsx3.CACHE") + ".setDocument(\"" + OBJECTNAME + "\",jsx3.xml.CDF.Document.newDocument());",level:6});
        //create a new document and place in the active cache for the active element
        OBJECTNAME = OBJECTNAME || this.getUniqueId()+"_doc"; // make sure there's an name for the new document
        this.getCDFDocument(OBJECTNAME,"INBOUND",SERVERNS);
      } else if (OBJECTTYPE == "CDF Record") {
        this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to CDF Record",description:"this.CDFCONTEXT.context.createNode(jsx3.xml.Entity.TYPEELEMENT,\"record\");",level:6});
        var _otempnode = this.CDFCONTEXT.context.createNode(jsx3.xml.Entity.TYPEELEMENT,"record");
        _otempnode.setAttribute("jsxid",this.getUniqueId());
        this.CDFCONTEXT.context.appendChild(_otempnode);
        this.CDFCONTEXT = new Service.CdfContext(_otempnode,this.CDFCONTEXT);
        bRecord = true;
      } else if (OBJECTTYPE == "CDF Attribute") {
        this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to CDF Attribute",description:"this.CDFCONTEXT.context.setAttribute(\"" + OBJECTNAME + "\",\"" + jsx3.util.strTruncate(MESSAGENODE.getValue(), 30, null, 2/3) + "\");",level:6});
        //node in the message with a cdf attribute mapping; set the attribute on the current record context
        this.CDFCONTEXT.context.setAttribute(OBJECTNAME,MESSAGENODE.getValue());
        //attributes are considered terminal (intersecting documents hierarchies are untenable)
        RECURSE = false;
      } else if (OBJECTTYPE == "Script") {
        this.publish({subject:Service.ON_PROCESS_RULE,rule:RULENODE,action:"Map to Script",description:"this.eval(" + OBJECTNAME + ");",level:6});
        var oVal = {my:my,OBJECTNAME:OBJECTNAME,OBJECTTYPE:OBJECTTYPE,CDFCONTEXT:CDFCONTEXT,MESSAGENODE:MESSAGENODE,RULENODE:RULENODE,RECURSE:RECURSE,getNamedChild:getNamedChild};
        this.eval(OBJECTNAME,oVal);
      }
    } //==> END FOR LOOP

    //process the descendant rules;
    if (RECURSE)
      this._doReadAndRecurse(RULENODE,MESSAGENODE);

    //this is where we need to reset the context for the CDF parent to be the previous parent before we began traversing descendant structures
    if (bRecord) this.CDFCONTEXT = this.CDFCONTEXT.parentcontext;
  };

  //3.7: account for any abstract rule nodes by allowing deeper drill-down in the rule node tree, while keeping a pointer to the message node
  Service_prototype._doReadAndRecurse = function(RULENODE,MESSAGENODE) {
      //get all children that either define a rule or contain another child that might define a rule
      var objRuleChildren = RULENODE.selectNodes("*[name()='record' and (record or mappings or (@xpointer and not(@xpointer='')))]");
      for (var i=objRuleChildren.iterator(); i.hasNext(); ) {
        //get children in the return message that have a corresponding name (less the prefix) that matches; TO DO: MUST IMPLEMENT NAMESPACE SUPPORT VIA 'setSelectionNamespaces'
        var objRuleChild = i.next();
        var strName = objRuleChild.getAttribute("jsxtext");
        if (objRuleChild.getAttribute("type") == "A") {
          var objNodeChildren = MESSAGENODE.getAttributes();
          INNER:
          for (var x=objNodeChildren.iterator(); x.hasNext(); ) {
            var objNodeChild = x.next();
            if (objNodeChild.getBaseName() == strName) {
              this.doReadAndRecurse(objNodeChild, objRuleChild);
              break INNER;
            }
          }
        } else if(objRuleChild.getAttribute("groupref") == "1") {
          //the abstract child will factor out its own generation by calling this message again with itself as the RULENODE
          this._doReadAndRecurse(objRuleChild,MESSAGENODE);
        } else {
          objNodeChildren = MESSAGENODE.selectNodes("*[local-name()='" + strName + "']");
          for (var j=objNodeChildren.iterator(); j.hasNext(); )
            this.doReadAndRecurse(j.next(),objRuleChild);
        }
      }
  };

  /**
   * Provides context switching when traversing a CDF Document
   * @param objNode  {jsx3.xml.Entity} record node context
   * @param objParentContext  {jsx3.xml.Entity} instance of this method, but profiled to the parent (allows the rules to 'back out' during drill down)
   * @param objCollection  {jsx3.util.List} child 'record' instances belonging to @objNode
   * @private
   */
  Service.CdfContext = function(objNode,objParentContext,objCollection) {
    this.context = objNode;
    this.parentcontext = objParentContext;
    this.records = objCollection;
  };

  /**
   * Called by the bound scriplet to provide access to named nodes with an unknown namespace prefix
   * @param strMessageChildName  {String} node name without the prefix
   * @param MESSAGENODE          {jsx3.xml.Entity} message node being processed in the response document
   * @return                    {jsx3.xml.Entity}
   * @private
   */
  Service_prototype.getNamedNodeChild = function(strMessageChildName,MESSAGENODE) {
    //get all child nodes of the current message node (current context)
    var objNodeChildren = MESSAGENODE.getChildNodes();

    for (var i=objNodeChildren.iterator(); i.hasNext(); ) {
      var objNodeChild = i.next();
      var strName = objNodeChild.getBaseName();
      if (strName == strMessageChildName)
        return objNodeChild;
    }
    return null;
  };

  /**
   * Executes the given code in context of the service instance
   * @param strCode  {String} JavaScript code to evaluate
   * @private
   */
  Service_prototype.doval = function(strCode) {
    this.eval(strCode);
  };

  /**
   * Gets the direct rule child of @MESSAGENODE with jsxtext attribute equal to @strName
   * @param strName   {String} name of rule node
   * @param RULENODE  {jsx3.xml.Entity} rule node containing named child to return
   * @return         {jsx3.xml.Entity}
   * @private
   */
  Service_prototype.getNamedRuleChild = function(strName,RULENODE) {
    //get all child nodes of the current message node (current context)
    return RULENODE.selectSingleNode("record[@jsxtext='" + strName + "']");
  };

  /**
   * Generates a session-specific key (during this browser session, no key generated on the client will match this)
   * @private
   */
  Service_prototype.getUniqueId = function() {
    return jsx3.xml.CDF.getKey();
  };

  /**
   * Provides a method to manually trigger the response chain by initiating the <b>response</b> event for the instance. One parameter can be passed to
   * simulate the server response: <code>objEvent</code>.  Based upon the properties contained by this object, the response will be handled
   * differently by the response handler. The named properties are as follows:
   * <br/><ul>
   * <li><b>target</b>: A jsx3.net.Request instance or a JavaScript object that provides the methods, <code>getResponseXML</code>
   * (to handle XML-formatted responses) or <code>getResponseText</code> (to handle JSON-formatted responses). If the event object does not
   * expose the 'target' property and/or if the 'target' does not expose the methods getResponseText or getResponseXML, it is assumed that <code>objEvent</code>
   * is a JSON object--the response itself.</li></ul>
   * @param objEvent {Object} Event object with named property,<code> target</code>; or JSON object
   */
  Service_prototype.doRespond = function(objEvent) {
    if(this._isJSON("O") && !(objEvent.target && objEvent.target.getResonseText instanceof Function)) {
      //if user merely sent JSON, wrap in additional object to simulate the APIs provided by the jsx3.net.Request class
      //this is useful since JSON objects will commonly be transported by other mechanisms and callbacks. This allows
      //the developer to use their own transport, while allowing the mapper to easily resume processing of the response
      this.onResponse({target:{getResponseText:function() {
        return objEvent;
      }}});
    } else {
      this.onResponse(objEvent);
    }
  };

  /**
   * Callback method notified when the request has returned a valid response, or has thrown an error. Calls onError/onSucces; binds the inbound document
   * @param objEvent {Object} Event object with named properties. 'target' is the jsx3.net.Request instance that performed the transport
   * @private
   */
  Service_prototype.onResponse = function(objEvent) {
    var objRequest = objEvent.target;
    var objXML, strJSON, objError;
    var bError = false;

    //check if this is a real socket or in test mode
    if (objRequest instanceof jsx3.net.Request) {      
      //send the httpcontrol objects info to the system out
      this.status = objRequest.getStatus();
      this.statusText = objRequest.getStatusText();

      Service._log(5,"The call to the operation, '" + this.getOperationName() + "', hosted at '" + this.getEndpointURL() + "' just returned with the HTTP Status code, " + this.status);

      //check the http status code to see if the server actually responded
      if (this.status != 200 && this.status != 202) {
        //WSDL specification states that 200 and 202 are the 'success' status codes
        Service._log(2,"The call to the operation, '" + this.getOperationName() + "', hosted at '" + objRequest.getURL() + "' has returned an error (HTTP Status Code: '" + this.status + "').\nDescription: " + this.statusText);
        bError = true;
      }

      //get the response document
      if(this._isJSON("O")) {
        strJSON = objRequest.getResponseText();
        try {
          objXML = Service.JSON2XML(strJSON);
          if(!objXML) {
            Service._log(2,"The static JSON string did not return a valid JSON object when evaluated. The inbound filter (e.g., doInboundFilter()) as well as the inbound mappings (e.g., doInboundMap()) will not be executed.");
            this.onError();
            return;
          }
        } catch (e) {
          objError = jsx3.lang.NativeError.wrap(e);
          Service._log(2,"The static JSON string did not return a valid JSON object when evaluated. The inbound filter (e.g., doInboundFilter()) as well as the inbound mappings (e.g., doInboundMap()) will not be executed.\nDescription:" + objError.getMessage());
          this.onError();
          return;
        }
      } else {
        objXML = objRequest.getResponseXML();
      }

      //check for valid xml
      if (objXML && !objXML.hasError()) {
        this.setInboundDocument(objXML);
      } else if(this.getMEPNode("O")){
        Service._log(2,"The call to the operation, '" + this.getOperationName() + "', hosted at '" + this.getEndpointURL() + "' did not return a valid response document. The inbound filter (e.g., doInboundFilter()) as well as the inbound mappings (e.g., doInboundMap()) will not be executed.\nDescription: " + this.statusText);
        this.onError();
        return;
      }
    } else {
      //get the response document
      if(this._isJSON("O")) {
        strJSON = objRequest.getResponseText();
        try {
          objXML = Service.JSON2XML(strJSON);
          if(!objXML) {
            Service._log(2,"The static JSON string did not return a valid JSON object when evaluated. The inbound filter (e.g., doInboundFilter()) as well as the inbound mappings (e.g., doInboundMap()) will not be executed.");
            this.onError();
            return;
          }
        } catch (e) {
          objError = jsx3.lang.NativeError.wrap(e);
          Service._log(2,"The static JSON string did not return a valid JSON object when evaluated. The inbound filter (e.g., doInboundFilter()) as well as the inbound mappings (e.g., doInboundMap()) will not be executed.\nDescription:" + objError.getMessage());
          this.onError();
          return;
        }
      } else {
        objXML = objRequest.getResponseXML();
      }
      this.setInboundDocument(objXML);
      this.status = 200;
      this.statusText = "Executing in Static mode, using service message proxy, '" + this.getInboundURL() + "'.";
      bError = this.getStatus() != 200 && this.getStatus() != 202;
    }

    //validate that the MEP is not one-way; if it is, send logging message
    var objOutputNode = this.getMEPNode("O");
    if (objOutputNode) {
      //place the message in the cache where the bound outbound filter can modify it
      this.doInboundFilter();

      //call function to map inbound message
      this.doInboundMap();
    } else {
      Service._log(5,"An alternate message exchange pattern was encountered for the mapping rule: one-way. The inbound filter and inbound mappings will NOT be run.");
    }

    //call final cleanup function
    if (bError) {
      this.onError();
    } else {
      this.onSuccess();
    }
  };

  /**
   * Binds hooks to the the CDF instance (e.g., nodes within this instance) appropriate to use for a read/write binding to a message
   * @param strDocId {String} Id (qualified or not) for the CDF doc to use
   * @param FLOW   {String} one of: INBOUND or OUTBOUND
   * @param serverNS   {String} optional name of server that owns the specific cache
   * @private
   */
  Service_prototype.getCDFDocument = function(strDocId,FLOW,serverNS) {
    //declare a defualt ref to the cache belonging to the main controller; if all else fails, use this cache instance
    //get the correct cache instance
    var server = this.getServer(), objDocument;
    var CACHE = server != null ? server.getCache() : jsx3.CACHE;

    //we now have the cache instance (as object) and the ID of the document (as string) that we'll interact with; now either set/get depending upon FLOW
    if (FLOW == "OUTBOUND") {
      //the message is going out to the server, which means we'll be reading a CDF document that already exists
      objDocument = CACHE.getDocument(strDocId);
      if (objDocument) {
        //populate object ref
        this.CDFCONTEXT = new Service.CdfContext(objDocument.getRootNode(),null,objDocument.getRootNode().selectNodes("record"));
      } else {
        //no doc found
        Service._log(2,"The Cache document, '" + strDocId + "', is being referenced as a bound CDF document for the operation, '" + this.getOperationName() + "'. However, this document cannot be located.");
      }
    } else {
      //bind the new document and set the cdf context node to begin adding information to
      objDocument = jsx3.xml.CDF.Document.newDocument();
      CACHE.setDocument(strDocId,objDocument);
      this.CDFCONTEXT = new Service.CdfContext(objDocument.getRootNode(),null);
      this._jsxallcdfs[strDocId] = CACHE;
    }
  };

  /**
   * Gets the HTTP response code (i.e., 200, 404, 500, etc). This will be the response code provided by the bound jsx3.net.Request instance
   * used for the transport. However, if setStatus has been called on the Service instance, the value supplied by the developer will be used instead.
   * @return {int}
   */
  Service_prototype.getStatus = function() {
    var s = this._status || this.status;
    return (!s) ? jsx3.net.Request.STATUS_OK : s;
  };

  /**
   * Sets the HTTP response code (i.e., 200, 404, 500, etc). Typically, the Service instance determines this value by querying the bound request instance
   * (<code>jsx3.net.Request</code>) returned by the method, <code>[service_instance].getRequest()</code>. However, calling this method will override
   * normal operation by forcing a valid/invalid state that affects methdods relying on the HTTP status
   * such as <code>doInboundMap</code>.  This is particularly useful for SOAP services that provide alternate processing
   * instructions and mappings when a Fault occurs as well as when running tests in Static mode.
   * @param intStatus {int}
   */
  Service_prototype.setStatus = function(intStatus) {
    this._status = intStatus;
  };

  /**
   * Gets the mode (static <code>jsx3.Boolean.FALSE</code> or live <code>jsx3.Boolean.TRUE</code>).
   * @return {jsx3.Boolean}
   */
  Service_prototype.getMode = function() {
    return (this._jsxmode != null) ? this._jsxmode : this.getServer().getEnv("mode");
  };

  /**
   * Sets the mode (static <code>jsx3.Boolean.FALSE</code> or live <code>jsx3.Boolean.TRUE</code>).  Overrides the default setting for the context Server
   * instance within which this Service instnace is running.  (NOTE: This setting is accessible at the server level via the <b>Project Settings</b> dialog.)
   * Setting this value to <code>jsx3.Boolean.FALSE</code>, forces a test document
   * to be used to simulate a "typical" server response, instead of actually sending a request to a remote service.  This is useful when setting up
   * test environments as well as providing "live" interactions when the remote server may not be available.
   * @param MODE {jsx3.Boolean}
   * @see #setInboundURL()
   */
  Service_prototype.setMode = function(MODE) {
    this._jsxmode = MODE;
  };

  /**
   * Applies all inbound mappings, using the server response document as the source for the operation. Although this method is called once automatically, it can be called at any time to reapply the mapping rules.
   * Example usage:
   *
   * var oService = new jsx3.net.Service();
   * oService.setInboundDocument(objSomeDocumentIManuallyWantToLoad);
   * oService.doInboundMap();
   *
   */
  Service_prototype.doInboundMap = function() {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Service.jsxclass, this.getEndpointURL());
/* @JSC :: end */

    Service._log(5,"Executing the Inbound Mappings.");

    //get handle to the node in the rules tree corresponding to the operation being run (the current operation)
    var objOperationNode = this.getOperationNode();
    if (objOperationNode) {
      //get response message returned from server
      var objResponse = this.getInboundDocument();

      //get the correct starting point in the rules tree (support fault if the HTTP Status is incorrect AND the fault rule exists)
      var s = this.getStatus();
      var myType = (s != 200 && s != 202  && s != 0) ? "F" : "O";

      if (myType == "O" && this._compiled instanceof jsx3.xml.Document) {
        Service._log(5,"This operation uses a compiled XSLT document to transform the server results to CDF.");

        //the CXF has been compiled into an XSLT document.  Do the transformation via Processor merge
        jsx3.require("jsx3.xml.Template");
        var objProcessor = new jsx3.xml.Template(this._compiled);
        var objResult = jsx3.xml.CDF.Document.wrap(objProcessor.transformToObject(objResponse));

        //was the transformation successful?
        if (!objResult.hasError()) {
          Service._log(5,"The compiled transformation was successful. Adding the CDF to the server's cache.");
          //no error in the transformation; get the CDF Document name (what should be placed in the cache)
          var objRule = this.getMEPNode("O");
          var objCDF = objRule.selectSingleNode(".//record/mappings/record[@name='CDF Document']");
          if (objCDF) {
            var strDocumentId = objCDF.getAttribute("value");
            if (strDocumentId && (strDocumentId = jsx3.util.strTrim(String(strDocumentId))) != "") {
              var server = this.getServer();
              var CACHE = server != null ? server.getCache() : jsx3.CACHE;
              CACHE.setDocument(strDocumentId,objResult);
            } else {
              //throw error. the cdf document has no name, so it can't be cached
              Service._log(2,"The CDF document that was just created could not be cached, because it has no name. Update the Rules document to use a name for the CDF document being created.");
            }
          } else {
            //throw error. the cdf document doesn't exist
            Service._log(2,"CDF Mappings require that the first mapping be of type 'CDF Document' and that this mapping type exist only once for an output. Update the Rules document to use a a CDF Document mapping.");
          }
        } else {
          //throw error; merging the compiled xslt with the server's inbound document resulted in an error
          Service._log(2,"The merge failed and a CDF Document could not be created, using the compiled CXF. Run this operation in an uncompiled state to better discern the cause of this error:\n\t" + objResult.getError());
        }
      } else {
        //user chose not to compile the CXF or there was a fault (fault processing is simple, so no reason to complile.  just handle here
        var objInputNode = this.getMEPNode(myType);
        if (objInputNode == null && myType == "F")
          objInputNode = this.getMEPNode("O");

        if (objInputNode) {
          var objResponseRules = objInputNode.selectNodes("record");

          //loop through the immediate rules of the output node and overlay them on top of the matching nodes in the response document
          for (var i=objResponseRules.iterator(); i.hasNext(); ) {
            //get children in the return message that have a corresponding name (less the prefix) that matches; TO DO: MUST IMPLEMENT NAMESPACE SUPPORT VIA 'setSelectionNamespaces'
            var objRuleChild = i.next();
            var strName = objRuleChild.getAttribute("jsxtext");
            var tns = objRuleChild.getAttribute("tns");
            var strPrefix = "";
            if (tns != null && jsx3.util.strTrim(tns) != "") {
              strPrefix = "jsx:";
              objResponse.setSelectionNamespaces("xmlns:jsx='" + tns + "'");
            }

            var strQuery = "//" + strPrefix + strName;
            var objNodeChild = objResponse.selectSingleNode(strQuery);
            if (objNodeChild != null) {
              this._jsxallcdfs = {};
              if (!objNodeChild.equals(objResponse.getRootNode())) {
                //query for the parent and then query for the children of the same name
                var objNodeParent = objNodeChild.getParent();
                var objNodeChildren = objNodeParent.selectNodes(strPrefix + strName);
                for (var j=objNodeChildren.iterator(); j.hasNext(); )
                  this.doReadAndRecurse(j.next(),objRuleChild);
              } else {
                this.doReadAndRecurse(objNodeChild,objRuleChild);
              }
              //3.7: added final step to reset the complete document in the cache, so setXMLBind will fire for all interested parties
              //previously, the event fired BEFORE the document was populated, so onXMLBind only triggered an empty repaint
              for(var p in this._jsxallcdfs) {
                var myCache = this._jsxallcdfs[p];
                myCache.setDocument(p,myCache.getDocument(p));
              }
            }
          } //==> end for
        } else {
          //this a one-way message (no output has been defined in the mapping rule)
          Service._log(5,"An alternate message exchange pattern was encountered for the mapping rule: one-way. The inbound mappings will not be run.");
        } //==> end one-way MEP
      } //==> end uncompiled portion
    } //==> end if check for the existence of a set operation

/* @JSC :: begin BENCH */
    t1.log("doInboundMap");
/* @JSC :: end */
  };

  /**
   * Gets the namespace prefix for a given url
   * @param objWSDL {jsx3.xml.Document}
   * @param strURL {String}
   * @return {String}
   * @private
   */
  Service.getNSForURL = function(objWSDL,strURL) {
    var objAtts = objWSDL.getRootNode().getAttributes();
    for (var i=objAtts.size()-1;i>=0;i--) {
      if (objAtts.get(i).getValue() == strURL) {
        return objAtts.get(i).getBaseName();
      }
    }
    return null;
  };

  /**
   * Gets the URL for a given namespace prefix
   * @param objWSDL {jsx3.xml.Document}
   * @param strNS {String}
   * @return {String}
   * @private
   */
  Service.getURLForNS = function(objWSDL,strNS) {
    if (jsx3.util.strEmpty(strNS)) return null;
    try {
      var objAtt = objWSDL.selectSingleNode("//*[@xmlns:" + strNS + "]/@xmlns:" + strNS);
    } catch(e) {
      var objError = {};
      objError.FUNCTION = "jsx3.net.Service.getURLForNS";
      objError.PREFIX = strNS + "";
      objError.DESCRIPTION = "Could not finde the URI for the given namespace prefix.";
      jsx3.util.Logger.logError(objError);
      return null;
    }
    return (objAtt) ? objAtt.getValue() : null;
  };

/* @JSC :: begin DEP */

  /**
   * Gets the release/build for the class (i.e., "2.2.00")
   * @ returns        {String}
   * @deprecated
   */
  Service.getVersion = function() {
    return "3.0.00";
  };

/* @JSC :: end */

//   ------------------------ XSLT COMPILER ----------------------------------

  /**
   * Compiles the CXF rules for this service instance to an equivalent XSLT document. This enables
   * much faster performance than using the DOM-based iterator (default) to convert the XML response
   * document into a CDF Document type. Note that this process only supports the map types
   * <code>CDF Document</code>, <code>CDF Record</code>, and <code>CDF Attribute</code>. Only one CDF Document
   * can be declared per Operation. Otherwise the compilation will fail.
   * All other mapping types will be ignored and will not be converted into an XSLT equivalent.  Also note
   * that the order of a set of sibling mapping rules does not proscribe proper processing by way of
   * sequence.  This means that any order of sibling mapping rules will result in appropriate processing, regardless of the
   * sibling node order returned from the given service.  This facilitates nested record structures in that
   * attributes can first be applied to a given record before child elements (e.g., a 'record') are added.
   * Stated otherwise, any rule that has a descendant rule that would created a nested 'record' node should follow
   * all sibling mapping rules that would create an 'attribute' entity. Call this method immediately before/after <code>doCall</code>
   * for best performance.
   * @return {jsx3.xml.Document} XSLT document
   */
  Service_prototype.compile = function() {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Service.jsxclass, this.getEndpointURL());
/* @JSC :: end */
    this._resetCompiler();

    //get the output node (this contains the CXF rules that will be converted into an XSLT)
    var objRule = this.getMEPNode("O");

    //create an array that will contain the XSLT as it is created.
    var objStylesheet = [];
    objStylesheet.push('<?xml version="1.0" ?>');
    objStylesheet.push('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" ');
    objStylesheet.push('<xsl:output method="xml" omit-xml-declaration="no"/>');

    //do the actual compilation (a recursive process)
    this._compile(objRule,objStylesheet,true);

    //finish profiling the stylesheet array (closing tags, result prefix exlusions, and target namespace declarations)
    objStylesheet.push('</xsl:stylesheet>');
    var objExclusions = [], objTargets = [];
    for (var p in this._compiler_ns) {
//jsx3.log(this._compiler_ns[p] + ":" + p);
      objExclusions.push(this._compiler_ns[p]);
      objTargets.push('xmlns:' + this._compiler_ns[p] + '="' + p + '"');
    }
    objStylesheet[1] += (objTargets.join(" ") + ' exclude-result-prefixes="' + objExclusions.join(" ") + '" >');

    //convert the array to an XSLT document
    var strXSLT = objStylesheet.join("\n");
    var objDocument = new jsx3.xml.Document();
    objDocument.loadXML(strXSLT);
    if (objDocument.hasError()) {
      Service._log(2,"The XSLT could not be compiled from the CXF source document:\n\t" + objDocument.getError());
      return null;
    } else {
      this._compiled = objDocument;
    }

/* @JSC :: begin BENCH */
    t1.log("compile");
/* @JSC :: end */
    return objDocument;
  };

  /**
   * Recursive function that creates an XSL template object for every encountered node in the CXF source document
   * @param objRuleNode {jsx3.xml.Entity}
   * @param objStylesheet {Array}
   * @param bRoot {Boolean} if true, this is the first iteration, create a global entry template, not a modal template
   * @private
   */
  Service_prototype._compile = function(objRuleNode,objStylesheet,bRoot) {
    //first register the namespace for this rule
    var objNS = this._registerCompilerNamespace(objRuleNode);
    var strNodeName, strJsxId;

    //create the outer template
    if (bRoot) {
      //this is the root entry template for the stylesheet
      objStylesheet.push('<xsl:template match="/">');
    } else {
      //this is a rule-specific template (modal)
      //var strPrefix = (objNS) ? (objNS.prefix + ":") : "";
      strNodeName = objRuleNode.getAttribute("jsxtext");
      if (objRuleNode.getAttribute("type") == "A") strNodeName = "@" + strNodeName;
      strJsxId = objRuleNode.getAttribute("jsxid");
      objStylesheet.push('<xsl:template match="*|@*" mode="x' + strJsxId + '">');
    }

    //create the CDF-specific nodes (record, data, and attributes)
    var objMappings = objRuleNode.selectNodes("mappings/record[@name='CDF Document' or @name='CDF Record' or @name='CDF Attribute']");
    var nestedArray = [], i;
    for (i=objMappings.iterator(); i.hasNext(); ) {
      var objMapping = i.next();
      var strType = objMapping.getAttribute("name");
      var strValue = objMapping.getAttribute("value");
      if (strType == "CDF Document") {
        objStylesheet.push('<data jsxid="jsxroot">');
        nestedArray.push('</data>');
      } else if (strType == "CDF Record") {
        objStylesheet.push('<record jsxid="{generate-id()}">');
        nestedArray.push('</record>');
      } else {
        objStylesheet.push('<xsl:attribute name="' + strValue + '"><xsl:value-of select="."/></xsl:attribute>');
      }
    }

    //generate the apply-template callouts to call the templates for the direct children
    var objChildRules = objRuleNode.selectNodes("record"), objChildRule;
    for (i=objChildRules.iterator(); i.hasNext(); ) {
      objChildRule = i.next();

      //if the current rule is really just a pointer pointing to the named rule to actually use, switch here
      var strSelectorName;
      var strXID = objChildRule.selectSingleNode("mappings/record[@name='CDF Record' and @value and not(@value='')]/@value");
      if (strXID) {
        var tempRULENODE = objChildRule.selectSingleNode("//record[@jsxid='" + strXID.getValue() + "']");
        if(tempRULENODE != null) {
          strSelectorName = objChildRule.getAttribute("jsxtext");
          objChildRule = tempRULENODE;
        }
     }

      var childNS = this._registerCompilerNamespace(objChildRule);
      var strPrefix = (childNS) ? (childNS.prefix + ":") : "";
      if (bRoot) strPrefix = "//" + strPrefix;
      strNodeName = strSelectorName || objChildRule.getAttribute("jsxtext");
      if (objChildRule.getAttribute("type") == "A") strNodeName = "@" + strNodeName;
      strJsxId = objChildRule.getAttribute("jsxid");
      objStylesheet.push('<xsl:apply-templates select="' + strPrefix + strNodeName + '" mode="x' + strJsxId + '"/>');
    }

    //close out record and data nodes if any were created (these wrap the apply-templates)
    for (i=nestedArray.length-1;i>=0;i--)
      objStylesheet.push(nestedArray[i]);

    //close out the template
    objStylesheet.push('</xsl:template>');

    //recurse to create descendant templates
    objChildRules = objRuleNode.selectNodes("record[not(mappings/record[@name='CDF Record' and @value and not(@value='')])]");
    for (i=objChildRules.iterator(); i.hasNext(); ) {
      objChildRule = i.next();
      this._compile(objChildRule,objStylesheet);
    }
  };

  /**
   * Resets the compiler
   * @private
   */
  Service_prototype._resetCompiler = function() {
    this._compiled = null;
    this._compiler_ns = {};
    this._compiler_ns_sequence = 0;
  };

  /**
   * Creates the namespace registry (listing of all unique tns (targetnamespace) fields encountered during the compile process)
   * @private
   * @jsxobf-clobber
   */
  Service_prototype._registerCompilerNamespace = function(objRuleNode) {
    //is this a valid target namespace?
    var strTNS = objRuleNode.getAttribute("tns");
    if (strTNS == Service._ns["xml"]) {
      return;
      //this._compiler_ns[strTNS] = "xml";
      //return {prefix:"xml",namespace:strTNS};
    } else if (strTNS && (strTNS = jsx3.util.strTrim(String(strTNS))) != "") {
      if (!this._compiler_ns[strTNS]) {
        this._compiler_ns_sequence += 1;
        this._compiler_ns[strTNS] = "jsx" + this._compiler_ns_sequence;
      }
      return {prefix:"jsx" + this._compiler_ns_sequence,namespace:strTNS};
    }
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to getOperationName.
 * @jsxdoc-definition  Service.prototype.getOperation = function(){}
 */
jsx3.net.Service.prototype.getOperation = jsx3.net.Service.prototype.getOperationName;

/**
 * @deprecated  Renamed to setOperationName.
 * @jsxdoc-definition  Service.prototype.setOperation = function(){}
 */
jsx3.net.Service.prototype.setOperation = jsx3.net.Service.prototype.setOperationName;

/**
 * @deprecated  Renamed to getOutboundStubURL.
 * @jsxdoc-definition  Service.prototype.getStubURL = function(){}
 */
jsx3.net.Service.prototype.getStubURL = jsx3.net.Service.prototype.getOutboundStubURL;

/**
 * @deprecated  Renamed to setOutboundStubURL.
 * @jsxdoc-definition  Service.prototype.setStubURL = function(){}
 */
jsx3.net.Service.prototype.setStubURL = jsx3.net.Service.prototype.setOutboundStubURL;

/**
 * @deprecated  Renamed to setRequestHeader.
 * @jsxdoc-definition  Service.prototype.addHeader = function(){}
 */
jsx3.net.Service.prototype.addHeader = jsx3.net.Service.prototype.setRequestHeader;

/**
 * @deprecated  Renamed to setEndpointURL.
 * @jsxdoc-definition  Service.prototype.setServiceURL = function(){}
 */
jsx3.net.Service.prototype.setServiceURL = jsx3.net.Service.prototype.setEndpointURL;

/**
 * @deprecated  Renamed to jsx3.net.Service
 * @see jsx3.net.Service
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.Service", -, null, function(){});
 */
 jsx3.Service = jsx3.net.Service;

/* @JSC :: end */
