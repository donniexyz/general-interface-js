<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >
  
  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes" />
  
  <xsl:param name="copyright"></xsl:param>

  <xsl:variable name="relpath">
    <xsl:apply-templates select="/*" mode="relpath"/>
  </xsl:variable>
  
  <xsl:template match="*" mode="styles">
    <link rel="stylesheet" TYPE="text/css" media="screen">
      <xsl:attribute name="href"><xsl:value-of select="$relpath"/>styles.css</xsl:attribute>
    </link>
    <link rel="stylesheet" TYPE="text/css" media="print">
      <xsl:attribute name="href"><xsl:value-of select="$relpath"/>styles-print.css</xsl:attribute>
    </link>
  </xsl:template>
  
  <xsl:template match="package" mode="relpath">
    <xsl:choose>
      <xsl:when test="@name='window'">
        <xsl:value-of></xsl:value-of>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="fn:concat(fn:replace(fn:replace(@name, '\.', '/'), '\w+', '..'), '/')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="class | interface" mode="relpath">
    <xsl:choose>
      <xsl:when test="@package='' or @package='window'">
        <xsl:value-of></xsl:value-of>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="fn:concat(fn:replace(fn:replace(@package, '\.', '/'), '\w+', '..'), '/')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*" mode="header">
    <div class="header">
      <span><a href="{$relpath}overview-summary.html">Overview</a></span>
      <span><a href="{$relpath}single.html" target="_top">Single</a></span>
      <span><a href="{$relpath}deprecated.html">Deprecated</a></span>
      <span><a href="{$relpath}properties/index.html" target="_top">Properties</a></span>
      <span><a href="{$relpath}events/index.html" target="_top">Events</a></span>
      <span><a href="{$relpath}xslparams/index.html" target="_top">XSL Parameters</a></span>
    </div>
  </xsl:template>
  
  <xsl:template match="*" mode="footer">
    <xsl:if test="$copyright">
      <hr/>
      <div class="copyright">
        <xsl:value-of disable-output-escaping="yes" select="$copyright"/>
      </div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="abspath">
    <xsl:param name="class" select="@name"/>
    <xsl:variable name="package">
      <xsl:choose>
        <xsl:when test="$class='inheritance'">
          <xsl:value-of select="''"/>
        </xsl:when>
        <xsl:when test="fn:matches($class, '[A-Z]')">
          <xsl:value-of select="fn:replace($class, '^(.*?)[A-Z].*$', '$1')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$class"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="shortname" select="fn:substring($class, fn:string-length($package)+1)"/>
    
    <xsl:choose>
      <xsl:when test="$shortname='' and $package='window'">
        <xsl:value-of select="'package-summary.html'"/>
      </xsl:when>
      <xsl:when test="$shortname=''">
        <xsl:value-of select="fn:concat(fn:replace($package, '\.', '/'), '/package-summary.html')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="fn:concat(fn:replace($package, '\.', '/'), $shortname, '.html')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*" mode="link-class">
    <xsl:param name="class">
      <xsl:choose>
        <xsl:when test="@name"><xsl:value-of select="@name"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
      </xsl:choose>
    </xsl:param>
    <xsl:param name="jsxtext" select="$class"/>
    <xsl:param name="strikedep" select="0"/>

    <span>
      <xsl:if test="$strikedep=1 and @deprecated">
        <xsl:attribute name="class" select="'dep'"/>
      </xsl:if>
    <a target="classFrame">
      <xsl:variable name="abspath">
        <xsl:apply-templates select="." mode="abspath">
          <xsl:with-param name="class" select="$class"/>
        </xsl:apply-templates>
      </xsl:variable>
      <xsl:attribute name="href" select="fn:concat($relpath, $abspath)"/>
      <xsl:value-of select="$jsxtext"/>
    </a>
    </span>
  </xsl:template>
  
  <xsl:template match="*" mode="link-member">
    <xsl:param name="class" select="@source"/>
    <xsl:param name="anchor" select="@idfk"/>
    <xsl:param name="text">
      <xsl:choose>
        <xsl:when test="@name"><xsl:value-of select="@name"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
      </xsl:choose>
    </xsl:param>
    <xsl:param name="strikedep" select="0"/>
    
    <span>
      <xsl:if test="$strikedep=1 and @deprecated">
        <xsl:attribute name="class" select="'dep'"/>
      </xsl:if>
    <a target="classFrame">
      <xsl:variable name="abspath">
        <xsl:apply-templates select="." mode="abspath">
          <xsl:with-param name="class" select="$class"/>
        </xsl:apply-templates>
      </xsl:variable>
      <xsl:attribute name="href" select="fn:concat($relpath, $abspath, '#', $anchor)"/>
      <xsl:value-of select="$text"/>
    </a>
    </span>
  </xsl:template>
  
  <xsl:template match="*" mode="link-package">
    <a href="{concat(substring(@path,0,string-length(@path)-3),'.html')}" target="classFrame">
      <xsl:value-of select="@name | @jsxtext"/>
    </a>
  </xsl:template>
  
  <xsl:template match="*" mode="deprecated">
    <xsl:param name="inline" select="0"/>
    <xsl:variable name="cssclass">
      <xsl:choose>
        <xsl:when test="$inline=1">deprecated-inline</xsl:when>
        <xsl:otherwise>deprecated</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="@deprecated">
      <div class="{$cssclass}">
        <span class="title">Deprecated.</span>
        <xsl:if test="deprecated">
          <xsl:text> </xsl:text>
          <xsl:value-of disable-output-escaping="yes" select="deprecated"/>
        </xsl:if>
      </div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="since">
    <xsl:if test="@since">
      <h4 class="detail">Since:</h4>
      <div class="indent"><xsl:value-of select="@since" disable-output-escaping="yes"/></div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="author">
    <xsl:if test="author">
      <h4 class="detail">Authors:</h4>
      <xsl:for-each select="author">
        <div class="indent"><xsl:value-of select="." disable-output-escaping="yes"/></div>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="version">
    <xsl:if test="@version">
      <h4 class="detail">Version:</h4>
      <div class="indent"><xsl:value-of select="@version" disable-output-escaping="yes"/></div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="seealso">
    <xsl:if test="see">
      <h4 class="detail">See Also:</h4>
      <div class="indent">
        <xsl:for-each select="see">
          <xsl:choose>
            <xsl:when test="@source and @idfk">
              <xsl:apply-templates select="." mode="link-member"/>
            </xsl:when>
            <xsl:when test="@source">
              <xsl:apply-templates select="." mode="link-class"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="@name" disable-output-escaping="yes"/>
            </xsl:otherwise>            
          </xsl:choose>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="class | interface | package" mode="classsummary">
    <xsl:if test="nested">
      <table class="summary">
        <tr><th colspan="2"><xsl:if test="local-name()='class'"><xsl:text>Nested </xsl:text></xsl:if>
          Class Summary</th></tr>
        <xsl:for-each select="nested">
          <xsl:sort select="@shortname" data-type="text" order="ascending"/>
          <tr>
            <td>
              <xsl:if test="@deprecated='1'"><xsl:attribute name="class" select="'dep'"/></xsl:if>
              <xsl:apply-templates select="." mode="link-class">
                <xsl:with-param name="text" select="@shortname"/>
                <xsl:with-param name="strikedep" select="1"/>
              </xsl:apply-templates>
            </td>
            <td>
              <xsl:apply-templates select="." mode="summary-summary"/>
            </td>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="class | interface | package" mode="fieldsummary">
    <xsl:if test="field[not(@inherited='1')]">
      <table class="summary">
        <tr><th colspan="2">Field Summary</th></tr>
        <xsl:for-each select="field[not(@inherited='1')]">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
          <tr>
            <td class="type"><xsl:apply-templates select="." mode="summary-type"/></td>
            <td class="desc">
              <xsl:apply-templates select="." mode="summary-name"/>
              <xsl:apply-templates select="." mode="summary-summary"/>
            </td>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:if>

    <xsl:for-each select="field[@inherited='1']">
      <xsl:if test="position()=1 or not(preceding-sibling::*[1]/@source=@source)">
        <xsl:variable name="source" select="@source"/>
        <table class="inherited"><tr><th>Fields Inherited From <xsl:value-of select="@source"/></th></tr>
        <tr>
          <td>
            <xsl:for-each select="../field[@inherited='1' and @source=$source]">
              <xsl:sort select="@name" data-type="text" order="ascending"/>
              <a name="field:{@name}"></a>
              <xsl:apply-templates select="." mode="link-member">
                <xsl:with-param name="strikedep" select="1"/>
              </xsl:apply-templates>
              <xsl:if test="position() != last()">
                <xsl:text>, </xsl:text>
              </xsl:if>
            </xsl:for-each>
          </td>
        </tr>
        </table>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>
  
  <xsl:template match="class | interface | package" mode="constructorsummary">
    <xsl:if test="constructor[not(@inherited='1')]">
      <table class="summary">
        <tr><th colspan="2">Constructor Summary</th></tr>
        <xsl:for-each select="constructor[not(@inherited='1')]">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
          <tr>
            <td class="type"><xsl:apply-templates select="." mode="summary-type"/></td>
            <td class="desc">
              <xsl:apply-templates select="." mode="summary-signature"/>
              <xsl:apply-templates select="." mode="summary-summary"/>
            </td>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="class | interface | package" mode="methodsummary">
    <xsl:if test="method[not(@inherited='1')]">
      <table class="summary">
        <tr><th colspan="2">Method Summary</th></tr>
        <xsl:for-each select="method[not(@inherited='1')]">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
          <tr>
            <td class="type"><xsl:apply-templates select="." mode="summary-type"/></td>
            <td class="desc">
              <xsl:apply-templates select="." mode="summary-signature"/>
              <xsl:apply-templates select="." mode="summary-summary"/>
            </td>
          </tr>
        </xsl:for-each>
      </table>
    </xsl:if>

    <xsl:for-each select="method[@inherited='1']">
      <xsl:if test="position()=1 or not(preceding-sibling::*[1]/@source=@source)">
        <xsl:variable name="source" select="@source"/>
        <table class="inherited"><tr><th>Methods Inherited From <xsl:value-of select="@source"/></th></tr>
        <tr>
          <td>
          <xsl:for-each select="../method[@inherited='1' and @source=$source]">
            <xsl:sort select="@name" data-type="text" order="ascending"/>
            <a name="method:{@name}"></a>
            <xsl:apply-templates select="." mode="link-member">
              <xsl:with-param name="strikedep" select="1"/>
            </xsl:apply-templates>
            <xsl:if test="position() != last()">
              <xsl:text>, </xsl:text>
            </xsl:if>
          </xsl:for-each>
          </td>
        </tr>
        </table>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>
  
  <xsl:template match="class | interface | package" mode="fielddetail">
    <xsl:if test="field[not(@inherited='1')]">
      <table class="detail"><tr><th>Field Detail</th></tr></table>
      <xsl:for-each select="field[not(@inherited='1')]">
        <xsl:sort select="@name" data-type="text" order="ascending"/>
        <xsl:apply-templates select="." mode="detail"/>
        <xsl:if test="not(position()=last())"><hr/></xsl:if>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="class | interface | package" mode="constructordetail">
    <xsl:if test="constructor[not(@inherited='1')]">
      <table class="detail"><tr><th>Constructor Detail</th></tr></table>
      <xsl:for-each select="constructor[not(@inherited='1')]">
        <xsl:sort select="@name" data-type="text" order="ascending"/>
        <xsl:apply-templates select="." mode="detail"/>
        <xsl:if test="not(position()=last())"><hr/></xsl:if>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="class | interface | package" mode="methoddetail">
    <xsl:if test="method[not(@inherited='1')]">
      <table class="detail"><tr><th>Method Detail</th></tr></table>
      <xsl:for-each select="method[not(@inherited='1')]">
        <xsl:sort select="@name" data-type="text" order="ascending"/>
        <xsl:apply-templates select="." mode="detail"/>
        <xsl:if test="not(position()=last())"><hr/></xsl:if>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="field" mode="summary-type">
    <xsl:choose>
      <xsl:when test="@native"><xsl:text>native </xsl:text></xsl:when>
      <xsl:when test="@access and @access != 'public'"><xsl:value-of select="@access"/><xsl:text> </xsl:text></xsl:when>
    </xsl:choose>
    <xsl:if test="@static"><xsl:text>static </xsl:text></xsl:if>
    <xsl:apply-templates select="." mode="data-type">
      <xsl:with-param name="bracket" select="0"/>
    </xsl:apply-templates>
  </xsl:template>
  
  <xsl:template match="method | constructor" mode="summary-type">
    <xsl:choose>
      <xsl:when test="@native"><xsl:text>native </xsl:text></xsl:when>
      <xsl:when test="@access and @access != 'public'"><xsl:value-of select="@access"/><xsl:text> </xsl:text></xsl:when>
    </xsl:choose>
    <xsl:if test="@static"><xsl:text>static </xsl:text></xsl:if>
    <xsl:if test="@abstract"><xsl:text>abstract </xsl:text></xsl:if>
    <xsl:choose>
      <xsl:when test="return">
        <xsl:apply-templates select="return" mode="data-type">
          <xsl:with-param name="bracket" select="0"/>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="." mode="data-type">
          <xsl:with-param name="bracket" select="0"/>
        </xsl:apply-templates>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="*" mode="summary-name">
    <div>
      <xsl:if test="@deprecated='1'"><xsl:attribute name="class" select="'dep'"/></xsl:if>
      <a class="member">
        <xsl:attribute name="href">#<xsl:apply-templates select="." mode="anchor"/></xsl:attribute>
        <xsl:value-of select="@name"/>
      </a>
    </div>
  </xsl:template>
  
  <xsl:template match="*" mode="summary-signature">
    <div class="declaration">
      <span>
        <xsl:if test="@deprecated='1'"><xsl:attribute name="class" select="'dep'"/></xsl:if>
      <a class="member">
        <xsl:attribute name="href">#<xsl:apply-templates select="." mode="anchor"/></xsl:attribute>
        <xsl:value-of select="@name"/>
      </a>
      </span>
      <xsl:text>(</xsl:text>
      <xsl:for-each select="param">
        <xsl:value-of select="@name"/>
        <xsl:apply-templates select="." mode="data-type">
          <xsl:with-param name="bracket" select="0"/>
          <xsl:with-param name="colon" select="1"/>
          <xsl:with-param name="force" select="1"/>
        </xsl:apply-templates>
        <xsl:choose>
          <xsl:when test="not(position()=last())">, </xsl:when>
        </xsl:choose>
      </xsl:for-each>
      <xsl:text>)</xsl:text>
    </div>
  </xsl:template>
  
  <xsl:template match="*" mode="summary-summary">
    <div class="summarydesc">
      <xsl:choose>
        <xsl:when test="@deprecated">
          <xsl:apply-templates select="." mode="deprecated">
            <xsl:with-param name="inline" select="1"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:otherwise>
          <!-- Only use the first sentence of the description for the summary. -->
          <xsl:variable name="text"><xsl:value-of select="text"/></xsl:variable>
          <xsl:value-of
              select="fn:replace($text, '^([\s\S]*?)(\.[\s\r\n\W]|&lt;(ul|ol|pre|p|br|div)/?&gt;)[\s\S]*$', '$1.', 'i')"
              disable-output-escaping="yes"/>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </xsl:template>
  
  <xsl:template match="*" mode="data-type">
    <xsl:param name="cssclass" select="jsxdoc_paramtype"/>
    <xsl:param name="void" select="1"/>
    <xsl:param name="force" select="0"/>
    <xsl:param name="bracket" select="1"/>
    <xsl:param name="colon" select="0"/>
    <xsl:param name="append" select="''"/>

    <xsl:if test="@type or type or $void or $force">
      <span class="{$cssclass}">
      <xsl:if test="$colon=1"><xsl:value-of select="'&amp;nbsp;:&amp;nbsp;'" disable-output-escaping="yes"/></xsl:if>
      <xsl:if test="$bracket=1">{</xsl:if>
        <xsl:choose>
          <xsl:when test="@type">
            <xsl:value-of select="@type"/>
          </xsl:when>
          <xsl:when test="type">
            <xsl:apply-templates select="." mode="data-type-or"/>
          </xsl:when>
          <xsl:when test="$force=1">
            <span class="{$cssclass}">?</span>
          </xsl:when>
          <xsl:when test="$void=1">
            <span class="{$cssclass}">void</span>
          </xsl:when>
        </xsl:choose>
        <xsl:if test="$bracket=1">}</xsl:if>
      </span>
      <xsl:if test="$append!=''">
        <xsl:value-of select="$append" disable-output-escaping="yes"/>
      </xsl:if>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="anchor">
    <xsl:value-of select="@id"/>
  </xsl:template>
  
  <xsl:template match="field" mode="detail">
    <h3 class="detail"><a>
      <xsl:attribute name="name"><xsl:apply-templates select="." mode="anchor"/></xsl:attribute>
      <xsl:value-of select="@name"/></a></h3>
    
    <div class="declaration">
      <xsl:choose>
        <xsl:when test="@native"><xsl:text>native </xsl:text></xsl:when>
        <xsl:when test="@access and @access != 'public'"><xsl:value-of select="@access"/><xsl:text> </xsl:text></xsl:when>
      </xsl:choose>
      <xsl:if test="@static"><xsl:text>static </xsl:text></xsl:if>
      <xsl:if test="@final"><xsl:text>final </xsl:text></xsl:if>
      
      <xsl:apply-templates select="." mode="data-type">
        <xsl:with-param name="bracket" select="0"/>
        <xsl:with-param name="force" select="1"/>
      </xsl:apply-templates>
      <xsl:text> </xsl:text>
      <xsl:value-of select="@name"/>
    </div>
    <div class="detailcontent">
      <div class="detaildesc">
        <xsl:apply-templates select="." mode="deprecated"/>
        <xsl:apply-templates select="text" mode="textblock"/>
      </div>
    </div>
  </xsl:template>
  
  <xsl:template match="method | constructor" mode="detail">
    <h3 class="detail"><a>
      <xsl:attribute name="name"><xsl:apply-templates select="." mode="anchor"/></xsl:attribute>
      <xsl:value-of select="@name"/></a></h3>
    <div class="declaration">
      <xsl:choose>
        <xsl:when test="@native"><xsl:text>native </xsl:text></xsl:when>
        <xsl:when test="@access and @access != 'public'"><xsl:value-of select="@access"/><xsl:text> </xsl:text></xsl:when>
      </xsl:choose>
      <xsl:if test="@static"><xsl:text>static </xsl:text></xsl:if>
      <xsl:if test="@abstract"><xsl:text>abstract </xsl:text></xsl:if>
      <xsl:if test="@final"><xsl:text>final </xsl:text></xsl:if>
      <xsl:if test="@async"><xsl:text>asynchronous </xsl:text></xsl:if>
      <xsl:choose>
        <xsl:when test="return">
          <xsl:apply-templates select="return" mode="data-type">
            <xsl:with-param name="bracket" select="0"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="." mode="data-type">
            <xsl:with-param name="bracket" select="0"/>
          </xsl:apply-templates>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text> </xsl:text>
      <xsl:value-of select="@name"/>
      <xsl:text>(</xsl:text>
      <xsl:for-each select="param">
        <xsl:value-of select="@name"/>
        <xsl:apply-templates select="." mode="data-type">
          <xsl:with-param name="bracket" select="0"/>
          <xsl:with-param name="colon" select="1"/>
          <xsl:with-param name="force" select="1"/>
        </xsl:apply-templates>
        <xsl:choose>
          <xsl:when test="not(position()=last())">, </xsl:when>
        </xsl:choose>
      </xsl:for-each>
      <xsl:text>)</xsl:text>
    </div>
    <div class="detailcontent">
      <div class="detaildesc">
        <xsl:apply-templates select="." mode="deprecated"/>
        <xsl:apply-templates select="text" mode="textblock"/>
      </div>

      <xsl:if test="param">
        <h4 class="detail">Parameters:</h4>

        <div class="indent">
        <xsl:for-each select="param">
          <div class="param">
            <span class="param">
              <xsl:value-of select="@name"/>
            </span>
            <xsl:text> &#8211; </xsl:text>
            <span class="jsxdoc_paramdesc">
              <xsl:value-of select="@text" disable-output-escaping="yes"/>
            </span>
          </div>
        </xsl:for-each>
        </div>
      </xsl:if>

      <xsl:if test="throws">
        <h4 class="detail">Throws:</h4>
        <xsl:for-each select="throws">
          <div class="indent">
            <xsl:apply-templates select="." mode="data-type">
              <xsl:with-param name="append" select="' &amp;ndash; '"/>
              <xsl:with-param name="void" select="0"/>
            </xsl:apply-templates>
            <span class="jsxdoc_throwsdesc">
              <xsl:value-of select="@text" disable-output-escaping="yes"/>
            </span>
          </div>
        </xsl:for-each>
      </xsl:if>

      <xsl:if test="return">
        <h4 class="detail">Returns:</h4>
        <div class="indent">
          <xsl:value-of select="return/@text" disable-output-escaping="yes"/>
          <xsl:value-of select="'&amp;nbsp;'" disable-output-escaping="yes"/>
        </div>
      </xsl:if>

      <xsl:if test="overrides | overridesmix">
        <h4 class="detail">Overrides:</h4>
        <xsl:for-each select="overrides | overridesmix">
          <div class="indent">
          <xsl:variable name="sourceclassname" select="@source"/>
          <code><xsl:apply-templates select="." mode="link-member"/></code>
          <xsl:text> in </xsl:text>
          <code>
            <xsl:apply-templates select="../../superclass[@name=$sourceclassname] | ../../implements[@name=$sourceclassname]"
                mode="link-class"><xsl:with-param name="class" select="@source"/></xsl:apply-templates>
          </code>
          </div>
        </xsl:for-each>
      </xsl:if>
    
      <xsl:apply-templates select="." mode="since"/>
      <xsl:apply-templates select="." mode="seealso"/>    

    </div>
  </xsl:template>
  
  <xsl:template match="*" mode="data-type-or">
    <xsl:for-each select="type">
      <xsl:apply-templates select="." mode="data-type-node"/>
      <xsl:if test="position() != last()">
        <xsl:text> | </xsl:text>
      </xsl:if>
    </xsl:for-each>    
  </xsl:template>
  
  <xsl:template match="*" mode="data-type-node">
    <xsl:choose>
      <xsl:when test="@link='1'">
        <xsl:apply-templates select="." mode="link-class">
          <xsl:with-param name="jsxtext" select="@name"/>
          <xsl:with-param name="class">
            <xsl:choose>
              <xsl:when test="@class"><xsl:value-of select="@class"/></xsl:when>
              <xsl:otherwise><xsl:value-of select="@name"/></xsl:otherwise>
            </xsl:choose>
          </xsl:with-param>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="@name"/>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:if test="type | typeor">
      <xsl:text>&#60;</xsl:text>
      <xsl:for-each select="type | typeor">
        <xsl:choose>
          <xsl:when test="local-name()='type'"><xsl:apply-templates select="." mode="data-type-node"/></xsl:when>
          <xsl:otherwise><xsl:apply-templates select="." mode="data-type-or"/></xsl:otherwise>
        </xsl:choose>
        <xsl:if test="position() != last()">
          <xsl:text>, </xsl:text>
        </xsl:if>
      </xsl:for-each>      
      <xsl:text>&#62;</xsl:text>
    </xsl:if>
    <xsl:if test="@varargs='1'">
      <xsl:text>...</xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match="text" mode="textblock">
    <xsl:choose>
      <xsl:when test="@esc='1'">
        <xsl:value-of disable-output-escaping="yes" select="."/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="* | text()"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="* | @* " mode="textblock">
    <xsl:value-of disable-output-escaping="yes" select="."/>
  </xsl:template>

</xsl:stylesheet>
