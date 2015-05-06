<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:import href="test-import.xsl"/>

  <xsl:param name="p1"></xsl:param>

  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:template match="/*">
    <wrap>
      <xsl:attribute name="a"><xsl:value-of select="$p1"/></xsl:attribute>
      <xsl:apply-templates select="." mode="tag"/>
    </wrap>
  </xsl:template>

</xsl:stylesheet>
