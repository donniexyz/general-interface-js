/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.RadioButton", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.RadioButton");
  var t = new _jasmine_test.App("jsx3.gui.RadioButton");
  var radioButton;
  var RadioButton;

  var getRadioButton = function(s) {
    var root = s.getBodyBlock().load("data/form_components.xml");
    return root.getServer().getJSXByName('radioButton');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true) : t._server;
    radioButton = getRadioButton(t._server);
    if (!RadioButton) {
      RadioButton = jsx3.gui.RadioButton;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(radioButton).toBeInstanceOf(RadioButton);
  });

  it("should be able to paint", function() {
    expect(radioButton.getRendered()).not.toBeNull();
    expect(radioButton.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should able to do validate", function() {
    expect(radioButton.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
    radioButton.setRequired(jsx3.gui.Form.REQUIRED);
    expect(radioButton.doValidate()).toEqual(jsx3.gui.Form.STATEINVALID);
    radioButton.setSelected(RadioButton.SELECTED);
    radioButton.setValue('sex');
    expect(radioButton.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
  });

  it("should be able to set and get the default selection state of this radio button", function() {
    var defaultSelected = radioButton.getDefaultSelected();
    expect(defaultSelected).toEqual(RadioButton.SELECTED);
    radioButton.setDefaultSelected(RadioButton.UNSELECTED);
    defaultSelected = radioButton.getDefaultSelected();
    expect(defaultSelected).toEqual(RadioButton.UNSELECTED);
  });

  it("should be able to set and get the group name of this radio button", function() {
    var groupName = radioButton.getGroupName();
    expect(groupName).toEqual('group1');
    radioButton.setGroupName('group2');
    groupName = radioButton.getGroupName();
    expect(groupName).toEqual('group2');
    radioButton.repaint();
    var radioInput = radioButton.getRendered().firstChild.firstChild.firstChild; //Obtain the input element of radio button.
    expect(radioInput.getAttribute('name')).toEqual('group2');
  });

  it("should be able to set and get the value of the selected radio button in the radio group of this radio button", function() {
    var groupValue = radioButton.getGroupValue();
    expect(groupValue).toBeUndefined();
    radioButton.setGroupValue('sex');
    groupValue = radioButton.getGroupValue();
    expect(groupValue).toBeNull();
    radioButton.setSelected(RadioButton.SELECTED);
    radioButton.setValue('sex');
    radioButton.repaint();
    groupValue = radioButton.getGroupValue();
    expect(groupValue).toEqual('sex');
    var radioInput = radioButton.getRendered().firstChild.firstChild.firstChild; //Obtain the input element of radio button.
    expect(radioInput.getAttribute('value')).toEqual('sex');
  });

  it("should be able to set and get the current selection state of this radio button", function() {
    var selected = radioButton.getSelected();
    expect(selected).toEqual(RadioButton.UNSELECTED);
    radioButton.setSelected(RadioButton.SELECTED);
    selected = radioButton.getSelected();
    radioButton.repaint();
    expect(selected).toEqual(RadioButton.SELECTED);
    var radioInput = radioButton.getRendered().firstChild.firstChild.firstChild; //Obtain the input element of radio button.
    expect(radioInput.getAttribute('checked')).toEqual('checked');
  });

  it("should be able to set and get the value of this radio button", function() {
    var value = radioButton.getValue();
    expect(value).toBeUndefined();
    radioButton.setValue('name');
    radioButton.repaint();
    value = radioButton.getValue();
    expect(value).toEqual('name');
    var radioInput = radioButton.getRendered().firstChild.firstChild.firstChild; //Obtain the input element of radio button.
    expect(radioInput.getAttribute('value')).toEqual('name');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});