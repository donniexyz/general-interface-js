<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">



  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:param name="jsxtabindex">0</xsl:param>
  <xsl:param name="jsxicon">JSX/images/tree/file.gif</xsl:param>
  <xsl:param name="jsxiconminus">JSX/images/tree/minus.gif</xsl:param>
  <xsl:param name="jsxiconplus">JSX/images/tree/plus.gif</xsl:param>
  <xsl:param name="jsxtransparentimage">JSX/images/spc.gif</xsl:param>
  <xsl:param name="jsxdragtype">JSX_GENERIC</xsl:param>
  <xsl:param name="jsxrootid">jsxroot</xsl:param>
  <xsl:param name="jsxselectedimage"></xsl:param>
  <xsl:param name="jsxbordercolor">#8d9ec1</xsl:param>
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

  <xsl:template match="/">
    <JSX_FF_WELLFORMED_WRAPPER>
      <xsl:choose>
        <xsl:when test="$jsxuseroot=1">
          <xsl:apply-templates select="//*[@jsxid=$jsxrootid]"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="//*[@jsxid=$jsxrootid]/record"/>
        </xsl:otherwise>
      </xsl:choose>
    </JSX_FF_WELLFORMED_WRAPPER>
  </xsl:template>

  <xsl:template match="record" mode="type">
    <xsl:apply-templates select="." mode="uri-resolver">
      <xsl:with-param name="uri">
        <xsl:choose>
          <xsl:when test="@type='O'">jsxapp:/plugins/jsx3.ide.mapping/images/inbound_map.gif</xsl:when>
          <xsl:when test="@type='I'">jsxapp:/plugins/jsx3.ide.mapping/images/outbound_map.gif</xsl:when>
          <xsl:when test="@type='W'">jsxapp:/plugins/jsx3.ide.mapping/images/wsdl.gif</xsl:when>
          <xsl:when test="@type='T'">jsxapp:/plugins/jsx3.ide.mapping/images/wsdl.gif</xsl:when>
          <xsl:when test="@type='S'">jsxapp:/plugins/jsx3.ide.mapping/images/service.gif</xsl:when>
          <xsl:when test="@type='P'">jsxapp:/plugins/jsx3.ide.mapping/images/operation.gif</xsl:when>
          <xsl:when test="@type='C' and not(record)">jsxapp:/plugins/jsx3.ide.mapping/images/complex_0.gif</xsl:when>
          <xsl:when test="@type='C'">jsxapp:/plugins/jsx3.ide.mapping/images/complex_1.gif</xsl:when>
          <xsl:when test="@type='D'">jsxapp:/plugins/jsx3.ide.mapping/images/cdata.gif</xsl:when>
          <xsl:when test="@type='E'">jsxapp:/plugins/jsx3.ide.mapping/images/edit.gif</xsl:when>
          <xsl:when test="@type='F'">jsxapp:/plugins/jsx3.ide.mapping/images/fault.gif</xsl:when>
          <xsl:when test="@type='A'">jsxapp:/plugins/jsx3.ide.mapping/images/attribute.gif</xsl:when>
          <xsl:otherwise>jsxapp:/plugins/jsx3.ide.mapping/images/wsdl.gif</xsl:otherwise>
        </xsl:choose>
      </xsl:with-param>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="*">
    <xsl:param name="myjsxid" select="@jsxid"/>
    <xsl:param name="mystyle" select="@jsxstyle"/>
    <xsl:param name="myimg" select="@type"/>
    <xsl:variable name="latticestyle"><xsl:choose><xsl:when test="@groupref='1'">color:#c8c8c8;font-style:italic;</xsl:when></xsl:choose></xsl:variable>
    <xsl:variable name="pointerstyle"><xsl:choose><xsl:when test="mappings/record[@name='CDF Record' and @value and not(@value='')]">color:red;font-style:italic;</xsl:when></xsl:choose></xsl:variable>
    <xsl:variable name="myimgsrc"><xsl:apply-templates select="." mode="type"/></xsl:variable>

    <div jsxtype='item' class='jsx30tree_item' id="{$jsxid}_{$myjsxid}">
      <xsl:attribute name="jsxid"><xsl:value-of select="@jsxid"/></xsl:attribute>
      <div jsxtype='caption' class='jsx30tree_caption' >
        <!-- plus/minus icon -->
        <xsl:choose>
          <xsl:when test="record and @jsxopen=1">
            <img jsxtype="plusminus" src="{$jsxiconminus}" class="jsx30tree_pm"/>
          </xsl:when>
          <xsl:when test="record">
            <img jsxtype="plusminus" src="{$jsxiconplus}" class="jsx30tree_pm"/>
          </xsl:when>
          <xsl:otherwise>
            <img jsxtype="space" src="{$jsxtransparentimage}" class="jsx30tree_pm"/>
          </xsl:otherwise>
        </xsl:choose>
        <!-- image icon -->
        <img jsxtype="icon" unselectable="on" class="jsx30tree_icon" src="{$myimgsrc}"/>
        <!-- record text -->
        <span jsxtype="text" unselectable="on" tabindex="{$jsxtabindex}" JSXDragType="{$jsxdragtype}">
          <xsl:attribute name="class">
            <xsl:text>jsx30tree_text </xsl:text>
            <xsl:if test="@jsxselected='1'">
              <xsl:text>jsx30tree_texton</xsl:text>
            </xsl:if>
          </xsl:attribute>
          <xsl:choose><xsl:when test="@jsxtip"><xsl:attribute name="title"><xsl:value-of select="@jsxtip"/></xsl:attribute></xsl:when></xsl:choose>
          <xsl:attribute name="JSXSpyglass"><xsl:value-of select="@jsxid"/></xsl:attribute>
          <xsl:attribute name="JSXDragId"><xsl:value-of select="@jsxid"/></xsl:attribute>
          <xsl:attribute name="style"><xsl:value-of select="$latticestyle"/><xsl:value-of select="$pointerstyle"/><xsl:value-of select="@jsxstyle"/></xsl:attribute>
          <xsl:choose><xsl:when test="@repeat"><span style="color:#01B40A;font-weight:bold;{$latticestyle}{$pointerstyle}">[&amp;] </span></xsl:when></xsl:choose>
          <xsl:choose><xsl:when test="mappings/record"><span style="color:#3030cf;font-weight:bold;{$latticestyle}{$pointerstyle}">[^] </span></xsl:when></xsl:choose>
          <xsl:choose><xsl:when test="restrictions/record[@name!='minoccur' and @name!='maxoccur']"><span style="color:orange;font-weight:bold;{$latticestyle}{$pointerstyle}">[R] </span></xsl:when></xsl:choose>
          <xsl:value-of select="@jsxtext"/>
          <xsl:choose>
            <xsl:when test="@datatype != ''">
              <span style="color:#00aa00;{$latticestyle}{$pointerstyle}"> [<xsl:value-of select="@datatype"/>]</span>
            </xsl:when>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="not(restrictions/record[@name='maxoccur']/@value = '' and restrictions/record[@name='minoccur']/@value = '')">
              <span style="color:blue;{$latticestyle}{$pointerstyle}">
                (
                <xsl:choose>
                  <xsl:when test="restrictions/record[@name='minoccur']">
                    <xsl:value-of select="restrictions/record[@name='minoccur']/@value"/>
                  </xsl:when>
                  <xsl:otherwise>
                    1
                  </xsl:otherwise>
                </xsl:choose>
                <xsl:if test="restrictions/record[@name='maxoccur']">
                  - <xsl:value-of select="restrictions/record[@name='maxoccur']/@value"/>
                </xsl:if>
                )
              </span>
            </xsl:when>
          </xsl:choose>
        </span>
      </div>
      <div jsxtype="content" unselectable="on" class='jsx30tree_content'>
        <xsl:choose>
          <xsl:when test="record">
            <xsl:attribute name="style">
              <xsl:if test="@jsxopen='1'">display:block;</xsl:if>
              <xsl:text>padding-left:</xsl:text><xsl:value-of select="$jsxindent"/><xsl:text>px;</xsl:text>
            </xsl:attribute>
            <!-- recurse here -->
            <xsl:for-each select="record">
              <xsl:apply-templates select="."/>
            </xsl:for-each>
          </xsl:when><xsl:otherwise><xsl:text>&#160;</xsl:text></xsl:otherwise>
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
