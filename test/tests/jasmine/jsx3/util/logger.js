/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.util.Logger", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.Logger","jsx3.lang.Exception","jsx3.util.Logger.Handler");
  
  it("should be able to add a handler to this logger", function(){
    var logger = new jsx3.util.Logger();
    expect(logger).toBeInstanceOf(jsx3.util.Logger);
    expect(logger._handler).not.toBeDefined();
    var objHandler = jsx3.util.Logger.Handler;
    logger.addHandler(objHandler);
    expect(logger._handler).not.toBeNull();
  });
  
  it("should return the effective level of this logger", function(){
    var logger = new jsx3.util.Logger();
    var objParent = new jsx3.util.Logger();
    logger.setParent(objParent);
    logger.setLevel("3");
    expect(logger.getEffectiveLevel()).toEqual(3);
  });
  
  it("should be get and set the level of this logger",function(){
    var logger =new jsx3.util.Logger();
    logger.setLevel("4");
    expect(logger.getLevel()).toEqual(4);
  });
  it("should return the name of this logger", function(){
    var logger = new jsx3.util.Logger("loggerName");
    expect(logger.getName()).toEqual("loggerName");
  });
  
  it("should get and set the parent logger of this logger",function(){
    var logger = new jsx3.util.Logger();
    var objParent = new jsx3.util.Logger();
    logger.setParent(objParent);
    expect(logger.getParent()).toEqual(objParent);
  });
  
  it("should be able to remove a handler from this logger",function(){
    var logger = new jsx3.util.Logger();
    var objHandler = jsx3.util.Logger.Handler;
    logger.addHandler(objHandler);
    expect(logger._handler).not.toBeNull();
    logger.removeHandler();
    expect(logger._handler).not.toBeDefined();
  });
  
  it("should be able to set whether this logger will publish log message to this handler of its parent logger",function(){
    var logger = new jsx3.util.Logger();
    logger.setUseParentHandlers(true);
    expect(logger.getUseParentHandlers()).toEqual(true);
  });
});
