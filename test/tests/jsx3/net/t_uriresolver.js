/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.net.URIResolver", function(t, jsunit) {

  jsunit.require("jsx3.net.URIResolver.jsxclass", "jsx3.app.Browser");

  t.testResolveRelative = function() {
    var u = ["file.html", "../dir/file.html", "http://www.example.com", "file.html?q=v", "file.html#frag",
        "file.html?q=v#frag", "/dir/file.html"];
    for (var i = 0; i < u.length; i++)
      jsunit.assertEquals(u[i], jsx3.resolveURI(u[i]));
  };

  t.testResolveJsx = function() {
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html", jsx3.resolveURI("jsx:///file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html", jsx3.resolveURI("jsx:/file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html", jsx3.resolveURI("JSX/file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "file.html", jsx3.resolveURI("jsx:///../file.html"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html?q=val", jsx3.resolveURI("jsx:///file.html?q=val"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html#frag", jsx3.resolveURI("jsx:///file.html#frag"));
    jsunit.assertEquals(jsunit.JSX_BASE + "JSX/file.html?q=val#frag", jsx3.resolveURI("jsx:///file.html?q=val#frag"));
  };

  t.testResolveUser = function() {
    var base = jsx3.getEnv("jsxhomepath");
    jsunit.assertEquals(base + "JSXAPPS/app1/config.xml", jsx3.resolveURI("jsxuser:///JSXAPPS/app1/config.xml"));
    jsunit.assertEquals(base + "JSXAPPS/app1/config.xml", jsx3.resolveURI("jsxuser:/JSXAPPS/app1/config.xml"));
    jsunit.assertEquals(base + "JSXAPPS/app1/config.xml", jsx3.resolveURI("JSXAPPS/app1/config.xml"));
  };
  t.testResolveUser._setUp = function() {
    jsx3.setEnv("jsxhomepath", "../");
  };

});
