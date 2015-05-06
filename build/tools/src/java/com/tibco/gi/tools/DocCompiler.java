/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import com.tibco.gi.tools.doc.JsMember;
import com.tibco.gi.tools.doc.JsMember.Type;
import com.tibco.gi.tools.doc.JsParam;
import com.tibco.gi.tools.doc.JsType;
import com.tibco.gi.tools.doc.ParseException;
import com.tibco.gi.tools.doc.Parser;
import org.jaxen.JaxenException;
import org.jaxen.dom.DOMXPath;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * Compiles inline documentation from JavaScript source files. The output format is XML.
 * <p/>
 * The supported documentation syntax is similar to javadoc syntax. Relevant comment blocks are range comments that
 * begin with <code>/**</code> and are placed immediately before the member that they describe. Packages, classes,
 * interfaces, methods, and fields may be documented. Methods and fields are defined in the class, interface, or
 * package whose definition most closely precedes it. (It is an error to define a method or field in a location where
 * there is no such class context).
 * <p/>
 * The documentation compiler parses JavaScript to determine what type of member a comment block documents. The
 * member declaration that follows the comment block (or that is specified with the <code>@jsxdoc-definition</code>
 * tag) must match one of the following patterns:
 * <ul>
 *   <li><code>jsx3.[lang.]Package.definePackage("NAME", ...</code> - defines a package. The package name is
 *       determined from the declaration.</li>
 *   <li><code>jsx3.[lang.]Class.defineClass("NAME", SUPER, [IMP1, IMP2, ...], ...</code> - defines a class. The class
 *       name, superclass, and implemented interfaces are determined from the declaration.</li>
 *   <li><code>jsx3.[lang.]Class.defineInterface("NAME", SUPER, ...</code> - defines an interface. The interface name
 *       and super interface are determined from the declaration.</li>
 *   <li><code>prototype.NAME = jsx3.[lang.]Method.newAbstract("P1", "P2", ...);</code> - defines an abstract method.
 *       The method name and parameter order are determined from the declaration.</li>
 *   <li><code>prototype.NAME = jsx3.$Y(function(...</code> - defines an asynchronous method.
 *       The method name is determined from the declaration. The method parameters are taken from the
 *       <code>@param</code> tags.</li>
 *   <li><code>prototype.NAME = function(P1, P2, ...) ...</code> - defines an instance method. The method name
 *       and parameter order are determined from the declaration.</li>
 *   <li><code>NAME: function(P1, P2, ...) ...</code> - same as above.</li>
 *   <li><code>x.NAME = function(P1, P2, ...) ...</code> - defines a static method. The method name
 *       and parameter order are determined from the declaration.</li>
 *   <li><code>prototype.NAME = x;</code> - defines an instance field. The field name is determined from the
 *       declaration.</li>
 *   <li><code>NAME: x</code> - same as above.</li>
 *   <li><code>x.NAME = x;</code> - defines a static field. The field name is determined from the declaration.</li>
 * </ul>
 * <p/>
 * Documentation blocks may begin with a free-form paragraph that describes the member. HTML tags are allowed in this
 * and most other text blocks. HTML entities must be escaped in order to be interpreted as plain text. The type
 * declaration of a field, if documented, must precede its description.
 * <p/>
 * The <code>param</code>, <code>return</code>, and <code>throws</code> tags, as well as description of a field
 * support optional type information. Types are always documented between curly braces, <code>{}</code>. A type can
 * be any valid JavaScript identifier or package+identifier. A type whose class is included in a compilation will be
 * linked automatically to the definition of that class. The following constructs are also supported:
 * <ul>
 *   <li><code>type1 | type2 | ...</code> - type1 or type2 or ...</li>
 *   <li><code>type1...</code> - variable number of method arguments which should be determined from the JavaScript
 *       <code>arguments</code> array.</li>
 *   <li><code>pType&lt;type&gt;</code> - a parameterized type such as an <code>Array</code> that contains objects
 *       of another type.</li>
 *   <li><code>pType&lt;type1, type2&gt;</code> - a multi-dimensional parameterized type such as a map that contains
 *       multiple sets of objects of other types.</li>
 *   <li>most combinations of the above.</li>
 * </ul>
 * <p/>
 * Tags begin on a new line and begin with the "@" character. The following tags are supported:
 * <p/>
 * <code><b>@public, @package, @protected, @private</b></code>: Sets the access level of the documented member. If a documentation
 * comment exists the default is <code>public</code>, otherwise the default is <code>private</code>.
 * <p/>
 * <code><b>@version</b> STRING</code>: Documents the version of the member.
 * <p/>
 * <code><b>@since</b> STRING</code>: Documents the version when the member was introduced.
 * <p/>
 * <code><b>@deprecated</b> [STRING]</code>: Documents that the member is deprecated and adds an optional description
 * of the deprecation.
 * <p/>
 * <code><b>@author</b> STRING</code>: Documents the author of the member. Any number of <code>author</code> tags
 * may be documented.
 * <p/>
 * <code><b>@param</b> NAME [{TYPE}] STRING</code>: Documents a parameter of a method. Any parameters that are not
 * explicitely documented with this tag are parsed from the definition and included (without type or description)
 * in the compiled documentation.
 * <p/>
 * The alternate syntax <code>@param {TYPE} NAME STRING</code> is also supported.
 * <p/>
 * The tags <code><b>@param-package</b></code> and <code><b>@param-private</b></code>
 * can be used to set the access level of a particular parameter so that it does not show up in the compiled
 * documentation.
 * <p/>
 * <code><b>@return</b> [{TYPE}] STRING</code>: Documents the return type of a method and adds a description to the
 * returned object. The type is optional. Method that have no non-empty return statements should not include this
 * tag.
 * <p/>
 * <code><b>@throws</b> [{TYPE}] STRING</code>: Documents an exception type that a method may throw and the
 * conditions under which it is thrown.
 * <p/>
 * <code><b>@final</b></code>: Documents that a method should not be overridden or a class should not be extended.
 * The JavaScript language does not enforce this documentation construct.
 * <p/>
 * <code><b>@static</b></code>: Documents a field or member as static even when the member declaration is not
 * understood by the parser to be a static declaration.
 * <p/>
 * <code><b>@protected</b></code>: Documents that a method or field should only be used from within the class that
 * defined it or one of that class's subclasses. The JavaScript language does not enforce this documentation construct.
 * <p/>
 * <code><b>@abstract</b></code>: Documents that a class is abstract. Methods defined with
 * <code>jsx3.lang.Method.newAbstract()</code> are automatically recognized as abstract. Any class or interface with
 * an abstract member is also automatically recognized as abstract.
 * <p/>
 * <code><b>@native</b></code>: Documents that this member is defined by the JavaScript engine or host browser.
 * <p/>
 * <code><b>@see</b> STRING</code>: Adds a See section to the documentation of this member. There are several supported
 * formats for the STRING argument:
 * <ul>
 *   <li><code>"TEXT"</code> - inserts a text label.</li>
 *   <li><code>&lt;a href="URL"&gt;TEXT&lt;/a&gt;</code> - inserts an HTML link to URL.</li>
 *   <li><code>#LOCAL_FIELD [LABEL]</code> - references a field in the same class with optional label LABEL.</li>
 *   <li><code>#LOCAL_METHOD() [LABEL]</code> - references a method in the same class with optional label LABEL.</li>
 *   <li><code>pkg.Class#FIELD [LABEL]</code> - references a field in another class, <code>pkg.Class</code>, with optional label LABEL.</li>
 *   <li><code>pkg.Class#METHOD() [LABEL]</code> - references a method in another class, <code>pkg.Class</code>, with optional label LABEL.</li>
 * </ul>
 * <p/>
 * <code><b>@jsxdoc-definition</b> JS_DEFINITION</code>: In the case that a documentation block cannot appear
 * immediately before the member definition ,this tag can be used to specify the member definition. This tag can
 * also be used to tell the compiler what member the comment block describes in the case that members are not
 * defined according to the JavaScript syntax that the compiler expects.
 * <p/>
 * <code><b>@jsxdoc-category</b> CLASS</code>: In the case that the members of a package, class, or interface are
 * defined across multiple files or sections of files, this tag can be used to indicate that tags following it belong
 * to <code>CLASS</code> but without redefining <code>CLASS</code> in the process.
 *
 * @author Jesse Costello-Good
 */
