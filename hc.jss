// HUMCOM Base Library Ver.0.10    2015/11/15
// Copyright (C) 2015 Yac <humcom@tech-notes.dyndns.org>
// This software is released under the MIT License, see LICENSE.txt.

$hc = {};
sessionScope.humcom = sessionScope.humcom || {};

(function() {
  // Constants
  var PREFIX = "HUMCOM";  // Modify for your application.
  
  $hc.setDebugConfig = function(prefix, debug_flag) {
    sessionScope.humcom.debugFlag = debug_flag;
    sessionScope.humcom.prefix = prefix;
  }
  
  $hc.debug = function(message, obj) {
    if (!sessionScope.humcom.debugFlag) {
      return;
    }
    if (sessionScope.humcom.prefix) {
      var header = "[DEBUG][" + @UserName(1) + "]:[" + sessionScope.humcom.prefix + "]";
    } else {
      var header = "[DEBUG][" + @UserName(1) + "]:[" + PREFIX + "]";
    }
    if (obj === undefined) {
      print(header + message);
    } else {
      print(header + message + _inspect(obj));
    }
  }
  
  
  $hc.bug = function(message, obj) {
    if (sessionScope.humcom.prefix) {
      var header = "[BUG!][" + @UserName(1) + "]:[" + sessionScope.humcom.prefix + "]";
    } else {
      var header = "[BUG!][" + @UserName(1) + "]:[" + PREFIX + "]";
    }
    if (obj === undefined) {
      print(header + message);
    } else {
      print(header + message + _inspect(obj));
    }
  }
  
  $hc.toJson = function (obj) {
    if (obj === null) {
      return "null";
    }
    switch (obj.constructor) {
    case String:
      var mod_text = obj.replace('\\', '\\\\').replace('"', '\\"');
      return '"' + mod_text + '"';
    case Boolean:
      return obj ? "true" : "false";
    case Number:
      return obj.toString();
    case Array:
      var list = [];
      for (var index = 0; index < obj.length; index++) {
        list.push($hc.toJson(obj[index]));
      }
      return "[" + list.join(",") + "]";
    case Object:
      var list = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          list.push('"' + key + '":' + $hc.toJson(obj[key]));
        }
      }
      return "{" + list.join(",") + "}";
    default:
      return "null";
    }
  }
  
  $hc.fromJson = function(json_text) {
    var obj = fromJson(json_text);
    return obj;
  }
  
  $hc.dbLookup = function(dbName:string, viewName:string, key:string, colNumber:int) {
    try {
      var result = @DbLookup(dbName, viewName, key, colNumber);
      if (result instanceof Array) {
        return result;
      } else {
        return [result];
      }
    } catch(err) {
      return [];
    }
  }
  
  $hc.dbColumn = function(dbName:string, viewName:string, colNumber:int) {
    try {
      var result = @dbColumn(dbName, viewName, colNumber);
      if (result instanceof Array) {
        result = @Unique(result);
        return result;
      } else {
        return [result];
      }
    } catch(err) {
      return [];
    }
  }
  
  $hc.getAttachFileItems = function(xsp_doc, field_name) {
    var items:java.util.List = xsp_doc.getAttachmentList(field_name);
    var back_doc:NotesDocument = xsp_doc.getDocument();
    var unid = back_doc.getUniversalID();
    var parentDB:NotesDatabase = back_doc.getParentDatabase();
    var path = parentDB.getFilePath();
    var fileItems = [];
    for(var index=0; index<items.length; index++) {
      var attach_obj = items.get(index);
      var file_item = {}
      file_item.name = attach_obj.getName();
      file_item.url = "../" + path + "/0/" + unid + "/$FILE/" + file_item.name;
      fileItems.push(file_item);
    }
    return fileItems;
  }
  
  $hc.createMailDoc = function(title, sendto) {
    var maildoc = database.createDocument();
    maildoc.replaceItemValue("Form", "Memo");
    maildoc.replaceItemValue("Subject", title);
    if (sendto instanceof Array) {
      maildoc.replaceItemValue("SendTo", sendto);
    } else {
      maildoc.replaceItemValue("SendTo", [sendto]);
    }
    return maildoc;
  }
  
  $hc.getTimestamp = function(datetime) {
    if (!datetime) {
      var datetime = new Date();
    }
    return I18n.toString(datetime,"yyyy/MM/dd HH:mm:ss");
  }
  $hc.getDatestamp = function(datetime) {
    if (!datetime) {
      var datetime = new Date();
    }
    return I18n.toString(datetime,"yyyy/MM/dd");
  }
  
  $hc.showErrorMsg = function(messages, tag_id) {
    if (messages instanceof Array) {
      for(var index=0; index < messages.length; index++) {
        var message = messages[index];
        @ErrorMessage(message, tag_id);
      }
    } else {
      @ErrorMessage(messages, tag_id);
    }
  }
  
  $hc.getDominoTime = function(text) {
    return I18n.parseDate(text);
  }
  
  // -------------- Private Method ---------------
  
  function _inspect(obj) {
    if (obj === null) {
      return "null";
    } else if (obj === undefined) {
      return "undefined";
    }
    // switch use '===' to compare.
    switch(typeof obj) {
    case "number":
      return obj;
    case "string":
      return "\"" + obj + "\"";
    case "function":
      return obj;
    case "java.util.ArrayList":
    case "java.util.Vector":
      var part1 = "[";
      var list = [];
      for(var index=0; index < obj.length; index++) {
        var item = obj[index];
        list.push(_inspect(item));
      }
      return (part1 + list.join(",") + "]");
    case "object":
    case "com.sun.faces.context.SessionMap":
      // Object or Array
      if (obj instanceof Array) {
        var part1 = "[";
        var list = [];
        for(var index=0; index < obj.length; index++) {
          var value = obj[index];
          list.push(_inspect(value));
        }
        if (list.length == 0) {
          // Date type has no key, convert to string.
          list.push(obj);
        }
        return (part1 + list.join(",") + "]");
      } else {
        if (typeof(obj) == "object") {
          var part1 = "{";
        } else {
          var part1 = "<" + typeof(obj) + ">:{";
        }
        var list = [];
        for(var key in obj) {
          var value = obj[key];
          if (typeof(value) != "function") {
            list.push(key + ":" + _inspect(value));
          }
        }
        if (list.length == 0) {
          // Date type has no key, convert to string.
          list.push(obj);
        }
        return (part1 + list.join(",") + "}");
      }
      break;
    default:
      return "<<" + typeof(obj) + ">>:{" + obj + "}";
    }
  }
})();
  
