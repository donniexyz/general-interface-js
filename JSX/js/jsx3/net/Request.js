/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber-shared  _initFromReq

/**
 * A generic wrapper to hide the complexities and API-specifics of the native XMLHTTP control for a given browser.
 * Developers wishing to create/modify XML documents can use this class to access common XMLHTTP methods.
 * <p/>
 * Note that when using this interface to post xml content to a server, the called server may expect the content
 * type to be set for the posting.  For example,
 * <code>objRequest.setRequestHeader("Content-Type", "text/xml");</code>
 */
jsx3.Class.defineClass("jsx3.net.Request", null, [jsx3.util.EventDispatcher], function(Request, Request_prototype) {

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  Request.STATUS_OK = 200;

  /**
   * {int}
   * @package
   * @final @jsxobf-final
   */
  Request.STATUS_ERROR = 400;

  /**
   * {String} Event type published when the response has loaded.
   * @final @jsxobf-final
   */
  Request.EVENT_ON_RESPONSE = "response";

  /**
   * {String} Event type published when the server has not responded after the specified timeout period.
   * @final @jsxobf-final
   */
  Request.EVENT_ON_TIMEOUT = "timeout";

/* @JSC :: begin DEP */
  /** @private @jsxobf-clobber */
  Request.trackArray = {};
/* @JSC :: end */

  /**
   * The instance initializer.
   * @param id {String} <span style="text-decoration:line-through;">If the call will be asynchronous, assigns a unique identifier.</span>
   *    <b>Using this deprecated parameter will cause memory to leak. Don't use it.</b>
   */
  Request_prototype.init = function(id) {
/* @JSC :: begin DEP */
    if (id != null)
      Request.trackArray[id] = this;
/* @JSC :: end */

/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      /* @jsxobf-clobber */
      this._request = jsx3.getHttpInstance();
    } catch (e) {
      throw new jsx3.Exception(jsx3._msg("req_inst"), jsx3.NativeError.wrap(e));
    }
/* @JSC */ } else {
    try {
      this._request = new XMLHttpRequest();
    } catch (e) {
      throw new jsx3.Exception(jsx3._msg("req_inst"), jsx3.NativeError.wrap(e));
    }
/* @JSC */ }
  };

  /**
   * Aborts the request.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.abort = function() {
    if (this._timeoutto) {
      window.clearTimeout(this._timeoutto);
      delete this._timeoutto;
    }

    this._request.onreadystatechange = new Function();

    //call the native abotr
    this._request.abort();
    return this;
  };
  
  /** @private @jsxobf-clobber */
  Request_prototype._getNativeAttr = function(attr, type, arg1) {
    try {
      return type == 1 ? this._request[attr]() :
             type == 2 ? this._request[attr](arg1) :
                         this._request[attr];
    } catch (e) {
      this._status = 13030; // From Firefox documentation
      return null;
    }
  };

  /**
   * Gets the value of all the HTTP headers.
   * @return {String}
   */
  Request_prototype.getAllResponseHeaders = function() {
    return this._getNativeAttr("getAllResponseHeaders", 1);
  };

  /**
   * Gets the value of a specific HTTP response header.
   * @param strName {String} the name for the response header to retrieve.
   * @return {String}
   */
  Request_prototype.getResponseHeader = function(strName) {
    return this._getNativeAttr("getResponseHeader", 2, strName);
  };

  /**
   * Gets the HTTP response line status (e.g. "OK").
   * @return {String}
   */
  Request_prototype.getStatusText = function() {
    return this._getNativeAttr("statusText");
  };

  /**
   * Gets the HTTP response status code (e.g. 200, 404, 500, etc). The following code checks for a request error 
   * condition.
   * <pre>
   * r.send();
   * 
   * if (r.getStatus() &gt;= 200 &amp;&amp; r.getStatus() &lt; 400) {
   *   jsx3.log("success");
   * } else {
   *   jsx3.log("failed with status " + r.getStatus());
   * }
   * </pre>
   * <p/>
   * The native object that this <code>Request</code> wraps may have a status code that is not a valid HTTP code 
   * (200-599). This is especially true if an HTTP server was not involved in the request like, for example, if
   * the resource was loaded from the <code>file:///</code> scheme or if a network error occurred while contacting the
   * HTTP server. Moreover, the various supported browsers may have different status values for the same conditions. 
   * <p/>
   * This method attempts to constrain the possible status values that it returns. So, instead of returning 0 
   * (usually a success on the <code>file:////</code> scheme), it returns 200. When running in Safari certain  
   * status values known to be error conditions are returned as 400. If the native object's status is greater than 
   * 599 then this method makes no attempt to convert it. Such values should probably be interpreted as error 
   * conditions. When in doubt consult the documentation for the host browser. 
   * 
   * @return {int}
   */
  Request_prototype.getStatus = function() {
    var s = this._status;
    if (s == null)
      s = this._getNativeAttr("status");

/* @JSC */ if (jsx3.CLASS_LOADER.SAF) {
    // HACK: http://bugs.webkit.org/show_bug.cgi?id=14831
    if (s < 0 || s == 112) s = Request.STATUS_ERROR;
/* @JSC */ }
    
    return s == 0 ? Request.STATUS_OK : s;
  };

  /**
   * Gets the content of the response as string.
   * @return {String}
   */
  Request_prototype.getResponseText = function() {
    return this._request.responseText;
  };

  /**
   * Gets the content of the response as an XML document. If the response is not a valid XML document,
   * <code>null</code> is returned.
   * @return {jsx3.xml.Document}
   */
  Request_prototype.getResponseXML = function() {
    var objDoc = new jsx3.xml.Document();
    objDoc._initFromReq(this);

    if (!objDoc.hasError()) {
      return objDoc;
    } else {
      Request._log(2, jsx3._msg("req.bad_xml", this._url, objDoc.getError()));
      return null;
    }
  };

  /**
   * @return {XMLHttpRequest}
   * @deprecated
   */
  Request_prototype.getNative = function() {
    return this._request;
  };

  /**
   * Sets the value of a specific HTTP request header. The <code>open()</code> method should be called before calling
   * this method.
   * @param strName {String} the name for the request header to send to the server with the request content.
   * @param strValue {String} the value for the request header to send to the server with the request content.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.setRequestHeader = function(strName, strValue) {
    this._request.setRequestHeader(strName, String(strValue));
    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Gets the ready state for the request; return values include:
   *          0) The object has been created, but not initialized (the open method has not been called).
   *          1) The object has been created, but the send method has not been called.
   *          2) The send method has been called, but the status and headers are not yet available.
   *          3) Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.
   *          4) All the data has been received, and the complete data is available via the getResponseText()/getResponseXML() methods
   * @return {int}
   * @deprecated  This method is not consistent between browsers. Use the event publisher interface instead to track
   *    the state of the request.
   */
  Request_prototype.getReadyState = function() {
    //get handle to the XMLHTTP object associated with the SOAPSocket instance
    return this._request.readyState;
  };

