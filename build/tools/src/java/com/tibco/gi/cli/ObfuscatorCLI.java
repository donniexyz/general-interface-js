/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.cli;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.tibco.gi.tools.Obfuscator;
import org.kohsuke.args4j.Option;

/**
 * A command line interface for {@link Obfuscator}.
 *
 * @author Jesse Costello-Good
 */
public class ObfuscatorCLI extends BaseCLI {

  public static void main(String[] args) {
    BaseCLI.mainTemplate(ObfuscatorCLI.class, args);
  }

  public static Collection<String> DEFAULT_SUFFIXES = Arrays.asList("js");

  private List<String> sources = new ArrayList<String>();

  @Option(name = "-i", metaVar = "PATH", usage = "the source file; a file or a directory", required = true)
  private void addSource(String src) {
    sources.add(src);
  }

  @Option(name = "-o", metaVar = "PATH", usage = "the output file or directory; defaults to the source", required = false)
  private String dest;

  @Option(name = "-bless", metaVar = "PATH", usage = "the bless file", required = false)
  private String blessFile;

  @Option(name = "-clobber", metaVar = "PATH", usage = "the clobber file", required = false)
  private String clobberFile;

  @Option(name = "-mapin", metaVar = "PATH", usage = "the rename map in file", required = false)
  private String mapIn;

  @Option(name = "-mapout", metaVar = "PATH", usage = "the rename map out file", required = false)
  private String mapOut;

  @Option(name = "-p", usage = "whether to obfuscate method parameters")
  private boolean obfuscateParameters = false;

  @Option(name = "-v", usage = "whether to obfuscate local variables")
  private boolean obfuscateVariables = false;

  @Option(name = "-l", usage = "whether to optimize literals")
  private boolean optimizeLiterals = false;

  private Set<String> sourceSuffixes;

  @Option(name = "-x", metaVar = "SUFFIX", usage = "causes files with this suffix to be processed if using a source directory")
  private void addSuffix(String suffix) {
    if (sourceSuffixes == null)
      sourceSuffixes = new HashSet<String>();
    sourceSuffixes.add(suffix);
  }

  public void run() throws Exception {
    Obfuscator obfuscator = new Obfuscator();

    if (blessFile != null)
      obfuscator.setBlessFile(new File(blessFile));

    if (clobberFile != null)
      obfuscator.setClobberFile(new File(clobberFile));

    if (mapIn != null)
      obfuscator.setMapInFile(new File(mapIn));

    if (mapOut != null)
      obfuscator.setMapOutFile(new File(mapOut));

    obfuscator.setObfuscateParameters(obfuscateParameters);
    obfuscator.setObfuscateVariables(obfuscateVariables);
    obfuscator.setOptimizeLiterals(optimizeLiterals);

    final Collection<String> suffixes = sourceSuffixes != null ? sourceSuffixes : DEFAULT_SUFFIXES;
    FileFilter filter = new FileFilter() {
      public boolean accept(File pathname) {
        String name = pathname.getName();
        int index = name.lastIndexOf(".");
        return index >= 0 && suffixes.contains(name.substring(index + 1));
      }
    };

    for (String source : sources) {
      File sourceFile = new File(source);

      if (sourceFile.isDirectory()) {
        File destDir = dest != null ? new File(dest) : sourceFile;

        for (File f : findFiles(sourceFile, filter)) {
          String relPath = sourceFile.toURI().relativize(f.toURI()).toString();
          obfuscator.addFileMap(f, new File(destDir, relPath));
        }
      } else {
        if (sources.size() > 1) {
          throw new IllegalStateException("Multiple source files may only be specified if they are all directories: " + sourceFile);
        }

        File destFile = dest != null ? new File(dest) : sourceFile;
        obfuscator.addFileMap(sourceFile, destFile);
      }
    }

    printBegin(obfuscator.getFileCount());
    long t1 = System.currentTimeMillis();

    obfuscator.run();

    printEnd(t1);
  }
}
