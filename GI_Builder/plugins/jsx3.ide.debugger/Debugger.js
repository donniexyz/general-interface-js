/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

(function(plugIn) {

  jsx3.$O(plugIn).extend({

/** CONSTANTS *****************************************/
  DEBUG_LEFT: 50,
  DEBUG_TOP: 50,
  DEBUG_WIDTH: 590,
  DEBUG_HEIGHT: 590,
  DEBUG_ARGS: null,


/** DEBUG **********************************/
  /*
   * ? DEBUG()      --takes the calling function and converts it into a parsable object array
   *          enabling the JSX runtime to execute the code in a line-by-line fashion
   * ! returns      --(variant) returns the return value specific to the function being debugged; returns null if an error is encountered
   *          during execution or if the user cancels while in the step-through-debugger;
   */
  debug: function(objArgs) {
    if(typeof(objArgs) == "string") {
      //call function that will parse the function (which is now a string) into a parsable expression object;
      var objExpression = this._createExpressionObject(objArgs);
    } else {
      //globally reference the locally-scoped arguments array to make accessible from within the debugger
      this.DEBUG_ARGS = arguments.callee.caller.arguments;


      //call function that will parse the function (which is now a string) into a parsable expression object;
      var objExpression = this._createExpressionObject(arguments.callee.caller.toString().replace(/\}\s*else/g,"}\r\nelse"));
    }
    //pass the expression object to the step-through engine
    return this._doDebug(objExpression);
  },




  //function that is called to iterate and evaluate the expression object on a line-by-line basis
  _doDebug: function(_ide_objExpression) {
    //initialize array that will hold a reference to expression objects that were halted mid-execution
    var _ide_callStack = [];

    //transfer scope of arguments array from global object to this function, allowing access to the run-time arguments
    if (_ide_objExpression["inputParameters"]) {
      var debugArgs = _ide_objExpression["inputParamsObj"];
      window.top.eval(_ide_objExpression["inputParameters"]);
    }

    //set current expression object to iterate through
    var _ide_curExpressionObject = _ide_objExpression;

    //execute any preconditions
    window.top.eval(_ide_curExpressionObject["precondition"]);

    //variables used by expression object iterator
    var _ide_i_startIndex = 0;
    var _ide_jumpout;
    var _ideobjResult = "";
    var _ide_b_modal_return = -1;
    var _ide_bSkip = false;
    _ide_curExpressionObject["bIterated"] = false;
    var _ide_x_objMatch = /\s*var\s+([a-zA-Z_\$]+[a-zA-Z0-9_\$]+)\s*=/;

    //loop will execute as long as the current statment block's conditional entry is 'true'
    do {
      //show user the entry condition for the current statement block if it has not yet been displayed for the current iteration of the current statement block
      if(!_ide_curExpressionObject["bIterated"]) {
        _ide_curExpressionObject["bIterated"] = true;
        if(_ide_b_modal_return != 4) _ide_b_modal_return = window.showModalDialog(this.resolveURI("debugger.html"),
                [_ide_objExpression,_ide_curExpressionObject,-1,_ideobjResult,0,window],
                "dialogHeight: " + this.DEBUG_HEIGHT + "px; dialogWidth: " + this.DEBUG_WIDTH +
                "px; dialogTop: " + this.DEBUG_TOP + "px; dialogLeft: " + this.DEBUG_LEFT +
                "px; edge: Raised; help: No; resizable: No; status: No;");
        if(_ide_b_modal_return == 0) {
          return;
        } else if(_ide_b_modal_return == 2) {
          //step over this statement
          _ide_i_startIndex = _ide_maxLen;
          _ide_bSkip = true;
        }
        //clear return value of the entry block
        _ideobjResult = "";
      }

      //reset switch that determines whether the loop was exited early
      _ide_jumpout = false;

      //get length of expression array containing execution blocks (either strings or objects)
      var _ide_maxLen = _ide_curExpressionObject["expressionArray"].length;

      //iterate through each substatement in the current statement block
      for(var _ide_i = _ide_i_startIndex; _ide_i < _ide_maxLen; _ide_i++) {
        try {
          var _ide_curStatement = _ide_curExpressionObject["expressionArray"][_ide_i];
          if(typeof(_ide_curStatement) == "string") {
            //execute this single line of code
            if(_ide_b_modal_return != 4) _ide_b_modal_return = window.showModalDialog(this.resolveURI("debugger.html"),[_ide_objExpression,_ide_curExpressionObject,_ide_i,_ideobjResult,0,window],"dialogHeight: " + jsx3.ide.DEBUG_HEIGHT + "px; dialogWidth: " + jsx3.ide.DEBUG_WIDTH + "px; dialogTop: " + jsx3.ide.DEBUG_TOP + "px; dialogLeft: " + jsx3.ide.DEBUG_LEFT + "px; edge: Raised; help: No; resizable: No; status: No;");
            if(_ide_b_modal_return == 0) {
              return;
            } else if(_ide_b_modal_return != 2) {
              //user has chosen to execute the statement
              _ideobjResult = window.top.eval(_ide_curStatement);

              if(_ideobjResult == null) {
                //the JavaScript eval method returns null for any line that begins with a 'var' statment; if this is the case, try to resolve the value of the variable and return that instead
                var _ide_x_i = _ide_curStatement.match(_ide_x_objMatch);
                if(_ide_x_i!= null && _ide_x_i.length >0) _ideobjResult = window.top.eval(_ide_x_i[1]);
              }
            } else {
              _ideobjResult = "";
            }
          } else {
            //this subexpression is complex (e.g., an expression object) containing its own sequence of substatements; persist reference to current object, since its execution will now be stopped and will only be resumed when the subexpression and it descendant statements have finished executing
            var _ide_obj = {};
            _ide_obj["_object"] = _ide_curExpressionObject;
            _ide_obj["_index"] = _ide_i + 1;
            _ide_callStack[_ide_callStack.length] = _ide_obj;

            //swap reference to object to iterate
            _ide_curExpressionObject = _ide_curStatement;

            //execute any pre-conditions
            window.top.eval(_ide_curExpressionObject["precondition"]);

            //reset start index for zero, since starting execution for a child, not resuming for a parent
            _ide_i_startIndex = 0;

            _ide_jumpout = true;
            _ide_i = _ide_maxLen;
          }
        } catch(e) {
          if((e.number & 0xFFFF) == 1018) {
            //just encountered a return statement -- remove, re-evaluate and return
            var _ide_curStatement = _ide_curStatement.substring(_ide_curStatement.indexOf("return ") + 7);
            _ideobjResult = window.top.eval(_ide_curStatement);
            if(_ide_b_modal_return != 4) _ide_b_modal_return = window.showModalDialog(this.resolveURI("debugger.html"),[_ide_objExpression,_ide_curExpressionObject,_ide_i,_ideobjResult,7,window],"dialogHeight: " + jsx3.ide.DEBUG_HEIGHT + "px; dialogWidth: " + jsx3.ide.DEBUG_WIDTH + "px; dialogTop: " + jsx3.ide.DEBUG_TOP + "px; dialogLeft: " + jsx3.ide.DEBUG_LEFT + "px; edge: Raised; help: No; resizable: No; status: No;");
            return _ideobjResult;
          } else {
            //just encountered an error; halt execution
            _ideobjResult = "Error " + (e.number & 0xFFFF) + ": " + e.description + "\r\n";
            var _ide_b_modal_return = window.showModalDialog(this.resolveURI("debugger.html"),[_ide_objExpression,_ide_curExpressionObject,_ide_i,_ideobjResult,5,window],"dialogHeight: " + jsx3.ide.DEBUG_HEIGHT + "px; dialogWidth: " + jsx3.ide.DEBUG_WIDTH + "px; dialogTop: " + jsx3.ide.DEBUG_TOP + "px; dialogLeft: " + jsx3.ide.DEBUG_LEFT + "px; edge: Raised; help: No; resizable: No; status: No;");
            if(_ide_b_modal_return == 0) {
              return;
            } else {
              _ideobjResult = "";
            }
          }
        }
      }

      //evaluate the post condition to reset before wend
      var _ide_bIterate, bretry, _ide_objstatement;
      if(!_ide_jumpout) {
        //never loop if this is an if/elsif/else block,since they only execute their descendant substatments only once
        if(_ide_bSkip == true || _ide_curExpressionObject["statementtype"] == "FUNCTION" ||_ide_curExpressionObject["statementtype"] == "IF" || _ide_curExpressionObject["statementtype"] == "ELSEIF" || _ide_curExpressionObject["statementtype"] == "ELSE") {
          //always send 'false' to make sure this statement block
          _ide_bIterate = false;
          //this block was skipped due to user selection
          _ide_bSkip = false;
        } else {
          //all substatements have been executed for this statement block; evaluate the post-condition
          window.top.eval(_ide_curExpressionObject["postcondition"]);

          //re-evaluate the condition to see if it is still true
          _ide_bIterate = window.top.eval(_ide_curExpressionObject["condition"]);
          _ide_i_startIndex = 0;
        }
      } else {
        //re-evaluate the condition to see if it is still true for this statement block
        _ide_bIterate = window.top.eval(_ide_curExpressionObject["condition"]);
        _ide_curExpressionObject["satisfied"] = _ide_bIterate;
      }


      //loop up the stack to locate first parent that solves its loop condition (_ide_bIterate == true)
      while(!_ide_bIterate && _ide_callStack.length > 0) {
        do {
          bretry = false;
          //execution has ended for this statement block; resume execution of the parent statement's substatements
          var _ide_obj = _ide_callStack.pop();
          try {
            _ide_curExpressionObject = _ide_obj["_object"];
            _ide_i_startIndex = _ide_obj["_index"];
          } catch(e) {
            //halt execution -- no more statements to execute
            return;
          }

          //reset flag that says its ok to display the children for this expression
          for(var _ide_i_resetCounter=0;_ide_i_resetCounter<_ide_curExpressionObject["expressionArray"].length;_ide_i_resetCounter++) {
            _ide_curExpressionObject["expressionArray"][_ide_i_resetCounter]["bIterated"] = false;
          }

          //adjust the resume index for the statement if else/elseif blocks are encountered
          if(_ide_i_startIndex == _ide_curExpressionObject["expressionArray"].length && (_ide_curExpressionObject["statementtype"] == "FUNCTION" ||_ide_curExpressionObject["statementtype"] == "IF" || _ide_curExpressionObject["statementtype"] == "ELSEIF" || _ide_curExpressionObject["statementtype"] == "ELSE")) {
            //this statement block is non-iterating, and all its contained substatements have executed -- go to the next parent up in the stack to resume its execution
            bretry = true;
          }
        } while(bretry);

        var _ide_iter = _ide_i_startIndex;
        _ide_objstatement = _ide_curExpressionObject["expressionArray"][_ide_i_startIndex];
        if(_ide_objstatement != null) {
          if(typeof(_ide_objstatement) == "object" && (_ide_objstatement["statementtype"] == "ELSEIF" || _ide_objstatement["statementtype"] == "ELSE")) {
            //don't execute the next statement in the stack if it is an else/elseif and any preceding statement in its sibling group evaluated to true on this iteration
            var _ide_bExecuted = false;
            do {
              //get handle to previous statement (previous statement sibling)
              _ide_objstatement = _ide_curExpressionObject["expressionArray"][_ide_iter--];
              if(_ide_objstatement["satisfied"] == true) {
                //a prior sibling in the current if/else statement group was executed --set flag that says to skip all following siblings in the if/else/elseif statement block
                _ide_bExecuted = true;
              }
            } while(_ide_objstatement["statementtype"] != "IF" && !_ide_bExecuted);

            if(_ide_bExecuted) {
              //a match was found in this if/else statement group; increment the start index to bypass all siblings in this statement group
              do {
              _ide_objstatement = _ide_curExpressionObject["expressionArray"][_ide_i_startIndex++];
              } while(typeof(_ide_objstatement) == "object" && (_ide_objstatement["statementtype"] == "ELSEIF" || _ide_objstatement["statementtype"] == "ELSE"));
              _ide_i_startIndex--;
            }
          }
        }

        //reset start index to zero for index of subexpression to start iterating on if iteration was completed (NOTE: this evaluates to true whenever the statement block, _ide_curExpressionObject, finishes executing all subexpressions that it contains)
        if(_ide_i_startIndex == _ide_curExpressionObject["expressionArray"].length) {
          //iteration is complete
          window.top.eval(_ide_curExpressionObject["postcondition"]);
          _ide_i_startIndex = 0;
        }

        //evaluate to see if the current statement block should iterate through its subexpressions
        _ide_bIterate = window.top.eval(_ide_curExpressionObject["condition"]);

        //set flag if evaluated to true and an if
        if(typeof(_ide_curExpressionObject["expressionArray"][_ide_i_startIndex]["statementtype"]) != "undefined" && (_ide_curExpressionObject["expressionArray"][_ide_i_startIndex]["statementtype"] == "IF" || _ide_curExpressionObject["expressionArray"][_ide_i_startIndex]["statementtype"] == "ELSEIF")) {
          _ide_curExpressionObject["expressionArray"][_ide_i_startIndex]["satisfied"] = window.top.eval(_ide_curExpressionObject["expressionArray"][_ide_i_startIndex]["condition"]);
        }
      }
    } while(_ide_bIterate);

    return _ideobjResult;
  },



//recursive function that converts a function (passed as a string) into its various statements, statement blocks, and substatements;
//this parsable expression that can then be iterated through in a line-by-line fashion
_createExpressionObject: function(strFunction) {
  //normalize the line feed delimiters (use \n)
  strFunction = strFunction.replace(/(\r\n)|\n|\r|(\n\r)/gi,"\n");

  //declare the expression object which will contain the parsed code
  var eO = {};
  var f1 = 0;
  var f2;
  var f3;
  f1 = strFunction.indexOf("{") + 1;
  if(f1 == 0) {
    //no bracketed statements; just simple lines of code which will execute individually
    eO["precondition"] = "_ide_debugswitch = 0";
    eO["condition"] = "_ide_debugswitch == 0";
    eO["postcondition"] = "_ide_debugswitch = 1";
    eO["expressionArray"] = strFunction.split("\n");
    eO["inputParameters"] = "";
    eO["strConditionStart"] = "anonymous function() {";
    eO["strConditionEnd"] = "}";
  } else {
    //get the starting index for the outer-most conditional (if,else,function,do,while)
    var strCondition = strFunction.substring(0,f1);

    //get last statement of this group
    var f2 = strFunction.lastIndexOf("}");

    //get handle to the start index of the conditional statement
    var intConditionStart = strCondition.lastIndexOf("\n");

    //just grab the conditional line as a string; save for display in the debugger
    var strCondition = strCondition.substring(intConditionStart);
    eO["strConditionStart"] = jsx3.util.strTrim(strCondition);
    eO["strConditionEnd"] = "}";

    //determine what type of bracketed function this is (expand later to include for-in, selectcase, and try-catch)
    var matchArray = [];
    matchArray[0] = /(for)\s*\([\s\S]*\)\s*\{/;
    matchArray[1] = /(while)\s*\([\s\S]*\)\s*\{/;
    matchArray[2] = /(if)\s*\([\s\S]*\)\s*\{/;
    matchArray[3] = /\s*do\s*\{/;
    matchArray[4] = /([\s]*function[\s]*|[\s]*function[\s]+[a-zA-z0-9]*[\s]*|[\s\S]+\bfunction[\s]*)\([\s,a-zA-z0-9]*\)[\s]*\{/;
    matchArray[5] = /\s*else\s+if\s*\([\s\S]*\)\s*\{/;
    matchArray[6] = /\s*else\s*\{/;

    //create a parsable condition
    if(strCondition.search(matchArray[0]) > -1) {
      //FOR-EACH LOOP
      eO["statementtype"] = "FOR";
      eO["precondition"] = strCondition.substring(strCondition.indexOf("(")+1,strCondition.indexOf(";"));
      eO["condition"] = strCondition.substring(strCondition.indexOf(";")+1,strCondition.lastIndexOf(";"));
      eO["postcondition"] = strCondition.substring(strCondition.lastIndexOf(";")+1,strCondition.lastIndexOf(")"));
    } else if(strCondition.search(matchArray[1]) > -1) {
      //WHILE LOOP
      eO["statementtype"] = "WHILE";
      eO["precondition"] = "";
      eO["condition"] = strCondition.substring(strCondition.indexOf("(")+1,strCondition.lastIndexOf(")"));
      eO["postcondition"] = "";
    } else if(strCondition.search(matchArray[5]) > -1) {
      //ELSE IF
      eO["statementtype"] = "ELSEIF";
      eO["precondition"] = "";
      eO["condition"] = strCondition.substring(strCondition.indexOf("(")+1,strCondition.lastIndexOf(")"));
      eO["postcondition"] = "";
    } else if(strCondition.search(matchArray[2]) > -1) {
      //IF
      eO["statementtype"] = "IF";
      eO["precondition"] = "";
      eO["condition"] = strCondition.substring(strCondition.indexOf("(")+1,strCondition.lastIndexOf(")"));
      eO["postcondition"] = "";
    } else if(strCondition.search(matchArray[3]) > -1) {
      //DO-WHILE
      eO["statementtype"] = "DOWHILE";
      eO["precondition"] = "_ide_debugswitch = true";
      eO["condition"] = "_ide_debugswitch == true";
      var postCondition = strCondition.substring(strCondition.indexOf("(",f2)+1,strCondition.indexOf(")",f2));
      eO["postcondition"] = "_ide_debugswitch = (" + postCondition + ");";
      //update string for the condition end, since dowhile loops need more than a closing bracked
      eO["strConditionEnd"] = "} while(" + postCondition + ");";
    } else if(strCondition.search(matchArray[4]) > -1) {
      //FUNCTION
      eO["statementtype"] = "FUNCTION";
      eO["inputParamsObj"] = this.DEBUG_ARGS;
      eO["inputParameters"] = this._getDebugParameters(strFunction);
      eO["precondition"] = "_ide_debugswitch = 0";
      eO["condition"] = "_ide_debugswitch == 0";
      eO["postcondition"] = "_ide_debugswitch = 1";
    } else if(strCondition.search(matchArray[6]) > -1) {
      //ELSE
      eO["statementtype"] = "ELSE";
      eO["precondition"] = "";
      eO["condition"] = "true";
      eO["postcondition"] = "";
    }  else {
      //not a handled bracketed expression (such as a try/catch block)
      window.alert("this code contains an expression that is not supported\n:" + strFunction);
      return null;
    }

    //convert contained lines of execution to an array (split on the line feed);
    var strContent = jsx3.util.strTrim(strFunction.substring(f1,f2));
    var objContent = strContent.split("\n");
    var maxLen = objContent.length;

    //locate all sub-expressions and regular lines of execution; each will be added to the array of expressions
    var intDepth = -1;
    var strSubExpression = "";
    eO["expressionArray"] = [];
    for(var i=0;i<maxLen;i++) {
      //get handle to current line of code
      var strLine = objContent[i];

      //determine whether line of code executes within the parent- or sub-statement
      if(strLine.indexOf("{") > -1) intDepth++;
      if(intDepth > -1) strSubExpression += (strLine + "\n");
      if(strLine.indexOf("}") > -1) intDepth--;

      //if depth is reset, it's time to save the current line as a string or convert the current block to an expression object
      if(intDepth == -1) {
        if(strSubExpression != "") {
          //recurse to convert this set of statements to an object array
          eO["expressionArray"][eO["expressionArray"].length] = this._createExpressionObject(strSubExpression);
          strSubExpression = "";
        } else if(strLine.indexOf("jsx3.ide.debug") == -1 && strLine.indexOf("this.debug") == -1){
          //add this line of code as a string if not the system-designated breakpoint
          eO["expressionArray"][eO["expressionArray"].length] = jsx3.util.strTrim(strLine);
        }
      }
    }
  }
  //return the expression object
  return eO;
},


//gets input parameters from a function and saves in a string format that can be executed at run-time against the 'arguments' object to provide parameter passing
_getDebugParameters: function(strFunction) {
  var strArgNameArray = jsx3.util.strTrim(strFunction.substring(strFunction.indexOf("(")+1,strFunction.indexOf(")")));
  var str= "";
  if(strArgNameArray.length > 0) {
    var objArgNameArray = strArgNameArray.split(",");
    for(var i=0;i<objArgNameArray.length;i++) {
      str += "var " + objArgNameArray[i] + " = debugArgs[" + i + "];";
    }
  }
  return str;
}

});

/* @JSC :: begin DEP */

/**
 * any class that is a subclass of jsx3.Object can insert a breakpoint into a function that will tell the step-through-debugger to intercept the call and step through. this breakpoint should be placed at the very top of the function and should read:  return this.debug();
 * @private
 */
jsx3.lang.Object.prototype.debug = function() {
  //globally reference the locally-scoped arguments array to make accessible from within the debugger
  plugIn.DEBUG_ARGS = arguments.callee.caller.arguments;

  //call function that will parse the function (which is now a string) into a parsable expression object;
  var objExpression = plugIn._createExpressionObject(arguments.callee.caller.toString().replace(/\}\s*else/g,"}\r\nelse"));

  return plugIn._doDebug.apply(this, [objExpression]);
};

/* @JSC :: end */

})(this);
