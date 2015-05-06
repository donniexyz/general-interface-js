/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Licensed under TIBCO BSD license, see license.txt under directory samples/ 
 */

jsx3.require("jsx3.net.Service");

jsx3.lang.Package.definePackage(
  "eg.wsdl1",                //the full name of the package to create
  function(wsdl1) {          //name the argument of this function

   /**
    * Executes the service mapping and subscribes functions to events.
    * Call this method to begin the service call (eg.wsdl1.callReturnCityState();)
    */
    wsdl1.callReturnCityState = function() {
      var objService = wsdl1.APP.loadResource("getCityAndState_xml");
      objService.setOperationName("ReturnCityState");

      //subscribe and call
      objService.subscribe(jsx3.net.Service.ON_SUCCESS, wsdl1.onReturnCityStateSuccess);
      objService.subscribe(jsx3.net.Service.ON_ERROR, wsdl1.onReturnCityStateError);
      objService.subscribe(jsx3.net.Service.ON_INVALID, wsdl1.onReturnCityStateInvalid);
      objService.doCall();
    };


   /**
    * Creates an alert box on a successful service call.
    *
    * @param objEvent {String} static field event type for successful response.
    */
    wsdl1.onReturnCityStateSuccess = function(objEvent) {
      //var responseXML = objEvent.target.getInboundDocument();
      wsdl1.APP.alert("Success","The service call was successful.");
    };


   /**
    * Creates an alert box with HTTP status code on failed service call attempt.
    *
    * @param objEvent {String} static field event type for unsuccessful response.
    */
    wsdl1.onReturnCityStateError = function(objEvent) {
      var myStatus = objEvent.target.getRequest().getStatus();
      wsdl1.APP.alert("Error","The service call failed. The HTTP Status code is: " + myStatus);
    };


   /**
    * Creates an alert box if one or more restrictions fails during message generation.
    *
    * @param objEvent {String} static field event type for message generation.
    */
    wsdl1.onReturnCityStateInvalid = function(objEvent) {
      wsdl1.APP.alert("Invalid","The following message node just failed validation:\n\n" + objEvent.message);
    };


   /**
    * {String} stores the county from XML Mapping Utility.
    */
    wsdl1.county = "No county mapped to this variable yet.";
    wsdl1.avgLongitude = "0";
    wsdl1.avgLatitude = "0";


   /**
    * Creates an alert box that displays the county obtained from the web service.
    */
    wsdl1.showCountyAlert = function() {
      wsdl1.APP.alert("Server alert box showing county", wsdl1.county);
    };

  }
);
