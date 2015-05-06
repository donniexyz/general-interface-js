/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;

import com.tibco.gi.tools.ScriptMergerCleanup;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

/**
 * Ant interface for the {@link ScriptMergerCleanup} tool.
 *
 * @author Jesse Costello-Good
 */
public class MergerCleanupTask extends Task {

  private File log;
  private File script;
  private File config;
  private File dir;
  private String scripttarget;
  private boolean strict = false;

  /**
   * Invokes a {@link ScriptMergerCleanup} instance. Either the <code>dir</code> and <code>log</code> or the
   * <b>config</b> and <code>script</code> attributes must be defined.
   *
   * @throws BuildException
   */
  public void execute() throws BuildException {
    if (dir != null && dir.isDirectory() && log != null && log.isFile()) {
      try {
        ScriptMergerCleanup cleanup = new ScriptMergerCleanup();
        cleanup.cleanUpScripts(dir, config, log);
        cleanup.setStrict(strict);
      } catch (Exception e) {
        e.printStackTrace();
        throw new BuildException(e);
      }
    } else if (config != null && config.isFile() && script != null && script.isFile()) {
      try {
        ScriptMergerCleanup cleanup = new ScriptMergerCleanup();
        cleanup.addScriptToConfig(config, script, scripttarget);
        cleanup.setStrict(strict);
      } catch (Exception e) {
        e.printStackTrace();
        throw new BuildException(e);
      }
    } else {
      throw new BuildException("Must specify either dir/log/[config] or config/script/[scripttarget]");
    }
  }

  /**
   * Ant setter method for the script merger log to use for cleanup.
   *
   * @param log
   * @see ScriptMergerCleanup#cleanUpScripts
   */
  public void setLog(File log) {
    this.log = log;
  }

  /**
   * Ant setter method for the script file to add to a configuration file.
   *
   * @param script
   * @see ScriptMergerCleanup#addScriptToConfig
   */
  public void setScript(File script) {
    this.script = script;
  }

  /**
   * Ant setter method for the config file to edit.
   *
   * @param config
   * @see ScriptMergerCleanup#cleanUpScripts
   * @see ScriptMergerCleanup#addScriptToConfig
   */
  public void setConfig(File config) {
    this.config = config;
  }

  /**
   * Ant setter method for the base directory from which to clean up scripts.
   *
   * @param dir
   * @see ScriptMergerCleanup#cleanUpScripts
   */
  public void setDir(File dir) {
    this.dir = dir;
  }

  /**
   * Ant setter method for the script target for the script to add to the configuration file.
   *
   * @param scripttarget
   * @see ScriptMergerCleanup#addScriptToConfig
   */
  public void setScripttarget(String scripttarget) {
    this.scripttarget = scripttarget;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
