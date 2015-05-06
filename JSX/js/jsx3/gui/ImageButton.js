/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require( "jsx3.gui.Form", "jsx3.gui.Block");

/**
 * An object-oriented interface onto a GUI button made of various image files. The class allows for an image file
 * for the following states:
 * <ul>
 * <li>Normal/Off</li>
 * <li>Mouse Over</li>
 * <li>Mouse Down</li>
 * <li>Selected/On</li>
 * <li>Disabled</li>
 * </ul>
 * The following model events are published:
 * <ul>
 * <li>EXECUTE (click)</li>
 * <li>TOGGLE (click when type is TYPE_TOGGLE)</li>
 * <li>MENU</li>
 * </ul>
 *
 * @since 3.1
 */
jsx3.Class.defineClass('jsx3.gui.ImageButton', jsx3.gui.Block, [jsx3.gui.Form], function(ImageButton, ImageButton_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;
  var Form = jsx3.gui.Form;

  /**
   * {int} Value for the type field indicating a normal button.
   * @final @jsxobf-final
   */
  ImageButton.TYPE_NORMAL = 0;

  /**
   * {int} Value for the type field indicating a toggle (2-state) button.
   * @final @jsxobf-final
   */
  ImageButton.TYPE_TOGGLE = 1;

  /**
   * {int} Value for the state field indicating that the toggle button is off.
   * @final @jsxobf-final
   */
  ImageButton.STATE_OFF = 0;

  /**
   * {int} Value for the state field indicating that the toggle button is on.
   * @final @jsxobf-final
   */
  ImageButton.STATE_ON = 1;

  /** {String} @private */
  ImageButton_prototype.jsximage = null;

  /** {String} @private */
  ImageButton_prototype.jsxoverimage = null;

  /** {String} @private */
  ImageButton_prototype.jsxdownimage = null;

  /** {String} @private */
  ImageButton_prototype.jsxonimage = null;

  /** {String} @private */
  ImageButton_prototype.jsxdisabledimage = null;

  /** {int} @private */
  ImageButton_prototype.jsxprefetch = jsx3.Boolean.TRUE;

  /** {int} @private */
  ImageButton_prototype.jsxtype = ImageButton.TYPE_NORMAL;

  /** {int} @private */
  ImageButton_prototype.jsxstate = ImageButton.STATE_OFF;

  /** {jsx3.gui.HotKey} @private @jsxobf-clobber */
  ImageButton_prototype._jsxhotkey = null;

  /**
   * The instance initializer.
   *
   * @param strName {String}  the JSX name
   * @param vntLeft {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntTop {int|String} either a number (i.e, 12, 30, etc) or a number and a unit value (i.e., "25%", "36pt", etc); if a number is passed, pixels will be the assumed unit when painted to screen
   * @param vntWidth {int}
   * @param vntHeight {int}
   */
  ImageButton_prototype.init = function(strName, vntLeft, vntTop, vntWidth, vntHeight) {
    this.jsxsuper(strName, vntLeft, vntTop, vntWidth, vntHeight);
  };

  /**
   * Returns the URI of the image of this image button.
   * @return {String}
   */
  ImageButton_prototype.getImage = function() { return this.jsximage; };

  /**
   * Sets the URI of the image of this image button. This is the default image that is displayed if the button
   * is off or if the button is in a state for which no image URI is specified.
   * @param strImage {String}
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setImage = function(strImage) { this.jsximage = strImage; return this; };

  /**
   * Returns the URI of the over image of this image button.
   * @return {String}
   */
  ImageButton_prototype.getOverImage = function() { return this.jsxoverimage; };

  /**
   * Sets the URI of the over image of this image button. This is the image that is displayed when the mouse moves
   * over the image button.
   * @param strImage {String}
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setOverImage = function(strImage) { this.jsxoverimage = strImage; return this; };

  /**
   * Returns the URI of the down image of this image button.
   * @return {String}
   */
  ImageButton_prototype.getDownImage = function() { return this.jsxdownimage; };

  /**
   * Sets the URI of the down image of this image button. This is the image that is displayed when the mouse is down
   * over the image button.
   * @param strImage {String}
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setDownImage = function(strImage) { this.jsxdownimage = strImage; return this; };

  /**
   * Returns the URI of the on image of this image button.
   * @return {String}
   */
  ImageButton_prototype.getOnImage = function() { return this.jsxonimage; };

  /**
   * Sets the URI of the on image of this image button. This is the image that is displayed when this image button is
   * of type <code>TYPE_TOGGLE</code> and its state is <code>STATE_ON</code>.
   * @param strImage {String}
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setOnImage = function(strImage) { this.jsxonimage = strImage; return this; };

  /**
   * Returns the URI of the disabled image of this image button.
   * @return {String}
   */
  ImageButton_prototype.getDisabledImage = function() { return this.jsxdisabledimage; };

  /**
   * Sets the URI of the disabled image of this image button. This is the image that is displayed when this image
   * button disabled.
   * @param strImage {String}
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setDisabledImage = function(strImage) { this.jsxdisabledimage = strImage; return this; };

  /**
   * Returns the current state of this image button.
   * @return {int} <code>STATE_OFF</code> or <code>STATE_ON</code>
   * @see #STATE_OFF
   * @see #STATE_ON
   */
  ImageButton_prototype.getState = function() { return this.jsxstate; };

  /**
   * Sets the current state of this image button and updates the displayed image accordingly.
   * @param intState {int} <code>STATE_OFF</code> or <code>STATE_ON</code>
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setState = function(intState) {
    this.jsxstate = intState;
    var img = this.getRendered();
    if (img)
      img.childNodes[0].childNodes[0].src = this._getCurrentImageURL(false, false);
    return this;
  };

  /**
   * Returns the type of this image button.
   * @return {int} <code>TYPE_NORMAL</code> or <code>TYPE_TOGGLE</code>
   * @see #TYPE_NORMAL
   * @see #TYPE_TOGGLE
   */
  ImageButton_prototype.getType = function() { return this.jsxtype; };

  /**
   * Sets the type of this image button.
   * @param intType {int} <code>TYPE_NORMAL</code> or <code>TYPE_TOGGLE</code>
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setType = function(intType) { this.jsxtype = intType; return this; };

  /**
   * Returns <code>true</code> if the images of this image button are pre-fetched.
   * @return {boolean}
   */
  ImageButton_prototype.isPreFetch = function() { return this.jsxprefetch; };

  /**
   * Sets whether if the images of this image button are pre-fetched. Pre-fetching allows for better responsiveness
   * the first time a state image is displayed.
   * @param bFetch {boolean}
   * @return {jsx3.gui.ImageButton} this object
   */
  ImageButton_prototype.setPreFetch = function(bFetch) { this.jsxprefetch = jsx3.Boolean.valueOf(bFetch); return this; };

  ImageButton_prototype.setEnabled = function(intEnabled, bRepaint) {
    if (this._jsxhotkey != null)
      this._jsxhotkey.setEnabled(intEnabled == Form.STATEENABLED);
    return this.jsxsupermix(intEnabled, bRepaint);
  };

  ImageButton.BRIDGE_EVENTS = {};
  ImageButton.BRIDGE_EVENTS[Event.CLICK] = true;
  ImageButton.BRIDGE_EVENTS[Event.MOUSEOVER] = true;
  ImageButton.BRIDGE_EVENTS[Event.MOUSEOUT] = true;
  ImageButton.BRIDGE_EVENTS[Event.MOUSEDOWN] = true;
  ImageButton.BRIDGE_EVENTS[Event.MOUSEUP] = true;
  ImageButton.BRIDGE_EVENTS[Event.KEYDOWN] = true;

  /**
   * Paints this image button.
   * @return {String}
   */
  ImageButton_prototype.paint = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    var bEnabled = this.getEnabled() == Form.STATEENABLED;

    //register any accelerator bindings
    var myKeyBinding = this.getKeyBinding();
    if (myKeyBinding) {
      var me = this;
      if (this._jsxhotkey != null)
        this._jsxhotkey.destroy();
      this._jsxhotkey = this.doKeyBinding(function(e){ me._ebClick(e, me.getRendered()); }, myKeyBinding);
      if (this._jsxhotkey) this._jsxhotkey.setEnabled(bEnabled);
    }

    //render the relevant events (add other interfaces later for user-defined events)
    var strEvents = this.renderHandlers(bEnabled ? ImageButton.BRIDGE_EVENTS : null, 0);
    //render custom attributes
    var strAttributes = this.renderAttributes(null, true);

    //paint the outer-most box
    var b1 = this.getBoxProfile(true);
    b1.setAttributes('id="' + this.getId() + '"' + this.paintLabel() + this.paintIndex() + ' class="' + (bEnabled ? "jsx30imagebutton" : "jsx30imagebutton_disabled") + '"' + strEvents + strAttributes);
    b1.setStyles(this.paintCursor(true) + this.paintVisibility() + this.paintDisplay() + this.paintZIndex() +
        this.paintBackgroundColor() + this.paintCSSOverride());

    var w = b1.getClientWidth();
    w = w != null ? ' width="' + w + '"' : "";
    var h = b1.getClientHeight();
    h = h != null ? ' height="' + h + '"' : "";
    var img = '<img src="' + this._getCurrentImageURL(false, false) + '"' + w + h + this.paintTip() + this.paintText() + '/>';

    if (! this._jsxpaintedonce && this.isPreFetch()) {
      var resolver = this.getUriResolver();
      // resolve each of the possible images to load ...
      var images = [this.getImage(), this.getOverImage(), this.getDownImage(), this.getOnImage(),
          this.getDisabledImage()].map(function(x) { return x ? resolver.resolveURI(x) : null; });

      jsx3.html.loadImages(images);
      /* @jsxobf-clobber */
      this._jsxpaintedonce = true;
    }

    var b1a = b1.getChildProfile(0);
    
    //return final string of HTML
    return b1.paint().join(b1a.paint().join(img));
  };

  /**
   * Creates the box model/profile for the object
   * @return {jsx3.gui.Painted.Box} If provided, the profile instance that will contain this profile instance.
   * @private
   */
  ImageButton_prototype.createBoxProfile = function() {
    //apply any dynamic properties that this instance has registered
    this.applyDynamicProperties();

    //determine relative position (this will affect left, top, and boxtype properties)
    var bRelative = this.getRelativePosition() != 0;

    //create the outer box
    var o = this.getParent() ? (this.getParent().getClientDimensions(this) || {}) : {};

    if (!bRelative && o.left == null && !jsx3.util.strEmpty(this.getLeft())) o.left = this.getLeft();
    if (!bRelative && o.top == null && !jsx3.util.strEmpty(this.getTop())) o.top = this.getTop();
    if (o.width == null && !(this.getWidth() == null || isNaN(this.getWidth()))) o.width = this.getWidth();
    if (o.height == null && !(this.getHeight() == null || isNaN(this.getHeight()))) o.height = this.getHeight();
    o.tagname = "span";
    if(o.boxtype == null)
      o.boxtype = (bRelative || o.left == null || o.top == null) ? "relativebox" : "box";
    if (o.padding = null && this.getPadding() != null) o.padding = this.getPadding();
    if (o.margin == null && bRelative && this.getMargin() != null) o.margin = this.getMargin();
    if (o.border == null && this.getBorder() != null) o.border = this.getBorder();

    var b1 = new jsx3.gui.Painted.Box(o);

    o = {tagname: "div", boxtype: "inline", height: b1.getClientHeight()};
    b1.addChildProfile(new jsx3.gui.Painted.Box(o));

    return b1;
  };

  ImageButton_prototype.updateBoxProfile = function(objImplicit, objGUI, objQueue) {
    this.updateBoxProfileImpl(objImplicit, objGUI, objQueue, 1);
  };

  /** @private @jsxobf-clobber */
  ImageButton_prototype._getCurrentImageURL = function(bOver, bDown) {
    var strPath = null;

    if (this.getEnabled() == Form.STATEENABLED) {
      if (bOver)
        strPath = this.getOverImage();
      else if (bDown)
        strPath = this.getDownImage();

      if (this.getType() == ImageButton.TYPE_TOGGLE && this.getState() == ImageButton.STATE_ON)
        strPath = strPath || this.getOnImage();
    } else {
      strPath = this.getDisabledImage();
    }

    strPath = strPath || this.getImage();
    return strPath ? this.getUriResolver().resolveURI(strPath) : "";
  };

  // event bridge

  /** @private */
  ImageButton_prototype._ebClick = function(objEvent, objGUI) {
    if (!objEvent.leftButton() && objEvent.isMouseEvent()) return;

    if (this.getType() == ImageButton.TYPE_TOGGLE) {
      var newState = this.getState() == ImageButton.STATE_OFF ? ImageButton.STATE_ON : ImageButton.STATE_OFF;
      var bCancel = this.doEvent(Interactive.TOGGLE, {objEVENT:objEvent, intSTATE:newState, _gipp:1});
      if (bCancel !== false) {
        this.setState(newState);
        objGUI.childNodes[0].childNodes[0].src = this._getCurrentImageURL(false, false);
      }
    }
    this.doEvent(Interactive.EXECUTE, {objEVENT:objEvent});
  };

  /** @private */
  ImageButton_prototype._ebMouseOver = function(objEvent, objGUI) {
    objGUI.childNodes[0].childNodes[0].src = this._getCurrentImageURL(true, false);
  };

  /** @private */
  ImageButton_prototype._ebMouseOut = function(objEvent, objGUI) {
    objGUI.childNodes[0].childNodes[0].src = this._getCurrentImageURL(false, false);
  };

  /** @private */
  ImageButton_prototype._ebMouseDown = function(objEvent, objGUI) {
    if (objEvent.leftButton())
      objGUI.childNodes[0].childNodes[0].src = this._getCurrentImageURL(false, true);
  };

  /** @private */
  ImageButton_prototype._ebMouseUp = function(objEvent, objGUI) {
    if (objEvent.rightButton())
      this.jsxsupermix(objEvent, objGUI);
    else if (objEvent.leftButton())
      objGUI.childNodes[0].childNodes[0].src = this._getCurrentImageURL(false, false);
  };

  /** @private */
  ImageButton_prototype._ebKeyDown = function(objEvent, objGUI) {
    if (objEvent.enterKey() || objEvent.spaceKey()) {
      this._ebClick(objEvent, objGUI);
      objEvent.cancelAll();
    }
  };

  /**
   * If this image button is of type <code>TYPE_TOGGLE</code>, then the state must be either <code>STATE_ON</code>
   * or required must be <code>OPTIONAL</code> to pass validation.
   * @return {int}
   */
  ImageButton_prototype.doValidate = function() {
    var state = null;

    if (this.getType() == ImageButton.NORMAL)
      state = Form.STATEVALID;
    else
      state = this.getState() == ImageButton.STATE_ON || this.getRequired() == Form.OPTIONAL ?
          Form.STATEVALID : Form.STATEINVALID;

    this.setValidationState(state);
    return state;
  };

  ImageButton_prototype.emGetType = function() {
    return jsx3.gui.Matrix.EditMask.FORMAT;
  };

  ImageButton_prototype.emInit = function(objColumn) {
    this.jsxsupermix(objColumn);
  };

  ImageButton_prototype.emSetValue = function(strValue) {
  };

  ImageButton_prototype.emGetValue = function() {
    return null;
  };

  ImageButton_prototype.emBeginEdit = function(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD) {
    var toFocus = objTD.childNodes[0].childNodes[0];
    if (toFocus) {
      this.jsxsupermix(strValue, objTdDim, objPaneDim, objMatrix, objColumn, strRecordId, objTD);
      jsx3.html.focus(toFocus);
    } else {
      return false;
    }
  };

  ImageButton_prototype.emPaintTemplate = function() {
    this.setEnabled(Form.STATEDISABLED);
    var disabled = this.paint();
    this.setEnabled(Form.STATEENABLED); // need to have it enabled afterwards
    var enabled = this.paint();
    return this.emGetTemplate(enabled, disabled);
  };

  ImageButton_prototype.paintText = function() {
    var myTip = this.getText();
    return myTip ? ' alt="' + myTip.replace(/"/g, "&quot;") + '" ' : ' alt=""';
  };

  ImageButton_prototype.onDestroy = function(objParent) {
    if (this._jsxhotkey) 
      this._jsxhotkey.destroy();
    this.jsxsuper(objParent);
  };

  ImageButton_prototype.onSetChild = function(objChild) {
    return false;
  };
  
});
