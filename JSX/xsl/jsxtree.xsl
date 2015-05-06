<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:param name="attrchildren">record</xsl:param>
  <xsl:param name="attrid">jsxid</xsl:param>
  <xsl:param name="attrtext">jsxtext</xsl:param>
  <xsl:param name="attrtip">jsxtip</xsl:param>
  <xsl:param name="attrstyle">jsxstyle</xsl:param>
  <xsl:param name="attrclass">jsxclass</xsl:param>
  <xsl:param name="attrimg">jsximg</xsl:param>
  <xsl:param name="attrimgalt">jsximgalt</xsl:param>
  <xsl:param name="attrselected">jsxselected</xsl:param>
  <xsl:param name="attropen">jsxopen</xsl:param>
  <xsl:param name="attrlazy">jsxlazy</xsl:param>

  <xsl:param name="jsxtabindex">0</xsl:param>
  <xsl:param name="jsxicon"></xsl:param>
  <xsl:param name="jsxiconminus"></xsl:param>
  <xsl:param name="jsxiconplus"></xsl:param>
  <xsl:param name="jsxiconminusalt"></xsl:param>
  <xsl:param name="jsxiconplusalt"></xsl:param>
  <xsl:param name="jsxtransparentimage"></xsl:param>
  <xsl:param name="jsxdragtype">JSX_GENERIC</xsl:param>
  <xsl:param name="jsxrootid">jsxnull</xsl:param>
  <xsl:param name="jsxselectedimage"></xsl:param>
  <xsl:param name="jsxid">_jsx_JSX1_12</xsl:param>
  <xsl:param name="jsxuseroot">1</xsl:param>
  <xsl:param name="jsxpath"></xsl:param>
  <xsl:param name="jsxpathapps"></xsl:param>
  <xsl:param name="jsxpathprefix"></xsl:param>
  <xsl:param name="jsxappprefix"></xsl:param>
  <xsl:param name="jsxsortpath"></xsl:param>
  <xsl:param name="jsxsortdirection">ascending</xsl:param>
  <xsl:param name="jsxsorttype">text</xsl:param>
  <xsl:param name="jsxdeepfrom">jsxnull</xsl:param>
  <xsl:param name="jsxfragment">0</xsl:param>
  <xsl:param name="jsxindent">20</xsl:param>
  <xsl:param name="jsx_no_empty_indent">0</xsl:param>
  <xsl:param name="jsx_img_resolve">1</xsl:param>
  <xsl:param name="jsxtitle"></xsl:param>
  <xsl:param name="jsxasyncmessage"></xsl:param>

  <xsl:template match="/">
    <JSX_FF_WELLFORMED_WRAPPER>
      <xsl:choose>
        <xsl:when test="$jsxasyncmessage and $jsxasyncmessage!=''">
          <xsl:value-of select="$jsxasyncmessage"/>
        </xsl:when>
        <xsl:when test="$jsxdeepfrom != 'jsxnull' and $jsxfragment != '1'">
          <xsl:apply-templates select="//*[@*[name() = $attrid]=$jsxdeepfrom]"/>
        </xsl:when>
        <xsl:when test="$jsxuseroot=1">
          <xsl:apply-templates select="//*[@*[name() = $attrid]=$jsxrootid]"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:for-each select="//*[@*[name() = $attrid]=$jsxrootid]/*[$attrchildren='*' or name()=$attrchildren]">
            <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
            <xsl:apply-templates select="."/>
          </xsl:for-each>
        </xsl:otherwise>
      </xsl:choose>
    </JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <xsl:template match="*">
    <xsl:param name="myjsxid" select="@*[name() = $attrid]"/>
    <xsl:param name="mystyle" select="@*[name() = $attrstyle]"/>
    <xsl:param name="myclass" select="@*[name() = $attrclass]"/>

    <!-- TO DO: shouldn't affect performance to resolve all of the following, but look into how very large trees perform when rendered -->
    <xsl:variable name="_jsxstyle">
      <xsl:if test="$jsxselectedimage">background-image:url(<xsl:value-of select="$jsxselectedimage"/>);</xsl:if>
    </xsl:variable>

    <div jsxtype='item' class='jsx30tree_item' id="{$jsxid}_{$myjsxid}" jsxid="{$myjsxid}" unselectable="on">
      <div jsxtype='caption' class='jsx30tree_caption' unselectable="on">
        <xsl:if test="@*[name() = $attrtip]">
          <xsl:attribute name="title">
            <xsl:value-of select="@*[name() = $attrtip]"/>
          </xsl:attribute>
        </xsl:if>
        <!-- plus/minus icon -->
        <xsl:choose>
          <xsl:when test="(*[$attrchildren='*' or name()=$attrchildren] or (@*[name() = $attrlazy] > 0)) and @*[name() = $attropen]=1">
            <img jsxtype="plusminus" class="jsx30tree_pm" src="{$jsxiconminus}" alt="{$jsxiconminusalt}"/>
          </xsl:when>
          <xsl:when test="(*[$attrchildren='*' or name()=$attrchildren] or (@*[name() = $attrlazy] > 0))">
            <img jsxtype="plusminus" class="jsx30tree_pm" src="{$jsxiconplus}" alt="{$jsxiconplusalt}"/>
          </xsl:when>
          <xsl:when test="$jsx_no_empty_indent='1' and not(../*[$attrchildren='*' or name()=$attrchildren]/*[$attrchildren='*' or name()=$attrchildren])">
            <span class="jsx30tree_empty">
              <xsl:text>&#160;</xsl:text>
            </span>
          </xsl:when>
          <xsl:otherwise>
            <img jsxtype="space" class="jsx30tree_pm" src="{$jsxtransparentimage}" alt=""/>
          </xsl:otherwise>
        </xsl:choose>
        <!-- image icon -->
        <xsl:choose>
          <xsl:when test="@*[name() = $attrimg]='' or (not(@*[name() = $attrimg]) and $jsxicon='')">
            <span class="jsx30tree_empty">
              <xsl:text>&#160;</xsl:text>
            </span>
          </xsl:when>
          <xsl:when test="@*[name() = $attrimg]">
            <xsl:variable name="jsximg_resolved">
              <xsl:choose>
                <xsl:when test="$jsx_img_resolve='1'"><xsl:apply-templates select="@*[name() = $attrimg]" mode="uri-resolver"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="@*[name() = $attrimg]"/></xsl:otherwise>
              </xsl:choose>
            </xsl:variable>

            <img jsxtype="icon" unselectable="on" class="jsx30tree_icon" src="{$jsximg_resolved}" alt="{@*[name() = $attrimgalt]}"/>
          </xsl:when>
          <xsl:otherwise>
            <img jsxtype="icon" unselectable="on" class="jsx30tree_icon" src="{$jsxicon}" alt="{@*[name() = $attrimgalt]}"/>
          </xsl:otherwise>
        </xsl:choose>
        <!-- record text -->
        <span jsxtype="text" unselectable="on" tabindex="{$jsxtabindex}"
            JSXDragType="{$jsxdragtype}">
          <xsl:attribute name="class">
            <xsl:text>jsx30tree_text </xsl:text>
            <xsl:if test="@*[name() = $attrselected]='1'">
              <xsl:text>jsx30tree_texton </xsl:text>
            </xsl:if>
            <xsl:value-of select="$myclass"/>
          </xsl:attribute>
          <xsl:attribute name="style">
            <xsl:if test="@*[name() = $attrselected]='1'">
              <xsl:value-of select="$_jsxstyle"/>
            </xsl:if>
            <xsl:value-of select="@*[name() = $attrstyle]"/>
            <xsl:value-of select="$mystyle"/>
          </xsl:attribute>
          <xsl:attribute name="JSXSpyglass">
            <xsl:value-of select="@*[name() = $attrid]"/>
          </xsl:attribute>
          <xsl:attribute name="JSXDragId">
            <xsl:value-of select="@*[name() = $attrid]"/>
          </xsl:attribute>
          <xsl:value-of select="@*[name() = $attrtext]"/>
        </span>
      </div>
      <!-- child records -->
      <div jsxtype="content" unselectable="on" class='jsx30tree_content'>
        <xsl:choose>
          <xsl:when test="*[$attrchildren='*' or name()=$attrchildren]">
            <xsl:attribute name="style">
              <xsl:if test="@*[name() = $attropen]='1'">display:block;</xsl:if>
              <xsl:text>padding-left:</xsl:text>
              <xsl:value-of select="$jsxindent"/>
              <xsl:text>px;</xsl:text>
            </xsl:attribute>
            <!-- recurse here -->
            <xsl:for-each select="*[$attrchildren='*' or name()=$attrchildren]">
              <xsl:sort select="@*[name()=$jsxsortpath]" data-type="{$jsxsorttype}" order="{$jsxsortdirection}"/>
              <xsl:apply-templates select="."/>
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <xsl:text>&#160;</xsl:text>
          </xsl:otherwise>
        </xsl:choose>
      </div>
    </div>
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

</xsl:stylesheet>
