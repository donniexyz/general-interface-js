/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.EmptyStackException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Stack;
import java.util.logging.Logger;

import com.tibco.gi.tools.Utils;
import com.tibco.gi.tools.javascript.Language;
import org.mozilla.javascript.Node;
import org.mozilla.javascript.Token;

/**
 * @author Jesse Costello-Good
 */
public class NodeTraverser {

  private static final Logger LOG = Logger.getLogger(NodeTraverser.class.getName());

  /**
   * A stack data structure that keeps track of all local variables and method parameters in scope at a particular parse
   * node. This class also keeps track of the mapping from original name to mangled name.
   */
  private static class VariableStack implements Map<String, String> {

    private final List<Map<String, String>> stack = new ArrayList<Map<String, String>>();

    /**
     * Call this when entering a nested method/script scope.
     */
    public void push() {
      stack.add(0, new HashMap<String, String>());
      LOG.finer("VariableStack.push() " + stack.size());
    }

    /**
     * Call this when exiting a nested method/script scope to remove all name declared in that scope.
     */
    public void pop() {
      LOG.finer("VariableStack.pop() " + stack.size());
      if (stack.size() == 0)
        throw new EmptyStackException();
      stack.remove(0);
    }

    public String get(Object key) {
      String value = null;
      for (Map<String, String> context : stack) {
        if ((value = context.get(key)) != null)
          break;
      }
      return value;
    }

    public String put(String key, String value) {
      if (stack.size() == 0)
        throw new EmptyStackException();
      return stack.get(0).put(key, value);
    }

    public int size() {
      Map<String, String> temp = new HashMap<String, String>();
      for (Map<String, String> context : stack)
        temp.putAll(context);
      return temp.size();
    }

    public boolean containsValue(Object mangled) {
      for (Map<String, String> context : stack) {
        if (context.containsValue(mangled)) return true;
      }
      return false;
    }

    public String toString() {
      return "VariableStack{size:" + stack.size() + "}";
    }

    public boolean isEmpty() {
      return this.size() == 0;
    }

    public boolean containsKey(Object o) {
      throw new UnsupportedOperationException();
    }

    public String remove(Object o) {
      throw new UnsupportedOperationException();
    }

    public void putAll(Map map) {
      throw new UnsupportedOperationException();
    }

    public void clear() {
      throw new UnsupportedOperationException();
    }

    public Set<String> keySet() {
      Set<String> s = new HashSet<String>();
      for (Map<String, String> map : stack)
        s.addAll(map.keySet());
      return s;
    }

    public Collection<String> values() {
      throw new UnsupportedOperationException();
    }

    public Set<Entry<String, String>> entrySet() {
      throw new UnsupportedOperationException();
    }
  }

  /** The characters allowed for the first character of a JavaScript identifier. */
  private final static String CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"; // 53
  /** The characters allowed for subsequent characters of a JavaScript identifier. */
  private final static String CHARS2 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"; // 63

  /** Keep track of the mapping between original name and mangled name for any string/name node that gets renamed. */
  private final Map<String, String> nameMap = new HashMap<String, String>();

  public NodeTraverser() {
  }

  /**
   * Adds mappings from original name to mangled name for this run of the obfuscator. Any string/name node that will be
   * renamed because of scope metadata will be renamed to the mapped value if specified.
   *
   * @param mappings
   */
  public void addNameMappings(Map<String, String> mappings) {
    nameMap.putAll(mappings);
  }

  /**
   * Returns the entire mapping from original name to mangled name produced by this run of the obfuscator.
   *
   * @return
   */
  public Map<String, String> getNameMap() {
    return Collections.unmodifiableMap(nameMap);
  }

