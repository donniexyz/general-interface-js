/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

/**
 * Formats numbers. This class in localized, meaning that numbers are formatted in a locale-sensitive way.
 * <p/>
 * The format takes the form: <code>Prefix Format Suffix</code>. A single number format can specify a format for
 * a positive value and one for a negative value. In this case the form is: <code>PosPrefix PosFormat
 * PosSuffix;NegPrefix NegFormat NegSuffix</code>. (The spaces between prefix, format, and suffix should not be
 * included in the actual format.)
 * <p/>
 * The format can include the following characters. Each character is replaced with the locale-specific text when
 * a number is formatted.
 * <ul>
 * <li><code>0</code> - Digit</li>
 * <li><code>#</code> - Digit, zero shows as absent</li>
 * <li><code>.</code> - Decimal separator or monetary decimal separator</li>
 * <li><code>-</code> - Minus sign</li>
 * <li><code>,</code> - Grouping separator</li>
 * <li><code>;</code> - Separates positive and negative subpatterns</li>
 * <li><code>%</code> - Multiply by 100 and show as percentage</li>
 * <li><code>&#x2030;</code> - Multiply by 1000 and show as per-mille</li>
 * <li><code>&#x00A4;</code> - Currency sign, replaced by currency symbol</li>
 * <li><code>'</code> - Used to quote special characters in a prefix or suffix. To create a single quote
 *     itself, use two in a row</li>
 * </ul>
 *
 * @since 3.2
 */
