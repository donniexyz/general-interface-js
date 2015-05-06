/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.Class.defineClass("jsx3.io.FSOFileSystem", jsx3.io.FileSystem, null, function(FSOFileSystem, FSOFileSystem_prototype) {

  var FileSystem = jsx3.io.FileSystem;

  // create a singleton FileSystemObject
  try {
    /** @private @jsxobf-clobber */
    FSOFileSystem._FSO = new ActiveXObject("Scripting.FileSystemObject");
  } catch (e) {
    jsx3.util.Logger.getLogger("jsx3.ide").error("Could not instantiate ActiveX Scripting.FileSystemObject.",
        jsx3.NativeError.wrap(e));
    FSOFileSystem._FSO = null;
  }

  FSOFileSystem._WINPATH = /^[a-zA-Z]:\\/;

  FSOFileSystem_prototype.getFile = function(strPath) {
    if (typeof(strPath) == "string" && strPath.match(FSOFileSystem._WINPATH)) {
      strPath = "file:///" + strPath.replace(/\\/g, "/");
    }

    var uri = jsx3.net.URI.valueOf(strPath);
    if (!uri.getScheme()) {
      uri = new jsx3.net.URI("file://" + (uri.getPath().indexOf("/") != 0 ? "/" : "") + uri.getPath());
    }
    return new jsx3.io.FSOFile(this, uri);
  };

  /** @private @jsxobf-clobber */
  FSOFileSystem_prototype._getHome = function() {
    var shell = new ActiveXObject("WScript.Shell");
    var desktop = shell.specialFolders("Desktop");
    return this.getFile(desktop).getParentFile();
  };

  FSOFileSystem_prototype.getUserDocuments = function() {
    var shell = new ActiveXObject("WScript.Shell");
    var docs = shell.specialFolders("MyDocuments");
    var docsFolder = this.getFile(docs);
    return docsFolder.isDirectory() ? docsFolder : this._getHome();
  };

  FSOFileSystem_prototype.getRoots = function() {
    var roots = [];
    var e = new Enumerator(FSOFileSystem._FSO.Drives);
    for (; !e.atEnd(); e.moveNext()) {
      var r = e.item();
      roots.push(this.getFile(r.DriveLetter + ":\\"));
  //      // only get drives that are mounted
  //      if (r.IsReady)
  //        roots.push(FSOFile._fromImplementation(r.RootFolder));
    }
    return roots;
  };

  /**
   * get the path of a valid temp file
   * @return {jsx3.io.FSOFile} the temp file
   */
  FSOFileSystem_prototype.createTempFile = function(strName) {
//    var tmpDir = FSOFileSystem._FSO.GetSpecialFolder(2);
    var tmpName = FSOFileSystem._FSO.GetTempName();
    var tmpPath = jsx3.app.Browser.getLocation().resolve(tmpName);
    var tmpFile = this.getFile(tmpPath);
    if (!tmpFile.exists()) {
      var f = FSOFileSystem._FSO.CreateTextFile(tmpFile.getPath(), true, false);
      f.Close();
    }

    return tmpFile;
  };

});

/**
 * Wraps the file system. Based on java.io.File.
 */
