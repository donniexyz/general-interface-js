var a;
var b, c, d;

a = [];
a = [1,2,3];
a = ["a", 1,    "poo", null];
a = [1, b, ""];

[a+b, c++, d++];

a = [[], [1,2], ["a"]];

var o;

o = {};
o = {a:1};
o = {a:"1", b:"2", c:null};
o = {a:a, b:b, c:"c"};

/* unassigned object literal not allowed
{x:a++, y:(a+b)}; */

o = {x:{}, y:{a:1}, z:{a:"1", b:"2"}};
