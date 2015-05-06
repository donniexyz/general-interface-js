/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.net.Request", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.Request", "jsx3.xml.Document");
  var t = new _jasmine_test.App("jsx3.net.Request");
  var ACTION = _jasmine_test.HTTP_BASE + "/formdata.cgi";

  it("has method getResponseXML() that returns a XML document for a valid XML response", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    var x = r.getResponseXML();
    expect(x).not.toBeNull();
    expect(x).not.toBeUndefined();
    expect(x).toBeInstanceOf(jsx3.xml.Document);
    expect(x.getAttribute("jsxid")).toEqual("jsxroot");
  });

  it("has method getResponseXML() that return null for invalid XML response", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.txt"));
    r.send();
    expect(r.getResponseXML()).toBeNull();
  });

  it("has method getResponseText() that gets plain text response as string", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.txt"));
    r.send();
    var text = r.getResponseText();
    expect(text).not.toBeNull();
    expect(text).not.toBeUndefined();
    expect(text).toBeTypeOf("string");
    expect(text).toMatch(/^File data\.[\r\n]+$/);
  });

  it("has method getResponseText() that gets XML text response as string", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    var text = r.getResponseText();
    expect(text).not.toBeNull();
    expect(text).not.toBeUndefined();
    expect(text).toBeTypeOf("string");
    expect(text).toMatch(/^<data jsxid="jsxroot">[\r\n]+ +<record a1="v1"\/>[\r\n]+<\/data>[\r\n]+$/);
  });

  it("has method getStatus() that gets the 200 HTTP response status code", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    expect(r.getStatus()).toEqual(jsx3.net.Request.STATUS_OK)
  });

  it("has method getStatus() that gets 404 HTTP error status code", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req__.xml"));
    r.send();
    expect(r.getStatus() >= 400 && r.getStatus() < 500).toBeTruthy();
  });

  it("has method getStatusText() that gets the HTTP status text", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"));
    r.send();
    var s = r.getStatusText();
    expect(s).toBeTypeOf("string");
  });

  it("should be able to send asynchronous request even on local file system", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req.xml"), true);
    var responded = false;
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      responded = true;
    });
    r.send();
    //should test if an async request is async even on local file system
    expect(responded).toBeFalsy();
  });

  it("should be able to load XML resource asynchronously", function () {
    var r = new jsx3.net.Request();
    var objEvent = {};
    r.open("GET", t.resolveURI("data/req.xml"), true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (evt) {
      objEvent = evt;
    });
    r.send();
    waitsFor(function () {
      return objEvent.target != null;
    }, "wait until we have a real objEvent object", 5000);
    runs(function () {
      expect(objEvent.target).toBeInstanceOf(jsx3.net.Request);
      expect(r).toEqual(objEvent.target);
      var x = r.getResponseXML();
      expect(x.getAttribute("jsxid")).toEqual("jsxroot");
    });
  });

  it("should be able to send asynchronous request after a synchronous request", function () {
    var r1 = new jsx3.net.Request();
    var asyncReturned = false;
    r1.open("GET", t.resolveURI("data/rule1.xml"), true);
    r1.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      asyncReturned = true;
    });
    r1.send();
    var r2 = new jsx3.net.Request();
    r2.open("GET", t.resolveURI("data/rule2.xml"), false);
    r2.send();
    expect(asyncReturned).toBeFalsy()
  });

  it("should fail to get response event call back for non existent resource", function () {
    var r = new jsx3.net.Request();
    r.open("GET", t.resolveURI("data/req__.xml"), true);
    var responded = false;
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
      responded = true;
    });
    r.send();
    expect(responded).toBeFalsy();
  });

  // NOTE: Fails on Safari, http://bugs.webkit.org/show_bug.cgi?id=12307
  //if (gi.test.browser != "SAF")
  it("should fail to retrieve a non-existent file, status code 4XX", function () {
    var r = new jsx3.net.Request();
    var evt = {};
    r.open("GET", t.resolveURI("data/req__.xml"), true);
    r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE
      , function (objEvent) {
        evt = objEvent;
      });
    r.send();
    waitsFor(function () {
      return evt.target == r;
    }, "wait until there's a real evt.target", 5000);
    runs(function () {
      expect(r).toEqual(evt.target);
      var status = evt.target.getStatus();
      expect(status >= 400 && status < 500).toBeTruthy()
    });
  });

  if (_jasmine_test.NETWORK)
    it("should be able to synchronously retrieve XML document remotely", function () {
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml");
      r.send();
      var x = r.getResponseXML();
      expect(x).not.toBeNull();
      expect(x).toBeInstanceOf(jsx3.xml.Document);
      expect(x.getNodeName()).toEqual("data");
    });
  //t.testRemoteXml._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should be able to synchronously retrieve plain text content remotely", function () {
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/text1.txt");
      r.send();
      var text = r.getResponseText();
      expect(text).not.toBeNull();
      expect(text).not.toBeUndefined();
      expect(text).toBeTypeOf("string");
      expect(text).toMatch(/^File data\.[\r\n]+$/);
    });
  //t.testRemoteText._skip_unless = "NETWORK";

  it("should get status error when loading a non existent 404.xml file", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/404.xml");
    r.send();
    var s = r.getStatus();
    expect(s >= 400).toBeTruthy();
    expect(s < 500).toBeTruthy();
  });
  // t.testRemote404._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should be able to load xml file asynchronously", function () {
      var r = new jsx3.net.Request();
      var evt = {};
      r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml", true);
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
        evt = objEvent;
      });
      r.send();

      waitsFor(function () {
        return evt.target == r;
      }, "wait until there's a real evt.target", 5000);

      runs(function () {
        expect(evt.target).toBeInstanceOf(jsx3.net.Request);
        expect(r).toEqual(evt.target);
        var x = r.getResponseXML();
        expect(x.getNodeName()).toEqual("data")
      });
    });
  //t.testRemoteAsync._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should get an error loading nonexistant xml file asynchronously", function () {
      var r = new jsx3.net.Request();
      var objEvent = {};
      r.open("GET", _jasmine_test.HTTP_BASE + "/404.xml", true);
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (evt) {
        objEvent = evt;
      });
      r.send();

      waitsFor(function () {
        return objEvent.target == r;
      }, "wait until there's a real objevent.target", 5000);

      runs(function () {
        expect(objEvent.target).toBeInstanceOf(jsx3.net.Request);
        expect(r).toEqual(objEvent.target);
        var s = r.getStatus();
        expect(s >= 400 && s < 500).toBeTruthy()
      });
    });
  //t.testRemoteAsync404._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("has method getResponseHeader() that gets a specific HTTP header", function () {
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml");
      r.send();
      var h1 = r.getResponseHeader("Content-Type");
      expect(h1).toBeTypeOf("string");
      expect(h1.indexOf("xml") >= 0).toBeTruthy();
      var h2 = r.getResponseHeader("Last-Modified");
      if (h2) { // Chrome in Selenium grid doesn't get this header due to the proxy
        expect(h2).toBeTypeOf("string");
        var d = new Date(h2);
        expect(d.getFullYear() >= 2007).toBeTruthy();
      }
      var h3 = r.getResponseHeader("XXX-Not-Provided");
      expect(h3 == null || h3 === "").toBeTruthy()
    });
  // t.testResponseHeader._skip_unless = "NETWORK";

  it("has method getAllResponseHeaders() that gets all HTTP headers", function () {
    var r = new jsx3.net.Request();
    r.open("GET", _jasmine_test.HTTP_BASE + "/data1.xml");
    r.send();
    var headers = r.getAllResponseHeaders();
    expect(headers).toBeTypeOf("string");
    expect(headers).toMatch(/\bContent\-Type:/);
    expect(headers).toMatch(/\bContent\-Length:/);
  });
  //t.testAllResponseHeaders._skip_unless = "NETWORK";

  if (_jasmine_test.FILE_SCHEME)
    it("should get the value of all the HTTP headers", function () {
      var r = new jsx3.net.Request();
      r.open("GET", t.resolveURI("data/req.xml"));
      r.send();
      var headers = r.getAllResponseHeaders();
      expect(headers == null || headers === "").toBeTruthy();
    });
  //t.testAllResponseHeadersLocal._skip_unless = "FILE_SCHEME";

  if (_jasmine_test.NETWORK)
    it("should be able to get timeout  event on asynchronousl request", function () {
      var r = new jsx3.net.Request();
      var evt = {}, status = null, spec = this;

      r.open("GET", _jasmine_test.HTTP_BASE + "/timeout.cgi", true);
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
        spec.fail("timeout test should not get response event" + r);
      });
      r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function (objEvent) {
        status = r.getStatus();
      });
      r.send(null, 100);

      waitsFor(function () {
        return status != null;
      }, "wait until there's a real evt.target", 5000);

      runs(function () {
        expect(status).toEqual(408)
      });
    });
  //t.testTimeoutAsync._skip_unless = "NETWORK";

  if(_jasmine_test.NETWORK)
    it("should not get response event or timeout event on request abort", function () {
      var abort = null, spec = this;
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/timeout.cgi", true);
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (evt) {
        spec.fail("Aborted request should not fire a response: " + r);
      });
      r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function (evt) {
        spec.fail("Aborted request should not timeout: " + r);
      });
      r.send(null, 2000);

      var onDone = function () {
        _jasmine_test.debug("onDoneAbort + " + r.getStatus());
      };

      runs(function () {
        window.setTimeout(function () {
          abort = "called";
          r.abort();
        }, 300);
        window.setTimeout(function () {
          onDone();
        }, 500);
      });

      waitsFor(function () {
        return abort == "called";
      }, "wait until abort is called", 750);

      runs(function () {
        expect(abort).toBe("called");
      });
    });
  //t.testAbort._async = true;
  //t.testAbort._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should be able to detect network error", function () {
      var r = new jsx3.net.Request();
      var abort = null, spec = this;

      r.open("GET", _jasmine_test.HTTP_BASE + "/timeout.cgi", true);
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
        //spec.fail("Aborted request should not fire a response: " + r);
      });
      r.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function (objEvent) {
        spec.fail("Aborted request should not timeout: " + r);
      });
      r.send(null, 2500);

      waitsFor(function () {
        return r.getStatus() != null;
      }, "wait until response event is returned", 5000);

      var onDone = function () {
        abort = "done";
        _jasmine_test.debug("network error test onDoneAbort + " + r);
      };
      runs(function () {
        window.setTimeout(function () {
          abort = "called";
          r.getNative().abort();
        }, 300);
        window.setTimeout(function () {
          onDone();
        }, 500);
      });
      waitsFor(function () {
        return abort == "called";
      }, "The Value should be incremented", 750);

      runs(function () {
        if (_jasmine_test.IE) {
          expect(r.getStatusText()).toBeNull();
          expect(r.getStatus()).toEqual(13030);
          expect(r.getAllResponseHeaders()).toBeNull();
          expect(r.getResponseHeader("Date")).toBeNull();
        } else {
          // Native abort no longer causes network error on Firefox/Webkit
          expect(r.getStatus()).toEqual(200);
          expect(r.getStatusText()).toEqual("");
        }
      });
    });
  //t.testNetworkError._async = true;
  // t.testNetworkError._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("has method setRequestHeader() that should set speicified HTTP request header", function () {
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()));
      r.setRequestHeader("jsxheader1", "jsxvalue1");
      r.send();
      var d = r.getResponseXML();
      expect(d).not.toBeNull();
      expect(d).toBeInstanceOf(jsx3.xml.Document);
      var rec = d.selectSingleNode("//record[@jsxid='HTTP_JSXHEADER1']");
      expect(rec).not.toBeNull();
      expect("jsxvalue1").toEqual(rec.getValue());
    });
  //t.testRequestHeader._skip_unless = "NETWORK";

  // TODO - sending clear text password on URL is disallowed in modern browsers, this should be deprecated
  if (_jasmine_test.NETWORK && _jasmine_test.INTERACTIVE)
    xit("should be able to send request with authentication", function () {
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/auth/data1.xml", false, "gi", "gi");
      r.send();
      expect(r.getStatus()).toEqual(200);
      var x = r.getResponseXML();
      expect(x).not.toBeNull();
      expect(x).toBeInstanceOf(jsx3.xml.Document);
      expect(x.getNodeName()).toEqual("data");
    });
  //t.testAuth._skip_unless = "NETWORK";

  // NOTE: fails on Safari http://bugs.webkit.org/show_bug.cgi?id=13075
  if (_jasmine_test.NETWORK && _jasmine_test.INTERACTIVE)
    it("should get an 401 error when authentication information is incorrect", function () {
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data2.xml", false);
      r.send();
      expect(r.getStatus()).toEqual(401);
    });
  //t.testAuthFail1._skip = "NOINTERACTIVE NONETWORK";

  if (_jasmine_test.NETWORK && _jasmine_test.INTERACTIVE)
    it("should get an 401 error when authentication information is wrong for synchronous request", function () {
      var r = new jsx3.net.Request();
      r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data3.xml", false, "gi", "wrong");
      r.send();
      expect(r.getStatus()).toEqual(401);
    });
  //t.testAuthFail2._skip = "NOINTERACTIVE NONETWORK";

  // TODO - sending clear text password on URL is disallowed in modern browsers, this should be deprecated
  // NOTE: fails on Safari http://bugs.webkit.org/show_bug.cgi?id=13075
  if (_jasmine_test.NETWORK && _jasmine_test.INTERACTIVE)
    it("should be successful when proper authentication information is provided", function () {
      var r = new jsx3.net.Request(), status;
      r.open("GET", _jasmine_test.HTTP_BASE + "/auth/data4.xml", true, "gi", "gi");
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
        status = r.getStatus();
      });
      r.send();

      waitsFor(function () {
        return status != null;
      }, "wait until we  get some response status", 750);

      runs(function () {
        expect(status).toEqual(200);
        var x = r.getResponseXML();
        expect(x).not.toBeNull();
        expect(x).toBeInstanceOf(jsx3.xml.Document);
        expect(x.getNodeName()).toEqual("data");
      });

    });
  //t.testAuthAsync._async = true;

  if (_jasmine_test.NETWORK && _jasmine_test.INTERACTIVE)
    it("should get a 401 error when no authentication information was provided for asynchronous request", function () {
      var r = new jsx3.net.Request(), status;
      r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data5.xml", true);
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
        status = r.getStatus();
      });
      r.send();

      waitsFor(function () {
        return status != null;
      }, "Wait until you get some response status", 750);

      runs(function () {
        expect(status).toEqual(401);
      });
    });
  //t.testAuthAsyncFail1._skip = "NOINTERACTIVE NONETWORK";

  if (_jasmine_test.NETWORK && _jasmine_test.INTERACTIVE)
    it("should get a 401 error when the wrong authentication information was provided for asynchronous request", function () {
      var r = new jsx3.net.Request(), status;
      r.open("GET", _jasmine_test.HTTP_BASE + "/auth2/data6.xml", true, "gi", "wrong");
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
        status = r.getStatus();
      });
      r.send();

      waitsFor(function () {
        return status != null;
      }, "Wait until you get some response status", 750);

      runs(function () {
        expect(status).toEqual(401);
      });
    });
  //t.testAuthAsyncFail2._skip = "NOINTERACTIVE NONETWORK";

  if (_jasmine_test.NETWORK)
    it("should be able to post xml content to server synchronously", function () {
      var r = new jsx3.net.Request();
      var data = "<request><stuff/></request>";

      r.open("POST", _jasmine_test.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()), false);
      r.send(data);
      var x = r.getResponseXML();
      expect(x).not.toBeNull();
      var cl = x.selectSingleNode("//record[@jsxid='CONTENT_LENGTH']");
      expect(cl).not.toBeNull();
      expect(data.length).toEqual(parseInt(cl.getValue()));
      var pd = x.selectSingleNode("//postdata");
      expect(pd).not.toBeNull();
      expect(pd.getValue()).toEquals(data);
    });
  // t.testSendData._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should be able to post xml content to server asynchronously", function () {
      var r = new jsx3.net.Request(), x = null;
      var data = "<request><stuff/></request>";

      r.open("POST", _jasmine_test.HTTP_BASE + "/headers.cgi?ts=" + (new Date().getTime()), true);
      r.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function (objEvent) {
        x = r.getResponseXML();
      });
      r.send(data);

      waitsFor(function () {
        return x != null;
      }, "Wait until you get the content of the response", 750);

      runs(function () {
        expect(x).not.toBeNull();
        var cl = x.selectSingleNode("//record[@jsxid='CONTENT_LENGTH']");
        expect(cl).not.toBeNull();
        expect(data.length).toEqual(parseInt(cl.getValue()));
        var pd = x.selectSingleNode("//postdata");
        expect(pd).not.toBeNull();
        expect(pd.getValue()).toEquals(data);
      });
    });
  //t.testSendDataAsync._skip_unless = "NETWORK";

});