public class DocCompiler {

  private static final Logger LOG = Logger.getLogger(DocCompiler.class.getName());

  private static final String INDEX = "index.xml";

  private static final String GLOBAL_PACKAGE = "window";

  private File destDir;
  private final SortedSet<File> srcFiles = new TreeSet<File>();
  private JsMember.Access access = JsMember.Access.PUBLIC;
  private final DocumentBuilder parser;
  private boolean strict = false;

  // run state
  private Map<String, JsMember> classMap;

  public DocCompiler() {
    try {
      parser = DocumentBuilderFactory.newInstance().newDocumentBuilder();
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    }
  }

  /**
   * Runs this documentation compiler.
   *
   * @throws IOException
   */
  public void run() throws IOException {
    if (destDir == null) throw new NullPointerException("Destination directory must be specified.");
    if (srcFiles.size() == 0) throw new IllegalStateException("At least one source file must be specified.");

    classMap = new HashMap<String, JsMember>();

    Parser parser = null;

    for (File srcFile : srcFiles) {
      try {
        LOG.fine("Compiling documentation in " + srcFile);
        if (parser == null) parser = new Parser(srcFile, strict);
        else parser.reInit(srcFile);

        Collection<JsMember> classes = parser.run();
        for (JsMember c : classes) {
          if (classMap.containsKey(c.getName()))
            classMap.get(c.getName()).merge(c);
          else
            classMap.put(c.getName(), c);
        }
      } catch (ParseException e) {
        log(Level.SEVERE, "Error parsing source file " + srcFile + ".", e);
      }
    }

    linkClasses();
    filterOnAccess();
    makeIndex();

    for (JsMember c : classMap.values()) // ok non-deterministic access, each item is independent
      serializeClass(c);
  }

