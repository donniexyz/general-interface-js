<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >

  <xsl:import href="common.xsl"/>
  <xsl:variable name="relpath" select="''"/>
  
  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes"/>

  <xsl:template match="/api">
    <html>
      <head>
        <title>Deprecated API</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>

        <xsl:apply-templates select="." mode="header"/>
        <h1>Deprecated API</h1>

        <ul>
          <li>
            <a href="#classes">Deprecated Classes</a>
          </li>
          <li>
            <a href="#fields">Deprecated Fields</a>
          </li>
          <li>
            <a href="#methods">Deprecated Methods</a>
          </li>
        </ul>

        <a name="classes"></a>
        <table class="deprecated">
          <tr>
            <th>Deprecated Classes</th>
          </tr>
          <xsl:apply-templates select="(//class | //package | //interface)[@deprecated='1']" mode="item">
            <xsl:sort select="@name" data-type="text" order="ascending"/>
          </xsl:apply-templates>
        </table>

        <a name="fields"></a>
        <table class="deprecated">
          <tr>
            <th>Deprecated Fields</th>
          </tr>
          <xsl:apply-templates select="//field[@deprecated='1' and not(@inherited='1')]" mode="item">
            <xsl:sort select="../@name" data-type="text" order="ascending"/>
            <xsl:sort select="@name" data-type="text" order="ascending"/>
          </xsl:apply-templates>
        </table>

        <a name="methods"></a>
        <table class="deprecated">
          <tr>
            <th>Deprecated Methods</th>
          </tr>
          <xsl:apply-templates select="//method[@deprecated='1' and not(@inherited='1')]" mode="item">
            <xsl:sort select="../@name" data-type="text" order="ascending"/>
            <xsl:sort select="@name" data-type="text" order="ascending"/>
          </xsl:apply-templates>
        </table>

        <xsl:apply-templates select="." mode="footer"/>

      </body>
    </html>
  </xsl:template>

  <xsl:template match="class | interface | package" mode="item">
    <tr>
      <td>
        <div class="name">
          <xsl:apply-templates select="." mode="link-class"/>
        </div>
        <div class="desc">
          <xsl:value-of select="deprecated" disable-output-escaping="yes"/>
        </div>
      </td>
    </tr>
  </xsl:template>

  <xsl:template match="field | method | constructor" mode="item">
    <tr>
      <td>
        <div class="name">
          <xsl:apply-templates select="." mode="link-member">
            <xsl:with-param name="class" select="../@name"/>
            <xsl:with-param name="anchor" select="@id"/>
            <xsl:with-param name="text">
              <xsl:value-of select="../@name"/>.<xsl:value-of select="@name"/>
              <xsl:if test="local-name()='method'">()</xsl:if>
            </xsl:with-param>
          </xsl:apply-templates>
        </div>
        <div class="desc">
          <xsl:value-of select="deprecated" disable-output-escaping="yes"/>
          <xsl:value-of disable-output-escaping="yes">&amp;nbsp;</xsl:value-of>
        </div>
      </td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
