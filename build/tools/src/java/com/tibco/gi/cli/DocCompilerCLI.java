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

import com.tibco.gi.tools.DocCompiler;
import com.tibco.gi.tools.HtmlDocCompiler;
import com.tibco.gi.tools.doc.JsMember.Access;
import org.kohsuke.args4j.Option;

/**
 * A command line interface for {@link DocCompiler} and {@link HtmlDocCompiler}.
 *
 * @author Jesse Costello-Good
 */
public class DocCompilerCLI extends BaseCLI {

  public static void main(String[] args) {
    BaseCLI.mainTemplate(DocCompilerCLI.class, args);
  }

  public static Collection<String> DEFAULT_SUFFIXES = Arrays.asList("js");

  private List<String> sources = new ArrayList<String>();

  @Option(name = "-i", metaVar = "PATH", usage = "the source file; a file or a directory", required = true)
  private void addSource(String src) {
    sources.add(src);
  }

  private Set<String> sourceSuffixes;

  @Option(name = "-x", metaVar = "SUFFIX", usage = "causes files with this suffix to be processed if using a source directory")
  private void addSuffix(String suffix) {
    if (sourceSuffixes == null)
      sourceSuffixes = new HashSet<String>();
    sourceSuffixes.add(suffix);
  }

  @Option(name = "-xml", usage = "whether to output XML; the default is HTML output")
  private boolean xml = false;

  @Option(name = "-o", metaVar = "PATH", usage = "the output directory", required = true)
  private String dest;

  private Access access = Access.PROTECTED;

  @Option(name = "-a", metaVar = "ACCESS", usage = "the access level to document {PRIVATE, PACKAGE, PROTECTED, PUBLIC}", required = false)
  private void setAccess(String a) {
    access = Access.valueOf(a.toUpperCase());
  }

  @Option(name = "-title", metaVar = "TITLE", usage = "the documentation title", required = false)
  private String title;

  @Option(name = "-copyright", metaVar = "COPYRIGHT", usage = "the documentation copyright notice", required = false)
  private String copyright;

  public void run() throws Exception {
    DocCompiler compiler = new DocCompiler();
    File destDir = new File(dest);
    File xmlDestDir = xml ? destDir : new File(destDir, ".xml");

    compiler.setAccess(access);
    compiler.setDestDir(xmlDestDir);

    final Collection<String> suffixes = sourceSuffixes != null ? sourceSuffixes : DEFAULT_SUFFIXES;
    FileFilter filter = new FileFilter() {
      public boolean accept(File pathname) {
        String name = pathname.getName();
        int index = name.lastIndexOf(".");
        return index >= 0 && suffixes.contains(name.substring(index + 1));
      }
    };

    for (String source : sources) {
      File sourceDir = new File(source);
      for (File f : findFiles(sourceDir, filter)) {
        compiler.addSrcFile(f);
      }
    }

    printBegin(compiler.getFileCount());
    long t1 = System.currentTimeMillis();

    compiler.run();

    if (!xml) {
      HtmlDocCompiler htmlCompiler = new HtmlDocCompiler();
      htmlCompiler.setSrcDir(xmlDestDir);
      htmlCompiler.setDestDir(destDir);
      htmlCompiler.setTitle(title);
      htmlCompiler.setCopyright(copyright);
      
      htmlCompiler.run();

      xmlDestDir.delete();
    }

    printEnd(t1);
  }
}
