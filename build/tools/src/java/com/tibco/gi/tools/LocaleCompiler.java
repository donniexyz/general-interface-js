/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.tools;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
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

import org.jaxen.JaxenException;
import org.jaxen.dom.DOMXPath;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * Compiles a localized properties bundle from Common Locale Data Repository (CLDR) data and any number of other
 * localized properties sources. The bundle is in the format supported by the General Interface JavaScript class
 * <code>jsx3.app.PropsBundle</code>.
 * <p/>
 * General Interface requires that certain properties exist in the properties bundle at
 * <code>JSX/locale/locale.xml</code>. Most of these properties can be derived in some way from the data provided by the
 * CLDR data. This tool inspects the CLDR data and converts the relevant fields to properties that GI understands.
 * Because the CLDR does not have all the data that GI requires, this tool also supports merging the compiled CLDR data
 * with any number of other localized properties sources.
 *
 * @author Jesse Costello-Good
 */
public class LocaleCompiler {

  private static final Logger LOG = Logger.getLogger(LocaleCompiler.class.getName());

  /**
   * Path from the CLDR directory to the main data directory.
   */
  private static final String MAIN_PATH = "data/common/main/";
  private static final String SUPPLEMENTAL_PATH = "data/common/supplemental/supplementalData.xml";

  private static final Comparator LOCALE_COMPARATOR = new Comparator<Locale>() {
    public int compare(Locale a, Locale b) {
      return Utils.getNewLocaleKey(a).compareTo(Utils.getNewLocaleKey(b));
    }
  };

  /**
   * We need to keep the locales to process sorted so that a locale is always processed after any locales that it
   * depends on.
   */
  private final SortedSet<Locale> locales = new TreeSet<Locale>(LOCALE_COMPARATOR);
  private File outFile;
  private URL cldrURL;
  private final Set<URL> sourceURLs = new HashSet<URL>(); // ok non-deterministic access?
  private String defaultLocale = "en_US";
  private String rootLocale = "root";
  private boolean mergeLanguages = true;
  private boolean strict = false;

  /**
   * Keep track of any languages that are included in this compile. We will know to include the name of the language in
   * the localized resource.
   */
  private final SortedSet<String> languages = new TreeSet<String>();

  /**
   * Keep track of any countries that are included in this compile. We will know to include the name of the country in
   * the localized resource.
   */
  private final SortedSet<String> countries = new TreeSet<String>();

  public LocaleCompiler() {
  }

  /**
   * Runs the compiler and outputs the target properties bundle. The target properties bundle is the result of merging
   * the CLDR data and any additional properties bundles registered with {@link #addSourceURI}. The target properties
   * bundle consists of the default locale and any other locales registered with {@link #addLocale(java.util.Locale)}.
   *
   * @throws Exception
   */
  public void run() throws IOException {
    if (outFile == null) throw new NullPointerException("Output file must be specified.");
    if (cldrURL == null) throw new NullPointerException("CLDR URL must be specified.");

    // Merge the default locale only if it equals "root", otherwise we'll wait until we encounter the default
    // locale while processing all the locales.
    if (rootLocale.equals(defaultLocale)) {
      List<URL> uris = new ArrayList<URL>();
      uris.add(mergeURIs(cldrURL, MAIN_PATH + rootLocale + ".xml"));
      uris.addAll(mergeURIs(sourceURLs, rootLocale + ".xml"));
      mergeSourceFiles(uris, rootLocale, null, true);
    }

    // Merge all other locales registered with this compiler.
    for (Locale locale : locales) {
      boolean main = false;
      List<URL> uris = new ArrayList<URL>();

      // The CDLR supplemental data file has important data indexed by locale key.
      uris.add(mergeURIs(cldrURL, SUPPLEMENTAL_PATH));

      // If this is the default locale, merge any data from the root.xml files of the source directories.
      if (locale.equals(new Locale(defaultLocale))) {
        uris.add(mergeURIs(cldrURL, MAIN_PATH + rootLocale + ".xml"));
        uris.addAll(mergeURIs(sourceURLs, rootLocale + ".xml"));
        main = true;
      }

      // Merge any localized resources from the source directories for this locale. Any source is allowed to not
      // have a resource for this locale ... it will just be ignored.
      uris.add(mergeURIs(cldrURL, MAIN_PATH + Utils.getNewLocaleKey(locale) + ".xml"));
      uris.addAll(mergeURIs(sourceURLs, Utils.getNewLocaleKey(locale) + ".xml"));

      // Figure out the file to merge into. We may need to strip off the country code and add it to the file
      // named with just the language code.
      String keyParent = null;
      if (mergeLanguages) {
        if (Utils.getNewLanguageCode(locale).equals(defaultLocale.substring(0, 2))) {
          keyParent = rootLocale;
          main = true;
        } else if (locale.getCountry().length() > 0) {
          keyParent = Utils.getNewLanguageCode(locale);
        }
      }

      mergeSourceFiles(uris, Utils.getNewLocaleKey(locale), keyParent, main);
    }
  }

