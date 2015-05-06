/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _LOG

/**
 * This class is used in conjunction with the XML Mapping Utility. It provides the logic necessary to use the step-through test interface for generating XML messages, contacting to remote services, and processing/mapping the XML response.
 */
jsx3.Class.defineClass("jsx3.ide.mapper.ServiceTest", jsx3.gui.Block, null, function(ServiceTest, ServiceTest_prototype) {

  /**
   * Instance initializer
   * @return {jsx3.ide.mapper.ServiceTest}
   */
  ServiceTest_prototype.init = function() {
    //call constructor for super class just in case a global mod needs to be communicated on down from the top-most jsx class, inheritance
    this.jsxsuper();
  };

  /**
   * Sets an ID for the owning mapper (the one that owns this ServiceTest instance) and lists all operations. Call when first loaded to get the tester started
   * @param strId {String} JSX Id for the mapper instance that owns this service test instance
   */
  ServiceTest_prototype.initialize = function(strId) {
    this.mapperid = strId;
    this.listOperations();
  };

  /**
   * Gets the owning mapper (the one that owns this ServiceTest instance)
   * @param objJSX {jsx3.gui.Model} if present locate the mapper that is owned by the common server common to objJSX
   * @return {jsx3.ide.mapper.Mapper}
   */
  ServiceTest_prototype.getMapper = function(objJSX) {
    var oServer = (objJSX != null) ? objJSX.getServer() : this.getServer();
    if(oServer == null)
      oServer = jsx3.IDE;
    //change in 3.6:  don't resolve the mapper via an associated instance ID.  It's static, so just get the single object
    return oServer.getRootBlock().getDescendantsOfType(jsx3.ide.mapper.Mapper)[0];
  };

  /**
   * Gets the SelectBox that lists the available operations
   * @return {jsx3.gui.Select}
   */
  ServiceTest_prototype.getOperationList = function() {
    return this.getDescendantOfName("jsx_schema_oplist");
  };

  /**
   * Gets the jsxid (not the opname) for the active operation. This is the unique CDF id for the given operation in the CXF rules tree
   * @return {String}
   */
  ServiceTest_prototype.getOperationName = function() {
    return this.getOperationList().getValue();
  };

  /**
   * Gets the bound jsx3.net.Service instance used as the engine for the tester. Makes sure the Service instance has the correct rules tree and operation reference
   * @return {String}
   */
  ServiceTest_prototype.getService = function() {
    if (this.service == null) {
      jsx3.require("jsx3.net.Service");
      var oService = new jsx3.net.Service();
      oService.setOperationName(this.getOperationName());
      oService.setRulesXML(this.getMapper().getRulesXML());
      oService.setNamespace(jsx3.ide.SERVER.getEnv('namespace'));
      oService.subscribe(jsx3.net.Service.ON_PROCESS_RULE,this,"_onProcessRule");
      this.service = oService;
    }
    return this.service;
  };

  /**
   * Handles events published by the bound jsx3.net.Service instance and routes the event to the parent Mapper's log
   * @param objEvent {Object} event dispatcher object
   * @return {String}
   * @private
   */
  ServiceTest_prototype._onProcessRule = function(objEvent) {
    jsx3.ide.mapper.Mapper._LOG.log(objEvent.level,"ServiceTest  [" + objEvent.action + "] " + objEvent.description,{instance:this.getMapper()});
  };

  /**
   * Removes the bound jsx3.net.Service instance used as the engine for the tester
   * @return {String}
   */
  ServiceTest_prototype.resetService = function() {
    if (this.service) {
      this.service.setOutboundDocument();
      this.service.setInboundDocument();
      this.service.resetRulesTree();
      delete this.service;
    }
  };

  /**
   * Gets a new request
   */
  ServiceTest_prototype.getRequest = function(strMethod, strURL, bAsync, strUser, strPass) {
    return this._request = jsx3.net.Request.open(strMethod, strURL, bAsync, strUser, strPass);
  };

  /**
   * Cancels any open request
   */
  ServiceTest_prototype.resetRequest = function() {
    if (this._request) {
      this._request.abort();
      this._request = null;
    }
  };

  /**
   * Called when the tester is being reactivated (mousedown on the containing dialog)
   * @since 3.5.1.01
   */
  ServiceTest_prototype.onRestore = function() {
    //3.5.1HF01:  added method to reset the tester when it is made active so that the tester does not use stale data
    var objMapper = this.getMapper();
    if(objMapper && objMapper.getEditor().getDirty())
      objMapper.writeMappings(true);
    this.reset(true);
  };

  /**
   * Called when the rest button is clicked. Cancels any active test
   * @param bFocus {Boolean} if true, the reset is due to the tester being reactivated
   */
  ServiceTest_prototype.reset = function(bFocus) {
    //clear the select box that lists all operations detailed by CXF source
    var curValue = (bFocus) ? this.getOperationList().getValue() : null;
    if (this.timeoutid) window.clearTimeout(this.timeoutid);
    this.resetService();
    this.resetRequest();
    this.listOperations();
    this.getOperationList().setValue(curValue);
    this.select();
  };

  /**
   * Updates the jsxshallowfrom property on the SelectBox, to point to the correct list of operations to test
   * @private
   */
  ServiceTest_prototype.listOperations = function() {
    var objSel = this.getOperationList();
    var objMap = this.getMapper();

    var objXML = objMap.getRulesXML();
    if (objXML) {
      var objRoot = objXML.selectSingleNode("//record[@type='S'] | /data/record/[@type='T']");
      if (objRoot == null) objRoot = objXML.getRootNode();
      if (objRoot == null) {
        jsx3.util.Logger("MapTester","No valid CXF source document (an empty rules tree).",9);
      } else {
        objSel.clearXmlData(false);
        objSel.setValue();
        var objNodes = objXML.selectNodes("//record[@type='S']/record | /data/record[@type='T']");
        for (var i=objNodes.iterator(); i.hasNext(); ) {
          var objNode = i.next();
          objSel.insertRecord({jsxid:objNode.getAttribute("opname"),jsxtext:objNode.getAttribute("jsxtext")},null,false);
        }
        objSel.repaint();
      }
    }
  };

  /**
   * Updates the two lists that show the outbound/inbound rules to correspond to a newly selected operation, a newly added rule, etc.
   */
  ServiceTest_prototype.listRules = function() {
    //only load the lists with rules if both are present (they load asynchronously, so this ensures no double-load)
    var objLists = this.getDescendantsOfType(jsx3.gui.Matrix);
    if (objLists && objLists.length > 1) {
      this.listRule(objLists[0],"I");
      this.listRule(objLists[1],"O");
    }
  };

  /**
   * Lists all rules associated with the selected operation in the soap debugger utility; allows a good snapshot of the bindings that occur during execution
   * @param objList {jsx3.gui.Matrix} List instance to populate with rules (either inbound or outbound rules)
   * @param TYPE {String} one of: I, O
   * @return {String} jsxid property
   */
  ServiceTest_prototype.listRule = function(objList,TYPE) {
    var objXML = this.getMapper().getRulesXML();
    var objOperationNode = objXML.selectSingleNode("//record[@opname='" + this.getOperationName() + "']");

    //remove existing data
    objList.clearXmlData(false);

    //check if any operation has been selected within the tester
    if (objOperationNode) {
      var objRuleNodes = objOperationNode.selectNodes("record[@type='" + TYPE + "']//mappings/record");

      //loop to insert these rules into the listview
      for (var i=objRuleNodes.iterator(); i.hasNext(); ) {
        var objRuleNode = i.next();
        var o = {};
        o.jsxid = objRuleNode.getAttribute("jsxid");
        o.rulename = objRuleNode.getParent().getParent().getAttribute("jsxtext");
        o.serverns = objRuleNode.getAttribute("serverns");
        o.name = objRuleNode.getAttribute("name");
        o.value = objRuleNode.getAttribute("value");
        objList.insertRecord(o,null,false);
      }
    }

    //update the view and exit early
    objList.repaintData();
  };

  /**
   * Called when an operation is selected. Populates all form fields with any info from the rules file
   */
  ServiceTest_prototype.select = function() {
    //stop any open request
    this.resetRequest();
    this.resetService();

    //is this a reset or a change??
    var bActive = this.getOperationName() != null;
    if (bActive) var oService = this.getService();

    //reset fields in the tester (prepopulate if an operation has been selected)
    var o;
    if ((o = this.getDescendantOfName("jsx_schema_wsdlurl_outbound_filter")) != null) o.setValue((bActive && oService.getMEPNode("I")) ? oService.getMEPNode("I").getAttribute("onbeforesend") : "")
    if ((o = this.getDescendantOfName("jsx_schema_wsdlurl_inbound_filter")) != null) o.setValue((bActive && oService.getMEPNode("O")) ? oService.getMEPNode("O").getAttribute("onafterreceive") : "")
    if ((o = this.getDescendantOfName("jsx_schema_outbound_url")) != null) o.setValue((bActive) ? oService.getEndpointURL() : "");
    if ((o = this.getDescendantOfName("jsx_schema_headers")) != null) o.setValue((bActive) ? this.getHeaders() : "");

    if ((o = this.getDescendantOfName("jsx_schema_envelope")) != null) o.setValue("");
    if ((o = this.getDescendantOfName("jsx_schema_headers_response")) != null) o.setValue("");
    if ((o = this.getDescendantOfName("jsx_schema_envelope_response")) != null) o.setValue("");
    if ((o = this.getDescendantOfName("jsx_schema_username")) != null) o.setValue("");
    if ((o = this.getDescendantOfName("jsx_schema_userpass")) != null) o.setValue("");
    var METHOD;
    if ((o = this.getDescendantOfName("jsx_schema_method")) != null) o.setValue((bActive) ? ((METHOD = oService.getOperationNode().getAttribute("method")) != null) ? METHOD : "POST" : "POST");

    //display all known rules for the current operation (inpput or fault/output)
    this.listRules();

    //enable/disable based on whether an op has been selected to be tested
    if ((o = this.getDescendantOfName("jsx_schema_test_execute")) != null) o.setEnabled(((bActive)?1:0),true);
    if ((o = this.getDescendantOfName("jsx_schema_play_1")) != null) o.setEnabled(0,true);
    if ((o = this.getDescendantOfName("jsx_schema_play_2")) != null) o.setEnabled(0,true);
    if ((o = this.getDescendantOfName("jsx_schema_play_3")) != null) o.setEnabled(((bActive)?1:0),true);
    if ((o = this.getDescendantOfName("jsx_schema_play_4")) != null) o.setEnabled(0,true);

    //turn off all greens
    if ((o = this.getDescendantOfName("jsx_schema_label_0")) != null) o.setBackgroundColor("",true);
    if ((o = this.getDescendantOfName("jsx_schema_label_1")) != null) o.setBackgroundColor("",true);
    if ((o = this.getDescendantOfName("jsx_schema_label_2")) != null) o.setBackgroundColor("",true);
    if ((o = this.getDescendantOfName("jsx_schema_label_3")) != null) o.setBackgroundColor("",true);
    if ((o = this.getDescendantOfName("jsx_schema_label_4")) != null) o.setBackgroundColor("",true);
    if ((o = this.getDescendantOfName("jsx_schema_label_5")) != null) o.setBackgroundColor("",true);

    //bring the first tab to the forefront
    if ((o = this.getDescendantOfName("jsx_schema_taboutboundmapping")) != null) o.doExecute();
  };

  /**
   * Gets the HTTP headers, delimiting with the default (=)
   * @private
   */
  ServiceTest_prototype.getHeaders = function() {
    var oHeaders = this.getMapper().getRulesXML().selectNodes("//record[@opname='" + this.getOperationName() + "']/headers/record");
    var str = "";
    for (var i=oHeaders.iterator(); i.hasNext(); ) {
      var oHeader = i.next();
      str+= "=" + oHeader.getAttribute("name") + "=" + oHeader.getAttribute("value") + "\n";
    }
    return str;
  };

  /**
   * Step 1) Begins a new test. Also cancels any running test
   */
  ServiceTest_prototype.start = function() {
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest----------------begin test]",{instance:this.getMapper()});
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -cancelling existing test connections",{instance:this.getMapper()});

    //stop any open request (this can occur when the user restarts a running test)
    if (this.timeoutid) window.clearTimeout(this.timeoutid);
    this.resetRequest();
    this.resetService();

    //call first step in the soap tester process
    this.mapAndCreate();
  };

  /**
   * Step 2) Executes the outbound mapping rules to create the outbound XML request document for the selected operation
   */
  ServiceTest_prototype.mapAndCreate = function() {
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -creating request document",{instance:this.getMapper()});

    //highlight the active section in the step-through process; make sure the first tab is active
    this.getDescendantOfName("jsx_schema_label_0").setBackgroundColor("#a0e05f",true);
    this.getDescendantOfName("jsx_schema_taboutboundmapping").doExecute();

    //get the service instance
    var oService = this.getService();
    var objMessage = oService.getServiceMessage();

    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -persisting request document",{instance:this.getMapper()});
    //add the xml directly to the jsx3.net.Service instance, so the user can access it via code
    oService.setOutboundDocument(objMessage);

    //highlight the active section in the step-through process
    this.getDescendantOfName("jsx_schema_label_0").setBackgroundColor("",true);
    this.getDescendantOfName("jsx_schema_label_1").setBackgroundColor("#a0e05f",true);

    //automatically call next step in process for the user if pause button not selected
    if (this.getDescendantOfName("jsx_schema_pause_1").getState() == 0) {
      var my = this;
      this.timeoutid = window.setTimeout(function(){my.outboundFilter();},1000);
    } else {
      //re-enable the resume/play button, so user can resume play when ready
      this.getDescendantOfName("jsx_schema_play_1").setEnabled(1,true);
    }
  };

  /**
   * Step 3) Executes any 'onbeforesend' code for the operation
   */
  ServiceTest_prototype.outboundFilter = function() {
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -executing outbound filter code",{instance:this.getMapper()});

    //bring tab2 to the forefront
    this.getDescendantOfName("jsx_schema_taboutboudanchor").doExecute();

    //execute any handler code to modify the xml that was just created by the mapper
    this.getService().doOutboundFilter(this.getDescendantOfName("jsx_schema_wsdlurl_outbound_filter").getValue());

    //highlight the active section in the step-through process
    this.getDescendantOfName("jsx_schema_label_1").setBackgroundColor("",true);
    this.getDescendantOfName("jsx_schema_label_2").setBackgroundColor("#a0e05f",true);

    //assuming the user updated the xmldoc in the cache, just get it here and put to screen what they might have changed
    var objMessage = this.getService().getOutboundDocument();
    //How to ensure the encoding (if set to UTF-8) is correct
    if (objMessage) this.getDescendantOfName("jsx_schema_envelope").setValue(objMessage.serialize("1.0"));

    //automatically call next step in process for the user if pause button not selected
    if (this.getDescendantOfName("jsx_schema_pause_2").getState() == 0) {
      var my = this;
      this.timeoutid = window.setTimeout(function(){my.send();},1000);
    } else {
      //re-enable the resume/play button, so user can resume play when ready
      this.getDescendantOfName("jsx_schema_play_2").setEnabled(1,true);
    }
  };

  /**
   * Gets user name (for requests requiring HTTP authentication)
   * @private
   */
  ServiceTest_prototype.getUserName = function() {
    var strValue = jsx3.util.strTrim(this.getDescendantOfName("jsx_schema_username").getValue());
    return (strValue == "") ? null : strValue;
  };

  /**
   * Gets user password (for requests requiring HTTP authentication)
   * @private
   */
  ServiceTest_prototype.getUserPass = function() {
    var strValue = jsx3.util.strTrim(this.getDescendantOfName("jsx_schema_userpass").getValue());
    return (strValue == "") ? null : strValue;
  };

  /**
   * Step 4) Sends the message. Note: Uses all fields in panel 2 of the tester to configure a jsx3.net.HttpRequest instance to do the transport
   */
  ServiceTest_prototype.send = function() {
    //bring the third tab to the forefront here, so the user can wait for the server's response
    this.getDescendantOfName("jsx_schema_tabinboundanchor").doExecute();

    //tell user we're about to contact the server
    this.getDescendantOfName("jsx_schema_envelope_response").setValue("contacting service...");

    //highlight the active section in the step-through process
    this.getDescendantOfName("jsx_schema_label_2").setBackgroundColor("",true);
    this.getDescendantOfName("jsx_schema_label_3").setBackgroundColor("#a0e05f",true);

    //get the values entered in the config window
    var strURL = this.getDescendantOfName("jsx_schema_outbound_url").getValue();
    var strHeaders = this.getDescendantOfName("jsx_schema_headers").getValue();
    var strEnvelope = this.getDescendantOfName("jsx_schema_envelope").getValue();
    var METHOD = this.getDescendantOfName("jsx_schema_method").getValue();

    //instance a Request object to transport the SOAP message
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -opening the connection with service, '" + strURL + "'",{instance:this.getMapper()});

    //step-through tester uses xmlhttp control for transport
    if(METHOD.search(/^script$/i) == 0)
      METHOD = "GET";

    var objRequest = this.getRequest(METHOD, strURL, true, this.getUserName(), this.getUserPass());
    objRequest.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, this, "onResponse");

    //parse and add the http request headers
    var objHeaders = strHeaders.split("\n");
    for (var i=0;i<objHeaders.length;i++) {
      var strHeader = jsx3.util.strTrim(objHeaders[i]);
      if (strHeader.length > 0) {
        var strDelim = strHeader.substring(0,1);
        strHeader = strHeader.substring(1);
        var objHeader = strHeader.split(strDelim);
        if (objHeader.length==2) {
          jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -adding HTTP request header: " + objHeader[0] + ":" + objHeader[1],{instance:this.getMapper()});
          objRequest.setRequestHeader(objHeader[0],objHeader[1]);
        }
      }
    }

    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -sending request",{instance:this.getMapper()});
    //execute the socket (it will now contact the server in a separate thread)
    objRequest.send((METHOD == "POST") ? strEnvelope : null);

  };

  /**
   * Step 5) Receive the response
   */
  ServiceTest_prototype.onResponse = function(objEvent) {
    this._request = null;
    var objRequest = objEvent.target;

    //get the response values
    var strHeaders = objRequest.getAllResponseHeaders();
    var strStatus = objRequest.getStatus();
    var strXML = objRequest.getResponseText();

    //updtae common fields
    this.getDescendantOfName("jsx_schema_headers_response").setValue(strHeaders);
    this.getDescendantOfName("jsx_schema_status").setValue(strStatus);

    //output status to the log
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -receiving response (status: " + strStatus + ")",{instance:this.getMapper()});

    //output an error and halt execution only if status was non-200 AND there is no response XML. Otherwise, assume that faults are part of normal execution
    if ((strStatus + "" != "200" && strStatus + "" != "202") && strXML == "") {
      jsx3.ide.mapper.Mapper._LOG.error("ServiceTest  -call failed: " + objRequest.getStatusText(),{instance:this.getMapper()});
      //get the error message to display in lieu of the xml response
      var strMsg = "Service Error: " + objRequest.getStatusText();
      strMsg+= "\r\n\r\n(NOTE: You may still resume the step-through test by pasting a valid SOAP response within this field and clicking the 'play/resume' icon on the following tab.)";

      //show the error message in the text area for the repsonse envelope
      this.getDescendantOfName("jsx_schema_envelope_response").setValue(strMsg);

      //since this error is effectively non-recoverable, execution will stop; however, enable the 'play' button at the top of the
      //last tab in the wizard. this will allow the user to paste their own xml to simulate the server's response
      this.getDescendantOfName("jsx_schema_play_3").setEnabled(1,true);

      //highlight the active section in the step-through process
      this.getDescendantOfName("jsx_schema_label_3").setBackgroundColor("",true);
      this.getDescendantOfName("jsx_schema_label_4").setBackgroundColor("#a0e05f",true);
    } else {
      //place the xml in the cache, so the user can access it via code; also display visually
      this.getDescendantOfName("jsx_schema_envelope_response").setValue(strXML);

      //move to the final tab
      var my = this;
      this.timeoutid = window.setTimeout(function(){my.getDescendantOfName("jsx_schema_tabinboundmapping").doExecute();},1000);

      //highlight the active section in the step-through process
      this.getDescendantOfName("jsx_schema_label_3").setBackgroundColor("",true);
      this.getDescendantOfName("jsx_schema_label_4").setBackgroundColor("#a0e05f",true);

      //automatically call next step in process for the user if pause button not selected
      if (this.getDescendantOfName("jsx_schema_pause_3").getState() == 0) {
        var my = this;
        this.timeoutid = window.setTimeout(function(){my.inboundFilter();},1000);
      } else {
        //re-enable the resume/play button, so user can resume play when ready
        this.getDescendantOfName("jsx_schema_play_3").setEnabled(1,true);
      }
    }
  };

  /**
   * Step 6) Execute any onafterreceive code
   */
  ServiceTest_prototype.inboundFilter = function() {
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -executing inbound filter code", {instance:this.getMapper()});
    this.getDescendantOfName("jsx_schema_label_4").setBackgroundColor("", true);

    //parse the xml document (the inbound now showing on-screen in the response tab); persist;
    var strXML = this.getDescendantOfName("jsx_schema_envelope_response").getValue();
    var objXML;
    if (this.getService()._isJSON("O")) {
      try {
        var objJSON = jsx3.eval("var k = " + strXML + ";k;");
        if (objJSON) {
          objXML = jsx3.net.Service.JSON2XML(objJSON);
          if (!objXML) {
            //jsx3.ide.mapper.Mapper._LOG.error("ServiceTest  -call failed: " + objRequest.getStatusText(),{instance:this.getMapper()});
            jsx3.ide.LOG.warn("json couldn't be converted to XML.");
            return;
          }
        }
      } catch (e) {
        var objError = jsx3.lang.NativeError.wrap(e);
        //jsx3.ide.mapper.Mapper._LOG.error("ServiceTest  -call failed: " + objRequest.getStatusText(),{instance:this.getMapper()});
        jsx3.ide.LOG.warn(objError.getMessage());
        return;
      }
    } else {
      objXML = new jsx3.Document();
      objXML.loadXML(strXML);
    }

    var strFilter = this.getDescendantOfName("jsx_schema_wsdlurl_inbound_filter").getValue();
    if (! objXML.hasError()) {
      this.getService().setInboundDocument(objXML);

      //set the status for the service instance to reflect the http status code field in the tester; ignore invalid ranges and treat as 0 if invalid
      var strStatus = jsx3.util.strTrim(this.getDescendantOfName("jsx_schema_status").getValue());
      if (strStatus == "" || isNaN(strStatus)) strStatus = 0;
      this.getService().status = strStatus;

      //execute any handler code to modify the xml before passing off to the mapper
      this.getService().doInboundFilter(strFilter);

      //highlight the active section in the step-through process
      this.getDescendantOfName("jsx_schema_label_5").setBackgroundColor("#a0e05f", true);

      //automatically call next step in process for the user if pause button not selected
      if (this.getDescendantOfName("jsx_schema_pause_4").getState() == 0) {
        var my = this;
        this.timeoutid = window.setTimeout(function() {
          my.inboundMap();
        }, 1000);
      } else {
        //re-enable the resume/play button, so user can resume play when ready
        this.getDescendantOfName("jsx_schema_play_4").setEnabled(1, true);
      }
    } else {
      //send note that the response is not a valid XML document
      jsx3.ide.mapper.Mapper._LOG.warn(" ServiceTest  -the response cannot be mapped. format unknown.", {instance:this.getMapper()});
      this.getService().setInboundDocument(strXML);
      //execute any handler code to modify the xml before passing off to the mapper
      this.getService().doInboundFilter(strFilter);
      //set backgroundcolor back to '' and take user back to start
      this.getDescendantOfName("jsx_schema_taboutboundmapping").doExecute();

      jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest------------------end test]", {instance:this.getMapper()});
    }
  };

  /**
   * Step 7) Execute the inbound mappings to process the server response
   */
  ServiceTest_prototype.inboundMap = function(MESSAGETYPE) {
    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest  -mapping Server Response",{instance:this.getMapper()});

    //check if any operation has been selected within the soap tester
    this.getService().doInboundMap();

    //set backgroundcolor back to '' and take user back to start
    this.getDescendantOfName("jsx_schema_label_5").setBackgroundColor("",true);
    this.getDescendantOfName("jsx_schema_taboutboundmapping").doExecute();

    jsx3.ide.mapper.Mapper._LOG.trace("ServiceTest------------------end test]",{instance:this.getMapper()});
  };

  /**
   * Gets an alternate message (allows use to simulate the remote service by generting our own response messages)
   * @return {String} alternate server response
   */
  ServiceTest_prototype.getAlternateResponse = function() {
    var objNode = this.getMapper().getRulesXML().selectSingleNode("//record[@opname='" + this.getOperationName() + "']/record[@type='O']/@stubsrc");
    if (objNode != null) {
      var objDoc = new jsx3.xml.Document();
      var strURL = this.getService().getServer().resolveURI(objNode.getValue());
      objDoc.load(strURL);
      if (objDoc.getError().code != "0") {
        jsx3.ide.mapper.Mapper._LOG.error("ServiceTest  -Error parsing/locating the alternate inbound document at '" + strURL + "'. The system will instead attempt to generate a test document based upon the inbound mapping rules.\n" + objDoc.getError(),{instance:this.getMapper()});
      } else {
        var strXML = objDoc.toString();
        strXML = strXML.replace(/></g,">\r\n<");
        this.getDescendantOfName('jsx_schema_envelope_response').setValue(strXML);
        return;
      }
    }
    var strXML = this.getService().getServiceMessage("output").toString();
    strXML = strXML.replace(/></g,">\r\n<");
    this.getDescendantOfName('jsx_schema_envelope_response').setValue(strXML);
  };

  /**
   * Call to cleanup resources and close the dialog containing the tester
   */
  ServiceTest_prototype.close = function() {
    if (this.timeoutid) window.clearTimeout(this.timeoutid);
    this.resetService();
    this.resetRequest();
    this.getAncestorOfType(jsx3.gui.Dialog).doClose();
  };

  /**
   * Derefs self (the id) from the mapper owner when closing
   */
  ServiceTest_prototype.onDestroy = function(objParent) {
    //call standard destroy method for model (removes on-screen view if one exists)
    this.jsxsuper(objParent);

    var oMapper;
    if ((oMapper = this.getMapper(objParent)) != null) oMapper.setTesterId();
  };

});
