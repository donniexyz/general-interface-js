/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _locale _path

/**
 * A subclass of <code>jsx3.app.Properties</code> that supports localized properties. Using this class, an application
 * can define properties for a number of locales but only load the properties necessary to display a particular
 * locale. Additionally, this class supports fall-through so that if a property is not defined for a particular locale
 * that locale inherits the value from the next most specific locale.
 * <p/>
 * A properties bundle can consist of one or more XML files. The main file, <i>fileName.ext</i>, contains the
 * properties for the default locale, as well as the properties for any number of other locales, and metadata
 * indicating what locales are available external to the main file. The format of this file is:
 *
 * <pre>
 * &lt;data jsxnamespace="propsbundle" locales="<b>externalLocales</b>"&gt;
 *   &lt;!-- the default locale --&gt;
 *   &lt;locale&gt;
 *     &lt;record jsxid="<b>propId</b>" jsxtext="<b>propValue</b>"/&gt;
 *     ...
 *   &lt;/locale&gt;
 *
 *   &lt;!-- additional locales --&gt;
 *   &lt;locale key="en_US"&gt;
 *     &lt;record jsxid="<b>propId</b>" jsxtext="<b>propValueEnUs</b>"/&gt;
 *     ...
 *   &lt;/locale&gt;
 *
 *   ...
 * &lt;/data&gt;
 * </pre>
 *
 * <i>externalLocales</i> is a comma-separated list of locales that are available for this properties bundle that
 * are defined in separate files. By spreading a properties bundle over many files, loading a bundle for a single
 * locale is optimized. For each locale, <i>locKey</i>, listed in <i>externalLocales</i>, there must be a file
 * <i>fileName.locKey.ext</i> in the same directory as the main bundle file.
 * <p/>
 * Each external file has the same format as the main file except that the <code>locales</code> attribute of
 * the <code>data</code> tag should not be specified. Any number of locales can be defined. The first locale defined
 * should be the locale explicit in the name of the file. Only more specific locales should follow this locale.
 * For example, file <code>props.es.xml</code>, should start by defining locale <code>es</code> and could continue
 * with locales <code>es_ES</code> and <code>es_MX</code> but should not define locales <code>fr</code> or
 * <code>de</code>.
 *
 * @since 3.4
 */