/* @JSC :: end */

  /**
   * Creates and opens a request object. This is a factory method that creates the proper subclass of
   * <code>Request</code> based on the scheme of <code>strURL</code>.
   *
   * @param strMethod
   * @param strURL
   * @param bAsync
   * @param strUser
   * @param strPass
   *
   * @since 3.7
   * @see #addSchemeHandler()
   */
  Request.open = function(strMethod, strURL, bAsync, strUser, strPass) {
    var url = jsx3.net.URI.valueOf(strURL);

/* @JSC :: begin XD */
    if (Request.isXD(strURL)) {
      if (strMethod.toUpperCase() != "GET" || !bAsync || strUser || strPass)
        Request._log(2, jsx3._msg("req.xd_error", strMethod, strURL, bAsync, Boolean(strUser || strPass)));
      else
        return (new Request.XD()).open(strMethod, url);
    }
/* @JSC :: end */

    var scheme = url.getScheme();
    var handler = Request._HANDLERS[scheme] || Request.jsxclass;
    return (handler.newInstance()).open(strMethod, url, bAsync, strUser, strPass);
  };

  Request._HANDLERS = {};

  /**
   * Adds a handler that will field requests to a particular URL scheme.
   * @param scheme {String} the scheme that the handler to handle.
   * @param handler {jsx3.lang.Class} a custom subclass of Request.
   * @since 3.7
   */
  Request.addSchemeHandler = function(scheme, handler) {
    Request._HANDLERS[scheme] = handler;
  };

  /**
   * @param scheme {String}
   * @return {jsx3.lang.Class}
   * @package
   * @since 3.7
   */
  Request.getSchemeHandler = function(scheme) {
    return Request._HANDLERS[scheme];
  };

  /**
   * Initializes the request, and specifies the method, URL, and authentication information for the request.
   * @param strMethod {String} The HTTP method used to open the connection. Valid values include: GET, POST, or PUT.
   * @param strURL {String|jsx3.net.URI} The requested URL. This can be either an absolute URL, such as "http://www.TIBCO.com", or a relative URL, such as "../MyPath/MyFile".
   * @param bAsync {boolean} whether to issue the request asynchronously, if true this class will use the EventDispatcher interface to publish an event on response or timeout.
   * @param strUser {String} The name of the user for authentication. If this parameter is null ("") or missing and the site requires authentication, the native HTTP control will display a logon window.
   * @param strPass {String} The password for authentication. This parameter is ignored if the user parameter is null ("") or missing.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.open = function(strMethod, strURL, bAsync, strUser, strPass) {
//    if (!bAsync) {
//      Request._log(3, "Synchronous request to: " + strURL);
////      if (Request._LOG)
////        Request._LOG.logStack(4, "");
//    }

    this._status = 0;

    /* @jsxobf-clobber */
    this._async = Boolean(bAsync);
    /* @jsxobf-clobber */
    this._method = strMethod;
    /* @jsxobf-clobber */
    this._url = jsx3.net.URIResolver.DEFAULT.resolveURI(strURL);

