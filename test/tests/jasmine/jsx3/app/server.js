/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.app.Server", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.Server");
  var t = new _jasmine_test.App("jsx3.app.Server");

  beforeEach(function () {
    t._server = null;
  });

  it("should be able to find the app.server namespace.", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    expect(s.getEnv("namespace")).toBe("gi.test.App1");
    expect(s).toEqual(gi.test.App1); // gi.test.App1 is available globally
    expect(s).toBeInstanceOf("jsx3.app.Server");
    expect(s).toBeTypeOf("object");
  });

  it("should retrieve the environment value stored in app.server.", function () {
    var s = t._server = t.newServer("data/server1.xml", ".", null, {testkey: "testvalue"});
    expect(s.getEnv("testkey")).toBe("testvalue");
    expect(s.getEnv("TestKey")).toBe("testvalue");// case insensitive
  });

  it("should show that environment key is case insensitive", function () {
    var s = t._server = t.newServer("data/server1.xml", ".", null, {TestKey: "testvalue"}); // Case "TestKey"
    expect(s.getEnv("testkey")).toBe("testvalue"); // case insensitive
    expect(s.getEnv("TestKey")).toBe("testvalue");
  });

  afterEach(function () {
    if (t._server) {
      t._server.destroy();
      delete t._server;
    }
  });
});

