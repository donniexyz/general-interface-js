<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >

  <xsl:import href="common.xsl"/>

  <xsl:param name="title">TITLE</xsl:param>

  <xsl:variable name="relpath" select="''"/>
  
  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes"/>  

  <xsl:template match="/data">
    <html>
      <head>
        <title>Overview</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>
        
        <xsl:apply-templates select="." mode="header"/>

        <h1><xsl:value-of disable-output-escaping="yes" select="$title"/>
          <br/>API Documentation</h1>
        
        <xsl:apply-templates select="." mode="package-list"/>

        <xsl:apply-templates select="." mode="footer"/>
        
      </body>
    </html>
  </xsl:template>
  
  <xsl:template match="data" mode="package-list">
    <table class="packages">
      <tr>
        <th colspan="2">Packages</th>
      </tr>
    <xsl:apply-templates select="record" mode="package-desc">
      <xsl:sort select="@jsxid" data-type="text" order="ascending"/>
    </xsl:apply-templates>
    </table>
  </xsl:template>
  
  <xsl:template match="record" mode="package-desc">
    <tr>
      <td>
        <div class="package">
          <xsl:apply-templates select="." mode="link-package"/>
        </div>        
      </td>
      <td><xsl:value-of select="@summary" disable-output-escaping="yes"/></td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
