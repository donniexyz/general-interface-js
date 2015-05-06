<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt">
  
  <xsl:output method="xml" omit-xml-declaration="yes"/>
  <xsl:param name="membertype">class</xsl:param>
  <xsl:param name="memberid"></xsl:param>

  <xsl:template match="/">
    <div id="jsxide_typeahead_spy_output_div">
    <xsl:choose>
      <xsl:when test="$membertype='class'">
        <xsl:apply-templates select="//record[@type='class']" mode="class"/>
      </xsl:when>
      <xsl:when test="$membertype='constructor'">
        <xsl:apply-templates select="//record[@type='class']/record[@type='constructor']" mode="constructor"/>
      </xsl:when>
      <xsl:when test="$membertype='method'">
        <xsl:apply-templates select="//record[@type='class']/record[@type='method' and @jsxid=$memberid]" mode="method"/>
      </xsl:when>
      <xsl:when test="$membertype='field'">
        <xsl:apply-templates select="//record[@type='class']/record[@type='field' and @jsxid=$memberid]" mode="field"/>
      </xsl:when>
    </xsl:choose>
      <xsl:text>&#160;</xsl:text>
    </div>
  </xsl:template>

  <!-- main template for Class content -->
  <xsl:template match="record" mode="class">
    <h1 class="jsxdoc">
      <span class="type">
        <xsl:value-of select="@classtype"/>
      </span>
      <xsl:value-of select="@jsxtext"/>
    </h1>

    <div class="jsxdoc_classdesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:choose>
        <xsl:when test="@jsxtip and not(@jsxtip='')">
          <xsl:apply-templates select="@jsxtip" mode="disable-output-escp"/>
        </xsl:when>
        <xsl:otherwise>
          <span class="none">No description provided.</span>
        </xsl:otherwise>
      </xsl:choose>
    </div>

    <xsl:variable name="superindent" select="''"/>
    <h3 class="jsxdoc">Inheritance:</h3>
    <xsl:choose>
      <xsl:when test="record[@type='superclass']">
        <xsl:apply-templates select="record[@type='superclass'][1]" mode="superclass"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="." mode="superclass"/>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:if test="record[@type='interface']">
      <h3 class="jsxdoc">All Implemented Interfaces:</h3>
      <xsl:for-each select="record[@type='interface']">
        <xsl:apply-templates select="." mode="interface"/>
        <xsl:if test="position() != last()">
          <xsl:text>, </xsl:text>
        </xsl:if>
      </xsl:for-each>
    </xsl:if>
    <xsl:if test="record[@type='subclass']">
      <h3 class="jsxdoc">Direct Known Subclasses:</h3>
      <xsl:for-each select="record[@type='subclass']">
        <xsl:apply-templates select="." mode="subclass"/>
        <xsl:if test="position() != last()">
          <xsl:text>, </xsl:text>
        </xsl:if>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>

  <!-- main template for Constructor content -->
  <xsl:template match="record" mode="constructor">
    <xsl:apply-templates select="." mode="method"/>
  </xsl:template>

  <!-- main template for Method content -->
  <xsl:template match="record" mode="method">
    <h1 class="jsxdoc">
      <span class="class"><xsl:apply-templates select="../." mode="classlink">
        <xsl:with-param name="linkalways" select="1"/>
        </xsl:apply-templates>.</span>
      <xsl:value-of select="@jsxtext"/>
    </h1>

    <div class="jsxdoc_methoddecl">
      <xsl:if test="@static">
        <xsl:text>static </xsl:text>
      </xsl:if>
      <xsl:text>method </xsl:text>
      <xsl:value-of select="@jsxtext"/>(<xsl:for-each select="record[@type='parameter']">
        <span>
          <xsl:choose>
            <xsl:when test="@required='1'">
              <xsl:attribute name="class">required</xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="style">optional</xsl:attribute>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:value-of select="@jsxtext"/>
          <xsl:choose>
            <xsl:when test="not(position()=last())">, </xsl:when>
          </xsl:choose>
        </span>
      </xsl:for-each>)
    </div>

    <div class="jsxdoc_methoddesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:apply-templates select="@jsxtip" mode="disable-output-escp"/>
    </div>

    <xsl:if test="record[@type='parameter']">
      <h3 class="jsxdoc">Parameters:</h3>

      <xsl:for-each select="record[@type='parameter']">
        <div class="jsxdoc_param">
          <span class="jsxdoc_paramname">
            <xsl:value-of select="@jsxtext"/>
          </span>
          <xsl:if test="@datatype">
            <span class="jsxdoc_paramtype"> &lt;<xsl:value-of select="@datatype"/>&gt;</span>
          </xsl:if>
          <xsl:text> &#8211; </xsl:text>
          <span class="jsxdoc_paramdesc">
            <xsl:value-of select="@jsxtip"/>
          </span>
        </div>
      </xsl:for-each>
    </xsl:if>

    <xsl:if test="record[@type='throws']">
      <h3 class="jsxdoc">Throws:</h3>
      <xsl:for-each select="record[@type='throws']">
        <div class="jsxdoc_throws">
          <xsl:if test="@datatype">
            <span class="jsxdoc_throwtype">&lt;<xsl:value-of select="@datatype"/>&gt;</span>
            <xsl:text> &#8211; </xsl:text>
          </xsl:if>
          <span class="jsxdoc_throwsdesc">
            <xsl:value-of select="@jsxtip"/>
          </span>
        </div>
      </xsl:for-each>
    </xsl:if>

    <xsl:if test="record[@type='return']">
      <h3 class="jsxdoc">Returns:</h3>
      <div class="jsxdoc_return">
        <xsl:if test="record[@type='return']/@datatype">
          <span class="jsxdoc_returntype">&lt;<xsl:value-of select="record[@type='return']/@datatype"/>&gt;</span>
          <xsl:text> &#8211; </xsl:text>
        </xsl:if>
        <span class="jsxdoc_returndesc">
          <xsl:value-of select="record[@type='return']/@jsxtip"/>
        </span>
      </div>
    </xsl:if>

    <xsl:if test="record[@type='overrides']">
      <h3 class="jsxdoc">Overrides:</h3>
      <div class="jsxdoc_overrides">
      <xsl:variable name="sourceclassname" select="record[@type='overrides']/@source"/>
      <code><xsl:apply-templates select="record[@type='overrides']" mode="methodlink"/></code>
      <xsl:text> in </xsl:text>
      <code><xsl:apply-templates select="../record[@type='superclass' and @jsxtext=$sourceclassname]" mode="classlink"/></code>
      </div>
    </xsl:if>

  </xsl:template>

  <!-- main template for Field content -->
  <xsl:template match="record" mode="field">
    <h1 class="jsxdoc">
      <span class="class">
        <xsl:apply-templates select="../." mode="classlink">
          <xsl:with-param name="linkalways">
            <xsl:if test="@class=../@jsxtext">1</xsl:if>
          </xsl:with-param>
          <xsl:with-param name="classname" select="@class"/>
        </xsl:apply-templates>.</span>
      <xsl:value-of select="@jsxtext"/>
    </h1>

    <xsl:if test="@datatype">
      <div class="jsxdoc_fieldtype">static &lt;<xsl:value-of select="@datatype"/>&gt;</div>
    </xsl:if>

    <div class="jsxdoc_fielddesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:apply-templates select="@jsxtip" mode="disable-output-escp"/>
    </div>
  </xsl:template>

  <!-- sub templates -->

  <xsl:template match="record" mode="superclass">
    <xsl:param name="indent" select="''"/>
    <div class="jsxdoc_super">
      <span class="arrow"><xsl:value-of select="$indent"/></span>
      <xsl:apply-templates select="." mode="classlink"/>
    </div>
    <xsl:variable name="nextindent">
      <xsl:choose>
        <xsl:when test="$indent=''">
          <xsl:value-of select="'-&gt;'"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="concat('&#160;&#160;', $indent)"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="@type='superclass'">
      <xsl:choose>
        <xsl:when test="following-sibling::*[@type='superclass']">
          <xsl:apply-templates select="following-sibling::*[1]" mode="superclass">
            <xsl:with-param name="indent" select="$nextindent"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="../." mode="superclass">
            <xsl:with-param name="indent" select="$nextindent"/>
          </xsl:apply-templates>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template match="record" mode="interface">
    <span class="jsxdoc_interface">
      <xsl:apply-templates select="." mode="classlink"/>
    </span>
  </xsl:template>

  <xsl:template match="record" mode="subclass">
    <span class="jsxdoc_subclass">
      <xsl:apply-templates select="." mode="classlink"/>
    </span>
  </xsl:template>

  <xsl:template match="record" mode="classlink">
    <xsl:param name="linkalways" select="0"/>
    <xsl:param name="classname" select="@jsxtext"/>
    <xsl:value-of select="$classname"/>
  </xsl:template>

  <xsl:template match="record" mode="fieldlink">
    <xsl:value-of select="@jsxtext"/>
  </xsl:template>

  <xsl:template match="record" mode="methodlink">
    <xsl:value-of select="@jsxtext"/>
  </xsl:template>

  <xsl:template match="record" mode="deprecated">
    <xsl:if test="@deprecated">
      <div class="deprecated">
        <span class="title">Deprecated.</span>
        <xsl:if test="record[@type='deprecated']">
          <xsl:text> </xsl:text>
          <xsl:apply-templates select="record[@type='deprecated']/@jsxtip" mode="disable-output-escp"/>
        </xsl:if>
      </div>
    </xsl:if>
  </xsl:template>

  <!-- From jsxlib.xsl -->
  <xsl:template match="* | @*" mode="disable-output-escp">
    <xsl:call-template name="disable-output-escp">
      <xsl:with-param name="value" select="."/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="disable-output-escp">
    <xsl:param name="value" select="."/>
    <xsl:choose>
      <xsl:when test="function-available('msxsl:node-set')">
        <xsl:value-of disable-output-escaping="yes" select="$value"/>
      </xsl:when>
      <xsl:otherwise>
        <span class="disable-output-escp"><xsl:value-of select="$value"/></span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
</xsl:stylesheet>
