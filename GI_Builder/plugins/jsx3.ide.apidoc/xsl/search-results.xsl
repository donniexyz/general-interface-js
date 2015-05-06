<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:template match="/data">
    <div> <!-- for Fx -->
    <xsl:variable name="resultCount" select="count(//record)"/>
    <xsl:choose>
      <xsl:when test="$resultCount=0">
        <xsl:text>No results found.</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>Found </xsl:text>
        <xsl:value-of select="$resultCount"/>
        <xsl:text> result</xsl:text><xsl:if test="$resultCount > 1">s</xsl:if><xsl:text>.</xsl:text>

        <div style="padding:4px 0px 0px 0px">
          <xsl:apply-templates select="./record">
            <xsl:sort select="@class" data-type="text" order="ascending"/>
            <xsl:sort select="@jsxtext" data-type="text" order="ascending"/>
          </xsl:apply-templates>
        </div>
      </xsl:otherwise>
    </xsl:choose>
    </div>
  </xsl:template>

  <xsl:template match="record[@type='class']">
    <div class="jsxdoc_sresult_class">
      <span class="jsxdoc_link" onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doClassLink('{@class}');">
        <xsl:value-of select="@class"/>
      </span>
    </div>
    <xsl:if test="./record">
      <div class="jsxdoc_sresult_indent">
        <xsl:apply-templates select="./record"/>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="record[@type='field']">
    <div class="jsxdoc_sresult_field">
      <span class="jsxdoc_link" onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').searchLink('{@class}','{@jsxidfk}');">
        <xsl:value-of select="@class"/>.<xsl:value-of select="@jsxtext"/>
      </span>
      <xsl:apply-templates select="./record"/>
    </div>
  </xsl:template>

  <xsl:template match="record[@type='method']">
    <div class="jsxdoc_sresult_method">
      <span class="jsxdoc_link" onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').searchLink('{@class}','{@jsxidfk}');">
        <xsl:value-of select="@class"/>.<xsl:value-of select="@jsxtext"/>
      </span>
      <xsl:apply-templates select="./record"/>
    </div>
  </xsl:template>

</xsl:stylesheet>
