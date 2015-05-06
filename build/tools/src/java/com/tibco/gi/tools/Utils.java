/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Comparator;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.xml.serializer.OutputPropertiesFactory;
import org.apache.xml.serializer.Serializer;
import org.apache.xml.serializer.SerializerFactory;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

/**
 * @author Jesse Costello-Good
 */
public class Utils {

  private Utils() {
  }

  public static boolean moveFile(File src, File dest) throws IOException {
    if (!src.renameTo(dest)) {
      if (dest.exists()) {
        if (!dest.delete())
          return false;
      }

      copyFile(src, dest);

      src.delete();
    }

    return true;
  }

  public static void copyFile(File src, File dest) throws IOException {
    FileInputStream from = null;
    try {
      from = new FileInputStream(src);
      copyFile(from, dest);
    } finally {
      if (from != null)
        try {
          from.close();
        } catch (IOException e) {
        }
    }
  }

  public static void copyFile(InputStream from, File dest) throws IOException {
    FileOutputStream to = null;
    try {
      to = new FileOutputStream(dest);
      byte[] buffer = new byte[4096];
      int bytesRead;

      while ((bytesRead = from.read(buffer)) != -1)
        to.write(buffer, 0, bytesRead); // write
    } finally {
      if (to != null)
        try {
          to.close();
        } catch (IOException e) {
        }
    }
  }

  public static String readFile(File file) throws IOException {
    StringWriter writer = new StringWriter();
    Reader reader = new FileReader(file);
    appendFromReader(writer, new BufferedReader(reader));
    reader.close();
    return writer.toString();
  }

  public static void appendFromReader(Writer writer, File file) throws IOException {
    Reader reader = new FileReader(file);
    appendFromReader(writer, new BufferedReader(reader));
    reader.close();
  }

  public static void appendFromReader(Writer writer, BufferedReader reader) throws IOException {
    String line = reader.readLine();
    String nextLine;

    while (line != null) {
      nextLine = reader.readLine();

      writer.write(line);

      if (nextLine != null)
        writer.write("\n");

      line = nextLine;
    }
  }

  public static final Document parseXML(File f) throws IOException {
    return parseXML(f, false);
  }

  public static final Document parseXML(File f, boolean ignoreWhitespace) throws IOException {

    try {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      if (ignoreWhitespace)
        factory.setIgnoringElementContentWhitespace(true);
      return factory.newDocumentBuilder().parse(f);
    } catch (SAXException e) {
      throw new IOException(e.toString());
    } catch (ParserConfigurationException e) {
      throw new RuntimeException(e);
    }
  }

  public static void serializeDocument(Document doc, File file) throws IOException {
    file.getParentFile().mkdirs();

    FileOutputStream out = new FileOutputStream(file);
    Writer writer = new OutputStreamWriter(out, "utf-8");
    serializeDocument(doc, writer);
    out.close();
  }

  public static void serializeDocument(Document doc, Writer writer) throws IOException {
    serializeDocument(doc, writer, 2);
  }

  public static void serializeDocument(Document doc, Writer writer, int indent) throws IOException {
    Properties props = new Properties();
    props.put("method", "xml");
    props.put("encoding", "UTF-8");
    props.put("indent", indent > 0 ? "yes" : "no");
    if (indent > 0)
      props.put(OutputPropertiesFactory.S_KEY_INDENT_AMOUNT, "" + indent);

    Serializer serializer = SerializerFactory.getSerializer(props);
    serializer.setWriter(writer);
    serializer.asDOMSerializer().serialize(doc);
  }

  public static Collection<File> findAllRecursive(File root, FileFilter filter) throws IOException {
    LinkedList<File> dirs = new LinkedList<File>();
    dirs.add(root);

    Collection<File> found = new ArrayList<File>();

    while (dirs.size() > 0) {
      File dir = dirs.removeFirst();
      File[] children = dir.listFiles();
      for (File child : children) {
        if (child.isDirectory())
          dirs.add(child);
        else if (filter.accept(child))
          found.add(child);
      }
    }

    return found;
  }

  public static URI relativizeURI(URI u1, URI u2) {
    if (!u1.isOpaque() && !u2.isOpaque()) {
      String s1 = u1.getScheme();
      String s2 = u2.getScheme();
      String a1 = u1.getAuthority();
      String a2 = u2.getAuthority();

      if (((s1 == null && s2 == null) || (s1 != null && s1.equals(s2))) &&
          ((a1 == null && a2 == null) || (a1 != null && a1.equals(a2)))) {

        String p1 = u1.getPath();
        String p2 = u2.getPath();

        List<String> t1 = new ArrayList<String>(Arrays.asList(p1.split("/")));
        if (p1.endsWith("/")) t1.add("");
        List<String> t2 = new ArrayList<String>(Arrays.asList(p2.split("/")));
        if (p2.endsWith("/")) t2.add("");

        t1.remove(t1.size() - 1);

        List<String> tokens = new ArrayList<String>();

        int i = 0;
        while (i < t1.size() && i < t2.size()) {
          if (!t1.get(i).equals(t2.get(i))) break;
          i++;
        }

        String newPath;
        if (i < 2 && p1.indexOf("/") == 0) {
          newPath = p2;
        } else {
          for (int j = i; j < t1.size(); j++)
            tokens.add("..");

          for (int j = i; j < t2.size(); j++)
            tokens.add(t2.get(j));

          StringBuilder sb = new StringBuilder();
          for (Iterator<String> j = tokens.iterator(); j.hasNext();) {
            sb.append(j.next());
            if (j.hasNext())
              sb.append("/");
          }
          newPath = sb.toString();
        }

        try {
          return new URI(null, null, newPath, u2.getQuery(), u2.getFragment());
        } catch (URISyntaxException e) {
          return u1.relativize(u2);
        }
      }
    }

    return u2;
  }

  public static <K extends Comparable, V> List<K> sortedKeys(Map<K, V> map) {
    List<K> sorted = new ArrayList<K>(map.keySet());
    Collections.sort(sorted);
    return sorted;
  }

  public static String getNewLanguageCode(Locale l) {
    // The inverse of Java's Locale.convertOldISOCodes()
    // makes sure that the new language key is returned, rather than the old key
    String language = l.getLanguage();
    if ("iw".equals(language)) {
      return "he";
    } else if ("ji".equals(language)) {
      return "yi";
    } else if ("in".equals(language)) {
      return "id";
    } else {
      return language;
    }
  }

  public static String getNewLocaleKey(Locale l) {
    String country = l.getCountry();
    if (country != null && country.length() > 0)
      return getNewLanguageCode(l) + "_" + country;
    else
      return getNewLanguageCode(l);
  }

  public static <T> List<T> getSortedCopy(Collection<T> values, Comparator<T> comparator) {
    List<T> sorted = new ArrayList<T>(values);
    Collections.sort(sorted, comparator);
    return sorted;
  }

  public static <T extends Comparable> List<T> getSortedCopy(Collection<T> values) {
    List<T> sorted = new ArrayList<T>(values);
    Collections.sort(sorted);
    return sorted;
  }
}
