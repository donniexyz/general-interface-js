/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3", function(t, jsunit) {

  jsunit.require("jsx3.jsxpackage", "jsx3.app.Cache", "jsx3.lang.System");

  t.testEval = function() {
    jsunit.assertEquals(5, jsx3.eval("2 + 3"));
  };
  
  t.testEvalParams = function() {
    jsunit.assertEquals(5, jsx3.eval("x + y", {x:2, y:3}));
  };
  
  t.testEvalBadParam = function() {
    jsunit.assertEquals(5, jsx3.eval("x + y", {x:2, y:3, " not a js name ":5}));
  };
  
  t.testEvalReservedWordParam = function() {
    jsunit.assertEquals(5, jsx3.eval("x + y", {x:2, y:3, "function":1, "var":1}));
  };
  
  t.testSetEnv = function() {
    jsx3.setEnv("testkey", "testvalue");
  };
  
  t.testGetEnv = function() {
    jsx3.setEnv("testkey", "testvalue");
    jsx3.setEnv("TestKey2", "testvalue2");
    
    jsunit.assertEquals("testvalue", jsx3.getEnv("testkey"));
    jsunit.assertEquals("testvalue", jsx3.getEnv("TestKey"));
    jsunit.assertEquals("testvalue2", jsx3.getEnv("TestKey2"));
    jsunit.assertEquals("testvalue2", jsx3.getEnv("testkey2"));
  };
  
  t.testSharedCache = function() {
    var c = jsx3.getSharedCache();
    jsunit.assertInstanceOf(c, jsx3.app.Cache);
  };

  t.testSystemCache = function() {
    var c = jsx3.getSystemCache();
    jsunit.assertInstanceOf(c, jsx3.app.Cache);
  };

  t.testSleep1 = function() {
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assert(true);
    }));
  };
  t.testSleep1._async = true;

  t.testSleep2 = function() {
    var obj = {};
    jsx3.sleep(t.asyncCallback(function() {
      jsunit.assertNotNullOrUndef(this);
      jsunit.assertEquals(obj, this);
    }), null, obj);
  };
  t.testSleep2._async = true;

  t.testSleep3 = function() {
    var firstExecuted = false, secondExecuted = false;

    jsx3.sleep(function() {
      firstExecuted = true;
    }, "dupId");
    jsx3.sleep(function() {
      secondExecuted = true;
    }, "dupId");

    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertTrue(firstExecuted);
      jsunit.assertFalse(secondExecuted);
    }), 1000);
  };
  t.testSleep3._async = true;

  t.testSleep4 = function() {
    var firstExecuted = false, secondExecuted = false;

    jsx3.sleep(function() {
      firstExecuted = true;
    }, "dupId");
    jsx3.sleep(function() {
      secondExecuted = true;
    }, "dupId", null, true);

    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertFalse(firstExecuted);
      jsunit.assertTrue(secondExecuted);
    }), 1000);
  };
  t.testSleep4._async = true;

  t.testSleepThrows1 = function() {
    var secondExecuted = false;
    jsx3.sleep(function() {
      jsx3.sleep(function() {
        secondExecuted = true;
      });

      throw new Error();
    });

    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertTrue(secondExecuted);      
    }), 1000);
  };
  t.testSleepThrows1._async = true;

  t.testSleepThrows2 = function() {
    var secondExecuted = false;
    jsx3.sleep(function() {
      throw new Error();
    });
    jsx3.sleep(function() {
      secondExecuted = true;
    });

    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertTrue(secondExecuted);
    }), 1000);
  };
  t.testSleepThrows2._async = true;

  t.testRequire1 = function() {
    if (jsx3.app && jsx3.app.UserSettings) delete jsx3.app.UserSettings;

    if (jsx3.app)
      jsunit.assertUndefined(jsx3.app.UserSettings);

    jsx3.require("jsx3.app.UserSettings");

    jsunit.assertNotUndefined(jsx3.app.UserSettings);
    jsunit.assertInstanceOf(jsx3.app.UserSettings.jsxclass, jsx3.lang.Class);
  };

  t.testRequire2 = function() {
    var e = null;
    if (jsx3.app && jsx3.app.UserSettings) delete jsx3.app.UserSettings;

    if (jsx3.app)
      jsunit.assertUndefined(jsx3.app.UserSettings);

    jsx3.sleep(function() {
      jsx3.require("jsx3.app.UserSettings");
      try {
        jsunit.assertNotUndefined("Class jsx3.app.UserSettings should not be undefined (1): " + jsx3.app.UserSettings, jsx3.app.UserSettings);
        jsunit.assertInstanceOf(jsx3.app.UserSettings.jsxclass, jsx3.lang.Class);
      } catch (ex) {
        e = ex;
      }
    });

    if (e == null) {
      jsx3.sleep(function() {
        try {
          jsunit.assertNotUndefined("Class jsx3.app.UserSettings should not be undefined (2): " + jsx3.app.UserSettings, jsx3.app.UserSettings);
          jsunit.assertInstanceOf(jsx3.app.UserSettings.jsxclass, jsx3.lang.Class);
        } catch (ex) {
          e = ex;
        }

        if (e == null) {
          try {
            jsx3.require("jsx3.app.UserSettings");
          } catch (ex) {
            e = ex;
          }
        }
      });
    }
    
    jsx3.sleep(t.asyncCallback(function() {
      if (e) throw e;
    }));
  };
  t.testRequire2._async = true;

  t.testRequireAsync = function() {
    if (jsx3.net && jsx3.net.Form) delete jsx3.net.Form;

    if (jsx3.net)
      jsunit.assertUndefined(jsx3.net.Form);

    jsx3.requireAsync("jsx3.net.Form").when(t.asyncCallback(function() {
      jsunit.assertNotUndefined(jsx3.net.Form);
      jsunit.assertInstanceOf(jsx3.net.Form.jsxclass, jsx3.lang.Class);
    }));
  };
  t.testRequireAsync._async = true;

  t.testRequireAsyncBadPackage = function() {
    jsunit.assertThrows(function() {
      jsx3.requireAsync("jsx3.notapackage.Class");
    });
  };

  t.testRequireAsyncBadClass = function() {
    jsunit.assertUndefined(jsx3.util.NotAClass);

    jsx3.requireAsync("jsx3.util.NotAClass").when(t.asyncCallback(function() {
      jsunit.assertTrue("Should not execute this callback.", false);
    }));

    window.setTimeout(t.asyncCallback(function() {
      jsunit.assertUndefined(jsx3.util.NotAClass);
    }), 1000);
  };
  t.testRequireAsyncBadClass._async = true;

});
