// @jsxobf-clobber-shared  _getGrid

jsx3.Class.defineClass("jsx3.ide.gitak.Editor", jsx3.ide.recorder.Editor, null, function(Editor, Editor_prototype) {

  Editor_prototype.render = function(objContainer) {
    var c = this.jsxsuper(objContainer);
    c.getPlayerBtn().setText("Launch in GITAK", true);
    c.setGIPP(false);
    return c;
  };

  Editor_prototype.loadFromFile = function() {
    var objFile = this.getOpenFile();
    this._error = false;

    if (objFile && objFile.isFile()) {
      var objXML = new jsx3.xml.Document().loadXML(objFile.read());

      if (objXML.hasError()) {
        this._error = true;
        this.getPlugIn().getLog().warn("Test file is not valid XML: " + objXML.getError());
      } else {
        this._loadFromXML(objXML);
      }
    } else {
      var x = new jsx3.xml.Document().loadXML(
          '<html gitak="true">\n' +
          '<head>\n' +
          '  <title>Recorded Tests for ' + jsx3.ide.PROJECT.getTitle() + '</title>\n' +
          '</head>\n' +
          '<body>\n' +
          '  <table cellpadding="1" cellspacing="1" border="1">\n' +
          '    <caption>Tests recorded by General Interface Builder</caption>\n' +
          '    <tbody>\n' +
          '      <tr>\n' +
          '        <td rowspan="1" colspan="3">' + jsx3.ide.PROJECT.getTitle() + '</td>\n' +
          '      </tr>\n' +
          '      <tr>\n' +
          '        <td>jsxopen</td><td>${GI}/shell.html?jsxapppath=${APP}</td>&amp;nbsp;<td></td>\n' +
          '      </tr>\n' +
          '    </tbody>\n' +
          '  </table>\n' +
          '</body>\n' +
          '</html>\n');
      this._loadFromXML(x);
    }
  };

  Editor_prototype._loadFromXML = function(x) {
    this._xml = x;
    var filterVal = function(e) {
      var v = e.getValue();
      if ((v && v.length == 1 && v.charCodeAt(0) == 160) || v == " ")
        return "";
      return v;
    }

    var g = this._getGrid();
    var cdf = jsx3.xml.CDF.Document.newDocument();

    for (var i = x.selectNodeIterator("//tr"); i.hasNext(); ) {
      var tr = i.next();

      var children = tr.getChildNodes();
      var actionTD = children.getItem(0);
      var targetTD = children.getItem(1);
      var valueTD = children.getItem(2);

      if (!(actionTD && targetTD && valueTD)) continue;

      var rec = {jsxid:jsx3.xml.CDF.getKey(), action:filterVal(actionTD), target:filterVal(targetTD), value:filterVal(valueTD)};
      cdf.insertRecord(rec);
    }

    g.setSourceXML(cdf);
    g.repaint();
  };

  Editor_prototype._toXML = function() {
    var x = this._xml.cloneDocument();

    var a = x.selectNodes("//tr").toArray();
    for (var i = 0; i < a.length; i++) {
      if (a[i].getChildNodes().size() >= 3)
        a[i].getParent().removeChild(a[i]);
    }

    var tbody = x.selectSingleNode("//tbody");

    var filterVal = function(e, a) {
      var v = e.getAttribute(a);
      if (v == null || v == "") return " ";
      return v;
    }

    var cdf = this._getGrid().getXML();
    for (var i = cdf.getChildIterator(); i.hasNext(); ) {
      var n = i.next();

      var tr = x.createNode(jsx3.xml.Entity.TYPEELEMENT, "tr");
      var actionTD = x.createNode(jsx3.xml.Entity.TYPEELEMENT, "td").setValue(filterVal(n, "action"));
      var targetTD = x.createNode(jsx3.xml.Entity.TYPEELEMENT, "td").setValue(filterVal(n, "target"));
      var valueTD = x.createNode(jsx3.xml.Entity.TYPEELEMENT, "td").setValue(filterVal(n, "value"));

      tr.appendChild(actionTD);
      tr.appendChild(targetTD);
      tr.appendChild(valueTD);

      tbody.appendChild(tr);
    }

    return x;
  };

  Editor_prototype.save = function(objFile) {
    if (this._error) {
      return false;
    } else {
      var xml = this._toXML();
      if (jsx3.ide.writeUserXmlFile(objFile || this.getOpenFile(), jsx3.ide.makeXmlPretty(xml, true))) {
        this.setDirty(false);
        this.publish({subject:"saved"});
        return true;
      } else {
        return false;
      }
    }
  };

  Editor_prototype.getPlugIn = function() {
    return jsx3.IDE.GitakEditorPlugin;
  };

  Editor_prototype.onEditRecord = function(recordId, objCol) {
    this.setDirty(true);
  };

  Editor_prototype.onLaunchPlayer = function(bConfirmed) {
    var objFile = this.getOpenFile();
    if (objFile && objFile.isFile()) {
      if (!bConfirmed && this.isDirty()) {
        jsx3.IDE.confirm("Save Before Launching?",
            "Save file before launching it in GITAK?",
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

        if (gippPlugIn && gippPlugIn.isGITAKConfigured()) {
          gippPlugIn.launchGITAK(jsx3.ide.PROJECT.getDirectory().relativePathTo(objFile));
        } else {
          this.getPlugIn().getServer().alert(null, "You must configure the GITAK plug-in in the IDE Settings dialog before launching this file in GITAK.");
        }
      }
    } else {
      this.getPlugIn().getServer().alert(null, "You must save this file before launching it in GITAK.");
    }
  };

  /** @private @jsxobf-clobber-shared */
  Editor_prototype._getTargetString = function(objJSX) {
    var s = this.jsxsuper(objJSX);
    return s ? "jsxselector=" + s : s;
  };

  /** @private @jsxobf-clobber */
  Editor_prototype._getActionString = function(strType, objContext) {
    var action = (strType) ? "do_" + strType : strType;
    return action;
  };
});
