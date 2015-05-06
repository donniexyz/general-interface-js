/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.util.List", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.List");

  beforeEach(function(){
    expect(jsx3.lang.Class.forName("jsx3.util.List")).not.toBeNull();
    expect(jsx3.util.List).toBeInstanceOf(Function);
  });

  it("should be able to wrap an array to list", function(){
    var array = [1, 2, 3, 4];
    var list = jsx3.util.List.wrap(array);
    expect(list).toBeInstanceOf(jsx3.util.List);
    expect(list.size()).toEqual(4);
    expect(list.get(1)).toEqual(2);
    array.pop();
    expect(list.size()).toEqual(3);
    expect(jsx3.util.List.wrap(list)).toEqual(list);
    expect(function(){
      return jsx3.util.List.wrap({});
    }).toThrow();
  });

  it("should be able to create a new list", function(){
    var list = new jsx3.util.List(5);
    expect(list.size()).toEqual(5);
    expect(list.get(0)).not.toBeNull();
    expect(list.get(0)).not.toBeDefined();

    var a = [1, 2, 3];
    list = new jsx3.util.List(a);
    expect(list.size()).toEqual(3);
    expect(list.get(0)).toEqual(1);
    a.pop();
    expect(list.size()).toEqual(3);

    var list2 = new jsx3.util.List(list);
    expect(list2 === list).toBeFalsy();
    expect(list2).toEqual(list);
    expect(list2.size()).toEqual(3);
    list.remove(0);
    expect(list2.size()).toEqual(3);
    list = new jsx3.util.List();
    expect(list.size()).toEqual(0);
  });

  it("should be able to get the size of the list.", function(){
    var list = new jsx3.util.List();
    expect(list.size()).toEqual(0);
    list.add("a");
    expect(list.size()).toEqual(1);
    list.add("b");
    expect(list.size()).toEqual(2);
  });

  it("should be able to get list element", function(){
    var list = new jsx3.util.List(["a","b","c","d"]);
    expect(list.get(0)).toEqual("a");
    expect(list.get(1)).toEqual("b");
    expect(list.get(2)).toEqual("c");
    expect(list.get(3)).toEqual("d");
    expect(list.get(4)).not.toBeDefined();
    expect(list.get(-1)).not.toBeDefined();
  });

  it("should be able to set the list element", function(){
    var list = new jsx3.util.List(["a", "b", "c", "d"]);
    expect(list.get(1)).toEqual("b");
    list.set(1,"z");
    expect(list.get(1)).toEqual("z");
    expect(list.size()).toEqual(4);
  });

  it("should remove all elements from the list", function(){
    var list = new jsx3.util.List(["a", "b", "c", "d"]);
    expect(list.size()).toEqual(4);
    list.clear();
    expect(list.size()).toEqual(0);
    expect(list.get(0)).not.toBeNull();
  });

  it("should return the index of the first occurrence of objE1m in this list.", function(){
    var list = new jsx3.util.List(["a", "b", "c", "d"]);
    expect(list.indexOf("c")).toEqual(2);
    expect(list.indexOf("z")).toEqual(-1);
    list = new jsx3.util.List([1,2,3,4]);
    expect(list.indexOf(2)).toEqual(1);
    expect(list.indexOf("3")).toEqual(-1);
    var o = new Object();
    list = new jsx3.util.List([new Object(),new Object(),new Object(),o]);
    expect(list.indexOf(o)).toEqual(3);
    expect(list.indexOf(new Object())).toEqual(-1);
  });

  it("should return the index of the last occurrence of objE1m in this list.", function(){
    var list = new jsx3.util.List(["a","b","c","d","b"]);
    expect(list.lastIndexOf("c")).toEqual(2);
    expect(list.lastIndexOf("b")).toEqual(4);
    expect(list.lastIndexOf("z")).toEqual(-1);
  });

  it("should be able to return whether contain in the list", function(){
    var list = new jsx3.util.List(["a", "2", "c", "4"]);
    expect(list.contains("a")).toBeTruthy();
    expect(list.contains("2")).toBeTruthy();
    expect(list.contains(2)).toBeFalsy();
  });

  it("should be able to remove from the list", function(){
    var list = new jsx3.util.List(["a","2","c","4"]);
    var o = list.remove("c");
    expect(o).toEqual("c");
    expect(new jsx3.util.List(["a","2","4"])).toEqual(list);
    expect(list.remove("s")).toBeNull();
  });

  it("should be able to clone", function(){
    var list = new jsx3.util.List(["a","2","c","4"]);
    var c = list.clone();
    expect(list == c).toBeFalsy();
    expect(list).toEqual(c);
  });

  it("should be able to add one element to the list", function(){
    var list = new jsx3.util.List([1,2,3]);
    list.add(4);
    expect(list.size()).toEqual(4);
    list.add(4);
    expect(list.size()).toEqual(5);
    expect(list.get(4)).toEqual(4);
  });

  it("should be able to add all to the list", function(){
    var list = new jsx3.util.List([1,2,3]);
    list.addAll(["x","y","z"]);
    expect(list.size()).toEqual(6);
    expect(list.get(4)).toEqual("y");
    list = new jsx3.util.List([1,2,3]);
    var list2 = new jsx3.util.List(["x","y","z"]);
    list.addAll(list2);
    expect(list.size()).toEqual(6);
    expect(list.get(5)).toEqual("z");
    expect(function(){
      return list.addAll(1,2,3);
    }).toThrow();

  });

  it("should return whether the list equals another one", function(){
    var list1 = new jsx3.util.List([1,2,3]);
    var list2 = new jsx3.util.List();
    var list3 = new jsx3.util.List([1,"2",3]);
    var list4 = new jsx3.util.List();
    list4.addAll([1,2,3]);
    expect(list1.equals(list4)).toBeTruthy();
    expect(list1.equals(list2)).toBeFalsy();
    expect(list1.equals(list3)).toBeFalsy();
  });

  it("should create a new list with the filtered contents of this list", function(){
    var list1 = new jsx3.util.List([1,2,3,4,5,6,7,8,9,10]);
    var list2 = list1.filter(function(x){return x%2 ==0;});
    expect(new jsx3.util.List([2,4,6,8,10])).toEqual(list2);
    expect(list1.size()).toEqual(10);
    expect(function(){
      return list1.filter(function(x){return x.rand();});
    }).toThrow();
  });

  it("should create a new list with the mapped contents of this array:1", function(){
    var list1 = new jsx3.util.List([1,2,3,4,5]);
    var list2 = list1.map(function(x){return x*3;});
    expect(list2).toEqual(new jsx3.util.List([3,6,9,12,15]));
  });

  it("should create a new list with the mapped contents of this array:2", function(){
    var list1 = new jsx3.util.List([1,2,3,4,5]);
    var list2 = list1.map(function(x){
      if (x % 2 == 0){
        return [x, x];
      }else{
        if (x % 3 == 0)
          return [];
        else
          return x;
      }
    },true);
    expect(list2).toEqual(new jsx3.util.List([1,2,2,4,4,5]));
  });

  it("should create a new list with the mapped contents of this array:3", function(){
    var list1 = new jsx3.util.List([1,2,3]);
    var o =list1.map(function(x){
      return [String.fromCharCode("A".charCodeAt(0) +x -1), x * 2];
    },false,true);

    expect(o).toBeInstanceOf(Object);
    expect(o.A).toEqual(2);
    expect(o.B).toEqual(4);
    expect(o.C).toEqual(6);
    expect(o.D).not.toBeDefined();
  });

  it("should create a new list with the mapped contents of this array:4", function(){
    var l1 = new jsx3.util.List([1, 2, 3]);
    var o = l1.map(function(x){
      return [String.fromCharCode("a".charCodeAt(0) + x - 1), x,
        String.fromCharCode("A".charCodeAt(0) + x - 1), x * 2];
    }, true, true);
    expect(o.a).toEqual(1);
    expect(o.b).toEqual(2);
    expect(o.c).toEqual(3);
    expect(o.A).toEqual(2);
    expect(o.B).toEqual(4);
    expect(o.C).toEqual(6);
  });

  it("should be able to iterator", function(){
    var l1 = new jsx3.util.List([1, 2, 3]);
    var i = l1.iterator();
    expect(i.hasNext()).toBeTruthy();
    expect(i.next()).toEqual(1);
    expect(i.hasNext()).toBeTruthy();
    expect(i.next()).toEqual(2);
    expect(i.hasNext()).toBeTruthy();
    expect(i.next()).toEqual(3);
  });

  it("should return a section of the list as  another list", function(){
    var list = new jsx3.util.List(["a","b","c","d","e"]);
    var s1 = list.slice(3);
    expect(new jsx3.util.List(["d", "e"]),s1);
    var s2 = list.slice(1,2);
    expect(new jsx3.util.List(["b"])).toEqual(s2);
  });

  it("should remove a single or a range of elements from the list:1", function(){
    var list = new jsx3.util.List(["a", "b", "c", "d", "e"]);
    var o = list.removeAt(2);
    expect(o).toEqual("c");
    expect(new jsx3.util.List(["a","b","d","e"])).toEqual(list);
    list.removeAt(0);
    expect(new jsx3.util.List(["b","d","e"])).toEqual(list);
    list.removeAt(5);
    expect(new jsx3.util.List(["b","d","e"])).toEqual(list);
    list.removeAt(-2);
    expect(new jsx3.util.List(["b","e"])).toEqual(list);
  });

  it("should remove a single or a range of elements from the list:2", function(){
    var list = new jsx3.util.List(["a", "b", "c", "d", "e"]);
    var s1 = list.removeAt(0, 2);
    expect(new jsx3.util.List(["a", "b"])).toEqual(s1);
    expect(new jsx3.util.List(["c", "d", "e"])).toEqual(list);
    var s2 = list.removeAt(2,10);
    expect(new jsx3.util.List(["e"])).toEqual(s2);
    expect(new jsx3.util.List(["c", "d"])).toEqual(list);
  });

  it("should return a copy of the list as an array", function(){
    var a1 =["a", "b", "c", "d", "e"];
    var list = jsx3.util.List.wrap(a1);
    var a2 = list.toArray();
    expect(a1 == a2).toBeFalsy();
    expect(a1.length).toEqual(a2.length);
    expect(a1[0]).toEqual(a2[0]);
    expect(a1[1]).toEqual(a2[1]);
    list.removeAt(0,2);
    expect(a2.length).toEqual(5);

    a1 = ["a", "b", "c", "d", "e"];
    list = jsx3.util.List.wrap(a1);
    a2 = list.toArray(true);
    list.removeAt(0,2);
    expect(a2.length).toEqual(3);

  });

  it("should be able to sort the list", function(){
    var list = new jsx3.util.List(["d", "b", "e", "c", "a"]);
    expect(new jsx3.util.List(["a", "b", "c", "d", "e"])).not.toEqual(list);
    list.sort();
    expect(new jsx3.util.List(["a", "b", "c", "d", "e"])).toEqual(list);

    var list1 = new jsx3.util.List(["10", "5", "1", "50", "15"]);
    var funct = function(a,b){
      var da = parseInt(a); var db = parseInt(b);
      if (da > db) return 1;
      else if (da == db) return 0;
      return -1;
    };
    list1.sort(funct);
    expect(new jsx3.util.List(["1","5","10","15","50"])).toEqual(list1);
  });

});
