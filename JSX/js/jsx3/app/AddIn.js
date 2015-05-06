/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * A class that represents a JSX add-in. The JSX system creates an instance of this class for every add-in that 
 * is loaded.
 *
 * @since 3.2
 */
jsx3.Class.defineClass("jsx3.app.AddIn", null, [jsx3.net.URIResolver], function(AddIn, AddIn_prototype) {

  var URIResolver = jsx3.net.URIResolver;
  
  /**
   * {String}
   * @final @jsxobf-final
   */
  AddIn.PROTOTYPES_DIR = "prototypes/";

  /**
   * @param strKey {String}
   * @package
   */
  AddIn_prototype.init = function(strKey) {
    /* @jsxobf-clobber-shared */
    this._key = strKey;
    /* @jsxobf-clobber-shared */
    this._path = strKey.indexOf("user:") == 0 ?  
                 jsx3.resolveURI("jsxuser:/addins/" + strKey.substring(5) + "/") :
                 jsx3.resolveURI(jsx3.ADDINSPATH + strKey + "/");
    /* @jsxobf-clobber-shared */
    this._uri = new jsx3.net.URI(this._path);
    /* @jsxobf-clobber-shared */
    this._uriabs = jsx3.app.Browser.getLocation().resolve(this._uri);
    /* @jsxobf-clobber */
    this._settings = null;
  };
  
  /**
   * @return {String}
   */
  AddIn_prototype.getId = function() {
    return this.getSettings().get("id");
  };
  
  /**
   * @return {String}
   */
  AddIn_prototype.getName = function() {
    return this.getSettings().get("name");
  };
  
  /**
   * @return {String}
   */
  AddIn_prototype.getDescription = function() {
    return this.getSettings().get("description");
  };
  
  /**
   * @return {String}
   */
  AddIn_prototype.getVersion = function() {
    return this.getSettings().get("version");
  };
  
  /**
   * @return {String}
   * @package
   */
  AddIn_prototype.getJsxVersion = function() {
    return this.getSettings().get("jsxversion") || "3.1";
  };
  
  /**
   * @return {String}
   */
  AddIn_prototype.getKey = function() {
    return this._key;
  };
  
  /**
   * @return {String}
   * @package
   */
  AddIn_prototype.getPath = function() {
    return this._path;
  };
  
  /**
   * @return {jsx3.app.Settings}
   */
  AddIn_prototype.getSettings = function() {
    if (this._settings == null) {
      var objXML = jsx3.getSystemCache().getOrOpenDocument(this._uri.resolve(jsx3.CONFIG_FILE), "JSX_SETTINGS::" + this.getKey());
      /* @jsxobf-clobber */
      this._settings = new jsx3.app.Settings(objXML);
    }
    return this._settings;
  };
  
  AddIn_prototype.setSettings = function(objSettings) {
    this._settings = objSettings;
  };
  
  /**
   * @param strURI {String|jsx3.net.URI}
   * @return {jsx3.net.URI}
   */
  AddIn_prototype.resolveURI = function(strURI) {
    var uri = jsx3.net.URI.valueOf(strURI);
    
    if (jsx3.util.compareVersions(this.getJsxVersion(), "3.2") >= 0 && !URIResolver.isAbsoluteURI(uri))
      uri = this._uri.resolve(uri);

    return URIResolver.DEFAULT.resolveURI(uri);
  };
  
  /**
   * @return {String}
   */
  AddIn_prototype.getUriPrefix = function() {
    return this._uri.toString();
  };    

  /**
   * @param strURI {String|jsx3.net.URI}
   * @return {jsx3.net.URI}
   */
  AddIn_prototype.relativizeURI = function(strURI, bRel) {
    var loc = jsx3.app.Browser.getLocation();
    var relative = this._uriabs.relativize(loc.resolve(strURI));

    if (relative.isAbsolute() || bRel)
      return relative;
    else
      return jsx3.net.URI.fromParts("jsxaddin", null, this.getKey().replace(/:/, "!"), null, 
          "/" + relative.getPath(), relative.getQuery(), relative.getFragment());
  };    

  /**
   * @return {String}
   */
  AddIn_prototype.toString = function() {
    return this._key;
  };
  
  URIResolver.register("jsxaddin", function(uri) {
    var addinKey = uri.getHost().split("!", 2).join(":");
    return jsx3.System.getAddin(addinKey);
  });
  
});
