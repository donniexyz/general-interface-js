/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;
import java.util.Arrays;
import java.util.HashSet;

import com.tibco.gi.tools.amp.PluginMerger;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

/**
 * Ant interface for the {@link PluginMerger} tool.
 *
 * @author Jesse Costello-Good
 */
public class AmpPluginMergeTask extends Task {

  private File pluginsfile;
  private String plugins;
  private boolean strict = false;

  public void execute() throws BuildException {
    PluginMerger merger = new PluginMerger();
    merger.setPluginsFile(pluginsfile);
    merger.setStrict(strict);

    if (plugins != null && plugins.length() > 0)
      merger.setPlugins(new HashSet<String>(Arrays.asList(plugins.split("\\s+"))));

    try {
      merger.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for the plugins.xml file to process.
   * @param pluginsfile
   */
  public void setPluginsfile(File pluginsfile) {
    this.pluginsfile = pluginsfile;
  }

  /**
   * Ant setting method for what plug-ins to include in the merge. If none are specified then all plug-ins are
   * merged.
   * @param plugins  the whitespace-separated list of plug-in IDs.
   */
  public void setPlugins(String plugins) {
    this.plugins = plugins;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
