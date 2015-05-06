/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.cli;

import java.io.File;

import com.tibco.gi.tools.FileEmbedder;
import org.kohsuke.args4j.Option;

/**
 * A command line interface for {@link FileEmbedder}.
 *
 * @author Jesse Costello-Good
 */
public class FileEmbedderCLI extends BaseCLI {

  public static void main(String[] args) {
    BaseCLI.mainTemplate(FileEmbedderCLI.class, args);
  }

  @Option(name = "-i", metaVar = "PATH", usage = "the input file", required = true)
  private String inFile;

  @Option(name = "-o", metaVar = "PATH", usage = "the output file; defaults to the input file", required = false)
  private String outFile;

  @Option(name = "-b", metaVar = "PATH", usage = "the base directory; required for files that reference absolute paths", required = false)
  private String baseDir;

  public void run() throws Exception {
    FileEmbedder embedder = new FileEmbedder();
    embedder.setFile(new File(inFile));
    if (outFile != null)
      embedder.setOutFile(new File(outFile));
    if (baseDir != null)
      embedder.setBaseDir(new File(baseDir));
    embedder.run();
  }

}
