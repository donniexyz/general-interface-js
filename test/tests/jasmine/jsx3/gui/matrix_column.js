/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Matrix.Column", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Matrix");
  var t = new _jasmine_test.App("jsx3.gui.Matrix");
  var MatrixColumn;
  var matrix_column;
  var getMatrixColumn = function(s) {
    var root1 = s.getBodyBlock().load("data/matrix_column.xml");
    return root1.getServer().getJSXByName('textColumn');
  };

  beforeEach(function() {
    t._server = (!t._server) ? t.newServer("data/server_matrix_column.xml", ".", true) : t._server;
    matrix_column = getMatrixColumn(t._server);
    if (!MatrixColumn) {
      MatrixColumn = jsx3.gui.Matrix.Column;
    }
  });

  afterEach(function() {
    if (t._server)
      t._server.getBodyBlock().removeChildren();
  });

  it("should be able to set and get whether the parent list/grid can be sorted on this column", function() {
    expect(matrix_column.getCanSort()).toBeUndefined();
    matrix_column.setCanSort(jsx3.Boolean.FALSE);
    expect(matrix_column.getCanSort()).toEqual(jsx3.Boolean.FALSE);
  });

  // it("should be able to set and get CSS property value for the data cell background-color", function() {

  // });

  it("should be able to set and get CSS property value for the data cell border", function() {
    expect(matrix_column.getCellBorder()).toBeUndefined();
    matrix_column.setCellBorder('solid 1px red', true);
    expect(matrix_column.getCellBorder()).toEqual('solid 1px red');

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.style.border).toMatch(/1px|solid|red/);
    });
  });

  it("should be able to set and get CSS property value for the data cell cursor", function() {
    expect(matrix_column.getCellCursor()).toBeUndefined();
    matrix_column.setCellCursor('pointer');
    expect(matrix_column.getCellCursor()).toEqual('pointer');

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.style.cursor).toEqual('pointer');
    });
  });

  it("should be able set and get the CSS property value for the data cell font-family", function() {
    expect(matrix_column.getCellFontName()).toBeUndefined();
    matrix_column.setCellFontName('Arial');
    expect(matrix_column.getCellFontName()).toEqual('Arial');

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.style.fontFamily).toEqual('Arial');
    });
  });

  it("should be able set and get the CSS property value for the data cell font-size", function() {
    expect(matrix_column.getCellFontSize()).toBeUndefined();
    matrix_column.setCellFontSize(16);
    expect(matrix_column.getCellFontSize()).toEqual(16);

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.style.fontSize).toEqual('16px');
    });
  });

  it("should be able set and get the CSS property value for the data cell font-weight", function() {
    expect(matrix_column.getCellFontWeight()).toBeUndefined();
    matrix_column.setCellFontWeight('bold');
    expect(matrix_column.getCellFontWeight()).toEqual('bold');

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.style.fontWeight).toEqual('bold');
    });
  });

  it("should be able set and get the CSS property value for the data cell padding", function() {
    expect(matrix_column.getCellPadding()).toEqual('3');
    matrix_column.setCellPadding('8 4 8 4');
    expect(matrix_column.getCellPadding()).toEqual('8 4 8 4');

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.style.padding).toEqual('8px 4px');
    });
  });

  it("should be able set and get the CSS property value for the data cell text-align", function() {
    expect(matrix_column.getCellTextAlign()).toBeUndefined();
    matrix_column.setCellTextAlign('center');
    expect(matrix_column.getCellTextAlign()).toEqual('center');
    matrix_column.repaint();
    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.firstChild.style.textAlign).toEqual('center');
    });
  });

  it("should be able set and get the CSS property value for the data cell vertical-align", function() {
    expect(matrix_column.getCellVAlign()).toBeUndefined();
    matrix_column.setCellVAlign('top');
    expect(matrix_column.getCellVAlign()).toEqual('top');

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      expect(cell.style.verticalAlign).toEqual('top');
    });
  });

  it("should be able to set and get whether or not the data cellc will support text-wrapping", function() {
    expect(matrix_column.getCellWrap()).toBeNull();
    matrix_column.setCellWrap(jsx3.Boolean.FALSE);
    expect(matrix_column.getCellWrap()).toEqual(jsx3.Boolean.FALSE);
  });

  it("should be able to set and get the data type for this column of data", function() {
    expect(matrix_column.getDataType()).toEqual('text');
    matrix_column.setDataType('number');
    expect(matrix_column.getDataType()).toEqual('number');
  });

  it("should be able to set and get the zero-based index for ths column in relation to its siblings", function() {
    expect(matrix_column.getDisplayIndex()).toEqual(0);
    matrix_column.setDisplay('none', true);
    expect(matrix_column.getDisplayIndex()).toBeUndefined();
  });

  it("should be able to set and get the identifier for which of the default column formatters should be implemented", function() {
    expect(matrix_column.getFormatHandler()).toBeUndefined();
    matrix_column.setFormatHandler('@message');
    expect(matrix_column.getFormatHandler()).toEqual('@message');
  });

  it("should be able to set and get the selection path for this column of data", function() {
    expect(matrix_column.getPath()).toEqual('jsxtext');
    matrix_column.setPath('jsxid', true);
    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[1].tBodies[0].rows[0].cells[0];
      if (cell.innerText) {
        expect(cell.innerText.trim()).toEqual('AG');
      } else {
        expect(cell.textContent.trim()).toEqual('AG');
      }
    });
  });

  it("should be able to set and get whether or not this column can be resized by the user", function() {
    expect(matrix_column.getResizable()).toBeUndefined();
    matrix_column.setResizable(jsx3.Boolean.FALSE);
    expect(matrix_column.getResizable()).toEqual(jsx3.Boolean.FALSE);
  });

  it("should be able to set and get the data type for this column of data", function() {
    expect(matrix_column.getSortDataType()).toEqual('text');
    matrix_column.setSortDataType('number');
    expect(matrix_column.getSortDataType()).toEqual('number');
  });

  it("should be abe to set and get the CDF attribute to use to sort on this column", function() {
    expect(matrix_column.getSortPath()).toEqual('jsxtext');
    matrix_column.setSortPath('jsxid');
    expect(matrix_column.getSortPath()).toEqual('jsxid');
  });

  it("should be able to set and get one or more named attributes", function() {
    expect(matrix_column.getTriggers()).toBeUndefined();
    matrix_column.setTriggers('jsxtext, jsxid');
    expect(matrix_column.getTriggers()).toEqual('jsxtext, jsxid');
  });

  it("should be able to set and get the CSS property value for the header cell vertical-align", function() {
    expect(matrix_column.getVAlign()).toBeUndefined();
    matrix_column.setVAlign('top');
    expect(matrix_column.getVAlign()).toEqual('top');

    waitsFor(function() {
      return document.getElementsByTagName('table')[1] != null;
    });
    runs(function() {
      var cell = document.getElementsByTagName('table')[0].tBodies[0].rows[0].cells[0];
      expect(cell.style.verticalAlign).toEqual('top');
    });
  });

  it("should be able to set and get the user-defined XSL template (xsl:template)", function() {
    expect(matrix_column.getValueTemplate()).toBeUndefined();
    matrix_column.setValueTemplate(MatrixColumn.TEMPLATES["unescape"]);
    expect(matrix_column.getValueTemplate()).toEqual(MatrixColumn.TEMPLATES["unescape"]);
  });

  it("should be able to set and get whether or not the header cell will support text-wrapping", function() {
    expect(matrix_column.getWrap()).toBeNull();
    matrix_column.setWrap(jsx3.Boolean.FALSE);
    expect(matrix_column.getWrap()).toEqual(jsx3.Boolean.FALSE);
  });

  it("should clean up", function() {
    t._server.destroy();
    t.destroy();
    expect(t._server.getBodyBlock().getRendered()).toBeNull();
    delete t._server;
  });
});