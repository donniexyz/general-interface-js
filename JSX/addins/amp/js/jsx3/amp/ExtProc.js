/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _getConstructor

/**
 * An extension processor utility class.
 *
 * @see #process()
 * @see jsx3.amp.ExtPoint#processExts()
 */
jsx3.lang.Class.defineClass("jsx3.amp.ExtProc", null, null, function(ExtProc, ExtProc_prototype) {

  var amp = jsx3.amp;

  /**
   * Processes a list of extensions using the visitor pattern. For each extension in <code>arrExt</code>, this
   * method iterates over each child element of the extension declaration and invokes <code>objVisitor</code> for
   * each element. At each iteration the visitor is passed as arguments the extension object and an XML object
   * representing the child element.
   *
   * @param arrExt {Array<jsx3.amp.Ext>}
   * @param objVisitor {Function | Object} an object that defines method
   *     <code>process(ext : jsx3.amp.Ext, data: jsx3.amp.XML) : Object</code> or the function itself.
   * @return {jsx3.$Array}
   */
  ExtProc.process = function(arrExt, objVisitor) {
    var o = jsx3.$A();

    for (var i = 0; i < arrExt.length; i++) {
      var ext = arrExt[i];
      var data = ext.getData();
      for (var j = 0; j < data.length; j++) {
        var elm = data[j];

        if (typeof(objVisitor) == "function") {
          o.push(objVisitor(ext, elm));
        } else {
          o.push(objVisitor.process(ext, elm));
        }
      }
    }

    return o;
  };

  /** @private @jsxobf-clobber */
  ExtProc._PROC_FACTORIES = {
    "eval": function(x) { return ExtProc.EVAL; },
    "return": function(x) { return ExtProc.RETURN; },
    "return-async": function(x) { return ExtProc.RETURN_ASYNC; },
    "instantiator": function(x) { return ExtProc.newDescrProc(x.attr("instance-class")); }
  };

  /**
   * Registers a processor factory. A processor factory is the object responsible for creating a processor when
   * a <code>&lt;processor&gt;</code> is found as a child of an <code>&lt;extension-point&gt;</code> element. Each processor element must
   * declare a type attribute. The factory that has been registered with the matching type is used to create
   * the processor. The method signature of the factory method is:
   * <code>function(xml : jsx3.amp.XML) : jsx3.amp.ExtProc</code> where <code>xml</code> is the XML representation
   * of the <code>&lt;processor&gt;</code> element.
   *
   * @param strType {String} the type of processor that the factory creates.
   * @param fctFactory {Function} the factory function.
   */
  ExtProc.addProcessorFactory = function(strType, fctFactory) {
    ExtProc._PROC_FACTORIES[strType] = fctFactory;
  };

  /**
   * Creates a processor object from a <code>&lt;processor&gt;</code> element.
   * @param strType {String} the type attribute of the <code>&lt;processor&gt;</code> element.
   * @param xml {jsx3.amp.XML} the <code>&lt;processor&gt;</code> element.
   * @see #addProcessorFactory()
   */
  ExtProc.getProcessor = function(strType, xml) {
    var factory = ExtProc._PROC_FACTORIES[strType];
    if (factory) {
      return factory(xml);
    } else {
      return null;
    }
  };

  /** @private @jsxobf-clobber */
  ExtProc._DESCRIPTOR_VISITOR = function(fctConstructor) {
    this._constructor = fctConstructor;
  };
  
  ExtProc._DESCRIPTOR_VISITOR.prototype.process = function(objExt, objData) {
    var className = objData.attr("ext-class");
    var c = this._constructor;
    if (className) {
      var customClass = amp._getConstructor(className);
      
      if (customClass)
        c = customClass
      else
        amp.LOG.error(jsx3._msg("amp.36", className));
    }

    return new c(objExt, objData);
  };
  
  /**
   * {jsx3.amp.ExtProc}
   * Processes an extension by intepreting each child element of the XML extension declaration as code to evaluate.
   * The element should be named "eval" and the text body of the element is taken as the JavaScript to evaluate.
   * The script is evaluated in the context of the extension object. So, for example, <code>this.getPlugIn()</code>
   * grants access in the script to the plug-in defining the extension.
   * <p/>
   * No value is returned from the extension processing. If the <code>load</code> attribute of the <code>eval</code>
   * element is equal to "true" then the plug-in owning the extension is loaded before the script is evaluated.
   * Therefore, the script may be evaluated either synchronously or asynchronously, but since there is no value returned
   * from the processing, there is no way of knowing which one actually occurred.
   */
  ExtProc.EVAL = {
    process: function(objExt, objData) {
      var bLoad = objData.attr("load") == "true";
      var script = objData.value();

      if (bLoad) {
        objExt.getPlugIn().load().when(function() {
          objExt.eval(script);
        });
      } else {
        objExt.eval(script);
      }
    }
  };

  /**
   * {jsx3.amp.ExtProc}
   * Processes an extension by intepreting each child element of the XML extension declaration as code to evaluate.
   * The element should be named "eval" and the text body of the element is taken as the JavaScript to evaluate.
   * The script is evaluated in the context of the extension object. So, for example, <code>this.getPlugIn()</code>
   * grants access in the script to the plug-in defining the extension.
   * <p/>
   * The value that the script evaluates to is returned from the extension processing.
   */
  ExtProc.RETURN = {
    process: function(objExt, objData) {
      var script = objData.value();
      return objExt.eval(script);
    }
  };

  /**
   * {jsx3.amp.ExtProc}
   * Processes an extension by intepreting each child element of the XML extension declaration as code to evaluate.
   * The element should be named "eval" and the text body of the element is taken as the JavaScript to evaluate.
   * The script is evaluated in the context of the extension object. So, for example, <code>this.getPlugIn()</code>
   * grants access in the script to the plug-in defining the extension.
   * <p/>
   * The value returned from the extension processing is an asynchronous return value as defined in the contract for
   * <code>jsx3.$Y()</code>. The return value may be notified either asynchronously or synchronously, depending on
   * whether the <code>load</code> attribute of the <code>eval</code> element is equal to "true". If it is, then
   * the plug-in owning the extension is loaded first and then the script is evaluated asynchronously. The asynchronous
   * return value is notified of completion with the value that the script evaluates to.
   */
  ExtProc.RETURN_ASYNC = {
    process: jsx3.$Y(function(cb) {
      var objExt = cb.args()[0];
      var objData = cb.args()[1];

      var bLoad = objData.attr("load") == "true";
      var script = objData.value();

      if (bLoad) {
        objExt.getPlugIn().load().when(function() {
          cb.done(objExt.eval(script));
        });
      } else {
        cb.done(objExt.eval(script));
      }
    })
  };

  /**
   * Creates a new extension processor that creates instances of a certain class. The only requirement of the class
   * is that is have a two-argument constructor with the signature:
   * <code>function init(ext : jsx3.amp.Ext, xml : jsx3.amp.XML)</code>.
   * <p/>
   * The processing visitor will create a new instance of <code>objClass</code> for each child element of each
   * extension. If any child element defines a <code>ext-class</code> attribute, this is interpreted as the
   * fully-qualified class name of a subclass of <code>objClass</code>. This class, if it is defined, will be used
   * instead of <code>objClass</code> to process that particular child element.
   *
   * @param objClass {String|jsx3.lang.Class|Function} a class or constructor.
   * @return {jsx3.amp.ExtProc}
   */
  ExtProc.newDescrProc = function(objClass) {
    return new ExtProc._DESCRIPTOR_VISITOR(amp._getConstructor(objClass));
  };

});
