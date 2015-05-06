/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
jsx3.require("jsx3.gui.Block","jsx3.xml.Cacheable");

/**
 * Provides a container that maps to a CDF Document in the cache.  This
 * provides a simplified mechanism for mapping forms and blocks to CDF Documents in the XML Cache.  Instances of this class
 * can nest to point to another CDF record in the same document or can point to a CDF document of their own.
 */
jsx3.Class.defineClass("jsx3.gui.CDF", jsx3.gui.Block, [jsx3.xml.CDF,jsx3.xml.Cacheable], function(CDF, CDF_prototype) {


  var LOG = jsx3.util.Logger.getLogger(CDF.jsxclass.getName());


  /**
   * instance initializer
   * @param strName {String} unique name distinguishing this object from all other JSX GUI objects in the JSX application
   */
  CDF_prototype.init = function(strName) {
    this.jsxsuper(strName);
  };


  /**
   * No-op.
   * @param strRecordId {String} the <code>jsxid</code> attribute of the data record to redraw.
   * @param intAction {int} <code>INSERT</code>, <code>UPDATE</code>, or <code>DELETE</code>.
   */
  CDF_prototype.redrawRecord = function(strRecordId, intAction) {
    this.read(null,strRecordId);
  };


  /** @private @jsxobf-clobber */
  CDF_prototype._getMappings = function(strPCDFID) {
    //resolve which descenants are mappable
    var strCDFID = this.jsxcdfid;
    if(jsx3.util.strEmpty(strCDFID))
      this.findAncestor(function(a) {  if(!jsx3.util.strEmpty(a.jsxcdfid)) { strCDFID = a.jsxcdfid; return true; } },false);
    var mappings = [];
    CDF._getMappedDescendants(this,strCDFID,mappings,strPCDFID);
    return mappings;
  };


  /** @private @jsxobf-clobber */
  CDF._getMappedDescendants = function(objJSX,strCDFID,mappings,strPCDFID) {
    var oKids = objJSX.getChildren();
    var bakCDFID = strCDFID;
    for(var i=0;i<oKids.length;i++) {
      //exit early if the object is a CDF container with its own sub-document mapping; by definition, mapped descendants
      //must belong to the same CDF document (although they can map to different CDF Records and attributes in the same document)
      var a = oKids[i];
      if(a instanceof CDF && !(jsx3.util.strEmpty(a.jsxxmlid) && jsx3.util.strEmpty(a.jsxxmlurl) && jsx3.util.strEmpty(a.jsxxml)))
        continue;

      //override the cdfid to map to if the object implements its own value
      if(!jsx3.util.strEmpty(a.jsxcdfid))
        strCDFID = a.jsxcdfid;

      //add the mapped object if it implements jsxcdfattribute.
      if(!jsx3.util.strEmpty(a.jsxcdfattribute) && (jsx3.util.strEmpty(strCDFID) || (!jsx3.util.strEmpty(strCDFID) && (!strPCDFID || strPCDFID == strCDFID)))) {
        LOG.trace("Component: " + a + "; XPath: //record[@jsxid='" + strCDFID + "']/@" + a.jsxcdfattribute);
        mappings.push({target:a,jsxcdfid:strCDFID,jsxcdfattribute:a.jsxcdfattribute});
      }

      //recurse
      CDF._getMappedDescendants(a,strCDFID,mappings,strPCDFID);

      strCDFID = bakCDFID;
    }
  };


  CDF_prototype.paint = function() {
    this.getXML(); // for async XML
    return this.jsxsuper();
  };


  CDF_prototype.repaint = function() {
    this.read(false);
    return this.jsxsuper();
  };


  CDF_prototype.onXmlBinding = function(objEvent) {
    this.jsxsupermix(objEvent);
    this.read();
  };

  CDF_prototype.onAfterPaint = function(objGUI) {
    this.read(false);
  };


  /**
   * Updates all mapped descendants with values from the source CDF Document
   * @param bRepaint {Boolean} if <code>false</code> no repaint will be applied when setting text or values
   * @param strRecordId {String} If set, only those descendants that map to this specific CDF record will be updated.
   */
  CDF_prototype.read = function(bRepaint,strRecordId) {
    if(bRepaint !== false)
      bRepaint = true;
    var objMappings = this._getMappings(strRecordId);

    var objTrueSource = this;
    if(jsx3.util.strEmpty(this.jsxxmlid) && jsx3.util.strEmpty(this.jsxxmlurl) && jsx3.util.strEmpty(this.jsxxml))
      objTrueSource = this.findAncestor(function(a) { return !(jsx3.util.strEmpty(a.jsxxmlid) && jsx3.util.strEmpty(a.jsxxmlurl) && jsx3.util.strEmpty(a.jsxxml)); },false);

    for(var i=0;i<objMappings.length;i++) {
      var objRec = objTrueSource.getRecordNode(objMappings[i].jsxcdfid);
      var objJSX = objMappings[i].target;
      var objAtt;
      objAtt = (objRec instanceof jsx3.xml.Entity) ? objRec.getAttribute(objMappings[i].jsxcdfattribute) : null;
      LOG.trace("Component: " + objJSX + "; value to be shown (read): " + objAtt + "");
      this.setFieldValue(objJSX,objAtt,bRepaint);
    }
  };


  /**
   * Updates the source CDF document with values returned from mapped descendants
   */
  CDF_prototype.write = function() {
    var objMappings = this._getMappings();
    for(var i=0;i<objMappings.length;i++) {
      var objRec = this.getRecordNode(objMappings[i].jsxcdfid);
      if(objRec) {
        var objJSX = objMappings[i].target;
        var strValue = this.getFieldValue(objJSX);
        if(strValue == null)
          objRec.removeAttribute(objMappings[i].jsxcdfattribute);
        else if (objRec.getAttribute(objMappings[i].jsxcdfattribute) != strValue)
          objRec.setAttribute(objMappings[i].jsxcdfattribute,strValue);
      }
    }
  };


  CDF_prototype.getFieldValue = function(objJSX) {
    if(!objJSX.instanceOf("jsx3.gui.Form")) {
      return objJSX.getText();
    } else if (jsx3.gui.RadioButton && objJSX.instanceOf("jsx3.gui.RadioButton")) {
      return objJSX.getGroupValue();
    } else {
      return objJSX.getValue();
    }
  };


  CDF_prototype.setFieldValue = function(objJSX,vntValue,bRepaint) {
    if(!objJSX.instanceOf("jsx3.gui.Form")) {
      objJSX.setText(vntValue || "",bRepaint);
    } else if (jsx3.gui.RadioButton && objJSX.instanceOf("jsx3.gui.RadioButton")) {
      objJSX.setGroupValue(vntValue);
    } else {
      objJSX.setValue(vntValue);
    }
  };


  /**
   * Sets the CDF ID of the record to map to. Updates all mapped descendants with values from the newly created mapping.
   * @param strCDFId {String} If not set, the CDF Id used by the nearest ancestor of type <code>jsx3.gui.CDF</code> will be used.
   */
  CDF_prototype.setCDFId = function(strCDFId) {
    this.jsxcdfid = strCDFId;
    this.read();
  };


  /**
   * Returns the CDF ID of the record to map to.
   * @return {String}
   */
  CDF_prototype.getCDFId = function() {
    return this.jsxcdfid;
  };


});