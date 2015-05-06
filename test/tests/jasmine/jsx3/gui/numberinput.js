/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.NumberInput", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.NumberInput");

  it("has method parseValue() to parse input number", function(){
    var nin = new jsx3.gui.NumberInput();
    nin.setFormat("#,##0.00");
    expect(nin.parseValue("1,234.56")).toEqual(1234.56);
    expect(nin.parseValue("11 text")).toEqual(11);
    expect(nin.parseValue("text 11")).toEqual(11);
    expect(nin.parseValue("11 222.00")).toEqual(11);
    expect(nin.parseValue("1,111,111.22")).toEqual(1111111.22);
    expect(nin.parseValue("000.1234")).toEqual(0.1234);
  });

  it("has method formatValue() to format the value before displaying it in the onscreen input box", function(){
    var nin = new jsx3.gui.NumberInput();
    expect(nin.formatValue(1234.56)).toEqual("1,234.56");
  });

  it("will use the default number format (US) when bad format is specified by setFormat()", function(){
    var nin = new jsx3.gui.NumberInput();
    nin.setFormat("NaN");//bad format;
    expect(nin.parseValue("1,234.56")).toEqual(1234.56);
    expect(nin.formatValue(1234.56)).toEqual("1,234.56");
  });
  
  it("should parse invalid value as NaN", function() {
    var nin = new jsx3.gui.NumberInput();
    expect(nin.parseValue("text")).toBeNaN();
  });
  
  it("should render as input box", function() {
    var nin= new jsx3.gui.NumberInput();
    expect(nin.paint()).toMatch(/input\s*type=\"text\"/);  
  });

});