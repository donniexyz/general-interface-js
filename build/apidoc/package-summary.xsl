<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >
  
  <xsl:import href="common.xsl"/>

  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes" />

  <xsl:template match="/package">
    <html>
      <head>
        <title><xsl:value-of select="@name"/> Summary</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>

        <xsl:apply-templates select="." mode="header"/>
        <xsl:apply-templates select="." mode="main-content"/>
        <xsl:apply-templates select="." mode="footer"/>

      </body>
    </html>
  </xsl:template>

  <xsl:template match="package" mode="main-content">
    <a name="{@id}">
    <h1>
      <xsl:text>package </xsl:text>
      <xsl:value-of select="@name"/>
    </h1>
    </a>

    <div class="detaildesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:choose>
        <xsl:when test="text and not(text='')">
          <xsl:apply-templates select="text" mode="textblock"/>
        </xsl:when>
        <xsl:when test="not(@deprecated)">
          <span class="none">No description provided.</span>
        </xsl:when>
      </xsl:choose>
    </div>
    
    <xsl:apply-templates select="." mode="since"/>
    <xsl:apply-templates select="." mode="version"/>
    <xsl:apply-templates select="." mode="author"/>
    <xsl:apply-templates select="." mode="seealso"/>
    
    <hr/>

    <xsl:apply-templates select="." mode="classsummary"/>
    <xsl:apply-templates select="." mode="fieldsummary"/>
    <xsl:apply-templates select="." mode="methodsummary"/>

    <xsl:apply-templates select="." mode="fielddetail"/>
    <xsl:apply-templates select="." mode="methoddetail"/>
    
  </xsl:template>
  
</xsl:stylesheet>
