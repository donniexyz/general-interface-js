(function(plugIn){

  var rootUri = "http://www.generalinterface.org/prototypes/";

  jsx3.$O(plugIn).extend({
    _emptyStar: plugIn.resolveURI('images/emptyStar.png'),
    _halfStar: plugIn.resolveURI('images/halfStar.png'),
    _fullStar: plugIn.resolveURI('images/fullStar.png'),

    uri: {
      login: rootUri + "Class/User",
      prototypeRoot: rootUri + "Prototype/",
      rate: rootUri + "Rating/",
      feeds: rootUri + "feeds/"
    },

    _currentFilter: "featured",

    _getStarImage: function(rating) {
      var rating = Number(rating),
          wholes = 0,
          fraction = 0;
      if (isNaN(rating)) {
        rating = 0;
      } else if (rating > 0) {
        wholes = Math.floor(rating);
        fraction = (rating - wholes);
      }

      var uri = wholes + ".png";
      if (fraction >= .75) {
        uri = (wholes+1) + ".png";
      } else if (fraction > .25 && fraction < .75) {
        uri = (wholes + .5) + ".png";
      }

      return this.resolveURI('images/' + uri);
    },

    _getStars: function(rating) {
      var rating = Number(rating),
          wholes = 0,
          fraction = 0;
      if (isNaN(rating)) {
        rating = 0;
      } else if (rating > 0) {
        wholes = Math.floor(rating);
        fraction = (rating - wholes);
      }

      var hasHalf = false;
      if (fraction >= .75) {
        wholes++;
      } else if (fraction > .25 && fraction < .75) {
        hasHalf = true;
      }

      var result = [];
      for (var i=0; i<5; i++) {
        if (i < wholes) {
          result.push(this._fullStar._path);
        } else if (i == wholes && hasHalf) {
          result.push(this._halfStar._path);
        } else {
          result.push(this._emptyStar._path);
        }
      }
      return result;
    },

    formatRating: function(element, cdfkey, matrix, column, rownumber, server) {
      var record = matrix.getRecord(cdfkey);

      element.innerHTML = "<img src='" + plugIn._getStarImage(record.rating) + "'/>";
    },

    formatComponentName: function(element, cdfkey, matrix, column, rownumber, server) {
      var record = matrix.getRecord(cdfkey);

      var strName;
      if (record.featured == "true") {
        strName = "<span style='font-weight: bold;'>" + record.name + "</span>";
      } else {
        strName = record.name;
      }

      element.innerHTML = strName;
    },

    _onOnlineFilterMenuExecute: function(objMenu, objMatrix, strRecordId) {
      objMenu.selectItem(strRecordId, true);
      var recordNode = objMenu.getRecordNode(strRecordId);
      var column = objMatrix.getChild('filterColumn');

      switch (strRecordId) {
        default:
        case "all":
          this._currentFilter = "all";
          objMatrix.setXMLURL(this._buildXMLURL());
          break;
        case "featured":
          this._currentFilter = "featured";
          objMatrix.setXMLURL(this._buildXMLURL());
          break;
        case "rating":
        case "downloads":
        case "user":
        case "uploaded":
          column.setPath(strRecordId, true);
          column.setDataType(
            strRecordId != "user" ? jsx3.gui.Matrix.Column.TYPE_NUMBER : jsx3.gui.Matrix.Column.TYPE_TEXT
          );
          column.setSortDataType(
            strRecordId != "user" ? jsx3.gui.Matrix.Column.TYPE_NUMBER : jsx3.gui.Matrix.Column.TYPE_TEXT
          );
          column.setText(recordNode.getAttribute('jsxtext'), false);

          var formatHandler = this.formatRating;
          if (strRecordId == "downloads") {
            formatHandler = "@number,integer";
          } else if (strRecordId == "user") {
            formatHandler = "@unescape";
          } else if (strRecordId == "uploaded") {
            formatHandler = "@date,medium";
          }
          column.setFormatHandler(formatHandler);
          break;
      }

      objMatrix.resetCacheData();
      objMatrix.repaint();
    },

    _onOnlineFeedMenuExecute: function(objMenu, strRecordId) {
      var recordNode = objMenu.getRecordNode(strRecordId);
      window.open(this.uri.feeds + strRecordId + '/', (recordNode.getAttribute('jsxtext') + ' Components').replace(/ /g, '_'));
    },

    _onOnlineListExecute: function(objPalette, objMatrix, strRecordId) {
      var record = objMatrix.getRecord(strRecordId);
      objPalette.setOnlineDetail(record);
    },

    _onOnlineDetailDownload: function(objDetailId) {
      var id = objDetailId.getText();
      var protoDir = jsx3.ide.getHomeRelativeFile('prototypes'),
          Document = jsx3.xml.Document,
          self = this;

      var doAsync = function(objEvent) {
        var objXML = objEvent.target;
        var strEvtType = objEvent.subject;
        var objFile = objXML._objFile;

        delete objXML._prototypeId;
        objXML.unsubscribe("*", doAsync);

        if (strEvtType == Document.ON_RESPONSE) {
          objXML = jsx3.ide.ComponentEditor.prototype.formatXML(objXML);
          jsx3.ide.writeUserXmlFile(objFile, objXML);
        } else if (strEvtType == Document.ON_TIMEOUT) {
          jsx3.ide.LOG.error("The component download timed out");
        } else if (strEvtType == Document.ON_ERROR) {
          jsx3.ide.LOG.error("The component download encountered an error");
        }
      };
      jsx3.ide.getPlugIn("jsx3.io.browser").saveFile(jsx3.IDE.getRootBlock(), {
          name:"jsx_ide_file_dialog", modal:true,
          folder: protoDir, baseFolder: protoDir,
          onChoose: function(objFile) {
            var doc = new Document();
            doc.setAsync(true);

            doc.subscribe('*', doAsync);
            doc._objFile = objFile;
            doc.load(self.uri.prototypeRoot + id + '.' + 'component');
          }
      });
    },

    _buildXMLURL: function() {
      var objSearchBox = jsx3.IDE.getJSXByName("jsx_ide_online_search"),
          objFilterMenu = jsx3.IDE.getJSXByName("jsx_ide_online_filter_menu"),
          strSearch = objSearchBox && jsx3.util.strTrim(objSearchBox.getValue()),
          hasFilter = (this._currentFilter != "all"),
          uri = this.uri.prototypeRoot,
          searches = [];
      if (strSearch && strSearch.length) {
        searches = strSearch.split(" ");
        for (var i=searches.length; i--;) {
          var s = jsx3.util.strTrim(searches[i]);
          if (!s) {
            // remove extra whitespace
            searches.splice(i, 1);
          } else {
            var m = s.match(/^(user|featured|uploaded):(.*)/);
            if (!m) {
              s = s + "*";
              searches.splice(i, 1, s);
            } else if (!m[2]) {
              searches.splice(i, 1);
            } else if (m[1] == "featured") {
              hasFilter = (m[2] == "true");
              searches.splice(i, 1);
            } else if (m[1] == "uploaded") {
              searches.splice(i, 1, "uploaded:[" + m[2] + " TO " + m[2] + "]");
            }
          }
        }
      }
      if (hasFilter) {
        searches.push('featured:true');
      }
      uri += searches.length ? "?fulltext('(" + searches.join(' AND ') + ")')" : '';
      this.getLog().debug("Matrix XML URL: " + uri);
      return uri;
    },

    _onSearch: function(objSearchBox, objMatrix, strValue) {
      var self = this,
          doSearch = function(matrix) {
            self._reloadList(matrix);
          };
      if (this._searchTO != null) {
        window.clearTimeout(this._searchTO);
        this._searchTO = null;
      }
      this._searchTO = window.setTimeout(function() {
        doSearch(objMatrix);
        this._searchTO = null;
      }, 500);
    },

    _clearSearch: function(objSearchBox, objMatrix) {
      objSearchBox.setValue("");
      this._reloadList(objMatrix);
    },

    _reloadList: function(objMatrix) {
      this.getLog().debug("Reloading matrix");
      objMatrix.setXMLURL(this._buildXMLURL());
      objMatrix.resetCacheData();
      objMatrix.repaint();
    },

    getLicenseAgreement: function() {
      // Gets the saved credentials from the
      // user's settings
      var s = jsx3.ide.getIDESettings();
      var id = this.getId();

      return s.get(id, 'license_accepted');
    },

    agreeToLicense: function() {
      var s = jsx3.ide.getIDESettings();
      var id = this.getId();

      s.set(id, 'license_accepted', true);
    },

    removeComponent: function(objPalette, objCheckbox, objRemove, objCancel, objMatrix, objRecord) {
      var self = this;

      objCheckbox.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
      objRemove.setEnabled(jsx3.gui.Form.STATEDISABLED, true);
      objCancel.setEnabled(jsx3.gui.Form.STATEDISABLED, true);

      var doRemoveComponent = function() {
        var request = new jsx3.net.Request();
        request.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function(objEvent) {
            var target = objEvent.target;
            var status = target.getStatus();

            if (status == 204) {
              self._reloadList(objMatrix);
              objPalette.setOnlineView('summary');
            } else if (status == 401) {
              objPalette.setUserLoginAction(function(){
                doRemoveComponent();
              });
              objPalette.setLoginBackAction(function(){
                objPalette.setComponentView('online');
              });
              objPalette.setLoginProblem("Not authorized");
              objPalette.setUserView('login', true);
              objPalette.setComponentView('user');
            } else if (status >= 500) {
              // TODO: how should we show that there was an error?
            } else {
              // TODO: what else should we handle?
            }
        });
        request.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function(objEvent){
          // TODO: how should we show that it timed out?
        });
        request.subscribe('*', function(objEvent) {
          objCheckbox.setChecked(jsx3.gui.CheckBox.UNCHECKED);
          objCheckbox.setEnabled(jsx3.gui.Form.STATEENABLED);
          objCancel.setEnabled(jsx3.gui.Form.STATEENABLED);
        });

        request.open("delete", self.uri.prototypeRoot + objRecord.id, true);
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('Content-Type', 'application/json');
        request.send("", 5000);
      };

      doRemoveComponent();
    },

    checkReportCriteria: function(objIssue, objComments, objFlag, objSend) {
      var issue = objIssue.getValue(),
          comments = jsx3.util.strTrim(objComments.getValue()),
          flag = objFlag.getChecked();

      objSend.setEnabled(
        (issue && comments && flag ? jsx3.gui.Form.STATEENABLED : jsx3.gui.Form.STATEDISABLED),
        true
      );
    },

    reportProblem: function(objPalette, objIssue, objComments, objSent, objView, objMatrix) {
      if (!objView._selected_detail_record) {
        return;
      }

      var s = jsx3.ide.getIDESettings(),
          id = this.getId(),
          issue = objIssue.getValue(),
          issueRecord = objIssue.getRecord(issue),
          comments = jsx3.util.strTrim(objComments.getValue()),
          objRecord = objView._selected_detail_record,
          self = this;

      var doReport = function(){
        var request = new jsx3.net.Request();

        request.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function(objEvent) {
          var target = objEvent.target;
          var status = target.getStatus();

          if (status == 201) {
            objPalette.closeReportForm();
            objSent.setDisplay(jsx3.gui.Block.DISPLAYBLOCK, true);
            window.setTimeout(function(){
              if(objSent){
                objSent.setDisplay(jsx3.gui.Block.DISPLAYNONE, true);
              }
            }, 3000);
          } else if (status == 401) {
            objPalette.setUserLoginAction(function(){
              doReport();
            });
            objPalette.setLoginBackAction(function(){
              objPalette.setComponentView('online');
            });
            objPalette.setLoginProblem('Not authorized');
            objPalette.setUserView('login', true);
            objPalette.setComponentView('user');
          } else if (status >= 500) {
          } else {
          }
        });
        request.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function(objEvent){
          // TODO: how should we show that it timed out?
        });
        request.subscribe('*', function(objEvent) {
          objMatrix.resetCacheData();
        });

        request.open("post", self.uri.prototypeRoot + objRecord.id, true);
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(jsx3.$O.json({
          id: "call1",
          method: "flag",
          params: [
            issueRecord.jsxtext + ": " + comments
          ]
        }), 5000);
      };
      if (!s.get(id, "username")) {
        objPalette.setUserLoginAction(function(){
          doReport();
        });
        objPalette.setLoginBackAction(function(){
          objPalette.setComponentView('online');
        });
        objPalette.setLoginProblem('Not authorized');
        objPalette.setUserView('login', true);
        objPalette.setComponentView('user');
        return;
      }

      doReport();
    },

    rateComponent: function(objPalette, objContainer, strRating, objMatrix) {
      var s = jsx3.ide.getIDESettings();
      var id = this.getId();
      var objView = jsx3.IDE.getJSXByName('jsx_ide_proto_detail_view');

      if (!objView._selected_detail_record) {
        return;
      }

      var self = this;
      var doRateComponent = function(on_done){
        var request = new jsx3.net.Request();

        request.subscribe(jsx3.net.Request.EVENT_ON_RESPONSE, function(objEvent) {
          var target = objEvent.target;
          var status = target.getStatus();

          if (status == 200 || status == 201) {
            var response = jsx3.eval("(" + target.getResponseText() + ")");

            objView._selected_detail_record.myRating = response.rating;
            objView._selected_detail_record.rating = response.newRating;
            objMatrix.insertRecord(objView._selected_detail_record, null, false);
          } else if (status == 401) {
            objPalette.setUserLoginAction(function(){
              doRateComponent(function(){
                objPalette.setComponentView('online');
              });
            });
            objPalette.setLoginBackAction(function(){
              objPalette.setComponentView('online');
            });
            objPalette.setLoginProblem("Not authorized");
            objPalette.setUserView('login', true);
            objPalette.setComponentView('user');

          } else if (status >= 500) {
          } else {
          }
        });
        request.subscribe(jsx3.net.Request.EVENT_ON_TIMEOUT, function(objEvent){
          // TODO: how should we show that it timed out?
        });
        request.subscribe('*', function(objEvent) {
          objPalette.setOnlineDetailRatings(objView._selected_detail_record, true);
          if (on_done) {
            on_done();
          }
        });

        request.open("post", self.uri.rate, true);
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(jsx3.$O.json({
          prototype_id: objView._selected_detail_record.id,
          rating: strRating
        }), 5000);
      };

      if (!s.get(id, "username")) {
        objPalette.setUserLoginAction(function(){
          if (objView._selected_detail_record.user != s.get(id, "username")) {
            doRateComponent(function(){
              objPalette.setOnlineDetail(objView._selected_detail_record, true);
              objPalette.setComponentView('online');
            });
          } else {
            objPalette.setOnlineDetail(objView._selected_detail_record, true);
            objPalette.setComponentView('online');
          }
        });
        objPalette.setLoginBackAction(function(){
          objPalette.setComponentView('online');
        });
        objPalette.setUserView('login', true);
        objPalette.setComponentView('user');
        return;
      }

      doRateComponent();
    },

    onRatingMouseOver: function(objContainerNode, objEvent) {
      var target = objEvent.target||objEvent.srcElement;
      var objView = jsx3.IDE.getJSXByName('jsx_ide_proto_detail_view');

      if (!objView._selected_detail_record) {
        return;
      }

      var objStar;
      var objContainer = jsx3.IDE.getJSXById(objContainerNode.getAttribute('id'));

      if (target.tagName.toLowerCase() == "img") {
        objStar = jsx3.IDE.getJSXById(target.parentNode.getAttribute('id'));
      } else if (target.tagName.toLowerCase() == "span") {
        objStar = jsx3.IDE.getJSXById(target.getAttribute('id'));
      }
      if (!objStar) {
        return;
      }
      var children = objContainer.getChildren();

      var index = objStar.getChildIndex();
      for(var i=0, l=children.length; i<l; i++){
        var child = objContainer.getChild(i);
        var starUrl = (i<=index ? this._fullStar : this._emptyStar).toString();
        child.setSrc(starUrl);
        var childNode = document.getElementById(child._jsxid);
        if (childNode && childNode.children[0]) {
          childNode.children[0].setAttribute('src', starUrl);
        }
      }
    },

    onRatingMouseOut: function(objContainerNode, objEvent) {
      var objTarget = jsx3.IDE.getJSXById(objContainerNode.getAttribute('id'));
      var objView = jsx3.IDE.getJSXByName('jsx_ide_proto_detail_view');

      if (!objView._selected_detail_record) {
        return;
      }

      var myRating = objView._selected_detail_record.myRating;
      myRating = myRating != "null" ? parseInt(myRating, 10) : 0;

      var children = objTarget.getChildren();
      for(var i=0, l=children.length; i<l; i++){
        var child = objTarget.getChild(i);
        var starUrl = (i<myRating ? this._fullStar : this._emptyStar).toString();
        child.setSrc(starUrl);
        var childNode = document.getElementById(child._jsxid);
        if (childNode && childNode.children[0]) {
          childNode.children[0].setAttribute('src', starUrl);
        }
      }
    }
  });

})(this);
