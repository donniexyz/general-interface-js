/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */
package com.tibco.gi.tools.obfuscator;

import java.io.IOException;
import java.io.Reader;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.dojo.jsl.parser.EcmaScript;
import org.dojo.jsl.parser.EcmaScriptConstants;
import org.dojo.jsl.parser.Token;

/**
 * A class responsible for parsing the inline obfuscator metadata out of a JavaScript file and adding the information to
 * a particular scope. This implementation uses Dojo's EcmaScript
 *
 * @author Jesse Costello-Good
 */
public class MetaDataParser {

  private static final Logger LOG = Logger.getLogger(MetaDataParser.class.getName());

  private final static Pattern LINE_MARKER = Pattern.compile("^//\\s*@jsxobf\\-([\\-\\w]+)\\s*(\\S(.*\\S)?)\\s*?");
  private final static Pattern BLOCK_MARKER = Pattern.compile("@jsxobf\\-([\\-\\w]+)");
  private final static Pattern LAST_NAME = Pattern.compile("\\b([_a-zA-Z]\\w*(\\.[_a-zA-Z]\\w*)*)\\s*$");

  private final static Pattern NAME = Pattern.compile("^[_a-zA-Z]\\w*$");

  public final static String COMMAND_CLOBBER = "clobber";
  public final static String COMMAND_PROTECTED_CLOBBER = "clobber-shared";
  public final static String COMMAND_RENAME_PATTERN = "rename-pattern";
  public final static String COMMAND_BLESS = "bless";
  public final static String COMMAND_FINAL = "final";
  public final static String COMMAND_RESERVED = "reserved";

  public static final String GLOBAL_PREFIX = "global-";

  private boolean strict = false;

  public MetaDataParser() {
  }

  public MetaDataParser(boolean strict) {
    this.strict = strict;
  }

  /**
   * Parses any inline obfuscator metadata in <code>sourceFile</code> and places it in <code>scope</code>. Metadata
   * commands always occur in JavaScript comments and start with <code>"@jsxobf-"</code>. Supported commands are listed
   * as static fields of this class: {@link #COMMAND_CLOBBER}, {@link #COMMAND_PROTECTED_CLOBBER}, {@link
   * #COMMAND_BLESS}, {@link #COMMAND_FINAL}.
   *
   * @param sourceFile
   * @param scope
   * @throws IOException
   */
  public void parse(Reader sourceFile, Scope scope) throws IOException {
    try {
      EcmaScript parser = new EcmaScript(sourceFile);

      Token token = parser.getNextToken();
      while (token != null && token.kind != EcmaScriptConstants.EOF) {
        // Look for any line or range comment..
        if (token.kind == EcmaScriptConstants.SINGLE_LINE_COMMENT) {
          parseLineComment(token.image, parser, scope);
        } else if (token.kind == EcmaScriptConstants.MULTI_LINE_COMMENT) {
          boolean jsxComment = token.image.startsWith("/**");
          parseBlockComment(token.image.substring(jsxComment ? 3 : 2), parser, scope);
        } else {
        }

        token = parser.getNextToken();
      }

    } catch (Error e) {
      LOG.log(Level.WARNING, "Error parsing JavaScript file " + scope, e);
    }
  }

  private void parseLineComment(String text, EcmaScript parser, Scope scope) {
    // A line command must begin with the command and can contain names after the command instead of applying to
    // the following JavaScript declaration.
    Matcher m = LINE_MARKER.matcher(text);
    if (m.find()) {
      String command = m.group(1);
      String names = m.group(2);

      if (names != null) {
        addCommandToScope(scope, command, null, names.split("\\s+"));
      } else {
        parseNamesAfterCommand(command, parser, scope);
      }
    }
  }

  private void parseBlockComment(String text, EcmaScript parser, Scope scope) {
    // A block comment can contain a command anywhere but only applies to the following JavaScript declaration.
    Matcher m = BLOCK_MARKER.matcher(text);
    if (m.find()) {
      String command = m.group(1);
      parseNamesAfterCommand(command, parser, scope);
    }
  }

