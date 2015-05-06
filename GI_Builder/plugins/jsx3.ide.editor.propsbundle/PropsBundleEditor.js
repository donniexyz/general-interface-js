/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _url getUntitledPath getTabPath getMatrix loadMatrixData getMatrixData

jsx3.Class.defineClass("jsx3.ide.PropsBundleEditor", jsx3.ide.PropertiesEditor, null,
    function(PropsBundleEditor, PropsBundleEditor_prototype) {

  PropsBundleEditor_prototype.render = function(objContainer) {
    var xml = jsx3.IDE.PropsBundleEditorPlugin.getResource("editor").getData();
    return objContainer.loadXML(xml, false, this.getPlugIn());
  };

  PropsBundleEditor_prototype.getMatrix = function() {
    return this.getContent().getDescendantOfName("jsxpropsbundleeditor");
  };

  PropsBundleEditor_prototype.loadMatrixData = function(objXML) {
    var objMatrix = this.getMatrix();
    objMatrix.setSourceXML(this._convertToCDF(objXML));

    var defaultCol = objMatrix.getChild("coldefault");

    // remove old extra columns
    for (var i = objMatrix.getChildren().length - 1; i > defaultCol.getChildIndex(); i--)
      objMatrix.removeChild(i);

    // add necessary columns
    var loc = this._getLocalesInXML(objXML);
    loc.sort();
    for (var i = 0; i < loc.length; i++)
      this._addColumn(loc[i], objMatrix, defaultCol);
  };

  PropsBundleEditor_prototype._addColumn = function(locKey, objMatrix, defaultCol) {
    if (objMatrix == null) objMatrix = this.getMatrix();
    if (defaultCol == null) defaultCol = objMatrix.getChild("coldefault");

    var locale = jsx3.util.Locale.valueOf(locKey);
    var newCol = defaultCol.doClone();
    newCol.setName(locale.toString());
    newCol.setText(locale.getDisplayName() || locale.toString());
    newCol.setPath(locale.toString());
    newCol.setTip(locale.toString() + " : " + locale.getDisplayName());
    newCol.setFormatHandler(PropsBundleEditor.FORMATTER);
  };

  PropsBundleEditor_prototype.getMatrixData = function() {
    return this._convertFromCDF(this.getMatrix().getXML());
  };

  /** @private @jsxobf-clobber */
  PropsBundleEditor_prototype._convertToCDF = function(objXML) {
    var cdf = jsx3.xml.CDF.Document.newDocument();
    var cache = {};

    // TODO: eval
    for (var i = objXML.selectNodeIterator("/data/locale"); i.hasNext(); ) {
      var loc = i.next();
      var locId = loc.getAttribute("key");
      if (jsx3.util.strEmpty(locId)) locId = "_default";

      for (var j = loc.getChildIterator(); j.hasNext(); ) {
        var rec = j.next();
        var propId = rec.getAttribute("jsxid");
        var propVal = rec.getAttribute("jsxtext");
        if (cache[propId] == null)
          cache[propId] = cdf.insertRecord({jsxid:propId});

        cache[propId].setAttribute(locId, propVal);
      }
    }

    return cdf;
  };

  /** @private @jsxobf-clobber */
  PropsBundleEditor_prototype._convertFromCDF = function(objXML) {
    var xml = new jsx3.xml.Document().loadXML('<data jsxnamespace="propsbundle" locales=""/>');
    var locCache = {};

    for (var i = objXML.getChildIterator(); i.hasNext(); ) {
      var rec = i.next();
      var propId = rec.getAttribute("jsxid");
      var attrNames = rec.getAttributeNames();

      for (var j = 0; j < attrNames.length; j++) {
        var locId = attrNames[j];
        if (locId == "jsxid") continue;

        if (locCache[locId] == null) {
          var locNode = locCache[locId] = xml.createNode(jsx3.xml.Entity.TYPEELEMENT, "locale");
          if (locId != "_default")
            locNode.setAttribute("key", locId);
          xml.appendChild(locNode);
        }
        var recNode = xml.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
        recNode.setAttribute("jsxid", propId);
        recNode.setAttribute("jsxtext", rec.getAttribute(locId));
        locCache[locId].appendChild(recNode);
      }
    }

    return xml;
  };

  /** @private @jsxobf-clobber */
  PropsBundleEditor_prototype._getLocalesInXML = function(objXML) {
    var loc = [];
    for (var i = objXML.selectNodeIterator("/data/locale"); i.hasNext(); ) {
      var locId = i.next().getAttribute("key");
      if (locId != null) loc.push(locId);
    }
    return loc;
  };

  PropsBundleEditor_prototype.addLocaleColumn = function() {
    var me = this;
    var objMatrix = this.getMatrix();
    
    this.getPlugIn().getServer().prompt("Add Locale", "Enter the key of the new locale. Example: en_US.",
        function(d, val) {
          d.doClose();
          val = jsx3.util.strTrim(val);

          if (objMatrix.getChild(val)) {
            this.getPlugIn().getLog().error("Locale " + val + " already exists in properties bundle.");
          } else if (val.length > 0) {
            me._addColumn(val);
            me.setDirty(true);
          }
        });
  };

  PropsBundleEditor_prototype.removeLocaleColumn = function(objCol) {
    var objMatrix = objCol.getParent();
    var objXML = objMatrix.getXML();
    var attrName = objCol.getPath();
    for (var i = objXML.selectNodeIterator("//*[@" + attrName + "]"); i.hasNext(); )
      i.next().removeAttribute(attrName);

    objMatrix.removeChild(objCol);
    this.setDirty(true);
  };

  PropsBundleEditor.FORMATTER = function(objDiv, strCDFKey, objMatrix, objMatrixColumn, intRowNumber, objServer) {
    var objRec = objMatrix.getRecordNode(strCDFKey);
    if (!objRec) return;
    var locKey = objMatrixColumn.getPath();
    var strVal = objRec.getAttribute(locKey);

    if (strVal != null) {
//      objDiv.innerText = strVal;
      objDiv.parentNode.style.backgroundColor = "#FFFFFF";
      objDiv.style.color = "#000000";
    } else {
      while (true) {
        if (locKey == "_default") break;
        else if (locKey.indexOf("_") < 0) locKey = "_default";
        else locKey = locKey.substring(0, locKey.indexOf("_"));

        strVal = objRec.getAttribute(locKey);
        if (strVal != null) {
          jsx3.html.setInnerText(objDiv, strVal);
          objDiv.parentNode.style.backgroundColor = "#EEEEEE";
          objDiv.style.color = "#999999";
          return;
        }
      }
    }
  };

});
