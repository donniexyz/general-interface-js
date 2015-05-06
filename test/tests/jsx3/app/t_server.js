/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Server", function(t, jsunit) {

  jsunit.require("jsx3.app.Server");

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

  t.testNamespace = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");

    jsunit.assertEquals("gi.test.App1", s.getEnv("namespace"));
    jsunit.assertEquals(s, gi.test.App1);

    s.destroy();
    delete t._server;
    jsunit.assertUndefined(gi.test.app1);
  };

  t.testGetEnv = function() {
    var s = t._server = t.newServer("data/server1.xml", ".", null, {testkey:"testvalue"});

    jsunit.assertEquals("testvalue", s.getEnv("testkey"));
    jsunit.assertEquals("testvalue", s.getEnv("TestKey"));
  };
  
  t.testGetEnvCase = function() {
    var s = t._server = t.newServer("data/server1.xml", ".", null, {TestKey:"testvalue"});

    jsunit.assertEquals("testvalue", s.getEnv("testkey"));
    jsunit.assertEquals("testvalue", s.getEnv("TestKey"));
  };
  
//  t.testGetAppPath = function() {
//    // TODO:
//  };
//
//  t.testGetCache = function() {
//    // TODO:
//  };
//
//  t.testGetBodyBlock = function() {
//    // TODO:
//  };
//
//  t.testGetRootBlock = function() {
//    // TODO:
//  };
//
//  t.testDefaultLocale = function() {
//    // TODO:
//  };
//
//  t.testGetDom = function() {
//    // TODO:
//  };
//
//  t.testGetDynamicProperty = function() {
//    // TODO:
//  };
//
//  t.testSetDynamicProperty = function() {
//    // TODO:
//  };

});
