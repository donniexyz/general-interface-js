/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({

/**
 * ? onModelEventEdit()   --called by the edit mask for the grid being edited after user has dismissed the mask, but before edits are committed;
 *            called because the grid has this handler listed as its 'jsxafteredit' binding
 * @ objGrid (REQUIRED)     --([object]) object reference to the jsx3.gui.Grid instance being edited
 * @ strRecordId (REQUIRED)     --(String) name of the model event being updated (i.e., 'jsxexecute')
 * @ objMask (REQUIRED)     --([object]) object reference to the given mask that was just dismissed; in this case a menu or a textbox
 * ! returns        --(null/false) if false, the edit will not be committed
 */
onModelEventEdit: function(objGrid, strRecordId, strValue) {
  //called when the edit mask is about to be committed (jsxafteredit)
  var objJSXs = jsx3.ide.getSelected();
  var execScript = objGrid.getRecord(strRecordId).jsxexecute;

  for (var i = 0; i < objJSXs.length; i++) {
    var objJSX = objJSXs[i];

    if (execScript) {
      objJSX.eval(execScript, {objJSX:objJSX, strType:strRecordId, strValue:strValue});
    } else {
      var bHad = objJSX.hasEvent(strRecordId);
      objJSX.setEvent(strValue, strRecordId);
  
      if (bHad != objJSX.hasEvent(strRecordId))
        objJSX.repaint();
    }
  }

  this.publish({subject:"eventChanged", o:objJSXs, key:strRecordId, value:strValue});

  for (var i = 0; i < objJSXs.length; i++) {
    if (objJSXs[i].getPersistence() != jsx3.app.Model.PERSISTNONE) {
      jsx3.ide.getEditorForJSX(objJSXs[i]).setDirty(true);
      break;
    }
  }
},

/**
 * ? onModelEventMenuExecute()  --called by the MENU edit mask for the grid being edited;
 *            called because the menu has a bound 'jsxexecute' event that references this handler
 * @ strRecordId (REQUIRED)     --(String) jsxid value for the CDF record representing the menu item just clicked
 * @ objRecord (OPTIONAL)     --([object]) NOT IMPLEMENTED (place holder for extension): reference to the CDF record node representing the menu item just clicked
 * ! returns        --(null)
 */
onModelEventMenuExecute: function(strRecordId) {
  //called when a menu item is selected; get its id; two are standard; all others are lookups
  var objJSXs = jsx3.ide.getSelected();

  for (var i = 0; i < objJSXs.length; i++) {
    objJSXs[i].removeEvent(strRecordId);
    objJSXs[i].repaint();
  }

  this.publish({subject:"eventChanged", o:objJSXs, key:strRecordId, value:null});
  this.onModelEventChange();
},

onModelEventChangeSleep: function() {
  jsx3.sleep(this.onModelEventChange, "jsx3.ide.onModelEventChange", this);
},

onModelEventChange: function() {
  //get the selected GUI element in the DOM browser
  var mePalette = jsx3.IDE.getJSXByName("jsxmodelevents");
  if (mePalette == null) return;

  var bSuccess = true;

  var objJSXs = jsx3.ide.getSelected();
  var arrXML = new jsx3.util.List();
  for (var i = 0; i < objJSXs.length && bSuccess; i++) {
    if (! objJSXs[i].instanceOf(jsx3.gui.Interactive)) {
      bSuccess = false;
      break;
    }

    var objXML = jsx3.ide.getTemplateForObject("event", objJSXs[i]);

    if (! objXML) {
      bSuccess = false;
      this.getLog().error("Error loading events file for class " + objJSX.getClass() + ".");
    } else if (arrXML.indexOf(objXML) < 0) {
      arrXML.add(objXML);
    }
  }

  if (bSuccess) {
    if (arrXML.size() == 1) {
      var objXML = arrXML.get(0);

      var objNodes = objXML.selectNodes("/data/record");

      var same = {}, multi = {};

      for (var i = 0; i < objJSXs.length; i++) {
        for (var j = objNodes.iterator(); j.hasNext(); ) {
          var objNode = j.next();
          var strEventName = objNode.getAttribute("jsxid");
          var val = objJSXs[i].getEvent(strEventName);

          if (i == 0)
            same[strEventName] = val;
          else if (same[strEventName] !== val) {
            multi[strEventName] = true;
            delete same[strEventName];
          }
        }
      }

      for (var j = objNodes.iterator(); j.hasNext(); ) {
        var objNode = j.next();
        var strEventName = objNode.getAttribute("jsxid");

        objNode.setAttribute("value", same[strEventName]);
        objNode.setAttribute("jsxmulti", multi[strEventName] ? "1" : null);
      }

      //update the cache document used by the modelevents editor grid to use the new, filled-out version just populated
      jsx3.IDE.getCache().setDocument(mePalette.getXMLId(), objXML);
      mePalette.repaintData();
    } else {
      bSuccess = false;
    }
  }

  return bSuccess;
}

});
