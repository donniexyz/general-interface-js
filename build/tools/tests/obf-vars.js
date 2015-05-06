var collision = 0;

function testCollision(collision, y, z) {
  collision = 1;
}

function testVarAfter() {
  varAfter = true;
  var varAfter = false;
}

function testInnerFunction(a, b, c) {
  var e = 10;
  var d = function(x, y, z) {
    x = a + z;
    y = e + b;
  }
}

// @jsxobf-bless jsxbless_important
function testBless(jsxbless_important) {
  return eval("jsxbless_important");
}
