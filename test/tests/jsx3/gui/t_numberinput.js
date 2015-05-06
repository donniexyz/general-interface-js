/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

gi.test.jsunit.defineTests("jsx3.gui.NumberInput", function(t, jsunit) {

  jsunit.require("jsx3.gui.NumberInput");

  t.testNumberInputParse = function() {
    var nin = new jsx3.gui.NumberInput();
    nin.setFormat("#,##0.00");
    jsunit.assertEquals(1234.56, nin.parseValue("1,234.56"));
  };

  t.testNumberInputFormat = function() {
    var nin = new jsx3.gui.NumberInput();
    jsunit.assertEquals("1,234.56", nin.formatValue(1234.56));
  };
  
  t.testBadFormat = function() {
    var nin = new jsx3.gui.NumberInput();
    nin.setFormat("NaN"); // bad format should default to NumberFormat(null)
    jsunit.assertEquals(1234.56, nin.parseValue("1,234.56"));    
    jsunit.assertEquals("1,234.56", nin.formatValue(1234.56));
  };
  
});
