/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

var specs = [
  "jsx3/ext.js", "jsx3/pkg.js",

  /* Reflection and metadata suite */
  "jsx3/lang/pkg.js", "jsx3/lang/object.js", "jsx3/lang/method.js", "jsx3/lang/class.js",
  "jsx3/lang/package.js", "jsx3/lang/aop.js",

  /* Exception and error suite */
  "jsx3/lang/exception.js", "jsx3/lang/error.js",

  /* Other utilities suite */
  "jsx3/util/pkg.js", "jsx3/util/eventdispatcher.js", "jsx3/util/list.js",  "jsx3/util/logger.js",

  /* URI and URI resolver suite */
  "jsx3/net/uri.js", "jsx3/net/uriresolver.js",

  /* App suite */
  "jsx3/app/cache.js", "jsx3/app/properties.js","jsx3/app/dom.js","jsx3/app/settings.js", "jsx3/app/server.js",

  /* XML suite 1 */
  "jsx3/xml/document.js","jsx3/xml/entity.js",

  /* XML suite 2 */
  "jsx3/xml/cdf.js", "jsx3/xml/processor.js","jsx3/xml/template.js",

  /* HTML suite */
  "jsx3/html/dom.js",

  /* Server suite */
  "jsx3/net/request.js",
  "jsx3/app/model.js", "jsx3/xml/cacheable.js",
  "jsx3/net/service.js", "jsx3/net/form.js",

  /* Localization suite */
  "jsx3/util/dateformat.js", "jsx3/util/locale.js", "jsx3/util/numberformat.js", "jsx3/util/messageformat.js",

  /* GUI suite */
  "jsx3/gui/nativeform.js",
  "jsx3/gui/layoutgrid.js", "jsx3/gui/numberinput.js", 
  "jsx3/gui/block.js", "jsx3/gui/gui_layout.js", "jsx3/gui/select.js", "jsx3/gui/textbox.js","jsx3/gui/cdf.js",
  "jsx3/gui/button.js","jsx3/gui/checkbox.js","jsx3/gui/colorPicker.js","jsx3/gui/datePicker.js","jsx3/gui/dialog.js",
  "jsx3/gui/timePicker.js", "jsx3/gui/radioButton.js", "jsx3/gui/slider.js", "jsx3/gui/matrix.js","jsx3/gui/matrix_column.js", "jsx3/gui/label.js",
  "jsx3/gui/table.js"

];

gi.test.jasmine.loadTestSpecs(specs);
