/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Formats and parses dates according to a token-based string format. This class is fully localized.
 * <p/>
 * An instance of this class is defined by its format, which is a string conforming to the following syntax:
 * <ul>
 * <li>Some letters (a-z, A-Z) are tokens that represent date fields (the tokens are described below). All other
 *   letters are reserved.</li>
 * <li>Letters that are not part of tokens must lie between single quotation marks.</li>
 * <li><code>''</code> formats/parses a single quotation mark.</li>
 * <li>All other characters are allowed and have no special meaning.</li>
 * </ul>
 *
 * The following tokens are supported:
 * <ul>
 * <li><b>G</b> &#8212; the era (BC/AD) (<a href="#jsx3.util.DateFormat:intro.Text">Text</a>).</li>
 * <li><b>y</b> &#8212; the year, either as the full year or
 *   as the last two digits of the year (<a href="#jsx3.util.DateFormat:intro.Year">Year</a>).</li>
 * <li><b>M</b> &#8212; the month, either as a digit or as
 *   the name (<a href="#jsx3.util.DateFormat:intro.Month">Month</a>).</li>
 * <li><b>d</b> &#8212; the day of the month (<a href="#jsx3.util.DateFormat:intro.Number">Number</a>).</li>
 * <li><b>E</b> &#8212; the day of the week (<a href="#jsx3.util.DateFormat:intro.Text">Text</a>).</li>
 * <li><b>H</b> &#8212; the hour of the day (0-23) (<a href="#jsx3.util.DateFormat:intro.Number">Number</a>).</li>
 * <li><b>h</b> &#8212; the hour of the day (1-12) (<a href="#jsx3.util.DateFormat:intro.Number">Number</a>).</li>
 * <li><b>m</b> &#8212; the minute of the hour (<a href="#jsx3.util.DateFormat:intro.Number">Number</a>).</li>
 * <li><b>s</b> &#8212; the second of the minute (<a href="#jsx3.util.DateFormat:intro.Number">Number</a>).</li>
 * <li><b>S</b> &#8212; the milliseconds of the second (<a href="#jsx3.util.DateFormat:intro.Number">Number</a>).</li>
 * <li><b>a</b> &#8212; AM/PM marker (<a href="#jsx3.util.DateFormat:intro.Text">Text</a>).</li>
 * <li><b>z</b> &#8212; the time zone formatted as <code>GMT-08:00</code></li>
 * <li><b>Z</b> &#8212; the time zone formatted as <code>-0800</code></li>
 * </ul>
 *
 * Each token has a type, which determines how it is formatted and parsed. The token types are:
 * <ul>
 * <li><b><a name="jsx3.util.DateFormat:intro.Number">Number</a></b> &#8212;
 *   For formatting, the number of characters in the token is the minimum number of digits to display. Smaller
 *   numbers are zero-padded on the left. For parsing, if the following token is non-numeric, any number of digits
 *   is parsed. Otherwise, exactly the number of digits is parsed as characters in the token.</li>
 * <li><b><a name="jsx3.util.DateFormat:intro.Text">Text</a></b> &#8212;
 *   For formatting, if the token is four characters or longer, the entire string is printed, otherwise a substring
 *   equal in length to the length of the token is printed. For parsing, the best match at least one character long
 *   is parsed.</li>
 * <li><b><a name="jsx3.util.DateFormat:intro.Year">Year</a></b> &#8212;
 *   If the length of the token is 2, the token is formatted and parsed as the last two digits of a year between
 *   80 years prior and 20 years subsequent to the current date. Otherwise, it is formatted and parsed as a Number.</li>
 * <li><b><a name="jsx3.util.DateFormat:intro.Month">Month</a></b> &#8212;
 *   If the length of the token is 2 or shorter, the token is formatted and parsed as a Number. Otherwise, the
 *   month is formatted and parsed as Text.</li>
 * </ul>
 *
 * @since 3.2
 */
