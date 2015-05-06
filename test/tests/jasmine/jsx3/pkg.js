/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3 - Javascript extended functions", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.jsxpackage", "jsx3.app.Cache", "jsx3.lang.System");

  it("has method eval() that could be evaluate a javasccript expression in a controlled local variable context.", function(){
    expect(jsx3.eval("2+3")).toEqual(5);
  });

  it("has method eval() could be evalute a javascript expression which has params", function(){
    expect(jsx3.eval("x+y",{x:2,y:3})).toEqual(5);
  });

  it("has method eval() could be evalute a javascript expression which has bad params", function(){
    expect(jsx3.eval("x+y",{x:2,y:3,"a b c":5})).toEqual(5);
  });

  it("has method eval() could be evaltute a javascript expression which the params include reserved word.", function(){
    expect(jsx3.eval("x+y",{x:2,y:3,"function":1,"if":2})).toEqual(5);
  });

  it("has setEnv() to set the value of a system-wide environment variable", function(){
    jsx3.setEnv("testkey", "testvalue");
    expect(jsx3.getEnv("testkey")).toEqual("testvalue");
  });

  it("has getEnv() to return the value of a system-wide environment variable", function(){
    jsx3.setEnv("testkey", "testvalue");
    jsx3.setEnv("TestKey2", "testvalue2");
    expect(jsx3.getEnv("testkey")).toEqual("testvalue");
    expect(jsx3.getEnv("TestKey")).toEqual("testvalue");
    expect(jsx3.getEnv("TestKey2")).toEqual("testvalue2");
    expect(jsx3.getEnv("Testkey2")).toEqual("testvalue2");
  });

  it("has method getSharedCache() to get the global JSX XML/SXL cache", function(){
    var c = jsx3.getSharedCache();
    expect(c).toBeInstanceOf(jsx3.app.Cache);
  });

  /*
   * sleep(objFunction : Function, strId : String, objThis : Object, bClobber : boolean)
   *  This method places all jobs in a queue and executed in a timeout. Each job gets its own stack.
   * Parameters:
   * objFunction – an anonymous function to call after a timeout.
   * strId – the id of this job. If this parameter is not null and a job already exists in the queue with this id, then this job is not added to the queue.
   * objThis – if provided, this object is the "this" context for the anonymous function objFunction when it is called.
   * bClobber – if true and a job already exists, this new job clobbers the old job.
   */
  it("has method sleep() which place a function/job in a queue and executed in a timeout.", function(){
    var flag;
    runs(function(){
      jsx3.sleep(function() {
        flag = true;
      });
    });
    waitsFor(function(){
      return flag;
    },"flag should be set true in jsx3.sleep()", 750);

    runs(function(){
      expect(flag).toBeTruthy();
    })

  });

  it("has method sleep() which place a function/job in a queue and executed in a timeout and 'this' object context.", function(){
    var obj ={}, that = null;

    runs(function(){
      jsx3.sleep(function(){
        that = this;
      }, null, obj); // null id, obj context
    });

    waitsFor(function() {
      return that != null;
    });

    runs(function() {
      expect(that).not.toBeNull();
      expect(that).toEqual(obj);
    });

  });

  it("has method sleep() that will not clobber existing job with same ID", function(){
    var firstExecuted = false, secondExecuted = false, flag = false;

    jsx3.sleep(function() {
      firstExecuted = true;
    }, "dupId");
    jsx3.sleep(function() {
      secondExecuted = true;
    }, "dupId");
    setTimeout(function() { flag = true; }, 500);

    waitsFor(function(){
      return flag; // second job has same id and no clobber will not execute.
    },"first job should have executed", 750);

    // we don't need a setTimeout(asynchcallback()) here because waitsFor(asynchBlock) then runs(nextCodeBlock)
    runs(function(){
      expect(firstExecuted).toBeTruthy();
      expect(secondExecuted).toBeFalsy();
    })
  });

  it("has method sleep() with a clobber flag that allow this new job clobbers the old job of same ID.", function(){
    var firstExecuted = false, secondExecuted = false;

    jsx3.sleep(function() {
      firstExecuted = true;
    }, "dupId");
    jsx3.sleep(function() {
      secondExecuted = true;
    }, "dupId", null, true);

    waitsFor(function(){
      return secondExecuted;
    },"second job should clobber the first one with same ID",750);

    runs(function(){
      expect(firstExecuted).toBeFalsy();
      expect(secondExecuted).toBeTruthy();
    });
  });

  it("Error thrown in sleep() job does not affect nested sleep job", function(){
    var secondExecuted = false;

    jsx3.sleep(function() {
      jsx3.sleep(function() {
        secondExecuted = true;
      });
      throw new Error('first nested sleep');
    });

    waitsFor(function(){
      return secondExecuted;
    },"Error thrown in sleep() job does not affect nested sleep job",750);

    runs(function(){
      expect(secondExecuted).toBeTruthy();
    });

  });

  it("Error thrown in sleep() job does not affect next job", function(){
    var secondExecuted = false;

    runs(function() { // this does not have to be in a runs(), just showing that it doesn't matter here.
      jsx3.sleep(function() {
        throw new Error('');
      });
      jsx3.sleep(function() {
        secondExecuted = true;
      });
    });

    waitsFor(function(){
      return secondExecuted;
    },"Second job should still be executed",750);

    runs(function(){
      expect(secondExecuted).toBeTruthy();
    });

  });

  it("should has method require() to import package synchronously", function(){
    if (jsx3.app && jsx3.app.UserSettings){
      delete jsx3.app.UserSettings;
    }

    if(jsx3.app){
      expect(jsx3.app.UserSettings).not.toBeDefined();
    }

    jsx3.require("jsx3.app.UserSettings");

    expect(jsx3.app.UserSettings).toBeDefined();
    expect(jsx3.app.UserSettings.jsxclass).toBeInstanceOf(jsx3.lang.Class);
  });

  it("should has method require() to import package asynchronously using jsx3.sleep()", function(){
    var e = null;
    if(jsx3.app && jsx3.app.UserSettings){
      delete jsx3.app.UserSettings;
    }

    if(jsx3.app){
      expect(jsx3.app.UserSettings).not.toBeDefined();
    }

    jsx3.sleep(function(){
      jsx3.require("jsx3.app.UserSettings");
      try{
        expect(jsx3.app.UserSettings).toBeDefined();
        expect(jsx3.app.UserSettings.jsxclass).toBeInstanceOf(jsx3.lang.Class);
      }catch(ex){
        e = ex;
      }
    });

    if(e == null){
      jsx3.sleep(function(){
        try{
          expect(jsx3.app.UserSettings).toBeDefined();
          expect(jsx3.app.UserSettings.jsxclass).toBeInstanceOf(jsx3.lang.Class);
        }catch(ex){
          e = ex;
        }

        if(e == null){
          try{
            jsx3.require("jsx3.app.UserSettings");
          }catch(ex){
            e = ex;
          }
        }
      });
    }

    runs(function() {
      jsx3.sleep(function(){
        if(e) throw e;
      });
    });
  });

  it("should has method requireAsync() to async require package", function(){
    //set up
    if(jsx3.net && jsx3.net.Form){
      delete jsx3.net.Form;
    }

    if(jsx3.net){
      expect(jsx3.net.Form).not.toBeDefined();
    }

    jsx3.requireAsync("jsx3.net.Form").when(function(){
      expect(jsx3.net.Form).toBeDefined();
      expect(jsx3.net.Form.jsxclass).toBeInstanceOf(jsx3.lang.Class);
    });

    waitsFor(function () {
      return jsx3.net.Form != null;
    });

    runs(function (){
      expect(jsx3.net.Form).toBeDefined();
      expect(jsx3.net.Form.jsxclass).toBeInstanceOf(jsx3.lang.Class);
    });

  });

  it("should throw exception when requireAsync() loading a bad package", function(){
    expect(function(){
      jsx3.requireAsync("jsx3.notapackage.Class");
    }).toThrow();
  });

  it("should not excute callback when requireAsync() loading a bad class", function(){
    var flag = false;

    runs(function(){
      expect(jsx3.util.notAClass).not.toBeDefined();
    });

    jsx3.requireAsync("jsx3.util.NotAClass").when(function(){
      jasmine.fail("should never have trigger this callback on failed asynch loading")
    });

    setTimeout(function() {
      flag = true;
    }, 500);

    waitsFor(function(){
      return flag;
    },"",1000);

    runs(function(){
      expect(jsx3.util.NotAClass).not.toBeDefined();
    });
  });
});