  /**
   * Obfuscate a global scope. The following steps are processed on each script scope in the global scope:
   * <ol>
   *   <li>Any GETPROP nodes that {@link Scope#getFinalReplacement match a final replacement} in the scope are
   *       inlined.</li>
   *   <li>If the scope specifies that local variables or method parameters are to be renamed, those are renamed
   *       randomly. These tokens can be blessed individually with <code>@jsxobf-bless</code>.</li>
   *   <li>Any string, name, and object literal nodes are compared against the bless/clobber metadata of the
   *       scope and renamed accordingly.</li>
   * </ol>
   *
   * @param scope
   */
  public void obfuscate(Scope.Global scope) {
    for (Scope.File fileScope : scope.getChildrenScopes()) {
      for (Scope.Script scriptScope : fileScope.getChildrenScopes()) {
        obfuscate(scriptScope);
      }
    }
  }

  private void obfuscate(Scope.Script script) {
    NodeWrapper node = script.getScript();

    // Inline the final fields first, before renaming nodes since the matching is done against the real name.
    inlineFinals(script, node);

    if (script.isOptimizeLiterals())
      optimizeStringLiterals(script, node);

    // Create a new variable stack to keep track of local variables and method parameters.
    VariableStack context = new VariableStack();
    // A fake stack marker to determine when we've exited a function.
    NodeWrapper popMarker = new NodeWrapper(node.getJsNode());

    // This will be our depth first node traverser (stack).
    LinkedList<NodeWrapper> nodeStack = new LinkedList<NodeWrapper>();
    nodeStack.add(node);

    while (nodeStack.size() > 0) {
      // Pop the next node on the stack
      NodeWrapper n = nodeStack.removeFirst();

      // Check for the function marker that lets us know that we've exited a function. If so, pop the variable context.
      if (n == popMarker) {
        context.pop();
        continue;
      }

      int type = n.getType();

      // If entering a new script (this should be the root node only) push the variable context.
      if (type == Token.SCRIPT) {
        context.push();
        nodeStack.add(0, popMarker);
      }
      // If entering a new function, push the context and process for local variables and method parameters.
      else if (type == Token.FUNCTION) {
        context.push();

        // Rhino stores the actual function node in a funny place in the tree hierarchy.
        n = n.getRealFunctionNode();

        if (script.isRenameMethodParameters())
          obfuscateMethodParameters(context, script, n);
        if (script.isRenameLocalVariables())
          obfuscateMethodVariables(context, script, n);

        // Rename the function, if necessary.
        this.obfuscateNode(n, context, script);

        nodeStack.add(0, popMarker);
      }
      // Otherwise, just rename the node, if necessary.
      else {
        this.obfuscateNode(n, context, script);
      }

      nodeStack.addAll(0, n.getChildren());
    }
  }

  private void inlineFinals(Scope scope, NodeWrapper node) {
    // Process the script in a depth first traversal. No special stack is needed because we aren't tracking variable
    // scoping.
    for (Iterator<NodeWrapper> i = node.getDepthFirstIterator(); i.hasNext();) {
      NodeWrapper n = i.next();
      int type = n.getType();

      // A first quick check to see if this is node corresponds to the last token of a final field.
      if (type == Token.STRING && n.getParent().getType() == Token.GETPROP && scope.isFinalLastNameMatch(n.getText())) {
        // Begin to construct the entire token list, e.g. jsx3, gui, Block, ALIGNLEFT
        List<String> tokens = new LinkedList<String>();

        // If successful, we will replace this node with the inlined value.
        NodeWrapper replaceRoot = n.getParent();

        NodeWrapper branch = replaceRoot;
        while (branch.getType() == Token.GETPROP) {
          NodeWrapper secondChild = branch.getChild(1);
          if (secondChild.getType() == Token.STRING) {
            tokens.add(0, secondChild.getText());
          } else {
            continue;
          }

          branch = branch.getChild(0);
        }

        if (branch.getType() == Token.NAME) {
          tokens.add(0, branch.getText());
        } else {
          continue;
        }

        // Check against the scope metadata. A match will occur if the metadata matches this field for either all
        // tokens in the metadata or all tokens in this GETPROP branch, whichever is fewer.
        Object replaceWith = scope.getFinalReplacement(tokens.toArray(new String[tokens.size()]));
        if (replaceWith != null) {
          NodeWrapper newNode;
          if (replaceWith == Scope.NULL) {
            newNode = new NodeWrapper(new Node(Token.NULL));
          } else if (replaceWith instanceof String) {
            newNode = new NodeWrapper(Node.newString(Token.STRING, (String) replaceWith));
          } else if (replaceWith instanceof Number) {
            newNode = new NodeWrapper(Node.newNumber(((Number) replaceWith).doubleValue()));
          } else {
            throw new RuntimeException();
          }

          replaceRoot.getParent().replaceChild(replaceRoot, newNode);
        }
      }
    }
  }

