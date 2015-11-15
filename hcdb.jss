// HUMCOM DataBase Service Ver.0.00    2015/09/16
// Copyright (C) 2015 Yac <humcom@tech-notes.dyndns.org>
// This software is released under the MIT License, see LICENSE.txt.

$hcdb = {};

(function() {
  var SETTING_VIEWNAME = "settings";
  var SETTING_FIELDNAME = "values";
  $hcdb.getSettings = function(keyword) {
    var view = database.getView(SETTING_VIEWNAME);
    var doc:NotesDocument = view.getDocumentByKey(keyword, true);
    if (doc) {
      var values = doc.getItemValue(SETTING_FIELDNAME);
      return values;
    } else {
      return null;
    }
  }
  
  $hcdb.getSetting = function(keyword) {
    var view = database.getView(SETTING_VIEWNAME);
    var doc:NotesDocument = view.getDocumentByKey(keyword, true);
    if (doc) {
      var text = doc.getItemValueString(SETTING_FIELDNAME);
      return text;
    } else {
      return null;
    }
  }
  
  $hcdb.getSettingValue = function(keyword) {
    var view = database.getView(SETTING_VIEWNAME);
    var doc:NotesDocument = view.getDocumentByKey(keyword, true);
    if (doc) {
      var value = doc.getItemValueInteger(SETTING_FIELDNAME);
      return value;
    } else {
      return null;
    }
  }

  var VIEW_LOCK = "lockView";
  var NAME_FIELD = "name";
  var LOCKTO_FIELD = "lockTo";
  var LOCK_FORM = "lock";
  var DOCID_FIELD = "docID";
  $hcdb.docLock = function(doc_id) {
    $hc.debug("$hcdb.docLock is called. doc=id=", doc_id);
	var view = database.getView(VIEW_LOCK);
	$hc.debug("$hcdb.docLock STEP-1");
	var lock_doc:NotesDocument = view.getDocumentByKey(doc_id, true);
	$hc.debug("$hcdb.docLock STEP-2");
    if (lock_doc) {
      var lock_name = lock_doc.getItemValueString(NAME_FIELD);
      var my_name = @UserName();
      $hc.debug("in $hcdb.lock(), lock_doc find. lock_name = ", lock_name);
      if ((lock_name == "") || (lock_name == my_name)) {
        // Lock Free or My Lock
        $hc.debug("$hcdb.docLock STEP-3");
        _update_lock(lock_doc, doc_id, my_name);
        return [true, ""];
      } else {
        // Other Member's Lock
        $hc.debug("$hcdb.docLock STEP-4");
        if (_isOverLockTo(lock_doc)) {
          // Over Time Lock
          _update_lock(lock_doc, doc_id, my_name);
          return [true, ""];
        } else {
          return [false, lock_name];
        }
      }
    } else {
      // No Lock doc
      $hc.debug("No lock_doc and create it.");
      var lock_doc = database.createDocument();
      lock_doc.replaceItemValue("Form", LOCK_FORM);
      var my_name = @UserName();
      _update_lock(lock_doc, doc_id, my_name);
      return [true, ""];
    }
  }
  
  $hcdb.isLocked = function(doc_id) {
    var view = database.getView(VIEW_LOCK);
    var lock_doc:NotesDocument = view.getDocumentByKey(doc_id, true);
    if (lock_doc) {
      var lock_name = lock_doc.getItemValueString(NAME_FIELD);
      var my_name = @UserName();
      if ((lock_name == "") || (lock_name == my_name)) {
        // Lock Free or My Lock
        return false;
      } else {
        // Other Member's Lock
        if (_isOverLockTo(lock_doc)) {
          // Over Time Lock
          return false;
        } else {
          return true;
        }
      }
    } else {
      // No Lock doc
      return false;
    }
  }
  
  $hcdb.docUnlock = function(doc_id) {
    var view = database.getView(VIEW_LOCK);
    var lock_doc:NotesDocument = view.getDocumentByKey(doc_id);
    if (lock_doc) {
      var lock_name = lock_doc.getItemValueString(NAME_FIELD);
      var my_name = @UserName();
      if (lock_name == my_name) {
        _clear_lockDoc(lock_doc);
        return true;
      } else {
        // Other Member already lock this doc.
        return false;
      }
    } else {
      // Lock doc was deleted by someone.
      return true;
    }
  }
  
  // -------------- Private Method ---------------
  
  var ADDITIONAL_TIME = 30; // 30min
  function _update_lock(lock_doc, doc_id, my_name) {
    var date:Date = @Now();
    date = @Adjust(date, null, null, null, null, ADDITIONAL_TIME, null);
    var timestamp = I18n.toString(date,"yyyy/MM/dd HH:mm:ss");
    lock_doc.replaceItemValue(NAME_FIELD, my_name);
    lock_doc.replaceItemValue(DOCID_FIELD, doc_id);
    lock_doc.replaceItemValue(LOCKTO_FIELD, timestamp);
    try {
      lock_doc.save();
      return true;
    } catch(err) {
      return false;
    }
  }
  
  function _isOverLockTo(lock_doc) {
    var date:Date = @Now();
    var timestamp = I18n.toString(date, "yyyy/MM/dd HH:mm:ss");
    var lockTo = lock_doc.getItemValueString(LOCKTO_FIELD);
    $hc.debug("_isOverLockTo() is called. [timestamp, lockTo]=", [timestamp, lockTo]);
    if (timestamp > lockTo) {
      return true;
    } else {
      return false;
    }
  }
  
  function _clear_lockDoc(lock_doc) {
    lock_doc.replaceItemValue(NAME_FIELD, "");
    lock_doc.replaceItemValue(LOCKTO_FIELD, "");
    try {
      lock_doc.save();
      return true;
    } catch(err) {
      return false;
    }
  }
})();
