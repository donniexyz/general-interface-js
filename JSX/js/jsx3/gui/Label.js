/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Block");

/**
 * A native HTML &lt;label&gt; element, which supports targeting an input element with for="".
 *
 * @since 3.9
 */
jsx3.Class.defineClass("jsx3.gui.Label", jsx3.gui.Block, null, function(Label, Label_prototype) {

  var Event = jsx3.gui.Event;
  var Interactive = jsx3.gui.Interactive;

  /**
   * Returns the <b>for</b> target.
   * @return {String}
   * @see #setFormat()
   */
  Label_prototype.getFor = function() {
    return this.jsxfor;
  };

  /**
   * Sets the <code>for</code> target. The <code>for</code> target is the form element that this label applied to.
   * <code>strFor</code> should be either the unique name of the target in this application or a selection
   * expression that will uniquely select the target in this application. 
   *
   * @param strFor {String} the new format.
   * @see jsx3.app.Model.selectDescendants()
   */
  Label_prototype.setFor = function(strFor) {
    this.jsxfor = strFor;
  };

  Label_prototype.paint = function() {
    this.applyDynamicProperties();

    //if paint method called by subclass instance--an instance of JSXBlockX, use strData, not this.getText();
    var strData = this.paintText();

    //determine CSS style attributes unique to this JSXBlock instance
    var strId = this.getId();

    //bind programmatic listeners for drag, drop, spy, key, and move operations; either or; not both due to incompatibilities (some of these share the mousedown and therefore can collide--hence the if statement)
    //rules:  (Spyglass && (Move || Menu || Drag/Drop) && keydown)
    var eventMap = {};
    if (this.hasEvent(Interactive.JSXDOUBLECLICK))
      eventMap[Event.DOUBLECLICK] = true;
    if (this.hasEvent(Interactive.JSXCLICK))
      eventMap[Event.CLICK] = true;
    if (this.hasEvent(Interactive.JSXKEYDOWN))
      eventMap[Event.KEYDOWN] = true;
    if (this.getMenu() != null)
      eventMap[Event.MOUSEUP] = true;

    //get custom 'view' properties(custom props to add to the rended HTML tag)
    var strEvents = this.renderHandlers(eventMap, 0);
    var strAttributes = this.renderAttributes(null, true);

    //render the outer-most box
    var b1 = this.getBoxProfile(true);

    b1.setAttributes(this.paintIndex() + this.paintTip() + strEvents + ' id="' + strId + '"' +
                     ' class="' + this.paintClassName() + '" ' + this._paintFor() + strAttributes);
    b1.setStyles(this.paintFontSize() + this.paintBackgroundColor() + this.paintBackground() + this.paintColor() +
                 this.paintOverflow() + this.paintFontName() + this.paintZIndex() + this.paintFontWeight() +
                 this.paintTextAlign() + this.paintCursor() + this.paintVisibility() + this.paintBlockDisplay() +
                 this.paintCSSOverride());

    return b1.paint().join(strData + this.paintChildren());
  };

  Label_prototype.getTagName = function() {
    return "label";
  };

  /** @private @jsxobf-clobber */
  Label_prototype._paintFor = function() {
    var obj = this._getNodeRefField(this.jsxfor);
    return obj ? ' for="' + (obj.getInputId ? obj.getInputId() : obj.getId()) + '"' : '';
  };

});
