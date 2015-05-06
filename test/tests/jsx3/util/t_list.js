/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.util.List", function(t, jsunit) {

  jsunit.require("jsx3.util.List");

  t.testDefined = function() {
    jsunit.assertNotNull(jsx3.lang.Class.forName("jsx3.util.List"));    
    jsunit.assertInstanceOf(jsx3.util.List, Function);
  };

  t.testWrap = function() {
    var a = [1, 2, 3];
    var l = jsx3.util.List.wrap(a);

    jsunit.assertInstanceOf(l, jsx3.util.List);
    jsunit.assertEquals(3, l.size());
    jsunit.assertEquals(1, l.get(0));

    a.pop();
    jsunit.assertEquals(2, l.size());

    jsunit.assertEquals(l, jsx3.util.List.wrap(l));

    jsunit.assertThrows(function(){
      return jsx3.util.List.wrap({});
    });
  };

  t.testNew = function() {
    var l = new jsx3.util.List(5);
    jsunit.assertEquals(5, l.size());
    jsunit.assertNullOrUndef(l.get(0));

    var a = [1, 2, 3];
    l = new jsx3.util.List(a);
    jsunit.assertEquals(3, l.size());
    jsunit.assertEquals(1, l.get(0));
    a.pop();
    jsunit.assertEquals(3, l.size());

    var l2 = new jsx3.util.List(l);
    jsunit.assertFalse(l == l2);
    jsunit.assertEquals(l, l2);
    jsunit.assertEquals(3, l2.size());
    l.remove(0);
    jsunit.assertEquals(3, l2.size());

    l = new jsx3.util.List();
    jsunit.assertEquals(0, l.size());
  };

  t.testSize = function() {
    var l = new jsx3.util.List();
    jsunit.assertEquals(0, l.size());
    l.add("a");
    jsunit.assertEquals(1, l.size());
    l.add("b");
    jsunit.assertEquals(2, l.size());
  };

  t.testGet = function() {
    var l = new jsx3.util.List(["a", "b", "c", "d"]);
    jsunit.assertEquals("a", l.get(0));
    jsunit.assertEquals("d", l.get(3));
    jsunit.assertNullOrUndef(l.get(4));
    jsunit.assertNullOrUndef(l.get(-1));
  };

  t.testSet = function() {
    var l = new jsx3.util.List(["a", "b", "c", "d"]);
    jsunit.assertEquals("b", l.get(1));
    l.set(1, "z");
    jsunit.assertEquals("z", l.get(1));
    jsunit.assertEquals(4, l.size());
  };

  t.testClear = function() {
    var l = new jsx3.util.List(["a", "b", "c", "d"]);
    jsunit.assertEquals(4, l.size());
    l.clear();
    jsunit.assertEquals(0, l.size());
    jsunit.assertNullOrUndef(l.get(0));
  };

  t.testIndexOf = function() {
    var l = new jsx3.util.List(["a", "b", "c", "c"]);
    jsunit.assertEquals(2, l.indexOf("c"));
    jsunit.assertEquals(-1, l.indexOf("z"));

    l = new jsx3.util.List([1, 2, 3, 4]);
    jsunit.assertEquals(2, l.indexOf(3));
    jsunit.assertEquals(-1, l.indexOf("3"));

    var o = new Object();
    l = new jsx3.util.List([new Object(), new Object(), o, new Object()]);
    jsunit.assertEquals(2, l.indexOf(o));
    jsunit.assertEquals(-1, l.indexOf(new Object()));
  };

  t.testLastIndexOf = function() {
    var l = new jsx3.util.List(["a", "b", "c", "b"]);
    jsunit.assertEquals(2, l.lastIndexOf("c"));
    jsunit.assertEquals(3, l.lastIndexOf("b"));
    jsunit.assertEquals(-1, l.lastIndexOf("z"));
  };

  t.testContains = function() {
    var l = new jsx3.util.List(["a", "2", "c", "4"]);
    jsunit.assertTrue(l.contains("a"));
    jsunit.assertTrue(l.contains("2"));
    jsunit.assertFalse(l.contains(2));
    jsunit.assertFalse(l.contains(null));
  };

  t.testRemove = function() {
    var l = new jsx3.util.List(["a", "2", "c", "4"]);
    var o = l.remove("c");
    jsunit.assertEquals("c", o);
    jsunit.assertEquals(new jsx3.util.List(["a", "2", "4"]), l);
    jsunit.assertNull(l.remove("z"));
  };

  t.testClone = function() {
    var l = new jsx3.util.List(["a", "2", "c", "4"]);
    var c = l.clone();
    jsunit.assertFalse(l == c);
    jsunit.assertEquals(l, c);
  };

  t.testAdd = function() {
    var l = new jsx3.util.List([1, 2, 3]);
    l.add(9);
    jsunit.assertEquals(4, l.size());
    l.add(9);
    jsunit.assertEquals(5, l.size());
    jsunit.assertEquals(9, l.get(4));
  };

  t.testAddAll = function() {
    var l = new jsx3.util.List([1, 2, 3]);
    l.addAll(["x", "y", "z"]);
    jsunit.assertEquals(6, l.size());
    jsunit.assertEquals("y", l.get(4));

    l = new jsx3.util.List([1, 2, 3]);
    var l2 = new jsx3.util.List(["x", "y", "z"]);
    l.addAll(l2);
    jsunit.assertEquals(6, l.size());
    jsunit.assertEquals("y", l.get(4));

    jsunit.assertThrows(function(){
      return l.addAll(1, 2, 3);
    });
  };

  t.testEquals = function() {
    var l1 = new jsx3.util.List([1, 2, 3]);
    var l2 = new jsx3.util.List();
    var l3 = new jsx3.util.List([1, "2", 3]);
    var l4 = new jsx3.util.List();
    l4.addAll([1, 2, 3]);

    jsunit.assertTrue(l1.equals(l1));
    jsunit.assertTrue(l1.equals(l4));
    jsunit.assertTrue(l4.equals(l1));
    jsunit.assertTrue(l2.equals(l2));
    jsunit.assertFalse(l1.equals(l2));
    jsunit.assertFalse(l1.equals(l3));
    jsunit.assertFalse(l2.equals(l3));
    jsunit.assertFalse(l3.equals(l4));
  };

  t.testFilter = function() {
    var l1 = new jsx3.util.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    var l2 = l1.filter(function(x) { return x % 2 == 0; });
    jsunit.assertEquals(new jsx3.util.List([2, 4, 6, 8, 10]), l2);
    jsunit.assertEquals(10, l1.size());

    jsunit.assertThrows(function(){
      return l1.filter(function(x) { return x.isOk(); });
    });
  };

  t.testMap1 = function() {
    var l1 = new jsx3.util.List([1, 2, 3, 4, 5]);
    var l2 = l1.map(function(x) { return x * 2; });
    jsunit.assertEquals(new jsx3.util.List([2, 4, 6, 8, 10]), l2);
    jsunit.assertEquals(new jsx3.util.List([1, 2, 3, 4, 5]), l1);
  };

  t.testMap2 = function() {
    var l1 = new jsx3.util.List([1, 2, 3, 4, 5]);
    var l2 = l1.map(function(x) {
      if (x % 2 == 0) return [x, x];
      else if (x % 3 == 0) return [];
      else return x;
    }, true);
    jsunit.assertEquals(new jsx3.util.List([1, 2, 2, 4, 4, 5]), l2);
  };

  t.testMap3 = function() {
    var l1 = new jsx3.util.List([1, 2, 3]);
    var o = l1.map(function(x) {
      return [String.fromCharCode("A".charCodeAt(0) + x - 1), x * 2];
    }, false, true);

    jsunit.assertInstanceOf(o, Object);
    jsunit.assertEquals(2, o.A);
    jsunit.assertEquals(4, o.B);
    jsunit.assertEquals(6, o.C);
    jsunit.assertUndefined(o.D);
  };

  t.testMap4 = function() {
    var l1 = new jsx3.util.List([1, 2, 3]);
    var o = l1.map(function(x) {
      return [String.fromCharCode("a".charCodeAt(0) + x - 1), x,
              String.fromCharCode("A".charCodeAt(0) + x - 1), x * 2];
    }, true, true);

    jsunit.assertInstanceOf(o, Object);
    jsunit.assertEquals(1, o.a);
    jsunit.assertEquals(2, o.b);
    jsunit.assertEquals(3, o.c);
    jsunit.assertEquals(2, o.A);
    jsunit.assertEquals(4, o.B);
    jsunit.assertEquals(6, o.C);
    jsunit.assertUndefined(o.D);
  };

  t.testIterator = function() {
    var l1 = new jsx3.util.List([1, 2, 3]);

    var i = l1.iterator();
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals(1, i.next());
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals(2, i.next());
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals(3, i.next());
    jsunit.assertFalse(i.hasNext());

    i = l1.iterator();
    jsunit.assertEquals(1, i.next());
    i.remove();
    jsunit.assertEquals(new jsx3.util.List([2, 3]), l1);
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals(2, i.next());
    jsunit.assertTrue(i.hasNext());
    jsunit.assertEquals(3, i.next());
    jsunit.assertFalse(i.hasNext());    
  };

  t.testSlice = function() {
    var l = new jsx3.util.List(["a", "b", "c", "d", "e"]);
    var s1 = l.slice(3);
    jsunit.assertEquals(new jsx3.util.List(["d", "e"]), s1);
    var s2 = l.slice(1, 2);
    jsunit.assertEquals(new jsx3.util.List(["b"]), s2);
    var s3 = l.slice(2, -1);
    jsunit.assertEquals(new jsx3.util.List(["c", "d"]), s3);
  };

  t.testRemoveAt1 = function() {
    var l = new jsx3.util.List(["a", "b", "c", "d", "e"]);
    var o = l.removeAt(2);
    jsunit.assertEquals("c", o);
    jsunit.assertEquals(new jsx3.util.List(["a", "b", "d", "e"]), l);
    l.removeAt(0);
    jsunit.assertEquals(new jsx3.util.List(["b", "d", "e"]), l);
    l.removeAt(5);
    jsunit.assertEquals(new jsx3.util.List(["b", "d", "e"]), l);
    l.removeAt(-2);
    jsunit.assertEquals(new jsx3.util.List(["b", "e"]), l);
  };

  t.testRemoveAt2 = function() {
    var l = new jsx3.util.List(["a", "b", "c", "d", "e"]);
    var s1 = l.removeAt(0, 2);
    jsunit.assertEquals(new jsx3.util.List(["a", "b"]), s1);
    jsunit.assertEquals(new jsx3.util.List(["c", "d", "e"]), l);
    var s2 = l.removeAt(2, 10);
    jsunit.assertEquals(new jsx3.util.List(["e"]), s2);
    jsunit.assertEquals(new jsx3.util.List(["c", "d"]), l);
  };

  t.testToArray1 = function() {
    var a1 = ["a", "b", "c", "d", "e"];
    var l1 = jsx3.util.List.wrap(a1);
    var a2 = l1.toArray();

    jsunit.assertFalse(a1 == a2);
    jsunit.assertEquals(a1.length, a2.length);
    jsunit.assertEquals(a1[0], a2[0]);
    jsunit.assertEquals(a1[1], a2[1]);

    l1.removeAt(0, 2);
    jsunit.assertEquals(5, a2.length);
  };

  t.testToArray2 = function() {
    var a1 = ["a", "b", "c", "d", "e"];
    var l1 = jsx3.util.List.wrap(a1);
    var a2 = l1.toArray(true);

    jsunit.assertTrue(a1 == a2);
    jsunit.assertEquals(a1.length, a2.length);
    jsunit.assertEquals(a1[0], a2[0]);
    jsunit.assertEquals(a1[1], a2[1]);

    l1.removeAt(0, 2);
    jsunit.assertEquals(3, a2.length);
  };

  t.testSort1 = function() {
    var l = new jsx3.util.List(["d", "b", "e", "c", "a"]);
    jsunit.assertNotEquals(l, new jsx3.util.List(["a", "b", "c", "d", "e"]));
    l.sort();
    jsunit.assertEquals(new jsx3.util.List(["a", "b", "c", "d", "e"]), l);
  };

  t.testSort2 = function() {
    var l = new jsx3.util.List(["10", "5", "1", "50", "15"]);
    var funct = function(a, b) {
      var da = parseInt(a); var db = parseInt(b);
      if (da > db) return 1;
      else if (da == db) return 0;
      return -1;
    };
    l.sort(funct);
    jsunit.assertEquals(new jsx3.util.List(["1", "5", "10", "15", "50"]), l);
  };

});