  private void linkClasses() {
    for (String name : classMap.keySet()) { // ok non-deterministic access, no consequenses
      JsMember member = classMap.get(name);
      String parentName = member.getNamePrefix();
      if (parentName.length() == 0) parentName = GLOBAL_PACKAGE;
      JsMember parent = classMap.get(parentName);
      if (parent != null)
        parent.addMember(member);

      for (JsMember jsMember : member.getMembers()) {
        if (jsMember.getType() == JsMember.Type.METHOD) {
          if (!jsMember.isStatic() && jsMember.getName().equals(member.getMemberName()))
            jsMember.setType(JsMember.Type.CONSTRUCTOR);
        }
      }
    }
  }

  private void filterOnAccess() {
    Set<String> keys = new HashSet<String>(classMap.keySet()); // ok non-deterministic access, no additions to state
    for (String className : keys) {
      JsMember jsClass = classMap.get(className);
      if (jsClass.getAccess().compareTo(access) < 0) {
        classMap.remove(className);
      }
    }

    for (JsMember jsClass : classMap.values()) { // ok non-deterministic access, no additions to state
      Collection<JsMember> members = new ArrayList<JsMember>(jsClass.getMembers());
      for (JsMember member : members) {
        if (member.getAccess().compareTo(access) < 0) {
          jsClass.removeMember(member);
        } else if (member.getType().isMethodType()) {
          Collection<JsParam> params = new ArrayList<JsParam>(jsClass.getParams());
          for (JsParam param : params) {
            if (param.getAccess().compareTo(access) < 0)
              member.removeParam(param);
          }
        }
      }
    }
  }

  private void makeIndex() throws IOException {
    Document doc = newDocument();
    Element data = (Element) doc.appendChild(doc.createElement("data"));
    data.setAttribute("jsxid", "jsxroot");

    Map<Object, Element> packageMap = new HashMap<Object, Element>();

    Map<String, JsMember> implicitMembers = new HashMap<String, JsMember>();

    // Create packages for any classes whose package is not defined.
    for (JsMember c : classMap.values()) { // ok non-deterministic access, eventually sorted
      if (c.getType() != JsMember.Type.PACKAGE && c.getPackage() == null) {
        String pkgName;
        boolean ntv = false;

        if (c.getNamePrefix().length() > 0) {
          pkgName = c.getNamePrefix();
        } else {
          pkgName = GLOBAL_PACKAGE;
          ntv = true;
        }

        if (!implicitMembers.containsKey(pkgName)) {
          JsMember implicitPackage = new JsMember();
          implicitPackage.setType(Type.PACKAGE);
          implicitPackage.setName(pkgName);
          implicitPackage.setNative(ntv);

          implicitMembers.put(pkgName, implicitPackage);
        }

        implicitMembers.get(pkgName).addMember(c);
      }
    }

    classMap.putAll(implicitMembers);

    List<JsMember> sortedClasses = Utils.getSortedCopy(classMap.values(), JsMember.BY_NAME);
    for (JsMember c : sortedClasses) {
      if (c.getType() == JsMember.Type.PACKAGE) {
        Element packageElm = createIndexRecord(doc, c);
        data.appendChild(packageElm);
        packageMap.put(c, packageElm);
      }
    }

    for (JsMember c : sortedClasses) {
      if (c.getType() != JsMember.Type.PACKAGE) {
        Element classElm = createIndexRecord(doc, c);
        JsMember pkg = c.getPackage();
        packageMap.get(pkg).appendChild(classElm);
      }
    }

    Utils.serializeDocument(doc, new File(destDir, INDEX));
  }

