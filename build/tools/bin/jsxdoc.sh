#!/bin/sh
#
# Command line interface for com.tibco.gi.tools.DocCompiler and
# com.tibco.gi.tools.HtmlDocCompiler
#

PREFIX=`dirname "$0"`

# Support running from source distribution directory structure or
# package directory structure
if test -f "$PREFIX/lib/jsx-tools.jar"; then
  CLASSPATH="${PREFIX}/lib/jsx-tools.jar"
  CLASSPATH="${CLASSPATH}:${PREFIX}/lib/args4j-2.0.11.jar"
  CLASSPATH="${CLASSPATH}:${PREFIX}/lib/xalan-serializer-2.7.jar"
  CLASSPATH="${CLASSPATH}:${PREFIX}/lib/jaxen-1.1.jar"
  CLASSPATH="${CLASSPATH}:${PREFIX}/lib/jsl.jar"
  CLASSPATH="${CLASSPATH}:${PREFIX}/lib/saxon8-dom.jar"
  CLASSPATH="${CLASSPATH}:${PREFIX}/lib/saxon8.jar"
else
  if test -f "${PREFIX}/../jsx-tools.jar"; then
    CLASSPATH="${PREFIX}/../jsx-tools.jar"
    CLASSPATH="${CLASSPATH}:${PREFIX}/../lib/args4j/args4j-2.0.11.jar"
    CLASSPATH="${CLASSPATH}:${PREFIX}/../lib/xml/xalan-serializer-2.7.jar"
    CLASSPATH="${CLASSPATH}:${PREFIX}/../lib/jaxen/jaxen-1.1.jar"
    CLASSPATH="${CLASSPATH}:${PREFIX}/../lib/dojo/jsl.jar"
    CLASSPATH="${CLASSPATH}:${PREFIX}/../lib/saxon/saxon8-dom.jar"
    CLASSPATH="${CLASSPATH}:${PREFIX}/../lib/saxon/saxon8.jar"
  else
    echo "Could not find jsx-tools.jar"
    exit 1
  fi
fi

java -classpath "$CLASSPATH" com.tibco.gi.cli.DocCompilerCLI "$@"
