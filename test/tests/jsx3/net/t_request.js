/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.net.Request", function(t, jsunit) {

  jsunit.require("jsx3.net.Request", "jsx3.xml.Document");

  t.testGetXml = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();

    var x = r.getResponseXML();
    jsunit.assertNotNullOrUndef(x);
    jsunit.assertInstanceOf(x, jsx3.xml.Document);
    jsunit.assertEquals("jsxroot", x.getAttribute("jsxid"));
  };

  t.testGetXmlFromText = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.txt"));
    r.send();
    jsunit.assertNull(r.getResponseXML());
  };

  t.testGetText = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.txt"));
    r.send();

    var text = r.getResponseText();
    jsunit.assertNotNullOrUndef(text);
    jsunit.assertTypeOf(text, "string");
    jsunit.assertMatches(/^File data\.[\r\n]+$/, text);
  };

  t.testGetTextFromXml = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();

    var text = r.getResponseText();
    jsunit.assertNotNullOrUndef(text);
    jsunit.assertTypeOf(text, "string");
    jsunit.assertMatches(/^<data jsxid="jsxroot">[\r\n]+ +<record a1="v1"\/>[\r\n]+<\/data>[\r\n]+$/, text);
  };

  t.testStatusOk = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    jsunit.assertEquals(jsx3.net.Request.STATUS_OK, r.getStatus());
  };

  t.testStatusFail = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req__.xml"));
    r.send();
    jsunit.assertTrue(r.getStatus() >= 400 && r.getStatus() < 500);
  };

  t.testStatusText = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();

    var s = r.getStatusText();
    jsunit.assertTypeOf(s, "string");
  };

  t.testAsync1 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"), true);

    var responded = false;

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function(objEvent) {
      responded = true;
    });

    r.send();

    jsunit.assertFalse(responded); // async request should be async even on local file system
  };

  t.testAsync2 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"), true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertInstanceOf(objEvent.target, jsx3.net.Request);
      jsunit.assertEquals(r, objEvent.target);

      var x = r.getResponseXML();
      jsunit.assertEquals("jsxroot", x.getAttribute("jsxid"));
    }));

    r.send();
  };
  t.testAsync2._async = true;

  /**
   * Test that a synchronous request doesn't cause async requests to return synchronously. Some application code
   * depends on this behavior. 
   */
  t.testSyncAsync = function() {
    var r1 = new jsx3.net.Request();
    var asyncReturned = false;
    r1.open("GET", t.resolveURI("data/rule1.xml"), true);

    r1.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function(objEvent) {
      asyncReturned = true;
    });
    r1.send();

    var r2 = new jsx3.net.Request();
    r2.open("GET", t.resolveURI("data/rule2.xml"), false);
    r2.send();
    jsunit.assertFalse(asyncReturned);
  };

  t.testAsyncFail1 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req__.xml"), true);

    var responded = false;

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function(objEvent) {
      responded = true;
    });

    r.send();

    jsunit.assertFalse(responded); // async request should be async even on local file system
  };

  // NOTE: Fails on Safari, http://bugs.webkit.org/show_bug.cgi?id=12307
  t.testAsyncFail2 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req__.xml"), true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertEquals(r, objEvent.target);
      var status = objEvent.target.getStatus();
      jsunit.assert("Bad status: " + status, status >= 400 && status < 500);
    }));

    r.send();
  };
  t.testAsyncFail2._async = true;
  t.testAsyncFail2._skip = "SAF";

  t.testRemoteXml = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/data1.xml");
    r.send();

    var x = r.getResponseXML();
    jsunit.assertNotNullOrUndef(x);
    jsunit.assertInstanceOf(x, jsx3.xml.Document);
    jsunit.assertEquals("data", x.getNodeName());
  };
  t.testRemoteXml._skip_unless = "NETWORK";

  t.testRemoteText = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/text1.txt");
    r.send();

    var text = r.getResponseText();
    jsunit.assertNotNullOrUndef(text);
    jsunit.assertTypeOf(text, "string");
    jsunit.assertMatches(/^File data\.[\r\n]+$/, text);
  };
  t.testRemoteText._skip_unless = "NETWORK";

  t.testRemote404 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/404.xml");
    r.send();

    var s = r.getStatus();
    jsunit.assertTrue("Bad status for 404 test: " + s, s >= 400 && s < 500);
  };
  t.testRemote404._skip_unless = "NETWORK";

  t.testRemoteAsync = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/data1.xml", true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertInstanceOf(objEvent.target, jsx3.net.Request);
      jsunit.assertEquals(r, objEvent.target);

      var x = r.getResponseXML();
      jsunit.assertEquals("data", x.getNodeName());
    }));

    r.send();
  };
  t.testRemoteAsync._async = true;
  t.testRemoteAsync._skip_unless = "NETWORK";

  t.testRemoteAsync404 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/404.xml", true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertInstanceOf(objEvent.target, jsx3.net.Request);
      jsunit.assertEquals(r, objEvent.target);

      var s = r.getStatus();
      jsunit.assertTrue("Bad status for 404 test: " + s, s >= 400 && s < 500);
