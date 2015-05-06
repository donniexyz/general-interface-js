/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import org.testng.annotations.Factory;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;

/**
 * @author Jesse Costello-Good
 * @version $Id$
 */
public class TestFactory {

  @Factory
  public Object[] regressionTests() {
    String testsDirPath = System.getProperty("com.tibco.gi.javascript.TESTS_DIR");
    String regressionsDirPath = System.getProperty("com.tibco.gi.javascript.REGRESSIONS_DIR");

    File testsDir = new File(testsDirPath);
    assert testsDir.isDirectory() : "tests directory, " + testsDirPath + ", is not a directory";

    File regressionsDir = new File(regressionsDirPath);
    assert testsDir.isDirectory() : "tests directory, " + regressionsDirPath + ", is not a directory";

    File[] scriptFiles = testsDir.listFiles();
    Collection<Object> tests = new ArrayList<Object>(scriptFiles.length);

    for (File scriptFile : scriptFiles) {
      if (scriptFile.isFile()) {
        String name = scriptFile.getName();
        boolean isObfuscationTest = name.startsWith("obf");

        tests.add(new RegressionTest(scriptFile,
            new File(regressionsDir.getAbsolutePath() + File.separator + name),
            isObfuscationTest, isObfuscationTest));
      }
    }

    return tests.toArray();
  }
}
