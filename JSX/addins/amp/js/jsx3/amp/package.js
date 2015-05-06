/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * The General Interface Asynchronous Modular Platform (AMP). Classes in this package are only
 * available to applications that enable the AMP add-in.
 *
 * @since 3.7
 */
jsx3.lang.Package.definePackage("jsx3.amp", function(amp) {

  /** {String} The plug-in definition XML namespace URI. */
  amp.NS = "http://www.generalinterface.org/gi/amp";

  /** @private @jsxobf-clobber */
  amp._NS = {"http://www.tibco.com/gi/amp": true, "http://www.generalinterface.org/gi/amp": true};

  /** @package */
  amp.isNS = function(ns) {
    return amp._NS[ns];
  };

  /** @package */
  amp.getXmlNS = function(x) {
    var o = {};
    o[x.getNamespaceURI()] = "amp";
    return o;
  };

  /** {String} The name of the plug-ins registration file. */
  amp.DESCRIPTOR = "plugins.xml";

  /** {String} The name of a plug-in descriptor file. */
  amp.METAFILE = "plugin.xml";

  /** {String} The path where application plug-ins should reside. */
  amp.DIR = "plugins";

  amp.LOG = jsx3.util.Logger.getLogger("jsx3.amp");

  /** @package @jsxobf-clobber-shared */
  amp._getConstructor = function(objClass) {
    var fct = objClass;

    if (typeof(fct) == "string")
      fct = jsx3.Class.forName(fct) || jsx3.lang.getVar(fct);

    if (fct instanceof jsx3.Class)
      fct = fct.getConstructor();

    if (typeof(fct) != "function")
      fct = null;

    return fct;
  };

  /** @package @jsxobf-clobber-shared */
  amp._getBestLocaleKey = function(strLocales, objLocale) {
    var l = jsx3.$S(strLocales || "").trim();
    if (l.length > 0) {
      var available = jsx3.$A(l.split(/\s/g));
      var path = objLocale.getSearchPath();
      var loc = jsx3.$A(path).find(function(e) { return available.contains(e.toString()); });
      if (loc)
        return loc.toString();
    }

    return "";
  };

});

/**
 * The standard library of AMP application utility classes. Classes in this package are loaded via AMP plug-ins.
 * 
 * @since 3.7
 */
jsx3.lang.Package.definePackage("jsx3.amp.util", function(util) {

});
