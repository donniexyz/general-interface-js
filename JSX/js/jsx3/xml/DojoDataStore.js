/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Provides access to Dojo data store through the CDF interface.
 */
jsx3.Class.defineClass("jsx3.xml.DojoDataStore", null, [jsx3.xml.CDF], function(DojoDataStore, DojoDataStore_prototype) {

  var CDF = jsx3.xml.CDF;

  /** @private @jsxobf-clobber */
  DojoDataStore._LOG = jsx3.util.Logger.getLogger(CDF.jsxclass.getName());

  /**
   * The instance initializer.
   * @param store {Object} the Dojo data store object.
   */
  DojoDataStore_prototype.init = function(store){
    this.store = store;
  };

  // create a wrapper for records to be accessed via the XML entity interface
  function createNode(store, item) {
    var record = new jsx3.xml.DataStoreItem();
    record.item = item;
    record.store = store;
    return record;
  }

  DojoDataStore_prototype.insertRecord = function(objRecord, strParentRecordId, bRedraw) {
    // TODO: handle parent id
    var item = this.store.newItem(objRecord);
    if(bRedraw) {
      this.redrawRecord(this.store.getIdentity(item), CDF.INSERT);
    }
    return createNode(this.store, item);
  };

  DojoDataStore_prototype.insertRecordNode = function(objRecordNode, strParentRecordId, bRedraw) {
    throw new jsx3.Exception("Not supported");
  };

  // performs an operation on the record accessed by the given id
  function operationById(store, id, operation) {
    store.fetchItemByIdentity({
      identity: id, 
      onItem: function(item) {
        operation(store, item);
      }
    });
  }

  DojoDataStore_prototype.insertRecordProperty = function(strRecordId,strPropName,strPropValue,bRedraw) {
    operationById(this.store, strRecordId, function(store, item){
      store.setValue(item, strPropName, strPropValue);
    });
    if(bRedraw) {
      this.redrawRecord(strRecordId, CDF.UPDATE);
    }

    //return handle to self
    return this;
  };

  DojoDataStore_prototype.deleteRecordProperty = function(strRecordId,strPropName,bRedraw) {
    //get xml document that holds the data records
    operationById(this.store, strRecordId, function(store, item){
      store.unsetAttribute(item, strPropName);
    });
    if(bRedraw) {
      this.redrawRecord(strRecordId, CDF.UPDATE);
    }
  };

  DojoDataStore_prototype.adoptRecord = function(strSourceId, strRecordId, strParentRecordId, bRedraw) {
    throw new jsx3.Exception("Not supported");
  };

  DojoDataStore_prototype.insertRecordBefore = function(objRecord, strSiblingRecordId, bRedraw) {
    // dojo data stores do not have a notion of ordering
    return this.insertRecord(objRecord, null, bRedraw);
  };

  DojoDataStore_prototype.adoptRecordBefore = function(strSourceId, strRecordId, strSiblingRecordId, bRedraw) {
    return this.adoptRecord(strSourceId, strRecordId, strSiblingRecordId, bRedraw);
  };

  DojoDataStore_prototype.deleteRecord = function(strRecordId,bRedraw) {
    operationById(this.store, strRecordId, function(store, item) {
      store.deleteItem(item);
    });
    if(bRedraw) {
      this.redrawRecord(strRecordId, CDF.DELETE);
    }
  };

  DojoDataStore_prototype.getRecord = function(strRecordId) {
    var record;
    operationById(this.store, strRecordId, function(store, item) {
      record = {};
      var attrs = store.getAttributes(item);
      for (var i = 0; i < attrs.length; i++) {
        record[attrs[i]] = store.getValue(item, attrs[i]);
      }
    });
    return record;
  };

  DojoDataStore_prototype.getRecordIds = function() {
    var arrayIds = [];
    var store = this.store;
    store.fetch({
      syncMode: true,
      query: this.query,
      onComplete: function (items) {
        var item, i = 0;
        while (item = items[i]) {
          arrayIds[i++] = store.getIdentity(item);
        }
      }
    });
    return arrayIds;
  };

  DojoDataStore_prototype.getRecordNode = function(strRecordId) {
    var record;
    operationById(store, strRecordId, function(store, item) {
      record = createNode(store, item);
    });
    return record;
  };

  DojoDataStore_prototype.resetData = function(bRepaint) {
    throw new jsx3.Exception("Not supported");
  };

  DojoDataStore_prototype.reloadFromSource = function(bSystem) {
    // no-op
  };

  DojoDataStore_prototype.redrawRecord = function() {
    // no-op
  };

  DojoDataStore_prototype.assignIds = function() {    
    // no-op, this should already be handled by the data store
  };

  DojoDataStore_prototype.getKey = function() {
    throw new jsx3.Exception("Not supported");
  };

  DojoDataStore_prototype.newDocument = function() {
    throw new jsx3.Exception("Not supported");
  };

  DojoDataStore_prototype.getVersion = function() {
    return 1;
  };

  DojoDataStore_prototype.convertProperties = function(objProps, arrProps, bUnion) {
    throw new jsx3.Exception("Not supported");
  };

  DojoDataStore_prototype.hasError = function() {
    return false;
  };

  DojoDataStore_prototype.getNamespaceURI = function() {
    return null;
  };

  DojoDataStore_prototype.getRootNode = function() {
    return null;
  };

  DojoDataStore_prototype.getNative = function() {
    throw new jsx3.Exception("Not supported");
  };
  
});

/**
 * A subclass of <code>jsx3.xml.Document</code> that implements the CDF interface. This class simply exposes the CDF
 * convenience methods on an XML document.
 * @package
 */
jsx3.Class.defineClass("jsx3.xml.DataStoreItem", jsx3.xml.Entity, null, function(DataStoreItem, DataStoreItem_prototype) {

  DataStoreItem_prototype.init = function(){
  };

  DataStoreItem_prototype.getAttribute = function(name) {
    return this.store.getValue(this.item, name);
  };

  DataStoreItem_prototype.getAttributeNames = function() {
    return this.store.getAttributes();
  };
});
