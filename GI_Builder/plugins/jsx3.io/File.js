/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Wraps the file system. Based on java.io.File.
 */
jsx3.Class.defineClass("jsx3.io.File", null, null, function(File, File_prototype) {

  /** {int} */
  File.FIND_INCLUDE = 1;

  /** {int} */
  File.FIND_RECURSE = 2;
  
  File.LINE_SEP = {dos:"\r\n", mac:"\r", unix:"\n"};

  /**
   * instance initializer
   * @param strParent {String|jsx3.net.URI} the parent directory of the file, or the entire file path
   * @param strPath {String} the name of the file in the strParent directory
   */
  File_prototype.init = function(fs, uri) {
    this._fs = fs;
    this._uri = jsx3.net.URI.valueOf(uri);
  };

  File_prototype.getFileSystem = function() {
    return this._fs;
  };
  
  /**
   * writes text data to a file; if bUnicode is false or null and the first write attempt fails, this method tries to write again with unicode output
   * @param strData {String} the text to write
   * @param strCharset {String}
   * @return {boolean} success
   */
  File_prototype.write = function(strData, objArgs) {
    throw new jsx3.Exception("Not implemented");
  };

  /**
   * reads text data from a file
   * @param bUnicode {boolean} if true read as unicode
   * @return {String} file contents
   */
  File_prototype.read = function() {
    throw new jsx3.Exception("Not implemented");
  };
  
  /**
   * whether file exists and is a directory
   * @return {boolean}
   */
  File_prototype.isDirectory = function() {
    return false;
  };
  
  /**
   * whether file exists and is a file
   * @return {boolean}
   */
  File_prototype.isFile = function() {
    return false;
  };
  
  /**
   * get the folder containing this file; throws an error if this file or does not actually exist on disk. 
   * @return {jsx3.io.File} the parent or null if already root
   */
  File_prototype.getParentFile = function() {
    var u = this.toURI();
    var path = u.getPath();
    if (path == "/" || path == "") return null;

    if (this.isDirectory() && jsx3.$S(path).endsWith("/")) {
      u = u.resolve("..");
    } else {
      u = u.resolve(".");
    }

    var parentFile = this._fs.getFile(u);
    return this.equals(parentFile) ? null : parentFile;
  };

  /**
   * Creates a new file by resolving the relative path <code>strPath</code> to this file. 
   * @param strPath
   * @throws {jsx3.Exception} if strPath is not a relative path.
   */
  File_prototype.resolve = function(strPath) {
    strPath = jsx3.net.URI.valueOf(strPath);
    if (strPath.isAbsolute())
      throw new jsx3.Exception("May not resolve an absolute path: " + strPath);
    return this._fs.getFile(this.toURI().resolve(strPath));
  };
  
  /**
   * get the path of the parent of this file, will work even for non-existent files
   * @return {String}
   */
  File_prototype.getParentPath = function() {
    var f = this.getParentFile();
    return f != null ? f.getAbsolutePath() : null;
  };
  
  /**
   * get the folders and files contained in this folder
   * @return {Array<jsx3.io.File>}
   */
  File_prototype.listFiles = function() {
    return jsx3.$A();
  };
    
  /**
   * create this file as a directory
   */
  File_prototype.mkdir = function() {
    throw new jsx3.Exception("Not implemented");
  };
    
  /**
   * create this directory and any non-existent parent directories
   */
  File_prototype.mkdirs = function() {
    var p = this.getParentFile();
    if (p) p.mkdirs();
    if (!this.isDirectory())
      this.mkdir();
  };
    
  /**
   * delete this file/directory
   */
  File_prototype.deleteFile = function() {
    throw new jsx3.Exception("Not implemented");
  };
    
  /**
   * get the absolute path
   * @return {String}
   */
  File_prototype.getAbsolutePath = function() {
    return this.toURI().getPath();
  };
    
  /**
   * get the name of the file excluding the parent path
   * @return {String}
   */
  File_prototype.getName = function() {
    var u = this.toURI().getPath();
    var index = u.lastIndexOf("/");
    if (index == u.length - 1) {
      index = u.lastIndexOf("/", index - 1);
      return u.substring(index >= 0 ? index + 1 : 0, u.length - 1);
    } else {   
      return index >= 0 ? u.substring(index + 1) : u;
    }
  };
  
  /**
   * the file extension (ie 'txt'), always lowercase
   * @return {String}
   */
  File_prototype.getExtension = function() {
    var name = this.getName();
    if (name) {
      var indexDot = name.lastIndexOf(".");
      if (indexDot >= 0)
        return name.substring(indexDot+1);
    }
    return "";
  };
    
  /**
   * whether the file exists
   * @return {boolean}
   */
  File_prototype.exists = function() {
    return this.isFile() || this.isDirectory();
  };
    
  /**
   * move this file/directory
   * @param objDest {jsx3.io.File} destination file
   */
  File_prototype.renameTo = function(objDest) {
    throw new jsx3.Exception("Not implemented");
  };
  
  /**
   * Copies this file or recursively copies this directory.
   * @param objDest {jsx3.io.File} destination file
   */
  File_prototype.copyTo = function(objDest) {
    if (this.isFile()) {
      objDest.write(this.read());
    } else if (this.isDirectory()) {
      objDest.mkdir();
      this.listFiles().each(function(e) {
        e.copyTo(objDest.resolve(e.getName()));
      });
    }
  };
  
  /**
   * whether file is hidden
   * @return {boolean}
   */
  File_prototype.isHidden = function() {
    return false;
  };
  
  /**
   * whether file is read only
   * @return {boolean}
   */
  File_prototype.isReadOnly = function() {
    return false;
  };
  
  /**
   * sets the read-only bit on a file
   * @param bReadOnly {boolean} the new value of the bit
   */
  File_prototype.setReadOnly = function(bReadOnly) {
    throw new jsx3.Exception("Not implemented");
  };
  
  /**
   * whether this file is a root node in the file syste
   * @return {boolean}
   */
  File_prototype.isRoot = function() {
    return this.getParentFile() == null;
  };
  
  /**
   * english description of file type
   * @return {String}
   */
  File_prototype.getType = function() {
    return this.getExtension();
  };
  
  /**
   * get files stats
   * @return {map} [ctime: created time, mtime: last modified type, atime: last access time, size: size]
   */
  File_prototype.getStat = function() {
    return {mtime: null, size: null};
  };
  
  /**
   * whether two instances of this class represent the same file on disk
   * @param file {object} another File instance
   */
  File_prototype.equals = function(file) {
    if (file && file.toURI) {
      var u1 = this.toURI();
      var u2 = file.toURI();
      if (u1.getScheme() == u2.getScheme() && u1.getPath() == u2.getPath() && u1.getQuery() == u2.getQuery()) {
        var a1 = u1.getAuthority() || "";
        var a2 = u2.getAuthority() || "";
        return a1 == a2;
      }
    }
    return false;
  };
  
  /**
   * Whether this file is contained within <code>file</code>.
   * @param file {jsx3.io.File} the possible descendant
   * @return {boolean}
   */
  File_prototype.isDescendantOf = function(file) {
    var u1 = file.toURI();
    var u2 = this.toURI();
    if (u1.getScheme() != u2.getScheme()) return false;
    // So that file:/ and file:/// are equal
    if ((u1.getAuthority() || "") != (u2.getAuthority() || "")) return false;

    var path1 = u1.getPath();
    var path2 = u2.getPath();

    return path2.length > path1.length && path2.indexOf(path1) == 0 &&
        (path2.charAt(path1.length) == "/" || path2.charAt(path1.length - 1) == "/");
  };
  
  /**
   * construct a relative file path from this file to the file argument, including any necessary '..'
   * @param file {jsx3.io.File} 
   * @return {String}
   */
  File_prototype.relativePathTo = function(file) {
    return this.toURI().relativize(file.toURI()).toString();
  };
  
  /** @private @jsxobf-clobber */
  File._allRecursive = function(x) { return File.FIND_INCLUDE | File.FIND_RECURSE; };

  /**
   * find all descendants of this folder according to a filter function
   * @param fctFilter {function} returns a bit mask including jsx3.io.File.FIND_INCLUDE is the file should be included in the result and jsx3.io.File.FIND_RECURSE if the folder should be recursed into.
   * @param bRecursive {boolean} whether to search recursively into sub folders.
   * @param-private arrDest {Array<jsx3.io.File>}
   * @return {Array<jsx3.io.File>} the found files
   */
  File_prototype.find = function(fctFilter, bRecursive, arrDest) {
    if (arrDest == null) arrDest = [];
    if (!fctFilter) fctFilter = File._allRecursive;
    
    var files = this.listFiles();
    for (var i = 0; i < files.length; i++) {
      var result = fctFilter.call(null, files[i]);
      
      if ((result & File.FIND_INCLUDE) > 0)
        arrDest.push(files[i]);
      
      if (bRecursive && files[i].isDirectory() && (result & File.FIND_RECURSE) > 0)
        files[i].find(fctFilter, bRecursive, arrDest);
    }
    
    return jsx3.$A(arrDest);
  };
  
  /**
   * @return {jsx3.net.URI}
   */
  File_prototype.toURI = function() {
    return this._uri;
  };

  /**
   * Returns the root directory of this file. On Windows this is the drive containing this file. On most other
   * systems it is the root "/" directory.
   * @return {jsx3.io.File}
   */
  File_prototype.getRootDirectory = function() {
    var f = this;
    while (true) {
      var p = f.getParentFile();
      if (!p) {
        if (f.isDirectory())
          return f;
        else
          return null;
      } else {
        f = p;
      }
    }
  };
  
  File_prototype.toString = function() {
    return this.getAbsolutePath();
  };

});
