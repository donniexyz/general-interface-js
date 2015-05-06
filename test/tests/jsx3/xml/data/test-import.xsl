<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:param name="p2"></xsl:param>

  <xsl:template match="*" mode="tag">
    <tag><xsl:value-of select="$p2"/></tag>
  </xsl:template>

</xsl:stylesheet>
