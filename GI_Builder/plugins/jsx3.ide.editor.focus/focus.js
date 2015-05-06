/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({

//////// LOGIC FOR THE FOCUS RECTANGLE  ////////////////////////////////////
_FOCUS: {
  /** GLOBALS ************************************************/
  /* @jsxobf-clobber */
  NORTH: "NN",
  /* @jsxobf-clobber */
  SOUTH: "SS",
  /* @jsxobf-clobber */
  EAST: "EE",
  /* @jsxobf-clobber */
  WEST: "WW",
  /* @jsxobf-clobber */
  CENTER: "MM",
  /* @jsxobf-clobber */
  NUDGE: "nudge",
  /* @jsxobf-clobber */
  COLOR_DRAG: "#000000",
  /* @jsxobf-clobber */
  COLOR_OFF: "#1E90FF",
  /* @jsxobf-clobber */
  COLOR_REL: "#FF901E",
  /* @jsxobf-clobber */
  COLOR_BLUR: "#999999",
  /* @jsxobf-clobber */
  BOXSIZEX: 2,
  /* @jsxobf-clobber */
  BOXSIZEY: 2,
  /* @jsxobf-clobber */
  DRAGW: 3,
  /* @jsxobf-clobber */
  DRAGH: 6,
  /* @jsxobf-clobber */
  MOVEW: 4,
  /* @jsxobf-clobber */
  KEYCODE_TO_DIRECTION: {37: 'W', 38: 'N', 39: 'E', 40: 'S'},

  /* @jsxobf-clobber */
  flag: 0,
  /* @jsxobf-clobber */
  type: "S",
  /* @jsxobf-clobber */
  offsetX: "0",
  /* @jsxobf-clobber */
  offsetY: "0",
  /* @jsxobf-clobber */
  abs: null,
  /* @jsxobf-clobber */
  position: null
},

// returns integer 1 (for no snap), or greater than 1 for snap
_getSnapTo: function() {
  var settings = jsx3.ide.getIDESettings();
  if (settings.get('prefs', 'dom', 'snapTo')) {
    var snap = settings.get('prefs', 'builder', 'snapto');
    return snap != null ? Math.max(1, snap) : 10;
  } else {
    return 1;
  }
},

/** SNAP TO GRID **************************************/
toggleSnapToGrid: function() {
  var settings = jsx3.ide.getIDESettings();
  var bSnap = ! settings.get('prefs', 'dom', 'snapTo');
  settings.set('prefs', 'dom', 'snapTo', bSnap);
  this.setBindableProp("snapOn", bSnap);
},

toggleFocusRectangle: function() {
  var settings = jsx3.ide.getIDESettings();
  var bShow = settings.get('prefs', 'dom', 'showFocus');
  this.showFocusRectangle(!bShow, true, true);
},

/** SHOW FOCUS RECTANGLE ************************************************/
showFocusRectangle: jsx3.$F(function(bShow, bEvent, bDoFocus) {
  var FOCUS = this._FOCUS;

  //destroy any existing focus rectangle
  var objHW = jsx3.gui.Heavyweight.GO("jsxfocusrectangle");
  if (objHW) objHW.destroy();

  var settings = jsx3.ide.getIDESettings();

  if (typeof(bShow) != "boolean") {
    bShow = settings.get('prefs', 'dom', 'showFocus');
  } else {
    bDoFocus = true;
    settings.set('prefs', 'dom', 'showFocus', bShow);
    this.setBindableProp("rectangleOn", bShow);
  }

  var editor = jsx3.ide.getActiveEditor();
  if (editor == null ||
      !(jsx3.ide.ComponentEditor && editor instanceof jsx3.ide.ComponentEditor && editor.getMode() == 'component')) return;

  var objJSX = jsx3.ide.getSelected();

  if (! bShow || objJSX.length == 0) return;

  //get the root parent container (this is the base object from which we well position the rectangle
  var objMyRoot = editor.getContent().getDescendantOfName("jsxtab_componenteditor_main");
  var objOwner = objMyRoot.getAncestorOfType(jsx3.gui.TabbedPane);
  objMyRoot = objMyRoot.getRendered();

  var objRules = null, x1 = Number.POSITIVE_INFINITY, x2 = Number.NEGATIVE_INFINITY;
  var y1 = x1, y2 = x2;
  for (var i = 0; i < objJSX.length; i++) {
    if (!objJSX[i] || !objJSX[i].getMaskProperties) continue;

    var r = objJSX[i].getMaskProperties();
    if (objRules == null) {
      objRules = jsx3.clone(r);
    } else {
      var dims = [FOCUS.NORTH, FOCUS.SOUTH, FOCUS.EAST, FOCUS.WEST, FOCUS.CENTER];
      for (var j = 0; j < dims.length; j++)
        objRules[dims[j]] = objRules[dims[j]] && r[dims[j]];
    }

    var abs = objJSX[i].getAbsolutePosition(objMyRoot);
    x1 = Math.min(x1, abs.L);
    y1 = Math.min(y1, abs.T);
    x2 = Math.max(x2, abs.L + abs.W);
    y2 = Math.max(y2, abs.T + abs.H);
  }

  if (objRules == null) return;

  //get absolutes for the item we'll be showing; get position using the chosen root as the origin (the parent of the editor tabbed pane)
  FOCUS.abs = {L:x1, T:y1, W:x2-x1, H:y2-y1};

  var bSingle = objJSX.length == 1;
  // if the item is relatively positioned, use red as the color to denote the difference
  var c1 = (objRules[FOCUS.CENTER]) ? FOCUS.COLOR_OFF : FOCUS.COLOR_REL;

  var pN = bSingle && objRules[FOCUS.NORTH] && objRules[FOCUS.CENTER] ? FOCUS.NORTH : "";
  var pS = bSingle && objRules[FOCUS.SOUTH] ? FOCUS.SOUTH : "";
  var pE = bSingle && objRules[FOCUS.EAST] ? FOCUS.EAST : "";
  var pW = bSingle && objRules[FOCUS.WEST] && objRules[FOCUS.CENTER] ? FOCUS.WEST : "";
  var pM = objRules[FOCUS.CENTER] ? FOCUS.CENTER : "";

  var halfW = Math.round((FOCUS.abs.W - FOCUS.DRAGH) / 2);
  var halfH = Math.round((FOCUS.abs.H - FOCUS.DRAGH) / 2);

  // account for border width in Fx, strict
  var boxW = FOCUS.abs.W, boxH = FOCUS.abs.H;
  if (jsx3.html.getMode() != jsx3.html.MODE_IE_QUIRKS) {
    boxW -= 2; boxH -= 2;
  }

  //generate anchor points and box
  var strHTML = '<span tabindex="1" id="jsxfocusrectangle_span" style="position:absolute;width:100%;height:100%;left:2px;top:2px;">';

  strHTML += '<span id="_ide_NN"' + (pN ? ' jsxon="1"' : "") + ' jsxpoint="' + pN + '" unselectable="on" style="overflow:hidden;cursor:' + (pN ? 'N-resize' : 'normal') + ';position:absolute;background-color:' + (pN ? FOCUS.COLOR_BLUR : c1) + ';left:' + halfW + 'px;top:-1px;width:' + FOCUS.DRAGH + 'px;height:' + FOCUS.DRAGW + 'px;">&#160;</span>';
  strHTML += '<span id="_ide_WW"' + (pW ? ' jsxon="1"' : "") + ' jsxpoint="' + pW + '" unselectable="on" style="overflow:hidden;cursor:' + (pW ? 'W-resize' : 'normal') + ';position:absolute;background-color:' + (pW ? FOCUS.COLOR_BLUR : c1) + ';left:-1px;top:' + halfH + 'px;width:' + FOCUS.DRAGW + 'px;height:' + FOCUS.DRAGH + 'px;">&#160;</span>';
  strHTML += '<span id="_ide_EE"' + (pE ? ' jsxon="1"' : "") + ' jsxpoint="' + pE + '" unselectable="on" style="overflow:hidden;cursor:' + (pE ? 'W-resize' : 'normal') + ';position:absolute;background-color:' + (pE ? FOCUS.COLOR_BLUR : c1) + ';left:' + (FOCUS.abs.W - 2) + 'px;top:' + halfH + 'px;width:' + FOCUS.DRAGW + 'px;height:' + FOCUS.DRAGH + 'px;">&#160;</span>';
  strHTML += '<span id="_ide_SS"' + (pS ? ' jsxon="1"' : "") + ' jsxpoint="' + pS + '" unselectable="on" style="overflow:hidden;cursor:' + (pS ? 'N-resize' : 'normal') + ';position:absolute;background-color:' + (pS ? FOCUS.COLOR_BLUR : c1) + ';left:' + halfW + 'px;top:' + (FOCUS.abs.H - 2) + 'px;width:' + FOCUS.DRAGH + 'px;height:' + FOCUS.DRAGW + 'px;">&#160;</span>';

  strHTML += '<span id="_ide_BB" unselectable="on" style="position:absolute;left:0px;top:0px;width:' + boxW + 'px;height:' + boxH + 'px;border:solid 1px ' + c1 + ';z-index:-1;font-size:4px;"></span>';
  strHTML += '<span id="_ide_MM"' + (pM ? ' jsxon="1"' : "") + ' jsxpoint="MM" unselectable="on" style="overflow:hidden;cursor:' + (pM ? 'move' : 'normal') + ';position:absolute;background-color:' + (pM ? FOCUS.COLOR_BLUR : c1) + ';left:' + Math.round((FOCUS.abs.W - FOCUS.MOVEW) / 2) + 'px;top:' + Math.round((FOCUS.abs.H - FOCUS.MOVEW) / 2) + 'px;width:' + FOCUS.MOVEW + 'px;height:' + FOCUS.MOVEW + 'px;">&#160;</span>';

  strHTML += '</span>';

  var offsetRoot = jsx3.ide.SERVER.getRootBlock();

  //create and configure a Heavyweight (HW) instance to contain the rectangle
  objHW = new jsx3.gui.Heavyweight("jsxfocusrectangle", objOwner);
  objHW.setDomParent(objMyRoot);
  objHW.setHTML(strHTML);
//    objHW.setZIndex(1);
  objHW.setWidth(FOCUS.abs.W);
  objHW.setHeight(FOCUS.abs.H);
  objHW.addXRule(offsetRoot, "W", "W", FOCUS.abs.L-2);
  objHW.addYRule(offsetRoot, "N", "N", FOCUS.abs.T-2);
  objHW.show();

  var objGUI = objHW.getRendered(objMyRoot).firstChild;
  jsx3.html.addEventListener(objGUI, "onmousedown", jsx3.$F(this._doFocusDown).bind(this));
  jsx3.html.addEventListener(objGUI, "ondblclick", jsx3.$F(this.showFocusRectangle).bind(this, [false, true]));
  jsx3.html.addEventListener(objGUI, "onkeydown", jsx3.$F(this._doFocusKeyDown).bind(this, [objGUI]));
  jsx3.html.addEventListener(objGUI, "onfocus", jsx3.$F(this._doFocusFocus).bind(this, [objGUI]));
  jsx3.html.addEventListener(objGUI, "onblur", jsx3.$F(this._doFocusBlur).bind(this, [objGUI]));

  jsx3.sleep(function(){
    var fr = objMyRoot.ownerDocument.getElementById('jsxfocusrectangle_span');
    if (bDoFocus && fr && fr.clientHeight > 0) {
      fr.focus();
      objMyRoot.scrollTop = objMyRoot.scrollLeft = 0; // HACK: IE scroll issue
    }
  });
}).throttled(),

_doFocusKeyDown: function(objFocusGUI, e) {
  var objEvent = jsx3.gui.Event.wrap(e || window.event);
  var keyCode = objEvent.keyCode();
  var direction = this._FOCUS.KEYCODE_TO_DIRECTION[keyCode];
  if (direction != null) {
    this._doFocusNudge(objEvent, direction);
    objEvent.cancelAll();
  } else if (objEvent.ctrlKey() && !objEvent.shiftKey() && !objEvent.altKey() && !objEvent.metaKey()) {
    if (keyCode == jsx3.gui.Event.KEY_BACKSPACE || keyCode == jsx3.gui.Event.KEY_DELETE)
      jsx3.ide.getActiveEditor().doRecycle();
  }
},

_doFocusFocus: function(objFocusGUI) {
//  jsx3.ide.LOG.info("FOCUS focus " + objFocusGUI.childNodes.length);
  var children = objFocusGUI.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.getAttribute("jsxon") == "1")
      child.style.backgroundColor = this._FOCUS.COLOR_DRAG;
  }

  // HACK: IE scroll issue
  try {
    objFocusGUI.parentNode.parentNode.scrollTop = objFocusGUI.parentNode.parentNode.scrollLeft = 0;
  } catch (e) {;}
},

