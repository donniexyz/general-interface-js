/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.app.Model", function(t, jsunit) {

  jsunit.require("jsx3.app.Model", "jsx3.gui.Painted");

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

  t.testLoad = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    jsunit.assertInstanceOf(root, jsx3.app.Model);
  };
  
  t.testGetChildInt = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var c1 = root.getChild(0);
    jsunit.assertInstanceOf(c1, jsx3.app.Model);
    jsunit.assertEquals("child1", c1.getName());

    jsunit.assertNullOrUndef(root.getChild(10));
    jsunit.assertNullOrUndef(root.getChild(11));
  };

  t.testGetChildStr = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var c1 = root.getChild("child1");
    jsunit.assertInstanceOf(c1, jsx3.app.Model);
    jsunit.assertEquals("child1", c1.getName());

    jsunit.assertNullOrUndef(root.getChild("childX"));
    jsunit.assertNullOrUndef(root.getChild("0"));
  };

  t.testChildIndex1 = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var children = root.getChildren();
    for (var i = 0; i < children.length; i++)
      jsunit.assertEquals(i, children[i].getChildIndex());
  };

  t.testChildIndex2 = function() {
    var o = new jsx3.app.Model("abandoned");
    jsunit.assertEquals(-1, o.getChildIndex());
  };

  t.testFirstChild = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("child1", root.getFirstChild().getName());
    jsunit.assertEquals(root.getChildren()[0], root.getFirstChild());
    jsunit.assertNullOrUndef(root.getChildren()[0].getFirstChild());
  };

  t.testLastChild = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("lastChild", root.getLastChild().getName());
    jsunit.assertEquals(root.getChildren()[root.getChildren().length - 1], root.getLastChild());
    jsunit.assertNullOrUndef(root.getChildren()[0].getLastChild());
  };

  t.testNextSibling = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertNullOrUndef(root.getNextSibling());

    var children = root.getChildren();
    jsunit.assertEquals(children[1], children[0].getNextSibling());
    jsunit.assertNullOrUndef(children[children.length-1].getNextSibling());
  };

  t.testPreviousSibling = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertNullOrUndef(root.getPreviousSibling());

    var children = root.getChildren();
    jsunit.assertEquals(children[0], children[1].getPreviousSibling());
    jsunit.assertNullOrUndef(children[0].getPreviousSibling());
  };

  t.testGetChildren1 = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var children = root.getChildren();
    jsunit.assertInstanceOf(children, Array);
    jsunit.assertEquals(4, children.length);

    var grandchildren = children[0].getChildren();
    jsunit.assertInstanceOf(grandchildren, Array);
    jsunit.assertEquals(0, grandchildren.length);
  };

  t.testGetChildren2 = function() {
    var o = new jsx3.app.Model("abandoned");
    var children = o.getChildren();
    jsunit.assertInstanceOf(children, Array);
    jsunit.assertEquals(0, children.length);
  };

  t.testGetParent1 = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var children = root.getChildren();
    jsunit.assertEquals(root, children[0].getParent());
  };

  t.testGetParent2 = function() {
    var o = new jsx3.app.Model("abandoned");
    jsunit.assertNullOrUndef(o.getParent());
  };

  t.testGetNs = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals(s.getEnv("namespace"), root.getNS());
    jsunit.assertEquals(s.getEnv("namespace"), root.getChild(0).getNS());
  };

  t.testGetMeta = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("Component 1", root.getMetaValue("name"));
    jsunit.assertEquals("icon.gif", root.getMetaValue("icon"));
    jsunit.assertEquals("Component Description", root.getMetaValue("description"));
    jsunit.assertThrows(function() { root.getMetaValue("foobar"); }, jsx3.Exception);
    jsunit.assertEquals("", root.getChild(0).getMetaValue("name"));
  };

  t.testVariants = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals(1, root.v1);
    jsunit.assertEquals(2, root.v2);
    jsunit.assertNullOrUndef(root.v3);
  };

  t.testArrayVariants = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var a = root.a1;
    jsunit.assertInstanceOf(a, Array);
    jsunit.assertEquals(4, a.length);
    jsunit.assertEquals(1, a[0]);
    jsunit.assertEquals(4, a[3]);
  };

  t.testStrings = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    jsunit.assertEquals("1", root.s1);
    jsunit.assertEquals("2", root.s2);
    jsunit.assertNullOrUndef(root.s3);
  };

  t.testFindDescendants = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match = root.findDescendants(function(x) { return x.getName() == "nestedChild"; });
    jsunit.assertEquals("nestedChild", match.getName());
    jsunit.assertEquals(3, match.f1);
  };

  t.testFindDescendantsMultiple = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var matches = root.findDescendants(function(x) { return x.getName() == "nestedChild"; }, null, true);
    jsunit.assertEquals("nestedChild", matches[0].getName());
    jsunit.assertEquals("nestedChild", matches[1].getName());
    jsunit.assertNotEquals(matches[0], matches[1]);
  };

  t.testFindDescendantsBreadthDepth = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.findDescendants(function(x) { return x.f1 == 3; });
    jsunit.assertEquals("10", match1.getName());

    var match2 = root.findDescendants(function(x) { return x.f1 == 3; }, true);
    jsunit.assertEquals("nestedChild", match2.getName());
  };

  t.testFindDescendantsShallow = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var matches = root.findDescendants(function(x) { return x.f1 == 3; }, null, true, true);
    jsunit.assertEquals(1, matches.length);
    jsunit.assertEquals("10", matches[0].getName());
  };

  t.testFindDescendantsSelf = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.findDescendants(function(x) { return true; }, false, false, false, true);
    jsunit.assertEquals("root", match1.getName());

    var match2 = root.findDescendants(function(x) { return true; }, false, false, false, false);
    jsunit.assertEquals("child1", match2.getName());
  };

  t.testFindAncestor = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.findAncestor(function(x) { return true; });
    jsunit.assertEquals(root.getParent(), match1);

    var match2 = root.findAncestor(function(x) { return x.getName() == "JSXROOT"; });
    jsunit.assertEquals(root.getServer().getRootBlock(), match2);
  };

  t.testSelectId = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("#child1");
    jsunit.assertEquals(1, match1.length);

    var match2 = root.selectDescendants("#nestedChild");
    jsunit.assertEquals(2, match2.length);

    var match3 = root.selectDescendants("#none");  
    jsunit.assertEquals(0, match3.length);
  };

  t.testSelectDescendant = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("#child2 #child2");
    jsunit.assertEquals(1, match1.length);
    jsunit.assertEquals(2, match1[0].f1);

    var match2 = root.selectDescendants("#child2 #lastChild");
    jsunit.assertEquals(0, match2.length);

    var match3 = root.selectDescendants("#none #child2");
    jsunit.assertEquals(0, match3.length);

    // Test the optimized code for selecting from root
    var match4 = s.getRootBlock().selectDescendants("#none #child2");
    jsunit.assertEquals(0, match4.length);
  };

  t.testSelectDirectDescendant = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("#root > #lastChild");
    jsunit.assertEquals(1, match1.length);

    var match2 = root.selectDescendants("#root > #nestedChild");
    jsunit.assertEquals(0, match2.length);
  };

  t.testSelectStar = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("#child2 *");
    jsunit.assertEquals(3, match1.length);
  };

  t.testSelectIndex = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("#root > :first");
    jsunit.assertEquals(1, match1.length);
    jsunit.assertEquals("child1", match1[0].getName());

    var match2 = root.selectDescendants("#root > :last");
    jsunit.assertEquals(1, match2.length);
    jsunit.assertEquals("lastChild", match2[0].getName());

    var match3 = root.selectDescendants("#root > :nth(1)");
    jsunit.assertEquals(1, match3.length);
    jsunit.assertEquals("child2", match3[0].getName());
  };

  t.testSelectType = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("#root > jsx3_app_Model");
    jsunit.assertEquals(3, match1.length);

    var match2 = root.selectDescendants("#root > :instanceof(jsx3.app.Model)");
    jsunit.assertEquals(4, match2.length);
  };

  t.testSelectProperty = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("[f1=3]");
    jsunit.assertEquals(2, match1.length);
  };

  t.testSelectGetter = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var match1 = root.selectDescendants("[getName()=lastChild]");
    jsunit.assertEquals(1, match1.length);
    jsunit.assertEquals("lastChild", match1[0].getName());

    var match2 = root.selectDescendants('[getName()="lastChild"]');
    jsunit.assertEquals(1, match2.length);
    jsunit.assertEquals("lastChild", match2[0].getName());
  };

  t.testGetAncestorOfName = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getChild(1).getChild(0).getChild(0);
    jsunit.assertEquals("nestedChild", o.getName());

    var a = o.getAncestorOfName("child2");
    jsunit.assertNotNullOrUndef(a);
    jsunit.assertEquals(2, a.f1);

    a = o.getAncestorOfName("root");
    jsunit.assertEquals(root, a);

    a = o.getAncestorOfName("foobar");
    jsunit.assertNullOrUndef(a);
  };

  t.testGetAncestorOfType = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getChild(1).getChild(0).getChild(0);
    jsunit.assertEquals("nestedChild", o.getName());

    var a = o.getAncestorOfType(jsx3.app.Model);
    jsunit.assertNotNullOrUndef(a);
    jsunit.assertEquals(2, a.f1);

    o = root.getChild(1).getChild(0);
    a = o.getAncestorOfType(jsx3.gui.Painted);
    jsunit.assertEquals(1, a.f1);
    a = o.getAncestorOfType(jsx3.app.Model);
    jsunit.assertEquals(1, a.f1);

    o = root.getChild(1);
    jsunit.assertEquals(root, a.getAncestorOfType(jsx3.app.Model));
    jsunit.assertEquals(root, a.getAncestorOfType("jsx3.app.Model"));
    jsunit.assertEquals(root, a.getAncestorOfType(jsx3.app.Model.jsxclass));
    jsunit.assertThrows(function() { a.getAncestorOfType("foobar"); }, jsx3.Exception);
  };

  t.testGetDescendantOfName = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getChild(1).getChild(0);
    var d = o.getDescendantOfName("nestedChild");
    jsunit.assertNotNullOrUndef(d);
    jsunit.assertEquals(3, d.f1);

    jsunit.assertNullOrUndef(root.getDescendantOfName("foobar"));
  };

  t.testGetDescendantsOfType = function() {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");

    var o = root.getDescendantsOfType(jsx3.app.Model, true);
    jsunit.assertInstanceOf(o, Array);
    jsunit.assertEquals(4, o.length);
    jsunit.assertEquals(root.getChild(0), o[0]);

    o = root.getDescendantsOfType(jsx3.app.Model);
    jsunit.assertInstanceOf(o, Array);
    jsunit.assert(4 < o.length);

    o = root.getDescendantsOfType(jsx3.gui.Painted);
    jsunit.assertInstanceOf(o, Array);
    jsunit.assertEquals(1, o.length);
    jsunit.assertEquals(1, o[0].f1);
  };

  t.testDetachedSetChild = function() {
    var parent = new jsx3.app.Model("m1");
    var child = new jsx3.app.Model("m2");
    parent.setChild(child);

    jsunit.assertEquals(1, parent.getChildren().length);
    jsunit.assertEquals(child, parent.getChildren()[0]);
  };

  t.testDetachedRemoveChild = function() {
    var parent = new jsx3.app.Model("m1");
    var child = new jsx3.app.Model("m2");
    parent.setChild(child);

    jsunit.assertEquals(1, parent.getChildren().length);

    parent.removeChild(child)
    jsunit.assertEquals(0, parent.getChildren().length);
  };

  t.testDetachedAdoptChild = function() {
    var p1 = new jsx3.app.Model("p1");
    var p2 = new jsx3.app.Model("p2");
    var child = new jsx3.app.Model("c1");

    p1.setChild(child);
    p2.adoptChild(child);

    jsunit.assertEquals(0, p1.getChildren().length);
    jsunit.assertEquals(1, p2.getChildren().length);
  };

  t.testDetachedClone = function() {
    var parent = new jsx3.app.Model("p1");
    var child = new jsx3.app.Model("c1");

    parent.setChild(child);
    var clone = child.doClone();

    jsunit.assertEquals(2, parent.getChildren().length);
    jsunit.assertEquals(child, parent.getChildren()[0]);
    jsunit.assertEquals(clone, parent.getChildren()[1]);
  };

  t.testDetachedInsertBefore = function() {
    var parent = new jsx3.app.Model("p1");
    var c1 = new jsx3.app.Model("c1");
    var c2 = new jsx3.app.Model("c2");

    parent.setChild(c1);
    parent.insertBefore(c2, c1, false);

    jsunit.assertEquals(2, parent.getChildren().length);
    jsunit.assertEquals(c2, parent.getChildren()[0]);
    jsunit.assertEquals(c1, parent.getChildren()[1]);
  };

  t.testDetachedRemoveChildren = function() {
    var parent = new jsx3.app.Model("p1");
    var c1 = new jsx3.app.Model("c1");
    var c2 = new jsx3.app.Model("c2");

    parent.setChild(c1);
    parent.setChild(c2);
    parent.removeChildren();

    jsunit.assertEquals(0, parent.getChildren().length);
  };

//  t.testGetFirstChildOfType = function() {
//    // TODO:
//  };
//
//  t.testSetChild = function() {
//    // TODO:
//  };
//
//  t.testRemoveChild = function() {
//    // TODO:
//  };
//
//  t.testRemoveChildren = function() {
//    // TODO:
//  };

});