  private static final String OBJLIT_NAME = "jsxObfStringIndex";

  private void optimizeStringLiterals(Scope scope, NodeWrapper node) {
    // 1. Find all top-level functions in this scope
    Stack<NodeWrapper> stack = new Stack<NodeWrapper>();
    stack.push(node);
    while (stack.size() > 0) {
      NodeWrapper functNode = stack.pop();
      if (functNode.getType() == Token.FUNCTION) {
        boolean nestedFunction = false;

        // 2. For each function, create an object literal at the top of the function
        NodeWrapper objIndex = new NodeWrapper(new Node(Token.OBJECTLIT));
        NodeWrapper varNode = new NodeWrapper(new Node(Token.VAR));
        NodeWrapper nameNode = new NodeWrapper(Node.newString(Token.NAME, OBJLIT_NAME));
        nameNode.appendChild(objIndex);
        varNode.appendChild(nameNode);

        // create sequential keys in the object literal
        int index = 0;
        // maps string literals to key in object literal
        Map<String, String> strings = new HashMap<String, String>();
        // maps regexp literals to key in object literal
        Map<String, String> regexps = new HashMap<String, String>();
        // maps object literal key to the original string node
        Map<String, NodeWrapper> stringNodes = new HashMap<String, NodeWrapper>();
        // maps original nodes onto their replacements
        Map<NodeWrapper, NodeWrapper> toReplace = new HashMap<NodeWrapper, NodeWrapper>();

        // 3. For each string or regexp literal contained anywhere in the function, create a key in the object literal
        //    and set the value equal to the string/regexp. Keys are sequential and short. Only create a new key if the
        //    value differs from existing values.
        for (Iterator<NodeWrapper> i = functNode.getRealFunctionNode().getChild(0).getDepthFirstIterator(); i.hasNext();)
        {
          NodeWrapper n = i.next();

          String key = null;
          if (n.getType() == Token.STRING) {
            NodeWrapper parent = n.getParent();
            int parentType = parent.getType();
            if (parentType == Token.GETPROP ||
                ((parentType == Token.SETPROP || parentType == Token.SETPROP_OP) && n.equals(parent.getChild(1))))
              continue;

            String text = n.getText();
            key = strings.get(text);

            if (key == null) {
              do {
                key = indexToVar(index++);
              } while (Language.RESERVED_WORDS.contains(key));

              strings.put(text, key);
              stringNodes.put(key, n);
            }

          } else if (n.getType() == Token.REGEXP) {
            String regexKey = getRegexpKey(n);

            key = strings.get(regexKey);

            if (key == null) {
              do {
                key = indexToVar(index++);
              } while (Language.RESERVED_WORDS.contains(key));

              strings.put(regexKey, key);
              stringNodes.put(key, n);
            }
          } else if (n.getType() == Token.FUNCTION) {
            nestedFunction = true;
          }

          if (key != null) {
            // 4. Replace the string/regexp literal with a reference to the field in the object literal
            NodeWrapper getPropNode = new NodeWrapper(new Node(Token.GETPROP));
            NodeWrapper getPropNameNode = new NodeWrapper(Node.newString(Token.NAME, OBJLIT_NAME));
            NodeWrapper getPropStringNode = new NodeWrapper(Node.newString(key));
            getPropNode.appendChild(getPropNameNode);
            getPropNode.appendChild(getPropStringNode);
            toReplace.put(n, getPropNode);
          }
        }

        if (toReplace.size() > 0 && nestedFunction) {
          for (NodeWrapper n : toReplace.keySet()) // ok non-deterministic access, no additive state
            n.getParent().replaceChild(n, toReplace.get(n));

          List<String> keyList = new ArrayList<String>();
          for (String key : Utils.sortedKeys(stringNodes)) {
            keyList.add(key);
            objIndex.appendChild(stringNodes.get(key));
          }
          objIndex.getJsNode().putProp(Node.OBJECT_IDS_PROP, keyList.toArray());

          functNode.getRealFunctionNode().getChild(0).insertChild(0, varNode);
        }
      } else {
        stack.addAll(functNode.getChildren());
      }
    }
  }

