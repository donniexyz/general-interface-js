/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Writes directory manifest files that are compatible with the GI class jsx3.io.XmlReqFileSystem.
 *
 * @author Jesse Costello-Good
 */
public class DirectoryLister {

  /**
   * The name of the manifest file.
   */
  public static final String MANIFEST_FILE = ".manifest";

  private Pattern skipFiles = Pattern.compile("^\\.");
  private Pattern skipDirs = Pattern.compile("^\\.");

  public DirectoryLister() {
  }

  /**
   * For every include directory, creates a file, .manifest, that lists the files in the directory.
   * @param dir
   * @param recurse
   * @throws IOException
   */
  public void run(File dir, boolean recurse) throws IOException {
    if (!dir.isDirectory())
      throw new IllegalArgumentException("File is not a directory: " + dir);

    List<File> dirs = new ArrayList<File>();
    List<String> names = new ArrayList<String>();

    for (File file : dir.listFiles()) {
      String name = file.getName();
      if (skipFiles == null || !skipFiles.matcher(name).find())
        names.add(name);

      if (file.isDirectory() && (skipDirs == null || !skipDirs.matcher(file.getName()).find()))
        dirs.add(file);
    }

    File manifest = new File(dir, MANIFEST_FILE);
    PrintWriter out = null;

    try {
      out = new PrintWriter(new FileWriter(manifest));
      for (String name : names)
        out.print(name + "\n");

    } finally {
      if (out != null)
        out.close();
    }

    if (recurse)
      for (File subdir : dirs)
        run(subdir, recurse);
  }

  /**
   * Sets what directories to skip. A directory is skipped if its name matches the pattern. The default pattern
   * is any name starting with ".".
   * @param skipDirs
   */
  public void setSkipDirs(Pattern skipDirs) {
    this.skipDirs = skipDirs;
  }

  /**
   * Sets what files to skip. A file is skipped if its name matches the pattern. The default pattern
   * is any name starting with ".".
   * @param skipFiles
   */
  public void setSkipFiles(Pattern skipFiles) {
    this.skipFiles = skipFiles;
  }
}
