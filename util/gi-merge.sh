#!/bin/sh
#
# General Interface - BSD License
# Copyright (c) 2006-2011, TIBCO Software Inc.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice, this
#   list of conditions and the following disclaimer.
# * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.
# * The name of TIBCO Software Inc. may not be used to endorse or promote
#   products derived from this software without specific prior written
#   permission of TIBCO Software Inc.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#
#
# Creates a custom build of General Interface 3.4 optimized for a
# particular GI application. 
#
# This script merges any number of the built-in GI class files into jsx.js. 
# By creating a custom build of GI, any subset of GI classes can be loaded 
# with this initial JavaScript file. Loading classes in one file is faster, 
# especially when loading over HTTP, than loading them serially with dynamic
# class loading.
#
# Modify this script by setting any of the classes listed below to 0 or 1. 
# Any class set to 1 will be included in the build. Any class set to 0 will be
# excluded.
#

JSXJS="jsx.js"
JSXJS_ORIG=${JSXJS}".orig"

# INCLUDES, set to 1 to include or 0 to exclude
# Note that some JS classes require other classes. For example, BlockX requires
# Block since it extends that class. These dependencies are calculated by this
# script and automatically included in the merged file.
jsx3_app_Monitor=0
jsx3_app_UserSettings=0
jsx3_gui_BlockX=0
jsx3_gui_Button=0
jsx3_gui_CheckBox=0
jsx3_gui_ColorPicker=0
jsx3_gui_Column=0
jsx3_gui_DatePicker=0
jsx3_gui_Dialog=0
jsx3_gui_Form=0
jsx3_gui_Grid=0
jsx3_gui_IFrame=0
jsx3_gui_Image=0
jsx3_gui_ImageButton=0
jsx3_gui_LayoutGrid=0
jsx3_gui_List=0
jsx3_gui_Matrix=1
jsx3_gui_Matrix_Column=0
jsx3_gui_Menu=0
jsx3_gui_RadioButton=0
jsx3_gui_Select=0
jsx3_gui_Slider=0
jsx3_gui_Sound=0
jsx3_gui_Splitter=0
jsx3_gui_Stack=0
jsx3_gui_StackGroup=0
jsx3_gui_Tab=0
jsx3_gui_TabbedPane=0
jsx3_gui_Table=0
jsx3_gui_TextBox=0
jsx3_gui_TimePicker=0
jsx3_gui_ToolbarButton=0
jsx3_gui_Tree=0
jsx3_gui_Window=0
jsx3_gui_WindowBar=0
jsx3_net_Form=0
jsx3_net_Service=0
jsx3_xml_Cacheable=0

# Defines the order in which includes are processed. This should not be changed.
ORDER="jsx3_app_UserSettings jsx3_net_Form jsx3_xml_Cacheable jsx3_app_Monitor jsx3_gui_Form jsx3_gui_BlockX jsx3_gui_ToolbarButton jsx3_gui_WindowBar jsx3_gui_Dialog jsx3_gui_Button jsx3_gui_TextBox jsx3_gui_CheckBox jsx3_gui_RadioButton jsx3_gui_Splitter jsx3_gui_LayoutGrid jsx3_gui_Stack jsx3_gui_StackGroup jsx3_gui_Tab jsx3_gui_TabbedPane jsx3_gui_Select jsx3_gui_Menu jsx3_gui_Tree jsx3_gui_Column jsx3_gui_List jsx3_gui_Grid jsx3_gui_DatePicker jsx3_gui_Slider jsx3_gui_Sound jsx3_gui_Window jsx3_gui_ImageButton jsx3_gui_ColorPicker jsx3_gui_TimePicker jsx3_gui_Matrix_Column jsx3_gui_Matrix jsx3_gui_Image jsx3_net_Service jsx3_gui_IFrame jsx3_gui_Table"

