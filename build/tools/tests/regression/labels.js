var a,b;

L1:
for(var i=0;i<10;i++)
  L2:
  for(var j=0;j<10;j++){
    if(a>b)continue;
    if(b<a)continue L1;
    if(a>10)break L2;
    if(b<10)break L1;
  }
