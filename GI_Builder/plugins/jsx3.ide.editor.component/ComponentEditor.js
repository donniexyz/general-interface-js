/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _tab _url _unsaved _server _mode _openNewTab _setTabName _selection

jsx3.Class.defineClass("jsx3.ide.ComponentEditor", jsx3.ide.Editor, null, function(ComponentEditor, ComponentEditor_prototype) {

  var Model = jsx3.app.Model;

  ComponentEditor_prototype._mode = "component";

  ComponentEditor_prototype.render = function(objContainer) {
    var xml = this.getPlugIn().getResource("editor").getData();
    return objContainer.loadXML(xml, false, this.getPlugIn());
  };

  ComponentEditor_prototype.loadFromFile = function() {
    jsx3.sleep(this._loadServer, null, this);
  };

  ComponentEditor_prototype.getPlugIn = function() {
    return jsx3.IDE.ComponentEditorPlugin;
  };

  ComponentEditor_prototype._getComponentPath = function() {
    var objFile = this.getOpenFile();
    if (!objFile || !objFile.isFile())
      objFile = jsx3.ide.getBuilderRelativeFile("templates/untitled.jsx");

    return jsx3.ide.PROJECT.getDirectory().relativePathTo(objFile);
  };

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._loadServer = function() {
    var container = this.getContent().getDescendantOfName('jsxtab_componenteditor_main').getRendered();

    var path = this._getComponentPath();
    var server = new jsx3.ide.ServerView(jsx3.ide.SERVER, container, path);
    this._server = server;

    // reset the namespace reference using the server ALIAS provided by the controller
    // this must be called before server.load() so that the onAfterDeserialize block has access to the server namespace
    server.activateView();

    var onLoad = jsx3.$F(this._loadServer2).bind(this, [server]);
    jsx3.sleep(function() {
      server.load(onLoad);
    })
  };

  ComponentEditor_prototype._loadServer2 = function(server) {
    // force multiple children into a single root block
    var rootNodes = server.getBodyBlock().getChildren();
    if (rootNodes.length > 1) {
      rootNodes = rootNodes.concat();
      var root = new jsx3.gui.Block("root", null, null, "100%", "100%");
      root.setRelativePosition(jsx3.gui.Block.RELATIVE);
      server.getBodyBlock().setChild(root);
      root.setPersistence(Model.PERSISTEMBED);
      for (var i = 0; i < rootNodes.length; i++) {
        var rootNode = rootNodes[i];
        if (rootNode.getPersistence() == Model.PERSISTNONE)
          rootNode.setPersistence(Model.PERSISTEMBED);
        root.adoptChild(rootNode);
      }
      this.setDirty(true);
      
      jsx3.IDE.alert("Component Modified", "General Interface Builder does not support multiple root objects. " +
          "The root objects of this component file have been moved under a single root block. Save the component file " + 
          "to accept these changes.");
    }
    
    //subscribe this editor to the cache and dom controllers for the server, so notified appropriately
    server.getDOM().subscribe(jsx3.app.DOM.EVENT_CHANGE, jsx3.$F(function() {
      this.getPlugIn().publish({subject:"domChanged", editor:this});
    }).bind(this));
    server.getCache().subscribe(jsx3.app.Cache.CHANGE, jsx3.$F(function() {
      this.getPlugIn().publish({subject:"cacheChanged", editor:this});
    }).bind(this));
    
    try {
      server.paint();
    } finally {
      // wrap in finally so that exception in paint method doesn't prevent palettes from activating
      this.getPlugIn().publish({subject:"domChanged", editor:this});
      
      this._activateOrDeactivate();
      this.updateComponentStats(server.getStats());

      var defaultSelection = server.getRootObjects()[0];
      if (defaultSelection)
        this.setSelection([defaultSelection]);
    }

    var objView = this.getActiveView();
    if (objView && objView.onShowMe)
      objView.onShowMe();
  };

  ComponentEditor_prototype.activate = function() {
    var server = this.getServer();
    if (! server) return;

    // reset the namespace reference using the server ALIAS provided by the controller
    server.activateView();
    this.onShowComponentMode();
  };

  ComponentEditor_prototype.deactivate = function() {
    if (this._server)
      this._server.deactivateView();
  };

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._readFromJSX = function(objJSX) {
    //reads the profile properties of the JSX GUI object, '@obj', and returns as a hash
    var objP = {};
    objP.icon = objJSX.getMetaValue('icon');
    objP.name = objJSX.getMetaValue('name');
    objP.description = objJSX.getMetaValue('description');
    objP.onafter = objJSX.getMetaValue('onafter');
    objP.onbefore = objJSX.getMetaValue('onbefore');
    objP.unicode = objJSX.getMetaValue('unicode');
    return objP;
  };

  ComponentEditor_prototype.preSaveCheck = jsx3.$Y(function(cb) {
    // check for illegal async children
    if (this._checkIllegalAsync(this.getServer().getBodyBlock())) {
      jsx3.IDE.confirm(null,
          "One or more objects in the component file <b>" + this.getTitle() + "</b> that are referenced asynchronously cannot be referenced asynchronously. Select Continue to reference these objects synchronously and save the component file.",
          function(d) { d.doClose(); cb.done(true); },
          function(d) { d.doClose(); cb.done(false); },
          "Continue", "Cancel", 1, null, null, {width:300, height:150});
    } else {
      cb.done(false);
    }
  });

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._checkIllegalAsync = function(objJSX) {
    var children = objJSX.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.getPersistence() == Model.PERSISTREFASYNC && i < children.length - 1)
        return true;
      if (this._checkIllegalAsync(child))
        return true;
    }
    return false;
  };

  ComponentEditor_prototype.save = function(objFile) {
    var didSave = false;
    var isExpert = false;

    //if the user is in expert view, try to commit their changes before continuing (is their XML even valid?)
    var objView = this.getActiveView();
    if (objView && objView.getName() == "mode_source") {
      isExpert = true;
      if (objView.isDirty()) {
        if (!this._cascadeExpertChanges()) return false;
      }
    }

    //is there an active file to save?
    objFile = objFile || this.getOpenFile();
    if (objFile) {
      var objBody = this.getServer().getBodyBlock();
      var firstChild = objBody.getChild(0);
      
      // save component profile
      var profileProps = {};
      var profileTab = this.getContent().getDescendantOfName("mode_profile", false, false);
      if (profileTab != null && profileTab._inited) {
        profileProps = profileTab.getProfileProperties();
      } else if (firstChild != null) {
        //profile tab isn't open (or the save action is called from the read/write 'expert' editor), but the first child of the body exists, so read from it
        profileProps = this._readFromJSX(firstChild);
      }

      var objXML = null;
      if (firstChild != null) {
        //call handler function to save the contents of the active editor (the active JSXBODY)
        objXML = firstChild.toXMLDoc(profileProps);
      } else {
        profileProps.children = true;
        objXML = objBody.toXMLDoc(profileProps);
      }

      objXML = this.formatXML(objXML);
      if (jsx3.ide.writeUserXmlFile(objFile, objXML)) {
        this.setDirty(false);
        didSave = true;
        
        if (objBody.getChildren().length > 1)
          this.getPlugIn().getLog().warn("Saved component with " + objBody.getChildren().length + " root objects. Only the first object was saved.");
      }

      if (didSave && isExpert)
        objView.onShowMe();
    } else {
      this.getPlugIn().getLog().error("can't save file to blank url");
    }

    if (didSave)
      this.publish({subject:"saved"});
    return didSave;
  };
  
  ComponentEditor.CDATA_FIELDS = ["name", "icon", "description", "onBeforeDeserialize", "onAfterDeserialize"];
  
  ComponentEditor_prototype.formatXML = function(objXML) {
    objXML = jsx3.ide.makeXmlPretty(objXML, true);

    if (!jsx3.CLASS_LOADER.IE) {
      var serPath = "/jsx1:serialization/";
      objXML.setSelectionNamespaces("xmlns:jsx1='" + jsx3.app.Model.CURRENT_VERSION + "'");
      for (var i = 0; i < ComponentEditor.CDATA_FIELDS.length; i++) {
        var f = ComponentEditor.CDATA_FIELDS[i];

        var node = objXML.selectSingleNode(serPath + "jsx1:" + f);
        if (node) {
          var children = node.getChildIterator(true);
          var nodeData = '';
          while (children.hasNext()) {
            var child = children.next();
            nodeData += child.getValue();
          }
          
          if (nodeData.length > 0) {
            node.removeChildren();
            node.appendChild(node.createNode(4, nodeData));
          }
        }
      }
    }

    return objXML;
  };

  ComponentEditor_prototype.revert = function() {
    //profile tab need re-initialization  
    var profileTab = this.getContent().getModePane().getChild("mode_profile");
    if (profileTab)
      profileTab._inited = false;
    this.getServer().destroy();
    this._server = null;
    this.jsxsuper();
  };

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._activateOrDeactivate = function() {
    var server = this._server;
    var activeEditor = jsx3.ide.getActiveEditor();

    if (this == activeEditor) {
      this.activate();
    } else {
      var activeServer = activeEditor.getServer();
      if (activeServer instanceof ComponentEditor)
        activeServer.activateView();
      else
        server.deactivateView();
    }
  };

  ComponentEditor_prototype.getServer = function() {
    return this._server;
  };

  ComponentEditor_prototype.onBeforeSetMode = function(strNewMode) {
    var strMode = this.getMode();
    if (strMode == "source") {
      var oldView = this.getContent().getModePane().getChild("mode_source");
      if (oldView.isDirty()) {
        if (! this._cascadeExpertChanges())
          return false;
      }
    } else if (strMode == "profile") {
      var objJSX = this.getServer().getBodyBlock().getChild(0);
      if (objJSX) {
        var oldView = this.getContent().getModePane().getChild("mode_profile");
        var props = oldView.getProfileProperties();

        for (var f in props) {
          objJSX.setMetaValue(f, props[f]);
        }
      }
    }
  };

  ComponentEditor_prototype.onSetMode = function(objContent, strOldMode) {
    objContent.doShow();
  };

  /** @private @jsxobf-clobber */
  ComponentEditor_prototype._cascadeExpertChanges = function() {
    //get the XML the user has been manually editing; load to check its structural validity
    var objView = this.getActiveView();
    var doc = new jsx3.xml.Document();
    doc.loadXML(objView.getTextValue());

    //set success/error flags
    var success = false;
    var error = doc.getError();

    //the XML is structurally valid
    if (error.code == "0") {
      error = null;

      var server = this.getServer();
      var parent = server.getBodyBlock();
      var oldChild = parent.getChildren();
      var oldLength = oldChild.length;

      try {
        this.setSelection([]);
        
        //deserialize the new content
        var children = parent.loadXML(doc, false);
        if (jsx3.$A.is(children)) {
          for (var i = 0; i < children.length; i++)
            children[i].setPersistence(Model.PERSISTEMBED);
        } else {
          children.setPersistence(Model.PERSISTEMBED);
        }

        //remove the existing content (decrement to preserve index integrity)
        for (var i = oldLength-1; i >= 0; i--) {
          parent.removeChild(oldChild[i]);
        }

        // set profile to dirty
        var contentBlock = this.getContent().getModePane();
        var profileTab = contentBlock.getChild("mode_profile");
        if (profileTab != null)
          profileTab._inited = false;

        success = true;
      } catch (e) {
        //set reference to error object
        error = e;

        //remove any new children that may have been deserialized (perhaps it failed after adding a few children)
        var newLength;
        if ((newLength = parent.getChildren().length) > oldLength) {
          for (var i = newLength-1; i >= oldLength; i--) {
            parent.removeChild(parent.getChild(i));
          }
        }
      }
      
      parent.repaint();
    }

    if (!success) {
      jsx3.IDE.alert("Alert", "Changes made to the XML source caused the following XML parsing error: <br/><br/><b>" + error.description + "</b><br/><br/> Please fix the error or revert to the last saved version before continuing.", null, null, {width: 400, height: 225});
    }

    return success;
  };

  ComponentEditor_prototype.getActiveView = function() {
    var contentBlock = this.getContent().getModePane();
    return contentBlock ? contentBlock.getChild(contentBlock.getSelectedIndex()) : null;
  };

  ComponentEditor_prototype.supportsReload = function() {
    return true;
  };

  ComponentEditor_prototype.onShowComponentMode = function() {
    // HACK: if the component is reloaded while the component view is hidden, the box profile may show dimensions {0,0}
    var s = this.getServer();
    var root = s.getRootBlock().getRendered();
    if (root && (root.offsetWidth == 0 || root.offsetHeight == 0))
      s.onResizeParent();
  };

