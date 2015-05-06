<?xml version="1.0"?>
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
      omit-xml-declaration="yes"/>

  <xsl:param name="classname"/>
  <xsl:param name="apidocpath"/>

  <xsl:template match="/*">
    <html>
      <head>
        <title><xsl:value-of select="$classname"/> XSL Parameters</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>

        <xsl:apply-templates select="." mode="header"/>
        <xsl:apply-templates select="." mode="main-content"/>
        <xsl:apply-templates select="." mode="footer"/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="*" mode="main-content">
    <!-- Summary -->
    <table class="summary">
      <xsl:for-each select="record">
        <xsl:sort select="@jsxid"/>
        <tr>
          <td class="name"><xsl:value-of select="@jsxid"/></td>
          <td><xsl:value-of select="@jsxtip" disable-output-escaping="yes"/></td>
        </tr>
      </xsl:for-each>
    </table>

    <hr/>
  </xsl:template>

</xsl:stylesheet>
