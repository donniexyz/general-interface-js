/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.app.Model", function () {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.app.Model", "jsx3.gui.Painted");
  var t = new _jasmine_test.App("jsx3.app.Model");

  beforeEach(function () {
  });

  it("should deserialize the file and append the deserialized objects as children of this DOM node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root).toBeInstanceOf(jsx3.app.Model);
  });

  it("has method getChild(index) that will return the child node with the given index", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var c1 = root.getChild(0);
    expect(c1).toBeInstanceOf(jsx3.app.Model);

    expect(root.getChild("11")).toBeUndefined();
  });

  it("has method getChild(name) that will return the child node with given name", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var c1 = root.getChild("child1");
    expect(c1).toBeInstanceOf(jsx3.app.Model);
    expect(c1.getName()).toEqual("child1");
    expect(root.getChild("childX")).toBeUndefined();
    expect(root.getChild("0")).toBeUndefined();
  });

  it("has method getChildren() that return an array containing all the child nodes", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var children = root.getChildren();
    for (var i = 0; i < children.length; i++)
      expect(children[i].getChildIndex()).toEqual(i);
  });

  it("has method getChildIndex() that will return the zero-based index for this DOM node in relation to its siblings.", function () {
    var o = new jsx3.app.Model("abandoned");
    expect(o.getChildIndex()).toEqual(-1);
  });

  it("should return the first child of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getFirstChild().getName()).toEqual("child1");
    expect(root.getChildren()[0]).toEqual(root.getFirstChild());
    expect(root.getChildren()[0].getLastChild()).toBeNull();
  });

  it("should return the last child of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getLastChild().getName()).toEqual("lastChild");
    expect(root.getChildren()[root.getChildren().length - 1]).toEqual(root.getLastChild());
    expect(root.getChildren()[0].getLastChild()).toBeNull();
  });

  it("should return the Next Sibling of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getNextSibling()).toBeNull();
    var children = root.getChildren();
    expect(children[0].getNextSibling()).toEqual(children[1]);
    expect(children[children.length - 1].getNextSibling()).toBeNull();
  });

  it("should return the Previous Sibling of this DOM Node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getPreviousSibling()).toBeNull();
    var children = root.getChildren();
    expect(children[1].getPreviousSibling()).toEqual(children[0]);
    expect(children[0].getPreviousSibling()).toBeNull();
  });

  it("has method getChildren() that should return an array containing all the child nodes", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var children = root.getChildren();
    expect(children).toBeInstanceOf(Array);
    expect(children.length).toEqual(4);
    var grandchildren = children[0].getChildren();
    expect(grandchildren).toBeInstanceOf(Array);
    expect(grandchildren.length).toEqual(0);
  });

  it("has method getChildren() that should return an empty array when there is no children", function () {
    var o = new jsx3.app.Model("abandoned");
    var children = o.getChildren();
    expect(children).toBeInstanceOf(Array);
    expect(children.length).toEqual(0);
  });

  it("should return the parent DOM node of this object", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var children = root.getChildren();
    expect(children[0].getParent()).toEqual(root);
  });

  it("getParent() should return null when there is no parent node", function () {
    var o = new jsx3.app.Model("abandoned");
    expect(o.getParent()).toBeNull();
  });

  it("should return the namespace that distinguishes this object's server (owner) from other server instances", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getNS()).toEqual(s.getEnv("namespace"));
    expect(root.getChild(0).getNS()).toEqual(s.getEnv("namespace"));
  });

  it("has method getMetaValue() that retunrns the meta data values stored as part of the serialization file", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.getMetaValue("name")).toEqual("Component 1");
    expect(root.getMetaValue("icon")).toEqual("icon.gif");
    expect(root.getMetaValue("description")).toEqual("Component Description");
    var func = function () {
      root.getMetaValue("foobar");
    };
    expect(func).toThrowException(jsx3.lang.Exception);
    expect(root.getChild(0).getMetaValue("name")).toEqual("");
  });

  it("should process <variants> in serialization file as Number", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.v1).toEqual(1);
    expect(root.v2).toEqual(2);
    expect(root.s3).toBeUndefined();
  });

  it("should process variants with Array of Number", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var a = root.a1;
    expect(a).toBeInstanceOf(Array);
    expect(a.length).toEqual(4);
    expect(a[0]).toEqual(1);
    expect(a[3]).toEqual(4);
  });

  it("should process strings in serialization file as String", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    expect(root.s1).toEqual("1");
    expect(root.s2).toEqual("2");
    expect(root.s3).toBeUndefined();
  });

  it("has method findDescendants() that should find first child node with a given name as filter", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match = root.findDescendants(function (x) {
      return x.getName() == "nestedChild";
    });
    expect(match.getName()).toEqual("nestedChild");
    expect(match.f1).toEqual(3);
  });

  it("should find all child nodes descending from this node and have name 'nestedChild'", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var matches = root.findDescendants(function (x) {
      return x.getName() == "nestedChild";
    }, null, true);
    expect(matches[0].getName()).toEqual("nestedChild");
    expect(matches[1].getName()).toEqual("nestedChild");
    expect(matches[0]).not.toEqual(matches[1]);
  });

  it("should find all DOM nodes descending from this DOM node by doing breath first search and then depth first search", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.findDescendants(function (x) {
      return x.f1 == 3;
    });
    expect(match1.getName()).toEqual("10");
    var match2 = root.findDescendants(function (x) {
      return x.f1 == 3;
    }, true);
    expect(match2.getName()).toEqual("nestedChild");
  });

  it("should search direct children of the DOM Nodes descending from this DOM node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var matches = root.findDescendants(function (x) {
      return x.f1 == 3;
    }, null, true, true);
    expect(matches.length).toEqual(1);
    expect(matches[0].getName()).toEqual("10");
  });

  it("should find all DOM nodes including self node descending from this DOM node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.findDescendants(function (x) {
      return true;
    }, false, false, false, true);
    expect(match1.getName()).toEqual("root");
    var match2 = root.findDescendants(function (x) {
      return true;
    }, false, false, false, false);
    expect(match2.getName()).toEqual("child1");
  });

  it("has method findAncestor() that returns the first ancestor matching given filter function", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.findAncestor(function (x) {
      return true;
    });
    expect(root.getParent()).toEqual(match1);
    var match2 = root.findAncestor(function (x) {
      return x.getName() == "JSXROOT";
    });
    expect(root.getServer().getRootBlock()).toEqual(match2);
  });

  it("has method selectDescendants() that will find child object using a CSS3-like #jsxname selector", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#child1");
    expect(match1.length).toEqual(1);
    var match2 = root.selectDescendants("#nestedChild");
    expect(match2.length).toEqual(2);
    var match3 = root.selectDescendants("#none");
    expect(match3.length).toEqual(0);
  });

  it("has method selecteDescentdant() to select objects from the dom using a CSS3-like selector", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#child2 #child2");
    expect(match1.length).toEqual(1);
    expect(match1[0].f1).toEqual(2);
    var match2 = root.selectDescendants("#child2 #lastChild");
    expect(match2.length).toEqual(0);
    var match3 = root.selectDescendants("#none #child2");
    expect(match3.length).toEqual(0);
    // Test the optimized code for selecting from root
    var match4 = s.getRootBlock().selectDescendants("#none #child2");
    expect(match4.length).toEqual(0);
  });

  it("should select objects from the DOM matching immediate children of objects matching A that match B (A >B)", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#root > #lastChild");
    expect(match1.length).toEqual(1);
    var match2 = root.selectDescendants("#root > #nestedChild");
    expect(match2.length).toEqual(0);
  });

  it("should select objects from the DOM matching any object(*)", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#child2 *");
    expect(match1.length).toEqual(3);
  });

  it("should select using pseudo selector :first, :last and nth(x) that returns first, last or nth(x) child node", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#root > :first");
    expect(match1.length).toEqual(1);
    expect("child1").toEqual(match1[0].getName());
    var match2 = root.selectDescendants("#root > :last");
    expect(match2.length).toEqual(1);
    expect("lastChild").toEqual(match2[0].getName());
    var match3 = root.selectDescendants("#root > :nth(1)");
    expect(match3.length).toEqual(1);
    expect(match3[0].getName()).toEqual("child2");
  });

  it("should select objects from the DOM matching objects that are instances of the class or interface jsx3.app.Model", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("#root > jsx3_app_Model");
    expect(match1.length).toEqual(3);
    var match2 = root.selectDescendants("#root > :instanceof(jsx3.app.Model)");
    expect(match2.length).toEqual(4);
  });

  it("should select objects from the DOM that matches objects whose value for field f1 equals value", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("[f1=3]");
    expect(match1.length).toEqual(2);
  });

  it("should select objects from the DOM that matches objects whose return value for method getName() equals value", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var match1 = root.selectDescendants("[getName()=lastChild]");
    expect(match1.length).toEqual(1);
    expect(match1[0].getName()).toEqual("lastChild");
    var match2 = root.selectDescendants('[getName()="lastChild"]');
    expect(match2.length).toEqual(1);
    expect(match2[0].getName()).toEqual("lastChild");
  });

  it("should return the first ancestor with the given name.", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getChild(1).getChild(0).getChild(0);
    expect("nestedChild", o.getName());
    var a = o.getAncestorOfName("child2");
    expect(a).not.toBeNull();
    expect(a).not.toBeUndefined();
    expect(a.f1).toEqual(2);
    a = o.getAncestorOfName("root");
    expect(root).toEqual(a);
    a = o.getAncestorOfName("foobar");
    expect(a).toBeNull();
  });

  it("should return the first ancestor of the given type", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getChild(1).getChild(0).getChild(0);
    expect(o.getName()).toEqual("nestedChild");
    var a = o.getAncestorOfType(jsx3.app.Model);
    expect(a).not.toBeNull();
    expect(a).not.toBeUndefined();
    expect(a.f1).toEqual(2);
    o = root.getChild(1).getChild(0);
    a = o.getAncestorOfType(jsx3.gui.Painted);
    expect(a.f1).toEqual(1);
    a = o.getAncestorOfType(jsx3.app.Model);
    expect(a.f1).toEqual(1);
    o = root.getChild(1);
    expect(a.getAncestorOfType(jsx3.app.Model)).toEqual(root);
    expect(a.getAncestorOfType("jsx3.app.Model")).toEqual(root);
    expect(a.getAncestorOfType(jsx3.app.Model.jsxclass)).toEqual(root);
    var func = function () {
      a.getAncestorOfType("foobar");
    };
    expect(func).toThrowException(jsx3.lang.Exception);
  });

  it("should find the first descendant of this DOM node with a the given name", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getChild(1).getChild(0);
    var d = o.getDescendantOfName("nestedChild");
    expect(d).not.toBeNull();
    expect(d).not.toBeUndefined();
    expect(d.f1).toEqual(3);
    expect(root.getDescendantOfName("foobar")).toBeNull();
  });

  it("should find all descendants of the given type", function () {
    var s = t._server = t.newServer("data/server1.xml", ".");
    var root = s.getBodyBlock().load("data/comp1.xml");
    var o = root.getDescendantsOfType(jsx3.app.Model, true);
    expect(o).toBeInstanceOf(Array);
    expect(o.length).toEqual(4);
    expect(root.getChild(0)).toEqual(o[0]);
    o = root.getDescendantsOfType(jsx3.app.Model);
    expect(o).toBeInstanceOf(Array);
    expect(4 < o.length).toBeTruthy();
    o = root.getDescendantsOfType(jsx3.gui.Painted);
    expect(o).toBeInstanceOf(Array);
    expect(o.length).toEqual(1);
    expect(o[0].f1).toEqual(1);
  });

  it("should append a child DOM node to this parent DOM node", function () {
    var parent = new jsx3.app.Model("m1");
    var child = new jsx3.app.Model("m2");
    parent.setChild(child);
    expect(parent.getChildren().length).toEqual(1);
    expect(parent.getChildren()[0]).toEqual(child);
  });

  it("should remove a DOM child from this object", function () {
    var parent = new jsx3.app.Model("m1");
    var child = new jsx3.app.Model("m2");
    parent.setChild(child);
    expect(parent.getChildren().length).toEqual(1);
    parent.removeChild(child);
    expect(parent.getChildren().length).toEqual(0);
  });

  it("should append a DOM node to this object after removing the node from its former parent reference", function () {
    var p1 = new jsx3.app.Model("p1");
    var p2 = new jsx3.app.Model("p2");
    var child = new jsx3.app.Model("c1");
    p1.setChild(child);
    p2.adoptChild(child);
    expect(p1.getChildren().length).toEqual(0);
    expect(p2.getChildren().length).toEqual(1);
  });

  it("should create and returns an exact replica of the object", function () {
    var parent = new jsx3.app.Model("p1");
    var child = new jsx3.app.Model("c1");
    parent.setChild(child);
    var clone = child.doClone();
    expect(parent.getChildren().length).toEqual(2);
    expect(parent.getChildren()[0]).toEqual(child);
    expect(parent.getChildren()[1]).toEqual(clone);
  });

  it("should assign c2 as the previousSibling of c1", function () {
    var parent = new jsx3.app.Model("p1");
    var c1 = new jsx3.app.Model("c1");
    var c2 = new jsx3.app.Model("c2");
    parent.setChild(c1);
    parent.insertBefore(c2, c1, false);
    expect(parent.getChildren().length).toEqual(2);
    expect(parent.getChildren()[0]).toEqual(c2);
    expect(parent.getChildren()[1]).toEqual(c1);
  });

  it("should remove  all children of this object", function () {
    var parent = new jsx3.app.Model("p1");
    var c1 = new jsx3.app.Model("c1");
    var c2 = new jsx3.app.Model("c2");
    parent.setChild(c1);
    parent.setChild(c2);
    parent.removeChildren();
    expect(parent.getChildren().length).toEqual(0);
  });

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

  afterEach(function () {
    if (t._server) {
      t._server.destroy();
      delete t._server;
    }
  });

});
