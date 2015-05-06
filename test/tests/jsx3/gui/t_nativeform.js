/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.gui.NativeForm", function(t, jsunit) {

  jsunit.require("jsx3.gui.NativeForm");

  var ACTION = jsunit.HTTP_BASE + "/formdata.cgi";

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
  
  var getForm = function() {
    var s = t._server = t.newServer("data/server1.xml", ".", true);
    var root = s.getBodyBlock().load("data/nativeform.xml");
    return root.getChild(0);
  };

  t.testDeserialize = function() {
    var form = getForm();
    jsunit.assertInstanceOf(form, jsx3.gui.NativeForm);
  };
  
  t.testPaint = function() {
    var form = getForm();
    jsunit.assertNotNullOrUndef(form.getRendered());
    jsunit.assertEquals("form", form.getRendered().nodeName.toLowerCase());
  };
  
  t.testSubmit = function() {
    var form = getForm();
    
    form.setAction(form.getUriResolver().relativizeURI(ACTION, true));
    form.subscribe("jsxdata", t.asyncCallback(function(objEvent) {
      jsunit.assertEquals("load", objEvent.context.type);
    }));
    form.submit();
  };
  t.testSubmit._async = true;
  
  t.testData = function() {
    var form = getForm();
    
    form.setAction(form.getUriResolver().relativizeURI(ACTION, true));
    form.subscribe("jsxdata", t.asyncCallback(function(objEvent) {
      var doc = form.getResponseXML();
      
      jsunit.assertFalse(doc.hasError());
      jsunit.assertEquals("data", doc.getNodeName());
      jsunit.assertEquals("1", doc.selectSingleNode("record[@jsxid='select']").getValue());
    }));
    form.submit();
  };
  t.testData._async = true;
  
});
