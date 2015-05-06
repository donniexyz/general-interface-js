/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintStream;
import java.io.Reader;
import java.io.StringReader;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.xml.serializer.Serializer;
import org.apache.xml.serializer.SerializerFactory;
import org.jaxen.JaxenException;
import org.jaxen.XPath;
import org.jaxen.dom.DOMXPath;
import org.mozilla.javascript.CompilerEnvirons;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;
import org.mozilla.javascript.Parser;
import org.mozilla.javascript.tools.ToolErrorReporter;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.Text;
import com.tibco.gi.tools.Utils;

/**
 * A file handler knows how to parse a file containing JavaScript code to obfuscate, identify the script elements
 * and write the once the JavaScript has been processed by the obfuscator.
 *
 * @author Jesse Costello-Good
 */
public abstract class FileHandler {

  private static final Logger LOG = Logger.getLogger(FileHandler.class.getName());

  private final static Pattern SCRIPT_NAME = Pattern.compile("\\.js(\\.\\w+)?$");

  public static FileHandler getHandler(File inputFile) {
    return getHandler(inputFile, false);
  }

  /**
   * Returns an instance of a file handler for a particular input file.
   * @param inputFile
   * @return
   */
  public static FileHandler getHandler(File inputFile, boolean strict) {
    String fileName = inputFile.getName().toLowerCase();
    FileHandler handler;

    if (SCRIPT_NAME.matcher(fileName).find()) {
      handler = new Script(inputFile);
    } else if (fileName.endsWith(".xml") || fileName.endsWith(".jss")
        || fileName.endsWith(".html") || fileName.endsWith(".xhtml")) {
      try {
        Document xml = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(inputFile);
        Element root = xml.getDocumentElement();
        if ("data".equals(root.getNodeName()))
          handler = new CDF(inputFile, xml);
        else if ("serialization".equals(root.getNodeName()))
          handler = new JsxSerialization(inputFile, xml);
        else if ("html".equals(root.getNodeName()))
          handler = new XHTML(inputFile, xml);
        else
          handler = new Normal(inputFile);
      } catch (Exception e) {
        if (strict)
          throw new RuntimeException("Error parsing " + inputFile + ": " + e);

        LOG.warning("Error parsing " + inputFile + ": " + e);
        handler = new Normal(inputFile);
      }
    } else {
      handler = new Normal(inputFile);
    }

    handler.setStrict(strict);

    return handler;
  }

  protected File inputFile;
  protected File outputFile;
  protected boolean strict = false;

  protected FileHandler(File inputFile) {
    this.inputFile = inputFile;
  }

  public void setInputFile(File inputFile) {
    this.inputFile = inputFile;
  }

  public void setOutputFile(File outputFile) {
    this.outputFile = outputFile;
  }

  public File getInputFile() {
    return inputFile;
  }

  public File getOutputFile() {
    return outputFile;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }

  protected void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /**
   * Returns all script elements for the input file as a collection of <code>NodeWrapper</code> instances.
   * @return
   * @throws IOException
   */
  public abstract Collection<NodeWrapper> getScripts() throws IOException;

  /**
   * Returns all script elements for the input file as a collection of <code>Reader</code> instances.
   * @return
   * @throws IOException
   */
  public abstract Collection<? extends Reader> getScriptBlocks() throws IOException;

  /**
   * Writes the contents of the input file to the output file. The set of script elements last returned by
   * {@link #getScripts} should be used to write the output file.
   *
   * @throws IOException
   */
  public abstract void writeToOutput() throws IOException;

  /**
   * Parses a JavaScript code block and returns a <code>NodeWrapper</code> wrapping the code.
   * @param input
   * @param sourceFile
   * @param lineNumber
   * @return
   * @throws IOException
   * @throws EvaluatorException
   */
  protected NodeWrapper parseScript(Reader input, File sourceFile, int lineNumber)
      throws IOException, EvaluatorException {

    CompilerEnvirons env = new CompilerEnvirons();
    ErrorReporter errors = new ToolErrorReporter(true, new PrintStream(System.err));
    Parser parser = new Parser(env, errors);

    BufferedReader resettableReader = new BufferedReader(input);
    resettableReader.mark((int) sourceFile.length() + 1);
    resettableReader.reset();
    return new NodeWrapper(parser.parse(resettableReader, sourceFile.getCanonicalPath(), lineNumber));
  }

  protected NodeWrapper parseScript(String input, File sourceFile, int lineNumber)
      throws IOException, EvaluatorException {
    return parseScript(new StringReader(input), sourceFile, lineNumber);
  }

  protected String serializeScript(NodeWrapper script) throws IOException {
    return NodePrinter.printNode(script);
  }

