
jsx3.Class.defineClass("jsx3.ide.gipp.FileType", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    var data = objFile.read();
    return data && data.match(/\/\* BEGIN GIPP RECORDER \*\/\s*var\s+recorderTests\s*=/);
  };

});