  private String getRegexpKey(NodeWrapper n) {
    return "/" + n.getRegexpString() + "/" + n.getRegexpFlags();
  }

  private String indexToVar(int index) {
    if (index < CHARS.length())
      return CHARS.substring(index, index + 1);
    else
      return "" + CHARS.charAt(index % CHARS.length()) + CHARS2.charAt((index / CHARS.length()) - 1);
  }

/*
  private void compressFunction(NodeWrapper functionNode, VariableStack context) {
    Map<String, Integer> freq = new HashMap<String, Integer>();

    for (Iterator<NodeWrapper> i = functionNode.getBreadthFirstIterator(); i.hasNext();) {
      NodeWrapper n = i.next();
      int type = n.getType();

      String key = null;
      if (type == Token.THIS) {
        key = "this";
      } else if (type == Token.STRING || type == Token.NAME || type == Token.BINDNAME ||
          type == Token.FUNCTION || type == Token.TYPEOFNAME) {
        key = n.getText();
      }

      if (key != null) {
        if (!freq.containsKey(key)) freq.put(key, 1);
        else freq.put(key, freq.get(key) + 1);
      }
    }

    Set<String> toAlias = new HashSet<String>();

    for (String name : freq.keySet()) {
      int count = freq.get(name);
      int charPre = count * name.length();
      // var aa="name";
      int charPost = 10 + name.length() + count * (name.indexOf("_jsx") == 0 ? 6 : 2);
      if (charPost < charPre) {
        int diff = charPre - charPost;
        String message = "Could replace '" + name + "' in function on line " + functionNode.getLineNumber() + " in file " +
            currentScript.getFile() + " for a savings of " + diff + " chars.";

        if (diff > 10) {
//          LOG.warning(message);
          toAlias.add(name);
        } else {
//          LOG.info(message);
        }
      }
    }

    NodeWrapper blockNode = functionNode.getChild(0);

    if (toAlias.size() > 0) {
      LOG.warning("Aliasing " + toAlias);

      NodeWrapper varNode = new NodeWrapper(new Node(Token.VAR));
      for (String s : toAlias) {
        String varName = mangleName(context, s, functionNode.getLineNumber(), 1);
        context.put(s, varName);

        NodeWrapper aVarNode = new NodeWrapper(Node.newString(varName));
        varNode.appendChild(aVarNode);
        NodeWrapper textNode = new NodeWrapper(Node.newString(s));
        aVarNode.appendChild(textNode);
      }

      List<NodeWrapper> blockChildren = new ArrayList<NodeWrapper>(blockNode.getChildren());
      blockNode.insertChild(0, varNode);

      for (NodeWrapper blockChild : blockChildren) {
        for (Iterator<NodeWrapper> i = blockChild.getBreadthFirstIterator(); i.hasNext();) {
          NodeWrapper n = i.next();
          int type = n.getType();

          if (type == Token.THIS) {
            if (toAlias.contains("this"))
              n.getParent().replaceChild(n, new NodeWrapper(Node.newString(Token.NAME, context.get("this"))));
          } else if (type == Token.STRING || type == Token.NAME || type == Token.BINDNAME ||
              type == Token.FUNCTION || type == Token.TYPEOFNAME) {
            if (toAlias.contains(n.getText())) {
              NodeWrapper parent = n.getParent();
              parent.replaceChild(n, new NodeWrapper(Node.newString(Token.NAME, context.get(n.getText()))));
              int parentType = parent.getType();

              if (parentType == Token.GETPROP) {
                parent.setType(Token.GETELEM);
              } else if (parentType == Token.SETPROP) {
                parent.setType(Token.SETELEM);
              }
            }
          }
        }
      }
    }
  }
*/

