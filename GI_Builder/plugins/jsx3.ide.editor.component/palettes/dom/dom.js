var systemIconPath = "jsxapp:/images/prototypes/",
    chartingIconPath = "addins/charting/icons/";

jsx3.$O(this).extend({
  
domCopyNameToCB: function(strJSXId) {
  var objJSX = jsx3.ide.PROJECT.getServer().getJSXById(strJSXId);
  jsx3.html.copy(objJSX != null ? objJSX.getName() : "");
},

domCopyGetterToCB: function(strJSXId) {
  var objJSX = jsx3.ide.PROJECT.getServer().getJSXById(strJSXId);
  var ns = jsx3.ide.PROJECT.getServer().getEnv("namespace");
  jsx3.html.copy(objJSX != null ? ns + '.getJSXByName("' + objJSX.getName() + '")': "");
},

doDomToggle: function(strJSXId,bOpen) {
  var objJSX = jsx3.GO(strJSXId);
  //sets flag on jsx gui object denoting its open/close state as shown in the IDE's DOM Browser Palette. This property is ephemeral (i.e., "_jsx...") and is not serialized with the object
  if (objJSX) {
    if (bOpen) {
      objJSX._jsxideopen = true;
    } else {
      delete objJSX._jsxideopen;
    }
  }
},

domSpyGlass: function(objTree, strRecordId) {
  var objJSX = jsx3.GO(strRecordId);
  if (!(objJSX && objJSX.jsxannotation)) return null;

  return '<span style="width:200px;">' + objJSX.jsxannotation + "</span>";
},

/** DO DOM EXECUTE *****************************************/
doDomExecute: function(strId) {
  //determine if the item being executed upon is a referenced file that can be edited; if a component onf the filesystem, open for edit
  var objJSX = jsx3.GO(strId);
  if (objJSX != null) {
    var myURL = objJSX.getMetaValue("url");
    if (myURL) {
      var persist = objJSX.getPersistence();
      if (persist == jsx3.app.Model.PERSISTREF || persist == jsx3.app.Model.PERSISTREFASYNC)
        jsx3.ide.doOpenUrlForEdit(jsx3.ide.PROJECT.resolveURI(myURL));
    }
  }
},

/** DO PERSIST *********************************************/
doPersist: function(strRecordId, PERSIST) {
  //called when user chooses the given menu item to change the persistence for the given GUI object
  //get handle to selected element
  var objJSX = jsx3.ide.getForIdOrSelected(strRecordId);
  for (var i = 0; i < objJSX.length; i++) {
    //set the persistence to the given constant
    var prevPersist = objJSX[i].getPersistence();
    objJSX[i].setPersistence(PERSIST);
  }

  if (objJSX.length > 0) {
    //call on-change event for the dom to reflect the new persistence
    this.onDomChange();

    jsx3.ide.getActiveEditor().setDirty(true);
  }
},

/** IMPORT DOM BRANCH *************************************************/
//@ objJSX  --([object]) JSX object that will become the parent for the selected serialized component
//@ PERSISTENCE --(CONSTANT) one of: jsx3.app.Model.PERSISTEMBED jsx3.app.Model.PERSISTREF jsx3.app.Model.PERSISTREFASYNC
importDomBranch: function(strJsxId, PERSISTENCE) {
  var objJSXs = jsx3.ide.getForIdOrSelected(strJsxId, true);
  if (objJSXs.length != 1) return;
  var objJSX = objJSXs[0];

  //shows the open dialog, so user can pick which component should default-load
  var home = jsx3.ide.getCurrentUserHome();
  jsx3.ide.getPlugIn("jsx3.io.browser").chooseFile(jsx3.IDE.getRootBlock(), {
      name:"jsxdialog", modal:false,
      folder: jsx3.ide.getCurrentDirectory(), baseFolder: home,
      onChoose: function(objFile) {
        jsx3.ide.setCurrentDirectory(objFile.getParentFile());
        //load the component
        var strRelativePath = jsx3.ide.PROJECT.getServer().getEnv("apppathabs").relativize(objFile.toURI());

        var bRef = PERSISTENCE == jsx3.app.Model.PERSISTREFASYNC || PERSISTENCE == jsx3.app.Model.PERSISTREF;
        var objChild = objJSX.load(strRelativePath, true, jsx3.ide.PROJECT.getServer());

        jsx3.$A(objChild).each(function(e){
          e.setPersistence(bRef ? PERSISTENCE : jsx3.app.Model.PERSISTEMBED);
        });

        if (objChild) {
    //      //get the dom tree and open the parent (so newly-deserialized child content is visible)
    //      objTree.toggleItem(objJSX.getId(),true);
          //select the new child just imported in the DOM tree
          jsx3.ide.maybeSelectNewDom([objChild]);

          //set dirty flag ( the file's been edited )
          jsx3.ide.getActiveEditor().setDirty(true);
        }
      }
  });
},

recycleDOM: function(strId) {
  jsx3.ide.getActiveEditor().doRecycle(strId);
},

cloneDOM: function(strId) {
  jsx3.ide.getActiveEditor().cloneJSX(strId);
},

////////////// LOGIC FOR SERIALIZING BRANCHES; IMPORTING A BRANCH; EXPORTING A STATIC HTML TEST PAGE ////////////////////////////////

/** EXPORT DOM BRANCH *************************************************/
//@ objJSX  --([object]) JSX object to export (serialize the MODEL) to the file system or save as HTML (VIEW)
//@ FORMAT  --(CONSTANT) the export type. one of the strings: MODEL or VIEW
exportDomBranch: function(objJSX,FORMAT) {
  //get content as html (VIEW)
  var strContent = (FORMAT == "MODEL") ? objJSX.toXMLDoc() : objJSX.paint();

  var sysDir = jsx3.ide.getSystemDirFile();
  //shows the save dialog, so user can pick which component should default-load
  jsx3.ide.getPlugIn("jsx3.io.browser").saveFile(jsx3.IDE.getRootBlock(), {
      name:"jsxdialog", modal:false,
      folder: FORMAT == "MODEL" ? jsx3.ide.getCurrentDirectory() : sysDir, baseFolder: sysDir,
      onChoose: jsx3.$F(function(objFile) {
        var success = false;
        if (FORMAT == "MODEL") {
          var objXML = jsx3.ide.makeXmlPretty(strContent, true);
          if (! jsx3.ide.writeUserXmlFile(objFile, objXML)) {
            jsx3.IDE.alert(null, jsx3.IDE.getDynamicProperty('jsxerr_exportxml_writefail'));
            return;
          }
        } else {
          success = this.exportDomBranchHtml(objFile,strContent);
        }

        if (success)
          jsx3.ide.setCurrentDirectory(objFile.getParentFile());
      }).bind(this)
  });
},

/** EXPORT DOM BRANCH HTML *************************************************/
exportDomBranchHtml: function(objFile,strContent) {
  if (jsx3.ide.getSystemDirFile().equals(objFile.getParentFile())) {
    //saves the content, @strContent to an html file, wrapped with the necessary HTML to view as a static file
    var strHTML = '<html xmlns:v="urn:schemas-microsoft-com:vml"><head><link type="text/css" rel="stylesheet" href="JSX/css/JSX.css"/></head><body>';
    strHTML += strContent.replace(/onmouse[^=]*=/gi,"x=").replace(/on[dbl]?(click|scroll)=/gi,"x=").replace(/onkey[^=]*=/gi,"x=");
    strHTML += '</body></html>';

    if (jsx3.ide.writeUserFile(objFile, strHTML))
      return true;
    else
      jsx3.IDE.alert(null, jsx3.IDE.getDynamicProperty('jsxerr_exporthtml_writefail'));
  } else {
    jsx3.IDE.alert(null, jsx3.IDE.getDynamicProperty('jsxerr_exporthtml_directory'));
  }

  return false;
},

onDomTreeDrop: function(strJSXSourceId, strParentRecordId, strRecordIds, objDomTree, bCtrl, bInsertBefore) {
  var editor = jsx3.ide.getActiveEditor();
  return editor.onDomDrop(strJSXSourceId, strParentRecordId, strRecordIds, objDomTree, bCtrl, bInsertBefore)
},

/** DO REPAINT *********************************************/
doRepaint: function(strRecordId) {
  var objJSX = jsx3.ide.getForIdOrSelected(strRecordId, true);
  for (var i = 0; i < objJSX.length; i++) {
    objJSX[i].repaint(); // TODO: optimize for ancestor/descendants
  }
},

doFetchDataAndRepaint: function(strRecordId) {
  var objJSX = jsx3.ide.getForIdOrSelected(strRecordId, true);
  for (var i = 0; i < objJSX.length; i++) {
    objJSX[i].resetCacheData();
    objJSX[i].repaint();
  }
},

/** CONFIG DOM MENU *********************************************/
domMenuEnabled: function(bits) {
  var Model = jsx3.app.Model;
  var objJSXs = jsx3.$A(jsx3.ide.getSelected(true));
  if (objJSXs.length == 0) return false;

  if (bits.single && objJSXs.length > 1) return false;
  if (bits.noroot && objJSXs.contains(objJSXs[0].getServer().getBodyBlock())) return false;
  if (bits.refonly && !objJSXs.find(function(e){
      var p = e.getPersistence(); return p == Model.PERSISTREF || p == Model.PERSISTREFASYNC; })) return false;
  if (bits.noref && objJSXs.find(function(e){
      var p = e.getPersistence(); return p == Model.PERSISTREF || p == Model.PERSISTREFASYNC; })) return false;
  if (bits.cacheable && objJSXs.find(function(e){ return !(e.instanceOf(jsx3.xml.Cacheable)); })) return false;

  return true;
},

domMenuSelected: function(bits) {
  var objJSXs = jsx3.$A(jsx3.ide.getSelected(true));
  if (objJSXs.length == 0) return false;

  if (bits.persist) {
    if (objJSXs.length == objJSXs.filter(function(e){ return e.getPersistence() == bits.persist; }).length)
      return true;
  }
  return false;
},

/** ON DOM CHANGE ****************************************************/
onDomChange: jsx3.$F(function() {
  var p = this.getDomPalette().getUIObject();
  if (!p) return;

  //build out the dom tree to reflect the hierarchy of this component
  var objTree = p.getTree();
  var editor = jsx3.ide.getActiveEditor();

  if (jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor) {
    var selectedIds = editor.getSelection().map(function(e) { return e.getId(); });
    objTree.setDynamicProperty("jsxbgcolor","@Solid Light");
    objTree.clearXmlData();

    //configure specifically if the root item exists (not a new, untitled component)
    var server = jsx3.ide.getActiveServer();
    if (server != null) {
      var objRoot = server.getBodyBlock();
      if (objRoot)
        this._buildTree(objTree, objRoot);
    }

    p.onSelectionChanged(editor);
    objTree.repaint();
  }
}).throttled(),

/** BUILD TREE ****************************************************/
_buildTree: function(objTree, objJSX, strParentId) {
  //italics will denote any item that isn't permanant to the serialization file
  //gray will denote an ephemeral state
  //blue/green will ref outside files
  //save icon will mean the component is aware of its original source

  //create record object (will become a record node in the CDF)
  var o = {};

  //is this a null object? (is this a new component?)
  if(strParentId == null) {
    var editor = jsx3.ide.getActiveEditor();
    //THIS IS A NEW AND EMPTY TREE WITH NO INFORMATION; JUST SHOW 'UNTITLED' TO THE USER
    o.jsxid = jsx3.ide.ROOT_DOM_NODE_ID;
    o.jsxtext = editor.getTitle();
    o.jsximg = "jsxapp:/images/icon_46.gif";
    o.jsxopen = "1";
  } else {
    if (objJSX.jsxideinvisible)
      return;

    // determine the persistence (if this is the root element, show it as embedded, because it is essentially "embedded" as a child of the file on-disk)
    var intPersist = objJSX.getPersistence();

    //assume the tree should stay open by default
    o.jsxid = objJSX.getId();
    if (objJSX._jsxideopen || (typeof(objJSX._jsxideopen) == "undefined" && strParentId == jsx3.ide.ROOT_DOM_NODE_ID))
      o.jsxopen = "1";

    var classImageText = this._getDomRecordValues(objJSX);
    o.jsxclass = classImageText[0];
    o.jsximg = classImageText[1];
    o.jsxtext = classImageText[2];
  }

  //insert; recurse to populate descendants
  objTree.insertRecord(o, strParentId, false);
  if (intPersist == null || intPersist == jsx3.app.Model.PERSISTNONE || intPersist == jsx3.app.Model.PERSISTEMBED) {
    var objKids = objJSX.getChildren();
    for (var i = 0; i < objKids.length; i++)
      this._buildTree(objTree, objKids[i], o.jsxid);
  }
},

_typeIcons: {
  "jsx3.gui.Block": function(o) {
    var icn = "block-abs.gif";
    switch (o.getTagName()) {
      case "fieldset": icn = "fieldset.gif"; break;
      case "legend": icn = "legend.gif"; break;
      case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": icn = o.getTagName() + ".gif"; break;
      case "img": icn = "block-image"; break;
      default: 
        if (o.getChildren().length == 0 && (o.getText() || "").length > 0)
          icn = "block-text.gif";
    }
    return systemIconPath + icn;
  },
  "jsx3.gui.BlockX": systemIconPath + "blockX.gif",
  "jsx3.gui.Button": systemIconPath + "button.gif",
  "jsx3.gui.CDF": systemIconPath + "container.gif",
  "jsx3.gui.CheckBox": systemIconPath + "checkbox.gif",
  "jsx3.gui.ColorPicker": systemIconPath + "colorpicker.gif",
  "jsx3.gui.DatePicker": systemIconPath + "datepicker.gif",
  "jsx3.gui.Dialog": systemIconPath + "dialog.gif",
  "jsx3.gui.IFrame": systemIconPath + "iframe.gif",
  "jsx3.gui.Image": systemIconPath + "block-image.gif",
  "jsx3.gui.ImageButton": systemIconPath + "image-button.gif",
  "jsx3.gui.Label": systemIconPath + "label.gif",
  "jsx3.gui.LayoutGrid": function (o) { 
    var numRows = o.getRows().split(/\s*,\s*/g).length;
    var numCols = o.getCols().split(/\s*,\s*/g).length;
    return systemIconPath + (numRows > 1 && numCols > 1 ? "layout-over.gif" : (numRows > 1 ? "layout-over.gif" : "layout-side.gif"));
  },
  "jsx3.gui.Matrix": function(o) {
    var icon = "matrix.gif";
    if (o.getRenderingModel() == "hierarchical")
      icon = "matrixtree.gif";
    else if (o.getSelectionModel() == 0)
      icon = "matrixgrid.gif";
    else
      icon = "matrixlist.gif";
    
    return systemIconPath + icon;
  },
  "jsx3.gui.Matrix.Column": function(o) {
    return systemIconPath + (o.getChildren().length > 0 ? "matrix-columnmask.gif" : "matrix-column.gif");
  },
  "jsx3.gui.Menu": systemIconPath + "menu.gif",
  "jsx3.gui.NativeButton": systemIconPath + "nativebutton.gif",
  "jsx3.gui.NativeFileUpload": systemIconPath + "fileupload.gif",
  "jsx3.gui.NativeForm": systemIconPath + "form.gif",
  "jsx3.gui.NativeHidden": systemIconPath + "hidden.gif",
  "jsx3.gui.NativeSelect": function(o) {
    return systemIconPath + (o.getSize() > 1 ? "nativemultiselect.gif" : "nativeselect.gif");
  },
  "jsx3.gui.NumberInput": systemIconPath + "numberinput.gif",
  "jsx3.gui.RadioButton": systemIconPath + "radio.gif",
  "jsx3.gui.Select": function(o) {
    return systemIconPath + (o.getType() == 1 ? "combo.gif" : "select.gif");
  },
  "jsx3.gui.Slider": function(o) {
    return systemIconPath + (o.getOrientation() == 1 ? "vertical-slider.gif" : "slider.gif");
  },
  "jsx3.gui.Sound": systemIconPath + "sound.gif",
  "jsx3.gui.Splitter": function (o) {
    return systemIconPath + (o.getOrientation() == 1 ? "splitter-over.gif" : "splitter-side.gif");
  },
  "jsx3.gui.Stack": function (o) {
    return systemIconPath + (o.getParent() && o.getParent().getOrientation() == 1 ? "stack-side.gif" : "stack-over.gif");
  },
  "jsx3.gui.StackGroup": function (o) {
    return systemIconPath + (o.getOrientation() == 1 ? "stackgroup-side.gif" : "stackgroup-over.gif");
  },
  "jsx3.gui.Tab": systemIconPath + "tab.gif",
  "jsx3.gui.TabbedPane": systemIconPath + "tabbedpane.gif",
  "jsx3.gui.Table": systemIconPath + "table.gif",
  "jsx3.gui.TextBox": function (o) {
    var t = o.getType();
    return systemIconPath + (t == 2 ? "textbox-password.gif" : (t == 1 ? "textbox-area.gif" : "textbox.gif"));
  },
  "jsx3.gui.TimePicker": systemIconPath + "timepicker.gif",
  "jsx3.gui.ToolbarButton": systemIconPath + "toolbar-button.gif",
  "jsx3.gui.Tree": systemIconPath + "tree.gif",
  "jsx3.gui.Window": systemIconPath + "dialog.gif",
  "jsx3.gui.WindowBar": function (o) {
    var icn = "stack-over.gif";
    switch (o.getType()) {
      case 3: icn = "taskbar.gif"; break;
      case 2: icn = "menubar.gif"; break;
      case 1: icn = "toolbar.gif"; break;
    }
    return systemIconPath + icn;
  },
  "jsx3.chart.AreaChart": chartingIconPath + "stackedArea.gif",
  "jsx3.chart.AreaSeries": chartingIconPath + "areaSeries.gif",
  "jsx3.chart.Axis": chartingIconPath + "linearAxis.gif",
  "jsx3.chart.BarChart": chartingIconPath + "stackedBar.gif",
  "jsx3.chart.BarSeries": chartingIconPath + "barSeries.gif",
  "jsx3.chart.BubbleSeries": chartingIconPath + "bubbleSeries.gif",
  "jsx3.chart.CategoryAxis": chartingIconPath + "categoryAxis.gif",
  "jsx3.chart.ChartLabel": chartingIconPath + "chartLabel.gif",
  "jsx3.chart.ColumnChart": chartingIconPath + "stackedColumn.gif",
  "jsx3.chart.ColumnSeries": chartingIconPath + "columnSeries.gif",
  "jsx3.chart.GridLines": chartingIconPath + "gridLines.gif",
  "jsx3.chart.Legend": chartingIconPath + "legend.gif",
  "jsx3.chart.LineChart": chartingIconPath + "stackedLine.gif",
  "jsx3.chart.LineSeries": chartingIconPath + "lineSeries.gif",
  "jsx3.chart.LogarithmicAxis": chartingIconPath + "logarithmicAxis.gif",
  "jsx3.chart.PieChart": chartingIconPath + "pie.gif",
  "jsx3.chart.PieSeries": chartingIconPath + "pieSeries.gif",
  "jsx3.chart.PlotChart": chartingIconPath + "plotPoint.gif",
  "jsx3.chart.PointSeries": chartingIconPath + "scatterSeries.gif",
  "jsx3.app.Model": "jsxapp:/images/icon_89.gif",
  "jsx3.xml.CDFSchema": systemIconPath + "schema.gif"
},

_getIconPath: function(o) {
  var path = null;
  if (o.getIconPath)
    path = o.getIconPath();

  var c = o.getClass();
  while (c && !path) {
    path = this._typeIcons[c.getName()];
    if (typeof(path) == "function")
      path = path(o);
    c = c.getSuperClass();
  }

  return path;
},

_getDomRecordValues: function(objJSX) {
  var Model = jsx3.app.Model;
  var c = "", img, text = objJSX.getName();

  if (text == null || text == "") {
    text = objJSX.getClass().getName();
    c = "jsx3ide_dom_noname";
  }

  //first, determine if this node has a reference to an originating prototype; this will force the use of a different icon (use check for now)
  var persistence = objJSX.getPersistence();

  if (objJSX instanceof Model.Loading) {
    text += " : Async";
    c = "jsx3ide_dom_lasync";
    img = "jsxapp:/images/icon_89b.gif";
  } else if (persistence == Model.PERSISTREF || persistence == Model.PERSISTREFASYNC) {
    img = "jsxapp:/images/icon_71.gif";

    var path = new jsx3.net.URI(objJSX.getPersistenceUrl()).getPath();
    if (path)
      text += " : " + path.substring(path.lastIndexOf("/") + 1);

    c = persistence == Model.PERSISTREF ? "jsx3ide_dom_ref" : "jsx3ide_dom_refa";
  } else {
    img = this.relativizeURI(jsx3.net.URIResolver.JSX.resolveURI(this._getIconPath(objJSX)), true);

    if (persistence == Model.PERSISTNONE)
      c = "jsx3ide_dom_pnone";
  }

  return [c, img, text];
}

});
