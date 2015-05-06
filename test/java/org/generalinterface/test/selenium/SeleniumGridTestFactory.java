package org.generalinterface.test.selenium;

import org.testng.annotations.Factory;
import org.testng.annotations.Parameters;

/**
 * @author Jesse Costello-Good
 */
public class SeleniumGridTestFactory {

  @Factory
  @Parameters({"seleniumHost", "seleniumPort", "seleniumEnvs", "seleniumSite"})
  public Object[] tests(String host, int port, String envs, String site) {

    String[] env = envs.split("\\s*,\\s*");
    JsUnitTest[] tests = new JsUnitTest[env.length];

    for (int i = 0; i < env.length; i++) {
      tests[i] = new JsUnitTest(host, port, env[i], site);
    }

    return tests;
  }

}
