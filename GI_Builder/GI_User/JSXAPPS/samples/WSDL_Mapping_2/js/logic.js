/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Licensed under TIBCO BSD license, see license.txt under directory samples/ 
 */

jsx3.require("jsx3.net.Service");

jsx3.lang.Package.definePackage(
  "eg.wsdl2",                //the full name of the package to create
  function(wsdl2) {          //name the argument of this function

   /**
    * Executes the service mapping and subscribes functions to events.
    * call this method to begin the service call (eg.wsdl2.callGetHistoricalQuotes();)
    */
    wsdl2.callGetHistoricalQuotes = function() {
      //executes the service mapping
      var objService = wsdl2.APP.loadResource("sampleGetHistoricalQuotes_xml");
      objService.setOperationName("GetHistoricalQuotes");

      //since the server's response (a SOAP document) will be converted to CDF,
      //compile the mapping rules into XSLT for faster conversion
      objService.compile();

      //subscribe and call
      objService.subscribe(jsx3.net.Service.ON_SUCCESS, wsdl2.onGetHistoricalQuotesSuccess);
      objService.subscribe(jsx3.net.Service.ON_ERROR, wsdl2.onGetHistoricalQuotesError);
      objService.subscribe(jsx3.net.Service.ON_INVALID, wsdl2.onGetHistoricalQuotesInvalid);
      objService.doCall();
    };

   /**
    * {String} stores the feedback from the web service.
    */
    wsdl2.wsOutcome = "Success";

   /**
    * {String} stores the message sent from the web service if an error occurs.
    */
    wsdl2.wsMessage = "Error";

   /**
    * Repaints the grid control after successful web service call.
    *
    * @param objEvent {String} static field event type for successful response.
    */
    wsdl2.onGetHistoricalQuotesSuccess = function(objEvent) {
       if ( wsdl2.wsOutcome == "Success") {
         wsdl2.APP.getJSXByName("gridResults").repaintData();
         wsdl2.APP.alert("Success","The service call was successful.");
       }
       else {
         // An error was sent from the web service.
         wsdl2.APP.alert("Web Service Error: " + wsdl2.wsOutcome, "The web service sent the following error message: <br/><br/>" + wsdl2.wsMessage, null, "Close", {width:350, height:200});
       }
    };

   /**
    * Creates an alert box with HTTP status code on failed service call attempt.
    *
    * @param objEvent {String} static field event type for unsuccessful response.
    */
    wsdl2.onGetHistoricalQuotesError = function(objEvent) {
      var myStatus = objEvent.target.getRequest().getStatus();
      wsdl2.APP.alert("Error","The service call failed. The HTTP Status code is: " + myStatus);
    };

   /**
    * Creates an alert box if one or more restrictions fails during message generation.
    *
    * @param objEvent {String} static field event type for message generation.
    */
    wsdl2.onGetHistoricalQuotesInvalid = function(objEvent) {
      wsdl2.APP.alert("Invalid","The following message node just failed validation:\n\n" + objEvent.message);
    };

  }
);
