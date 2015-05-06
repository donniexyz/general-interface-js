<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt">

  <xsl:output method="xml" omit-xml-declaration="yes"/>
  <xsl:param name="membertype">class</xsl:param>
  <xsl:param name="memberid"></xsl:param>
  <xsl:param name="showdeprecated">1</xsl:param>

  <xsl:template match="/">
    <div class="jsxdoc">
    <xsl:choose>
      <xsl:when test="$membertype='class'">
        <xsl:apply-templates select="/class | /package | /interface" mode="class"/>
      </xsl:when>
      <xsl:when test="$membertype='constructor'">
        <xsl:apply-templates select="/*/constructor" mode="constructor"/>
      </xsl:when>
      <xsl:when test="$membertype='method'">
        <xsl:apply-templates select="/*/method[@id=$memberid]" mode="method"/>
      </xsl:when>
      <xsl:when test="$membertype='field'">
        <xsl:apply-templates select="/*/field[@id=$memberid]" mode="field"/>
      </xsl:when>
    </xsl:choose>
    </div>
  </xsl:template>

  <!-- main template for Class content -->
  <xsl:template match="class | interface | package" mode="class">
    <div class="jsxdoc_classhead">
      <xsl:choose>
        <xsl:when test="local-name()='package'">
          <h1><xsl:value-of select="local-name()"/><xsl:text> </xsl:text><xsl:value-of select="@name"/></h1>
        </xsl:when>
        <xsl:otherwise>
          <h2><xsl:value-of select="@package"/></h2>
          <h1><xsl:value-of select="local-name()"/><xsl:text> </xsl:text><xsl:value-of select="@shortname"/></h1>
        </xsl:otherwise>
      </xsl:choose>
    
    <xsl:if test="not(local-name()='package')">
