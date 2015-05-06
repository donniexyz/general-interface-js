======================================================================
General Interface - Building

======================================================================
Introduction

  Building General Interface creates a copy of the source
  distribution optimized for runtime. General Interface runs from
  the unbuilt source directory or from an optimized build.
  Building is therefore an optional step that is highly recommended
  for deployed applications. Pre-built distributions of General
  Interface are available at http://www.generalinterface.org.

======================================================================
Requirements

  Compiling the General Interface build tools and building General
  Interface requires the following software:

  * JDK 1.5 or newer (http://java.sun.com)
  * Apache Ant 1.6.5 or newer (http://ant.apache.org)

======================================================================
Building

  Ant is used to create a General Interface build. The main build
  file is build/build.xml. The following command builds General
  Interface with the default build parameters:

  %> ant

  By default this creates a build in ../dist/gi. This directory can
  by overridden with the build.loc.dist build parameter, for example:

  %> ant -Dbuild.loc.dist=../mygi

  creates a build in ../../mygi/gi. Many other build parameters exist,
  including:

  build.gi.ide {true,false} : build the IDE
  build.gi.docs {true,false} : build the JavaScript API documentation
  build.gi.deprecated {true,false} : include deprecated code

  See build/build.properties for a complete list of configurable
  parameters.

======================================================================
Build Steps

  Ant performs the following transformations on the General Interface
  source files when creating a build:

  1. Symbol pre-compilation: the source JavaScript files are pre-
     compiled to strip or leave in certain blocks marked by metadata.
     For example, this process controls whether deprecated code remains 
     in the resulting build.

  2. Browser pre-compilation: the source JavaScript files are pre-
     compiled to create versions for each target platform. The source
     files include logic to branch based on the platform. The build
     process creates JavaScript files for each platform so that the
     branch logic can be removed. This step and the previous step are
     accomplished using the com.tibco.gi.tools.ScriptCompiler Java tool.

  3. Obfuscation: each source JavaScript is parsed and re-serialized
     to remove comments and whitespace, rename local variables and
     method parameters, and obfuscate the names of any JavaScript
     members marked with relevant metadata. This step is accomplished
     using the com.tibco.gi.tools.Obfuscator Java tool.

  4. File merging: a subset of the JavaScript source files are merged
     together into a single file (for each platform). This step is
     accomplished using the com.tibco.gi.tools.ScriptMerger Java tool.

======================================================================
Build Tools

  The General Interface build tools are Java classes provided with Ant
  interfaces. These tools can also be used to optimize General
  Interface applications. The tools are located in the directory
  build/tools/src/java/com/tibco/gi/tools. 
  
  The tools include the following:
  --DocCompiler.java - Compiles inline documentation from JavaScript
    source files. The output format is XML.
  --HtmlDocCompiler.java - Compiles XML documentation files created with
    the DocCompiler tool into javadoc-like HTML documentation files.
  --LocalCompiler.java - Compiles a localized properties bundle from
    Common Locale Data Repository (CLDR) data and any number of other
    localized properties sources. The bundle is in the format supported
    by the General Interface JavaScript class, jsx3.app.PropsBundle.
  --Obfuscator.java - A configurable JavaScript obfuscator. The
    obfuscator works by parsing the JavaScript source with the open
    source Rhino library, modifying the parse tree as necessary for the
    obfuscation, and re-serializing the parse tree to JavaScript.
  --ScriptCompiler.java - Pre-compiles JavaScript files based on
    metadata stored in inline JavaScript comments. This tool has two
    basic modes: symbol compilation and target compilation.
  --ScriptMerger.java - Merges source files together into a single file.
    The merged file is the result of including all source files needed
    to satisfy a set of required symbols. A dependency graph is a
    required input so that the tool knows what files to merge to satisfy
    the symbols.
  --ScriptMergerCleanup.java - Performs clean-up on source files and 
    directories that may be necessary after running the
    ScriptMerger tool.
  --TypeAheadCompiler.java - Compiles any number of GI API documentation
    XML source files into a CDF file used in the IDE for JavaScript
    type-ahead. The output file is a valid CDF document that can be used
    as the data source for a variety of GUI controls. In particular, the
    IDE uses it as the data source to a menu, which is invoked by typing
    ctrl+space in a JavaScript editor.
  --XsltCompiler.java - Compiles an XSLT file into an optimized form.

  For more information on the available tools, compile javadoc for the 
  tools as follows:

  %> cd build/tools
  %> ant javadoc
  %> open build/doc/api/index.html

======================================================================
Copyright

Copyright (c) 2001-2014 TIBCO Software Inc. ALL RIGHTS RESERVED.
