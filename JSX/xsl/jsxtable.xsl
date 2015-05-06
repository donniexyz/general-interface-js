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
  <xsl:param name="attrtip">jsxtip</xsl:param>
  <xsl:param name="attrimg">jsximg</xsl:param>
  <xsl:param name="attrimgalt">jsximgalt</xsl:param>
  <xsl:param name="attrselected">jsxselected</xsl:param>

  <!-- default parameters managed by the class; most can be updated by calling instance methods in the class, jsx3.gui.Table -->
  <xsl:param name="jsxtabindex">0</xsl:param>
  <xsl:param name="jsxselectionbgurl">JSX/images/matrix/select.gif</xsl:param>
  <xsl:param name="jsxid"></xsl:param>
  <xsl:param name="jsxpath"></xsl:param>
  <xsl:param name="jsxpathapps"></xsl:param>
  <xsl:param name="jsxpathprefix"></xsl:param>
  <xsl:param name="jsxappprefix"></xsl:param>
  <xsl:param name="jsxsortpath"></xsl:param>
  <xsl:param name="jsxsortdirection">ascending</xsl:param>
  <xsl:param name="jsxsorttype">text</xsl:param>
  <xsl:param name="jsxshallowfrom">jsxroot</xsl:param>
  <xsl:param name="jsxasyncmessage"></xsl:param>
  <xsl:param name="jsxheaderheight"></xsl:param>
  <xsl:param name="jsxrowstyle1"></xsl:param>
  <xsl:param name="jsxrowclass1"></xsl:param>
  <xsl:param name="jsxrowstyle2"></xsl:param>
  <xsl:param name="jsxrowclass2"></xsl:param>
  <xsl:param name="jsxcellstyle"></xsl:param>
  <xsl:param name="jsxcellclass"></xsl:param>
  <xsl:param name="jsxcellwrap"></xsl:param>
  <xsl:param name="jsxtablestyles"></xsl:param>
  <xsl:param name="jsx_img_resolve">1</xsl:param>

  <!-- Users can use these named parameters to further parameterize their templates with custom input parameters -->
  <xsl:param name="jsx_1"/>
  <xsl:param name="jsx_2"/>
  <xsl:param name="jsx_3"/>
  <xsl:param name="jsx_4"/>
  <xsl:param name="jsx_5"/>
  <xsl:param name="jsx_6"/>
  <xsl:param name="jsx_7"/>
  <xsl:param name="jsx_8"/>
  <xsl:param name="jsx_9"/>
  <xsl:param name="jsx_10"/>
  <xsl:param name="jsxmininclusive">0</xsl:param>
  <xsl:param name="jsxmaxinclusive"></xsl:param>

  <!-- the root entry template -->
  <xsl:template match="/">
    <JSX_FF_WELLFORMED_WRAPPER>
      <xsl:choose>
        <xsl:when test="$jsxasyncmessage and $jsxasyncmessage!=''">
          <xsl:value-of select="$jsxasyncmessage"/>
        </xsl:when>
        <xsl:when test="$jsxmaxinclusive">
          <table class="jsx30table" style="top:{$jsxheaderheight}px;{$jsxtablestyles}" cellpadding="0"
                 cellspacing="0">
            <xsl:for-each select="//*[$attrchildren='*' or name()=$attrchildren]">
            <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
            <xsl:choose><xsl:when test="position() &gt;= $jsxmininclusive and position() &lt;= $jsxmaxinclusive">
              <xsl:apply-templates select="." mode="record">
                <xsl:with-param name="position" select="position()-1"/>
              </xsl:apply-templates>
            </xsl:when></xsl:choose>
          </xsl:for-each>
          </table>
        </xsl:when>        
        <xsl:otherwise>
          <table class="jsx30table" style="top:{$jsxheaderheight}px;{$jsxtablestyles}" cellpadding="0"
                 cellspacing="0">
            <xsl:for-each select="//*[@*[name() = $attrid]=$jsxshallowfrom]/*[$attrchildren='*' or name()=$attrchildren]">
              <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
              <xsl:apply-templates select="." mode="record">
                <xsl:with-param name="position" select="position()-1"/>
              </xsl:apply-templates>
            </xsl:for-each>
          </table>
        </xsl:otherwise>
      </xsl:choose>
    </JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <!-- Called by the root template. Renders the TR/TD containers -->
  <xsl:template match="*" mode="record">
    <xsl:param name="position"/>
    <xsl:param name="myselectionbg">
      <xsl:if test="@*[name() = $attrselected]='1'">background-image:url(
        <xsl:value-of select="$jsxselectionbgurl"/>
        );
      </xsl:if>
    </xsl:param>
    <xsl:param name="jsxrowclass">
      <xsl:choose>
        <xsl:when test="$position mod 2 = 0"><xsl:value-of select="$jsxrowclass2"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$jsxrowclass1"/></xsl:otherwise>
      </xsl:choose>
    </xsl:param>
    <xsl:param name="jsxrowstyle">
      <xsl:choose>
        <xsl:when test="$position mod 2 = 0"><xsl:value-of select="$jsxrowstyle2"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="$jsxrowstyle1"/></xsl:otherwise>
      </xsl:choose><xsl:text>;</xsl:text>
    </xsl:param>

    <tr id="{$jsxid}_{@*[name() = $attrid]}" jsxid="{@*[name() = $attrid]}" jsxposition="{$position}" class="jsx30table {$jsxrowclass}"
        style="{$jsxrowstyle}" tabindex="{$jsxtabindex}">
      <xsl:if test="@*[name() = $attrtip]">
        <xsl:attribute name="title">
          <xsl:value-of select="@*[name() = $attrtip]"/>
        </xsl:attribute>
      </xsl:if>
    </tr>
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
