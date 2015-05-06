<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:template match="/">
    <xsl:apply-templates select="/*"/>
  </xsl:template>

  <xsl:template match="/package">
    <xsl:if test="not(@deprecated='1')">
      <record jsxtext="{@name}">
        <xsl:apply-templates select="." mode="sfields"/>
        <xsl:apply-templates select="." mode="smethods"/>
      </record>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/class | /interface">
    <xsl:if test="not(@deprecated='1')">
      <record jsxtext="{@shortname}">
        <xsl:apply-templates select="." mode="sfields"/>
        <xsl:apply-templates select="." mode="smethods"/>
        <xsl:apply-templates select="constructor"/>
        <xsl:apply-templates select="method[not(@deprecated='1') and not(@static='1') and not(@inherited='1')]"/>
      </record>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="sfields">
    <xsl:if test="field[@static='1']">
      <record jsxtext="&amp;middot; Static Fields">
        <xsl:apply-templates select="field[not(@deprecated='1') and @static='1']"/>
      </record>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="smethods">
    <xsl:if test="method[@static='1']">
      <record jsxtext="&amp;middot; Static Methods">
        <xsl:apply-templates select="method[not(@deprecated='1') and @static='1']"/>
      </record>
    </xsl:if>
  </xsl:template>

  <xsl:template match="field">
    <record jsxtext="{@name}" syntax="{@fullname}">
      <xsl:attribute name="syntax">
        <xsl:choose>
          <xsl:when test="@static='1'">
            <xsl:value-of select="@fullname"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="@name"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
    </record>
  </xsl:template>

  <xsl:template match="constructor">
    <record jsxtext="&amp;middot; new {../@name}()">
      <xsl:attribute name="syntax">
        <xsl:text>new </xsl:text>
        <xsl:value-of select="../@name"/>
        <xsl:apply-templates select="." mode="params"/>
      </xsl:attribute>
    </record>
  </xsl:template>

  <xsl:template match="method">
    <record jsxtext="{@name}()">
      <xsl:attribute name="syntax">
        <xsl:if test="@static='1'">
          <xsl:value-of select="../@name"/>
          <xsl:text>.</xsl:text>
        </xsl:if>
        <xsl:value-of select="@name"/>
        <xsl:apply-templates select="." mode="params"/>
      </xsl:attribute>
    </record>
  </xsl:template>

  <xsl:template match="*" mode="params">
    <xsl:text>(</xsl:text>
    <xsl:for-each select="param">
      <xsl:value-of select="@name"/>
      <xsl:if test="position() != last()">
        <xsl:text>,</xsl:text>
      </xsl:if>
    </xsl:for-each>
    <xsl:text>)</xsl:text>
  </xsl:template>

</xsl:stylesheet>
