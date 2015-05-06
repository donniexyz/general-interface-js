/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("ext", function(t, jsunit) {

  jsunit.require("jsx3.$Y", "jsx3.jsxpackage", "jsx3.util.jsxpackage", "jsx3.util.EventDispatcher");

  t.testOExtend = function() {
    var o = {k1:"v1"};
    jsx3.$O(o).extend({k1:"v1'", k2:"v2"});

    jsunit.assertEquals("v1'", o.k1);
    jsunit.assertEquals("v2", o.k2);
  };

  t.testOClone = function() {
    var o = jsx3.$O({k1:"v1"}).clone();
    jsunit.assertEquals("v1", o.k1);
  };

  t.testANew1 = function() {
    var a = jsx3.$A();
    jsunit.assertTrue(a instanceof Array);
    jsunit.assertTypeOf(a.each, "function");
    jsunit.assertEquals(0, a.length);

    a = jsx3.$A(null);
    jsunit.assertEquals(0, a.length);
  };

  t.testANew2 = function() {
    var a = jsx3.$A(5);
    jsunit.assertTrue(a instanceof Array);
    jsunit.assertEquals(1, a.length);
    jsunit.assertEquals(5, a[0]);
  };

  t.testANew3 = function() {
    var a = jsx3.$A(["a", "b"]);
    jsunit.assertTrue(a instanceof Array);
    jsunit.assertEquals(2, a.length);
    jsunit.assertEquals("a", a[0]);

    a = jsx3.$A([null]);
    jsunit.assertEquals(1, a.length);
  };

  t.testAEach = function() {
    var a = jsx3.$A([1, 2, 3, 4, 5]);
    var sum = 0;
    a.each(function(e) { sum += e; });
    jsunit.assertEquals(15, sum);
  };

  t.testAMap = function() {
    var a = jsx3.$A([1, 2, 3, 4, 5]);
    var b = a.map(function(e) { return 10 * e; });
    jsunit.assertTrue(b instanceof Array);
    jsunit.assertTypeOf(b.each, "function");
    jsunit.assertEquals(5, b.length);
    jsunit.assertEquals(10, b[0]);
  };

  t.testAFilter = function() {
    var a = jsx3.$A([1, 2, 3, 4, 5]);
    var b = a.filter(function(e) { return e % 2 == 0; });
    jsunit.assertTrue(b instanceof Array);
    jsunit.assertTypeOf(b.each, "function");
    jsunit.assertEquals(2, b.length);
    jsunit.assertEquals(2, b[0]);
  };

  t.testAIndexOf = function() {
    var a = jsx3.$A([1, 2, 3, 4, 5]);
    jsunit.assertEquals(1, a.indexOf(2));
    jsunit.assertEquals(-1, a.indexOf(10));
    jsunit.assertEquals(-1, a.indexOf("3"));
  };

  t.testAContains = function() {
    var a = jsx3.$A([1, 2, 3, 4, 5]);
    jsunit.assertTrue(a.contains(3));
    jsunit.assertTrue(a.contains(5));
    jsunit.assertFalse(a.contains(10));
    jsunit.assertFalse(a.contains("3"));
    jsunit.assertFalse(a.contains(null));
  };

  t.testARemove = function() {
    var a = jsx3.$A([1, 2, 3, 4, 5]);
    a.remove(3);
    jsunit.assertEquals(4, a.length);
    a.remove("4");
    jsunit.assertEquals(4, a.length);
  };

  t.testAFind = function() {
    var a = jsx3.$A([1, 2, 3, 4, 5]);
    jsunit.assertEquals(3, a.find(function(e) { return e % 3 == 0; }));
    jsunit.assertUndefined(a.find(function(e) { return e % 7 == 0; }));
  };

  t.testAUnique = function() {
    var a = jsx3.$A([1, 2, 1, 1, 5, 2]);
    var b = a.unique();
    jsunit.assertEquals(3, b.length);
    jsunit.assertEquals(1, b[0]);
    jsunit.assertEquals(2, b[1]);
    jsunit.assertEquals(5, b[2]);
  };

  t.testHEach = function() {
    var o = new jsx3.lang.Object();
    o.k1 = 1;
    o.k2 = 2;
    var sum = 0;
    jsx3.$H(o).each(function(k, v) { sum += v; });
    jsunit.assertEquals(3, sum);
  };

  t.testHKeys = function() {
    var o = jsx3.$H({a:1, b:2, c:3});
    var k = o.keys();
    jsunit.assertEquals(3, k.length);
    jsunit.assertTrue(k.contains("a"));
    jsunit.assertTrue(k.contains("b"));
    jsunit.assertTrue(k.contains("c"));
  };

  t.testHValues = function() {
    var o = jsx3.$H({a:1, b:2, c:3});
    var k = o.values();
    jsunit.assertEquals(3, k.length);
    jsunit.assertTrue(k.contains(1));
    jsunit.assertTrue(k.contains(2));
    jsunit.assertTrue(k.contains(3));
  };

  t.testFBind1 = function() {
    var f = jsx3.$F(function() { return this; }).bind({k:"v"});
    jsunit.assertEquals("v", f().k);
  };

  t.testFBind2 = function() {
    var f = jsx3.$F(function(a, b, c) { return a + b + c; }).bind(null, [0, 1, 2]);
    jsunit.assertEquals(3, f());
  };

  t.testSEndsWith = function() {
    jsunit.assertTrue(jsx3.$S("abc").endsWith("c"));
    jsunit.assertTrue(jsx3.$S("xyz").endsWith("yz"));
    jsunit.assertFalse(jsx3.$S("123").endsWith("1"));
  };

  t.testSTrim = function() {
    jsunit.assertEquals("", jsx3.$S("   ").trim().toString());
    jsunit.assertEquals("", jsx3.$S(" \n \t ").trim().toString());
    jsunit.assertEquals("a z", jsx3.$S(" a z  ").trim().toString());
  };

  t.testYFctSync = function() {
    var f = jsx3.$Y(function(cb) {
      cb.done(1);
    });
    var rv = f();
    jsunit.assertEquals(1, rv.rv());
  };

  t.testYFctArgs = function() {
    var f = jsx3.$Y(function(cb) {
      var args = cb.args();
      jsunit.assertEquals(0, args[0]);
      jsunit.assertEquals(1, args[1]);
      jsunit.assertEquals(2, args[2]);
      cb.done(1);
    });
    f(0, 1, 2);
  };

  t.testYSyncError = function() {
    var f = jsx3.$Y(function(cb) {
      jsx3.sleep(function() { cb.done(1); });
    });

    var rv = f();
    jsunit.assertThrows(function() {
      rv.rv();
    });
  };

  t.testYFctASync = function() {
    var f = jsx3.$Y(function(cb) {
      jsx3.sleep(function() { cb.done(1); });
    });

    var rv = f();
    rv.when(t.asyncCallback(function() {
      jsunit.assertEquals(1, rv.rv());
    }));
  };
  t.testYFctASync._async = true;

  t.testYAnd = function() {
    var ct = 0;

    var f1 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        jsunit.assertTrue(0 == ct || 1 == ct);
        ct++;
        cb.done();
      });
    });

    var f2 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        jsunit.assertTrue(0 == ct || 1 == ct);
        ct++;
        cb.done();
      });
    });

    var rv1 = f1();
    var rv2 = f2();

    rv1.and(rv2).when(t.asyncCallback(function() {
      jsunit.assertEquals(2, ct);
    }));
  };
  t.testYAnd._async = true;

  t.testYRvChain = function() {
    var f1 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        cb.done(1);
      });
    });

    var f2 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        f1().when(cb);
      });
    });

    var rv = f2();

    rv.when(t.asyncCallback(function() {
      jsunit.assertEquals(1, rv.rv());
    }));
  };
  t.testYRvChain._async = true;

  t.testYOr = function() {
    var ct = 0;

    var f1 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        jsunit.assertTrue(0 == ct || 1 == ct);
        ct++;
        cb.done();
      });
    });

    var f2 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        jsunit.assertTrue(0 == ct || 1 == ct);
        ct++;
        cb.done();
      });
    });

    var rv1 = f1();
    var rv2 = f2();

    rv1.or(rv2).when(t.asyncCallback(function() {
      jsunit.assertEquals(1, ct);
    }));
  };
  t.testYOr._async = true;

  t.testYAsyncParam = function() {
    var f1 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        cb.done(1);
      });
    });

    var f2 = jsx3.$Y(function(cb) {
      var a = cb.args()[0];
      cb.done(1 + a);
    });

    var rv = f2(f1());

    rv.when(t.asyncCallback(function() {
      jsunit.assertEquals(2, rv.rv());
    }));
  };
  t.testYAsyncParam._async = true;

  t.testYAsyncReturn = function() {
    var f1 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        cb.done(1);
      });
    });

    var f2 = jsx3.$Y(function(cb) {
      return f1();
    });

    var rv = f2();

    rv.when(t.asyncCallback(function() {
      jsunit.assertEquals(1, rv.rv());
    }));
  };
  t.testYAsyncReturn._async = true;

  t.testYWrapper1 = function() {
    var f = function () {
      return 1;
    };

    var rv = jsx3.$Z(f)();

    jsunit.assertEquals(1, rv.rv());
  };

  t.testYWrapper2 = function() {
    var f = function (n) {
      return n * 2;
    };

    var rv = jsx3.$Z(f)(5);

    jsunit.assertEquals(10, rv.rv());
  };

  t.testYWrapper3 = function() {
    var arg1 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        cb.done(10);
      });
    });

    var f = function (n) {
      return n * 2;
    };

    var rv = jsx3.$Z(f)(arg1());

    rv.when(t.asyncCallback(function() {
      jsunit.assertEquals(20, rv.rv());
    }));
  };
  t.testYWrapper3._async = true;

  t.testYWrapper4 = function() {
    var objThis = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        cb.done({run: function(a) {
          return a;
        }});
      });
    });

    var arg1 = jsx3.$Y(function(cb) {
      jsx3.sleep(function() {
        cb.done(10);
      });
    });

    var rv = jsx3.$Z("run", objThis())(arg1());

    rv.when(t.asyncCallback(function() {
      jsunit.assertEquals(10, rv.rv());
    }));
  };
  t.testYWrapper4._async = true;

  t.testYWrapper5 = function() {
    var f = function () {
      return this.k + 1;
    };

    var rv = jsx3.$Z(f).apply({k:10});

    jsunit.assertEquals(11, rv.rv());
  };

});