jsx3.Class.defineClass("jsx3.io.FSOFile", jsx3.io.File, null, function(FSOFile, FSOFile_prototype) {

  var File = jsx3.io.File;
  var FSOFileSystem = jsx3.io.FSOFileSystem;

  FSOFile.PATH_SEPARATOR = "\\";
  
  /** @private @jsxobf-clobber */
  FSOFile._ATTR_READONLY = 1;
  /** @private @jsxobf-clobber */
  FSOFile._ATTR_HIDDEN = 2;
  /** @private @jsxobf-clobber */
  FSOFile._ATTR_SYSTEM = 4;
  
  /** @private @jsxobf-clobber */
  FSOFile_prototype._path = null;
  
  /**
   * instance initializer
   */
  FSOFile_prototype.init = function(fs, uri) {
    this.jsxsuper(fs, uri);

    if (uri != null) {
      if (uri.getScheme() != "file")
        throw new jsx3.Exception("scheme is not 'file': " + uri);

      this._path = (uri.isAbsolute() && uri.getPath()) ?
          uri.getPath().substring(1) : uri.getPath();

      // For whatever reason C: will be resolved to the current directory while C:\ is the drive root directory.
      if (jsx3.$S(this._path).endsWith(":"))
        this._path += "/";

      this._path = this._path.replace(/\//g, "\\");
    } else {
      this._uri = null;
    }
  };

  /**
   * writes text data to a file; if bUnicode is false or null and the first write attempt fails, this method tries to write again with unicode output
   * @param strData {String} the text to write
   * @param strCharset {String}
   * @return {boolean} success
   */
  FSOFile_prototype.write = function(strData, objParams) {
    if (!objParams) objParams = {};

    var strCharset = objParams.charset;
    var strLineMode = objParams.linebreakmode;
    var bCharsetFailover = objParams.charsetfailover;
    var bNoLog = objParams.quiet;

    var log = jsx3.ide.LOG;
    var bUnicode = strCharset != null && strCharset.toLowerCase() == "utf-16";

    if (strLineMode) strData = strData.split(/\r\n|\r|\n/g).join(File.LINE_SEP[strLineMode]);

    if (strCharset && !bUnicode) {
      try {
        this._writeADO(strData, strCharset);
        return true;
      } catch (e) {
        if (!bNoLog)
          log.error("Could not write file " + this + (strCharset ? " with character encoding " + strCharset : "") + ".",
              jsx3.NativeError.wrap(e));
        if (! bCharsetFailover)
          return false;
      }
    }

    var f = null;

    try {
      //file name, overwrite, unicode
      f = FSOFileSystem._FSO.CreateTextFile(this.getPath(), true, bUnicode);
      f.Write(strData);
      f.Close();
      return true;
    } catch (e) {
      if (f != null) f.close();

      if (!bNoLog) {
        if ((e.number & 0xFFFF) == 5) {
          log.error("Failed to write file " + this + " because the content contains unsupported characters.", jsx3.NativeError.wrap(e));
        } else if ((e.number & 0xFFFF) == 70) {
          log.error("Failed to write file " + this + " because the file in not writable.", jsx3.NativeError.wrap(e));
        } else {
          log.error("Failed to write file " + this + ".", jsx3.NativeError.wrap(e));
        }
      }
    }
    
    return false;
  };

  /** @private @jsxobf-clobber */
  FSOFile_prototype._writeADO = function(strData, strCharset) {
    var s = new ActiveXObject("ADODB.Stream");
    s.Mode = 3;
    s.Type = 2;
    s.Open();
    s.CharSet = strCharset;
    s.WriteText(strData);
    s.SaveToFile(this.getAbsolutePath(), this.exists() ? 2 : 1);
    s.Close();
  };
  
  /**
   * reads text data from a file
   * @param bUnicode {boolean} if true read as unicode
   * @return {String} file contents
   */
  FSOFile_prototype.read = function() {
    try {
      // FSO throws error opening an empty file :-(
      if (this.isFile() && this.getStat().size == 0)
        return "";

      // open the selected file
      var oFile = this._getFileObject();
      var f = oFile.OpenAsTextStream(1, -2);
      
      var r = f.ReadAll();
      f.Close();

      // return document data
      return r;
    } catch (e) {
      jsx3.ide.LOG.warn("Failed to read file " + this + ": " + jsx3.NativeError.wrap(e));
    }
    
    return null;
  };
  
  /**
   * whether file exists and is a directory
   * @return {boolean}
   */
  FSOFile_prototype.isDirectory = function() {
    var fo = this._getFileObject();
    return fo != null && (fo.Attributes & 0x18) > 0;
  };
  
  /**
   * whether file exists and is a file
   * @return {boolean}
   */
  FSOFile_prototype.isFile = function() {
    var fo = this._getFileObject();
    return fo != null && (fo.Attributes & 0x18) == 0;
  };
  
//  /**
//   * get the folder containing this file; throws an error if this file or does not actually exist on disk.
//   * @return {jsx3.io.FSOFile} the parent or null if already root
//   */
//  FSOFile_prototype.getParentFile = function() {
//    var file = this._getFileObject();
//
//    if (file != null) {
//      return file.ParentFolder != null ? FSOFile._fromImplementation(file.ParentFolder) : null;
//    } else {
//      throw new jsx3.Exception("Cannot get parent of non-existent file " + this + ".");
//    }
//  };
  
  /**
   * get the path of the parent of this file, will work even for non-existent files
   * @return {String}
   */
  FSOFile_prototype.getParentPath = function() {
    var path = this.getAbsolutePath();
    
    var index = path.lastIndexOf("\\");
    
    if (index == path.length-1) {
      path = path.substring(0, path.length-1);
      index = path.lastIndexOf("\\");
    }
    
    if (index < 0) return null;
    
    return path.substring(0, index);
  };
  
  /**
   * get the folders and files contained in this folder
   * @return {Array<jsx3.io.FSOFile>}
   */
  FSOFile_prototype.listFiles = function() {
    var files = jsx3.$A();

    if (this.isDirectory()) {
      var directory = this._getFileObject();

      var e = new Enumerator(directory.SubFolders);
      for (; !e.atEnd(); e.moveNext()) {
        var file = FSOFile._fromImplementation(this.getFileSystem(), e.item());
        files.push(file);
      }
        
      e = new Enumerator(directory.Files);
      for (; !e.atEnd(); e.moveNext()) {
        var file = FSOFile._fromImplementation(this.getFileSystem(), e.item());
        files.push(file);
      }
    } else {
      throw new jsx3.Exception("Cannot list contents of non-existent file " + this + ".");
    }
    
    return files;
  };
    
  /**
   * create this file as a directory
   */
  FSOFile_prototype.mkdir = function() {
    FSOFileSystem._FSO.CreateFolder(this.getPath());
  };
    
//  /**
//   * create this directory and any non-existent parent directories
//   */
//  FSOFile_prototype.mkdirs = function() {
//    var parentPath = this.getParentPath();
//    if (parentPath != null) {
//      var objParent = new FSOFile(parentPath);
//      if (! objParent.isDirectory())
//        objParent.mkdirs();
//    }
//
//    if (! this.isDirectory())
//      this.mkdir();
//  };
    
  /**
   * delete this file/directory
   */
  FSOFile_prototype.deleteFile = function() {
    var file = this._getFileObject();
    
    if (file != null) {
      file.Delete();
    } else {
      throw new jsx3.Exception("Cannot delete non-existent file " + this + ".");
    }
  };
    
  /**
   * get the path field
   * @return {String} the path that this file was created with
   */
  FSOFile_prototype.getPath = function() {
    if (this._path == null && this._fileObject != null)
      this._path = this._fileObject.Path;
    return this._path;
  };
    
  /**
   * get the absolute path
   * @return {String}
   */
  FSOFile_prototype.getAbsolutePath = function() {
    if (this._abspath == null) {
      var fo = this._getFileObject();
      if (fo != null) {
        this._abspath = fo.Path;
      } else {
        /* @jsxobf-clobber */
        this._abspath = FSOFileSystem._FSO.GetAbsolutePathName(this.getPath());
      }
    }
    return this._abspath;
  };
    
//  /**
//   * get the name of the file excluding the parent path
//   * @return {String}
//   */
  FSOFile_prototype.getName = function() {
    return FSOFileSystem._FSO.GetFileName(this.getAbsolutePath());
  };
//
//  /**
//   * the file extension (ie 'txt'), always lowercase
//   * @return {String}
//   */
//  FSOFile_prototype.getExtension = function() {
//    var path = this.getAbsolutePath();
//    if (path) {
//      var indexSlash = path.lastIndexOf("\\");
//      var indexDot = path.lastIndexOf(".");
//      if (indexDot > indexSlash) return path.substring(indexDot+1);
//    }
//    return null;
////    var ext = FSOFileSystem._FSO.GetExtensionName(this.getPath());
////    if (ext) ext = ext.toLowerCase();
////    return ext;
//  };

//  /**
//   * whether the file exists
//   * @return {boolean}
//   */
//  FSOFile_prototype.exists = function() {
//    return this.isFile() || this.isDirectory();
//  };
//
  /**
   * move this file/directory
   * @param objDest {jsx3.io.FSOFile} destination file
   */
  FSOFile_prototype.renameTo = function(objDest) {
    if (this.equals(objDest))
      throw new jsx3.Exception("Cannot rename file " + this + " to itself.");

    var file = this._getFileObject();
    
    if (file != null) {
      if (objDest.isFile()) objDest.deleteFile();
      file.Move(objDest.getPath());
    } else {
      throw new jsx3.Exception("Cannot move non-existent file " + this + ".");
    }
  };
  
  /**
   * whether file is hidden
   * @return {boolean}
   */
  FSOFile_prototype.isHidden = function() {
    var file = this._getFileObject();
    return file != null ? ((file.Attributes & FSOFile._ATTR_HIDDEN) > 0) : false;
  };
  
  /**
   * whether file is read only
   * @return {boolean}
   */
  FSOFile_prototype.isReadOnly = function() {
    var file = this._getFileObject();
    return file != null ? ((file.Attributes & FSOFile._ATTR_READONLY) > 0) : false;
  };
  
  /**
   * sets the read-only bit on a file
   * @param bReadOnly {boolean} the new value of the bit
   */
  FSOFile_prototype.setReadOnly = function(bReadOnly) {
    var file = this._getFileObject();
    if (file != null) {
      if (bReadOnly)
        file.Attributes |= FSOFile._ATTR_READONLY;
      else if ((file.Attributes & FSOFile._ATTR_READONLY) > 0)
        file.Attributes -= FSOFile._ATTR_READONLY;
    }
  };
  
  /**
   * whether this file is a root node in the file syste
   * @return {boolean}
   */
  FSOFile_prototype.isRoot = function() {
    var file = this._getFileObject();
    return file != null ? file.IsRootFolder : false;
  };
  
  /**
   * english description of file type
   * @return {String}
   */
  FSOFile_prototype.getType = function() {
    var file = this._getFileObject();
    return file != null ? file.Type : null;
  };
  
  /**
   * get files stats
   * @return {map} [mtime {Date}: last modified time, size {int}: size in bytes]
   */
  FSOFile_prototype.getStat = function() {
    var file = this._getFileObject();
    if (file != null) {
      var stat = {
//        ctime: new Date(file.DateCreated),
        mtime: new Date(file.DateLastModified)//,
//        atime: new Date(file.DateLastAccessed)
      };
      
      if (this.isFile())
        stat.size = file.Size;
      
      return stat;
    } else {
      return null;
    }
  };
  
  /**
   * @private
   * @jsxobf-clobber
   */
  FSOFile_prototype._getFileObject = function() {
    if (this._fileObject != null)
      return this._fileObject;
    if (this._path == null)
      return null;

    var path = this.getPath();
    if (FSOFileSystem._FSO.FileExists(path))
      this._fileObject = FSOFileSystem._FSO.GetFile(path);
    else if (FSOFileSystem._FSO.FolderExists(path))
      this._fileObject = FSOFileSystem._FSO.GetFolder(path);
    else
      this._fileObject = null;
    
    return this._fileObject;
  };
  
  /**
   * @return {jsx3.net.URI}
   */
  FSOFile_prototype.toURI = function() {
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

  /**
   * Returns the root directory of this file. On Windows this is the drive containing this file. On most other
   * systems it is the root "/" directory.
   * @return {jsx3.io.FSOFile}
   */
  FSOFile_prototype.getRootDirectory = function() {
    var fo = this._getFileObject();
    if (fo != null) {
      while (fo.ParentFolder != null)
        fo = fo.ParentFolder;
      return FSOFile._fromImplementation(this.getFileSystem(), fo);
    } else {
      var f = this;
      while (!f.exists()) {
        var ppath = f.getParentPath();
        if (!ppath || f.getPath() == ppath)
          return null;
        f = FSOFileSystem.getFile(ppath);
      }
      if (f.exists())
        return f.getRootDirectory();
    }
    return null;
  };

  /** @private @jsxobf-clobber */
  FSOFile._fromImplementation = function(fs, imp) {
    var f = new FSOFile(fs);
    /* @jsxobf-clobber */
    f._fileObject = imp;
    return f;
  };

});
