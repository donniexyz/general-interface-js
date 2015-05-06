<?php
/* This only works to return static response to the Service.js tests
 * Enalbe real HTTP status and response XML or Text(json) parsing on client side*/
function issetOr($var, $or = false) {
  return isset($var) ? $var : $or;
}

$status = issetOr($_GET['status'], "200");
$json = issetOr($_GET['json']);
$resfile = "wsdl2msg.xml";
$type = "text/xml";
if ($status != "200") {
// Set the response header to specified status 50x are Server errors.
  header("HTTP/1.0 ". $status . " Server Error");
  if ($json) {
    $resfile = "wsdlfault.js";
    $type = "text/plain";
  } else {
    $resfile = "wsdl2fault.xml";
  }
} else {
  if ($json == "true") {
    $resfile = "wsdltest.js";
    $type = "text/plain";
  } else {
    $resfile = "wsdl2msg.xml";
  }
}
header("Content-type: ".$type);

$fh = fopen($resfile, 'r');
$theData = fread($fh, filesize($resfile));
fclose($fh);
echo $theData;
//echo "END";

?>
