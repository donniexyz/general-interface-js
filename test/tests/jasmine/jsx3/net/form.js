/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.net.Form", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.Form");
  var f, t = new _jasmine_test.App("jsx3.net.Form");
  var ACTION = _jasmine_test.HTTP_BASE + "/formdata.cgi";

  it("should return the HTTP method of this form.", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    try {
      expect(f.getMethod()).toEqual(jsx3.net.Form.METHOD_POST);
    } finally {
      f.destroy();
    }
  });

  it("should return the action of this form, the URL that this form is submitted to", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
    try {
      expect(jsx3.$S(f.getAction()).endsWith("formdata.cgi")).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should test if this form is multipart: if it can upload files", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, true);
    try {
      expect(f.getMultipart()).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should set the method of this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, "", false);
    try {
      expect(f.getMethod()).toEqual(jsx3.net.Form.METHOD_POST);
      f.setMethod(jsx3.net.Form.METHOD_GET);
      expect(f.getMethod()).toEqual(jsx3.net.Form.METHOD_GET);
    } finally {
      f.destroy();
    }
  });

  it("should test  the action of this form, the URL that this form is submitted to", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "#", false);
    try {
      f.setAction(ACTION);
      expect(jsx3.$S(f.getAction()).endsWith("formdata.cgi")).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the form as multipart", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      expect(f.getMultipart()).toBeFalsy();
      f.setMultipart(true);
      expect(f.getMultipart()).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should reveal and hide the IFRAME containing this form after it has been shown by calling reveal()", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.reveal();
      f.conceal();
    } finally {
      f.destroy();
    }
  });

  it("should test  the value of a field in this form.", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      expect(f.getField("field")).toBeNull();
    } finally {
      f.destroy();
    }
  });

  it("should be able to set  the value of a field in this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value");
      expect(f.getField("field")).toEqual("value");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form and then override the same", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1");
      expect(f.getField("field")).toEqual("value1");
      f.setField("field", "value2");
      expect(f.getField("field")).toEqual("value2");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form and then append another value", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1", true);
      expect(f.getField("field")).toEqual("value1");
      f.setField("field", "value2", true);
      expect(f.getField("field")).toEqual("value1 value2");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to null", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1");
      expect(f.getField("field")).toEqual("value1");
      f.setField("field", null);
      expect(f.getField("field")).toEqual("");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to whitespace", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "   value   ";
    try {
      f.setField("field", value);
      expect(f.getField("field")).toEqual(value);
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to a tab", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\tvalue\t\t";
    try {
      f.setField("field", value);
      expect(f.getField("field")).toEqual(value);
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to a line break", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\nvalue\n\n";
    try {
      f.setField("field", value);
      expect(f.getField("field").replace(/\r\n/g, "\n")).toEqual(value);
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to two linebreaks", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\r\nvalue\r\n\r\n";
    try {
      f.setField("field", value);
      expect(f.getField("field").replace(/\r\n/g, "\n")).toEqual("\nvalue\n\n");
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form to utf8", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    var value = "\u3CC4";
    try {
      f.setField("field", value);
      expect(f.getField("field")).toEqual(value);
    } finally {
      f.destroy();
    }
  });

  it("should be able to set the value of a field in this form  and then remove the same", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field", "value1", true);
      expect(f.getField("field")).toEqual("value1");
      f.removeField("field");
      expect(f.getField("field")).toBeNull();
    } finally {
      f.destroy();
    }
  });

  it("should add a file upload field to this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      expect(f.getField("file")).not.toBeNull();
    } finally {
      f.destroy();
    }
  });

  it("should test for a duplicate file upload field to this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      var func = function () {
        f.addFileUploadField("file");
      };
      expect(func).toThrow();
    } finally {
      f.destroy();
    }
  });

  it("should create a new form and initialize it from the HTML representation of a GET form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"></form>');
    try {
      expect(f.getMethod()).toEqual(jsx3.net.Form.METHOD_GET);
    } finally {
      f.destroy();
    }
  });

  it("should create a new form and initialize it from the HTML representation of a POST form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form method="POST" action="#"></form>');
    try {
      expect(f.getMethod()).toEqual(jsx3.net.Form.METHOD_POST);
    } finally {
      f.destroy();
    }
  });

  it("should create a new form and initialize it from the HTML representation of a form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="' + ACTION + '"></form>');
    try {
      expect(jsx3.$S(f.getAction()).endsWith("formdata.cgi")).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should determine if  whether this form is multipart", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"></form>');
    try {
      expect(f.getMultipart()).toBeFalsy();
    } finally {
      f.destroy();
    }
  });

  it("should determine if  whether this form is multipart", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#" enctype="multipart/form-data"></form>');
    try {
      expect(f.getMultipart()).toBeTruthy();
    } finally {
      f.destroy();
    }
  });

  it("should return  the value of a field in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"><input type="hidden" name="field" value="value"/></form>');
    try {
      expect(f.getField("field")).toEqual("value");
    } finally {
      f.destroy();
    }
  });

  it("should append values to form fields in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#"><input type="hidden" name="field" value="value1"/></form>');
    try {
      f.setField("field", "value2", true);
      expect(f.getField("field")).toEqual("value1 value2");
    } finally {
      f.destroy();
    }
  });

  it("should test the value of a field in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
      '<input type="text" name="field1" value="value1"/><input type="text" name="field2" value="value2"/></form>');
    try {
      expect(f.getField("field1")).toEqual("value1");
      expect(f.getField("field2")).toEqual("value2");
    } finally {
      f.destroy();
    }
  });

  it("should test the value of a field in this form", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
      '<textarea name="field">value</textarea></form>');
    try {
      expect(f.getField("field")).toEqual("value");
    } finally {
      f.destroy();
    }
  });

  it("should sort the form fields and then check their values", function () {
    var f = new jsx3.net.Form.newFromFragment('<form action="#">' +
      '<input type="text" name="field1" value="value1"/><input type="text" name="field2" value="value2"/></form>');
    try {
      var fields = f.getFields();
      fields.sort();
      expect(fields.length).toEqual(2);
      expect(fields[0]).toEqual("field1");
      expect(fields[1]).toEqual("field2");
    } finally {
      f.destroy();
    }
  });

  it("should return the names of all fields in this form and also remove a form field", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.setField("field2", "value2");
      f.setField("field1", "value1");
      var fields = f.getFields();
      fields.sort();
      expect(fields.length).toEqual(2);
      expect(fields[0]).toEqual("field1");
      expect(fields[1]).toEqual("field2");
      f.removeField("field1");
      fields = f.getFields();
      expect(fields.length).toEqual(1);
      expect(fields[0]).toEqual("field2");
    } finally {
      f.destroy();
    }
  });

  it("should add a file upload field to this form", function () {
    var f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, "", false);
    try {
      f.addFileUploadField("file");
      var fields = f.getFields();
      expect(fields.length).toEqual(1);
      expect(fields[0]).toEqual("file");
      f.removeField("file");
      fields = f.getFields();
      expect(fields.length).toEqual(0);
    } finally {
      f.destroy();
    }
  });

  if (_jasmine_test.NETWORK)
    it("should timeout and generate a ON_TIMEOUT event", function () {
      f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, _jasmine_test.HTTP_BASE + "/timeout.cgi", false);
      f.setField("field", "value");
      var evt = {}, spec = this;
      f.subscribe(jsx3.net.Form.EVENT_ON_RESPONSE, function (objEvent) {
        spec.fail("Timeout form should not fire reponse event: " + objEvent.subject + " " + objEvent.target);
      });
      f.subscribe(jsx3.net.Form.EVENT_ON_ERROR, function (objEvent) {
        spec.fail("Timeout form should not fire error event: " + objEvent.subject + " " + objEvent.target);
      });
      // NOTE: it's EVENT_ON_TIMEOUT, not ON_TIMEOUT
      f.subscribe(jsx3.net.Form.EVENT_ON_TIMEOUT, function (objEvent) {
        evt = objEvent;
      });
      runs(function () {
        f.send(null, 500);
      });
      waitsFor(function () {
        return evt.target != null;
      }, "timeout event to trigger", 5000);
      runs(function () {
        expect(evt.target).toBeDefined();
        expect(evt.subject).toEqual("timeout")
      });
    });
  //t.testTimeout._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should receive no event object when abort() is called before response is received", function () {
      var abort = null, objEvent = null, spec = this;
      f = new jsx3.net.Form(jsx3.net.Form.METHOD_GET, _jasmine_test.HTTP_BASE + "/timeout.cgi", false);
      f.setField("field", "value");
      var onDone = function () {
        _jasmine_test.debug("form.abort() onDone " + f);
      };
      f.subscribe("*", function (evt) {
        spec.fail("Aborted form should not fire an event: " + evt.subject + " " + evt.target);
      });
      f.send(null, 5000);
      runs(function () {
        window.setTimeout(function () {
          abort = "called";
          f.abort();
        }, 300);
        window.setTimeout(function () {
          onDone();
        }, 500);
      });
      waitsFor(function () {
        return abort == "called";
      }, "abort to be called", 750);
      runs(function () {
        expect(abort).toBe("called");
      });
    });

  if (_jasmine_test.NETWORK)
    it("should be able to send and receive using Form", function () {
      f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
      f.setField("field", "value");
      var rec = null, spec = this;
      f.subscribe("*", function (objEvent) {
        if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
          var xml = f.getResponseXML();
          rec = xml.selectSingleNode("//record[@jsxid='field']");
        } else {
          spec.fail("Form should only fire response event: " + objEvent.subject + " " + objEvent.message);
        }
      });
      f.send();
      waitsFor(function () {
        return rec != null;
      }, "record of jsxid 'field' should be defined", 1750);

      runs(function () {
        expect(rec).not.toBeUndefined();
        expect(rec.getValue()).toEqual("value");
      });
    });
  //t.testSendSimple._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should be able to send and receive text content", function () {
      f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, t.resolveURI("data/req.txt"), false);
      var text = null, spec = this;
      f.subscribe("*", function (objEvent) {
        if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
          text = f.getResponseText();
        } else {
          spec.fail("Form should only fire response event: " + objEvent.subject + " " + objEvent.message);
        }
      });
      f.send();
      waitsFor(function () {
        return text != null;
      }, "text value should have been received", 750);

      runs(function () {
        expect(/^File data.(\n|\r\n|\r)?$/.test(text)).toBeTruthy();
        f.destroy();
      });
    });
  //t.testReceiveText._skip_unless = "NETWORK";

  if (_jasmine_test.NETWORK)
    it("should be able to preserve white space posted and received.", function () {
      f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
      var value = " \t value\n\n";
      f.setField("field", value);
      var rec = null, spec = this;
      f.subscribe("*", function (objEvent) {
        if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
          var xml = f.getResponseXML();
          rec = xml.selectSingleNode("//record[@jsxid='field']");
        } else {
          spec.fail("Form should only fire response event: " + objEvent.subject + " " + objEvent.message);
        }
      });
      f.send();
      waitsFor(function () {
        return rec != null;
      }, "target should be defined", 750);

      runs(function () {
        expect(rec).not.toBeNull();
        expect(rec).not.toBeUndefined();
        expect(rec.getValue().replace(/\r\n/g, "")).toEqual(value);
      });
    });

  if (_jasmine_test.NETWORK)
    it("should be able to send and receive XML content", function () {
      f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
      var value1 = "<some>&xml &lt;";
      f.setField("field1", value1);
      var rec = null, spec = this;
      f.subscribe("*", function (objEvent) {
        if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
          var xml = f.getResponseXML();
          rec = xml.selectSingleNode("//record[@jsxid='field1']");
        } else {
          spec.fail("Form should only fire response event: " + objEvent.subject + " " + objEvent.message);
        }
      });
      f.send();
      waitsFor(function () {
        return rec != null;
      }, "record[@jsxid='field1'] is not null", 750);
      runs(function () {
        expect(rec).not.toBeNull();
        expect(rec).not.toBeUndefined();
        expect(rec.getValue()).toEqual(value1);
      });
    });
  //t.testSendXml._skip_unless = "NETWORK";

  //Can't get this one to work between all the browsers without Accept-Language=zh and our server...
  if (_jasmine_test.NETWORK)
    xit("should be able to send and receive Utf8 content", function () {
      f = new jsx3.net.Form(jsx3.net.Form.METHOD_POST, ACTION, false);
      var value1 = "\u3CC4", rec = null, spec = this;
      f.setField("field1", value1);
      f.subscribe("*", function (objEvent) {
        if (objEvent.subject == jsx3.net.Form.EVENT_ON_RESPONSE) {
          var xml = f.getResponseXML();
          rec = xml.selectSingleNode("//record[@jsxid='field1']");
        } else {
          spec.fail("Form should only fire response event: " + objEvent.subject + " " + objEvent.message);
        }
      });
      f.send();
      waitsFor(function () {
        return rec != null;
      }, "xml record received", 750);
      runs(function () {
        var recValue = rec.getValue();
        expect(rec).not.toBeNull();
        expect(recValue.replace(/&#(\d+);/g, function ($0, $1) {
          return String.fromCharCode($1);
        })).toEquals(value1);
      });
    });

  afterEach(function () {
    if (f) {
      f.destroy();
    }
  })
});
