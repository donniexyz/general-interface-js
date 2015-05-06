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

  <xsl:param name="lc">abcdefghijklmnopqrstuvwxyz</xsl:param>
  <xsl:param name="uc">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:param>
  <xsl:param name="jsxtabindex">0</xsl:param>
  <xsl:param name="jsxselectedimage"></xsl:param>
  <xsl:param name="jsxselectedimagealt"></xsl:param>
  <xsl:param name="jsxtransparentimage"></xsl:param>
  <xsl:param name="jsxdragtype">JSX_GENERIC</xsl:param>
  <xsl:param name="jsxselectedid">null</xsl:param>
  <xsl:param name="jsxsortpath"></xsl:param>
  <xsl:param name="jsxsortdirection">ascending</xsl:param>
  <xsl:param name="jsxsorttype">text</xsl:param>
  <xsl:param name="jsxid">_jsx</xsl:param>
  <xsl:param name="jsxtext"></xsl:param>
  <xsl:param name="jsxmode">0</xsl:param>
  <xsl:param name="jsxdisableescape">no</xsl:param>
  <xsl:param name="jsxshallowfrom"></xsl:param>
  <xsl:param name="jsxcasesensitive">0</xsl:param>
  <xsl:param name="jsxnocheck">0</xsl:param>
  <xsl:param name="jsx_img_resolve">1</xsl:param>
  <xsl:param name="jsx_type">select</xsl:param> <!-- Set to "combo" for combo control XSL -->
  <xsl:param name="jsxtitle"></xsl:param>
  <xsl:param name="jsxasyncmessage"></xsl:param>
  <xsl:param name="jsxpath"></xsl:param>
  <xsl:param name="jsxpathapps"></xsl:param>
  <xsl:param name="jsxpathprefix"></xsl:param>
  <xsl:param name="jsxappprefix"></xsl:param>

  <xsl:template match="/">
  <JSX_FF_WELLFORMED_WRAPPER><xsl:choose>
    <xsl:when test="$jsxasyncmessage and $jsxasyncmessage!=''">
      <div class="jsx30select_{$jsxmode}_option"><span><xsl:value-of select="$jsxasyncmessage"/></span></div>
    </xsl:when>
    <xsl:when test="$jsxshallowfrom">
      <xsl:for-each select="//*[@*[name() = $attrid]=$jsxshallowfrom]/*[$attrchildren='*' or name()=$attrchildren]">
        <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
        <xsl:choose>
          <xsl:when test="$jsx_type='select'">
            <xsl:apply-templates select="." mode="select"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="." mode="combo"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="descendant::*[$attrchildren='*' or name()=$attrchildren]">
        <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
        <xsl:choose>
          <xsl:when test="$jsx_type='select'">
            <xsl:apply-templates select="." mode="select"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="." mode="combo"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose></JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <xsl:template match="*" mode="select">
    <xsl:param name="myjsxid" select="@*[name() = $attrid]"/>

    <div id="{$jsxid}_{$myjsxid}" jsxtype="Option" tabindex="{$jsxtabindex}"
        jsxid="{$myjsxid}" title="{@*[name() = $attrtip]}" class="jsx30select_{$jsxmode}_option {@*[name() = $attrclass]}">
      <xsl:if test="@*[name() = $attrstyle]">
        <xsl:attribute name="style">
          <xsl:value-of select="@*[name() = $attrstyle]"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$jsxnocheck != '1'">
        <xsl:choose>
          <xsl:when test="$jsxselectedid=$myjsxid">
            <img unselectable="on" class="jsx30select_check" src="{$jsxselectedimage}" alt="{$jsxselectedimagealt}"/>
          </xsl:when>
          <xsl:otherwise>
            <img unselectable="on" class="jsx30select_check" src="{$jsxtransparentimage}" alt=""/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:if>
      <xsl:if test="@*[name() = $attrimg] and @*[name() = $attrimg] != ''">
        <xsl:variable name="src1">
          <xsl:choose>
            <xsl:when test="$jsx_img_resolve='1'"><xsl:apply-templates select="@*[name() = $attrimg]" mode="uri-resolver"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="@*[name() = $attrimg]"/></xsl:otherwise>
          </xsl:choose>
        </xsl:variable>
        <img unselectable="on" class="jsx30select_icon" src="{$src1}" alt="{@*[name() = $attrimgalt]}"/>
      </xsl:if>
      <span>
        <xsl:apply-templates select="." mode="jsxtext"/>
      </span>
    </div>
  </xsl:template>

  <xsl:template match="*" mode="combo">
    <xsl:variable name="mytext">
      <xsl:choose>
        <xsl:when test="@*[name() = $attrtext]"><xsl:value-of select="@*[name() = $attrtext]"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="@*[name() = $attrid]"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="(not($jsxcasesensitive = 1) and starts-with(translate($mytext, $lc, $uc), translate($jsxtext, $lc, $uc)))
        or ($jsxcasesensitive = 1 and starts-with($mytext, $jsxtext))">
      <div jsxtype="Option" tabindex="{$jsxtabindex}" id="{$jsxid}_{@*[name() = $attrid]}"
        jsxid="{@*[name() = $attrid]}" title="{@*[name() = $attrtip]}" class="jsx30select_{$jsxmode}_option {@*[name() = $attrclass]}">
        <xsl:if test="@*[name() = $attrstyle]">
          <xsl:attribute name="style">
            <xsl:value-of select="@*[name() = $attrstyle]"/>
          </xsl:attribute>
        </xsl:if>
        <xsl:if test="$jsxnocheck != '1'">
          <xsl:choose>
            <xsl:when test="$jsxselectedid=@*[name() = $attrid]">
              <img unselectable="on" class="jsx30select_check" src="{$jsxselectedimage}" alt="{$jsxselectedimagealt}"/>
            </xsl:when>
            <xsl:otherwise>
              <img unselectable="on" class="jsx30select_check" src="{$jsxtransparentimage}" alt=""/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
        <xsl:if test="@*[name() = $attrimg] and @*[name() = $attrimg] != ''">
          <xsl:variable name="src1">
            <xsl:choose>
              <xsl:when test="$jsx_img_resolve='1'"><xsl:apply-templates select="@*[name() = $attrimg]" mode="uri-resolver"/></xsl:when>
              <xsl:otherwise><xsl:value-of select="@*[name() = $attrimg]"/></xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <img unselectable="on" class="jsx30select_icon" src="{$src1}" alt="{@*[name() = $attrimgalt]}"/>
        </xsl:if>
        <span>
          <xsl:apply-templates select="." mode="jsxtext">
            <xsl:with-param name="value" select="$mytext"/>
          </xsl:apply-templates>
        </span>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="jsxtext">
    <xsl:param name="value" select="@*[name() = $attrtext]"/>

    <xsl:choose>
      <xsl:when test="$jsxdisableescape='yes'">
        <xsl:call-template name="disable-output-escp">
          <xsl:with-param name="value" select="$value"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$value"/>
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
