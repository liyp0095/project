
// init global var here
// window.onload = function() {
	// var list = new StarList('star-list');
	// for (var i = 0; i < 4; ++i) {
		// var item = new StartListItem(list);
		// item.setHead("head");
		// item.setContext("context");
		// list.addListItem(item);
		// list.setActiveChild(item);
	// }
	// list.getActiveChild().active();
// }

function refreshStarList(list, data, graph) {
	//console.log(data);
	//var list = new StarList('star-list');;
	list.clean();
	for (var i = 0; i < data.length; ++i) {
		var item = new StartListItem(list, data[i], graph);
		var head = "ID:"+data[i][0];
		var context = "";
		if (data[i][1] == 0) {
			context += "  学院:计算机学院";
		} else {
			context += "  学院:电子学院";
		}
		context += "  相似度:"+data[i][5];
		item.setHead(head);
		item.setContext(context);
		list.addListItem(item);
	}
}


function StartListItem(parent, node, graph) {
	this.parent = parent;
	this.a = document.createElement('a');
	this.h4 = document.createElement("h4");
	this.p = document.createElement("p");
	
	this.a.className = "list-group-item";
	this.h4.className = "list-group-item-heading";
	this.p.className = "list-group-item-text";
	
	this.node = node;
	this.graph = graph;
	
	this.a.appendChild(this.h4);
	this.a.appendChild(this.p);
	
	
	this.active = function() {
		this.a.className = "list-group-item active";
		
	};
	
	this.disActive = function () {
		this.a.className = "list-group-item";
	};

	this.setHead = function (text) {
		this.h4.innerText = text;
	};
	
	this.setContext = function(text) {
		this.p.innerText = text;
	};
	var that = this;
	this.a.onclick = function() {
		that.active();		
		if (that.parent.getActiveChild()) { // that.parent.getActiveChild() is not undefine or null
			that.parent.getActiveChild().disActive();
		}
		that.parent.setActiveChild(that);
		
		// 
/*		that.graph.getUsrId(that.nodeId);*/
		var head = document.getElementById('panel_head');
		var body = document.getElementById('panel_body');
		var data = that.node;
		var context;
		
		if (data[1] == 0) {
			context = "学院:计算机学院";
		} else {
			context = "学院:电子学院";
		}
		context += "  年龄:"+ data[2];
		if (data[3] == 0) {
			context += "  性别:男";
		} else {
			context += "  性别:女";
		}
		if (data[4] == 0) {
			context += "  性格:文静型 ";
		} else {
			context += "  性格:运动型 ";
		}
		
		head.innerText = "ID:" + that.node[0] + "  相似度:" + that.node[5];
		body.innerText = context;
	}
}


function StarList(listId) {
	this.mList = document.getElementById(listId);
	this.size = 0;
	this.itemArray = new Array();
	this.activeChild;

	
	this.getActiveChild = function() {
		return this.activeChild;
	}
	
	this.setActiveChild = function(item) {
		this.activeChild = item;
	}
	
	this.addListItem = function(item) {
		this.itemArray[this.size] = item;
		this.size += 1;
		this.mList.appendChild(item.a);
	}
	
	this.clean = function () {
		for (var i = 0; i < this.size; ++i) {
			this.mList.removeChild(this.itemArray[i].a);
		}
		this.size = 0;
		this.itemArray = new Array();
		this.activeChild = null;
	}
}