  private void obfuscateNode(NodeWrapper n, VariableStack context, Scope scope) {
    int type = n.getType();

    // 1A. Rename variable declarations, including those declared in catch().
    if (scope.isRenameLocalVariables() && ((n.getParent().getType() == Token.VAR) ||
        ((type == Token.NAME || type == Token.BINDNAME) && n.getParent().getType() == Token.CATCH_SCOPE))) {

      String varName = n.getText();

      // Local variables and method parameters may be blessed individually.
      if (scope.getRename(varName) == Scope.Rename.BLESSED)
        return;

      // Get the mangled name or generate a new one.
      String mangled = context.get(varName);
      if (mangled == null) {
        mangled = mangleName(context, varName, scope, n.getLineNumber(), 1);
        context.put(varName, mangled);
      }
      n.setText(mangled);
      return;
    }
    // 1B. Plus, rename all local variables (and method parameters) whose declarations have already been obfuscated.
    else if (type == Token.NAME || type == Token.BINDNAME || type == Token.TYPEOFNAME) {
      String varName = n.getText();
      String mangled = context.get(varName);

      if (mangled != null) {
        n.setText(mangled);
        return;
      }/* else if (!allowedGlobals.contains(varName)) {
        NodeWrapper function = n.getParentFunction();
        if (currentScript.getMetaData().getHandler() instanceof FileHandler.Script || function != null) {
          if (function != null) {
            LOG.warning("Found undeclared variable '" + varName + "' in function " + function.getFunctionName() +
                " on line " + function.getLineNumber() + " in file " + n.getFilePath() + ".");
          } else {
            LOG.warning("Found undeclared variable '" + varName + "' in file " + n.getFilePath() + ".");
          }
        }
      }*/
    }

    // 2. Rename any name/string that is obfuscated according to the metadata of the scope.
    if (type == Token.STRING || type == Token.NAME || type == Token.BINDNAME ||
        type == Token.FUNCTION || type == Token.TYPEOFNAME) {

      NodeWrapper fct = n.getParentStatement();
      int sugar = fct != null ? fct.getLineNumber() : 41;
      String newName = renameNameNode(n.getText(), scope, sugar);
      if (newName != null)
        n.setText(newName);
    }

    // 3. Rename the keys of any object literals according to the metadata of the scope.
    else if (type == Token.OBJECTLIT) {
      Object[] fields = (Object[]) n.getJsNode().getProp(Node.OBJECT_IDS_PROP);
      NodeWrapper fct = n.getParentStatement();
      int sugar = fct != null ? fct.getLineNumber() : 47;
      boolean renamed = false;

      for (int i = 0; i < fields.length; i++) {
        Object field = fields[i];
        if (field instanceof String) {
          String newName = renameNameNode((String) field, scope, sugar);
          if (newName != null) {
            renamed = true;
            fields[i] = newName;
          }
        }
      }

      if (renamed)
        n.getJsNode().putProp(Node.OBJECT_IDS_PROP, fields);
    }
  }

  private String renameNameNode(String s, Scope scope, int sugar) {
    Scope.Rename r = scope.getRename(s);
    if (r == Scope.Rename.NONE || r == Scope.Rename.BLESSED) return null;

    int zone = r == Scope.Rename.CLOBBERED ? 3 : 2;

    String scaryName = nameMap.get(s);
    if (scaryName == null) {
      scaryName = mangleName(nameMap, s, scope, sugar, zone);
      LOG.finer("2. renaming " + s + " to " + scaryName);
      nameMap.put(s, scaryName);
    }

    return scaryName;
  }