  private void addCommandToScope(Scope scope, String command, String equals, String... names) {
    Scope applyTo = scope;
    if (command.startsWith(GLOBAL_PREFIX)) {
      command = command.substring(GLOBAL_PREFIX.length());
      applyTo = scope.getGlobalScope();
    }

    if (COMMAND_RENAME_PATTERN.equals(command)) {
      if (names.length == 2)
        applyTo.addRenamePattern(names[0], names[1]);
      else
        log(Level.WARNING, "Command rename-pattern must have exactly two arguments {" + Arrays.asList(names) + "}.");
    } else {
      for (String name : names) {
        if (COMMAND_FINAL.equals(command)) {
          if (equals == null)
            log(Level.WARNING, "Could not parse constant value for final command for " + name + ".");
          else
            scope.getGlobalScope().addFinal(name, equals);
        } else {
          String[] path = name.split("\\.");
          String memberName = path[path.length - 1];

          if (NAME.matcher(memberName).find()) {
            if (COMMAND_BLESS.equals(command))
              applyTo.addBlessedName(memberName);
            else if (COMMAND_CLOBBER.equals(command))
              applyTo.addClobberedName(memberName);
            else if (COMMAND_PROTECTED_CLOBBER.equals(command))
              applyTo.addClobberedSharedName(memberName);
            else if (COMMAND_RESERVED.equals(command))
              applyTo.addReservedName(memberName);
            else
              log(Level.WARNING, "Bad obfuscator command '" + command + "' in " + scope.getFileScope().getFile());
          } else {
            try {
              Pattern p = Pattern.compile(memberName);
              if (COMMAND_BLESS.equals(command))
                applyTo.addBlessedName(p);
              else if (COMMAND_CLOBBER.equals(command))
                applyTo.addClobberedName(p);
              else if (COMMAND_PROTECTED_CLOBBER.equals(command))
                applyTo.addClobberedSharedName(p);
              else if (COMMAND_RESERVED.equals(command))
                log(Level.WARNING, "Obfuscator command '" + command + "' does not accept pattern argument '" + p + "'");
              else
                log(Level.WARNING, "Bad obfuscator command '" + command + "' in " + scope.getFileScope().getFile());
            } catch (PatternSyntaxException e) {
              log(Level.WARNING, "Could not parse name pattern '" + memberName + "' for command '" + command + "'.");
            }
          }
        }
      }
    }
  }

  private void parseNamesAfterCommand(String command, EcmaScript parser, Scope scope) {
    StringBuilder sb = new StringBuilder();
    Token token = parser.getNextToken();

    while (token != null && token.kind != EcmaScriptConstants.EOF) {
      if (token.kind == EcmaScriptConstants.SINGLE_LINE_COMMENT ||
          token.kind == EcmaScriptConstants.MULTI_LINE_COMMENT) {
        log(Level.SEVERE, "Encountered comment block before definition for command '" + command +
            "' in file " + scope.getFileScope().getFile() + " near line " + token.beginLine);
        break;
      }

      // Find the first token before a "=" (store expression) or ":" (object literal declaration)
      if (token.kind == EcmaScriptConstants.LINE_TERMINATOR && (sb.indexOf("=") >= 0 || sb.indexOf(":") >= 0))
        break;

      int index = token.image.indexOf(";");
      if (index >= 0) {
        sb.append(token.image.substring(0, index));
        break;
      } else {
        sb.append(token.image);
      }

      token = parser.getNextToken();
    }

    int index = sb.indexOf("=");
    int index2 = sb.indexOf(":");
    if (index < 0 || (index2 >= 0 && index2 < index))
      index = index2;
    String findLastNameIn = index >= 0 ? sb.substring(0, index) : sb.toString();

    Matcher m = LAST_NAME.matcher(findLastNameIn);
    if (m.find()) {
      addCommandToScope(scope, command, index >= 0 ? sb.substring(index + 1).trim() : null, m.group(1));
    } else {
      log(Level.WARNING, "Could not find target of command '" + command + "' in statement '" + sb + "'" +
          (token != null ? " near line " + token.endLine : ""));
    }
  }

  private void log(Level level, String msg) {
    if (strict)
      throw new RuntimeException(msg);
    LOG.log(level, msg);
  }
}
