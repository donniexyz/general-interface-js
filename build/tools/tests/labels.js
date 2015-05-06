var a, b;

OUTER: 
for (var i = 0; i < 10; i++) {
  INNER:
  for (var j = 0; j < 10; j++) {
    if (a > b)
      continue;
    if (b < a)
      continue OUTER;
    if (a > 10)
      break INNER;
    if (b < 10)
      break OUTER;
  }
}