  private void obfuscateMethodParameters(VariableStack context, Scope scope, NodeWrapper function) {
    List<String> params = function.getParameterNames();
    for (int i = 0; i < params.size(); i++) {
      String paramName = params.get(i);

      if (scope.getRename(paramName) == Scope.Rename.BLESSED)
        continue;

      String mangled = context.get(paramName);
      if (mangled == null) {
        mangled = mangleName(context, paramName, scope, function.getLineNumber(), 0);
        LOG.finer("5. renaming " + paramName + " to " + mangled);
        context.put(paramName, mangled);
      }
      function.renameParameter(i, mangled);
    }
  }

  private void obfuscateMethodVariables(VariableStack context, Scope scope, NodeWrapper function) {
    List<String> variables = function.getVariableNames();
    for (int i = 0; i < variables.size(); i++) {
      String varName = variables.get(i);

      if (scope.getRename(varName) == Scope.Rename.BLESSED)
        continue;

      String mangled = context.get(varName);
      if (mangled == null) {
        mangled = mangleName(context, varName, scope, function.getLineNumber() + 31 * i, 1);
        LOG.finer("6. renaming " + varName + " to " + mangled);
        context.put(varName, mangled);
      }
    }
  }

  private String mangleName(Map<String, String> context, String name, Scope scope, int sugar, int length) {
    if (sugar == 0) sugar = 7;
    if (sugar < 0) sugar = -sugar;
    sugar = PRIMES[sugar % PRIMES.length];

    int range = getRangeForSize(length);
    if (range == sugar) sugar++;
    int value = 37 * name.hashCode() + 23 * sugar;
    int tries = 0;
    String mangled;
    do {
      mangled = scaryAsciiString(value, length);
      mangled = scope.getPatternedRename(name, mangled);
      value += sugar;

      if (tries >= range) {
        if (length == 4) throw new RuntimeException();
        LOG.warning("Range exhausted (2): length=" + length + " range=" + range + " sugar=" + sugar +
            " filled=" + context.size() + " name=" + name);
        return mangleName(context, name, scope, sugar, 4);
      }

      tries++;
    } while (Language.RESERVED_WORDS.contains(mangled) || context.containsValue(mangled) ||
        scope.isReservedName(mangled));

    return mangled;
  }

  // Define the various ranges for renaming. The total range is partitioned for different purposes to prevent any
  // collisions. The range of each partition is prime to facilitate random and complete filling.

  private static final int R0 = 0;

  /** R1 is for method parameters. */
  private static final int R1 = 19;
  /** R2 is for local variables. */
  private static final int R2 = R1 + 127;
  /** R3 is for clobber protected names. */
  private static final int R3 = R2 + 683;
  /** R4 is for clobber private names. */
  private static final int R4 = R3 + 2503;
  /** R5 is for the overflow from the other ranges. */
  private static final int R5 = CHARS.length() * CHARS2.length() * CHARS2.length();

  private int getRangeForSize(int size) {
    switch (size) {
      case 0:
        return R1 - R0;
      case 1:
        return R2 - R1;
      case 2:
        return R3 - R2;
      case 3:
        return R4 - R3;
      case 4:
        return R5 - R4;
      default:
        throw new IllegalArgumentException();
    }
  }

  private String scaryAsciiString(int value, int size) {
    int min, max;
    switch (size) {
      case 0:
        min = R0;
        max = R1;
        break;
      case 1:
        min = R1;
        max = R2;
        break;
      case 2:
        min = R2;
        max = R3;
        break;
      case 3:
        min = R3;
        max = R4;
        break;
      case 4:
        min = R4;
        max = R5;
        break;
      default:
        throw new IllegalArgumentException();
    }

    StringBuilder scary = new StringBuilder(2);
    value = (Math.abs(value) % (max - min)) + min;

    for (int i = 0; i < 2; i++) {
      String chars = i == 0 ? CHARS : CHARS2;
      scary.append(chars.charAt(value % chars.length()));
      value = (value / chars.length()) - 1;
      if (value < 0) break;
    }

    /* reverse so that the resulting strings are most-significant first */
    return new String(scary);
  }

