package com.tibco.gi.tools;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import com.tibco.gi.tools.javascript.Language;

/**
 * Creates a JavaScript file from the contents of a text file. The JavaScript file can then be loaded asynchronously
 * across domains without being blocked by cross-domain security restrictions.
 * <p/>
 * The format of the output file is:
 * <pre>
 * functionName("baseURI/relativePath", "fileContents");
 * </pre>
 *
 * @author Jesse Costello-Good
 */
public class JsEncoder {

  private static final Logger LOG = Logger.getLogger(JsEncoder.class.getName());

  private File baseDir;
  private URI baseURI;
  private Map<File, File> fileMappings = new HashMap<File, File>();
  private String functionName;

  /**
   * Sets the base directory. The relative paths of the processed files are determined relative to this directory.
   * @param baseDir
   */
  public void setBaseDir(File baseDir) {
    this.baseDir = baseDir;
  }

  /**
   * Sets the base path. When a JS'ed file loads it calls a static function. The first argument to the function is
   * this base URI concatenated with the relate path of the loaded file.
   * @param baseURI
   */
  public void setBaseURI(String baseURI) {
    try {
      this.baseURI = new URI(baseURI);
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException(e);
    }
  }

  /**
   * Sets the name of the static function to call from the JS'ed file to tell the system that the file has loaded.
   * @param functionName
   */
  public void setFunctionName(String functionName) {
    this.functionName = functionName;
  }

  /**
   * Adds a file to process.
   * @param input
   * @param output
   */
  public void addFileMapping(File input, File output) {
    fileMappings.put(input, output);
  }

  public void run() throws IOException {
    if (baseDir == null) throw new IllegalStateException("Must specify a base directory.");
    if (baseURI == null) throw new IllegalStateException("Must specify a base URI.");
    if (functionName == null) throw new IllegalStateException("Must specify a function name.");
    if (fileMappings.size() == 0) throw new IllegalStateException("Must specify at lease one file mapping.");

    URI baseDirURI = baseDir.toURI();

    for (File input : fileMappings.keySet()) { // ok non-deterministic access, each is independent
      String contents = Utils.readFile(input);

      File output = fileMappings.get(input);
      FileWriter writer = new FileWriter(output);
      PrintWriter printer = new PrintWriter(writer);

      URI relativePath = Utils.relativizeURI(baseDirURI, input.toURI());
      relativePath = baseURI.resolve(relativePath);

      printer.print(functionName + "(\"" + relativePath + "\", \"");
      printer.print(Language.escapeString(contents));
      printer.println("\");");

      printer.close();
    }
  }

}
