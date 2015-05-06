// @jsxobf-clobber-shared  _getGrid

jsx3.Class.defineClass("jsx3.ide.gipp.Editor", jsx3.ide.recorder.Editor, null, function(Editor, Editor_prototype) {

  var gui = jsx3.gui;

  Editor.START = "/* BEGIN GIPP RECORDER */";
  Editor.END = "/* END GIPP RECORDER */";

  Editor._DIVCLASS = "testcasedelim";

  Editor_prototype.render = function(objContainer) {
    var c = this.jsxsuper(objContainer);
    c.getPlayerBtn().setText("Launch in GIPP", true);
    c.setGIPP(true);
    return c;
  };

  Editor_prototype.loadFromFile = function() {
    var objFile = this.getOpenFile();
    this._error = false;

    if (objFile && objFile.isFile()) {
      var text = objFile.read();
      var i1 = text.indexOf(Editor.START);
      var i2 = text.indexOf(Editor.END);

      if (i1 >= 0 && i2 >= 0 && i2 > i1) {
        var data = text.substring(i1 + Editor.START.length, i2);
        this._loadJSON(data);

        this._prefix = text.substring(0, i1);
        this._suffix = text.substring(i2 + Editor.END.length);
      } else {
        this.getPlugIn().getServer().alert(null, "The file could not be parsed.");
        this._error = true;
      }
    } else {
      this._prefix = "// Do NOT edit the text in this file from the BEGIN to the END comments.\n" +
          "// Doing so will prevent the file from being read by General Interface Builder.\n" + 
          "\n";
      this._suffix = "\n\n" +
          "// Insert manual tests here using gi.test.gipp.recorder.insertBefore() and insertAfter().\n\n" +
          "// Do not modify the following line.\n" +
          "gi.test.gipp.recorder.playbackTests(recorderTests);";
    }
  };

  Editor_prototype.save = function(objFile) {
    if (this._error) {
      return false;
    } else {
      var data = this._prefix + Editor.START + "\n\n" + this._toJSON() + "\n\n" + Editor.END + this._suffix;

      if (jsx3.ide.writeUserFile(objFile || this.getOpenFile(), data)) {
        this.setDirty(false);
        this.publish({subject:"saved"});
        return true;
      } else {
        return false;
      }
    }
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._toJSON = function() {
    var s = "var recorderTests = [\n  ";

    for (var i = this._getGrid().getXML().getChildIterator(); i.hasNext(); ) {
      var n = i.next();

      var label = jsx3.$O.json(n.getAttribute("label"));
      var target = jsx3.$O.json(n.getAttribute("target"));
      var action = jsx3.$O.json(n.getAttribute("action"));
      var value = jsx3.$O.json(n.getAttribute("value"));

      s += "{label:" + label + ", target:" + target + ", action:" + action + ", value:" + value + "}";

      if (i.hasNext())
        s += ",\n  ";
    }

    s += "\n];";
    return s;
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._loadJSON = function(json) {
    try {
      var recorderTests = jsx3.eval(json + "; recorderTests;");

      var g = this._getGrid();
      var x = jsx3.xml.CDF.Document.newDocument();

      for (var i = 0; i < recorderTests.length; i++) {
        var rec = recorderTests[i];
        rec.jsxid = jsx3.xml.CDF.getKey();
        if (this._isDelimRecord(rec)) {
          rec.jsxclass = Editor._DIVCLASS;
        }
        x.insertRecord(rec);
      }

      g.setSourceXML(x);
      g.repaint();
    } catch (e) {
      var ex = jsx3.NativeError.wrap(e);
      jsx3.ide.LOG.error("Error loading file: " + ex, ex);
    }
  };

  Editor_prototype.getPlugIn = function() {
    return jsx3.IDE.GippEditorPlugin;
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._isDelimRecord = function(rec) {
    return rec.label|| (rec.action && rec.action.indexOf("jsxwait_") == 0);
  };

  Editor_prototype.onInsertRecord = function(rec) {
    if (rec && this._isDelimRecord(rec))
      rec.jsxclass = Editor._DIVCLASS;
    this.jsxsuper(rec);
  };

  Editor_prototype.onEditRecord = function(recordId, objCol) {
    if (objCol.getPath() == "label" || objCol.getPath() == "action") {
      var g = this._getGrid();
      var rec = this._getGrid().getRecord(recordId);

      if (this._isDelimRecord(rec)) {
        g.insertRecordProperty(recordId, "jsxclass", Editor._DIVCLASS, true);
      } else {
        g.insertRecordProperty(recordId, "jsxclass", "", true);
      }
    }
    
    this.setDirty(true);
  };

  Editor_prototype.onLaunchPlayer = function(bConfirmed) {
    var objFile = this.getOpenFile();
    if (objFile && objFile.isFile()) {
      if (!bConfirmed && this.isDirty()) {
        jsx3.IDE.confirm("Save Before Launching?",
            "Save file before launching it in GIPP?",
            jsx3.$F(function(d) {
              d.doClose();
              this.save();
              this.onLaunchPlayer(true);
            }).bind(this), jsx3.$F(function(d) {
              d.doClose();
              this.onLaunchPlayer(true);
            }).bind(this), "Save", "Continue", 2);
      } else {
        var gippPlugIn = this.getPlugIn().getEngine().getPlugIn("jsx3.ide.testing");

        if (gippPlugIn && gippPlugIn.isGIPPConfigured()) {
          gippPlugIn.launchGIPP(jsx3.ide.PROJECT.getDirectory().relativePathTo(objFile), 50);
        } else {
          this.getPlugIn().getServer().alert(null, "You must configure the GIPP plug-in in the IDE Settings dialog before launching this file in GIPP.");
        }
      }
    } else {
      this.getPlugIn().getServer().alert(null, "You must save this file before launching it in GIPP.");
    }
  };

});