  private static final int[] PRIMES = new int[]{
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
      101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181,
      191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281,
      283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397,
      401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
      509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619,
      631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743,
      751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863,
      877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997,
      1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091,
      1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193,
      1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 1277, 1279, 1283, 1289, 1291,
      1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399, 1409, 1423,
      1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493,
      1499, 1511, 1523, 1531, 1543, 1549, 1553, 1559, 1567, 1571, 1579, 1583, 1597, 1601,
      1607, 1609, 1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 1699,
      1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789, 1801, 1811,
      1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 1913, 1931,
      1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997, 1999, 2003, 2011, 2017, 2027, 2029,
      2039, 2053, 2063, 2069, 2081, 2083, 2087, 2089, 2099, 2111, 2113, 2129, 2131, 2137,
      2141, 2143, 2153, 2161, 2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267,
      2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2333, 2339, 2341, 2347, 2351, 2357,
      2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2437, 2441, 2447, 2459,
      2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551, 2557, 2579, 2591, 2593,
      2609, 2617, 2621, 2633, 2647, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693,
      2699, 2707, 2711, 2713, 2719, 2729, 2731, 2741,
      2749, 2753, 2767, 2777, 2789, 2791, 2797, 2801, 2803, 2819,
      2833, 2837, 2843, 2851, 2857, 2861, 2879, 2887, 2897, 2903,
      2909, 2917, 2927, 2939, 2953, 2957, 2963, 2969, 2971, 2999,
      3001, 3011, 3019, 3023, 3037, 3041, 3049, 3061, 3067, 3079,
      3083, 3089, 3109, 3119, 3121, 3137, 3163, 3167, 3169, 3181,
      3187, 3191, 3203, 3209, 3217, 3221, 3229, 3251, 3253, 3257,
      3259, 3271, 3299, 3301, 3307, 3313, 3319, 3323, 3329, 3331,
      3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391, 3407, 3413,
      3433, 3449, 3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511,
      3517, 3527, 3529, 3533, 3539, 3541, 3547, 3557, 3559, 3571,
      3581, 3583, 3593, 3607, 3613, 3617, 3623, 3631, 3637, 3643,
      3659, 3671, 3673, 3677, 3691, 3697, 3701, 3709, 3719, 3727,
      3733, 3739, 3761, 3767, 3769, 3779, 3793, 3797, 3803, 3821,
      3823, 3833, 3847, 3851, 3853, 3863, 3877, 3881, 3889, 3907,
      3911, 3917, 3919, 3923, 3929, 3931, 3943, 3947, 3967, 3989,
      4001, 4003, 4007, 4013, 4019, 4021, 4027, 4049, 4051, 4057,
      4073, 4079, 4091, 4093, 4099, 4111, 4127, 4129, 4133, 4139,
      4153, 4157, 4159, 4177, 4201, 4211, 4217, 4219, 4229, 4231,
      4241, 4243, 4253, 4259, 4261, 4271, 4273, 4283, 4289, 4297,
      4327, 4337, 4339, 4349, 4357, 4363, 4373, 4391, 4397, 4409,
      4421, 4423, 4441, 4447, 4451, 4457, 4463, 4481, 4483, 4493,
      4507, 4513, 4517, 4519, 4523, 4547, 4549, 4561, 4567, 4583,
      4591, 4597, 4603, 4621, 4637, 4639, 4643, 4649, 4651, 4657,
      4663, 4673, 4679, 4691, 4703, 4721, 4723, 4729, 4733, 4751,
      4759, 4783, 4787, 4789, 4793, 4799, 4801, 4813, 4817, 4831,
      4861, 4871, 4877, 4889, 4903, 4909, 4919, 4931, 4933, 4937,
      4943, 4951, 4957, 4967, 4969, 4973, 4987, 4993, 4999, 5003
  };
}