  private Element createIndexRecord(Document doc, JsMember member) {
    Element record = doc.createElement("record");
    record.setAttribute("jsxid", member.getName());
    record.setAttribute("jsxtext", member.getType() == JsMember.Type.PACKAGE ? member.getName() : member.getMemberName());
    record.setAttribute("classtype", member.getType().toString().toLowerCase());
    record.setAttribute("path", getPathForClass(member));
    record.setAttribute("summary", member.getSummary());
    if (member.isDeprecated())
      record.setAttribute("deprecated", "1");
    if (member.isNative())
      record.setAttribute("native", "1");
    return record;
  }

  private void serializeClass(JsMember c) throws IOException {
    Document doc = newDocument();
    Element root = (Element) doc.appendChild(doc.createElement(c.getType().toString().toLowerCase()));
    root.setAttribute("id", "class:" + c.getName());
    root.setAttribute("name", c.getName());
    if (c.getType() != JsMember.Type.PACKAGE) {
      root.setAttribute("package", c.getPackageName());
      root.setAttribute("shortname", c.getMemberName());
    }

    serializeCommonAttributes(c, root, false);

    if (c.getType() != JsMember.Type.PACKAGE) {
      // 1. Do super
      List<String> supers = new ArrayList<String>();
      String s = c.getSuperClass();
      while (s != null && s.length() > 0) {
        supers.add(0, s);
        if (classMap.containsKey(s))
          s = classMap.get(s).getSuperClass();
        else
          s = null;
      }

      int n = 0;
      for (Iterator<String> i = supers.iterator(); i.hasNext();) {
        String aSuper = i.next();
        Element superNode = doc.createElement("superclass");
        root.appendChild(superNode);
        superNode.setAttribute("id", "super:" + (n++));
        superNode.setAttribute("name", aSuper);
        if (classMap.containsKey(aSuper))
          superNode.setAttribute("loaded", "1");
        if (!i.hasNext())
          superNode.setAttribute("direct", "1");
      }

      if (c.getType() == JsMember.Type.CLASS) {
        // 2. Do implements
        SortedSet<String> interfaces = new TreeSet<String>();
        Set<String> toCheck = new HashSet<String>(supers);
        toCheck.add(c.getName());
        for (String className : toCheck) {
          JsMember aClass = classMap.get(className);
          if (aClass != null) {
            interfaces.addAll(aClass.getInterfaces());
          }
        }

        n = 0;
        for (String anInterface : interfaces) {
          Element interNode = doc.createElement("implements");
          root.appendChild(interNode);
          interNode.setAttribute("id", "implements:" + (n++));
          interNode.setAttribute("name", anInterface);
          if (classMap.containsKey(anInterface))
            interNode.setAttribute("loaded", "1");
          if (c.getInterfaces().contains(anInterface))
            interNode.setAttribute("direct", "1");
        }
      }

      if (c.getType() == JsMember.Type.INTERFACE) {
        // 3. Do implementors
        SortedSet<String> implementors = new TreeSet<String>();
        FOR:
        for (JsMember jsMember : classMap.values()) { // ok non-deterministic access, values added to sorted set
          JsMember node = jsMember;
          while (node != null) {
            if (node.getInterfaces().contains(c.getName())) {
              implementors.add(jsMember.getName());
              continue FOR;
            }
            node = classMap.get(node.getSuperClass());
          }
        }

        n = 0;
        for (String implementor : implementors) {
          Element subNode = doc.createElement("implementor");
          root.appendChild(subNode);
          subNode.setAttribute("id", "implementor:" + (n++));
          subNode.setAttribute("name", implementor);
          subNode.setAttribute("loaded", "1");
        }
      } else {
        // 4. Do subclasses
        SortedSet<String> subclasses = new TreeSet<String>();
        for (JsMember jsMember : classMap.values()) { // ok non-deterministic access, values added to sorted set
          if (c.getName().equals(jsMember.getSuperClass()))
            subclasses.add(jsMember.getName());
        }

        n = 0;
        for (String subclass : subclasses) {
          Element subNode = doc.createElement("subclass");
          root.appendChild(subNode);
          subNode.setAttribute("id", "sub:" + (n++));
          subNode.setAttribute("name", subclass);
          subNode.setAttribute("loaded", "1");
        }
      }
    }

    Map<String, JsMember> myMembers = new HashMap<String, JsMember>();
    for (JsMember jsMember : c.getMembers()) {
      if (!jsMember.isStatic() && !jsMember.getType().isClassType())
        myMembers.put(jsMember.getName(), jsMember);
    }

    final List<JsMember> inheritance = getInheritance(c);
    final Map<String, JsMember> inheritedMembers = new HashMap<String, JsMember>();

    for (JsMember superClass : inheritance) {
      for (JsMember superMember : superClass.getMembers()) {
        if (!superMember.isStatic() && !superMember.getType().isClassType()) {
          if (!inheritedMembers.containsKey(superMember.getName()))
            inheritedMembers.put(superMember.getName(), superMember);
        }
      }
    }

    List<JsMember> sortedMembers = new ArrayList<JsMember>(c.getMembers());
    // add nested classes to a package
    if (c.getType() == JsMember.Type.PACKAGE) {
      Collection<JsMember> grandChildren = new ArrayList<JsMember>();
      for (JsMember member : sortedMembers) {
        if (member.getType() == JsMember.Type.CLASS || member.getType() == JsMember.Type.INTERFACE) {
          for (JsMember grandChild : member.getMembers()) {
            if (grandChild.getType().isClassType())
              grandChildren.add(grandChild);
          }
        }
      }
      sortedMembers.addAll(grandChildren); // ok non-deterministic access, sorted below
    }
    Collections.sort(sortedMembers, new Comparator<JsMember>() {
      public int compare(JsMember o1, JsMember o2) {
        if (o1 == o2) return 0;
        int c1 = o1.getType().toString().compareTo(o2.getType().toString());
        if (c1 == 0) c1 = o1.isStatic() == o2.isStatic() ? 0 : (o1.isStatic() ? 1 : -1);
        if (c1 == 0) c1 = o1.getName().compareTo(o2.getName().toString());
        return c1;
      }
    });

    // Serialize all method, field, and class members
    for (JsMember member : sortedMembers) {
      if (member.getType() == JsMember.Type.METHOD)
        serializeClassMember(root, member, inheritedMembers.get(member.getName()));
      else if (member.getType() == JsMember.Type.FIELD)
        serializeClassMember(root, member, inheritedMembers.get(member.getName()));
      else if (member.getType() != JsMember.Type.PACKAGE)
        serializeClassMember(root, member, null);
    }

    List<String> sortedNames = Utils.getSortedCopy(inheritedMembers.keySet(), new Comparator<String>() {
      public int compare(String o1, String o2) {
        JsMember m1 = inheritedMembers.get(o1);
        JsMember m2 = inheritedMembers.get(o2);
        int c1 = Integer.valueOf(inheritance.indexOf(m1.getParent())).compareTo(inheritance.indexOf(m2.getParent()));
        if (c1 == 0) c1 = m1.getName().compareTo(m2.getName());
        return c1;
      }
    });

    // Serialize all inherited methods and fields
    for (String fieldName : sortedNames) {
      if (!myMembers.containsKey(fieldName)) {
        serializeInheritedClassMember(root, inheritedMembers.get(fieldName));
      }
    }

    // Set class or interface implicitly abstract
    try {
      DOMXPath xpath = new DOMXPath("//*[@abstract='1']");
      if (xpath.selectSingleNode(root) != null)
        root.setAttribute("abstract", "1");
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    }

    File outFile = new File(destDir, getPathForClass(c));
    Utils.serializeDocument(doc, outFile);
  }

