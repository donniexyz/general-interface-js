/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.gui.Block", function() {
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Block");
  var t = new _jasmine_test.App("jsx3.gui.Block");
  var Block;

  describe("Member methods", function() {
    var block;
    var getBlock = function(s) {
      var root = s.getBodyBlock().loadAndCache("data/block.xml");
      return root.getChild(0);
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server2.xml", ".", true) : t._server;
      block = getBlock(t._server);
      if (!Block) {
        Block = jsx3.gui.Block;
      }
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should be able to instance", function() {
      expect(block).toBeInstanceOf(Block);
    });

    it("should be able to paint", function() {
      expect(block.getRendered()).not.toBeNull();
      expect(block.getRendered().nodeName.toLowerCase()).toEqual("span");
    });

    it("should able to set and get the CSS display", function() {
      block.setDisplay(Block.DISPLAYNONE, true);
      var display = block.getDisplay();
      expect(display).toEqual(Block.DISPLAYNONE);
      expect(block.getRendered().style.display).toEqual('none');
    });

    it("should not take invalid display value", function() {
      block.setDisplay('hidden', true);
      var display = block.getDisplay();
      expect(display).toEqual('hidden');
      expect(block.getRendered().style.display).toEqual('inline-block');
    });

    it("should able to set and get the CSS font-family", function() {
      block.setFontName("Verdana,Arial,sans-serif");
      block.repaint();
      var fontName = block.getFontName();
      expect(fontName).toEqual("Verdana,Arial,sans-serif");
      expect(block.getRendered().style.fontFamily).toMatch(/Verdana|Arial|sans-serif/);
    });

    if (! _jasmine_test.IE8) {
      it("should not take invalid font-family value", function() {
        // run only if this is not IE8
        block.setFontName(1);
        block.repaint();
        var fontName = block.getFontName();
        expect(fontName).toEqual(1);
        var fontFamily = block.getRendered().style.fontFamily;
        expect(fontFamily).toEqual(""); // IE8 gets 1, we can't fix that. Browser issue.
      });
    }

    it("should able to set and get the dimensions in an array of four int values", function() {
      var dimensions = block.getDimensions();
      expect(dimensions).toEqual([undefined, undefined, 100, 30]);
      block.setDimensions(10, 10, 80, 80, true);
      dimensions = block.getDimensions();
      expect(dimensions).toEqual([10, 10, 80, 80]);
    });

    it('should able to get and set the overflow property for the object', function() {
      var overflow = block.getOverflow();
      expect(overflow).toEqual(Block.OVERFLOWSCROLL);
      block.setText('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(block.getRendered().scrollTop).toEqual(0);
      expect(block.getRendered().scrollLeft).toEqual(0);
      expect(block.getRendered().scrollHeight).toEqual(30);
      expect(block.getRendered().scrollWidth).toEqual(100);
      block.setOverflow(Block.OVERFLOWHIDDEN);
      block.repaint();
      var overflow = block.getOverflow();
      expect(overflow).toEqual(Block.OVERFLOWHIDDEN);
      expect(block.getRendered().style.overflow).toEqual('hidden');
    });

    it("should not take invalid overflow value", function() {
      block.setOverflow('none');
      block.repaint();
      var overflow = block.getOverflow();
      expect(overflow).toEqual('none');
      expect(block.getRendered().style.overflow).toEqual('');
    });

    it("has method showMask() to display a 'blocking mask' inside the block to stop user interactions with content within the block", function() {
      block.showMask();
      expect(block.getRendered().style.zIndex).toBeLessThan(block.getRendered().childNodes[1].style.zIndex);
    });

    it("has method hideMask() to remove the blocking mask inside the block to stop user interactions with existing content", function() {
      block.showMask();
      expect(block.getRendered().style.zIndex).toBeLessThan(block.getRendered().childNodes[1].style.zIndex);
      block.hideMask();
      expect(block.getRendered().childNodes[1]).toBeUndefined();
    });

    it("has method setRelativePosition() to set if instance is relatively positioned on-screen", function() {
      block.setRelativePosition(Block.ABSOLUTE, true);
      position = block.getRelativePosition();
      expect(position).toEqual(Block.ABSOLUTE);
      expect(block.getRendered().style.position).toEqual("absolute");
    });

    it("should not take invalid position value", function() {
      block.setRelativePosition('abs', true);
      expect(block.getRelativePosition()).toEqual('abs');
      expect(block.getRendered().style.position).toEqual("absolute");
    });

    it("should able to set and get valid css property value for the background", function() {
      expect(block.getBackground()).toBeUndefined();
      block.setBackground("background-repeat:no-repeat");
      block.repaint();
      expect(block.getBackground()).toEqual('background-repeat:no-repeat');
      expect(block.getRendered().style.backgroundRepeat).toEqual("no-repeat");
    });

    it('should not take invalid background value', function() {
      block.setBackground("no-repeat");
      block.repaint();
      expect(block.getBackground()).toBe('no-repeat');
      expect(block.getRendered().style.backgroundRepeat).toEqual("");
    });

    it("should able to set and get valid css property value for color", function() {
      expect(block.getColor()).toBeUndefined();
      block.setColor('red', true);
      expect(block.getColor()).toBe('red');
      expect(block.getRendered().style.color).toEqual("red");
    });

    it('should not take invalid color value', function() {
      block.setColor('redd', true);
      expect(block.getColor()).toBe('redd');
      expect(block.getRendered().style.color).toEqual("");
    });

    it("should able to set and get the width property", function() {
      expect(block.getWidth()).toEqual(100);
      block.setWidth(120, true);
      expect(block.getWidth()).toEqual(120);
      expect(block.getRendered().style.width).toEqual("120px");
    });

    it("should not take invalid width value", function() {
      block.setWidth('110px', true);
      expect(block.getWidth()).toEqual('110px');
      expect(block.getRendered().style.width).toEqual("100px");
    });

    it("should able to find an on-screen reference for the given block", function() {
      expect(document.getElementById(block.getId())).toEqual(block.getRendered());
    });

    it("should able to try to find an on-screen reference for the given block and update its css without forcing a repaint", function() {
      block.updateGUI("margin", "10px");
      expect(block.getRendered().style.margin).toEqual("10px");
    });

    it("should not take the invalid updateGUI value", function() {
      block.updateGUI("margin", null);
      expect(block.getRendered().style.margin).toEqual("");
    });

    it("should able to set and get the css z-index property", function() {
      expect(block.getZIndex()).toBeUndefined();
      block.setZIndex(2, true);
      expect(block.getZIndex()).toEqual(2);
      expect(block.getRendered().style.zIndex.toString()).toEqual('2');
    });

    it("should not take invalid z-index value", function() {
      block.setZIndex('a', true);
      expect(block.getZIndex()).toEqual('a');
      expect(block.getRendered().style.zIndex).toEqual('');
    });

    it("should able to set and get HTML tag name to use when rendering the object on-screen", function() {
      expect(block.getTagName()).toBeUndefined();
      expect(block.getRendered().nodeName.toLowerCase()).toEqual("span");
      block.setTagName("div");
      block.repaint();
      expect(block.getTagName()).toEqual("div");
      expect(block.getRendered().nodeName.toLowerCase()).toEqual("div");
    });

    it("should not take invalid tagName value", function() {
      block.setTagName(null);
      block.repaint();
      expect(block.getTagName()).toEqual(null);
      expect(block.getRendered().nodeName.toLowerCase()).toEqual("span");
    });

    it("should able to set and get CSS property value(s) for a margin", function() {
      expect(block.getMargin()).toBeUndefined();
      expect(block.getRendered().style.margin).toEqual("");
      block.setMargin("10 0 0 10", true);
      expect(block.getMargin()).toEqual("10 0 0 10");
      expect(block.getRendered().style.margin).toEqual("10px 0px 0px 10px");
    });

    it("should not take invalid margin value", function() {
      block.setMargin("10px", true);
      expect(block.getMargin()).toEqual("10px");
      expect(block.getRendered().style.margin).toEqual("");
    });

    it("should able to set and get valid CSS property value for cursor", function() {
      expect(block.getCursor()).toBeUndefined();
      expect(block.getRendered().style.cursor).toEqual("");
      block.setCursor("col-resize", true);
      expect(block.getRendered().style.cursor).toEqual("col-resize");
    });

    it("should not take invalid cursor value", function() {
      block.setCursor("col-hand", true);
      var cursor = block.getRendered().style.cursor;
      if (jsx3.CLASS_LOADER.getVersion() > 8) {
        expect(block.getRendered().style.cursor).toEqual("");
      }
    });

    it("should able to set and get CSS property value(s) for a padding", function() {
      expect(block.getPadding()).toBeUndefined();
      block.setPadding("10 0 0 10", true);
      expect(block.getPadding()).toEqual("10 0 0 10");
      expect(block.getRendered().style.padding).toEqual("10px 0px 0px 10px");
    });

    it("should not take invalid padding value", function() {
      block.setPadding(null, true);
      expect(block.getPadding()).toEqual(null);
      expect(block.getRendered().style.padding).toEqual("");
    });

    it("should able to set and get CSS text to override the standard instance properties on the painted block", function() {
      expect(block.getCSSOverride()).toBeUndefined();
      expect(block.getRendered().style.margin).toEqual("");
      block.setCSSOverride("margin:10px");
      block.repaint();
      expect(block.getCSSOverride()).toEqual("margin:10px");
      expect(block.getRendered().style.margin).toEqual("10px");
    });

    it("should not take invalid override value", function() {
      block.setCSSOverride("margin:10");
      block.repaint();
      expect(block.getCSSOverride()).toEqual("margin:10");
      expect(block.getRendered().style.margin).toEqual("");
    });

    it("should able to set and get the named CSS rule(s) to apply to the painted block", function() {
      expect(block.getClassName()).toBeUndefined();
      expect(block.getRendered().className).toEqual('jsx30block');
      block.setClassName("css2");
      expect(block.getClassName()).toEqual("css2");
      block.repaint();
      expect((/css2$/).test(block.getRendered().className)).toBeTruthy();
    });

    it("should able to set and get the left property if the block is absolutely positioned", function() {
      expect(block.getLeft()).toBeUndefined();
      expect(block.getRendered().style.left).toEqual("");
      block.setRelativePosition(Block.ABSOLUTE, true);
      block.setLeft(5, true);
      expect(block.getLeft()).toEqual(5);
      expect(block.getRendered().style.left).toEqual("5px");
    });

    it("should not take invalid left value", function() {
      block.setRelativePosition(Block.ABSOLUTE, true);
      block.setLeft(null, true);
      expect(block.getLeft()).toEqual(null);
      expect(block.getRendered().style.left).toEqual("0px");
    });

    it("should able to set and get the top property if the block is absolutely positioned", function() {
      expect(block.getTop()).toBeUndefined();
      expect(block.getRendered().style.top).toEqual("");
      block.setRelativePosition(Block.ABSOLUTE, true);
      block.setTop(5, true);
      expect(block.getTop()).toEqual(5);
      expect(block.getRendered().style.top).toEqual("5px");
    });

    it("should not take invalid top value", function() {
      block.setRelativePosition(Block.ABSOLUTE, true);
      block.setTop(null, true);
      expect(block.getTop()).toEqual(null);
      expect(block.getRendered().style.top).toEqual("0px");
    });

    it("should able to set and get the CSS visibility property", function() {
      expect(block.getVisibility()).toBeUndefined();
      expect(block.getRendered().style.visibility).toEqual("");
      block.setVisibility(Block.VISIBILITYHIDDEN, true);
      expect(block.getVisibility()).toEqual(Block.VISIBILITYHIDDEN);
      expect(block.getRendered().style.visibility).toEqual(Block.VISIBILITYHIDDEN);
    });

    it("should not take invalid visibility value", function() {
      block.setVisibility('none', true);
      expect(block.getVisibility()).toEqual('visible');
      expect(block.getRendered().style.visibility).toEqual('visible');
    });

    it("should able to set a property on the object that when the object is rendered on-screen", function() {
      block.setAttribute('jsxheight', '110');
      expect(block.getAttribute('jsxheight')).toEqual('110');
    });

    it("should able to remove the specific custom property bound to this object", function() {
      block.setAttribute('jsxheight', '110');
      expect(block.getAttribute('jsxheight')).toEqual('110');
      block.removeAttribute('jsxheight');
      expect(block.getAttribute('jsxheight')).toBeUndefined();
    });

    it("should able to set and get the css font-size", function() {
      expect(block.getFontSize()).toBeUndefined();
      block.setFontSize(10);
      block.repaint();
      expect(block.getFontSize()).toEqual(10);
      expect(block.getRendered().style.fontSize).toEqual('10px');
    });

    it("should not take invalid font-size value", function() {
      block.setFontSize(-10);
      block.repaint();
      expect(block.getFontSize()).toEqual(-10);
      expect(block.getRendered().style.fontSize).toEqual('');
    });

    it("should able to set and get the css font-weight", function() {
      var fontWeight = block.getFontWeight();
      expect(fontWeight).toBeUndefined();
      block.setFontWeight('bold');
      block.repaint();
      fontWeight = block.getFontWeight();
      expect(fontWeight).toEqual("bold");
      expect(block.getRendered().style.fontWeight).toEqual('bold');
    });

    it("should not take invalid font-weight value", function() {
      block.setFontWeight('bold1');
      block.repaint();
      fontWeight = block.getFontWeight();
      expect(fontWeight).toEqual("bold1");
      expect(block.getRendered().style.fontWeight).toEqual('');
    });

    it("should able set and get backgroundColor", function() {
      expect(block.getBackgroundColor()).toEqual('#A29F9F');
      block.setBackgroundColor('#f00', true);
      expect(block.getBackgroundColor()).toEqual('#f00');

      var bgColor = block.getRendered().style.backgroundColor;
      if (bgColor.indexOf('#') != -1) {
        expect(bgColor).toEqual('#f00');
      } else {
        expect(bgColor).toEqual('rgb(255, 0, 0)');
      }
    });

    it("should not take invalid backgroundColor value", function() {
      block.setBackgroundColor('#f0000000');
      block.repaint();
      bgColor = block.getBackgroundColor();
      expect(bgColor).toEqual('#f0000000');
      expect(block.getRendered().style.backgroundColor).toEqual('');
    });

    it('should able to set and get valid css property value for the border', function() {
      expect(block.getBorder()).toBeUndefined();
      block.setBorder('border: solid 1px #000000', true);
      expect(block.getBorder()).toEqual('border: solid 1px #000000');

      var border = block.getRendered().style.border;
      if (border.indexOf('#') != -1) {
        expect(border).toEqual('#000000 1px solid');
      } else {
        expect(border).toEqual('1px solid rgb(0, 0, 0)');
      }
    });

    it("should not take invalid border value", function() {
      block.setBorder('border', true);
      expect(block.getBorder()).toEqual('border');
      expect(block.getRendered().style.border).toMatch(/0px/);
    });

    it("should able to set and get the height property", function() {
      expect(block.getHeight()).toEqual(30);
      block.setHeight(120, true);
      expect(block.getHeight()).toEqual(120);
      expect(block.getRendered().style.height).toEqual('120px');
    });

    it("should not take invalid height value", function() {
      block.setHeight(-120, true);
      expect(block.getHeight()).toEqual(-120);
      expect(block.getRendered().style.height).toEqual('0px');
    });

    it("should able to set and get text", function() {
      var text = block.getText();
      expect(text).toEqual('test block');
      block.setText("hello world");
      text = block.getText();
      expect(text).toEqual("hello world");
      if (typeof block.getRendered().innerText === 'function') {
        expect(block.getRendered().innerText).toEqual('test block');
      } else if (block.getRendered().textContent === 'function') {
        expect(block.getRendered().textContent).toEqual('test block');
      }
    });

    it("should able to set and get text-align", function() {
      var textAlign = block.getTextAlign();
      expect(textAlign).toBeUndefined();
      block.setTextAlign('right');
      textAlign = block.getTextAlign();
      expect(textAlign).toEqual('right');
      block.repaint();
      expect(block.getRendered().style.textAlign).toEqual('right');
    });

    it("should not accept or take invalid values", function() {
      block.setTextAlign("foo");
      expect(block.getTextAlign()).toEqual('foo');
      expect(block.getRendered().style.textAlign).toEqual('');
    });

    it("should able to set and get the tooltip", function() {
      var tooltip = block.getTip();
      expect(tooltip).toBeUndefined();
      block.setTip("tooltip");
      tooltip = block.getTip();
      expect(tooltip).toEqual('tooltip');
      expect(block.getRendered().getAttribute("title")).toBe("tooltip");
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      delete t._server;
    });
  });

  describe("Rendering and layout", function() {
    var block2;
    var getBlock2 = function(s) {
      return s.getBodyBlock().loadAndCache("data/block2.xml");
    };

    beforeEach(function() {
      t._server2 = (!t._server2) ? t.newServer("data/server3.xml", ".", true) : t._server2;
      block2 = getBlock2(t._server2);
    });

    afterEach(function() {
      if (t._server2)
        t._server2.getBodyBlock().removeChildren();
    });

    it("should be able to instance", function() {
      expect(block2).toBeInstanceOf(Block);
    });

    it("should able to have nested block within another block", function() {
      expect(block2.getRendered().childNodes[1].firstChild.className).toEqual("jsx30block");
      expect(block2.getRendered().childNodes[1].firstChild.getAttribute("label")).toEqual("block");
      expect(block2.getName()).toBe("block");
      expect(block2.getChild(0).getName()).toBe("block1");
      expect(block2.getChild(1).getName()).toBe("block2");
    });

    it("the width childNode should less than parentNode if the parentNode set padding or the childNode set border", function() {
      expect(block2.getRendered().childNodes[1].firstChild.style.width).toBeLessThan(block2.getRendered().childNodes[1].style.width);
      block2.getChild(1).setPadding("10 10 10 10", true);
      block2.getChild(1).getChild(0).setBorder("border:none", true);
      block2.getChild(1).setBorder("border:none", true);
      expect(block2.getRendered().childNodes[1].firstChild.offsetWidth + 20).toEqual(block2.getRendered().childNodes[1].offsetWidth);
    });

    it("the height childNode should less than parentNode if the parentNode set padding or the childNode set border", function() {
      expect(block2.getRendered().childNodes[1].firstChild.style.height).toBeLessThan(block2.getRendered().childNodes[1].style.height);
      block2.getChild(1).setPadding("10 10 10 10", true);
      block2.getChild(1).getChild(0).setBorder("border:none", true);
      block2.getChild(1).setBorder("border:none", true);
      expect(block2.getRendered().childNodes[1].firstChild.offsetHeight + 20).toEqual(block2.getRendered().childNodes[1].offsetHeight);
    });

    it("should be able to get the top position by calculating the Top+Height+Margin", function() {
      block2.getChild(0).setMargin("0 10 10 10", true);
      block2.getChild(1).setMargin("0 10 10 10", true);
      block2.getChild(0).setPadding("0 0 0 0", true);
      block2.getChild(1).setPadding("0 0 0 0", true);
      block2.getChild(0).setBorder("border:none", true);
      block2.getChild(1).setBorder("border:none", true);
      block2.getChild(0).updateGUI("display", "block");

      var marginTop = 10,
        child2top = block2.getRendered().childNodes[0].offsetTop + block2.getRendered().childNodes[0].offsetHeight + marginTop,
        block2Top = block2.getRendered().childNodes[1].offsetTop;

      expect(child2top).toEqual(block2Top);
    });

    it("shuld able to get the absolute positioning of the object's on-screen view in relation to JSXROOT", function() {
      expect(block2.getAbsolutePosition().L).toEqual(0);
      expect(block2.getAbsolutePosition().T).toEqual(0);
      block2.setRelativePosition(Block.ABSOLUTE, true);
      block2.setTop(25, true);
      block2.setLeft(10, true);
      expect(block2.getAbsolutePosition().L).toEqual(10);
      expect(block2.getAbsolutePosition().T).toEqual(25);
    });

    it("should clean up", function() {
      t._server2.destroy();
      t.destroy();
      expect(t._server2.getBodyBlock().getRendered()).toBeNull();
      delete t._server2;
    });
  });

  describe("Inline block layout should line up vertically, ref GI-967", function() {
    var block3;
    var getBlock3 = function(s) {
      return s.getBodyBlock().loadAndCache("data/block3.xml").getChild(0);
    };

    beforeEach(function() {
      t._server3 = (!t._server3) ? t.newServer("data/server4.xml", ".", true) : t._server3;
      block3 = getBlock3(t._server3); // reset the block to initial state every time.
    });

    afterEach(function() {
      if (t._server3)
        t._server3.getBodyBlock().removeChildren();
    });

    it("should have layout of 2 rows blocks and 4 columns", function() {
      expect(block3.getChildren().length).toEqual(8);
      expect(block3.getRendered().childNodes[0].offsetLeft).toEqual(block3.getRendered().childNodes[4].offsetLeft);
      expect(block3.getRendered().childNodes[1].offsetLeft).toEqual(block3.getRendered().childNodes[5].offsetLeft);
      expect(block3.getRendered().childNodes[2].offsetLeft).toEqual(block3.getRendered().childNodes[6].offsetLeft);
      expect(block3.getRendered().childNodes[3].offsetLeft).toEqual(block3.getRendered().childNodes[7].offsetLeft);
    });

    it("should not affect the position of blocks if change the content of a block", function() {
      block3.getChild(0).setText("test the content of block", true);
      expect(block3.getRendered().childNodes[0].offsetLeft).toEqual(block3.getRendered().childNodes[4].offsetLeft);
      expect(block3.getRendered().childNodes[1].offsetLeft).toEqual(block3.getRendered().childNodes[5].offsetLeft);
      expect(block3.getRendered().childNodes[2].offsetLeft).toEqual(block3.getRendered().childNodes[6].offsetLeft);
      expect(block3.getRendered().childNodes[3].offsetLeft).toEqual(block3.getRendered().childNodes[7].offsetLeft);
    });

    it("should be corresponded X axis if reset width of all blocks to the same width", function() {
      block3.setWidth(250, true);
      jsx3.$A(block3.getChildren()).each(function(e) {
        e.setWidth(55, true);
      });
      expect(block3.getRendered().childNodes[0].offsetLeft).toEqual(block3.getRendered().childNodes[4].offsetLeft);
      expect(block3.getRendered().childNodes[1].offsetLeft).toEqual(block3.getRendered().childNodes[5].offsetLeft);
      expect(block3.getRendered().childNodes[2].offsetLeft).toEqual(block3.getRendered().childNodes[6].offsetLeft);
      expect(block3.getRendered().childNodes[3].offsetLeft).toEqual(block3.getRendered().childNodes[7].offsetLeft);
    });

    it("should have the same width of all the blocks", function() {
      expect(block3.getRendered().childNodes[1].style.width).toEqual('98px');
      expect(block3.getRendered().childNodes[0].offsetWidth).toEqual(block3.getRendered().childNodes[4].offsetWidth);
      expect(block3.getRendered().childNodes[1].offsetWidth).toEqual(block3.getRendered().childNodes[5].offsetWidth);
      expect(block3.getRendered().childNodes[2].offsetWidth).toEqual(block3.getRendered().childNodes[6].offsetWidth);
      expect(block3.getRendered().childNodes[3].offsetWidth).toEqual(block3.getRendered().childNodes[7].offsetWidth);
    });

    it("should have the same height of all the blocks", function() {
      expect(block3.getRendered().childNodes[1].style.height).toEqual('46px');
      expect(block3.getRendered().childNodes[0].offsetHeight).toEqual(block3.getRendered().childNodes[4].offsetHeight);
      expect(block3.getRendered().childNodes[1].offsetHeight).toEqual(block3.getRendered().childNodes[5].offsetHeight);
      expect(block3.getRendered().childNodes[2].offsetHeight).toEqual(block3.getRendered().childNodes[6].offsetHeight);
      expect(block3.getRendered().childNodes[3].offsetHeight).toEqual(block3.getRendered().childNodes[7].offsetHeight);
    })

    it("should clean up", function() {
      t._server3.destroy();
      t.destroy();
      expect(t._server3.getBodyBlock().getChildren().length).toEqual(0);
      expect(t._server3.getBodyBlock().getRendered()).toBeNull();
      delete t._server3;
    });
  });
});