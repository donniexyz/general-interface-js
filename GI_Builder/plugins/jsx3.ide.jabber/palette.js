/*
 * Copyright (c) 2001-2014, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

jsx3.$O(this).extend({
  /*********************
   * UI Util functions *
   *********************/
  _getTree: function() {
    // Gets the tree from the palette
    var ui = this.getPalette().getUIObject();
    return ui && ui.getXMPPTree();
  },

  getTreeDocument: function(blank){
    var xml = new jsx3.xml.CDF.Document();
    xml.loadXML('<data jsxid="jsxroot"><record jsxid="jsxrootnode" jsxtext="rootnode" jsxunselectable="1" jsxopen="1" jsximg="jsxapp:/images/icon_7.gif"/></data>');
    return xml;
  },

  getToolbarItem: function(name) {
    var p = this.getPalette();
    if (p) {
      var u = p.getUIObject();
      if (u) {
        return u.getDescendantOfName(name);
      }
    }
    return null;
  },

  setUIState: function(state) {
    // Displays the correct Block depending on the
    // state of the XMPP settings/connection
    var ui = this.getPalette().getUIObject();
    var Block = jsx3.gui.Block;

    if (state == 0 && !this.isConfigured()) {
      ui.getDescendantOfName("xmpp_conf_block").setDisplay(Block.DISPLAYBLOCK, true);
      ui.getDescendantOfName("xmpp_list_block").setDisplay(Block.DISPLAYNONE, true);
    } else {
      ui.getDescendantOfName("xmpp_list_block").setDisplay(Block.DISPLAYBLOCK, true);
      ui.getDescendantOfName("xmpp_conf_block").setDisplay(Block.DISPLAYNONE, true);

      var add_button = ui.getDescendantOfName("btnadd");

      if (state == 0) {
        this.setUsername('Offline');
        add_button.setEnabled(0, true);
      } else if (state == 1) {
        this.setUsername('Loading...');
        add_button.setEnabled(0, true);
      } else if (state == 2) {
        this.setUsername(this.session.jid);
        add_button.setEnabled(1, true);
      }
    }
  },

  setUsername: function(name) {
    var b = this.getToolbarItem('xmpp_username');
    if (b) {
      b.setText(name, true);
    }
  },

  isConfigured: function() {
    var credentials = this.getCredentials();
    return credentials.server && credentials.username && credentials.password;
  },

  setTempPassword: function(pw) {
    this._temppw = pw;
  },

  getCredentials: function() {
    // Gets the saved credentials from the
    // user's settings
    var s = jsx3.ide.getIDESettings();
    var id = this.getId();

    return {
      username: s.get(id, 'userid'),
      password: this._temppw || s.get(id, 'password'),
      server: s.get(id, 'server'),
      autologin: Boolean(s.get(id, 'autologin')),
      port: s.get(id, 'port'),
      bind: s.get(id, 'bind'),
      use_ssl: s.get(id, 'ssl')
    }
  },

  _presSorts: {none:9, offline:9, away:4, dnd:3, xa:5, online:1},

  _presImages: {none:"none", offline:"none", away:"away", dnd:"dnd", xa:"xa", online:"online"},

  _addStatusProperties: function(presence, record) {
    if (!presence) presence = "none";

    var sort = this._presSorts[presence];

    if (!sort)
      this.getLog().debug("Unknown presence: " + presence);

    var image = this._presImages[presence];

    record.jsximg = 'images/' + image + '.gif';
    record.jsxsortlevel = sort;
    record.jsxsort = sort + "-" + String(record.jsxtext).toLowerCase();
  },

  _getRecord: function(item) {
    // Returns a record object for use with the palette's
    // tree's XML.
    var name = (item.name||item.jid) /*+ (item.substatus == dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING ? ' (awaiting authorization)' : '')*/;
    var record = {
      jsxid: item.jid,
      jsxnick: item.name,
      jsxtext: name,
      jsximg: 'images/none.gif'
    };

    this._addStatusProperties(item.presence, record);

    return record;
  },

  getGroupRecord: function(group_name) {
    var text = group_name == 'jsxcontacts' ? 'Contacts' : group_name;
    return {
      jsxid: group_name,
      jsxtext: text,
      jsximg: '',
      jsxgroup: group_name,
      jsxstyle: 'font-weight:bold;',
      jsxsort: text.toLowerCase(),
      jsxnick: '',
      jsxopen: 1,
      jsxunselectable: 1
    };
  },

  /******************
   * XMPP Functions *
   ******************/
  connectSession: function(credentials) {
    // Handles connecting to the XMPP server.
    // Determines if we need to use the iframe transport
    // for a cross-domain situation.

    var jid_parts = credentials.username.split('@');
    var domain = jid_parts[1];
    var serviceUrl = credentials.server;

    if(serviceUrl.indexOf('http://') != 0){
      serviceUrl = 'http://' + serviceUrl;
    }

    if(credentials.port){
      serviceUrl += ':' + credentials.port;
    }

    serviceUrl += (serviceUrl.charAt(serviceUrl.length-1) == '/' ? '' : '/') + (credentials.bind||'http-bind') + '/';

    var useScript = true;

    if (window.location.protocol == 'file:') {
      if (dojo.isFF < 3) {
        useScript = false;
      }
    } else if (window.location.hostname == credentials.server) {
      useScript = false;
    }
    this.session = new dojox.xmpp.xmppSession({
      serviceUrl: serviceUrl,
      secure: !!credentials.ssl,
      useScriptSrcTransport: useScript,
      domain: domain
    });

    this.roster = {};
    this.chatInstances = {};
    this.chatDialogs = {};

    dojo.connect(this.session, 'onActive', this, '_onActive');
    dojo.connect(this.session, 'onRosterAdded', this, '_onRosterAdded');
    dojo.connect(this.session, 'onRosterChanged', this, '_onRosterChanged');
    dojo.connect(this.session, 'onRosterRemoved', this, '_onRosterRemoved');
    dojo.connect(this.session, 'onRosterUpdated', this, '_onRosterUpdated');
    dojo.connect(this.session, 'onPresenceUpdate', this, '_onPresenceUpdate');
    dojo.connect(this.session, 'onRegisterChatInstance', this, '_onRegisterChatInstance');
    dojo.connect(this.session, 'onTerminate', this, function(newState, oldState, message) {
      if (message == 'error') {
        this.getLog().error("Received onTerminate message: " + message);
        this.doShutdown();
      }
    });
    dojo.connect(this.session, 'onLoginFailure', this, function(message) {
      this.getLog().error("Received onLoginFailure message: " + message);
      this.doShutdown();
    });

    // automatically approve all subscription requests
    dojo.connect(this.session, 'onSubscriptionRequest', this, function(from) {
      this.session.presenceService.approveSubscription(from);
    });

    // this is so the iframes get appended to the actual body rather than
    // the loaded application's body
    var oldDojoBody = dojo.body;
    dojo.body = function() {
      return dojo.doc.body || dojo.doc.getElementsByTagName("body")[0]; // Node
    }

    var xml = this.getTreeDocument();
    this._getTree().setSourceXML(xml);

    this.setUIState(1);
    this.session.open(credentials.username, credentials.password, 'TIBCO/GIChat');
    dojo.body = oldDojoBody;
  },

  _updateTree: jsx3.$F(function() {
    // Iterates through the XMPP session's roster
    // and updates the palette's tree.
    var objTree = this._getTree();
    if (objTree) {
      for (var i = 0, l = this.session.roster.length; i<l; i++)
        this._addContactToRoster(this.session.roster[i], objTree);

      objTree.repaint();
    }
  }).throttled(),

  _repaintTree: jsx3.$F(function() {
    var objTree = this._getTree();
    if (objTree)
      objTree.repaint();
  }).throttled(),

  _addContactToRoster: function(item, objTree) {
    if (item.status == "from")
      this.session.presenceService.subscribe(item.jid);

    if (!objTree) {
      objTree = this._getTree();
    }

    if (objTree) {
      var xml = objTree.getXML();

      var group_name = 'jsxcontacts';
      this.roster[item.jid] = item;

      if (item.groups.length) {
        group_name = item.groups[0];
      }

      var rec = objTree.getRecordNode(item.jid);
      if (!rec) {
        var group_node = xml.selectSingleNode('//record[@jsxgroup="' + group_name + '"]');
        if (!group_node) {
            objTree.insertRecord(this.getGroupRecord(group_name), 'jsxrootnode', false);
        }
        objTree.insertRecord(this._getRecord(item), group_name, false);
      }
    }
  },

  _onActive: function(){
    // Called when the XMPP session is active.  Publishes
    // the user's status as "online" and displays the contact
    // tree.

    //jsx3.ide.LOG.warn('Active!', arguments);
    this.session.presenceService.publish({});
    this.setUIState(2);

    this._playSound("connect");
  },

  _onRosterAdded: function(item){
    this.getLog().trace("onRosterAdded " + jsx3.$O.json(item));
    // Called when the session adds a contact.  Inserts
    // the contact's record into the tree's XML.

    //jsx3.ide.LOG.warn('RosterAdded!', arguments);
    var objTree = this._getTree();

    // need this because dojox.xmpp doesn't add the item
    // to the roster.
    this.session.roster.push(item);
    this.roster[item.jid] = item;

    if (objTree) {
      this._addContactToRoster(item, objTree);
      this._repaintTree();
    }
  },

  _onRosterChanged: function(newItem, oldItem){
    this.getLog().trace("onRosterChanged " + jsx3.$O.json(newItem) + " " + jsx3.$O.json(oldItem));
    // Called when the session changes the roster.  Updates
    // the tree's record for the contact.

    //jsx3.ide.LOG.warn('RosterChanged!', arguments);
    var objTree = this._getTree();

    if (objTree) {
      var record = objTree.getRecord(oldItem.jid);
      var name = (newItem.name||newItem.jid) /*+ (newItem.substatus == dojox.xmpp.presence.SUBSCRIPTION_REQUEST_PENDING ? ' (awaiting authorization)' : '')*/;
      record.jsxtext = name;
      record.jsxsort = record.jsxsortlevel + "-" + String(name).toLowerCase();
      record.jsxnick = newItem.name;

      objTree.insertRecord(record, null, false);
      this._repaintTree();
    }

    if (this.chatDialogs[newItem.jid]) {
      this.chatDialogs[newItem.jid].initializeTitle(newItem);
    }
  },

  _onRosterRemoved: function(item){
    this.getLog().trace("onRosterRemoved " + jsx3.$O.json(item));
    // Called when the session removes a concact
    // from the roster.  Removes the record from
    // the tree.

    //jsx3.ide.LOG.warn('RosterRemoved!', arguments);
    var objTree = this._getTree();
    delete this.roster[item.id];

    if (objTree)
      objTree.deleteRecord(item.id, true);
  },

  _onRosterUpdated: function(){
    this.getLog().trace("onRosterUpdated " + jsx3.$O.json(arguments[0]));
    // Called when the session updates the roster.
    // Updates the tree based on the session's roster.

    //jsx3.ide.LOG.warn('RosterUpdated!', arguments);
    this._updateTree();
  },

  doStartChat: function(selectedNodes) {
    // Called when a contact's tree node is double
    // clicked.  Registers the chat instance with the
    // service and invites the contact to a chat.

    var chatInstance = new dojox.xmpp.ChatService();
    this.session.registerChatInstance(chatInstance);
    chatInstance.invite(selectedNodes);
  },

  _onRegisterChatInstance: function(instance, message){
    this.getLog().trace("onRegisterChatInstance " + jsx3.$O.json(instance, false) + " " + jsx3.$O.json(message, false));

    // Called when the XMPP service gets a request
    // to register a chat instance.  Makes sure our
    // internal list of chat instances is up to date.

    //jsx3.ide.LOG.warn('RegisterChatInstance!', arguments);

    var ci = this.chatInstances;
    if (instance.uid) {
      if (!ci[instance.uid] || ci[instance.uid].chatid != instance.chatid) {
        this._newMessage(instance, instance.uid, message);
      }
      ci[instance.uid] = instance;
    }

    dojo.connect(instance, 'onInvite', this, jsx3.$F(function(jid) {
      ci[jid] = instance;
      this.getLog().trace("onInvite " + jid + " " + instance.chatid);
      this._newMessage(instance, jid, null);
    }).bind(this));

    dojo.connect(instance, 'onNewMessage', this, jsx3.$F(function(msg) {
      this.getLog().trace("onNewMessage " + jsx3.$O.json(msg, false) + " " + instance.chatid);
      this._newMessage(instance, instance.uid, msg);
    }).bind(this));

    dojo.connect(instance, 'setState', this, jsx3.$F(function(state) {
      this.getLog().trace("setState " + state + " " + instance.chatid);
      //jsx3.ide.LOG.warn("IM: ",  instance.uid, " is now ", state);
    }).bind(this));
  },

  _newMessage: function(instance, jid, message) {
    // Called when a chat session gets a new message.
    // Determines if a new dialog needs to be rendered
    // and passes the message to the dialog.

    var cd = this.chatDialogs;
    if (!cd[jid] || !cd[jid].getParent()) {
      this.getResource("xmpp_chat_dialog").load().when(jsx3.$F(function() {
        var dialog = cd[jid] = this.loadRsrcComponent("xmpp_chat_dialog", this.getServer().getRootBlock(), false);
        dialog.getParent().paintChild(dialog);

        dialog.focus();

        dialog.initializeTitle(this.roster[jid]||{ jid: jid });
        dialog.onNewMessage(instance, message);
      }).bind(this));
    } else {
      cd[jid].onNewMessage(instance, message);
    }

    if (message)
      this._playSound("message");
  },

  _playSound: function(key) {
    var settings = jsx3.ide.getIDESettings();
    if (settings.get(this.getId(), "sounds")) {
      if (!this._soundsreged) {
        this._soundsreged = true;
        jsx3.ide.registerSound(this.getId() + ".message", this.resolveURI("sounds/message.wav"));
        jsx3.ide.registerSound(this.getId() + ".connect", this.resolveURI("sounds/connect.wav"));
        jsx3.ide.registerSound(this.getId() + ".disconnect", this.resolveURI("sounds/disconnect.wav"));
      }

      jsx3.ide.playSound(this.getId() + "." + key);
    }
  },

  _onPresenceUpdate: function(buddy){
    this.getLog().trace("onPresenceUpdate " + jsx3.$O.json(buddy));

    // Called when the session updates a contact's
    // status.  Updates the icon for the contact in
    // the tree based on status.

    if (this.roster[buddy.from]) {
      this.roster[buddy.from].presence = buddy.show;
    }

    //jsx3.ide.LOG.warn('PresenceUpdate!', arguments);
    var objTree = this._getTree();
    if (objTree) {
      var record = objTree.getRecord(buddy.from);
      if (record) {
        this._addStatusProperties(buddy.show, record);
        objTree.insertRecord(record, null, false);
        this._repaintTree();
      }
    }
  },

  isConnected: function() {
    return this.session && this.session.state != dojox.xmpp.xmpp.TERMINATE;
  },

  loadXMPP: jsx3.$Y(function(cb) {
    var eng = this.getEngine();
    eng.getPlugIn("jsx3.util.Dojo").load().when(function() {
      var Dojo = jsx3.util.Dojo;

      var f = jsx3.ide.getSystemRelativeFile(jsx3.resolveURI(Dojo.getPath()));
      if (f.exists() && f.isDirectory()) {
        Dojo.load();
        dojo.require("dojox.xmpp.xmppSession");
        cb.done();
      } else {
        var plugIn = eng.getPlugIn("jsx3.ide.xmpp");
        window.djConfig = typeof djConfig == "undefined" ? {baseUrl: plugIn.resolveURI("dojo/").toString(), afterOnLoad: true} : djConfig;
        plugIn.load().when(cb);
      }
    });
  }),

  /***********************
   * UI Dialog functions *
   ***********************/
  doPower: function() {
    // Closes the XMPP session.
    if (this.isConnected()) {
      this.doShutdown();
    } else {
      var credentials = this.getCredentials();
      this.loadXMPP().when(jsx3.$F(function() {
        this.connectSession(credentials);
      }).bind(this));
    }
  },

  doShutdown: function() {
    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        this.getLog().warn("Error disconnecting: " + jsx3.NativeError.wrap(e));
      }
      this.session = null;
      this.roster = {};
      this._playSound("disconnect");
    }
    
    var tree = this._getTree();
    tree.setSourceXML(this.getTreeDocument(true));
    tree.repaint();
    this.setUIState(0);
  },

  doShowAddContact: function() {
    // Called when user clicks the "Add Contact" button on
    // the palette.  Loads the add dialog and sets it up.
    this.getResource("xmpp_add_dialog").load().when(jsx3.$F(function() {
      var dialog = this.loadRsrcComponent("xmpp_add_dialog", this.getServer().getRootBlock(), false);
      dialog.getParent().paintChild(dialog);

      dialog.focus();
    }).bind(this));
  },

  _doAddContact: function(objEvent, dialog) {
    // Called when the user accepts the contact to add.
    // Adds the contact to the user's roster and requests
    // a subscription to their presence.
    var contact = dialog.getJID();
    contact = jsx3.$S(contact).trim();

    if (/^[^\@\s]+\@[^\@\s]+$/.test(contact)) {
      this.session.rosterService.addRosterItem(contact, contact);
      this.session.presenceService.subscribe(contact);
      dialog.doClose();
    } else {
      this.getLog().error("Invalid Jabber ID: " + contact);
      dialog.beep();
    }
  },

  editNickname: function(user) {
    // Called when user selects "Set Nickname" from context
    // menu.  Loads the nickname dialog and sets it up.
    this.getResource("xmpp_nick_dialog").load().when(jsx3.$F(function() {
      var dialog = this.loadRsrcComponent("xmpp_nick_dialog", this.getServer().getRootBlock());

      dialog.focus();
      dialog.setNickname(user.jsxid, user.jsxnick);
    }).bind(this));
  },

  _doEditNickname: function(objEvent, dialog) {
    // Called when user accepts the nickname for a contact.
    // Sets the nickname for the contact using the roster
    // service.
    var nickname = dialog.getNickname();
    //jsx3.ide.LOG.warn(dialog.jsxjid, nickname);
    this.session.rosterService.updateRosterItem(dialog.jsxjid, nickname);
    dialog.doClose();
  },

  deleteFromRoster: function(user) {
    // Called when user selects "Delete" from context
    // menu.  Loads the delete dialog and sets it up.
    this.getResource("xmpp_delete_dialog").load().when(jsx3.$F(function() {
      var dialog = this.loadRsrcComponent("xmpp_delete_dialog", this.getServer().getRootBlock(), false);
      dialog.getParent().paintChild(dialog);

      dialog.focus();
      dialog.setInfo(user.jsxid, user.jsxtext);
    }).bind(this));
  },

  _doDeleteContact: function(objEvent, dialog) {
    // Called when user confirms they want to delete
    // a contact.  Removes the contact from their roster.
    this.session.rosterService.removeRosterItem(dialog.jid);
    dialog.doClose();
  }
});
