/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.net.URIResolver is an interface specifying the methods necessary to define a context against which URIs are resolved.", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.URIResolver.jsxclass", "jsx3.app.Browser");

  it("should resolve the URI  against the base context of this resolver.", function () {
    var u = ["file.html", "../dir/file.html", "http://www.example.com", "file.html?q=v", "file.html#frag",
      "file.html?q=v#frag", "/dir/file.html"];
    for (var i = 0; i < u.length; i++)
      expect(jsx3.resolveURI(u[i])).toEqual(u[i]);
  });

  it("should resolve all relative URIs  relative to the JSX/ directory.", function () {
    expect(jsx3.resolveURI("jsx:///file.html")).toEqual(gi.test.jasmine.JSX_BASE + "JSX/file.html");
    expect(jsx3.resolveURI("jsx:/file.html")).toEqual(gi.test.jasmine.JSX_BASE + "JSX/file.html");
    expect(jsx3.resolveURI("JSX/file.html")).toEqual(gi.test.jasmine.JSX_BASE + "JSX/file.html");
    expect(jsx3.resolveURI("jsx:///../file.html")).toEqual(gi.test.jasmine.JSX_BASE + "file.html");
    expect(jsx3.resolveURI("jsx:///file.html?q=val")).toEqual(gi.test.jasmine.JSX_BASE + "JSX/file.html?q=val");
    expect(jsx3.resolveURI("jsx:///file.html#frag")).toEqual(gi.test.jasmine.JSX_BASE + "JSX/file.html#frag");
    expect(jsx3.resolveURI("jsx:///file.html?q=val#frag")).toEqual(gi.test.jasmine.JSX_BASE + "JSX/file.html?q=val#frag");
  });

  it("should resolve all relative URIs  relative to the user directory or JSXAPPS/.", function () {
    jsx3.setEnv("jsxhomepath", "../");
    var base = jsx3.getEnv("jsxhomepath");
    expect(jsx3.resolveURI("jsxuser:///JSXAPPS/app1/config.xml")).toEqual(base + "JSXAPPS/app1/config.xml");
    expect(jsx3.resolveURI("jsxuser:/JSXAPPS/app1/config.xml")).toEqual(base + "JSXAPPS/app1/config.xml");
    expect(jsx3.resolveURI("JSXAPPS/app1/config.xml")).toEqual(base + "JSXAPPS/app1/config.xml");
  });

});
