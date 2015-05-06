<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt">

  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:param name="attrchildren">record</xsl:param>
  <xsl:param name="attrid">jsxid</xsl:param>
  <xsl:param name="attrtext">jsxtext</xsl:param>
  <xsl:param name="attrtip">jsxtip</xsl:param>
  <xsl:param name="attrstyle">jsxstyle</xsl:param>
  <xsl:param name="attrclass">jsxclass</xsl:param>
  <xsl:param name="attrimg">jsximg</xsl:param>
  <xsl:param name="attrimgalt">jsximgalt</xsl:param>
  <xsl:param name="attrdisabled">jsxdisabled</xsl:param>

  <xsl:param name="jsxsortpath"></xsl:param>
  <xsl:param name="jsxsortdirection">ascending</xsl:param>
  <xsl:param name="jsxsorttype">text</xsl:param>
  <xsl:param name="jsxshallowfrom"></xsl:param>
  <xsl:param name="jsx_img_resolve">1</xsl:param>
  <xsl:param name="jsxasyncmessage"></xsl:param>
  <xsl:param name="_value"></xsl:param>
  <xsl:param name="jsxpath"></xsl:param>
  <xsl:param name="jsxpathapps"></xsl:param>
  <xsl:param name="jsxpathprefix"></xsl:param>
  <xsl:param name="jsxappprefix"></xsl:param>

  <xsl:template match="/*">
    <JSX_FF_WELLFORMED_WRAPPER><xsl:choose>
      <xsl:when test="$jsxasyncmessage and $jsxasyncmessage!=''">
        <option disabled="disabled"><xsl:value-of select="$jsxasyncmessage"/></option>
      </xsl:when>
      <xsl:when test="$jsxshallowfrom">
        <xsl:for-each select="//*[@*[name() = $attrid]=$jsxshallowfrom]/*[$attrchildren='*' or name()=$attrchildren]">
          <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
          <xsl:apply-templates select="."/>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:for-each select="*[$attrchildren='*' or name()=$attrchildren]">
          <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
          <xsl:apply-templates select="."/>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose></JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <xsl:template match="*">
    <xsl:variable name="mytext">
      <xsl:choose>
        <xsl:when test="@*[name() = $attrtext]"><xsl:value-of select="@*[name() = $attrtext]"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="@*[name() = $attrid]"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="bgimage">
      <xsl:if test="@*[name() = $attrimg]">
        <xsl:text>background-image:</xsl:text>
        <xsl:choose>
          <xsl:when test="$jsx_img_resolve='1'"><xsl:apply-templates select="@*[name() = $attrimg]" mode="uri-resolver"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="@*[name() = $attrimg]"/></xsl:otherwise>
        </xsl:choose>
        <xsl:text>;</xsl:text>
      </xsl:if>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="*[$attrchildren='*' or name()=$attrchildren]">
        <optgroup label="{$mytext}">
          <xsl:if test="@*[name() = $attrstyle] or $bgimage != ''"><xsl:attribute name="style"><xsl:value-of select="$bgimage"/><xsl:value-of select="@*[name() = $attrstyle]"/></xsl:attribute></xsl:if>
          <xsl:if test="@*[name() = $attrclass]"><xsl:attribute name="class"><xsl:value-of select="@*[name() = $attrclass]"/></xsl:attribute></xsl:if>
          <xsl:if test="@*[name() = $attrtip]"><xsl:attribute name="title"><xsl:value-of select="@*[name() = $attrtip]"/></xsl:attribute></xsl:if>
          <xsl:if test="@*[name() = $attrdisabled]='1'"><xsl:attribute name="disabled">disabled</xsl:attribute></xsl:if>
          <xsl:apply-templates select="*"/>
        </optgroup>
      </xsl:when>
      <xsl:otherwise>
        <option value="{@*[name() = $attrid]}">
          <xsl:if test="@*[name() = $attrstyle] or $bgimage != ''"><xsl:attribute name="style"><xsl:value-of select="$bgimage"/><xsl:value-of select="@*[name() = $attrstyle]"/></xsl:attribute></xsl:if>
          <xsl:if test="@*[name() = $attrclass]"><xsl:attribute name="class"><xsl:value-of select="@*[name() = $attrclass]"/></xsl:attribute></xsl:if>
          <xsl:if test="@*[name() = $attrtip]"><xsl:attribute name="title"><xsl:value-of select="@*[name() = $attrtip]"/></xsl:attribute></xsl:if>
          <xsl:if test="@*[name() = $attrdisabled]='1'"><xsl:attribute name="disabled">disabled</xsl:attribute></xsl:if>
          <xsl:if test="$_value != '' and $_value = @*[name() = $attrid]">
            <xsl:attribute name="selected">selected</xsl:attribute>
          </xsl:if>
          <xsl:value-of select="$mytext"/>
        </option>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- From jsxlib.xsl -->
  <xsl:template match="* | @*" mode="uri-resolver">
    <xsl:param name="uri" select="."/>
    <xsl:choose>
      <xsl:when test="starts-with($uri,'JSX/')">
        <xsl:value-of select="concat($jsxpath, $uri)"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'JSXAPPS/')">
        <xsl:value-of select="concat($jsxpathapps, $uri)"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'GI_Builder/')">
        <xsl:value-of select="concat($jsxpath, $uri)"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsx:///')">
        <xsl:value-of select="concat($jsxpath, 'JSX/', substring($uri,8))"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsx:/')">
        <xsl:value-of select="concat($jsxpath, 'JSX/', substring($uri,6))"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsxapp:///')">
        <xsl:value-of select="concat($jsxappprefix, substring($uri,11))"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsxapp://')">
        <xsl:value-of select="concat($jsxpathapps, substring($uri,10))"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsxapp:/')">
        <xsl:value-of select="concat($jsxappprefix, substring($uri,9))"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsxuser:///')">
        <xsl:value-of select="concat($jsxpathapps, substring($uri,11))"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsxuser:/')">
        <xsl:value-of select="concat($jsxpathapps, substring($uri,9))"/>
      </xsl:when>
      <xsl:when test="starts-with($uri,'jsxaddin://')">
        <!-- cannot resolve addin links in XSL -->
        <xsl:value-of select="$uri"/>
        <!---->
      </xsl:when>
      <xsl:when test="starts-with($uri,'/')">
        <xsl:value-of select="$uri"/>
      </xsl:when>
      <xsl:when test="contains($uri,'://')">
        <xsl:value-of select="$uri"/>
      </xsl:when>
      <xsl:when test="not($jsxpathprefix='') and not(starts-with($uri, $jsxpathprefix))">
        <xsl:apply-templates select="." mode="uri-resolver">
          <xsl:with-param name="uri" select="concat($jsxpathprefix, $uri)"/>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$uri"/>
      </xsl:otherwise>
    </xsl:choose>
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
