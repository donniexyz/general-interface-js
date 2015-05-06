/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("ext - Javascript extended functions", function(){

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.$Y", "jsx3.jsxpackage", "jsx3.util.jsxpackage", "jsx3.util.EventDispatcher");

  describe("jsx3.$Object, jsx3.$O - javascript extended Object", function(){

    it("$O.extend() should copy all properties of existing object to new object", function(){
      var o = {k1:"v1"};
      jsx3.$O(o).extend({k1:"v1",k2:"v2"});
      expect(o.k1).toEqual("v1");
      expect(o.k2).toEqual("v2");
    });

    it("$O.clone() should create a clone of existing object with all the same properties", function(){
      var o = jsx3.$O({k1:"v1",k2:"v2"}).clone();
      expect(o.k1).toEqual("v1");
    });

  });

  describe("jsx3.$Array, jsx3.$A - javascript extended Array", function(){
    it("should be able to create an empty $Array using jsx3.$A().", function(){
      var a = jsx3.$A();
      expect(a instanceof Array).toBeTruthy();
      expect(a.each).toBeTypeOf("function");
      expect(a.length).toEqual(0);

      a = jsx3.$A(null);
      expect(a.length).toEqual(0);
    });

    it("should be able to create and initialize a jsx3.$Array by passing a value into jsx3.$A()", function(){
      var a = jsx3.$A(5);
      expect(a instanceof Array).toBeTruthy();
      expect(a.length).toEqual(1);
      expect(a[0]).toEqual(5);
    });

    it("should be able to create a new instance of jsx3.$Array by wrapping an existing array", function(){
      var a = jsx3.$A(["a", "b"]);
      expect(a instanceof Array).toBeTruthy();
      expect(a.length).toEqual(2);
      expect(a[0]).toEqual("a");
      a = jsx3.$A([null]);
      expect(a.length).toEqual(1);
    });

    it("should be able to iterate over a wrapped $Array using $Array.each() method", function(){
      var a = jsx3.$A([1, 2, 3, 4, 5]);
      var sum = 0;
      a.each(function(e){	sum += e;});
      expect(sum).toEqual(15);
    });

    it("can create new array by mapping the jsx3.$Array (value*10) into a new array", function(){
      var a = jsx3.$A([1, 2, 3, 4, 5]);
      var b = a.map(function(e) { return 10 * e; });
      expect(b instanceof Array).toBeTruthy();
      expect(b.each).toBeTypeOf("function");
      expect(b.length).toEqual(5);
      expect(b[0]).toEqual(10);
    });

    it("can create a new array by filtering the jsx3.$Array for value that is divisible by 2", function(){
      var a = jsx3.$A([1, 2, 3, 4, 5]);
      var b = a.filter(function(e) { return e % 2 == 0; });
      expect(b instanceof Array).toBeTruthy();
      expect(b.each).toBeTypeOf("function");
      expect(b.length).toEqual(2);
      expect(b[0]).toEqual(2);
      expect(b[1]).toEqual(4);
    });

    it("has the method indexOf() that will return a positive index for value found in the array and -1 index for value that is not found", function(){
      var a = jsx3.$A([1, 2, 3, 4, 5]);
      expect(a.indexOf(2)).toEqual(1);
      expect(a.indexOf(10)).toEqual(-1);
      expect(a.indexOf("3")).toEqual(-1);
    });

    it("has method contains() that should return true if a value is in the jsx3.$Array", function(){
      var a = jsx3.$A([1, 2, 3, 4, 5]);
      expect(a.contains(1)).toBeTruthy();
      expect(a.contains(4)).toBeTruthy();
      expect(a.contains(10)).toBeFalsy();
      expect(a.contains("2")).toBeFalsy();
      expect(a.contains(null)).toBeFalsy();
    });

    it("should be able to remove the first occurrence of o in this array", function(){
      var a = jsx3.$A([1, 2, 3, 4, 5]);
      a.remove(3);
      expect(a.length).toEqual(4);
      a.remove("2");
      expect(a.length).toEqual(4);
    });

    it("has find() method that will return the first element that matches a given condition", function(){
      var a = jsx3.$A([1, 2, 3, 4, 5]);
      expect(a.find(function(e){return e % 3 ==0;})).toEqual(3);
      expect(a.find(function(e){return e % 7 ==0;})).not.toBeDefined();
    });

    it("should return a list containing only the unique element in this list", function(){
      var a = jsx3.$A([1, 2, 1, 1, 5, 2]);
      var b = a.unique();
      expect(b.length).toEqual(3);
      expect(b[0]).toEqual(1);
      expect(b[1]).toEqual(2);
      expect(b[2]).toEqual(5);
    });


  });


  describe("jsx3.$Hash, jsx3.$H", function(){
    it("should iterate over all the key-value pairs of this hashtable", function(){
      var o = new jsx3.lang.Object();
      o.k1 = 1;
      o.k2 = 2;
      var sum = 0;
      jsx3.$H(o).each(function(k,v){ sum +=v;});
      expect(sum).toEqual(3);
    });

    it("should be able to return true if a keys is in this hashtable", function(){
      var o = jsx3.$H({a:1, b:2, c:3});
      var k = o.keys();
      expect(k.length).toEqual(3);
      expect(k.contains("a")).toBeTruthy();
      expect(k.contains("b")).toBeTruthy();
      expect(k.contains("c")).toBeTruthy();
    });

    it("should be able to return true if the list of values is in this hashable", function(){
      var o = jsx3.$H({a:1, b:2, c:3});
      var k = o.values();
      expect(k.length).toEqual(3);
      expect(k.contains(1)).toBeTruthy();
      expect(k.contains(2)).toBeTruthy();
      expect(k.contains(3)).toBeTruthy();
    });

  });

  describe("jsx3.$Function, jsx3.$F", function(){

    it("should be able to return a menthod that is this function applied to thisObj with arguments", function(){
      var f = jsx3.$F(function(){return this;}).bind({k:"v"});
      expect(f().k).toEqual("v");
    });

    it("should return a menthod that is this function applied to thisObj with arguments", function(){
      var f = jsx3.$F(function(a, b, c) { return a + b + c; }).bind(null, [0, 1, 2]);
      expect(f()).toEqual(3);
    });
  });

  describe("jsx3.$String, jsx3.$S", function(){
    it("has endsWith() method that will be return true if this string ends with string s", function(){
      expect(jsx3.$S("abc").endsWith("c")).toBeTruthy();
      expect(jsx3.$S("def").endsWith("ef")).toBeTruthy();
      expect(jsx3.$S("123").endsWith("1")).toBeFalsy();
    });

    it("has trim() method that will be return this string with all leading and trailing space removed", function(){
      expect(jsx3.$S("       ").trim().toString()).toEqual("");
      expect(jsx3.$S("  abc  ").trim().toString()).toEqual("abc");
      expect(jsx3.$S(" \n \t ").trim().toString()).toEqual("");
    });
  });

  describe("jsx3.$AsyncRV, jsx3.$AsyncCB, jsx3.$Y -", function(){
    it("should signal the callback object that the asynchronous menthod is done and pass the async return value", function(){
      var f = jsx3.$Y(function(cb){
        cb.done(1);
      });
      var rv =f();
      expect(rv.rv()).toEqual(1);
    });

    it("has method args() that has the arguments that were passed to the async menthod wrapper", function(){
      var f = jsx3.$Y(function(cb){
        var args = cb.args();
        expect(args[0]).toEqual(0);
        expect(args[1]).toEqual(1);
        expect(args[2]).toEqual(2);
        cb.done(1);
      });
      f(0,1,2);
    });

    // testYSyncError
    it("should trigger async callback error when calling rv() directly before when() returns", function(){
      var f = jsx3.$Y(function(cb){
        jsx3.sleep(function(){	cb.done(1); });
      });
      var rv = f();
      expect(function(){
        rv.rv();
      }).toThrow();
    });

    it("should not have any problem calling rv() return value method when() async has returned", function(){
      var f = jsx3.$Y(function(cb){
        jsx3.sleep(function(){cb.done(1);});
      });
      var rv =f(), returnvalue;
      rv.when(function(){
        // when async function f returns, we check the returned value with rv() method
        returnvalue = rv.rv();
      });

      waitsFor(function() {
        return returnvalue != null;
      });

      runs(function() {
        expect(returnvalue).toEqual(1);
      })
    });

    it("should be able to chain two async return using $AsyncRV.and()", function(){
      var ct = 0;

      var f1 =jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          expect( ct == 0 || ct ==1).toBeTruthy();
          ct++;
          cb.done();
        });
      });

      var f2 = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          expect( ct == 0 || ct ==1).toBeTruthy();
          ct++;
          cb.done();
        });
      });

      var rv1;
      var rv2;
      runs(function(){
        rv1 = f1();
        rv2 = f2();
      });
      waitsFor(function(){
        return ct > 1;
      },"rv1 and rv2 should be completes",1000);

      runs(function(){
        rv1.and(rv2).when(function(){
          expect(ct).toEqual(2);
        });
      });
    });

    it("should be able to chain RV response back up nested asynch function call", function(){
      var f1 = jsx3.$Y(function(cb) {
        jsx3.sleep(function() {
          cb.done(1);
        });
      });

      var rv = null;
      runs(function(){
        var f2 = jsx3.$Y(function(cb){
          jsx3.sleep(function(){
            f1().when(cb);
          });
        });
        rv = f2();
      });

      waitsFor(function(){
        return rv != null;
      },"rv should be completed",1000);

      runs(function(){
        rv.when(function(){
          expect(rv.rv()).toEqual(1);
        });
      });
    });

    it("should be able to use either of two AsyncRV as the completed return value using AsyncRV.or()", function(){
      var ct = 0;

      var f1 = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          expect(0 == ct || 1 == ct).toBeTruthy();
          ct ++;
          cb.done();
        });
      });

      var f2 = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          expect(0 == ct || 1 == ct).toBeTruthy();
          ct ++;
          cb.done();
        });
      });

      var rv1 = f1(),
        rv2 = f2();
      runs(function(){
        rv1.or(rv2).when(function(){
          expect(ct).toEqual(1);
        });
      });

      waitsFor(function() {
        return ct > 0;
      })
    });

    it("should be able to call an async $Y function within another $Y function and still pass the args parameter", function(){
      var f1 = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          cb.done(1);
        });
      });
      var f2 = jsx3.$Y(function(cb){
        var a = cb.args()[0];
        cb.done(1+a);
      });

      var rv = f2(f1()), returnval;
      runs(function(){
        rv.when(function(){
          returnval = rv.rv();
          expect(returnval).toEqual(2);
        });
      });

      waitsFor(function() {
        return returnval == 2;
      })
    });

    it("should be able to return a $Y async function as the return value of another $Y function", function(){
      var f1 = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          cb.done(1);
        });
      });

      var f2 = jsx3.$Y(function(cb){
        return f1();
      });

      var rv = f2();
      var result;
      runs(function(){
        rv.when(function(){
          result = rv.rv();
          expect(rv.rv()).toEqual(1);
        });
      });
      
      waitsFor(function(){
        return result == 1;
      },"the vaule should be true.",1000);
    });
    
  });

  describe("$Z is an asynch wrapper around a synchronous method",function(){
    it("should return an async wrapper of a sync method which haven't argument", function(){
      var f = function(){
        return 1;
      };

      var rv = jsx3.$Z(f)();
      expect(rv.rv()).toEqual(1);
    });

    it("should return an async wrapper of a sync method: 2", function(){
      var f = function(n){
        return n*2;
      };

      var rv = jsx3.$Z(f)(5);
      expect(rv.rv()).toEqual(10);
    });

    it("$Z wrapped function should execute only when all its arguments return", function(){
      var arg1 = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          cb.done(10);
        });
      });
      var f = function(n){
        return n*2;
      };
      var rv;
      waitsFor(function(){
        rv = jsx3.$Z(f)(arg1());
        return rv;
      },"the return value should be true",1000);

      runs(function(){
        rv.when(function(){
          expect(rv.rv()).toEqual(20);
        });
      });
    });

    it("should be able to return an async wrapper which wrapper around a synch method", function(){
      var value, flag;
      var objThis = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          cb.done({
            run:function(a){
              return a;
            }
          });
        });
      });

      var arg1 = jsx3.$Y(function(cb){
        jsx3.sleep(function(){
          cb.done(10);
        });
      });
      var rv, result; 
      rv = jsx3.$Z("run", objThis())(arg1());
      
      runs(function(){
        rv.when(function(){
          result = rv.rv();
          expect(result).toEqual(10);
        });
      });
      
      waitsFor(function(){
        return result == 10;
      },"result will not be null", 1000);
      
    });

    it("should be able to access 'this' in the context of the passed argument object", function(){
      var f = function(){
        return this.k + 1;
      };

      var rv = jsx3.$Z(f).apply({k:10});
      expect(rv.rv()).toEqual(11);
    });

  });

});