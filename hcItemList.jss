// HUMCOM Base Library Ver.0.10    2015/11/15
// Copyright (C) 2015 Yac <humcom@tech-notes.dyndns.org>
// This software is released under the MIT License, see LICENSE.txt.

// ================================
//   OneItem
// ================================
var OneItem = function() {
  var fields = this.getFields();
  var len = fields.length;
  for(var index=0; index < len; index++) {
      var fieldname = fields[index];
      this[fieldname] = "";
  }
  this.klass = "OneItem";  // for $hc.debug()
}

// Define Methods
OneItem.prototype = {
  // Overwrite this property for your purpose.
  getFields : function() {
    fields = [
      "type",
      "title",
      "comment"
    ];
    return fields;
  },
  
  serialize : function() {
    var obj = {};
    var fields = this.getFields();
    for(var index=0; index < fields.length; index++) {
      var fieldname = fields[index];
      obj[fieldname] = this[fieldname];
    }
    return obj;
  },

  deserialize : function(obj) {
    var fields = this.getFields();
    for(var index=0; index < fields.length; index++) {
      var fieldname = fields[index];
      this[fieldname] = obj[fieldname] || "";
    }
  }
}

// ================================
//   ItemList
// ================================
var ItemList = function() {
  this.list = [];
  this.klass = "ItemList";  // for $hc.debug()
}

ItemList.prototype = {
  // Read from NotesItem
  loadField : function(xsp_doc:NotesXspDocument, fieldname) {
    this.list = [];
    var json_text = xsp_doc.getItemValueString(fieldname);
    try {
      var obj_list = $hc.fromJson(json_text);
      for(var index=0; index < obj_list.length; index++) {
          var obj = obj_list[index];
          var oneitem = new OneItem();
          oneitem.deserialize(obj);
          this.list.push(oneitem);
      }
    } catch(err) {
      $hc.bug("error convert from json.");
    }
  },

  // Write to NotesItem
  writeField : function(xsp_doc:NotesXspDocument, fieldname) {
    var temp_list = [];
    for(var index=0; index < this.list.length; index++) {
      var oneitem = this.list[index];
      temp_list.push(oneitem.serialize());
    }
    var json_text = $hc.toJson(temp_list);
    xsp_doc.replaceItemValue(fieldname, json_text);
  },

  loadRichField : function(xsp_doc:NotesXspDocument, fieldname) {
    this.list = [];
    var back_doc = xsp_doc.getDocument();
    var field = back_doc.getFirstItem(fieldname);
    var json_text = field.getText();
    json_text = json_text.replace(/\r|\n/g, "");
    try {
      var obj_list = $hc.fromJson(json_text);
      for(var index=0; index < obj_list.length; index++) {
          var obj = obj_list[index];
          var oneitem = new OneItem();
          oneitem.deserialize(obj);
          this.list.push(oneitem);
      }
    } catch(err) {
      $hc.bug("error convert from json.");
    }
    field.recycle();
    back_doc.recycle();
  },
  
  writeRichField : function(xsp_doc:NotesXspDocument, fieldname) {
    var back_doc = doc.getDocument(true);
    back_doc.removeItem(fieldname);
    var field = back_doc.createRichTextItem(fieldname);
    var temp_list = [];
    for(var index=0; index < this.list.length; index++) {
      var oneitem = this.list[index];
      temp_list.push(oneitem.serialize());
    }
    var json_text = $hc.toJson(temp_list);
    field.appendText(json_text);
    field.recycle();
    back_doc.recycle();
  },
  
  getLength : function() {
      return this.list.length;
  },

  // get OneItem
  at : function(index) {
    return this.list[index];
  },

  push : function(oneitem) {
    this.list.push(oneitem);
  },
  
  remove : function(del_index) {
      var new_list = [];
      for(var index=0; index < this.list.length; index++) {
          if (del_index != index) {
              new_list.push(this.list[index]);
          }
      }
      this.list = new_list;
  }
}

