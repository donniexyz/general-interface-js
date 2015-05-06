/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.TextBox", function(){
  
 var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.TextBox");
  var t = new _jasmine_test.App("jsx3.gui.TextBox");
  var textbox;

  var getTextbox = function(s){
    var root = s.getBodyBlock().load("data/form_components.xml");
    return root.getChild(0).getDescendantOfName('textbox');
  };    
  beforeEach(function () {
    t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true): t._server;
    textbox = getTextbox(t._server);
  });   

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });   

  it("should be able to deserialize", function(){
    expect(textbox).toBeInstanceOf(jsx3.gui.TextBox);
  });

  it("should be able to paint", function(){
    expect(textbox.getRendered()).not.toBeNull();
    expect(textbox.getRendered().nodeName.toLowerCase()).toEqual("input");
  });

  it("should able to set and get the type of TextBox", function(){
    expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXT);
    textbox.setType(jsx3.gui.TextBox.TYPETEXTAREA);
    expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXTAREA);
  });

  it("should able set and get the value for the text box", function(){
    expect(textbox.getValue()).toEqual("");
    textbox.setValue("helloword");
    expect(textbox.getValue()).toEqual("helloword");
    expect(textbox.getRendered().value).toEqual("helloword");
    textbox.setValue(12345);
    expect(textbox.getValue()).toEqual("12345");
    expect(textbox.getRendered().value).toEqual("12345");
  });   

  it("should able to paint BackgroundColor", function(){
    expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXT);
    textbox.setType(jsx3.gui.TextBox.TYPETEXTAREA);
    expect(textbox.getType()).toEqual(jsx3.gui.TextBox.TYPETEXTAREA);
  }); 

  it("should able to do validate for SSN data like 818-89-9988 format", function(){
    textbox.setValidationType(jsx3.gui.TextBox.VALIDATIONSSN);
    textbox.setValue("string");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("22-1-222");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("818-89-9988");
    expect(textbox.getRendered().value).toEqual("818-89-9988");
    expect(textbox.doValidate()).toBeTruthy();
  }); 

  it("should able to do validate for phone data format", function(){
    textbox.setValidationType(jsx3.gui.TextBox.VALIDATIONPHONE);
    textbox.setValue("string");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("22-1-222");
    expect(textbox.doValidate()).toBeTruthy();
    textbox.setValue("139109877");
    expect(textbox.doValidate()).toBeTruthy();
    textbox.setValue("(010)139109877");
    expect(textbox.doValidate()).toBeTruthy();
    textbox.setValue("(010)139109877s");
    expect(textbox.doValidate()).toBeFalsy();
  });  

  it("should able to do validate for email format", function(){
    textbox.setValidationType(jsx3.gui.TextBox.VALIDATIONEMAIL);
    textbox.setValue("string@");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("string@com");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("xima@tibco-support..com");
    expect(textbox.doValidate()).toBeFalsy();   
    textbox.setValue("xima@tibco-support.com");
    expect(textbox.doValidate()).toBeTruthy();
  }); 

  it("should able to do validate for number format", function(){
    textbox.setValidationType(jsx3.gui.TextBox.VALIDATIONNUMBER);
    textbox.setValue("string");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("22-1-222");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("818899988");
    expect(textbox.doValidate()).toBeTruthy();
  });  

  it("should able to do validate for letter format", function(){
    textbox.setValidationType(jsx3.gui.TextBox.VALIDATIONLETTER);
    textbox.setValue("w2");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("w@");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("ssss,ddd.");
    expect(textbox.doValidate()).toBeTruthy();

  });  

  it("should able to do validate for uszip format", function(){
    textbox.setValidationType(jsx3.gui.TextBox.VALIDATIONUSZIP);
    textbox.setValue("string");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("22-1-222");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("81889-0000");
    expect(textbox.doValidate()).toBeTruthy();
  });  

  it("should be able to set whether text box is read only", function(){
    textbox.setReadonly(1);
    expect(textbox.getReadonly()).toEqual(1);
  });  

  it("should be able to set ValidationExpression ", function(){
    textbox.setValidationExpression("123456");
    textbox.setValue("4444-4444");
    expect(textbox.doValidate()).toBeFalsy();
    textbox.setValue("123456");
    expect(textbox.doValidate()).toBeTruthy();    
  });  

  it("should be able to get ValidationExpression ", function(){
    textbox.setValidationExpression("^\d{4}-\d{4}$");   
    expect(textbox.getValidationExpression()).toEqual("^\d{4}-\d{4}$");
  });     
});