  protected boolean checkScript(Reader input, File sourceFile, int lineNumber) throws IOException {
    CompilerEnvirons env = new CompilerEnvirons();
    ErrorReporter errors = new ToolErrorReporter(true, new PrintStream(System.err));

    Parser parser = new Parser(env, errors);

    try {
      parser.parse(input, sourceFile.getCanonicalPath(), lineNumber);
      return true;
    } catch (EvaluatorException e) {
      return false;
    }
  }

  /**
   * A file handler for files that do not contain script elements.
   */
  public static class Normal extends FileHandler {

    private static final boolean WRITE_OVER = false;

    public Normal(File inputFile) {
      super(inputFile);
    }

    public Collection<NodeWrapper> getScripts() throws IOException {
      return Collections.emptyList();
    }

    public Collection<? extends Reader> getScriptBlocks() throws IOException {
      return Collections.emptyList();
    }

    public void writeToOutput() throws IOException {
      if (outputFile.exists() && !WRITE_OVER) return;
      FileInputStream input = null;
      FileOutputStream output = null;

      try {
        outputFile.getParentFile().mkdirs();

        input = new FileInputStream(inputFile);
        output = new FileOutputStream(outputFile);

        byte[] buffer = new byte[8196];
        int count;
        while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);

      } catch (IOException e) {
        LOG.log(Level.SEVERE, "Error processing file " + inputFile.getCanonicalPath() + e, e);
      } finally {
        if (input != null) input.close();
        if (output != null) output.close();
      }
    }

