/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Constructs messages from a pattern and parameters. A message format takes a list of arguments, formats
 * them, and inserts them into the pattern at specific places. 
 * <p/>
 * Replacement tokens are delimited with curly braces. Tokens begin with an integer, which determines the format
 * parameter that is inserted in place of the token. The following tokens are supported where <code>n</code> is the
 * zero-based parameter index:
 * <ul>
 *   <li><b>{n}</b> &#8212; Replaced with the nth parameter. The formatting of the nth parameter, <code>param</code>,
 *                   depends on its data type:
 *     <ul>
 *       <li><code>null</code> &#8212; "null"</li>
 *       <li><code>string</code> &#8212; param</li>
 *       <li><code>number</code> &#8212; {n,number}</li>
 *       <li><code>Object</code> &#8212; param.toString()</li>
 *       <li><code>Date</code> &#8212; {n,datetime,short}</li>
 *       <li>Not provided &#8212; "{n}"</li>
 *     </ul>
 *   </li>
 *   <li><b>{n,date}</b> &#8212; Formats the nth parameter as a date with the default format length (medium).</li>
 *   <li><b>{n,date,[short|medium|long|full|<i>format</i>]}</b> &#8212; Formats the nth parameter as a date according to the
 *       specified format length or an arbitrary date format. </li>
 *   <li><b>{n,time}</b> &#8212; Formats the nth parameter as a time with the default format length (medium).</li>
 *   <li><b>{n,time,[short|medium|long|full|<i>format</i>]}</b> &#8212; Formats the nth parameter as a time according to the
 *       specified format length or an arbitrary date format. </li>
 *   <li><b>{n,datetime}</b> &#8212; Formats the nth parameter as a date/time with the default format length (medium).</li>
 *   <li><b>{n,datetime,[short|medium|long|full|<i>format</i>]}</b> &#8212; Formats the nth parameter as a date/time according to the
 *       specified format length or an arbitrary date format. </li>
 *   <li><b>{n,number}</b> &#8212; Formats the nth parameter as a number with the default number format.</li>
 *   <li><b>{n,number,[integer|percent|currency|<i>format</i>]}</b> &#8212; Formats the nth parameter as a number according
 *       to the specified number format type or an arbitrary number format. </li>
 * </ul>
 * The formatting of date, time, datetime, and number tokens depends on the locale of the message format. The formats
 * used to format such tokens inherit their locale from the message format. If no locale is passed to the message
 * format constructor, the default system locale is used.
 * <p/>
 * Within a format, single quotes (') delimit quoted sequences that are not parsed for tokens. Therefore, in order
 * to insert a curly bracket in a message format, it should be surrounded by single quotes:
 * <code>new MessageFormat("A curly bracket: '{'")</code>. To insert a single quote character, use two single
 * quotes in succession: <code>new MessageFormat("A single quote: ''")</code>.
 *
 * @since 3.2
 * @see jsx3.util.NumberFormat
 * @see jsx3.util.DateFormat
 */
jsx3.Class.defineClass('jsx3.util.MessageFormat', null, null, function(MessageFormat, MessageFormat_prototype) {
  
  var NumberFormat = jsx3.util.NumberFormat;
  var DateFormat = jsx3.util.DateFormat;
  
  /**
   * The instance initializer.
   * @param strFormat {String} the format pattern.
   * @param objLocale {jsx3.util.Locale} the locale of the format. The locale affects how numbers and dates are
   *   formatted. If this parameter is omitted, the system locale is used.
   * @throws {jsx3.Exception} if <code>strFormat</code> cannot be parsed.
   */
  MessageFormat_prototype.init = function(strFormat, objLocale) {
    /* @jsxobf-clobber */
    this._format = strFormat;
    /* @jsxobf-clobber */
    this._locale = objLocale || jsx3.System.getLocale();
    this._initFormat();
  };
  
  /**
   * Returns the locale of this message format.
   * @return {jsx3.util.Locale}
   */
  MessageFormat_prototype.getLocale = function() {
    return this._locale;
  };
  
  /**
   * Sets the locale of this message format.
   * @param objLocale {jsx3.util.Locale}
   */
  MessageFormat_prototype.setLocale = function(objLocale) {
    this._locale = objLocale;
    this._initFormat();
  };
  
  /**
   * Formats a collection of objects according to this message format.
   * @param args {Object...|Array<Object>} the argument objects. Replacement tokens of the pattern of this format
   *   will be replaced by these arguments.
   * @return {String} the string resulting from the pattern and arguments.
   */
  MessageFormat_prototype.format = function(args) {
    var tokens = new Array(this._tokens.length);
    var arrArgs = arguments[0] instanceof Array ? arguments[0] : arguments;
    
    for (var i = 0; i < tokens.length; i++) {
      var token = this._tokens[i];
      if (jsx3.$A.is(token)) {
        var index = token[0];
        var format = token[1];
        
        var arg = arrArgs[index];
        if (index >= arrArgs.length) {
          tokens[i] = "{" + index + "}";
        } else if (format != null) {
          tokens[i] = format.format(arg);
        } else if (typeof(arg) == "string") {
          tokens[i] = arg;
        } else if (typeof(arg) == "number" && NumberFormat) {
          if (! this._nmbft)
            /* @jsxobf-clobber */
            this._nmbft = NumberFormat.getNumberInstance(this._locale);

          tokens[i] = this._nmbft.format(arg);
        } else if (arg == null) {
          tokens[i] = "null";
        } else if (arg instanceof Date && DateFormat) {
          tokens[i] = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT, this._locale).format(arg);
        } else {
          tokens[i] = arg.toString();
        }
      } else {
        tokens[i] = this._tokens[i];
      }
    }
    
    return tokens.join("");
  };

  /** @private @jsxobf-clobber */
  MessageFormat_prototype._initFormat = function() {
    var squote = "'";

    var tokens = [];
    /* @jsxobf-clobber */
    this._tokens = tokens;

    var format = this._format;
    var formatLength = format.length;
    var index = 0;
    var inQuote = false;
    var tokenBits = [];

    while (index < formatLength) {
      var firstSQ = format.indexOf(squote, index);
      var firstCB = format.indexOf("{", index);

      if (firstSQ >= 0 && (firstSQ < firstCB || firstCB < 0)) {
        if (firstSQ > index)
          tokenBits[tokenBits.length] = format.substring(index, firstSQ);

        var nextSQ = format.indexOf(squote, firstSQ + 1);
        if (nextSQ == firstSQ + 1) {
          tokenBits[tokenBits.length] = squote;
          index = nextSQ + 1;
        } else if (nextSQ >= 0) {
          tokenBits[tokenBits.length] = format.substring(firstSQ + 1, nextSQ);
          index = nextSQ + 1;
        } else {
          throw new jsx3.Exception(jsx3._msg("msfmt.sq", firstSQ, this));
        }
      } else if (firstCB >= 0) {
        if (firstCB > index)
          tokenBits[tokenBits.length] = format.substring(index, firstCB);
        tokens[tokens.length] = tokenBits.join("");
        tokenBits.splice(0, tokenBits.length);

        index = firstCB + 1;
        var strFormat = [];
        
        while (true) {
          var firstChar = format.charAt(index);
          if (firstChar == "")
            throw new jsx3.Exception(jsx3._msg("msfmt.bracket", formatLength - strFormat.length - 1, this));

          if (firstChar == squote) {
            if (format.charAt(index+1) == squote) {
              strFormat[strFormat.length] = firstChar;
              index += 2;
            } else {
              inQuote = !inQuote;
              index += 1;
            }
          } else if (inQuote) {
            strFormat[strFormat.length] = firstChar;
            index++;
          } else if (firstChar == "}") {
            index++;
            break;
          } else {
            strFormat[strFormat.length] = firstChar;
            index++;
          }
        }

        tokens[tokens.length] = this._parseFormat(strFormat.join(""));
      } else {
        tokenBits[tokenBits.length] = format.substring(index);
        break;
      }
    }

    var lastToken = tokenBits.join("");
    if (lastToken.length > 0)
      tokens[tokens.length] = lastToken;
  };

  /** @private @jsxobf-clobber */
  MessageFormat._DTMAP = {date: "getDateInstance", time: "getTimeInstance", datetime: "getDateTimeInstance"};

  /** @private @jsxobf-clobber */
  MessageFormat_prototype._parseFormat = function(strFormat) {
    var bits = strFormat.split(",");
    
    var index = Number(bits[0]);
    if (isNaN(index))
      throw new jsx3.Exception(jsx3._msg("msfmt.bad_ind", strFormat, this));
    
    if (bits.length > 1) {
      var type = bits[1];
      var style = bits.slice(2).join(",");
      
      if (MessageFormat._DTMAP[type]) {
        if (! DateFormat) return [index, null];

        var funct = MessageFormat._DTMAP[type];

        var intLength = null;
        if (style == "short") intLength = DateFormat.SHORT;
        else if (style == "medium") intLength = DateFormat.MEDIUM;
        else if (style == "long") intLength = DateFormat.LONG;
        else if (style == "full") intLength = DateFormat.FULL;

        if (intLength != null || jsx3.util.strEmpty(style))
          return [index, type == "datetime" ? DateFormat[funct](intLength, intLength, this._locale) : 
                         DateFormat[funct](intLength, this._locale)];

        return [index, new DateFormat(style, this._locale)];
      } else if (type == "number") {
        if (! NumberFormat) return [index, null];
        
        if (jsx3.util.strEmpty(style))
          return [index, NumberFormat.getNumberInstance(this._locale)];
        else if (style == "integer")
          return [index, NumberFormat.getIntegerInstance(this._locale)];
        else if (style == "percent")
          return [index, NumberFormat.getPercentInstance(this._locale)];
        else if (style == "currency")
          return [index, NumberFormat.getCurrencyInstance(this._locale)];
        else 
          return [index, new NumberFormat(style, this._locale)];
      } else {
        throw new jsx3.Exception(jsx3._msg("msfmt.bad_type", strFormat, this));
      }
    } else {
      return [index, null];
    }
  };
  
  /**
   * @return {String}
   */
  MessageFormat_prototype.toString = function() {
    return this._format;
  };
  
});
