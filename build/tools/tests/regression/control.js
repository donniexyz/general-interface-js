var a,b,c;

if(a)c=1;

if(a){b=1;c=1;}

if(a)
  c=1;
else 
  c=2;

if(a){c=1;}
else if(b){c=2;}
else c=3;

if(a)c=3;

switch(a){
  case 1:
  case 2:
    b=1;
    break;
  case 3:
    b=2;
  default:
    c=1;
}

switch(a){
  case 1:
    b=1;
    break;
}

if(a)
  if(b){c=1;}
  else{
    for(var i=0;i<10;i++)c=2;d=1;
  }