  /**
   * Merge a set of data source into a single localized resource.
   *
   * @param uris      the set of sources.
   * @param key       the locale key, such as en_US.
   * @param keyParent the locale key of the file to write to.
   * @param main      <code>true</code> if writing to root.xml.
   */
  private void mergeSourceFiles(List<URL> uris, String key, String keyParent, boolean main)
      throws IOException {

    // Figure out the file to write to.
    String name = outFile.getName();
    if (name.indexOf(".") >= 0) name = name.substring(0, name.indexOf("."));
    String fileExt = main ? "" : (keyParent != null ? keyParent : key) + ".";

    File out = new File(outFile.getParentFile(), name + "." + fileExt + "xml");
    Document outDoc = null;

    // If the output file already exists, parse it and we'll add this locale to it.
    if (out.isFile()) {
      try {
        outDoc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(out);
      } catch (Exception e) {
        throw new IOException(e.toString());
      }
    }

    // If there is no valid XML file already, create a new one.
    if (outDoc == null) {
      try {
        outDoc = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
      } catch (ParserConfigurationException e) {
        throw new Error(e);
      }
    }

    // Set up the standard jsx3.app.PropsBundle XML format.
    Element data = outDoc.getDocumentElement();
    if (data == null) {
      data = outDoc.createElement("data");
      outDoc.appendChild(data);
      data.setAttribute("jsxnamespace", "propsbundle");
    }

    // If this is the main bundle file, we need to add to it metadata indicating which locales are stored in
    // other files in this bundle.
    if (main && !data.hasAttribute("locales")) {
      SortedSet<Locale> extLocales = new TreeSet<Locale>(LOCALE_COMPARATOR);

      // get all the locales that are stored externally
      for (Locale locale : locales) {
        if (locale.equals(new Locale(defaultLocale))) continue;
        if (mergeLanguages && locale.getCountry().length() > 0) {
          Locale l2 = new Locale(locale.getLanguage());
          if (locales.contains(l2)) locale = l2;
          if (locale.equals(new Locale(defaultLocale.substring(0, 2)))) continue;
        }

        extLocales.add(locale);
      }

      // serialize them into the locales attribute of the root element
      StringBuilder sb = new StringBuilder();
      for (Locale l : extLocales)
        sb.append(",").append(Utils.getNewLocaleKey(l));
      data.setAttribute("locales", sb.length() > 0 ? sb.substring(1) : "");
    }

    // Create a new <locale> element for this locale.
    Element locNode = outDoc.createElement("locale");
    data.appendChild(locNode);
    if (!key.equals(defaultLocale))
      locNode.setAttribute("key", key);

  LOG.fine("Merging .. " + key);
    // For each source document, merge the contents into the <locale> element.
    for (URL uri : uris)
      mergeSourceToNode(uri, locNode, getLocale(key));

    // Compile any properties that derive from other properties.
    findDerivativeValues(locNode);

    // Serialize the result to disk.
    Utils.serializeDocument(outDoc, out);
  }

