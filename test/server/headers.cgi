#!/usr/bin/perl

use strict;
use CGI;

my $data;
my $val;
read(STDIN, $data, $ENV{'CONTENT_LENGTH'});

my $cgi = new CGI();
print $cgi->header(-type=>'text/xml');
print '';
print '<?xml version="1.0" ?>';
print "\n<data>\n";

foreach my $key (keys %ENV) {
    $val = $ENV{$key};
$val =~ s/&/&amp;/g;
$val =~ s/</&lt;/g;
$val =~ s/>/&gt;/g;
$val =~ s/\"/&quot;/g;
    print '<record jsxid="' . $key . '">' . $val . "</record>\n";
}

#my $data = $cgi->param('POSTDATA');
$data =~ s/&/&amp;/g;
$data =~ s/</&lt;/g;
$data =~ s/>/&gt;/g;
$data =~ s/\"/&quot;/g;

print '<postdata>' . $data . "</postdata>\n";
print "</data>\n";

exit(0);

1;
