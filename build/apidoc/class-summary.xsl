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

  <xsl:template match="/*">
    <html>
      <head>
        <title><xsl:value-of select="@name"/> Summary</title>
        <xsl:apply-templates select="." mode="styles"/>
      </head>
      <body>

        <xsl:apply-templates select="." mode="header"/>
        <xsl:apply-templates select="." mode="main-content"/>

        <xsl:apply-templates select="." mode="footer"/>
      </body>
    </html>
  </xsl:template>


  <xsl:template match="class | interface" mode="main-content">
    <a name="{@id}">
    <h4 class="package-name">
      <xsl:apply-templates select="." mode="link-class">
        <xsl:with-param name="class" select="@package"/>
      </xsl:apply-templates>
    </h4>
    <h1>
      <xsl:value-of select="local-name()"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="@shortname"/>
    </h1>
    </a>
    
    <xsl:choose>
      <xsl:when test="superclass">
        <xsl:apply-templates select="superclass[1]" mode="superclass"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="." mode="superclass"/>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:if test="implements">
      <h3 class="relatives">All Implemented Interfaces:</h3>
      <div class="relatives">
        <xsl:for-each select="implements">
          <xsl:apply-templates select="." mode="link-class"/>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>
    <xsl:if test="subclass">
      <h3 class="relatives">Direct Known Subclasses:</h3>
      <div class="relatives">
        <xsl:for-each select="subclass">
          <xsl:apply-templates select="." mode="link-class"/>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>
    <xsl:if test="implementor">
      <h3 class="relatives">All Known Implementing Classes:</h3>
      <div class="relatives">
        <xsl:for-each select="implementor">
          <xsl:apply-templates select="." mode="link-class"/>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>

    <hr/>
    
    <div class="declaration-class">
    <xsl:if test="@native"><xsl:text>native </xsl:text></xsl:if>
    <xsl:if test="@abstract"><xsl:text>abstract </xsl:text></xsl:if>
    <xsl:if test="@final"><xsl:text>final </xsl:text></xsl:if>
    <xsl:value-of select="local-name()"/><xsl:text> </xsl:text><xsl:value-of select="@shortname"/><br/>
    
    <xsl:if test="superclass[@direct='1']">
      <xsl:text>extends </xsl:text><xsl:apply-templates select="superclass[@direct='1']" mode="link-class"/>
      <br/>
    </xsl:if>
    <xsl:if test="interface[@direct='1']">
      <xsl:text>implements </xsl:text>
        <xsl:for-each select="interface[@direct='1']">
          <xsl:apply-templates select="." mode="link-class"/>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
    </xsl:if>
    </div>
    
    <div class="detaildesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:choose>
        <xsl:when test="text and not(text='')">
          <xsl:apply-templates select="text" mode="textblock"/>
        </xsl:when>
        <xsl:when test="not(@deprecated)">
          <span class="none">No description provided.</span>
        </xsl:when>
      </xsl:choose>
    </div>
    
    <xsl:apply-templates select="." mode="since"/>
    <xsl:apply-templates select="." mode="version"/>
    <xsl:apply-templates select="." mode="author"/>
    <xsl:apply-templates select="." mode="seealso"/>
    
    <hr/>

    <xsl:apply-templates select="." mode="classsummary"/>
    <xsl:apply-templates select="." mode="fieldsummary"/>
    <xsl:apply-templates select="." mode="constructorsummary"/>
    <xsl:apply-templates select="." mode="methodsummary"/>

    <xsl:apply-templates select="." mode="fielddetail"/>
    <xsl:apply-templates select="." mode="constructordetail"/>
    <xsl:apply-templates select="." mode="methoddetail"/>
    
  </xsl:template>

  <xsl:template match="*" mode="superclass">
    <xsl:param name="indent" select="''"/>
    <div class="inheritance">
      <span class="arrow">
        <xsl:value-of select="$indent"/>
      </span>
      <xsl:apply-templates select="." mode="link-class"/>
    </div>
    <xsl:variable name="nextindent">
      <xsl:choose>
        <xsl:when test="$indent=''">
          <xsl:value-of select="'-&gt;'"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="concat('&#160;&#160;', $indent)"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="local-name()='superclass'">
      <xsl:choose>
        <xsl:when test="following-sibling::superclass">
          <xsl:apply-templates select="following-sibling::superclass[1]" mode="superclass">
            <xsl:with-param name="indent" select="$nextindent"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="../." mode="superclass">
            <xsl:with-param name="indent" select="$nextindent"/>
          </xsl:apply-templates>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
