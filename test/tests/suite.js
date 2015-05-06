/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/*
 * This file defines all the JavaScript test files that comprise the GI testing suite. Files should
 * be referenced relatively from the tests/ directory.
 *
 *
 */

var alreadyRan = false;

function suite() {
  gi.test.jsunit.warn("suite() in suite.js");

  // Chrome seems to call this function twice for some reason
  if (alreadyRan)
    return gi.test.jsunit.newJsSuite();

  alreadyRan = true;
  
  return gi.test.jsunit.newJsSuite(
      ["jsx3/t_ext.js"],

      /* Reflection and metadata suite */
      ["jsx3/lang/t_pkg.js", "jsx3/lang/t_object.js", "jsx3/lang/t_method.js", "jsx3/lang/t_class.js",
          "jsx3/lang/t_package.js", "jsx3/lang/t_aop.js"],

      /* Exception and error suite */
      ["jsx3/lang/t_exception.js", "jsx3/lang/t_error.js"],

      /* Other utilities suite */
      ["jsx3/t_pkg.js", "jsx3/util/t_pkg.js", "jsx3/util/t_eventdispatcher.js", "jsx3/util/t_list.js",
          "jsx3/util/t_logger.js"],

      /* URI and URI resolver suite */
      ["jsx3/net/t_uri.js", "jsx3/net/t_uriresolver.js"],

      /* XML suite 1 */
      ["jsx3/xml/t_document.js", "jsx3/xml/t_entity.js"],

      /* XML suite 2 */
      ["jsx3/xml/t_processor.js", "jsx3/xml/t_template.js", "jsx3/xml/t_cdf.js"],

      /* App suite */
      ["jsx3/app/t_properties.js", "jsx3/app/t_cache.js", "jsx3/app/t_dom.js", "jsx3/app/t_settings.js"],

      /* Server suite */
      ["jsx3/net/t_request.js", "jsx3/app/t_server.js", "jsx3/app/t_model.js", "jsx3/xml/t_cacheable.js",
          "jsx3/net/t_service.js", "jsx3/net/t_form.js"],

      /* Localization suite */
      ["jsx3/util/t_locale.js", "jsx3/util/t_dateformat.js", "jsx3/util/t_numberformat.js",
          "jsx3/util/t_messageformat.js"],
      
      /* GUI suite */
      ["jsx3/gui/t_layoutgrid.js", "jsx3/gui/t_nativeform.js", "jsx3/gui/t_numberinput.js"]
  );
}