jsx3.Class.defineClass('jsx3.util.DateFormat', null, null, function(DateFormat, DateFormat_prototype) {

  /**
   * {int} Type for a short localized date or time format.
   * @final @jsxobf-final
   */
  DateFormat.SHORT = 1;

  /**
   * {int} Type for a medium-length localized date or time format.
   * @final @jsxobf-final
   */
  DateFormat.MEDIUM = 2;

  /**
   * {int} Type for a long localized date or time format.
   * @final @jsxobf-final
   */
  DateFormat.LONG = 3;

  /**
   * {int} Type for a full-length localized date or time format.
   * @final @jsxobf-final
   */
  DateFormat.FULL = 4;

  /** @private @jsxobf-clobber */
  DateFormat.DEFAULT = DateFormat.MEDIUM;

  /** @private @jsxobf-clobber */
  DateFormat._TYPE_KEYS = [null, "short", "medium", "long", "full"];

  /**
   * Returns a date format localized for a particular locale.
   * @param intType {int} <code>SHORT</code>, <code>MEDIUM</code>, <code>LONG</code>, or <code>FULL</code>
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.DateFormat}
   */
  DateFormat.getDateInstance = function(intType, objLocale) {
    var format = jsx3.System.getLocaleProperties(objLocale).get("format.date." +
        DateFormat._TYPE_KEYS[intType || DateFormat.DEFAULT]);
    if (format == null) throw new jsx3.IllegalArgumentException("intType", intType);
    return new DateFormat(format, objLocale);
  };

  /**
   * Returns a time format localized for a particular locale.
   * @param intType {int} <code>SHORT</code>, <code>MEDIUM</code>, <code>LONG</code>, or <code>FULL</code>
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.DateFormat}
   */
  DateFormat.getTimeInstance = function(intType, objLocale) {
    var format = jsx3.System.getLocaleProperties(objLocale).get("format.time." +
        DateFormat._TYPE_KEYS[intType || DateFormat.DEFAULT]);
    if (format == null) throw new jsx3.IllegalArgumentException("intType", intType);
    return new DateFormat(format, objLocale);
  };

  /**
   * Returns a date and time format localized for a particular locale.
   * @param intDateType {int} <code>SHORT</code>, <code>MEDIUM</code>, <code>LONG</code>, or <code>FULL</code>
   * @param intTimeType {int} <code>SHORT</code>, <code>MEDIUM</code>, <code>LONG</code>, or <code>FULL</code>
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.DateFormat}
   */
  DateFormat.getDateTimeInstance = function(intDateType, intTimeType, objLocale) {
    var props = jsx3.System.getLocaleProperties(objLocale);
    var format1 = props.get("format.date." + DateFormat._TYPE_KEYS[intDateType || DateFormat.DEFAULT]);
    var format2 = props.get("format.time." + DateFormat._TYPE_KEYS[intTimeType || DateFormat.DEFAULT]);
    if (format1 == null) throw new jsx3.IllegalArgumentException("intDateType", intDateType);
    if (format2 == null) throw new jsx3.IllegalArgumentException("intTimeType", intTimeType);
    var glue = new jsx3.util.MessageFormat(props.get("format.datetime"));
    return new DateFormat(glue.format(format2, format1), objLocale);
  };

  // Formatting Data and Functions

  /** @private @jsxobf-clobber */
  DateFormat._LETTER_FORMAT = {
    G: function(d, l, f) { var bc = d.getFullYear() < 1; return DateFormat._formatText(
        f._getLProp(l < 4 ? "date.era" : "date.era.long")[bc ? 0 : 1]); },
    y: function(d, l, f) { return DateFormat._formatYear(d.getFullYear(), l); },
    M: function(d, l, f) { return DateFormat._formatMonth(f, d.getMonth(), l); },
    d: function(d, l, f) { return DateFormat._formatNumber(d.getDate(), l); },
    E: function(d, l, f) { return DateFormat._formatText(
        f._getLProp(l < 3 ? "date.day.narrow" : (l < 4 ? "date.day.abbrev" : "date.day"))[d.getDay()]); },
    H: function(d, l, f) { return DateFormat._formatNumber(d.getHours(), l); },
    h: function(d, l, f) { return DateFormat._formatNumber(d.getHours() % 12 || Number(12), l); },
    m: function(d, l, f) { return DateFormat._formatNumber(d.getMinutes(), l); },
    s: function(d, l, f) { return DateFormat._formatNumber(d.getSeconds(), l); },
    S: function(d, l, f) { return DateFormat._formatNumber(d.getMilliseconds(), l); },
    a: function(d, l, f) { return DateFormat._formatText(f._getLProp("time.ampm")[Math.floor(d.getHours()/12)]); }, // AM/PM is never abbreviated in CLDR
    z: function(d, l, f) { var hrMn = DateFormat._getTimeZoneBits(d, f); return "GMT" + hrMn[0] + ":" + hrMn[1]; },
    Z: function(d, l, f) { var hrMn = DateFormat._getTimeZoneBits(d, f); return hrMn[0] + hrMn[1]; }
  };

  /** @private @jsxobf-clobber */
  DateFormat._formatYear = function(value, length) {
    if (length == 2) {
      var asString = "" + value;
      return asString.substring(asString.length-2);
    } else {
      if (value < 1) value = 1 - value;
      return DateFormat._formatNumber(value, length);
    }
  };

  /** @private @jsxobf-clobber */
  DateFormat._formatNumber = function(value, length) {
    var v = value.toString();
    while (v.length < length)
      v = "0000000000".substring(0, length - v.length) + v;
    return v;
  };

  /** @private @jsxobf-clobber */
  DateFormat._formatText = function(value, length) {
    if (length == null || length >= 4 || value.length <= length)
      return value;
    else
      return value.substring(0, length);
  };

  /** @private @jsxobf-clobber */
  DateFormat._formatMonth = function(f, value, length) {
    if (length <= 2)
      return DateFormat._formatNumber(value+1, length);
    else
      return DateFormat._formatText(f._getLProp(length < 4 ? "date.month.abbrev" : "date.month")[value], length);
  };

  /** @private @jsxobf-clobber */
  DateFormat._getTimeZoneBits = function(date, format) {
    var offset = format.getTimeZoneOffset(date);
    var sign = offset < 0 ? "-" : "+";
    offset = Math.abs(offset);
    var hours = Math.floor(offset/60).toString();
    var minutes = Math.floor(offset % 60).toString();
    if (hours.length < 2) hours = "0" + hours;
    if (minutes.length < 2) minutes = "0" + minutes;
    return [sign+hours, minutes];
  };

  // Parsing Data and Functions

  /** @private @jsxobf-clobber */
  DateFormat._LETTER_PARSE = {
    G: function(f, input, pos, length, date, next, state) {
      var indexLength = DateFormat._parseTextEnums(input, pos,
          [f._getLProp("date.era"), f._getLProp("date.era.long")], length, false, next);
      var index = indexLength[0], matchedLength = indexLength[1];
      if (index >= 0) {
        state.bc = index == 0;
        return matchedLength;
      } else {
        return -1;
      }
    },
    y: function(f, input, pos, length, date, next, state) {
      // For parsing with the abbreviated year pattern ("y" or "yy"), DateFormat must interpret the abbreviated
      // year relative to some century. It does this by adjusting dates to be within 80 years before and 20 years
      // after the current time. During parsing, only strings consisting of exactly two digits, will be parsed into
      // the default century.
      if (length <= 2) {
        var yearTrunc = DateFormat._parseNumber(input, pos, length, null, next);
        var value = Number(yearTrunc);
        if (!isNaN(value)) {
          if (yearTrunc.length == 2) {
            var now = new Date();
            var y = now.getFullYear();
            var adjYear = 100 * Math.floor(y / 100) + value;

            if (adjYear >= (y + 20)) {
              adjYear -= 100;
            } else if (adjYear < (y - 80)) {
              adjYear += 100;
            }

            value = adjYear;
          }
          state.y = value;
          return yearTrunc.length;
        } else {
          return -1;
        }
      } else {
        var year = DateFormat._parseNumber(input, pos, length, null, next);
        return DateFormat._setParsedField(year, "y", state);
      }
    },
    M: function(f, input, pos, length, date, next, state) {
      if (length <= 2) {
        var month = DateFormat._parseNumber(input, pos, length, 2, next);
        var value = Number(month);
        if (!isNaN(value)) {
          state.M = value-1;
          return month.length;
        } else {
          return -1;
        }
      } else {
        var indexLength = DateFormat._parseTextEnums(input, pos,
            [f._getLProp("date.month.abbrev"), f._getLProp("date.month")], length, false, next);
        var index = indexLength[0], matchedLength = indexLength[1];
        if (index >= 0) {
          state.M = index;
          return matchedLength;
        } else {
          return -1;
        }
      }
    },
    d: function(f, input, pos, length, date, next, state) {
      var days = DateFormat._parseNumber(input, pos, length, 2, next);
      return DateFormat._setParsedField(days, "d", state);
    },
    E: function(f, input, pos, length, date, next, state) {
      var indexLength = DateFormat._parseTextEnums(input, pos,
          [f._getLProp("date.day.narrow"), f._getLProp("date.day"), f._getLProp("date.day.abbrev")], length, false, next);
      var index = indexLength[0], matchedLength = indexLength[1];
      if (index >= 0) {
        return matchedLength;
      } else {
        return 0;
      }
    },
    H: function(f, input, pos, length, date, next, state) {
      var hours = DateFormat._parseNumber(input, pos, length, 2, next);
      var value = Number(hours);
      if (!isNaN(value)) {
        state.hours24 = value;
        return hours.length;
      } else {
        return -1;
      }
    },
    h: function(f, input, pos, length, date, next, state) {
      var hours = DateFormat._parseNumber(input, pos, length, 2, next);
      var value = Number(hours);
      if (!isNaN(value)) {
        state.hours12 = value;
        return hours.length;
      } else {
        return -1;
      }
    },
    m: function(f, input, pos, length, date, next, state) {
      var minutes = DateFormat._parseNumber(input, pos, length, 2, next);
      return DateFormat._setParsedField(minutes, "m", state);
    },
    s: function(f, input, pos, length, date, next, state) {
      var seconds = DateFormat._parseNumber(input, pos, length, 2, next);
      return DateFormat._setParsedField(seconds, "s", state);
    },
    S: function(f, input, pos, length, date, next, state) {
      var mills = DateFormat._parseNumber(input, pos, length, 3, next);
      return DateFormat._setParsedField(mills, "S", state);
    },
    a: function(f, input, pos, length, date, next, state) {
      var indexLength = DateFormat._parseTextEnum(input, pos, f._getLProp("time.ampm"), length, false, next);
      var index = indexLength[0], matchedLength = indexLength[1];
      if (index >= 0) {
        state.pm = index == 1;
        return matchedLength;
      } else {
        return -1;
      }
    },
    z: function(f, input, pos, length, date, next, state) {
      var gmt = input.substring(pos, pos+3);
      var sign = input.charAt(pos+3);
      var hours = Number(input.substring(pos+4, pos+6));
      var minutes = Number(input.substring(pos+7, pos+9));

      if (gmt.toLowerCase() == "gmt" && (sign == "+" || sign == "-") && !isNaN(hours) && !isNaN(minutes)) {
        var offset = 60 * hours + minutes;
        if (sign == "-") offset *= -1;
        state.timezone = offset;
        return 9;
      } else {
        return -1;
      }
    },
    Z: function(f, input, pos, length, date, next, state) {
      var sign = input.charAt(pos);
      var hours = Number(input.substring(pos+1, pos+3));
      var minutes = Number(input.substring(pos+3, pos+5));

      if ((sign == "+" || sign == "-") && !isNaN(hours) && !isNaN(minutes)) {
        var offset = 60 * hours + minutes;
        if (sign == "-") offset *= -1;
        state.timezone = offset;
        return 5;
      } else {
        return -1;
      }
    }
  };

  /** @private @jsxobf-clobber */
  DateFormat._parseText = function(input, pos, match) {
    if (input.indexOf(match, pos) == pos)
      return match.length;
    else
      return -1;
  };

  /** @private @jsxobf-clobber */
  DateFormat._parseNumber = function(input, pos, minDigit, maxDigit, nextToken) {
    // determine whether this number is following by a non-numeric token
    // ... if there is no following token
    var textNext = nextToken == null ||
    // ... if the next token is a string that does not start with a digit
        (typeof(nextToken) == "string" && !DateFormat._charIsDigit(nextToken, 0));
    if (jsx3.$A.is(nextToken)) {
      // ... if the next token is MMM
      textNext = textNext || (nextToken[0] == "M" && nextToken[1] > 2) ||
      // ... if the next token is E
          nextToken[0] == "E" ||
      // ... if the next token is a
          nextToken[0] == "a";
    }

    if (textNext) {
      // if the next token is non-numeric, just match all digits
      var matchEnd = pos;
      while (DateFormat._charIsDigit(input, matchEnd))
        matchEnd++;
      return input.substring(pos, matchEnd);
    } else {
      // if the next token is numeric, only match the minimum number of digits
      for (var i = 0; i < minDigit; i++) {
        if (! DateFormat._charIsDigit(input, pos+i))
          return "x";
      }
      return input.substring(pos, pos+minDigit);
    }
  };

  /** @private @jsxobf-clobber */
  DateFormat._parseTextEnums = function(input, pos, arrEnums, length, caseSensitive, nextToken) {
    var a = [];
    for (var i = 0; i < arrEnums.length; i++) a.push.apply(a, arrEnums[i]);
    var ret = DateFormat._parseTextEnum(input, pos, a, length, caseSensitive, nextToken);
    ret[0] = ret[0] % arrEnums[0].length;
    return ret;
  };

  /** @private @jsxobf-clobber */
  DateFormat._parseTextEnum = function(input, pos, enums, length, caseSensitive, nextToken) {
    var bestIndex = -1;
    var bestLength = 0;

    if (! caseSensitive)
      input = input.toLowerCase();

    for (var i = 0; i < enums.length; i++) {
      var thisLength = 0;
      var item = caseSensitive ? enums[i] : enums[i].toLowerCase();
      while (input.length > thisLength && item.length > thisLength &&
          input.charAt(pos+thisLength) == item.charAt(thisLength))
        thisLength++;

      if (thisLength > bestLength) {
        bestLength = thisLength;
        bestIndex = i;
      }
    }

    return [bestIndex, bestLength];
  };

  /** @private @jsxobf-clobber */
  DateFormat._setParsedField = function(token, field, state) {
    var value = Number(token);
    if (!isNaN(value)) {
      state[field] = value;
      return token.length;
    } else {
      return -1;
    }
  };

  /** @private @jsxobf-clobber */
  DateFormat._charIsDigit = function(s, i) {
    var code = s.charCodeAt(i);
    return code >= 48 && code <= 57;
  };

  // Public Interface

  /**
   * The instance initializer. Instances of this class are immutable.
   *
   * @param strFormat {String} the date format.
   * @param objLocale {jsx3.util.Locale} the locale with which to format and parse dates. If this parameter is not
   *   provided the default system locale is used.
   * @throws {jsx3.Exception} if <code>strFormat</code> cannot be parsed.
   * @see jsx3.util.DateFormat  Date Format Syntax
   */
  DateFormat_prototype.init = function(strFormat, objLocale) {
    /* @jsxobf-clobber */
    this._format = strFormat;
    /* @jsxobf-clobber */
    this._offset = null;
    /* @jsxobf-clobber */
    this._locale = objLocale || jsx3.System.getLocale();
    this._initTokens();
  };

  /**
   * @return {jsx3.util.Locale}
   */
  DateFormat_prototype.getLocale = function() {
    return this._locale;
  };

  /**
   * @param objLocale {jsx3.util.Locale}
   */
  DateFormat_prototype.setLocale = function(objLocale) {
    this._locale = objLocale;
  };

  /**
   * Returns the timezone offset of this date format. This is the difference between GMT and the local time of this
   * date format, in minutes. For example, Pacific Standard Time is -480 (-08h * 60). If the timezone offset has been
   * set explicitly with <code>setTimeZoneOffset()</code>, that value is returned.
   * <p/>
   * Since the timezone offset may change over the year for Daylight Savings Time, this method takes a
   * <code>Date</code> argument, <code>objDate</code>. All dates are created with the timezone offset of the host
   * browser's timezone, adjusted for Daylight Savings Time. Therefore, if the timezone offset of this date format
   * has not been set explicitly, the timezone offset is determined from the <code>objDate</code> parameter, or, if
   * that is not provided, from the current time.
   *
   * @param objDate {Date} the date for which to return the timezone offset.
   * @return {int} the timezone offset in minutes.
   */
  DateFormat_prototype.getTimeZoneOffset = function(objDate) {
    return this._offset != null ? this._offset : -1 * (objDate || new Date()).getTimezoneOffset();
  };

  /**
   * Sets the timezone offset of this date format. The default value is the value for the local time.
   * @param intMinutes {int} the timezone offset in minutes.
   * @see #getTimeZoneOffset()
   */
  DateFormat_prototype.setTimeZoneOffset = function(intMinutes) {
    this._offset = intMinutes;
  };

  /** @private @jsxobf-clobber */
  DateFormat_prototype._getLProp = function(strProp) {
    return jsx3.System.getLocaleProperties(this._locale).get(strProp);
  };

  /** @private @jsxobf-clobber */
  DateFormat_prototype._initTokens = function() {
    var squote = "'";

    var tokens = [];
    /* @jsxobf-clobber */
    this._tokens = tokens;

    var format = this._format;
    var formatLength = format.length;
    var index = 0;
    var tokenBits = [];
    var res = /[a-zA-Z']/g;

    while (index < formatLength) {
      var firstChar = format.charAt(index);
      // escape any sequences surrounded by single quotes
      if (firstChar == squote) {
        var nextSQ = format.indexOf(squote, index+1);
        if (nextSQ == index + 1) {
          tokenBits[tokenBits.length] = squote;
          index += 2;
        } else if (nextSQ >= 0) {
          tokenBits[tokenBits.length] = format.substring(index+1, nextSQ);
          index = nextSQ + 1;
        } else {
          throw new jsx3.Exception(jsx3._msg("dtfmt.sq", index, this));
        }
      } else if (DateFormat._LETTER_FORMAT[firstChar]) {
        var length = 1;
        while (format.charAt(index+length) == firstChar)
          length++;

        var strToken = tokenBits.join("");
        if (strToken.length > 0) {
          tokens[tokens.length] = strToken;
          tokenBits.splice(0, tokenBits.length);
        }

        tokens[tokens.length] = [firstChar, length];
        index += length;
      } else if (firstChar.match(res)) {
        throw new jsx3.Exception(jsx3._msg("dtfmt.token", index, format));
      } else {
        res.lastIndex = index + 1;
        if (res.exec(format)) {
          tokenBits[tokenBits.length] = format.substring(index, res.lastIndex - 1);
          index = res.lastIndex - 1;
        } else {
          tokenBits[tokenBits.length] = format.substring(index);
          break;
        }
      }
    }

    var strToken = tokenBits.join("");
    if (strToken.length > 0) {
      tokens[tokens.length] = strToken;
      tokenBits.splice(0, tokenBits.length);
    }
  };

  /**
   * Formats a date according to this date format.
   *
   * @param objDate {Number|Object|Date} the date to format.
   * @return {String} the formatted date.
   */
  DateFormat_prototype.format = function(objDate) {
    if (!(objDate instanceof Date)) {
      if (!isNaN(objDate)) {
        objDate = new Date(Number(objDate));
      } else {
        objDate = new Date(objDate);
      }

      if (isNaN(objDate)) throw new jsx3.IllegalArgumentException("objDate", objDate);
    }

    var formatted = new Array(this._tokens.length);
    var adjustedDate = new Date();
    adjustedDate.setTime(objDate.getTime() + (this.getTimeZoneOffset(objDate)+objDate.getTimezoneOffset()) * 1000 * 60);

    for (var i = 0; i < this._tokens.length; i++) {
      var token = this._tokens[i];
      if (jsx3.$A.is(token)) {
        var letter = token[0];
        var length = token[1];
        formatted[i] = DateFormat._LETTER_FORMAT[letter](adjustedDate, length, this);
      } else {
        formatted[i] = token;
      }
    }

    return formatted.join("");
  };

  /**
   * Parses a string according to this date format and returns the resulting date. If <code>strDate</code> does
   * not conform to this date format, an exception is thrown.
   * <p/>
   * The default date for the purposes of this method is 1-Jan-1970 12:00AM, local time. If any date fields
   * are omitted from this format, the date returned by this method will inherit those fields from the default date.
   *
   * @param strDate {String} the string to parse.
   * @return {Date} the parsed date.
   * @throws {jsx3.Exception} if <code>strDate</code> cannot be parsed according to this format.
   */
  DateFormat_prototype.parse = function(strDate) {
    var date = new Date();
    date.setTime(0);
    var position = 0;

    var parseState = {};
    for (var i = 0; i < this._tokens.length; i++) {
      var token = this._tokens[i];
      var incr = -1;
      if (jsx3.$A.is(token)) {
        incr = DateFormat._LETTER_PARSE[token[0]](this, strDate, position, token[1], date, this._tokens[i+1], parseState);
      } else {
        incr = DateFormat._parseText(strDate, position, token);
      }

      if (incr < 0)
        throw new jsx3.Exception(jsx3._msg("dtfmt.parse", strDate, this));

      position += incr;
    }

    if (parseState.y != null)
      date.setUTCFullYear(parseState.y);

    if (parseState.bc)
      date.setUTCFullYear(1 - date.getUTCFullYear());

    if (parseState.M != null)
      date.setUTCMonth(parseState.M);

    if (parseState.d != null)
      date.setUTCDate(parseState.d);

    if (parseState.hours24) {
      date.setUTCHours(parseState.hours24);
    } else if (parseState.hours12) {
      var hours = parseState.hours12;
      if (parseState.pm) hours += 12;
      date.setUTCHours(hours);
    }

    if (parseState.m != null)
      date.setUTCMinutes(parseState.m);

    if (parseState.s != null)
      date.setUTCSeconds(parseState.s);

    if (parseState.S != null)
      date.setUTCMilliseconds(parseState.S);

    if (parseState.timezone != null) {
      date.setTime(date.getTime() - parseState.timezone * 1000 * 60);
    } else {
      date.setTime(date.getTime() - this.getTimeZoneOffset(date) * 1000 * 60);
    }

    if (isNaN(date.getTime()))
      throw new jsx3.Exception(jsx3._msg("dtfmt.inv", strDate, this));      

    return date;
  };

  /**
   * Returns the format passed to the constructor.
   * @return {String}
   */
  DateFormat_prototype.getFormat = function() {
    return this._format;
  };

  /**
   * Returns a string representation of this date format.
   * @return {String}
   */
  DateFormat_prototype.toString = function() {
    return this._format;
  };

});