//      jsunit.assertNull(r.getResponseXML());  web site now set to show error page
    }));

    r.send();
  };
  t.testRemoteAsync404._async = true;
  t.testRemoteAsync404._skip_unless = "NETWORK";

  t.testResponseHeader = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/data1.xml");
    r.send();

    var h1 = r.getResponseHeader("Content-Type");
    jsunit.assertTypeOf(h1, "string");
    jsunit.assertTrue(h1.indexOf("xml") >= 0);

    var h2 = r.getResponseHeader("Last-Modified");
    if (h2) { // Chrome in Selenium grid doesn't get this header due to the proxy
      jsunit.assertTypeOf(h2, "string");
      var d = new Date(h2);
      jsunit.assertTrue(d.getFullYear() >= 2007);
    }
    
    var h3 = r.getResponseHeader("XXX-Not-Provided");
    jsunit.assertTrue(h3 == null || h3 === "");
  };
  t.testResponseHeader._skip_unless = "NETWORK";

  t.testAllResponseHeaders = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/data1.xml");
    r.send();

    var headers = r.getAllResponseHeaders();
    jsunit.assertTypeOf(headers, "string");

    jsunit.assertMatches(/\bContent\-Type:/, headers);
    jsunit.assertMatches(/\bContent\-Length:/, headers);
  };
  t.testAllResponseHeaders._skip_unless = "NETWORK";

  t.testAllResponseHeadersLocal = function() {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();

    var headers = r.getAllResponseHeaders();
    jsunit.assertTrue(headers == null || headers === "");
  };
  t.testAllResponseHeadersLocal._skip_unless = "FILE_SCHEME";

  t.testTimeoutAsync = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/timeout.cgi", true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("Timed-out request should not fire a response: " + r, false);
    }));

    r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, t.asyncCallback(function(objEvent) {
      var s = r.getStatus();
      jsunit.assertTrue("Bad status for asynchronous timeout: " + s, s == 408);
    }));

    r.send(null, 100);
  };
  t.testTimeoutAsync._async = true;
  t.testTimeoutAsync._skip_unless = "NETWORK";

  t.testAbort = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/timeout.cgi", true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("Aborted request should not fire a response: " + r, false);
    }));

    r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, t.asyncCallback(function(objEvent) {
      jsunit.assert("Aborted request should not timeout: " + r, false);
    }));

    r.send(null, 2000);

    var onDone = t.asyncCallback(function() {
	 jsunit.debug("onDoneAbort + " + r.getStatus());
	 });

    window.setTimeout(function() {
      r.abort();
      jsunit.debug("status = " + r.getStatus() );
    }, 1000);
    window.setTimeout(function() {
      onDone();
    }, 3000);
  };
  t.testAbort._async = true;
  t.testAbort._skip_unless = "NETWORK";

  
  t.testNetworkError = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/timeout.cgi", true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("abort script do not trigger response: " + r, true);
	  }));

    r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, t.asyncCallback(function(objEvent) {
      jsunit.assert("Crash script will trigger response before timeout: " + r, false);
    }));

	r.send(null, 2500);
	  
    var onDone = t.asyncCallback(function() {
	 jsunit.debug("onDoneAbort + " + r.getStatus());
	 });

    window.setTimeout(function() {
      r.getNative().abort();
	  //r.getAllResponseHeaders();
	  jsunit.debug("13030 --> " + r.getStatus() + " status text =" + r.getStatusText() ); 
      jsunit.assertEquals(13030, r.getStatus());
      jsunit.assertNull(r.getAllResponseHeaders());
      jsunit.assertNull(r.getResponseHeader("Date"));
      jsunit.assertNull(r.getStatusText());
    }, 700);
    window.setTimeout(function() {
      onDone();
    }, 1500);

  };
  t.testNetworkError._async = true;
  t.testNetworkError._skip_unless = "NETWORK";

  t.testRequestHeader = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()));
    r.setRequestHeader("jsxheader1", "jsxvalue1");
    r.send();

    var d = r.getResponseXML();
    jsunit.assertNotNullOrUndef("Null XML response, text was: " + r.getResponseText(), d);
    jsunit.assertInstanceOf(d, jsx3.xml.Document);

    var rec = d.selectSingleNode("//record[@jsxid='HTTP_JSXHEADER1']");
    jsunit.assertNotNullOrUndef(rec);
    jsunit.assertEquals("jsxvalue1", rec.getValue());
  };
  t.testRequestHeader._skip_unless = "NETWORK";

  t.testAuth = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/auth/data1.xml", false, "gi", "gi");
    r.send();

    jsunit.assertEquals(200, r.getStatus());
    var x = r.getResponseXML();
    jsunit.assertNotNullOrUndef(x);
    jsunit.assertInstanceOf(x, jsx3.xml.Document);
    jsunit.assertEquals("data", x.getNodeName());
  };
  t.testAuth._skip_unless = "NETWORK";

  // NOTE: fails on Safari http://bugs.webkit.org/show_bug.cgi?id=13075
  t.testAuthFail1 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/auth2/data2.xml", false);
    r.send();
    jsunit.assertEquals(401, r.getStatus());
  };
  t.testAuthFail1._skip = "NOINTERACTIVE NONETWORK";

  t.testAuthFail2 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/auth2/data3.xml", false, "gi", "wrong");
    r.send();
    jsunit.assertEquals(401, r.getStatus());
  };
  t.testAuthFail2._skip = "NOINTERACTIVE NONETWORK";

  // NOTE: fails on Safari http://bugs.webkit.org/show_bug.cgi?id=13075
  t.testAuthAsync = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/auth/data4.xml", true, "gi", "gi");

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertEquals(200, r.getStatus());
      var x = r.getResponseXML();
      jsunit.assertNotNullOrUndef(x);
      jsunit.assertInstanceOf(x, jsx3.xml.Document);
      jsunit.assertEquals("data", x.getNodeName());
    }));

    r.send();
  };
  t.testAuthAsync._async = true;

  t.testAuthAsyncFail1 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/auth2/data5.xml", true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertEquals(401, r.getStatus());
    }));

    r.send();
  };
  t.testAuthAsyncFail1._async = true;
  t.testAuthAsyncFail1._skip = "NOINTERACTIVE NONETWORK";

  t.testAuthAsyncFail2 = function() {
    var r = new jsx3.net.Request();
    r.open("GET", jsunit.HTTP_BASE + "/auth2/data6.xml", true, "gi", "wrong");

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assertEquals(401, r.getStatus());
    }));

    r.send();
  };
  t.testAuthAsyncFail2._async = true;
  t.testAuthAsyncFail2._skip = "NOINTERACTIVE NONETWORK";

  t.testSendData = function() {
    var r = new jsx3.net.Request();
    var data = "<request><stuff/></request>";
    r.open("POST", jsunit.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()), false);
    r.send(data);

    var x = r.getResponseXML();

    jsunit.assertNotNullOrUndef("Null XML response, text was: " + r.getResponseText(), x);
    var cl = x.selectSingleNode("//record[@jsxid='CONTENT_LENGTH']");
    jsunit.assertNotNullOrUndef(cl);
    jsunit.assertEquals(data.length, parseInt(cl.getValue()));

    var pd = x.selectSingleNode("//postdata");
    jsunit.assertNotNullOrUndef(pd);
    jsunit.assertEquals(data, pd.getValue());
  };
  t.testSendData._skip_unless = "NETWORK";

  t.testSendDataAsync = function() {
    var r = new jsx3.net.Request();
    var data = "<request><stuff/></request>";
    r.open("POST", jsunit.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()), true);

    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      var x = r.getResponseXML();

      jsunit.assertNotNullOrUndef("Null XML response, text was: " + r.getResponseText(), x);
      var cl = x.selectSingleNode("//record[@jsxid='CONTENT_LENGTH']");
      jsunit.assertNotNullOrUndef(cl);
      jsunit.assertEquals(data.length, parseInt(cl.getValue()));

      var pd = x.selectSingleNode("//postdata");
      jsunit.assertNotNullOrUndef(pd);
      jsunit.assertEquals(data, pd.getValue());
    }));

    r.send(data);
  };
  t.testSendDataAsync._async = true;
  t.testSendDataAsync._skip_unless = "NETWORK";

});