_doFocusBlur: function(objFocusGUI) {
  var children = objFocusGUI.childNodes;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.getAttribute("jsxon") == "1")
      child.style.backgroundColor = this._FOCUS.COLOR_BLUR;
  }
},

/** DO FOCUS DOWN ************************************************/
_doFocusDown: function(e) {
  var FOCUS = this._FOCUS;

//  jsx3.ide.LOG.info("FOCUS down");
  var objEvent = jsx3.gui.Event.wrap(e || window.event);
  var objFocusGUI = objEvent.srcElement();

  var fr = objFocusGUI.ownerDocument.getElementById('jsxfocusrectangle_span');
  if (fr) {
    fr.focus();
    try {
      fr.parentNode.parentNode.scrollTop = fr.parentNode.parentNode.scrollLeft = 0; // HACK: IE scroll issue
    } catch (e) {;}
  }

  //get handle to affected object
  var objJSX = jsx3.ide.getSelected();
  var myPoint = objFocusGUI.getAttribute("jsxpoint");

  //allow user to mouse down; do a re-check to see if any rules have changed for this object since the focus rectangle was first painted
  if (myPoint /*&& objJSX.getMaskProperties()[myPoint]*/ ||
      (myPoint == FOCUS.CENTER && objEvent.ctrlKey())) {
    // set default dimensions for the focus rectangle box; if these are changed when the user mouses up, it means they edited the box
    FOCUS.position = {L:0, T:0, W:FOCUS.abs.W, H:FOCUS.abs.H};

    //this is a hotspot on the rectangle; persist the anchor being affected
    FOCUS.type = myPoint;

    //set flag, so _doFocusMove() knows to listen for mousemove event ('1' means a resize/reposition)
    FOCUS.flag = 1;
    var snap = this._getSnapTo();

    //save offset (used during moves for more efficient calculations)
    if (myPoint == FOCUS.CENTER) {
      //set the start to a multiple of the snap, so it aligns to the grid
      FOCUS.offsetX = jsx3.util.numRound(Number(FOCUS.abs.L), snap) - FOCUS.abs.L;
      FOCUS.offsetY = jsx3.util.numRound(Number(FOCUS.abs.T), snap) - FOCUS.abs.T;

      //if user holds control key down, this is a clone event
      if (jsx3.gui.isMouseEventModKey(objEvent)) {
        objFocusGUI.parentNode.childNodes[4].style.borderStyle = "dashed";
        //this is a clone ('2' means a clone event)
        FOCUS.flag = 2;
      }
    } else {
      FOCUS.offsetX = jsx3.util.numRound(Number(FOCUS.abs.W), snap) - FOCUS.abs.W;
      FOCUS.offsetY = jsx3.util.numRound(Number(FOCUS.abs.H), snap) - FOCUS.abs.H;
    }

    FOCUS.boxStartW = FOCUS.abs.W;
    FOCUS.boxStartH = FOCUS.abs.H;
    FOCUS.eventStartX = objEvent.getScreenX();
    FOCUS.eventStartY = objEvent.getScreenY();

    jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEMOVE, this, this._doFocusMove);
    jsx3.gui.Event.subscribe(jsx3.gui.Event.MOUSEUP, this, this._doFocusUp);
  } else {
    //jsx3.log('a',objJSX.getMaskProperties()[myPoint]);
  }
},