jsx3.Class.defineClass('jsx3.util.NumberFormat', null, null, function(NumberFormat, NumberFormat_prototype) {

  /**
   * {int} Type for a decimal number format.
   * @final @jsxobf-final
   * @since 3.7
   */
  NumberFormat.NUMBER = 1;

  /**
   * {int} Type for an integer number format.
   * @final @jsxobf-final
   * @since 3.7
   */
  NumberFormat.INTEGER = 2;

  /**
   * {int} Type for a currency number format.
   * @final @jsxobf-final
   * @since 3.7
   */
  NumberFormat.CURRENCY = 3;

  /**
   * Returns a number format appropriate for <code>objLocale</code>.
   * @param intType {int} <code>NUMBER</code>, <code>INTEGER</code>, or <code>CURRENCY</code>.
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.NumberFormat}
   * @since 3.7
   */
  NumberFormat.getInstance = function(intType, objLocale) {
    switch (intType) {
      case NumberFormat.INTEGER: return NumberFormat.getIntegerInstance(objLocale);
      case NumberFormat.CURRENCY: return NumberFormat.getCurrencyInstance(objLocale);
      default: return NumberFormat.getNumberInstance(objLocale);
    }
  };

  /**
   * Returns an integer number format appropriate for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.NumberFormat}
   */
  NumberFormat.getIntegerInstance = function(objLocale) {
    return NumberFormat._getInstance(objLocale, ".integer");
  };
  
  /**
   * Returns a general number format appropriate for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.NumberFormat}
   */
  NumberFormat.getNumberInstance = function(objLocale) {
    return NumberFormat._getInstance(objLocale, "");
  };
  
  /**
   * Returns a currency number format appropriate for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.NumberFormat}
   */
  NumberFormat.getCurrencyInstance = function(objLocale) {
    return NumberFormat._getInstance(objLocale, ".currency");
  };
  
  /**
   * Returns a percent number format appropriate for <code>objLocale</code>.
   * @param objLocale {jsx3.util.Locale} the locale for which to return a format. If this parameter is not provided,
   *   the default system locale is used.
   * @return {jsx3.util.NumberFormat}
   */
  NumberFormat.getPercentInstance = function(objLocale) {
    return NumberFormat._getInstance(objLocale, ".percent");
  };

  /** @private @jsxobf-clobber */
  NumberFormat._getInstance = function(objLocale, type) {
    var props = NumberFormat._getProps(objLocale);
    var cacheKey = "format.number" + type + "._instance";
    
    var instance = props.get(cacheKey);
    if (!props.containsKey(cacheKey) || instance == null) {
      var format = props.get("format.number" + type);
      instance = new NumberFormat(format, objLocale);
      props.set(cacheKey, instance);
    }
    return instance;
  };
  
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.grouping = 0;
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.posprefix = "";
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.possuffix = "";
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.negprefix = null;
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.negsuffix = null;
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.showdec = false;
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.maxintdigit = Number.MAX_VALUE;
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.minintdigit = 0;  
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.maxdecdigit = 0;  
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.mindecdigit = 0;
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.multiplier = 1;  
  /** @private @jsxobf-clobber */
  NumberFormat_prototype.currency = false;  
  
  /**
   * Creates a new number format instance.
   * @param strFormat {String} the number format.
   * @param objLocale {jsx3.util.Locale} the locale for the format. By default the system locale is used.
   * @throws {jsx3.Exception} if <code>strFormat</code> cannot be parsed.
   */
  NumberFormat_prototype.init = function(strFormat, objLocale) {
    /* @jsxobf-clobber */
    this._format = strFormat;
    /* @jsxobf-clobber */
    this._locale = objLocale || jsx3.System.getLocale();
    this._initFormat();
  };
  
  /**
   * @return {jsx3.util.Locale}
   */
  NumberFormat_prototype.getLocale = function() {
    return this._locale;
  };
  
  /**
   * @param objLocale {jsx3.util.Locale}
   */
  NumberFormat_prototype.setLocale = function(objLocale) {
    this._locale = objLocale;
    this._initFormat();
  };
  
  /**
   * @param number {String|Object|Number}
   * @return {String}
   */
  NumberFormat_prototype.format = function(number) {
    var props = this._getProps();
    
    if (isNaN(number)) {
      return props.get('number.NaN');
    } else {
      if (typeof(number) != "number")
        number = Number(number);

      var pos = number >= 0;
      var prefix = pos ? this.posprefix : 
          (this.negprefix != null ? this.negprefix : props.get('number.minus') + this.posprefix);
      var suffix = pos ? this.possuffix :
          (this.negsuffix != null ? this.negsuffix : this.possuffix);
      
      var numberPart = null;
      if (! isFinite(number)) {
        numberPart = props.get('number.infinity');
      } else {
        number = this.multiplier * Math.abs(number);
        
        var digitsDecimal = NumberFormat._numToDigitArray(number);
        var digits = digitsDecimal[0];
        var decimalIndex = digitsDecimal[1];
        
        // handle rounding
        if (this.maxdecdigit < digits.length - decimalIndex) {
          var remainder = digits.splice(decimalIndex + this.maxdecdigit, digits.length - decimalIndex - this.maxdecdigit);
          if (NumberFormat._roundDigits(digits, remainder))
            decimalIndex++;
        }
        
        var intDigits = decimalIndex >= 0 ? digits.slice(0, decimalIndex) : digits;
        var decDigits = decimalIndex >= 0 ? digits.slice(decimalIndex) : [];
        
        // trim digits
        NumberFormat._constrainDigitArray(intDigits, this.maxintdigit, this.minintdigit, true);
        NumberFormat._constrainDigitArray(decDigits, this.maxdecdigit, this.mindecdigit, false);
        
        var zero = props.get("number.zero");
        NumberFormat._localizeDigits(intDigits, zero);
        NumberFormat._localizeDigits(decDigits, zero);
        
        if (this.grouping > 0) {
          var groupingSymbol = this._getGrouping(this.currency);

          for (var i = intDigits.length - this.grouping; i >= 1; i-=this.grouping)
            intDigits.splice(i, 0, groupingSymbol);
        }
        
        numberPart = intDigits.join("");
        if (this.showdec || decDigits.length > 0)
          numberPart += this._getDecimal(this.currency) + decDigits.join("");
      }
      
      return prefix + numberPart + suffix;
    }
  };

  /** @private @jsxobf-clobber */
  NumberFormat._FMT = /\-?(\d+(\.\d*)?|\d*\.\d+)([eE]\-?\d+)?/;

  /**
   * Parses a string according to this number format and returns the resulting value.
   * <b/>
   * <b>Note:</b> this method ignores any non-significant characters. This method does not handle
   * localized digit characters other than ASCII 0-9.
   *
   * @param s {String}
   * @return {Number}
   * @since 3.7
   */
  NumberFormat_prototype.parse = function(s) {
    var props = this._getProps();

    if (s == props.get('number.NaN'))
      return NaN;

    var neg = false;
    var multi = 1;
    var currency = false;

    var negSign = props.get("number.minus");

    // check for negative prefix and suffix
    var negPre = this.negprefix, negSuf = this.negsuffix;
    if (negPre || negSuf) {
      negPre = this._preSufStr(negPre, props);
      negSuf = this._preSufStr(negSuf, props);
      if (s.indexOf(negPre) == 0 &&
          s.lastIndexOf(negSuf) == s.length - negSuf.length) {
        neg = true;

        // remove any negative signs that were part of the negative prefix/suffix
        s = negPre.replace(negSign, "") +
            s.substring(negPre.length, s.length - negSuf.length) +
            negSuf.replace(negSign, "");
      }
    }

    // check for negative sign
    var negIndex = s.indexOf(negSign);
    if (negIndex == 0) {
      neg = true;
      s = s.substring(0, negIndex) + s.substring(negIndex + negSign.length);
    }

    // check for percent and permille signs
    var pctSign = props.get("number.percent");
    var pctIndex = s.indexOf(pctSign);
    if (pctIndex >= 0) {
      multi = 100;
      s = s.substring(0, pctIndex) + s.substring(pctIndex + pctSign.length);
    } else {
      var milleSign = props.get("number.permille");
      pctIndex = s.indexOf(milleSign);
      if (pctIndex >= 0) {
        multi = 1000;
        s = s.substring(0, pctIndex) + s.substring(pctIndex + milleSign.length);
      }
    }

    // remove currency sign
    var curSign = props.get("number.currency");
    var curIndex = s.indexOf(curSign);
    if (curIndex >= 0) {
      currency = true;
      s = s.substring(0, curIndex) + s.substring(curIndex + curSign.length);
    }

    // check for infinity
    if (s == props.get('number.infinity'))
      return neg ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

    var regex = /[\s\u00a0]/g; // Safari 3 incorrectly fails to match nbsp to \s
    s = s.replace(regex, " ");
    // remove grouping separators
    var groupingSymbol = this._getGrouping(currency).replace(regex, " ");
    if (groupingSymbol) {
      var groupIndex = -1;
      while ((groupIndex = s.indexOf(groupingSymbol)) >= 0) {
        s = s.substring(0, groupIndex) + s.substring(groupIndex + groupingSymbol.length);
      }
    }

/*
    // replace digits
    var zero = props.get("number.zero");
    if (zero != "0") {
      // TODO: not implemented
    }
*/

    // replace decimal
    var decimalSymbol = this._getDecimal(currency).replace(regex, " ");
    if (decimalSymbol != ".") {
      var decIndex = s.indexOf(decimalSymbol);
      if (decIndex >= 0) {
        s = s = s.substring(0, decIndex) + "." + s.substring(decIndex + groupingSymbol.length);
      }
    }

    if (!NumberFormat._FMT.exec(s))
      return NaN;

    return (neg ? -1 : 1) * Number(RegExp.lastMatch) / multi;
  };

  /** @private @jsxobf-clobber */
  NumberFormat_prototype._getGrouping = function(bCur) {
    var props = this._getProps();
    return (bCur && props.get('number.currency.grouping')) || props.get('number.grouping') || "";
  };

  /** @private @jsxobf-clobber */
  NumberFormat_prototype._getDecimal = function(bCur) {
    var props = this._getProps();
    return bCur ?
       (props.get('number.currency.decimal') || props.get('number.decimal')) :
        props.get('number.decimal');
  };

  /** @private @jsxobf-clobber */
  NumberFormat._zeroCode = "0".charCodeAt(0);
  /** @private @jsxobf-clobber */
  NumberFormat._digitCode = ".".charCodeAt(0);

  /** @private @jsxobf-clobber */
  NumberFormat._numToDigitArray = function(number) {
    if (number < 0) throw new jsx3.Exception();
    var log = Math.log(number) * jsx3.LOG10E;
    
    if (! isFinite(log)) {
      if (number == 0) return [[0], 1];
      throw new jsx3.Exception();
    }

    var asString = number.toString();
    var digits = [];
    var decimal = null;
    
    for (var i = 0; i < asString.length; i++) {
      var code = asString.charCodeAt(i);
      var dec = code - NumberFormat._zeroCode;
      if (dec >= 0 && dec <= 9) {
        digits[digits.length] = dec;
      } else if (code == NumberFormat._digitCode) {
        ;
      } else {
        break;
      }
    }
    
    if (log >= 0) {
      var intDigits = Math.floor(log+1);
      if (digits.length > intDigits) {
        decimal = intDigits;
      } else {
        if (digits.length < intDigits) {
          for (var i = digits.length; i < intDigits; i++)
            digits[digits.length] = 0;
        }
        decimal = digits.length;
      }
    } else {
      var zerosFirst = Math.ceil(-1-log);
      var firstZero = digits.indexOf(0);
      digits.splice(0, firstZero+1);
      
      for (var i = 0; i < zerosFirst; i++)
        if (digits[i] != 0)
          digits.splice(i, 0, 0);
      
      decimal = 0;
    }
    
    return [digits, decimal];
  };
  
  /** @private @jsxobf-clobber */
  NumberFormat._constrainDigitArray = function(digits, max, min, front) {
    if (digits.length > max) {
      if (front) {
        digits.splice(0, digits.length - max);
      } else {
        digits.splice(max, digits.length - max);
      }
    } else if (digits.length < min) {
      var appender = front ? "unshift" : "push";
      for (var i = digits.length; i < min; i++)
        digits[appender]("0");
    }
  };
  
  /** @private @jsxobf-clobber */
  NumberFormat._roundDigits = function(digits, remainder) {
    if (remainder[0] >= 5) {
      for (var i = digits.length - 1; i >= 0; i--) {
        var sum = digits[i] + 1;
        if (sum >= 10) {
          digits[i] = 0;
          
          if (i == 0) {
            digits.unshift(1);
            return true;
          }
        } else {
          digits[i] = sum;
          break;
        }
      }
    }
    return false;
  };

  /** @private @jsxobf-clobber */
  NumberFormat._localizeDigits = function(digits, zero) {
    var locZeroCode = zero.charCodeAt(0);
    for (var i = 0; i < digits.length; i++)
      digits[i] = String.fromCharCode(digits[i] + locZeroCode);
  };
  
  /** @private @jsxobf-clobber */
  NumberFormat.NUMBER_PART_CHARS = "0#,.";
          
  /** @private @jsxobf-clobber */
  NumberFormat_prototype._initFormat = function() {
    var squote = "'";
    
    var props = this._getProps();
    var format = this._format;
    var index = 0;
    var formatLength = format.length;
    
    var stage = 1; // prefix stage
    var numberPartIndex1 = null, numberPartIndex2 = null;
    
    while (index < formatLength) {
      var chr = format.charAt(index);
      
      if (stage == 1) { // positive prefix
        if (chr == squote) {
          var nextSQ = format.indexOf(squote, index+1);
          if (nextSQ == index + 1) {
            this.posprefix += squote;
            index += 2;
          } else if (nextSQ >= 0) {
            this.posprefix += format.substring(index+1, nextSQ);
            index = nextSQ + 1;
          } else {
            throw new jsx3.Exception(jsx3._msg("nmfmt.sq", index, this));
          }
        } else {
          if (NumberFormat.NUMBER_PART_CHARS.indexOf(chr) >= 0) {
            numberPartIndex1 = index;
            stage++;
          } else {
            this.posprefix += this._preSufChar(chr, props);
            index++;
          }
        }
      } else if (stage == 2) { // positive number
        if (NumberFormat.NUMBER_PART_CHARS.indexOf(chr) >= 0) {
          index++;
        } else {
          numberPartIndex2 = index;
          stage++;
        }
      } else if (stage == 3) { // positive suffix
        if (chr == squote) {
          var nextSQ = format.indexOf(squote, index+1);
          if (nextSQ == index + 1) {
            this.possuffix += squote;
            index += 2;
          } else if (nextSQ >= 0) {
            this.possuffix += format.substring(index+1, nextSQ);
            index = nextSQ + 1;
          } else {
            throw new jsx3.Exception(jsx3._msg("nmfmt.sq", index, this));
          }
        } else if (chr == ";") {
          this.negprefix = "";
          this.negsuffix = "";
          stage++;
        } else {
          this.possuffix += this._preSufChar(chr, props);
        }
        index++;
      } else if (stage == 4) { // negative prefix
        if (chr == squote) {
          var nextSQ = format.indexOf(squote, index+1);
          if (nextSQ == index + 1) {
            this.negprefix += squote;
            index += 2;
          } else if (nextSQ >= 0) {
            this.negprefix += format.substring(index+1, nextSQ);
            index = nextSQ + 1;
          } else {
            throw new jsx3.Exception(jsx3._msg("nmfmt.sq", index, this));
          }
        } else {
          if (NumberFormat.NUMBER_PART_CHARS.indexOf(chr) >= 0) {
            stage++;
          } else {
            this.negprefix += this._preSufChar(chr, props);
            index++;
          }
        }
      } else if (stage == 5) { // negative number
        if (NumberFormat.NUMBER_PART_CHARS.indexOf(chr) >= 0) {
          index++;
        } else {
          stage++;
        }
      } else if (stage == 6) { // negative suffix
        if (chr == squote) {
          var nextSQ = format.indexOf(squote, index+1);
          if (nextSQ == index + 1) {
            this.negsuffix += squote;
            index += 2;
          } else if (nextSQ >= 0) {
            this.negsuffix += format.substring(index+1, nextSQ);
            index = nextSQ + 1;
          } else {
            throw new jsx3.Exception(jsx3._msg("nmfmt.sq", index, this));
          }
        } else {
          this.negsuffix += this._preSufChar(chr, props);
        }
        index++;
      }
    }
    
    if (numberPartIndex2 == null)
      numberPartIndex2 = formatLength;
    
    if (numberPartIndex1 == null)
      throw new jsx3.Exception(jsx3._msg("nmfmt.numpt", format));
    
    this._parseNumberPart(format.substring(numberPartIndex1, numberPartIndex2));
  };

  /** @private @jsxobf-clobber */
  NumberFormat_prototype._parseNumberPart = function(numberPart) {
    var decimalIndex = numberPart.indexOf(".");
    if (decimalIndex < 0) decimalIndex = numberPart.length;
    else if (decimalIndex == numberPart.length - 1) this.showdec = true;
            
    var groupingIndex = numberPart.lastIndexOf(",");
    
    if (groupingIndex >= 0) {
      var diff = decimalIndex - groupingIndex - 1;
      if (diff < 1) throw new jsx3.Exception(jsx3._msg("nmfmt.gpdec", numberPart));
      this.grouping = diff;
    }
    
    for (var i = 0; i < decimalIndex; i++) {
      if (numberPart.charAt(i) == "0")
        this.minintdigit++;
    }
    
    for (var i = decimalIndex+1; i < numberPart.length; i++) {
      if (numberPart.charAt(i) == "0") {
        this.mindecdigit++;
        this.maxdecdigit++;
      } else if (numberPart.charAt(i) == "#") {
        this.maxdecdigit++;
      }
    }
  };

  /** @private @jsxobf-clobber */
  NumberFormat._getProps = function(l) {
    return jsx3.System.getLocaleProperties(l);
  };

  NumberFormat_prototype._getProps = function() {
    return NumberFormat._getProps(this._locale);
  };

  /** @private @jsxobf-clobber */
  NumberFormat_prototype._preSufStr = function(s, props) {
    var a = s.split("");
    for (var i = 0; i < a.length; i++)
      a[i] = this._preSufChar(a[i], props);
    return a.join("");
  };
  
  /** @private @jsxobf-clobber */
  NumberFormat_prototype._preSufChar = function(chr, props) {
    if (chr == "\u00A4") {
      this.currency = true;
      return props.get("number.currency");
    } else if (chr == "%") {
      this.multiplier = 100;
      return props.get("number.percent");
    } else if (chr == "\u2030") {
      this.multiplier = 1000;
      return props.get("number.permille");
    } else if (chr == "-") {
      return props.get("number.minus");
    } else {
      return chr;
    }
  };
  
  /**
   * @return {String}
   */
  NumberFormat_prototype.toString = function() {
    return this._format;
  };
  
});
