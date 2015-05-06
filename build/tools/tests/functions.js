function nameNoArgs() {
  1;
}

function nameArg(a) {
  1;
}

function nameArgs(a, b, c) {
  1;
}

var f;

f = function () {
  1;
}

f = function (a, b) {
  1;
}

function noReturns() {
  nameNoArgs();
  nameArg();
}

function returns() {
  nameArg();
  return 1;
}

function lastReturn() {
  nameArg();
  return;
}

function nested() {
  var anon = function() { return 1; };
  return anon;
}

function vartest(p1, p2) {
  var v1 = 1, v2 = null, v3;
  var s = p1 + p2;
  var t = p1[p2];
  var u = p1.p2;
  return v1;
}