/** DO FOCUS MOVE ************************************************/
_doFocusMove: function(e) {
//  jsx3.log("FOCUS move " + this._FOCUS.flag);
  if (this._FOCUS.flag > 0) {
    var objEvent = e.event;
    var objFocusGUI = objEvent.srcElement().ownerDocument.getElementById('jsxfocusrectangle_span');
    var snap = this._getSnapTo();
    var moveX = jsx3.util.numRound((objEvent.getScreenX() - this._FOCUS.eventStartX - this._FOCUS.offsetX), snap) + this._FOCUS.offsetX;
    var moveY = jsx3.util.numRound((objEvent.getScreenY() - this._FOCUS.eventStartY - this._FOCUS.offsetY), snap) + this._FOCUS.offsetY;

    this._adjustSize(objFocusGUI, moveX, moveY);
  }
},

_doFocusNudge: function(objEvent, strDirection) {
  // focus rectangle must be visible
  var objHW = jsx3.gui.Heavyweight.GO("jsxfocusrectangle");
  if (objHW == null) return;

  var objJSXs = jsx3.ide.getSelected();

  var x = 0, y = 0;
  switch (strDirection) {
    case "W": x = -1; break;
    case "N": y = -1; break;
    case "E": x =  1; break;
    case "S": y =  1; break;
  }

  if (objEvent.shiftKey()) {
    x *= 10;
    y *= 10;
  }

  var bPos = false;

  for (var i = 0; i < objJSXs.length; i++) {
    var objJSX = objJSXs[i];
    if (!objJSX || !objJSX.getMaskProperties) continue;

    // must be allowed to drag from center
    var objRules = objJSX.getMaskProperties();
    if (! objRules[this._FOCUS.CENTER]) continue;

    if (x) {
      var left = objJSX.getLeft();
      objJSX.setLeft((left != null ? left : 0) + x, true);
      bPos = true;
    }

    if (y) {
      var top = objJSX.getTop();
      objJSX.setTop((top != null ? top : 0) + y, true);
      bPos = true;
    }
  }

  // when width/height are adjust, redisplay the focus rectangle
  if (bPos) {
    this.showFocusRectangle(null, null, true);
    this.publish({subject:"moved", targets:objJSXs});
  }
},

