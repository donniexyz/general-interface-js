/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Label", function(){
  
 var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Label");
  var t = new _jasmine_test.App("jsx3.gui.Label");
  var label;

  var getLabel = function(s){
    var root = s.getBodyBlock().load("data/form_components.xml");
    return root.getServer().getJSXByName('formLabel');
  };

  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true): t._server;
    label = getLabel(t._server);
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to deserialize", function(){
    expect(label).toBeInstanceOf(jsx3.gui.Label);
  });

  it("should be able to paint", function(){
    expect(label.getRendered()).not.toBeNull();
    expect(label.getRendered().nodeName.toLowerCase()).toEqual('label');
  });

  it("should be able to set and get the for target", function() {
    expect(label.getFor()).toEqual('#input');
    label.setFor('#span');
    expect(label.getFor()).toEqual('#span');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});