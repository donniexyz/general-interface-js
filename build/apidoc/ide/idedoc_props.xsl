<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >

  <xsl:import href="common.xsl"/>

  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes"/>

  <xsl:param name="classname"/>
  <xsl:param name="apidocpath"/>

  <xsl:template match="/*">
    <html>
      <head>
        <title><xsl:value-of select="$classname"/> Model Events</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>

        <xsl:apply-templates select="." mode="header"/>
        <xsl:apply-templates select="." mode="main-content"/>
        <xsl:apply-templates select="." mode="footer"/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="*" mode="main-content">
    <!-- Summary -->
    <table class="summary">
      <xsl:for-each select="record">
        <xsl:choose>
          <xsl:when test="@group=1">
            <tr>
              <th class="section" colspan="2"><xsl:value-of select="@jsxtext"/></th>
            </tr>
            <xsl:for-each select="record">
              <tr>
                <td class="prop_nested"><a href="#{@jsxid}"><xsl:value-of select="@jsxtext"/></a></td>
                <td>
                  <xsl:choose>
                    <xsl:when test="@deprecated">
                      <xsl:apply-templates select="." mode="deprecated-inline"/>
                    </xsl:when>
                    <xsl:otherwise>
                      <xsl:apply-templates select="@jsxtip" mode="first-sentence"/>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <tr>
              <td class="prop_top"><a href="#{@jsxid}"><xsl:value-of select="@jsxtext"/></a></td>
              <td>
                <xsl:choose>
                  <xsl:when test="@deprecated">
                    <xsl:apply-templates select="." mode="deprecated-inline"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:apply-templates select="@jsxtip" mode="first-sentence"/>
                  </xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </table>

    <hr/>

    <!-- Expanded -->
    <xsl:for-each select="//record[not(@group=1)]">
      <div class="expanded">
        <h3><a name="{@jsxid}"><xsl:value-of select="@jsxtext"/></a></h3>

        <xsl:apply-templates select="." mode="deprecated"/>
        
        <div class="description">
          <xsl:if test="@uneditable">
            <span class="readonly">Read-Only. </span>
          </xsl:if>

          <xsl:choose>
            <xsl:when test="@jsxtip and not(@jsxtip='')">
              <xsl:value-of select="@jsxtip" disable-output-escaping="yes"/>
            </xsl:when>
            <xsl:otherwise>
              <i>No description provided.</i>
            </xsl:otherwise>
          </xsl:choose>
        </div>

        <xsl:if test="@docdefault">
          <div class="propdoc"><strong>Default Value: </strong> <xsl:value-of select="@docdefault" disable-output-escaping="yes"/></div>
        </xsl:if>

        <xsl:if test="@docgetter">
         <div class="propdoc"><strong>Getter: </strong> <code><xsl:apply-templates mode="methodlink" select="."><xsl:with-param
             name="method" select="@docgetter"/></xsl:apply-templates></code></div>
        </xsl:if>

        <xsl:if test="@docsetter">
         <div class="propdoc"><strong>Setter: </strong> <code><xsl:apply-templates mode="methodlink" select="."><xsl:with-param
             name="method" select="@docsetter"/></xsl:apply-templates></code></div>
        </xsl:if>

        <xsl:if test="not(@docnoprop)">
          <div class="propdoc"><strong>Property: </strong> <code><xsl:value-of select="@jsxid"/></code></div>
        </xsl:if>

        <xsl:if test="enum">
          <div class="enum">
            <strong>Allowed Values: </strong>
            <ul>
              <xsl:for-each select="enum">
                <li>
                <xsl:value-of select="@jsxtext"/>
                <xsl:text> (</xsl:text><code><xsl:apply-templates mode="fieldlink" select="."><xsl:with-param
             name="name" select="@jsxid"/></xsl:apply-templates></code><xsl:text>)</xsl:text>
                </li>
              </xsl:for-each>
            </ul>
          </div>
        </xsl:if>
      </div>

      <hr/>
    </xsl:for-each>
  </xsl:template>

</xsl:stylesheet>