updateFocusOnModeChange: function(e) {
  var objHW = jsx3.gui.Heavyweight.GO("jsxfocusrectangle");
  var mode = e.mode;

  if (mode == "component")
    this.showFocusRectangle(null, false);
  else if (objHW)
    objHW.destroy();
},

/** DO FOCUS UP ************************************************/
_doFocusUp: function(e, objFocusGUI) {
//  jsx3.log("FOCUS up " + this._FOCUS.flag)

  jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEMOVE, this, this._doFocusMove);
  jsx3.gui.Event.unsubscribe(jsx3.gui.Event.MOUSEUP, this, this._doFocusUp);

  if (this._FOCUS.flag > 0) {
    //initialize variables; release capture
    var bSize = false, bPos = false;

    //get handle to GUI object being edited via the rectangle
    var objJSXs = jsx3.ide.getSelected();

    //if the flag is 2, this is a clone
    if (this._FOCUS.flag == 2) {
      //call IDE's doClone method (this will clone AND update dirty state)
      objJSXs = jsx3.ide.getActiveEditor().cloneJSX();
      //reset selection to the cloned item
      jsx3.ide.setDomValue(objJSXs);
    } else {
      if (this._FOCUS.abs.W != this._FOCUS.position.W) {
        objJSXs[0].setWidth(this._FOCUS.position.W, true);
        bSize = true;
      }

      if (this._FOCUS.abs.H != this._FOCUS.position.H) {
        objJSXs[0].setHeight(this._FOCUS.position.H, true);
        bSize = true;
      }
    }

    for (var i = 0; i < objJSXs.length; i++) {
      var objJSX = objJSXs[i];

      if (this._FOCUS.position.L != 0) {
        var left = objJSX.getLeft();
        objJSX.setLeft((left != null ? left : 0) + this._FOCUS.position.L - this._FOCUS.BOXSIZEX, true);
        bPos = true;
      }

      if(this._FOCUS.position.T != 0) {
        var top = objJSX.getTop();
        objJSX.setTop((top != null ? top : 0) + this._FOCUS.position.T - this._FOCUS.BOXSIZEY, true);
        bPos = true;
      }
    }

    // when width/height are adjust, redisplay the focus rectangle
    if (bPos) this.showFocusRectangle(null, null, true);

    //an edit ocurred; make item dirty
    if (bSize || bPos)
      this.publish({subject:"moved", targets:objJSXs});

    //reset the flag back to its null state
    this._FOCUS.flag = 0;
  }
},