    public String toString() {
      return "FileHandler";
    }
  }

  /**
   * A file handler for JavaScript files.
   */
  public static class Script extends FileHandler {

    private static final boolean CHECK_RESULT = true;
    private static final boolean PRINT_TREE = false;

    private NodeWrapper script;

    public Script(File inputFile) {
      super(inputFile);
    }

    public Collection<NodeWrapper> getScripts() throws IOException {
      FileReader input = null;

      try {
        input = new FileReader(inputFile);
        script = this.parseScript(input, inputFile, 1);
        return Collections.singletonList(script);
      } catch (EvaluatorException e) {
        this.log(Level.SEVERE, "JavaScript syntax error in file " + inputFile + ": " + e);
      } finally {
        if (input != null) input.close();
      }

      return Collections.emptyList();
    }

    public Collection<? extends Reader> getScriptBlocks() throws IOException {
      return Collections.singletonList(new FileReader(inputFile));
    }

    public void writeToOutput() throws IOException {
      boolean writeOver = false;
      if (inputFile.equals(outputFile)) {
        outputFile = File.createTempFile("obfuscator", "js");
        writeOver = true;
      }

      FileWriter output = null;

      try {
        outputFile.getParentFile().mkdirs();
        if (PRINT_TREE)
          TreePrinter.main(new String[]{inputFile.getCanonicalPath(), outputFile.getCanonicalPath() + ".tree"});

        output = new FileWriter(outputFile);
        output.write(serializeScript(script));
        output.write("\n");
      } finally {
        if (output != null) output.close();
      }

      if (writeOver) {
        inputFile.delete();

        if (!Utils.moveFile(outputFile, inputFile))
          this.log(Level.SEVERE, "Could not rename " + outputFile + " to " + inputFile);

        outputFile = inputFile;
      }

      if (CHECK_RESULT) {
        FileReader input = null;
        try {
          input = new FileReader(outputFile);
          if (!checkScript(input, outputFile, 1))
            this.log(Level.SEVERE, "JavaScript syntax error in output file " + outputFile);
        } finally {
          if (input != null) input.close();
        }
      }
    }

    public String toString() {
      return "Script";
    }
  }

  /**
   * An abstract file handler for XML files.
   */
  public static abstract class XML extends FileHandler {

    protected final Document document;
    protected final Map<Node, NodeWrapper> scriptMap = new HashMap<Node, NodeWrapper>();
    protected final List<Node> scriptOrder = new ArrayList<Node>();

    public XML(File inputFile, Document document) {
      super(inputFile);
      this.document = document;
    }

    protected void serializeScriptsToNodes() throws IOException {
      for (Node node : scriptOrder) { // ok non-deterministic access, no state change
        node.setNodeValue(serializeScript(scriptMap.get(node)));
      }
    }

    protected void serializeDocument() throws IOException {
      Properties props = new Properties();
      props.put("method", "xml");
      if (document.getXmlEncoding() != null)
        props.put("encoding", document.getXmlEncoding());
      else if (document.getInputEncoding() != null)
        props.put("encoding", document.getInputEncoding());
      if (document.getXmlVersion() != null)
        props.put("version", document.getXmlVersion());

      String encoding = props.containsKey("encoding") ? (String) props.get("encoding") : "UTF-8";

      Serializer serializer = SerializerFactory.getSerializer(props);
      FileOutputStream out = new FileOutputStream(outputFile);
      Writer writer = new OutputStreamWriter(out, encoding);
      serializer.setWriter(writer);
      serializer.asDOMSerializer().serialize(document);
      out.close();
    }

    public Collection<? extends Reader> getScriptBlocks() throws IOException {
      Collection<StringReader> readers = new ArrayList<StringReader>();
      for (Node node : scriptOrder) {
        readers.add(new StringReader(node.getNodeValue()));
      }
      return readers;
    }
  }

  /**
   * A file handler for General Interface serialization (v 3.0) files.
   */
  public static class JsxSerialization extends XML {

    public JsxSerialization(File inputFile, Document document) {
      super(inputFile, document);
    }

    public Collection<NodeWrapper> getScripts() throws IOException {
      scriptMap.clear();
      scriptOrder.clear();
      Collection<NodeWrapper> scripts = new ArrayList<NodeWrapper>();

      try {
        XPath query1 = new DOMXPath("/serialization/onBeforeDeserialize | /serialization/onAfterDeserialize");
        XPath query2 = new DOMXPath("//object/events | //object/properties");

        List<Element> scriptBlocks = query1.selectNodes(document);
        for (Element node : scriptBlocks) {
          Text text = (Text) node.getFirstChild();
          if (text != null) {
            NodeWrapper scriptNode = parseScript(text.getNodeValue(), inputFile, 1);
            scripts.add(scriptNode);

            scriptMap.put(text, scriptNode);
            scriptOrder.add(text);
          }
        }

        List<Element> events = query2.selectNodes(document);
        for (Element node : events) {
          boolean props = "properties".equals(node.getNodeName());

          NamedNodeMap attributes = node.getAttributes();
          for (int i = 0; i < attributes.getLength(); i++) {
            Attr attribute = (Attr) attributes.item(i);
            if (!props || attribute.getNodeName().startsWith("on")) {
              Text text = (Text) attribute.getFirstChild();
              if (text != null) {
                NodeWrapper scriptNode = parseScript(text.getNodeValue(), inputFile, 1);
                scripts.add(scriptNode);

                scriptMap.put(text, scriptNode);
                scriptOrder.add(text);
              }
            }
          }
        }
      } catch (JaxenException e) {
        throw new RuntimeException(e);
      }

      return scripts;
    }

    public void writeToOutput() throws IOException {
      serializeScriptsToNodes();
      serializeDocument();
    }

    public String toString() {
      return "JsxSerialization";
    }
  }


  /**
   * A file handler for General Interface CDF files.
   */
  public static class CDF extends XML {

    public CDF(File inputFile, Document document) {
      super(inputFile, document);
    }

    public Collection<NodeWrapper> getScripts() throws IOException {
      scriptMap.clear();
      scriptOrder.clear();

      Collection<NodeWrapper> scripts = new ArrayList<NodeWrapper>();

      try {
        XPath query1 = new DOMXPath("//*/@jsxexecute | //*/@jsxselect");

        List<Attr> scriptAttrs = query1.selectNodes(document);
        for (Attr node : scriptAttrs) {
          Text text = (Text) node.getFirstChild();
          if (text != null) {
            NodeWrapper scriptNode = parseScript(text.getNodeValue(), inputFile, 1);
            scripts.add(scriptNode);
            scriptMap.put(text, scriptNode);
            scriptOrder.add(text);
          }
        }
      } catch (JaxenException e) {
        throw new RuntimeException(e);
      }

      return scripts;
    }

    public void writeToOutput() throws IOException {
      serializeScriptsToNodes();
      serializeDocument();
    }

    public String toString() {
      return "CDF";
    }
  }

  /**
   * A file handler for XHTML files.
   */
  public static class XHTML extends XML {

    public XHTML(File inputFile, Document document) {
      super(inputFile, document);
    }

    public Collection<NodeWrapper> getScripts() throws IOException {
      scriptMap.clear();
      scriptOrder.clear();
      Collection<NodeWrapper> scripts = new ArrayList<NodeWrapper>();

      try {
        XPath query1 = new DOMXPath("//script");

        List<Element> scriptTags = query1.selectNodes(document);
        for (Element node : scriptTags) {
          Text text = (Text) node.getFirstChild();
          if (text != null) {
            NodeWrapper scriptNode = parseScript(text.getNodeValue(), inputFile, 1);
            scripts.add(scriptNode);

            scriptMap.put(text, scriptNode);
            scriptOrder.add(text);
          }
        }
      } catch (JaxenException e) {
        throw new RuntimeException(e);
      }

      return scripts;
    }

    public void writeToOutput() throws IOException {
      serializeScriptsToNodes();
      serializeDocument();
    }

    public String toString() {
      return "CDF";
    }
  }
}
