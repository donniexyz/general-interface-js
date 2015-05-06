/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("Application screen layout GI components like blocks, layout, dialog, menus", function() {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.LayoutGrid", "jsx3.gui.Button");
  var t = new _jasmine_test.App("jsx3.gui.LayoutGrid");

  describe("First canvas", function() {
    var layout, block;
    var getBlock = function(s) {
      return s.getBodyBlock().loadAndCache("data/gui_appCanvas_1.xml");
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_gui_layout.xml", ".", true) : t._server;
      block = getBlock(t._server);
      layout = block.getChild(0);
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should have a layout grid with three rows", function() {
      expect(layout).toBeInstanceOf(jsx3.gui.LayoutGrid);
      expect(layout.getRows()).toEqual('150,*,50');
    });

    it("should have one block inside the first row with 150px height", function() {
      expect(layout.getChild(0)).toBeInstanceOf(jsx3.gui.Block);
      expect(parseInt(layout.getChild(0).getRendered().style.height)).toEqual(150);
    });

    it("should have a layout grid inside the second row with two columns", function() {
      expect(layout.getChild(1).getChild(0)).toBeInstanceOf(jsx3.gui.LayoutGrid);
      expect(layout.getChild(1).getChild(0).getCols()).toEqual('100,*');
    });

    it("should have one block inside the last row with 50px height", function() {
      expect(layout.getChild(2)).toBeInstanceOf(jsx3.gui.Block);
      expect(parseInt(layout.getChild(2).getRendered().style.height)).toEqual(50);
    });

    it("should able to set whether the layout grid will render items top-over (--) or side-by-side (|)", function() {
      layout.setOrientation(jsx3.gui.LayoutGrid.ORIENTATIONROW);
      var orientation = layout.getOrientation();
      expect(orientation).toEqual(jsx3.gui.LayoutGrid.ORIENTATIONROW);
    });

    it("should able to leverage an HTML Table for its on-screen VIEW", function() {
      layout.setBestGuess(jsx3.gui.LayoutGrid.ADAPTIVE);
      var bestGuess = layout.getBestGuess();
      expect(bestGuess).toEqual(jsx3.gui.LayoutGrid.ADAPTIVE);
    });

    it("should able to set the number of cells to draw before starting a new row/column of cells", function() {
      layout.setRepeat(3);
      var repeat = layout.getRepeat();
      expect(repeat).toEqual(3);
    });

    it("should able to set dimensions for cells in the layoutgrid", function() {
      layout.setDimensionArray(['3', '5'], true);
      var dimension = layout.getDimensionArray();
      expect(dimension).toEqual(['3', '5'], true);
    });

    it("should able to set column with setCols", function() {
      layout.setCols('5,2,3', true);
      var cols = layout.getCols();
      expect(cols).toEqual('5,2,3');
    });

    it("should able to set rows with setRows", function() {
      layout.setRows('5,2,3', true);
      var rows = layout.getRows();
      expect(rows).toEqual('5,2,3');
    });

    it("should able to get the size of the canvas for a given child (the true drawspace)", function() {
      var layChild = layout.getChild(1);
      var clientDimension = layout.getClientDimensions(layChild);
      layChild.setLeft(0);
      layChild.setTop(150);
      expect(clientDimension.width).toEqual(layChild.getWidth());
      expect(clientDimension.height).toEqual(layChild.getHeight());
      expect(clientDimension.left).toEqual(layChild.getLeft());
      expect(clientDimension.top).toEqual(layChild.getTop());
    });

    it("should have a block at left inside the second row for the navigation", function() {
      var leftPane = layout.getChild(1).getChild(0).getChild(0);
      expect(leftPane).toBeInstanceOf("jsx3.gui.Block");
      var bgColor = leftPane.getRendered().style.backgroundColor;
      if (bgColor === "pink") {
        expect(bgColor).toEqual("pink");
      } else if (bgColor === "rgb(255, 192, 203)") {
        expect(leftPane.getRendered().style.backgroundColor).toEqual("rgb(255, 192, 203)");
      }
      expect(leftPane.getRendered().style.width).toEqual("100px");
    });

    it("should have a block at right inside the second row for the main content", function() {
      var rightPane = layout.getChild(1).getChild(0).getChild(1);
      expect(rightPane).toBeInstanceOf("jsx3.gui.Block");
      expect(rightPane.getWidth()).toEqual("100%");
    });

    it("should have a block in the third row for the copyright notice", function() {
      expect(layout.getChild(2)).toBeInstanceOf("jsx3.gui.Block");
      var bgColor = layout.getChild(2).getRendered().style.backgroundColor;
      if (bgColor === "lightblue") {
        expect(layout.getChild(2).getRendered().style.backgroundColor).toEqual("lightblue");
      } else if (bgColor === "rgb(173, 216, 230)") {
        expect(layout.getChild(2).getRendered().style.backgroundColor).toEqual("rgb(173, 216, 230)");
      }
      expect(layout.getChild(2).getRendered().style.height).toEqual("50px");
    });

    it("should have a floating pane above others for the prompt message", function() {
      var floatPane = block.getChild(1);
      expect(floatPane).toBeInstanceOf("jsx3.gui.Block");
      expect(floatPane.getRendered().style.position).toEqual("absolute");
      expect(floatPane.getRendered().style.left).toEqual("60px");
      expect(floatPane.getRendered().style.top).toEqual("290px");
      expect(floatPane.getRendered().style.width).toEqual("180px");
      expect(floatPane.getRendered().style.height).toEqual("150px");
    });

    it("should have a dialog width fixed T,L,W,H", function() {
      var dialog2 = block.getChild(2);
      expect(dialog2).toBeInstanceOf("jsx3.gui.Dialog");
      expect(dialog2.getLeft()).toEqual(311);
      expect(dialog2.getRendered().style.left).toEqual("311px");
      expect(dialog2.getTop()).toEqual(213);
      expect(dialog2.getRendered().style.top).toEqual("213px");
      expect(dialog2.getRendered().style.position).toEqual("absolute");
      dialog2.setWidth(350);
      expect(dialog2.getWidth()).toEqual(350);
      dialog2.setHeight(170);
      expect(dialog2.getHeight()).toEqual(170);
      dialog2.repaint();
      expect(dialog2.getRendered().style.width).not.toEqual("350px");
      expect(dialog2.getRendered().style.height).not.toEqual("170px");
      dialog2.setBorder("0px solid");
      dialog2.setBuffer("0");
      dialog2.repaint();
      expect(dialog2.getRendered().style.width).toEqual("350px");
      expect(dialog2.getRendered().style.height).toEqual("170px");
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("Second canvas", function() {
    var layout2, block2, dialog;
    var getBlock2 = function(s) {
      return s.getBodyBlock().loadAndCache("data/gui_appCanvas_2.xml");
    };

    beforeEach(function() {
      t._server2 = (!t._server2) ? t.newServer("data/server_gui_layout.xml", ".", true) : t._server2;
      block2 = getBlock2(t._server2);
      layout2 = block2.getChild(0);
      dialog = block2.getChild(1);
    });

    afterEach(function() {
      if (t._server2)
        t._server2.getBodyBlock().removeChildren();
    });

    it("should have a layout grid with four areas/rows", function() {
      expect(layout2).toBeInstanceOf("jsx3.gui.LayoutGrid");
      expect(layout2.getRows()).toEqual('50,28,*,28');
    });

    it("should have a banner block with an image in first row", function() {
      var imageBlk = layout2.getChild(0).getChild(0);
      expect(imageBlk).toBeInstanceOf("jsx3.gui.Image");
      imageBlk.setSrc("baidu.jpg");
      expect(imageBlk.getSrc()).toEqual("baidu.jpg");
    });

    it("should have a window bar in second row", function() {
      var menuBlk = layout2.getChild(1).getChild(0);
      expect(menuBlk).toBeInstanceOf("jsx3.gui.WindowBar");
    });

    it("should have a body content area in third row", function() {
      expect(layout2.getChild(2)).toBeInstanceOf("jsx3.gui.Block");
    });

    it("should have a task bar in fourth row", function() {
      expect(layout2.getChild(3).getChild(0)).toBeInstanceOf("jsx3.gui.WindowBar");
    });

    it("should have a dialog box with fixed T,L,W,H", function() {
      expect(dialog).toBeInstanceOf("jsx3.gui.Dialog");
      expect(dialog.getLeft()).toEqual(48);
      expect(dialog.getRendered().style.left).toEqual("48px");
      expect(dialog.getTop()).toEqual(126);
      expect(dialog.getRendered().style.top).toEqual("126px");
      expect(dialog.getRendered().style.position).toEqual("absolute");
      dialog.setWidth(450);
      expect(dialog.getWidth()).toEqual(450);
      dialog.setHeight(350);
      expect(dialog.getHeight()).toEqual(350);
      dialog.repaint();
      expect(dialog.getRendered().style.width).not.toEqual("450px");
      expect(dialog.getRendered().style.height).not.toEqual("350px");
      dialog.setBorder("0px solid");
      dialog.setBuffer("0");
      dialog.repaint();
      expect(dialog.getRendered().style.width).toEqual("450px");
      expect(dialog.getRendered().style.height).toEqual("350px");
    });

    it("should clean up", function() {
      t._server2.destroy();
      t.destroy();
      expect(t._server2.getBodyBlock().getRendered()).toBeNull();
      delete t._server2;
    });
  });
});