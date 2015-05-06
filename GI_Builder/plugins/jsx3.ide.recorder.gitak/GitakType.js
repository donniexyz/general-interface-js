
jsx3.Class.defineClass("jsx3.ide.gitak.FileType", jsx3.ide.FileType, null, function(FileType, FileType_prototype) {

  FileType_prototype.isTypeOf = function(objFile, objXML) {
    return objXML != null && !objXML.hasError() &&
           objXML.getNodeName() == "html" && objXML.getAttribute("gitak") == "true";
  };

});
