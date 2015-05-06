<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:jf="http://www.jivesoftware.com/xmlns/jiveforums/rss"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt"
    xmlns:content="http://purl.org/rss/1.0/modules/content/">

  <xsl:output omit-xml-declaration="yes" method="xml"/>

  <xsl:param name="jsxasyncmessage"></xsl:param>
  <xsl:param name="count">4</xsl:param>
  <xsl:param name="maxlength">60</xsl:param>
  <xsl:param name="showdesc">0</xsl:param>
  <xsl:param name="showdate">1</xsl:param>
  <xsl:param name="descmaxlength">200</xsl:param>

  <xsl:template match="/">
    <div class="rsslinks">
      <xsl:choose>
        <xsl:when test="$jsxasyncmessage and $jsxasyncmessage!=''">
          <xsl:value-of select="$jsxasyncmessage"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="//item[position() &lt;= $count]"/>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </xsl:template>

  <xsl:template match="item">
    <xsl:param name="title">
      <xsl:choose>
        <xsl:when test="substring-after(title, ' | ') != ''">
          <xsl:value-of select="substring-after(title, ' | ')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="title"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:param>

    <div class="rssitem">
      <a target="_blank">
        <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
      <xsl:choose>
        <xsl:when test="string-length($title) &gt; $maxlength">
          <xsl:value-of select="substring($title, 0, $maxlength)"/><xsl:text>...</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$title"/>
        </xsl:otherwise>
      </xsl:choose>
      </a>
      <xsl:choose>
        <xsl:when test="$showdate=1 and jf:dateToText">
          <span class="date"><xsl:value-of select="jf:dateToText"/></span>
        </xsl:when>
      </xsl:choose>

      <xsl:if test="$showdesc=1">
        <div class="rssdesc">
          <xsl:choose>
            <xsl:when test="string-length(content:encoded) &gt; $descmaxlength">
              <xsl:call-template name="disable-output-escp">
                <xsl:with-param name="value" select="substring(content:encoded, 0, $descmaxlength)"/>
              </xsl:call-template>
              <xsl:text>...</xsl:text>
            </xsl:when>
            <xsl:otherwise>
              <xsl:apply-templates select="content:encoded" mode="disable-output-escp"/>
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </xsl:if>
    </div>
  </xsl:template>

  <xsl:template match="* | @*" mode="disable-output-escp">
    <xsl:call-template name="disable-output-escp">
      <xsl:with-param name="value" select="."/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="disable-output-escp">
    <xsl:param name="value" select="."/>
    <xsl:choose>
      <xsl:when test="function-available('msxsl:node-set')">
        <xsl:value-of disable-output-escaping="yes" select="$value"/>
      </xsl:when>
      <xsl:otherwise>
        <span class="disable-output-escp"><xsl:value-of select="$value"/></span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>