  /**
   * Merges a single source into a localized resource of the target properties bundle.
   *
   * @param source the data source.
   * @param node   the &lt;locale&gt; element.
   * @param l      the locale of the resource.
   */
  private void mergeSourceToNode(URL source, Element node, Locale l)
      throws MalformedURLException {

    Document srcDoc;

    // Try to read the data source. Each data source may not exist for a particular locale so we ignore most
    // errors that prevent reading the data source.
    try {
      InputStream srcStream = source.openStream();
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      DocumentBuilder builder = factory.newDocumentBuilder();
      builder.setEntityResolver(new EntityResolver() {
        public InputSource resolveEntity(String s, String uri) throws SAXException, IOException {
          return new InputSource(mergeURIs(cldrURL, uri.substring(uri.lastIndexOf("cldr/") + 5)).openStream());
        }
      });
      srcDoc = builder.parse(srcStream);
    } catch (IOException e) {
      if (!source.toString().startsWith("file:")) {
        log(Level.WARNING, "Error reading source file " + source + ": " + e, e);
      } else if (e instanceof FileNotFoundException) {
    // ignore file not found
        // LOG.log(Level.WARNING, "Error reading source file " + source + ": " + e, e);
    } else
      log(Level.SEVERE, "Error reading source file " + source + ": " + e, e);
      return;
    } catch (SAXException e) {
      log(Level.SEVERE, "Error reading source file " + source + ": " + e, e);
      return;
    } catch (ParserConfigurationException e) {
      throw new Error(e);
    }

    // Depending on the name of the document's root element, choose the routine to merge the data source.
    String docElmName = srcDoc.getDocumentElement().getNodeName();
    if ("ldml".equals(docElmName)) {
      mergeUnicodeOrgSource(node, srcDoc);
    } else if ("supplementalData".equals(docElmName)) {
      mergeUnicodeOrgSDSource(node, srcDoc, l);
    } else if ("data".equals(docElmName)) {
      mergePropertiesSource(node, srcDoc);
    } else {
      log(Level.WARNING, "Bad source file " + source + " with root element <" + docElmName + ">");
    }
  }

  /**
   * A map of simple queries to perform on the CLDR data. Each pair is an XPath query and the name of a PropsBundle
   * property to set. More complicated data merging is handled programmatically below.
   */
  private static final Map<String, String> SIMPLE_MAP = new HashMap<String, String>();

