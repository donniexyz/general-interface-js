/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Represents a Uniform Resource Identifier (URI) reference. Modeled on the Java class <code>java.net.URI</code>.
 *
 * @since 3.1
 */
jsx3.Class.defineClass("jsx3.net.URI", null, null, function(URI, URI_prototype) {

  /** @private @jsxobf-clobber */
  URI.ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  /** @private @jsxobf-clobber */
  URI.DIGIT = "0123456789";
  /** @private @jsxobf-clobber */
  URI.ALPHANUM = URI.ALPHA + URI.DIGIT;
  /** @private @jsxobf-clobber */
  URI.UNRESERVED = URI.ALPHANUM + "_-!.~'()*";
  /** @private @jsxobf-clobber */
  URI.PUNCT = ",;:$&+=";
  /** @private @jsxobf-clobber */
  URI.RESERVED = URI.PUNCT + "?/[]@";
  /** @private @jsxobf-clobber */
  URI.ESCAPED = "%";

  /** @private @jsxobf-clobber */
  URI._SCHEME_REGEX = new RegExp("^[" + URI.ALPHA + "][\\-\\.\\+" + URI.ALPHA + "]*\\:");
  /** @private @jsxobf-clobber */
  URI._PORT_REGEX = /:(\d+)$/;

  /** @private @jsxobf-clobber */
  URI_prototype._source = null;
  /** @private @jsxobf-clobber */
  URI_prototype._scheme = null;
  /** @private @jsxobf-clobber */
  URI_prototype._ssp = null;
  /** @private @jsxobf-clobber */
  URI_prototype._fragment = null;
  /** @private @jsxobf-clobber */
  URI_prototype._authority = null;
  /** @private @jsxobf-clobber */
  URI_prototype._path = null;
  /** @private @jsxobf-clobber */
  URI_prototype._query = null;
  /** @private @jsxobf-clobber */
  URI_prototype._userinfo = null;
  /** @private @jsxobf-clobber */
  URI_prototype._host = null;
  /** @private @jsxobf-clobber */
  URI_prototype._port = null;
  
  /**
   * This method can be called with either 3 or 7 arguments. If it is called with 3 arguments, the signature is
   * <code>URI.fromParts(scheme, schemeSpecificPath, fragment)</code>.
   * 
   * @param scheme {String} the URI scheme, may be <code>null</code>
   * @param userInfo {String} the URI user-information, may be <code>null</code>; <b>or the scheme-specific part if called with 3 arguments</b>
   * @param host {String} the URI host, may be <code>null</code>; <b>or the URI fragment if called with 3 arguments</b>, may be <code>null</code>
   * @param port {int} the URI port, may be <code>null</code>
   * @param path {String} the URI path
   * @param query {String} the URI query, may be <code>null</code>
   * @param fragment {String} the URI fragment, may be <code>null</code>
   * @return {jsx3.net.URI}
   */
  URI.fromParts = function(scheme, userInfo, host, port, path, query, fragment) {
    var uri = URI.jsxclass.bless();
    var a = arguments;
    
    var authorityraw = null, sspraw = null;
    
    // RFC 2396 allows escaped octets to appear in the user-info, path, query, and fragment components.
    if (a.length == 3) {
      uri._scheme = a[0];
      sspraw = URI.encode(a[1], URI.UNRESERVED + URI.RESERVED + URI.ESCAPED);
      uri._ssp = URI.decode(a[1]);
      uri._fragment = URI.decode(a[2]);
    } else if (a.length == 7) {
      uri._scheme = a[0];
      uri._userinfo = URI.decode(a[1]);
      uri._host = a[2];
      uri._port = a[3];
      uri._path = URI.decode(a[4]);
      uri._query = URI.decode(a[5]);
      uri._fragment = URI.decode(a[6]);
    } else {
      throw new jsx3.IllegalArgumentException("arguments", jsx3.Method.argsAsArray(a));
    }    
    
    if (uri._authority == null && uri._host != null) {
      uri._authority = authorityraw = uri._host;
      if (uri._userinfo) {
        uri._authority = uri._userinfo + "@" + uri._authority;
        authorityraw = URI.encode(uri._userinfo, URI.UNRESERVED + URI.PUNCT + URI.ESCAPED) + "@" + authorityraw;
      }
      if (uri._port) {
        uri._authority = uri._authority + ":" + uri._port;
        authorityraw = authorityraw + ":" + uri._port;
      }
    }

    if (uri._ssp == null) {
      uri._ssp = sspraw = "";
      if (uri._path) {
        uri._ssp = uri._path;
        sspraw = URI.encode(uri._path, URI.UNRESERVED + URI.PUNCT + URI.ESCAPED + "/@");
      }
      if (uri._authority != null) {
        uri._ssp = "//" + uri._authority + uri._ssp;
        sspraw = "//" + authorityraw + sspraw;
      }
      if (uri._query) {
        uri._ssp = uri._ssp + "?" + uri._query;
        sspraw = sspraw + "?" + URI.encode(uri._query, URI.UNRESERVED + URI.PUNCT + URI.ESCAPED);
      }
    }

    if (uri._source == null) {
      uri._source = sspraw;
      if (uri._scheme)
        uri._source = uri._scheme + ":" + uri._source;
      if (uri._fragment != null)
        uri._source = uri._source + "#" + URI.encode(uri._fragment, URI.UNRESERVED + URI.RESERVED + URI.ESCAPED);
    }
    
    return uri;
  };
  
  /**
   * Instance initializer.
   * @param strURI {String} uri
   */
  URI_prototype.init = function(strURI) {
    if (strURI == null) strURI = "";
    if (typeof(strURI) != "string") strURI = strURI.toString();
    
    this._source = strURI;
    
    // PARSE [scheme:]scheme-specific-part[#fragment]
    var ssp = strURI;
    var index;
    if (URI._SCHEME_REGEX.test(ssp)) {
      var match = RegExp.lastMatch;
      this._scheme = ssp.substring(0, match.length - 1);
      ssp = ssp.substring(match.length);
    }
    if ((index = ssp.indexOf("#")) >= 0) {
      this._fragment = URI.decode(ssp.substring(index+1));
      ssp = ssp.substring(0, index);
    }
    this._ssp = ssp;
    
    // we know whether it's absolute/relative and opaque/hierarchical
    var bAbsolute = this._scheme != null;
    var bOpaque = bAbsolute && ssp.indexOf("/") != 0;
    
    if (!bOpaque) {
      // PARSE [scheme:][//authority][path][?query][#fragment]
      if (ssp.indexOf("//") == 0) {
        index = ssp.indexOf("/", 2);
        this._authority = ssp.substring(2, index >= 0 ? index : ssp.length);
        ssp = index >= 0 ? ssp.substring(index) : "";
      }
      if ((index = ssp.indexOf("?")) >= 0) {
        this._query = URI.decode(ssp.substring(index+1));
        ssp = ssp.substring(0, index);
      }
      this._path = URI.decode(ssp);
      
      // PARSE [user-info@]host[:port]
      var host = this._authority;
      if (host) {
        if ((index = host.indexOf("@")) >= 0) {
          this._userinfo = URI.decode(host.substring(0, index));
          host = host.substring(index+1);
        }
        if (URI._PORT_REGEX.test(host)) {
          this._port = parseInt(RegExp.$1);
          host = host.substring(0, host.length - RegExp.lastMatch.length);
        }
      }
      
      this._host = host;
    }
  };

  /**
   * Normalizes this URI's path.
   * @return {jsx3.net.URI}
   */
  URI_prototype.normalize = function() {
    if (jsx3.util.strEmpty(this._path)) return this;
    
    var tokens = this._path.split("/");
    URI.normalizeTokens(tokens);
    
    var path = tokens.join("/");
    
    return path == this._path ? this :
        URI.fromParts(this._scheme, this._userinfo, this._host, this._port, path, this._query, this._fragment);
  };

  /**
   * @private 
   * @jsxobf-clobber 
   */
  URI.normalizeTokens = function(tokens) {
    var bRel = tokens[0] !== "";

    //  1. All "." segments are removed.
    for (var i = tokens.length -1; i >= 0; i--)
      if (tokens[i] == ".")
        tokens.splice(i, 1);
      
    //  2. If a ".." segment is preceded by a non-".."  segment then both of these segments are removed. 
    //     This step is repeated until it is no longer applicable.
    for (var i = 0; i < tokens.length; i++) {
      if (i > 0 && tokens[i] == ".." && tokens[i-1] != "..") {
        tokens.splice(i-1, 2);
        i -= 2;
      }
    }
    
    //  3. If the path is relative, and if its first segment contains a colon character (':'), then a "." segment is 
    //     prepended. This prevents a relative URI with a path such as "a:b/c/d" from later being re-parsed as an 
    //     opaque URI with a scheme of "a" and a scheme-specific part of "b/c/d".
    if (bRel && tokens[0] != null && tokens[0].indexOf(":") >= 0)
      tokens.unshift(".");
  };
  
  /**
   * Resolves the given URI against this URI.
   *
   * @param uri {String|jsx3.net.URI}
   * @return {jsx3.net.URI}
   */
  URI_prototype.resolve = function(uri) {
    uri = URI.valueOf(uri);

    // efficiency 
    if (this._source == "") return uri;
    
    // I. If the given URI is already absolute, or if this URI is opaque, then the given URI is returned.
    if (uri.isAbsolute() || this.isOpaque()) return uri;
        
    // II. If the given URI's fragment component is defined, its path component is empty, and its scheme, authority, and 
    // query components are undefined, then a URI with the given fragment but with all other components equal to those 
    // of this URI is returned. 
    if (uri._fragment && !uri._path && !uri._scheme && !uri._authority && !uri._query)
      return URI.fromParts(this._scheme, this._userinfo, this._host, this._port, this._path, this._query, uri._fragment);
    
    // 1. A new URI is constructed with this URI's scheme and the given URI's query and fragment components.
    var scheme = this._scheme;
    var query = uri._query;
    var fragment = uri._fragment;
    
    var userInfo = null, host = null, port = null, path = null;
    // 2. If the given URI has an authority component then the new URI's authority and path are taken from the given URI.
    if (uri._authority != null) {
      userInfo = uri._userinfo;
      host = uri._host;
      port = uri._port;
      path = uri._path;
    }
    // 3. Otherwise the new URI's authority component is copied from this URI, and its path is computed as follows:
    else {
      userInfo = this._userinfo;
      host = this._host;
      port = this._port;
      // 1. If the given URI's path is absolute then the new URI's path is taken from the given URI.
      if (uri._path.indexOf("/") == 0) {
        path = uri._path;
      }
      // 2. Otherwise the given URI's path is relative, and so the new URI's path is computed by resolving the path 
      //    of the given URI against the path of this URI. This is done by concatenating all but the last segment of 
      //    this URI's path, if any, with the given URI's path and then normalizing the result as if by invoking the 
      //    normalize method.
      else {
        var tokens = this._path.split("/");
        tokens.pop(); // remove last segment
        tokens.push.apply(tokens, uri._path.split("/"));
        URI.normalizeTokens(tokens);
        path = tokens.join("/");
      }
    }
    
    return URI.fromParts(scheme, userInfo, host, port, path, query, fragment);
  };
  
  /**
   * Relativizes the given URI against this URI.
   * <p/>
   * The returned URI is computed as follows:
   * <ol>
   *  <li>If this URI or <code>uri</code> is opaque, or their schemes are not equal or their authorities are not
   *    equal, <code>uri</code> is returned.</li>
   *  <li>Otherwise, a new URI is constructed with the query and fragment of <code>uri</code> and a path equal to:
   *    <ol>
   *      <li>If the common path prefix of this URI and <code>uri</code> is just <code>""</code> or
   *         <code>"/"</code>, the path of <code>uri</code></li>
   *      <li>Otherwise, the last segment of this path is removed and the path is computed by removing any common
   *         path prefix between the two paths, prepending a ".." for every segment remaining in this path, and
   *         appending the remaining path of <code>uri</code>.</li>
   *    </ol>
   *  </li>
   * </ol>
   *
   * @param uri {String|jsx3.net.URI}
   * @return {jsx3.net.URI}
   */
  URI_prototype.relativize = function(uri) {
    uri = URI.valueOf(uri);
    
    // efficiency 
    if (this._source == "") return uri;
    
    // 1. If either this URI or the given URI are opaque, or if the scheme and authority components of the two URIs 
    //    are not identical, or if the path of this URI is not a prefix of the path of the given URI, then the given URI 
    //    is returned.
    if (this.isOpaque() || uri.isOpaque()) return uri;
    if (this._scheme != uri._scheme) return uri;
    var a1 = this._authority != null ? this._authority : "";
    var a2 = uri._authority != null ? uri._authority : "";
    if (a1 != a2) return uri;

    // 2. Otherwise a new relative hierarchical URI is constructed with query and fragment components taken from the 
    //    given URI and with a path component computed by removing this URI's path from the beginning of the given 
    //    URI's path.
    var thisPath = this._path || "";
    var thatPath = uri._path || "";
    
    var thisTokens = thisPath.split("/");
    thisTokens.pop();
    var thatTokens = thatPath.split("/");
    var newTokens = [];
    
    var i = 0;
    while (i < thisTokens.length && i < thatTokens.length) {
      if (thisTokens[i] != thatTokens[i]) break;
      i++;
    }

    var newPath = null;

    if (i < 2 && thisPath.indexOf("/") == 0) {
      newPath = thatPath;
    } else {
      for (var j = i; j < thisTokens.length; j++)
        newTokens[newTokens.length] = "..";

      for (var j = i; j < thatTokens.length; j++)
        newTokens[newTokens.length] = thatTokens[j];

      newPath = newTokens.join("/");
    }

    return URI.fromParts(null, null, null, null, newPath, uri._query, uri._fragment);
  };

  /**
   * @return {String}
   */
  URI_prototype.getAuthority = function() {
    return this._authority;
  };

  /**
   * @return {String}
   */
  URI_prototype.getFragment = function() {
    return this._fragment;
  };

  /**
   * @return {String}
   */
  URI_prototype.getHost = function() {
    return this._host;
  };

  /**
   * @return {String}
   */
  URI_prototype.getPath = function() {
    return this._path;
  };

  /**
   * @return {int}
   */
  URI_prototype.getPort = function() {
    return this._port;
  };

  /**
   * @return {String}
   */
  URI_prototype.getQuery = function() {
    return this._query;
  };
  
  /**
   * Searches the query part for the value of a parameter. Parameters are specified as name value pairs delimited by
   * '&amp;' like: <code>name1=value1&amp;name2=value2&amp;...</code> If a parameter is specified without a following '='
   * this method will return boolean <code>true</code>.
   *
   * @param strParam {String}
   * @return {String|boolean}
   */
  URI_prototype.getQueryParam = function(strParam) {
    var query = this._query;
    if (query) {
      var from = 0;
      var nameLength = strParam.length;

      var index = null;      
      while ((index = query.indexOf(strParam, from)) >= 0) {
        if (index == 0 || query.charAt(index-1) == "&") {
          var followingChar = query.charAt(index + nameLength);
          if (followingChar == "&" || jsx3.util.strEmpty(followingChar)) {
            return true;
          } else if (followingChar == "=") {
            var nextIndex = query.indexOf("&", index + nameLength + 1);
            return nextIndex >= 0 ? query.substring(index + nameLength + 1, nextIndex) : 
                query.substring(index + nameLength + 1);
          }
        }
        from = index + nameLength;
      }
    }
    return null;
  };

  /**
   * @return {Object<String, String>}
   */
  URI_prototype.getQueryParams = function() {
    var map = {};
    if (this._query) {
      var tokens = this._query.split("&");
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var equalsIndex = token.indexOf("=");
        if (equalsIndex >= 0) {
          map[token.substring(0, equalsIndex)] = token.substring(equalsIndex + 1);
        } else {
          map[token] = true;
        }
      }
    }
    return map;
  };

  /**
   * @return {String}
   */
  URI_prototype.getScheme = function() {
    return this._scheme;
  };

  /**
   * @return {String}
   */
  URI_prototype.getSchemeSpecificPart = function() {
    return this._ssp;
  };

  /**
   * @return {String}
   */
  URI_prototype.getUserInfo = function() {
    return this._userinfo;
  };

  /**
   * @return {boolean}
   */
  URI_prototype.isAbsolute = function() {
    return this._scheme != null;
  };

  /**
   * @return {boolean}
   */
  URI_prototype.isOpaque = function() {
    return this._scheme != null && this._ssp.indexOf("/") != 0;
  };

  /**
   * @return {boolean}
   */
  URI_prototype.equals = function(obj) {
    if (this === obj) return true;
    if (!(obj instanceof jsx3.net.URI)) return false;

    // For two URIs to be considered equal requires that either both are opaque or both are hierarchical.
    // Their schemes must either both be undefined or else be equal without regard to case. Their fragments must
    // either both be undefined or else be equal.
    var s1 = this._scheme;
    var s2 = obj._scheme;
    if ((s1 == null && s2 != null) || (s1 != null && s2 == null)) return false;
    if (s1 != null && s1.toLowerCase() != s2.toLowerCase()) return false;
    if (this._fragment != obj._fragment) return false;

    // When testing the user-information, path, query, fragment, authority, or scheme-specific parts of two
    // URIs for equality, the raw forms rather than the encoded forms of these components are compared and the
    // hexadecimal digits of escaped octets are compared without regard to case.

    if (this.isOpaque()) {
      // For two opaque URIs to be considered equal, their scheme-specific parts must be equal.
      if (! obj.isOpaque()) return false;
      return this._ssp == obj._ssp;
    } else {
      // For two hierarchical URIs to be considered equal, their paths must be equal and their queries must either
      // both be undefined or else be equal. Their authorities must either both be undefined, or both be registry-based,
      // or both be server-based. If their authorities are defined and are registry-based, then they must be equal.
      // If their authorities are defined and are server-based, then their hosts must be equal without regard to case,
      // their port numbers must be equal, and their user-information components must be equal.
      return this._path == obj._path &&
          this._query == obj._query &&
          this._authority == obj._authority;
    }
  };
  
  /**
   * @return {String}
   */
  URI_prototype.toString = function() {
    return this._source;
  };
  
  /**
   * @param strText {String}
   * @param-private strChars {String} the characters <b>not</b> to escape.
   * @return {String}
   * @package
   */
  URI.encode = function(strText, strChars) {    
    if (strText == null) return null;
    if (strChars == null) strChars = URI.UNRESERVED;

    var regex = new RegExp("^[" + strChars.replace(/(\W)/g, "\\$1") + "]*$");
    if (strText.match(regex)) return strText;
    
    var length = strText.length;
    var encoded = new Array(length);
    
    for (var i = 0; i < length; i++) {
      var chr = strText.charAt(i);
      
      if (strChars.indexOf(chr) < 0) {
        var code = chr.charCodeAt(0);
        
        if (code < 16) {
          encoded[i] = "%" + "0" + code.toString(16).toUpperCase();
        } else if (code < 256) {
          encoded[i] = "%" + code.toString(16).toUpperCase();
        } else {
          encoded[i] = chr;
        }
      } else {
        encoded[i] = chr;
      }
    }
    
    return encoded.join("");    
  };
  
  /** @package */
  URI.decode = function(strText) {
    if (strText == null) return null;
    if (strText.indexOf("%") < 0) return strText;
    
    var length = strText.length;
    var decoded = new Array(length);
    var j = 0;
    
    for (var i = 0; i < strText.length; i++) {
      var chr = strText.charAt(i);
      if (chr == "%") {
        var octet = strText.substring(i+1, i+3);
        if (octet.match(/[^a-fA-F0-9]/)) {
          decoded[j++] = chr;
        } else {
          decoded[j++] = String.fromCharCode(parseInt(octet, 16));
          i += 2;
        }
      } else {
        decoded[j++] = chr;
      }
    }
    
    return decoded.join("");
  };
  
  /**
   * @param strURI {String|jsx3.net.URI}
   * @return {jsx3.net.URI}
   */
  URI.valueOf = function(strURI) {
    if (jsx3.util.strEmpty(strURI)) return URI.EMPTY_URI;
    return strURI instanceof URI ? strURI : new URI(strURI);
  };
  
  /** @private @jsxobf-clobber */
  URI.EMPTY_URI = new URI();
  
});
