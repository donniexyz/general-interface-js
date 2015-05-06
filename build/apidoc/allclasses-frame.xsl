<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >

  <xsl:import href="common.xsl"/>
  <xsl:variable name="relpath" select="''"/>
    
  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes"/>

  <xsl:template match="/data">
    <html>
      <head>
        <title>All Classes</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>
        <h3 class="pkglist">All Classes</h3>
        <xsl:apply-templates select="//record[@classtype='class' or @classtype='interface']">
          <xsl:sort select="@jsxtext" data-type="text" order="ascending"/>
        </xsl:apply-templates>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="record">
    <div>
      <xsl:attribute name="class">
        <xsl:choose>
          <xsl:when test="@classtype='interface'"><xsl:text>pkglist-interface</xsl:text></xsl:when>
          <xsl:otherwise><xsl:text>pkglist-class</xsl:text></xsl:otherwise>
        </xsl:choose>
        <xsl:if test="@deprecated='1'"><xsl:text> dep</xsl:text></xsl:if>
      </xsl:attribute>
      <a href="{concat(substring(@path,0,string-length(@path)-3),'.html')}" target="classFrame">
        <xsl:value-of select="@jsxtext"/>
      </a>
    </div>
  </xsl:template>

</xsl:stylesheet>
