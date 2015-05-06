/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Tab", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Tab","jsx3.xml.CDF","jsx3.net.Request");
  var t = new _jasmine_test.App("jsx3.gui.Tab");
  var tab1,tab2,tab3,tabpane;

    var getTab = function(s){
      var root = s.getBodyBlock().load("data/tab.xml");
      return root.getServer().getJSXByName('tabbedpane');
    };    

    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server_tab.xml", ".", true): t._server;
      tabpane = getTab(t._server);
      tab1 = tabpane.getChild(0);
      tab2 = tabpane.getChild(1);
      tab3 = tabpane.getChild(2);
      // if(!Tab) {
      //    Tab = jsx3.gui.Tab;
      // }
  });

      afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to instance",function(){
      expect(tabpane).toBeInstanceOf(jsx3.gui.TabbedPane);
      expect(tab1).toBeInstanceOf(jsx3.gui.Tab);
    });

    it("should be able to paint",function(){
      expect(tab1.getRendered()).not.toBeNull();
      expect(tabpane.getRendered()).not.toBeNull();
      expect(tab1.getRendered().nodeName.toLowerCase()).toEqual("span");
      expect(tabpane.getRendered().nodeName.toLowerCase()).toEqual("div");
    });

    it("should be able to bring the tab and its associated pane forward in the stack among all sibling tabs",function(){
      expect(tab3.isFront()).toBeFalsy();
      var pane3 = tab3.getContentChild();
      tab3.doShow();
      expect(tab3.isFront()).toBeTruthy();
      expect(pane3.getRendered().style.display).toEqual("");
    });

    it("should be able to set and get the CSS background-color when the tab is active",function(){
      expect(tab2.getActiveColor()).toBeUndefined();
      tab2.setActiveColor("#ff0000");
      tab2.getRendered().click();
      expect(tab2.getActiveColor()).toEqual("#ff0000");
      expect(tab2.getRendered().style.backgroundColor).toEqual('rgb(255, 0, 0)');
    });

    // it("should be able to set and get the background image that will underlay each tab to provide an outset-type border",function(){
    //   expect(tab1.getBevel()).toBeUndefined();
    //   tab1.setBevel("JSX/images/tab/bevel.gif");
    //   expect(tab1.getBevel()).toEqual("JSX/images/tab/bevel.gif");
    // });

    it("should be able to return the child of this tab",function(){
      var childPane = tab1.getContentChild();
      expect(childPane.getName()).toEqual("pane");
      expect(childPane.getRendered().nodeName.toLowerCase()).toEqual("div");
    });

    it("should be able to set and get the enabled/disabled state for the tab control",function(){
      tab2.getRendered().click();
      expect(tab2.isFront()).toBeTruthy();
      tab3.getRendered().click();
      tab2.setEnabled(0);
      tab2.repaint();
      tab2.getRendered().click();
      expect(tab2.isFront()).toBeFalsy();
    });

    it("should be able to set and get the CSS background-color when the tab is inactive",function(){
      expect(tab2.isFront()).toBeFalsy();
      tab2.setInactiveColor("ff0000");
      expect(tab2.getInactiveColor()).toEqual("ff0000");
    });

    it("should be able to return whether or not this stack is the active stack",function(){
      expect(tab1.isFront()).toBeTruthy();
      tab3.doShow();
      expect(tab1.isFront()).toBeFalsy();
    });

    it("should be able to set and get the text/HTML for the control to be disabled on-screen",function(){
      var xmlState = (new jsx3.xml.CDF.Document()).load(tab.resolveURI("data/source.xml"));
      var children = xmlState.getChildNodes();
      var length = children.size();
      for(var i = 0; i<length; i++){
        var child = children.get(i);
        var tabName = child.getAttribute("jsxtext");
        var content = child.getAttribute("content");
        tabpane.getChild(i).setText(tabName);
        tabpane.getChild(i).getContentChild().setText(content);
      }
        expect(tab1.getText()).toEqual("firstTab");
    });

    //adding TabbedPane test in the following

    it("should be able to return the zero-based child index of the active child tab",function(){
      expect(tab2.isFront()).toBeFalsy();
      tab2.doShow();
      expect(tabpane.getSelectedIndex()).toEqual(1);
    });

    it("should be able to set and get the active tab of tabbed pane",function(){
      expect(tab2.isFront()).toBeFalsy();
      tabpane.setSelectedIndex(1);
      expect(tabpane.getSelectedIndex()).toEqual(1);
    });

    it("should be able to set/get whether or not to show the tabs of the tabbed pane",function(){
      expect(tabpane.getRendered().style.display).not.toBeNull();
      tabpane.setShowTabs(0);
      var block = tabpane.getParent();
      block.repaint();  
      expect(tabpane.getShowTabs()).toEqual(0);
      expect(tab1.getRendered()).toBeNull();
    });

    it("should be able to set and get the CSS height property for the object for child tabs",function(){
      expect(tabpane.getTabHeight()).toBeUndefined();
      tabpane.setTabHeight(30);
      tabpane.repaint();
      expect(tabpane.getTabHeight()).toEqual(30);
      expect(tab1.getRendered().style.height).toEqual('27px');
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
});