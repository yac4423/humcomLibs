// これは「コンストラクタ関数」。parts = new Parts();でオブジェクトを生成できる
var Parts = function() {
	  var fields = this.getFields();
	  var len = fields.length;
	  for(var index=0; index < len; index++) {
	      var fieldname = fields[index];
	      this[fieldname] = "";
	  }
	  this.klass = "Parts";  // for $hc.debug()
}


//これあいまいちわからんのだよなぁ。
//Partsオブジェクトのプロトタイプチェインに{...}のオブジェクトをさすようにする。
//これを設定しておくと、Partsにアクセスすると、prototypeが指すオブジェクトにもアクセスしてくれる
Parts.prototype = new OneItem();
Parts.prototype = {
// Overwrite this property for your purpose.
	getFields : function() {
	  fields = [
		"type",
		"title",
		"comment"
	  ];
	  return fields;
	}
}

var PartsList = function() {};
PartsList.prototype = ItemList;
PartsList.klass = "PartsList";
