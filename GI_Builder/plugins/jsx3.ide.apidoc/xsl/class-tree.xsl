<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output
      method="xml"
      encoding="UTF-8"
      omit-xml-declaration="yes" />

  <xsl:param name="showdeprecated">1</xsl:param>
  <xsl:param name="indent-increment" select="'  '" />

  <xsl:template match="/*">
    <xsl:param name="indent" select="''"/>

    <xsl:value-of select="$indent"/>
    <xsl:copy>
      <xsl:copy-of select="@*" />
      <xsl:apply-templates>
        <xsl:with-param name="indent" select="concat('&#xA;', $indent-increment)"/>
      </xsl:apply-templates>
      <xsl:if test="*">
        <xsl:value-of select="'&#xA;'"/>
      </xsl:if>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*">
    <xsl:param name="indent" select="'&#xA;'"/>

    <xsl:if test="$showdeprecated=1 or not(@deprecated='1')">
    <xsl:variable name="depstyle">
      <xsl:if test="@deprecated">text-decoration:line-through;color:#666666;</xsl:if>
    </xsl:variable>
    <xsl:variable name="nativestyle">
      <xsl:if test="@native">color:#AA7733;</xsl:if>
    </xsl:variable>
    
    <xsl:value-of select="$indent"/>
    <xsl:copy>
      <xsl:copy-of select="@*" />
      <xsl:attribute name="jsxstyle">
        <xsl:value-of select="$depstyle"/>
        <xsl:value-of select="$nativestyle"/>
        <xsl:if test="@classtype='interface'">font-style:italic;</xsl:if>
        <xsl:if test="@classtype='package'">font-weight:bold;</xsl:if>      
      </xsl:attribute>
      
      <xsl:apply-templates>
        <xsl:with-param name="indent" select="concat($indent, $indent-increment)"/>
      </xsl:apply-templates>
      <xsl:if test="*">
        <xsl:value-of select="$indent"/>
      </xsl:if>
    </xsl:copy>
    </xsl:if>
  </xsl:template>

  <xsl:template match="comment()|processing-instruction()">
    <xsl:copy />
  </xsl:template>

   <!-- WARNING: this is dangerous. Handle with care -->
  <xsl:template match="text()[normalize-space(.)='']"/>

</xsl:stylesheet>