/*
  ComponentEditor.MODE_TO_NAME = {
    component: {name:'jsxtab_componenteditor_maintab', palettes:true},
    source: {name:'component_xmlwr', rsrc:'mode_xmlrw', palettes:false},
    sourcefmt: {name:'component_asxml', rsrc:'mode_xmlro', palettes:false},
    html: {name:'component_ashtml', rsrc:'mode_html', palettes:false},
    profile: {name:'component_profile', rsrc:'mode_profile', palettes:false}
  };

*/
  ComponentEditor_prototype.refreshStats = function() {
    // create a div to put the dummy server in
    var testDiv = document.createElement("div");
    testDiv.style.display = "none";
    document.getElementsByTagName("body")[0].appendChild(testDiv);

    // serialize the current content
    var objBody = this.getServer().getBodyBlock();
    var firstChild = objBody.getChild(0);

    var profileProps = {};
    if (firstChild) {
      profileProps = this._readFromJSX(firstChild);
    } else {
      profileProps.children = true;
    }

    var objXML = (firstChild || objBody).toXMLDoc(profileProps);
    objXML = this.formatXML(objXML);

    // create a dummy server view
    var server = new jsx3.ide.ServerView(jsx3.ide.SERVER, testDiv, objXML);
    server.load();
    server.paint();

    this.updateComponentStats(server.getStats());

    testDiv.parentNode.removeChild(testDiv);
    server.destroy();
  };

  ComponentEditor.COMPONENT_EDITOR_STATS_SPY = '<span style="white-space:nowrap;">Component File Size / Time to Load / DOM Node Count / Time to Paint / HTML Size</span>';

  ComponentEditor._CES_MF = new jsx3.util.MessageFormat('{0} KB <span style="color:#666666;">/</span> {2} s <span style="color:#666666;">/</span> {1,number,integer} <span style="color:#666666;">/</span> {3} s <span style="color:#666666;">/</span> {4} KB');
  ComponentEditor._CES_NF1 = new jsx3.util.NumberFormat("0.0");
  ComponentEditor._CES_NF2 = new jsx3.util.NumberFormat("0");

  ComponentEditor_prototype.updateComponentStats = function(stats) {
    var pane = this.getContent().getDescendantOfName("compeditorstats");

    var size = stats.size / 1024;
    size = (size < 9.5 ? ComponentEditor._CES_NF1 : ComponentEditor._CES_NF2).format(size);
    var objcount = stats.objcount;
    var load = stats.unmarshal / 1000;
    load = (load < 9.5 && load > 0.05 ? ComponentEditor._CES_NF1 : ComponentEditor._CES_NF2).format(load);
    var paint = stats.paint / 1000;
    paint = (paint < 9.5 && paint > 0.05 ? ComponentEditor._CES_NF1 : ComponentEditor._CES_NF2).format(paint);
    var html = stats.html / 1024;
    html = (html < 9.5 ? ComponentEditor._CES_NF1 : ComponentEditor._CES_NF2).format(html);

    pane.setText(ComponentEditor._CES_MF.format(size, objcount, load, paint, html), true);
  };

  /** ON TP DROP *******************************************/
  ComponentEditor_prototype.onTPDrop = function(objEvent, bCtrl) {
    //called when mouseup occurs on the tabbed pane edit region; processes potential drop action by checking if this is a system drag/drop (dragtype will be JSX_GENERIC)
    if (jsx3.EventHelp.DRAGTYPE == "JSX_GENERIC") {
      var editor = jsx3.ide.getActiveEditor();
      if (editor != null && jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor) {
        var bodyBlock = editor.getServer().getBodyBlock();
        var objTarget = jsx3.html.getJSXParent(objEvent.srcElement());

        if (objTarget && objTarget.findAncestor(function(x) { return x == bodyBlock; }, true) != null) {
          var strJSXSourceId = jsx3.EventHelp.JSXID.getId();
          var strParentRecordId = objTarget.getId();
          var strRecordIds = jsx3.EventHelp.getDragIds();
          this.onDomDrop(strJSXSourceId, strParentRecordId, strRecordIds, jsx3.IDE.getJSXByName("jsxdom"),
              bCtrl, false, true);
        }
      }
    }

    return false;
  };


  ComponentEditor_prototype.onDomDrop = function(strJSXSourceId, strParentRecordId, strRecordIds, objDomTree,
                                bCtrl, bInsertBefore, bStageDrop, bConfirm) {
    //get JavaScript object representation of the record that was just dropped
    var bSuccess = false;
    var objCurParent = jsx3.GO(strJSXSourceId);
    if (objCurParent == null || ! objCurParent.instanceOf(jsx3.xml.CDF)) return;

    //get handle to DOM object that will be the parent for either the adoption or deserialization event
    var objJSXParent = jsx3.GO(strParentRecordId);
    if (objJSXParent == null) objJSXParent = jsx3.ide.getActiveServer().getBodyBlock();

    //make sure that the object receiving the drop has the correct persistence profile (referenced includes can't accept drop events)
    if (strParentRecordId == strJSXSourceId) {
      //happens when a tree in the stage implements a drop listener; stops adoption errors
    } else if (objJSXParent.getPersistence() == jsx3.app.Model.PERSISTREF || objJSXParent.getPersistence() == jsx3.app.Model.PERSISTREFASYNC) {
      jsx3.ide.LOG.error("The drop could not be processed, because the receiving element is a referenced component and is uneditable within the current context.");
    } else {
      var bChildOfRoot = objJSXParent == objJSXParent.getServer().getBodyBlock();

      if (!bConfirm && bChildOfRoot && objJSXParent.getChildren().length > 0) {
        jsx3.IDE.confirm(null, "Saving multiple root objects is not supported. Would you like to create a root block and " +
            "add the current root object and this object as its children?",
            jsx3.$F(function(d) {
              d.doClose();
              var server = objJSXParent.getServer();
              this._createNewRootBlock(server);
              this.onDomDrop(strJSXSourceId, server.getBodyBlock().getChild(0).getId(),
                  strRecordIds, objDomTree, bCtrl, bInsertBefore, bStageDrop);
            }).bind(this), null, null, null, 1,
            jsx3.$F(function(d) {
              d.doClose();
              this.onDomDrop(strJSXSourceId, strParentRecordId, strRecordIds, objDomTree, bCtrl,
                  bInsertBefore, bStageDrop, true);
            }).bind(this), "Ignore");
        return false;
      }

      if (objCurParent == objDomTree) {
        for (var i = 0; i < strRecordIds.length; i++) {
          var strRecordId = strRecordIds[i];
          if (strParentRecordId == strRecordId) continue;

          var objChild = jsx3.GO(strRecordId);
          // no error as this commonly happens just ignore when a node is dropped on itself
          if (this._isDescendant(objJSXParent, objChild)) continue;

          // need to set the other editor dirty as well
          if (objChild.getServer() != objJSXParent.getServer()) {
            var otherEditor = jsx3.ide.getEditorForJSX(objChild);
            if (objChild.getPersistence() != jsx3.app.Model.PERSISTNONE)
              otherEditor.setDirty(true);
          }

          // if destination is as a root node, then change persistence to embed
          if (bChildOfRoot && objChild.getPersistence() != jsx3.app.Model.PERSISTEMBED)
            objChild.setPersistence(jsx3.app.Model.PERSISTEMBED);

          var result = bInsertBefore ?
                       objJSXParent.getParent().insertBefore(objChild, objJSXParent, true) :
                       objJSXParent.adoptChild(objChild, true);
          if (result !== false) {
            if (bStageDrop)
              this._moveNewComponentToProperPlace(objChild);
            bSuccess = true;
          }
        }
      } else if (objCurParent.getName() == "ide_component_libs_tree" ||
                 objCurParent.getName() == "ide_component_libs_user_tree") {
        var objRecord = objCurParent.getRecord(strRecordIds[0]);

        //get the path for this object
        var myPath = objRecord.path;
        var objResolver = jsx3.net.URIResolver.getResolver(myPath);

        // do not allow ref persistence if this is a parent of ROOT
        // user dragged from the component prototype libraries; check the drag type, so we get the persistence correct
        var persist = jsx3.app.Model.PERSISTEMBED;

        if (bCtrl && !bChildOfRoot) {
          persist = jsx3.app.Model.PERSISTREF;
        } else {
          if (objResolver)
            myPath = jsx3.ide.SERVER.relativizeURI(jsx3.net.URIResolver.DEFAULT.resolveURI(myPath), true);
        }

        var objChild = null, attemptedParent = objJSXParent;
        if (bInsertBefore) {
          attemptedParent = objJSXParent.getParent();
          objChild = attemptedParent.load(myPath, false);
          if (objChild)
            attemptedParent.insertBefore(objChild, objJSXParent, true);
        } else {
          objChild = objJSXParent.load(myPath);
        }

        if (!objChild) {
          jsx3.ide.LOG.error("The component was not added to the stage because the object that it was dropped on, " +
                             attemptedParent + ", rejected it.");
          return false;
        }

        //no error check, just call 'load' for now; persist per the drop (ctrl or not); the user can use a bound context menu to modify this relationship
        jsx3.$A(objChild).each(function(e){
          e.setPersistence(persist);
        });

        if (objChild !== false) {
          if (bStageDrop)
            this._moveNewComponentToProperPlace(objChild);

          bSuccess = true;
          jsx3.ide.maybeSelectNewDom([objChild], objDomTree);
        }
      } else if (objCurParent.getName() == "ide_component_libs_online_list") {
        var objRecord = objCurParent.getRecord(strRecordIds[0]);
        var Document = jsx3.xml.Document;

        //get the path for this object
        var myId = objRecord.jsxid;
        var doc = new Document();
        doc.setAsync(true);

        var self = this;
        var doAsync = function(objEvent) {
          var objXML = objEvent.target;
          var strEvtType = objEvent.subject;
          var componentId = objXML._prototypeId;

          delete objXML._prototypeId;
          objXML.unsubscribe("*", doAsync);

          if (strEvtType == Document.ON_RESPONSE) {
            var objChild = null, attemptedParent = objJSXParent;
            if (bInsertBefore) {
              attemptedParent = objJSXParent.getParent();
              objChild = attemptedParent.loadXML(objXML, false);
              if (objChild)
                attemptedParent.insertBefore(objChild, objJSXParent, true);
            } else {
              objChild = objJSXParent.loadXML(objXML);
            }

            if (!objChild) {
              jsx3.ide.LOG.error("The component was not added to the stage because the object that it was dropped on, " +
                                 attemptedParent + ", rejected it.");
              return;
            }

            if (objChild !== false) {
              if (bStageDrop)
                self._moveNewComponentToProperPlace(objChild);

              bSuccess = true;
              jsx3.ide.maybeSelectNewDom([objChild], objDomTree);
            }

            // call on-change event to clear drag mask
            jsx3.EventHelp.reset();

            if (bSuccess)
              jsx3.ide.getActiveEditor().setDirty(true);
          } else if (strEvtType == Document.ON_TIMEOUT) {
            jsx3.ide.LOG.error("The component download timed out");
          } else if (strEvtType == Document.ON_ERROR) {
            jsx3.ide.LOG.error("The component download encountered an error");
          }
        };

        doc.subscribe('*', doAsync);
        doc._prototypeId = myId;
        doc.load(jsx3.ide.getPlugIn('jsx3.ide.palette.prototypes').uri.prototypeRoot + myId + '.' + 'component');

        return false;
      }

      // call on-change event to clear drag mask
      jsx3.EventHelp.reset();

      if (bSuccess)
        jsx3.ide.getActiveEditor().setDirty(true);
    }

    //return false; this stops the CDF controller from doing a true transfer, which would acutally remove the prototype from its source tree
    return false;
  };

  ComponentEditor_prototype._createNewRootBlock = function(objServer) {
    // force multiple children into a single root block
    var bodyBlock = objServer.getBodyBlock();
    var rootNodes = bodyBlock.getChildren().concat();

    var root = new jsx3.gui.Block("root", null, null, "100%", "100%");
    root.setRelativePosition(jsx3.gui.Block.RELATIVE);
    bodyBlock.setChild(root);
    root.setPersistence(jsx3.app.Model.PERSISTEMBED);

    for (var i = 0; i < rootNodes.length; i++) {
      var rootNode = rootNodes[i];
      if (rootNode.getPersistence() == jsx3.app.Model.PERSISTNONE)
        rootNode.setPersistence(jsx3.app.Model.PERSISTEMBED);
      root.adoptChild(rootNode);
    }

    bodyBlock.paintChild(root);
  };

  /**
   * When a component is dropped on the stage, we may want to post-process where it is actually allowed to be dropped.
   */
  ComponentEditor_prototype._moveNewComponentToProperPlace = function(objJSX) {
    // move dialogs dropped on stage to JSXBODY
    if (objJSX instanceof jsx3.gui.Dialog) {
      var block = objJSX.findAncestor(function(x){ return x.getClass().equals(jsx3.gui.Block.jsxclass); });
      if (objJSX.getParent() != block) {
        block.adoptChild(objJSX);
        var body = objJSX.getServer().getBodyBlock();
        if (block == body) {
          objJSX.setPersistence(jsx3.app.Model.PERSISTNONE);
        }
      }
    }
  };

  ComponentEditor_prototype._isDescendant = function(child,parent) {
    //called by ondomdrop; makes sure a child doesn't adopt a parent (causes infinite loop and is likewise stupid)
    var fn = function(x) {return x == parent;};
    return (child.findAncestor(fn, false) != null);
  };

  /** DO DOM CLICK ****************************************************/
  ComponentEditor_prototype.doDomClick = function(objEvent) {
    //called by ctrl+click event within the stage/dev area
    var objJSX = jsx3.html.getJSXParent(objEvent.srcElement());
    if (jsx3.gui.isMouseEventModKey(objEvent) && objJSX) {
      this.setSelection([objJSX]);
    }
  };


  /** DO RECYCLE *******************************/
  /*
   * ? doRecycle()      --called when user clicks the menu item to 'recycle' the JSX object corresponding to the currently-selected IDE dom tree
   * @ strId (OPTIONAL)     --(String) id of item to recycle if not the current item in the recycle bin
   * ! returns        --(null)
   */
  ComponentEditor_prototype.doRecycle = function(strId, bConfirmed) {
  //  jsx3.ide.LOG.warn("doRecycle ids:" + strId);
    // make sure valid object to delete
    var objJSX = jsx3.ide.getForIdOrSelected(strId);
  //  jsx3.ide.LOG.warn("doRecycle obj:" + objJSX);
    if (objJSX.length == 0) return;

    // check that we are confirmed if necessary
    var settings = jsx3.ide.getIDESettings();
    if (settings.get('prefs', 'builder', 'domdeletewarn') && !bConfirmed) {
      var names = new Array(objJSX.length);
      for (var i = 0; i < objJSX.length; i++)
        names[i] = objJSX[i].getName();

      jsx3.IDE.confirm(
        "Confirm Recycle",
        "Recycle object(s): <b>" + names.join(", ") + "</b>?",
        jsx3.$F(function(d) {d.doClose(); this.doRecycle(strId, true);}).bind(this),
        null,
        "Recycle",
        "Cancel"
      );
      return;
    }

    //get handle to the recycle bin
    var objBin = jsx3.ide.getRecycleBin();

    // Select the previous sibling of the single object to delete, or the parent if no other sibling available
    if (objJSX.length == 1) {
      var objJSXParent = objJSX[0].getParent();
      var intIndex = objJSX[0].getChildIndex();
      this.setSelection([objJSXParent.getChild(intIndex - 1) || objJSXParent.getChild(intIndex + 1) ||  objJSXParent]);
    } else {
      this.setSelection([]);
    }

    var objEditor = jsx3.ide.getEditorForJSX(objJSX[0]);

    //TO DO: track active element in the DOM; find old parent for selection
    //get handle to parent container and select it, since its child is about to be removed
    var parentIndex = {};
    for (var i = 0; i < objJSX.length; i++) {
      var objJSXParent = objJSX[i].getParent();

      //bind ref to parent id, so this item can be restored
      objJSX[i]._jsxformerparentid = objJSXParent.getId();

      if (! parentIndex[objJSXParent.getId()])
        parentIndex[objJSXParent.getId()] = [objJSXParent];

      parentIndex[objJSXParent.getId()].push(objJSX[i]);
    }

    for (var f in parentIndex) {
      var arr = parentIndex[f];
      objBin.adoptChildrenFrom(arr[0], arr.slice(1), false, true);
    }

    // Set dirty, but depending on the persistence of the recycled objects
    if (!this.isDirty()) {
      if (jsx3.$A(objJSX).find(function(e) { return e.getPersistence() != jsx3.app.Model.PERSISTNONE; }))
        this.setDirty(true);
    }

    this.getPlugIn().publish({subject:"recycled", editor:objEditor, o: objJSX});
  };


  /** DO CLONE *********************************************/
  ComponentEditor_prototype.cloneJSX = function(strRecordId) {
    var objJSX = jsx3.ide.getForIdOrSelected(strRecordId);
    var clones = new Array(objJSX.length);
    var allParents = [];
    var parentIds = {};

    for (var i = 0; i < objJSX.length; i++) {
      var intPersist = objJSX[i].getPersistence();

      //clone the object and bind a ref to the source url in case user wants
      var objClone = objJSX[i].doClone(intPersist, 2);

      if (objJSX[i].getMetaValue("url") != null)
        objClone.setMetaValue("url", objJSX[i].getMetaValue("url"));

      // set dirty
      if (intPersist != jsx3.app.Model.PERSISTNONE)
        jsx3.ide.getActiveEditor().setDirty(true);

      var objParent = objJSX[i].getParent();
      objParent.insertBefore(objClone, objParent.getChild(objJSX[i].getChildIndex() + 1), false);
      objClone.setPersistence(intPersist);

      if (! parentIds[objParent.getId()]) {
        allParents.push(objParent);
        parentIds[objParent.getId()] = 1;
      }

      clones[i] = objClone;
    }

    for (var i = 0; i < allParents.length; i++)
      allParents[i].repaint();

    //return handle to newly cloned item
    jsx3.ide.maybeSelectNewDom(clones);

    return clones;
  };

  ComponentEditor_prototype.onShowComponentProfile = function(objTab) {
    if (! objTab._inited) {
      var editor = jsx3.ide.getActiveEditor();
      if (editor) {
        //the profile for the component is contained by the first child of JSXBODY
        var firstChild = editor.getServer().getRootObjects()[0];
        if (firstChild) {
          objTab.fillFromJSX(firstChild);
          objTab._inited = true;
        }
      }
    }
  };

});
