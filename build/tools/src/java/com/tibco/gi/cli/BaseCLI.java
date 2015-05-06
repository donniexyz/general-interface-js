/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.cli;

import java.io.File;
import java.io.FileFilter;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedList;
import java.util.Arrays;

import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;

/**
 * Abstract base class for command line interface tools.
 *
 * @author Jesse Costello-Good
 */
public abstract class BaseCLI {

  private static final NumberFormat MS_FORMAT = new DecimalFormat("0.##");

  public static void mainTemplate(Class<? extends BaseCLI> type, String[] args) {
    BaseCLI cli = null;

    try {
      cli = type.newInstance();
      cli.parse(args);
    } catch (CmdLineException e) {
      System.err.println(e.getMessage());
      System.err.println();
      cli.getParser().printUsage(System.out);
      System.exit(1);
    } catch (Throwable e) {
      e.printStackTrace(System.err);
      System.exit(1);
    }

    try {
      cli.run();
      System.exit(0);
    } catch (Throwable e) {
      e.printStackTrace(System.err);
      System.exit(1);
    }
  }

  private CmdLineParser parser;

  public BaseCLI() {
    super();
  }

  public void parse(String[] args) throws CmdLineException {
    parser = new CmdLineParser(this);
    parser.parseArgument(args);
  }

  public CmdLineParser getParser() {
    return parser;
  }

  public abstract void run() throws Exception;

  protected List<File> findFiles(File base, FileFilter filter) {
    List<File> files = new ArrayList<File>();
    List<File> queue = new LinkedList<File>();
    queue.add(base);

    while (queue.size() > 0) {
      File f = queue.remove(0);

      if (f.isDirectory()) {
        queue.addAll(Arrays.asList(f.listFiles()));
      } else if (filter.accept(f))
        files.add(f);
    }

    return files;
  }

  protected void printBegin(int count) {
    System.out.println("Processing " + count + " " + (count == 1 ? "file" : "files"));
  }

  protected void printEnd(long beginTime) {
    System.out.println("Total time: " + MS_FORMAT.format((double) (System.currentTimeMillis() - beginTime)/1000) + " s");
  }
}
