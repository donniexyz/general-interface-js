test=new Object();
test.Test=function(l){
  if(arguments[0]==jsx3.INITIALIZE){
    doDefine("test.Test",_anonymous);
    doInherit("test.Test","inheritance");
  }else this.init(l);
  
  function _anonymous(){
    test.Test.STATIC_FIELD=1;
    
    function init(l){
      this.JA=1;
    }
    test.Test.prototype.init=init;
    
    function QI(c,b,a){
      return this.JA+c+b+a;
    }
    test.Test.prototype.QI=QI;
    
    function aMethod(j){
      return this.QI(j,0,0)+this.JA;
    }
    test.Test.prototype.aMethod=aMethod;
    
    function staticMethod(b,a){
      return b+a;
    }
    test.Test.staticMethod=staticMethod;
  }
};

new test.Test(jsx3.INITIALIZE);
