/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.io.XPCOMFileSystem", jsx3.io.FileSystem, null, function(XPCOMFileSystem, XPCOMFileSystem_prototype) {

  var ep = function(p) {
      try {
      if (window.netscape && netscape.security.hasOwnProperty())
        netscape.security.PrivilegeManager.enablePrivilege(p);
      } catch (e) {
      }

     };
     //netscape.security.PrivilegeManager.enablePrivilege;
  /** @private @jsxobf-clobber */
  XPCOMFileSystem._PERM = "UniversalXPConnect";

  try {
    ep(XPCOMFileSystem._PERM);

    /* @jsxobf-clobber */
    XPCOMFileSystem._F = {};

    /* @jsxobf-clobber */
    XPCOMFileSystem._F._DIRSERVICE = Components.classes["@mozilla.org/file/directory_service;1"].getService(
        Components.interfaces["nsIProperties"]);

    /* @jsxobf-clobber */
    XPCOMFileSystem._F._RDF = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);

  } catch (e) {
    jsx3.ide.LOG.fatal(jsx3.NativeError.wrap(e));
  }

  XPCOMFileSystem._WINPATH = /^[a-zA-Z]:\\/;

  XPCOMFileSystem_prototype.getFile = function(strPath) {
    if (typeof(strPath) == "string" && strPath.match(XPCOMFileSystem._WINPATH)) {
      strPath = "file:///" + strPath.replace(/\\/g, "/");
    }

    var uri = jsx3.net.URI.valueOf(strPath);
    if (!uri.getScheme()) {
      uri = new jsx3.net.URI("file://" + (uri.getPath().indexOf("/") != 0 ? "/" : "") + uri.getPath());
    }
    return new jsx3.io.XPCOMFile(this, uri);
  };

  XPCOMFileSystem_prototype._getHome = function() {
    ep(XPCOMFileSystem._PERM);
    var file = XPCOMFileSystem._F._DIRSERVICE.get("Desk", Components.interfaces["nsIFile"]);
//    var file = XPCOMFileSystem._F._DIRSERVICE.get("Home", Components.interfaces["nsIFile"]);
    return file != null ? jsx3.io.XPCOMFile._fromImplementation(this, file.parent) : null;
  };

  XPCOMFileSystem_prototype.getUserDocuments = function() {
    var home = this._getHome();
    var list = home.listFiles();
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f.isDirectory()) {
        if (f.getName() == "Documents" || f.getName() == "My Documents")
          return f;
      }
    }
    return home;
  };

  XPCOMFileSystem_prototype.getRoots = function() {
    try {
      ep(XPCOMFileSystem._PERM);
      var ds = XPCOMFileSystem._F._RDF.GetDataSource("rdf:files");
      var rsc = XPCOMFileSystem._F._RDF.GetResource("NC:FilesRoot");
      var prd = XPCOMFileSystem._F._RDF.GetResource("http://home.netscape.com/NC-rdf#child");
      var targets = ds.GetTargets(rsc, prd, true);
      var roots = [];
      while (targets.hasMoreElements()) {
        var target = targets.getNext();
        if (target instanceof Components.interfaces.nsIRDFResource) {
          var d = this.getFile(new jsx3.net.URI(target.Value));
      //        try {
          //          // only get drives that are mounted
          //          d._imp.directoryEntries;
                roots.push(d);
      //        } catch (e) {}
        }
      }
      return roots;
    } catch(ex) {
      jsx3.ide.LOG.warn("Error determining file system roots: " + jsx3.NativeError.wrap(ex));
      return [];
    }
  };

  /**
   * get the path of a valid temp file
   * @return {jsx3.io.File} the temp file
   */
  XPCOMFileSystem_prototype.createTempFile = function(strName) {
    ep(XPCOMFileSystem._PERM);
    var perms = 0755 | jsx3.io.XPCOMFile.READWRITE_PERM;
    var tmpDir = XPCOMFileSystem._F._DIRSERVICE.get("TmpD", Components.interfaces["nsIFile"]);
    tmpDir.append(strName);
    tmpDir.createUnique(0x00, perms);
    return jsx3.io.XPCOMFile._fromImplementation(this, tmpDir);
  };

});

/**
 * Wraps the file system. Based on java.io.File.
 */
