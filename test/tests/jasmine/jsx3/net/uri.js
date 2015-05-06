/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.net.URI", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.net.URI.jsxclass");

  it("should be able to retrieve the authority part of an URI", function () {
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").getAuthority())).toEqual("www.domain.com");
    expect((new jsx3.net.URI("//user@domain.com/path/").getAuthority())).toEqual("user@domain.com");
    expect((new jsx3.net.URI("torrent://domain.com:666/").getAuthority())).toEqual("domain.com:666");
    expect((new jsx3.net.URI("file:///file.txt").getAuthority())).toEqual("");
    expect((new jsx3.net.URI("file:/file.txt").getAuthority())).toBeNull();
  });

  it("should be able to retrieve the hash fragment of an URI", function () {
    expect((new jsx3.net.URI("scheme:ssp#fragment").getFragment())).toEqual("fragment");
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html#fragment").getFragment())).toEqual("fragment");
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html#").getFragment())).toEqual("");
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").getFragment())).toBeNull();
  });

  it("should be able to retrieve the domain of an URI", function () {
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").getHost())).toEqual("www.domain.com");
    expect((new jsx3.net.URI("//user@domain.com/path/").getHost())).toEqual("domain.com");
    expect((new jsx3.net.URI("scheme:ssp#fragment").getHost())).toBeNull();
    expect((new jsx3.net.URI("file:///file.txt").getHost())).toEqual("");
    expect((new jsx3.net.URI("/file.txt").getHost())).toBeNull();
  });

  it("should be able to parse an IPV6 URI", function () {
    expect((new jsx3.net.URI("http://[1080:0:0:0:8:800:200C:4171]/path/file.html").getHost())).toEqual("[1080:0:0:0:8:800:200C:4171]");
    expect((new jsx3.net.URI("//user@[::192.9.5.5]/path/").getHost())).toEqual("[::192.9.5.5]");
    expect((new jsx3.net.URI("//user@[::192.9.5.5]/path/").getPort())).toBeNull();
    expect((new jsx3.net.URI("http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:8080/").getHost())).toEqual("[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]");
    expect((new jsx3.net.URI("http://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]:8080/").getPort())).toEqual(8080);
  });

  it("should be able to retrieve the path of the URI", function () {
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").getPath())).toEqual(("/path/file.html"));
    expect((new jsx3.net.URI("/file.txt").getPath())).toEqual(("/file.txt"));
    expect((new jsx3.net.URI("/file.txt#fragment").getPath())).toEqual(("/file.txt"));
    expect((new jsx3.net.URI("/file.txt?query").getPath())).toEqual(("/file.txt"));
    expect((new jsx3.net.URI("scheme:ssp#fragment").getPath())).toBeNull();
  });

  it("should be able to retrieve the port number of an URI", function () {
    expect((new jsx3.net.URI("torrent://domain.com:666/").getPort())).toEqual(666);
    expect((new jsx3.net.URI("//user@domain.com:80/path/").getPort())).toEqual(80);
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").getPort())).toBeNull();
  });

  it("should be able to retrieve the query portion of an URI", function () {
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html?query").getQuery())).toEqual("query");
    expect((new jsx3.net.URI("scheme:ssp?query").getQuery())).toBeNull(); // illegal
    expect((new jsx3.net.URI("/file.txt?query").getQuery())).toEqual("query");
    expect((new jsx3.net.URI("/file.txt?query#fragment").getQuery())).toEqual("query");
  });

  it("should be able to determine the URI protocol scheme", function () {
    expect((new jsx3.net.URI("scheme:ssp#fragment").getScheme())).toEqual("scheme");
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html?query").getScheme())).toEqual("http");
    expect((new jsx3.net.URI("C:/file.txt").getScheme())).toEqual("C");
    expect((new jsx3.net.URI("./C:/file.txt").getScheme())).toBeNull();
    expect((new jsx3.net.URI("/file.txt?query").getScheme())).toBeNull();
    expect((new jsx3.net.URI("//user@domain.com:80/path/").getScheme())).toBeNull();
  });

  it("should be able to retrieve specific prt of an URI scheme", function () {
    expect((new jsx3.net.URI("scheme:ssp#fragment").getSchemeSpecificPart())).toEqual("ssp");
    expect("//www.domain.com/path/file.html").toEqual((new jsx3.net.URI("http://www.domain.com/path/file.html").getSchemeSpecificPart()));
    expect((new jsx3.net.URI("/file.txt?query").getSchemeSpecificPart())).toEqual("/file.txt?query");
  });

  it("should be able to retrieve the User Info of an URI", function () {
    expect((new jsx3.net.URI("//user@domain.com:80/path/").getUserInfo())).toEqual("user");
    expect((new jsx3.net.URI("/file.txt?query").getUserInfo())).toBeNull();
    expect((new jsx3.net.URI("scheme://@host/path").getUserInfo())).toEqual("");
  });

  it("should be able to retrieve a query parameter by name using getQueryParam(name).", function () {
    var u = new jsx3.net.URI("/path?q1&q2=v2&q3=v3#fragment");
    expect(u.getQueryParam("q1")).toEqual(true);
    expect(u.getQueryParam("q2")).toEqual("v2");
    expect(u.getQueryParam("q3")).toEqual("v3");
    expect(u.getQueryParam("q4")).toBeNull();
    u = new jsx3.net.URI("/path#fragment");
    expect(u.getQueryParam("q1")).toBeNull();
  });

  it("shdould be able to parse query paramters into a json object using getQueryParams()", function () {
    var u = new jsx3.net.URI("/path?q1&q2=v2&q3=v3#fragment");
    var p = u.getQueryParams();
    expect(p).toBeInstanceOf(Object);
    expect(p.q1).toEqual(true);
    expect(p.q2).toEqual("v2");
    expect(p.q3).toEqual("v3");
    expect(p.q4).toBeUndefined();
  });

  it("should test  whether the URI is considered absolute in the JSX system", function () {
    expect((new jsx3.net.URI("scheme:ssp#fragment").isAbsolute())).toBeTruthy();
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").isAbsolute())).toBeTruthy();
    expect((new jsx3.net.URI("mailto:user@domain.com").isAbsolute())).toBeTruthy();
    expect((new jsx3.net.URI("/path/file.txt").isAbsolute())).toBeFalsy();
    expect((new jsx3.net.URI("//domain.com/path/file.txt").isAbsolute())).toBeFalsy();
    expect((new jsx3.net.URI("file.txt").isAbsolute())).toBeFalsy();
  });

  it("should test whether the URI is considered opaque", function () {
    expect((new jsx3.net.URI("scheme:ssp#fragment").isOpaque())).toBeTruthy();
    expect((new jsx3.net.URI("http://www.domain.com/path/file.html").isOpaque())).toBeFalsy();
    expect((new jsx3.net.URI("mailto:user@domain.com").isOpaque())).toBeTruthy();
    expect((new jsx3.net.URI("/path/file.txt").isOpaque())).toBeFalsy();
  });

  it("has method equals() that can compare two URI for equivalence", function () {
    var u = new jsx3.net.URI("http://www.domain.com/path/file.html");
    expect(u.equals(u)).toBeTruthy();
    expect(u.equals(null)).toBeFalsy();
    expect(u.equals(1)).toBeFalsy();
    expect(u.equals("http://www.domain.com/path/file.html")).toBeFalsy();
    expect(u.equals(new jsx3.net.URI("http://www.domain.com/path/file.html"))).toBeTruthy();
    expect(u.equals(new jsx3.net.URI("http://www.domain.com/path/%66ile.html"))).toBeTruthy();
    u = new jsx3.net.URI("/file.html?query#fragment");
    expect(u.equals(new jsx3.net.URI("/file.html?query#fragment"))).toBeTruthy();
    expect(u.equals(new jsx3.net.URI("/file.html?query2#fragment"))).toBeFalsy();
    expect(u.equals(new jsx3.net.URI("/file.html?query#fragment2"))).toBeFalsy();
  });

  it("has method valueOf() that returns the string value of the URI", function () {
    var s = "http://www.domain.com/path/file.html";
    var u = jsx3.net.URI.valueOf(s);
    expect(u).toBeInstanceOf(jsx3.net.URI);
    expect(s).toEqual(u.toString());
    expect(u == jsx3.net.URI.valueOf(u)).toBeTruthy();
  });

  it("should test the fromParts() method with 3 arguments :URI scheme,user information and host", function () {
    expect(jsx3.net.URI.fromParts("scheme", "ssp", "fragment").toString()).toEqual("scheme:ssp#fragment");
    expect(jsx3.net.URI.fromParts("scheme", "ssp", "").toString()).toEqual("scheme:ssp#");
    expect(jsx3.net.URI.fromParts("scheme", "ssp", null).toString()).toEqual("scheme:ssp");
    expect(jsx3.net.URI.fromParts(null, "ssp", null).toString()).toEqual("ssp");
  });

  it("has method fromParts() that can construct a new URI from 7 parts (scheme, user, host, port, path, query, fragment)", function () {
    expect("scheme://userInfo@host:81/path?query#fragment").toEqual(
      jsx3.net.URI.fromParts("scheme", "userInfo", "host", 81, "/path", "query", "fragment").toString());
  });

  it("has method normalize() that will reduce an equivalent URI to a common form", function () {
    var u = new jsx3.net.URI("http://www.domain.com/path/file.html");
    expect(u == u.normalize()).toBeTruthy();

    expect(new jsx3.net.URI("./file1.txt").normalize().toString()).toEqual("file1.txt");
    expect(new jsx3.net.URI("../file.txt").normalize().toString()).toEqual("../file.txt");
    expect(new jsx3.net.URI("foo/../file2.txt").normalize().toString()).toEqual("file2.txt");
    expect(new jsx3.net.URI("foo/../../file.txt").normalize().toString()).toEqual("../file.txt");
    expect(new jsx3.net.URI("./C:/file1.txt").normalize().toString()).toEqual("./C:/file1.txt");
    expect(new jsx3.net.URI("foo/../C:/file2.txt").normalize().toString()).toEqual("./C:/file2.txt");
    expect(new jsx3.net.URI("file:///C:/file.txt").normalize().toString()).toEqual("file:///C:/file.txt");
  });

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
    touple = resolveTests[i];
    gi.test.jasmine.makeTestFunction(function () {
      var u1 = jsx3.net.URI.valueOf(touple[0]);
      var u2 = jsx3.net.URI.valueOf(touple[1]);
      var u3 = jsx3.net.URI.valueOf(touple[2]);
      expect(u1.resolve(u2)).toEquals(u3);
    }, 'resolve URI("' + touple[0] + '").resolve("' + touple[1] + '") = "' + touple[2] + '"');
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
    gi.test.jasmine.makeTestFunction(function () {
      var u1 = jsx3.net.URI.valueOf(touple[0]);
      var u2 = jsx3.net.URI.valueOf(touple[1]);
      var u3 = jsx3.net.URI.valueOf(touple[2]);
      expect(u1.relativize(u2)).toEqual(u3);
    }, 'relativize URI("' + touple[0] + '").relativize("' + touple[1] + '") = "' + touple[2] + '"');
  }

});
