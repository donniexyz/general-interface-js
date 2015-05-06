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
        <title><xsl:value-of select="@name"/> Classes and Interfaces</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>
    <div class="pkglist-package">
      <a href="package-summary.html" target="classFrame"><xsl:value-of select="@name"/></a>
    </div>
    
    <xsl:if test="nested[@type='interface']">
      <h3 class="pkglist">Interfaces</h3>
      <xsl:apply-templates select="nested[@type='interface']">
        <xsl:sort select="@shortname" data-type="text" order="ascending"/>
      </xsl:apply-templates>
    </xsl:if>
  
    <xsl:if test="nested[@type='class' or not(@type)]">
      <h3 class="pkglist">Classes</h3>
      <xsl:apply-templates select="nested[@type='class' or not(@type)]">
        <xsl:sort select="@shortname" data-type="text" order="ascending"/>
      </xsl:apply-templates>
    </xsl:if>
      
      </body>
    </html>
  </xsl:template>

  <xsl:template match="nested">
    <div>
      <xsl:attribute name="class">
        <xsl:text>pkglist-</xsl:text><xsl:value-of select="@type"/>
        <xsl:if test="@deprecated='1'"><xsl:text> dep</xsl:text></xsl:if>
      </xsl:attribute>
      <a href="{@shortname}.html" target="classFrame"><xsl:value-of select="@shortname"/></a>
    </div>
  </xsl:template>
  
</xsl:stylesheet>
