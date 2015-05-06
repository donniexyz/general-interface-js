/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
jsx3.$O(this).extend({

_getDataMatrix: function() {
  var content = this.getPalette().getUIObject();
  return content ? content.getDataMatrix() : null;
},

onJsxPropertyChange: function(objEvent) {
  var editor = jsx3.ide.getActiveEditor();


  //when this event is triggered via the lookup menu bound to the properties editor grid, a 'lookup' flag is passed, so the props editor is refreshed/repainted

  var objTree = this._getDataMatrix();

  //3.2 just redraw the cell using the cell valute template
  //objTree.redrawRecord(objEvent.prop, jsx3.xml.CDF.UPDATE);
  objTree.redrawCell(objEvent.prop,objTree.getChild("jsxproperties_value"));
},

onPropertyEdit: function(objGrid, strRecordId, strValue) {
  var obj = jsx3.ide.getSelected();

  //called when the edit mask is about to be committed (jsxafteredit)
  var objTargets = jsx3.ide.getSelected();
  var propRecord = objGrid.getRecord(strRecordId);

  // Support for typing in the key of a dynamic property directly without using the context menu.
  if (typeof(jsx3.ide.PROJECT.getServer().getDynamicProperty(strValue)) != "undefined") {
    this._setDynamicProperty(this._getDataMatrix(), jsx3.ide.getSelected(),
        strRecordId, strValue);
    this._updatePropertyNode(objGrid, obj, strRecordId);
    objGrid.redrawCell(strRecordId, objGrid.getChild("jsxproperties_value"));
    return false;
  } else {
    if (typeof(strValue) == "string")
      strValue = jsx3.util.strTrim(strValue);

    return this._editObjectProperty(propRecord, objTargets, strRecordId, strValue);
  }
},

_editObjectProperty: function(objRecord, arrObjects, strProp, strInput) {
  // check disallow and validate regex's
  // check clears (null) as though it was an empty string
  var strCheck = strInput != null ? strInput.toString() : "";

  if (objRecord.disallow) {
    var regex = objRecord.disallow.indexOf('/') == 0 ?
        jsx3.eval(objRecord.disallow) : new RegExp(objRecord.disallow);
    if (strCheck.match(regex)) {
      this.getLog().error("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strProp + " is invalid, must not match " + regex);
      return false;
    }
  }

  if (objRecord.validate) {
    var regex = objRecord.validate.indexOf('/') == 0 ?
        jsx3.eval(objRecord.validate) : new RegExp(objRecord.validate);
    if (! strCheck.match(regex)) {
      this.getLog().error("input '" + jsx3.util.strEscapeHTML(strCheck) + "' for property " + strProp + " is invalid, must match " + regex);
      return false;
    }
  }

  // eval the new text if needed
  if (objRecord["eval"] == "1") {
    try {
      strInput = this.eval(strInput);
    } catch (e) {
      this.getLog().error("error evaluating expression '" +
          (strInput != null ? jsx3.util.strEscapeHTML(strInput) : null) + "': " + jsx3.NativeError.wrap(e));
      return false;
    }
  }

  // check for special on edit script
  var changeScript = objRecord["jsxexecute"];

  if (objRecord.validatehtml) {
    if (jsx3.util.strEndsWith(jsx3.app.Browser.getLocation().getPath(), ".xhtml")) {
      var doc = new jsx3.xml.Document().loadXML("<jsxtext>" + strInput + "</jsxtext>");
      if (doc.hasError()) {
        this.getLog().error("When working in XHTML mode, the " + objRecord.jsxid + " property must be well-formed XML. (" +
            doc.getError() + ")");
        return false;
      }
    }
  }

  for (var i = 0; i < arrObjects.length; i++) {
    var objInstance = arrObjects[i];

    if (changeScript != null) {
      // script context
      try {
        this.eval(changeScript, {vntValue:strInput, objJSX:objInstance});
      } catch (e) {
        this.getLog().error("error evaluating expression '" + changeScript + "': " + jsx3.NativeError.wrap(e));
        return false;
      }
    } else {
      objInstance[strProp] = strInput;
      objInstance.repaint();
    }
  }

  if (objRecord.domchanged)
    this.publish({subject:"domChanged", objs:arrObjects});

  this.publish({subject:"propChanged", objs:arrObjects, prop:strProp});

  // QUESTION: handle this via pub-sub?
  for (var i = 0; i < arrObjects.length; i++) {
    if (arrObjects[i].getPersistence() != jsx3.app.Model.PERSISTNONE) {
      jsx3.ide.getEditorForJSX(arrObjects[i]).setDirty(true);
      break;
    }
  }

  return true;
},

onPropertyBeforeEdit: function(objGrid, objColumn, strRecordId) {
  if (objColumn != objGrid.getChild(1)) return false;

  var objRecord = objGrid.getRecordNode(strRecordId);
  var maskId = objRecord.getAttribute("jsxmask");
  if (!maskId) return false;

  if (objRecord.getAttribute("uneditable") == "1") return false;
  if (objRecord.getAttribute("jsxdynamic") != null) return false;

  var objMask = objColumn.getChild(maskId) || objColumn.getChild("jsxtextbox");

  if (objMask instanceof jsx3.gui.Select) {
    objMask.clearXmlData();

    for (var i = objRecord.selectNodeIterator("enum"); i.hasNext(); ) {
      var enumNode = i.next();
      var value = enumNode.getAttribute('jsxvalue');
      var text = enumNode.getAttribute('jsxtext');
      objMask.insertRecord({jsxid:value, jsxtext:text});
    }

    objMask.redrawRecord(objMask.getValue()); // update the displayed text
  }
  return {objMASK:objMask};
},

onPropertyMenu: function(objMenu, strRecordId) {
  //remove xml and cached html for the dynprop menu
  objMenu.setSourceXML(this.getResource("contextmenu").getData().cloneDocument());

  //get handles to objects (xml and jsx)
  var objP = this._getDataMatrix();

  //get all lookups that match the property we're editing
  var objRecord = objP.getRecordNode(strRecordId);

  if (objRecord.getAttribute("uneditable") == "1") return false;
//  if (objRecord.getAttribute("jsxdynamic") == "1") return false;
  if (objRecord.selectSingleNode("record") != null) return false; // ignore groups

  // support nullable="0"
  objMenu.enableItem('jsxdpclear', objRecord.getAttribute("nullable") !== "0");

  // the dynprops type will either be the jsxtype attribute of the props record, or default to the jsxid
  var type = objRecord.getAttribute("jsxtype");
  if (! type) type = strRecordId;

  // get all dynprops that match the property we're editing
  var list = this._getPropertyIdsForType(type);

  // 1. turn dot delimited strings into nested json
  var data = {}; // com.tibco.gi.bg.blue
  for (var i = 0; i < list.length; i++) {
    var key = list[i];
    var tokens = key.split(".");

    var node = data;
    for (var j = 0; j < tokens.length - 1; j++) {
      var token = tokens[j];

      if (typeof(node[token]) == "object") {
        ;
      } else if (typeof(node[token]) == "number") {
        // handle collision between leaf and node
        node[token] = {__leaf: 1};
      } else {
        node[token] = {};
      }

      node = node[tokens[j]];
    }

    var lastToken = tokens[tokens.length - 1];

    if (!node[lastToken])
      node[lastToken] = 1;
    else
      // handle collision between leaf and node
      node[lastToken].__leaf = 1;
  }

  // 2. turn json into XML
  var x = jsx3.xml.CDF.newDocument();
  this._jsonToXml(x, x, data, "");

  // 3. optimize XML
  for (var i = x.getChildIterator(); i.hasNext(); )
    this._optimizeXml(i.next());

  if (x.getFirstChild())
    x.getFirstChild().setAttribute("jsxdivider", "1");

  // 4. copy properties into the menu XML
  var copyTo = objMenu.getXML().getRootNode();
  for (var i = x.getChildNodes().iterator(); i.hasNext(); ) {
    copyTo.appendChild(i.next());
  }

  // enabled dynaprop item only if set
  var objJSX = jsx3.ide.getSelected();
  var enable = true;
  for (var i = 0; i < objJSX.length && enable; i++)
    enable = enable && objJSX[i].getDynamicProperty(strRecordId) != null;

  objMenu.enableItem('jsxdpconvert', enable);

  return true;
},

/* @jsxobf-clobber */
_jsonToXml: function(doc, x, json, prefix) {
  for (var f in json) {
    if (f == "__leaf") continue;

    var id = prefix ? prefix + "." + f : f;
    var node = doc.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
    node.setAttribute("jsxid", id);
    node.setAttribute("jsxtext", f);

    if (typeof(json[f]) == "object") {
      // handle leaf node collision
      if (json[f].__leaf) {
        var leaf = doc.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
        leaf.setAttribute("jsxid", id);
        leaf.setAttribute("jsxtext", f);
        x.appendChild(leaf);
      }

      this._jsonToXml(doc, node, json[f], id);
    }

    x.appendChild(node);
  }
},

/* @jsxobf-clobber */
_optimizeXml: function(x) {
  var collapsed = false;

  do {
    collapsed = false;

    var children = x.getChildNodes();
    if (children.size() == 1) {
      var onlyChild = children.get(0);
      var grandchildren = onlyChild.getChildNodes();

      if (grandchildren.size() > 0) {
        collapsed = true;
        
        for (var i = 0; i < grandchildren.size(); i++)
          x.appendChild(grandchildren.get(i));

        x.setAttribute("jsxtext", x.getAttribute("jsxtext") + "." + onlyChild.getAttribute("jsxtext"));
        x.removeChild(onlyChild);
      }
    }
  } while (collapsed);

  children = x.getChildNodes();
  for (var i = 0; i < children.size(); i++)
    this._optimizeXml(children.get(i));
},

onPropertyMenuExecute: function(objMenu, strRecordId) {
  //called when a menu item is selected; get its id; two are standard; all others are lookups
  var objJSXs = jsx3.ide.getSelected();
  var oPE = this._getDataMatrix()
  var strPropName = objMenu.getContextRecordId();
  var objRecord = oPE.getRecordNode(strPropName);
  var strLookupId;

  if (strRecordId == "jsxdpclear") {
    for (var i = 0; i < objJSXs.length; i++)
    //user wants to null the value; clear any lookup (dp) or embedded values
      objJSXs[i].setDynamicProperty(strPropName);
    this._editObjectProperty(oPE.getRecord(strPropName), objJSXs, strPropName, null);
  } else if (strRecordId == "jsxdpconvert") {
    //user wants to convert the dynprop (just remove the dynprop, the value's already there)
    for (var i = 0; i < objJSXs.length; i++)
      objJSXs[i].setDynamicProperty(strPropName);

    //update the properties editor
    this.publish({subject:"propChanged", objs:objJSXs, prop:strPropName, lookup:true});
  } else if ((strLookupId = objRecord.getAttribute("lookupid")) != null) {
    //user chose a lookup/constant; clear any bound dynprop then set the value as embedded
    for (var i = 0; i < objJSXs.length; i++)
      objJSXs[i].setDynamicProperty(strLookupId);

    var newVal = objRecord.getAttribute("eval") === "0" ?
        strRecordId : this.eval(strRecordId);

    this._editObjectProperty(oPE.getRecord(strPropName), objJSXs, strPropName, newVal);
  } else {
    //user wants to set a dynprop
    //TO DO: support contstants/lookups
    this._setDynamicProperty(oPE, objJSXs, strPropName, strRecordId);
  }

  this._updatePropertyNode(null, objJSXs, null, objRecord);

  oPE.redrawRecord(strPropName, jsx3.xml.CDF.UPDATE, oPE.getChild("jsxproperties_value"));
},

/* @jsxobf-clobber */
_setDynamicProperty: function(objMatrix, objJSXs, strPropName, strKey) {
  for (var i = 0; i < objJSXs.length; i++)
    objJSXs[i].setDynamicProperty(strPropName, strKey);

  this._editObjectProperty(objMatrix.getRecord(strPropName), objJSXs, strPropName,
      objJSXs[0].getServer().getDynamicProperty(strKey));
},

onPropertiesChange: function() {
  var propsPalette = this._getDataMatrix()
  if (propsPalette == null) return;

  //get the selected GUI element in the DOM browser
  var arrJSX = jsx3.ide.getSelected();

  var success = false;

  if (arrJSX.length > 0) {
    var objXML = this._getMergedPropertiesDoc(arrJSX);
    if (objXML != null) {
      //update the cache document used by the properties editor grid to use the new, filled-out version just populated
      jsx3.IDE.getCache().setDocument(propsPalette.getXMLId(), objXML);
      success = true;
    }
  } else {
    jsx3.IDE.getCache().setDocument(propsPalette.getXMLId(), jsx3.xml.CDF.newDocument());
  }

  //3.2 addition to handle more-efficient repainting of matrix content when only the data changes, not the actual structures
  if (success) {
    propsPalette.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
    propsPalette.repaintData();
  } else {
    propsPalette.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
  }
},

_getMergedPropertiesDoc: function(arrJSX) {
  var setXML = new jsx3.util.List();
  var arrXML = new Array(arrJSX.length);

  for (var i = 0; i < arrJSX.length; i++) {
    if (! arrJSX[i]) return null;
    arrXML[i] = this._getClassPropertiesDoc(arrJSX[i]);
    if (! arrXML[i]) return null;

    if (setXML.indexOf(arrXML[i]) < 0)
      setXML.add(arrXML[i]);
  }

  var objNodes = null;

  if (setXML.size() == 1) {
    var objXML = arrXML[0];

    for (var i = objXML.selectNodeIterator("//record[not(@group)]"); i.hasNext(); )
      this._updatePropertyNode(null, arrJSX, null, i.next());

    return objXML;
  } else {
    for (var i = 0; i < arrJSX.length; i++) {
      var objJSX = arrJSX[i];
      var objXML = arrXML[i];

      if (i == 0) {
        objNodes = new jsx3.util.List(objXML.selectNodes("//record[not(@group)]").toArray());
      } else {
        for (var j = objNodes.iterator(); j.hasNext(); ) {
          var objNode = j.next();
          var strProp = objNode.getAttribute("jsxid");
          if (objXML.selectSingleNode("//record[not(@group) and @jsxid='" + strProp + "']") == null)
            j.remove();
        }
      }
    }

    // Create new document with the union of the nodes
    var objXML = new jsx3.xml.Document().loadXML('<data jsxid="jsxroot"/>');
    for (var j = objNodes.iterator(); j.hasNext(); )
      objXML.appendChild(j.next().cloneNode(true));

    objNodes = objXML.selectNodes("//record");
  }

  for (var i = objNodes.iterator(); i.hasNext(); )
    this._updatePropertyNode(null, arrJSX, null, i.next());

  return objXML;
},

_updatePropertyNode: function(objTree, arrJSX, strPropName, objNode) {
  if (objNode == null)
    objNode = objTree.getRecordNode(strPropName);
  else if (strPropName == null)
    strPropName = objNode.getAttribute("jsxid");

  var strGetter = objNode.getAttribute("getter");
  strPropName = objNode.getAttribute("jsxid");

  arrJSX = jsx3.$A(arrJSX);

  var endVal = null, envDynVal = null, endMultiVal = null;
  for (var i = 0; i < arrJSX.length; i++) {
    var objJSX = arrJSX[i];
    var stepVal = null, stepDynVal = null;

    stepDynVal = objJSX.getDynamicProperty(strPropName);
    if (strGetter) {
      if (jsx3.util.isName(strGetter))
        //check for null on getter
        stepVal = objJSX[strGetter]();
      else
        stepVal = objJSX.eval(strGetter);
    } else if (objJSX[strPropName] != null) {
      stepVal = objJSX[strPropName];
    }

    if (i == 0) {
      endVal = stepVal;
      envDynVal = stepDynVal;
    } else {
      // TODO: more exact definition of equals
      if (endVal !== stepVal || envDynVal !== stepDynVal) {
        endMultiVal = 1;
        endVal = envDynVal = null;
        break;
      }
    }
  }

  objNode.setAttribute("value", endVal);
  objNode.setAttribute("jsxdynamic", envDynVal);
  objNode.setAttribute("jsxmulti", endMultiVal);
},

_getClassPropertiesDoc: function(objJSX) {
  var cache = jsx3.IDE.getCache();
  var cachedDocId = "PROPERTIES_TEMPLATE_" + objJSX.getClass().getName() + (objJSX._subPropId ? objJSX._subPropId() : '');
  var cachedDoc = cache.getDocument(cachedDocId);
  if (cachedDoc != null)
    return cachedDoc/*.cloneDocument()*/;

  var objXML = jsx3.ide.getTemplateForObject("prop", objJSX);
  if (objXML == null) return null;
  var objPathURI = new jsx3.net.URI(objXML.getSourceURL());

  objXML.convertProperties(jsx3.IDE.getProperties());

  var objNodes = null;
  var times = 0;
  do {
    objNodes = objXML.selectNodes("//record[@include]");

    for (var i = objNodes.iterator(); i.hasNext(); ) {
      var objNode = i.next();
      var strURL = objNode.getAttribute("absinclude");
      if (strURL == null)
        strURL = objPathURI.resolve(objNode.getAttribute("include")).toString();

//      jsx3.log("_getClassPropertiesDoc 1", strPath + " -> " + objNode.getAttribute("include") + " = " + strURL, null, false)
      var strMasterPath = objNode.getAttribute("path");
      var strGroup = objNode.getAttribute("group");
      var strChildren = objNode.getAttribute("children");

      var cacheId = "PROPERTIES_MASTER_" + strURL;
      var objMaster = cache.getDocument(cacheId);
      if (objMaster == null) {
        objMaster = cache.openDocument(strURL, cacheId);
        if (objMaster.hasError()) {
          this.getLog().error("Error parsing properties file '" + strURL +
              "' for class " + objJSX.getClass() + ": " + objMaster.getError());
          return null;
        }
      }

      if (! strMasterPath && strGroup)
        strMasterPath = "/data/record[@jsxid = '" + strGroup + "']" + (strChildren ? "/*" : "");

      if (! strMasterPath) strMasterPath = "/data/*";

      var firstReplacement = null;
      for (var j = objMaster.selectNodeIterator(strMasterPath); j.hasNext(); ) {
        var clone = j.next().cloneNode(true);
        // so that includes from includes resolve correctly
        this._fixPropsIncludeAttr(clone, strURL);

        if (firstReplacement == null) firstReplacement = clone;
        var result = objNode.getParent().insertBefore(clone, objNode);
        if (result.getNative() == null)
          this.getLog().error("insert failed");
      }

      // add children of removed node to the first replacement node
      if (firstReplacement != null) {
        for (var j = objNode.selectNodeIterator("./record"); j.hasNext(); ) {
          firstReplacement.appendChild(j.next().cloneNode(true));
        }
      }

      var result = objNode.getParent().removeChild(objNode);
      if (result.getNative() == null)
        this.getLog().error("remove failed");
    }
  } while (objNodes.size() > 0 && times++ < 6);

  // cache eval'ed values of enums
  for (var i = objXML.selectNodeIterator("//enum"); i.hasNext(); ) {
    var objNode = i.next();
    var value = objNode.getAttribute('jsxid');
    if (objNode.getAttribute("eval") !== "0")
        value = jsx3.eval(value);
    objNode.setAttribute('jsxvalue', value);
  }

  // open groups
  for (var i = objXML.selectNodeIterator("//record[record]"); i.hasNext(); ) {
    var objNode = i.next();
    objNode.setAttribute('jsxopen', '1');
    objNode.setAttribute('jsxunselectable', '1');
  }

  if (objXML._idecacheable)
    cache.setDocument(cachedDocId, objXML);
  return objXML;
},

_fixPropsIncludeAttr: function(objNode, strURL) {
  var objPathURI = new jsx3.net.URI(strURL);
  var queue = jsx3.util.List.wrap([objNode]);

  while (queue.size() > 0) {
    var node = queue.removeAt(0);

    var includePath = node.getAttribute('include');
    if (includePath)
      node.setAttribute('absinclude', objPathURI.resolve(includePath).toString());

    queue.addAll(node.selectNodes("record"));
  }
},

/**
 * {String<String>} lookup table from JSS jsxid to type
 * @private @jsxobf-clobber
 */
PROP_TYPE_INDEX: null,

/**
 * {String<Array<String>>} lookup table from type to array of jsxids
 * @private @jsxobf-clobber
 */
PROP_TYPE_GROUPS: null,

/**
 * Called once after a project loads in Builder. This method searches through all cache documents in the
 * JSX shared cache as well as the server cache for JSS documents. It then creates an index by the CDF attribute
 * <code>type</code> of all JSS properties. After this method has run once, calling
 * <code>jsx3.ide._getPropertyIdsForType()</code> returns an array of all the loaded JSS properties defined with
 * a particular type value.
 */
constructPropertyTypeIndex: function() {
  var index = (this.PROP_TYPE_INDEX = {});
  var caches = [jsx3.getSystemCache(), jsx3.getSharedCache(), jsx3.ide.PROJECT.getServer().getCache()];

  for (var k = 0; k < caches.length; k++) {
    var cache = caches[k];
    var cacheKeys = cache.keys();

    for (var i = 0; i < cacheKeys.length; i++) {
      var doc = cache.getDocument(cacheKeys[i]);
      if (doc != null) {

        if (doc.hasError()) {
          this.getLog().warn("XML property file has error: " + doc.getSourceURL());
          continue;
        }

        var recordParent = doc;
        if (doc.getAttribute("jsxnamespace") == "propsbundle")
          recordParent = doc.selectSingleNode("//locale[not(@key)]");

        if (recordParent)
          for (var j = recordParent.getChildIterator(); j.hasNext(); ) {
            var child = j.next();
            if (child.getNodeName() == "record") {
              var type = child.getAttribute("type");
              if (type) {
                var id = child.getAttribute("jsxid");
                index[id] = type;
              }
            }
          }
      }
    }
  }
  
  var groups = (this.PROP_TYPE_GROUPS = {_empty:[]});
  for (var f in index) {
    var type = index[f];
    if (groups[type] == null) groups[type] = [];
    groups[type].push(f);
  }
},

/**
 * @return {Array<String>}
 */
_getPropertyIdsForType: function(strType) {
  return this.PROP_TYPE_GROUPS[strType] || this.PROP_TYPE_GROUPS["_empty"];
},

openColorPickerMask: function(objMask) {
  objMask.suspendEditSession();

  this.getResource("colorpicker").load().when(jsx3.$F(function() {
    var picker = this.loadRsrcComponent("colorpicker", this.getServer().getRootBlock(), false);
    picker.getDescendantOfName("colorPicker").setValue(objMask.getMaskValue());
    picker.onColorPick(picker.getDescendantOfName("colorPicker").getRGB());
    picker.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
    picker._jsxmask = objMask;

    picker.getParent().paintChild(picker);

    picker.focus();
  }).bind(this));
},

_colorPickerMaskChoose: function(objEvent, picker) {
  var objMask = picker._jsxmask;

  var intRGB = picker.getDescendantOfName("colorPicker").getRGB();
  var hex = "#" + (0x1000000 + intRGB).toString(16).substring(1).toUpperCase();
  objMask.setMaskValue(hex);
  picker.doClose();
  objMask.getDescendantOfName("btnCP").focus();

  objMask.resumeEditSession();
  objMask.commitEditMask(objEvent, true);
},

_colorPickerMaskCancel: function(objEvent, picker) {
  var objMask = picker._jsxmask;
  picker.doClose();
  objMask.getDescendantOfName("btnCP").focus();
  objMask.resumeEditSession();
},

openCdfMask: function(objMask) {
  var plugIn = jsx3.ide.getPlugIn("jsx3.ide.palette.properties");
  //load the dialog mask (load it into the IDE namespace, but resolve the location of the component using the addin
  var columneditor = jsx3.IDE.getRootBlock().loadAndCache("columneditor/columneditor.xml", false, null, plugIn);

  //load the CDF profile data into the editor
  var objEditor = columneditor.getDescendantsOfType(jsx3.gui.Matrix)[0];
  var strCDF = objMask.getMaskValue();
  var objCDF = new jsx3.xml.CDF.Document.newDocument();
  if(!jsx3.util.strEmpty(strCDF)) {
    objCDF.loadXML(strCDF);
    if(objCDF.hasError()) {
      this.getLog().error("Error with cdf document. " + objCDF.getError().description);
      objCDF = new jsx3.xml.CDF.Document.newDocument();
    }
  }
  objEditor.getServer().getCache().setDocument(objEditor.getXMLId(),objCDF);

  // add events to OK and cancel buttons
  var execBtn = columneditor.getDescendantOfName("execBtn");
  execBtn.setEvent("1;",jsx3.gui.Interactive.EXECUTE);
  execBtn.subscribe(jsx3.gui.Interactive.EXECUTE, this, function(objEvent) {
        this._cdfMaskChoose(objEvent.context.objEVENT, execBtn.getAncestorOfName(columneditor.getName()));
      });

  var cancelBtn = columneditor.getDescendantOfName("cancelBtn");
  cancelBtn.setEvent("1;",jsx3.gui.Interactive.EXECUTE);
  cancelBtn.subscribe(jsx3.gui.Interactive.EXECUTE, this, function(objEvent) {
        this._cdfMaskCancel(objEvent.context.objEVENT, execBtn.getAncestorOfName(columneditor.getName()));
      });

  //add events to prioritize and deprioritize buttons
  var objBtnUp = columneditor.getDescendantOfName("ibUp");
  objBtnUp.setEvent("1;",jsx3.gui.Interactive.EXECUTE);
  objBtnUp.subscribe(jsx3.gui.Interactive.EXECUTE, this, function(objEvent) {
        var target = objEvent.target;
        if (target.emGetSession())
          this._cdfPrioritizeRow(target.getAncestorOfType(jsx3.gui.Matrix),target.emGetSession().recordId,true);
      });

  var objBtnDown = columneditor.getDescendantOfName("ibDown");
  objBtnDown.setEvent("1;",jsx3.gui.Interactive.EXECUTE);
  objBtnDown.subscribe(jsx3.gui.Interactive.EXECUTE, this, function(objEvent) {
        var target = objEvent.target;
        if (target.emGetSession())
          this._cdfPrioritizeRow(target.getAncestorOfType(jsx3.gui.Matrix),target.emGetSession().recordId,false);
      });

  //suspend edit session and paint/focus the dialog mask
  objMask.suspendEditSession();
  columneditor._jsxmask = objMask;
  columneditor.getParent().paintChild(columneditor);
  columneditor.focus();
},

/* @jsxobf-clobber */
_cdfMaskChoose: function(objEvent, columneditor) {
  var objMask = columneditor._jsxmask;
  var objEditor = columneditor.getDescendantsOfType(jsx3.gui.Matrix)[0];
  var strValue = objEditor.getXML().getXML();
  objMask.setMaskValue(strValue);
  columneditor.doClose();
  objMask.getDescendantOfName("btnTable").focus();
  objMask.resumeEditSession();
  objMask.commitEditMask(objEvent, true);
},

/* @jsxobf-clobber */
_cdfMaskCancel: function(objEvent, columneditor) {
  var objMask = columneditor._jsxmask;
  columneditor.doClose();
  objMask.getDescendantOfName("btnTable").focus();
  objMask.resumeEditSession();
},

/* @jsxobf-clobber */
_cdfPrioritizeRow: function(objMtx,strCDFId,bUp) {
  //get the selected item and move up or down
  if (!strCDFId) return;
  var objNode = objMtx.getRecordNode(strCDFId);
  if (objNode) {
    var objParentNode = objNode.getParent();
    if(bUp) {
      var objPrev = objNode.getPreviousSibling();
      if(objPrev) {
        objParentNode.insertBefore(objNode, objPrev);
        objMtx.repaintData();
      }
    } else {
      var objNext = objNode.getNextSibling();
      if(objNext) {
        objParentNode.insertBefore(objNext, objNode);
        objMtx.repaintData();
      }
    }
  }
}

});
