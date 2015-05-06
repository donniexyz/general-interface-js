<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/TR/WD-xsl" language="JavaScript">

  <xsl:template match="/">
    <data jsxid="jsxroot">
      <xsl:apply-templates select="@*"/><xsl:apply-templates/>
    </data>
  </xsl:template>

  <xsl:template>
    <xsl:choose>
      <xsl:when test=".[nodeName()='text']">
        <xsl:attribute name="jsxtext"><xsl:value-of select="."/></xsl:attribute>
      </xsl:when>
      <xsl:when test=".[nodeName()=id]">
        <xsl:attribute name="jsxid"><xsl:value-of select="."/></xsl:attribute>
      </xsl:when>
      <xsl:when test=".[nodeName()='node']">
        <record>
          <xsl:apply-templates select="@*"/><xsl:apply-templates/>
        </record>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy>
          <xsl:apply-templates select="@*"/><xsl:apply-templates/>
        </xsl:copy>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@id">
    <xsl:attribute name="jsxid"><xsl:value-of select="."/></xsl:attribute>
  </xsl:template>

  <xsl:template match="@img">
    <xsl:attribute name="jsximg"><xsl:value-of select="."/></xsl:attribute>
  </xsl:template>

  <xsl:template match="@open[.='true']">
    <xsl:attribute name="jsxopen">1</xsl:attribute>
  </xsl:template>

  <xsl:template match="@open[.='false']">
  </xsl:template>

  <xsl:template match="@type">
  </xsl:template>

</xsl:stylesheet>
