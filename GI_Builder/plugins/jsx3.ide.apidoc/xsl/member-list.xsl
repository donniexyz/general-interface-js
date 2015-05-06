<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" omit-xml-declaration="yes"/>
  <xsl:param name="showinherited">0</xsl:param>
  <xsl:param name="showdeprecated">1</xsl:param>

  <xsl:template match="/">
    <data jsxid="jsxroot">
      <xsl:apply-templates select="/*"/>
    </data>
  </xsl:template>

  <xsl:template match="/class | /interface | /package">
    <xsl:apply-templates select="." mode="intro"/>

    <xsl:if test="field[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
      <record jsxid="sf" jsxunselectable="1" jsxtext="Static Fields" jsxstyle="font-weight:bold;color:#666666;"/>
      <xsl:apply-templates select="field[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
        <xsl:sort select="@name" data-type="text" order="ascending"/>
      </xsl:apply-templates>
    </xsl:if>

    <xsl:if test="field[not(@static='1') and ($showinherited=1 or not(@inherited='1')) and ($showdeprecated=1 or not(@deprecated='1'))]">
      <record jsxid="m" jsxunselectable="1" jsxtext="Fields" jsxstyle="font-weight:bold;color:#666666;"/>
      <xsl:apply-templates select="field[not(@static='1') and ($showinherited=1 or not(@inherited='1')) and ($showdeprecated=1 or not(@deprecated='1'))]">
        <xsl:sort select="@name" data-type="text" order="ascending"/>
      </xsl:apply-templates>
    </xsl:if>

    <xsl:if test="method[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
      <record jsxid="sm" jsxunselectable="1" jsxtext="Static Methods" jsxstyle="font-weight:bold;color:#666666;"/>
      <xsl:apply-templates select="method[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
        <xsl:sort select="@name" data-type="text" order="ascending"/>
      </xsl:apply-templates>
    </xsl:if>

    <xsl:if test="method[not(@static='1') and ($showinherited=1 or not(@inherited='1')) and ($showdeprecated=1 or not(@deprecated='1'))]">
      <record jsxid="m" jsxunselectable="1" jsxtext="Methods" jsxstyle="font-weight:bold;color:#666666;"/>
      <xsl:apply-templates select="method[not(@static='1') and ($showinherited=1 or not(@inherited='1')) and ($showdeprecated=1 or not(@deprecated='1'))]">
        <xsl:sort select="@name" data-type="text" order="ascending"/>
      </xsl:apply-templates>
    </xsl:if>
  </xsl:template>

  <xsl:template match="method | constructor | field">
    <xsl:variable name="style">
      <xsl:if test="@deprecated">text-decoration:line-through;color:#666666;</xsl:if>
      <xsl:if test="@native">color:#AA7733;</xsl:if>
    </xsl:variable>
    <record jsxid="{@id}" jsxtext="{@name}" jsxtip="{@fullname}"
        jsxcellstyle="{$style}padding-left:15px;" access="{@access}" final="{@final}" abstract="{@abstract}">
      <xsl:if test="@inherited='1'">
        <xsl:attribute name="jsxidfk"><xsl:value-of select="@idfk"/></xsl:attribute>
        <xsl:attribute name="source"><xsl:value-of select="@source"/></xsl:attribute>
        <xsl:attribute name="inherited">1</xsl:attribute>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="local-name()='field'">
          <xsl:attribute name="type">field</xsl:attribute>
          <xsl:attribute name="jsxtip"><xsl:value-of select="@fullname"/></xsl:attribute>
        </xsl:when>
        <xsl:when test="local-name()='method'">
          <xsl:attribute name="type">method</xsl:attribute>
          <xsl:attribute name="jsxtip">
            <xsl:choose>
              <xsl:when test="@inherited='1'"><xsl:value-of select="concat(@source,'.',@name)"/></xsl:when>
              <xsl:otherwise><xsl:value-of select="concat(../@name,'.',@name)"/></xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        </xsl:when>
      </xsl:choose>
    </record>
  </xsl:template>

  <xsl:template match="class" mode="intro">
    <record jsxid="_summary" type="class" jsxtext="Class Summary" jsxstyle="font-weight:bold;"
        jsxtip="{@name}"/>

    <xsl:if test="constructor[$showdeprecated=1 or not(@deprecated='1')]">
      <record jsxid="_constructor" type="constructor" jsxtext="Constructor" jsxstyle="font-weight:bold;"
          jsxtip="{@name}.{constructor/@name}"/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="interface" mode="intro">
    <record jsxid="_summary" type="class" jsxtext="Interface Summary" jsxstyle="font-weight:bold;"
        jsxtip="{@name}"/>
  </xsl:template>

  <xsl:template match="package" mode="intro">
    <record jsxid="_summary" type="class" jsxtext="Package Summary" jsxstyle="font-weight:bold;"
        jsxtip="{@name}"/>
  </xsl:template>

</xsl:stylesheet>
