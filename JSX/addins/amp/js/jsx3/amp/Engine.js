/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */


// @jsxobf-clobber-shared  _addPrereq _getPrereqs _engineStart _engineFinish _getConstructor _newBeforePlugIn
// @jsxobf-clobber-shared  _getBestLocaleKey _onLastResourceLoaded _pluginid

/**
 * An AMP engine. There is one engine instance per application that loads the AMP add-in.
 *
 * @see #getEngine()
 */
jsx3.lang.Class.defineClass("jsx3.amp.Engine", null, [jsx3.util.EventDispatcher], function(Engine, Engine_prototype) {

  var amp = jsx3.amp;
  var Document = jsx3.xml.Document;
  var Job = jsx3.util.Job;

  /** {String} Event subject published when an engine finishes loading. */
  Engine.LOAD = "load";

  /** {String} Event subject published when an error prevents the engine from loading. */
  Engine.ERROR = "error";

  /** {String} Event subject published when a plug-in is registered. */
  Engine.REGISTER = "register";

  /** {String} Event subject published when progress is made loading an engine. <code>pct</code> and <code>done</code> 
    *          fields may be defined. */
  Engine.PROGRESS = "progress";

  /** @private @jsxobf-clobber */
  Engine._ENGINES = {};

  /** @private @jsxobf-clobber */
  Engine._GLOBAL_PLUGINS = {};

  /**
   * Returns the engine for a given application.
   * 
   * @param objServer {jsx3.app.Server}
   * @return {jsx3.amp.Engine}
   */
  Engine.getEngine = function(objServer) {
    var key = objServer.getEnv("namespace");
    
    if (! Engine._ENGINES[key])
      Engine._ENGINES[key] = new Engine(objServer);
    return Engine._ENGINES[key];
  };
  
  /** @private @jsxobf-clobber-shared */
  Engine._initIfAddin = function(objServer) {
    var a = objServer.getAddins();
    for (var i = 0; i < a.length; i++)
      if (a[i] == amp.ADDIN) {
        Engine.getEngine(objServer);
        return;
      }
  };
  
  /** @private @jsxobf-clobber-shared */
  Engine._init = function() {
    var Server = jsx3.app.Server;
    var s = Server.allServers();
    for (var i = 0; i < s.length; i++)
      Engine._initIfAddin(s[i]);
    
    Server.subscribe(Server.INITED, Engine, "_onAppInit");
  };

  /** @private @jsxobf-clobber */
  Engine._onAppInit = function(onjEvent) {
    Engine._initIfAddin(onjEvent.target);
  };

  jsx3.net.URIResolver.register("jsxplugin", function(uri) {
    var pluginId = uri.getHost();
    for (var f in Engine._ENGINES) {
      var p = Engine._ENGINES[f].getPlugIn(pluginId);
      if (p) return p;
    }
    return null;
  });  

  /**
   * @param objServer {jsx3.app.Server}
   * @private
   */
  Engine_prototype.init = function(objServer) {
    /* @jsxobf-clobber */
    this._server = objServer;
    /* @jsxobf-clobber */
    this._plugins = jsx3.$A();
    /* {Object<String, jsx3.amp.PlugIn>}  Indexes plug-ins by their id. */
    /* @jsxobf-clobber */
    this._pluginmap = {};
    /* Maps plug-in id to registration index. */
    /* @jsxobf-clobber */
    this._pluginregorder = {__ct:0};
    /* {Object<String, jsx3.amp.ExtPoint>}  Indexes extension points by their id. */
    /* @jsxobf-clobber */
    this._extptmap = {};
    /* {Object<String, Array<jsx3.amp.Ext>>}  Indexes extensions by their point id. */
    /* @jsxobf-clobber */
    this._extmap = {};
    /* @jsxobf-clobber */
    this._rsrcserial = 0;
    /* @jsxobf-clobber */
    this._msgbus = jsx3.util.EventDispatcher.jsxclass.newInnerClass();
    /* @jsxobf-clobber */
    this._evtcnt = 0;
    /* Index of plug-in ID to XML data.
     * @jsxobf-clobber */
    this._pgdata = {};
    /* Index of plug-in ID to resource array.
     * @jsxobf-clobber */
    this._pgrsrc = {};
    /* @jsxobf-clobber */
    this._prog = new Prog(this);

    /* @jsxobf-clobber */
    this._loaded = false;
    this._load();
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._load = jsx3.$Y(function(cb) {
/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer("jsx3.amp.Engine", this.getServer().getEnv('namespace'));
/* @JSC :: end */

    var strPath = amp.DIR + "/" + amp.DESCRIPTOR;

    var mainPluginsURI = amp.ADDIN.resolveURI(strPath);
    /* @Embed(source='../../../plugins/plugins.xml', type='xml') */
    var addinXML = new jsx3.xml.Document().load(mainPluginsURI);
    var addinXMLDone = this._loadPluginsDescriptor(addinXML, mainPluginsURI);

    addinXMLDone.when(jsx3.$F(function() {
      this._prog._start();
    }).bind(this));

    var mainXML = Engine._loadXML(this._server.resolveURI(strPath));
    var mainXMLDone = this._loadPluginsDescriptor(mainXML, addinXMLDone); // 2nd param just for temporal ordering

    var autoDone = this._checkAutoReg(mainXMLDone);   // param just for ordering
    var rv = jsx3.$Z(this._onFinished, this)(autoDone); // param just for ordering

/* @JSC :: begin BENCH */
    rv.when(function() {
      t1.log("engine.load");
    });
/* @JSC :: end */

    return rv;
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._checkAutoReg = jsx3.$Y(function(cb) {
    var autoRegPI = this.getPlugIn("jsx3.amp.autoreg");
    autoRegPI.load().when(function() {
      if (autoRegPI.hasProvider() && !autoRegPI.hasCompleted())
        autoRegPI.subscribe("done", function() { cb.done(); });
      else
        cb.done();
    });
  });
  
  /** @private @jsxobf-clobber */
  Engine_prototype._loadPluginsDescriptor = jsx3.$Y(function(cb) {
    var objXML = cb.args()[0];
    var xmlPath = cb.args()[1] || objXML.getSourceURL();

    amp.LOG.debug(jsx3._msg("amp.02", xmlPath));

    if (!objXML.hasError()) {
      var baseName = objXML.getBaseName();
      var uri = objXML.getNamespaceURI();

      if (baseName == "plugins" && amp.isNS(uri)) {
        var pathPrefix = new jsx3.net.URI(xmlPath).resolve("").toString();
        pathPrefix = pathPrefix.substring(0, pathPrefix.length - 1);
        var condRV = null;

        for (var i = objXML.getChildNodes().iterator(); i.hasNext(); ) {
          var objNode = i.next();
          if (objNode.getBaseName() == "plugin" && amp.isNS(objNode.getNamespaceURI())) {
            var c = this._registerPlugInFromRegEntry(objNode, pathPrefix);
            condRV = condRV ? condRV.and(c) : c;
          }
        }

        if (condRV) return condRV;
        cb.done();
      } else {
        amp.LOG.error(jsx3._msg("amp.04", baseName, uri));
        this.publish({subject: Engine.ERROR, xml:objXML});
        cb.done();
      }
    } else {
      amp.LOG.error(jsx3._msg("amp.03", objXML.getError()));
      this.publish({subject: Engine.ERROR, xml:objXML});
      cb.done();
    }
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._registerPlugInFromRegEntry = jsx3.$Y(function(cb) {
    var objElm = cb.args()[0], strPrefix = cb.args()[1];

    // keep track of number of plug-ins requested so we can report progress
    var id = objElm.getAttribute("id");
    this._pluginregorder[id] = this._pluginregorder.__ct++;
//    amp.LOG.debug("_registerPlugInFromRegEntry " + id);

    // Plug-in definition could be inlined in plugins.xml. For it to be inlined it either needs to declare
    // child elements or a class attribute. Normally, only an id would be specified, meaning we need to load the
    // plugin.xml file in the nested directory.
    var bInclude = objElm.getFirstChild() == null && objElm.getAttribute("class") == null;

    // Support the path="../" attribute of the <plugin> registration.
    var pathPrefix = objElm.getAttribute("path");
    if (pathPrefix)
      strPrefix = jsx3.net.URI.valueOf(strPrefix).resolve(pathPrefix).toString();

    return this._registerPlugIn(strPrefix, id, bInclude ? null : objElm);
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._registerPlugIn = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strPath = args[0], strId = args[1], objXML = args[2];
    this._prog._add("p." + strId);

    if (!objXML) {
      var uri = (strPath ? strPath + "/" : "") + strId + "/" + amp.METAFILE;
      amp.LOG.debug(jsx3._msg("amp.01", uri, strId));
      objXML = Engine._loadXML(uri);
    }

    return this._onDescriptorResponse(strPath, strId, objXML);
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._onDescriptorResponse = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strPath = args[0], strId = args[1], objXML = args[2];

    //    amp.LOG.debug("_onDescriptorResponse " + strId);
    this._prog._done("p." + strId);

    if (!objXML.hasError()) {
      var baseName = objXML.getBaseName();
      var uri = objXML.getNamespaceURI();

      if (baseName == "plugin" && amp.isNS(uri)) {
        return this._registerPlugInFromElm(strId, strPath, objXML);
      } else {
        amp.LOG.error(jsx3._msg("amp.05", strId, baseName, uri));
        cb.done();
      }
    } else {
      amp.LOG.error(jsx3._msg("amp.06", strId, objXML.getError()));
      cb.done();
    }
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._registerPlugInFromElm = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strId = args[0], strPath = args[1], objElm = args[2];

    var id = objElm.getAttribute("id");
    if (!id || id != strId) {
      amp.LOG.error(jsx3._msg("amp.07", strId, id));
      cb.done();
    } else {
      var key = amp._getBestLocaleKey(objElm.getAttribute("locales"), this.getServer().getLocale());
      if (key) {
        this._getLocalizedDesc(strPath + "/" + strId, objElm, key).when(jsx3.$F(function() {
          cb.done(this._registerPlugInFromElm2(strId, strPath, objElm));
        }).bind(this));
      } else {
        return this._registerPlugInFromElm2(strId, strPath, objElm);
      }
    }
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._getLocalizedDesc = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strPath = args[0], objElm = args[1], strKey = args[2];

    strPath += "/plugin." + strKey + ".xml";
    Engine._loadXML(strPath).when(jsx3.$F(function(xml) {
      if (xml && !xml.hasError())
        this._mergeLocalizedDoc(objElm, xml);
      else
        amp.LOG.error(jsx3._msg("amp.53", strPath, (xml ? xml.getError() : null)));
      
      cb.done();
    }).bind(this));
  });

  /** @private @jsxobf-clobber */
  Engine._MERGE_SKIP_XP = {script:1, method:1, field:1, processor:1};
  /** @private @jsxobf-clobber */
  Engine._MERGE_SKIP_X = {script:1, method:1, field:1};

  /** @private @jsxobf-clobber */
  Engine_prototype._mergeLocalizedDoc = function(xml, locData) {
    if (locData.getBaseName() != "plugin" || !amp.isNS(locData.getNamespaceURI())) {
      amp.LOG.error(jsx3._msg("amp.54", locData.getSourceURL()));
      return;
    }

    // 1. Overwrite all attributes of <plugin>
    jsx3.$A(locData.getAttributeNames()).each(function(e) {
      xml.setAttribute(e, locData.getAttribute(e));
    });

    // 2. Overwrite all contents of <extension-point> that are not script, method, field, processor
    this._mergeLocalizedDocClob(xml, locData, "extension-point", Engine._MERGE_SKIP_XP);

    // 3. Overwrite all contents of <extension> that are not script, method, field
    this._mergeLocalizedDocClob(xml, locData, "extension", Engine._MERGE_SKIP_X);
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._mergeLocalizedDocClob = function(xml, locData, elmName, skipMap) {
    for (var i = locData.selectNodeIterator("amp:" + elmName + "[@id]", amp.getXmlNS(locData)); i.hasNext(); ) {
      var xpNode = i.next();
      var id = xpNode.getAttribute("id");
      var originalNode = xml.selectSingleNode('amp:' + elmName + '[@id="' + id + '"]', amp.getXmlNS(xml));

      if (originalNode) {
        jsx3.$A(xpNode.getAttributeNames()).each(function(e) {
          originalNode.setAttribute(e, xpNode.getAttribute(e));
        });

        var newChildren = xpNode.getChildNodes().toArray();
        if (newChildren.length > 0) {
          jsx3.$A(originalNode.getChildNodes().toArray().reverse()).each(function(e) {
            if (!amp.isNS(e.getNamespaceURI()) || !skipMap[e.getBaseName()]) {
              originalNode.removeChild(e);
            }
          });

          jsx3.$A(newChildren).each(function(e) {
            originalNode.appendChild(e);
          });
        }
      } else {
        amp.LOG.error(jsx3._msg("amp.55", xml.getAttribute("id"), elmName, id));
      }
    }
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._registerPlugInFromElm2 = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strId = args[0], strPath = args[1], objElm = args[2];

    // Save the XML metadata for each plug-in for later use.
    this._pgdata[strId] = objElm;
    var arrRsrc = this._createResources(objElm.selectSingleNode("amp:resources", amp.getXmlNS(objElm)), strId, strPath);

    var reqDone = this._requiredAreReg(strId, objElm);
    var earlyDone = this._loadEarlyRsrc(strId, arrRsrc, reqDone); // 3th param just for ordering
    return jsx3.$Z(this._createPlugIn, this)(strId, strPath, objElm, arrRsrc, earlyDone); // 5th param just for ordering
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._requiredAreReg = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strId = args[0], objElm = args[1];

    // All required plug-ins will be registered/instantiated before this plug-in is.
    var reqs = this._getRequires(objElm);

    reqs = reqs.filter(jsx3.$F(function(e) {
      var isReg = this.getPlugIn(e);

      // Warn when a plug-in is registered before a plug-in that it requires. Possible typo!
      if (!isReg && !this._pluginregorder[e])
        amp.LOG.warn(jsx3._msg("amp.26", strId, e));

      return !isReg;
    }).bind(this));

    if (reqs.length > 0) {
      var evtHandler = jsx3.$F(function(e) {
        reqs.remove(e.plugin.getId());
        if (reqs.length == 0) {
          this.unsubscribe(Engine.REGISTER, evtHandler);
          cb.done();
        }
      }).bind(this);
      this.subscribe(Engine.REGISTER, evtHandler);

    } else {
      cb.done();
    }
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._loadEarlyRsrc = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strId = args[0], arrRsrc = args[1];
    // We need to know the resources of the plug-in before it actually loads so that we can load any resource that
    // is load="early" before creating the plug-in instance.

    var rsrcMap = {};
    arrRsrc.each(function(e) { rsrcMap[e.getLocalId()] = e; });
    this._pgrsrc[strId] = rsrcMap;

    var condRV = null;

    arrRsrc.each(jsx3.$F(function(e) {
      if (e.getLoadType() == amp.Resource.LOAD_EARLY) {
        var c = this._loadResourcePvt(e);
        condRV = condRV ? condRV.and(c) : c;
      }
    }).bind(this));

    if (condRV) return condRV;
    cb.done();
  });
  
  /** @private @jsxobf-clobber */
  Engine_prototype._createResources = function(objElm, strPlugInId, strPath) {
//    amp.LOG.debug("_createResources " + objElm);
    var idMap = {};
    
    var r = jsx3.$A();
    if (objElm) {
      for (var i = objElm.getChildNodes().iterator(); i.hasNext(); ) {
        var e = i.next();
    
        if (amp.isNS(e.getNamespaceURI())) {
          var id = e.getAttribute("id");

          if (idMap[id]) {
            amp.LOG.error(jsx3._msg("amp.08", id, strPlugInId));
            id = null;
          }
          
          if (id == null || id == "")
            id = "_assigned_" + strPlugInId + "_" + (++this._rsrcserial);
          
          var rsrc = amp.Resource._newBeforePlugIn(strPlugInId, strPath + "/" + strPlugInId + "/", id, e, this);
          
          for (var j = e.selectNodeIterator("amp:prereq", amp.getXmlNS(e)); j.hasNext(); ) {
            var n = j.next();
            var nid = n.getAttribute("id");
            if (nid)
              rsrc._addPrereq(nid, "rsrc");
            else
              rsrc._addPrereq(n.getAttribute("plugin"), "plugin");
          }

          r.push(rsrc);
          idMap[id] = rsrc;
        }
      }
    }
    
    return r;
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._getRequires = function(objElm) {
    var r = jsx3.$A();
    for (var i = objElm.selectNodeIterator("amp:requires/amp:plugin", amp.getXmlNS(objElm)); i.hasNext(); )
      r.push(i.next().getAttribute("id"));
    return r;
  };
  
  /** @private @jsxobf-clobber */
  Engine_prototype._onProgress = function() {
    var pct = this._prog.pct();

    var objEvt = {subject:Engine.PROGRESS, pct:100*pct};
    if (pct >= 1)
      objEvt.done = true;

    this.publish(objEvt);
  };
  
  /** @private @jsxobf-clobber */
  Engine_prototype._createPlugIn = function(strId, strPath, objElm, arrRsrc) {
    var bGlobal = objElm.getAttribute("global");
    if (bGlobal && Engine._GLOBAL_PLUGINS[strId]) {

    }
    
    // Jump through some hoops if a specific class is specified for the plug-in instance. The class must either
    // be defined before this engine initializes or the <plugin> element must define a classfile attribute that 
    // is the relative path to a JavaScript file that defines the class.
    var c;
    var className = objElm.getAttribute("class");
    if (className) {
      c = amp._getConstructor(className);
      if (!c)
        amp.LOG.error(jsx3._msg("amp.09", className, strId));
    } 
    if (!c) c = amp.PlugIn;

//    amp.LOG.debug("_createPlugIn " + strId);
    
    // create the plug-in
    var p = new c();
    
    if (typeof(p.setEngine) == "function")
      p.setEngine(this);
    if (typeof(p.setPath) == "function")
      p.setPath(strPath + "/" + strId);
    if (typeof(p.setData) == "function")
      p.setData(objElm);
    if (typeof(p.setResources) == "function")
      p.setResources(arrRsrc);

    this._plugins.push(p);
    this._pluginmap[strId] = p;
    amp.LOG.debug(jsx3._msg("amp.10", p));
    
    // register all extension points with this engine
    var pts = p.getExtPoints();
    for (var i = 0; i < pts.length; i++)
      this._addExtPoint(pts[i]);
    
    var ptsExtended = {};

    // register all extensions with this engine
    var exs = p.getExts();
    for (var i = 0; i < exs.length; i++) {
      var ex = exs[i];
      var pointId = ex.getPointId();

      this._addExt(ex);

      if (!ptsExtended[pointId]) ptsExtended[pointId] = jsx3.$A();
      ptsExtended[pointId].push(ex);
    }

    Engine._extendInstance(p, objElm);

    // Notify extension points that they have been extended.
    for (var pointId in ptsExtended) {
      var point = this._extptmap[pointId];
      if (point) {
        point.getPlugIn().onExtension(point, ptsExtended[pointId]);
        point.onExtension(ptsExtended[pointId]);
      }
    }

    for (var i = objElm.selectNodeIterator("amp:bindable", amp.getXmlNS(objElm)); i.hasNext(); ) {
      var node = i.next();
      var key = node.getAttribute("id");
      p.addBindableProp(key, node.getAttribute("value"));
      p[key] = null; // so that with{} block will not throw an error before prop is defined
      
      var evt = jsx3.$S(node.getAttribute("subscribe") || "").trim().split(/\s+/g);
      jsx3.$A(evt).each(jsx3.$F(function(e) {
        if (e)
          p.updateBindableOn(key, this._msgbus, e);
      }).bind(this));

      p.subscribe(key, this, "_forwardEvent");
    }

    // Wire event dispatches
    jsx3.$A(p.getEvents()).each(jsx3.$F(function (eventId) {
      p.subscribe(eventId, this, "_forwardEvent");
    }).bind(this));

    // Wire inline event subscribers
    this._regSubscriptions(p, objElm);

    p.onRegister();
    this.publish({subject:Engine.REGISTER, plugin:p});
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._regSubscriptions = function(plugIn, objElm) {
    for (var i = objElm.selectNodeIterator("amp:subscribe", amp.getXmlNS(objElm)); i.hasNext(); ) {
      var n = i.next();
      var eventIds = n.getAttribute("event").split(/\s+/g);
      var handlerName = n.getAttribute("handler");
      var when = n.getAttribute("when");

      var fctBody = handlerName ? "this." + handlerName + "(evt);" : n.getValue();
      if (when == "load") {
        fctBody = "this.load().when(jsx3.$F(function(){" + fctBody + "}).bind(this));";
      } else if (when == "loaded") {
        fctBody = "if(this.isLoaded()){" + fctBody + "}";
      }

      for (var j = 0; j < eventIds.length; j++) {
        var methodName = "_evt_" + eventIds[j].replace(/\./g, "_") + "_" + (this._evtcnt++);
        var handler = jsx3.eval("var " + methodName + " = function(evt){" + fctBody + "}; " + methodName + ";");
        plugIn[methodName] = handler;
        this._msgbus.subscribe(eventIds[j], plugIn, methodName);
      }
    }
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._forwardEvent = function(objEvent) {
    var e = jsx3.$O(objEvent).clone();
    e.subject = objEvent.target.getId() + "." + objEvent.subject;
    amp.LOG.debug(jsx3._msg("amp.13", e.subject));
    this._msgbus.publish(e);

    // OpenAjax Hub integration
    if (window.OpenAjax && OpenAjax.hub) {
      try {
        OpenAjax.hub.publish(e.subject, e);
      } catch (e) {
        amp.LOG.error(jsx3._msg("amp.17", e.subject), jsx3.NativeError.wrap(e));
      }
    }
  };

  /** @private @jsxobf-clobber-shared */
  Engine._extendInstance = function(obj, objElm) {
    for (var i = objElm.selectNodeIterator("amp:script | amp:field | amp:method", amp.getXmlNS(objElm)); i.hasNext(); ) {
      var n = i.next();
      var name = n.getBaseName();

      if ("script" == name) {
//        amp.LOG.debug("Eval script on " + obj);
        try {
          obj.eval(n.getValue());
        } catch (e) {
          amp.LOG.error(jsx3._msg("amp.14", obj), jsx3.NativeError.wrap(e));
        }
      } else if ("field" == name) {
        try {
//        amp.LOG.debug("Define field " + n.getAttribute("id") + " on " + obj);
          obj[n.getAttribute("id")] = obj.eval(n.getValue());
        } catch (e) {
          amp.LOG.error(jsx3._msg("amp.15", n.getAttribute("id"), obj), jsx3.NativeError.wrap(e));
        }
      } else if ("method" == name) {
//        amp.LOG.debug("Define method " + n.getAttribute("id") + " on " + obj);
        try {
          var id = n.getAttribute("id");
          if (n.getAttribute("lazy") == "true") {
            fct = this._makeLazyFct(id);
          } else {
            var p = n.getAttribute("params") || "";
            var fct = jsx3.eval("var " + id + " = function(" + p + ") {" + n.getValue() + "}; " + id + ";");
            if (n.getAttribute("async") == "true")
              fct = jsx3.$Y(fct);
          }

          obj[id] = fct;
        } catch (e) {
          amp.LOG.error(jsx3._msg("amp.16", n.getAttribute("id"), obj), jsx3.NativeError.wrap(e));
        }
      }

      // Remove the node from the XML so that extension processing is not messed up.
      n.getParent().removeChild(n);
    }
  };

  /** @private @jsxobf-clobber */
  Engine._makeLazyFct = function(strMethod) {
    return function() {
      this.load().when(jsx3.$F(function(methodName, arrArgs) {
        this[methodName].apply(this, arrArgs);
      }).bind(this, [strMethod, arguments]));
    };
  };

  /**
   * Returns true if all of the AMP and project plug-ins have been registered.
   * @return {boolean}
   */
  Engine_prototype.isLoaded = function() {
    return this._loaded;
  };

  /**
   * Returns the application associated with this engine.
   * @return {jsx3.app.Server}
   */
  Engine_prototype.getServer = function() {
    return this._server;
  };

  /**
   * Returns all registered plug-ins.
   * @return {jsx3.$Array<jsx3.amp.PlugIn>}
   */
  Engine_prototype.getPlugIns = function() {
    return this._plugins;
  };

  /**
   * Returns a registered plug-in by ID.
   * @param strId {String}
   * @return {jsx3.amp.PlugIn}
   */
  Engine_prototype.getPlugIn = function(strId) {
    return this._pluginmap[strId];
  };

  /**
   * Returns a registered extension point by ID.
   * @param strId {String} the ID of the extension point.
   * @return {jsx3.amp.ExtPoint}
   */
  Engine_prototype.getExtPoint = function(strId) {
    return this._extptmap[strId];
  };

  /**
   * Returns the extensions registered for a given extension point ID.
   * @param strId {String} the ID of the extension point.
   * @return {jsx3.$Array<jsx3.amp.Ext>}
   */
  Engine_prototype.getExts = function(strId) {
    var a = this._extmap[strId];

    if (a && a._needssort) {
      a.sort(jsx3.$F(function(a, b) {
        var i1 = this._pluginregorder[a.getPlugIn().getId()] || 0;
        var i2 = this._pluginregorder[b.getPlugIn().getId()] || 0;
        return i1 > i2 ? 1 : (i1 == i2 ? 0 : -1);
      }).bind(this));
      a._needssort = false;
    }

    return a || jsx3.$A();
  };

  /**
   * Registers a plug-in manually at runtime. Only plug-ins not referenced in the main plugins.xml file should
   * be loaded in this way.
   * @param strId {String} the plug-in ID.
   * @param strPath {String} the relative path from the application directory to the directory containing the
   *    plug-in directory.
   * @param objXML {jsx3.xml.Entity} the optional XML declaration of the plug-in. Providing this parameter prevents
   *    this method from requesting the plug-in descriptor file.
   */
  Engine_prototype.register = jsx3.$Y(function(cb) {
    var args = cb.args();
    var strId = args[0];
    var strPath = args[1];
    var objXML = args[2];

    if (this._pluginmap[strId])
      throw new jsx3.IllegalArgumentException("Already loaded plug-in " + strId + ".");

    this._pluginregorder[strId] = this._pluginregorder.__ct++;
    return this._registerPlugIn(strPath, strId, objXML);
  });

  /**
   * Deregisters a plug-in from this engine. Note that garbage collection may be incomplete if application code
   * references the plug-in or any of its extension points or extensions. Also, this method does not unload any
   * JavaScript, CSS, or XML resources from the browser page or the AMP application. Unexpecting things may happen
   * if this method is called while the plug-in is still loading.
   * 
   * @param strId {String} the ID of the plug-in to deregister.
   */
  Engine_prototype.deregister = function(strId) {
    var p = this.getPlugIn(strId);
    if (p) {
      this._plugins.remove(p);

      var xp = p.getExtPoints();
      for (var i = 0; i < xp.length; i++)
        this._removeExtPoint(xp[i]);

      var exts = p.getExts();
      for (var i = 0; i < exts.length; i++)
        this._removeExt(exts[i]);

      delete this._pluginmap[strId];
      delete this._pluginregorder[strId];
      delete this._pgdata[strId];
      delete this._pgrsrc[strId];
    }
  };

  /**
   * @param xp {jsx3.amp.ExtPoint}
   * @package @jsxobf-clobber-shared
   */
  Engine_prototype._addExtPoint = function(xp) {
    amp.LOG.debug(jsx3._msg("amp.11", xp));
    this._extptmap[xp.getId()] = xp;
  };

  /**
   * @param xp {jsx3.amp.ExtPoint}
   * @package @jsxobf-clobber-shared
   */
  Engine_prototype._removeExtPoint = function(xp) {
    var xpid = xp.getId();
    delete this._extptmap[xpid];
  };

  /**
   * @param x {jsx3.amp.Ext}
   * @package @jsxobf-clobber-shared
   */
  Engine_prototype._addExt = function(x, bPub) {
    var pointId = x.getPointId();

    if (!this._extmap[pointId])
      this._extmap[pointId] = jsx3.$A();

    this._extmap[pointId].push(x);
    /* @jsxobf-clobber */
    this._extmap[pointId]._needssort = true;

    amp.LOG.debug(jsx3._msg("amp.12", x, pointId));

    if (bPub) {
      var point = this._extptmap[pointId];
      if (point) {
        point.getPlugIn().onExtension(point, [x]);
        point.onExtension([x]);
      }
    }
  };

  /**
   * @param x {jsx3.amp.Ext}
   * @package @jsxobf-clobber-shared
   */
  Engine_prototype._removeExt = function(x) {
    var extList = this._extmap[x.getPointId()];
    if (extList)
      extList.remove(x);
  };

  /** @private @jsxobf-clobber-shared */
  Engine_prototype._loadPlugIn = jsx3.$Y(function(cb) {
    var objPlugIn = cb.args()[0];
    //    amp.LOG.debug("_loadPlugIn " + objPlugIn);

    var presDone = this._loadPrereqPlugIns(objPlugIn);

/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer("jsx3.amp.Engine", objPlugIn.getId());
/* @JSC :: end */

    var rsrcDone = this._loadNormalRsrcs(objPlugIn, presDone); // 2nd parameter for ordering only
    var rv = jsx3.$Z(this._onAfterPlugInLoaded, this)(objPlugIn, rsrcDone); // 2nd parameter for ordering only

/* @JSC :: begin BENCH */
    rv.when(function() {
      t1.log("plugin.load");
    });
/* @JSC :: end */

    return rv;
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._loadPrereqPlugIns = jsx3.$Y(function(cb) {
    var objPlugIn = cb.args()[0];

    var condRV = null;

    var arrReqs = objPlugIn.getRequires();
    arrReqs.each(jsx3.$F(function(e) {
      var p = this.getPlugIn(e);
      if (p) {
        if (!p.isLoaded()) {
          var c = p.load();
          condRV = condRV ? condRV.and(c) : c;
        }
      } else {
        amp.LOG.error(jsx3._msg("amp.18", objPlugIn, e));
      }
    }).bind(this));

    if (condRV) return condRV;
    else cb.done();
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._loadNormalRsrcs = jsx3.$Y(function(cb) {
    var objPlugIn = cb.args()[0];
    var condRV = null;

    var arrRsrc = objPlugIn.getResources();
    arrRsrc.each(function(r) {
      if (!r.isLoaded() && r.getLoadType() == amp.Resource.LOAD_NORMAL) {
        var c = r.load();
        condRV = condRV ? condRV.and(c) : c;
      }
    });

    if (condRV) return condRV;
    else cb.done();
  });

  /** @private @jsxobf-clobber */
  Engine_prototype._onAfterPlugInLoaded = function(objPlugIn) {
//    amp.LOG.debug("_onAfterPlugInLoaded " + objPlugIn.getId() + " " + this._pgdata[objPlugIn.getId()]);

    var data = this._pgdata[objPlugIn.getId()];
    if (data) {
      // gc
      delete this._pgdata[objPlugIn.getId()];
      delete this._pgrsrc[objPlugIn.getId()];

      objPlugIn.getBindableProps().each(function(e) {
        objPlugIn.updateBindable(e);
      });

      var propName = data.getAttribute("property");
      if (propName)
        jsx3.lang.setVar(objPlugIn.isGlobal() ? propName :
                           objPlugIn.getServer().getEnv("namespace") + "." + propName, objPlugIn);
    }

    objPlugIn._onLastResourceLoaded();
    amp.LOG.debug(jsx3._msg("amp.43", objPlugIn));
  };
  
  /** @private @jsxobf-clobber-shared */
  Engine_prototype._loadResourceShared = jsx3.$Y(function(cb) {
    var objResource = cb.args()[0];
    objResource._engineStart();

    var presDone = this._loadResourcePres(objResource, objResource.getPlugIn());
    this._loadResourceReal(objResource, presDone /* for ordering only */).when(function(data) {
      objResource._engineFinish(data);
      cb.done();
    });
  });
  
  /** @private @jsxobf-clobber */
  Engine_prototype._loadResourcePvt = jsx3.$Y(function(cb) {
    var args = cb.args();
    var objResource = args[0];

    this._loadResourcePres(objResource).when(function() {
      objResource.load().when(cb);
    });
  });

  Engine_prototype._getSiblingResource = function(r, id) {
    var p = r.getPlugIn();
    return p ? p.getResource(id) : this._pgrsrc[r._pluginid][id];
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._loadResourcePres = jsx3.$Y(function(cb) {
    var args = cb.args();
    var objResource = args[0];
    
    var condRV = null;

    var arrPres = objResource._getPrereqs();

    arrPres.each(jsx3.$F(function(e) {
      var c = null;
      
      if (e.type == "plugin") {
        var plugIn = this.getPlugIn(e.id);
        if (plugIn) {
          if (!plugIn.isLoaded())
            c = plugIn.load();
        } else {
          amp.LOG.error(jsx3._msg("amp.20", e.id, objResource));
        }
      } else {
        var preReq = this._getSiblingResource(objResource, e.id);

        if (preReq) {
          if (!preReq.isLoaded())
            c = preReq.load();
        } else {
          amp.LOG.error(jsx3._msg("amp.21", e.id, objResource));
        }
      }

      if (c)
        condRV = condRV ? condRV.and(c) : c;
    }).bind(this));

    if (condRV) return condRV;
    else cb.done();
  });
  
  /** @private @jsxobf-clobber */
  Engine_prototype._onFinished = function() {
    this._loaded = true;

    for (var i = 0; i < this._plugins.length; i++)
      this._plugins[i].onStartup();

    this.publish({subject: Engine.LOAD});
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._getRsrcCache = function(objServer, strType) {
    if ("shared" == strType)
      return jsx3.getSharedCache();
    else if ("system" == strType)
      return jsx3.getSystemCache();
    else
      return objServer.getCache();
  };

  /** @private @jsxobf-clobber */
  Engine_prototype._loadResourceReal = jsx3.$Y(function(cb) {
    var objResource = cb.args()[0];

    var objServer = this.getServer();
    var strRsrcPath = objResource.getPathForLocale(objServer.getLocale());
    var strType = objResource.getType();

    var progId = "r." + objResource.getId();
    this._prog._add(progId);
    
    var cache = this._getRsrcCache(objServer, objResource.attr("cache"));
    var cacheid = objResource.attr("cachekey");
    if (!cacheid) {
      if (strRsrcPath && cache != objServer.getCache())
        cacheid = jsx3.resolveURI(objResource.getFullPath(strRsrcPath));
      else
        cacheid = objResource.getId();
    }

    if (strRsrcPath) {
      var strSrc = objResource.getFullPath(strRsrcPath);
      amp.LOG.debug(jsx3._msg("amp.52", objResource, strSrc));

//      amp.LOG.debug("_newResourceJob " + objResource + " " + strSrc);
      var onDone = jsx3.$F(function(rv) {
        amp.LOG.debug(jsx3._msg("amp.23", objResource, strSrc));
        this._prog._done(progId);
        cb.done(rv);
      }).bind(this);

      switch (strType) {
        case "script":
          if (objResource.attr("eval") == "true")
            Engine._loadText(strSrc).when(jsx3.$F(function(rv) {
              if (rv != null) {
                var target = objResource.getPlugIn() || jsx3;
                try {
/* @JSC :: begin BENCH */
                  var t1 = new jsx3.util.Timer("jsx3.amp.Engine", objResource.getId());
/* @JSC :: end */
                  target.eval(rv);
/* @JSC :: begin BENCH */
                  t1.log("js.eval");
/* @JSC :: end */
                } catch (e) {
                  amp.LOG.error(jsx3._msg("amp.32", strSrc, target), jsx3.NativeError.wrap(e));
                }
              } else {
                amp.LOG.error(jsx3._msg("amp.33", strSrc));
              }
              onDone();
            }).bind(this));
          else
            Engine._loadJS(strSrc).when(onDone);
          break;
        case "css":
          Engine._loadCSS(strSrc).when(onDone);
          break;
        case "jss":
          Engine._loadXML(strSrc).when(jsx3.$F(function(rv) {
            if (cache) cache.setDocument(cacheid, rv);
            objServer.JSS.loadXML(rv, cacheid);
            onDone(rv);
          }).bind(this));
          break;
        case "propsbundle":
          // properties bundle may not be versioned by locale
          jsx3.app.PropsBundle.getPropsAsync(objResource.getFullPath(), objServer.getLocale(), function(props) {
            objServer.LJSS.addParent(props);
            onDone(props);
          }, objServer.getCache());
          break;
        case "xml":
          Engine._loadXML(strSrc, jsx3.xml.CDF.Document.jsxclass).when(jsx3.$F(function(rv) {
            rv.convertProperties(this.getServer().getProperties());
            if (cache) cache.setDocument(cacheid, rv);
            onDone(rv);
          }).bind(this));
          break;
        case "xsl":
          Engine._loadXML(strSrc, jsx3.xml.XslDocument.jsxclass).when(jsx3.$F(function(rv) {
            if (cache) cache.setDocument(cacheid, rv);
            onDone(rv);
          }).bind(this));
          break;
        default:
          amp.LOG.error(jsx3._msg("amp.22", strType));
          onDone();
      }

    } else {
      amp.LOG.debug(jsx3._msg("amp.25", objResource));

      var xml = objResource.xml();
      var dataNode = xml.selectSingleNode("amp:data", amp.getXmlNS(xml));
      var objData = null;

      switch (strType) {
        case "script":
          if (objResource.attr("eval") == "true") {
/* @JSC :: begin BENCH */
            var t1 = new jsx3.util.Timer("jsx3.amp.Engine", objResource.getId());
/* @JSC :: end */
            // Any load="early" resource will not have access to the PlugIn object, so they should not assume
            // "this" context.
            (objResource.getPlugIn() || jsx3).eval((dataNode || xml).getValue());
/* @JSC :: begin BENCH */
            t1.log("js.eval");
/* @JSC :: end */
          } else if (!Engine._ONCE[objResource.getId()]) {
/* @JSC :: begin BENCH */
            var t1 = new jsx3.util.Timer("jsx3.amp.Engine", objResource.getId());
/* @JSC :: end */
            // If eval is not true, this was probably inlined during a build process and should only be evaluated once.
            Engine._ONCE[objResource.getId()] = 1;
            jsx3.eval((dataNode || xml).getValue());
/* @JSC :: begin BENCH */
            t1.log("js.eval");
/* @JSC :: end */
          }
          break;
        case "css":
          if (jsx3.CLASS_LOADER.IE) {
            var styleNode = document.createElement("style");
            styleNode.setAttribute("type", "text/css");
            document.getElementsByTagName("head")[0].appendChild(styleNode);
            styleNode.styleSheet.cssText = (dataNode || xml).getValue().toString();
          } else {
            jsx3.html.insertAdjacentHTML(document.getElementsByTagName("head")[0], "beforeEnd",
                    '<style type="text/css">\n' + (dataNode || xml).getValue() + "\n</style>");
          }
          break;
        case "jss":
          if (dataNode) {
            objServer.JSS.loadXML(dataNode.getFirstChild(), objResource.getId());
            objData = objServer.JSS;
          } else {
            amp.LOG.error(jsx3._msg("amp.29", objResource));
          }
          break;
        case "propsbundle":
        case "xml":
          if (dataNode) {
            objData = new jsx3.xml.CDF.Document(dataNode.getFirstChild());
            objData.convertProperties(this.getServer().getProperties());

            if (cache) cache.setDocument(cacheid, objData);

            if (strType == "propsbundle") {
              var basePath = objResource.getFullPath(dataNode.getAttribute("path"));
              if (cache) cache.setDocument(basePath, objData); // So that PropsBundle can find the document in the cache
              var props = jsx3.app.PropsBundle.getProps(basePath, objServer.getLocale(), cache);
              objServer.LJSS.addParent(props);
            }

          } else {
            amp.LOG.error(jsx3._msg("amp.29", objResource));
          }
          break;
        case "xsl":
          if (dataNode) {
            objData = new jsx3.xml.XslDocument(dataNode.getFirstChild());
            if (cache) cache.setDocument(cacheid, objData);
          } else {
            amp.LOG.error(jsx3._msg("amp.29", objResource));
          }
          break;
        default:
          amp.LOG.error(jsx3._msg("amp.22", strType));
      }

      this._prog._done(progId);
      cb.done(objData);
    }
  });

  /** @private @jsxobf-clobber */
  Engine._loadXML = jsx3.$Y(function(cb) {
    var args = cb.args();
    var path = args[0], objClass = args[1];

    var d = (objClass || jsx3.xml.Document.jsxclass).newInstance();
    d.setAsync(true);
    d.subscribe("*", function() {
      cb.done(d);
    });
    d.load(path);
  });

  /** @private @jsxobf-clobber */
  Engine._loadText = jsx3.$Y(function(cb) {
    var args = cb.args();
    var path = args[0];

    var r = jsx3.net.Request.open("GET", path, true);
    r.subscribe("*", function() {
      cb.done(r.getResponseText());
    });
    r.send();
  });

  /** @private @jsxobf-clobber */
  Engine._loadCSS = jsx3.$Y(function(cb) {
    return this._loadOnce(cb.args()[0], "_loadCSS2");
  });

  /** @private @jsxobf-clobber */
  Engine._loadCSS2 = jsx3.$Y(function(cb) {
    var path = cb.args()[0];

    // instance a new DOM element
    var element = document.createElement("link");
    element.href = path;
    element.rel = "stylesheet";
    element.type = "text/css";

    //bind the element to the browser DOM to begin loading the resource
    document.getElementsByTagName("head")[0].appendChild(element);
    cb.done();
  });

  /** @private @jsxobf-clobber */
  Engine._loadJS = jsx3.$Y(function(cb) {
    return this._loadOnce(cb.args()[0], "_loadJS2");
  });

  /** @private @jsxobf-clobber */
  Engine._loadJS2 = jsx3.$Y(function(cb) {
    var path = cb.args()[0];

    jsx3.CLASS_LOADER.loadJSFile(path, function() {
      cb.done();
    });
  });

  /** @private @jsxobf-clobber */
  Engine._ONCE = {};

  /** @private @jsxobf-clobber */
  Engine._loadOnce = jsx3.$Y(function(cb) {
    var path = cb.args()[0];

    var already = Engine._ONCE[path];
    if (already) {
      if (already instanceof jsx3.$AsyncRV)
        return already;
      else {
        cb.done();
      }
    } else {
      var fct = cb.args()[1];
      var retVal = Engine._ONCE[path] = this[fct](path);
      retVal.when(function() {
        Engine._ONCE[path] = 1;
      });
      return retVal;
    }
  });

  var Prog = function(eng) {
    // TODO: don't bother with tracking IDs when logic is confirmed correct
    this._eng = eng;
    this._ids = {};
    this._total = 0;
    this._donect = 0;
    this._on = 0;
  };

  jsx3.$O(Prog.prototype).extend({
    /* @jsxobf-clobber */
    _start: function() {
      this._on = 1;
    },

    /* @jsxobf-clobber */
    _add: function(id) {
      if (this._ids[id])
        amp.LOG.warn(jsx3._msg("amp.34", id));
      else {
        if (this._on) {
          this._ids[id] = 1;
          this._total++;
          this._eng._onProgress();
        } else {
          this._ids[id] = -1;
        }
      }
    },

    /* @jsxobf-clobber */
    _done: function(id) {
      var v = this._ids[id];

      if (v) {
        delete this._ids[id];

        if (v > 0) {
          this._donect++;
          this._eng._onProgress();
        }
      } else {
        amp.LOG.warn(jsx3._msg("amp.35", id));
      }
    },

    pct: function() {
      return this._total > 0 ? this._donect / this._total : 0;
    }
  });
  
});
