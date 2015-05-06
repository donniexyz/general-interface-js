#!/usr/bin/perl

use strict;
use CGI;
use XML::Writer;

my $cgi = new CGI();
print $cgi->header(-type=>'text/xml; encoding="utf-8"');

my $writer = new XML::Writer(ENCODING => 'utf-8', DATA_MODE => 1, UNSAFE => 1);
$writer->xmlDecl("utf-8");
$writer->startTag("data");

my @params = $cgi->param();

#foreach my $key (keys %ENV) {
#    print STDERR $key . ' => ' . $ENV{$key} . "\n";
#}

foreach my $p (@params) {
    $writer->startTag("record", jsxid => $p);

#    my $c = $cgi->param($p);
#    $c =~ s/\&(?!\#?\w+;)/\&amp\;/g;
#    $c =~ s/\</\&lt\;/g;
#    $c =~ s/\>/\&gt\;/g;
#    $writer->raw($c);

    $writer->characters($cgi->param($p));
    $writer->endTag("record");

#    print STDERR $p . " = " . $cgi->param($p) . "\n";
}

$writer->endTag("data");
$writer->end();

exit(0);

1;
