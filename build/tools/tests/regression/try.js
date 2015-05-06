var a,b;

try{a=1;}
catch(e){b=1;}

try{a=1;}
catch(e){b=1;}
finally{b=2;}

try{a=1;}
finally{a=2;}

try{throw "error";}
catch(e){}

try 
  throw "error";
catch(e){a=1;}
