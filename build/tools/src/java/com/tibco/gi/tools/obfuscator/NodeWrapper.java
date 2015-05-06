/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.NoSuchElementException;

import org.mozilla.javascript.FunctionNode;
import org.mozilla.javascript.Node;
import org.mozilla.javascript.ScriptOrFnNode;
import org.mozilla.javascript.Token;

/**
 * Wraps the Rhino engine's {@link Node} class and provides necessary extra functionality for the obfuscator.
 *
 * @author Jesse Costello-Good
 */
public class NodeWrapper {

  public static final Comparator<Node> NODE_COMPARATOR = new Comparator<Node>() {
    public int compare(Node o1, Node o2) {
      if (o1 == o2) return 0;

      int l1 = o1.getLineno(), l2 = o2.getLineno();
      if (l1 == l2) {
        int t1 = o1.getType(), t2 = o2.getType();
        return t1 > t2 ? 1 : t1 == t2 ? 0 : -1;
      } else if (l1 > l2) return 1;
      else return -1;
    }
  };

  /**
   * Depth-first or breadth-first node iterator.
   */
  private static class NodeIterator implements Iterator<NodeWrapper> {

    private final boolean depthFirst;
    private final List<NodeWrapper> queue;

    public NodeIterator(NodeWrapper root, boolean depthFirst) {
      this.depthFirst = depthFirst;
      queue = new LinkedList<NodeWrapper>();
      queue.add(root);
    }

    public boolean hasNext() {
      return queue.size() > 0;
    }

    public NodeWrapper next() {
      if (queue.size() == 0) throw new NoSuchElementException();

      NodeWrapper next = queue.remove(0);
      if (next.getType() == Token.FUNCTION)
        next = next.getRealFunctionNode();

      if (depthFirst) {
        queue.addAll(0, next.getChildren());
      } else {
        queue.addAll(next.getChildren());
      }

      return next;
    }

    public void remove() {
      throw new UnsupportedOperationException();
    }
  }

  private final Node node;
  private NodeWrapper parent;
  private final List<NodeWrapper> children;
  private final List<NodeWrapper> functions;
  private final List<String> parameters;
  private final List<String> variables;
  private String functionName;
  private String regex;
  private String regexFlags;

  public NodeWrapper(Node node) {
    this(node, null);
  }

  public NodeWrapper(Node node, NodeWrapper parent) {
    this.node = node;
    this.parent = parent;

    Node child = node.getFirstChild();
    if (child != null) {
      children = new ArrayList<NodeWrapper>();
      while (child != null) {
        children.add(new NodeWrapper(child, this));
        child = child.getNext();
      }
    } else {
      children = new ArrayList<NodeWrapper>();
    }

    if (node instanceof FunctionNode)
      functionName = ((FunctionNode) node).getFunctionName();

    if (node instanceof ScriptOrFnNode) {
      ScriptOrFnNode sNode = (ScriptOrFnNode) node;
      int functionCount = sNode.getFunctionCount();
      if (functionCount == 0) {
        functions = Collections.emptyList();
      } else {
        functions = new ArrayList<NodeWrapper>(functionCount);
        for (int i = 0; i < functionCount; i++)
          functions.add(new NodeWrapper(sNode.getFunctionNode(i), this));
      }

      int paramCount = sNode.getParamCount();
      parameters = new ArrayList<String>(paramCount);
      for (int i = 0; i < paramCount; i++)
        parameters.add(sNode.getParamOrVarName(i));

      int allCount = sNode.getParamAndVarCount();
      variables = new ArrayList<String>(allCount - paramCount);
      for (int i = paramCount; i < allCount; i++)
        variables.add(sNode.getParamOrVarName(i));
    } else {
      functions = Collections.emptyList();
      parameters = Collections.emptyList();
      variables = Collections.emptyList();
    }
  }

  public boolean isFunctionNode() {
    return this.node instanceof FunctionNode;
  }

  public boolean isScriptOrFunctionNode() {
    return this.node instanceof ScriptOrFnNode;
  }

