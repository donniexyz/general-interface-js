jsx3.$O(this).extend({

_attrChanged: function(objJSXs) {
  jsx3.$A(objJSXs).each(function(e) {
    if (e.getPersistence() != jsx3.app.Model.PERSISTNONE) {
      var editor = jsx3.ide.getEditorForJSX(e);
      editor.setDirty(true);
    }
  });
},

/** ON ATTRIBUTE EDIT *****************************************/
  /*
   * ? onAttributeEdit()    --called by the edit mask for the grid being edited after user has dismissed the mask, but before edits are committed;
   *            called because the grid has this handler listed as its 'jsxafteredit' binding
   * @ objGrid (REQUIRED)     --([object]) object reference to the jsx3.gui.Grid instance being edited
   * @ strRecordId (REQUIRED)     --(String) name of the attribute being updated (i.e., 'jsxexecute')
   * @ objMask (REQUIRED)     --([object]) object reference to the given mask that was just dismissed; in this case a menu or a textbox
   * ! returns        --(null/false) if false, the edit will not be committed
   */
onAttributeEdit: function(strRecordId, strValue, objGrid) {
  if (objGrid)
    objGrid.getRecordNode(strRecordId).removeAttribute("jsxmulti");

  //called when the edit mask is about to be committed (jsxafteredit)
  var objJSXs = jsx3.ide.getSelected();
  for (var i = 0; i < objJSXs.length; i++) {
    strValue = jsx3.util.strTrim(strValue);

    objJSXs[i].setAttribute(strRecordId, strValue);
    objJSXs[i].repaint();
  }

  this._attrChanged(objJSXs);
  this.publish({subject:"attrChanged", o:objJSXs, value:strValue, key:strRecordId});
  return {strNEWVALUE:strValue};
},

onAttributeAdd: function(strRecordId, strValue) {
  this.onAttributeEdit(strRecordId, strValue);
  this.onAttributeChange();
},

/** ON ATTRIBUTE MENU EXECUTE *****************************************/
  /*
   * ? onAttributeMenuExecute()    --called by the MENU edit mask for the grid being edited;
   *            called because the menu has a bound 'jsxexecute' event that references this handler
   * @ strRecordId (REQUIRED)     --(String) jsxid value for the CDF record representing the menu item just clicked
   * @ objRecord (OPTIONAL)     --([object]) NOT IMPLEMENTED (place holder for extension): reference to the CDF record node representing the menu item just clicked
   * ! returns        --(null)
   */
onAttributeDelete: function(strPropName) {
  if (strPropName) {
    var objJSXs = jsx3.ide.getSelected();
    for (var i = 0; i < objJSXs.length; i++) {
      objJSXs[i].removeAttribute(strPropName);
      objJSXs[i].repaint();
    }
    this._attrChanged(objJSXs);
    this.publish({subject:"attrChanged", o:objJSXs, value:null, key:strPropName});
    this.onAttributeChange();
  }
},

/** ON ATTRIBUTE CHANGE *****************************************/
onAttributeChange: function() {
  var palette = this.getAttrPalette();
  var content = palette.getUIObject();

  //get the selected GUI element in the DOM browser and the attributes editor grid
  var bSuccess = false;

  if (content) {
    var attsEditor = content.getDataMatrix();
    var objJSXs = jsx3.ide.getSelected();

    if (objJSXs.length > 0) {
      //reset the xml for the attributes editor
      attsEditor.clearXmlData();

      var same = {}, multi = {};

      for (var i = 0; i < objJSXs.length; i++) {
        var objAtts = objJSXs[i].getAttributes();
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
      bSuccess = true;
    }

    content.makeActive(bSuccess);
  }
},

allArePainted: function(arrJSX) {
  var bOk = arrJSX.length > 0;
  for (var i = 0; i < arrJSX.length && bOk; i++) {
    if (! arrJSX[i].instanceOf(jsx3.gui.Painted))
      bOk = false;
  }
  return bOk;
}

});
