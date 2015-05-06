<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<xsl:stylesheet version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:fn="http://www.w3.org/2005/xpath-functions"
    >

  <xsl:param name="title">TITLE</xsl:param>

  <xsl:output
      method="html"
      encoding="UTF-8" indent="no"
      omit-xml-declaration="yes"/>

  <xsl:template match="/">
    <html>
    <head>
      <title><xsl:value-of disable-output-escaping="yes" select="$title"/> - API Documentation</title>
      <script type="text/javascript">
        var targetPage = "" + window.location.search;
        if (targetPage != "" &amp;&amp; targetPage != "undefined")
          targetPage = targetPage.substring(1).replace('!', "#");

        function loadFrames() {
          if (targetPage != "" &amp;&amp; targetPage != "undefined")
            top.classFrame.location = top.targetPage;
        }
      </script>
    </head>
    <frameset cols="20%,80%" title="" onLoad="top.loadFrames();">
      <frameset rows="30%,70%" title="" onLoad="top.loadFrames();">
        <frame src="overview-frame.html" name="packageListFrame" title="All Packages"/>
        <frame src="allclasses-frame.html" name="packageFrame"
               title="All classes and interfaces (except non-static nested types)"/>
      </frameset>
      <frame src="overview-summary.html" name="classFrame" title="Package, class and interface descriptions"
             scrolling="yes"/>
      <noframes>
        <h2>Frame Alert</h2>

        <p>
          This document is designed to be viewed using the frames feature. If you see this message, you are using a
          non-frame-capable web client.
          <br/>
          Link to <a href="overview-summary.html">Non-frame version.</a>
        </p>
      </noframes>
    </frameset>
    </html>
  </xsl:template>
</xsl:stylesheet>
    