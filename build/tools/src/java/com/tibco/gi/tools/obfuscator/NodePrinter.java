/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import com.tibco.gi.tools.javascript.Language;
import org.mozilla.javascript.FunctionNode;
import org.mozilla.javascript.Node;
import org.mozilla.javascript.Token;

/**
 * Serializes a Rhino JavaScript parse tree back to JavaScript.
 *
 * @author Jesse Costello-Good
 */
public abstract class NodePrinter {

  // Setting this to a line break increases readability of the resulting JS files. Set it to a space for decreased
  // readability and decreased ease of error reporting.
  private static final String SPACE = "\n";

  private static final Map<Integer, NodePrinter> REGISTRY = new HashMap<Integer, NodePrinter>();
  private static final Map<Integer, Integer> PRECEDENCE = new HashMap<Integer, Integer>();
  private static final Map<Integer, Boolean> REVERSE_TREE = new HashMap<Integer, Boolean>();
  private static final Pattern NAME = Pattern.compile("^[a-zA-Z_]\\w*$");
  private static final Pattern INTEGER = Pattern.compile("^\\d+$");

  // TODO: this shouldn't be static
  private static final Map<NodeWrapper, Integer> LABEL_REGISTRY = new HashMap<NodeWrapper, Integer>();

  /**
   * Returns the node printer for a particular type of JavaScript node.
   *
   * @param node
   * @return
   * @throws IllegalArgumentException if the type of <code>node</code> is not supported. Not all node types are
   * supported.
   */
  public static NodePrinter getPrinter(NodeWrapper node) {
    NodePrinter printer = REGISTRY.get(node.getType());

    if (printer == null)
      throw new IllegalArgumentException("Unregistered type: " + node.getType());

    return printer;
  }

  /**
   * Returns the JavaScript serialization of <code>node</code>.
   *
   * @param node
   * @return
   */
  public static String printNode(NodeWrapper node) {
    return NodePrinter.getPrinter(node).print(node);
  }

  private static void printNode(NodeWrapper node, StringBuilder buffer) {
    NodePrinter.getPrinter(node).print(node, buffer);
  }

  /**
   * Serializes <code>node</code> with this node printer and returns the result.
   *
   * @param node
   * @return
   */
  public final String print(NodeWrapper node) {
    StringBuilder buffer = new StringBuilder();
    print(node, buffer);
    return new String(buffer);
  }

  public abstract void print(NodeWrapper node, StringBuilder buffer);

  protected void appendChildren(NodeWrapper node, StringBuilder buffer) {
    for (NodeWrapper child : node.getChildren()) {
      NodePrinter.printNode(child, buffer);
    }
  }

  protected String escapeRegex(String s) {
    s = s.replaceAll("\"", "\\\\\"");
    return s;
  }

  protected void appendBlockChild(NodeWrapper node, StringBuilder buffer, String statementPrefix) {
    appendBlockChild(node, buffer, statementPrefix, true);
  }

  /**
   * Appends a block statement to the string builder. Many types of nodes have block children, including FOR, WHILE,
   * IF/ELSE, TRY/CATCH, etc. This method ensures that the fewest number of parentheses are used to serialize the
   * block.
   *
   * @param node
   * @param buffer
   * @param statementPrefix
   * @param inline
   */
  protected void appendBlockChild(NodeWrapper node, StringBuilder buffer, String statementPrefix, boolean inline) {

    if (node.getType() == Token.BLOCK || node.getType() == Token.LOCAL_BLOCK) {
      // If inline is possible given the block type, we still need to make sure the contents of the block can
      // be inlined.
      if (inline) {
        int childCount = node.getChildCount();
        if (childCount == 1) {
          ;
        } else if (childCount >= 2) {
          NodeWrapper firstChild = node.getChild(0);

          // If there are more than one child statements, only inline if those statements correspond to a complete
          // IF/ELSE block and nothing more.
          if (firstChild.getType() == Token.IFNE) {
            NodeWrapper ifBlock = firstChild.getFollowingSibling();
            NodeWrapper elseBlock = firstChild.getTarget().getFollowingSibling();
            NodeWrapper penultimateChild = node.getChild(node.getChildCount() - 2);

            inline = (elseBlock == null && ifBlock.equals(penultimateChild)) ||
                (elseBlock != null && elseBlock.equals(penultimateChild));
          } else {
            inline = false;
          }
        } else {
          inline = false;
        }
      }

      if (inline) {
        // If inlining, no brackets are necessary.
        if (node.getChild(0).getType() == Token.EMPTY) {
          buffer.append(";");
        } else {
          buffer.append(statementPrefix);
          NodePrinter.printNode(node.getChild(0), buffer);
        }
      } else {
        buffer.append("{");
        NodePrinter.printNode(node, buffer);
        buffer.append("}");
      }
    } else {
      buffer.append(statementPrefix);
      NodePrinter.printNode(node, buffer);
    }
  }

  /**
   * Returns whether parentheses are needed to surround a child node of type <code>childType</code> from a parent node
   * of type <code>parentType</code>. If the precedence of each type is equal then <code>trueIfEqual</code> is returned.
   * Uses {@link #PRECEDENCE} to determine whether parentheses are needed.
   *
   * @param parentType
   * @param childType
   * @param trueIfEqual
   * @return
   */
  protected boolean needsParens(int parentType, int childType, boolean trueIfEqual) {
    Integer parentPrecedence = PRECEDENCE.get(parentType);
    Integer childPrecedence = PRECEDENCE.get(childType);

    // If precedence is not accounted for, default to parentheses included.
    if (parentPrecedence == null || childPrecedence == null) return true;

    int compare = parentPrecedence.compareTo(childPrecedence);
    return compare == 0
        ? (REVERSE_TREE.get(parentPrecedence) != null ? !trueIfEqual : trueIfEqual)
        : (compare > 0);
  }

