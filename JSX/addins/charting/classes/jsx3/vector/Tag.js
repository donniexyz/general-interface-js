/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _native _children _parent
/**
 * The base class for jsx3.vector.Group and jsx3.vector.Shape. Defines getters and setters for the shared vector
 * tag attributes and CSS style extensions.
 */
jsx3.Class.defineClass("jsx3.vector.Tag", jsx3.html.BlockTag, null, function(Tag, Tag_prototype) {

  /**
   * The instance initializer.
   * @param strTagName {String}
   * @param left {int} left position (in pixels) of the object relative to its parent container
   * @param top {int} top position (in pixels) of the object relative to its parent container
   * @param width {int} width (in pixels) of the object
   * @param height {int} height (in pixels) of the object
   */
  Tag_prototype.init = function(strTagName, left, top, width, height) {
    this.jsxsuper(jsx3.vector.TAGNS, strTagName, left, top, width, height);
  };

  /**
   * Returns the tooltip, the text that is displayed on mouse over.
   */
  Tag_prototype.getToolTip = function() {
    return this.getProperty("title");
  };

  /**
   * Sets the tooltip, the text that is displayed on mouse over.
   * @param title {String}
   */
  Tag_prototype.setToolTip = function( title ) {
    this.setProperty("title", title);
  };

/* @JSC */ if (jsx3.CLASS_LOADER.VML) {
  
  /**
   * Returns the rotation field.
   * @return {int} rotation
   */
  Tag_prototype.getRotation = function() {
    return this.getStyle("rotation");
  };

  /**
   * Sets the rotation field, an angle between 0 and 360.
   * @param rotation {int} the new value for rotation
   */
  Tag_prototype.setRotation = function( rotation ) {
    this.setStyle("rotation", rotation);
  };
  
  Tag_prototype.paintUpdate = function() {
    this.jsxsuper();
        
    var parent = this.getParent();
    if (this.getWidth() && this.getHeight()) {
      this.setProperty("coordsize", jsx3.vector.toVector2D(parseInt(this.getWidth()), parseInt(this.getHeight())));
    } else {
      this.removeProperty("coordsize");
    }
  };
  
/* @JSC */ } else if (jsx3.CLASS_LOADER.SVG) {
  
  Tag_prototype.setRotation = function( rotation ) {
    /* @jsxobf-clobber */
    this._rotation = rotation;
  };  

  Tag_prototype.setLeft = function(left) { 
    /* @jsxobf-clobber */
    this._left = left; 
  };

  Tag_prototype.setTop = function(top) { 
    /* @jsxobf-clobber */
    this._top = top; 
  };
  
  Tag_prototype.setWidth = function(width) { 
    /* @jsxobf-clobber */
    this._width = width; 
  };
  
  Tag_prototype.setHeight = function(height) { 
    /* @jsxobf-clobber */ 
    this._height = height;
  };
  
  Tag_prototype.setPosition = function(position) { 
    /* @jsxobf-clobber */
    this._position = position; 
  };
  
  Tag_prototype.getRotation = function() { return this._rotation; };
  Tag_prototype.getLeft = function() { return this._left; };
  Tag_prototype.getTop = function() { return this._top; };
  Tag_prototype.getWidth = function() { return this._width; };
  Tag_prototype.getHeight = function() { return this._height; };
  Tag_prototype.getPosition = function() { return this._position; };
  
  Tag_prototype.setZIndex = function(zIndex) {
    this.jsxsuper(zIndex);
    var parent = this.getParent();
    if (parent) {
      var children = parent.getChildren();
      
      for (var i = 0; i < children.length; i++) {
        var sibling = children[i];
        if (sibling instanceof Tag) {
          var sibZIndex = parseInt(sibling.getZIndex());
          if (zIndex < sibZIndex) {
            if (sibling != this) {
//              jsx3.log("moving " + this + "(" + zIndex + ") before " + sibling + "(" + sibZIndex + ")");
              parent._native.removeChild(this._native);
              parent._native.insertBefore(this._native, sibling._native);
            }
            break;
          }
        }
      }
    }
  };
  
  Tag_prototype.appendChild = function(child) {
    if (this.onAppendChild(child)) {
      if (child instanceof Tag && child.getParent() != null) {
        throw new jsx3.Exception("can't append " + child + " to " + this + 
            ", already has parent " + child._parent);
      }

      if (this._children == null) 
        this._children = [];
      
      if (child instanceof Tag) {
        var zIndex = parseInt(child.getZIndex());
        if (! isNaN(zIndex)) {
          for (var i = 0; i < this._children.length; i++) {
            var sibling = this._children[i];
            var sibZIndex = parseInt(sibling.getZIndex());
            if (zIndex < sibZIndex) {
//              jsx3.log("inserting " + child + "(" + zIndex + ") before " + sibling + "(" + sibZIndex + ")");
              this._native.insertBefore(child._native, sibling._native);
            }
          }
        }
      }
      
      if (child._native.parentNode == null)
        this._native.appendChild(child._native);
      
      this._children.push(child);
      child._parent = this;
    } else {
      throw new jsx3.Exception("Illegal to append child " + child + " to parent " + this + ".");
    }
  };
  
  Tag_prototype.getDefs = function() {
    var parent = this.getParent();
    return parent != null ? parent.getDefs() : null;
  };

/* @JSC */ }
  
});
