/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

// @jsxobf-global-rename-pattern  _jsx(\w+) _jsx$1
// @jsxobf-clobber  _addin _loaded _server
// @jsxobf-reserved  IE FX ie6 ie7 ie fx SAF SVG VML IE6 IE7 gi is

if (window['jsx_main'] == null)
/* Wrap the entire system initialization in this one function, which we will call once and then destroy */
window['jsx_main'] = function() {

  /* Browser detection, the result of which is setting the strPath variable. */
  var BrowserDetect = function() {
    var vers, agt = this.agt = navigator.userAgent.toLowerCase();

    this.gk = agt.indexOf('gecko') >= 0;

    // Mozilla Firefox v1.5-4
    this.fx = this.gk && (agt.indexOf('firefox') >= 0 || agt.indexOf('granparadiso') >= 0);
    if (this.fx) {
      vers = this._getVersionAfter('firefox/') || this._getVersionAfter('granparadiso/');
      this.fx1_5 = vers >= 1.5 && vers < 2;
      this.fx2 = vers >= 2 && vers < 3;
      this.fx3 = vers >= 3 && vers < 4;
      this.fx4 = vers >= 4;
    }

    // Apple WebKit (Safari) v3-4
    this.sf = agt.indexOf('applewebkit') >= 0;
    if (this.sf) {
      if (agt.indexOf('chrome/') >= 0) {
        this.gc1 = true;
      } else {
        vers = this._getVersionAfter('version/');
        this.sf3 = vers >= 3 && vers < 4;
        this.sf4 = vers >= 4;
      }
    }

    // Opera v9-10
    this.op = agt.indexOf("opera") >= 0;
    if (this.op) {
      vers = this._getVersionAfter('opera/') || this._getVersionAfter('opera ');
      this.op9 = vers >= 9 && vers < 10;
      this.op10 = vers >= 10;
    }

    // Microsoft Internet Explorer v11
    var trident = agt.match(/trident/i);
    // Microsoft Internet Explorer v6-8
    this.ie = (agt.indexOf("msie") >= 0 && !this.op)||(!!trident);
    if (this.ie) {
      vers = this._getVersionAfter('msie ')|| this._getVersionAfter("rv:");
      this.ie6 = vers >= 6 && vers < 7;
      this.ie7 = vers >= 7 && vers < 8;
      this.ie8 = vers >= 8 && vers < 9;
      this.ie9 = vers >= 9 && vers < 10;
      this.ie9s = vers >= 9 && document.documentMode == 9; // IE9 standards mode
      this.ie10 = vers >= 10 && vers < 11;
      this.ie11 = vers >= 11;
    }
  };

  /* @jsxobf-clobber */
  BrowserDetect._ORDER = [
      "ie11", "ie10", "ie9s", "ie9", "ie8", "ie7", "ie6",
      "fx4", "fx3", "fx2", "fx1_5",
      "gc1", "sf4", "sf3",
      "op10", "op9",
      "ie", "fx", "sf", "op", "gk"
  ];

  /* @jsxobf-clobber */
  BrowserDetect.prototype._getVersionAfter = function(strToken) {
    var index = this.agt.indexOf(strToken);
    return index >= 0 ? parseFloat(this.agt.substring(index+strToken.length)) : 0;
  };

  BrowserDetect.prototype.getType = function() {
    for (var i = 0; i < BrowserDetect._ORDER.length; i++)
      if (this[BrowserDetect._ORDER[i]])
        return BrowserDetect._ORDER[i];
    return "xx";
  };

  /* Load the JSX system if not already loaded. */
  if (window['jsx3'] == null) {

    /** @jsxdoc-category  jsx3 */
    window.jsx3 = {};
    jsx3.lang = {};
    jsx3.util = {};

    /**
     * {String} base path for the core JS classes for gi runtime (JSX/js)
     * @package
     * @final @jsxobf-final
     */
    jsx3.SYSTEM_ROOT = "JSX";

    /**
     * {String} base path for the core JS classes for gi runtime (JSX/js)
     * @package
     * @final
     */
    jsx3.SYSTEM_SCRIPTS = jsx3.SYSTEM_ROOT + "/js";

    /**
     * {String} the path to the main JavaScript file (JSX30.js)
     * @package
     * @final
     */
    jsx3.MAIN_SCRIPT = jsx3.SYSTEM_SCRIPTS + "/JSX30.js";

    /**
     * {String} An application's folder must be a descendent of a folder with this name for GI to work properly.
     * @package
     * @final @jsxobf-final
     */
    jsx3.APP_DIR_NAME = "JSXAPPS";

    /**
     * {String}
     * @package
     * @final @jsxobf-final
     */
    jsx3.CONFIG_FILE = "config.xml";

/* @JSC :: begin DEP */

    /**
     * {String} Absolute path (the path on the server (file or http) from the accessible root to the directory
     *   containing the JSX system folder. Specifies a directory (ie it's empty or ends with a "/").
     * @deprecated  Use <code>jsx3.getEnv("jsxabspath")</code>.
     */
    jsx3.ABSOLUTEPATH = "";

    /**
     * {String} Path for application resources (the prefix that precedes JSXAPPS). Specifies a directory (ie it's
     *   empty or ends with a "/").
     * @deprecated  Use <code>jsx3.getEnv("jsxhomepath")</code>.
     */
    jsx3.APPPATH = "";

/* @JSC :: end */

    /**
     * {jsx3.gui.Event}
     */
    jsx3.STARTUP_EVENT = null;

    /** @private @jsxobf-clobber */
    jsx3.ENVIRONMENT = {};

    /**
     * Returns the value of a system-wide environment variable. System-wide environment parameters are set either
     * by query parameters in the launch page URL or by attributes on the GI <b>script</b> tag. System-wide
     * environment variable keys always begin with <code>"jsx"</code> and do not begin with <code>"jsxapp"</code>.
     *
     * @param strKey {String} the case-insensitive environment variable key.
     * @return {String} the environment variable value.
     * @see jsx3.app.Server#getEnv()
     */
    jsx3.getEnv = function(strKey) {
      return jsx3.ENVIRONMENT[strKey.toLowerCase()];
    };

    /**
     * @private
     */
    jsx3.setEnv = function(strKey, strValue) {
      strKey = strKey.toLowerCase();
      if (jsx3.ENVIRONMENT[strKey] != null && jsx3.ENVIRONMENT[strKey] != strValue)
        window.alert(jsx3._msg("boot.env_reset", strKey, jsx3.ENVIRONMENT[strKey], strValue));
      jsx3.ENVIRONMENT[strKey] = strValue;
    };

    jsx3.tcf = function(fctTry, fctCatch, fctFinally, objThis) {
      if (jsx3.CLASS_LOADER.IE) {
        fctTry.apply(objThis);
        if (fctFinally)
          fctFinally.apply(objThis);
      } else {
        if (fctCatch) {
          try {
            fctTry.apply(objThis);
          } catch (e) {
            fctCatch.apply(objThis, [e]);
          } finally {
            if (fctFinally)
              fctFinally.apply(objThis);
          }
        } else {
          try {
            fctTry.apply(objThis);
          } finally {
            if (fctFinally)
              fctFinally.apply(objThis);
          }
        }
      }
    };

    /**
     * Delegates to <code>System.getMessage()</code> if it has been defined. Otherwise, it returns the message
     * key with any arguments appended on the end.
     * @see jsx3.lang.System#getMessage()
     * @package
     */
    jsx3._msg = function(strKey, strTokens) {
      if (jsx3.System && jsx3.System.getMessage) return jsx3.System.getMessage.apply(null, arguments);
      var a = new Array(arguments.length);
      for (var i = 0; i < a.length; i++) a[i] = arguments[i];
      return a.join(" ");
    };

    jsx3.lstr = function(objBundle, strKey) {
      if (!objBundle.__) {
        // It is an error for the default locale not to be defined.
        var defaultLocale = objBundle._;
        if (!defaultLocale) defaultLocale = objBundle._ = {};

        // Construct the master for the current locale. Do this once as an optimization.
        var master = objBundle.__ = {};
        var localeBundles = [];

        // Get the locale string from a variety of sources.
        //  1. System.getLocale() if loaded
        //  2. window.navigator.userLanguage (IE)
        //  3. window.navigator.language (other browsers)
        //  4. ""
        var localeString = jsx3.System ? jsx3.System.getLocale().toString() :
            (window.navigator.userLanguage || window.navigator.language || "");
        // http://www.ietf.org/rfc/rfc3066.txt specifies "-" as the seprator, convert to "_" for our use    
        localeString = localeString.replace(/^(\w*)-(\w*)$/, function(str, ll, cc) {
         return ll+"_"+cc.toUpperCase();
        });
        // See if the first (language+country) locale is defined.
        var firstLocale = objBundle[localeString];
        if (firstLocale) localeBundles.push(firstLocale);

        // See if the second (language only) locale is defined.
        var index = localeString.indexOf("_");
        if (index >= 0) {
          var secondLocale = objBundle[localeString.substring(0, index)];
          if (secondLocale) localeBundles.push(secondLocale);
        }

        localeBundles.push(defaultLocale);

        for (var i = localeBundles.length - 1; i >= 0; i--) {
          var b = localeBundles[i];
          for (var f in b)
            master[f] = b[f];
        }
      }

      var value = objBundle.__[strKey];
      return typeof(value) == "undefined" ? strKey : value;
    };

    var msgBundle = /* BOOT BUNDLE */{};
    var getMsgStr = function(strKey) {
      return jsx3.lstr(msgBundle, strKey);
    };

    // A simple event publishing interface for the classes in this file.
    var evtPub = {};

    /* @jsxobf-clobber */
    evtPub._subscribe = function(strSubject, objTarget, strMethod) {
      if (!this._evtpubreg)
        /* @jsxobf-clobber */
        this._evtpubreg = {};
      var list = this._evtpubreg[strSubject];
      if (!list)
        list = this._evtpubreg[strSubject] = [];
      list[list.length] = [objTarget, strMethod];
    };

    /* @jsxobf-clobber */
    evtPub._unsubscribe = function(strSubject, objTarget) {
      if (this._evtpubreg) {
        var list = this._evtpubreg[strSubject];
        for (var i = list.length - 1; i >= 0; i--) {
          if (list[i][0] == objTarget)
            list.splice(i, 1);
        }
      }
    };

    /* @jsxobf-clobber */
    evtPub._publish = function(objEvent) {
      if (this._evtpubreg) {
        var list = this._evtpubreg[objEvent.subject];
        if (list) {
          if (list.length > 1)
            list = list.concat(); // defensive copy
          var max = list.length;
          for (var i = 0; i < max; i++) {
            var a1 = list[i][0];
            var a2 = list[i][1];
            var fct = typeof(a2) == "function" ? a2 : a1[a2];
            fct.call(a1, objEvent);
          }
        }
      }

      if (this.publish)
        this.publish(objEvent);
    };

    /* @jsxobf-clobber */
    evtPub._import = function(objTarget) {
      objTarget._subscribe = this._subscribe;
      objTarget._unsubscribe = this._unsubscribe;
      objTarget._publish = this._publish;
    };


    jsx3._bsLog = "";
    jsx3._logIt = function(strMessage) {
      jsx3._bsLog += strMessage + "\n";
//      if (jsx3.html && jsx3.html.copy)
//        jsx3.html.copy(jsx3._bsLog);
      if (jsx3.util.Logger)
        jsx3.log(strMessage);
    };

//    window.setTimeout(function() {alert(jsx3._bsLog);}, 5000);

    var defClass = jsx3._defClass = function(objNS, strName, objSuper, fctDef) {
      var noInit = {};

      var c = objNS[strName] = function() {
        if (arguments[0] !== noInit)
          this.init.apply(this, arguments);
      };

      if (objSuper) {
        c.prototype = new objSuper(noInit);
        c._super = function(fct, arrArgs) {
          if (!arrArgs) arrArgs = [];
//          alert("_super this:" + this + " name:" + strName + " fct:" + fct + " args:" + arrArgs);
          var sf = objSuper.prototype[fct];
          return sf.apply(this, arrArgs);
        };
      }

      fctDef(c, c.prototype);
    };

    /**
     * @since 3.6
     * @jsxdoc-definition  jsx3.lang.Class.defineClass("jsx3.util.Graph", Object, null, function() {});
     */
    defClass(jsx3.util, "Graph", null, function(Graph, Graph_prototype) {

      /**
       * The instance initializer.
       */
      Graph_prototype.init = function() {
        this.clear();
      };

      /**
       * Returns a node by its ID.
       * @param id {String|Number}
       * @return {GNode}
       */
      Graph_prototype.node = function(id) {
        return this._index[id];
      };

      /**
       * Returns the number of nodes in this graph.
       * @return {int}
       */
      Graph_prototype.size = function() {
        return this._count;
      };

      /**
       * Adds a sub-graph to this graph. <code>objNode</code> is the root of the directed sub-graph.
       *
       * @param objNode {GNode}
       * @return {boolean} whether the node was added.
       */
      Graph_prototype.add = function(objNode) {
        var id = objNode._id;
        if (objNode._graph || this._index[id]) return false;

        objNode._graph = this;
        this._index[id] = objNode;
        this._count++;

        var as = [objNode._down, objNode._up];
        for (var i = 0; i < as.length; i++) {
          var a = as[i];
          for (var j = 0; j < a.length; j++) {
            if (! a[j]._graph)
              this.add(a[j]);
          }
        }

        return true;
      };

      /**
       * Removes a single node from this graph.
       *
       * @param objNode {GNode}
       * @return {boolean} whether the node was removed.
       */
      Graph_prototype.del = function(objNode) {
        var id = objNode._id;
        if (this._index[id] !== objNode) return false;

        for (var i = 0; i < objNode._up.length; i++) {
          var downs = objNode._up[i]._down;
          for (var j = 0; j < downs.length; j++) {
            if (downs[j] == objNode) {
              downs.splice(j, 1);
              break;
            }
          }
        }
        objNode._up = [];

        for (var i = 0; i < objNode._down.length; i++) {
          var ups = objNode._down[i]._up;
          for (var j = 0; j < ups.length; j++) {
            if (ups[j] == objNode) {
              ups.splice(j, 1);
              break;
            }
          }
        }
        objNode._down = [];

        objNode._graph = null;
        delete this._index[id];
        this._count--;
        return true;
      };

      /**
       * Returns all the root nodes of this graph. A root node has no parent nodes.
       * @return {Array<GNode>}
       */
      Graph_prototype.roots = function() {
        var r = [];
        for (var id in this._index) {
          if (this._index[id]._up.length == 0)
            r.push(this._index[id]);
        }
        return r;
      };

      /**
       * Returns all the nodes of this graph.
       * @return {Array<GNode>}
       */
      Graph_prototype.nodes = function() {
        var n = [];
        for (var id in this._index)
          n.push(this._index[id]);
        return n;
      };

      Graph_prototype.clear = function() {
        this._index = {};
        this._count = 0;
      };

    });

    /**
     * @since 3.6
     * @jsxdoc-definition  jsx3.lang.Class.defineClass("jsx3.util.GNode", Object, null, function() {});
     */
    defClass(jsx3.util, "GNode", null, function(GNode, GNode_prototype) {

      GNode._SERIAL = 0;

      /**
       * The instance initializer.
       *
       * @param id {String|Number}
       */
      GNode_prototype.init = function(id) {
        this._id = id != null ? id : (++GNode._SERIAL);
        this._graph = null;
        this._up = [];
        this._down = [];
      };

      /**
       * Returns the graph that this node belongs to, if any.
       * @return {Graph}
       */
      GNode_prototype.graph = function() {
        return this._graph;
      };

      /**
       * This function returns the unique ID of this node. Subclasses of this class are expected to provide their own
       * implementation of this method. However, this implementation also generates unique IDs.
       *
       * @return {String|Number}
       */
      GNode_prototype.id = function() {
        return this._id;
      };

      /**
       * Adds <code>objNode</code> as a child of this node. The node can only be added if both nodes already belong to
       * the same graph or neither node belongs to a graph.
       *
       * @return {boolean} whether the node was added.
       */
      GNode_prototype.add = function(objNode) {
        if (this._graph != objNode._graph) return false;

        this._down.push(objNode);
        objNode._up.push(this);
        return true;
      };

      /**
       * Removes <code>objNode</code> as a child of this node.
       *
       * @return {boolean} whether the node was removed.
       */
      GNode_prototype.del = function(objNode) {
        var found = false;

        for (var i = 0; i < this._down.length; i++) {
          if (this._down[i] == objNode) {
            this._down.splice(i, 1);
            found = true;
            break;
          }
        }

        if (!found) return found;

        for (var i = 0; i < objNode._up.length; i++) {
          if (objNode._up[i] == this) {
            objNode._up.splice(i, 1);
            break;
          }
        }

        return true;
      };

      /**
       * Returns the parent nodes of this node.
       * @return {Array<GNode>}
       */
      GNode_prototype.up = function() {
        return this._up;
      };

      /**
       * Returns the child nodes of this node.
       * @return {Array<GNode>}
       */
      GNode_prototype.down = function() {
        return this._down;
      };

      GNode_prototype.toString = function() {
        return this._id;
      };

    });

    /**
     * @since 3.6
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.util.Job", jsx3.util.GNode, [jsx3.util.EventDispatcher], function(){});
     */
    defClass(jsx3.util, "Job", jsx3.util.GNode, function(Job, Job_prototype) {

      evtPub._import(Job_prototype);

      /**
       * {String} Event subject published when this job finishes.
       * @final @jsxobf-final
       */
      Job.FINISH = "finish";

      /**
       * {int} Value that the <code>run()</code> method may return to indicate that the job will not finish until the
       *   <code>finish()</code> method is called.
       * @final @jsxobf-final
       */
      Job.WAIT = 0;

      /**
       * {int} Value that the <code>run()</code> method may return to indicate that the job has finished and any dependent
       *   jobs should be run immediately.
       * @final @jsxobf-final
       */
      Job.DONE = 1;

      /**
       * {int} Value that the <code>run()</code> method may return to indicate that the job has finished and any dependent
       *   jobs should be run after breaking the JavaScript stack with <code>window.setTimeout()</code>.
       * @final @jsxobf-final
       */
      Job.SLEEP = 2;

      /**
       * {int} Value that the <code>run()</code> method may return to indicate that the job should be put back on the
       *   waiting job queue.
       * @final @jsxobf-final
       */
      Job.PUSH = 3;

      /**
       * {int} Value for the state property indicating that this job has not yet finished.
       * @final @jsxobf-final
       */
      Job.WAITING = 0;

      /**
       * {int} Value for the state property indicating that this job has finished.
       * @final @jsxobf-final
       */
      Job.FINISHED = 1;

      /**
       * The instance initializer.
       * @param id {String} the unique job id. If this parameter is not provided, a suitable unique value is generated.
       */
      Job_prototype.init = function(id, fctRun) {
        Job._super.call(this, "init", [id]);

        /* @jsxobf-clobber */
        this._state = Job.WAITING;

        if (fctRun)
          this.run = fctRun;
      };

      /**
       * Runs the job. This method should be overridden for any job that wants to perform some action.
       * @return {int} <code>WAIT</code>, <code>DONE</code>, or <code>SLEEP</code>.
       * @see #WAIT
       * @see #DONE
       * @see #SLEEP
       */
      Job_prototype.run = function() {
        return Job.DONE;
      };

      /**
       * A job should call this method on itself if its run() method returns <code>WAIT</code> to communicate to the
       * job manager that it has finished.
       * @see #WAIT
       */
      Job_prototype.finish = function() {
        this._state = Job.FINISHED;

        this._publish({subject:Job.FINISH});

        if (this._notifygraph)
          this.graph()._onFinish(this);
      };

      /**
       * Returns the job state.
       * @return <code>WAITING</code> or <code>FINISHED</code>.
       * @see #WAITING
       * @see #FINISHED
       */
      Job_prototype.state = function() {
        return this._state;
      };

      Job_prototype._checkDuplicate = function(dupJob) {
        if (dupJob) {
          if (dupJob.state() == Job.FINISHED) {
            return Job.DONE;
          } else {
            this.graph().addPrereq(this, dupJob);
            return Job.PUSH;
          }
        }
      };

    });

    /**
     * @since 3.6
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.util.JobGraph", Object, [jsx3.util.EventDispatcher], function(){});
     */
    defClass(jsx3.util, "JobGraph", jsx3.util.Graph, function(JobGraph, JobGraph_prototype) {

      evtPub._import(JobGraph_prototype);

      var Job = jsx3.util.Job;

      /** {String} Event subject published when the job graph empties. */
      JobGraph.DONE = "done";

      /** {String} Event subject published when a job is finished. */
      JobGraph.RAN_JOB = "ran";

      /**
       * The instance initializer.
       */
      JobGraph_prototype.init = function() {
        JobGraph._super.call(this, "init");
        this.reset();
      };

      /**
       * Resets this job manager.
       */
      JobGraph_prototype.reset = function() {
        /* @jsxobf-clobber */
        this._running = false;  // whether this job manager is running
        /* @jsxobf-clobber */
        this._runningJobs = {}; // index all running ids so we don't run them twice
        /* @jsxobf-clobber */
        this._doneCt = 0;       // the number of finished jobs
        /* @jsxobf-clobber */
        this._finishingJobsQueue = [];     // the finishing queue, a list of jobs that are finishing
        /* @jsxobf-clobber */
        this._finishSP = false; // the finishing queue semaphore, indicates that the queue is processing
      };

      JobGraph_prototype.clear = function() {
        JobGraph._super.call(this, "clear");
        this.reset();
      };

      /**
       * Add a job to this manager. If the manager is running and no prerequisites are specified then the job is run
       * immediately.
       *
       * @param objJob {jsx3.util.Job} the job to add.
       * @param preReqs {String | Array<String>} the ids of all the jobs that must finish before the job is run.
       * @param postReqs {String | Array<String>} the ids of all the jobs that must must not run before the job is run.
       * @throws {Error}  if a job with the same id as <code>objJob</code> is currently waiting in this manager or
       *   if any prerequisite id does not correspond to a job not currently waiting in this job manager.
       */
      JobGraph_prototype.addJob = function(objJob, preReqs, postReqs) {
        if (! this.add(objJob))
          throw new Error(jsx3._msg("job.dup", objJob._id));
        var newJobs = this._getAllJobs(objJob);

        if (preReqs) {
          if (!(preReqs instanceof Array)) preReqs = [preReqs];
          for (var i = 0; i < preReqs.length; i++)
            this.addPrereq(objJob, preReqs[i]);
        }

        if (postReqs) {
          if (!(postReqs instanceof Array)) postReqs = [postReqs];
          for (var i = 0; i < postReqs.length; i++)
            this.addPrereq(postReqs[i], objJob);
        }

//        jsx3._logIt("Add job " + objJob.toString() + " with pres [" + objJob.up() + "] tried [" + preReqs + "]");

        for (var i = 0; i < newJobs.length; i++)
          this._runIfReady(newJobs[i]);
      };

      /**
       * Inserts <code>newJob</code> as a graph root and adds all children of <code>referenceJob</code> as children of
       * <code>newJob</code>. This method is typically called in the "onDone" of <code>referenceJob</code>, when it
       * creates <code>newJob</code> and wants <code>newJob</code> to run before any dependent jobs of itself
       * (<code>referenceJob</code>).
       */
      JobGraph_prototype.insertJob = function(newJob, referenceJob) {
        if (! this.add(newJob))
          throw new Error(jsx3._msg("job.dup", newJob._id));
        var newJobs = this._getAllJobs(newJob);

        var d = referenceJob.down();
        for (var i = 0; i < d.length; i++)
          newJob.add(d[i]);

        for (var i = 0; i < newJobs.length; i++)
          this._runIfReady(newJobs[i]);
      };

      /** @private @jsxobf-clobber */
      JobGraph_prototype._getAllJobs = function(objJob) {
        var map = {};
        var jobs = [objJob];
        var i = 0;
        while (i < jobs.length) {
          var node = jobs[i];
          map[node._id] = 1;
          var as = [node.up(), node.down()];
          for (var j = 0; j < as.length; j++) {
            var a = as[j];
            for (var k = 0; k < a.length; k++) {
              var x = a[k];
              if (! map[x._id])
                jobs.push(x);
            }
          }
          i++;
        }

        return jobs;
      };

      /**
       * Adds a prerequisite to the job with id <code>jobId</code>.
       * @param objJob {String|jsx3.util.Job} the job or its ID to which to add the prerequisite.
       * @param preJob {String|jsx3.util.Job} the job or its ID that is a prerequisite of job <code>objJob</code>.
       * @throws {Error}  if either parameter refers to a job not currently waiting in this job manager.
       */
      JobGraph_prototype.addPrereq = function(objJob, preJob) {
        if (typeof(objJob) != "object")
            objJob = this.node(objJob);

        if (!objJob)
          throw new Error(jsx3._msg("job.pre_bad", arguments[0], preJob));

        if (typeof(preJob) != "object")
          preJob = this.node(preJob);

        if (preJob)
          preJob.add(objJob);
      };

      /**
       * Starts this job manager.
       */
      JobGraph_prototype.start = function() {
        if (! this._running) {
          this._running = true;
          this._runIfReady();
        }
      };

      /**
       * @return {boolean}
       */
      JobGraph_prototype.isRunning = function() {
        return this._running;
      };

      /**
       * Pauses this job manager.
       */
      JobGraph_prototype.pause = function() {
        this._running = false;
      };

      /**
       * Returns the number of jobs that have finished.
       */
      JobGraph_prototype.doneCt = function() {
        return this._doneCt;
      };

      /**
       * Checks to see if a job is ready to run, i.e. that all prerequisites have already run, and if so runs it. If
       * <code>jobId</code> is not provided, then all currently waiting jobs are considered.
       * @param objJob {String|jsx3.util.Job} the id of the job to run if it is ready.
       * @private
       * @jsxobf-clobber
       */
      JobGraph_prototype._runIfReady = function(objJob) {
        if (this._running) {
          if (objJob) {
//            jsx3._logIt("try to run:" + objJob + " up:" + objJob.up());
            if (objJob.up().length == 0)
              this._runJob(objJob);
          } else {
//            jsx3._logIt("roots:" + this.roots());
            var roots = this.roots();

            if (roots.length == 0 && this.size() > 0) {
              // ERROR: deadlock!
//            jsx3._logIt("ERROR: deadlock with jobs remaining: " + this.nodes());
              this.clear();
            }

            for (var i = 0; i < roots.length; i++)
              this._runJob(roots[i]);
          }
        }
      };

      /**
       * @private
       * @jsxobf-clobber
       */
      JobGraph_prototype._runJob = function(objJob) {
        var jobId = objJob._id;

        if (this._runningJobs[jobId]) return;
        this._runningJobs[jobId] = true;

//        jsx3._logIt("Running job " + objJob);
        var intCmd = objJob.run();
//        jsx3._logIt("... ran job " + objJob._id + " with result " + intCmd);

        if (typeof(intCmd) == "undefined" || intCmd == Job.DONE) {
          objJob.finish();
          this._onFinish(objJob);
        } else if (intCmd == Job.WAIT && objJob.state() == Job.FINISHED) {
          // This should be called by the job itself after returning WAIT
          this._onFinish(objJob);
        } else if (intCmd == Job.SLEEP) {
          var me = this;
          window.setTimeout(function() {
            me._onFinish(objJob);
          }, 0);
        } else if (intCmd == Job.PUSH) {
          this._runningJobs[jobId] = false;
          return;
        } else {
          objJob._notifygraph = true;
        }

        delete objJob.run;
      };

      /**
       * @private
       * @jsxobf-clobber
       */
      JobGraph_prototype._onFinish = function(objJob) {
//        jsx3._logIt("_onFinish " + objJob._id + " (running:" + this._finishSP + ")");

        this._finishingJobsQueue.push(objJob);
        if (!this._finishSP)
          this._finishThread();
      };

      /**
       * @private
       * @jsxobf-clobber
       */
      JobGraph_prototype._finishThread = function() {
        // Set the semaphore to true so that the loop cannot cause this method to be called again in an ever-growing stack.
        this._finishSP = true;

        jsx3.tcf(this._finishThreadTry, null, 
            function() { this._finishSP = false; }, this);

        if (this.size() == 0) {
          if (this.publish)
            this.publish({subject:JobGraph.DONE});
        } else {
//          jsx3._logIt("Not done! waiting: done:" + this._doneCt);
        }
      };

      JobGraph_prototype._finishThreadTry = function() {
        // This array may get appended to while this is iterating
        for (var i = 0; i < this._finishingJobsQueue.length; i++) {
          var objJob = this._finishingJobsQueue[i];

          delete this._runningJobs[objJob._id];

          var dependentJobs = objJob.down(); // need defensive backup?
          this.del(objJob);
          this._doneCt++;

          if (this.publish) // I don't listen for this event, so just bypass to EventDispatcher method
            this.publish({subject:JobGraph.RAN_JOB, job:objJob});

          for (var j = 0; j < dependentJobs.length; j++)
            this._runIfReady(dependentJobs[j]);
        }

        this._finishingJobsQueue = [];
      };

      JobGraph_prototype._finishThreadFinally = function() {
        this._finishSP = false;
      };
    });

    /**
     * The class loader initializes the system and loads applications and add-ins. One instance of this class
     * (<code>jsx3.CLASS_LOADER</code>) is created when the system loads.
     * <p/>
     * The following deployment parameters affect the behavior of the class loader:
     * <ul>
     *  <li><code>jsx_no_messages</code> - if set the class loader does not load the
     *    <code>jsx:/locale/messages.xml</code> properties bundle.</li>
     *  <li><code>jsx_no_locale</code> - if set the class loader does not load the
     *    <code>jsx:/locale/locale.xml</code> properties bundle.</li>
     *  <li><code>jsx_logger_config</code> - the relative path to the logging system configuration file. If not set,
     *    <code>jsx:/../logger.xml</code> is used. If equal to an empty string then the default configuration is
     *    used without loading an external file.</li>
     *  <li><code>jsx_browsers</code> - overrides the default set of supported browsers. The format of this parameter
     *    is <code><b>bt</b>={allow,warn}[,...]</code> where <code>bt</code> is the browser type returned by the
     *    <code>getType()</code> method.</li>
     * </ul>
     *
     * @see #getType()
     * @see jsx3#CLASS_LOADER
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader", Object, [jsx3.util.EventDispatcher], function(){});
     */
    defClass(jsx3.lang, "ClassLoader", null, function(ClassLoader, ClassLoader_prototype) {

      var Job = jsx3.util.Job;
      var proto = null;

      evtPub._import(ClassLoader_prototype);

      /* Define all the system JavaScript resource files to load. This array will be modified by the file merger
             during the build process so we include some comments to help the file merger find it. */
      /** @package */
      ClassLoader.SYSTEM_SCRIPTS = [
          "jsx3/javascript.js",
          "jsx3/ext.js",
          "jsx3/lang/pkg.js",
          "jsx3/lang/Object.js",
          "jsx3/lang/Method.js",
          "jsx3/lang/Class.js",
          "jsx3/lang/AOP.js",
          "jsx3/lang/Exception.js",
          "jsx3/lang/NativeError.js",
          "jsx3/lang/Package.js",
          "jsx3/package.js",
          "jsx3/util/package.js",
          "jsx3/util/List.js",
          "jsx3/app/AddIn.js",
          "jsx3/util/EventDispatcher.js",
          "jsx3/net/URI.js",
          "jsx3/gui/Event.js",
          "jsx3/EVT.js",                // -> deprecated
          "jsx3/app/Browser.js",
          "jsx3/app/Settings.js",
          "jsx3/xml/Entity.js",
          "jsx3/net/Request.js",
          "jsx3/xml/Document.js",
          "jsx3/xml/Template.js",
          "jsx3/util/Logger.js",
          "jsx3/util/Locale.js",
          "jsx3/util/NumberFormat.js",
          "jsx3/util/DateFormat.js",
          "jsx3/util/MessageFormat.js",
          "jsx3/html/package.js",
          "jsx3/app/Cache.js",
          "jsx3/app/Properties.js",
          "jsx3/app/PropsBundle.js",
          "jsx3/lang/System.js",
          "jsx3/app/DOM.js",
          "jsx3/app/Server.js",
          "jsx3/app/Model.js",
          "jsx3/xml/CDFSchema.js",
          "jsx3/xml/CDF.js"             // -> could possibly be loaded as needed legacy
      ];

      /** @package */
      ClassLoader.INCLUDES = [
        {id: "jsx_css", type:"css", src:"css/@path@/JSX.css", browser:"!IE"},
        {id: "jsx_css", type:"css", src:"css/ie/JSX.css", browser:"IE"},
        {id: "jsx_jss_css", type:"ljss", src:"jss/CSS.xml"}
      ];

      /** @private @jsxobf-clobber */
      ClassLoader._BROWSERS = {
        ie6:["ie6", ["IE","IE6","VML"], "allow", 6],
        ie7:["ie7", ["IE","IE7","VML"], "allow", 7],
        ie8:["ie7", ["IE","IE8","VML"], "allow", 8],
        ie9:["ie7", ["IE","IE9","VML"], "allow", 9],
        ie9s:["ie7", ["IE","IE9","SVG"], "allow", 9],
        ie10:["ie7", ["IE","IE10","SVG"], "allow", 10],
        ie11:["ie7", ["IE","IE11","SVG"], "allow", 11],
        fx1_5:["fx", ["FX","SVG","GKO"], 0, 1.5],
        fx2:["fx", ["FX","FX2","SVG","GKO"], 0, 2],
        fx3:["fx", ["FX","FX3","SVG","GKO"], "allow", 3],
        fx4:["fx", ["FX","FX4","SVG","GKO"], "allow", 4],
        gc1:["saf", ["SAF","SAF3","SVG","KON","GOG"], "allow", 3],
        sf3:["saf", ["SAF","SAF3","SVG","KON"], "allow", 3],
        sf4:["saf", ["SAF","SAF4","SVG","KON"], "allow", 4],
        op9:["ie", ["OPERA"], 0, 9],
        op10:["ie", ["OPERA"], 0, 10],
        ie:["ie", ["IE","IE6","VML"]],
        fx:["fx", ["FX","SVG","GKO"]],
        sf:["saf", ["SAF","SVG","KON"]],
        op:["ie", ["OPERA"]],
        gk:["fx", ["FX","SVG","GKO"]],
        xx:["fx", []]
      };

      /** @private @jsxobf-clobber */
      ClassLoader.MODE_MAP = {0:"IE_MQ", 1: "FX_MQ", 2: "IE_MS", 3: "FX_MS"};

      /** {int}
        * @final @jsxobf-final */
      ClassLoader.LOAD_ALWAYS = 1;
      /** {int}
        * @final @jsxobf-final */
      ClassLoader.LOAD_AUTO = 0;

      var LOG = null;
      var Logger = null;

      /** @private */
      ClassLoader_prototype.init = function(objBrowser) {
        this._type = objBrowser.getType();

        var defines = ClassLoader._BROWSERS[this._type][1];
        for (var i = 0; i < defines.length; i++)
          this[defines[i]] = true; // so that jsx3.CLASS_LOADER.IE, etc are defined for precompiler

        /* @jsxobf-clobber */
        this._apps = [];
        /* @jsxobf-clobber */
        this._addins = {};
      };

      /** @package */
      ClassLoader_prototype.destroy = function() {
        for (var i = 0; i < this._apps.length; i++) {
          var app = this._apps[i];
          for (var f in app) delete app[f];
        }
        delete this._apps;
        delete this._addins;
        delete this._jobManager;
      };

      /**
       * Returns the browser type as determined by the class loader. The possible return values are:
       * <ul>
       *   <li><code>ie6</code> - Microsoft Internet Explorer versions 6.x</li>
       *   <li><code>ie7</code> - Microsoft Internet Explorer versions 7.x</li>
       *   <li><code>ie8</code> - Microsoft Internet Explorer versions 8.x</li>
       *   <li><code>ie9</code> - Microsoft Internet Explorer versions 9.x</li>
       *   <li><code>ie9s</code> - Microsoft Internet Explorer 9 standards mode</li>
       *   <li><code>ie10</code> - Microsoft Internet Explorer versions 10.x</li>
       *   <li><code>ie11</code> - Microsoft Internet Explorer versions 11 and above</li>
       *   <li><code>ie</code> - Microsoft Internet Explorer earlier or unrecognized version</li>
       *   <li><code>fx1_5</code> - Mozilla Firefox versions 1.5.x</li>
       *   <li><code>fx2</code> - Mozilla Firefox versions 2.x</li>
       *   <li><code>fx3</code> - Mozilla Firefox versions 3.x</li>
       *   <li><code>fx4</code> - Mozilla Firefox all versions above 3.x</li>
       *   <li><code>fx</code> - Mozilla Firefox earlier or unrecognized version</li>
       *   <li><code>sf3</code> - Apple Safari versions 3.x</li>
       *   <li><code>sf4</code> - Apple Safari all versions above 3.x</li>
       *   <li><code>sf</code> - Apple Safari earlier or unrecognized version</li>
       *   <li><code>gc1</code> - Google Chrome, any version</li>
       *   <li><code>op9</code> - Opera versions 9.x</li>
       *   <li><code>op10</code> - Opera all versions above 9.x</li>
       *   <li><code>op</code> - Opera earlier or unrecognized version</li>
       *   <li><code>gk</code> - other Gecko-based browser</li>
       *   <li><code>xx</code> - unrecognized browser</li>
       * </ul>
       *
       * @return {String}
       */
      ClassLoader_prototype.getType = function() {
        return this._type;
      };

      /**
       * {Number} Returns the version number of the host browser.
       * @package
       */
      ClassLoader_prototype.getVersion = function() {
        return ClassLoader._BROWSERS[this._type][3] || Number(0);
      };

      ClassLoader_prototype.getCssClass = function() {
        var t = this.getType();
        if (this.IE && document.documentMode >= 8)
          t += " ie8s";
        return t;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._start = function() {
        if (this._jobManager) return;

        /* @jsxobf-clobber */
        this._jobManager = new jsx3.util.JobGraph();
        var jobManager = this._jobManager;
        var includes = ClassLoader.INCLUDES;
        var scripts = ClassLoader.SYSTEM_SCRIPTS;

        if (! jsx3.getEnv("jsx_no_locale"))
          includes.push({id: "jsx_locale", type:"ljss", src:"locale/locale.xml"});
        if (! jsx3.getEnv("jsx_no_messages"))
          includes.push({id: "jsx_messages", type:"ljss", src:"locale/messages.xml"});

        var me = this;

        // update progress bars
        var progJob = new Job("jsx.prog1", function() {
          me._updateAllProgressTo(1, scripts.length);
        });
        jobManager.addJob(progJob);

        // 1. Required JavaScript
        var lastJob = null;
        for (var i = 0; i < scripts.length; i++) {
          var src = ClassLoader._toAbsolute(jsx3.SYSTEM_SCRIPTS + "/" + this.resolvePath(scripts[i]));
          var job = new ClassLoader.JsJob("jsxjs" + i, src);
          job._subscribe(Job.FINISH, this, "_onJsJobFinished");

          jobManager.addJob(job, lastJob);
          lastJob = job;
        }
        jobManager.addJob(new Job("jsx.js"), lastJob);
        jobManager.addJob(new Job("jsx.gui.xsl"), "jsx.js");

        // 2. Classes
        var classes = ["jsx3.xml.Document", "jsx3.app.Settings", "jsx3.util.Logger.AlertHandler", "jsx3.util.Locale",
            "jsx3.html.Selection", "jsx3.util.EventDispatcher", "jsx3.app.Server", "jsx3.net.URI", "jsx3.lang.System"];
        for (var i = 0; i < classes.length; i++)
          jobManager.addJob(new ClassLoader.ClassJob(classes[i]));

        // 3A. load logger configuration
        var logConf = jsx3.getEnv("jsx_logger_config");
        if (logConf == null) logConf = "jsx:/../logger.xml";
        if (logConf) {
          var loggerConfigJob = new ClassLoader.XmlJob("logger.config", logConf);
          jobManager.addJob(loggerConfigJob, "jsx3.xml.Document");
        }

        // 3B. configure logger once configuration file is loaded
        var configLoggerJob = new Job("logger.init", function() {
          var doc = loggerConfigJob ? loggerConfigJob.getXML() : false;
          jsx3.util.Logger.Manager.getManager().initialize(doc);

          // Set these local variables for convenience
          Logger = jsx3.util.Logger;
          LOG = jsx3.util.Logger.getLogger("ClassLoader");
        });
        jobManager.addJob(configLoggerJob, [loggerConfigJob, "jsx3.util.Logger.AlertHandler"]);

        // 4A. jsx3.util.EventDispatcher mixin
        var edMixinJob = new Job("jsx.edmix", function() {
          var targets = [ClassLoader_prototype, Job.prototype, jsx3.util.JobGraph.prototype];
          for (var i = 0; i < targets.length; i++)
            jsx3.util.EventDispatcher.jsxclass.mixin(targets[i]);
          me._jobManager.subscribe("*", me, function(objEvent) { this.publish(objEvent); });
        });
        jobManager.addJob(edMixinJob, "jsx3.util.EventDispatcher");

        // 4B. Determine HTML Mode
        var htmlModeJob = new Job("jsx.html.mode", function() {
          me[ClassLoader.MODE_MAP[jsx3.html.getMode()]] = true;
        });
        jobManager.addJob(htmlModeJob, "jsx3.html.Selection");

        // 5. Request JSX CSS
        var requestCssJob = new Job("jsx.css.request", function() {
          var allJsxCss = [];
          for (var i = 0; i < includes.length; i++) {
            var inc = includes[i];
            if (inc.type == "css" && me._passesBrowser(inc.browser)) {
              var src = ClassLoader._toAbsolute(jsx3.SYSTEM_ROOT + "/" + me.resolvePath(inc.src));
              var job = new ClassLoader.CssJob(inc.id, src);
              allJsxCss.push(job);
              this.graph().addJob(job);
            }
          }

          jobManager.addJob(new Job("jsx.css"), allJsxCss);
          jobManager.addPrereq("jsx", "jsx.css");
        });
        jobManager.addJob(requestCssJob, "jsx.html.mode");

        // 5A. Request system JSS Properties and localized PropBundles
        var requestJssJob = new Job("jsx.jss.request", function() {
          var allJsxJss = [];
          for (var i = 0; i < includes.length; i++) {
            var inc = includes[i];
/*            if (inc.type == "jss") {
              var src = ClassLoader._toAbsolute(jsx3.SYSTEM_ROOT + "/" + me.resolvePath(inc.src));
              var job = new ClassLoader.JssJob(inc.id, src, jsx3.getSystemCache(), inc.id, jsx3.System.JSS);
              allJsxJss[allJsxJss.length] = job._id;
              this.graph().add(job);
            } else */if (inc.type == "ljss" && jsx3.app.PropsBundle) {
              var src = ClassLoader._toAbsolute(jsx3.SYSTEM_ROOT + "/" + me.resolvePath(inc.src));
              var job = new ClassLoader.PBJob(inc.id, src, jsx3.System.LJSS, jsx3.getSystemCache());
              allJsxJss.push(job);
              jobManager.addJob(job);
            }
          }

          jobManager.addJob(new Job("jsx.xml"), allJsxJss);
          jobManager.addPrereq("jsx", "jsx.xml");
        });
        jobManager.addJob(requestJssJob, "jsx3.lang.System");

/* Replaced with resource embedding in 3.7
        // 5B. Request the XSL of any loaded Cacheable class, as it loads
        var checkCacheable = function(objEvent) {
          if (jsx3.xml && jsx3.xml.Cacheable) {
            var objClass = jsx3.Class.forName(objEvent.name);

            if (jsx3.xml.Cacheable.jsxclass.isAssignableFrom(objClass)) {
              var strURL = objClass.getConstructor().DEFAULTXSLURL;
              if (strURL) {
                var job = new ClassLoader.XmlJob(strURL, strURL, jsx3.getSharedCache(), strURL, jsx3.xml.XslDocument.jsxclass);
                jobManager.addJob(job);
                jobManager.addPrereq("jsx.gui.xsl", job);
              }
            }
          }
        };

        this._subscribe("class", this, checkCacheable);

        jobManager.addJob(new Job("jsx.gui.xsldn", function() {
          me._unsubscribe("class", me);
        }), "jsx.js");
*/

        // 6. jsx job for the JSX runtime
        jobManager.addJob(new Job("jsx"), ["jsx.js", "jsx.xsl", requestCssJob, requestJssJob]);
        jobManager.addJob(new Job("jsx.startup", function() { jsx3.startup(); }), "jsx");

        // 7. load each queued app
        for (var i = 0; i < this._apps.length; i++)
          this._loadApp(this._apps[i]);

        // 8. start the threaded queue, after a timeout
        window.setTimeout(function() {
          jobManager.start();
        }, 0);
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._cleanUpApp = function(objApp) {
        for (var i = this._apps.length - 1; i >= 0; i--) {
          if (this._apps[i] == objApp) {
            this._apps.splice(i, 1);
            break;
          }
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._updateAllProgressTo = function(intStage, intTotal) {
        for (var i = 0; i < this._apps.length; i++) {
          var prog = this._apps[i]._progress;
          prog.updateStage(intStage, intTotal);
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._onJsJobFinished = function(objEvent) {
        for (var i = 0; i < this._apps.length; i++)
          this._apps[i]._progress._incrementDone(false);
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._isSupported = function() {
        var browserOverride = jsx3.getEnv("jsx_browsers");

        var allowDeny = (browserOverride && browserOverride.match(new RegExp("\\b" + this._type + "=(\\w*)\\b", "i"))) ?
            RegExp.$1.toLowerCase() : ClassLoader._BROWSERS[this._type][2];

        return this._forcesupported || allowDeny == "allow";
      };

      /** @package */
      ClassLoader_prototype.passesLoad = function(intLoad) {
        return intLoad === true ||
               intLoad == ClassLoader.LOAD_ALWAYS;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._passesBrowser = function(strBrowser) {
        if (strBrowser == null) return true;
        if (this[strBrowser]) return true;
        if (strBrowser.indexOf("!") == 0) return !this[strBrowser.substring(1)];

        var def = ClassLoader._BROWSERS[this._type][1].join("|");
        var regexp = new RegExp("\\b(" + def + ")\\b");
        return regexp.test(strBrowser);
      };

      /**
       * @param objJob {jsx3.util.Job}
       * @param preReq {String... | jsx3.util.Job... | Array<String|jsx3.util.Job>}
       * @package
       */
      ClassLoader_prototype.addJob = function(objJob, preReq) {
        return this._jobManager.addJob.apply(this._jobManager, arguments);
      };

      /**
       * @package
       */
      ClassLoader_prototype.loadResource = function(strSrc, strId, strType, objJob) {
        var job = null;
        if (strType == "script") {
          job = new ClassLoader.JsJob(strId, strSrc);
        } else if (strType == "css") {
          job = new ClassLoader.CssJob(strId, strSrc);
        } else {
          throw new jsx3.IllegalArgumentException("strType", strType);
        }

        this._jobManager.addJob(job);
        if (objJob)
          this._jobManager.addJob(objJob, job);

        return job;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._initClassPath = function() {
        if (this._cp == null)
          /* @jsxobf-clobber */
          this._cp = [[ClassLoader._toAbsolute(jsx3.SYSTEM_SCRIPTS + "/"), /^jsx3\.(gui|util|app|xml|net|html)\.[\w\.]+$/]];
        return this._cp;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._addClassPath = function(strPath, strRegex) {
        var tokens = strRegex.split(".");
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i] == "**")
            tokens[i] = "\\w+(\\.\\w+)*";
          else if (tokens[i] == "*")
            tokens[i] = "\\w+";
        }
        this._initClassPath().push([strPath, new RegExp("^" + tokens.join("\\.") + "$")]);
      };

      /** @package @jsxobf-clobber-shared */
      ClassLoader_prototype._addClassPathOf = function(obj) {
        var settings = obj.getSettings();
        var classPath = settings.get("classpath");
        if (classPath) {
          var paths = classPath.split(",");
          for (var i = 0; i < paths.length; i++) {
            var tokens = paths[i].split(":");
            this._addClassPath(obj.resolveURI(tokens[0]).toString(), tokens[1]);
          }
        }
      };

      /** @private @jsxobf-clobber-shared */
      ClassLoader_prototype._classDidLoad = function(objClass) {
        var strName = objClass.getName();

        this._publish({subject:"class", name:strName});
        this._publish({subject:"class." + strName});
      };

      /** @private @jsxobf-clobber-shared */
      ClassLoader_prototype._packageDidLoad = function(objPackage) {

      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._setStatus = function(strStatus, intExpire) {
        if (intExpire == null) intExpire = 1000;
        var status = getMsgStr("st_pr") + getMsgStr("st_l1") + strStatus + getMsgStr("st_l2");
        window.status = status;

        // clear the previous timeout
        if (jsx3._jsxstatustimeout != null)
          window.clearTimeout(jsx3._jsxstatustimeout);

        /* @jsxobf-clobber */
        jsx3._jsxstatustimeout = window.setTimeout(function() {
          jsx3._jsxstatustimeout = null;
          if (window.status == status)
            window.status = "";
        }, intExpire);
      };

      /**
       * Loads a GI class synchronously. The location of the JavaScript file is determined by the classpath.
       *
       * @param strClass {String} the fully-qualified name of the class to load.
       * @throws {jsx3.Exception} if no registered classpath matched the class name or if the loaded JS file did not
       *    define the class to load.
       * @since 3.5
       */
      ClassLoader_prototype.loadClass = function(strClass) {
        this._setStatus(strClass);

        var p = this._getPathsForClass(strClass);
        for (var i = 0; i < p.length; i++) {
          var success = false;
          try {
            success = this.loadJSFileSync(p[i]);
          } catch (e) {
            var ex = jsx3.NativeError.wrap(e);
            throw new jsx3.Exception(jsx3._msg("boot.class_ex", strClass, ex), ex);
          }

          if (success) {
            var objClass = jsx3.Class.forName(strClass);
            if (objClass == null)
              throw new jsx3.Exception(jsx3._msg("boot.class_undef", p[i], strClass));

            return objClass;
          }
        }

        throw new jsx3.Exception(jsx3._msg("boot.class_err", strClass));
      };


      /**
       * Loads a GI class asynchronously. The location of the JavaScript file is determined by the classpath.
       *
       * @param strClass {String} the fully-qualified name of the class to load.
       * @param cb {Function} an optional callback function, which will be passed the class object when the class loads.
       * @since 3.9
       */
      ClassLoader_prototype.loadClassAsync = function(strClass, cb) {
        this._setStatus(strClass);

        var p = this._getPathsForClass(strClass);
        if (p.length > 0) {
          this.loadJSFile(p[0], function() {
            var objClass = jsx3.Class.forName(strClass);
            if (objClass == null) {
              if (LOG)
                LOG.error(jsx3._msg("boot.class_undef", p[0], strClass));
            } else {
              cb(objClass);
            }
          });
        } else {
          throw new jsx3.Exception(jsx3._msg("boot.class_err", strClass));
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._getPathsForClass = function(strClass) {
        this._initClassPath();
        var path = strClass.replace(/\./g, "/") + ".js";
        var paths = [];

        for (var i = 0; i < this._cp.length; i++) {
          var regex = this._cp[i][1];

          if (regex.test(strClass))
            paths.push(this._cp[i][0] + path);
        }

        return paths;
      };

      /**
       * Loads a JavaScript file synchronously.
       *
       * @param strURI {String}
       * @return {boolean} <code>true</code> if the file was loaded successfully.
       * @throws {Object} if evaluating the text content of the loaded file raises a JavaScript error.
       * @since 3.5
       */
      ClassLoader_prototype.loadJSFileSync = function(strURI) {
        var Request = jsx3.net.Request;

        var req = Request.open("GET", strURI, false);
        req.send();

        if (req.getStatus() == Request.STATUS_OK) {
/* @JSC :: begin BENCH */
          var t1 = new jsx3.util.Timer("jsx3.lang.ClassLoader", strURI);
/* @JSC :: end */

          var script = req.getResponseText();
          jsx3.eval(script);

/* @JSC :: begin BENCH */
          t1.log("js.eval");
/* @JSC :: end */

          return true;
        }

        return false;
      };

      /**
       * Loads a JavaScript file asynchronously.
       *
       * @param strURI {String}
       * @param cb {Function} an optional callback function, which will be passed the script URI when the script loads.
       * @since 3.9
       */
      ClassLoader_prototype.loadJSFile = function(strURI, cb) {
/* @JSC :: begin BENCH */
        if (jsx3.util.Timer)
          var t1 = new jsx3.util.Timer("jsx3.lang.ClassLoader", strURI);
/* @JSC :: end */

        // instance a new DOM element
        var element = document.createElement("script");
        element.setAttribute("src", "" + strURI);
        element.setAttribute("type", 'text/javascript');

        // set up onload handler
        if (jsx3.CLASS_LOADER.IE && (!document.documentMode || document.documentMode <=10)) {
          element.onreadystatechange = function() {
            var state = this.readyState;
            if (state == "loaded" || state == "interactive" || state == "complete") {
/* @JSC :: begin BENCH */
              if (t1) t1.log("js.load");
/* @JSC :: end */

              element.onreadystatechange = null;
              if (cb) cb(strURI);
            }
          };
        } else {
          var evtHandler = function() {
/* @JSC :: begin BENCH */
            if (t1) t1.log("js.load");
/* @JSC :: end */

            element.removeEventListener("load", evtHandler, false);
            if (cb) cb(strURI);
          };

          element.addEventListener("load", evtHandler, false);
        }
        
        // bind the element to the browser DOM to begin loading the resource
        document.getElementsByTagName("head")[0].appendChild(element);
      };

      /**
       * @package
       */
      ClassLoader_prototype.resolvePath = function(strPath) {
        return strPath.replace(/@path@/g, ClassLoader._BROWSERS[this._type][0]);
      };

      /**
       * takes any string (assumed to be a valid URL) and prepends that string with the appropriate path information. This function
       *          is used by the JSX framework to resolve file locations at runtime, and is always used by system methods that need to resolve
       *          the location of a resource.  For example, if the application is located at "/system/JSXAPPS/app1/" and a resource is requested
       *          at "JSXAPPS/app1/components/appCanval.xml", this method would return "/system/JSXAPPS/app1/components/appCanval.xml"
       * @param strURL {String} URL (any relative URL, http, or https);
       * @return {String} will return the URL, formatted with any necessary path information prepended to locate the resource at runtime
       * @private
       * @jsxobf-clobber
       */
      ClassLoader._toAbsolute = function(strURL) {
        var s = null;
        //given portal implementations, any string instance that represents a URI can call this method to add a prepend of the absolute path
        if (strURL.charAt(0) == "/" || strURL.match(/^\w+:\/\//)) {
          s = strURL.toString();
        } else if (strURL.substring(0, 4) == "JSX/") {
          s = jsx3.getEnv("jsxabspath") + strURL;
        } else {
          s = jsx3.getEnv("jsxhomepath") + strURL;
        }

        return s;
      };

      // @jsxobf-clobber  _settings _path _gui _loaded _ns _progress _queue _type _done _running _tick _ticktime
      // @jsxobf-clobber  _src _id _pre _status _type _painted _env _classloader _stage _total

      ClassLoader._SERIAL = 0;

      /**
       * @param strAppPath {String}
       * @param objGUI {HTMLElement}
       * @param objEnv {Object<String,String>}
       * @return {jsx3.util.Job}
       * @since 3.6
       */
      ClassLoader_prototype.loadApp = function(strAppPath, objGUI, objEnv) {
//        jsx3._logIt("loadApp " + strAppPath);
        // Decode URI encoding of app path
        strAppPath = strAppPath.replace(/%([0-9a-fA-F]{2})/g,
            function(m, g1) { return String.fromCharCode(parseInt(g1, 16)); });

        // Remove trailing / from app path
        if (strAppPath.charAt(strAppPath.length - 1) == "/")
          strAppPath = strAppPath.substring(0, strAppPath.length - 1);

        // Set env variables for the home path, etc.
        var appDirIndex = strAppPath.indexOf(jsx3.APP_DIR_NAME + "/");
        var appPrefix = appDirIndex >= 0 ? strAppPath.substring(0, appDirIndex) : "";

        if (! jsx3.getEnv("jsxmanualhome"))
          jsx3.setEnv("jsxhomepath", appPrefix);    // when Builder is running, we wait to set this to the user home dir
        jsx3.setEnv("jsxscriptapppath", appPrefix); // this is always the path to the main project, including Builder

        var app = {_path:strAppPath, _gui:objGUI, _loaded:false, _env: objEnv, _serial:ClassLoader._SERIAL++};

        if (objGUI) {
          var intType = objEnv["jsxapploader"] != null ? objEnv["jsxapploader"] : this._apps.length > 0 ? 1 : 0;
          var progress = app._progress = new ClassLoader.Progress(this, intType, objGUI);

          if (this._isSupported()) {
            window.setTimeout(function(){ progress.paintProgress();}, 0);
          } else {
            window.setTimeout(function(){ progress.paintNotSupported();}, 0);
          }
        }

        this._apps.push(app);

        if (this._jobManager)
          return this._loadApp(app);
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._loadApp = function(objApp) {
//        jsx3._logIt("_loadApp " + objApp._path);
        var strAppPath = objApp._path;
        var jobPrefix = "app." + objApp._serial;
        var jobManager = this._jobManager;

        var configJob = new ClassLoader.XmlJob(jobPrefix + ".config", strAppPath + "/" + jsx3.CONFIG_FILE);

        var me = this;
        var loadJob = new Job(jobPrefix + ".queue", function() {
          me._onAppConfigLoaded(configJob.getXML(), objApp);
        });

        jobManager.addJob(configJob, "jsx3.xml.Document");
        jobManager.addJob(loadJob, ["jsx3.app.Server", "logger.init", configJob]);

        var appJob = new Job(jobPrefix);
        jobManager.addJob(appJob, loadJob);
        return appJob;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._onAppConfigLoaded = function(objXML, objApp) {
        var jobMgr = this._jobManager;
        var server = null;
        jobMgr.pause();

        if (objXML.hasError()) {
          LOG.fatal(":" + jsx3.getEnv("jsxhomepath") + ": :" + jsx3.resolveURI(objXML.getSourceURL()) + ": " + jsx3._msg("boot.app_cfgerr", objXML.getSourceURL(), objXML.getError()));
        }

        var settings = objApp._settings = new jsx3.app.Settings(objXML);
        objApp._env.jsxsettings = settings;

        try {
          server = objApp._server = new jsx3.app.Server(objApp._path, objApp._gui, false, objApp._env);
          delete objApp._gui;
        } catch (e) {
          var ex = jsx3.NativeError.wrap(e);
          LOG.fatal(jsx3._msg("boot.app_insterr", objApp._path, ex), ex);
          return;
        }

        var prog = objApp._progress;
        var jobPrefix = "app." + objApp._serial;

        // 0.
        this._addClassPathOf(server);

        // 1. Queue all required addins
        var jsPrereqs = ["jsx.js", "logger.init", "jsx.xml"];
        var arrAddins = settings.get("addins");
        if (arrAddins) {
          for (var j = 0; j < arrAddins.length; j++) {
            var addinKey = arrAddins[j];
            var addinJob = this._loadAddin(addinKey);
            jsPrereqs.push(addinJob);
          }
        }

        var progJob = new Job(jobPrefix + ".prog");
        jobMgr.addJob(progJob, jsPrereqs);

        var includes = settings.get("includes");

        if (includes) {
          var jsCount = 0;
          var cssIds = [], xmlIds = [], lastJsJob = progJob;

          for (var i = 0; i < includes.length; i++) {
            var inc = includes[i];

            if (this.passesLoad(inc.onLoad || inc.load) &&
                this._passesBrowser(inc.browser)) {

              var src = server.resolveURI(inc.src);
              var rsrcJobId = jobPrefix + "." + i + "." + (inc.id || inc.src);

              if (inc.type == "css") {
                // 2. Load App CSS
                var job = new ClassLoader.CssJob(rsrcJobId, src);
                jobMgr.addJob(job);
                cssIds.push(job);
              } else if (inc.type == "script") {
                // 3. Load App JS
                var job = new ClassLoader.JsJob(rsrcJobId, src);
                job._subscribe(Job.FINISH, prog, "_incrementDone");

                jobMgr.addJob(job, lastJsJob);
                lastJsJob = job;
                jsCount++;
              } else if (inc.type == "xml" || inc.type == "xsl") {
                var job = new ClassLoader.XmlJob(rsrcJobId, src, server.getCache(), (inc.id || inc.src));
                jobMgr.addJob(job);
                xmlIds.push(job);
              } else if (inc.type == "jss") {
                var job = new ClassLoader.JssJob(rsrcJobId, src, server.getCache(), (inc.id || inc.src), server.getProperties());
                jobMgr.addJob(job);
                xmlIds.push(job);
              } else if (inc.type == "ljss") {
                var job = new ClassLoader.PBJob(rsrcJobId, src, server.LJSS, server.getCache(), server.getLocale());
                jobMgr.addJob(job);
                xmlIds.push(job);
              }
            }
          }

          progJob.run = function() {
            prog.updateStage(3, jsCount);
          };

          if (cssIds.length > 0)
            jobMgr.addJob(new Job(jobPrefix + ".css"), cssIds);

          if (xmlIds.length > 0)
            jobMgr.addJob(new Job(jobPrefix + ".xml"), xmlIds);

          if (lastJsJob)
            jobMgr.addJob(new Job(jobPrefix + ".js"), lastJsJob);
        }
        var allPreReqs = ["jsx", jobPrefix + ".css", jobPrefix + ".xml", jobPrefix + ".js"];

        // 4. Load App Component
        var compURL = settings.get("objectseturl");
        var componentJob = null;
        if (compURL) {
          componentJob = new ClassLoader.XmlJob(jobPrefix + ".comp", objApp._server.resolveURI(compURL));
          jobMgr.addJob(componentJob);
        }

        var progJob2 = new Job(jobPrefix + ".prog1", function() {
          prog.updateStage(4, 1);
          return Job.SLEEP;
        });
        jobMgr.addJob(progJob2, allPreReqs);

        var me = this;
        jobMgr.addJob(new Job(jobPrefix + ".progx", function() {
          prog._destroy();
          me._cleanUpApp(objApp);
        }), progJob2);

        // 5. Paint
        if (!objApp._server.getEnv("manualpaint")) {
          var paintJob = new Job(jobPrefix + ".paint");
          if (componentJob != null) {
            paintJob.run = function() {
//            jsx3._logIt("Painting " + objApp._server);
              objApp._server.paint(componentJob.getXML());
            };
            jobMgr.addJob(paintJob, [componentJob, progJob2]);
          } else {
            paintJob.run = function() {
              objApp._server.paint();
            };
            jobMgr.addJob(paintJob, progJob2);
          }
        }

        for (var i = 0; i < allPreReqs.length; i++)
          jobMgr.addPrereq(jobPrefix, allPreReqs[i]);

        jobMgr.start();
      };

      /** @private @jsxobf-clobber */
       ClassLoader_prototype._forceStartQueue = function() {
        if (! this._forcesupported) {
          /* @jsxobf-clobber */
          this._forcesupported = true;

          for (var i = 0; i < this._apps.length; i++)
            this._apps[i]._progress.paintProgress();

          this._start();
        }
      };

      /**
       * @param objAddin {String|jsx3.app.AddIn}
       * @return {jsx3.util.Job}
       * @since 3.6
       */
      ClassLoader_prototype.loadAddin = function(objAddin) {
        var strKey;
        if (typeof(objAddin) == "string") {
          strKey = objAddin;
          objAddin = null;
        } else {
          strKey = objAddin.getKey();
        }
        return this._loadAddin(strKey, objAddin);
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._loadAddin = function(strKey, objAddin) {
        var jobPrefix = "addin." + strKey;

        if (this._addins[strKey]) {
          return this._jobManager.node(jobPrefix);
        } else {
          this._addins[strKey] = {};

          if (! objAddin)
            objAddin = new jsx3.app.AddIn(strKey);

          var xmlPath = objAddin.getPath();
          var configJob = new ClassLoader.XmlJob(jobPrefix + ".config", xmlPath + (xmlPath.search(/\/$/) == -1 ? "/" : "") + jsx3.CONFIG_FILE);

          var me = this;
          var configLoadJob = new Job(jobPrefix + ".load", function() {
            me._onAddinConfigLoaded(configJob.getXML(), strKey, objAddin);
          });

          this._jobManager.addJob(configJob, "jsx3.xml.Document");
          this._jobManager.addJob(configLoadJob, [configJob, "jsx3.lang.System"]);

          return this._createAddinJobs(strKey, configLoadJob);
        }
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._createAddinJobs = function(strKey, strJobId) {
        var jobPrefix = "addin." + strKey;
        var jm = this._jobManager;

        var jsJob = new Job(jobPrefix + ".js"),
            cssJob = new Job(jobPrefix + ".css"),
            jssJob = new Job(jobPrefix + ".jss"),
            addinJob = new Job(jobPrefix);

        jm.addJob(jsJob, strJobId);
        jm.addJob(cssJob, strJobId);
        jm.addJob(jssJob, strJobId);
        jm.addJob(addinJob, [jsJob, cssJob, jssJob]);

        return addinJob;
      };

      /** @private @jsxobf-clobber */
      ClassLoader_prototype._onAddinConfigLoaded = function(objXML, strKey, objAddin) {
        var addin = null, settings = null;

        if (objXML.hasError()) {
          LOG.fatal(jsx3._msg("boot.add_cfgerr", objXML.getSourceURL(), objXML.getError()));
          return;
        }

        settings = new jsx3.app.Settings(objXML);
        addin = this._addins[strKey]._addin = objAddin;
        addin.setSettings(settings);

        var jobPrefix = "addin." + strKey;
        var jobManager = this._jobManager;

        var addinVarPath = settings.get("addin");
        if (addinVarPath)
          jsx3.System.registerAddin(addinVarPath, addin);
        this._addClassPathOf(addin);

        jobManager.pause();

        var addinIncludes = settings.get('includes');
        if (addinIncludes != null) {
          var lastJsJob = ["jsx.js", "logger.init", "jsx.xml"];

          for (var i = 0; i < addinIncludes.length; i++) {
            var include = addinIncludes[i];
            var rsrcJobId = jobPrefix + "." + i + "." + (include.id || include.src);

            if (this.passesLoad(include.onLoad || include.load) && this._passesBrowser(include.browser)) {
              var src = addin.resolveURI(include.src).toString();

              if (include.type == 'script') {
                var job = new ClassLoader.JsJob(rsrcJobId, src);
                jobManager.addJob(job, lastJsJob);
                job._subscribe(Job.FINISH, this, "_onJsJobFinished");
                lastJsJob = job;
              } else if (include.type == 'css') {
                var job = new ClassLoader.CssJob(rsrcJobId, src);
                jobManager.addJob(job);
                jobManager.addPrereq(jobPrefix + ".css", job);
              } else if (include.type == 'jss') {
                var job = new ClassLoader.JssJob(rsrcJobId,  src, jsx3.getSystemCache(), (include.id || src), jsx3.System.JSS);
                jobManager.addJob(job);
                jobManager.addPrereq(jobPrefix + ".jss", job);
              } else if (include.type == "ljss") {
                var job = new ClassLoader.PBJob(rsrcJobId, src, jsx3.System.LJSS, jsx3.getSystemCache(), jsx3.System.getLocale());
                jobManager.addJob(job);
                jobManager.addPrereq(jobPrefix + ".jss", job);
              }
            }
          }

          if (lastJsJob instanceof Array)
            for (var i = 0; i < lastJsJob.length; i++)
              jobManager.addPrereq(jobPrefix + ".js", lastJsJob[i]);
          else
            jobManager.addPrereq(jobPrefix + ".js", lastJsJob);
        }

        jobManager.start();
      };

      ClassLoader_prototype.toString = function() {
        return this.getType() + " " + this.getVersion() + " (" + ClassLoader._BROWSERS[this._type][1] + ")";
      };

    });

    var ClassLoader = jsx3.lang.ClassLoader;
    var Job = jsx3.util.Job;

    // @jsxobf-clobber  _src _doc _cache _cacheid _props _class _locale

    /**
     * JavaScript job.
     *
     * @private
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader.JsJob", jsx3.util.Job, null, function(){});
     */
    defClass(ClassLoader, "JsJob", Job, function(JsJob, JsJob_prototype) {

      /* Indexes all JS jobs by their src. */
      /** @private @jsxobf-clobber */
      JsJob._ALL = {};

      JsJob_prototype.init = function(strId, strSrc) {
        JsJob._super.call(this, "init", [strId]);
        /* @jsxobf-clobber */
        this._src = strSrc;
      };

      JsJob_prototype.run = function() {
        var dupStatus = this._checkDuplicate(JsJob._ALL[this._src]);
        if (dupStatus) return dupStatus;
        JsJob._ALL[this._src] = this;

        jsx3.CLASS_LOADER._setStatus(this._src);

        var me = this;
        jsx3.CLASS_LOADER.loadJSFile(this._src, function() {
          me.finish();
        });

        return Job.WAIT;
      };

    });

    /**
     * CSS job.
     *
     * @private
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader.CssJob", jsx3.util.Job, null, function(){});
     */
    defClass(ClassLoader, "CssJob", Job, function(CssJob, CssJob_prototype) {

      /** @private @jsxobf-clobber */
      CssJob._ALL = {};

      CssJob_prototype.init = function(strId, strSrc) {
        CssJob._super.call(this, "init", [strId || strSrc]);
        /* @jsxobf-clobber */
        this._src = strSrc;
      };

      CssJob_prototype.run = function() {
        var dupStatus = this._checkDuplicate(CssJob._ALL[this._src]);
        if (dupStatus) return dupStatus;
        CssJob._ALL[this._src] = this;

        // instance a new DOM element
        var element = document.createElement("link");
        element.id = this._id;
        element.href = "" + this._src;
        element.rel = "stylesheet";
        element.type = "text/css";

        jsx3.CLASS_LOADER._setStatus(this._src);

        //bind the element to the browser DOM to begin loading the resource
        document.getElementsByTagName("head")[0].appendChild(element);

        return Job.DONE;
      };
    });

    /**
     * XML job.
     *
     * @private
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader.XmlJob", jsx3.util.Job, null, function(){});
     */
    defClass(ClassLoader, "XmlJob", Job, function(XmlJob, XmlJob_prototype) {

      XmlJob_prototype.init = function(strId, strSrc, objCache, strCacheId, objClass) {
        XmlJob._super.call(this, "init", [strId || strSrc]);
        this._src = strSrc;
        /* @jsxobf-clobber */
        this._cache = objCache;
        /* @jsxobf-clobber */
        this._cacheid = strCacheId || this._id;
        /* @jsxobf-clobber */
        this._class = objClass;
      };

      XmlJob_prototype.run = function() {
        this._load();
        return Job.WAIT;
      };

      XmlJob_prototype.getXML = function() {
        return this._doc;
      };

      /** @private @jsxobf-clobber */
      XmlJob_prototype._load = function() {
        var d = this._doc = (this._class || jsx3.xml.Document.jsxclass).newInstance();
        d.setAsync(true);
        d.subscribe("*", this, "_finish");

        jsx3.CLASS_LOADER._setStatus(this._src);
        d.load(this._src);
      };

      /** @private @jsxobf-clobber */
      XmlJob_prototype._finish = function() {
        if (this._cache)
          this._cache.setDocument(this._cacheid, this._doc);
        this.finish();
      };

    });

    /**
     * JSS job.
     *
     * @private
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader.JssJob", jsx3.lang.ClassLoader.XmlJob, null, function(){});
     */
    defClass(ClassLoader, "JssJob", ClassLoader.XmlJob, function(JssJob, JssJob_prototype) {

      JssJob_prototype.init = function(strId, strSrc, objCache, strCacheId, objProps) {
        JssJob._super.call(this, "init", [strId, strSrc, objCache, strCacheId]);
        /* @jsxobf-clobber */
        this._props = objProps;
      };

      JssJob_prototype.run = function() {
        if (this._cache) {
          var doc = this._cache.getDocument(this._cacheid);

          if (doc) {
            this._props.loadXML(doc, this._cacheid);
            return Job.DONE;
          }
        }

        this._load();
        return Job.WAIT;
      };

      JssJob_prototype._finish = function(objEvent) {
        var doc = objEvent.target;

        if (this._cache)
          this._cache.setDocument(this._cacheid, doc);

        if (! doc.hasError()) {
          this._props.loadXML(doc, this._cacheid);
        } else {
//          jsx3._logIt("Error loading JSS properties file " + this._src + ": " + doc.getError());
        }

        this.finish();
      };

    });

    /**
     * Properties bundle job.
     *
     * @private
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader.PBJob", jsx3.lang.ClassLoader.XmlJob, null, function(){});
     */
    defClass(ClassLoader, "PBJob", Job, function(PBJob, PBJob_prototype) {

      PBJob_prototype.init = function(strId, strSrc, objProps, objCache, objLocale) {
        PBJob._super.call(this, "init", [strId]);
        /* @jsxobf-clobber */
        this._src = strSrc;
        /* @jsxobf-clobber */
        this._props = objProps;
        /* @jsxobf-clobber */
        this._cache = objCache;
        /* @jsxobf-clobber */
        this._locale = objLocale;
      };

      PBJob_prototype.run = function() {
        var me = this;
        jsx3.app.PropsBundle.getPropsAsync(this._src, this._locale, function(props) {
          me._propsbundle = props;
          me._props.addParent(props);
          me.finish();
        }, this._cache);

        return Job.WAIT;
      };

      PBJob_prototype.getProps = function() {
        return this._propsbundle;
      };

    });

    /**
     * Class job.
     *
     * @private
     * @jsxdoc-definition  jsx3.Class.defineClass("jsx3.lang.ClassLoader.ClassJob", jsx3.util.Job, null, function(){});
     */
    defClass(ClassLoader, "ClassJob", Job, function(ClassJob, ClassJob_prototype) {

      ClassJob_prototype.init = function(strClass) {
        ClassJob._super.call(this, "init", [strClass]);
      };

      ClassJob_prototype.run = function() {
        if (jsx3.lang.Class && jsx3.lang.Class.forName(this._id))
          return Job.DONE;

        jsx3.CLASS_LOADER._subscribe("class." + this._id, this, "_onClass");
        return Job.WAIT;
      };

      /** @private @jsxobf-clobber */
      ClassJob_prototype._onClass = function(objEvent) {
        jsx3.CLASS_LOADER._unsubscribe("class." + this._id, this);
        this.finish();
      };

    });


    // @jsxobf-clobber  Progress
    defClass(ClassLoader, "Progress", null, function(Progress, Progress_prototype) {

      /** @private @jsxobf-clobber */
      Progress.STAGE_NAMES = [getMsgStr("s_ini"), getMsgStr("s_sys"), getMsgStr("s_add"),
          getMsgStr("s_app"), getMsgStr("s_pnt")];

      /** @private @jsxobf-clobber */
      Progress.STAGE_WEIGHTS = [[0.0,0.10,0.60,0.80,0.97,1.00,1.00], [0,0,0,0,0.95,1.00]];

      /** @private @jsxobf-clobber */
      Progress.WAITING = getMsgStr("s_wat");
      /** @private @jsxobf-clobber */
      Progress.WAITING_SUFFIX = ["&#160;.","&#160;&#160;.","&#160;&#160;&#160;."];

      /** @private @jsxobf-clobber @jsxobf-final */
      Progress.TYPE_NORMAL = 0;
      /** @private @jsxobf-clobber @jsxobf-final */
      Progress.TYPE_PORTAL = 1;

      /** @private @jsxobf-clobber */
      Progress.isStrict = function(objProgress) {
        if (Progress.STRICT == null) {
          /* @jsxobf-clobber */
          Progress.STRICT = ! objProgress._classloader.IE;
          if (! Progress.STRICT) {
            try {
              var test = '<input type="text" id="_jsx3_progress_test" style="position:absolute;top:0px;left:-120px;width:100px;height:30px;padding:8px;margin:0px;"/>';
              objProgress._gui.insertAdjacentHTML("beforeEnd", test);
              var input = objProgress._gui.ownerDocument.getElementById("_jsx3_progress_test");
              Progress.STRICT = input.offsetHeight != 30;
              input.parentNode.removeChild(input);
            } catch (e) {
              window.alert(e.description);
            }
          }
        }
        return Progress.STRICT;
      };

      Progress_prototype.init = function(objClassLoader, intType, objGUI) {
        this._classloader = objClassLoader;

        this._type = intType;
        this._gui = objGUI;
        this._stage = 0;
        this._done = 0;
        this._total = 1;
      };

      /** @private @jsxobf-clobber */
      Progress_prototype.paintProgress = function() {
        var w = this._gui.offsetWidth;
        var h = this._gui.offsetHeight;
        var strict = Progress.isStrict(this);

        this._painted = true;

        var html, bgcolor;
        if (this._type == Progress.TYPE_NORMAL) {
          var width = 222 - (strict ? 4 : 0);
          var height = 62 - (strict ? 4 : 0);
          var barHeight = 17 - (strict ? 2 : 0);
          var insideBarHeight = barHeight - (strict ? 0 : 1);
          var top = Math.max(0, Math.round((h - height)/3));
          var left = Math.max(0, Math.round((w - width)/2));

          html = '<div style="position:absolute;top:'+top+'px;left:'+left+'px;font-family:Arial,sans-serif;width:'+width+'px;'+
                  'border:1px solid #666677;padding:2px;background-color:#BBBBCC;">'+
              '<div style="height:'+height+'px;border:1px solid #8899AA;padding:0px;background-color:#EEEEEE;">'+
                '<div style="padding: 4px;">'+
                  '<div style="font-size:10px;">' + getMsgStr("b_pow") + '</div>'+
                  '<div style="font-size:16px;"><span style="font-weight:bold;">General&#160;Interface</span></div>'+
                '</div>'+
                '<div style="position:absolute;top:'+(height-barHeight+(strict?2:1))+'px;height:'+barHeight+'px;width:'+(width-(strict?2:8))+'px;background-color:#DDE0EE;border-top:1px solid #8899AA;">'+
                  '<div style="height:'+insideBarHeight+'px;position:absolute;background-color:#BBCCEE;width:0px;overflow:hidden;">&#160;</div>'+
                  '<div style="height:'+insideBarHeight+'px;font-family:Verdana,sans-serif;position:absolute;font-size:10px;color:#000033;padding:1px 4px 2px 4px;">'+Progress.STAGE_NAMES[0]+'</div>'+
                '</div>'+
              '</div>'+
            '</div>';

          bgcolor = "#9898a5";
        } else {
          var width = 165 - (strict ? 4 : 0);
          var height = 52 - (strict ? 4 : 0);
          var barHeight = 16 - (strict ? 2 : 0);
          var insideBarHeight = barHeight - (strict ? 0 : 2);
          var top = Math.max(0, Math.round((h - height)/3));
          var left = Math.max(0, Math.round((w - width)/2));

          html = '<div><div style="position:absolute;top:'+top+'px;left:'+left+'px;font-family:Arial,sans-serif;width:'+width+'px;height:'+height+'px;padding:0px;">'+
              '<div style="padding: 6px;">'+
                '<div style="font-size:9px;">' + getMsgStr("b_pow") + '</div>'+
                '<div style="font-size:12px;"><span style="font-weight:bold;">General&#160;Interface</span></div>'+
              '</div>'+
              '<div style="position:absolute;top:'+(height-barHeight+(strict?2:1))+'px;height:'+barHeight+'px;width:'+(width-(strict?2:0))+'px;background-color:#EEF5FF;border:1px solid #88AACC;">'+
                '<div style="height:'+insideBarHeight+'px;position:absolute;background-color:#BBDDFF;width:0px;overflow:hidden;">&#160;</div>'+
                '<div style="height:'+insideBarHeight+'px;text-align:center;font-family:Verdana,sans-serif;z-index:1;position:absolute;font-size:9px;color:#556677;padding:1px 4px 2px 4px;">&#160;</div>'+
              '</div>'+
            '</div></div>';

          bgcolor = "#FFFFFF";
        }

        this._gui.innerHTML = html;
        this._gui.style.backgroundColor = bgcolor;
      };

      /** @private @jsxobf-clobber */
      Progress_prototype.paintNotSupported = function() {
        var w = this._gui.offsetWidth;
        var h = this._gui.offsetHeight;
        var strict = Progress.isStrict(this);

        this._painted = true;

        var width = 232 - (strict ? 4 : 0);
        var height = 156 - (strict ? 4 : 0);
        var barHeight = 17 - (strict ? 2 : 0);
        var insideBarHeight = barHeight - (strict ? 0 : 1);
        var top = Math.max(0, Math.round((h - height)/3));
        var left = Math.max(0, Math.round((w - width)/2));

        var _forceStartQueue = "_forceStartQueue";
        this._gui.innerHTML =
          '<div style="position:absolute;top:'+top+'px;left:'+left+'px;font-family:Arial,sans-serif;width:'+width+'px;'+
              'border:1px solid #666677;padding:2px;background-color:#BBBBCC;">'+
            '<div style="height:'+height+'px;border:1px solid #8899AA;padding:0px;background-color:#EEEEEE;">'+
              '<div style="padding: 4px;">'+
                '<div style="font-size:10px;">' + getMsgStr("b_pow") + '</div>'+
                '<div style="font-size:16px;"><span style="font-weight:bold;">General&#160;Interface</span></div>'+
                '<div style="padding:6px 0px 0px 0px;font-size:10px;font-family:Verdana,sans-serif;">' + getMsgStr("nosup") +
                   '<div style="color:#000033;padding:8px 0px 0px 0px;margin:0px 0px 0px -2px;">'+
                     '<span style="font-size:8px;">&gt; </span><a style="color:#000033;" href="http://www.generalinterface.org/alias/sysreqs/@build.gi.version@" target="_blank">' + getMsgStr("b_req") + '</a>'+
                     '<div style="padding:2px 0px 0px 0px;"><span style="font-size:8px;">&gt; </span><span id="jsxforcestart_span" tabindex="1" style="cursor:pointer;text-decoration:underline;" ' +
                       'onclick="jsx3.CLASS_LOADER.'+_forceStartQueue+'();" onkeydown="if (event.keyCode == 13) this.onclick();">' + getMsgStr("contd") + '</span></div>'+
                   '</div>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>';

        this._gui.style.backgroundColor = "#9898a5";

        window.setTimeout(function() { document.getElementById("jsxforcestart_span").focus(); }, 0);
      };

      Progress_prototype.updateStage = function(intStage, intTotal) {
//        jsx3._logIt("updateStage stage:" + intStage + " total:" + intTotal);

        this._stage = intStage;
        this._total = intTotal;
        this._done = 0;
        this.updateProgress(true);
      };

      /** @private @jsxobf-clobber */
      Progress_prototype._incrementDone = function() {
        this._done++;
//        jsx3._logIt("_incrementDone:" + this._done + "/" + this._total);
        this.updateProgress(false);

        if (this._classloader.IE && (this._done == 0 || (this._done % 20) == 0 || this._total < 5 || this._done == this._total)) {
          var jobManager = this._classloader._jobManager;

          if (jobManager._running) {
//            jsx3._logIt("Pausing class loader");
            jobManager.pause();
            window.setTimeout(function() { jobManager.start(); }, 0);
          }
        }
      };

      /** @private @jsxobf-clobber */
      Progress_prototype.updateProgress = function(bLabel) {
        if (! this._painted) return;

        var weights = Progress.STAGE_WEIGHTS[this._type];

        var ratio = this._total == 0 ? 1 : Math.max(0, Math.min(1, (this._done/this._total)));
        var percent = weights[this._stage] + (weights[this._stage+1] - weights[this._stage]) * ratio;
        percent = Math.min(percent, 1);

//        jsx3._logIt("total:" + this._total + ", done:" + this._done + " ratio:" + ratio + " percent:" + percent);

        try {
          if (bLabel && this._type == Progress.TYPE_NORMAL)
            this._setMessage(Progress.STAGE_NAMES[this._stage]);

          var bar = this._gui.childNodes[0].childNodes[0].childNodes[1].childNodes[0];
          var pixels = Math.round(bar.parentNode.offsetWidth*percent);

          if (this._type == Progress.TYPE_PORTAL) {
            if (pixels > 0) {
              this._setMessage(Progress.STAGE_NAMES[4]);
            } else {
              if (this._tick == null) {
                this._tick = 0;
                this._setMessage(Progress.WAITING + Progress.WAITING_SUFFIX[0]);
                this._ticktime = (new Date()).getTime();
              } else {
                var now = (new Date()).getTime();
                if (now - this._ticktime > 500) {
                  this._tick++;
                  this._setMessage(Progress.WAITING + Progress.WAITING_SUFFIX[this._tick % Progress.WAITING_SUFFIX.length]);
                  this._ticktime = now;
                }
              }
            }
          }

          bar.style.width = pixels + "px";
        } catch (e) { /*jsx3._logIt(e)*/; }
      };

      /** @private @jsxobf-clobber */
      Progress_prototype._setMessage = function(strMessage) {
        try {
          this._gui.childNodes[0].childNodes[0].childNodes[1].childNodes[1].innerHTML = strMessage;
        } catch (e) {;}
      };

      /** @private @jsxobf-clobber */
      Progress_prototype._destroy = function(objEvent) {
        delete this._gui;
      };
    });

    /** @jsxdoc-category  jsx3 */

    /**
     * {jsx3.lang.ClassLoader} the system class loader.
     */
    jsx3.CLASS_LOADER = new ClassLoader(new BrowserDetect());

  }

  var getUrlParameters = function(strURL) {
    var p = {};
    var queryIndex = strURL.indexOf("?");
    if (queryIndex >= 0) {
      strURL = strURL.substring(queryIndex + 1);
      var tokens = strURL.split("&");
      for (var i = 0; i < tokens.length; i++) {
        var equalsIndex = tokens[i].indexOf("=");
        if (equalsIndex >= 0) {
          p[tokens[i].substring(0, equalsIndex)] = tokens[i].substring(equalsIndex + 1);
        } else {
          p[tokens[i]] = true;
        }
      }
    }
    return p;
  };

  /* The attributes of the <script> tag that HTML reserves. */
  var scriptAttributes = {id:1, space:1, type:1, charset:1, defer:1, src:1, language:1, onload:1};

  var loadScript = function(objScript) {
//    jsx3._logIt("found script: " + objScript.src);

    var params = getUrlParameters(objScript.src);
    var attrs = objScript.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var key = attrs[i].nodeName.toLowerCase(); // lower case so that comparison below on "jsx" is correct
      if (!scriptAttributes[key])
        params[key] = attrs[i].nodeValue;
    }

    for (var f in params) {
      if (f.indexOf("jsx") == 0 && f.indexOf("jsxapp") != 0) {
        jsx3.setEnv(f, params[f]);
        delete params[f];
      }
    }

    var src = objScript.getAttribute("src");
    var abspath = src.substring(0, src.indexOf(jsx3.MAIN_SCRIPT));
    abspath = abspath.replace(/\/\.\//g, "/").replace(/^\.\//, "");
    jsx3.setEnv("jsxabspath", abspath);

    if (!params["jsxappempty"]) {
      var strAppPath = params["jsxapppath"];
      if (strAppPath) {
        objScript.setAttribute("jsxloaded", "1");
        jsx3.CLASS_LOADER.loadApp(strAppPath, objScript.parentNode, params);
        return true;
      } else {
        window.alert(getMsgStr("b_pat"));
      }
    }

    return false;
  };

  var loadAllScripts = function() {
    var allScripts = document.getElementsByTagName("script");
    var bStart = false;

//    jsx3._logIt("script count: " + allScripts.length);

    // iterate through all scripts to find this script
    for (var i = 0; i < allScripts.length; i++) {
      var oneScript = allScripts[i];
      var src = oneScript.getAttribute("src");
      if (!oneScript.getAttribute("jsxloaded") && src && 
          (src.indexOf(jsx3.MAIN_SCRIPT) >= 0 || unescape(src).indexOf(jsx3.MAIN_SCRIPT) >= 0)) {
        bStart = loadScript(oneScript) || bStart;
      }
    }

    if (bStart && jsx3.CLASS_LOADER._isSupported())
      jsx3.CLASS_LOADER._start();
  };

  loadAllScripts();
};

window.jsx_main();
