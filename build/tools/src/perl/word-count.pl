#!/usr/bin/perl

use strict;
use IO::File;

my $path = $ARGV[0];
my $fh = new IO::File("<" . $path);
my $counts = {};
my %keywords = map {$_ => 1} split(/\s+/, "return function if else try catch finally var null true false for while new");

my $line;

while (defined($line = <$fh>)) {
  my @tokens = split(/\W/, $line);
  foreach my $token (@tokens) {
    if (length($token) > 0) {
      $counts->{$token} = 0 unless defined($counts->{$token});
      ($counts->{$token})++;
    }
  }
}

my @all = keys %{$counts};

foreach my $token (sort {$counts->{$b} <=> $counts->{$a}} @all) {
  print STDOUT "$token\t", $counts->{$token}, "\n" unless skip($token);
}

sub skip {
  my $t = $_[0];
  return 1 if $keywords{$t};
  return 1 if $t =~ /^\d$/;
  return 1 if $t =~ /^[_a-zA-Z]\w?$/;
  return 0;
}

1;
