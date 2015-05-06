<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:variable name="lcletters">abcdefghijklmnopqrstuvwxyz</xsl:variable>
  <xsl:variable name="ucletters">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>

  <xsl:template match="/">
    <data jsxid="jsxroot" jsxnamespace="jsx3.ide.mapper.Mapper" jsxversion="1.0">
    <xsl:apply-templates select="/data/record" />
    </data>
  </xsl:template>

  <xsl:template match="record">
    <record jsxid="{generate-id()}">
      <xsl:apply-templates select="@jsximg"/>
      <xsl:apply-templates select="@jsxtext"/>
      <xsl:apply-templates select="@jsxopen"/>
      <xsl:apply-templates select="." mode="tns"/>
      <xsl:apply-templates select="@jsxfullpath"/>
      <xsl:apply-templates select="@jsxdatatype"/>
      <xsl:apply-templates select="@jsxsimple"/>
      <xsl:apply-templates select="@jsxconditional"/>
      <xsl:apply-templates select="@jsxwsdlurl"/>
      <xsl:apply-templates select="@jsxsoaparray"/>
      <xsl:apply-templates select="@jsxsoaparraytype"/>
      <xsl:apply-templates select="." mode="map"/>

      <!-- create the restictions (a combination of jsxmaxoccurs, jsxminoccurs, and restrictions attributes, along with nillable flag) -->
      <xsl:choose>
        <xsl:when test="@jsxrestrictions or @jsximg='a' or @jsximg='c' or @jsximg='e' or @jsxmaxoccurs or @jsxminoccurs">
          <restrictions jsxid="{generate-id()}">

            <!-- all nodes get a nillable setting so converted 3.0 files behave the same in 3.1 -->
            <record name="nillable" value="true" jsxid="{generate-id()}"/>

            <!-- convert what was once a string into a parsed xml description of the known restrictions -->
            <xsl:choose>
              <xsl:when test="@jsxrestrictions">
                <!-- call template that will split the string into actual CDF records -->
                <xsl:call-template name='split'>
                  <xsl:with-param name='restrictions' select='@jsxrestrictions'/>
                </xsl:call-template>
              </xsl:when>
            </xsl:choose>

            <!-- add max and minoccur flags. these were the only restriction types that were properly handled in 3.0 -->
            <xsl:choose>
              <xsl:when test="@jsxmaxoccurs or @jsxminoccurs">
                <xsl:apply-templates select="." mode="restrict"/>
              </xsl:when>
            </xsl:choose>

          </restrictions>
        </xsl:when>
      </xsl:choose>

      <xsl:choose>
        <xsl:when test="@jsximg='p'">
          <!-- move service endpoint url to the operation node from the parent service node -->
          <xsl:attribute name="opname"><xsl:value-of select="@jsxtext"/></xsl:attribute>
          <xsl:attribute name="endpoint"><xsl:value-of select="../@jsxendpointurl"/></xsl:attribute>
          <!-- add HTTP headers (content-type and soap action)-->
          <headers jsxid="{generate-id()}">
            <record name="Content-Type" value="text/xml" jsxid="{generate-id()}"/>
            <xsl:choose>
              <xsl:when test="@jsxsoapaction">
                <record jsxid="{generate-id()}">
                  <xsl:attribute name="name">SOAPAction</xsl:attribute>
                  <xsl:attribute name="value"><xsl:value-of select="@jsxsoapaction"/></xsl:attribute>
                </record>
              </xsl:when>
              <xsl:otherwise>
                <record jsxid="{generate-id()}">
                  <xsl:attribute name="name">SOAPAction</xsl:attribute>
                  <xsl:attribute name="value">""</xsl:attribute>
                </record>
              </xsl:otherwise>
            </xsl:choose>
          </headers>
          <!-- add method -->
          <xsl:attribute name="method">POST</xsl:attribute>
        </xsl:when>
      </xsl:choose>

      <xsl:choose>
        <xsl:when test="@jsximg='i'">
          <!-- add stuburl, stubpath, and any onbeforesend code -->
          <xsl:attribute name="stubsrc">jsx://xml/stubs/soap.xml</xsl:attribute>
          <xsl:attribute name="stubpath">/SOAP-ENV:Envelope/SOAP-ENV:Body</xsl:attribute>
          <xsl:choose>
            <xsl:when test="/data/record/@jsxoutboundfilter">
              <xsl:attribute name="onbeforesend"><xsl:value-of select="/data/record/@jsxoutboundfilter"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="/data/record/@jsxencoding">
              <xsl:attribute name="soapuse"><xsl:value-of select="/data/record/@jsxencoding"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="/data/record/@jsxencodingstyle">
              <xsl:attribute name="soapencstyle"><xsl:value-of select="/data/record/@jsxencodingstyle"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
              <xsl:choose>
            <xsl:when test="/data/record/@jsxoperationns">
              <xsl:attribute name="soaprpcns"><xsl:value-of select="/data/record/@jsxoperationns"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
        </xsl:when>
      </xsl:choose>

      <xsl:choose>
        <xsl:when test="@jsximg='f'">
          <xsl:choose>
            <xsl:when test="/data/record/@jsxencoding">
              <xsl:attribute name="soapuse"><xsl:value-of select="/data/record/@jsxencoding"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="/data/record/@jsxencodingstyle">
              <xsl:attribute name="soapencstyle"><xsl:value-of select="/data/record/@jsxencodingstyle"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
              <xsl:choose>
            <xsl:when test="/data/record/@jsxoperationns">
              <xsl:attribute name="soaprpcns"><xsl:value-of select="/data/record/@jsxoperationns"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
        </xsl:when>
      </xsl:choose>

      <xsl:choose>
        <xsl:when test="@jsximg='o'">
          <xsl:choose>
            <xsl:when test="/data/record/@jsxinboundfilter">
              <xsl:attribute name="onafterreceive"><xsl:value-of select="/data/record/@jsxinboundfilter"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="../@alternateinboundurl">
              <xsl:attribute name="stubsrc"><xsl:value-of select="../@alternateinboundurl"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="/data/record/@jsxencoding">
              <xsl:attribute name="soapuse"><xsl:value-of select="/data/record/@jsxencoding"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
          <xsl:choose>
            <xsl:when test="/data/record/@jsxencodingstyle">
              <xsl:attribute name="soapencstyle"><xsl:value-of select="/data/record/@jsxencodingstyle"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
              <xsl:choose>
            <xsl:when test="/data/record/@jsxoperationns">
              <xsl:attribute name="soaprpcns"><xsl:value-of select="/data/record/@jsxoperationns"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
        </xsl:when>
      </xsl:choose>

      <xsl:choose>
        <xsl:when test="@jsximg='s'">
          <xsl:choose>
            <xsl:when test="/data/record/@jsxsoapstyle">
              <xsl:attribute name="soapstyle"><xsl:value-of select="/data/record/@jsxsoapstyle"/></xsl:attribute>
            </xsl:when>
          </xsl:choose>
        </xsl:when>
      </xsl:choose>

      <xsl:apply-templates select="record"/>
    </record>
  </xsl:template>

    <xsl:template match="@jsximg">
      <xsl:attribute name="type"><xsl:value-of select="translate(.,$lcletters,$ucletters)"/></xsl:attribute>
    </xsl:template>

    <xsl:template match="@jsxfullpath">
      <xsl:attribute name="path"><xsl:value-of select="."/></xsl:attribute>
    </xsl:template>

    <xsl:template match="@jsxdatatype">
      <xsl:attribute name="datatype"><xsl:value-of select="."/></xsl:attribute>
    </xsl:template>

    <xsl:template match="@jsxsoaparray">
      <xsl:attribute name="soaparray"><xsl:value-of select="."/></xsl:attribute>
    </xsl:template>

    <xsl:template match="@jsxsoaparraytype">
      <xsl:attribute name="soaparraytype"><xsl:value-of select="."/></xsl:attribute>
    </xsl:template>

    <xsl:template match="record" mode="tns">
      <xsl:choose>
        <xsl:when test="(@efd='1' and (@jsximg='c' or @jsximg='e')) or (@afd='1' and @jsximg='a')">
          <xsl:attribute name="tns"><xsl:value-of select="@tns"/></xsl:attribute>
        </xsl:when>
      </xsl:choose>
    </xsl:template>

    <xsl:template match="record" mode="map">
      <xsl:choose>
        <xsl:when test="@jsxmapobjecttype or @jsxmapfilter">
          <mappings jsxid="{generate-id()}">
            <xsl:choose>
              <xsl:when test="@jsxmapobjecttype">
                <record jsxid="{generate-id()}">
                  <xsl:attribute name="name"><xsl:value-of select="@jsxmapobjecttype"/></xsl:attribute>
                  <xsl:choose>
                    <xsl:when test="@jsxmapobjectname">
                      <xsl:attribute name="value"><xsl:value-of select="@jsxmapobjectname"/></xsl:attribute>
                    </xsl:when>
                  </xsl:choose>
                  <!-- deal with serverns -->
                </record>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="@jsxmapfilter">
                <record name="Script" jsxid="{generate-id()}">
                  <xsl:attribute name="value"><xsl:value-of select="@jsxmapfilter"/></xsl:attribute>
                </record>
              </xsl:when>
            </xsl:choose>
          </mappings>
        </xsl:when>
      </xsl:choose>
    </xsl:template>

    <xsl:template match="record" mode="restrict">
      <xsl:choose>
        <xsl:when test="@jsxmaxoccurs='*'">
          <record name="maxoccur" value="unbounded" jsxid="{generate-id()}"/>
        </xsl:when>
        <xsl:when test="@jsxmaxoccurs">
          <record name="maxoccur" jsxid="{generate-id()}">
            <xsl:attribute name="value"><xsl:value-of select="@jsxmaxoccurs"/></xsl:attribute>
          </record>
        </xsl:when>
      </xsl:choose>

      <xsl:choose>
        <xsl:when test="@jsxminoccurs">
          <record name="minoccur" jsxid="{generate-id()}">
            <xsl:attribute name="value"><xsl:value-of select="@jsxminoccurs"/></xsl:attribute>
          </record>
        </xsl:when>
      </xsl:choose>
    </xsl:template>

    <xsl:template match="@jsxsimple">
      <xsl:attribute name="simple"><xsl:value-of select="."/></xsl:attribute>
    </xsl:template>

    <xsl:template match="@jsxconditional">
      <xsl:attribute name="repeat"><xsl:value-of select="."/></xsl:attribute>
    </xsl:template>

    <xsl:template match="@jsxtext">
      <xsl:copy/>
    </xsl:template>

    <xsl:template match="@jsxopen"><xsl:copy/></xsl:template>

    <xsl:template match="@jsxwsdlurl">
      <xsl:attribute name="src"><xsl:value-of select="."/></xsl:attribute>
    </xsl:template>


    <!-- this template is equivalent to String.split() in Script. It even does splits within splits -->
    <xsl:template name="split">
      <xsl:param name="restrictions"/>
      <xsl:variable name="first" select='substring-before($restrictions,";")'/>
      <xsl:variable name='rest' select='substring-after($restrictions,";")'/>

      <xsl:variable name="first_0" select='substring-before($first,":")'/>
      <xsl:variable name='first_1' select='substring-after($first,":")'/>

      <xsl:if test='$first'>
        <record jsxid="{generate-id()}">
          <xsl:attribute name="name"><xsl:value-of select='$first_0'/></xsl:attribute>
          <xsl:attribute name="value"><xsl:value-of select='$first_1'/></xsl:attribute>
        </record>
      </xsl:if>

      <xsl:if test='$rest'>
        <xsl:call-template name='split'>
          <xsl:with-param name='restrictions' select='$rest'/>
        </xsl:call-template>
      </xsl:if>
    </xsl:template>

</xsl:stylesheet>
