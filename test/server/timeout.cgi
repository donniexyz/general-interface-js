#!/usr/bin/perl

use strict;
use CGI;

$| = 1;

sleep 10;

my $cgi = new CGI();
print $cgi->header(-type=>'text/html', -status=>'401 Unauthorized');

exit(0);

1;