  private void serializeCommonAttributes(JsMember member, Element node, boolean nested) {
    Document doc = node.getOwnerDocument();

    if (member.getAccess() != null)
      node.setAttribute("access", member.getAccess().toString().toLowerCase());
    if (member.isNative())
      node.setAttribute("native", "1");
    if (member.isAbstract())
      node.setAttribute("abstract", "1");
    if (member.isFinal())
      node.setAttribute("final", "1");

    if (nested && member.getType().isClassType()) {
      createTextBlock(node, member.getSummary());
    } else if (member.getDescription() != null) {
      createTextBlock(node, member.getDescription());
    }

    if (member.getSince() != null)
      node.setAttribute("since", member.getSince());
    if (member.getVersion() != null)
      node.setAttribute("version", member.getVersion());

    if (member.isDeprecated()) {
      node.setAttribute("deprecated", "1");
      if (member.getDepDescription() != null) {
        Element depNode = doc.createElement("deprecated");
        depNode.appendChild(doc.createTextNode(member.getDepDescription()));
        node.appendChild(depNode);
      }
    }

    for (String author : member.getAuthors()) {
      Element authorNode = doc.createElement("author");
      authorNode.appendChild(doc.createTextNode(author));
      node.appendChild(authorNode);
    }

    for (String see : member.getSee()) {
      serializeSee(member, node, see);
    }
  }