/** ADJUST SIZE ************************************************/
_adjustSize: function(objFocusGUI, moveX, moveY) {
  var type = this._FOCUS.type;

  if (type == this._FOCUS.CENTER || type == this._FOCUS.NUDGE) {
    objFocusGUI.style.left = this._FOCUS.position.L = moveX + this._FOCUS.BOXSIZEX;
    objFocusGUI.style.top = this._FOCUS.position.T = moveY + this._FOCUS.BOXSIZEY;
  } else {
    var newWidth = null, newHeight = null;

    var dimBoxAdj = (jsx3.html.getMode() != jsx3.html.MODE_IE_QUIRKS) ? -2 : 0;

    if (type == this._FOCUS.WEST || type == this._FOCUS.NORTH) {
      newWidth = Math.max(1, this._FOCUS.boxStartW - moveX);
      newHeight = Math.max(1, this._FOCUS.boxStartH - moveY);

      if (type == this._FOCUS.WEST)
        objFocusGUI.style.left = this._FOCUS.position.L = moveX + this._FOCUS.BOXSIZEX;
      if (type == this._FOCUS.NORTH)
        objFocusGUI.style.top = this._FOCUS.position.T = moveY + this._FOCUS.BOXSIZEX;
    } else {
      newWidth = Math.max(1, this._FOCUS.boxStartW + moveX);
      newHeight = Math.max(1, this._FOCUS.boxStartH + moveY);
    }

    if (type == this._FOCUS.EAST || type == this._FOCUS.WEST) {
      //udpate UI
      var halfW = Math.round((newWidth - this._FOCUS.DRAGH) / 2);
      objFocusGUI.childNodes[2].style.left = newWidth - this._FOCUS.BOXSIZEX;
      objFocusGUI.childNodes[4].style.width = newWidth + dimBoxAdj;
      objFocusGUI.childNodes[0].style.left = halfW;
      objFocusGUI.childNodes[3].style.left = halfW;
      objFocusGUI.childNodes[5].style.left = Math.round((newWidth - this._FOCUS.MOVEW) / 2);
      //update model
      this._FOCUS.position.W = newWidth;
    } else if (type == this._FOCUS.SOUTH || type == this._FOCUS.NORTH) {
      //update UI
      var halfH = Math.round((newHeight - this._FOCUS.DRAGH) / 2);
      objFocusGUI.childNodes[3].style.top = newHeight - this._FOCUS.BOXSIZEY;
      objFocusGUI.childNodes[4].style.height = newHeight + dimBoxAdj;
      objFocusGUI.childNodes[1].style.top = halfH;
      objFocusGUI.childNodes[2].style.top = halfH;
      objFocusGUI.childNodes[5].style.top = Math.round((newHeight - this._FOCUS.MOVEW) / 2);
      //update model
      this._FOCUS.position.H = newHeight;
    }
  }
}

});
