/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.net.Form", function(t, jsunit) {

  jsunit.require("jsx3.net.Form");

  var ACTION = jsunit.HTTP_BASE + "/formdata.cgi";

  t.testGetMethod = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    try {
      jsunit.assertEquals(jsx3.net.Form.METHOD_POST, f.getMethod());
    } finally {
      f.destroy();
    }
  };

  t.testGetAction = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    try {
      jsunit.assertTrue(jsx3.$S(f.getAction()).endsWith("formdata.cgi"));
    } finally {
      f.destroy();
    }
  };

  t.testGetMultipart = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, true);
    try {
      jsunit.assertTrue(f.getMultipart());
    } finally {
      f.destroy();
    }
  };

  t.testSetMethod = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, "", false);
    try {
      jsunit.assertEquals(jsx3.net.Form.METHOD_POST, f.getMethod());
      f.setMethod(jsx3.net.Form.METHOD_GET);
      jsunit.assertEquals(jsx3.net.Form.METHOD_GET, f.getMethod());
    } finally {
      f.destroy();
    }
  };

  t.testSetAction = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "#", false);
    try {
      f.setAction(ACTION);
      jsunit.assertTrue(jsx3.$S(f.getAction()).endsWith("formdata.cgi"));
    } finally {
      f.destroy();
    }
  };

  t.testSetMultipart = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      jsunit.assertFalse(f.getMultipart());
      f.setMultipart(true);
      jsunit.assertTrue(f.getMultipart());
    } finally {
      f.destroy();
    }
  };

  t.testRevealConceal = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.reveal();
      f.conceal();
    } finally {
      f.destroy();
    }
  };

  t.testGetNull = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      jsunit.assertNull(f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetSimple = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value");
      jsunit.assertEquals("value", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetOverride = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1");
      jsunit.assertEquals("value1", f.getField("field"));
      f.setField("field", "value2");
      jsunit.assertEquals("value2", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetAppend = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1", true);
      jsunit.assertEquals("value1", f.getField("field"));
      f.setField("field", "value2", true);
      jsunit.assertEquals("value1 value2", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetAppend = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1", true);
      jsunit.assertEquals("value1", f.getField("field"));
      f.setField("field", "value2", true);
      jsunit.assertEquals("value1 value2", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetNull = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1");
      jsunit.assertEquals("value1", f.getField("field"));
      f.setField("field", null);
      jsunit.assertEquals("", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetWhiteSpace = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "   value   ";
    try {
      f.setField("field", value);
      jsunit.assertEquals(value, f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetTab = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\tvalue\t\t";
    try {
      f.setField("field", value);
      jsunit.assertEquals(value, f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testSetLinebreak1 = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\nvalue\n\n";
    try {
      f.setField("field", value);
      jsunit.assertEquals(value, f.getField("field").replace(/\r\n/g, "\n"));
    } finally {
      f.destroy();
    }
  };

  t.testSetLinebreak2 = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\r\nvalue\r\n\r\n";
    try {
      f.setField("field", value);
      jsunit.assertEquals("\nvalue\n\n", f.getField("field").replace(/\r\n/g, "\n"));
    } finally {
      f.destroy();
    }
  };

  t.testSetUtf8 = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\u3CC4";
    try {
      f.setField("field", value);
      jsunit.assertEquals(value, f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testRemove = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1", true);
      jsunit.assertEquals("value1", f.getField("field"));
      f.removeField("field");
      jsunit.assertNull(f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testFileUpload = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      jsunit.assertNotNull(f.getField("file"));
    } finally {
      f.destroy();
    }
  };

  t.testFileUploadDup = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      jsunit.assertThrows(function() {
        f.addFileUploadField("file");
      });
    } finally {
      f.destroy();
    }
  };

  t.testFragmentMethod1 = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"></form>');
    try {
      jsunit.assertEquals(jsx3.net.Form.METHOD_GET, f.getMethod());
    } finally {
      f.destroy();
    }
  };

  t.testFragmentMethod2 = function() {
    var f = new jsx3.net.Form.newFromFragment('<form method="POST" action="#"></form>');
    try {
      jsunit.assertEquals(jsx3.net.Form.METHOD_POST, f.getMethod());
    } finally {
      f.destroy();
    }
  };

  t.testFragmentAction = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="' + ACTION + '"></form>');
    try {
      jsunit.assertTrue(jsx3.$S(f.getAction()).endsWith("formdata.cgi"));
    } finally {
      f.destroy();
    }
  };

  t.testFragmentMultipart1 = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"></form>');
    try {
      jsunit.assertFalse(f.getMultipart());
    } finally {
      f.destroy();
    }
  };

  t.testFragmentMultipart2 = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#" enctype="multipart/form-data"></form>');
    try {
      jsunit.assertTrue(f.getMultipart());
    } finally {
      f.destroy();
    }
  };

  t.testFragmentGet = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"><input type="hidden" name="field" value="value"/></form>');
    try {
      jsunit.assertEquals("value", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testFragmentAppend = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"><input type="hidden" name="field" value="value1"/></form>');
    try {
      f.setField("field", "value2", true);
      jsunit.assertEquals("value1 value2", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testFragmentText = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
            '<input type="text" name="field1" value="value1"/><input type="text" name="field2" value="value2"/></form>');
    try {
      jsunit.assertEquals("value1", f.getField("field1"));
      jsunit.assertEquals("value2", f.getField("field2"));
    } finally {
      f.destroy();
    }
  };

  t.testFragmentTextArea = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
            '<textarea name="field">value</textarea></form>');
    try {
      jsunit.assertEquals("value", f.getField("field"));
    } finally {
      f.destroy();
    }
  };

  t.testGetFieldsFragment = function() {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
            '<input type="text" name="field1" value="value1"/><input type="text" name="field2" value="value2"/></form>');
    try {
      var fields = f.getFields();
      fields.sort();
      jsunit.assertEquals(2, fields.length);
      jsunit.assertEquals("field1", fields[0]);
      jsunit.assertEquals("field2", fields[1]);
    } finally {
      f.destroy();
    }
  };

  t.testGetFieldsNew = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);

    try {
      f.setField("field2", "value2");
      f.setField("field1", "value1");

      var fields = f.getFields();
      fields.sort();
      jsunit.assertEquals(String(fields), 2, fields.length);
      jsunit.assertEquals("field1", fields[0]);
      jsunit.assertEquals("field2", fields[1]);

      f.removeField("field1");

      var fields = f.getFields();
      jsunit.assertEquals(String(fields), 1, fields.length);
      jsunit.assertEquals("field2", fields[0]);
    } finally {
      f.destroy();
    }
  };

  t.testGetFieldsFile = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);

    try {
      f.addFileUploadField("file");

      var fields = f.getFields();
      jsunit.assertEquals(String(fields), 1, fields.length);
      jsunit.assertEquals("file", fields[0]);

      f.removeField("file");

      var fields = f.getFields();
      jsunit.assertEquals(0, fields.length);
    } finally {
      f.destroy();
    }
  };

  t.testTimeout = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, jsunit.HTTP_BASE + "/timeout.cgi", false);
    f.setField("field", "value");

    f.subscribe(jsx3.net.Form.EVENT_ON_RESPONSE, t.asyncCallback(function(objEvent) {
      jsunit.assert("Timed out form should not fire a response: " + objEvent, false);
    }));
    f.subscribe(jsx3.net.Form.EVENT_ON_ERROR, t.asyncCallback(function(objEvent) {
      jsunit.assert("Timed out form should not fire an error: " + objEvent, false);
    }));
    f.subscribe(jsx3.net.Form.EVENT_ON_TIMEOUT, t.asyncCallback(function(objEvent) {
    }));

    f.send(null, 500);
  };
  t.testTimeout._async = true;
  t.testTimeout._skip_unless = "NETWORK";

  t.testAbort = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, jsunit.HTTP_BASE + "/timeout.cgi", false);
    f.setField("field", "value");

    f.subscribe("*", t.asyncCallback(function(objEvent) {
      jsunit.assert("Aborted form should not fire an event: " + objEvent.subject + " " + objEvent.target, false);
    }));

    var onDone = t.asyncCallback(function() {});

    window.setTimeout(function() {
      f.abort();
    }, 100);
    window.setTimeout(function() {
      onDone();
    }, 300);

    f.send(null, 5000);
  };
  t.testAbort._async = true;
  t.testAbort._skip_unless = "NETWORK";

