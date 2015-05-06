/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Read-write system settings interface.
 */
jsx3.Class.defineClass("jsx3.ide.Preferences", jsx3.app.Settings, null, function(Preferences, Preferences_prototype) {
  
  Preferences_prototype.init = function(objFile, objSettings) {
    this._file = objFile;
    
    if (!objSettings) {
      var objXML = null;

      if (objFile && objFile.isFile()) {
        var xml = new jsx3.xml.Document();
        xml.load(objFile.toURI()); // first try loading via XHR (should work with BOM)

        if (xml.hasError()) { // then try file read
          xml = new jsx3.xml.Document();
          xml.loadXML(objFile.read());
        }
        
        if (xml.hasError()) {
          jsx3.ide.LOG.warn("Error reading preferences XML " + objFile.toURI() + ": " + xml.getError());
        } else if (xml.getBaseName() != "data") {
          jsx3.ide.LOG.warn("Corrupt preferences file " + objFile.toURI() + ": " + xml);
        } else {
          objXML = xml;
        }
      }
      
      objSettings = new jsx3.app.Settings(objXML);
    }
    
    this._delegate = objSettings;
  };

  Preferences_prototype.get = function() {
    return this._delegate.get.apply(this._delegate, arguments);
  };
  
  Preferences_prototype.getNode = function() {
    return this._delegate.getNode.apply(this._delegate, arguments);
  };
  
  Preferences_prototype.set = function() {
    return this._delegate.set.apply(this._delegate, arguments);
  };
  
  Preferences_prototype.remove = function() {
    return this._delegate.remove.apply(this._delegate, arguments);
  };
  
  /**
   * Persists changes to settings.
   */
  Preferences_prototype.save = function() {
    if (this._file) {
      jsx3.ide.writeBuilderXmlFile(this._file, jsx3.ide.makeXmlPretty(this.getNode(), true));
      jsx3.ide.LOG.debug("Saved settings to " + this._file + ".");
    } else {
      jsx3.ide.LOG.error("Error saving settings.");
    }
  };

  Preferences_prototype.toString = function() {
    return "[jsx3.ide.Preferences " + this._file + "]";
  };

});
