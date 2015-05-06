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
        <title>Packages</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>
        <div style="margin:0px 0px 12px 0px">
          <a href="allclasses-frame.html" target="packageFrame">All Classes</a></div>
        
        <h3 class="pkglist">Packages</h3>
        <xsl:apply-templates select="record">
          <xsl:sort select="@jsxid" data-type="text" order="ascending"/>
        </xsl:apply-templates>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="record">
    <div class="package">
      <a href="{concat(substring(@path,0,string-length(@path)-10),'frame.html')}" target="packageFrame">
        <xsl:value-of select="@jsxtext"/>
      </a>
    </div>
  </xsl:template>

</xsl:stylesheet>
