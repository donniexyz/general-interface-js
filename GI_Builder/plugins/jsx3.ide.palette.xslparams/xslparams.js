/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({

_attrChanged: function(objJSXs) {
  jsx3.$A(objJSXs).each(function(e) {
    if (e.getPersistence() != jsx3.app.Model.PERSISTNONE) {
      var editor = jsx3.ide.getEditorForJSX(e);
      editor.setDirty(true);
    }
  });
},

/**
 * ? onXslParameterEdit()    --called by the edit mask for the grid being edited after user has dismissed the mask, but before edits are committed;
 *            called because the grid has this handler listed as its 'jsxafteredit' binding
 * @ objGrid (REQUIRED)     --([object]) object reference to the jsx3.gui.Grid instance being edited
 * @ strRecordId (REQUIRED)     --(String) name of the attribute being updated (i.e., 'jsxexecute')
 * @ objMask (REQUIRED)     --([object]) object reference to the given mask that was just dismissed; in this case a menu or a textbox
 */
onXslParameterEdit: function(strRecordId, strValue, objGrid) {
  if (objGrid)
    objGrid.getRecordNode(strRecordId).removeAttribute("jsxmulti");

  //called when the edit mask is about to be committed (jsxafteredit)
  var objJSXs = jsx3.ide.getSelected();
  strValue = jsx3.util.strTrim(strValue);

  for (var i = 0; i < objJSXs.length; i++) {
    if (objJSXs[i].instanceOf(jsx3.xml.Cacheable)) {
      objJSXs[i].setXSLParam(strRecordId, strValue);
      objJSXs[i].repaint();
    }
  }

  this._attrChanged(objJSXs);
  this.publish({subject:"changed", o:objJSXs, key:strRecordId, value:strValue});
  return {strNEWVALUE:strValue};
},

onXslParameterAdd: function(strName, strValue) {
  this.onXslParameterEdit(strName, strValue);
  this.onXslParameterChange();
},

/**
 * ? onXslParameterMenuExecute()    --called by the MENU edit mask for the grid being edited;
 *            called because the menu has a bound 'jsxexecute' event that references this handler
 * @ strRecordId (REQUIRED)     --(String) jsxid value for the CDF record representing the menu item just clicked
 * @ objRecord (OPTIONAL)     --([object]) NOT IMPLEMENTED (place holder for extension): reference to the CDF record node representing the menu item just clicked
 * ! returns        --(null)
 */
onXslParameterDelete: function(strPropName) {
  //called when a menu item is selected for the menu mask
  if (strPropName == null || typeof(strPropName) != "string") {
    var attsEditor = this.getPalette().getUIObject().getList();
    strPropName = attsEditor.getValue();
  }

  if (strPropName) {
    var objJSXs = jsx3.ide.getSelected();

    for (var i = 0; i < objJSXs.length; i++) {
      if (objJSXs[i].instanceOf(jsx3.xml.Cacheable)) {
        objJSXs[i].removeXSLParam(strPropName);
        objJSXs[i].repaint();
      }
    }

    this.onXslParameterChange();
    this._attrChanged(objJSXs);
    this.publish({subject:"changed", o:objJSXs, key:strPropName, value:null});
  }
},

onXslParameterChange: jsx3.$F(function() {
  //get the selected GUI element in the DOM browser and the attributes editor grid
  var attsEditor = this.getPalette().getUIObject().getList();

  var objJSXs = jsx3.ide.getSelected();

  var arrCache = [];
  for (var i = 0; i < objJSXs.length; i++) {
    if (objJSXs[i].instanceOf(jsx3.xml.Cacheable))
      arrCache.push(objJSXs[i]);
  }

  if (arrCache.length > 0) {
    //reset the xml for the attributes editor
    attsEditor.clearXmlData();

    var same = {}, multi = {};

    for (var i = 0; i < arrCache.length; i++) {
      var objAtts = arrCache[i].getXSLParams();
      for (var p in objAtts) {
        var val = String(objAtts[p]);

        if (i == 0)
          same[p] = val;
        else if (typeof(same[p]) == "undefined")
          multi[p] = true;
        else if (same[p] !== val) {
          multi[p] = true;
          delete same[p];
        }
      }

      for (var p in same) {
        if (typeof(objAtts[p]) == "undefined") {
          multi[p] = true;
          delete same[p];
        }
      }
    }

    //get attributes for current DOM object and loop to create the xml to populate the editor grid
    for (var p in same)
      attsEditor.insertRecord({value:same[p], jsxid:p, jsxtext:p}, null, false);
    for (var p in multi)
      attsEditor.insertRecord({jsxid:p, jsxtext:p, jsxmulti:1}, null, false);

    //repaint the attributes grid to show the updated xml
    attsEditor.repaintData();

    // update the combo box
    var objCombo = this.getPalette().getUIObject().getNameInput();
    if (objCombo) {
      var arrXML = new jsx3.util.List();
      for (var i = 0; i < arrCache.length; i++) {
        var templateDoc = jsx3.ide.getTemplateForObject("xsl", arrCache[i]);
        if (templateDoc && arrXML.indexOf(templateDoc) < 0)
          arrXML.add(templateDoc);
      }

      if (arrXML.size() == 1) {
        jsx3.IDE.getCache().setDocument(objCombo.getXMLId(), arrXML.get(0));
      } else {
        objCombo.clearXmlData();
      }
    }
  }
}).throttled(),

allAreCacheable: function(arrJSX) {
  var bOk = arrJSX.length > 0;
  for (var i = 0; i < arrJSX.length && bOk; i++) {
    if (! arrJSX[i].instanceOf(jsx3.xml.Cacheable))
      bOk = false;
  }
  return bOk;
}

});