  private static final Pattern SEE = Pattern.compile("^([\\$\\w\\.]+)?(?:#([\\$\\w]+))?(\\(\\))?(?:\\s+(.*))?\\s*$");

  private void serializeSee(JsMember member, Element node, String see) {
    Document doc = node.getOwnerDocument();
    Element seeNode = null;

    if (see.indexOf("<") == 0) {
      seeNode = doc.createElement("see");
      seeNode.appendChild(doc.createTextNode(see));
    } else if (see.indexOf("\"") == 0) {
      seeNode = doc.createElement("see");
      seeNode.appendChild(doc.createTextNode(see.substring(1, see.length() - 1)));
    } else {
      Matcher m = SEE.matcher(see);
      if (m.find()) {
        String className = m.group(1);
        String memberName = m.group(2);
        boolean method = m.group(3) != null;
        String label = m.group(4);

        if (className != null || memberName != null) {
          if (label == null)
            label = memberName == null ? className :
                (className != null ? className + "." : "") + memberName + (method ? "()" : "");

          JsMember classMember = className != null ? classMap.get(className) : member.getJsClass();

          if (classMember != null) {
            JsMember refMember = null;
            if (memberName != null) {
              refMember = classMember.getInstanceMember(memberName);
              if (refMember == null)
                refMember = classMember.getStaticMember(memberName);
            }

            if (memberName == null || refMember != null) {
              seeNode = doc.createElement("see");
              seeNode.appendChild(doc.createTextNode(label));
              seeNode.setAttribute("source", classMember.getName());
              if (refMember != null) {
                String idSpace = (refMember.isStatic() ? "s" : "") + refMember.getType().toString().toLowerCase();
                seeNode.setAttribute("idfk", idSpace + ":" + refMember.getName());
              }
            }
          }
        }
      }
    }

    if (seeNode == null) {
      seeNode = doc.createElement("see");
      seeNode.appendChild(doc.createTextNode(see));
    }

    node.appendChild(seeNode);
  }

