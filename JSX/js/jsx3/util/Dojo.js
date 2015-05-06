/**
 * This provides a static instance that acts as a bridge to Dojo's publish/subscribe hub.
 * Events on dojo's hub can be subscribed to through this instance, which implements the
 * EventDispatcher interface. Events can also be published through this bridge, and they
 * will be broadcast on Dojo's hub.
 * @package
*/
jsx3.Class.defineClass("jsx3.util.DojoPubSub", null, [jsx3.util.EventDispatcher], function(DojoPubSub, DojoPubSub_prototype) {

  var eventHandlers = {};
  var defaultPublish = jsx3.util.EventDispatcher.prototype.publish;

  DojoPubSub_prototype.publish = function(message) {
    if (jsx3.util.Dojo.isLoaded()) {
      message._fromGI = true;
      dojo.publish(message.subject, [message]);
      return defaultPublish.call(this, message);
    }
  };

  DojoPubSub_prototype.subscribe = function(topic, context, method) {
    if (jsx3.util.Dojo.isLoaded()) {
      var self = this;
      if (!eventHandlers[topic]) {
        eventHandlers[topic] = dojo.subscribe(topic, null, function(m) {
          if(!(m && m._fromGI)) {
            var message = {subject: topic};
            for (var i = 0; i < arguments.length; i++) {
              message[i] = arguments[i];
            }
            defaultPublish.call(self, message);
          }
        });
      }
      return this.jsxsupermix(topic, context, method);
    }
  };

});

/**
 * Provides the ability to load the Dojo JavaScript library.
 *
 * @see jsx3.gui.DojoWidget
 * @see jsx3.xml.DojoDataStore
 */
jsx3.Class.defineClass("jsx3.util.Dojo", null, null, function(Dojo) {

  /**
   * {jsx3.util.EventDispatcher}
   * A bridge to Dojo's publish/subscribe hub. Events on the Dojo hub can be subscribed to through this
   * instance. Events can also be published through this bridge, and they will be broadcast on the Dojo hub.
   * <code>Dojo.load()</code> must be called before this object can be used.
   * @see #load()
   */
  Dojo.hub = new jsx3.util.DojoPubSub();

  /**
   * Returns the resolved path to Dojo or a file within Dojo. Dojo is assumed to be installed in the directory
   * <code>dojo-toolkit/</code> as a peer of <code>JSX/</code>. This location may be overridden by setting the
   * <code>jsx_dojo</code> deployment parameter.
   *
   * @param s {String} the relative path of a Dojo resource.
   */
  Dojo.getPath = function(s) {
    var prefix = jsx3.getEnv("jsx_dojo") || "jsx:/../dojo-toolkit";
    return jsx3.resolveURI(prefix + (s ? s : ""));
  };

  /**
   * Loads the Dojo JavaScript library. Dojo must be installed at URI <code>jsx:/../dojo-toolkit</code> or the
   * <code>jsx_dojo</code> deployment parameter must be set to the location where Dojo is installed.
   */
  Dojo.load = function() {
    if (typeof dojo == "undefined") {
      window.djConfig = typeof djConfig == "undefined" ? {baseUrl: jsx3.util.Dojo.getPath("/dojo/"), afterOnLoad: true} : djConfig;
      // if we are running from the source version, we will pretend we are spidermonkey
      // providing a load function, which will use the sync loader instead of the
      // destructive document.write technique used by the source version of dojo.js

      load = function(script){
        jsx3.CLASS_LOADER.loadJSFileSync(script.replace(/rhino|spidermonkey/,"browser"));
      };
      jsx3.CLASS_LOADER.loadJSFileSync(jsx3.util.Dojo.getPath("/dojo/dojo.js"));
      delete load;

      // we have to grab the font-size and font-family styles off of the JSXBODY
      // element and apply them to the html element so that the styles defined by
      // dijit inherit them
      var jsxbody = dojo.query('[label="JSXBODY"]')[0];
      dojo.style(dojo.query('html')[0], {
        'fontSize': dojo.style(jsxbody, 'fontSize'),
        'fontFamily': dojo.style(jsxbody, 'fontFamily')
      });
    }
  };

  /**
   * Returns whether Dojo has been loaded.
   * @return {boolean}
   */
  Dojo.isLoaded = function() {
    return typeof dojo != "undefined";
  };
  
});
