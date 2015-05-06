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
        <xsl:sort select="@jsxtext"/>
        <tr>
          <td class="name"><a href="#{@jsxid}"><xsl:value-of select="@jsxtext"/></a></td>
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
    </table>

    <hr/>

    <!-- Expanded -->
    <xsl:for-each select="record">
      <div class="expanded">
        <h3><a name="{@jsxid}"><xsl:value-of select="@jsxtext"/></a> <span class="eventid"><xsl:value-of select="@jsxid"/></span></h3>

        <xsl:apply-templates select="." mode="deprecated"/>

        <div class="description"><xsl:value-of select="@jsxtip" disable-output-escaping="yes"/></div>
        <xsl:if test="@vetoable=1">
          <div class="cancel">Cancelable: Evaluate to <code>false</code> to cancel event.</div>
        </xsl:if>

        <!-- context parameters -->
        <div class="params">
          <h4>Context Variables</h4>
          <xsl:for-each select="record[not(@vartype) or not(@vartype='return')]">
            <div class="param">
              <xsl:apply-templates select="." mode="paramname"/>
              <xsl:apply-templates select="." mode="deprecated-inline"/>
              <xsl:value-of select="@jsxtext" disable-output-escaping="yes"/>
            </div>
          </xsl:for-each>
        </div>

        <xsl:if test="record[@vartype='return' or @vartype='inout']">
          <div class="params">
            <h4>Return Fields</h4>
            <xsl:for-each select="record[@vartype='return' or @vartype='inout']">
              <div class="param">
                <xsl:apply-templates select="." mode="paramname"/>
                <xsl:apply-templates select="." mode="deprecated-inline"/>
                <xsl:choose>
                  <xsl:when test="@jsxreturntext">
                    <xsl:value-of select="@jsxreturntext" disable-output-escaping="yes"/>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="@jsxtext" disable-output-escaping="yes"/>
                  </xsl:otherwise>
                </xsl:choose>
              </div>
            </xsl:for-each>
          </div>
        </xsl:if>
      </div>

      <hr/>

    </xsl:for-each>
  </xsl:template>

  <xsl:template match="record" mode="paramname">
    <strong><xsl:value-of select="@jsxid"/></strong>
    <xsl:apply-templates mode="type" select="@type"/>
    <xsl:text> - </xsl:text>
  </xsl:template>

</xsl:stylesheet>