/* @JSC */ if (! jsx3.CLASS_LOADER.IE) {
      try {
        if (window.netscape && netscape.security && netscape.security.hasOwnProperty())
          netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');
      } catch (e) {
        Request._log(5, jsx3._msg("req.netsc", jsx3.NativeError.wrap(e)));
      }
/* @JSC */ }

    //open the request, passing in relevant info and return object ref
    try {
      Request._log(6, jsx3._msg("req.open", this._url));
      this._request.open(strMethod, this._url.toString(), this._async, strUser, strPass);
    } catch (e) {
      this._status = Request.STATUS_ERROR; // communicate failure to client
      Request._log(2, jsx3._msg("req.err_open", strURL, jsx3.NativeError.wrap(e)));
    }

    return this;
  };

/* @JSC :: begin DEP */

  /**
   * Cancels the named request.
   * @param strRequestId {String} named id for the request (assigned by developer when the Request was instanced);
   * @deprecated  Use <code>abort()</code> instead.
   * @see #abort()
   */
  Request.cancelRequest = function(strRequestId) {
    var r = Request.trackArray[strRequestId];
    if (r) r.abort();
  };

  /**
   * Gets the named request instance.
   * @param strRequestId {String} named id for the request (assigned by developer when the Request was instanced);
   * @return {jsx3.net.Request}
   * @deprecated  Static access to pending requests by id is deprecated.
   */
  Request.getRequest = function(strRequestId) {
    return Request.trackArray[strRequestId];
  };

/* @JSC :: end */

  /**
   * Gets the URL passed when opening this request.
   * @return {String}
   */
  Request_prototype.getURL = function() {
    return this._url && this._url.toString();
  };

/* @JSC :: begin DEP */

  /**
   * Specifies timeout settings for resolving the domain name, establishing the connection to the server, sending the data, and receiving the response. The timeout parameters of the setTimeouts method are specified in milliseconds, so a value of 1000 would represent 1 second. A value of zero represents an infinite timeout. There are four separate timeout parameters: resolveTimeout, connectTimeout, sendTimeout, and receiveTimeout. When calling the setTimeouts method, all four values must be specified. The timeouts are applied at the Winsock layer.
   * @param intResolveTimeout {int} The value is applied to mapping host names (such as "www.microsoft.com") to IP addresses; the default value is infinite, meaning no timeout.
   * @param intConnectTimeout {int} The value is applied to establishing a communication socket with the target server, with a default timeout value of 60 seconds.
   * @param intSendTimeout {int} The value applies to sending an individual packet of request data (if any) on the communication socket to the target server. A large request sent to a server will normally be broken up into multiple packets; the send timeout applies to sending each packet individually. The default value is 5 minutes.
   * @param intReceiveTimeout {int} The value applies to receiving a packet of response data from the target server. Large responses will be broken up into multiple packets; the receive timeout applies to fetching each packet of data off the socket. The default value is 60 minutes.
   * @return {jsx3.net.Request} this instance.
   * @deprecated  IE only.
   */
  Request_prototype.setTimeouts = function(intResolveTimeout,intConnectTimeout,intSendTimeout,intReceiveTimeout) {
/* @JSC */ if (jsx3.CLASS_LOADER.IE) {
    try {
      this._request.setTimeouts(intResolveTimeout,intConnectTimeout,intSendTimeout,intReceiveTimeout);
    } catch (e) {
      Request._log(3, "The HTTP ActiveX object does not appear to support setting timeouts.");
    }
/* @JSC */ }
    return this;
  };