<!--    <xsl:variable name="superindent" select="''"/> -->
<!--    <h3 class="jsxdoc">Inheritance:</h3> -->
    <xsl:choose>
      <xsl:when test="superclass">
        <xsl:apply-templates select="superclass[1]" mode="superclass"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="." mode="superclass"/>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:if test="implements">
      <h3 class="jsxdoc">All Implemented Interfaces:</h3>
      <div class="indent">
      <xsl:for-each select="implements">
        <xsl:apply-templates select="." mode="implements"/>
        <xsl:if test="position() != last()">
          <xsl:text>, </xsl:text>
        </xsl:if>
      </xsl:for-each>
      </div>
    </xsl:if>
    <xsl:if test="subclass">
      <h3 class="jsxdoc">Direct Known Subclasses:</h3>
      <div class="indent">
      <xsl:for-each select="subclass">
        <xsl:apply-templates select="." mode="subclass"/>
        <xsl:if test="position() != last()">
          <xsl:text>, </xsl:text>
        </xsl:if>
      </xsl:for-each>
      </div>
    </xsl:if>
    <xsl:if test="implementor">
      <h3 class="jsxdoc">All Known Implementing Classes:</h3>
      <div class="indent">
      <xsl:for-each select="implementor">
        <xsl:apply-templates select="." mode="subclass"/>
        <xsl:if test="position() != last()">
          <xsl:text>, </xsl:text>
        </xsl:if>
      </xsl:for-each>
      </div>
    </xsl:if>
    </xsl:if>
    </div>

    <hr/>
    
    <xsl:if test="not(local-name()='package')">
    <div class="jsxdoc_classspec">
    <xsl:if test="@native"><xsl:text>native </xsl:text></xsl:if>
    <xsl:if test="@abstract"><xsl:text>abstract </xsl:text></xsl:if>
    <xsl:if test="@final"><xsl:text>final </xsl:text></xsl:if>
    <xsl:value-of select="local-name()"/><xsl:text> </xsl:text><xsl:value-of select="@shortname"/><br/>
    
    <xsl:if test="superclass[@direct='1']">
      <xsl:text>extends </xsl:text><xsl:apply-templates select="superclass[@direct='1']" mode="classlink"/>
      <br/>
    </xsl:if>
    <xsl:if test="implements[@direct='1']">
      <xsl:text>implements </xsl:text>
        <xsl:for-each select="implements[@direct='1']">
          <xsl:apply-templates select="." mode="classlink"/>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
    </xsl:if>
    </div>
    </xsl:if>
    
    <div class="jsxdoc_classdesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:choose>
        <xsl:when test="text and not(text='')">
          <xsl:apply-templates select="text" mode="disable-output-escp"/>
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

    <xsl:if test="nested[$showdeprecated=1 or not(@deprecated='1')]">
      <xsl:choose>
        <xsl:when test="local-name()='package'">
          <h3 class="jsxdoc">Classes:</h3>
        </xsl:when>
        <xsl:otherwise>
          <h3 class="jsxdoc">Nested Classes:</h3>
        </xsl:otherwise>
      </xsl:choose>
      
      <table class="jsxdoc_nested">
        <xsl:for-each select="nested[$showdeprecated=1 or not(@deprecated='1')]">
          <xsl:sort select="@shortname" data-type="text" order="ascending"/>
          <tr>
            <xsl:if test="position() mod 2 = 1">
              <xsl:attribute name="class">odd</xsl:attribute>
            </xsl:if>
            <td class="name">
              <xsl:apply-templates select="." mode="classlink">
                <xsl:with-param name="displayname" select="@shortname"/>
              </xsl:apply-templates>
            </td>
            <td class="desc"><xsl:apply-templates select="text" mode="disable-output-escp"/></td>
          </tr>
        </xsl:for-each>
      </table>

      <hr/>
    </xsl:if>

    <xsl:if test="field[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
      <h3 class="jsxdoc">Static Fields:</h3>
      <div class="jsxdoc_members">
        <xsl:for-each select="field[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
          <xsl:apply-templates select="." mode="fieldlink">
            <xsl:with-param name="strikedep" select="1"/>
          </xsl:apply-templates>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>

    <xsl:if test="field[not(@static) and not(@inherited) and ($showdeprecated=1 or not(@deprecated='1'))]">
      <h3 class="jsxdoc">Fields:</h3>
      <div class="jsxdoc_members">
        <xsl:for-each select="field[not(@static) and not(@inherited) and ($showdeprecated=1 or not(@deprecated='1'))]">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
          <xsl:apply-templates select="." mode="fieldlink">
            <xsl:with-param name="strikedep" select="1"/>
          </xsl:apply-templates>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>

    <xsl:if test="method[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
      <h3 class="jsxdoc">Static Methods:</h3>
      <div class="jsxdoc_members">
        <xsl:for-each select="method[@static='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
          <xsl:apply-templates select="." mode="methodlink">
            <xsl:with-param name="strikedep" select="1"/>
          </xsl:apply-templates>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>

    <xsl:if test="method[not(@static) and not(@inherited) and ($showdeprecated=1 or not(@deprecated='1'))]">
      <h3 class="jsxdoc">Methods:</h3>
      <div class="jsxdoc_members">
        <xsl:for-each select="method[not(@static) and not(@inherited) and ($showdeprecated=1 or not(@deprecated='1'))]">
          <xsl:sort select="@name" data-type="text" order="ascending"/>
          <xsl:apply-templates select="." mode="methodlink">
            <xsl:with-param name="strikedep" select="1"/>
          </xsl:apply-templates>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>

    <xsl:for-each select="field[@inherited='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
      <xsl:if test="position()=1 or not(preceding-sibling::*[1]/@source=@source)">
        <xsl:variable name="source" select="@source"/>
        <h3 class="jsxdoc">Fields Inherited From <xsl:value-of select="@source"/>:</h3>
        <div class="jsxdoc_members">
          <xsl:for-each select="../field[@inherited='1' and @source=$source and ($showdeprecated=1 or not(@deprecated='1'))]">
            <xsl:sort select="@name" data-type="text" order="ascending"/>
            <xsl:apply-templates select="." mode="fieldlink">
              <xsl:with-param name="strikedep" select="1"/>
            </xsl:apply-templates>
            <xsl:if test="position() != last()">
              <xsl:text>, </xsl:text>
            </xsl:if>
          </xsl:for-each>
        </div>
      </xsl:if>
    </xsl:for-each>
    
    <xsl:for-each select="method[@inherited='1' and ($showdeprecated=1 or not(@deprecated='1'))]">
      <xsl:if test="position()=1 or not(preceding-sibling::*[1]/@source=@source)">
        <xsl:variable name="source" select="@source"/>
        <h3 class="jsxdoc">Methods Inherited From <xsl:value-of select="@source"/>:</h3>
        <div class="jsxdoc_members">
          <xsl:for-each select="../method[@inherited='1' and @source=$source and ($showdeprecated=1 or not(@deprecated='1'))]">
            <xsl:sort select="@name" data-type="text" order="ascending"/>
            <xsl:apply-templates select="." mode="methodlink">
              <xsl:with-param name="strikedep" select="1"/>
            </xsl:apply-templates>
            <xsl:if test="position() != last()">
              <xsl:text>, </xsl:text>
            </xsl:if>
          </xsl:for-each>
        </div>
      </xsl:if>
    </xsl:for-each>

  </xsl:template>

  <!-- main template for Constructor content -->
  <xsl:template match="constructor" mode="constructor">
    <xsl:apply-templates select="." mode="method"/>
  </xsl:template>

  <!-- main template for Method content -->
  <xsl:template match="constructor | method" mode="method">
    <div class="jsxdoc_methodhead">
      <h2>
        <xsl:apply-templates select="../." mode="classlink">
          <xsl:with-param name="linkalways" select="1"/>
        </xsl:apply-templates>
      </h2>
      <h1>
        <xsl:value-of select="@name"/><xsl:text>()</xsl:text>
      </h1>
    </div>
    
    <hr/>
    
    <div class="jsxdoc_methoddecl">
      <!-- these three modifiers are mutually exclusive -->
      <xsl:choose>
        <xsl:when test="@native"><xsl:text>native </xsl:text></xsl:when>
        <xsl:when test="@access and @access != 'public'"><xsl:value-of select="@access"/><xsl:text> </xsl:text></xsl:when>
      </xsl:choose>
      <xsl:if test="@static"><xsl:text>static </xsl:text></xsl:if>
      <xsl:if test="@abstract"><xsl:text>abstract </xsl:text></xsl:if>
      <xsl:if test="@final"><xsl:text>final </xsl:text></xsl:if>
      <xsl:text>method </xsl:text>
      <xsl:value-of select="@name"/>(<xsl:for-each select="param">
        <span>
          <xsl:choose>
            <xsl:when test="@required='1'">
              <xsl:attribute name="class">required</xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="style">optional</xsl:attribute>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:value-of select="@name"/>
          <xsl:choose>
            <xsl:when test="not(position()=last())">, </xsl:when>
          </xsl:choose>
        </span>
      </xsl:for-each>)
    </div>

    <div class="jsxdoc_methoddesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:apply-templates select="text" mode="disable-output-escp"/>
    </div>

    <xsl:if test="param">
      <h3 class="jsxdoc">Parameters:</h3>

      <xsl:for-each select="param">
        <div class="jsxdoc_param">
          <span class="jsxdoc_paramname">
            <xsl:value-of select="@name"/>
          </span>
          <xsl:text> </xsl:text>
          <xsl:apply-templates select="." mode="datatype">
            <xsl:with-param name="cssclass" select="jsxdoc_paramtype"/>
          </xsl:apply-templates>
          <xsl:text> &#8211; </xsl:text>
          <span class="jsxdoc_paramdesc">
            <xsl:apply-templates select="@text" mode="disable-output-escp"/>
          </span>
        </div>
      </xsl:for-each>
    </xsl:if>

    <xsl:if test="throws">
      <h3 class="jsxdoc">Throws:</h3>
      <xsl:for-each select="throws">
        <div class="jsxdoc_throws">
          <xsl:apply-templates select="." mode="datatype">
            <xsl:with-param name="cssclass" select="jsxdoc_throwtype"/>
            <xsl:with-param name="append"><xsl:text> </xsl:text>&#8211;<xsl:text> </xsl:text></xsl:with-param>
          </xsl:apply-templates>
          <span class="jsxdoc_throwsdesc">
            <xsl:apply-templates select="@text" mode="disable-output-escp"/>
          </span>
        </div>
      </xsl:for-each>
    </xsl:if>

    <xsl:if test="return">
      <h3 class="jsxdoc">Returns:</h3>
      <div class="jsxdoc_return">
        <xsl:apply-templates select="return" mode="datatype">
          <xsl:with-param name="cssclass" select="jsxdoc_returntype"/>
          <xsl:with-param name="append" select="' &amp;ndash; '"/>
        </xsl:apply-templates>
        <span class="jsxdoc_returndesc">
          <xsl:apply-templates select="return/@text" mode="disable-output-escp"/>
        </span>
      </div>
    </xsl:if>

    <xsl:if test="overrides | overridesmix">
      <h3 class="jsxdoc">Overrides:</h3>
      <xsl:for-each select="overrides | overridesmix">
        <div class="jsxdoc_overrides">
        <xsl:variable name="sourceclassname" select="@source"/>
        <code><xsl:apply-templates select="." mode="methodlink"/></code>
        <xsl:text> in </xsl:text>
        <code>
          <xsl:choose>
        <xsl:when test="local-name()='overridesmix'">
          <xsl:apply-templates select="../../implements[@name=$sourceclassname] | ../../superclass[@name=$sourceclassname]" mode="classlink"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="../../superclass[@name=$sourceclassname]" mode="classlink"/>
        </xsl:otherwise>
      </xsl:choose>
          </code>
        </div>
      </xsl:for-each>
    </xsl:if>
    
    <xsl:apply-templates select="." mode="since"/>
    <xsl:apply-templates select="." mode="seealso"/>    

  </xsl:template>

  <!-- main template for Field content -->
  <xsl:template match="field" mode="field">
    <div class="jsxdoc_fieldhead">
      <h2>
        <xsl:apply-templates select="../." mode="classlink">
          <xsl:with-param name="linkalways">
            <xsl:if test="@class=../@name">1</xsl:if>
          </xsl:with-param>
          <xsl:with-param name="classname" select="@class"/>
        </xsl:apply-templates>
      </h2>
      <h1>
        <xsl:value-of select="@name"/>
      </h1>
    </div>
    
    <hr/>

    <div class="jsxdoc_fieldspec">
    <xsl:if test="@native"><xsl:text>native </xsl:text></xsl:if>
    <xsl:if test="@static"><xsl:text>static </xsl:text></xsl:if>
    <xsl:if test="@final"><xsl:text>final </xsl:text></xsl:if>
    <xsl:text>field </xsl:text>
    <xsl:apply-templates select="." mode="datatype">
      <xsl:with-param name="cssclass" select="jsxdoc_returntype"/>
      <xsl:with-param name="append" select="' '"/>
    </xsl:apply-templates>
    <xsl:value-of select="@name"/>
    </div>
    
    <div class="jsxdoc_fielddesc">
      <xsl:apply-templates select="." mode="deprecated"/>
      <xsl:apply-templates select="text" mode="disable-output-escp"/>
    </div>

    <xsl:apply-templates select="." mode="since"/>
    <xsl:apply-templates select="." mode="seealso"/>    

  </xsl:template>

  <!-- sub templates -->

  <xsl:template match="class | interface | superclass" mode="superclass">
    <xsl:param name="indent" select="''"/>
    <div class="jsxdoc_super">
      <span class="arrow"><xsl:value-of select="$indent"/></span>
      <xsl:apply-templates select="." mode="classlink"/>
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

  <xsl:template match="implements" mode="implements">
    <span class="jsxdoc_interface">
      <xsl:apply-templates select="." mode="classlink"/>
    </span>
  </xsl:template>

  <xsl:template match="*" mode="subclass">
    <span class="jsxdoc_subclass">
      <xsl:apply-templates select="." mode="classlink"/>
    </span>
  </xsl:template>

  <xsl:template match="*" mode="classlink">
    <xsl:param name="linkalways" select="0"/>
    <xsl:param name="classname" select="@name"/>
    <xsl:param name="displayname" select="$classname"/>
    <xsl:choose>
      <xsl:when test="@loaded='1' or $linkalways=1">
        <span onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doClassLink('{$classname}');">
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="@deprecated='1'"><xsl:value-of select="'jsxdoc_link memberdep'"/></xsl:when>
              <xsl:otherwise><xsl:value-of select="'jsxdoc_link'"/></xsl:otherwise>
            </xsl:choose> 
          </xsl:attribute>
          <xsl:value-of select="$displayname"/>
        </span>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$displayname"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*" mode="fieldlink">
    <xsl:param name="strikedep" select="0"/>
    <span onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doMemberLink('{@id}');">
      <xsl:attribute name="class">
        <xsl:choose>
          <xsl:when test="@deprecated='1' and $strikedep='1'"><xsl:value-of select="'jsxdoc_link memberdep'"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="'jsxdoc_link'"/></xsl:otherwise>
        </xsl:choose> 
      </xsl:attribute>
      <xsl:value-of select="@name"/>
    </span>
  </xsl:template>

  <xsl:template match="*" mode="methodlink">
    <xsl:param name="strikedep" select="0"/>
    <span onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doMemberLink('{@id}');">
      <xsl:attribute name="class">
        <xsl:choose>
          <xsl:when test="@deprecated='1' and $strikedep='1'"><xsl:value-of select="'jsxdoc_link memberdep'"/></xsl:when>
          <xsl:otherwise><xsl:value-of select="'jsxdoc_link'"/></xsl:otherwise>
        </xsl:choose> 
      </xsl:attribute>
      <xsl:value-of select="@name"/>
    </span>
  </xsl:template>

  <xsl:template match="*" mode="deprecated">
    <xsl:if test="@deprecated">
      <div class="deprecated">
        <span class="title">Deprecated.</span>
        <xsl:if test="deprecated">
          <xsl:text> </xsl:text>
          <xsl:apply-templates select="deprecated" mode="disable-output-escp"/>
        </xsl:if>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="datatype">
    <xsl:param name="cssclass" select="jsxdoc_paramtype"/>
    <xsl:param name="force" select="0"/>
    <xsl:param name="append" select="''"/>
    <xsl:choose>
      <xsl:when test="@type">
        <span class="${cssclass}">{<xsl:value-of select="@type"/>}<xsl:call-template name='disable-output-escp'>
      <xsl:with-param name='value' select='$append'/>
    </xsl:call-template></span>
      </xsl:when>
      <xsl:when test="type">
        <span class="${cssclass}">
          <xsl:text>{</xsl:text>
          <xsl:apply-templates select="." mode="datatype_or"/>
          <xsl:text>}</xsl:text>
          <xsl:call-template name='disable-output-escp'>
            <xsl:with-param name='value' select='$append'/>
          </xsl:call-template>
        </span>
      </xsl:when>
      <xsl:when test="$force='1'">
        <span class="${cssclass}">{?}</span>
      </xsl:when>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="*" mode="datatype_or">
    <xsl:for-each select="type">
      <xsl:apply-templates select="." mode="datatype_node"/>
      <xsl:if test="position() != last()">
        <xsl:text> | </xsl:text>
      </xsl:if>
    </xsl:for-each>    
  </xsl:template>
  
  <xsl:template match="type" mode="datatype_node">
    <xsl:choose>
      <xsl:when test="@link='1'">
        <xsl:choose>
          <xsl:when test="@class">
            <span class="jsxdoc_link" onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doClassLink('{@class}');">
              <xsl:value-of select="@name"/>
            </span>
          </xsl:when>
          <xsl:otherwise>
            <span class="jsxdoc_link" onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doClassLink('{@name}');">
              <xsl:value-of select="@name"/>
            </span>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="@name"/>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:if test="type | typeor">
      <xsl:text>&#60;</xsl:text>
      <xsl:for-each select="type | typeor">
        <xsl:choose>
          <xsl:when test="local-name()='type'"><xsl:apply-templates select="." mode="datatype_node"/></xsl:when>
          <xsl:otherwise><xsl:apply-templates select="." mode="datatype_or"/></xsl:otherwise>
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
  
  <xsl:template match="*" mode="since">
    <xsl:if test="@since">
      <h3 class="jsxdoc">Since:</h3>
      <div class="indent"><xsl:apply-templates select="@since" mode="disable-output-escp"/></div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="author">
    <xsl:if test="author">
      <h3 class="jsxdoc">Authors:</h3>
      <xsl:for-each select="author">
        <div class="indent"><xsl:apply-templates select="." mode="disable-output-escp"/></div>
      </xsl:for-each>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="version">
    <xsl:if test="@version">
      <h3 class="jsxdoc">Version:</h3>
      <div class="indent"><xsl:apply-templates select="@version" mode="disable-output-escp"/></div>
    </xsl:if>
  </xsl:template>
  
  <xsl:template match="*" mode="seealso">
    <xsl:if test="see">
      <h3 class="jsxdoc">See Also:</h3>
      <div class="indent">
        <xsl:for-each select="see">
          <xsl:choose>
            <xsl:when test="@source and @idfk">
              <span class="jsxdoc_link" onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doSeeLink('{../@id}',{position()});">
                <xsl:apply-templates select="." mode="disable-output-escp"/>
              </span>
            </xsl:when>
            <xsl:when test="@source">
              <span class="jsxdoc_link" onclick="jsx3.html.getJSXParent(this).getAncestorOfName('jsx_ide_api').doClassLink('{@source}');">
                <xsl:apply-templates select="." mode="disable-output-escp"/>
              </span>
            </xsl:when>
            <xsl:otherwise>
              <xsl:apply-templates select="." mode="disable-output-escp"/>
            </xsl:otherwise>            
          </xsl:choose>
          <xsl:if test="position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="text" mode="disable-output-escp">
    <xsl:choose>
      <xsl:when test="@esc='1'">
        <xsl:call-template name="disable-output-escp">
          <xsl:with-param name="value" select="."/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="* | text()"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- From jsxlib.xsl -->
  <xsl:template match="* | @*" mode="disable-output-escp">
    <xsl:call-template name="disable-output-escp">
      <xsl:with-param name="value" select="."/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="disable-output-escp">
    <xsl:param name="value" select="."/>
    <xsl:choose>
      <xsl:when test="function-available('msxsl:node-set')">
        <xsl:value-of disable-output-escaping="yes" select="$value"/>
      </xsl:when>
      <xsl:otherwise>
        <span class="disable-output-escp"><xsl:value-of select="$value"/></span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
</xsl:stylesheet>
