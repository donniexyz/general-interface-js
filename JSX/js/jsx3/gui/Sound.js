/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.require("jsx3.gui.Painted", "jsx3.gui.Interactive");

// @jsxobf-clobber  _isPlugin _play _pause _rewind _getLength _getPosition _setPosition _setVolume _transformVolume _getVersion _isPlaying
/**
 * Class that provides an object-oriented interface for playing sounds in a GI application.
 * <p/>
 * Note that playing sounds in Internet Explorer requires a plug-in. This class currently supports the following
 * sound plug-ins:
 * <ul>
 *   <li>Apple Quicktime</li>
 *   <li>RealPlayer</li>
 *   <li>Windows Media Player</li>
 * </ul>
 * The installed plug-ins determine which sound file formats are supported.
 *
 * @since 3.1
 */
jsx3.Class.defineClass('jsx3.gui.Sound', jsx3.gui.Painted, [jsx3.gui.Interactive], function(Sound, Sound_prototype) {
  
  /**
   * Apple Quicktime sound plugin type.
   * @privates
   * @jsxobf-clobber
   */
  Sound.QUICKTIME = {};
  Sound.QUICKTIME._isPlugin = function(s) { return typeof(s.GetQuickTimeVersion) != "undefined"; };
  Sound.QUICKTIME._play = function(s) { s.Play(); };
  Sound.QUICKTIME._pause = function(s) { s.Stop(); };
  Sound.QUICKTIME._rewind = function(s) { s.Stop(); s.Rewind(); };
  Sound.QUICKTIME._getLength = function(s) { return s.GetDuration() / s.GetTimeScale(); };
  Sound.QUICKTIME._getPosition = function(s) { return s.GetTime() / s.GetTimeScale(); };
  Sound.QUICKTIME._setPosition = function(s, p) { s.SetTime(p * s.GetTimeScale()); };
  Sound.QUICKTIME._setVolume = function(s, v) { s.SetVolume(this._transformVolume(v)); };
  Sound.QUICKTIME._transformVolume = function(v) { return Math.round(v * 255 / 100); };
  Sound.QUICKTIME.toString = function() { return "Apple QuickTime"; };
  Sound.QUICKTIME._getVersion = function(s) { return this + " " + s.GetQuickTimeVersion(); };
  
  /**
   * Real Media sound plugin type.
   * @private
   * @jsxobf-clobber
   */
  Sound.REAL = {};
  Sound.REAL._isPlugin = function(s) { return typeof(s.GetVersionInfo) != "undefined"; };
  Sound.REAL._play = function(s) { 
    if (s.CanPlay()) {
      s.DoPlay(); 
      if (s.jsxlength == null) {
        s.jsxlength = s.GetLength();
        s.SetPreFetch(false); // prefetch="true" causes problems with playing for a second time
      }
    };
  };
  Sound.REAL._pause = function(s) { if (s.CanPause()) s.DoPause(); };
  Sound.REAL._rewind = function(s) { if (s.CanStop()) s.DoStop(); };
  Sound.REAL._getLength = function(s) {
    if (s.GetPlayState() != 0 || s.GetPreFetch()) {
      return s.GetLength() / 1000;
    } else {
      return s.jsxlength != null ? s.jsxlength / 1000 : Number.NaN;
    }
  };
  Sound.REAL._getPosition = function(s) { return s.GetPosition() / 1000; };
  Sound.REAL._setPosition = function(s, p) { 
    if (s.GetPlayState() != 0) {
      s.SetPosition(p * 1000); 
    } else {
      s.DoPlay();
      s.SetPosition(p * 1000); 
      s.DoPause();
    }
  };
  Sound.REAL._isPlaying = function(s) { return s.GetPlayState() == 3; };
  Sound.REAL._setVolume = function(s, v) { s.SetVolume(this._transformVolume(v)); };
  Sound.REAL._transformVolume = function(v) { return Math.round(v); };
  Sound.REAL.toString = function() { return "RealPlayer"; };
  Sound.REAL._getVersion = function(s) { return this + " " + s.GetVersionInfo(); };
  
  /**
   * Windows Media Player sound plugin type.
   * @private
   * @jsxobf-clobber
   */
  Sound.WINDOWS = {};
  Sound.WINDOWS._isPlugin = function(s) { return typeof(s.GetMediaInfoString) != "undefined"; };
  Sound.WINDOWS._play = function(s) { s.Play(); };
  Sound.WINDOWS._pause = function(s) { s.Pause(); };
  Sound.WINDOWS._rewind = function(s) { s.Stop(); };
  Sound.WINDOWS._getLength = function(s) { return s.Duration; };
  Sound.WINDOWS._getPosition = function(s) { return s.CurrentPosition; };
  Sound.WINDOWS._setPosition = function(s, p) { s.CurrentPosition = p; };
  Sound.WINDOWS._isPlaying = function(s) { return s.PlayState == 2; };
  Sound.WINDOWS._setVolume = function(s, v) { s.Volume = this._transformVolume(v); };
  Sound.WINDOWS._transformVolume = function(v) { 
    return Math.max(-10000, Math.round(2500 * Math.log(v*100)/Math.LN10 - 10000)); };
  Sound.WINDOWS.toString = function() { return "Windows Media Player"; };
  Sound.WINDOWS._getVersion = function(s) { 
    if (this.VERSION == null) {
      try {
        this.VERSION = "Unknown Version";
       if (window.ActiveXObject || window.ActiveXObject !== undefined) {
          this.ACTIVEX = new ActiveXObject("WMPlayer.OCX.7");
          this.VERSION = this.ACTIVEX.versionInfo;
        }
      } catch (e) {
      }      
    }
    return this + " " + this.VERSION; 
  };
  
  /**
   * Generic sound plugin type.
   * @private
   * @jsxobf-clobber
   */
  Sound.GENERIC = {};
  Sound.GENERIC._isPlugin = function(s) { return true; };
  Sound.GENERIC._play = function(s) { if (typeof(s.Play) != "undefined") s.Play(); };
  Sound.GENERIC._pause = function(s) { if (typeof(s.Pause) != "undefined") s.Pause(); };
  Sound.GENERIC._rewind = function(s) { if (typeof(s.Stop) != "undefined") s.Stop(); };
  Sound.GENERIC._getLength = function(s) { return Number.NaN; };
  Sound.GENERIC._getPosition = function(s) { return Number.NaN; };
  Sound.GENERIC._setPosition = function(s, p) { ; };
  Sound.GENERIC._isPlaying = function(s) { return false; };
  Sound.GENERIC._setVolume = function(s, v) { 
    if (typeof(s.SetVolume) != "undefined") s.SetVolume(this._transformVolume(v)); };
  Sound.GENERIC._transformVolume = function(v) { return Math.round(v); };
  Sound.GENERIC.toString = function() { return "Generic"; };
  Sound.GENERIC._getVersion = function(s) { return this.toString(); };
  
  /** @private @jsxobf-clobber */
  Sound.PLUGINS = [Sound.QUICKTIME, Sound.REAL, Sound.WINDOWS, Sound.GENERIC];
  
  /**
   * {String} the URL of the sound file to play
   * @private
   */
  Sound_prototype.jsxurl = null;
  
  /**
   * {int} the volume to play the sound at, {0,100}
   * @private
   */
  Sound_prototype.jsxvolume = 50;
  
  // transient state
  /** @private @jsxobf-clobber */
  Sound_prototype._jsxplugin = null;
  
  /**
   * The instance initializer.
   * @param strName {String}  the JSX name
   * @param strURL {String}  the URL of the sound file to play
   */
  Sound_prototype.init = function(strName, strURL) {
    this.jsxsuper(strName);
    this.jsxurl = strURL;
  };
  
  /**
   * Returns the URL of the sound file.
   * @return {String}  the URL of the sound file to play
   */
  Sound_prototype.getURL = function() {
    return this.jsxurl;
  };
  
  /**
   * Sets the URL of the sound file.
   * @param strURL {String}  the URL of the sound file to play
   * @return {jsx3.gui.Sound}  this object
   */
  Sound_prototype.setURL = function(strURL) {
    this.jsxurl = strURL;
    return this;
  };
  
  /**
   * Returns the volume that the sound plays at.
   * @return {int}  the volume to play the sound at, [0,100]
   */
  Sound_prototype.getVolume = function() {
    return this.jsxvolume;
  };
  
  /** @private @jsxobf-clobber */
  Sound_prototype._getAdjustedVolume = function() {
    var volume = this.jsxvolume != null ? this.jsxvolume : this.prototype.jsxvolume;
    return this._getPlugin()._transformVolume(volume);
  };
  
  /**
   * Sets the volume of this sound. The change takes effect immediately.
   * @param intVolume {int}  the volume to play the sound at. 0 is mute, 100 is loudest
   * @return {jsx3.gui.Sound}  this object
   */
  Sound_prototype.setVolume = function(intVolume) {
    this.jsxvolume = intVolume == null ? null : Math.max(0, Math.min(100, intVolume));
    
    var s = this.getRendered();
    if (s != null) {
      var volume = this.jsxvolume != null ? this.jsxvolume : this.prototype.jsxvolume;
      this._getPlugin()._setVolume(s, volume);
    }
    
    return this;
  };
  
  /**
   * Plays the sound.
   */
  Sound_prototype.play = function() {
    var s = this.getRendered();
    if (s != null)
      this._getPlugin()._play(s);
  };
  
  /**
   * Pauses the sound. Calling <code>play()</code> after calling <code>pause()</code> will play the sound from the
   * point where it was paused.
   */
  Sound_prototype.pause = function() {
    var s = this.getRendered();
    if (s != null)
      this._getPlugin()._pause(s);
  };
  
  /**
   * Stops and rewinds the sound.
   */
  Sound_prototype.rewind = function() {
    var s = this.getRendered();
    if (s != null)
      this._getPlugin()._rewind(s);
  };
  
  /**
   * Returns the length of the sound in seconds.
   * @return {float} the length in seconds or <code>NaN</code> if the length can not be determined
   */
  Sound_prototype.getLength = function() {
    var s = this.getRendered();
    return s != null ? this._getPlugin()._getLength(s) : Number.NaN;
  };
  
  /**
   * Returns the current position (elapsed time) of the sound in seconds.
   * @return {float} the current position in seconds or <code>NaN</code> if the position can not be determined
   */
  Sound_prototype.getPosition = function() {
    var s = this.getRendered();
    return s != null ? this._getPlugin()._getPosition(s) : Number.NaN;
  };
  
  /**
   * Sets the current position (elapsed time) of the sound in seconds.
   * @param position {float} the new position in seconds
   */
  Sound_prototype.setPosition = function(position) {
    var s = this.getRendered();
    if (s != null)
      this._getPlugin()._setPosition(s, position);
  };
  
  /**
   * Returns the full name and version number of the audio plugin used to play this sound.
   * @return {String}
   */
  Sound_prototype.getPluginVersion = function() {
    var s = this.getRendered();
    if (s != null) {
      try {
        return this._getPlugin()._getVersion(s);
      } catch (e) {}
    }

    return this._getPlugin().toString();
  };
  
  /**
   * @private
   * @private @jsxobf-clobber
   * @return {Object}
   */
  Sound_prototype._getPlugin = function() {
    if (this._jsxplugin != null)
      return this._jsxplugin;
    
    var s = this.getRendered();
    if (s != null) {
      for (var i = 0; i < Sound.PLUGINS.length; i++) {
        var plugin = Sound.PLUGINS[i];
        if (plugin._isPlugin(s)) {
          this._jsxplugin = plugin;
          break;
        }
      }
      return this._jsxplugin;
    } else {
      return Sound.GENERIC;
    }
  };
  
  /**
   * Paints the container for the sound.
   * @return {String}
   */
  Sound_prototype.paint = function() {
    this.applyDynamicProperties();
    
    var intVolume = this._getAdjustedVolume();
    
    // prefetch="true" for RealAudio GetLength() to work when not playing, BUT causes problems with DoPlay()
    // enablejavascript="true" for Mozilla
    return '<embed id="' + this.getId() + '" name="' + this.getId() + '" class="jsx30sound" src="' + 
        this.getUriResolver().resolveURI(this.getURL()) + '" enablejavascript="true" autostart="false" ' + 
        this.renderAttributes() + ' volume="' + intVolume + '" prefetch="true"' + jsx3.html._UNSEL + '/>';
  };
  
});