jsx3.Class.defineClass("jsx3.io.XPCOMFile", jsx3.io.File, null, function(XPCOMFile, XPCOMFile_prototype) {

  var File = jsx3.io.File;

  XPCOMFile._LOADED = false;

  var ep = function(p) {
      try {
      if (window.netscape && netscape.security.hasOwnProperty())
        netscape.security.PrivilegeManager.enablePrivilege(p);
      } catch (e) {
      }

     };
  /** @private @jsxobf-clobber */
  XPCOMFile._PERM = "UniversalXPConnect";
  
  try {
    ep(XPCOMFile._PERM);

    /** @private @jsxobf-clobber */
    XPCOMFile._F = {};

    /* @jsxobf-clobber */
    XPCOMFile._F._FILE = new Components.Constructor("@mozilla.org/file/local;1", "nsILocalFile", "initWithPath");
    /* @jsxobf-clobber */
    XPCOMFile._F._URL = new Components.Constructor("@mozilla.org/network/standard-url;1", "nsIURL");
    /* @jsxobf-clobber */
    XPCOMFile._F._INPUTSTREAM = new Components.Constructor("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
    /* @jsxobf-clobber */
    XPCOMFile._F._PROTOCOL = Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(
        Components.interfaces["nsIFileProtocolHandler"]);
    /* @jsxobf-clobber */
    XPCOMFile._F._IOSERVICE = Components.classes["@mozilla.org/network/io-service;1"].getService(
        Components.interfaces["nsIIOService"]);

    /* @jsxobf-clobber */
    XPCOMFile._LOADED = true;
  } catch (e) {
    jsx3.ide.LOG.error("Error instantiating file system access.",
        jsx3.NativeError.wrap(e));
  }
  
  /**
   * @return {boolean}
   */
  XPCOMFile.isLoaded = function() {
    return XPCOMFile._LOADED;
  };
  
  /** @package */
  XPCOMFile.PATH_SEPARATOR = jsx3.app.Browser.getSystem() == jsx3.app.Browser.WIN32 ? "\\" : "/";
  /** @private @jsxobf-clobber */
  XPCOMFile.READONLY_PERM = jsx3.app.Browser.getSystem() == jsx3.app.Browser.WIN32 ? 07555 : 07577;
  /** @private @jsxobf-clobber */
  XPCOMFile.READWRITE_PERM = jsx3.app.Browser.getSystem() == jsx3.app.Browser.WIN32 ? 0222 : 0200;
    
  /** @private @jsxobf-clobber */
  XPCOMFile_prototype._path = null;
  /** @private @jsxobf-clobber */
  XPCOMFile_prototype._imp = null;
  
  /**
   * instance initializer
   * @param strParent {String|jsx3.net.URI} the parent directory of the file, or the entire file path
   * @param strPath {String} the name of the file in the strParent directory
   */
  XPCOMFile_prototype.init = function(fs, uri) {
    this.jsxsuper(fs, uri);
    ep(XPCOMFile._PERM);
    
    if (uri.getScheme() != "file")
      throw new jsx3.Exception("scheme is not 'file': " + uri);
      
    try {
      this._imp = XPCOMFile._F._PROTOCOL.getFileFromURLSpec(uri.toString());
      this._path = this._imp.path;
    } catch (e) {
      this._imp = null;
      this._path = uri.getPath();
    }
  };

  /**
   * writes text data to a file; if bUnicode is false or null and the first write attempt fails, this method tries to write again with unicode output
   * @param strData {String} the text to write
   * @param strCharset {String}
   * @return {boolean} success
   */
  XPCOMFile_prototype.write = function(strData, objParams) {
    if (! this._imp) return false;
    if (!objParams) objParams = {};

    var strCharset = objParams.charset;
    var strLineMode = objParams.linebreakmode;
    var bCharsetFailover = objParams.charsetfailover;

    if (strLineMode) strData = strData.split(/\r\n|\r|\n/g).join(File.LINE_SEP[strLineMode]);

    ep(XPCOMFile._PERM);
    var perms = 0755 | XPCOMFile.READWRITE_PERM;

    try {
      if (! this._imp.exists())
        this._imp.create(0x00, perms); 
      
      var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces["nsIFileOutputStream"]);
      outputStream.init(this._imp, 0x20 | 0x02, perms, null);

      if (strCharset) {
        var charConverter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
        charConverter.init(outputStream, strCharset, 0, "?".charAt(0));

        charConverter.writeString(strData);
        charConverter.close();
      } else {
        outputStream.write(strData, strData.length);
        outputStream.flush();
      }

      outputStream.close();
      // HACK: seems to be that writing to a file requires this to be updated for read to work
      this._imp = XPCOMFile._F._PROTOCOL.getFileFromURLSpec(this.toURI().toString());

      return true;
    } catch (e) {
      if (strCharset && bCharsetFailover) {
        jsx3.ide.LOG.error("Could not write file " + this + (strCharset ? " with character encoding " + strCharset : "") + ".",
            jsx3.NativeError.wrap(e));
        return this.write(arguments[0], {linebreakmode:strLineMode});
      } else {
        jsx3.ide.LOG.error("Failed to write to file " + this + ".", jsx3.NativeError.wrap(e));
        return false;
      }
    }
  };

  /**
   * reads text data from a file
   * @return {String} file contents
   */
  XPCOMFile_prototype.read = function() {
    if (! this._imp) return null;
    
    ep(XPCOMFile._PERM);
    try {
      var bytes = this._imp.fileSize;
      
      var uri = XPCOMFile._F._IOSERVICE.newFileURI(this._imp);
      var channel = XPCOMFile._F._IOSERVICE.newChannelFromURI(uri);
      var inputStream = new XPCOMFile._F._INPUTSTREAM();
      inputStream.init(channel.open());
      
      var contents = inputStream.read(bytes);
      inputStream.close();
      
      return contents;
    } catch (e) {
      throw new jsx3.Exception("Failed to read file " + this + ": " + e);
    }
  };
  
  /**
   * whether file exists and is a directory
   * @return {boolean}
   */
  XPCOMFile_prototype.isDirectory = function() {
    ep(XPCOMFile._PERM);
    return this._imp != null && this._imp.exists() && this._imp.isDirectory();
  };
  
  /**
   * whether file exists and is a file
   * @return {boolean}
   */
  XPCOMFile_prototype.isFile = function() {
    ep(XPCOMFile._PERM);
    return this._imp != null && this._imp.exists() && this._imp.isFile();
  };
  
  /**
   * get the folder containing this file; throws an error if this file or does not actually exist on disk. 
   * @return {jsx3.io.XPCOMFile} the parent or null if already root
   */
  XPCOMFile_prototype.getParentFile = function() {
    ep(XPCOMFile._PERM);
    if (this._imp) {
      // throwing an exception on Windows
      try {
        var parent = this._imp.parent;
      } catch (e) { return null; }

      if (parent != null && !parent.equals(this._imp))
        return XPCOMFile._fromImplementation(this._fs, parent);
    }
    return null;
  };

  /**
   * get the folders and files contained in this folder
   * @return {Array<jsx3.io.XPCOMFile>}
   */
  XPCOMFile_prototype.listFiles = function() {
    ep(XPCOMFile._PERM);
    var files = jsx3.$A();
    
    if (this._imp) {
      var entries = this._imp.directoryEntries;
  
      while (entries.hasMoreElements()) {
        var file = entries.getNext().QueryInterface(Components.interfaces["nsILocalFile"]);
        files.push(XPCOMFile._fromImplementation(this._fs, file));
      }
    }
    
    return files;
  };
    
  /**
   * create this file as a directory
   */
  XPCOMFile_prototype.mkdir = function() {
    ep(XPCOMFile._PERM);
    if (this._imp) {
      if (this._imp.parent && this._imp.parent.exists() && this._imp.parent.isDirectory()) {
        if (this._imp.exists()) {
          if (! this._imp.isDirectory())
            throw new jsx3.Exception("Error creating directory " + this + ": file already exists.");
        } else {
          this._imp.create(0x01, 0755);
        }
      } else {
        throw new jsx3.Exception("Error creating directory " + this + ": parent directory does not exist.");
      }
    } else {
      throw new jsx3.Exception("Error creating directory " + this + ": bad path.");
    }
  };
    
  /**
   * create this directory and any non-existent parent directories
   */
  XPCOMFile_prototype.mkdirs = function() {
    ep(XPCOMFile._PERM);
    if (this._imp) {
      if (!this._imp.exists() || !this._imp.isDirectory())
        this._imp.create(0x01, 0755);
    } else {
      throw new jsx3.Exception("Error creating directory " + this + ": bad path.");
    }
  };
    
  /**
   * delete this file/directory
   */
  XPCOMFile_prototype.deleteFile = function() {
    ep(XPCOMFile._PERM);
    
    if (!(this._imp && this._imp.exists()))
      throw new jsx3.Exception("Error deleting file " + this + ": this file does not exist.");      

    if (this.isDirectory()) {
      this._imp.remove(true);
    } else {
      this._imp.remove(false);
    }
  };
    
  /**
   * get the absolute path
   * @return {String}
   */
  XPCOMFile_prototype.getAbsolutePath = function() {
    if (this._abspath == null) {
      ep(XPCOMFile._PERM);
      try {
        var path = this._path;
        if (jsx3.app.Browser.WIN32) {
          if (this._path.length <= 3 && this._path.charAt(1) == ":")
            path += "\\\\\\";
        }
        var f = new XPCOMFile._F._FILE(path);
        f.normalize();
        /* @jsxobf-clobber */
        this._abspath = f.path;
      } catch (e) {
        this._abspath = this._path;
      }
    }
    return this._abspath;
  };
    
  /**
   * get the name of the file excluding the parent path
   * @return {String}
   */
  XPCOMFile_prototype.getName = function() {
    ep(XPCOMFile._PERM);
    return this._imp && this._imp.leafName;
  };

  /**
   * whether the file exists
   * @return {boolean}
   */
  XPCOMFile_prototype.exists = function() {
    ep(XPCOMFile._PERM);
    if (this._imp != null && this._imp.exists()) {
      if (this._imp.isDirectory()) {
        try {
          var t = this._imp.directoryEntries.length;
          return true;
        } catch (e) {
          this._imp = null;
        }
      } else {
        return true;
      }
    }
    return false;
  };
    
  /**
   * move this file/directory
   * @param objDest {jsx3.io.XPCOMFile} destination file
   */
  XPCOMFile_prototype.renameTo = function(objDest) {
    ep(XPCOMFile._PERM);
    var destImp = objDest._imp;
    
    if (!(destImp && this._imp && this._imp.exists()))
      throw new jsx3.Exception("Error renaming file " + this + ": this file does not exist.");      
    
    var newDir = destImp.parent;
    var newName = destImp.leafName;
    if (!(newDir.exists() && newDir.isDirectory()))
      throw new jsx3.Exception("Error renaming file " + this + ": destination directory does not exist.");        
    
    if (destImp.exists())
      objDest.deleteFile();
    this._imp.moveTo(newDir, newName);
  };

  /**
   * whether file is hidden
   * @return {boolean}
   */
  XPCOMFile_prototype.isHidden = function() {
    ep(XPCOMFile._PERM);
    return this._imp && this._imp.exists() && this._imp.isHidden();
  };
  
  /**
   * whether file is read only
   * @return {boolean}
   */
  XPCOMFile_prototype.isReadOnly = function() {
    ep(XPCOMFile._PERM);
    return this._imp && this._imp.exists() && ! this._imp.isWritable();
  };
  
  /**
   * sets the read-only bit on a file
   * @param bReadOnly {boolean} the new value of the bit
   */
  XPCOMFile_prototype.setReadOnly = function(bReadOnly) {
    if (this.exists()) {
      ep(XPCOMFile._PERM);
      if (bReadOnly) {
        this._imp.permissions &= XPCOMFile.READONLY_PERM;
      } else {
        this._imp.permissions |= XPCOMFile.READWRITE_PERM;
      }
    }
  };
  
  /**
   * english description of file type
   * @return {String}
   */
  XPCOMFile_prototype.getType = function() {
    return this.isDirectory() ? "Folder" : this.getExtension().toUpperCase() + " File";
  };
  
  /**
   * get files stats
   * @return {map} [ctime: created time, mtime: last modified type, atime: last access time, size: size]
   */
  XPCOMFile_prototype.getStat = function() {
    ep(XPCOMFile._PERM);
    var stat = {mtime: null, size: null}
    if (this._imp) {
      stat.mtime = new Date(this._imp.lastModifiedTime);
      if (this.isFile())
        stat.size = this._imp.fileSize;
    }
    return stat;
  };

  /**
   * @return {jsx3.net.URI}
   */
  XPCOMFile_prototype.toURI = function() {
    var u = this._uri;
    if (u == null || (!jsx3.$S(u.getPath()).endsWith("/") && this.isDirectory())) {
      var path = this.getAbsolutePath().replace(/\\/g,"/") + (this.isDirectory() ? "/" : "");
      if (path.substring(0, 1) != "/") path = "/" + path;

      if (u) {
        this._uri = jsx3.net.URI.fromParts(u.getScheme(), u.getUserInfo(), u.getHost(), u.getPort(), path,
                u.getQuery(), u.getFragment());
      } else {
        this._uri = jsx3.net.URI.fromParts("file", null, null, null, path, null, null);
      }
    }
    return this._uri;
  };

/*
  XPCOMFile_prototype.getRootDirectory = function() {
    if (this.exists()) {
      var f = this;
      while (true) {
        var parent = f.getParentFile();
        if (parent == null || f.equals(parent))
          return f;
        f = parent;
      }
    } else {
      var f = this;
      while (!f.exists()) {
        var ppath = f.getParentPath();
        if (!ppath || f.getPath() == ppath)
          return null;
        f = new XPCOMFile(ppath);
      }
      if (f.exists())
        return f.getRootDirectory();
    }
    return null;
  };
*/

  /** @private @jsxobf-clobber */
  XPCOMFile._fromImplementation = function(fs, imp) {
    var f = XPCOMFile.jsxclass.bless();
    f._fs = fs;
    f._imp = imp;
    f._path = imp.path;
    return f;
  };

});
