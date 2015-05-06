
jsx3.Class.defineClass("jsx3.ide.recorder.Editor", jsx3.ide.Editor, null, function(Editor, Editor_prototype) {

  var gui = jsx3.gui;
  var plugIn = function() { return jsx3.IDE.RecorderEditorPlugin; }

  Editor_prototype.render = function(objContainer) {
    var xml = plugIn().getResource("editor").getData();
    return objContainer.loadXML(xml, false, plugIn());
  };

  Editor_prototype.onBeforeClose = function() {
    if (this._running)
      this.onToggleLaunch();
  };

  Editor_prototype.onToggleLaunch = function() {
    if (this._running) {
      if (this._recorder) {
        this._recorder.close();
        this._recorder = null;
        this._running = false;
      }      
    } else {
      // Select the last record so we insert at the end of the list, which is more likely what is desired than
      // inserting at the beginning of the list.
      var g = this._getGrid();
      if (g.getValue().length == 0) {
        var lastRecord = g.getXML().getLastChild();
        if (lastRecord)
          g.setValue([lastRecord.getAttribute("jsxid")]);
      }

      var w = window.open(plugIn().resolveURI("recorder.html").toString(), "gipprecorder");
      if (w) {
        w["gippeditor"] = this;
        this._recorder = w;
      } else {
        plugIn().getServer().alert(null, "A pop-up blocker prevented the recorder from opening.");
      }
    }
  };

  Editor_prototype.onRecorderLaunched = function() {
    this._running = true;
    this.getContent().getLaunchBtn().setText("Stop Recorder", true);
  };

  Editor_prototype.onRecorderStopped = function() {
    if (this.isAlive()) {
      this._running = false;
      this._recorder = null;
      this.getContent().getLaunchBtn().setText("Launch Recorder", true);
    }
  };

  Editor_prototype.onInsertRecord = function(rec) {
    var g = this._getGrid();
    var sel = g.getValue();
    sel = sel[sel.length - 1];

    g.endEditSession();

    if (!rec)
      rec = {jsxid:jsx3.xml.CDF.getKey(), label:"", target:"", action:"", value:""};
    else if (!rec.jsxid)
      rec.jsxid = jsx3.xml.CDF.getKey();

    if (sel) {
      var before = g.getRecordNode(sel).getNextSibling();
      if (before)
        g.insertRecordBefore(rec, before.getAttribute("jsxid"));
      else
        g.insertRecord(rec);
    } else {
      var f = g.getXML().getChildIterator().next();
      if (f)
        g.insertRecordBefore(rec, f.getAttribute("jsxid"));
      else
        g.insertRecord(rec);
    }

    g.setValue(rec.jsxid);

    this.setDirty(true);
  };

  Editor_prototype.onDeleteRecord = function(recordId) {    
    this._getGrid().deleteRecord(recordId);
    this.setDirty(true);
  };

  Editor_prototype.onReorder = function() {
    this.setDirty(true);
    return true;
  };

  /** @private @jsxobf-clobber-shared */
  Editor_prototype._getGrid = function() {
    return this.getContent().getGrid();
  };

  Editor_prototype.getJsxSrc = function() {
    return plugIn().resolveURI("recorder.html").relativize(jsx3.resolveURI(jsx3.MAIN_SCRIPT)).toString();
  };

  Editor_prototype.getJsxAppPath = function() {
    return plugIn().resolveURI("recorder.html").relativize(
        jsx3.resolveURI("jsxuser:///" + jsx3.ide.PROJECT.getPathFromHome())).toString();
  };

  Editor_prototype.onModelEvent = function(objJSX, strType, objContext, hasListener) {
//    jsx3.util.Logger.GLOBAL.logStack(4, "onModelEvent " + [strType, objJSX]);
    // Some events only matter if they are listened to. But some events matter because they change the state of
    // controls that may be used for further tests.
    if (hasListener || (objContext && objContext._gipp)) {
      if (objJSX.getServer()) {
        this.onInsertRecord({label:"", target:this._getTargetString(objJSX),
            action:this._getActionString(strType, objContext), value:this._getActionArgsString(strType, objContext)});
        this.setDirty(true);
      } else {
        plugIn().getLog().info("Could not record event " + strType +
            " because the event was published after the target DOM node '" + objJSX.getName() + "' was destroyed.");
      }
    }
  };

  Editor_prototype.onAssert = function(objJSX, bWait) {
    var g = this._getGrid();
    g.endEditSession();

    var assertTokens = this._getAssertTokens(objJSX, bWait)
    this.onInsertRecord({label:"", target:this._getTargetString(objJSX),
        action:assertTokens[0], value:assertTokens[1]});

    this.setDirty(true);
  };

  /** @private @jsxobf-clobber-shared */
  Editor_prototype._getTargetString = function(objJSX) {
    var dom = objJSX.getServer().getDOM();
    var path = "";

    while (objJSX) {
      var parent = objJSX.getParent();
      var name = objJSX.getName();
      var matches = dom.getAllByName(name);

      if (path) path = " " + path;

      if ((matches.length == 1 || !parent) && jsx3.util.isName(name)) {
        path = "#" + name + path;
        break;
      } else if (parent.findDescendants(function(x){ return x.getName() == name; }, false, true).length == 1
           && jsx3.util.isName(name)) {
        path = "#" + name + path;
      } else {
        path = " > :nth(" + objJSX.getChildIndex() + ")" + path;
      }

      objJSX = objJSX.getParent();
    }

    return path;
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getAssertTokens = function(objJSX, bWait) {
    var prefix = bWait ? "jsxwait_" : "jsxassert_";

    var verb, object = null;

    if (Editor._isFunct(objJSX.getSelected)) {
      verb = "selected";
      object = jsx3.$O.json(objJSX.getSelected());
    } else if (Editor._isFunct(objJSX.getChecked)) {
      verb = "checked";
      object = jsx3.$O.json(objJSX.getChecked());
    } else if (Editor._isFunct(objJSX.getState)) {
      verb = "state";
      object = jsx3.$O.json(objJSX.getState());
    } else if (Editor._isFunct(objJSX.isFront)) {
      verb = "front";
      object = jsx3.$O.json(objJSX.isFront());
    } else if (Editor._isFunct(objJSX.getValue)) {
      verb = "value";

      object = objJSX.getValue();
      if (typeof(object) != "number" && typeof(object) != "boolean" && object !== null)
        object = jsx3.$O.json(object ? object.toString() : object);
    } else {
      verb = "exists";
    }

    return [prefix + verb, object];
  };

  /** @private @jsxobf-clobber */
  Editor._isFunct = function(f) {
    return typeof(f) == "function" || (f && f.apply && f.call);
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getActionString = function(strType, objContext) {
    return strType;
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getActionArgsString = function(strType, objContext) {
    var a = [];
    for (var f in objContext) {
      if (f == "target" || f.indexOf("_") == 0) continue;
      
      var obj = objContext[f];

      if (this._isOfType(obj, "jsx3.gui.Event")) {
        var o = {type:obj.getType()};
        if (obj.keyCode()) o.keyCode = obj.keyCode();
        if (obj.altKey()) o.altKey = true;
        if (obj.shiftKey()) o.shiftKey = true;
        if (obj.ctrlKey()) o.ctrlKey = true;
        if (obj.metaKey()) o.metaKey = true;
//        if (obj.clientX()) o.clientX = obj.clientX();
//        if (obj.clientY()) o.clientY = obj.clientY();
        a.push(f + ":" + jsx3.$O.json(o));
      } else if (obj && obj.getUTCDate) {
        a.push(f + ":new Date('" + obj.toString() + "')");
      } else if (this._isOfType(obj, "jsx3.app.Model")) {
        a.push(f + ":" + jsx3.$O.json("JSX(" + this._getTargetString(obj) + ")"));
      } else if (this._isOfType(obj, "jsx3.xml.Entity")) {
        a.push(f + ":" + jsx3.$O.json("XML(" + obj.toString() + ")"));
      } else if (typeof(obj) == "number" && obj >= 0xFFF) {
        a.push(f + ":0x" + obj.toString(16).toUpperCase());
      } else if (obj && obj.ownerDocument) {
        ; // skip any DOM nodes
      } else {
        a.push(f + ":" + jsx3.$O.json(obj));
      }
    }

    return "{" + a.join(', ') + "}";
  };

  /**
   * Allows type introspection to work across windows.
   * @private @jsxobf-clobber
   */
  Editor_prototype._isOfType = function(o, strClass) {
    // o can be null here
    if (o && o.getClass) {
      var c = o.getClass();
      while (c) {
        if (c.getName() == strClass)
          return true;

        var is = c.getInterfaces();
        for (var i = 0; i < is.length; i++)
          if (is[i].getName() == strClass)
            return true;

        c = c.getSuperClass();
      }
    }
    return false;
  };

  Editor_prototype.isAlive = function() {
    try {
      var c = this.getContent();
      return c && c.getRendered() && c.getRendered().offsetWidth > 0;
    } catch (e) {
      plugIn().getLog().debug(jsx3.NativeError.wrap(e));
      return true; // sometimes unexplained error in IE8
    }
  };

});