  protected void printNodeParen(int parentType, boolean left, NodeWrapper node, StringBuilder buffer) {
    if (needsParens(parentType, node.getType(), !left)) {
      buffer.append("(");
      NodePrinter.printNode(node, buffer);
      buffer.append(")");
    } else {
      NodePrinter.printNode(node, buffer);
    }
  }

  protected String makeLabel(NodeWrapper node) {
    Integer label = LABEL_REGISTRY.get(node);
    int value;
    if (label != null) {
      value = label;
    } else {
      value = LABEL_REGISTRY.size() + 1;
      LABEL_REGISTRY.put(node, value);
    }
    return "L" + Integer.toHexString(value);
  }

  /**
   * Subclass of <code>NodePrinter</code> for simple unary operators.
   */
  private static class UnaryOperator extends NodePrinter {
    private final String operator;

    public UnaryOperator(String operator) {
      this.operator = operator;
    }

    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append(operator);
      this.printNodeParen(node.getType(), false, node.getChild(0), buffer);
    }
  }

  /**
   * Subclass of <code>NodePrinter</code> for simple binary operators.
   */
  private static class BinaryOperator extends NodePrinter {
    private final String operator;

    public BinaryOperator(String operator) {
      this.operator = operator;
    }

    public void print(NodeWrapper node, StringBuilder buffer) {
      NodeWrapper firstChild = node.getChild(0);
      if (firstChild.getType() == Token.USE_STACK) {
        // Account for += -= etc operators.
        buffer.append(operator);
        buffer.append("=");
        this.printNodeParen(node.getType(), false, node.getChild(1), buffer);
      } else {
        this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
        buffer.append(operator);
        this.printNodeParen(node.getType(), false, node.getChild(1), buffer);
      }
    }
  }

  /**
   * Subclass of <code>NodePrinter</code> for simple ternary operators.
   */
  private static class TernaryOperator extends NodePrinter {
    private final String op1;
    private final String op2;

    public TernaryOperator(String op1, String op2) {
      this.op1 = op1;
      this.op2 = op2;
    }

    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append(op1);
      this.printNodeParen(node.getType(), false, node.getChild(1), buffer);
      buffer.append(op2);
      this.printNodeParen(node.getType(), false, node.getChild(2), buffer);
    }
  }

  /**
   * Subclass of <code>NodePrinter</code> that prints nodes that have a static string representation.
   */
  private static class StringPrinter extends NodePrinter {
    private final String s;

    public StringPrinter(String s) {
      this.s = s;
    }

    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append(s);
    }
  }

  /**
   * Subclass of <code>NodePrinter</code> for the ++ and -- operators.
   */
  private static class IncrementDecrement extends NodePrinter {
    private final String op;

    public IncrementDecrement(String op) {
      this.op = op;
    }

    public void print(NodeWrapper node, StringBuilder buffer) {
      if ((node.getJsNode().getIntProp(Node.INCRDECR_PROP, -1) & Node.POST_FLAG) == 0) {
        if (node.getPrecedingSibling() != null)
          buffer.append(SPACE);
        buffer.append(op);
        this.printNodeParen(node.getType(), false, node.getChild(0), buffer);
      } else {
        this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
        buffer.append(op);
        if (node.getFollowingSibling() != null)
          buffer.append(SPACE);
      }
    }
  }

  /**
   * Subclass of <code>NodePrinter</code> for statements that can have labels, such as continue and break.
   */
  private static class Goto extends NodePrinter {
    private final String keyword;

    public Goto(String keyword) {
      this.keyword = keyword;
    }

    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append(keyword);

      NodeWrapper label = node.findNode(((Node.Jump) node.getJsNode()).getJumpStatement());
      if (label != null) {
        if (label.getType() == Token.LABEL) {
          buffer.append(" ").append(makeLabel(label));
        } else if (label.getType() == Token.LOOP && label != node.getParentLoop()) {
          label = label.getPrecedingSibling();
          if (label != null && label.getType() == Token.LABEL)
            buffer.append(" ").append(makeLabel(label));
        }
      }

      buffer.append(";");
    }
  }

  private static NodePrinter SCRIPT = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.appendChildren(node, buffer);
    }
  };

  private static NodePrinter BLOCK = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      if (node.getChildCount() == 0) return;
      NodeWrapper firstChild = node.getChild(0);
      int type = firstChild.getType();
      if (type == Token.IFNE || type == Token.SWITCH || type == Token.TRY || type == Token.CATCH_SCOPE) {
        NodePrinter.printNode(firstChild, buffer);
      } else {
        this.appendChildren(node, buffer);
//        throw new AssertionError("unsupported child of Block " + node + ": " + firstChild);
      }
    }
  };

  private static NodePrinter EXPRESSION = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.appendChildren(node, buffer);

      if (node.getChildCount() != 1 || node.getChild(0).getType() != Token.SETVAR)
        buffer.append(";");
    }
  };

  /**
   * X.prop = Y
   */
  private static NodePrinter SETPROP = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append(".");
      buffer.append(node.getChild(1).getText());
      buffer.append("=");
      NodePrinter.printNode(node.getChild(2), buffer);
    }
  };

  /**
   * X.prop
   */
  private static NodePrinter GETPROP = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append(".");
      buffer.append(node.getChild(1).getText());
    }
  };

  /**
   * text
   */
  private static NodePrinter TEXT = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append(node.getText());
    }
  };

  /**
   * "string"
   */
  private static NodePrinter STRING = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      String text = node.getText();
      boolean singleQuote = text.indexOf("\"") >= 0 && text.indexOf("'") < 0;
      String quote = singleQuote ? "'" : "\"";
      buffer.append(quote).append(Language.escapeString(text, singleQuote)).append(quote);
    }
  };

  /**
   * function X(Y1, Y2, ...) { ... }
   */
  private static NodePrinter FUNCTION = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      node = node.getRealFunctionNode();

      FunctionNode fNode = (FunctionNode) node.getJsNode();
      buffer.append("function");
      String functionName = node.getFunctionName();
      if (functionName != null && !functionName.equals("") && !functionName.equals(" "))
        buffer.append(SPACE).append(functionName);
      buffer.append("(");
      List<String> params = node.getParameterNames();
      for (int i = 0; i < params.size(); i++) {
        if (i > 0) buffer.append(",");
        buffer.append(params.get(i));
      }
      buffer.append("){");

      NodeWrapper blockNode = node.getChild(0);
      int childCount = blockNode.getChildCount();
      for (int i = 0; i < childCount; i++) {
        NodeWrapper child = blockNode.getChild(i);
        // skip last empty return statement in function
        if ((i == childCount - 1) && child.getType() == Token.RETURN && child.getChildCount() == 0)
          break;

        NodePrinter.printNode(child, buffer);
      }

      buffer.append("}");
    }
  };

  /**
   * new X(Y1, Y2, ...)
   */
  private static NodePrinter NEW = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("new" + SPACE);
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append("(");
      for (int i = 1; i < node.getChildCount(); i++) {
        if (i > 1) buffer.append(",");
        NodePrinter.printNode(node.getChild(i), buffer);
      }
      buffer.append(")");
    }
  };

  /**
   * X(Y1, Y2, ...)
   */
  private static NodePrinter CALL = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append("(");
      for (int i = 1; i < node.getChildCount(); i++) {
        if (i > 1) buffer.append(",");
        NodePrinter.printNode(node.getChild(i), buffer);
      }
      buffer.append(")");
    }
  };

  private static NodePrinter EMPTY = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
    }
  };

  /**
   * if(X) { ... } else { ... }
   */
  private static NodePrinter IFNE = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("if(");
      NodePrinter.printNode(node.getChild(0), buffer);
      buffer.append(")");

      NodeWrapper ifBlock = node.getFollowingSibling();
      NodeWrapper elseBlock = node.getTarget().getFollowingSibling();
      // I don't quite understand how to figure out whether this may be inlined ... if this IF block has an ELSE
      // and a nested IF block also has an ELSE block, we run into trouble.
      this.appendBlockChild(ifBlock, buffer, "", elseBlock == null);

      if (elseBlock != null) {
        buffer.append("else");
        this.appendBlockChild(elseBlock, buffer, " ");
      }
    }
  };

  /**
   * number
   */
  private static NodePrinter NUMBER = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      double value = node.getJsNode().getDouble();
      if (value == Math.round(value))
        buffer.append((int) value);
      else
        buffer.append(value);
    }
  };

  /**
   * var n1 = X1, n2 = X2, ...;
   */
  private static NodePrinter VAR = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("var" + SPACE);
      for (int i = 0; i < node.getChildCount(); i++) {
        if (i > 0) buffer.append(",");
        NodeWrapper child = node.getChild(i);
        buffer.append(child.getText());
        if (child.getChildCount() > 0) {
          buffer.append("=");
          NodePrinter.printNode(child.getChild(0), buffer);
        }
      }
      buffer.append(";");
    }
  };

  /**
   * return X;
   */
  private static NodePrinter RETURN = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("return");
      if (node.getChildCount() > 0) {
        buffer.append(" ");
        NodePrinter.printNode(node.getChild(0), buffer);
      }
      buffer.append(";");
    }
  };

  /**
   * X[Y]
   */
  private static NodePrinter GETELEM = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append("[");
      NodePrinter.printNode(node.getChild(1), buffer);
      buffer.append("]");
    }
  };

  /**
   * X[Y] = Z
   */
  private static NodePrinter SETELEM = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append("[");
      NodePrinter.printNode(node.getChild(1), buffer);
      buffer.append("]=");
      NodePrinter.printNode(node.getChild(2), buffer);
    }
  };

  /**
   * X.prop ?
   */
  private static NodePrinter SETPROP_OP = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append(".");
      buffer.append(node.getChild(1).getText());
      NodePrinter.printNode(node.getChild(2), buffer);
    }
  };

  /**
   * X[Y] ?
   */
  private static NodePrinter SETELEM_OP = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      buffer.append("[");
      NodePrinter.printNode(node.getChild(1), buffer);
      buffer.append("]");
      NodePrinter.printNode(node.getChild(2), buffer);
    }
  };

  /**
   * delete X.prop or delete X[Y]
   */
  private static NodePrinter DELPROP = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("delete ");
      this.printNodeParen(node.getType(), true, node.getChild(0), buffer);
      NodeWrapper fieldNode = node.getChild(1);
      if (fieldNode.getType() == Token.STRING) {
        String text = fieldNode.getText();
        if (NAME.matcher(text).matches()) {
          buffer.append(".");
          buffer.append(text);
        } else {
          buffer.append("[");
          NodePrinter.printNode(fieldNode, buffer);
          buffer.append("]");
        }
      } else {
        buffer.append("[");
        NodePrinter.printNode(fieldNode, buffer);
        buffer.append("]");
      }
    }
  };

  /**
   * for, for...in, while, do
   */
  private static NodePrinter LOOP = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      // FOR...IN
      if (node.getChild(0).getType() == Token.ENUM_INIT_KEYS || node.getChild(1).getType() == Token.ENUM_INIT_KEYS) {
        LOOP_FORIN.print(node, buffer);
      }
      // may be WHILE or FOR without init
      else if (node.getChild(0).getType() == Token.GOTO) {
        // WHILE has this
        if (node.getChild(0).getTarget() == node.getContinue()) {
          LOOP_WHILE.print(node, buffer);
        } else {
          LOOP_FOR.print(node, buffer);
        }
      }
      // FOR with init
      else if (node.getChild(1).getType() == Token.GOTO) {
        LOOP_FOR.print(node, buffer);
      }
      // DO...WHILE
      else {
        LOOP_DOWHILE.print(node, buffer);
      }
    }
  };

  /**
   * for() {}
   */
  private static NodePrinter LOOP_FOR = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      NodeWrapper initNode = null;
      if (node.getChild(0).getType() != Token.GOTO)
        initNode = node.getChild(0);

      NodeWrapper incrNode = node.getContinue().getFollowingSibling();
      NodeWrapper testNode = node.getChild(initNode == null ? 0 : 1).getTarget().getFollowingSibling();
      NodeWrapper blockNode = testNode.getTarget().getFollowingSibling();

      buffer.append("for(");
      if (initNode != null)
        NodePrinter.printNode(initNode, buffer);
      else
        buffer.append(";");
      if (testNode.getChildCount() > 0)
        NodePrinter.printNode(testNode.getChild(0), buffer);
      buffer.append(";");
      if (incrNode != null && incrNode.getChildCount() > 0)
        NodePrinter.printNode(incrNode.getChild(0), buffer);
      buffer.append(")");

      this.appendBlockChild(blockNode, buffer, "");
    }
  };

  /**
   * while() {}
   */
  private static NodePrinter LOOP_WHILE = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      NodeWrapper testNode = node.getContinue().getFollowingSibling();
      NodeWrapper blockNode = testNode.getTarget().getFollowingSibling();
      buffer.append("while(");
      NodePrinter.printNode(testNode.getChild(0), buffer);
      buffer.append(")");

      this.appendBlockChild(blockNode, buffer, "");
    }
  };

  /**
   * for(i : X) {}
   */
  private static NodePrinter LOOP_FORIN = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      if (node.getChild(0).getType() == Token.ENUM_INIT_KEYS) {
        NodeWrapper blockNode = node.getContinue().getFollowingSibling().getTarget().getFollowingSibling();
        NodeWrapper iteratorName = blockNode.getChild(0).getChild(0).getChild(0);
        buffer.append("for(");
        NodePrinter.printNode(iteratorName, buffer);
        buffer.append(" in ");
        NodePrinter.printNode(node.getChild(0).getChild(0), buffer);
        buffer.append(")");
        this.appendBlockChild(blockNode.getChild(1), buffer, "");
      } else if (node.getChild(1).getType() == Token.ENUM_INIT_KEYS) {
        assert node.getChild(0).getType() == Token.VAR;
        buffer.append("for(var ");
        NodePrinter.printNode(node.getChild(0).getChild(0), buffer);
        buffer.append(" in ");
        NodePrinter.printNode(node.getChild(1).getChild(0), buffer);
        buffer.append(")");

        NodeWrapper blockNode = node.getContinue().getFollowingSibling().getTarget().getFollowingSibling();
        if (blockNode.getChildCount() == 2 && blockNode.getChild(0).getType() == Token.EXPR_VOID)
          this.appendBlockChild(blockNode.getChild(1), buffer, "");
        else
          this.appendBlockChild(blockNode, buffer, "");
      }
    }
  };

  /**
   * do {} while()
   */
  private static NodePrinter LOOP_DOWHILE = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      NodeWrapper testNode = node.getContinue().getFollowingSibling();
      NodeWrapper blockNode = testNode.getTarget().getFollowingSibling();
      buffer.append("do");
      this.appendBlockChild(blockNode, buffer, SPACE);
      buffer.append("while(");
      NodePrinter.printNode(testNode.getChild(0), buffer);
      buffer.append(");");
    }
  };

  /**
   * typeof name
   */
  private static NodePrinter TYPEOFNAME = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("typeof ");
      buffer.append(node.getText());
    }
  };

  /**
   * typeof(X)
   */
  private static NodePrinter TYPEOF = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      boolean paren = needsParens(node.getType(), node.getChild(0).getType(), false);
      buffer.append("typeof");
      buffer.append(paren ? "(" : " ");
      NodePrinter.printNode(node.getChild(0), buffer);
      if (paren)
        buffer.append(")");
    }
  };

  /**
   * throw X;
   */
  private static NodePrinter THROW = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("throw ");
      NodePrinter.printNode(node.getChild(0), buffer);
      buffer.append(";");
    }
  };

  /**
   * /regex/
   */
  private static NodePrinter REGEX = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("/");
      buffer.append(escapeRegex(node.getRegexpString()));
      buffer.append("/");
      buffer.append(node.getRegexpFlags());
    }
  };

  /**
   * [X1, X2, ...]
   */
  private static NodePrinter ARRAYLIT = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("[");
      for (int i = 0; i < node.getChildCount(); i++) {
        if (i > 0) buffer.append(",");
        NodePrinter.printNode(node.getChild(i), buffer);
      }
      buffer.append("]");
    }
  };

  /**
   * {a: X1, b: X2, ...}
   */
  private static NodePrinter OBJECTLIT = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("{");
      Object[] fields = (Object[]) node.getJsNode().getProp(Node.OBJECT_IDS_PROP);
      for (int i = 0; i < fields.length; i++) {
        if (i > 0) buffer.append(",");
        Object field = fields[i];
        if (field instanceof String) {
          String s = (String) field;
          if ((NAME.matcher(s).find() || INTEGER.matcher(s).find()) && !Language.RESERVED_WORDS.contains(s))
            buffer.append(field);
          else
            buffer.append('"').append(Language.escapeString(s)).append('"');
        } else {
          buffer.append(((Number) field).intValue());
        }
        buffer.append(":");
        NodePrinter.printNode(node.getChild(i), buffer);
      }
      buffer.append("}");
    }
  };

  /**
   * try {}
   */
  private static NodePrinter TRY = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      NodeWrapper tryBlock = node.getChild(0);
      NodeWrapper catchBlock = node.getCatch();
      NodeWrapper finallyBlock = node.getFinally();

      buffer.append("try");
      this.appendBlockChild(tryBlock, buffer, SPACE, false);

      if (catchBlock != null)
        NodePrinter.printNode(catchBlock.getFollowingSibling().getChild(0), buffer);

      if (finallyBlock != null)
        this.appendBlockChild(finallyBlock.getFollowingSibling(), buffer, "", false);
    }
  };

  /**
   * catch (e) {}
   */
  private static NodePrinter CATCH_SCOPE = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("catch(");
      NodePrinter.printNode(node.getChild(0), buffer);
      buffer.append(")");
      this.appendBlockChild(node.getFollowingSibling(), buffer, "", false);
    }
  };

  /**
   * finally {}
   */
  private static NodePrinter FINALLY = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("finally");
      this.appendBlockChild(node.getChild(0), buffer, SPACE, false);
    }
  };

  /**
   * switch(X) {}
   */
  private static NodePrinter SWITCH = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("switch(");
      NodePrinter.printNode(node.getChild(0), buffer);
      buffer.append("){");

      int numChildren = node.getChildCount();
      for (int i = 1; i < numChildren; i++) {
        NodePrinter.printNode(node.getChild(i), buffer);
      }

      NodeWrapper defaultNode = node.getFollowingSibling().getTarget().getFollowingSibling();
      if (defaultNode != null && defaultNode.getChildCount() > 0) {
        assert defaultNode.getType() == Token.BLOCK;
        buffer.append("default:");
        NodePrinter.printNode(defaultNode, buffer);
      }

      buffer.append("}");
    }
  };

  /**
   * case X:
   */
  private static NodePrinter CASE = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append("case ");
      NodePrinter.printNode(node.getChild(0), buffer);
      buffer.append(":");

      NodeWrapper target = node.getTarget(node.getParent().getParent()).getFollowingSibling();
      if (target != null && target.getChildCount() > 0) {
        assert target.getType() == Token.BLOCK;
        NodePrinter.printNode(target, buffer);
      }
    }
  };

  /**
   * label:
   */
  private static NodePrinter LABEL = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      buffer.append(makeLabel(node)).append(":");
    }
  };

  private static NodePrinter SETVAR = new NodePrinter() {
    public void print(NodeWrapper node, StringBuilder buffer) {
      if (node.getChild(1).getType() == Token.THISFN) {
        // node.getParentFunction().setFunctionName(node.getChild(0).getText());
      } else {
        throw new AssertionError(node.getChild(0) + " " + node.getChild(1));
      }
    }
  };

  /*
   * This map maps Rhino token types to the NodePrinter instance that serializes nodes of that type. Not all node
   * types are supported, in which case null is the mapped value here.
   */
  static {
    REGISTRY.put(Token.ERROR, null);
    REGISTRY.put(Token.EOF, null);
    REGISTRY.put(Token.EOL, null);
    REGISTRY.put(Token.ENTERWITH, EMPTY);
    REGISTRY.put(Token.LEAVEWITH, EMPTY);
    REGISTRY.put(Token.RETURN, RETURN);
    REGISTRY.put(Token.GOTO, EMPTY);
    REGISTRY.put(Token.IFEQ, null);
    REGISTRY.put(Token.IFNE, IFNE);
    REGISTRY.put(Token.SETNAME, new BinaryOperator("="));
    REGISTRY.put(Token.BITOR, new BinaryOperator("|"));
    REGISTRY.put(Token.BITXOR, new BinaryOperator("^"));
    REGISTRY.put(Token.BITAND, new BinaryOperator("&"));
    REGISTRY.put(Token.EQ, new BinaryOperator("=="));
    REGISTRY.put(Token.NE, new BinaryOperator("!="));
    REGISTRY.put(Token.LT, new BinaryOperator("<"));
    REGISTRY.put(Token.LE, new BinaryOperator("<="));
    REGISTRY.put(Token.GT, new BinaryOperator(">"));
    REGISTRY.put(Token.GE, new BinaryOperator(">="));
    REGISTRY.put(Token.LSH, new BinaryOperator("<<"));
    REGISTRY.put(Token.RSH, new BinaryOperator(">>"));
    REGISTRY.put(Token.URSH, new BinaryOperator(">>>"));
    REGISTRY.put(Token.ADD, new BinaryOperator("+"));
    REGISTRY.put(Token.SUB, new BinaryOperator("-"));
    REGISTRY.put(Token.MUL, new BinaryOperator("*"));
    REGISTRY.put(Token.DIV, new BinaryOperator("/"));
    REGISTRY.put(Token.MOD, new BinaryOperator("%"));
    REGISTRY.put(Token.NOT, new UnaryOperator("!"));
    REGISTRY.put(Token.BITNOT, new UnaryOperator("~"));
    REGISTRY.put(Token.POS, new UnaryOperator("+"));
    REGISTRY.put(Token.NEG, new UnaryOperator("-"));
    REGISTRY.put(Token.NEW, NEW);
    REGISTRY.put(Token.DELPROP, DELPROP);
    REGISTRY.put(Token.TYPEOF, TYPEOF);
    REGISTRY.put(Token.GETPROP, GETPROP);
    REGISTRY.put(Token.SETPROP, SETPROP);
    REGISTRY.put(Token.GETELEM, GETELEM);
    REGISTRY.put(Token.SETELEM, SETELEM);
    REGISTRY.put(Token.CALL, CALL);
    REGISTRY.put(Token.NAME, TEXT);
    REGISTRY.put(Token.NUMBER, NUMBER);
    REGISTRY.put(Token.STRING, STRING);
    REGISTRY.put(Token.NULL, new StringPrinter("null"));
    REGISTRY.put(Token.THIS, new StringPrinter("this"));
    REGISTRY.put(Token.FALSE, new StringPrinter("false"));
    REGISTRY.put(Token.TRUE, new StringPrinter("true"));
    REGISTRY.put(Token.SHEQ, new BinaryOperator("==="));
    REGISTRY.put(Token.SHNE, new BinaryOperator("!=="));
    REGISTRY.put(Token.REGEXP, REGEX);
    REGISTRY.put(Token.BINDNAME, TEXT);
    REGISTRY.put(Token.THROW, THROW);
    REGISTRY.put(Token.RETHROW, null);
    REGISTRY.put(Token.IN, null);
    REGISTRY.put(Token.INSTANCEOF, new BinaryOperator(" instanceof "));
    REGISTRY.put(Token.LOCAL_LOAD, EMPTY);
    REGISTRY.put(Token.GETVAR, null);
    REGISTRY.put(Token.SETVAR, SETVAR);
    REGISTRY.put(Token.CATCH_SCOPE, CATCH_SCOPE);
    REGISTRY.put(Token.ENUM_INIT_KEYS, null);
    REGISTRY.put(Token.ENUM_INIT_VALUES, null);
    REGISTRY.put(Token.ENUM_NEXT, null);
    REGISTRY.put(Token.ENUM_ID, null);
    REGISTRY.put(Token.THISFN, null);
    REGISTRY.put(Token.RETURN_RESULT, null);
    REGISTRY.put(Token.ARRAYLIT, ARRAYLIT);
    REGISTRY.put(Token.OBJECTLIT, OBJECTLIT);
    REGISTRY.put(Token.GET_REF, null);
    REGISTRY.put(Token.SET_REF, null);
    REGISTRY.put(Token.DEL_REF, null);
    REGISTRY.put(Token.REF_CALL, null);
    REGISTRY.put(Token.REF_SPECIAL, null);
    REGISTRY.put(Token.DEFAULTNAMESPACE, null);
    REGISTRY.put(Token.ESCXMLATTR, null);
    REGISTRY.put(Token.ESCXMLTEXT, null);
    REGISTRY.put(Token.REF_MEMBER, null);
    REGISTRY.put(Token.REF_NS_MEMBER, null);
    REGISTRY.put(Token.REF_NAME, null);
    REGISTRY.put(Token.REF_NS_NAME, null);
    REGISTRY.put(Token.TRY, TRY);
    REGISTRY.put(Token.SEMI, null);
    REGISTRY.put(Token.LB, null);
    REGISTRY.put(Token.RB, null);
    REGISTRY.put(Token.LC, null);
    REGISTRY.put(Token.RC, null);
    REGISTRY.put(Token.LP, null);
    REGISTRY.put(Token.RP, null);
    REGISTRY.put(Token.COMMA, new BinaryOperator(","));
    REGISTRY.put(Token.ASSIGN, new BinaryOperator("="));
    REGISTRY.put(Token.ASSIGN_BITOR, new BinaryOperator("|="));
    REGISTRY.put(Token.ASSIGN_BITXOR, new BinaryOperator("^="));
    REGISTRY.put(Token.ASSIGN_BITAND, new BinaryOperator("&="));
    REGISTRY.put(Token.ASSIGN_LSH, new BinaryOperator("<<="));
    REGISTRY.put(Token.ASSIGN_RSH, new BinaryOperator(">>="));
    REGISTRY.put(Token.ASSIGN_URSH, new BinaryOperator(">>>="));
    REGISTRY.put(Token.ASSIGN_ADD, new BinaryOperator("+="));
    REGISTRY.put(Token.ASSIGN_SUB, new BinaryOperator("-="));
    REGISTRY.put(Token.ASSIGN_MUL, new BinaryOperator("*="));
    REGISTRY.put(Token.ASSIGN_DIV, new BinaryOperator("/="));
    REGISTRY.put(Token.ASSIGN_MOD, new BinaryOperator("%="));
    REGISTRY.put(Token.HOOK, new TernaryOperator("?", ":"));
    REGISTRY.put(Token.COLON, null);
    REGISTRY.put(Token.OR, new BinaryOperator("||"));
    REGISTRY.put(Token.AND, new BinaryOperator("&&"));
    REGISTRY.put(Token.INC, new IncrementDecrement("++"));
    REGISTRY.put(Token.DEC, new IncrementDecrement("--"));
    REGISTRY.put(Token.DOT, null);
    REGISTRY.put(Token.FUNCTION, FUNCTION);
    REGISTRY.put(Token.EXPORT, null);
    REGISTRY.put(Token.IMPORT, null);
    REGISTRY.put(Token.IF, null);
    REGISTRY.put(Token.ELSE, null);
    REGISTRY.put(Token.SWITCH, SWITCH);
    REGISTRY.put(Token.CASE, CASE);
    REGISTRY.put(Token.DEFAULT, new StringPrinter("default:"));
    REGISTRY.put(Token.WHILE, null);
    REGISTRY.put(Token.DO, null);
    REGISTRY.put(Token.FOR, null);
    REGISTRY.put(Token.BREAK, new Goto("break"));
    REGISTRY.put(Token.CONTINUE, new Goto("continue"));
    REGISTRY.put(Token.VAR, VAR);
    REGISTRY.put(Token.WITH, SCRIPT);
    REGISTRY.put(Token.CATCH, null);
    REGISTRY.put(Token.FINALLY, FINALLY);
    REGISTRY.put(Token.VOID, null);
    REGISTRY.put(Token.RESERVED, null);
    REGISTRY.put(Token.EMPTY, EMPTY);
    REGISTRY.put(Token.BLOCK, BLOCK);
    REGISTRY.put(Token.LABEL, LABEL);
    REGISTRY.put(Token.TARGET, EMPTY);
    REGISTRY.put(Token.LOOP, LOOP);
    REGISTRY.put(Token.EXPR_VOID, EXPRESSION);
    REGISTRY.put(Token.EXPR_RESULT, EXPRESSION);
    REGISTRY.put(Token.JSR, null);
    REGISTRY.put(Token.SCRIPT, SCRIPT);
    REGISTRY.put(Token.TYPEOFNAME, TYPEOFNAME);
    REGISTRY.put(Token.USE_STACK, null);
    REGISTRY.put(Token.SETPROP_OP, SETPROP_OP);
    REGISTRY.put(Token.SETELEM_OP, SETELEM_OP);
    REGISTRY.put(Token.LOCAL_BLOCK, BLOCK);
    REGISTRY.put(Token.SET_REF_OP, null);
    REGISTRY.put(Token.DOTDOT, null);
    REGISTRY.put(Token.COLONCOLON, null);
    REGISTRY.put(Token.XML, null);
    REGISTRY.put(Token.DOTQUERY, null);
    REGISTRY.put(Token.XMLATTR, null);
    REGISTRY.put(Token.XMLEND, null);
    REGISTRY.put(Token.LAST_TOKEN, null);
  }

  private static final int PREC_TOKEN = 180;
  private static final int PREC_MEMBER = 170;
  private static final int PREC_CREATE_INSTANCE = 160;
  private static final int PREC_CALL = 150; // 150 according to JavaScript guide but I get extraneous parens
  private static final int PREC_NEGATION_INCREMENT = 140;
  private static final int PREC_MULTIPLY_DIVIDE = 130;
  private static final int PREC_ADDITION_SUBSTRACTION = 120;
  private static final int PREC_BITWISE_SHIFT = 110;
  private static final int PREC_RELATIONAL = 100;
  private static final int PREC_EQUALITY = 90;
  private static final int PREC_BITWISE_AND = 80;
  private static final int PREC_BITWISE_XOR = 70;
  private static final int PREC_BITWISE_OR = 60;
  private static final int PREC_LOGICAL_AND = 50;
  private static final int PREC_LOGICAL_OR = 40;
  private static final int PREC_CONDITIONAL = 30;
  private static final int PREC_ASSIGNMENT = 20;
  private static final int PREC_COMMA = 10;

  /*
   * This has something to do with the fact that some types of operators are "reversed" and require parentheses for
   * when a child's precendence is equal to their precedence for the inverse condition as normal operators.
   */
  static {
    REVERSE_TREE.put(PREC_CONDITIONAL, true);
    REVERSE_TREE.put(PREC_LOGICAL_OR, true);
    REVERSE_TREE.put(PREC_LOGICAL_AND, true);
//    REVERSE_TREE.put(PREC_BITWISE_OR, true);
//    REVERSE_TREE.put(PREC_BITWISE_XOR, true);
//    REVERSE_TREE.put(PREC_BITWISE_AND, true);
  }

  /*
   * This map maps Rhino token types to relative precedence values. This data helps determine when parentheses are
   * required.
   */
  static {
    PRECEDENCE.put(Token.ERROR, null);
    PRECEDENCE.put(Token.EOF, null);
    PRECEDENCE.put(Token.EOL, null);
    PRECEDENCE.put(Token.ENTERWITH, null);
    PRECEDENCE.put(Token.LEAVEWITH, null);
    PRECEDENCE.put(Token.RETURN, null);
    PRECEDENCE.put(Token.GOTO, null);
    PRECEDENCE.put(Token.IFEQ, null);
    PRECEDENCE.put(Token.IFNE, null);
    PRECEDENCE.put(Token.SETNAME, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.BITOR, PREC_BITWISE_OR);
    PRECEDENCE.put(Token.BITXOR, PREC_BITWISE_XOR);
    PRECEDENCE.put(Token.BITAND, PREC_BITWISE_AND);
    PRECEDENCE.put(Token.EQ, PREC_EQUALITY);
    PRECEDENCE.put(Token.NE, PREC_EQUALITY);
    PRECEDENCE.put(Token.LT, PREC_RELATIONAL);
    PRECEDENCE.put(Token.LE, PREC_RELATIONAL);
    PRECEDENCE.put(Token.GT, PREC_RELATIONAL);
    PRECEDENCE.put(Token.GE, PREC_RELATIONAL);
    PRECEDENCE.put(Token.LSH, PREC_BITWISE_SHIFT);
    PRECEDENCE.put(Token.RSH, PREC_BITWISE_SHIFT);
    PRECEDENCE.put(Token.URSH, PREC_BITWISE_SHIFT);
    PRECEDENCE.put(Token.ADD, PREC_ADDITION_SUBSTRACTION);
    PRECEDENCE.put(Token.SUB, PREC_ADDITION_SUBSTRACTION);
    PRECEDENCE.put(Token.MUL, PREC_MULTIPLY_DIVIDE);
    PRECEDENCE.put(Token.DIV, PREC_MULTIPLY_DIVIDE);
    PRECEDENCE.put(Token.MOD, PREC_MULTIPLY_DIVIDE);
    PRECEDENCE.put(Token.NOT, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.BITNOT, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.POS, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.NEG, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.NEW, PREC_CREATE_INSTANCE);
    PRECEDENCE.put(Token.DELPROP, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.TYPEOF, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.GETPROP, PREC_MEMBER);
    PRECEDENCE.put(Token.SETPROP, PREC_MEMBER);
    PRECEDENCE.put(Token.GETELEM, PREC_MEMBER);
    PRECEDENCE.put(Token.SETELEM, PREC_MEMBER);
    PRECEDENCE.put(Token.CALL, PREC_CALL);
    PRECEDENCE.put(Token.NAME, PREC_TOKEN);
    PRECEDENCE.put(Token.NUMBER, PREC_TOKEN);
    PRECEDENCE.put(Token.STRING, PREC_TOKEN);
    PRECEDENCE.put(Token.NULL, PREC_TOKEN);
    PRECEDENCE.put(Token.THIS, PREC_TOKEN);
    PRECEDENCE.put(Token.FALSE, PREC_TOKEN);
    PRECEDENCE.put(Token.TRUE, PREC_TOKEN);
    PRECEDENCE.put(Token.SHEQ, PREC_EQUALITY);
    PRECEDENCE.put(Token.SHNE, PREC_EQUALITY);
    PRECEDENCE.put(Token.REGEXP, PREC_TOKEN);
    PRECEDENCE.put(Token.BINDNAME, PREC_TOKEN);
    PRECEDENCE.put(Token.THROW, null);
    PRECEDENCE.put(Token.RETHROW, null);
    PRECEDENCE.put(Token.IN, null);
    PRECEDENCE.put(Token.INSTANCEOF, PREC_RELATIONAL);
    PRECEDENCE.put(Token.LOCAL_LOAD, null);
    PRECEDENCE.put(Token.GETVAR, null);
    PRECEDENCE.put(Token.SETVAR, null);
    PRECEDENCE.put(Token.CATCH_SCOPE, null);
    PRECEDENCE.put(Token.ENUM_INIT_KEYS, null);
    PRECEDENCE.put(Token.ENUM_INIT_VALUES, null);
    PRECEDENCE.put(Token.ENUM_NEXT, null);
    PRECEDENCE.put(Token.ENUM_ID, null);
    PRECEDENCE.put(Token.THISFN, null);
    PRECEDENCE.put(Token.RETURN_RESULT, null);
    PRECEDENCE.put(Token.ARRAYLIT, PREC_TOKEN);
    PRECEDENCE.put(Token.OBJECTLIT, PREC_TOKEN);
    PRECEDENCE.put(Token.GET_REF, null);
    PRECEDENCE.put(Token.SET_REF, null);
    PRECEDENCE.put(Token.DEL_REF, null);
    PRECEDENCE.put(Token.REF_CALL, null);
    PRECEDENCE.put(Token.REF_SPECIAL, null);
    PRECEDENCE.put(Token.DEFAULTNAMESPACE, null);
    PRECEDENCE.put(Token.ESCXMLATTR, null);
    PRECEDENCE.put(Token.ESCXMLTEXT, null);
    PRECEDENCE.put(Token.REF_MEMBER, null);
    PRECEDENCE.put(Token.REF_NS_MEMBER, null);
    PRECEDENCE.put(Token.REF_NAME, null);
    PRECEDENCE.put(Token.REF_NS_NAME, null);
    PRECEDENCE.put(Token.TRY, null);
    PRECEDENCE.put(Token.SEMI, null);
    PRECEDENCE.put(Token.LB, null);
    PRECEDENCE.put(Token.RB, null);
    PRECEDENCE.put(Token.LC, null);
    PRECEDENCE.put(Token.RC, null);
    PRECEDENCE.put(Token.LP, null);
    PRECEDENCE.put(Token.RP, null);
    PRECEDENCE.put(Token.COMMA, PREC_COMMA);
    PRECEDENCE.put(Token.ASSIGN, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_BITOR, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_BITXOR, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_BITAND, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_LSH, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_RSH, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_URSH, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_ADD, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_SUB, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_MUL, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_DIV, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.ASSIGN_MOD, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.HOOK, PREC_CONDITIONAL);
    PRECEDENCE.put(Token.COLON, null);
    PRECEDENCE.put(Token.OR, PREC_LOGICAL_OR);
    PRECEDENCE.put(Token.AND, PREC_LOGICAL_AND);
    PRECEDENCE.put(Token.INC, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.DEC, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.DOT, null);
    PRECEDENCE.put(Token.FUNCTION, null);
    PRECEDENCE.put(Token.EXPORT, null);
    PRECEDENCE.put(Token.IMPORT, null);
    PRECEDENCE.put(Token.IF, null);
    PRECEDENCE.put(Token.ELSE, null);
    PRECEDENCE.put(Token.SWITCH, null);
    PRECEDENCE.put(Token.CASE, null);
    PRECEDENCE.put(Token.DEFAULT, null);
    PRECEDENCE.put(Token.WHILE, null);
    PRECEDENCE.put(Token.DO, null);
    PRECEDENCE.put(Token.FOR, null);
    PRECEDENCE.put(Token.BREAK, null);
    PRECEDENCE.put(Token.CONTINUE, null);
    PRECEDENCE.put(Token.VAR, null);
    PRECEDENCE.put(Token.WITH, null);
    PRECEDENCE.put(Token.CATCH, null);
    PRECEDENCE.put(Token.FINALLY, null);
    PRECEDENCE.put(Token.VOID, PREC_TOKEN);
    PRECEDENCE.put(Token.RESERVED, null);
    PRECEDENCE.put(Token.EMPTY, PREC_TOKEN);
    PRECEDENCE.put(Token.BLOCK, null);
    PRECEDENCE.put(Token.LABEL, null);
    PRECEDENCE.put(Token.TARGET, null);
    PRECEDENCE.put(Token.LOOP, null);
    PRECEDENCE.put(Token.EXPR_VOID, null);
    PRECEDENCE.put(Token.EXPR_RESULT, null);
    PRECEDENCE.put(Token.JSR, null);
    PRECEDENCE.put(Token.SCRIPT, null);
    PRECEDENCE.put(Token.TYPEOFNAME, PREC_NEGATION_INCREMENT);
    PRECEDENCE.put(Token.USE_STACK, null);
    PRECEDENCE.put(Token.SETPROP_OP, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.SETELEM_OP, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.LOCAL_BLOCK, null);
    PRECEDENCE.put(Token.SET_REF_OP, PREC_ASSIGNMENT);
    PRECEDENCE.put(Token.DOTDOT, null);
    PRECEDENCE.put(Token.COLONCOLON, null);
    PRECEDENCE.put(Token.XML, null);
    PRECEDENCE.put(Token.DOTQUERY, null);
    PRECEDENCE.put(Token.XMLATTR, null);
    PRECEDENCE.put(Token.XMLEND, null);
    PRECEDENCE.put(Token.LAST_TOKEN, null);
  }
}
