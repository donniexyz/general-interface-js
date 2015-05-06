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
import java.util.Comparator;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Injects the contents of a Java resource bundle into the source of a JavaScript file. 
 * <p/>
 * The resource injector searched the entire contents of the <code>textFile</code> property and replaces each 
 * instance of the <code>replacementToken</code> property with the contents of the resource bundle serialized to 
 * JavaScript. The format of the serialization is:
 * <pre>{
 *   // the default locale
 *   _: {key1:"value1", ...},
 *   // any other locales specified in the <code>locales</code> property
 *   ll_CC: {key1:"value1_ll_CC", ...},
 *   ...
 * }</pre>
 * 
 * @author Jesse Costello-Good
 */
public class ResourceInjector {

  private static final Logger LOG = Logger.getLogger(ResourceInjector.class.getName());

  private File textFile;
  private String replacementToken;
  private SortedSet<Locale> locales;
  private String bundleResource;
  private boolean strict = false;
  private ClassLoader classLoader = ResourceInjector.class.getClassLoader();

  /**
   * Performs the injection. Modifies the contents of the <code>textFile</code> property to inject the resources
   * at the specified token.
   * 
   * @throws IOException
   * @throws NullPointerException  if any of the four required values have not been provided.
   */
  public void run() throws IOException {
    if (textFile == null) throw new NullPointerException("The text file must be specified.");
    if (replacementToken == null) throw new NullPointerException("The replacement token must be specified.");
    if (locales == null) throw new NullPointerException("The locale keys must be specified.");
    if (bundleResource == null) throw new NullPointerException("The bundle file must be specified.");

    LOG.info("Injecting resource bundle " + replacementToken + " with locales " + locales + " into " + textFile);

    BufferedReader reader = new BufferedReader(new FileReader(textFile));
    File tempFile = File.createTempFile(ResourceInjector.class.getName(), "txt");
    FileWriter writer = new FileWriter(tempFile);

    String line;
    while ((line = reader.readLine()) != null) {
      line = handleLine(line);
      writer.write(line);
      writer.write("\n");
    }

    reader.close();
    writer.close();

    if (!textFile.delete())
      log(Level.SEVERE, "Could not delete file " + textFile);

    if (!Utils.moveFile(tempFile, textFile))
      log(Level.SEVERE, "Could not save file " + textFile);
  }

  private String handleLine(String line) {
    int index = line.indexOf(replacementToken);
    if (index >= 0) {
      return line.substring(0, index) + compileBundle() + line.substring(index + replacementToken.length());
    } else {
      return line;
    }
  }

  private String compileBundle() {
    StringBuilder sb = new StringBuilder();
    Map<String, String> defaultValues = new HashMap<String, String>();

    sb.append("{_:{");

    Locale defaultLocale = new Locale("", "");
    ResourceBundle bundle = ResourceBundle.getBundle(bundleResource, defaultLocale);
    for (Enumeration e = bundle.getKeys(); e.hasMoreElements();) {
      String key = (String) e.nextElement();
      String value = bundle.getString(key);
      defaultValues.put(key, bundle.getString(key));
      sb.append(key).append(":\"").append(value).append("\"");
      if (e.hasMoreElements())
        sb.append(",");
    }

    sb.append("}");

    for (Locale locale : locales) {
      if (locale.equals(defaultLocale)) continue;

      String language = Utils.getNewLanguageCode(locale);
      String country = locale.getCountry();
      sb.append(",").append(language);
      if (country != null && country.length() > 0)
        sb.append("_").append(country);
      sb.append(":{");

      bundle = ResourceBundle.getBundle(bundleResource, locale);

      boolean first = false;
      for (String key : Utils.sortedKeys(defaultValues)) {
        String value = bundle.getString(key);
    // TODO -  native2ascii already converted the native strings to unicode,
    // but reading back using ResourceBundle with locale param makes it a native encoding string.
    // This step convert the native String to unicode escape string again.
    value = native2ascii(value, "\\u", null);

        if (!defaultValues.get(key).equals(value)) {
          if (first)
            sb.append(",");
          else
            first = true;

          LOG.finer(key + ": " + value);
          sb.append(key).append(":\"").append(value).append("\"");
        }
      }

      sb.append("}");
    }

    sb.append("}");
    return sb.toString();
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }

  /* Convert native String as Unicode escaped  sequence, pass "\\u" as prefix.  */
  public static String native2ascii(String str, String prefix, String postfix) {
    StringBuffer buf = new StringBuffer();
    int len = str.length();
    char ch;
    for (int i = 0; i < len; i++) {
      ch = str.charAt(i);
      switch (ch) {
       // case '\\': buf.append("\\"); break;
        case '\t': buf.append("\\t"); break;
        case '\n': buf.append("\\n"); break;
        case '\r': buf.append("\\r"); break;
        case '\f': buf.append("\\f"); break;
 
        default:
          if (ch >= ' ' && ch <= 127) {
            buf.append(ch);
          }
          else {
            if(prefix!=null) buf.append(prefix);
            buf.append( Integer.toHexString((ch >> 12) & 0xF));
            buf.append( Integer.toHexString((ch >>  8) & 0xF));
            buf.append(Integer.toHexString((ch >>  4) & 0xF));
            buf.append(Integer.toHexString((ch >>  0) & 0xF));
            if(postfix!=null) buf.append(postfix);
          }
      }
    }
    return buf.toString();
  }

  /**
   * Sets the input JavaScript file into which the resources are injected.
   * @param textFile  a text file.
   */
  public void setTextFile(File textFile) {
    this.textFile = textFile;
  }

  /**
   * Sets the string token that will be replaced with the injected resources.
   * @param replacementToken  e.g. <code>/&#42; INJECT HERE &#42;/{}</code>
   */
  public void setReplacementToken(String replacementToken) {
    this.replacementToken = replacementToken;
  }

  /**
   * Sets the locales for which to inject the resources. Each locale key is in the form <code>ll_CC</code> 
   * or <code>ll</code>.
   * @param localeKeys  the locale keys.
   */
  public void setLocaleKeys(String[] localeKeys) {
    locales = new TreeSet<Locale>(new Comparator<Locale>(){
      public int compare(Locale o1, Locale o2) {
        return o1.toString().compareTo(o2.toString());
      }
    });

    for (String key : localeKeys) {
      String[] tokens = key.split("_");
      Locale locale = tokens.length == 2 ? new Locale(tokens[0], tokens[1]) : new Locale(tokens[0], "");
      locales.add(locale);
    }
  }

  /**
   * Sets the bundle resource. The bundle should be accessible by this name from the default class loader.
   * @param bundleResource  the resource name.
   */
  public void setBundleResource(String bundleResource) {
    this.bundleResource = bundleResource;
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }

  /**
   * Sets the class loader with which the resource bundle will be loaded. Defaults to the class loader that loaded
   * the ResourceInjector class. 
   * @param classLoader
   */
  public void setClassLoader(ClassLoader classLoader) {
    this.classLoader = classLoader;
  }
}
