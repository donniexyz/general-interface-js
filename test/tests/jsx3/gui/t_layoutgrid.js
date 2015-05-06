/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.gui.LayoutGrid", function(t, jsunit) {

  jsunit.require("jsx3.gui.LayoutGrid");

  t.testGetColsString = function() {
    var lg = new jsx3.gui.LayoutGrid();
    lg.setCols("10,*");
    jsunit.assertEquals("10,*", lg.getCols());
  };
  
  t.testGetColsArray = function() {
    var lg = new jsx3.gui.LayoutGrid();
    lg.setCols([10,"*"]);
    jsunit.assertEquals("10,*", lg.getCols());
  };
  
});
