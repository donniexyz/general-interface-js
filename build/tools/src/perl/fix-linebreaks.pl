use strict;
use IO::File;

my $root = $ARGV[0];
my $queue = [$root];
my %EXT = map {$_ => 1} ("xml","js","jss","txt","xsl","html","xhtml","hta","css","java",
    "properties","htm","template");

while (scalar(@$queue) > 0) {
  my $path = shift(@$queue);
  if (-d $path) {
    push(@$queue, glob "$path/*");
  } elsif (-f $path) {
    if ($path =~ /\/?[^\/]+\.(\w+)$/) {
      my $ext = lc($1);
      if ($EXT{$ext}) {
        convertFile($path);
      }
    }
  }
}

sub convertFile {
  my $path = $_[0];

  my $f = new IO::File("<" . $path);
  my $line;
  my @lines;
  my $needsFix = 0;

  while (defined($line = <$f>)) {
    my ($line,$length,$cc) = chompLine($line);
#    print STDOUT $length, " ", join(",",@$cc), " - ", $line, "\n";
    if ($length > 1) {
      $needsFix++;
    }
    push(@lines, $line);
  }

  $f->close();

  if ($needsFix) {
    if (-w $path) {
      $f = new IO::File(">" . $path);
      print $f join(chr(10), @lines), chr(10);
      $f->close();
      print STDOUT $path, " ($needsFix)\n";
    } else {
      print STDOUT "[not writable] ", $path, " ($needsFix)\n";
    }
  }  else {
#    print STDOUT "[skipping] ", $path, "\n";
  }
}

sub chompLine {
  my $line = $_[0];
  my $ccs = [];
  my $length = length($line);
  for (my $i = $length; $i > 0; $i--) {
    my $cc = ord(substr($line,$i-1,1));
    if ($cc != 10 && $cc != 13) {
      return (substr($line,0,$i), $length-$i, $ccs);
    }
    push(@$ccs,$cc);
  }
  return ("",length($line),$ccs);
}

1;