  public boolean isJumpNode() {
    return this.node instanceof Node.Jump;
  }

  public NodeWrapper getParent() {
    return parent;
  }

  public void setParent(NodeWrapper parent) {
    if (this.parent != null && this.parent != parent)
      this.parent.removeChild(this);
    this.parent = parent;
  }

  public List<NodeWrapper> getChildren() {
    return Collections.unmodifiableList(children);
  }

  public NodeWrapper getChild(int i) {
    return children.get(i);
  }

  public void appendChild(NodeWrapper n) {
    n.setParent(this);
    children.add(n);
  }

  public void insertChild(int i, NodeWrapper n) {
    n.setParent(this);
    children.add(i, n);
  }

  public void setChild(int i, NodeWrapper n) {
    NodeWrapper toReplace = children.get(i);

    if (toReplace != null)
      toReplace.setParent(null);

    n.setParent(this);

    if (children.size() == i)
      children.add(n);
    else
      children.set(i, n);
  }

  public void replaceChild(NodeWrapper replace, NodeWrapper replaceWith) {
    int index = children.indexOf(replace);
    if (index >= 0) {
      replace.setParent(null);
      replaceWith.setParent(this);
      children.add(index, replaceWith);
    } else {
      throw new IllegalArgumentException(replace + " is not a child of " + this);
    }
  }

  public void removeChild(NodeWrapper child) {
    boolean success = children.remove(child);
    if (!success)
      throw new IllegalArgumentException(child + " is not a child of " + this);
  }

  public int getChildCount() {
    return children.size();
  }

  public NodeWrapper getFollowingSibling() {
    List<NodeWrapper> siblings = this.getParent().getChildren();
    int i = siblings.indexOf(this);
    return i < siblings.size() - 1 ? siblings.get(i + 1) : null;
  }

  public NodeWrapper getPrecedingSibling() {
    List<NodeWrapper> siblings = this.getParent().getChildren();
    int i = siblings.indexOf(this);
    return i > 0 ? siblings.get(i - 1) : null;
  }

  public NodeWrapper getCatch() {
    return getTarget(this);
  }

  public NodeWrapper getFinally() {
    Node target = ((Node.Jump) node).getFinally();
    for (NodeWrapper child : this.getChildren()) {
      if (child.getJsNode() == target)
        return child;
    }
    return null;
  }

  public NodeWrapper getBreak() {
    return getTarget(this);
  }

  public NodeWrapper getContinue() {
    Node target = ((Node.Jump) node).getContinue();
    for (NodeWrapper child : this.getChildren()) {
      if (child.getJsNode() == target)
        return child;
    }
    return null;
  }

  public NodeWrapper getTarget() {
    return getTarget(this.getParent());
  }

  public NodeWrapper getTarget(NodeWrapper context) {
    Node target = ((Node.Jump) node).target;

    for (NodeWrapper sibling : context.getChildren()) {
      if (sibling.getJsNode() == target)
        return sibling;
    }
    return null;
  }

  public List<NodeWrapper> getFunctions() {
    return Collections.unmodifiableList(functions);
  }

  public NodeWrapper getFunction(int i) {
    return functions.size() > i && i >= 0 ? functions.get(i) : null;
  }

  public Node getJsNode() {
    return node;
  }

  public NodeWrapper getScriptParent() {
    NodeWrapper node = this;
    while (node != null && !node.isScriptOrFunctionNode()) node = node.getParent();
    return node;
  }

  public NodeWrapper getFunctionInScope(int i) {
    NodeWrapper node = this.getScriptParent();
    return node != null ? node.getFunction(i) : null;
  }

  public NodeWrapper getRealFunctionNode() {
    return getFunctionInScope(this.getJsNode().getIntProp(Node.FUNCTION_PROP, -1));
  }

  public int getType() {
    return node.getType();
  }

  public void setType(int type) {
    node.setType(type);
  }

  public String getText() {
    if (isFunctionNode())
      return functionName;
    else
      return node.getString();
  }

