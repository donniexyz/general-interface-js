<?xml version="1.0" ?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="/ | @* | node()">
    <xsl:choose>
      <xsl:when test="@href">
        <xsl:apply-templates select="." mode="concretize"/><xsl:apply-templates/>
      </xsl:when>
      <xsl:when test="local-name() != 'multiRef'">
        <xsl:copy>
          <xsl:apply-templates select="@*"/><xsl:apply-templates/>
        </xsl:copy>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*" mode="concretize">
    <xsl:param name="myId"><xsl:value-of select="@href"/></xsl:param> 
    <xsl:copy>
      <xsl:apply-templates select="//*[@id=substring-after($myId,'#')]/*"/><xsl:apply-templates/>
    </xsl:copy>
  </xsl:template> 

</xsl:stylesheet> 
