/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.ColorPicker", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.ColorPicker");
  var t = new _jasmine_test.App("jsx3.gui.ColorPicker");
  var colorPicker;
  var ColorPicker;

  var getColorPicker = function(s) {
    var root = s.getBodyBlock().load("data/colorPicker.xml");
    return root.getChild(0).getDescendantOfName('colorPicker');
  };
  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_colorPicker.xml", ".", true) : t._server;
    colorPicker = getColorPicker(t._server);
    if (!ColorPicker) {
      ColorPicker = jsx3.gui.ColorPicker;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(colorPicker).toBeInstanceOf(ColorPicker);
  });

  it("should be able to paint", function() {
    expect(colorPicker.getRendered()).not.toBeNull();
    expect(colorPicker.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should able to set and get the color axis shown on the right side of the control", function() {
    var Axis = colorPicker.getAxis();
    expect(Axis).toEqual(ColorPicker.HUE);
    var gradient = colorPicker.getRendered().firstChild.childNodes[0].firstChild;
    var bgColor = gradient.style.backgroundColor;

    if (bgColor.indexOf('#') != -1) {
      expect(bgColor).toEqual('#ff0000');
    } else {
      expect(bgColor).toEqual('rgb(255, 0, 0)');
    }

    colorPicker.setAxis(ColorPicker.SATURATION);
    colorPicker.repaint();
    expect(colorPicker.getAxis()).toEqual(ColorPicker.SATURATION);
    colorPicker.setAxis(ColorPicker.BRIGHTNESS);
    colorPicker.repaint();
    expect(colorPicker.getAxis()).toEqual(ColorPicker.BRIGHTNESS);
    gradient = colorPicker.getRendered().firstChild.childNodes[0].childNodes[2];

    bgColor = gradient.style.backgroundColor;
    if (bgColor.indexOf('#') != -1) {
      expect(bgColor).toEqual('#000000');
    } else {
      expect(bgColor).toEqual('rgb(0, 0, 0)');
    }
  });

  it("the currently selected color by RGB", function() {
    var RGB = colorPicker.getRGB();
    expect(RGB).toEqual(16711680);
    var gradient = colorPicker.getRendered().firstChild.childNodes[0].firstChild;

    var bgColor = gradient.style.backgroundColor;
    if (bgColor.indexOf('#') != -1) {
      expect(bgColor).toEqual('#ff0000');
    } else {
      expect(bgColor).toEqual('rgb(255, 0, 0)');
    }

    colorPicker.setRGB(10000000);
    RGB = colorPicker.getRGB();
    expect(RGB).toEqual(10000000);
    gradient = colorPicker.getRendered().firstChild.childNodes[0].firstChild;

    bgColor = gradient.style.backgroundColor;
    if (bgColor.indexOf('#') != -1) {
      expect(bgColor).toEqual('#ffea00');
    } else {
      expect(bgColor).toEqual('rgb(255, 234, 0)');
    }
  });

  it("should able to set and get the RGB value of the currently selected color as an integer", function() {
    var value = colorPicker.getValue();
    expect(value).toEqual(16711680);
    colorPicker.setValue('#ffffff');
    value = colorPicker.getValue();
    expect(value).toEqual(16777215);
    colorPicker.setValue(16734546);
    value = colorPicker.getValue();
    expect(value).toEqual(16734546);
    expect(colorPicker.getRGB()).toEqual(16734546);
  });

  it("should able to set the currently selected color by HSB components", function() {
    colorPicker.setHSB(0.1, 0.2, 0.3);
    expect(colorPicker.getRGB()).toEqual(5064253);
    expect(colorPicker.getValue()).toEqual(5064253);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});