<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >

  <xsl:import href="common.xsl"/>
  <xsl:import href="package-summary.xsl"/>
  <xsl:import href="class-summary.xsl"/>
  <xsl:import href="overview-summary.xsl"/>

  <xsl:param name="title">TITLE</xsl:param>

  <xsl:variable name="relpath" select="''"/>
  
  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes" />

  <xsl:template match="/api">
    <html>
      <head>
        <title><xsl:value-of disable-output-escaping="yes" select="$title"/> - API Documentation</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>

        <xsl:apply-templates select="." mode="header"/>

        <h1><xsl:value-of disable-output-escaping="yes" select="$title"/>
          <br/>API Documentation</h1>
        
    <xsl:apply-templates select="data" mode="toc"/>
    <xsl:apply-templates select="data" mode="classes"/>
    <xsl:apply-templates select="." mode="footer"/>
        
      </body>
    </html>
  </xsl:template>
  
  <xsl:template match="data" mode="toc">
    <xsl:apply-templates select="." mode="package-list"/>
    <hr style="margin-bottom:96px;"/>
  </xsl:template>
  
  <xsl:template match="data" mode="classes">
    <xsl:apply-templates select="record" mode="classes">
      <xsl:sort select="@jsxid" data-type="text" order="ascending"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="record" mode="classes">
    <xsl:apply-templates select="." mode="page"/>
    <xsl:apply-templates select="record" mode="page">
      <xsl:sort select="@jsxtext" data-type="text" order="ascending"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="*" mode="page">
    <div class="page">
    <xsl:variable name="fullname" select="@jsxid"/>
    <xsl:apply-templates select="/api/*[@name=$fullname]" mode="pagecontent"/>
    </div>
  </xsl:template>

  <xsl:template match="*" mode="pagecontent">
    <xsl:apply-templates select="." mode="main-content"/>
    <xsl:if test="method[not(@inherited='1')] or field[not(@inherited='1')] or constructor[not(@inherited='1')]">
      <hr/>
    </xsl:if>
  </xsl:template>
  
<!--
  <xsl:template match="record" mode="summary-summary">
    <div class="summarydesc">
      <xsl:value-of
          select="@jsxtip"
          disable-output-escaping="yes"/>
    </div>
  </xsl:template>
-->
  
  <xsl:template match="*" mode="link-class">
    <xsl:param name="class">
      <xsl:choose>
        <xsl:when test="@name"><xsl:value-of select="@name"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
      </xsl:choose>
    </xsl:param>
    <xsl:param name="jsxtext" select="$class"/>
    <xsl:param name="strikedep" select="0"/>

    <span>
      <xsl:if test="$strikedep=1 and @deprecated">
        <xsl:attribute name="class" select="'dep'"/>
      </xsl:if>
    <a href="#class:{$class}">
      <xsl:value-of select="$jsxtext"/>
    </a>
    </span>
  </xsl:template>
  
  <xsl:template match="*" mode="link-member">
    <xsl:param name="class" select="@source"/>
    <xsl:param name="anchor" select="@idfk"/>
    <xsl:param name="strikedep" select="0"/>
    
    <span>
      <xsl:if test="$strikedep=1 and @deprecated">
        <xsl:attribute name="class" select="'dep'"/>
      </xsl:if>
    <a href="#class:{$class}:{$anchor}">
      <xsl:value-of select="@name"/>
    </a>
    </span>
  </xsl:template>
  
  <xsl:template match="*" mode="link-package">
    <a href="#class:{@jsxid}">
      <xsl:value-of select="@name | @jsxtext"/>
    </a>
  </xsl:template>
    
  <xsl:template match="*" mode="header">
    <div class="header">
      <span><a href="index.html">Frames</a></span>
      <span><a href="single.html" target="_top">Single</a></span>
      <span><a href="deprecated.html">Deprecated</a></span>
    </div>
  </xsl:template>
  
  <xsl:template match="*" mode="anchor">
    <xsl:value-of select="../@id"/>:<xsl:value-of select="@id"/>
  </xsl:template>
  
</xsl:stylesheet>
