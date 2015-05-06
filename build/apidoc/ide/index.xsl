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
      omit-xml-declaration="yes"/>
  
  <xsl:param name="title">Documentation</xsl:param>

  <xsl:template match="/">

<HTML>
<HEAD>
  <TITLE>@build.gi.name.product@ @build.gi.version.name@ &#8211; <xsl:value-of select="$title"/></TITLE>
  <SCRIPT type="text/javascript">
    var targetPage = "" + window.location.search;
    if (targetPage != "" &amp;&amp; targetPage != "undefined")
      targetPage = targetPage.substring(1);

    function loadFrames() {
      if (targetPage != "" &amp;&amp; targetPage != "undefined")
        top.classFrame.location = top.targetPage;
    }
  </SCRIPT>
</HEAD>
<FRAMESET cols="20%,80%" title="" onLoad="top.loadFrames()">
  <FRAME src="allclasses-frame.html" name="packageFrame"
         title="All classes."/>
  <FRAME src="about:blank" name="classFrame" title="Class descriptions"
         scrolling="yes"/>
  <NOFRAMES>
    <H2>Frame Alert</H2>

    <P>
      This document is designed to be viewed using the frames feature. If you see this message, you are using a
      non-frame-capable web client.
      <BR/>
      Link to<A HREF="overview-summary.html">Non-frame version.</A>
    </P>
  </NOFRAMES>
</FRAMESET>
</HTML>

  </xsl:template>
</xsl:stylesheet>
