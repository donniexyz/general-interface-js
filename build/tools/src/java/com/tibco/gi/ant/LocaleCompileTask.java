/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

import com.tibco.gi.tools.LocaleCompiler;
import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Task;

/**
 * Ant interface for the {@link LocaleCompiler} tool.
 *
 * @author Jesse Costello-Good
 */
public class LocaleCompileTask extends Task {

  private File outfile;
  private String locales;
  private boolean mergelangs = true;
  private String defaultlocale;
  private String sources;
  private String cldr;
  private boolean strict = false;

  public void execute() throws BuildException {
    LocaleCompiler compiler = new LocaleCompiler();
    compiler.setOutFile(outfile);
    compiler.setMergeLanguages(mergelangs);
    compiler.setStrict(strict);
    if (defaultlocale != null)
      compiler.setDefaultLocale(defaultlocale);

    for (String locale : locales.split("[\\s,;]+"))
      compiler.addLocale(locale);

    try {
      for (String source : sources.split("[\\s,;]+")) {
        URI uri = new URI(source);
        URL url = uri.isAbsolute() ? uri.toURL() :
            new URL(this.getProject().getBaseDir().toURI().resolve(source).toString());
        compiler.addSourceURI(url);
      }

      URI uri = new URI(cldr);
      URL url = uri.isAbsolute() ? uri.toURL() :
          new URL(this.getProject().getBaseDir().toURI().resolve(cldr).toString());
      compiler.setCldrURL(url);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw new BuildException(e);
    } catch (MalformedURLException e) {
      e.printStackTrace();
      throw new BuildException(e);
    }

    try {
      compiler.run();
    } catch (Exception e) {
      e.printStackTrace();
      throw new BuildException(e);
    }
  }

  /**
   * Ant setter method for the base properties bundle file that the locale resources will be compiled to.
   *
   * @param outfile
   * @see LocaleCompiler#setOutFile
   */
  public void setOutfile(File outfile) {
    this.outfile = outfile;
  }

  /**
   * Ant setter method for the locales to include in the compilation.
   *
   * @param locales a space- or comma-separated list of locales to compile.
   * @see LocaleCompiler#addLocale
   */
  public void setLocales(String locales) {
    this.locales = locales;
  }

  /**
   * Ant setter method for whether to merge language-only locales with their descendant language+country locales.
   *
   * @param mergelangs
   * @see LocaleCompiler#setMergeLanguages
   */
  public void setMergelangs(boolean mergelangs) {
    this.mergelangs = mergelangs;
  }

  /**
   * Ant setter method for the default locale. This locale is used as the root locale for all other locale resources.
   * This value may be one of the locales set with {@link #setLocales} or <code>"root"</code>.
   *
   * @param defaultlocale
   * @see LocaleCompiler#setDefaultLocale
   */
  public void setDefaultlocale(String defaultlocale) {
    this.defaultlocale = defaultlocale;
  }

  /**
   * Ant setter method for the source directories (not including the CLDR directory) that will be merged to compile the
   * locale resource.
   *
   * @param sources a space- or comma-separated list relative or absolute URIs of directories containing localized
   * resources to merge into the compiled locale resource. This task expects to find files like <code>root.xml</code>,
   * <code>en.xml</code>, <code>en_US.xml</code>, etc. within each directory.
   * @see LocaleCompiler#addSourceURI
   */
  public void setSources(String sources) {
    this.sources = sources;
  }

  /**
   * Ant setter for the base CLDR path. The path can be a relative or absolute URI. From this path, the main CLDR data
   * should exist at the path <code>data/common/main/</code>.
   *
   * @param cldr
   * @see LocaleCompiler#setCldrURL
   */
  public void setCldr(String cldr) {
    this.cldr = cldr;
  }

  public void setStrict(boolean strict) {
    this.strict = strict;
  }
}
