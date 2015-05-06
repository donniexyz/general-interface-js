/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
import java.io.Reader;

import org.testng.Assert;
import org.testng.annotations.Test;
import com.tibco.gi.tools.Utils;

/**
 * @author Jesse Costello-Good
 * @version $Id$
 */
public class RegressionTest {

  private static final boolean CREATE_REGRESSION = true;
  private static final boolean CREATE_TREES = true;

  private final File scriptFile;
  private final File regressionFile;
  private final boolean paramRename;
  private final boolean varRename;

  public RegressionTest(File scriptFile, File regressionFile) {
    this(scriptFile, regressionFile, false, false);
  }

  public RegressionTest(File scriptFile, File regressionFile, boolean paramRename, boolean varRename) {
    this.scriptFile = scriptFile;
    this.regressionFile = regressionFile;
    this.paramRename = paramRename;
    this.varRename = varRename;
  }

  @Test(groups = {"print"})
  public void test() throws IOException {
    assert scriptFile.isFile() : "test file, " + scriptFile.getAbsolutePath() + " is not a file";
    if (! CREATE_REGRESSION)
      assert regressionFile.isFile() : "regression file, " + regressionFile.getAbsolutePath() + " is not a file";

    File tempFile = File.createTempFile("com.tibco.gi.javascript.TMP", ".js");

    Scope.Global scope = new Scope.Global();
    scope.setRenameLocalVariables(varRename);
    scope.setRenameMethodParameters(paramRename);
    scope.addBlessedName("blessed");
    NodeTraverser obfuscator = new NodeTraverser();

    FileHandler handler = FileHandler.getHandler(scriptFile);
    handler.setOutputFile(tempFile);

    Scope.File fileScope = new Scope.File(scriptFile);
    scope.addChild(fileScope);

    for (NodeWrapper script : handler.getScripts())
      fileScope.addChild(new Scope.Script(script));

    MetaDataParser mdp = new MetaDataParser();

    for (Reader reader : handler.getScriptBlocks())
      mdp.parse(reader, fileScope);

/*
    if (CREATE_TREES) {
      int n = 0;
      for (Iterator<NodeWrapper> i = scope.getScriptIterator(); i.hasNext(); n++) {
        NodeWrapper root = i.next();
        TreePrinter printer = new TreePrinter();
        File treeFile = new File(regressionFile.getAbsolutePath() + ".t1" + (n > 0 ? "." + n : ""));
        treeFile.createNewFile();
        PrintStream treeOut = new PrintStream(new FileOutputStream(treeFile));
        printer.printTree(root, treeOut);
        treeOut.close();
      }
    }
*/

    obfuscator.obfuscate(scope);
    handler.writeToOutput();

/*
    if (CREATE_TREES) {
      int n = 0;
      for (Iterator<NodeWrapper> i = scope.getScriptIterator(); i.hasNext(); n++) {
        NodeWrapper root = i.next();
        TreePrinter printer = new TreePrinter();
        File treeFile = new File(regressionFile.getAbsolutePath() + ".t2" + (n > 0 ? "." + n : ""));
        treeFile.createNewFile();
        PrintStream treeOut = new PrintStream(new FileOutputStream(treeFile));
        printer.printTree(root, treeOut);
        treeOut.close();
      }
    }
*/

    if (regressionFile.isFile()) {
      compareFiles(tempFile, regressionFile);
      tempFile.delete();
    } else {
      Utils.moveFile(tempFile, regressionFile);
    }
  }

  private static void compareFiles(File output, File canon) throws IOException {
    LineNumberReader test = null, source = null;

    try {
      String line;

      test = new LineNumberReader(new FileReader(output));
      StringBuilder testText = new StringBuilder();
      while ((line = test.readLine()) != null) testText.append(line.replaceAll("^\\s*", ""));

      source = new LineNumberReader(new FileReader(canon));
      StringBuilder sourceText = new StringBuilder();
      while ((line = source.readLine()) != null) sourceText.append(line.replaceAll("^\\s*", ""));

      Assert.assertEquals(testText.toString(), sourceText.toString());
    } catch (Error e) {
      copyFile(output, new File(canon + ".out"));
      throw e;
    } finally {
      if (test != null) test.close();
      if (source != null) source.close();
    }
  }

  private static void copyFile(File src, File dest) throws IOException {
    FileInputStream from = null;
    FileOutputStream to = null;
    try {
      from = new FileInputStream(src);
      to = new FileOutputStream(dest);
      byte[] buffer = new byte[4096];
      int bytesRead;

      while ((bytesRead = from.read(buffer)) != -1)
        to.write(buffer, 0, bytesRead); // write
    } finally {
      if (from != null)
        try {
          from.close();
        } catch (IOException e) {
        }
      if (to != null)
        try {
          to.close();
        } catch (IOException e) {
        }
    }
  }
}
