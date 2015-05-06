/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _onExecute

/**
 * Mixin interface allows implementors to show alerts, confirms, and prompts.
 *
 * @since 3.0
 */
jsx3.Class.defineInterface("jsx3.gui.Alerts", null, function(Alerts, Alerts_prototype) {

  var EXECUTE = "jsxexecute";

  /**
   * implementors of this mixin interface must implement this method
   * @return {jsx3.app.Model} the parent of the alert dialogs
   * @protected
   */
  Alerts_prototype.getAlertsParent = jsx3.Method.newAbstract();

  /**
   * Shows an alert dialog.
   * @param strTitle {String} the title of the dialog
   * @param strMessage {String} the message to display
   * @param fctOnOk {Function} callback function on pressing ok button, receives the dialog as an argument; if null the dialog will close itself; if defined must explicitly close the dialog
   * @param strOk {String} the text of the ok button, can be false to remove button from display
   * @param objParams {Object} argument to configureAlert()
   * @return {jsx3.gui.Dialog}
   * @see #configureAlert()
   */
  Alerts_prototype.alert = function(strTitle, strMessage, fctOnOk, strOk, objParams) {
    var resolver = jsx3.net.URIResolver.JSX;
    var dialog = this.getAlertsParent().loadAndCache('xml/components/dialog_alert.xml', false, jsx3.getSharedCache(), resolver);
    var ok = dialog.getDescendantOfName('ok');

    if (strTitle != null)
      dialog.getDescendantOfName('title').setText(strTitle);
    if (strMessage != null)
      dialog.getDescendantOfName('message').setText(strMessage);

    if (strOk === false)
      dialog.hideButton();
    else if (strOk != null)
      ok.setText(strOk);

    if (fctOnOk != null) {
      var onExecute = "_onExecute";
      ok._onExecute = fctOnOk;
      ok.setEvent("this." + onExecute + "(this.getAncestorOfType(jsx3.gui.Dialog));", EXECUTE);
    }

    this.configureAlert(dialog, objParams);
    this.getAlertsParent().paintChild(dialog);
    dialog.focus();
    return dialog;
  };

  /**
   * Shows an input prompt alert.
   * @param strTitle {String} the title of the dialog
   * @param strMessage {String} the message to display
   * @param fctOnOk {Function} callback function on pressing ok button, receives the dialog as an argument, and the value of the text input as a second argument; if null the dialog will close itself; if defined must explicitly close the dialog
   * @param fctOnCancel {Function} callback function on pressing cancel button, receives the dialog as an argument; if null the dialog will close itself; if defined must explicitly close the dialog
   * @param strOk {String} the text of the ok button
   * @param strCancel {String} the text of the cancel button
   * @param objParams {Object} argument to configureAlert()
   * @return {jsx3.gui.Dialog}
   * @see #configureAlert()
   */
  Alerts_prototype.prompt = function(strTitle, strMessage, fctOnOk, fctOnCancel, strOk, strCancel, objParams) {
    var resolver = jsx3.net.URIResolver.JSX;
    var dialog = this.getAlertsParent().loadAndCache('xml/components/dialog_prompt.xml', false, jsx3.getSharedCache(), resolver);
    var ok = dialog.getDescendantOfName('ok');
    var cancel = dialog.getDescendantOfName('cancel');

    if (strTitle != null)
      dialog.getDescendantOfName('title').setText(strTitle);
    if (strMessage != null)
      dialog.getDescendantOfName('message').setText(strMessage);
    if (strOk != null)
      ok.setText(strOk);
    if (strCancel != null)
      cancel.setText(strCancel);
    if (fctOnOk != null) {
      var onExecute = "_onExecute";
      ok._onExecute = fctOnOk;
      ok.setEvent("var d = this.getAncestorOfType(jsx3.gui.Dialog); this." + onExecute + "(d, d.getDescendantOfName('value').getValue());", EXECUTE);
    }
    if (fctOnCancel != null) {
      var onExecute = "_onExecute";
      cancel._onExecute = fctOnCancel;
      cancel.setEvent("this." + onExecute + "(this.getAncestorOfType(jsx3.gui.Dialog));", EXECUTE);
    }

    this.configureAlert(dialog, objParams);
    this.getAlertsParent().paintChild(dialog);
    jsx3.sleep(function(){dialog.getDescendantOfName('value').focus();});
    return dialog;
  };

  /**
   * Shows a confirm alert.
   * @param strTitle {String} the title of the dialog
   * @param strMessage {String} the message to display
   * @param fctOnOk {Function} callback function on pressing ok button, receives the dialog as an argument; if null the dialog will close itself; if defined must explicitly close the dialog
   * @param fctOnCancel {Function} callback function on pressing cancel button, receives the dialog as an argument; if null the dialog will close itself; if defined must explicitly close the dialog
   * @param strOk {String} the text of the ok button
   * @param strCancel {String} the text of the cancel button
   * @param intBtnDefault {int} the bold button that receives return key, 1:ok, 2:cancel, 3:no
   * @param fctOnNo {Function} callback function on pressing no button, receives the dialog as an argument; if null the dialog will close itself; if defined must explicitly close the dialog
   * @param strNo {String} the text of the no button
   * @param objParams {Object} argument to configureAlert()
   * @return {jsx3.gui.Dialog}
   * @see #configureAlert()
   */
  Alerts_prototype.confirm = function(strTitle, strMessage, fctOnOk, fctOnCancel, strOk, strCancel, intBtnDefault,
      fctOnNo, strNo, objParams) {
    var resolver = jsx3.net.URIResolver.JSX;
    var dialog = this.getAlertsParent().loadAndCache('xml/components/dialog_confirm.xml', false, jsx3.getSharedCache(), resolver);
    var ok = dialog.getDescendantOfName('ok');
    var cancel = dialog.getDescendantOfName('cancel');
    var no = dialog.getDescendantOfName('no');
    var buttons = [ok, cancel, no];
    intBtnDefault = intBtnDefault != null ? intBtnDefault - 1 : 0;

    if (strTitle != null)
      dialog.getDescendantOfName('title').setText(strTitle);
    if (strMessage != null)
      dialog.getDescendantOfName('message').setText(strMessage);
    if (strOk != null)
      ok.setText(strOk);
    if (strCancel != null)
      cancel.setText(strCancel);
    if (fctOnCancel != null) {
      var onExecute = "_onExecute";
      cancel._onExecute = fctOnCancel;
      cancel.setEvent("this." + onExecute + "(this.getAncestorOfType(jsx3.gui.Dialog));", EXECUTE);
    }
    if (fctOnOk != null) {
      var onExecute = "_onExecute";
      ok._onExecute = fctOnOk;
      ok.setEvent("this." + onExecute + "(this.getAncestorOfType(jsx3.gui.Dialog));", EXECUTE);
    }
    if (fctOnNo != null || strNo != null || intBtnDefault == 3) {
      if (strNo)
        no.setText(strNo);
      if (fctOnNo) {
        var onExecute = "_onExecute";
        no._onExecute = fctOnNo;
        no.setEvent("this." + onExecute + "(this.getAncestorOfType(jsx3.gui.Dialog));", EXECUTE);
      }
      no.setDisplay(jsx3.gui.Block.DISPLAYBLOCK);
    }

    var defaultBtn = buttons[intBtnDefault];
    if (defaultBtn) {
      defaultBtn.setFontWeight('bold');

      dialog.registerHotKey(function(objEvent) {
        if (objEvent.enterKey()) {
          this.getDescendantOfName(defaultBtn.getName()).doExecute(objEvent);
          objEvent.cancelBubble();
        }
      }, jsx3.gui.Event.KEY_ENTER, false, false, false);
    }

    this.configureAlert(dialog, objParams);
    this.getAlertsParent().paintChild(dialog);
    dialog.focus();
    return dialog;
  };

  /**
   * Configures the alert dialog.
   * @param objDialog {jsx3.gui.Dialog} the dialog
   * @param objParams {Object} may include fields 'width' {int}, 'height' {int},
   *     'noTitle' {boolean}, and 'nonModal' {boolean}.
   * @protected
   */
  Alerts_prototype.configureAlert = function(objDialog, objParams) {
    if (objParams == null) return;

    if (objParams.width)
      objDialog.setWidth(objParams.width, false);
    if (objParams.height)
      objDialog.setHeight(objParams.height, false);

    if (objParams.noTitle)
      objDialog.removeChild(objDialog.getChild('title'));

    if (objParams.nonModal)
      objDialog.setModal(jsx3.gui.Dialog.NONMODAL);
  };

});

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.gui.Alerts.
 * @see jsx3.gui.Alerts
 * @jsxdoc-definition  jsx3.Class.defineInterface("jsx3.Alerts", -, function(){});
 */
jsx3.Alerts = jsx3.gui.Alerts;

/* @JSC :: end */
