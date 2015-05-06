/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import com.tibco.gi.tools.javascript.Language;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

/**
 * Embeds the contents of a file inside of a JavaScript file.
 * <p/>
 * This tool searches a JavaScript file for all instances of metadata of the following form:
 * <pre>
 * /* @Embed(source='relativePath', type='type') *\/
 * </pre>
 * The line must be immediately followed by a line with either:
 * <pre>
 * MEMBER = VALUE;
 * </pre>
 * or
 * <pre>
 * MEMBER;
 * </pre>
 * <code>type</code> may be <code>xml</code>, <code>xsl</code>, or <code>string</code>.
 *
 * @author Jesse Costello-Good
 */
public class FileEmbedder {

  private static final Logger LOG = Logger.getLogger(FileEmbedder.class.getName());

  private static interface Handler {
    String handle(File f) throws IOException;
  }

  private static final Handler XSL = new Handler() {
    public String handle(File f) throws IOException {
      return "new jsx3.xml.XslDocument().loadXML(" + xmlToJsString(f, true) + ")";
    }
  };

  private static final Handler XML = new Handler() {
    public String handle(File f) throws IOException {
      return "new jsx3.xml.Document().loadXML(" + xmlToJsString(f, false) + ")";
    }

  };

  private static final Handler STRING = new Handler() {
    public String handle(File f) throws IOException {
      return txtToJsString(f);
    }
  };

  private static String xmlToJsString(File f, boolean condense) throws IOException {
    Document doc;

    try {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setIgnoringElementContentWhitespace(true);
      factory.setIgnoringComments(true);
      DocumentBuilder builder = factory.newDocumentBuilder();
      doc = builder.parse(f);
    } catch (SAXException e) {
      throw new IOException(e.toString());
    } catch (ParserConfigurationException e) {
      throw new RuntimeException(e);
    }

    StringWriter contents = new StringWriter();
    Utils.serializeDocument(doc, contents, 0);

    String xml = contents.toString();
    xml = xml.replaceAll("\u00A0", "&#160;");

    if (condense)
      xml = xml.replaceAll("\\s*(\n|\r\n|\r)\\s*", "");
    else
      xml = xml.replaceAll("(\n|\r\n|\r)", "\n");

    return "'" + Language.escapeString(xml, true) + "'";
  }

  private static String txtToJsString(File f) throws IOException {
    StringBuilder sb = new StringBuilder();
    sb.append("\"");

    BufferedReader fileReader = new BufferedReader(new FileReader(f));
    String line;
    while ((line = fileReader.readLine()) != null) {
      sb.append(line.replaceAll("\"", "\\\"")).append("\\n");
    }

    sb.append("\"");
    return sb.toString();
  }

  private static final Map<String, Handler> HANDLER_MAP = new HashMap<String, Handler>();

  static {
    HANDLER_MAP.put("xsl", XSL);
    HANDLER_MAP.put("xml", XML);
    HANDLER_MAP.put("string", STRING);
  }

  private static final Pattern EMBED_PATTERN = Pattern.compile("(?://|/\\*)\\s+@Embed\\(([^)]*)\\)");
  private static final Pattern ARG_PATTERN = Pattern.compile("(\\w+)\\s*=\\s*['\"]([^'\"]*)['\"]");

  private File file;
  private File outFile;
  private File baseDir;
  private boolean strict = false;

  public void setFile(File file) {
    this.file = file;
  }

  public void setOutFile(File outFile) {
    this.outFile = outFile;
  }

  public void setBaseDir(File baseDir) {
    this.baseDir = baseDir;
  }

  public void run() throws IOException {
    if (file == null) throw new NullPointerException("file is required");
    if (outFile == null) outFile = file;

    BufferedReader fileReader = new BufferedReader(new FileReader(file));

    File tmpFile = File.createTempFile(FileEmbedder.class.getName(), "txt");
    FileWriter tmpWriter = new FileWriter(tmpFile);

    String line;
    int lineNum = 0;

    while ((line = fileReader.readLine()) != null) {
      lineNum++;

      Matcher m1 = EMBED_PATTERN.matcher(line);
      if (m1.find()) {
        String source = null, type = null;

        String args = m1.group(1);
        Matcher m2 = ARG_PATTERN.matcher(args);

        while (m2.find()) {
          String argName = m2.group(1);
          String argValue = m2.group(2);

          if ("source".equals(argName)) {
            source = argValue;
          } else if ("type".equals(argName)) {
            type = argValue;
          } else {
            log(Level.WARNING, "Bad @Embed argument '" + argName + "' on line " + lineNum + ".");
          }
        }

        if (source != null && type != null) {
          String nextLine = fileReader.readLine();

          int semi = nextLine.lastIndexOf(";");
          int equals = nextLine.lastIndexOf("=");

          if (semi < 0) {
            log(Level.WARNING, "No semicolon in line after @Embed on line " + lineNum + ".");
          } else {
            if (equals < 0)
              equals = semi;

            String content = null;
            try {
              content = getEmbedContent(source, type, file);
            } catch (IllegalArgumentException e) {
              log(Level.WARNING, "Bad handler type '" + type + "' on line " + lineNum + ".");
              content = nextLine.substring(equals, semi);
            }

            tmpWriter.write(nextLine.substring(0, equals));
            tmpWriter.write("=");
            tmpWriter.write(content);
            tmpWriter.write(nextLine.substring(semi));
            tmpWriter.write("\n");
          }

          lineNum++;
        } else {
          log(Level.WARNING, "Incomplete @Embed on line " + lineNum + ".");
        }
      } else {
        tmpWriter.write(line);
        tmpWriter.write("\n");
      }
    }

    tmpWriter.close();
    fileReader.close();

    if (outFile.exists() && !outFile.delete())
      log(Level.SEVERE, "Could not delete file " + outFile);

    if (!Utils.moveFile(tmpFile, outFile))
      log(Level.SEVERE, "Could not write to file " + outFile);
  }

  private String getEmbedContent(String source, String type, File sourceFile) throws IOException {
    Handler h = HANDLER_MAP.get(type);

    if (h == null) throw new IllegalArgumentException("type");

    File file;

    if (source.startsWith("/")) {
      if (baseDir == null)
        throw new IllegalStateException("baseDir not set for absolute path: " + source);

      file = new File(baseDir, source.substring(1));
    } else {
      file = new File(sourceFile.toURI().resolve(source));
    }

    return h.handle(file);
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