  static {
    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='full']/dateFormat/pattern", "format.date.full");
    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='long']/dateFormat/pattern", "format.date.long");
    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='medium']/dateFormat/pattern", "format.date.medium");
    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/dateFormats/dateFormatLength[@type='short']/dateFormat/pattern", "format.date.short");

    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='full']/timeFormat/pattern", "format.time.full");
    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='long']/timeFormat/pattern", "format.time.long");
    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='medium']/timeFormat/pattern", "format.time.medium");
    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/timeFormats/timeFormatLength[@type='short']/timeFormat/pattern", "format.time.short");

    SIMPLE_MAP.put("/ldml/dates/calendars/calendar[@type='gregorian']/dateTimeFormats/dateTimeFormatLength/dateTimeFormat/pattern", "format.datetime");

    SIMPLE_MAP.put("/ldml/numbers/symbols/decimal", "number.decimal");
    SIMPLE_MAP.put("/ldml/numbers/symbols/group", "number.grouping");
    SIMPLE_MAP.put("/ldml/numbers/symbols/minusSign", "number.minus");
    SIMPLE_MAP.put("/ldml/numbers/symbols/nativeZeroDigit", "number.zero");
    SIMPLE_MAP.put("/ldml/numbers/symbols/percentSign", "number.percent");
    SIMPLE_MAP.put("/ldml/numbers/symbols/perMille", "number.permille");
    SIMPLE_MAP.put("/ldml/numbers/symbols/nan", "number.NaN");
    SIMPLE_MAP.put("/ldml/numbers/symbols/infinity", "number.infinity");
    SIMPLE_MAP.put("/ldml/numbers/currencies/currency/decimal", "number.currency.decimal");
    SIMPLE_MAP.put("/ldml/numbers/currencies/currency/group", "number.currency.grouping");

    SIMPLE_MAP.put("/ldml/numbers/decimalFormats/decimalFormatLength/decimalFormat/pattern", "format.number");
    SIMPLE_MAP.put("/ldml/numbers/currencyFormats/currencyFormatLength/currencyFormat/pattern", "format.number.currency");
    SIMPLE_MAP.put("/ldml/numbers/percentFormats/percentFormatLength/percentFormat/pattern", "format.number.percent");
  }

  /**
   * Merge the data from a file in the CLDR main data area into this locale.
   *
   * @param node   the &lt;locale&gt; element.
   * @param srcDoc the data source.
   */
  private void mergeUnicodeOrgSource(Element node, Document srcDoc) {
    try {
// Do all the simple queries listed above in SIMPLE_MAP.
      for (String query : SIMPLE_MAP.keySet()) { // ok non-deterministic access
        Element elm = (Element) new DOMXPath(query).selectSingleNode(srcDoc);
        if (elm != null)
          setLocaleProperty(node, SIMPLE_MAP.get(query), elm.getFirstChild().getNodeValue(), false);
      }

      // Do the three month lengths.
      Element months = (Element) new DOMXPath("/ldml/dates/calendars/calendar[@type='gregorian']/months").selectSingleNode(srcDoc);
      if (months != null) {
        List<Element> shortMonths = new DOMXPath("monthContext[@type='format']/monthWidth[@type='abbreviated']/month[not(@draft)]").selectNodes(months);
        if (shortMonths.size() > 0)
          setArrayLocaleProperty(node, "date.month.abbrev", shortMonths);

        List<Element> fullMonths = new DOMXPath("monthContext[@type='format']/monthWidth[@type='wide']/month[not(@draft)]").selectNodes(months);
        if (fullMonths.size() > 0)
          setArrayLocaleProperty(node, "date.month", fullMonths);

        List<Element> narrowMonths = new DOMXPath("monthContext[@type='stand-alone']/monthWidth[@type='narrow']/month[not(@draft)]").selectNodes(months);
        if (narrowMonths.size() > 0)
          setArrayLocaleProperty(node, "date.month.narrow", narrowMonths);
      }

      // Do the three day of the week lengths.
      Element days = (Element) new DOMXPath("/ldml/dates/calendars/calendar[@type='gregorian']/days").selectSingleNode(srcDoc);
      if (days != null) {
        List<Element> shortDays = new DOMXPath("dayContext[@type='format']/dayWidth[@type='abbreviated']/day[not(@draft)]").selectNodes(days); 
        if (shortDays.size() > 0)
          setArrayLocaleProperty(node, "date.day.abbrev", shortDays);

        List<Element> fullDays = new DOMXPath("dayContext[@type='format']/dayWidth[@type='wide']/day[not(@draft)]").selectNodes(days);
        if (fullDays.size() > 0)
          setArrayLocaleProperty(node, "date.day", fullDays);

        List<Element> narrowDays = new DOMXPath("dayContext[@type='stand-alone']/dayWidth[@type='narrow']/day[not(@draft)]").selectNodes(days);
        if (narrowDays.size() > 0)
          setArrayLocaleProperty(node, "date.day.narrow", narrowDays);
      }

      // Do the two era lengths.
      Element eras = (Element) new DOMXPath("/ldml/dates/calendars/calendar[@type='gregorian']/eras").selectSingleNode(srcDoc);
      if (eras != null) {
        List<Element> shortMonths = new DOMXPath("eraNames/era[not(@draft)]").selectNodes(eras);
        if (shortMonths.size() > 0)
          setArrayLocaleProperty(node, "date.era.long", shortMonths);

        List<Element> fullMonths = new DOMXPath("eraAbbr/era[not(@draft)]").selectNodes(eras);
        if (fullMonths.size() > 0)
          setArrayLocaleProperty(node, "date.era", fullMonths);
      }

      // Do AM/PM.
      Element am = (Element) new DOMXPath("/ldml/dates/calendars/calendar[@type='gregorian']/am[not(@draft)]").selectSingleNode(srcDoc);
      Element pm = (Element) new DOMXPath("/ldml/dates/calendars/calendar[@type='gregorian']/pm[not(@draft)]").selectSingleNode(srcDoc);
      if (am != null && pm != null) {
        List<Element> ampm = new ArrayList<Element>();
        ampm.add(am);
        ampm.add(pm);
        setArrayLocaleProperty(node, "time.ampm", ampm);
      }

      // Include the localized name of any language included in this compilation.
      Element lang = (Element) new DOMXPath("/ldml/localeDisplayNames/languages").selectSingleNode(srcDoc);
      if (lang != null) {
        for (String language : languages) {
          Element langNode = (Element) new DOMXPath("language[@type='" + language + "']").selectSingleNode(lang);
          if (langNode != null)
            setLocaleProperty(node, "string.lang." + language, langNode.getFirstChild().getNodeValue(), false);
        }
      }

      // Include the localized name of any country included in this compilation.
      Element terr = (Element) new DOMXPath("/ldml/localeDisplayNames/territories").selectSingleNode(srcDoc);
      if (terr != null) {
        for (String country : countries) {
          Element terrNode = (Element) new DOMXPath("territory[@type='" + country + "']").selectSingleNode(terr);
          if (terrNode != null)
            setLocaleProperty(node, "string.terr." + country, terrNode.getFirstChild().getNodeValue(), false);
        }
      }
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    }
  }

  private static final List<String> DAYS = Arrays.asList("sun", "mon", "tue", "wed", "thu", "fri", "sat");

  /**
   * Merge any data from the CLDR supplemental data source.
   *
   * @param node   the &lt;locale&gt; element.
   * @param srcDoc the data source.
   * @param l      the locale for the &lt;locale&gt; element.
   */
  private void mergeUnicodeOrgSDSource(Element node, Document srcDoc, Locale l) {
    try {
      String terr = l.getCountry();

      if (terr.length() == 2) {
        // Do the first day of week.
        List<Element> days = new DOMXPath("/supplementalData/weekData/firstDay").selectNodes(srcDoc);
        for (Element day : days) {
          if (day.getAttribute("territories").indexOf(terr) >= 0)
            setLocaleProperty(node, "date.firstWeekDay", "" + DAYS.indexOf(day.getAttribute("day")), true);
        }

        // Get the code of the currency currently used in this country.
        Element currency = (Element) new DOMXPath("/supplementalData/currencyData/region[@iso3166='" + terr + "']/currency[not(@to)]").selectSingleNode(srcDoc);
        if (currency != null)
          setLocaleProperty(node, "currency.code", currency.getAttribute("iso4217"), false);
      }
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Compile any properties that derive solely from other properties already compiled.
   *
   * @param node the &lt;locale&gt; element.
   */
  private void findDerivativeValues(Element node) {
    try {
// Whether this locale uses a 24 hour clock.
      String timeShort = getLocaleProperty(node, "format.time.short");
      if (timeShort != null) setLocaleProperty(node, "time.24hour",
          timeShort.indexOf("h") >= 0 || timeShort.indexOf("K") >= 0 ? "false" : "true", true);

      // Derive the integer number format from the decimal format.
      String decFormat = getLocaleProperty(node, "format.number");
      if (decFormat != null) {
        int i = decFormat.lastIndexOf(".");
        if (i < 0) i = decFormat.length();
        setLocaleProperty(node, "format.number.integer", decFormat.substring(0, i), false);
      }

      // Derive the tokens that separate the time format fields.
      String timeLong = getLocaleProperty(node, "format.time.long");
      if (timeLong != null) {
        DateFormat df = new SimpleDateFormat(timeLong, Locale.US);
        Calendar c = Calendar.getInstance(Locale.US);
        c.set(Calendar.HOUR, 1);
        c.set(Calendar.MINUTE, 2);
        c.set(Calendar.SECOND, 3);
        c.set(Calendar.MILLISECOND, 4);
        String s = df.format(c.getTime());
        Pattern p = Pattern.compile("\\D+");
        Matcher m = p.matcher(s);

        if (s.indexOf("1") >= 0 && s.indexOf("2") >= 0 && m.find(s.indexOf("1") + 1))
          setLocaleProperty(node, "time.sep.hour-min", m.group(), false);

        if (s.indexOf("2") >= 0 && s.indexOf("3") >= 0 && m.find(s.indexOf("2") + 1))
          setLocaleProperty(node, "time.sep.min-sec", m.group(), false);

        if (s.indexOf("3") >= 0 && s.indexOf("4") >= 0 && m.find(s.indexOf("3") + 1))
          setLocaleProperty(node, "time.sep.sec-milli", m.group(), false);

        if (timeLong.indexOf("a") >= 0) {
          Matcher m2 = Pattern.compile("\\d(\\D*)AM").matcher(s);
          if (m2.find())
            setLocaleProperty(node, "time.sep.ampm", m2.group(1), false);
        }
      }

      // Check all date formats for validity.
      String[] lengths = new String[]{"short", "medium", "long", "full"};
      String[] prefixs = new String[]{"format.time.", "format.date."};
      for (String length : lengths) {
        for (String prefix : prefixs) {
          String value = getLocaleProperty(node, prefix + length);
          if (value != null) {
            try {
              DateFormat df = new SimpleDateFormat(value);
            } catch (Exception e) {
              String newValue = value.replaceAll("v", "z").replaceAll("V", "Z");
              try {
                DateFormat df = new SimpleDateFormat(newValue);
                setLocaleProperty(node, prefix + length, newValue, false);
                LOG.fine("Corrected format \"" + value + "\" to \"" + newValue + "\"");
              } catch (Exception e1) {
                log(Level.WARNING, "Error parsing date format \"" + value + "\": " + e);
              }
            }
          }
        }
      }
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    }
  }

  private void setArrayLocaleProperty(Element node, String id, List<Element> elm) throws JaxenException {
    StringBuilder sb = new StringBuilder();
    for (Element element : elm) {
      sb.append(",'").append(element.getFirstChild().getNodeValue()).append("'");
    }
  //LOG.info( id + "=" + sb.toString());
    sb.append("]");
    setLocaleProperty(node, id, "[" + sb.substring(1), true);
  }

  private String getLocaleProperty(Element node, String id) throws JaxenException {
    Element existing = (Element) new DOMXPath("record[@jsxid='" + id + "']").selectSingleNode(node);
    return existing != null ? existing.getAttribute("jsxtext") : null;
  }

  private void setLocaleProperty(Element node, String id, String value, boolean eval) throws JaxenException {
    Element existing = (Element) new DOMXPath("record[@jsxid='" + id + "']").selectSingleNode(node);
    if (existing != null)
      existing.getParentNode().removeChild(existing);

    Element prop = node.getOwnerDocument().createElement("record");
    node.appendChild(prop);

    prop.setAttribute("jsxid", id);
    prop.setAttribute("jsxtext", value);
    if (eval)
      prop.setAttribute("eval", "1");
  }

  private void mergePropertiesSource(Element node, Document srcDoc) {
    try {
      List<Element> records = new DOMXPath("/data/record").selectNodes(srcDoc);
      for (Element record : records) {
        String id = record.getAttribute("jsxid");
        Element existing = (Element) new DOMXPath("record[@jsxid='" + id + "']").selectSingleNode(srcDoc);
        if (existing != null)
          existing.getParentNode().removeChild(existing);

        node.appendChild(node.getOwnerDocument().importNode(record, true));
      }
    } catch (JaxenException e) {
      throw new RuntimeException(e);
    }
  }

  private List<URL> mergeURIs(Collection<URL> sourceURIs, String path) throws MalformedURLException {
    List<URL> uris = new ArrayList<URL>();
    for (URL sourceURI : sourceURIs) {
      String glue = sourceURI.toString().endsWith("/") ? "" : "/";
      uris.add(new URL(sourceURI + glue + path));
    }
    return uris;
  }

  private URL mergeURIs(URL sourceURL, String path) throws MalformedURLException {
    String glue = sourceURL.toString().endsWith("/") ? "" : "/";
    return new URL(sourceURL + glue + path);
  }

  private Locale getLocale(String l) {
    String lang = null, ctry = null;

    String[] parts = l.split("_");
    if (parts[0].length() > 0)
      lang = parts[0].toLowerCase();
    if (parts.length > 1)
      ctry = parts[1].toUpperCase();

    return ctry != null ? new Locale(lang, ctry) : new Locale(lang);
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

  /**
   * Add a locale to the target properties bundle.
   *
   * @param locale the string representation of a locale, such as <code>en_US</code>.
   */
  public void addLocale(String locale) {
    addLocale(getLocale(locale));
  }

  /**
   * Add a locale to the target properties bundle.
   *
   * @param locale
   */
  public void addLocale(Locale locale) {
    this.locales.add(locale);
    languages.add(Utils.getNewLanguageCode(locale));
    countries.add(locale.getCountry());
  }

  /**
   * Sets the main file of the target properties bundle.
   *
   * @param outFile
   */
  public void setOutFile(File outFile) {
    this.outFile = outFile;
  }

  /**
   * Adds a properties bundle to the list of bundles to merge into the CLDR data.
   *
   * @param sourceURI the URL of the main file of the properties bundle to merge.
   */
  public void addSourceURI(URL sourceURI) {
    this.sourceURLs.add(sourceURI);
  }

  /**
   * Sets the default locale for the target properties bundle. The data for this locale from each localized source will
   * be used to construct the default properties of the target properties bundle. The default is <code>root</code>.
   *
   * @param defaultLocale
   */
  public void setDefaultLocale(String defaultLocale) {
    this.defaultLocale = defaultLocale;
  }

  /**
   * Sets whether to output properties of the target properties bundle that share a common language into the same file.
   * If this is <code>true</code> (the default) then, for example, only one file is written to store the properties for
   * locales <code>en</code>, <code>en_US</code>, <code>en_UK</code>, etc.
   *
   * @param mergeLanguages
   */
  public void setMergeLanguages(boolean mergeLanguages) {
    this.mergeLanguages = mergeLanguages;
  }

  /**
   * Sets the URL of the CLDR data. Resolving <code>data/common/main/</code> against this URL should yield the directory
   * containing the main CLDR data.
   *
   * @param cldrURL
   */
  public void setCldrURL(URL cldrURL) {
    this.cldrURL = cldrURL;
  }

  /**
   * Sets whether to throw exceptions rather than log warning.
   * @param strict
   */
  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
