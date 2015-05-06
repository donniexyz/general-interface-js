/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Button", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Button");
  var t = new _jasmine_test.App("jsx3.gui.Button");
  var button;

  var getButton = function(s) {
    var root = s.getBodyBlock().load("data/button.xml");
    return root.getServer().getJSXByName('counterButton');
  };
  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_button.xml", ".", true) : t._server;
    button = getButton(t._server);
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(button).toBeInstanceOf(jsx3.gui.Button);
  });

  it("should be able to paint", function() {
    expect(button.getRendered()).not.toBeNull();
    expect(button.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should be able to set and get the value", function() {
    var value = button.getValue();
    expect(value).toEqual('[button text]');
    button.setText('test');
    value = button.getValue();
    expect(value).toEqual('test');
    expect(button.getText()).toEqual('test');
  });

  it("should be able to trigger action when clicked", function() {
    expect(button._clickCounter).toEqual(0);
    button.doExecute();
    expect(button._clickCounter).toEqual(1);
    button.getRendered().click();
    expect(button._clickCounter).toEqual(2);
  });

  it('should be able to be disabled', function() {
    expect(button._clickCounter).toEqual(0);
    button.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    button.getRendered().click();
    expect(button._clickCounter).toEqual(0);
    button.setEnabled(jsx3.gui.Form.STATEENABLED, true);
    button.getRendered().click();
    expect(button._clickCounter).toEqual(1);
  });

  it("should be able to display different styled buttons", function() {
    button.setFontName("Verdana,Arial,sans-serif");
    button.repaint();
    var fontFamily = button.getRendered().style.fontFamily;
    expect(fontFamily).toMatch(/Verdana|Arial|sans-serif/);
    button.setFontSize(18);
    button.repaint();
    expect(button.getRendered().style.fontSize).toEqual('18px');
    button.setFontWeight('bold');
    button.repaint();
    expect(button.getRendered().style.fontWeight).toEqual('bold');
    button.setColor('red', true);
    expect(button.getRendered().style.color).toEqual('red');
    button.setBackgroundColor('#f00');
    button.repaint();

    var bgColor = button.getRendered().style.backgroundColor;
    if (bgColor.indexOf('#') != -1) {
      expect(bgColor).toEqual('#f00');
    } else {
      expect(bgColor).toEqual('rgb(255, 0, 0)');
    }
    button.setBorder('border: inset 3px #000000', true);
    var border = button.getRendered().style.border;
    if (border.indexOf('#') != -1) {
      expect(border).toEqual('#000000 3px inset');
    } else {
      expect(border).toEqual('3px inset rgb(0, 0, 0)');
    }
  });

  it("should be able to set and get the font color to use when this control is disabled", function() {
    button.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    expect(button.getDisabledColor()).toBeUndefined();
    button.setDisabledColor('#ff0000');
    button.repaint();
    expect(button.getDisabledColor()).toEqual('#ff0000');

    var disabledColor = button.getRendered().style.color;
    if (disabledColor.indexOf('#') != -1) {
      expect(disabledColor).toEqual('#ff0000');
    } else {
      expect(disabledColor).toEqual('rgb(255, 0, 0)');
    }
  });

  it("should be able to set and get the background color when it is disabled", function() {
    button.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    expect(button.getDisabledBackgroundColor()).toBeUndefined();
    //Input box has default disabled color 'rgb(216, 216, 229)'

    var disabledColor = button.getRendered().style.backgroundColor;
    if (disabledColor.indexOf('#') != -1) {
      expect(disabledColor).toEqual('#d8d8e5');
    } else {
      expect(disabledColor).toEqual('rgb(216, 216, 229)');
    }
    button.setDisabledBackgroundColor('grey');
    button.repaint();
    expect(button.getDisabledBackgroundColor()).toEqual('grey');
    expect(button.getRendered().style.backgroundColor).toEqual('grey');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});