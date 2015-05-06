/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * The public API of the General Interface IDE. This package is only available when running in the IDE.
 *
 * @jsxdoc-definition  jsx3.Package.definePackage("jsx3.ide", null, function(){});
 */

/**
 * {jsx3.app.Server} The server instance corresponding to the application opened in the IDE.
 *
 * @jsxdoc-definition  ide.SERVER = null;
 */

/**
 * Returns the collection of DOM objects currently selected in the Component Hierarchy palette. Returns an empty
 * array if that palette is closed.
 *
 * @param-package bIncludeBody {boolean}
 * @return {Array<jsx3.app.Model>}
 *
 * @jsxdoc-definition  ide.getSelected = function(bIncludeBody) {};
 */

/**
 * Returns the server instance corresponding to the currently active component editor tab. If no tab is open or the
 * active tab is not a component editor, this method returns <code>null</code>.
 *
 * @return {jsx3.app.Server}
 *
 * @jsxdoc-definition  ide.getActiveServer = function() {};
 */

/**
 * Loads a template catalog for the Properties Editor, Events Editor, or XSL Parameters palettes.
 *
 * @param strType {String} <code>prop</code>, <code>event</code>, or <code>xsl</code>.
 * @param strPath {String} the path to the catalog file.
 * @param objResolver {jsx3.net.URIResolver} the object against which to resolve URIs contained in the catalog file.
 * @see #registerTemplateForClass()
 *
 * @jsxdoc-definition  ide.loadTemplateCatalog = function(strType, strPath, objResolver) {};
 */

/**
 * Registers a template for a particular class in the Properties Editor, Events Editor, or XSL Parameters palettes.
 *
 * @param strType {String} prop, event, or xsl.
 * @param strClass {String} the fully-qualified class name.
 * @param strPath {String | Function} the resolved path to the template file, or a function with
 *    signature <code>function(objJSX : jsx3.app.Model) : jsx3.xml.Document</code>
 *
 * @jsxdoc-definition  ide.registerTemplateForClass = function(strType, strClass, strPath) {};
 */