/* @JSC :: end */

  /**
   * Sends the request.
   * @param strContent {String} The content to send for a POST request.
   * @param intTimeout {int}  the number milliseconds to wait before publishing a timeout event. This only applies
   *    to asynchronous requests. If used, subscribe to the <code>jsx3.net.Request.EVENT_ON_TIMEOUT</code> event to
   *    be notified of a timeout.
   * @return {jsx3.net.Request} this object.
   */
  Request_prototype.send = function(strContent, intTimeout) {
    if (this._status == Request.STATUS_ERROR)
      throw new jsx3.Exception(jsx3._msg("req.err_state"));

/* @JSC :: begin BENCH */
    var t1 = new jsx3.util.Timer(Request.jsxclass, this._url);
/* @JSC :: end */

    var bError = false;

    try {
// Sync XHR may cause timeouts to fire in IE6, IE7, Firefox 3.0 (fixed in 3.1)
// https://bugzilla.mozilla.org/show_bug.cgi?id=340345
      if (!this._async) Request.INSYNC = true;

      this._request.send(strContent);

      if (this._async)
        /* @jsxobf-clobber */
        this._status = 0;
      else
        delete this._status;

    } catch (e) {
      // TODO: communicate failure to client
      this._status = Request.STATUS_ERROR; // Firefox seems to still report status as 0 when error on local file access.
      Request._log(2, jsx3._msg("req.err_send", this._url, jsx3.NativeError.wrap(e)));
      bError = this;
    } finally {
      Request.INSYNC = false;
    }

    // if this async, add the request object to the array of
    if (this._async) {
      if (bError || this._request.readyState == 4) {
        // If async, events should always be published asynchronously.
        jsx3.sleep(function() {
/* @JSC :: begin BENCH */
          t1.log("load.async");
/* @JSC :: end */
          this.publish({subject:Request.EVENT_ON_RESPONSE});
        }, null, this);
      } else {
        var me = this;
        this._request.onreadystatechange = function() {
          if (me._request.readyState == 4) {
/* @JSC :: begin BENCH */
            t1.log("load.async");
/* @JSC :: end */
            
            // In Firefox (and IE?) a synchronous request causes all queued asynchronous requests to return synchronously
            // This causes all sorts of problems. So here we check and make sure that the async requests still 
            // return asynchronously even if forced to return by a sync request.
            if (Request.INSYNC) {
              jsx3.sleep(function() {
                me._onReadyStateChange();                
              });
            } else {
              me._onReadyStateChange();              
            }
          }
        };

        if (!isNaN(intTimeout) && intTimeout > 0) {
          //set timeout to fire if the response doesn't happen in time
          this._timeoutto = window.setTimeout(function() {
/* @JSC :: begin BENCH */
            t1.log("timeout");
/* @JSC :: end */
            me._onTimeout();
          }, intTimeout);
        }
      }
    }
/* @JSC :: begin BENCH */
    else {
      t1.log("load.sync");
    }
/* @JSC :: end */

    return this;
  };

  /** @private @jsxobf-clobber */
  Request_prototype._onTimeout = function() {
    delete this._timeoutto;
    this.abort();
    this._status = 408; // request timeout
    this.publish({subject:Request.EVENT_ON_TIMEOUT});
  };

  /** @private @jsxobf-clobber */
  Request_prototype._onReadyStateChange = function() {
    delete this._status;

    if (this._timeoutto) {
      window.clearTimeout(this._timeoutto);
      delete this._timeoutto;
    }

    this._request.onreadystatechange = new Function();
/* @JSC */ if (jsx3.CLASS_LOADER.FX) {
    this.getStatusText(); // will throw a caught exception if network error
/* @JSC */ }

    this.publish({subject:Request.EVENT_ON_RESPONSE});
  };

  Request_prototype.toString = function() {
    return this.jsxsuper() + " " + this._method + " " + this.getStatus() + " " + this._url;
  };

  /** @private @jsxobf-clobber */
  Request._log = function(intLevel, strMessage) {
    if (Request._LOG == null) {
      if (jsx3.util.Logger) {
        /* @jsxobf-clobber */
        Request._LOG = jsx3.util.Logger.getLogger(Request.jsxclass.getName());
        if (Request._LOG == null) return;
      } else {
        return;
      }
    }
    Request._LOG.log(intLevel, strMessage);
  };

