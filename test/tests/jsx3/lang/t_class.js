/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.lang.Class", function(t, jsunit) {

  jsunit.require("jsx3.lang.Class", "jsx3.lang.Exception", "jsx3.util.jsxpackage", "jsx3.lang.Package");

  t._setUp = function() {
    jsx3.lang.Class.defineClass("test.jsx3ClassSuper", null, null, function(C, P){
      P.init = function() {};
      P.getValue = function() { return C.getDefaultValue(); };
      C.getDefaultValue = function() { return 10; };
      P.getX = function() { return "x1"; };
      P.getY = function() { return "y1"; };
    });
    jsx3.lang.Class.defineInterface("test.jsx3ClassInterface", null, function(C, P){
      P.init = function() {};
      P.setValue = function(value) { this.value = value; };
      P.getX = function() { return "x2"; };
      P.getY = function() { return "y2"; };
    });
    jsx3.lang.Class.defineClass("test.jsx3Class", test.jsx3ClassSuper, [test.jsx3ClassInterface], function(C, P){
      C.sField = 1;
      P.iField = 2;
      P.init = function(value) { this.value = value; this.inited = true; };
      P.getValue = function() { return this.value; };
      P.isOn = function() { return this.on; };
      P.setOn = function(on) { this.on = on; };
      P.getX = function() { return this.jsxsuper(); };
      P.getY = function() { return this.jsxsupermix(); };
    });
    jsx3.lang.Class.defineClass("test.jsx3Class.Inner", null, null, function(C, P){
      P.init = function() {};
    });
  };

  t._tearDown = function() {
    delete test.jsx3Class.Inner.jsxclass;
    delete test.jsx3Class.Inner;
    delete test.jsx3ClassSuper.jsxclass;
    delete test.jsx3ClassSuper;
    delete test.jsx3ClassInterface.jsxclass;
    delete test.jsx3ClassInterface;
    delete test.jsx3Class.jsxclass;
    delete test.jsx3Class;
    delete test.jsxpackage;
  };

  t.testDefined = function() {
    jsunit.assertNotNull(jsx3);
    jsunit.assertNotNull(jsx3.lang);
    jsunit.assertNotNull(jsx3.lang.Class);
  };

  t.testForName = function() {
    jsunit.assertEquals(jsx3.lang.Class.forName("test.jsx3Class"), test.jsx3Class.jsxclass);
    jsunit.assertNull(jsx3.lang.Class.forName("test.jsx3Class.foo"));
  };

  t.testName = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    jsunit.assertEquals(c.getName(), "test.jsx3Class");
  };

  t.testGetPackage = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    jsunit.assertNull(c.getPackage());
    jsunit.assertEquals("test", c.getPackageName());

    jsx3.lang.Package.definePackage("test", function() {});
    jsunit.assertNotNull(c.getPackage());
    jsunit.assertEquals(jsx3.lang.Package.forName("test"), c.getPackage());
  };

  t.testGetConstructor = function() {
    var o = new test.jsx3Class(79);
    jsunit.assertNotNull(o);

    var c = jsx3.lang.Class.forName("test.jsx3Class");
    jsunit.assertNotNull(c.getConstructor());
    jsunit.assertEquals(c.getConstructor(), test.jsx3Class);
  };

  t.testIsInterface = function() {
    jsunit.assertFalse(jsx3.lang.Class.forName("test.jsx3Class").isInterface());
    jsunit.assertFalse(jsx3.lang.Class.forName("test.jsx3ClassSuper").isInterface());
    jsunit.assertTrue(jsx3.lang.Class.forName("test.jsx3ClassInterface").isInterface());
  };

  t.testInterface = function() {
    jsunit.assertThrows(function() {
      var o = new test.jsx3ClassInterface();
    });
    var c = jsx3.lang.Class.forName("test.jsx3ClassInterface");
    jsunit.assertThrows(function() {
      var o = c.newInstance();
    });
  };

  t.testNewInstance = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var o = c.newInstance(9);
    jsunit.assertNotNull(o);
    jsunit.assertInstanceOf(o, test.jsx3Class);
    jsunit.assertEquals(9, o.getValue());
  };

  t.testIsInstance = function() {
    var c = test.jsx3Class.jsxclass;
    var o = new test.jsx3Class();
    jsunit.assertTrue(c.isInstance(o));
    jsunit.assertThrows(function() {
      return c.isInstance(null);
    });
    jsunit.assertFalse(c.isInstance(1));
    jsunit.assertFalse(c.isInstance(new Object()));
    jsunit.assertTrue(test.jsx3ClassSuper.jsxclass.isInstance(o));
    jsunit.assertTrue(test.jsx3ClassInterface.jsxclass.isInstance(o));
  };

  t.testIsAssignableFrom = function() {
    var c = test.jsx3Class.jsxclass;
    jsunit.assertTrue(c.isAssignableFrom(c));
    jsunit.assertThrows(function() {
      return c.isAssignableFrom(null);
    });
    jsunit.assertFalse(c.isAssignableFrom(test.jsx3ClassSuper.jsxclass));
    jsunit.assertFalse(c.isAssignableFrom(test.jsx3ClassInterface.jsxclass));
    jsunit.assertTrue(test.jsx3ClassSuper.jsxclass.isAssignableFrom(c));
    jsunit.assertTrue(test.jsx3ClassInterface.jsxclass.isAssignableFrom(c));
    jsunit.assertFalse(test.jsx3ClassSuper.jsxclass.isAssignableFrom(test.jsx3ClassInterface.jsxclass));
    jsunit.assertFalse(test.jsx3ClassInterface.jsxclass.isAssignableFrom(test.jsx3ClassSuper.jsxclass));
  };

  t.testMixin = function() {
    var o = new Object();
    jsunit.assertUndefined(o.getValue);

    var c = test.jsx3Class.jsxclass;
    c.mixin(o);
    jsunit.assertInstanceOf(o.getValue, Function);
    o.value = 79;
    jsunit.assertEquals(o.value, o.getValue());

    var getVal = function() {};
    o = new Object();
    o.getValue = getVal;
    c.mixin(o, true);
    jsunit.assertEquals(getVal, o.getValue);
    c.mixin(o);
    jsunit.assertNotEquals(getVal, o.getValue);
  };

  t.testBless = function() {
    var c = test.jsx3Class.jsxclass;
    var m = {f1:"v1", f2:"v2", fct: function() {}};
    var o = c.bless(m);

    jsunit.assertInstanceOf(o, test.jsx3Class);
    jsunit.assertEquals("v1", o.f1);
    jsunit.assertEquals("v2", o.f2);
    jsunit.assertUndefined(o.fct);
    jsunit.assertUndefined(o.inited);
  };

  t.testNewInnerClass = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var o = c.newInnerClass(15);
    jsunit.assertInstanceOf(o, test.jsx3Class);
    jsunit.assertEquals(15, o.getValue());

    c = jsx3.lang.Class.forName("test.jsx3ClassInterface");
    o = c.newInnerClass();
    jsunit.assertInstanceOf(o, test.jsx3ClassInterface);
    o.setValue(20);
    jsunit.assertUndefined(o.getValue);
    jsunit.assertEquals(20, o.value);
  };

  t.testStaticMethods = function() {
    var c = jsx3.lang.Class.forName("test.jsx3ClassSuper");
    var m = c.getStaticMethods();
    jsunit.assertEquals(1, m.length);
    jsunit.assertEquals(test.jsx3ClassSuper.getDefaultValue.jsxmethod, m[0]);

    jsunit.assertEquals(test.jsx3ClassSuper.getDefaultValue.jsxmethod, c.getStaticMethod("getDefaultValue"));
    jsunit.assertNull(c.getStaticMethod("setDefaultValue"));

    c = jsx3.lang.Class.forName("test.jsx3Class");
    m = c.getStaticMethods();
    jsunit.assertEquals(0, m.length);
  };

  t.testInstanceMethods = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var m = c.getInstanceMethods();

    jsunit.assertEquals(6, m.length);
    jsunit.assertInstanceOf(c.getInstanceMethod("isOn"), jsx3.lang.Method);
    jsunit.assertInstanceOf(c.getInstanceMethod("setOn"), jsx3.lang.Method);
    jsunit.assertNull(c.getInstanceMethod("foo"));
    jsunit.assertNull(c.getInstanceMethod("setValue")); // not inherited
  };

  t.testStaticFields = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var f = c.getStaticFieldNames();
    jsunit.assertEquals(1, f.length);
    jsunit.assertEquals("sField", f[0]);
  };

  t.testInstanceFields = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var f = c.getInstanceFieldNames();
    jsunit.assertEquals(1, f.length);
    jsunit.assertEquals("iField", f[0]);
  };

  t.testGettersSetters = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    jsunit.assertEquals(test.jsx3Class.prototype.getValue.jsxmethod, c.getGetter("value"));
    // will find inherited getters and setters
    jsunit.assertEquals(test.jsx3ClassInterface.prototype.setValue.jsxmethod, c.getSetter("value"));
    jsunit.assertEquals(test.jsx3Class.prototype.isOn.jsxmethod, c.getGetter("on"));
    jsunit.assertEquals(test.jsx3Class.prototype.setOn.jsxmethod, c.getSetter("on"));
    jsunit.assertNull(c.getGetter("foo"));
    jsunit.assertNull(c.getSetter("foo"));
  };

  t.testInterfaces = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    try {
      var o1 = new test.jsx3Class();
      jsx3.Class.defineInterface("test.jsx3ClassInterface2", null, function(C, P) {
        P.newMethod = function() {};
      });
      jsunit.assertNotNullOrUndef(test.jsx3ClassInterface2);
      c.addInterface(test.jsx3ClassInterface2.jsxclass);

      var o2 = new test.jsx3Class();

      jsunit.assertTrue(o1.instanceOf("test.jsx3ClassInterface2"));
      jsunit.assertInstanceOf(o1.newMethod, Function); // would be inserted into the prototype, so method carries over
      jsunit.assertTrue(o2.instanceOf("test.jsx3ClassInterface2"));
      jsunit.assertInstanceOf(o2.newMethod, Function);

      var interfaces = c.getInterfaces();
      jsunit.assertEquals(test.jsx3ClassInterface2.jsxclass, interfaces[0]);      
    } finally {
      delete test.jsx3ClassInterface2;
    }
  };

  t.testGetClasses = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");
    var classes = c.getClasses();
    jsunit.assertEquals(1, classes.length);
    jsunit.assertEquals(test.jsx3Class.Inner.jsxclass, classes[0]);
  };

  t.testInheritance = function() {
    var c = jsx3.lang.Class.forName("test.jsx3Class");

    jsunit.assertEquals(test.jsx3ClassSuper.jsxclass, c.getSuperClass());

    var interfaces = c.getInterfaces();
    jsunit.assertEquals(1, interfaces.length);
    jsunit.assertEquals(test.jsx3ClassInterface.jsxclass, interfaces[0]);

    jsunit.assertUndefined(test.jsx3ClassInterface.jsxclass.getSuperClass());
    jsunit.assertEquals(jsx3.lang.Object.jsxclass, test.jsx3ClassSuper.jsxclass.getSuperClass());
  };

  t.testJsxSuper = function() {
    var o = new test.jsx3Class();
    jsunit.assertEquals("x1", o.getX());
    jsunit.assertEquals("y2", o.getY());
  };

/* Doesn't actually throw an error, just an alert or FATAL log.
  t.testRedefine = function() {
    jsunit.assertThrows(function() {
      jsx3.lang.Class.defineClass("test.jsx3Class", null, null, function(C, P){
      });
    });
  };
*/

});