  public boolean equals(Object obj) {
    if (obj == null) return false;
    if (!(obj instanceof NodeWrapper)) return false;
    if (this == obj) return true;
    return this.node == ((NodeWrapper) obj).node;
  }

  public String toString() {
    return "{@Node " + node.getType() + " line:" + node.getLineno() + "}";
  }

  public List<String> getParameterNames() {
    return Collections.unmodifiableList(parameters);
  }

  public List<String> getVariableNames() {
    return Collections.unmodifiableList(variables);
  }

  public void renameParameter(int param, String to) {
    parameters.set(param, to);
  }

  public void renameVariable(int var, String to) {
    if (variables.size() > var)
      variables.set(var, to);
    else
      variables.add(var, to);
  }

  public int getLineNumber() {
    if (node instanceof ScriptOrFnNode)
      return ((ScriptOrFnNode) node).getBaseLineno();
    else
      return node.getLineno();
  }

  public void setText(String text) {
    if (isFunctionNode())
      functionName = text;
    else
      node.setString(text);
  }

  public NodeWrapper findNode(Node relative) {
    if (relative == null) return null;

    NodeWrapper ancestor = this.getParent();
    while (ancestor != null) {
      for (NodeWrapper child : ancestor.getChildren()) {
        if (child.getJsNode() == relative)
          return child;
      }
      ancestor = ancestor.getParent();
    }
    return null;
  }

  public NodeWrapper getParentLoop() {
    NodeWrapper ancestor = this.getParent();
    while (ancestor != null && ancestor.getType() != Token.LOOP) ancestor = ancestor.getParent();
    return ancestor;
  }

  public NodeWrapper getParentStatement() {
    NodeWrapper ancestor = this.getParent();
    while (ancestor != null && ancestor.getType() != Token.EXPR_VOID) ancestor = ancestor.getParent();
    return ancestor;
  }

  public NodeWrapper getParentFunction() {
    NodeWrapper ancestor = this.getParent();
    while (ancestor != null && ancestor.getType() != Token.FUNCTION) ancestor = ancestor.getParent();
    return ancestor;
  }

  public Iterator<NodeWrapper> getBreadthFirstIterator() {
    return new NodeIterator(this, false);
  }

  public Iterator<NodeWrapper> getDepthFirstIterator() {
    return new NodeIterator(this, true);
  }

  public NodeWrapper cloneSimpleBranch() {
    NodeWrapper c = new NodeWrapper(cloneSimpleNode(node));
    for (NodeWrapper child : children) {
      c.appendChild(child.cloneSimpleBranch());
    }
    return c;
  }

  public static Node cloneSimpleNode(Node n) {
    Node clone;
    int type = n.getType();

    if (type == Token.NAME || type == Token.STRING || type == Token.BINDNAME) {
      clone = Node.newString(type, n.getString());
    } else if (type == Token.NUMBER) {
      clone = Node.newNumber(n.getDouble());
    } else {
      clone = new Node(type);
    }

    return clone;
  }

  public String getFunctionName() {
    return functionName;
  }

  public void setFunctionName(String functionName) {
    this.functionName = functionName;
  }

  public String getRegexpString() {
    // cache these so that rearranging the node will still allow it to be printed
    if (regex == null) {
      int regexNumber = this.getJsNode().getIntProp(Node.REGEXP_PROP, -1);
      ScriptOrFnNode fNode = (ScriptOrFnNode) this.getScriptParent().getJsNode();
      regex = fNode.getRegexpString(regexNumber);
    }
    return regex;
  }

  public String getRegexpFlags() {
    // cache these so that rearranging the node will still allow it to be printed
    if (regexFlags == null) {
      int regexNumber = this.getJsNode().getIntProp(Node.REGEXP_PROP, -1);
      ScriptOrFnNode fNode = (ScriptOrFnNode) this.getScriptParent().getJsNode();
      regexFlags = fNode.getRegexpFlags(regexNumber);
    }
    return regexFlags;
  }
}
