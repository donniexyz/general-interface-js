/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.net.Service", function(t, jsunit) {

  jsunit.require("jsx3.app.Server");
  jsunit.require("jsx3.net.Service");


  t._setUp = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
  };


  t._tearDown = function() {
    if (t._server) {
      if (t._server instanceof Array) {
        for (var i = 0; i < t._server.length; i++)
          t._server[i].destroy();
      } else {
        t._server.destroy();
      }
      delete t._server;
    }
  };

  t.init = function() {
    //make sure both service and its transport are initialized
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule1.xml"),"ReturnCityState");
    s.setNamespace(t._server);
    jsunit.assertInstanceOf(s.getServer(), jsx3.app.Server);
  };


  t.profile = function() {
    //ensure static data stored in the rules file is accessible
    var s = t._service;
    jsunit.assertInstanceOf(s.getServer(), jsx3.app.Server);
    jsunit.assertEquals("ReturnCityState", s.getOperation());
    jsunit.assertEquals("http://test.example.com", s.getEndpointURL());
    jsunit.assertEquals("GET", s.getMethod());
  };

  t.testGetServiceMessage = function() {
    //get the message (use a stup (soap envelope) to contain the message)
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/soap.xml"));
    var s = t._service;
    s.setOutboundStubDocument(o);
    var d = t._service.getServiceMessage("output");

    //test the message stub exists
    var b = d.selectSingleNode("//soap:Body",'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"');
    jsunit.assertNotNullOrUndef(b);
    //test that the message was appended to the correct stub location
    var n = b.selectSingleNode("jsx1:ReturnCityState",'xmlns:jsx1="http://ws.cdyne.com/"');
    jsunit.assertNotNullOrUndef(n);
    //are arrays also generated correctly if using a namespace prefix
    var a = n.selectSingleNode("@jsx1:LicenseKey",'xmlns:jsx1="http://ws.cdyne.com/"');
    jsunit.assertNotNullOrUndef(a);
    jsunit.assertEquals("attValue",a.getValue());
  };

  t.testGetServiceMessageRecurse = function() {
    //tests recursive (named templates) for generating XML (outbound message creating)
    //make sure both service and its transport are initialized
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule2.xml"), "");
    s.setNamespace(t._server);

    //add a CDF document to the cache; this will be converted to an outbound (input) message using a recursive ruleset (data/rule2.xml)
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/cdf.xml"));
    t._server.getCache().setDocument("abc_xml", o);

    //run the rule
    var d = t._service.getServiceMessage();
    jsunit.assertNotNullOrUndef(d);

    //test the generic structure
    var b = d.selectSingleNode("/dogs/dog/name");
    jsunit.assertNotNullOrUndef(b);

    //test that specific CDF structures were converted (deepest node and following sibling node)
    b = d.selectSingleNode("//dog[name='a.a.b.a.a']");
    jsunit.assertNotNullOrUndef(b);
    b = d.selectSingleNode("//dog[name='a.a.a.b']");
    jsunit.assertNotNullOrUndef(b);

    //test that all CDF structures were converted to the XML format defined in the rule (get the count)
    b = d.selectNodes("//name");
    jsunit.assertEquals(8, b.size());
  };

  t.testDoInboundMap = function() {
    //tests recursive (named templates) for creating CDF (inbound message mapping)
    //loads a sample CDF document. This will represent the server's response (arbitrary XML which happens to be CDF)
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/cdf.xml"));

    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule2.xml"), "");
    s.setNamespace(t._server);
    s.setInboundDocument(o);
    s.doInboundMap();

    //see if a new CDF document was added to the cache (def_xml)
    var d = t._server.getCache().getDocument("def_xml");
    jsunit.assertNotNullOrUndef(d);

    //test the generic structure
    var b = d.selectSingleNode("/data/record/@jsxtext");
    jsunit.assertNotNullOrUndef(b);

    //test that specific CDF structures were converted properly
    b = d.selectSingleNode("//record[@jsxtext='a.a.b.a.a']");
    jsunit.assertNotNullOrUndef(b);
    b = d.selectSingleNode("//record[@jsxtext='a.a.a.b']");
    jsunit.assertNotNullOrUndef(b);

    //test that all CDF structures were converted to the XML format defined in the rule (get the count)
    b = d.selectNodes("//record[@jsxid]");
    jsunit.assertEquals(8, b.size());
  };
  
  t.testRequestJSON = function() {
    var Service = jsx3.net.Service;
    
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/travel_map.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(jsunit.HTTP_BASE + "/webservice.php?status=200&json=true");
    s.setOperationName("");
    
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Service.ON_SUCCESS) {
        var req = objEvent.target.getRequest();
        jsunit.assertEquals(200, req.getStatus());
        jsunit.assertNotNull("Response text converts to XML doc.", s.getInboundDocument());
      } else {
        jsunit.assert("Should not receive this event from service: " + objEvent.subject, false);
      }
    }));

    s.doCall();
  };
  t.testRequestJSON._async = true;
  t.testRequestJSON._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);

  t.testRequestJSONfault = function() {
    var Service = jsx3.net.Service;
    
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/travel_map.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(jsunit.HTTP_BASE + "/webservice.php?status=503&json=true");
    s.setOperationName("");
    
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Service.ON_ERROR) {
        var req = objEvent.target.getRequest();
        jsunit.assertEquals(503, req.getStatus());
        jsunit.assertNull(s.getInboundDocument());
      } else {
        jsunit.assert("Should not receive this event from service: " + objEvent.subject, false);
      }
    }));

    s.doCall();
  };
  t.testRequestJSONfault._async = true;
  t.testRequestJSONfault._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);
  
  t.testRequestService = function() {
    var Service = jsx3.net.Service;
    
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/wsdl2rule.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(jsunit.HTTP_BASE + "/webservice.php?status=200");
    s.setOperationName("GetHistoricalQuotes");
    
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Service.ON_SUCCESS) {
        var req = objEvent.target.getRequest();
        jsunit.assertEquals(200, req.getStatus());
      } else {
        jsunit.assert("Should not receive this event from service: " + objEvent.subject, false);
      }
    }));

    s.doCall();
  };
  t.testRequestService._async = true;
  t.testRequestService._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);

  t.testRequestServiceFail = function() {
    var Service = jsx3.net.Service;
    
    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/wsdl2rule.xml"), "");
    s.setMode(1);
    s.setNamespace(t._server);
    s.setEndpointURL(jsunit.HTTP_BASE + "/webservice.php?status=500");
    s.setOperationName("GetHistoricalQuotes");
    
    s.subscribe([Service.ON_SUCCESS, Service.ON_ERROR, Service.ON_TIMEOUT, Service.ON_INVALID], t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Service.ON_ERROR) {
        var req = objEvent.target.getRequest();
        jsunit.assertEquals(500, req.getStatus());
      } else {
        t.fail("Should not receive this event from service: " + objEvent.subject);
      }
    }));

    s.doCall();
  };
  t.testRequestServiceFail._async = true;
  t.testRequestServiceFail._skip_unless = (jsunit.HTTP_BASE.indexOf("http") > 0);

  t.testDoInboundMapCompiled = function() {
    //tests recursive (named templates) for creating CDF (inbound message mapping) using XSLT (compiled mode)
    //loads a sample CDF document. This will represent the server's response (arbitrary XML which happens to be CDF)
    var o = new jsx3.xml.Document();
    o.load(t.resolveURI("data/cdf.xml"));

    //init the service and set the inbound document
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule2.xml"), "");
    s.setNamespace(t._server);
    s.setInboundDocument(o);
    s.compile();
    s.doInboundMap();

    //see if a new CDF document was added to the cache (def_xml)
    var d = t._server.getCache().getDocument("def_xml");
    jsunit.assertNotNullOrUndef(d);

    //test the generic structure
    var b = d.selectSingleNode("/data/record/@jsxtext");
    jsunit.assertNotNullOrUndef(b);

    //test that specific CDF structures were converted properly
    b = d.selectSingleNode("//record[@jsxtext='a.a.b.a.a']");
    jsunit.assertNotNullOrUndef(b);
    b = d.selectSingleNode("//record[@jsxtext='a.a.a.b']");
    jsunit.assertNotNullOrUndef(b);
    //test that all CDF structures were converted to the XML format defined in the rule (get the count)
    b = d.selectNodes("//record[@jsxid]");
    jsunit.assertEquals(8, b.size());
  };

  t.testGetServiceMessageNamespace = function() {
    //additional tests to see the accuracy of the namespaces used in the generated document.  Tests:
    //1) message with no stub (envelope)
    //2) message with namespace on the root node
    //3) message with attribute on the root node where the attribute also has a namespace
    //4) message node that belongs to the default xml namespace (reserved xml/1998)
    var s = t._service = new jsx3.net.Service(t.resolveURI("data/rule3.xml"), "");
    s.setNamespace(t._server);

    //run the rule
    var d = t._service.getServiceMessage();
    jsunit.assertNotNullOrUndef(d);

    //test root node has correct namespace
    var b = d.selectSingleNode("/abc:RDF",'xmlns:abc="http://www.w3.org/1999/02/22-rdf-syntax-ns#"');
    jsunit.assertNotNullOrUndef(b);

    //test for child attribute on the root node; make sure both namespaces resolve to appropriate declarations
    b = d.selectSingleNode("/abc:RDF/@def:schemaLocation",'xmlns:abc="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:def="http://www.w3.org/2001/XMLSchema-instance"');
    jsunit.assertNotNullOrUndef(b);

    //test for node belonging to xml namespace
    b = d.selectSingleNode("//@xml:lang");
    jsunit.assertNotNullOrUndef(b);
  };

});
