/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

describe("jsx3.util.Locale", function(){
  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.util.Locale", "jsx3.lang.System");

  it("should be able to return the lowercase two letter ISO-639 language code.", function(){
    var l = new jsx3.util.Locale("en", "US");
    expect(l.getLanguage()).toEqual("en");
    l = new jsx3.util.Locale("es");
    expect(l.getLanguage()).toEqual("es");
    l = new jsx3.util.Locale();
    expect(l.getLanguage()).toEqual("");
  });

  it("should be able to return the uppercase two letter ISO-3166 country code.", function(){
    var l = new jsx3.util.Locale("en", "US");
    expect(l.getCountry()).toEqual("US");
    l = new jsx3.util.Locale("es");
    expect(l.getCountry()).toEqual("");
    l = new jsx3.util.Locale();
    expect(l.getCountry()).toEqual("");
  });
  it("should return the language of this locale.", function(){
    var l = new jsx3.util.Locale("en", "US");
    expect(l.getDisplayLanguage(jsx3.util.Locale.US)).toEqual("English");
    l = new jsx3.util.Locale("en");
    expect(l.getDisplayLanguage(jsx3.util.Locale.US)).toEqual("English");
    l = new jsx3.util.Locale();
    expect(l.getDisplayLanguage(jsx3.util.Locale.US)).toEqual("");
  });

  it("should return the country of this locale.", function(){
    var l = new jsx3.util.Locale("en", "US");
    expect(l.getDisplayCountry(jsx3.util.Locale.US)).toEqual("United States");
    l = new jsx3.util.Locale("en");
    expect(l.getDisplayCountry(jsx3.util.Locale.US)).toEqual("");
    l = new jsx3.util.Locale();
    expect(l.getDisplayCountry(jsx3.util.Locale.US)).toEqual("");
  });

  it("should be able to return the language and country of this locale.", function(){
    var l = new jsx3.util.Locale("en", "US");
    expect(l.getDisplayName(jsx3.util.Locale.US)).toEqual("English (United States)");
    expect(l.getDisplayName(jsx3.util.Locale.US)).toEqual("English (United States)");
    l = new jsx3.util.Locale();
    expect(l.getDisplayName(jsx3.util.Locale.US)).toEqual("");
  });

  it("should be able to string", function(){
    var l = new jsx3.util.Locale("en", "US");
    expect(l.toString()).toEqual("en_US");
    l = new jsx3.util.Locale("en", "us");
    expect(l.toString()).toEqual("en_US");
    l = new jsx3.util.Locale("EN", "us");
    expect(l.toString()).toEqual("en_US");
  });

  it("should return true if obj is equal to this locale.", function(){
    var l = new jsx3.util.Locale("en", "US");
    expect(l.equals(new jsx3.util.Locale("en", "US"))).toBeTruthy();
    expect(l.equals(new jsx3.util.Locale("en", "us"))).toBeTruthy();
    expect(l.equals("en_US")).toBeFalsy();
    expect(l.equals(new jsx3.util.Locale("en"))).toBeFalsy();
    expect(l.equals(new jsx3.util.Locale("en","GB"))).toBeFalsy();
    expect(l.equals(new jsx3.util.Locale())).toBeFalsy();
  });


});