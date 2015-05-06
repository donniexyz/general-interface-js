test = new Object();

// @jsxobf-clobber instancefield
// @jsxobf-clobber instanceMethod

test.Test = function(strName) {

  if (arguments[0] == jsx3.INITIALIZE) {
    doDefine("test.Test", _anonymous);
    doInherit("test.Test", "inheritance");
  } else {
    this.init(strName);
  }

function _anonymous() {

  test.Test.STATIC_FIELD = 1;

  function init(strName) {
    this.instancefield = 1;
  }
  test.Test.prototype.init = init;

  function instanceMethod(p1, p2, p3) {
    return this.instancefield + p1 + p2 + p3;
  }
  test.Test.prototype.instanceMethod = instanceMethod;

  function aMethod(p1) {
    return this.instanceMethod(p1, 0, 0) + this.instancefield;
  }
  test.Test.prototype.aMethod = aMethod;

  function staticMethod(p1, p2) {
    return p1 + p2;
  }
  test.Test.staticMethod = staticMethod;

}
};

new test.Test(jsx3.INITIALIZE);
