/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

package com.tibco.gi.ant;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.Task;
import org.apache.tools.ant.types.FileSet;
import org.apache.tools.ant.types.Mapper;
import org.apache.tools.ant.util.FileNameMapper;

/**
 * An abstract base task that provides common functionality related to file sets and mappers.
 *
 * @author Jesse Costello-Good
 */
public abstract class AbstractFileTask extends Task {

  private List<FileSet> filesets;
  private List<Mapper> mappers;
  private File destdir;

  protected AbstractFileTask() {
    filesets = new ArrayList<FileSet>();
    mappers = new ArrayList<Mapper>();
  }

  public void addFileset(FileSet fileset) {
    filesets.add(fileset);
  }

  public void addMapper(Mapper mapper) {
    mappers.add(mapper);
  }

  public File getDestdir() {
    return destdir != null ? destdir : this.getProject().getBaseDir();
  }

  /**
   * Ant setter method for the destination directory of this task. The default value is the base directory of the owning
   * project.
   *
   * @param destdir
   */
  public void setDestdir(File destdir) {
    this.destdir = destdir;
  }

  /**
   * Returns a file map resulting from the nested &lt;fileset&gt; and &lt;mapper&gt; elements of this task element. If
   * no mapper if present, the returned map maps every file to itself. Otherwise, each file is mapped to the first
   * result from the first nested mapper.
   *
   * @return
   */
  protected Map<File, File> getFileMap() {
    Map<File, File> map = new HashMap<File, File>();
    FileNameMapper mapper = mappers.size() > 0 ? mappers.get(0).getImplementation() : null;

    for (FileSet fileset : filesets) {
      DirectoryScanner ds = fileset.getDirectoryScanner(getProject());
      File fromDir = fileset.getDir(getProject());
      String[] srcPaths = ds.getIncludedFiles();

      for (String srcPath : srcPaths) {
        File srcFile = new File(fromDir, srcPath);
        if (mapper != null) {
          String[] mappedPaths = mapper.mapFileName(srcPath);
          if (mappedPaths != null && mappedPaths.length > 0)
            map.put(srcFile, new File(this.getDestdir(), mappedPaths[0]));
        } else {
          map.put(srcFile, srcFile);
        }
      }
    }

    return map;
  }

  /**
   * Returns a file map resulting from the nested &lt;fileset&gt; and &lt;mapper&gt; elements of this task element. If
   * no mapper if present, the returned map maps every file to itself. Otherwise, each file is mapped to the full set of
   * files obtained from mapping the file with each nested mapper.
   *
   * @return
   */
  protected Map<File, Set<File>> getFilesMap() {
    Map<File, Set<File>> map = new HashMap<File, Set<File>>();

    for (FileSet fileset : filesets) {
      DirectoryScanner ds = fileset.getDirectoryScanner(getProject());
      File fromDir = fileset.getDir(getProject());
      String[] srcPaths = ds.getIncludedFiles();

      for (String srcPath : srcPaths) {
        File srcFile = new File(fromDir, srcPath);
        if (mappers.size() > 0) {
          Set<File> mappedTo = new HashSet<File>();
          for (Mapper mapper : mappers) {
            FileNameMapper fileMapper = mapper.getImplementation();
            String[] mappedPaths = fileMapper.mapFileName(srcPath);
            if (mappedPaths != null)
              for (String mappedPath : mappedPaths)
                mappedTo.add(new File(this.getDestdir(), mappedPath));
          }
          map.put(srcFile, mappedTo);
        } else {
          map.put(srcFile, Collections.singleton(srcFile));
        }
      }
    }

    return map;
  }

  /**
   * Returns the set of all files referenced by nested &lt;fileset&gt; elements of this task element.
   *
   * @return
   */
  protected Set<File> getFileSet() {
    return getFileSet(true, false);
  }

  protected Set<File> getFileSet(boolean includeFiles, boolean includeDirectories) {
    Set<File> files = new HashSet<File>();

    for (FileSet fileset : filesets) {
      DirectoryScanner ds = fileset.getDirectoryScanner(getProject());
      File fromDir = fileset.getDir(getProject());

      if (includeFiles) {
        String[] srcPaths = ds.getIncludedFiles();

        for (String srcPath : srcPaths) {
          File srcFile = new File(fromDir, srcPath);
          files.add(srcFile);
        }
      }

      if (includeDirectories) {
        String[] srcPaths = ds.getIncludedDirectories();

        for (String srcPath : srcPaths) {
          File srcFile = new File(fromDir, srcPath);
          files.add(srcFile);
        }
      }
    }

    return files;
  }
}
