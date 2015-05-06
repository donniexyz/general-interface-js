/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.net.URI", function(t, jsunit) {

  jsunit.require("jsx3.net.URI.jsxclass");

  t.testAuthority = function() {
    jsunit.assertEquals("www.domain.com", (new jsx3.net.URI("http://www.domain.com/path/file.html").getAuthority()));
    jsunit.assertEquals("user@domain.com", (new jsx3.net.URI("//user@domain.com/path/").getAuthority()));
    jsunit.assertEquals("domain.com:666", (new jsx3.net.URI("torrent://domain.com:666/").getAuthority()));
    jsunit.assertEquals("", (new jsx3.net.URI("file:///file.txt").getAuthority()));
    jsunit.assertNull((new jsx3.net.URI("file:/file.txt").getAuthority()));
  };

  t.testFragment = function() {
    jsunit.assertEquals("fragment", (new jsx3.net.URI("scheme:ssp#fragment").getFragment()));
    jsunit.assertEquals("fragment", (new jsx3.net.URI("http://www.domain.com/path/file.html#fragment").getFragment()));
    jsunit.assertEquals("", (new jsx3.net.URI("http://www.domain.com/path/file.html#").getFragment()));
    jsunit.assertNull((new jsx3.net.URI("http://www.domain.com/path/file.html").getFragment()));
  };

  t.testHost = function() {
    jsunit.assertEquals("www.domain.com", (new jsx3.net.URI("http://www.domain.com/path/file.html").getHost()));
    jsunit.assertEquals("domain.com", (new jsx3.net.URI("//user@domain.com/path/").getHost()));
    jsunit.assertNull((new jsx3.net.URI("scheme:ssp#fragment").getHost()));
    jsunit.assertEquals("", (new jsx3.net.URI("file:///file.txt").getHost()));
    jsunit.assertNull((new jsx3.net.URI("/file.txt").getHost()));
  };

  t.testIPv6 = function() {
    jsunit.assertEquals("[1080:0:0:0:8:800:200C:4171]", (new jsx3.net.URI("http://[1080:0:0:0:8:800:200C:4171]/path/file.html").getHost()));
    jsunit.assertEquals("[::192.9.5.5]", (new jsx3.net.URI("//user@[::192.9.5.5]/path/").getHost()));
    jsunit.assertNull((new jsx3.net.URI("//user@[::192.9.5.5]/path/").getPort()));
    jsunit.assertEquals("[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]", (new jsx3.net.URI("http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:8080/").getHost()));
    jsunit.assertEquals(8080, (new jsx3.net.URI("http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:8080/").getPort()));
  };

  t.testPath = function() {
    jsunit.assertEquals("/path/file.html", (new jsx3.net.URI("http://www.domain.com/path/file.html").getPath()));
    jsunit.assertEquals("/file.txt", (new jsx3.net.URI("/file.txt").getPath()));
    jsunit.assertEquals("/file.txt", (new jsx3.net.URI("/file.txt#fragment").getPath()));
    jsunit.assertEquals("/file.txt", (new jsx3.net.URI("/file.txt?query").getPath()));
    jsunit.assertNull((new jsx3.net.URI("scheme:ssp#fragment").getPath()));
  };

  t.testPort = function() {
    jsunit.assertEquals(666, (new jsx3.net.URI("torrent://domain.com:666/").getPort()));
    jsunit.assertEquals(80, (new jsx3.net.URI("//user@domain.com:80/path/").getPort()));
    jsunit.assertNull((new jsx3.net.URI("http://www.domain.com/path/file.html").getPort()));
  };

  t.testQuery = function() {
    jsunit.assertEquals("query", (new jsx3.net.URI("http://www.domain.com/path/file.html?query").getQuery()));
    jsunit.assertNull((new jsx3.net.URI("scheme:ssp?query").getQuery())); // illegal
    jsunit.assertEquals("query", (new jsx3.net.URI("/file.txt?query").getQuery()));
    jsunit.assertEquals("query", (new jsx3.net.URI("/file.txt?query#fragment").getQuery()));
  };

  t.testScheme = function() {
    jsunit.assertEquals("scheme", (new jsx3.net.URI("scheme:ssp#fragment").getScheme()));
    jsunit.assertEquals("http", (new jsx3.net.URI("http://www.domain.com/path/file.html?query").getScheme()));
    jsunit.assertEquals("C", (new jsx3.net.URI("C:/file.txt").getScheme()));
    jsunit.assertNull((new jsx3.net.URI("./C:/file.txt").getScheme()));
    jsunit.assertNull((new jsx3.net.URI("/file.txt?query").getScheme()));
    jsunit.assertNull((new jsx3.net.URI("//user@domain.com:80/path/").getScheme()));
  };

  t.testSchemeSpecificPart = function() {
    jsunit.assertEquals("ssp", (new jsx3.net.URI("scheme:ssp#fragment").getSchemeSpecificPart()));
    jsunit.assertEquals("//www.domain.com/path/file.html", (new jsx3.net.URI("http://www.domain.com/path/file.html").getSchemeSpecificPart()));
    jsunit.assertEquals("/file.txt?query", (new jsx3.net.URI("/file.txt?query").getSchemeSpecificPart()));
  };

  t.testUserInfo = function() {
    jsunit.assertEquals("user", (new jsx3.net.URI("//user@domain.com:80/path/").getUserInfo()));
    jsunit.assertNull((new jsx3.net.URI("/file.txt?query").getUserInfo()));
    jsunit.assertEquals("", (new jsx3.net.URI("scheme://@host/path").getUserInfo()));
  };

  t.testQueryParam = function() {
    var u = new jsx3.net.URI("/path?q1&q2=v2&q3=v3#fragment");
    jsunit.assertEquals(true, u.getQueryParam("q1"));
    jsunit.assertEquals("v2", u.getQueryParam("q2"));
    jsunit.assertEquals("v3", u.getQueryParam("q3"));
    jsunit.assertNull(u.getQueryParam("q4"));
    u = new jsx3.net.URI("/path#fragment");
    jsunit.assertNull(u.getQueryParam("q1"));
  };

  t.testQueryParams = function() {
    var u = new jsx3.net.URI("/path?q1&q2=v2&q3=v3#fragment");
    var p = u.getQueryParams();
    jsunit.assertInstanceOf(p, Object);
    jsunit.assertEquals(true, p.q1);
    jsunit.assertEquals("v2", p.q2);
    jsunit.assertEquals("v3", p.q3);
    jsunit.assertUndefined(p.q4);
  };

  t.testAbsolute = function() {
    jsunit.assertTrue((new jsx3.net.URI("scheme:ssp#fragment").isAbsolute()));
    jsunit.assertTrue((new jsx3.net.URI("http://www.domain.com/path/file.html").isAbsolute()));
    jsunit.assertTrue((new jsx3.net.URI("mailto:user@domain.com").isAbsolute()));
    jsunit.assertFalse((new jsx3.net.URI("/path/file.txt").isAbsolute()));
    jsunit.assertFalse((new jsx3.net.URI("//domain.com/path/file.txt").isAbsolute()));
    jsunit.assertFalse((new jsx3.net.URI("file.txt").isAbsolute()));
  };

  t.testOpaque = function() {
    jsunit.assertTrue((new jsx3.net.URI("scheme:ssp#fragment").isOpaque()));
    jsunit.assertFalse((new jsx3.net.URI("http://www.domain.com/path/file.html").isOpaque()));
    jsunit.assertTrue((new jsx3.net.URI("mailto:user@domain.com").isOpaque()));
    jsunit.assertFalse((new jsx3.net.URI("/path/file.txt").isOpaque()));
  };

  t.testEquals = function() {
    var u = new jsx3.net.URI("http://www.domain.com/path/file.html");
    jsunit.assertTrue(u.equals(u));
    jsunit.assertFalse(u.equals(null));
    jsunit.assertFalse(u.equals(1));
    jsunit.assertFalse(u.equals("http://www.domain.com/path/file.html"));

    jsunit.assertTrue(u.equals(new jsx3.net.URI("http://www.domain.com/path/file.html")));
    jsunit.assertTrue(u.equals(new jsx3.net.URI("http://www.domain.com/path/%66ile.html")));

    u = new jsx3.net.URI("/file.html?query#fragment");
    jsunit.assertTrue(u.equals(new jsx3.net.URI("/file.html?query#fragment")));
    jsunit.assertFalse(u.equals(new jsx3.net.URI("/file.html?query2#fragment")));
    jsunit.assertFalse(u.equals(new jsx3.net.URI("/file.html?query#fragment2")));
  };

  t.testValueOf = function() {
    var s = "http://www.domain.com/path/file.html";
    var u = jsx3.net.URI.valueOf(s);
    jsunit.assertInstanceOf(u, jsx3.net.URI);
    jsunit.assertEquals(s, u.toString());
    jsunit.assertTrue(u == jsx3.net.URI.valueOf(u));
  };

  t.testFromParts3 = function() {
    jsunit.assertEquals("scheme:ssp#fragment", jsx3.net.URI.fromParts("scheme", "ssp", "fragment").toString());
    jsunit.assertEquals("scheme:ssp#", jsx3.net.URI.fromParts("scheme", "ssp", "").toString());
    jsunit.assertEquals("scheme:ssp", jsx3.net.URI.fromParts("scheme", "ssp", null).toString());
    jsunit.assertEquals("ssp", jsx3.net.URI.fromParts(null, "ssp", null).toString());
  };

  t.testFromParts7 = function() {
    jsunit.assertEquals("scheme://userInfo@host:81/path?query#fragment",
        jsx3.net.URI.fromParts("scheme", "userInfo", "host", 81, "/path", "query", "fragment").toString());
  };

  t.testNormalize = function() {
    var u = new jsx3.net.URI("http://www.domain.com/path/file.html");
    jsunit.assertTrue(u == u.normalize());

    jsunit.assertEquals("file1.txt", new jsx3.net.URI("./file1.txt").normalize().toString());
    jsunit.assertEquals("../file.txt", new jsx3.net.URI("../file.txt").normalize().toString());
    jsunit.assertEquals("file2.txt", new jsx3.net.URI("foo/../file2.txt").normalize().toString());
    jsunit.assertEquals("../file.txt", new jsx3.net.URI("foo/../../file.txt").normalize().toString());
    jsunit.assertEquals("./C:/file1.txt", new jsx3.net.URI("./C:/file1.txt").normalize().toString());
    jsunit.assertEquals("./C:/file2.txt", new jsx3.net.URI("foo/../C:/file2.txt").normalize().toString());
    jsunit.assertEquals("file:///C:/file.txt", new jsx3.net.URI("file:///C:/file.txt").normalize().toString());
  };

  var resolveTests = [
      ["path/to/file.txt", "http://www.example.com/file.txt", "http://www.example.com/file.txt"],
      ["mailto:gi@example.com", "../file.txt", "../file.txt"],
      ["http://www.example.com/file.txt?a=b", "#frag", "http://www.example.com/file.txt?a=b#frag"],
      ["http://www.example.com/file.txt", "//u@power.example.com/file.html", "http://u@power.example.com/file.html"],
      ["http://www.example.com/file.txt", "/dir/file.html?a=b", "http://www.example.com/dir/file.html?a=b"],
      ["/file.txt", "/dir/file.html", "/dir/file.html"],
      ["/a/b/c/file.txt", "../file.html", "/a/b/file.html"],
      ["/a/b/c/file.txt", "file.html", "/a/b/c/file.html"],
      ["/a/b/c/", "file.html", "/a/b/c/file.html"]
  ];

  for (var i = 0; i < resolveTests.length; i++) {
    var touple = resolveTests[i];
    t["testResolve" + i] = jsunit.makeTestFunction(function(u1, u2, u3) {
      u1 = jsx3.net.URI.valueOf(u1);
      u2 = jsx3.net.URI.valueOf(u2);
      u3 = jsx3.net.URI.valueOf(u3);
      jsunit.assertEquals(u3, u1.resolve(u2));
    }, touple[0], touple[1], touple[2]);
  }

  var relativizeTests = [
      ["mailto:gi@example.com", "file.txt", "file.txt"],
      ["file.txt", "mailto:gi@example.com", "mailto:gi@example.com"],
      ["http://localhost/file.html", "file://localhost/file.html", "file://localhost/file.html"],
      ["http://www.example.com/file.html", "http://power.example.com/dir/file.html", "http://power.example.com/dir/file.html"],
      ["file:///file.txt", "file:/dir/file.txt", "/dir/file.txt"],
      ["a/b/c/file.txt", "a/b/d/file.html", "../d/file.html"],
      ["/file.txt", "/file.html", "/file.html"],
      ["/a/file.txt", "/a/file.html", "file.html"],
      ["http://www.example.com/dir/file.html", "http://www.example.com/file.html", "/file.html"],
      ["http://www.example.com/a/dir/file.html", "http://www.example.com/a/file.html", "../file.html"],
      ["http://www.example.com/dir/file.html", "http://u@www.example.com/file.html", "http://u@www.example.com/file.html"]
  ];

  for (var i = 0; i < relativizeTests.length; i++) {
    var touple = relativizeTests[i];
    t["testRelativize" + i] = jsunit.makeTestFunction(function(u1, u2, u3) {
      u1 = jsx3.net.URI.valueOf(u1);
      u2 = jsx3.net.URI.valueOf(u2);
      u3 = jsx3.net.URI.valueOf(u3);
      jsunit.assertEquals(u3, u1.relativize(u2));
    }, touple[0], touple[1], touple[2]);
  }

});
