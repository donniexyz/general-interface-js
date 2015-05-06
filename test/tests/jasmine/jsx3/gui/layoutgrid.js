/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.LayoutGrid", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.LayoutGrid");

  it("has method getCols() to get column string", function(){
    var lg = new jsx3.gui.LayoutGrid();
    lg.setCols("10,*");
    expect(lg.getCols()).toEqual("10,*");
  });

  it("has method getCols() to get column array", function(){
    var lg = new jsx3.gui.LayoutGrid();
    lg.setCols([10, "*"]);
    expect(lg.getCols()).toEqual("10,*");
  });

});