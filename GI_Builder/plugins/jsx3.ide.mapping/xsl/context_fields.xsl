<?xml version="1.0" ?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
   <div style="width:540px;">
    <xsl:for-each select="//record">
      <div style="font-weight:bold;font-size:10px;color:#1F1282;"><xsl:value-of select="@jsxtext"/> <span style="font-weight:normal;font-size:9px;"> (Direction: <xsl:value-of select="@flow"/>)*</span></div>
      <div style="margin-bottom:6px;border-bottom:dashed 1px #c8c8c8;font-size:10px;"><xsl:value-of select="@description"/></div>
    </xsl:for-each>
    <div style="margin-top:6px;font-size:9px;">*contextual variables listed as <b>inputs</b> are available when creating input messages. <b>output</b>s are available when processing output messages</div>
   </div>
  </xsl:template>
</xsl:stylesheet>
