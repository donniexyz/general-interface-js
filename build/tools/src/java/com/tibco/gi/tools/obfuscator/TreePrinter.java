/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import org.mozilla.javascript.CompilerEnvirons;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.FunctionNode;
import org.mozilla.javascript.Node;
import org.mozilla.javascript.Parser;
import org.mozilla.javascript.ScriptOrFnNode;
import org.mozilla.javascript.Token;
import org.mozilla.javascript.tools.ToolErrorReporter;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.PrintStream;

/**
 * A utility class that parses a JavaScript file and prints out the parse tree.
 * 
 * @author Jesse Costello-Good
 */
public class TreePrinter {

  /**
   * Parses a JavaScript file using the Rhino engine and prints out a tree. The order of the arguments is: <code>inFile
   * outFile</code>. If <code>outFile</code> is omitted, then standard out is used instead.
   *
   * @param args
   */
  public static void main(String[] args) {
    try {
      File inFile = null, outFile = null;
      if (args.length > 0) inFile = new File(args[0]);
      if (args.length > 1) outFile = new File(args[1]);

      TreePrinter t = new TreePrinter();
      t.run(inFile, outFile);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public TreePrinter() {
  }

  private void run(File inFile, File outFile) throws Exception {
    CompilerEnvirons env = new CompilerEnvirons();
    ErrorReporter errors = new ToolErrorReporter(true, new PrintStream(System.err));
    Parser parser = new Parser(env, errors);

    FileReader scriptIn = new FileReader(inFile);

    ScriptOrFnNode node = parser.parse(scriptIn, inFile.getAbsolutePath(), 1);

    PrintStream out;
    if (outFile != null) {
      out = new PrintStream(new FileOutputStream(outFile));
    } else {
      out = System.out;
    }

    this.printTree(node, out);

    if (out != System.out)
      out.close();
  }

  public void printTree(ScriptOrFnNode scriptNode, PrintStream out) {
    printNode(out, scriptNode, scriptNode, 0);
  }

  public void printTree(NodeWrapper scriptNode, PrintStream out) {
    printNode(out, scriptNode, 0);
  }

  private void printNode(PrintStream out, Node node, ScriptOrFnNode scriptNode, int indent) {
    for (int i = 0; i < indent; i++)
      out.print(". ");

    out.print(this.nodeToString(node));
    out.println();

    Node child = node.getFirstChild();

    while (child != null) {

      int functionNumber = child.getIntProp(Node.FUNCTION_PROP, -1);
      if (functionNumber >= 0) {
        FunctionNode functionNode = scriptNode.getFunctionNode(functionNumber);
        this.printNode(out, functionNode, functionNode, indent + 1);
      } else {
        this.printNode(out, child, scriptNode, indent + 1);
      }

      child = child.getNext();
    }
  }

  private void printNode(PrintStream out, NodeWrapper node, int indent) {
    for (int i = 0; i < indent; i++)
      out.print(". ");

    out.print(this.nodeToString(node.getJsNode()));
    out.println();

    for (NodeWrapper child : node.getChildren()) {
      if (child.getType() == Token.FUNCTION) {
        NodeWrapper functionNode = child.getRealFunctionNode();
        this.printNode(out, functionNode, indent + 1);
      } else {
        this.printNode(out, child, indent + 1);
      }
    }
  }

  private String nodeToString(Node n) {
    StringBuffer sb = new StringBuffer(Token.name(n.getType()));

    if (n instanceof ScriptOrFnNode) {
      ScriptOrFnNode sof = (ScriptOrFnNode) n;
      if (n instanceof FunctionNode) {
        FunctionNode fn = (FunctionNode) n;
        sb.append(' ');
        sb.append(fn.getFunctionName());
      }
//      sb.append(" [source name: ");
//      sb.append(sof.getSourceName());
//      sb.append("] [encoded source length: ");
//      sb.append(sof.getEncodedSourceEnd()
//          - sof.getEncodedSourceStart());
//      sb.append("] [base line: ");
      sb.append(" [base line: ");
      sb.append(sof.getBaseLineno());
      sb.append("] [end line: ");
      sb.append(sof.getEndLineno());
      sb.append(']');
    } else if (n instanceof Node.Jump) {
      Node.Jump jump = (Node.Jump) n;
      if (n.getType() == Token.BREAK || n.getType() == Token.CONTINUE) {
        sb.append(" [label: ");
        sb.append(jump.getJumpStatement());
        sb.append(']');
      } else if (n.getType() == Token.TRY) {
        Node catchNode = jump.target;
        Node finallyTarget = jump.getFinally();
        if (catchNode != null) {
          sb.append(" [catch: ");
          sb.append(catchNode.hashCode());
          sb.append(']');
        }
        if (finallyTarget != null) {
          sb.append(" [finally: ");
          sb.append(finallyTarget.hashCode());
          sb.append(']');
        }
      } else if (n.getType() == Token.LABEL || n.getType() == Token.LOOP
          || n.getType() == Token.SWITCH) {
        sb.append(" [break: ");
        sb.append(jump.target.hashCode());
        sb.append(']');
        if (n.getType() == Token.LOOP) {
          sb.append(" [continue: ");
          sb.append(jump.getContinue().hashCode());
          sb.append(']');
        }
      } else {
        sb.append(" [target: ");
        sb.append(jump.target.hashCode());
        sb.append(']');
      }
    } else if (n.getType() == Token.NUMBER) {
      sb.append(' ');
      sb.append(n.getDouble());
    } else {
      try {
        sb.append(" '" + n.getString() + "'");
      } catch (ClassCastException e) {
      }
    }

    for (int i = Node.FUNCTION_PROP; i <= Node.LAST_PROP; i++) {
      Object prop = n.getProp(i);
      if (prop != null) sb.append(" {").append(i).append(" ").append(prop).append("}");
      else {
        int intProp = n.getIntProp(i, -100);
        if (intProp != -100) sb.append(" {").append(i).append(" ").append(intProp).append("}");
      }
    }

    if (n.getType() == Token.TARGET)
      sb.append(" ").append(n.hashCode());

    if (n.getLineno() != -1) {
      sb.append(" line:");
      sb.append(n.getLineno());
    }

    return sb.toString();
  }
}
