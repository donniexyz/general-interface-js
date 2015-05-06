<?xml version="1.0"?>
<!--
  ~ Copyright (c) 2001-2014, TIBCO Software Inc.
  ~ Use, modification, and distribution subject to terms of license.
  -->

<!-- scans a WSDL for all known schema elements that are either ignored or unsupported -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" omit-xml-declaration="yes"/>

  <xsl:template match="/">
        --------------------------------
        [Ignored Elements]
        annotation                  <xsl:value-of select="count(//xsd:annotation)"/>
        any                         <xsl:value-of select="count(//xsd:any)"/>
        anyAttribute                <xsl:value-of select="count(//xsd:anyAttribute)"/>
        appInfo                     <xsl:value-of select="count(//xsd:appInfo)"/>
        choice                      <xsl:value-of select="count(//xsd:choice)"/>
        documentation               <xsl:value-of select="count(//xsd:documentation)"/>
        notation                    <xsl:value-of select="count(//xsd:notation)"/>

        --------------------------------
        [Unsupported Elements]
        key                         <xsl:value-of select="count(//xsd:key)"/>
        keyref                      <xsl:value-of select="count(//xsd:keyref)"/>
        field                       <xsl:value-of select="count(//xsd:field)"/>
        list                        <xsl:value-of select="count(//xsd:list)"/>
        redefine                    <xsl:value-of select="count(//xsd:redefine)"/>
        selector                    <xsl:value-of select="count(//xsd:selector)"/>
        union                       <xsl:value-of select="count(//xsd:union)"/>
        unique                      <xsl:value-of select="count(//xsd:unique)"/>

        --------------------------------
        [Ignored Attributes]
        all/@id                     <xsl:value-of select="count(//xsd:all/@id)"/>
        all/@maxOccurs              <xsl:value-of select="count(//xsd:all/@maxOccurs)"/>
        all/@minOccurs              <xsl:value-of select="count(//xsd:all/@minOccurs)"/>
        attribute/@id               <xsl:value-of select="count(//xsd:attribute/@id)"/>
        attribute/@default          <xsl:value-of select="count(//xsd:attribute/@default)"/>
        attribute/@use              <xsl:value-of select="count(//xsd:attribute/@use)"/>
        attributeGroup/@id          <xsl:value-of select="count(//xsd:attributeGroup/@id)"/>
        complexContent/@id          <xsl:value-of select="count(//xsd:complexContent/@id)"/>
        complexContent/@mixed       <xsl:value-of select="count(//xsd:complexContent/@mixed)"/>
        complexType/@id             <xsl:value-of select="count(//xsd:complexType/@id)"/>
        complexType/@final          <xsl:value-of select="count(//xsd:complexType/@final)"/>
        complexType/@mixed          <xsl:value-of select="count(//xsd:complexType/@mixed)"/>
        element/@id                 <xsl:value-of select="count(//xsd:element/@id)"/>
        element/@final              <xsl:value-of select="count(//xsd:element/@final)"/>
        element/@default            <xsl:value-of select="count(//xsd:element/@default)"/>
        element/@nillable           <xsl:value-of select="count(//xsd:element/@nillable)"/>
        extension/@id               <xsl:value-of select="count(//xsd:extension/@id)"/>
        group/@id                   <xsl:value-of select="count(//xsd:group/@id)"/>
        group/@maxOccurs            <xsl:value-of select="count(//xsd:group/@maxOccurs)"/>
        group/@minOccurs            <xsl:value-of select="count(//xsd:group/@minOccurs)"/>
        import/@id                  <xsl:value-of select="count(//xsd:import/@id)"/>
        include/@id                 <xsl:value-of select="count(//xsd:include/@id)"/>
        restriction/@id             <xsl:value-of select="count(//xsd:restriction/@id)"/>
        schema/@version             <xsl:value-of select="count(//xsd:schema/@version)"/>
        schema/@xml:lang            <xsl:value-of select="count(//xsd:schema/@xml:lang)"/>
        schema/@id                  <xsl:value-of select="count(//xsd:schema/@id)"/>
        sequence/@id                <xsl:value-of select="count(//xsd:sequence/@id)"/>
        simpleContent/@id           <xsl:value-of select="count(//xsd:simpleContent/@id)"/>
        simpleType/@id              <xsl:value-of select="count(//xsd:simpleType/@id)"/>
        simpleType/@final           <xsl:value-of select="count(//xsd:simpleType/@final)"/>

        --------------------------------
        [Unsupported Attributes]
        attribute/@fixed            <xsl:value-of select="count(//xsd:attribute/@fixed)"/>
        attribute/@form             <xsl:value-of select="count(//xsd:attribute/@form)"/>
        complexType/@block          <xsl:value-of select="count(//xsd:complexType/@block)"/>
        complexType/@abstract       <xsl:value-of select="count(//xsd:complexType/@abstract)"/>
        element/@fixed              <xsl:value-of select="count(//xsd:element/@fixed)"/>
        element/@abstract           <xsl:value-of select="count(//xsd:element/@abstract)"/>
        element/@block              <xsl:value-of select="count(//xsd:element/@block)"/>
        element/@form               <xsl:value-of select="count(//xsd:element/@form)"/>
        element/@substitutionGroup  <xsl:value-of select="count(//xsd:element/@substitutionGroup)"/>
        import/@namespace           <xsl:value-of select="count(//xsd:import/@namespace)"/>
        schema/@blockDefault        <xsl:value-of select="count(//xsd:schema/@blockDefault)"/>
  </xsl:template>

</xsl:stylesheet>




