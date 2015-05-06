/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
 
describe("jsx3.lang.AOP;The AOP class allows aspect oriented programming technique such as wrapping existing function in before call and after call code execution", function(){
	var _jasmine_test = gi.test.jasmine;
	_jasmine_test.require("jsx3.lang.AOP");
	
	it("should be able to instantiate AOP", function(){
		expect(jsx3).not.toBeNull();
		expect(jsx3.lang).not.toBeNull();
		expect(jsx3.lang.AOP).not.toBeNull();
	});
	
	it("has method before() to add an advice prior to an instance method", function(){
		var c1 = false, c2 = false;
		jsx3.lang.Class.defineClass("test.AOP", null,null ,function(C,P){
			P.m = function(a,b,c){
				expect(c2).toBeTruthy();
				expect(a).toEqual(1);
				expect(b).toEqual(2);
				expect(c).toEqual(3);
				c1 = true;
			}
		});
		
		jsx3.lang.AOP.pc("testBefore", {classes:"test.AOP", methods:"m"});
		jsx3.lang.AOP.before("testBefore",function(a, b, c){
			expect(c1).toBeFalsy();
			expect(a).toEqual(1);
			expect(b).toEqual(2);
			expect(c).toEqual(3);
			c2 = true;
		});
		
		(new test.AOP()).m(1,2,3);
		
		expect(c1).toBeTruthy();
		expect(c2).toBeTruthy();
		
		jsx3.lang.AOP.pcrem("testBefore");
		delete test.AOP;
	});
	
	it("has method after() that add advice after an instance method", function(){
		var c1 = false, c2 = false;
		expect(test.AOP).not.toBeDefined();
		jsx3.lang.Class.defineClass("test.AOP", null, null, function(C,P){
			P.m = function(a, b){
				expect(c2).toBeFalsy();
				expect(a).toEqual(1);
				expect(b).toEqual(2);
				c1 = true;
				return 10;
			};
		});
		
		jsx3.lang.AOP.pc("testAfter",{classes:"test.AOP", methods:"m"});
		
		jsx3.lang.AOP.after("testAfter", function(rv, a, b){
			expect(c1).toBeTruthy();
			expect(a).toEqual(1);
			expect(b).toEqual(2);
			expect(rv).toEqual(10);
			c2 = true;
			return 20;
		});
		
		var v = (new test.AOP()).m(1, 2);
		expect(c1).toBeTruthy();
		expect(c2).toBeTruthy();
		expect(v).toEqual(10);
		
		jsx3.lang.AOP.pcrem("testAfter");
		delete test.AOP;
	});
	
	it("has method around() that add advice around an instance method", function(){
		jsx3.lang.Class.defineClass("test.AOP",null, null, function(C, P){
			P.m = function(a, b){
				expect(a).toEqual(1);
				expect(b).toEqual(5);
				return 10;
			}
		});
		jsx3.lang.AOP.pc("testAround", {classes:"test.AOP", methods:"m"});
		jsx3.lang.AOP.around("testAround", function(aop, a, b) {
			expect(a).toEqual(1);
			expect(b).toEqual(2);
			var rv = aop.proceed(a, 5);
			expect(rv).toEqual(10);
			return 20;
		});

		var v = (new test.AOP()).m(1, 2);
		expect(v).toEqual(20);
		
		jsx3.lang.AOP.pcrem("testAround");
		delete test.C1;
	});
	
	it("should be able to create a new point cut and add advice before an inherited method", function(){
		var c1 = false, c2 = false, c3 = false;
    
		jsx3.lang.Class.defineClass("test.C1", null, null, function(C, P){
			P.m = function() {
				c1 = true;
			};
		});

		jsx3.lang.Class.defineClass("test.C2", test.C1, null, function(C, P){
			P.m = function() {
				c2 = true;
			};
		});
		
		jsx3.lang.AOP.pc("testSubclass", {classes:"test.C2", methods:"m"});
		jsx3.lang.AOP.before("testSubclass", function() {
			c3 = true;
		});
		
		
		(new test.C2()).m();
		expect(c1).toBeFalsy();
		expect(c2).toBeTruthy();
		expect(c3).toBeTruthy();
		
		jsx3.lang.AOP.pcrem("testSubclass");
		delete test.C1;
		delete test.C2;
	});
 });