<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >

  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes" />

  <xsl:param name="classname"/>
  <xsl:param name="packagename"/>
  <xsl:param name="apidocpath"/>

  <xsl:variable name="relpath">
    <xsl:apply-templates select="/*" mode="relpath"/>
  </xsl:variable>
  
  <xsl:template match="*" mode="styles">
    <link rel="stylesheet" TYPE="text/css" media="screen">
      <xsl:attribute name="href"><xsl:value-of select="$relpath"/>styles.css</xsl:attribute>
    </link>
<!--
    <link rel="stylesheet" TYPE="text/css" media="print">
      <xsl:attribute name="href"><xsl:value-of select="$relpath"/>styles-print.css</xsl:attribute>
    </link>
-->
  </xsl:template>
  
  <xsl:template match="*" mode="relpath">
    <xsl:value-of select="fn:concat(fn:replace(fn:replace($packagename, '\.', '/'), '\w+', '..'), '/')"/>
  </xsl:template>

  <xsl:template match="* | @*" mode="type">
    <xsl:variable name="type">
      <xsl:choose>
        <xsl:when test=". = '$class$'"><xsl:value-of select="$classname"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:text> {</xsl:text>
    <xsl:choose>
      <xsl:when test="$apidocpath">
        <a href="{$apidocpath}index.html?{fn:replace($type, '\.', '/')}.html" target="_top">
          <xsl:value-of select="$type"/>
        </a>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$type"/></xsl:otherwise>
    </xsl:choose>
    <xsl:text>}</xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="header">
    <h2><xsl:value-of select="$classname"/>
      <xsl:if test="$apidocpath">
        <span class="apilink">
          <a href="{$apidocpath}index.html?{fn:replace($classname, '\.', '/')}.html" target="_top">
            <xsl:text>API</xsl:text>
          </a>
        </span>
      </xsl:if>
    </h2>

    <hr/>
  </xsl:template>

  <xsl:template match="*" mode="methodlink">
    <xsl:param name="method" select="@name"/>
    <xsl:variable name="methodtext">
      <xsl:choose>
        <xsl:when test="fn:matches($method, '\(')">
          <xsl:value-of select="$method"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$method"/><xsl:text>()</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="methodname">
      <xsl:choose>
        <xsl:when test="fn:matches($method, '\(')">
          <xsl:value-of select="fn:replace($method, '\(.*$', '')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$method"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="$apidocpath">
        <a href="{$apidocpath}index.html?{fn:replace($classname, '\.', '/')}.html!method:{$methodname}" target="_top">
          <xsl:value-of select="$methodtext"/>
        </a>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$methodtext"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*" mode="fieldlink">
    <xsl:param name="name" select="@name"/>
    <xsl:variable name="fieldname">
      <xsl:value-of select="fn:replace($name, '^.*\.', '')"/>
    </xsl:variable>
    <xsl:variable name="fieldclass">
      <xsl:value-of select="fn:replace($name, '\.[^\.]+$', '')"/>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="$apidocpath and $fieldclass">
        <a href="{$apidocpath}index.html?{fn:replace($fieldclass, '\.', '/')}.html!field:{$fieldname}" target="_top">
          <xsl:value-of select="$name"/>
        </a>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$name"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*" mode="footer">
    <!--<hr/>-->
    <div class="copyright">
      <xsl:value-of disable-output-escaping="yes">Copyright &amp;copy; 2001-2014, TIBCO Software Inc.</xsl:value-of>
    </div>
  </xsl:template>

  <xsl:template match="* | @*" mode="first-sentence">
    <!-- Only use the first sentence of the description for the summary. -->
    <xsl:value-of
        select="fn:replace(., '^([\s\S]*?)(\.[\s\r\n\W]|&lt;(ul|ol|pre|p|br|div)/?&gt;)[\s\S]*$', '$1.', 'i')"
        disable-output-escaping="yes"/>
  </xsl:template>

  <xsl:template match="*" mode="deprecated">
    <xsl:if test="@deprecated">
      <div class="deprecated">
        <span class="title">Deprecated. </span>
        <xsl:if test="@deprecated != '1'">
          <xsl:value-of select="@deprecated" disable-output-escaping="yes"/><xsl:text> </xsl:text>
        </xsl:if>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="deprecated-inline">
    <xsl:if test="@deprecated">
      <span class="deprecated">
        <span class="title">Deprecated. </span>
        <xsl:if test="@deprecated != '1'">
          <xsl:value-of select="@deprecated" disable-output-escaping="yes"/><xsl:text> </xsl:text>
        </xsl:if>
      </span>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
