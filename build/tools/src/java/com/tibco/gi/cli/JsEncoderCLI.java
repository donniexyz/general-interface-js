package com.tibco.gi.cli;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.tibco.gi.tools.JsEncoder;
import org.kohsuke.args4j.Argument;
import org.kohsuke.args4j.Option;

/**
 * A command line interface for {@link JsEncoder}.

 * @author Jesse Costello-Good
 */
public class JsEncoderCLI extends BaseCLI {

  public static final String JS_SUFFIX = ".js";

  public static final String FUNCTION_NAME = "jsx3.net.Request.xdr";
  
  public static void main(String[] args) {
    BaseCLI.mainTemplate(JsEncoderCLI.class, args);
  }

  private File systemDir;

  @Option(name = "-system", usage = "the GI system directory (JSX/)")
  private void setSystem(String path) {
    systemDir = new File(path);
    userDir = null;
  }

  private File userDir;
  @Option(name = "-user", usage = "the GI workspace directory (contains JSXAPPS/)")
  private void setUser(String path) {
    userDir = new File(path);
    systemDir = null;
  }

  private List<File> sources = new ArrayList<File>();

  @Argument(metaVar = "PATH", usage = "an input file", required = true, multiValued = true)
  private void addSource(String src) {
    sources.add(new File(src));
  }

  @Option(name = "-callback", metaVar = "FUNCTION", usage = "the callback function name")
  private String function = FUNCTION_NAME;

  @Option(name = "-suffix", metaVar = "FUNCTION", usage = "the file suffix to append to input file name")
  private String suffix = JS_SUFFIX;

  public void run() throws Exception {
    JsEncoder compiler = new JsEncoder();
    compiler.setFunctionName(function);

    if (systemDir != null) {
      compiler.setBaseDir(systemDir);
      compiler.setBaseURI("jsx:/");
    } else if (userDir != null) {
      compiler.setBaseDir(userDir);
      compiler.setBaseURI("jsxuser:/");
    } else {
      throw new IllegalStateException("Must specify either system or user directory");
    }

    for (File input : sources)
      compiler.addFileMapping(input, new File(input + suffix));

    printBegin(sources.size());
    long t1 = System.currentTimeMillis();

    compiler.run();

    printEnd(t1);
  }
}
