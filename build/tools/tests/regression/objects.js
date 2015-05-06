var o=new Object();
var f;
f=o.field;
f=o["field"];
f=o.method();
f=o.nest.field;
f=o.nest["field"];
f=o[f];

o.field=1;
o["field"]=1;
o.nest.field=1;
o.nest["field"]=1;
o.method=function(){};

delete o.field;
delete o.field;
delete o[f];
delete o["not-name"];

o.b&=a;
o[b]&=a;
o["b"]&=a;
