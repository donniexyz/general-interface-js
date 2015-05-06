/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents a region of the world. Other classes may be localized, meaning that their behavior depends on
 * their assigned locale.
 *
 * @since 3.2
 */
jsx3.Class.defineClass('jsx3.util.Locale', null, null, function(Locale, Locale_prototype) {
      
  /**
   * The instance initializer.
   * @param strLanguage {String} the lowercase two letter ISO-639 language code.
   * @param strCountry {String} the uppercase two letter ISO-3166 country code.
   */
  Locale_prototype.init = function(strLanguage, strCountry) {
    /* @jsxobf-clobber */
    this._lang = strLanguage ? strLanguage.toLowerCase() : "";
    /* @jsxobf-clobber */
    this._country = strCountry ? strCountry.toUpperCase() : "";
  };
  
  /** {jsx3.util.Locale} The root locale. */
  Locale.ROOT = new Locale("");
  /** {jsx3.util.Locale} Locale for English (country unspecified). */
  Locale.ENGLISH = new Locale("en");
  /** {jsx3.util.Locale} Locale for United States of America. */
  Locale.US = new Locale("en", "US");
  /** {jsx3.util.Locale} Locale for United Kingdom. */
  Locale.UK = new Locale("en", "GB");
    
  /**
   * Returns the lowercase two letter ISO-639 language code.
   * @return {String}
   */
  Locale_prototype.getLanguage = function() {
    return this._lang;
  };
  
  /**
   * Returns the uppercase two letter ISO-3166 country code.
   * @return {String}
   */
  Locale_prototype.getCountry = function() {
    return this._country;
  };
  
  /**
   * Returns the language of this locale, localized for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale} the locale in which to format the language. If this parameter is not 
   *   provided, the system locale is used.
   * @return {String}
   */
  Locale_prototype.getDisplayLanguage = function(objLocale) {
    return jsx3.System.getLocaleProperties(objLocale).get("string.lang." + this._lang) || "";
  };
  
  /**
   * Returns the country of this locale, localized for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale} the locale in which to format the country. If this parameter is not 
   *   provided, the system locale is used.
   * @return {String}
   */
  Locale_prototype.getDisplayCountry = function(objLocale) {
    return jsx3.System.getLocaleProperties(objLocale).get("string.terr." + this._country) || "";
  };
  
  /**
   * Returns the language and country of this locale, localized for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale} the locale in which to format the language and country. If this parameter is not 
   *   provided, the system locale is used.
   * @return {String}
   */
  Locale_prototype.getDisplayName = function(objLocale) {
    var language = this.getDisplayLanguage(objLocale);
    var country = this.getDisplayCountry(objLocale);
    if (! language) return country;
    if (! country) return language;
    
    var format = jsx3.System.getLocaleProperties(objLocale).get("format.locale.displayname");
    return (new jsx3.util.MessageFormat(format)).format(language, country);
  };

  /**
   * @package
   */
  Locale_prototype.getSearchPath = function() {
    var path = [this];
    if (this._country != "" || this._lang != "") {
      if (this._country != "" && this._lang != "")
        path.push(new Locale(this._lang));
      path.push(new Locale(""));
    }
    return path;
  };
  
  /**
   * Returns true if <code>obj</code> is equal to this locale.
   * @param obj {Object}
   * @return {boolean}
   */
  Locale_prototype.equals = function(obj) {
    return this === obj || (obj instanceof Locale && obj._lang == this._lang && obj._country == this._country);
  };
  
  /**
   * @return {String}
   */
  Locale_prototype.toString = function() {
    if (this._country)
      return this._lang + "_" + this._country;
    else
      return this._lang;
  };
  
  /**
   * Returns a locale instance represented by <code>strKey</code>.
   * @param strKey {String} the locale key, <code>ll_CC</code>, where <code>ll</code> is the two letter language 
   *   code and <code>CC</code> is the two letter country code.
   * @return {jsx3.util.Locale}
   */
  Locale.valueOf = function(strKey) {
    var tokens = strKey.split(/[\-_]/);
    return new Locale(tokens[0], tokens[1]);
  };
  
});