/* Will just get back the 404 error page rather than any sort of status...

  t.testBadUrl = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, jsunit.HTTP_BASE + "/404.cgi", false);
    f.setField("field", "value");

    f.subscribe("*", t.asyncCallback(function(objEvent) {
      if (objEvent.subject != jsx3.net.Form.EVENT_ON_ERROR) {
        jsunit.assert("Form to bad URL should only fire an error event: " + objEvent.subject + " " + f.getResponseText(), false);
      } else {
      }
    }));

    f.send();
  };
  t.testBadUrl._async = true;
  t.testBadUrl._skip_unless = "NETWORK";
*/

  t.testSendSimple = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    f.setField("field", "value");

    f.subscribe("*", t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE && f.getResponseText() ) {
        var xml = f.getResponseXML();
        var rec = xml.selectSingleNode("//record[@jsxid='field']");
        jsunit.assertNotNullOrUndef(rec);
        jsunit.assertEquals("value", rec.getValue());
      } else {
        jsunit.assert("Form should only fire response event: " + objEvent.subject + " " + objEvent.message, false);
      }
    }));

    f.send();
  };
  t.testSendSimple._async = true;
  t.testSendSimple._skip_unless = "NETWORK";

  t.testReceiveText = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, t.resolveURI("data/req.txt"), false);

    f.subscribe("*", t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
        var text = f.getResponseText();
        jsunit.assertTrue("Response text: " + text, /^File data.(\n|\r\n|\r)?$/.test(text));
      } else {
        jsunit.assert("Form should only fire response event: " + objEvent.subject + " " + objEvent.message, false);
      }
    }));

    f.send();
  };
  t.testReceiveText._async = true;
  t.testReceiveText._skip_unless = "NETWORK";

  t.testSendWhiteSpace = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    var value = " \t value\n\n";
    f.setField("field", value);

    f.subscribe("*", t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
        var xml = f.getResponseXML();
        var rec = xml.selectSingleNode("//record[@jsxid='field']");
        jsunit.assertNotNullOrUndef(rec);
        jsunit.assertEquals(value, rec.getValue().replace(/\r\n/g, "\n"));
      } else {
        jsunit.assert("Form should only fire response event: " + objEvent.subject + " " + objEvent.message, false);
      }
    }));

    f.send();
  };
  t.testSendWhiteSpace._async = true;
  t.testSendWhiteSpace._skip_unless = "NETWORK";

  t.testSendXml = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    var value1 = "<some>&xml &lt;";

    f.setField("field1", value1);

    f.subscribe("*", t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
        var xml = f.getResponseXML();
        var rec = xml.selectSingleNode("//record[@jsxid='field1']");
        jsunit.assertNotNullOrUndef(rec);
        jsunit.assertEquals(value1, rec.getValue());
      } else {
        jsunit.assert("Form should only fire response event: " + objEvent.subject + " " + objEvent.message, false);
      }
    }));

    f.send();
  };
  t.testSendXml._async = true;
  t.testSendXml._skip_unless = "NETWORK";

/* Can't get this one to work between the browser and our server...
  t.testSendUtf8 = function() {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    var value1 = "\u3CC4";

    f.setField("field1", value1);

    f.subscribe("*", t.asyncCallback(function(objEvent) {
      if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
        var xml = f.getResponseXML();
        var rec = xml.selectSingleNode("//record[@jsxid='field1']");
        var recValue = rec.getValue();
        jsunit.assertNotNullOrUndef(rec);
        jsunit.assertEquals(value1, recValue.replace(/&#(\d+);/g, function($0, $1) { return String.fromCharCode($1); }));
      } else {
        jsunit.assert("Form should only fire response event: " + objEvent.subject + " " + objEvent.message, false);
      }
    }));

    f.send();
  };
  t.testSendUtf8._async = true;
  t.testSendUtf8._skip_unless = "NETWORK";
*/

});