jsx3.Class.defineClass("jsx3.app.PropsBundle", jsx3.app.Properties, null, function(PropsBundle, PropsBundle_prototype) {

  var LOG = jsx3.util.Logger.getLogger(PropsBundle.jsxclass.getName());
  var Job = jsx3.util.Job;

  /** @private @jsxobf-clobber @jsxobf-final */
  PropsBundle.PATH_SEP = ".";

  /** @private @jsxobf-clobber @jsxobf-final */
  PropsBundle.ERROR = -1;
  
  /** 
   * {Object<String, Object<String, boolean>>} Stores all the locales available in external files for a particular
   *   bundle path.
   * @private @jsxobf-clobber 
   */
  PropsBundle._PATH_TO_LOCALES = {};

  /** 
   * {Object<String, jsx3.app.PropsBundle>} Stores the props bundle that should be returned when a props key is
   *   requested. The key is equal to "path::locale". 
   * @private @jsxobf-clobber 
   */
  PropsBundle._KEY_TO_PROPS = {};

  /** @private @jsxobf-clobber */
  PropsBundle._GRAPH = new jsx3.util.JobGraph();

  /** @private @jsxobf-clobber */
  PropsBundle._EMPTY = new PropsBundle();
  
  /**
   * Returns a properties object representing a localized view onto a properties bundle.
   *
   * @param strBasePath {String|jsx3.net.URI} the relative URI to the main properties file.
   * @param objLocale {jsx3.util.Locale} the locale for which to load the localized properties. If this is not
   *    provided, the system locale is used.
   * @param objCache {jsx3.app.Cache} if provided, any loaded XML documents will be placed in this cache.
   * @return {jsx3.app.PropsBundle}
   * @throws {jsx3.Exception} if there is an error loading loading the main bundle file or a subordinate file
   *    promised by the main file.
   */
  PropsBundle.getProps = function(strBasePath, objLocale, objCache) {
    if (!objLocale) objLocale = jsx3.System.getLocale();
    var key = strBasePath + "::" + objLocale;
    
    if (!PropsBundle._KEY_TO_PROPS[key]) {
      var graph = PropsBundle._GRAPH;
      
      if (graph.node(strBasePath))
        return PropsBundle._EMPTY;
      
      var job = new Job(strBasePath);
      PropsBundle._getProps(strBasePath, objLocale, objCache, false, job);
    }
    
    var p = PropsBundle._KEY_TO_PROPS[key];
    if (p == PropsBundle.ERROR)
      throw new jsx3.Exception(jsx3._msg("propbn.err_key", strBasePath, objLocale));
      
    return p;
  };

  /**
   * The same as <code>getProps()</code> but if there is an error loading the bundle for <code>objLocale</code> then
   * try to load the bundle for the root locale and if there is an error doing that, just return an empty properties
   * object.
   *
   * @return {jsx3.app.PropsBundle}
   * @see #getProps()
   */
  PropsBundle.getPropsFT = function(strBasePath, objLocale, objCache) {
    try {
      return PropsBundle.getProps(strBasePath, objLocale, objCache);
    } catch (e) {}

    var root = jsx3.util.Locale.ROOT;

    if (!objLocale || !objLocale.equals(root))
      try {
        return PropsBundle.getProps(strBasePath, root, objCache);
      } catch (e) {}

    return new PropsBundle();
  };
  
  /**
   * Returns a properties object representing a localized view onto a properties bundle.
   *
   * @param strBasePath {String|jsx3.net.URI} the relative URI to the main properties file.
   * @param objLocale {jsx3.util.Locale} the locale for which to load the localized properties. If this is not
   *    provided, the system locale is used.
   * @param fctCallback {Function} a callback function to call when the properties bundle has loaded.
   * @param objCache {jsx3.app.Cache} if provided, any loaded XML documents will be placed in this cache.
   * @return {jsx3.app.PropsBundle}
   * @since 3.6
   */
  PropsBundle.getPropsAsync = function(strBasePath, objLocale, fctCallback, objCache) {
    if (!objLocale) objLocale = jsx3.System.getLocale();
    var key = strBasePath + "::" + objLocale;
    var job = new Job(null, function() {
      var p = PropsBundle._KEY_TO_PROPS[key];
      fctCallback(p != PropsBundle.ERROR ? p : null);
    });
    PropsBundle._getProps(strBasePath, objLocale, objCache, true, job);
  };

  /** @private @jsxobf-clobber */
  PropsBundle._getProps = function(strBasePath, objLocale, objCache, bAsync, objDoneJob) {
    var graph = PropsBundle._GRAPH;
    strBasePath = strBasePath.toString();

    graph.pause();
    
    graph.add(objDoneJob); // NOTE: graph must be paused
    
    var nextJob = objDoneJob;
    var searchPath = objLocale.getSearchPath();
    
    // For each locale to load, en_US, en, root...
    for (var i = 0; i < searchPath.length; i++) {
      var thisLocale = searchPath[i];
      var thisKey = strBasePath + "::" + thisLocale;
      
      // Check if the locale is already loaded, if so, we're done
      if (PropsBundle._KEY_TO_PROPS[thisKey]) 
        break;

      // Check if the locale is already queued
      var thisJob = graph.node(thisKey);
      
      if (! thisJob) {
        // If not, queue loading the locale
        thisJob = PropsBundle._makeJob(thisKey, strBasePath, thisLocale, objCache, bAsync);
        graph.add(thisJob);
        thisJob.add(nextJob);
      } else {
        // Otherwise, just create the dependency, and we're done
        thisJob.add(nextJob);
        break;
      }      

      nextJob = thisJob;
    }
    
    graph.start();
  };
  
  /** @private @jsxobf-clobber */
  PropsBundle._makeJob = function(thisKey, strBasePath, thisLocale, objCache, bAsync) {
    return new Job(thisKey, function() {
      var me = this;
      PropsBundle._loadBundle(thisKey, strBasePath, thisLocale, objCache, bAsync, function() {
        me.finish();
      });
      return Job.WAIT; // Ok for sync too since finish() is called before this returns WAIT.
    });    
  };
  
  /** @private @jsxobf-clobber */
  PropsBundle._loadBundle = function(strKey, strBasePath, objLocale, objCache, bAsync, fctCallback) {
    var propsCache = PropsBundle._KEY_TO_PROPS, localeCache = PropsBundle._PATH_TO_LOCALES;
    var bRoot = false, bDone = false;
    
    if (propsCache[strKey]) {
      bDone = true;
    } else {
      if (objLocale.toString() == "") {
        bRoot = true;
      } else {
        if (! localeCache[strBasePath][objLocale]) {
          var searchPath = objLocale.getSearchPath();
          for (var i = 1; !propsCache[strKey] && i < searchPath.length; i++) {
            var ancestorLocale = searchPath[i];
            var ancestorKey = strBasePath + "::" + ancestorLocale;
            propsCache[strKey] = propsCache[ancestorKey];
          }
          bDone = true;
        }
      }
    }
    
    if (bDone) {
      // QUESTION: timeout for async?
      fctCallback();
      return;
    }
    
    var strUrl;
    if (bRoot) {
      localeCache[strBasePath] = {};
      strUrl = strBasePath;
    } else {
      var index = strBasePath.lastIndexOf(".");
      strUrl = strBasePath.substring(0, index) + PropsBundle.PATH_SEP + objLocale + strBasePath.substring(index);
    }

    var doc = null, bAlreadyLoaded = false;
    
    if (objCache)
      doc = objCache.getDocument(strUrl);

    if (doc) {
      bAlreadyLoaded = true;
      objCache = null; // Don't add to cache since it came out of cache
    } else {
      doc = new jsx3.xml.Document();
      
      if (bAsync) {
        doc.setAsync(true);
        doc.subscribe("*", PropsBundle, function(objEvent) {
          PropsBundle._loadBundle2(strKey, strBasePath, objLocale, objCache, objEvent.target, fctCallback);
        });
      } else {
        bAlreadyLoaded = true;
      }

      doc.load(strUrl);
    }
    
    if (bAlreadyLoaded)
      PropsBundle._loadBundle2(strKey, strBasePath, objLocale, objCache, doc, fctCallback);
  };
  
  /** @private @jsxobf-clobber */
  PropsBundle._loadBundle2 = function(strKey, strBasePath, objLocale, objCache, objDoc, fctCallback) {
    var strUrl = objDoc.getSourceURL();
    if (! objDoc.hasError()) {
      if (objCache && strUrl)
        objCache.setDocument(strUrl, objDoc);
      PropsBundle._addLocaleRefs(strBasePath, objDoc);
      PropsBundle._loadInlineLocales(strBasePath, objLocale, objDoc);
    } else {
      LOG.error(jsx3._msg("propbn.err_file", strUrl, objDoc.getError()));
      PropsBundle._KEY_TO_PROPS[strKey] = PropsBundle.ERROR;
    }
    
    fctCallback();
  };

  /**
   * Loads any properties within a &lt;locale&gt; tag as though it was contained in its own properties file.
   * @private
   * @jsxobf-clobber
   */
  PropsBundle._loadInlineLocales = function(strBasePath, objLocale, objXML) {
    for (var i = objXML.selectNodeIterator("/data/locale"); i.hasNext(); ) {
      var lNode = i.next();
      var localeKey = lNode.getAttribute("key") || "";

      PropsBundle._setLocaleDoc(strBasePath, localeKey, lNode);
      PropsBundle._PATH_TO_LOCALES[strBasePath][localeKey] = true;
    }

    // Default to loading the entire external file for the requested locale.
    if (! PropsBundle._KEY_TO_PROPS[strBasePath + "::" + objLocale]) {
      PropsBundle._setLocaleDoc(strBasePath, objLocale.toString(), objXML);
    }
  };

  /** @private @jsxobf-clobber */
  PropsBundle._setLocaleDoc = function(strBasePath, strLocale, objXML) {
    var propsCache = PropsBundle._KEY_TO_PROPS;
    
    var props = new PropsBundle();
    props.loadXML(objXML);
    props._path = strBasePath;
    props._locale = jsx3.util.Locale.valueOf(strLocale);

    propsCache[strBasePath + "::" + strLocale] = props;
    
    // If not the root locale, then add a reference to the parent locale, according to the locale search path.
    // This requires the the parent locale always be loaded before the descendant locale.
    if (strLocale) {
      var path = props._locale.getSearchPath();
      for (var i = 1; i < path.length; i++) {
        var parent = propsCache[strBasePath + "::" + path[i]];
        if (parent) {
          props.addParent(parent);
          return;
        }
      }
      
      LOG.error("Parent of bundle " + strBasePath + " (" + strLocale + ") is null.");
    }
  };

  /**
   * Looks for and caches metadata in <code>objXML</code> that indicates that there are other files in this
   * properties bundle for other locales.
   * @private
   * @jsxobf-clobber
   */
  PropsBundle._addLocaleRefs = function(strBasePath, objXML) {
    var localeString = objXML.getAttribute("locales");

    if (PropsBundle._PATH_TO_LOCALES[strBasePath] == null)
      PropsBundle._PATH_TO_LOCALES[strBasePath] = {};

    if (localeString != null) {
      var localeKeys = localeString.split(/\s*,\s*/);
      for (var i = 0; i < localeKeys.length; i++)
        if (localeKeys[i])
          PropsBundle._PATH_TO_LOCALES[strBasePath][localeKeys[i]] = true;
    }
  };

  /**
   * Returns the locale for which this properties object was created. The value returned by this method is the
   * value sent to the <code>getProps()</code> method and not necessarily the most specific locale for which the
   * properties in this view are defined.
   *
   * @return {jsx3.app.Locale}
   * @see #getProps()
   */
  PropsBundle_prototype.getLocale = function() {
    return this._locale;
  };

  /**
   * Returns the base path of this properties bundle.
   * @return {String}
   */
  PropsBundle_prototype.getPath = function() {
    return this._path;
  };

  /**
   * Clears all the data stored in the caches internal to this class. Repeated calls to <code>getProps()</code>
   * consult only these caches. If files have changed on disk this method must be called for the return value of
   * <code>getProps()</code> to reflect these changes.
   * @param strPath {String} if provided, only clear out the documents stored for the resource at path <code>strPath</code>.
   * @param objCache {jsx3.app.Cache} if provided in addition to <code>strPath</code>, clear out any documents
   *    stored in <code>objCache</code> associated with the resource at path <code>strPath</code>.
   */
  PropsBundle.clearCache = function(strPath, objCache) {
    if (strPath) {
      delete PropsBundle._PATH_TO_LOCALES[strPath];

      var prefix = strPath + "::";
      for (var f in PropsBundle._KEY_TO_PROPS) {
        if (f.indexOf(prefix) == 0)
          delete PropsBundle._KEY_TO_PROPS[f];
      }

      if (objCache) {
        var cacheKeys = objCache.keys();
        for (var i = 0; i < cacheKeys.length; i++) {
          if (cacheKeys[i].indexOf(strPath) == 0)
            objCache.clearById(cacheKeys[i]);
        }
      }
    } else {
      PropsBundle._PATH_TO_LOCALES = {};
      PropsBundle._KEY_TO_PROPS = {};
    }
  };

});
