/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
describe("jsx3.gui.Matrix", function() {

  var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.gui.Matrix");
  var t = new _jasmine_test.App("jsx3.gui.Matrix");
  var Matrix;

  describe("matrix_grid", function() {
    var matrix1;
    var getMatrix1 = function(s) {
      var root1 = s.getBodyBlock().load("data/matrix_grid.xml");
      return root1.getServer().getJSXByName('matrix1');
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_matrix_grid.xml", ".", true) : t._server;
      matrix1 = getMatrix1(t._server);
      if (!Matrix) {
        Matrix = jsx3.gui.Matrix;
      }
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should be able to instance", function() {
      expect(matrix1).toBeInstanceOf(Matrix);
    });

    it("should be able to paint", function() {
      expect(matrix1.getRendered()).not.toBeNull();
      expect(matrix1.getRendered().nodeName.toLowerCase()).toEqual("div");
    });

    it("should be abe to remove a record from the XML data source of this object", function() {
      var cdf = matrix1.getXML();
      expect(cdf.selectSingleNode("//record[@jsxid='AZ']")).not.toBeNull();
      var deleteRecord = matrix1.deleteRecord('AZ', true);
      expect(deleteRecord.getAttribute("jsxid")).toEqual("AZ");
      expect(deleteRecord.getAttribute("jsxtext")).toEqual("Azerbaijan");
      expect(cdf.selectSingleNode("//record[@jsxid='AZ']")).toBeNull();
      deleteRecord = matrix1.deleteRecord('AZ', true);
      expect(deleteRecord).toBeNull();
    });

    it("should able to set and get whether or not an 'auto append' row will be rendered", function() {
      var autoRow = matrix1.getAutoRow();
      expect(autoRow).toBeUndefined();
      matrix1.setAutoRow(Matrix.AUTOROW_FIRST_ROW);
      matrix1.repaint();
      autoRow = matrix1.getAutoRow();
      expect(autoRow).toEqual(Matrix.AUTOROW_FIRST_ROW);

      waitsFor(function() {
        return document.getElementById(matrix1.getId() + '_jsx_jsxautorow') != null;
      });
      runs(function() {
        expect(document.getElementById(matrix1.getId() + '_jsx_jsxautorow')).toBeDefined();
      });
    });

    it("should able to set and get CSS property value(s) for a border", function() {
      expect(matrix1.getBodyBorder()).toEqual('1px solid #dfdfef');
      matrix1.setBodyBorder('1px dashed #000000', true);
      matrix1.repaint();
      expect(matrix1.getBodyBorder()).toEqual('1px dashed #000000');
      var bodyBorder = matrix1.getRendered().childNodes[1].style.border;

      if (bodyBorder.indexOf('#') != -1) {
        expect(bodyBorder).toEqual('#000000 1px dashed');
      } else {
        expect(bodyBorder).toEqual('1px dashed rgb(0, 0, 0)');
      }
    });

    it("should able to set and get whether the columns in the list can be re-ordered via user interaction with the VIEW", function() {
      var canReorder = matrix1.getCanReorder();
      expect(canReorder).toBeUndefined();
      matrix1.setCanReorder(jsx3.Boolean.FALSE);
      matrix1.repaint();
      canReorder = matrix1.getCanReorder();
      expect(canReorder).toEqual(jsx3.Boolean.FALSE);
    });

    it("should able to set and get the zero-based index of the on-screen column(s), to the left of which will be fixed and cannot be reordered", function() {
      var fixedColumnIndex = matrix1.getFixedColumnIndex();
      expect(fixedColumnIndex).toBeNull();
      matrix1.setFixedColumnIndex(2);
      fixedColumnIndex = matrix1.getFixedColumnIndex();
      expect(fixedColumnIndex).toEqual(2);
    });

    it("should able to set and get CSS property value(s) for a border", function() {
      expect(matrix1.getHeaderBorder()).toEqual('1px solid #dfdfef');
      matrix1.setHeaderBorder('2px dashed #000000');
      matrix1.repaint();
      expect(matrix1.getHeaderBorder()).toEqual('2px dashed #000000');

      var headerBorder = matrix1.getRendered().childNodes[0].style.border;
      if (headerBorder.indexOf('#') != -1) {
        expect(headerBorder).toEqual('#000000 2px dashed');
      } else {
        expect(headerBorder).toEqual('2px dashed rgb(0, 0, 0)');
      }
    });

    it("should able to set and get the height of the header row in pixels", function() {
      var headerHeight = matrix1.getHeaderHeight();
      expect(headerHeight).toBeNull();
      matrix1.setHeaderBorder('border, none');
      matrix1.setHeaderHeight(30, true);
      matrix1.repaint();
      headerHeight = matrix1.getHeaderHeight();
      expect(headerHeight).toEqual(30);
      var matrix_head = matrix1.getRendered().childNodes[0];
      expect(matrix_head.style.height).toEqual('30px');
    });

    it("should able to set and get how data should be painted on-screen", function() {
      var pagingModel = matrix1.getPagingModel();
      expect(pagingModel).toEqual(Matrix.PAGING_2PASS);
      matrix1.setPagingModel(Matrix.PAGING_OFF);
      pagingModel = matrix1.getPagingModel();
      expect(pagingModel).toEqual(Matrix.PAGING_OFF);
    });

    it("should able to set and get the the number of milliseconds to wait before checking for inactive panels to garbage collect", function() {
      var reaperInterval = matrix1.getReaperInterval();
      expect(reaperInterval).toBeNull();
      matrix1.setReaperInterval(Matrix.DEFAULT_REAPER_INTERVAL);
      reaperInterval = matrix1.getReaperInterval();
      expect(reaperInterval).toEqual(Matrix.DEFAULT_REAPER_INTERVAL);
    });

    it("should able to set and get the jsxid of the CDF record that will serve as the origin when rendering the data on-screen", function() {
      var renderingContext = matrix1.getRenderingContext();
      expect(renderingContext).toBeNull();
      matrix1.setRenderingContext('a1', true);
      renderingContext = matrix1.getRenderingContext();
      expect(renderingContext).toEqual('a1');
    });

    it("should able to set and get the rendering model (how rows will be painted on-screen)", function() {
      var renderingModel = matrix1.getRenderingModel();
      expect(renderingModel).toBeNull();
      matrix1.setRenderingModel(Matrix.REND_HIER, true);
      renderingModel = matrix1.getRenderingModel();
      expect(renderingModel).toEqual('hierarchical');
    });

    it("should able to set and get whether or not this column can be resized by the user", function() {
      var resizable = matrix1.getResizable();
      expect(resizable).toBeUndefined();
      matrix1.setResizable(1);
      resizable = matrix1.getResizable();
      expect(resizable).toEqual(1);
    });

    it("should able to set and get the row height", function() {
      var rowHeight = matrix1.getRowHeight();
      expect(rowHeight).toBeNull();
      matrix1.setRowHeight(50, true);
      matrix1.repaint();
      rowHeight = matrix1.getRowHeight();
      expect(rowHeight).toEqual(50);

      waitsFor(function() {
        return matrix1.getRendered().getElementsByTagName('table')[1] != null;
      });
      runs(function() {
        row = matrix1.getRendered().getElementsByTagName('table')[1].tBodies[0].rows[0];
        expect(row.firstChild.style.height).toEqual("46px");
      });
    });

    it("should able to set snd get whether or not the column widths should be adjusted (decremented) such that all columns fit within the viewport", function() {
      var scaleWidth = matrix1.getScaleWidth();
      expect(scaleWidth).toBeUndefined();
      matrix1.setScaleWidth(jsx3.Boolean.TRUE);
      scaleWidth = matrix1.getScaleWidth();
      expect(scaleWidth).toEqual(jsx3.Boolean.TRUE);
    });

    it("should able to set and get the horizontal scroll position of the list", function() {
      matrix1.getChild(0).setWidth(1000, true);
      matrix1.getChild(1).setWidth(1000, true);
      var scrollLeft = matrix1.getScrollLeft();
      expect(scrollLeft).toEqual(0);
      matrix1.setScrollLeft(100);
      scrollLeft = matrix1.getScrollLeft();
      expect(scrollLeft).toEqual(100);
      expect(matrix1.getRendered().childNodes[3].scrollLeft).toEqual(100);
    });

    // it("should able to set and get the vertical scroll position", function() {
    //   var scrollTop = matrix1.getScrollTop();
    //   expect(scrollTop).toEqual(0);
    //   matrix1.setScrollTop(50);
    //   expect(matrix1.getScrollTop()).toEqual();
    // });

    it("should abe to set and get the name of the CDF attribute to sort on", function() {
      var sortPath = matrix1.getSortPath();
      expect(sortPath).toEqual('jsxtext');
      matrix1.setSortPath('jsxid');
      sortPath = matrix1.getSortPath();
      expect(sortPath).toEqual('jsxid');
    });

    it("should able to set and get whether or not to supress display of the horizontal scrollbar", function() {
      matrix1.getChild(0).setWidth(1000, true);
      matrix1.getChild(1).setWidth(1000, true);
      expect(matrix1.getRendered().childNodes[3].style.display).toEqual('block');
      var HScroller = matrix1.getSuppressHScroller();
      expect(HScroller).toBeNull();
      matrix1.setSuppressHScroller(jsx3.Boolean.TRUE);
      matrix1.repaint();
      HScroller = matrix1.getSuppressHScroller();
      expect(HScroller).toEqual(jsx3.Boolean.TRUE);
      expect(matrix1.getRendered().childNodes[3].style.display).toEqual('none');
    });

    it("should able to set and get whether or not to supress display of the vertical scrollbar", function() {
      matrix1.getAncestorOfName('block').setHeight(300, true);
      expect(matrix1.getRendered().childNodes[2].style.display).toEqual('');
      var VScroller = matrix1.getSuppressVScroller();
      expect(VScroller).toBeNull();
      matrix1.setSuppressVScroller(jsx3.Boolean.TRUE, true);
      VScroller = matrix1.getSuppressVScroller();
      expect(VScroller).toEqual(jsx3.Boolean.TRUE);
      expect(matrix1.getRendered().childNodes[2].style.display).toEqual('none');
    });

    it("should be able to assign objMoveChild as the previousSibling of objPrecedeChild", function() {
      var column1 = matrix1.getChild(0);
      expect(column1.getName()).toEqual('mc2');
      var column2 = matrix1.getChild(1);
      matrix1.insertBefore(column2, column1, true);
      column1 = matrix1.getChild(0);
      expect(column1.getName()).toEqual('mc1');
    });

    it("should be able to insert a new property into an existing record with jsxid equal to strRecordId", function() {
      expect(matrix1.getRecord("AG").prop).toBeUndefined();
      matrix1.insertRecordProperty('AG', 'prop', 'val', true);
      expect(matrix1.getRecord("AG").prop).toEqual('val');
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("matrix_list", function() {
    var matrix2;
    var getMatrix2 = function(s) {
      var root2 = s.getBodyBlock().load("data/matrix_list.xml");
      return root2.getServer().getJSXByName('matrix1');
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_matrix_list.xml", ".", true) : t._server;
      matrix2 = getMatrix2(t._server);
      if (!Matrix) {
        Matrix = jsx3.gui.Matrix;
      }
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should be able to instance", function() {
      expect(matrix2).toBeInstanceOf(Matrix);
    });

    it("should be able to deselect all selected CDF records", function() {
      waitsFor(function() {
        return matrix2.getRendered().childNodes[1].getElementsByTagName('table')[0] != undefined;
      });
      runs(function() {
        matrix2.setValue(['AZ', 'AG']);
        var cell = matrix2.getRendered().childNodes[1].getElementsByTagName('table')[0].tBodies[0].rows[0].cells[1];
        expect(cell.style.backgroundImage).toMatch(/select\.gif/);
        matrix2.deselectAllRecords();
        cell = matrix2.getRendered().getElementsByTagName('table')[1].tBodies[0].rows[0].cells[1];
        expect(cell.style.backgroundImage).toEqual('');
      });
    });

    it("should be able to select and deselect a CDF record within the Matrix", function() {
      waitsFor(function() {
        return matrix2.getRendered().childNodes[1].firstChild.childNodes[1] != undefined;
      });
      runs(function() {
        matrix2.selectRecord('AZ');
        var cell = matrix2.getRendered().getElementsByTagName('table')[1].tBodies[0].rows[0].cells[1];
        expect(cell.style.backgroundImage).toMatch(/select\.gif/);
        matrix2.deselectRecord('AZ');
        cell = matrix2.getRendered().getElementsByTagName('table')[1].tBodies[0].rows[0].cells[1];
        expect(cell.style.backgroundImage).toEqual('');
      });
    });

    it("should able to set and get the direction for the sorted column", function() {
      var sortDirection = matrix2.getSortDirection();
      expect(sortDirection).toEqual("descending");
      var recordId = matrix2.getSortedIds()[0];
      var jsxText = matrix2.getRecord(recordId).jsxtext;
      expect(jsxText).toEqual('Azerbaijan');
      matrix2.setSortDirection("ascending");
      matrix2.repaint();
      sortDirection = matrix2.getSortDirection();
      expect(sortDirection).toEqual("ascending");
      recordId = matrix2.getSortedIds()[0];
      jsxText = matrix2.getRecord(recordId).jsxtext;
      expect(jsxText).toEqual('Afghanistan');
    });

    it("should able to set and get whether the list will render with sortable columns", function() {
      var canSort = matrix2.getCanSort();
      expect(canSort).toBeUndefined();
      matrix2.setCanSort(jsx3.Boolean.FALSE);
      canSort = matrix2.getCanSort();
      expect(canSort).toEqual(jsx3.Boolean.FALSE);
    });

    it("should be able to sort according to the current sort path", function() {
      var recordId = matrix2.getSortedIds()[0];
      var jsxText = matrix2.getRecord(recordId).jsxtext;
      expect(jsxText).toEqual('Azerbaijan');
      matrix2.doSort("ascending");
      recordId = matrix2.getSortedIds()[0];
      jsxText = matrix2.getRecord(recordId).jsxtext;
      expect(jsxText).toEqual('Afghanistan');
    });

    it("should bet able to do validate", function() {
      expect(matrix2.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
      matrix2.setRequired(jsx3.gui.Form.REQUIRED);
      expect(matrix2.doValidate()).toEqual(jsx3.gui.Form.STATEINVALID);
      matrix2.selectRecord('AG');
      expect(matrix2.doValidate()).toEqual(jsx3.gui.Form.STATEVALID);
    });

    it("should able to set and get the CSS string to apply to a Row/Cell when it has focus", function() {
      var focusStyle = matrix2.getFocusStyle();
      expect(focusStyle).toEqual('font-weight:bold;');
      matrix2.setFocusStyle('color: red;');
      focusStyle = matrix2.getFocusStyle();
      expect(focusStyle).toEqual('color: red;');
    });

    it("should be able to get the jsxid(s) for the selected record(s)", function() {
      expect(matrix2.getSelectedIds()).toEqual([]);
      matrix2.selectRecord('AZ');
      expect(matrix2.getSelectedIds()).toEqual(['AZ']);
      matrix2.setValue(['AZ', 'AG']);
      expect(matrix2.getSelectedIds()).toEqual(['AG', 'AZ']);
    });

    it("should able to set and get the data type to be used for sorting this list", function() {
      var sortType = matrix2.getSortType();
      expect(sortType).toEqual('text');
      matrix2.setSortType(Matrix.Column.TYPE_NUMBER);
      sortType = matrix2.getSortType();
      expect(sortType).toEqual(Matrix.Column.TYPE_NUMBER);
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("matrix_multiSelect", function() {
    var matrix3;
    var getMatrix3 = function(s) {
      var root3 = s.getBodyBlock().load("data/matrix_multiSelect.xml");
      return root3.getServer().getJSXByName('matrix1');
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_matrix_multiSelect.xml", ".", true) : t._server;
      matrix3 = getMatrix3(t._server);
      if (!Matrix) {
        Matrix = jsx3.gui.Matrix;
      }
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should be able to instance", function() {
      expect(matrix3).toBeInstanceOf(Matrix);
    });

    it("should able to set and get the CSS string to apply to a Row/Cell when it has focus", function() {
      var selectionBG = matrix3.getSelectionBG();
      expect(selectionBG).toBeNull();
      matrix3.setSelectionBG(Matrix.SELECTION_BG);
      selectionBG = matrix3.getSelectionBG();
      expect(selectionBG).toEqual(Matrix.SELECTION_BG);
      waitsFor(function() {
        return matrix3.getRendered().getElementsByTagName('table')[1] != null;
      });
      runs(function() {
        var selectRow = matrix3.getRendered().getElementsByTagName('table')[1].tBodies[0].rows[0];
        matrix3.selectRecord('AG');
        var rowBg = selectRow.firstChild.style.backgroundImage;
        expect(rowBg).toMatch(/select\.gif/);
      });
    });

    it("should ale to set and get the selection mode", function() {
      var selectionModel = matrix3.getSelectionModel();
      expect(selectionModel).toEqual(Matrix.SELECTION_MULTI_ROW);
      matrix3.setSelectionModel(Matrix.SELECTION_UNSELECTABLE);
      selectionModel = matrix3.getSelectionModel();
      expect(selectionModel).toEqual(Matrix.SELECTION_UNSELECTABLE);
      waitsFor(function() {
        return matrix3.getRendered().getElementsByTagName('table')[1] != null;
      });
      runs(function() {
        var selectRow = matrix3.getRendered().getElementsByTagName('table')[1].tBodies[0].rows[0];
        matrix3.selectRecord('AG');
        var rowBg = selectRow.firstChild.style.backgroundImage;
        expect(rowBg).toEqual('');
      });
    });

    it("should able to set and get the value of this matrix", function() {
      var value = matrix3.getValue();
      expect(value).toEqual([]);
      matrix3.setValue(['AG', 'AB']);
      value = matrix3.getValue();
      expect(value).toEqual(['AG', 'AB']);
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("matrix_paginatedList", function() {
    var matrix4;
    var getMatrix4 = function(s) {
      var root4 = s.getBodyBlock().load("data/matrix_paginatedList.xml");
      return root4.getChild(0);
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_matrix_paginatedList.xml", ".", true) : t._server;
      matrix4 = getMatrix4(t._server);
      if (!Matrix) {
        Matrix = jsx3.gui.Matrix;
      }
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should be able to instance", function() {
      expect(matrix4).toBeInstanceOf(Matrix);
    });

    it("should able to set and get the number of panels that are allowed in the queue waiting to be painted", function() {
      var panelQueueSize = matrix4.getPanelQueueSize();
      expect(panelQueueSize).toEqual(Matrix.DEFAULT_PANEL_QUEUE_SIZE);
      matrix4.setPanelQueueSize(50);
      panelQueueSize = matrix4.getPanelQueueSize();
      expect(panelQueueSize).toEqual(50);
    });

    it("should able to set and get the number panels that should be part of the pool", function() {
      var panelPoolSize = matrix4.getPanelPoolSize();
      expect(panelPoolSize).toEqual(5);
      matrix4.setPanelPoolSize(50);
      panelPoolSize = matrix4.getPanelPoolSize();
      expect(panelPoolSize).toEqual(50);
    });

    it("should able to set and get the number of rows each panel should contain", function() {
      var rowsPerPanel = matrix4.getRowsPerPanel();
      expect(rowsPerPanel).toEqual(50);
      matrix4.setRowsPerPanel(20, true);
      rowsPerPanel = matrix4.getRowsPerPanel();
      expect(rowsPerPanel).toEqual(20);
    });

    it("should able to set and get the info label to display when scrolling a paged instance", function() {
      var scrollInfoLabel = matrix4.getScrollInfoLabel();
      expect(scrollInfoLabel).toEqual('- viewing countries {0} to {1} of {2} -');
      matrix4.setScrollInfoLabel(Matrix.DEFAULT_INFO_LABEL);
      scrollInfoLabel = matrix4.getScrollInfoLabel();
      expect(scrollInfoLabel).toEqual('Viewing rows {0} to {1} of {2}');
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });

  describe("matrix_tree", function() {
    var matrix5;
    var getMatrix5 = function(s) {
      var root5 = s.getBodyBlock().load("data/matrix_tree.xml");
      return root5.getServer().getJSXByName('matrix1');
    };

    beforeEach(function() {
      t._server = (!t._server) ? t.newServer("data/server_matrix_tree.xml", ".", true) : t._server;
      matrix5 = getMatrix5(t._server);
      if (!Matrix) {
        Matrix = jsx3.gui.Matrix;
      }
    });

    afterEach(function() {
      if (t._server)
        t._server.getBodyBlock().removeChildren();
    });

    it("should be able to instance", function() {
      expect(matrix5).toBeInstanceOf(Matrix);
    });

    it("should able to set and get the icon to use for those CDF records that do not explicitly specify an icon via the jsximg attribute", function() {
      var icon = matrix5.getIcon();
      expect(icon).toBeNull();
      matrix5.setIcon(Matrix.ICON);
      icon = matrix5.getIcon();
      expect(icon).toEqual('jsx:///images/matrix/file.gif');
    });

    it("should able to set and get the icon to use when the given tree node is in an open state", function() {
      var iconMinus = matrix5.getIconMinus();
      expect(iconMinus).toBeNull();
      matrix5.setIconMinus(Matrix.ICON_MINUS);
      iconMinus = matrix5.getIconMinus();
      expect(iconMinus).toEqual('jsx:///images/matrix/minus.gif');
    });

    it("should able to set and get the icon to use when the given tree node is in a closed state", function() {
      var iconPlus = matrix5.getIconPlus();
      expect(iconPlus).toBeNull();
      matrix5.setIconPlus(Matrix.ICON_PLUS);
      iconPlus = matrix5.getIconPlus();
      expect(iconPlus).toEqual('jsx:///images/matrix/plus.gif');
    });

    it("should able to set and get whether or not to render the navigation controls that are applied to the first column when rendering model is hierarchical", function() {
      var renderNavigators = matrix5.getRenderNavigators();
      expect(renderNavigators).toBeNull();
      var folderImg = matrix5.getRendered().getElementsByTagName('table')[1].getElementsByTagName('img')[0];
      expect(folderImg).toBeDefined();
      matrix5.setRenderNavigators(jsx3.Boolean.FALSE);
      renderNavigators = matrix5.getRenderNavigators();
      expect(renderNavigators).toEqual(jsx3.Boolean.FALSE);
      folderImg = matrix5.getRendered().getElementsByTagName('table')[1].getElementsByTagName('img')[0];
      expect(folderImg).toBeUndefined();
    });

    it("should clean up", function() {
      t._server.destroy();
      t.destroy();
      expect(t._server.getBodyBlock().getRendered()).toBeNull();
      delete t._server;
    });
  });
});