/* @JSC :: begin XD */

  /* @jsxobf-clobber */
  Request._xdrpending = {};

  /**
   * The cross-domain response callback. This method compares all pending cross-domain requests against
   * <code>strURI</code>. If the path of a pending request equals <code>strURI</code> resolved, then that request
   * object will publish a response event.
   * <p/>
   * Note that this method is only available when running from source or from a build that included the XD symbol.
   * This method is not meant to be called directly from application code. Rather it is designed as the callback
   * for data files that are processed for cross-domain access with the <code>JsEncodeTask</code>.
   * <p/>
   * The static method <code>Request.open()</code>, when called for an asynchronous non-authenticating request,
   * will return an instance of <code>Request</code> appropriate for cross-domain data access. This request object will
   * attempt to load a JavaScript file whose path is <code>.js</code> appended to the path of the original resource.
   * This JavaScript file must exist and must call this method in its body for the cross-domain request to succeed.
   * <p/>
   * <code>Request.open()</code> will only initiate a cross-domain request for resource URIs that match the
   * <code>jsxxd</code> deployment parameter. This parameter is a space delimited list of URI prefixes. If the
   * resolved URI of a resource matches any of these prefixes then it will be loaded cross-domain. 
   *
   * @param strURI {String} the URI of the resource that loaded.
   * @param strData {String} the file data.
   */
  Request.xdr = function(strURI, strData) {
    var u = jsx3.resolveURI(strURI);

    var req = Request._xdrpending[u];

    if (req) {
      delete Request._xdrpending[u];
      req._onJsLoaded(strData);
    } else {
//      Request._log(3, "No pending request: '" + u + "'");
    }
  };

  Request.isXD = function(url) {
    if (!this._xddomains) {
      var env = jsx3.$S(jsx3.getEnv("jsxxd"));
      /* @jsxobf-clobber */
      this._xddomains = env ? env.split(/[ ,]+/g) : [];
    }
    url = jsx3.resolveURI(url);
    for (var i = 0; i < this._xddomains.length; i++)
      if (url.indexOf(this._xddomains[i]) == 0)
        return true;
    return false;
  };

/* @JSC :: end */
/* @JSC :: begin DEP */

  /**
   * gets the release/build for the class (i.e., "3.0.00")
   * @return {String}
   * @deprecated
   */
  Request.getVersion = function() {
    return "3.00.00";
  };

/* @JSC :: end */

});

/* @JSC :: begin XD */

jsx3.Class.defineClass("jsx3.net.Request.XD", jsx3.net.Request, null, function(XD, XD_prototype) {

  var Request = jsx3.net.Request;

  jsx3.$O(XD_prototype).extend({
    _status: 0,
    /* @jsxobf-clobber */
    _data: null,
    /* @jsxobf-clobber */
    _aborted: false,

    init: function() {
    },

    abort: function() {
      this._clearTimeout();
      delete Request._xdrpending[this._url];
      this._aborted = true;
    },

    getAllResponseHeaders: function() {
      return "";
    },

    getResponseHeader: function() {
      return null;
    },

    setRequestHeader: function() {
    },
    
    open: function(strMethod, strUrl) {
      this._async = true;
      this._url = jsx3.net.URIResolver.DEFAULT.resolveURI(strUrl);
      return this;
    },

    send: function(strContent, intTimeout) {
      if (Request._xdrpending[this._url])
        Request._xdrpending[this._url].abort();

      Request._xdrpending[this._url] = this;

      jsx3.CLASS_LOADER.loadJSFile(this._url.toString() + ".js");

      if (!isNaN(intTimeout) && intTimeout > 0) {
       //set timeout to fire if the response doesn't happen in time
       this._timeoutto = window.setTimeout(jsx3.$F(this._onTimeout).bind(this), intTimeout);
      }
    },

    /* @jsxobf-clobber */
    _clearTimeout: function() {
      if (this._timeoutto)
        window.clearTimeout(this._timeoutto);
      delete this._timeoutto;
    },

    /* @jsxobf-clobber */
    _onJsLoaded: function(data) {
      this._clearTimeout();
      if (!this._aborted) {
        this._status = 200;
        this._data = data;
        this.publish({subject:Request.EVENT_ON_RESPONSE});
      }
    },
    
    _onTimeout: function() {
      this.abort();
      this._status = 408;
      this.publish({subject:Request.EVENT_ON_TIMEOUT});
    },

    getResponseText: function() {
      return this._data;
    },

    getResponseXML: function() {
      return this._data ? new jsx3.xml.Document().loadXML(this._data) : null;
    },

    getStatus: function() {
      return "";
    },

    getStatusText: function() {
      return this._status;
    },

    toString: function() {
      return "GET " + this._url;
    }
  });

});

/* @JSC :: end */

/* @JSC :: begin DEP */

/**
 * @deprecated  Renamed to jsx3.net.Request
 * @see jsx3.net.Request
 * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.HttpRequest", -, null, function(){});
 */
jsx3.HttpRequest = jsx3.net.Request;

/* @JSC :: end */
