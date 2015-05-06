/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _id _expr

/**
 *
 */
jsx3.lang.Class.defineInterface("jsx3.amp.Bindable", null, function(Bindable, Bindable_prototype) {

  /** @private @jsxobf-clobber */
  Bindable_prototype._getBindings = function() {
    if (!this._bindings)
      this._bindings = jsx3.$H();
    return this._bindings;
  };

  /**
   * Adds a bindable property to this object.
   * @param key {String} the property name.
   * @param expression {String} the binding expression.
   */
  Bindable_prototype.addBindableProp = function(key, expression) {
    var b = this._getBindings();
    b[key] = {_id:key, _expr:expression};
  };

  /**
   * Returns the list of bindable properties of this object.
   * @return {jsx3.$Array<String>}
   */
  Bindable_prototype.getBindableProps = function() {
    return this._getBindings().keys();
  };

  /**
   * Causes a bindable property to be updated when <code>publisher</code> publishes an event with subject
   * <code>subject</code>.
   * @param key {String} the property to update.
   * @param publisher {jsx3.util.EventDispatcher} the object to which to subscribe.
   * @param subject {String} the event subject to which to subscribe.
   */
  Bindable_prototype.updateBindableOn = function(key, publisher, subject) {
    publisher.subscribe(subject, jsx3.$F(this.updateBindable).bind(this, [key]));
  };

  /**
   * Causes a bindable property of this object to be recalculated. The property is set to the value of the
   * binding expression, evaluated in the context of this object. If the property value has changed then this
   * object will publish an event with subject <code>key</code>.
   * @param key {String} the property to recalculate.
   */
  Bindable_prototype.updateBindable = function(key) {
    var b = this._getBindings()[key];
    this.setBindableProp(key, this.eval(b._expr));
  };

  /**
   * Sets the current calculated value of a bindable property of this object. If the new value does not match
   * the old value, an event is published. The schema of the event is
   * <code>{subject: propName, oldValue: previousValue, value: newValue}</code>.
   * @param key {String} the property name.
   * @param newValue {Object} the next calculated value.
   */
  Bindable_prototype.setBindableProp = function(key, newValue) {
    var oldValue = this[key];
    if (oldValue !== newValue) {
      this[key] = newValue;
      if (this.publish)
        this.publish({subject:key, oldValue:oldValue, value:newValue});
    }
  };

});