# Defines dependencies between classes.
dep_jsx3_app_Monitor=""
dep_jsx3_app_UserSettings=""
dep_jsx3_gui_BlockX="jsx3_xml_Cacheable"
dep_jsx3_gui_Button="jsx3_gui_Form"
dep_jsx3_gui_CheckBox="jsx3_gui_Form"
dep_jsx3_gui_ColorPicker="jsx3_gui_Form"
dep_jsx3_gui_Column=""
dep_jsx3_gui_DatePicker="jsx3_gui_Form"
dep_jsx3_gui_Dialog="jsx3_gui_ToolbarButton"
dep_jsx3_gui_Form=""
dep_jsx3_gui_Grid="jsx3_gui_List"
dep_jsx3_gui_IFrame=""
dep_jsx3_gui_Image=""
dep_jsx3_gui_ImageButton="jsx3_gui_Form"
dep_jsx3_gui_LayoutGrid=""
dep_jsx3_gui_List="jsx3_xml_Cacheable jsx3_gui_Form jsx3_gui_Column"
dep_jsx3_gui_Matrix="jsx3_xml_Cacheable jsx3_gui_Form jsx3_gui_Matrix_Column"
dep_jsx3_gui_Matrix_Column=""
dep_jsx3_gui_Menu="jsx3_xml_Cacheable jsx3_gui_Form jsx3_gui_ToolbarButton"
dep_jsx3_gui_RadioButton="jsx3_gui_Form"
dep_jsx3_gui_Select="jsx3_xml_Cacheable jsx3_gui_Form"
dep_jsx3_gui_Slider="jsx3_gui_Form"
dep_jsx3_gui_Sound=""
dep_jsx3_gui_Splitter=""
dep_jsx3_gui_Stack=""
dep_jsx3_gui_StackGroup="jsx3_gui_LayoutGrid jsx3_gui_Stack"
dep_jsx3_gui_Tab=""
dep_jsx3_gui_TabbedPane="jsx3_gui_Tab"
dep_jsx3_gui_Table="jsx3_xml_Cacheable jsx3_gui_Form"
dep_jsx3_gui_TextBox="jsx3_gui_Form"
dep_jsx3_gui_TimePicker="jsx3_gui_Form"
dep_jsx3_gui_ToolbarButton="jsx3_gui_Form"
dep_jsx3_gui_Tree="jsx3_xml_Cacheable jsx3_gui_Form"
dep_jsx3_gui_Window=""
dep_jsx3_gui_WindowBar=""
dep_jsx3_net_Form=""
dep_jsx3_net_Service=""
dep_jsx3_xml_Cacheable=""

PLATFORMS="ie6 ie7 fx saf"

# Make sure we're running in the GI directory.

if [ ! -d JSX/js ]
then
  echo "This script must be run from the GI install directory."
  exit 1
fi

cd JSX/js

# Create backups of jsx.js

for p in $PLATFORMS
do
  if [ -f ${p}/${JSXJS} ]
  then
    if [ -f ${p}/${JSXJS_ORIG} ]
    then
      echo "Backup of ${p}/${JSXJS} already exists"
    else
      echo "Creating backup of ${p}/${JSXJS}"
      cp ${p}/${JSXJS} ${p}/${JSXJS_ORIG}
    fi
  fi
done

# Resolve dependencies recursively

stillChecking=1

while [ $stillChecking -eq 1 ]
do
  stillChecking=0
  for s in $ORDER
  do
    eval "on=\${$s}"
    if [ $on -eq "1" ]
    then
      eval "prereqs=\${dep_${s}}"
      for pre in $prereqs
      do
        eval "pre_on=\${${pre}}"
          if [ $pre_on -ne "1" ]
        then
          echo "$s requires $pre"
          eval "${pre}=1"
          stillChecking=1
        fi
      done
    fi
  done
done

# Create the included file list from the variables set above

includes=""
for s in $ORDER
do
  eval "on=\${$s}"
  if [ $on -eq "1" ]
  then
    s=`echo $s | tr "_" "/"`.js
    includes="${includes} $s"
  fi
done

# Merge the source files together

for p in $PLATFORMS
do
  if [ -f ${p}/${JSXJS} ]
  then
    cat ${p}/${JSXJS_ORIG} ${includes} > ${p}/${JSXJS}
  fi
done

echo "All done"
