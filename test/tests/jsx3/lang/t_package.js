/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang.Package", function(t, jsunit) {

  jsunit.require("jsx3.util.jsxpackage", "jsx3.lang.Package", "jsx3.util.List");

  t._setUp = function() {
    jsx3.lang.Package.definePackage("test.pckg", function(P) {
      P.aField = 1;
      P.aMethod = function() {};
    });
    jsx3.lang.Class.defineClass("test.pckg.Class", null, null, function(C, P) {
    });
  };

  t._tearDown = function() {
    delete test.pckg.jsxpackage;
    delete test.pckg;
  };

  t.testForName = function() {
    jsunit.assertEquals(test.pckg.jsxpackage, jsx3.lang.Package.forName("test.pckg"));
    jsunit.assertNull(jsx3.lang.Package.forName("test.pckg.foo"));
  };

  t.testGetPackages = function() {
    var p = jsx3.lang.Package.getPackages();
    jsunit.assertInstanceOf(p, Array);
    jsunit.assertTrue(p.length >= 1);

    var l = new jsx3.util.List(p);
    jsunit.assertTrue(l.contains(test.pckg.jsxpackage));
  };

  t.testGetName = function() {
    var p = jsx3.lang.Package.forName("test.pckg");
    jsunit.assertEquals("test.pckg", p.getName());
  };

  t.testNamespace = function() {
    var p = jsx3.lang.Package.forName("test.pckg");
    jsunit.assertNotNullOrUndef(p.getNamespace());
    jsunit.assertEquals(test.pckg, p.getNamespace());
  };

  t.testClasses = function() {
    var p = jsx3.lang.Package.forName("test.pckg");
    var c = p.getClasses();
    jsunit.assertEquals(1, c.length);
    jsunit.assertEquals(test.pckg.Class.jsxclass, c[0]);
  };

  t.testStaticMethods = function() {
    var p = jsx3.lang.Package.forName("test.pckg");
    var m = p.getStaticMethods();
    jsunit.assertEquals(1, m.length);
    jsunit.assertEquals(test.pckg.aMethod.jsxmethod, m[0]);
  };

  t.testStaticFields = function() {
    var p = jsx3.lang.Package.forName("test.pckg");
    var f = p.getStaticFieldNames();
    jsunit.assertEquals(1, f.length);
    jsunit.assertEquals("aField", f[0]);
  };

});
