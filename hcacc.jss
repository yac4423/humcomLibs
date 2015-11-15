$hcacc = {};
(function() {
  var ViewUserNameTo   = "UserNameTo";   // [Username]
  var ViewDepartmentTo = "DepartmentTo"; // [Group][Username][Kanji]
  var ViewCompanyTo    = "CompanyTo";    // [Company][Group][Username][Kanji]
  var ViewKanjiNameTo  = "KanjinameTo";  // [Comment][Department][Full Name]
  var ViewMailAddTo    = "MailAddTo";    // [InternetAddress][Comment][Department][FullName]
  
  $hcacc.un2kanji = function(username) {
    var view = _getDDView(ViewUserNameTo);
    var doc = view.getDocumentByKey(username, true);
    return doc ? doc.getItemValueString("Comment") : null;
  }
  
  $hcacc.un2group = function(username) {
    var view = _getDDView(ViewUserNameTo);
    var doc = view.getDocumentByKey(username, true);
    return doc ? doc.getItemValueString("Department") : null;
  }
  $hcacc.un2company = function(username) {
    var view = _getDDView(ViewUserNameTo);
    var doc = view.getDocumentByKey(username, true);
    return doc ? doc.getItemValueString("CompanyName") : null;
  }
  $hcacc.un2madd = function(username) {
    var view = _getDDView(ViewUserNameTo);
    var doc = view.getDocumentByKey(username, true);
    return doc ? doc.getItemValueString("InternetAddress") : null;
  }
  
  $hcacc.kanji2un = function(kanjiname) {
    var doc = _getDocByKanjiname(kanjiname);
    return doc ? doc.getItemValueString("lastName") : null;
  }
  $hcacc.kanji2madd = function(kanjiname) {
    var doc = _getDocByKanjiname(kanjiname);
    return doc ? doc.getItemValueString("InternetAddress") : null;
  }
  $hcacc.kanji2company = function(kanjiname) {
    var doc = _getDocByKanjiname(kanjiname);
    return doc ? doc.getItemValueString("CompanyName") : null;
  }
  $hcacc.kanji2group = function(kanjiname) {
    var doc = _getDocByKanjiname(kanjiname);
    return doc ? doc.getItemValueString("Department") : null;
  }
  
  $hcacc.madd2un = function(mailadd) {
    var view = _getDDView(ViewMailAddTo);
    var doc = view.getDocumentByKey(mailadd, true);
    return doc ? doc.getItemValueString("lastName") : null;
  }
  
  $hcacc.madd2kanji = function(mailadd) {
    var view = _getDDView(ViewMailAddTo);
    var doc = view.getDocumentByKey(mailadd, true);
    return doc ? doc.getItemValueString("Comment") : null;
  }
  $hcacc.madd2group = function(mailadd) {
    var view = _getDDView(ViewMailAddTo);
    var doc = view.getDocumentByKey(mailadd, true);
    return doc ? doc.getItemValueString("Department") : null;
  }
  $hcacc.madd2company = function(mailadd) {
    var view = _getDDView(ViewMailAddTo);
    var doc = view.getDocumentByKey(mailadd, true);
    return doc ? doc.getItemValueString("Company") : null;
  }
  
  $hcacc.getUnList = function(department) {
    if (!department) {
      return $hcacc.getAllUnList();
    }
    var view = _getDDView(ViewDepartmentTo);
    var docs:NotesDocumentCollection = view.getAllDocumentsByKey(department, true);
    var list = _getTextsInDocs(docs, "lastName");
    return list;
  }
  
  $hcacc.getAllUnList = function() {
    var dbname = [database.getServer(), "names.nsf"];
    var usernameList = @DbColumn(dbname, ViewUserNameTo, 1);
    var list = [];
    for(var index=0; index < usernameList.length; index++) {
      var username = usernameList[index];
      var result = username.match(/^CN\=/);
      if (result) {
        list.push(username);
      }
    }
    return list;
  }
  
  $hcacc.getKanjiList = function(group) {
    if (!group) {
      return $hcacc.getAllKanjiList();
    }
    var dbname = [database.getServer(), "names.nsf"];
    var kanjiList = $hc.dbLookup(dbname, ViewDepartmentTo, group, 3);
    return kanjiList;
  }
  
  $hcacc.getAllKanjiList = function() {
    var dbname = [database.getServer(), "names.nsf"];
    var kanjiList = @DbColumn(dbname, ViewKanjiNameTo, 1);
    return kanjiList;
  }
  
  $hcacc.getGroupList = function(company) {
    if (!company) {
      return $hcacc.getAllGroupList();
    }
    var dbname = [database.getServer(), "names.nsf"];
    var groupList = @DbColumn(dbname, ViewCompanyTo, 2);
    return @Unique(groupList);
  }
  
  $hcacc.getAllGroupList = function() {
    var dbname = [database.getServer(), "names.nsf"];
    var groupList = @DbColumn(dbname, ViewDepartmentTo, 1);
    return @Unique(groupList);
  }
  
  $hcacc.getAllCompanyList = function() {
    var dbname = [database.getServer(), "names.nsf"];
    var companyList = @DbColumn(dbname, ViewCompanyTo, 1);
    return @Unique(companyList);
  }
  
  $hcacc.analizeNameText = function(text) {
  }
  
  
  // ===========================================================
  // Private Methods
  // ===========================================================
  function _getDDView(view_name) {
    var db:NotesDatabase = session.getDatabase(database.getServer(), "names.nsf");
    var view = db.getView(view_name);
    return view;
  }
  
  function _getTextsInDocs(docs:NotesDocumentCollection, fieldname) {
    var list = [];
    var doc:NotesDocument = docs.getFirstDocument();
    while(doc) {
      var text = doc.getItemValueString(fieldname);
      list.push(text);
      var next_doc:NotesDocument = docs.getNextDocument(doc);
      doc.recycle();
      doc = next_doc;
    }
    return list;
  }
  
  function _getDocByKanjiname(kanjiname) {
    var view = _getDDView(ViewKanjiNameTo);
    var result = kanjiname.match(/(.+?)\/(.+)/);  // "kanjiname/group" ?
    if (result) {
      var kanjiname = result[1];
      var group = result[2];
      arr = new java.util.Vector();
      arr.add(kanjiname);
      arr.add(group)
      var docs:NotesDocumentCollection = view.getAllDocumentsByKey(arr, true);
    } else {
      var docs:NotesDocumentCollection = view.getAllDocumentsByKey(kanjiname, true);
    }
    switch(docs.getCount()) {
    case 0:
      return null;
    case 1:
      var doc = docs.getFirstDocument();
      return doc;
    default:
      // case Dupe Kanjiname
      $hc.bug("Dupe of kanjiname")
      return null;
    }
  }
  
})();
  
