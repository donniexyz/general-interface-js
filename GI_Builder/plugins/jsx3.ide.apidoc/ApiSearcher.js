/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-clobber  _results

/**
 * ...
 */
jsx3.Class.defineClass("jsx3.ide.ApiSearcher", null, [jsx3.util.EventDispatcher], function(ApiSearcher, ApiSearcher_prototype) {

  ApiSearcher.PROGRESS = "onProgress";
  ApiSearcher.COMPLETE = "onComplete";

  /** @private @jsxobf-clobber */
  ApiSearcher.SEARCH_ATTR_CLASS = ['text', '@name', '@since', 'deprecated', 'author', '@version'];
  /** @private @jsxobf-clobber */
  ApiSearcher.SEARCH_ATTR_FIELD = ['text', '@fullname', '@since', 'deprecated'];
  /** @private @jsxobf-clobber */
  ApiSearcher.SEARCH_ATTR_METHOD = ['text', '@name', '@since', 'deprecated'];
  /** @private @jsxobf-clobber */
  ApiSearcher.SEARCH_ATTR_PARAM = ['@name', '@text'];
  /** @private @jsxobf-clobber */
  ApiSearcher.SEARCH_ATTR_RETURN = ['@text'];
  /** @private @jsxobf-clobber */
  ApiSearcher.SEARCH_ATTR_THROWS = ['@text'];

  /** @private @jsxobf-clobber */
  ApiSearcher.SORTER = function(a, b) {
    var sa = " " + a.getAttribute('name');
    var sb = " " + b.getAttribute('name');
    return sa == sb ? 0 : (sa > sb ? 1 : -1);
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._timeoutid = null;
  
  /**
   * The instance initializer.
   */
  ApiSearcher_prototype.init = function() {
    /* @jsxobf-clobber */
    this._results = jsx3.xml.CDF.newDocument();
    /* @jsxobf-clobber */
    this._total = 0;
    /* @jsxobf-clobber */
    this._rstcnt = 0;
  };

  ApiSearcher_prototype.searchDocuments = function(listDocs, strQuery) {
    this._total = listDocs.size();
    this._rstcnt = 0;
    this._startJob(listDocs.toArray(), this._getTester(strQuery));
  };

  ApiSearcher_prototype.cancel = function() {
    if (this._timeoutid) {
      window.clearTimeout(this._timeoutid);
      this._timeoutid = null;
    }
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._startJob = function(arrDocs, fctTest) {
    this._timeoutid = null;
    
    if (arrDocs.length == 0) {
      this.publish({subject:ApiSearcher.COMPLETE});
      return;
    }

    var doc = arrDocs.shift();

    var objXML = null, strPath = null;

    if (typeof(doc) == "string" || doc instanceof jsx3.net.URI) {
      objXML = new jsx3.xml.Document();
      strPath = jsx3.IDE.resolveURI(doc);
    } else if (typeof(doc) == "object") {
      if (doc instanceof jsx3.xml.Entity) {
        objXML = doc;
      } else if (doc instanceof jsx3.io.File) {
        objXML = new jsx3.xml.Document();
        strPath = jsx3.ide.relativePathTo(doc);
      }
    }

    if (objXML) {
      if (strPath) {
        objXML.setAsync(true);
        objXML.subscribe("*", jsx3.$F(this._onXmlDone).bind(this, [objXML, strPath, arrDocs, fctTest]));
        objXML.load(strPath);
      } else {
        this._onXmlDone(objXML, strPath, arrDocs, fctTest);
      }
    } else {
      jsx3.ide.LOG.error("no XML document for " + doc);
    }
  };

  ApiSearcher_prototype._onXmlDone = function(objXML, strPath, arrDocs, fctTest) {
    if (!objXML.hasError()) {
      this._searchXML(objXML, fctTest);
    } else {
      var error = objXML.getError();
      jsx3.ide.LOG.error("error in XML document " + strPath + ": " + error);
    }

    this.publish({subject:ApiSearcher.PROGRESS, objXML:objXML, strPath:strPath, total:this._total,
      done:this._total-arrDocs.length});

    this._timeoutid = window.setTimeout(jsx3.$F(this._startJob).bind(this, [arrDocs, fctTest]), 0);
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._searchXML = function(objXML, fctTest) {
    for (var i = objXML.selectNodeIterator("/*"); i.hasNext(); )
      this._searchClass(i.next(), fctTest);
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._searchClass = function(objNode, fctTest) {
    var objNew = null;
    if (this._testNode(objNode, ApiSearcher.SEARCH_ATTR_CLASS, fctTest)) {
      objNew = this._results.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
      objNew.setAttribute("type", "class");
      objNew.setAttribute("class", objNode.getAttribute("name"));
      objNew.setAttribute("jsxidfk", objNode.getAttribute("id"));
      var text = objNode.selectSingleNode("text");
      if (text)
        objNew.setAttribute("jsxtip", jsx3.util.strTruncate(text.getValue(), 50));

      this._results.getRootNode().appendChild(objNew);
      this._rstcnt++;
    }

    var fields = objNode.selectNodes("field").toArray();
    fields.sort(ApiSearcher.SORTER);
    for (var i = 0; i < fields.length; i++) {
      this._searchField(fields[i], fctTest, objNew);
    }
    
    var constructor = objNode.selectSingleNode("constructor");
    if (constructor)
      this._searchMethod(constructor, fctTest, objNew);
    
    var methods = objNode.selectNodes("method[not(@inherited)]").toArray();
    methods.sort(ApiSearcher.SORTER);
    for (var i = 0; i < methods.length; i++) {
      this._searchMethod(methods[i], fctTest, objNew);
    }
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._searchField = function(objNode, fctTest, objBranch) {
    if (this._testNode(objNode, ApiSearcher.SEARCH_ATTR_FIELD, fctTest)) {
      var objNew = this._results.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
      objNew.setAttribute("type", "field");
      objNew.setAttribute("jsxidfk", objNode.getAttribute("id"));
      objNew.setAttribute("class", objNode.getParent().getAttribute("name"));
      objNew.setAttribute("jsxtext", objNode.getAttribute("name"));
      var text = objNode.selectSingleNode("text");
      if (text)
        objNew.setAttribute("jsxtip", jsx3.util.strTruncate(text.getValue(), 50));

      (objBranch || this._results.getRootNode()).appendChild(objNew);
      this._rstcnt++;
    }
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._searchMethod = function(objNode, fctTest, objBranch) {
    var match = this._testNode(objNode, ApiSearcher.SEARCH_ATTR_METHOD, fctTest);
    if (!match) {
      for (var i = objNode.getChildIterator(); !match && i.hasNext(); ) {
        var child = i.next();
        var nodeName = child.getNodeName();
        if (nodeName == "param")
          match = this._testNode(child, ApiSearcher.SEARCH_ATTR_PARAM, fctTest);
        else if (nodeName == "return")
          match = this._testNode(child, ApiSearcher.SEARCH_ATTR_RETURN, fctTest);
        else if (nodeName == "throws")
          match = this._testNode(child, ApiSearcher.SEARCH_ATTR_THROWS, fctTest);
      }
    }

    if (match) {
      var objNew = this._results.createNode(jsx3.xml.Entity.TYPEELEMENT, "record");
      objNew.setAttribute("type", "method");
      objNew.setAttribute("jsxidfk", objNode.getAttribute("id"));
      objNew.setAttribute("class", objNode.getParent().getAttribute("name"));
      objNew.setAttribute("jsxtext", objNode.getAttribute("name"));
      var text = objNode.selectSingleNode("text");
      if (text)
        objNew.setAttribute("jsxtip", jsx3.util.strTruncate(text.getValue(), 50));

      (objBranch || this._results.getRootNode()).appendChild(objNew);
      this._rstcnt++;
    }
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._testNode = function(objNode, arrAttributes, fctTest) {
    for (var i = 0; i < arrAttributes.length; i++) {
      var attr = arrAttributes[i];
      if (attr.charAt(0) == "@") {
        if (fctTest(objNode.getAttribute(attr.substring(1))))
          return true;
      } else {
        for (var j = objNode.selectNodeIterator(attr); j.hasNext(); ) {
          if (fctTest(j.next().getValue()))
            return true;
        }
      }
    }
    return false;
  };

  /** @private @jsxobf-clobber */
  ApiSearcher_prototype._getTester = function(strQuery) {
    var fctTest = null;

    if (strQuery.match(/^\/.*\/(i|g|ig|gi)?$/)) {
      try {
        var regex = jsx3.eval("new RegExp(" + strQuery + ")");
        fctTest = function(text) { return text && regex.test(text); };
      } catch (e) {}
    }

    if (fctTest == null) {
      var lcQuery = strQuery.toLowerCase();
      fctTest = function(text) { return text != null && text.toLowerCase().indexOf(lcQuery) >= 0; };
    }
    
    return fctTest;
  };

  ApiSearcher_prototype.getResults = function() {
    return this._results;
  };

  ApiSearcher_prototype.getResultCount = function() {
    return this._rstcnt;
  };

});
