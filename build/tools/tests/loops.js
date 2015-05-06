var a, b;

for (var i=0; i < 10; i++)
  a = i;

for (i=0; i < 10; i++)
  a = i;

i = 0;
for (; i < 10; i++) {
  a = i;
  b = i + 10;
}

i = 0;
while (i < 10) {
  i++;
}

i = 0;
do {
  i++;
} while (i < 10);

do i++; while (i < 10);

var o = new Object();
for (var f in o) {
  i += f;
}

for (f in o) i += f;
