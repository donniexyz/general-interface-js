/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Dialog", function(){
  
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Dialog");
  var t = new _jasmine_test.App("jsx3.gui.Dialog");
  var Dialog;

  describe("dialog with window bar ",function() {
    var dialog;
    var getDialog = function(s){
      var root = s.getBodyBlock().load("data/dialog.xml");
      return root.getChild(0);
    };    

    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server_dialog.xml", ".", true): t._server;
      t._server.setDynamicProperty('@Max Icon', 'jsx:///images/dialog/max.gif',true);
      t._server.setDynamicProperty('@Restore Icon', 'jsx:///images/dialog/restore.gif',true);
      dialog = getDialog(t._server);
      if(!Dialog) {
         Dialog = jsx3.gui.Dialog;
      }
    });   

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to instance", function(){
      expect(dialog).toBeInstanceOf(Dialog);
    });

    it("should be able to paint", function(){
      expect(dialog.getRendered()).not.toBeNull();
      expect(dialog.getRendered().nodeName.toLowerCase()).toEqual("div");
    });

    it("should able to the absolute positioning of the object's on-screen view in relation to JSXROOT", function() {
      expect(dialog.getAbsolutePosition()).toBeInstanceOf(Object);
      expect(dialog.getAbsolutePosition().L).toEqual(0);
      expect(dialog.getAbsolutePosition().T).toEqual(0);
      expect(dialog.getAbsolutePosition().W).toEqual(429);
      expect(dialog.getAbsolutePosition().H).toEqual(316);
    });

    it("should able to set and get the outer border that surrounds the entire dialog", function() {
      expect(dialog.getBorder()).toBeUndefined();
      dialog.setBorder('solid 1px #000000');
      dialog.repaint();
      expect(dialog.getBorder()).toEqual('solid 1px #000000');

      var border = dialog.getRendered().style.border;
      if(border.indexOf('#') != -1) {
        expect(border).toEqual('#000000 1px solid');
      } else {
        expect(border).toEqual('1px solid rgb(0, 0, 0)');
      }
    });

    it("should not take invalid border value", function() {
      dialog.setBorder('solid1 1px #000000');
      dialog.repaint();
      var border = dialog.getBorder();
      expect(border).toEqual('solid1 1px #000000');
      expect(dialog.getRendered().style.border).toEqual('');
    });

    it("should able to set and get the uniform buffer", function() {
      var buffer = dialog.getBuffer();
      expect(buffer).toBeFalsy();
      dialog.setBuffer(20);
      dialog.repaint();
      buffer = dialog.getBuffer();
      expect(buffer).toEqual(20);
      var outerWidth = dialog.getRendered().offsetWidth;
      var innerWidth = dialog.getChild(0).getRendered().offsetWidth;
      var outerHeight = dialog.getRendered().offsetHeight;
      var innerHeight = dialog.getChild(0).getRendered().offsetHeight + dialog.getChild(1).getRendered().parentNode.offsetHeight + 2;
      expect(outerWidth).toEqual(innerWidth + 40);
      expect(outerHeight).toEqual(innerHeight + 60);
    });

    it("should abe to get an object handle to the jsx3.gui.WindowBar instance", function() {
      expect(dialog.getCaptionBar()).toBeDefined();
      dialog.removeChild(0);//windowBar removed
      expect(dialog.getCaptionBar()).toBeNull();
    });

    it("should able to set and get the border that surrounds the dialog content", function() {
      expect(dialog.getContentBorder()).toBeUndefined();
      dialog.setContentBorder('border: solid 1px #ff0000');
      dialog.repaint();
      expect(dialog.getContentBorder()).toEqual('border: solid 1px #ff0000');
      var contentBorder = dialog.getRendered().childNodes[1].style.border;

      if(contentBorder.indexOf('#') != -1) {
        expect(contentBorder).toEqual('#ff0000 1px solid');
      } else {
        expect(contentBorder).toEqual('1px solid rgb(255, 0, 0)');
      }
    });

    it("should not take invalid contentBorder value", function() {
      dialog.setContentBorder('solid1 1px #ff0000');
      dialog.repaint();
      contentBorder = dialog.getContentBorder();
      expect(contentBorder).toEqual('solid1 1px #ff0000');
      var dialog_content = dialog.getRendered().childNodes[1];
      expect(dialog_content.style.border).toEqual('');
    });

    it("should able to set and get whether a dialog displays as modal or not", function() {
      var modal = dialog.getModal();
      expect(modal).toEqual(Dialog.NONMODAL);
      var dialog_modal = document.querySelector('.jsx30dialog_modal');
      expect(dialog_modal).toBeNull();
      dialog.setModal(Dialog.MODAL);
      dialog.repaint();
      modal = dialog.getModal();
      expect(modal).toEqual(Dialog.MODAL);
      var dialog_modal = document.querySelector('.jsx30dialog_modal');
      expect(dialog_modal.className).toMatch(/jsx30dialog_modal/);
    });

    it("should able to set and get whether the dialog can be resized or not", function() {
      var resize = dialog.getResize();
      expect(resize).toEqual(Dialog.RESIZABLE);
      dialog.setResize(Dialog.FIXED);
      resize = dialog.getResize();
      expect(resize).toEqual(Dialog.FIXED);
    });

    it("should able to set and get state of the window", function() {
      var windowState = dialog.getWindowState();
      expect(windowState).toEqual(Dialog.MAXIMIZED);
      var dialog_content = dialog.getRendered().childNodes[1];
      expect(dialog_content.style.display).toEqual('');
      dialog.setWindowState(Dialog.MINIMIZED);
      dialog.repaint();
      windowState = dialog.getWindowState();
      expect(windowState).toEqual(Dialog.MINIMIZED);
      dialog_content = dialog.getRendered().childNodes[1];
      expect(dialog_content.style.display).toEqual('none');
    });

    it("should able to get and set numeric multiplier for the dialog's z-index", function() {
      var zMultiplier = dialog.getZMultiplier();
      expect(zMultiplier).toEqual(1);
      dialog.setZMultiplier(2);
      zMultiplier = dialog.getZMultiplier();
      expect(zMultiplier).toEqual(2);
    });

    it("Closing dialog box should remove it from DOM", function() {
      expect(dialog.getRendered()).not.toBeNull();
      dialog.doClose();
      expect(dialog.getRendered()).toBeNull();
    });

    it("should able to toggle the window's state between full-size and window-shaded", function() {
      dialog.doToggleState();
      var dialog_content = dialog.getRendered().childNodes[1];
      expect(dialog_content.style.display).toEqual('none');
      expect(dialog.getRendered().style.height).toEqual('26px');
      dialog.doToggleState();
      dialog_content = dialog.getRendered().childNodes[1];
      expect(dialog_content.style.display).toEqual('');
      expect(dialog.getRendered().style.height).toEqual('312px');
    });

    it("should able to toggle the state of the dialog between 'maximized' and its 'initial state'", function() {
      var maxButtonElm = dialog.selectDescendants('#btnMaximize')[0].getRendered().childNodes[0];
      expect(maxButtonElm.style.backgroundImage).toMatch(/max\.gif/);
      dialog.doMaximize(dialog.getDescendantOfName('btnMaximize'));
      maxButtonElm = dialog.selectDescendants('#btnMaximize')[0].getRendered().childNodes[0];
      expect(maxButtonElm.style.backgroundImage).toMatch(/restore\.gif/);
    });

    it("should be able to be moved to an absolute position on screen", function() {
      expect(dialog.getAbsolutePosition().L).toEqual(0);
      dialog.setLeft(100,true);
      expect(dialog.getRendered().style.left).toEqual('100px');
      dialog.setTop(100,true);
      expect(dialog.getRendered().style.top).toEqual('100px');
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("dialog without window bar",function() {
    var dialog2;
    var getDialog2 = function(s){
      var root2 = s.getBodyBlock().load("data/dialog2.xml");
      return root2;
    }; 

    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server_dialog2.xml", ".", true): t._server;
      dialog2 = getDialog2(t._server);
      if(!Dialog) {
         Dialog = jsx3.gui.Dialog;
      }
    });    

    it("should be able to instance", function(){
      expect(dialog2).toBeInstanceOf(Dialog);
    });
 
    it("should able to toggle the window's state between full-size and minimize without window bar", function() {
      dialog2.doToggleState();
      expect(dialog2.getRendered().style.height).toEqual('0px');
      dialog2.doToggleState();
      expect(dialog2.getRendered().style.height).toEqual('312px');
    });

    it("should not have a window bar", function() {
      expect(dialog2.getCaptionBar()).toBeNull();
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("several dialogs",function() {
    var dialog3;
    var getDialog3 = function(s){
      var root3 = s.getBodyBlock().load("data/dialog3.xml");
      return root3.getChild(0);
    };  

    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server_dialog3.xml", ".", true): t._server;
      dialog3 = getDialog3(t._server);
      if(!Dialog) {
         Dialog = jsx3.gui.Dialog;
      }
    });   

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to instance", function(){
      expect(dialog3).toBeInstanceOf(Dialog);
    });

    it("whether this dialog instance is the front-most dialog among all open dialogs", function() {
      expect(dialog3.isFront()).toBe(false);
      expect(dialog3.getNextSibling().isFront()).toBe(true);
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("dialog with a task bar",function() {
    var dialog4;
    var getDialog4 = function(s){
      var root4 = s.getBodyBlock().load("data/dialog4.xml");
      return root4.getChild(0);
    };    
    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server_dialog4.xml", ".", true): t._server;
      dialog4 = getDialog4(t._server);
      if(!Dialog) {
         Dialog = jsx3.gui.Dialog;
      }
    });   

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to instance", function(){
      expect(dialog4).toBeInstanceOf(Dialog);
    });

    it("should be able get object handle to the jsx3.gui.ToolbarButton instance that resides in the application task bar", function() {
      expect(dialog4.getTaskButton()).not.toBeNull();
      dialog4.getParent().removeChild(1);
      expect(dialog4.getTaskButton()).toBeNull();
    });

    it("should be able to minimize to task bar when toggled with a task bar", function() {
      dialog4.doToggleState();
      expect(dialog4.getRendered().style.display).toEqual('none');
      var toolbarbutton = document.querySelector('.jsx30toolbarbutton');
      toolbarbutton.click();
      expect(dialog4.getRendered().style.display).toEqual('');
      toolbarbutton = document.querySelector('.jsx30toolbarbutton');
      toolbarbutton.click();
      expect(dialog4.getRendered().style.display).toEqual('none');
    });

    it("should not have the toolbarbutton when the dialog closed", function() {
      var toolbarbutton = document.querySelector('.jsx30toolbarbutton');
      expect(toolbarbutton).toBeDefined();
      dialog4.doClose();
      toolbarbutton = document.querySelector('.jsx30toolbarbutton');
      expect(toolbarbutton).toBeNull();
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("dialog with ok and close button",function() {
    var dialog5;
    var getDialog5 = function(s){
      var root5 = s.getBodyBlock().load("data/dialog5.xml");
      return root5;
    };    
    beforeEach(function () {
      t._server = (!t._server) ? t.newServer("data/server_dialog5.xml", ".", true): t._server;
      dialog5 = getDialog5(t._server);
      if(!Dialog) {
         Dialog = jsx3.gui.Dialog;
      }
    });   

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });   

    it("should be able to instance", function(){
      expect(dialog5).toBeInstanceOf(Dialog); 
    });

    it("Closing dialog box should remove it from DOM when click the close button", function() {
      expect(dialog5.getRendered()).not.toBeNull();
      dialog5.getServer().getJSXByName('buttonClose').doExecute();
      expect(dialog5.getRendered()).toBeNull();
    });

    it("Closing dialog box should remove it from DOM when click the ok button", function() {
      expect(dialog5.getRendered()).not.toBeNull();
      dialog5.getServer().getJSXByName('buttonOK').doExecute();
      expect(dialog5.getRendered()).toBeNull();
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });
});
