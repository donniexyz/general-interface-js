/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.TimePicker", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.TimePicker");
  var t = new _jasmine_test.App("jsx3.gui.TimePicker");
  var timePicker;
  var TimePicker;

  var getTimePicker = function(s) {
    var root = s.getBodyBlock().load("data/form_components.xml");
    return root.getServer().getJSXByName('timePicker');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_formComponent.xml", ".", true) : t._server;
    timePicker = getTimePicker(t._server);
    if (!TimePicker) {
      TimePicker = jsx3.gui.TimePicker;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to instance", function() {
    expect(timePicker).toBeInstanceOf(TimePicker);
  });

  it("should be able to paint", function() {
    expect(timePicker.getRendered()).not.toBeNull();
    expect(timePicker.getRendered().nodeName.toLowerCase()).toEqual("span");
  });

  it("should be able to do validate", function() {
    expect(timePicker.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
    timePicker.setRequired(jsx3.gui.Form.REQUIRED);
    timePicker.setValue('');
    expect(timePicker.doValidate()).toEqual(jsx3.gui.Form.STATEINVALID);
    timePicker.setValue('12:00 AM');
    expect(timePicker.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
  });

  it("should be able to set and get a date with the time of day set to the value of this time picker", function() {
    var d = new Date();
    d.setHours(10);
    d.setMinutes(23);
    timePicker.setDate(d);
    date = timePicker.getDate();
    expect(date).toEqual(d);
    expect(timePicker.getValue()).toEqual('10:23 AM');
  });

  it("should be able to set and get the hour (0-23) of the time value of this time picker", function() {
    var hour = timePicker.getHours();
    expect(hour).toEqual(0);
    timePicker.setHours(10);
    hour = timePicker.getHours();
    expect(hour).toEqual(10);
    expect(timePicker.getValue()).toEqual('10:00 AM');
    timePicker.setHours(13);
    expect(timePicker.getValue()).toEqual('1:00 PM');
    timePicker.setHours(23);
    expect(timePicker.getValue()).toEqual('11:00 PM');
    timePicker.setHours(24);
    expect(timePicker.getValue()).toEqual('11:00 PM');
    timePicker.setHours(-1);
    expect(timePicker.getValue()).toEqual('12:00 AM');
  });

  it('should be able to set and get the millisecond (0-999) of the time value of this time picker', function() {
    var millisecond = timePicker.getMilliseconds();
    expect(millisecond).toEqual(0);
    expect(timePicker.getShowMillis()).toEqual(0);
    timePicker.setMilliseconds(999);
    millisecond = timePicker.getMilliseconds();
    expect(millisecond).toEqual(999);
    expect(timePicker.getValue()).toEqual('12:00 AM');
    timePicker.setShowMillis(true);
    expect(timePicker.getShowMillis()).toEqual(1);
    timePicker.setShowSeconds(true);
    expect(timePicker.getValue()).toEqual('12:00:00.999 AM');
    timePicker.setMilliseconds(1000);
    expect(timePicker.getValue()).toEqual('12:00:00.999 AM');
    timePicker.setMilliseconds(-1);
    expect(timePicker.getValue()).toEqual('12:00:00.000 AM');
  });

  it('should be abe to set and get the minute (0-60) of the time value of this time picker', function() {
    var minute = timePicker.getMinutes();
    expect(minute).toEqual(0);
    timePicker.setMinutes(59);
    minute = timePicker.getMinutes();
    expect(minute).toEqual(59);
    expect(timePicker.getValue()).toEqual('12:59 AM');
    timePicker.setMinutes(60);
    expect(timePicker.getValue()).toEqual('12:59 AM');
    timePicker.setMinutes(-1);
    expect(timePicker.getValue()).toEqual('12:00 AM');
  });

  it("should be able to set and get the second (0-60) of the time value of this time picker", function() {
    var second = timePicker.getSeconds();
    expect(second).toEqual(0);
    expect(timePicker.getShowSeconds()).toEqual(0);
    timePicker.setSeconds(30);
    second = timePicker.getSeconds();
    expect(second).toEqual(30);
    expect(timePicker.getValue()).toEqual('12:00 AM');
    timePicker.setShowSeconds(true);
    expect(timePicker.getShowSeconds()).toEqual(1);
    expect(timePicker.getValue()).toEqual('12:00:30 AM');
    timePicker.setSeconds(-1);
    expect(timePicker.getValue()).toEqual('12:00:00 AM');
    timePicker.setSeconds(60);
    expect(timePicker.getValue()).toEqual('12:00:59 AM');
  });

  it("should be able to set and get the value of this time picker in local time", function() {
    expect(timePicker.getValue()).toEqual('12:00 AM');
    timePicker.setValue('11:11 AM');
    expect(timePicker.getValue()).toEqual('11:11 AM');
    timePicker.setShowMillis(true);
    timePicker.setShowSeconds(true);
    timePicker.setValue('12:00:30.999 AM');

    var value = timePicker.getValue();
    if (value === '12:NaN:NaN.NaN ') {
      expect(value).toEqual('12:NaN:NaN.NaN ');
    } else if (value === '12:00:30.999 AM') {
      expect(value).toEqual('12:00:30.999 AM');
    }
  });

  it("should not take invalid time value", function() {
    timePicker.setValue('123');
    expect(timePicker.getValue()).toEqual('12:NaN ');
  });

  it("should be able to set whether this time picker uses a 24-hour clock", function() {
    expect(timePicker.getValue()).toEqual('12:00 AM');
    timePicker.set24Hour(false);
    expect(timePicker.is24Hour()).toEqual(0);
    timePicker.set24Hour(true);
    expect(timePicker.is24Hour()).toEqual(1);
    expect(timePicker.getValue()).toEqual('00:00');
    timePicker.setHours(13);
    expect(timePicker.getValue()).toEqual('13:00');
  });

  it("The value should be changed when the triangle button click", function() {
    expect(timePicker.getValue()).toEqual('12:00 AM');
    var btnUptick = timePicker.getRendered().firstChild.childNodes[5].childNodes[0];
    var btnDowntick = timePicker.getRendered().firstChild.childNodes[5].childNodes[1];
    btnUptick.click();
    expect(timePicker.getValue()).toEqual('1:00 AM');
    btnDowntick.click();
    expect(timePicker.getValue()).toEqual('12:00 AM');
  });

  it("The value should be changed by clicking triangle button when it is disabled", function() {
    timePicker.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
    var inputHours = timePicker.getRendered().childNodes[0].childNodes[0];
    expect(inputHours.getAttribute("disabled")).toBe('disabled');
    expect(timePicker.getValue()).toEqual('12:00 AM');
    var btnUptick = timePicker.getRendered().firstChild.childNodes[5].childNodes[0]; //The up triangle button
    var btnDowntick = timePicker.getRendered().firstChild.childNodes[5].childNodes[1]; //The down triangle button
    btnUptick.click();
    expect(timePicker.getValue()).toEqual('12:00 AM');
    btnDowntick.click();
    expect(timePicker.getValue()).toEqual('12:00 AM');
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});