  /**
   * Creates a free-form HTML block in a text element and adds it as a child of <code>node</code>. If <code>text</code>
   * is not valid XML, then is escaped and set as the sole text node child of the text element.
   *
   * @param node
   * @param text
   */
  private void createTextBlock(Element node, String text) {
    if (text == null || text.length() == 0)
      return;

    Document doc = node.getOwnerDocument();
    Element textNode = doc.createElement("text");
    node.appendChild(textNode);

    try {
      Document textDoc = parser.parse(new InputSource(new StringReader("<root>" + text + "</root>")));
      NodeList children = textDoc.getDocumentElement().getChildNodes();
      for (int i = 0; i < children.getLength(); i++) {
        Node child = children.item(i);
        child = doc.importNode(child, true);
        textNode.appendChild(child);
      }
      return;
    } catch (SAXException e) {
      Node parent = node.getParentNode();
      String memberName = parent instanceof Element ?
          ((Element) parent).getAttribute("name") + "." + node.getAttribute("name") :
          node.getAttribute("name");

      log(Level.WARNING, "Text block not XML: " + memberName);
      log(Level.WARNING, text);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    textNode.setAttribute("esc", "1");
    textNode.appendChild(doc.createTextNode(text));
  }

  private void serializeInheritedClassMember(Element root, JsMember member) {
    Document doc = root.getOwnerDocument();
    Element node = null;

    if (member.getType() == JsMember.Type.METHOD) {
      node = doc.createElement("method");
      node.setAttribute("id", (member.isStatic() ? "smethod" : "method") + ":" + member.getName());
      if (member.isAbstract())
        node.setAttribute("abstract", "1");
      if (member.isFinal())
        node.setAttribute("final", "1");
    } else if (member.getType() == JsMember.Type.FIELD) {
      node = doc.createElement("field");
      node.setAttribute("id", (member.isStatic() ? "sfield" : "field") + ":" + member.getName());
    }

    if (node != null) {
      node.setAttribute("source", member.getParent().getName());
      node.setAttribute("name", member.getName());
      node.setAttribute("idfk", node.getAttribute("id"));
      node.setAttribute("inherited", "1");
      if (member.isDeprecated())
        node.setAttribute("deprecated", "1");
      if (member.isNative())
        node.setAttribute("native", "1");

      root.appendChild(node);
    }
  }

  /**
   * Returns the list of classes and interfaces from which <code>c</code> inherits in the proper precedence order.
   *
   * @param c
   * @return
   */
  private List<JsMember> getInheritance(JsMember c) {
    List<JsMember> inh = new ArrayList<JsMember>();
    JsMember traverser = c;
    while (traverser != null) {
      for (String className : traverser.getInterfaces()) {
        JsMember aClass = classMap.get(className);
        if (aClass != null && !inh.contains(aClass))
          inh.add(aClass);
      }
      JsMember superClass = classMap.get(traverser.getSuperClass());
      if (superClass != null)
        inh.add(superClass);

      traverser = superClass;
    }

    return inh;
  }

  private void serializeClassMember(Element root, JsMember member, JsMember overrides) {
    Document doc = root.getOwnerDocument();
    Element node = null;

    if (member.getType().isMethodType()) {
      node = doc.createElement(member.getType() == JsMember.Type.CONSTRUCTOR ? "constructor" : "method");
      node.setAttribute("id", (member.isStatic() ? "smethod" : "method") + ":" + member.getName());

      if (member.isAsync())
        node.setAttribute("async", "1");

      // Serialize @param
      for (JsParam param : member.getParams()) {
        Element paramNode = doc.createElement("param");
        paramNode.setAttribute("name", param.getName());
        if (param.getDescription() != null)
          paramNode.setAttribute("text", param.getDescription());
        serializeMemberType(paramNode, param.getType());
        node.appendChild(paramNode);
      }

      // Serialize @return
      if (member.getReturnText() != null) {
        Element returnNode = doc.createElement("return");
        returnNode.setAttribute("text", member.getReturnText());
        serializeMemberType(returnNode, member.getReturnType());
        node.appendChild(returnNode);
      }

      // Serialize @throws
      List<String> throwText = member.getThrowsTexts();
      for (int i = 0; i < throwText.size(); i++) {
        String text = throwText.get(i);
        JsType type = member.getThrowsTypes().get(i);
        Element throwsNode = doc.createElement("throws");
        throwsNode.setAttribute("text", text);
        serializeMemberType(throwsNode, type);
        node.appendChild(throwsNode);
      }
    } else if (member.getType() == JsMember.Type.FIELD) {
      node = doc.createElement("field");
      node.setAttribute("id", (member.isStatic() ? "sfield" : "field") + ":" + member.getName());
      node.setAttribute("class", root.getAttribute("name"));
      node.setAttribute("fullname", root.getAttribute("name") + "." + member.getName());

      String constantValue = member.getConstantValue();
      if (constantValue != null)
        node.setAttribute("value", constantValue);

      serializeMemberType(node, member.getReturnType());
    } else if (member.getType().isClassType()) {
      node = doc.createElement("nested");
      node.setAttribute("id", "nested:" + member.getName());
      node.setAttribute("shortname", member.getMemberName());
      node.setAttribute("loaded", "1");
      node.setAttribute("type", member.getType().toString().toLowerCase());
    }

    if (node != null) {
      root.appendChild(node);
      node.setAttribute("name", member.getName());
      serializeCommonAttributes(member, node, true);

      if (member.isStatic())
        node.setAttribute("static", "1");

      if (overrides != null) {
        Element overNode = doc.createElement(overrides.getParent().getType() == JsMember.Type.CLASS ? "overrides" : "overridesmix");
        node.appendChild(overNode);
        overNode.setAttribute("id", "overrides:" + overrides.getName());
        overNode.setAttribute("name", overrides.getName());
        overNode.setAttribute("idfk", overrides.getType().toString().toLowerCase() + ":" + overrides.getName());
        overNode.setAttribute("source", overrides.getParent().getName());
      }
    }
  }

  private void serializeMemberType(Element node, JsType type) {
    serializeMemberType(node, type, false);
  }

  /**
   * Maps primitive types onto the JavaScript class types that they should link to.
   */
  private static Map<String, String> TYPES_ALIAS = new HashMap<String, String>();

  static {
    TYPES_ALIAS.put("float", "Number");
    TYPES_ALIAS.put("int", "Number");
    TYPES_ALIAS.put("boolean", "Boolean");
  }

  private static final Pattern LANG_PKG = Pattern.compile("^jsx3\\.(\\w+)$");

  private void serializeMemberType(Element node, JsType type, boolean skipOr) {
    if (type == null) return;
    LOG.finer("Serializing: " + type);

    Document doc = node.getOwnerDocument();
    if (type.getOr().size() > 0 && !skipOr) {
      Element nodeToAttach = node;
      if ("type".equals(node.getNodeName())) {
        nodeToAttach = doc.createElement("typeor");
        node.appendChild(nodeToAttach);
      }
      serializeMemberType(nodeToAttach, type, true);
      for (JsType orType : type.getOr())
        serializeMemberType(nodeToAttach, orType);
    } else {
      String typeName = type.getType();
      Matcher m = LANG_PKG.matcher(typeName);
      if (m.find()) {
        String tryName = "jsx3.lang." + m.group(1);
        if (classMap.containsKey(tryName))
          typeName = tryName;
      }

      Element typeNode = doc.createElement("type");
      node.appendChild(typeNode);
      typeNode.setAttribute("name", typeName);
      if (TYPES_ALIAS.containsKey(typeName)) {
        typeNode.setAttribute("class", TYPES_ALIAS.get(typeName));
        if (classMap.containsKey(TYPES_ALIAS.get(typeName)))
          typeNode.setAttribute("link", "1");
      } else {
        if (classMap.containsKey(typeName))
          typeNode.setAttribute("link", "1");
      }
      if (type.isVarargs())
        typeNode.setAttribute("varargs", "1");

      for (JsType genType : type.getGenerics())
        serializeMemberType(typeNode, genType);
    }
  }

  /**
   * Returns the file path for a class, interface, or package member.
   *
   * @param c the member.
   * @return
   */
  private String getPathForClass(JsMember c) {
    if (c.getType() == JsMember.Type.PACKAGE) {
      if (GLOBAL_PACKAGE.equals(c.getName()))
        return "package-summary.xml";
      else
        return c.getName().replace(".", "/") + "/package-summary.xml";
    } else {
      String pkg = c.getPackageName();
      return pkg.length() > 0 && !GLOBAL_PACKAGE.equals(pkg) ?
          c.getPackageName().replace(".", "/") + "/" + c.getMemberName() + ".xml" :
          c.getMemberName() + ".xml";
    }
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  private void log(Level level, String msg, Throwable t) {
    if (strict)
      throw new RuntimeException(msg, t);
    LOG.log(level, msg, t);
  }

  private Document newDocument() {
    return parser.newDocument();
  }

  /**
   * Sets the directory where compiled documentation files are written. Files are written to this directory and nested
   * directories based on the package structure of the compiled classes.
   *
   * @param destDir
   */
  public void setDestDir(File destDir) {
    this.destDir = destDir;
  }

  /**
   * Adds a source JavaScript file to this compiler.
   *
   * @param srcFile
   */
  public void addSrcFile(File srcFile) {
    this.srcFiles.add(srcFile);
  }

  /**
   * Returns the number of source files that this compiler has processed or will process.
   * @return
   */
  public int getFileCount() {
    return srcFiles.size();
  }

  /**
   * Sets the access level for this compiler. All members that have access levels more restrictive than this level will
   * be omitted from the documentation compilation.
   *
   * @param access
   */
  public void setAccess(JsMember.Access access) {
    this.access = access;
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
