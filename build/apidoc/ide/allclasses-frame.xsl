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
        <xsl:apply-templates select="record">
          <xsl:sort select="@jsxid" data-type="text" order="ascending"/>
        </xsl:apply-templates>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="record">
    <xsl:if test="position()=1 or not(preceding-sibling::*[1]/@package=@package)">
      <div class="package"><xsl:value-of select="@package"/></div>
    </xsl:if>
    <div>
      <a href="{@path}" target="classFrame">
        <xsl:value-of select="@class"/>
      </a>
    </div>
  </xsl:template>

</xsl:stylesheet>
